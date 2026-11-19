#!/usr/bin/env node
/**
 * intake.js — Gate 0: brings source documents into the project.
 *
 *   classifyDocument(content, filename)  Pick one of the five INPUT bins.
 *   slugify(text)                        Readable task slug, diacritics stripped.
 *   pickSlug(files)                      Name a task after its BA document.
 *   looseFiles()                         Unfiled documents sitting in INPUT/.
 *   scaffoldTask(slug)                   Create OUTPUT/, knowledge file and 00_plan.md.
 *
 * Converts .docx/.xlsx/.csv/.pdf/.pptx/.html/.json/.yaml/.txt to clean Markdown, files it under
 * INPUT/<slug>/, then scaffolds everything the task needs to proceed. Images/design files are
 * kept untouched in INPUT/<slug>/04_design/_assets/. A source file is deleted ONLY after its
 * conversion and filing succeeded; failures stay in place and make the run exit non-zero.
 *
 * Usage:
 *   npm run intake -- <file-or-dir> [--slug <task-slug> | --into <existing-task>]
 *
 * A document about to enter a task that ALREADY has documents ⇒ stop, exit 2, wait for confirmation (`--into <slug>`).
 * An old version of the same document (same name minus version/date, same bin) ⇒ moved to `<bin>/_superseded/`.
 * Exit: 0 done · 1 failed files / nothing taken in · 2 waiting for the user to confirm a merge.
 * Examples:
 *   node qa-system/tools/intake/intake.js "SRS_Auth.docx" --slug <feature-a>
 *   node qa-system/tools/intake/intake.js "doc.pdf" --slug qa-standard-guide
 *   node qa-system/tools/intake/intake.js "rules.xlsx" --slug <feature-b>
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PATHS } = require('../lib/paths');
const { convertDocumentToMarkdown, fileKind, stripMetadata } = require('../lib/doc-converter');
const versioning = require('./versioning');

const args = process.argv.slice(2);
const slugIndex = args.indexOf('--slug');
const intoIndex = args.indexOf('--into');
// `--into` = deliberately merge into an existing task. `--force` = deliberately accept creating a second copy.
const intoSlug = intoIndex !== -1 ? args[intoIndex + 1] : null;
let targetSlug = intoSlug || (slugIndex !== -1 ? args[slugIndex + 1] : null);
const FORCE = args.includes('--force');
// The user named the task explicitly (--into / --slug) ⇒ already confirmed, do not ask again.
const CONFIRMED = intoSlug !== null || slugIndex !== -1;
const valueArgs = new Set([slugIndex + 1, intoIndex + 1].filter((i) => i > 0));
const positional = args.filter((a, idx) => !a.startsWith('--') && !valueArgs.has(idx));
const targetInput = positional[0];

/**
 * Diacritics must be decomposed BEFORE filtering characters. Filtering straight
 * through `[^\w\s-]` turned "<Tên có dấu>" into "<slug-mất-dấu>", wiping every
 * accented vowel and leaving an unreadable slug.
 *
 * `normalize('NFD')` splits letters from their marks; `đ/Đ` has no decomposed
 * form and needs its own rule.
 */
function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // drop tone and shape marks
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ───────────────────────── Bin classification ─────────────────────────
//
// Score all 5 bins, do NOT stop at the first matching keyword:
//   1. File name + title (H1) are the strongest signal, considered first.
//   2. CR / Q&A / minutes / meeting → 05_communication beats the generic word "đặc tả" (spec).
//   3. Match on Unicode word boundaries: "revision" no longer contains "vision".
//   4. NFC normalisation: precomposed or combining Vietnamese letters match alike.
// Not sure (tie / low score / no signal) → still filed in the best-guess bin
// but flagged `unsure` so intake lists it for the user to confirm.

const BINS = ['01_business', '02_ba', '03_dev', '04_design', '05_communication'];

const SIGNALS = {
  '05_communication': {
    terms: ['biên bản họp', 'biên bản', 'meeting minutes', 'minutes of meeting', 'q&a', 'qna', 'hỏi đáp',
      'change request', 'yêu cầu thay đổi', 'chat log', 'trao đổi với ba', 'email thread'],
    headOnly: ['họp', 'meeting', 'mom', 'cr'],
    regex: [/(?<![\p{L}\p{N}])cr[-_ ]?\d+(?![\p{L}\p{N}])/iu],
    strongContent: ['biên bản họp', 'meeting minutes', 'change request', 'yêu cầu thay đổi', 'q&a', 'hỏi đáp'],
  },
  '03_dev': {
    terms: ['swagger', 'openapi', 'status code', 'database schema', 'db schema', 'endpoint', 'endpoints', 'postman',
      'migration', 'api spec', 'api specification', 'technical spec', 'tech spec', 'technical design', 'request body',
      'response body', 'api document', 'tài liệu api'],
    headOnly: ['api', 'schema', 'technical'],
    regex: [/\b(get|post|put|patch|delete)\s+\/\S/i, /\bcurl\s+-/i],
  },
  '04_design': {
    terms: ['figma', 'wireframe', 'wireframes', 'mockup', 'ui mockup', 'design system', 'pixel', 'palette', 'prototype',
      'ui kit', 'style guide', 'ui design', 'ux design', 'thiết kế giao diện'],
    headOnly: ['design', 'ui', 'ux', 'giao diện'],
    regex: [],
  },
  '02_ba': {
    terms: ['prd', 'srs', 'brd', 'user story', 'user stories', 'use case', 'acceptance criteria', 'tiêu chí chấp nhận',
      'đặc tả', 'yêu cầu chức năng', 'business requirement', 'business requirements', 'functional requirement',
      'functional requirements', 'luồng nghiệp vụ', 'quy tắc nghiệp vụ', 'business rule', 'business rules',
      'requirement specification', 'requirements'],
    headOnly: ['requirement', 'yêu cầu'],
    regex: [],
  },
  '01_business': {
    terms: ['chính sách', 'chiến lược', 'mục tiêu kinh doanh', 'doanh thu', 'chương trình khuyến mãi', 'định hướng',
      'bài toán kinh doanh', 'tầm nhìn', 'business strategy', 'business objective', 'business goal', 'vision',
      'roadmap', 'kpi', 'okr'],
    headOnly: [],
    regex: [],
  },
};

const deaccent = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd');
const norm = (s) => String(s || '').normalize('NFC').toLowerCase();
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const termRe = (t) => new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(t)}(?![\\p{L}\\p{N}])`, 'iu');

/** Whether the text matches a term — Unicode word boundary; multi-word phrases also match the accent-stripped form. */
function hasTerm(text, plain, term, { anyAccent = false } = {}) {
  if (termRe(term).test(text)) return true;
  if (anyAccent || term.includes(' ')) return termRe(deaccent(term)).test(plain);
  return false;
}

function firstHeading(content) {
  const body = String(content).replace(/<!--[\s\S]*?-->/g, '');
  const h = body.match(/^#\s+(.+)$/m);
  if (h) return h[1];
  return (body.split('\n').find((l) => l.trim()) || '').slice(0, 200);
}

function classifyDetailed(content, filename) {
  const fname = String(filename || '');
  const ext = path.extname(fname).toLowerCase();
  const fileText = norm(path.basename(fname, ext).replace(/[_\-.]+/g, ' '));
  const fileTextPlain = deaccent(fileText);
  const title = norm(firstHeading(content));
  const titlePlain = deaccent(title);
  const body = norm(String(content).replace(/<!--[\s\S]*?-->/g, ''));
  const bodyPlain = deaccent(body);

  const score = {};
  const head = {};
  const hits = {};
  let strong05 = false;
  for (const bin of BINS) {
    const sig = SIGNALS[bin];
    score[bin] = 0;
    head[bin] = 0;
    hits[bin] = [];
    for (const t of [...sig.terms, ...sig.headOnly]) {
      if (hasTerm(fileTextPlain, fileTextPlain, deaccent(t), { anyAccent: true })) { head[bin] += 5; hits[bin].push(`file name:"${t}"`); }
      if (hasTerm(title, titlePlain, t)) { head[bin] += 3; hits[bin].push(`title:"${t}"`); }
    }
    for (const t of sig.terms) {
      if (hasTerm(body, bodyPlain, t)) {
        const strong = (sig.strongContent || []).includes(t);
        score[bin] += strong ? 2 : 1;
        if (strong) strong05 = true;
        hits[bin].push(`content:"${t}"`);
      }
    }
    for (const re of sig.regex) {
      if (re.test(fileText)) { head[bin] += 5; hits[bin].push(`file name:${re.source}`); }
      if (re.test(String(content))) {
        score[bin] += 2;
        if (bin === '05_communication') strong05 = true;
        hits[bin].push(`content:${re.source}`);
      }
    }
  }
  if (['.json', '.yaml', '.yml', '.sql'].includes(ext)) { head['03_dev'] += 10; hits['03_dev'].push(`extension ${ext}`); }

  const rank = (m) => BINS.slice().sort((a, b) => m[b] - m[a] || (a === '02_ba' ? -1 : b === '02_ba' ? 1 : 0));
  const why = (bin) => hits[bin].slice(0, 4).join(', ');

  // 1. File name / title. If 05 has a signal here it wins (a CR/minutes talks about a spec, it is not the spec).
  if (head['05_communication'] > 0) {
    return { bin: '05_communication', unsure: false, reason: why('05_communication'), scores: { head, content: score } };
  }
  const hr = rank(head);
  if (head[hr[0]] > 0) {
    const unsure = head[hr[0]] < 2 * head[hr[1]];
    return { bin: hr[0], unsure, reason: why(hr[0]) + (unsure ? ` (close to ${hr[1]})` : ''), scores: { head, content: score } };
  }

  // 2. Content.
  const cr = rank(score);
  let bin = cr[0];
  const top = score[bin];
  if (top === 0) return { bin: '02_ba', unsure: true, reason: 'no signal at all — defaulting to 02_ba', scores: { head, content: score } };
  let unsure = !(top >= 2 && top >= score[cr[1]] + 2);
  if (strong05 && bin !== '05_communication') {
    unsure = unsure || score[bin] > score['05_communication'];
    bin = '05_communication';
  }
  return { bin, unsure, reason: why(bin) + (unsure ? ' (low score / close scores)' : ''), scores: { head, content: score } };
}

/** Keeps the old API: returns only the bin name. */
function classifyDocument(content, filename) {
  return classifyDetailed(content, filename).bin;
}

// ───────────────────────── Taking in one file ─────────────────────────

/** Result ledger of one intake run. */
function newReport() {
  return { filed: [], assets: [], failed: [], skipped: [], unsure: [], pending: [], written: new Set() };
}

function ensureBins(slug) {
  for (const cat of BINS) fs.mkdirSync(path.join(PATHS.INPUT, slug, cat), { recursive: true });
}

const fileSha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

/** List images/design files in 04_design/_assets/ into one .md file so the agent knows they exist. */
function writeAssetIndex(slug) {
  const dir = path.join(PATHS.INPUT, slug, '04_design', '_assets');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => !f.startsWith('.')).sort();
  const lines = [
    `# Design assets · ${slug}`,
    '',
    '> Ảnh / file thiết kế giữ NGUYÊN BẢN, chưa chuyển thành chữ. Agent không đọc được nội dung ảnh:',
    '> mọi chữ hiển thị, bố cục, màu lấy từ đây phải được người xem trực tiếp xác nhận.',
    '',
    '| File | Kích thước | sha256 (12) |',
    '|---|---|---|',
    ...files.map((f) => {
      const full = path.join(dir, f);
      return `| \`04_design/_assets/${f}\` | ${(fs.statSync(full).size / 1024).toFixed(1)} KB | \`${fileSha(full).slice(0, 12)}\` |`;
    }),
  ];
  const idx = path.join(PATHS.INPUT, slug, '04_design', 'design-assets.md');
  fs.writeFileSync(idx, lines.join('\n') + '\n', 'utf8');
  return idx;
}

/** Put images/design files into 04_design/_assets/ intact. `move` = delete the original after copying. */
function fileAsset(filePath, slug, { move = false } = {}) {
  ensureBins(slug);
  const dir = path.join(PATHS.INPUT, slug, '04_design', '_assets');
  fs.mkdirSync(dir, { recursive: true });
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const srcSha = fileSha(filePath);
  let dest = path.join(dir, base + ext);
  for (let n = 2; fs.existsSync(dest); n++) {
    if (fileSha(dest) === srcSha) break; // an identical copy already exists
    dest = path.join(dir, `${base}-${n}${ext}`);
  }
  if (!fs.existsSync(dest)) fs.copyFileSync(filePath, dest);
  if (fileSha(dest) !== srcSha) throw new Error(`copy of ${path.basename(filePath)} does not match sha256`);
  if (move && path.resolve(dest) !== path.resolve(filePath)) fs.unlinkSync(filePath);
  writeAssetIndex(slug);
  return dest;
}

/**
 * Take ONE file into INPUT/<slug>/. Returns `true` ONLY when converted + written (or the image was stored);
 * every other branch returns `false`. With `consume: true` (a loose file in INPUT/), the original is deleted only after
 * success; on error the file stays where it was and is recorded in `report.failed`.
 */
async function processFile(filePath, userSlug, report = newReport(), { consume = false } = {}) {
  const name = path.basename(filePath);
  const fail = (reason) => {
    report.failed.push({ file: filePath, reason });
    console.error(`   ❌ ${name}: ${reason}`);
    return false;
  };
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return fail('file not found');

    const ext = path.extname(filePath).toLowerCase();
    const baseName = path.basename(filePath, ext);
    const slug = userSlug || featureSlug(baseName);
    console.log(`\n📥 [GATE 0] Taking in document: "${name}" → task [ ${slug} ]`);

    const kind = fileKind(filePath);
    if (kind.kind === 'asset') {
      const dest = fileAsset(filePath, slug, { move: consume });
      report.assets.push({ file: filePath, dest: path.relative(PATHS.ROOT, dest), slug });
      console.log(`   🖼️  Image/design kept as is → ${path.relative(PATHS.ROOT, dest)}`);
      return true;
    }
    if (kind.kind !== 'convert' && ext !== '.doc') return fail(kind.reason);

    let markdown;
    try {
      markdown = await convertDocumentToMarkdown(filePath);
    } catch (err) {
      return fail(`conversion failed — ${err.message}`);
    }
    if (!stripMetadata(markdown).trim()) return fail('conversion produced empty content');

    if (!FORCE) {
      const dup = findDuplicate(markdown, slug);
      if (dup) {
        console.error(duplicateNotice(dup, slug, name));
        report.skipped.push({ file: filePath, reason: `duplicate of ${dup.file} (task ${dup.slug})` });
        return false;
      }
    }

    const cls = classifyDetailed(markdown, name);
    ensureBins(slug);
    let destPath = path.join(PATHS.INPUT, slug, cls.bin, `${slugify(baseName)}.md`);
    // Two source files with the same base name in one run (spec.docx + spec.pdf) must not overwrite each other.
    // Same name within a run: add a suffix, then a sequence number — a third file must not overwrite the second.
    for (let n = 2; report.written.has(destPath); n++) {
      destPath = path.join(PATHS.INPUT, slug, cls.bin, `${slugify(baseName)}-${n === 2 ? ext.slice(1) : `${ext.slice(1)}-${n}`}.md`);
    }
    fs.writeFileSync(destPath, markdown, 'utf8');
    if (fs.readFileSync(destPath, 'utf8') !== markdown) return fail('written target file does not match');
    report.written.add(destPath);

    const entry = { file: filePath, dest: path.relative(PATHS.ROOT, destPath), slug, bin: cls.bin, reason: cls.reason };
    report.filed.push(entry);
    if (cls.unsure) report.unsure.push(entry);
    console.log(`   -> Bin: [ ${cls.bin} ]${cls.unsure ? '  ⚠️ UNSURE' : ''} (${cls.reason})`);
    console.log(`   ✅ ${entry.dest}`);

    if (consume) fs.unlinkSync(filePath); // delete only after writing is done
    return true;
  } catch (err) {
    return fail(err.message);
  }
}

/** End-of-run summary: failed files (left in place), uncertain bin placements, duplicate files. */
function printSummary(report) {
  const rel = (p) => path.relative(PATHS.ROOT, p) || p;
  console.log('\n──────── INTAKE SUMMARY ────────');
  console.log(`   Taken in: ${report.filed.length} document(s) · ${report.assets.length} image/design file(s)`);
  if (report.pending.length) {
    console.log(`\n   ⏸️  ${report.pending.length} file(s) AWAITING CONFIRMATION to merge into an existing task (not taken in, left in place).`);
  }
  if (report.unsure.length) {
    console.log(`\n   ⚠️ ${report.unsure.length} document(s) binned with UNCERTAINTY — user confirmation needed:`);
    report.unsure.forEach((u) => console.log(`      - ${path.basename(u.file)} → ${u.bin} (${u.reason})`));
  }
  if (report.skipped.length) {
    console.log(`\n   ⏭️  ${report.skipped.length} file(s) skipped (left in place):`);
    report.skipped.forEach((s) => console.log(`      - ${rel(s.file)}: ${s.reason}`));
  }
  if (report.failed.length) {
    console.log(`\n   ❌ ${report.failed.length} file(s) NOT taken in (left in place, not deleted):`);
    report.failed.forEach((f) => console.log(`      - ${rel(f.file)}: ${f.reason}`));
  }
  console.log('');
}

/**
 * Users are QA/BA/PO, not developers: they do not know to hand-create
 * OUTPUT/<slug>/, the feature knowledge file or 00_plan.md. Dropping a document
 * in must be enough to leave a workable task behind.
 */
function scaffoldTask(slug) {
  const created = [];
  const ensureDir = (p) => { if (!fs.existsSync(p)) { fs.mkdirSync(p, { recursive: true }); created.push(path.relative(PATHS.ROOT, p) + '/'); } };

  ensureDir(path.join(PATHS.OUTPUT, slug));

  // Feature knowledge file — where BA answers outlive the disposable OUTPUT/
  const kPath = path.join(PATHS.FEATURES, `${slug}.md`);
  if (!fs.existsSync(kPath)) {
    const tpl = path.join(PATHS.KNOWLEDGE, '_template.md');
    if (fs.existsSync(tpl)) {
      ensureDir(PATHS.FEATURES);
      // The template is an empty skeleton; only the slug placeholder is replaced, no sample data added.
      fs.writeFileSync(kPath, fs.readFileSync(tpl, 'utf-8').replace(/<feature-slug>/g, slug), 'utf-8');
      created.push(path.relative(PATHS.ROOT, kPath));
    }
  }

  // 00_plan.md — progress map, and how another agent picks up where this left off
  const planPath = path.join(PATHS.OUTPUT, slug, '00_plan.md');
  if (!fs.existsSync(planPath)) {
    const today = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(planPath, `# Kế Hoạch Phân Tích & Kiểm Thử · ${slug}
Ngày tạo: ${today} · Người lập: intake.js · Trạng thái: IN-PROGRESS

## 1. Phạm Vi & Tài Liệu Nguồn
- Tài liệu yêu cầu: \`INPUT/${slug}/\` (5 ngăn 01_business → 05_communication)
- Tri thức dự án: \`knowledge/_project.md\` · \`knowledge/_glossary.md\`
- Tri thức tính năng: \`knowledge/features/${slug}.md\`

## 2. Lộ Trình Từng Chặng
- [ ] **Chặng 1**: Đọc yêu cầu thô & Phân tích rủi ro [qa-analyst/skills/requirement-risk-summary.md] ➔ \`01_requirement_risk_summary.md\`
- [ ] **Chặng 2**: Quét kẽ hở 06W & Câu hỏi cho BA [qa-analyst/skills/missing-rule-06w.md] ➔ \`02_missing_rule_report.md\`
      *(Verdict ASK ⇒ DỪNG. \`npm run gate ${slug}\` quyết định, không phải lời nói.)*
- [ ] **Chặng 3**: Chọn Risk Area & Viewpoints [qa-analyst/skills/viewpoint-selection.md] ➔ \`03_viewpoint_report.md\`
- [ ] **Chặng 4**: Thiết kế Test Idea & Lọc Giữ/Bỏ [qa-analyst/skills/test-idea-design.md] ➔ \`04_test_idea_report.md\`
- [ ] **Chặng 5**: Sinh Test Case 8 trường [qa-test-design/skills/test-case-generation.md] ➔ \`05_test_case_spec.md\`
      *(Trước khi báo xong: \`npm run lint -- ${slug}\`)*
- [ ] **Chặng 6**: Rà soát độ phủ 3 góc nhìn [qa-test-design/skills/coverage-review.md] ➔ \`06_coverage_review.md\`

## 3. Điểm Dừng
Chặng 6 là điểm hoàn tất tự nhiên. Sang Automation cần: \`npm run readiness -- ${slug}\`
cho khuyến nghị GO **và** người dùng yêu cầu rõ kèm URL môi trường.
`, 'utf-8');
    created.push(path.relative(PATHS.ROOT, planPath));
  }

  return created;
}

/**
 * Prefers a PRD/SRS-style document because it describes the feature itself;
 * a business document usually spans a whole quarter and would overstate scope.
 */
// ────────────────── Preventing duplicate tasks ──────────────────
//
// The task name comes from the FILE NAME. The same spec re-sent by the BA under another name
// spawns a second task for the same feature — `spec-function-d` and
// `<task-slug>` collided exactly this way, both being "Function D: <feature name>"
// of <SUT>. The three functions below detect it before writing.

/** The feature name the document declares, taken from the first H1 heading. */
function docTitle(markdown) {
  for (const line of String(markdown).split('\n')) {
    const m = line.match(/^#\s+(.+?)\s*$/);
    if (m) return m[1];
  }
  return '';
}

/** Normalise a title for comparison: strip accents, markdown symbols, collapse whitespace. */
function normalizeTitle(title) {
  return String(title)
    .replace(/[*_`#]/g, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Content fingerprint — ignores whitespace and case differences. */
function docFingerprint(markdown) {
  // Drop the metadata block (file name, sha256 of the original) — the same content under another file name is still one document.
  const normalized = stripMetadata(markdown).replace(/\s+/g, ' ').trim().toLowerCase();
  return crypto.createHash('sha1').update(normalized).digest('hex');
}

/** Every document already in INPUT/<task>/, with the task that owns it. */
function ingestedDocs() {
  if (!fs.existsSync(PATHS.INPUT)) return [];
  const out = [];

  for (const slug of fs.readdirSync(PATHS.INPUT)) {
    const taskDir = path.join(PATHS.INPUT, slug);
    if (slug.startsWith('.') || slug.startsWith('_')) continue;
    if (!fs.statSync(taskDir).isDirectory()) continue;

    for (const category of fs.readdirSync(taskDir)) {
      // Only the 5 standard bins hold ingested documents. A storage folder (e.g. INPUT/RAWS/de-bai/) is not a task —
      // counting it would report the brief file as "a duplicate of itself".
      if (!BINS.includes(category)) continue;
      const catDir = path.join(taskDir, category);
      if (!fs.existsSync(catDir) || !fs.statSync(catDir).isDirectory()) continue;

      for (const file of fs.readdirSync(catDir)) {
        if (!file.endsWith('.md')) continue;
        const full = path.join(catDir, file);
        let content = '';
        try {
          content = fs.readFileSync(full, 'utf-8');
        } catch {
          continue;
        }
        out.push({
          slug,
          file: path.relative(PATHS.ROOT, full),
          title: docTitle(content),
          hash: docFingerprint(content),
        });
      }
    }
  }
  return out;
}

/**
 * Does this document already belong to some task?
 *
 * @returns null, or
 *   { kind: 'same-document', slug, file }  — identical content, already taken in
 *   { kind: 'same-feature',  slug, file }  — different content but the same feature name
 */
function findDuplicate(markdown, targetSlug) {
  const hash = docFingerprint(markdown);
  const title = normalizeTitle(docTitle(markdown));

  for (const doc of ingestedDocs()) {
    if (doc.slug === targetSlug) continue; // the same task means an update, not a duplicate
    if (doc.hash === hash) return { kind: 'same-document', ...doc };
  }

  if (!title) return null;
  for (const doc of ingestedDocs()) {
    if (doc.slug === targetSlug) continue;
    if (normalizeTitle(doc.title) === title) return { kind: 'same-feature', ...doc };
  }
  return null;
}

/** Stop message — states where the duplicate is and the two ways forward, instead of silently creating a new task. */
function duplicateNotice(dup, proposedSlug, fileName) {
  const what =
    dup.kind === 'same-document'
      ? `This document was already taken in, with identical content.`
      : `This feature already has a task — same title as an already-ingested document.`;

  return [
    ``,
    `⛔ STOP — not creating a duplicate task.`,
    ``,
    `   ${what}`,
    `   Incoming doc : ${fileName}`,
    `   Already at   : ${dup.file}`,
    `   In task      : [ ${dup.slug} ]`,
    `   Would create : [ ${proposedSlug} ]   <- would become a second duplicate`,
    ``,
    `   Choose one:`,
    `     • Merge into the existing task:  npm run intake -- "${fileName}" --into ${dup.slug}`,
    `     • Still create a separate task:  npm run intake -- "${fileName}" --slug <other-name> --force`,
    ``,
  ].join('\n');
}

/**
 * The task name follows the FEATURE, not the document version: drops document type (srs, prd, đặc tả…),
 * version (v1, v1.2, rev3, final, draft) and date. So "SRS_Doi_mat_khau_v1" and
 * "SRS Đổi mật khẩu v2 (2026-10-28)" land in the same task `doi-mat-khau`.
 * Deterministic and never empty: if everything is stripped, fall back to the full slug of the file name.
 */
const DOC_TYPE_TOKENS = new Set([
  'srs', 'prd', 'brd', 'urd', 'frd', 'fsd', 'trd', 'spec', 'specs', 'specification', 'final', 'draft',
  'copy', 'ver', 'version', 'rev', 'revision',
]);
const DOC_TYPE_PAIRS = [['dac', 'ta'], ['tai', 'lieu'], ['ban', 'nhap'], ['phien', 'ban'], ['user', 'story'], ['use', 'case']];

function featureSlug(name) {
  const raw = versioning.stripVersionDate(name);
  let tokens = slugify(raw).split('-').filter(Boolean);
  for (const [a, b] of DOC_TYPE_PAIRS) {
    const out = [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === a && tokens[i + 1] === b) { i++; continue; }
      out.push(tokens[i]);
    }
    tokens = out;
  }
  tokens = tokens.filter((t) => !DOC_TYPE_TOKENS.has(t));
  // A name of only non-Latin characters (中文, ไทย…) yields an empty slug — use a hash so different files do not pile into one task `task`.
  return tokens.join('-') || slugify(name) || `task-${crypto.createHash('sha1').update(String(name)).digest('hex').slice(0, 6)}`;
}

// A file name with a strong BA signal (SRS, PRD, user story…) beats the generic word "spec": "API_<name>_spec" is a
// dev document, naming the task after it gives `api-<name>-request` instead of the feature name.
const BA_STRONG = /(?<![a-z])(?:prd|srs|brd|frd|urd|user.?stor(?:y|ies)|use.?case|requirements?|yeu.?cau|dac.?ta)(?![a-z])/i;
const BA_WEAK = /(?<![a-z])(?:spec|specs|specification)(?![a-z])/i;
const DEV_NAME = /(?<![a-z])(?:api|swagger|openapi|schema|db|postman)(?![a-z])/i;

function pickSlug(files) {
  const plain = (f) => deaccent(path.basename(f, path.extname(f))).replace(/[_.\s-]+/g, ' ');
  const pick = files.find((f) => BA_STRONG.test(plain(f)) && !DEV_NAME.test(plain(f)))
    || files.find((f) => BA_STRONG.test(plain(f)))
    || files.find((f) => BA_WEAK.test(plain(f)) && !DEV_NAME.test(plain(f)))
    || files[0];
  return featureSlug(path.basename(pick, path.extname(pick)));
}

/**
 * Guidance files belonging to the folder itself, not business documents.
 * Without this list intake swallowed `INPUT/README.md` and deleted it, removing
 * the user's signpost on their very first run.
 */
const META_FILES = new Set(['readme.md', 'readme.txt', '.gitkeep', '.keep', 'index.md']);

/** Documents sitting directly in INPUT/, not yet assigned to a task. */
function looseFiles() {
  if (!fs.existsSync(PATHS.INPUT)) return [];
  return fs.readdirSync(PATHS.INPUT)
    .filter((f) => {
      if (f.startsWith('.') || f.startsWith('~$') || f.startsWith('_')) return false;
      if (META_FILES.has(f.toLowerCase())) return false;
      return fs.statSync(path.join(PATHS.INPUT, f)).isFile();
    })
    .map((f) => path.join(PATHS.INPUT, f));
}

async function main() {
  const report = newReport();
  const slugs = new Set();

  // No argument means scan INPUT/. This is what users do instinctively: drop
  // documents in the folder and ask the agent to handle them.
  if (!targetInput) {
    const loose = looseFiles();
    if (loose.length === 0) {
      console.log('\nNo loose documents in INPUT/.');
      console.log('   Drop a file (.docx .pdf .xlsx .md …) into INPUT/ and run this again.');
      console.log('   Or name one explicitly: npm run intake -- <file> --slug <task-slug>\n');
      return;
    }

    // Group ALL loose documents into ONE task (PRD + CR + API spec + Figma of one feature).
    // Splitting wrongly means merging four places by hand; grouping wrongly is undone with --slug.
    const slug = targetSlug || pickSlug(loose);
    console.log(`\nFound ${loose.length} loose document(s) in INPUT/`);
    console.log(`   Grouping all ${loose.length} into one task: [ ${slug} ]`);
    if (!targetSlug && loose.length > 1) {
      console.log('   If these belong to different features, re-run each group with --slug <task>.');
    }
    const ask = CONFIRMED ? null : versioning.needsConfirmation(slug);
    if (ask) {
      console.log(versioning.confirmNotice(ask.slug, loose, { proposed: ask.related ? slug : null }));
      report.pending.push(...loose);
      process.exitCode = 2;
      return;
    }
    for (const f of loose) {
      // consume: a loose file is deleted only inside processFile, AFTER successful intake.
      if ((await processFile(f, slug, report, { consume: true })) === true) slugs.add(slug);
    }
  } else {
    const stat = fs.statSync(targetInput);
    const files = stat.isFile()
      ? [targetInput]
      : fs.readdirSync(targetInput)
        .filter((f) => !f.startsWith('~$') && !f.startsWith('.') && !META_FILES.has(f.toLowerCase()))
        .map((f) => path.join(targetInput, f))
        .filter((f) => fs.statSync(f).isFile());
    const bySlug = new Map();
    for (const f of files) {
      const slug = targetSlug || featureSlug(path.basename(f, path.extname(f)));
      if (!bySlug.has(slug)) bySlug.set(slug, []);
      bySlug.get(slug).push(f);
    }
    for (const [slug, group] of bySlug) {
      const ask = CONFIRMED ? null : versioning.needsConfirmation(slug);
      if (ask) {
        console.log(versioning.confirmNotice(ask.slug, group, { proposed: ask.related ? slug : null }));
        report.pending.push(...group);
        continue;
      }
      for (const f of group) {
        // A loose file directly in INPUT/ (named by the user after confirming --into) is cleaned up as in a scan,
        // otherwise the next intake meets it again and asks again. Files elsewhere are left alone.
        const consume = path.resolve(path.dirname(f)) === path.resolve(PATHS.INPUT);
        if ((await processFile(f, slug, report, { consume })) === true) slugs.add(slug);
      }
    }
  }

  const versions = versioning.applySupersede(report.filed.map((e) => path.join(PATHS.ROOT, e.dest)));
  report.versioning = versions;

  printSummary(report);
  versioning.printVersioning(versions);

  for (const slug of slugs) {
    const created = scaffoldTask(slug);
    if (created.length) {
      console.log(`Scaffolded task [ ${slug} ]:`);
      created.forEach((c) => console.log(`      ${c}`));
    }
    if (report.failed.length) {
      console.log(`\nTask [ ${slug} ] was built but is MISSING ${report.failed.length} failed document(s) listed above — fix them before analysing.\n`);
    } else {
      console.log(`\nTask [ ${slug} ] is ready. Next: ask the QA Leader to analyse feature ${slug}.\n`);
    }
  }

  const ingested = report.filed.length + report.assets.length;
  // exit 2 = documents waiting for the user to confirm a merge; exit 1 = failed files / nothing taken in.
  if (report.failed.length > 0) process.exitCode = 1;
  else if (report.pending.length > 0) process.exitCode = 2;
  else if (ingested === 0) process.exitCode = 1;
}

// Run only when invoked directly, so tests can import the pure functions below.
if (require.main === module) {
  main().catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}

module.exports = {
  BINS,
  classifyDocument,
  classifyDetailed,
  newReport,
  processFile,
  printSummary,
  fileAsset,
  writeAssetIndex,
  scaffoldTask,
  META_FILES,
  slugify,
  featureSlug,
  pickSlug,
  looseFiles,
  docTitle,
  normalizeTitle,
  docFingerprint,
  ingestedDocs,
  findDuplicate,
  duplicateNotice,
};

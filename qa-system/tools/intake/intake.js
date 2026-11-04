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
 *   npm run intake -- <file-or-dir> [--slug <task-slug> | --into <task-có-sẵn>]
 *
 * Tài liệu sắp vào một task ĐÃ CÓ tài liệu ⇒ dừng, exit 2, chờ xác nhận (`--into <slug>`).
 * Bản cũ của cùng tài liệu (cùng tên bỏ version/ngày, cùng ngăn) ⇒ chuyển sang `<ngăn>/_superseded/`.
 * Exit: 0 xong · 1 có file lỗi / không nhận được gì · 2 chờ người dùng xác nhận gộp.
 * Examples:
 *   node qa-system/tools/intake/intake.js "SRS_Auth.docx" --slug auth-login
 *   node qa-system/tools/intake/intake.js "doc.pdf" --slug qa-standard-guide
 *   node qa-system/tools/intake/intake.js "rules.xlsx" --slug order-mgmt
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
// `--into` = cố ý gộp vào task đã có. `--force` = cố ý chấp nhận tạo bản thứ hai.
const intoSlug = intoIndex !== -1 ? args[intoIndex + 1] : null;
let targetSlug = intoSlug || (slugIndex !== -1 ? args[slugIndex + 1] : null);
const FORCE = args.includes('--force');
// Người dùng đã chỉ đích danh task (--into / --slug) ⇒ đã xác nhận, không hỏi lại.
const CONFIRMED = intoSlug !== null || slugIndex !== -1;
const valueArgs = new Set([slugIndex + 1, intoIndex + 1].filter((i) => i > 0));
const positional = args.filter((a, idx) => !a.startsWith('--') && !valueArgs.has(idx));
const targetInput = positional[0];

/**
 * Diacritics must be decomposed BEFORE filtering characters. Filtering straight
 * through `[^\w\s-]` turned "Giỏ Hàng Số Lượng" into "gi-hng-s-lng", wiping every
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

// ───────────────────────── Phân ngăn (classification) ─────────────────────────
//
// Chấm điểm trên cả 5 ngăn, KHÔNG dừng ở từ khoá đầu tiên khớp:
//   1. Tên file + tiêu đề (H1) là tín hiệu mạnh nhất, xét trước.
//   2. CR / Q&A / biên bản / meeting → 05_communication thắng chữ chung chung "đặc tả".
//   3. Khớp theo ranh giới từ (Unicode): "revision" không còn chứa "vision".
//   4. Chuẩn hoá NFC: chữ Việt dựng sẵn hay tổ hợp đều khớp như nhau.
// Không chắc (hoà điểm / điểm thấp / không có tín hiệu) → vẫn xếp vào ngăn đoán tốt nhất
// nhưng gắn `unsure` để intake liệt kê cho người dùng xác nhận.

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

/** Chữ có khớp thuật ngữ không — ranh giới từ Unicode; cụm nhiều từ khớp cả bản bỏ dấu. */
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
      if (hasTerm(fileTextPlain, fileTextPlain, deaccent(t), { anyAccent: true })) { head[bin] += 5; hits[bin].push(`tên file:"${t}"`); }
      if (hasTerm(title, titlePlain, t)) { head[bin] += 3; hits[bin].push(`tiêu đề:"${t}"`); }
    }
    for (const t of sig.terms) {
      if (hasTerm(body, bodyPlain, t)) {
        const strong = (sig.strongContent || []).includes(t);
        score[bin] += strong ? 2 : 1;
        if (strong) strong05 = true;
        hits[bin].push(`nội dung:"${t}"`);
      }
    }
    for (const re of sig.regex) {
      if (re.test(fileText)) { head[bin] += 5; hits[bin].push(`tên file:${re.source}`); }
      if (re.test(String(content))) {
        score[bin] += 2;
        if (bin === '05_communication') strong05 = true;
        hits[bin].push(`nội dung:${re.source}`);
      }
    }
  }
  if (['.json', '.yaml', '.yml', '.sql'].includes(ext)) { head['03_dev'] += 10; hits['03_dev'].push(`đuôi ${ext}`); }

  const rank = (m) => BINS.slice().sort((a, b) => m[b] - m[a] || (a === '02_ba' ? -1 : b === '02_ba' ? 1 : 0));
  const why = (bin) => hits[bin].slice(0, 4).join(', ');

  // 1. Tên file / tiêu đề. 05 có tín hiệu ở đây thì thắng (CR/biên bản nói về spec, không phải spec).
  if (head['05_communication'] > 0) {
    return { bin: '05_communication', unsure: false, reason: why('05_communication'), scores: { head, content: score } };
  }
  const hr = rank(head);
  if (head[hr[0]] > 0) {
    const unsure = head[hr[0]] < 2 * head[hr[1]];
    return { bin: hr[0], unsure, reason: why(hr[0]) + (unsure ? ` (sát với ${hr[1]})` : ''), scores: { head, content: score } };
  }

  // 2. Nội dung.
  const cr = rank(score);
  let bin = cr[0];
  const top = score[bin];
  if (top === 0) return { bin: '02_ba', unsure: true, reason: 'không có tín hiệu nào — mặc định 02_ba', scores: { head, content: score } };
  let unsure = !(top >= 2 && top >= score[cr[1]] + 2);
  if (strong05 && bin !== '05_communication') {
    unsure = unsure || score[bin] > score['05_communication'];
    bin = '05_communication';
  }
  return { bin, unsure, reason: why(bin) + (unsure ? ' (điểm thấp/sát nhau)' : ''), scores: { head, content: score } };
}

/** Giữ API cũ: chỉ trả về tên ngăn. */
function classifyDocument(content, filename) {
  return classifyDetailed(content, filename).bin;
}

// ───────────────────────── Nhận một file ─────────────────────────

/** Sổ kết quả của một lượt intake. */
function newReport() {
  return { filed: [], assets: [], failed: [], skipped: [], unsure: [], pending: [], written: new Set() };
}

function ensureBins(slug) {
  for (const cat of BINS) fs.mkdirSync(path.join(PATHS.INPUT, slug, cat), { recursive: true });
}

const fileSha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

/** Liệt kê ảnh/file thiết kế trong 04_design/_assets/ thành một file .md để agent biết chúng tồn tại. */
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

/** Đưa ảnh/file thiết kế vào 04_design/_assets/ nguyên vẹn. `move` = xoá bản gốc sau khi chép xong. */
function fileAsset(filePath, slug, { move = false } = {}) {
  ensureBins(slug);
  const dir = path.join(PATHS.INPUT, slug, '04_design', '_assets');
  fs.mkdirSync(dir, { recursive: true });
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const srcSha = fileSha(filePath);
  let dest = path.join(dir, base + ext);
  for (let n = 2; fs.existsSync(dest); n++) {
    if (fileSha(dest) === srcSha) break; // đã có y hệt
    dest = path.join(dir, `${base}-${n}${ext}`);
  }
  if (!fs.existsSync(dest)) fs.copyFileSync(filePath, dest);
  if (fileSha(dest) !== srcSha) throw new Error(`chép ${path.basename(filePath)} không khớp sha256`);
  if (move && path.resolve(dest) !== path.resolve(filePath)) fs.unlinkSync(filePath);
  writeAssetIndex(slug);
  return dest;
}

/**
 * Nhận MỘT file vào INPUT/<slug>/. Trả về `true` CHỈ KHI đã chuyển đổi + ghi xong (hoặc đã cất ảnh);
 * mọi nhánh khác trả `false`. Với `consume: true` (file rời trong INPUT/), bản gốc chỉ bị xoá sau khi
 * thành công; lỗi thì file nằm nguyên chỗ cũ và được ghi vào `report.failed`.
 */
async function processFile(filePath, userSlug, report = newReport(), { consume = false } = {}) {
  const name = path.basename(filePath);
  const fail = (reason) => {
    report.failed.push({ file: filePath, reason });
    console.error(`   ❌ ${name}: ${reason}`);
    return false;
  };
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return fail('không tìm thấy file');

    const ext = path.extname(filePath).toLowerCase();
    const baseName = path.basename(filePath, ext);
    const slug = userSlug || featureSlug(baseName);
    console.log(`\n📥 [GATE 0] Nhận tài liệu: "${name}" → task [ ${slug} ]`);

    const kind = fileKind(filePath);
    if (kind.kind === 'asset') {
      const dest = fileAsset(filePath, slug, { move: consume });
      report.assets.push({ file: filePath, dest: path.relative(PATHS.ROOT, dest), slug });
      console.log(`   🖼️  Ảnh/thiết kế giữ nguyên → ${path.relative(PATHS.ROOT, dest)}`);
      return true;
    }
    if (kind.kind !== 'convert' && ext !== '.doc') return fail(kind.reason);

    let markdown;
    try {
      markdown = await convertDocumentToMarkdown(filePath);
    } catch (err) {
      return fail(`chuyển đổi lỗi — ${err.message}`);
    }
    if (!stripMetadata(markdown).trim()) return fail('chuyển đổi ra nội dung rỗng');

    if (!FORCE) {
      const dup = findDuplicate(markdown, slug);
      if (dup) {
        console.error(duplicateNotice(dup, slug, name));
        report.skipped.push({ file: filePath, reason: `trùng với ${dup.file} (task ${dup.slug})` });
        return false;
      }
    }

    const cls = classifyDetailed(markdown, name);
    ensureBins(slug);
    let destPath = path.join(PATHS.INPUT, slug, cls.bin, `${slugify(baseName)}.md`);
    // Hai file nguồn trùng tên gốc trong cùng một lượt (spec.docx + spec.pdf) không được ghi đè nhau.
    if (report.written.has(destPath)) destPath = path.join(PATHS.INPUT, slug, cls.bin, `${slugify(baseName)}-${ext.slice(1)}.md`);
    fs.writeFileSync(destPath, markdown, 'utf8');
    if (fs.readFileSync(destPath, 'utf8') !== markdown) return fail('ghi file đích không khớp');
    report.written.add(destPath);

    const entry = { file: filePath, dest: path.relative(PATHS.ROOT, destPath), slug, bin: cls.bin, reason: cls.reason };
    report.filed.push(entry);
    if (cls.unsure) report.unsure.push(entry);
    console.log(`   -> Ngăn: [ ${cls.bin} ]${cls.unsure ? '  ⚠️ CHƯA CHẮC' : ''} (${cls.reason})`);
    console.log(`   ✅ ${entry.dest}`);

    if (consume) fs.unlinkSync(filePath); // chỉ xoá sau khi đã ghi xong
    return true;
  } catch (err) {
    return fail(err.message);
  }
}

/** Tóm tắt cuối lượt: file lỗi (vẫn nằm nguyên chỗ), file xếp ngăn chưa chắc, file trùng. */
function printSummary(report) {
  const rel = (p) => path.relative(PATHS.ROOT, p) || p;
  console.log('\n──────── TÓM TẮT INTAKE ────────');
  console.log(`   Đã nhận: ${report.filed.length} tài liệu · ${report.assets.length} ảnh/thiết kế`);
  if (report.pending.length) {
    console.log(`\n   ⏸️  ${report.pending.length} file CHỜ XÁC NHẬN gộp vào task đã có (chưa nhận, giữ nguyên chỗ cũ).`);
  }
  if (report.unsure.length) {
    console.log(`\n   ⚠️ ${report.unsure.length} tài liệu xếp ngăn CHƯA CHẮC — cần người dùng xác nhận:`);
    report.unsure.forEach((u) => console.log(`      - ${path.basename(u.file)} → ${u.bin} (${u.reason})`));
  }
  if (report.skipped.length) {
    console.log(`\n   ⏭️  ${report.skipped.length} file bị bỏ qua (giữ nguyên chỗ cũ):`);
    report.skipped.forEach((s) => console.log(`      - ${rel(s.file)}: ${s.reason}`));
  }
  if (report.failed.length) {
    console.log(`\n   ❌ ${report.failed.length} file KHÔNG nhận được (giữ nguyên chỗ cũ, chưa xoá):`);
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
      // Template là khung rỗng; chỉ thay chỗ giữ tên slug, không thêm dữ liệu mẫu.
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
// ────────────────── Chống đẻ trùng task ──────────────────
//
// Tên task vốn lấy từ TÊN FILE. Cùng một đặc tả mà BA gửi lại dưới tên khác là
// sinh ra một task thứ hai cho đúng tính năng đó — `spec-function-d` và
// `function-d-voucher` đã trùng nhau đúng kiểu này, cùng là "Function D: Áp dụng
// Mã Giảm Giá (Voucher)" của ShopGo. Ba hàm dưới đây nhận diện trước khi ghi.

/** Tên tính năng mà tài liệu tự khai, lấy ở heading H1 đầu tiên. */
function docTitle(markdown) {
  for (const line of String(markdown).split('\n')) {
    const m = line.match(/^#\s+(.+?)\s*$/);
    if (m) return m[1];
  }
  return '';
}

/** Chuẩn hoá tiêu đề để so sánh: bỏ dấu, bỏ ký hiệu markdown, gộp khoảng trắng. */
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

/** Vân tay nội dung — bỏ qua khác biệt về khoảng trắng và hoa thường. */
function docFingerprint(markdown) {
  // Bỏ khối metadata (tên file, sha256 bản gốc) — cùng nội dung khác tên file vẫn là một tài liệu.
  const normalized = stripMetadata(markdown).replace(/\s+/g, ' ').trim().toLowerCase();
  return crypto.createHash('sha1').update(normalized).digest('hex');
}

/** Mọi tài liệu đã nằm trong INPUT/<task>/, kèm task sở hữu nó. */
function ingestedDocs() {
  if (!fs.existsSync(PATHS.INPUT)) return [];
  const out = [];

  for (const slug of fs.readdirSync(PATHS.INPUT)) {
    const taskDir = path.join(PATHS.INPUT, slug);
    if (slug.startsWith('.') || slug.startsWith('_')) continue;
    if (!fs.statSync(taskDir).isDirectory()) continue;

    for (const category of fs.readdirSync(taskDir)) {
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
 * Tài liệu này đã thuộc về task nào chưa?
 *
 * @returns null, hoặc
 *   { kind: 'same-document', slug, file }  — y nguyên nội dung, đã nhận rồi
 *   { kind: 'same-feature',  slug, file }  — khác nội dung nhưng cùng tên tính năng
 */
function findDuplicate(markdown, targetSlug) {
  const hash = docFingerprint(markdown);
  const title = normalizeTitle(docTitle(markdown));

  for (const doc of ingestedDocs()) {
    if (doc.slug === targetSlug) continue; // cùng task thì là cập nhật, không phải trùng
    if (doc.hash === hash) return { kind: 'same-document', ...doc };
  }

  if (!title) return null;
  for (const doc of ingestedDocs()) {
    if (doc.slug === targetSlug) continue;
    if (normalizeTitle(doc.title) === title) return { kind: 'same-feature', ...doc };
  }
  return null;
}

/** Thông điệp dừng — nêu rõ trùng ở đâu và hai lối đi, thay vì lặng lẽ tạo task mới. */
function duplicateNotice(dup, proposedSlug, fileName) {
  const what =
    dup.kind === 'same-document'
      ? `Tài liệu này đã được nhận vào rồi, nội dung y hệt.`
      : `Tính năng này đã có task rồi — cùng tiêu đề với tài liệu đã nhận.`;

  return [
    ``,
    `⛔ DỪNG — không đẻ thêm task trùng.`,
    ``,
    `   ${what}`,
    `   Tài liệu đến : ${fileName}`,
    `   Đã có ở      : ${dup.file}`,
    `   Thuộc task   : [ ${dup.slug} ]`,
    `   Định tạo mới : [ ${proposedSlug} ]   <- sẽ thành bản trùng thứ hai`,
    ``,
    `   Chọn một trong hai:`,
    `     • Gộp vào task đã có:  npm run intake -- "${fileName}" --into ${dup.slug}`,
    `     • Vẫn tạo task riêng:  npm run intake -- "${fileName}" --slug <tên-khác> --force`,
    ``,
  ].join('\n');
}

/**
 * Tên task theo TÍNH NĂNG, không theo bản tài liệu: bỏ loại tài liệu (srs, prd, đặc tả…),
 * version (v1, v1.2, rev3, final, draft) và ngày. Nhờ vậy "SRS_Doi_mat_khau_v1" và
 * "SRS Đổi mật khẩu v2 (2026-10-28)" cùng về task `doi-mat-khau`.
 * Xác định và không bao giờ rỗng: bỏ hết thì quay về slug đầy đủ của tên file.
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
  return tokens.join('-') || slugify(name) || 'task';
}

function pickSlug(files) {
  const isBA = (f) => /prd|srs|spec|user.?stor|requirement|use.?case|yeu.?cau|dac.?ta/i.test(path.basename(f));
  const pick = files.find(isBA) || files[0];
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
    if (!CONFIRMED && versioning.taskHasDocs(slug)) {
      console.log(versioning.confirmNotice(slug, loose));
      report.pending.push(...loose);
      process.exitCode = 2;
      return;
    }
    for (const f of loose) {
      // consume: bản rời chỉ bị xoá bên trong processFile, SAU KHI đã nhận thành công.
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
      if (!CONFIRMED && versioning.taskHasDocs(slug)) {
        console.log(versioning.confirmNotice(slug, group));
        report.pending.push(...group);
        continue;
      }
      for (const f of group) {
        if ((await processFile(f, slug, report)) === true) slugs.add(slug);
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
      console.log(`\nTask [ ${slug} ] đã dựng nhưng THIẾU ${report.failed.length} tài liệu lỗi ở trên — xử lý chúng trước khi phân tích.\n`);
    } else {
      console.log(`\nTask [ ${slug} ] is ready. Next: ask the QA Leader to analyse feature ${slug}.\n`);
    }
  }

  const ingested = report.filed.length + report.assets.length;
  // exit 2 = có tài liệu chờ người dùng xác nhận gộp; exit 1 = có file lỗi / không nhận được gì.
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

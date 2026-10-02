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
 * Converts .docx/.xlsx/.csv/.pdf/.json/.yaml/.txt to clean Markdown, files it under
 * INPUT/<slug>/, then scaffolds everything the task needs to proceed.
 *
 * Usage:
 *   npm run intake -- <file-or-dir> [--slug <task-slug>]
 * Examples:
 *   node qa-system/tools/intake/intake.js "SRS_Auth.docx" --slug auth-login
 *   node qa-system/tools/intake/intake.js "doc.pdf" --slug qa-standard-guide
 *   node qa-system/tools/intake/intake.js "rules.xlsx" --slug order-mgmt
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');
const { convertDocumentToMarkdown } = require('../lib/doc-converter');

const args = process.argv.slice(2);
const slugIndex = args.indexOf('--slug');
let targetSlug = slugIndex !== -1 ? args[slugIndex + 1] : null;
const positional = args.filter((a, idx) => !a.startsWith('--') && idx !== slugIndex + 1);
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

// Classify document content into 1 of 5 intake buckets
function classifyDocument(content, filename) {
  const haystackEarly = `${String(content).toLowerCase()} ${String(filename).toLowerCase()}`;
  const lowerContent = (content + ' ' + filename).toLowerCase();

  // 03_dev — APIs, schemas, technical specs.
  //
  // The old rule required the exact string `database schema`, so it missed
  // `DB schema` and API paths like `POST /api/login`. Those documents then fell
  // into the default 02_ba bin, polluting the one bin gate 0 depends on.
  const fn = filename.toLowerCase();
  if (
    lowerContent.includes('swagger') ||
    lowerContent.includes('openapi') ||
    lowerContent.includes('status code') ||
    lowerContent.includes('database schema') ||
    lowerContent.includes('db schema') ||
    lowerContent.includes('endpoint') ||
    lowerContent.includes('postman') ||
    lowerContent.includes('migration') ||
    /\b(get|post|put|patch|delete)\s+\/\S/i.test(content) ||
    /\bcurl\s+-/i.test(content) ||
    /\b(technical[ _-]?spec|tech[ _-]?spec|api[ _-]?spec|db[ _-]?schema)\b/.test(fn) ||
    filename.endsWith('.json') ||
    filename.endsWith('.yaml') ||
    filename.endsWith('.yml') ||
    filename.endsWith('.sql')
  ) {
    return '03_dev';
  }

  // 04_design (UI/UX, wireframes, mockups)
  if (
    lowerContent.includes('figma') ||
    lowerContent.includes('wireframe') ||
    lowerContent.includes('design system') ||
    lowerContent.includes('ui mockup') ||
    lowerContent.includes('pixel') ||
    lowerContent.includes('palette')
  ) {
    return '04_design';
  }

  // 02_ba is checked FIRST because gate 0 requires it: without this bin the
  // pipeline halts. Misfiling a PRD makes the gate report a missing document
  // while that document sits right there, so a clear BA signal wins outright.
  const baHints = [
    'prd', 'srs', 'user story', 'use case', 'acceptance criteria', 'tiêu chí chấp nhận',
    'đặc tả', 'dac ta', 'yêu cầu chức năng', 'yeu cau chuc nang', 'business requirement',
    'functional requirement', 'luồng nghiệp vụ', 'luong nghiep vu',
  ];
  if (baHints.some((h) => haystackEarly.includes(h))) {
    return '02_ba';
  }

  // 05_communication — correspondence, minutes, change requests.
  //
  // `email` is deliberately NOT a signal: it appears in nearly every signup or
  // login PRD as a data FIELD NAME, so the old rule pushed PRDs in here and made
  // the "02_ba is required" gate report a missing document.
  if (
    lowerContent.includes('biên bản họp') ||
    lowerContent.includes('meeting minutes') ||
    lowerContent.includes('q&a') ||
    lowerContent.includes('hỏi đáp') ||
    lowerContent.includes('change request') ||
    lowerContent.includes('yêu cầu thay đổi') ||
    lowerContent.includes('chat log') ||
    lowerContent.includes('trao đổi với ba') ||
    /\b(biên bản|bien ban|hop|meeting|cr[-_ ]?\d+)\b/.test(filename.toLowerCase())
  ) {
    return '05_communication';
  }

  // 01_business — strategy, policy, commercial goals.
  // The FILENAME counts too: strategy documents are short on keywords but their
  // names say it plainly ("Chính sách…", "Chiến lược…", "Chương trình…").
  const businessHints = [
    'chính sách', 'chiến lược', 'mục tiêu kinh doanh', 'doanh thu', 'chương trình khuyến mãi',
    'định hướng', 'bài toán kinh doanh', 'tầm nhìn',
    'business strategy', 'business objective', 'business goal', 'vision', 'roadmap', 'kpi', 'okr',
  ];
  const haystack = `${lowerContent} ${filename.toLowerCase()}`;
  if (businessHints.some((h) => haystack.includes(h))) {
    return '01_business';
  }

  // Default: 02_ba (PRD, SRS, User Stories, Acceptance Criteria, Requirements sheets)
  return '02_ba';
}

async function processFile(filePath, userSlug) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const baseName = path.basename(filePath, ext);
  const slug = userSlug || slugify(baseName);

  console.log(`\n📥 [GATE 0 - QA LEADER] Ingesting document: "${path.basename(filePath)}"`);
  console.log(`   -> Target feature slug: [ ${slug} ]`);

  let markdownContent = '';
  try {
    markdownContent = await convertDocumentToMarkdown(filePath);
  } catch (err) {
    console.error(`❌ Conversion failed: ${err.message}`);
    return;
  }

  // Classify into 5 categories
  const category = classifyDocument(markdownContent, path.basename(filePath));
  console.log(`   -> Categorized into: [ ${category} ]`);

  // Create destination directory
  const targetDir = path.join(PATHS.INPUT, slug, category);
  fs.mkdirSync(targetDir, { recursive: true });

  // Ensure all 5 categories exist for structure consistency
  const allCategories = ['01_business', '02_ba', '03_dev', '04_design', '05_communication'];
  allCategories.forEach(cat => {
    fs.mkdirSync(path.join(PATHS.INPUT, slug, cat), { recursive: true });
  });

  const destPath = path.join(targetDir, `${slugify(baseName)}.md`);
  fs.writeFileSync(destPath, markdownContent, 'utf8');

  console.log(`   ✅ Exported clean Markdown to:`);
  console.log(`      ${path.relative(PATHS.ROOT, destPath)}`);
  console.log(`   💡 QA Leader is ready to generate 00_plan.md for "${slug}".\n`);
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
      fs.writeFileSync(kPath, fs.readFileSync(tpl, 'utf-8'), 'utf-8');
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
function pickSlug(files) {
  const isBA = (f) => /prd|srs|spec|user.?stor|requirement|use.?case|yeu.?cau|dac.?ta/i.test(path.basename(f));
  const pick = files.find(isBA) || files[0];
  return slugify(path.basename(pick, path.extname(pick)));
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

    // Group ALL loose documents into ONE task.
    //
    // The common case is a full document set for a single feature (PRD + policy
    // + API spec + Figma). Splitting them yields four fragments, each missing
    // four of five bins. Getting this wrong is cheap to undo with --slug;
    // splitting wrongly means merging four places by hand.
    const slug = targetSlug || pickSlug(loose);
    console.log(`\nFound ${loose.length} loose document(s) in INPUT/`);
    console.log(`   Grouping all ${loose.length} into one task: [ ${slug} ]`);
    if (!targetSlug && loose.length > 1) {
      console.log('   If these belong to different features, re-run each group with --slug <task>.');
    }

    const slugs = new Set([slug]);
    for (const f of loose) {
      await processFile(f, slug);
      fs.unlinkSync(f); // filed into its bin; leaving a loose copy would confuse
    }

    for (const slug of slugs) {
      const created = scaffoldTask(slug);
      if (created.length) {
        console.log(`\nScaffolded task [ ${slug} ]:`);
        created.forEach((c) => console.log(`      ${c}`));
      }
      console.log(`\nTask [ ${slug} ] is ready. Next: ask the QA Leader to analyse feature ${slug}.\n`);
    }
    return;
  }

  const stat = fs.statSync(targetInput);
  if (stat.isFile()) {
    await processFile(targetInput, targetSlug);
  } else if (stat.isDirectory()) {
    const files = fs.readdirSync(targetInput);
    for (const file of files) {
      const full = path.join(targetInput, file);
      if (fs.statSync(full).isFile() && !file.startsWith('~$') && !file.startsWith('.')) {
        await processFile(full, targetSlug);
      }
    }
  }

  if (targetSlug) {
    const created = scaffoldTask(targetSlug);
    if (created.length) {
      console.log(`\nScaffolded task [ ${targetSlug} ]:`);
      created.forEach((c) => console.log(`      ${c}`));
    }
  }
}

// Run only when invoked directly, so tests can import the pure functions below.
if (require.main === module) {
  main().catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}

module.exports = { classifyDocument, slugify, pickSlug, looseFiles };

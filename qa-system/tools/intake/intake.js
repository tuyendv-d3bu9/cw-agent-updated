#!/usr/bin/env node
/**
 * intake.js — QA Leader Intake Gate (Gate 0):
 *   1. Converts raw document formats (.docx, .xlsx, .xls, .csv, .pdf, .json, .yaml, .txt) to clean Markdown (.md)
 *   2. Intelligently classifies content into 1 of 5 categories under INPUT/<slug>/
 *      (01_business, 02_ba, 03_dev, 04_design, 05_communication)
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

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Classify document content into 1 of 5 intake buckets
function classifyDocument(content, filename) {
  const lowerContent = (content + ' ' + filename).toLowerCase();

  // 03_dev (Technical specs, APIs, DB Schemas)
  if (
    lowerContent.includes('swagger') ||
    lowerContent.includes('openapi') ||
    lowerContent.includes('status code') ||
    lowerContent.includes('database schema') ||
    lowerContent.includes('endpoint') ||
    lowerContent.includes('postman') ||
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

  // 05_communication (Meetings, Q&A, change requests, chat logs)
  if (
    lowerContent.includes('biên bản họp') ||
    lowerContent.includes('meeting minutes') ||
    lowerContent.includes('q&a') ||
    lowerContent.includes('hỏi đáp') ||
    lowerContent.includes('change request') ||
    lowerContent.includes('slack') ||
    lowerContent.includes('email')
  ) {
    return '05_communication';
  }

  // 01_business — định hướng, chính sách, bài toán kinh doanh.
  // Xét cả TÊN FILE: tài liệu định hướng thường ngắn, nội dung ít từ khoá,
  // nhưng tên file nói rất rõ ("Chính sách…", "Chiến lược…", "Chương trình…").
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
 * Dựng đủ khung cho một task sau khi nhận tài liệu.
 *
 * Học viên là QA/BA, không phải dev — họ không biết phải tự tay tạo
 * OUTPUT/<slug>/, knowledge/features/<slug>.md hay 00_plan.md.
 * Thả tài liệu vào là phải có đủ chỗ để làm việc tiếp.
 */
function scaffoldTask(slug) {
  const created = [];
  const ensureDir = (p) => { if (!fs.existsSync(p)) { fs.mkdirSync(p, { recursive: true }); created.push(path.relative(PATHS.ROOT, p) + '/'); } };

  ensureDir(path.join(PATHS.OUTPUT, slug));

  // File tri thức tính năng — nơi câu trả lời của BA sống lâu hơn OUTPUT/
  const kPath = path.join(PATHS.FEATURES, `${slug}.md`);
  if (!fs.existsSync(kPath)) {
    const tpl = path.join(PATHS.KNOWLEDGE, '_template.md');
    if (fs.existsSync(tpl)) {
      ensureDir(PATHS.FEATURES);
      fs.writeFileSync(kPath, fs.readFileSync(tpl, 'utf-8'), 'utf-8');
      created.push(path.relative(PATHS.ROOT, kPath));
    }
  }

  // 00_plan.md — bản đồ tiến độ, cũng là thứ agent khác đọc để biết đang ở đâu
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
 * Đặt tên task từ bộ tài liệu.
 * Ưu tiên tài liệu kiểu PRD/SRS vì nó mô tả đúng tính năng; tài liệu định hướng
 * kinh doanh thường nói về cả quý nên đặt tên theo nó sẽ sai phạm vi.
 */
function pickSlug(files) {
  const isBA = (f) => /prd|srs|spec|user.?stor|requirement|use.?case|yeu.?cau|dac.?ta/i.test(path.basename(f));
  const pick = files.find(isBA) || files[0];
  return slugify(path.basename(pick, path.extname(pick)));
}

/**
 * File hướng dẫn của chính thư mục — KHÔNG phải tài liệu nghiệp vụ.
 * Thiếu danh sách này thì intake nuốt luôn `INPUT/README.md` và xoá nó đi,
 * khiến người dùng mất biển chỉ dẫn ngay lần chạy đầu tiên.
 */
const META_FILES = new Set(['readme.md', 'readme.txt', '.gitkeep', '.keep', 'index.md']);

/** Tài liệu rời nằm thẳng trong INPUT/, chưa thuộc task nào. */
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
  // Không truyền gì ⇒ tự quét INPUT/. Đây là thứ học viên làm theo bản năng:
  // kéo thả tài liệu vào INPUT/ rồi bảo agent "xử lý giúp".
  if (!targetInput) {
    const loose = looseFiles();
    if (loose.length === 0) {
      console.log(`\n📂 Không có tài liệu rời nào trong INPUT/.`);
      console.log(`   Cách dùng: thả file (.docx .pdf .xlsx .md…) vào INPUT/ rồi chạy lại lệnh này.`);
      console.log(`   Hoặc chỉ định cụ thể: npm run intake -- <file> --slug <task-slug>\n`);
      return;
    }

    // Gom TẤT CẢ tài liệu rời vào MỘT task.
    //
    // Trường hợp thường gặp nhất: người dùng thả cả bộ tài liệu của một tính năng
    // (PRD + chính sách + API spec + Figma). Tách mỗi file thành một task riêng
    // sẽ cho ra 4 task vụn, mỗi task thiếu 4/5 ngăn — rối hơn là giúp.
    // Chọn sai thì sửa dễ: chạy lại với --slug. Chọn tách thì phải gom tay 4 chỗ.
    const slug = targetSlug || pickSlug(loose);
    console.log(`\n📂 Phát hiện ${loose.length} tài liệu rời trong INPUT/`);
    console.log(`   → Gom cả ${loose.length} vào một task: [ ${slug} ]`);
    if (!targetSlug && loose.length > 1) {
      console.log(`   ℹ️  Nếu đây là nhiều tính năng khác nhau, chạy lại từng nhóm với --slug <tên-task>.`);
    }

    const slugs = new Set([slug]);
    for (const f of loose) {
      await processFile(f, slug);
      fs.unlinkSync(f); // đã chuyển vào đúng ngăn, không để lại bản rời gây nhầm
    }

    for (const slug of slugs) {
      const created = scaffoldTask(slug);
      if (created.length) {
        console.log(`\n🏗️  Đã dựng khung cho task [ ${slug} ]:`);
        created.forEach((c) => console.log(`      ${c}`));
      }
      console.log(`\n✅ Task [ ${slug} ] sẵn sàng. Bước tiếp theo: nói với QA Leader "phân tích tính năng ${slug}".\n`);
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
      console.log(`\n🏗️  Đã dựng khung cho task [ ${targetSlug} ]:`);
      created.forEach((c) => console.log(`      ${c}`));
    }
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

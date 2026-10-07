#!/usr/bin/env node
/**
 * bulk-intake.js — High-Volume Document Intake Engine (> 100 files)
 *
 * Capabilities:
 * - Worker queue with controlled concurrency and chunked batching.
 * - Deduplication via SHA-256 content hashing.
 * - Multi-format conversion (.docx, .doc, .xlsx, .xls, .csv, .pdf, .pptx, .json, .yaml, .txt).
 * - Automatic 5-category classification (01_business -> 05_communication).
 * - Traceability stamp injection into generated Markdown.
 * - Dry-run mode for pre-flight inspection without disk writes.
 * - Intake Manifest generation in JSON & Markdown.
 *
 * Usage:
 *   npm run intake:bulk [-- <source-dir>] [--slug <target-slug>] [--dry-run] [--concurrency 4]
 * Examples:
 *   node qa-system/tools/intake/bulk-intake.js INPUT/raw_specs/ --dry-run
 *   node qa-system/tools/intake/bulk-intake.js INPUT/raw_specs/ --slug core-system
 *   node qa-system/tools/intake/bulk-intake.js --concurrency 6
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');
const { convertDocumentToMarkdown, getFileMetadata } = require('../lib/doc-converter');
const { classifyDocument, slugify, pickSlug } = require('./intake');

// Parse CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

function getArgValue(flag, defaultValue) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultValue;
}

const customSlug = getArgValue('--slug', null);
const concurrency = parseInt(getArgValue('--concurrency', '4'), 10);
const chunkSize = parseInt(getArgValue('--chunk', '10'), 10);
const positional = args.filter((a, idx) => !a.startsWith('--') && (idx === 0 || !args[idx - 1].startsWith('--')));
const targetSource = positional[0] || PATHS.INPUT;

// Files to ignore
const IGNORED_NAMES = new Set(['readme.md', 'readme.txt', '.gitkeep', '.keep', 'index.md', '.ds_store']);

/**
 * Recursively find all documents in target path
 */
function scanFiles(srcPath) {
  if (!fs.existsSync(srcPath)) return [];
  const stat = fs.statSync(srcPath);
  if (stat.isFile()) {
    const base = path.basename(srcPath).toLowerCase();
    if (IGNORED_NAMES.has(base) || base.startsWith('~$') || base.startsWith('.')) return [];
    return [path.resolve(srcPath)];
  }

  const results = [];
  const entries = fs.readdirSync(srcPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(srcPath, entry.name);
    const lowerName = entry.name.toLowerCase();

    if (lowerName.startsWith('.') || lowerName.startsWith('~$') || IGNORED_NAMES.has(lowerName)) {
      continue;
    }

    if (entry.isDirectory()) {
      // Don't recurse into already organized sub-bins
      if (['01_business', '02_ba', '03_dev', '04_design', '05_communication'].includes(entry.name)) {
        continue;
      }
      results.push(...scanFiles(fullPath));
    } else if (entry.isFile()) {
      results.push(path.resolve(fullPath));
    }
  }
  return results;
}

/**
 * Scaffold task folder structure and plan
 */
function scaffoldTask(slug) {
  const created = [];
  const ensureDir = (p) => {
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p, { recursive: true });
      created.push(path.relative(PATHS.ROOT, p) + '/');
    }
  };

  ensureDir(path.join(PATHS.OUTPUT, slug));

  const kPath = path.join(PATHS.FEATURES, `${slug}.md`);
  if (!fs.existsSync(kPath)) {
    const tpl = path.join(PATHS.KNOWLEDGE, '_template.md');
    if (fs.existsSync(tpl)) {
      ensureDir(PATHS.FEATURES);
      fs.writeFileSync(kPath, fs.readFileSync(tpl, 'utf-8'), 'utf-8');
      created.push(path.relative(PATHS.ROOT, kPath));
    }
  }

  const planPath = path.join(PATHS.OUTPUT, slug, '00_plan.md');
  if (!fs.existsSync(planPath)) {
    const today = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(planPath, `# Kế Hoạch Phân Tích & Kiểm Thử · ${slug}
Ngày tạo: ${today} · Người lập: bulk-intake.js · Trạng thái: IN-PROGRESS

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
`, 'utf-8');
    created.push(path.relative(PATHS.ROOT, planPath));
  }

  return created;
}

/**
 * Worker pool to process items with limited concurrency
 */
async function runWorkerQueue(items, workerFn, limit) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      const item = items[currentIndex];
      try {
        const res = await workerFn(item, currentIndex, items.length);
        results[currentIndex] = res;
      } catch (err) {
        results[currentIndex] = { error: err.message, file: item };
      }
    }
  }

  const workers = Array(Math.min(limit, items.length)).fill(0).map(() => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log(`\n===============================================================`);
  console.log(`🚀 [GATE 0 - BULK INTAKE ENGINE] High-Volume Document Processor`);
  console.log(`===============================================================`);
  console.log(`📂 Source Path:        ${path.relative(PATHS.ROOT, targetSource) || '.'}`);
  console.log(`⚙️ Mode:               ${isDryRun ? 'DRY-RUN (Scan & Analysis Only, No Disk Writes)' : 'ACTIVE (Process & Write Files)'}`);
  console.log(`🧵 Concurrency:        ${concurrency} worker(s) | Chunk size: ${chunkSize}`);
  if (customSlug) {
    console.log(`🏷️ Target Slug:        ${customSlug}`);
  }

  const allFiles = scanFiles(targetSource);

  if (allFiles.length === 0) {
    console.log(`\n⚠️ No eligible documents found in: ${targetSource}`);
    console.log(`   Supported formats: .docx, .doc, .xlsx, .xls, .csv, .pdf, .pptx, .json, .yaml, .txt\n`);
    return;
  }

  console.log(`\n📊 Found ${allFiles.length} file(s) to process. Starting batch analysis...\n`);

  // Step 1: Compute hashes and detect duplicates
  const seenHashes = new Map();
  const fileRecords = [];

  for (const f of allFiles) {
    const meta = getFileMetadata(f);
    const ext = path.extname(f).toLowerCase();
    const isDuplicate = seenHashes.has(meta.hash);

    if (!isDuplicate) {
      seenHashes.set(meta.hash, f);
    }

    fileRecords.push({
      originalPath: f,
      filename: meta.filename,
      ext,
      sizeKb: meta.sizeKb,
      mtime: meta.mtime,
      hash: meta.hash,
      isDuplicate,
      duplicateOf: isDuplicate ? seenHashes.get(meta.hash) : null
    });
  }

  const duplicates = fileRecords.filter(r => r.isDuplicate);
  const uniqueFiles = fileRecords.filter(r => !r.isDuplicate);

  console.log(`🔍 [Deduplication Summary]`);
  console.log(`   - Unique Files:     ${uniqueFiles.length}`);
  console.log(`   - Duplicates Found: ${duplicates.length}`);
  if (duplicates.length > 0) {
    duplicates.forEach(d => {
      console.log(`     ⚠️ Duplicate: "${d.filename}" == "${path.basename(d.duplicateOf)}" [Hash: ${d.hash}]`);
    });
  }

  // Format distribution
  const formatStats = {};
  fileRecords.forEach(r => {
    formatStats[r.ext] = (formatStats[r.ext] || 0) + 1;
  });
  console.log(`\n📁 [Format Distribution]:`);
  for (const [ext, count] of Object.entries(formatStats)) {
    console.log(`   - ${ext.padEnd(8)} : ${count} file(s)`);
  }

  // Step 2: Dry-run check
  if (isDryRun) {
    console.log(`\n📋 [DRY RUN PREVIEW - Proposed Routing]:`);
    console.log(`-----------------------------------------------------------------------------------------`);
    console.log(`| #   | File Name                      | Size    | Target Slug      | Proposed Category |`);
    console.log(`-----------------------------------------------------------------------------------------`);

    for (let i = 0; i < Math.min(uniqueFiles.length, 30); i++) {
      const f = uniqueFiles[i];
      const baseName = path.basename(f.filename, f.ext);
      const slug = customSlug || slugify(baseName);
      // Rough preview classification
      const category = classifyDocument('', f.filename);
      console.log(`| ${(i + 1).toString().padEnd(3)} | ${f.filename.slice(0, 30).padEnd(30)} | ${f.sizeKb.padEnd(7)} | ${slug.slice(0, 16).padEnd(16)} | ${category.padEnd(17)} |`);
    }

    if (uniqueFiles.length > 30) {
      console.log(`| ... and ${uniqueFiles.length - 30} more file(s)`);
    }
    console.log(`-----------------------------------------------------------------------------------------`);
    console.log(`\n💡 To execute conversion and intake, run WITHOUT --dry-run:`);
    console.log(`   npm run intake:bulk -- "${path.relative(PATHS.ROOT, targetSource)}"${customSlug ? ' --slug ' + customSlug : ''}\n`);
    return;
  }

  // Step 3: Worker Queue Processing
  console.log(`\n⚙️ Converting unique documents in worker queue (Concurrency: ${concurrency})...`);

  const manifestItems = [];
  const affectedSlugs = new Set();

  async function processOneDocument(item, idx, total) {
    const startTime = Date.now();
    const baseName = path.basename(item.filename, item.ext);
    const slug = customSlug || slugify(baseName);
    affectedSlugs.add(slug);

    try {
      const markdownContent = await convertDocumentToMarkdown(item.originalPath, { withStamp: true });
      const category = classifyDocument(markdownContent, item.filename);

      // Create destination
      const targetDir = path.join(PATHS.INPUT, slug, category);
      fs.mkdirSync(targetDir, { recursive: true });

      // Ensure all 5 categories exist for structure consistency
      ['01_business', '02_ba', '03_dev', '04_design', '05_communication'].forEach(cat => {
        fs.mkdirSync(path.join(PATHS.INPUT, slug, cat), { recursive: true });
      });

      const destPath = path.join(targetDir, `${slugify(baseName)}.md`);
      fs.writeFileSync(destPath, markdownContent, 'utf8');

      const elapsed = Date.now() - startTime;
      console.log(`   [${idx + 1}/${total}] ✅ Converted: "${item.filename}" -> INPUT/${slug}/${category}/ (${elapsed}ms)`);

      return {
        filename: item.filename,
        hash: item.hash,
        slug,
        category,
        destPath: path.relative(PATHS.ROOT, destPath),
        sizeKb: item.sizeKb,
        status: 'SUCCESS',
        elapsedMs: elapsed
      };
    } catch (err) {
      console.error(`   [${idx + 1}/${total}] ❌ Failed: "${item.filename}": ${err.message}`);
      return {
        filename: item.filename,
        hash: item.hash,
        slug,
        status: 'FAILED',
        error: err.message
      };
    }
  }

  const results = await runWorkerQueue(uniqueFiles, processOneDocument, concurrency);
  manifestItems.push(...results);

  // Step 4: Scaffold tasks for all affected slugs
  console.log(`\n🏗️ Scaffolding task structures and 00_plan.md for ${affectedSlugs.size} feature(s)...`);
  for (const slug of affectedSlugs) {
    const created = scaffoldTask(slug);
    if (created.length > 0) {
      console.log(`   - Task [ ${slug} ]: created ${created.length} file(s)`);
    }
  }

  // Step 5: Export Manifest
  const manifest = {
    timestamp: new Date().toISOString(),
    sourcePath: path.relative(PATHS.ROOT, targetSource),
    totalScanned: allFiles.length,
    uniqueFiles: uniqueFiles.length,
    duplicatesCount: duplicates.length,
    successCount: manifestItems.filter(m => m.status === 'SUCCESS').length,
    failedCount: manifestItems.filter(m => m.status === 'FAILED').length,
    affectedSlugs: Array.from(affectedSlugs),
    items: manifestItems,
    duplicates: duplicates.map(d => ({
      filename: d.filename,
      duplicateOf: path.basename(d.duplicateOf),
      hash: d.hash
    }))
  };

  const outputBase = affectedSlugs.size === 1
    ? path.join(PATHS.OUTPUT, Array.from(affectedSlugs)[0])
    : path.join(PATHS.OUTPUT, '_bulk_intake');

  fs.mkdirSync(outputBase, { recursive: true });

  const manifestJsonPath = path.join(outputBase, '00_intake_manifest.json');
  fs.writeFileSync(manifestJsonPath, JSON.stringify(manifest, null, 2), 'utf8');

  // Also write Markdown manifest report
  let mdReport = `# Báo Cáo Tiếp Nhận Tài Liệu Hàng Loạt (Bulk Intake Manifest)\n\n`;
  mdReport += `> Ngày chạy: ${manifest.timestamp} · Nguồn: \`${manifest.sourcePath}\`\n\n`;
  mdReport += `## 1. Thống Kê Tổng Quan\n`;
  mdReport += `- **Tổng số file quét được**: ${manifest.totalScanned}\n`;
  mdReport += `- **File duy nhất (Unique)**: ${manifest.uniqueFiles}\n`;
  mdReport += `- **File trùng lặp (Skipped)**: ${manifest.duplicatesCount}\n`;
  mdReport += `- **Chuyển đổi thành công**: ${manifest.successCount}\n`;
  mdReport += `- **Thất bại / Lỗi**: ${manifest.failedCount}\n`;
  mdReport += `- **Tính năng liên quan (Slugs)**: ${manifest.affectedSlugs.join(', ')}\n\n`;

  mdReport += `## 2. Chi Tiết Phân Loại & Định Tuyến Vào INPUT/\n\n`;
  mdReport += `| # | Tên File Gốc | Size | Task Slug | Phân Loại | File Đích (.md) | Trạng Thái |\n`;
  mdReport += `|---|---|---|---|---|---|---|\n`;

  manifestItems.forEach((it, idx) => {
    mdReport += `| ${idx + 1} | \`${it.filename}\` | ${it.sizeKb || '-'} | \`${it.slug}\` | \`${it.category || '-'}\` | \`${it.destPath || '-'}\` | **${it.status}** |\n`;
  });

  if (duplicates.length > 0) {
    mdReport += `\n## 3. Danh Sách File Trùng Lặp Bị Bỏ Qua (Deduplicated)\n\n`;
    mdReport += `| Tên File Bị Bỏ Qua | Trùng Với File | SHA-256 Hash |\n`;
    mdReport += `|---|---|---|\n`;
    duplicates.forEach(d => {
      mdReport += `| \`${d.filename}\` | \`${path.basename(d.duplicateOf)}\` | \`${d.hash}\` |\n`;
    });
  }

  const manifestMdPath = path.join(outputBase, '00_intake_manifest.md');
  fs.writeFileSync(manifestMdPath, mdReport, 'utf8');

  console.log(`\n📄 Manifest exported:`);
  console.log(`   - JSON: ${path.relative(PATHS.ROOT, manifestJsonPath)}`);
  console.log(`   - MD:   ${path.relative(PATHS.ROOT, manifestMdPath)}`);
  console.log(`\n🎉 [BULK INTAKE COMPLETED] All documents are standardized to clean Markdown in INPUT/.\n`);
}

if (require.main === module) {
  main().catch(err => {
    console.error(`❌ Bulk Intake Fatal Error:`, err);
    process.exit(1);
  });
}

module.exports = { scanFiles, runWorkerQueue };

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
 *   node agents/tools/intake.js "SRS_Auth.docx" --slug auth-login
 *   node agents/tools/intake.js "doc.pdf" --slug qa-standard-guide
 *   node agents/tools/intake.js "rules.xlsx" --slug order-mgmt
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

if (!targetInput) {
  console.log('Usage:');
  console.log('  node agents/tools/intake.js <file-or-directory> [--slug <task-slug>]\n');
  console.log('Examples:');
  console.log('  node agents/tools/intake.js "SRS_Auth.docx" --slug auth-login');
  console.log('  node agents/tools/intake.js "requirements.xlsx" --slug cart-flow');
  console.log('  node agents/tools/intake.js "specs.pdf" --slug qa-guide');
  process.exit(0);
}

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

  // 01_business (High-level policies, vision, business models)
  if (
    lowerContent.includes('chính sách cấp cao') ||
    lowerContent.includes('mục tiêu kinh doanh') ||
    lowerContent.includes('business strategy') ||
    lowerContent.includes('business objective') ||
    lowerContent.includes('vision') ||
    lowerContent.includes('kpi')
  ) {
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

async function main() {
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
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

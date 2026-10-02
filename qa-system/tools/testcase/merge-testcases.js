#!/usr/bin/env node
/**
 * merge-testcases.js — Assembles chunked test case batches into 05_test_case_spec.md
 *
 * Usage:
 *   npm run testcases:merge <task-slug>
 * Example:
 *   npm run testcases:merge auth-login
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');

const slug = process.argv[2];

if (!slug) {
  console.error('Please specify task-slug:');
  console.error('  npm run testcases:merge <task-slug>');
  console.error('Example: npm run testcases:merge auth-login');
  process.exit(1);
}

const batchDir = path.join(PATHS.OUTPUT, slug, 'testcases');
const outputFile = path.join(PATHS.OUTPUT, slug, '05_test_case_spec.md');

if (!fs.existsSync(batchDir)) {
  console.error(`Batch directory not found: ${batchDir}`);
  process.exit(1);
}

const files = fs.readdirSync(batchDir)
  .filter(f => f.startsWith('batch_') && f.endsWith('.md'))
  .sort();

if (files.length === 0) {
  console.error(`No batch files found in: ${batchDir}`);
  process.exit(1);
}

console.log(`Found ${files.length} batch file(s). Assembling...`);

let combinedContent = `# TEST CASE SPECIFICATION · ${slug}\n`;
combinedContent += `Owner: agents/qa-test-design/test-case-generation · Source: OUTPUT/${slug}/05_test_blueprint.json · Verdict: PASS\n\n`;
combinedContent += `> Automatically assembled from ${files.length} chunked test case batches.\n\n---\n\n`;

let totalCases = 0;
for (const file of files) {
  const filePath = path.join(batchDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Count test cases
  const matches = content.match(/### TC_ID:/g);
  if (matches) totalCases += matches.length;

  combinedContent += `## Batch: ${file}\n\n`;
  combinedContent += content.trim() + '\n\n---\n\n';
}

fs.writeFileSync(outputFile, combinedContent, 'utf8');
console.log(`\n✅ Successfully assembled ${totalCases} test cases into:`);
console.log(`  -> ${outputFile}\n`);

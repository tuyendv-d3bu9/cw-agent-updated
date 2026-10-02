#!/usr/bin/env node
/**
 * new-knowledge.js — Quickly initializes a new feature knowledge file from _template.md
 *
 * Usage:
 *   npm run knowledge:new <feature-slug>
 * Example:
 *   npm run knowledge:new checkout-payment
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');

const slug = process.argv[2];

if (!slug) {
  console.error('Please specify feature-slug:');
  console.error('  npm run knowledge:new <feature-slug>');
  console.error('Example: npm run knowledge:new checkout-payment');
  process.exit(1);
}

const templatePath = path.join(PATHS.KNOWLEDGE, '_template.md');
const targetDir = PATHS.FEATURES;
const targetPath = path.join(targetDir, `${slug}.md`);

if (!fs.existsSync(templatePath)) {
  console.error(`Template not found: ${templatePath}`);
  process.exit(1);
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

if (fs.existsSync(targetPath)) {
  console.error(`File already exists: ${targetPath}`);
  console.error('Will not overwrite existing knowledge. Please specify another slug or edit directly.');
  process.exit(1);
}

const today = new Date().toISOString().split('T')[0];
let content = fs.readFileSync(templatePath, 'utf8');
content = content.replace(/<feature-slug>/g, slug);
content = content.replace(/<YYYY-MM-DD>/g, today);
content = content.replace(/<Tên Tính Năng>/g, slug.toUpperCase());

fs.writeFileSync(targetPath, content, 'utf8');
console.log(`\n✅ Successfully created feature knowledge file:`);
console.log(`  -> ${targetPath}`);
console.log(`\nNext step: Populate business rules or let QA Agent automatically parse from INPUT.\n`);

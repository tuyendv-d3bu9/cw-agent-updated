#!/usr/bin/env node
/**
 * new-knowledge.js — Creates knowledge/features/<slug>.md from knowledge/_template.md.
 *
 *   createKnowledge(slug)  Returns { path, created }. Never overwrites.
 *
 * The template starts EMPTY (QA_STANDARD §8): no sample rule, question or
 * decision may be copied into a real feature, because knowledge beats the
 * agent's own reading and a sample row would be taken as a settled fact.
 * Only `<feature-slug>` is filled in; every `<điền>` stays for a human.
 *
 * Usage:
 *   npm run knowledge:new <feature-slug>
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');

/** Template text for `slug`; sample rows of an old template (if any) are dropped. */
function render(templateText, slug) {
  return templateText
    .replace(/<feature-slug>/g, slug)
    .split('\n')
    .filter((l) => {
      const t = l.trim();
      if (!t.startsWith('|') || /^\|[\s:|-]+\|$/.test(t)) return true;
      return !/\b(MR|BR|FD|AF|OQ|RK)-\d+\b/.test(t) || /^\|\s*(ID|#)\s*\|/i.test(t);
    })
    .join('\n');
}

function createKnowledge(slug) {
  if (!slug || /[\\/]/.test(slug)) throw new Error('A feature slug without slashes is required');
  const templatePath = path.join(PATHS.KNOWLEDGE, '_template.md');
  const targetPath = path.join(PATHS.FEATURES, `${slug}.md`);
  if (!fs.existsSync(templatePath)) throw new Error(`Template not found: ${templatePath}`);
  if (fs.existsSync(targetPath)) return { path: targetPath, created: false };
  fs.mkdirSync(PATHS.FEATURES, { recursive: true });
  fs.writeFileSync(targetPath, render(fs.readFileSync(templatePath, 'utf8'), slug), 'utf8');
  return { path: targetPath, created: true };
}

function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Please specify feature-slug:\n  npm run knowledge:new <feature-slug>');
    process.exit(1);
  }
  try {
    const r = createKnowledge(slug);
    if (!r.created) {
      console.error(`File already exists: ${r.path}\nWill not overwrite existing knowledge.`);
      process.exit(1);
    }
    console.log(`\nCreated feature knowledge file (empty, from template):\n  -> ${r.path}\n`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { createKnowledge, render };

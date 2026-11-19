#!/usr/bin/env node
/**
 * map.js — Look up the system map (knowledge/_system_map.json) by keyword instead of reading the whole file.
 *
 *   npm run map -- <keyword> [keyword …]     every keyword must match (key or value, accent-folded, case-insensitive)
 *   npm run map -- --sections                top-level sections and the line count of each
 *
 * Example: `npm run map -- lint` → command and files of the lint gate. Costs a few dozen tokens instead of the whole file.
 */
const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');

const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();

function search(map, words) {
  const hits = [];
  const walk = (node, trail) => {
    if (node !== null && typeof node === 'object' && !Array.isArray(node)) {
      for (const [k, v] of Object.entries(node)) walk(v, [...trail, k]);
    } else {
      const key = trail.join('.');
      const val = Array.isArray(node) ? node.join(', ') : String(node);
      const hay = fold(key + ' ' + val);
      if (words.every((w) => hay.includes(w))) hits.push({ key, value: val });
    }
  };
  walk(map, []);
  return hits;
}

function run(argv) {
  const file = path.join(PATHS.KNOWLEDGE, '_system_map.json');
  if (!fs.existsSync(file)) return { code: 1, out: 'knowledge/_system_map.json not found — run `npm run map:sync`.' };
  const map = JSON.parse(fs.readFileSync(file, 'utf-8'));

  if (argv.includes('--sections')) {
    return { code: 0, out: Object.entries(map).map(([k, v]) => `${k}: ${v !== null && typeof v === 'object' ? Object.keys(v).length + ' entries' : typeof v}`).join('\n') };
  }
  const words = argv.filter((a) => !a.startsWith('--')).map(fold).filter(Boolean);
  if (words.length === 0) return { code: 2, out: 'Usage: npm run map -- <keyword> [keyword …]   (or --sections)' };

  const hits = search(map, words);
  if (hits.length === 0) return { code: 1, out: `No entry matches "${words.join(' ')}". Try a shorter keyword, or --sections.` };
  const shown = hits.slice(0, 12);
  const more = hits.length > shown.length ? `\n… ${hits.length - shown.length} more matching entries — add a keyword to narrow down.` : '';
  return { code: 0, out: shown.map((h) => `${h.key} → ${h.value}`).join('\n') + more };
}

if (require.main === module) {
  const { code, out } = run(process.argv.slice(2));
  (code === 0 ? console.log : console.error)(out);
  process.exit(code);
}

module.exports = { run, search, fold };

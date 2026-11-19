#!/usr/bin/env node
/**
 * json.js — Read ONE branch of a JSON file without loading the whole file into context.
 *
 *   npm run json -- <file.json> [dotted.path] [--keys] [--max N]
 *
 * Examples:
 *   npm run json -- knowledge/_system_map.json routing_table.lint_command
 *   npm run json -- knowledge/_system_map.json routing_table --keys
 *   npm run json -- OUTPUT/x/00_intake_manifest.json "items[status=FAILED].filename"
 *
 * Rule for agents: do NOT open .json files directly (token-expensive). Use this command and fetch just the part needed.
 * Only reads files inside the repo. Output is truncated at 1500 characters by default, and says so.
 */
const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');
const J = require('../lib/jsonq');

function run(argv) {
  const flags = { keys: argv.includes('--keys') };
  const mi = argv.indexOf('--max');
  const max = mi !== -1 ? parseInt(argv[mi + 1], 10) || 1500 : 1500;
  const pos = argv.filter((a, i) => !a.startsWith('--') && !(mi !== -1 && i === mi + 1));
  const [file, qpath] = pos;

  if (!file) return { code: 2, out: 'Usage: npm run json -- <file.json> [dotted.path] [--keys] [--max N]' };

  const full = path.resolve(PATHS.ROOT, file);
  if (full !== PATHS.ROOT && !full.startsWith(PATHS.ROOT + path.sep)) return { code: 2, out: `Refused: ${file} is outside the repo.` };
  if (!fs.existsSync(full)) return { code: 1, out: `File not found: ${file}` };

  let data;
  try {
    data = JSON.parse(fs.readFileSync(full, 'utf-8').replace(/^﻿/, ''));
  } catch (e) {
    return { code: 1, out: `${file} is not valid JSON: ${e.message}` };
  }

  const r = J.query(data, qpath || '');
  if (!r.found) {
    const parent = qpath && qpath.includes('.') ? qpath.slice(0, qpath.lastIndexOf('.')) : '';
    const near = J.query(data, parent);
    let hint = '';
    if (near.found) {
      const d = J.describe(near.value);
      const list = d.keys || d.itemKeys || [];
      hint = ` At "${parent || '(root)'}" there are ${list.length} keys: ${list.slice(0, 12).join(', ')}${list.length > 12 ? ', …' : ''}. Use --keys or \`npm run map -- <keyword>\` to search.`;
    }
    return { code: 1, out: `No "${qpath}" in ${file}.${hint}` };
  }

  if (flags.keys) return { code: 0, out: JSON.stringify(J.describe(r.value)) };

  const o = J.render(r.value, { max });
  const tail = o.truncated
    ? `\n… [truncated: ${o.total} characters, showing ${max}. Add a deeper path, or --keys to list keys, or --max N]`
    : '';
  return { code: 0, out: o.text + tail };
}

if (require.main === module) {
  const { code, out } = run(process.argv.slice(2));
  (code === 0 ? console.log : console.error)(out);
  process.exit(code);
}

module.exports = { run };

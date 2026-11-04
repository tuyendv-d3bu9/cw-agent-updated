#!/usr/bin/env node
/**
 * ids.js — Next free ID per family for a task (QA_STANDARD §9.1).
 *
 * IDs are never renumbered from 01: the next one follows the largest number
 * already present in knowledge/features/<slug>.md and OUTPUT/<slug>/**. Skills
 * call this before allocating BR/FD/AF/OQ/MR/RK/TI (and VP-9x, test cases).
 *
 * Usage:
 *   node qa-system/tools/system/ids.js <slug> [--json]
 */

const { nextIds, ID_FAMILIES } = require('../lib/schema');

function main() {
  const args = process.argv.slice(2);
  const slug = args.find((a) => !a.startsWith('-'));
  if (!slug) {
    console.error('Usage: ids.js <slug> [--json]');
    process.exit(1);
  }
  const r = nextIds(slug);
  if (args.includes('--json')) {
    console.log(JSON.stringify(r, null, 2));
    return;
  }
  console.log(`\nNext free IDs · task [ ${slug} ]  (scanned ${r.sources.length} file(s))`);
  for (const f of ID_FAMILIES) {
    const note = f === 'VP' ? '   (VP-01..VP-08 are the fixed registry; this is the next out-of-registry code)' : '';
    console.log(`   ${f.padEnd(3)} ${r.next[f]}   (max in use: ${r.max[f] ? `${f}-${String(r.max[f]).padStart(2, '0')}` : 'none'})${note}`);
  }
  const mods = Object.entries(r.testCases);
  if (mods.length) console.log(`   TC  ${mods.map(([m, n]) => `${m}: ${n}`).join(' · ')}`);
  console.log('');
}

if (require.main === module) main();

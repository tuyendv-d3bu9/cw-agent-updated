#!/usr/bin/env node
/**
 * ids.js — Next free ID per family for a task (QA_STANDARD §9.1).
 *
 * IDs are never renumbered from 01: the next one follows the largest number
 * already present in knowledge/features/<slug>.md and OUTPUT/<slug>/**. Skills
 * call this before allocating BR/FD/AF/OQ/MR/RK/TI (and VP-9x, test cases).
 *
 * `--assign <file>`: agent chỉ ghi MÃ TẠM (`BR-?`, `MR-?`…), tool đánh số thật theo thứ tự xuất hiện trong file,
 * tiếp nối số đang dùng. Cùng một nhãn (`BR-?a`) ⇒ cùng một số, nên tham chiếu chéo trong file vẫn đúng.
 * Nhờ vậy số và thứ tự mã không còn phụ thuộc việc model tự đếm — hai lần chạy cùng thứ tự dòng ra cùng mã.
 *
 * Usage:
 *   node qa-system/tools/system/ids.js <slug> [--json]
 *   node qa-system/tools/system/ids.js <slug> --assign <file> [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { nextIds, ID_FAMILIES } = require('../lib/schema');
const { PATHS } = require('../lib/paths');

const TEMP_ID = /(?<![A-Za-z0-9-])(BR|FD|AF|OQ|MR|RK|TI)-\?([A-Za-z0-9]{0,8})(?![A-Za-z0-9])/g;

/**
 * Thay mã tạm bằng mã thật. Trả về { text, map, changed }.
 * `file` là đường dẫn trong repo; ghi đè tại chỗ trừ khi dryRun.
 */
function assign(slug, file, { dryRun = false } = {}) {
  const full = path.resolve(PATHS.ROOT, file);
  if (full !== PATHS.ROOT && !full.startsWith(PATHS.ROOT + path.sep)) throw new Error(`${file} nằm ngoài repo`);
  if (!fs.existsSync(full)) throw new Error(`không có file ${file}`);
  const text = fs.readFileSync(full, 'utf-8');

  const max = nextIds(slug).max; // đã tính cả mã thật có sẵn trong chính file này
  const counters = { ...max };
  const labelled = new Map(); // "BR|a" -> "BR-05"
  const map = [];

  const out = text.replace(TEMP_ID, (m, fam, label) => {
    if (label) {
      const key = `${fam}|${label}`;
      if (!labelled.has(key)) { counters[fam] += 1; labelled.set(key, `${fam}-${String(counters[fam]).padStart(2, '0')}`); map.push([m, labelled.get(key)]); }
      return labelled.get(key);
    }
    counters[fam] += 1;
    const id = `${fam}-${String(counters[fam]).padStart(2, '0')}`;
    map.push([m, id]);
    return id;
  });

  if (!dryRun && out !== text) fs.writeFileSync(full, out, 'utf-8');
  return { text: out, map, changed: out !== text, file: path.relative(PATHS.ROOT, full) };
}

function main() {
  const args = process.argv.slice(2);
  const ai = args.indexOf('--assign');
  const file = ai !== -1 ? args[ai + 1] : null;
  const slug = args.find((a, i) => !a.startsWith('-') && !(ai !== -1 && i === ai + 1));
  if (!slug) {
    console.error('Usage: ids.js <slug> [--json] | ids.js <slug> --assign <file> [--dry-run]');
    process.exit(1);
  }
  if (ai !== -1) {
    if (!file) { console.error('--assign cần đường dẫn file'); process.exit(1); }
    try {
      const r = assign(slug, file, { dryRun: args.includes('--dry-run') });
      if (r.map.length === 0) { console.log(`Không có mã tạm (BR-?, MR-? …) trong ${r.file}.`); return; }
      console.log(`${args.includes('--dry-run') ? '[dry-run] ' : ''}${r.file}: đánh ${r.map.length} mã`);
      r.map.forEach(([a, b]) => console.log(`   ${a} → ${b}`));
    } catch (e) { console.error(e.message); process.exit(1); }
    return;
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

module.exports = { assign };

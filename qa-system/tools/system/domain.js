#!/usr/bin/env node
/**
 * domain.js — Dự án đang chọn pack ngành nào, và pack đó gồm những file nào cho từng chặng.
 *
 *   npm run domain            Ngành đã chọn (knowledge/_sut.json → domain), file skill cần đọc, pack đang có
 *   npm run domain -- --json  Như trên, dạng JSON (kết quả của loadDomain)
 *
 * Chỉ đọc. Chọn / đổi ngành là việc của con người: sửa `domain` trong knowledge/_sut.json.
 * Exit: 0 = đọc được · 1 = _sut.json chọn id không có, hoặc pack hỏng.
 */

const path = require('path');
const { PATHS } = require('../lib/paths');
const { loadDomain, listPacks } = require('../lib/domain');

function run(argv) {
  const available = listPacks(path.join(PATHS.SYSTEM, 'domains'));
  let d;
  try {
    d = loadDomain({ root: PATHS.ROOT });
  } catch (e) {
    return { code: 1, out: `❌ ${e.message}` };
  }
  if (argv.includes('--json')) return { code: 0, out: JSON.stringify({ available, ...d }, null, 2) };

  const lines = [`Pack đang có: ${available.join(', ') || '(chưa có)'}`];
  if (!d.ids.length) {
    lines.push('Ngành đã chọn: (không) — knowledge/_sut.json chưa khai `domain`; mọi tool dùng mặc định cũ, skill bỏ qua bước pack ngành.');
  } else {
    lines.push(`Ngành đã chọn: ${d.ids.join(', ')}`);
    lines.push(`  vocab:         ${d.files.vocab.join(' · ') || '—'}`);
    lines.push(`  risks:         ${d.files.risks.join(' · ') || '—'}`);
    lines.push(`  rule-patterns: ${d.files.rulePatterns.join(' · ') || '—'}`);
    lines.push(`  conflict topics: ${Object.keys(d.conflictTopics || {}).length} · datagen types: ${Object.keys(d.datagen.types).join(', ') || '—'} · units: ${d.units.join(', ') || '—'}`);
  }
  if (d.override) lines.push(`Bổ sung của dự án: ${d.override.file}`);
  lines.push('Pack là checklist, không phải nguồn sự thật (QA_STANDARD §10.3).');
  return { code: 0, out: lines.join('\n') };
}

if (require.main === module) {
  const r = run(process.argv.slice(2));
  console.log(r.out);
  process.exit(r.code);
}

module.exports = { run };

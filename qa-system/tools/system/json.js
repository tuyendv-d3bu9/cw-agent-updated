#!/usr/bin/env node
/**
 * json.js — Đọc MỘT nhánh của file JSON, không nạp cả file vào ngữ cảnh.
 *
 *   npm run json -- <file.json> [đường.dẫn] [--keys] [--max N]
 *
 * Ví dụ:
 *   npm run json -- knowledge/_system_map.json routing_table.lint_command
 *   npm run json -- knowledge/_system_map.json routing_table --keys
 *   npm run json -- OUTPUT/x/00_intake_manifest.json "items[status=FAILED].filename"
 *
 * Luật cho agent: KHÔNG mở thẳng file .json để đọc (tốn token). Dùng lệnh này, lấy đúng phần cần.
 * Chỉ đọc file nằm trong repo. Mặc định cắt kết quả ở 1500 ký tự và nói rõ đã cắt.
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

  if (!file) return { code: 2, out: 'Cách dùng: npm run json -- <file.json> [đường.dẫn] [--keys] [--max N]' };

  const full = path.resolve(PATHS.ROOT, file);
  if (full !== PATHS.ROOT && !full.startsWith(PATHS.ROOT + path.sep)) return { code: 2, out: `Từ chối: ${file} nằm ngoài repo.` };
  if (!fs.existsSync(full)) return { code: 1, out: `Không có file: ${file}` };

  let data;
  try {
    data = JSON.parse(fs.readFileSync(full, 'utf-8').replace(/^﻿/, ''));
  } catch (e) {
    return { code: 1, out: `${file} không phải JSON hợp lệ: ${e.message}` };
  }

  const r = J.query(data, qpath || '');
  if (!r.found) {
    const parent = qpath && qpath.includes('.') ? qpath.slice(0, qpath.lastIndexOf('.')) : '';
    const near = J.query(data, parent);
    let hint = '';
    if (near.found) {
      const d = J.describe(near.value);
      const list = d.keys || d.itemKeys || [];
      hint = ` Ở "${parent || '(gốc)'}" có ${list.length} khoá: ${list.slice(0, 12).join(', ')}${list.length > 12 ? ', …' : ''}. Dùng --keys hoặc \`npm run map -- <từ khoá>\` để tìm.`;
    }
    return { code: 1, out: `Không có "${qpath}" trong ${file}.${hint}` };
  }

  if (flags.keys) return { code: 0, out: JSON.stringify(J.describe(r.value)) };

  const o = J.render(r.value, { max });
  const tail = o.truncated
    ? `\n… [đã cắt: ${o.total} ký tự, hiện ${max}. Thêm đường dẫn sâu hơn, hoặc --keys để xem các khoá, hoặc --max N]`
    : '';
  return { code: 0, out: o.text + tail };
}

if (require.main === module) {
  const { code, out } = run(process.argv.slice(2));
  (code === 0 ? console.log : console.error)(out);
  process.exit(code);
}

module.exports = { run };

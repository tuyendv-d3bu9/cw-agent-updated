#!/usr/bin/env node
/**
 * map.js — Tra bản đồ hệ thống (knowledge/_system_map.json) theo từ khoá, thay cho việc đọc cả file.
 *
 *   npm run map -- <từ khoá> [từ khoá …]     mọi từ khoá đều phải khớp (khoá hoặc giá trị, bỏ dấu, không phân biệt hoa thường)
 *   npm run map -- --sections                các mục cấp 1 và số dòng của từng mục
 *
 * Ví dụ: `npm run map -- lint` → lệnh và file của cổng lint. Tốn vài chục token thay vì cả file.
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
  if (!fs.existsSync(file)) return { code: 1, out: 'Chưa có knowledge/_system_map.json — chạy `npm run map:sync`.' };
  const map = JSON.parse(fs.readFileSync(file, 'utf-8'));

  if (argv.includes('--sections')) {
    return { code: 0, out: Object.entries(map).map(([k, v]) => `${k}: ${v !== null && typeof v === 'object' ? Object.keys(v).length + ' mục' : typeof v}`).join('\n') };
  }
  const words = argv.filter((a) => !a.startsWith('--')).map(fold).filter(Boolean);
  if (words.length === 0) return { code: 2, out: 'Cách dùng: npm run map -- <từ khoá> [từ khoá …]   (hoặc --sections)' };

  const hits = search(map, words);
  if (hits.length === 0) return { code: 1, out: `Không thấy mục nào khớp "${words.join(' ')}". Thử từ khoá ngắn hơn, hoặc --sections.` };
  const shown = hits.slice(0, 12);
  const more = hits.length > shown.length ? `\n… còn ${hits.length - shown.length} mục khớp nữa — thêm từ khoá để thu hẹp.` : '';
  return { code: 0, out: shown.map((h) => `${h.key} → ${h.value}`).join('\n') + more };
}

if (require.main === module) {
  const { code, out } = run(process.argv.slice(2));
  (code === 0 ? console.log : console.error)(out);
  process.exit(code);
}

module.exports = { run, search, fold };

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { convertDocumentToMarkdown, parseSourceMetadata } = require('../lib/doc-converter');

test('metadata trong thân: "Phiên bản: 1.1 · Ngày: 2026-10-14 · …" tách đúng version và ngày', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'meta-'));
  const f = path.join(dir, 'api.md');
  fs.writeFileSync(f, '# API\n\nPhiên bản: 1.1 · Ngày: 2026-10-14 · Người soạn: Huy\n\nNội dung.\n');
  const md = await convertDocumentToMarkdown(f);
  const meta = parseSourceMetadata(md);
  assert.match(meta.version, /^1\.1 /);
  assert.match(meta.date, /^2026-10-14 /);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('xlsx dòng ẩn: cảnh báo nêu nội dung của dòng bị ẩn', async () => {
  const XLSX = require('xlsx');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'xl-'));
  const f = path.join(dir, 'codes.xlsx');
  const ws = XLSX.utils.aoa_to_sheet([['Mã', 'Thông báo'], ['A', 'Hiện'], ['B', 'Bị ẩn']]);
  ws['!rows'] = [{}, {}, { hidden: true }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'S');
  XLSX.writeFile(wb, f, { cellStyles: true });
  const md = await convertDocumentToMarkdown(f);
  assert.match(md, /Dòng 3: "B \/ Bị ẩn"/);
  fs.rmSync(dir, { recursive: true, force: true });
});

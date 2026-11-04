/**
 * Tests for doc-converter — khâu nhận tài liệu không được làm mất / méo nguồn (audit G2 #5-#10).
 * Mọi file mẫu được dựng ngay trong test (docx bằng JSZip, xlsx bằng SheetJS, pdf viết tay).
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const JSZip = require('jszip');
const XLSX = require('xlsx');
const {
  convertDocumentToMarkdown, fileKind, htmlToMarkdown, stripMetadata, parseSourceMetadata, cleanMarkdown,
} = require('../lib/doc-converter');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-conv-test-'));
test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
const out = (name) => path.join(tmp, name);

const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
const P = (t) => `<w:p><w:r><w:t xml:space="preserve">${t}</w:t></w:r></w:p>`;
const TC = (t, extra = '') => `<w:tc><w:tcPr>${extra}</w:tcPr>${P(t)}</w:tc>`;

async function makeDocx(file) {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const body = `${P('Mật khẩu tối thiểu 8 ký tự.')}
<w:p><w:r><w:t xml:space="preserve">Số lần sai tối đa: </w:t></w:r><w:del w:id="1" w:author="BA" w:date="2026-01-01T00:00:00Z"><w:r><w:delText>3</w:delText></w:r></w:del><w:ins w:id="2" w:author="BA" w:date="2026-01-01T00:00:00Z"><w:r><w:t>5</w:t></w:r></w:ins><w:commentRangeStart w:id="0"/><w:r><w:t xml:space="preserve"> lần</w:t></w:r><w:commentRangeEnd w:id="0"/><w:r><w:commentReference w:id="0"/></w:r></w:p>
<w:tbl><w:tblGrid><w:gridCol/><w:gridCol/><w:gridCol/></w:tblGrid>
<w:tr>${TC('Trường')}${TC('Ràng buộc')}${TC('Thông báo lỗi')}</w:tr>
<w:tr>${TC('Email', '<w:vMerge w:val="restart"/>')}${TC('Bắt buộc')}${TC('MSG01: Vui lòng nhập email')}</w:tr>
<w:tr>${TC('', '<w:vMerge/>')}${TC('Đúng định dạng')}${TC('MSG02: Email không hợp lệ')}</w:tr>
</w:tbl>
<w:p><w:r><w:drawing><wp:inline><wp:extent cx="100" cy="100"/><wp:docPr id="1" name="wire" descr="Wireframe login"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="1" name="wire.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdImg"/></pic:blipFill><pic:spPr/></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>
<w:sectPr><w:headerReference w:type="default" r:id="rIdH"/></w:sectPr>`;
  const z = new JSZip();
  z.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  z.file('_rels/.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  z.file('word/_rels/document.xml.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdImg" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/wire.png"/><Relationship Id="rIdC" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments" Target="comments.xml"/><Relationship Id="rIdH" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/></Relationships>');
  z.file('word/media/wire.png', png);
  z.file('word/comments.xml', `<?xml version="1.0"?><w:comments ${W}><w:comment w:id="0" w:author="PO"><w:p><w:r><w:t>chưa chốt, có thể đổi thành 10</w:t></w:r></w:p></w:comment></w:comments>`);
  z.file('word/header1.xml', `<?xml version="1.0"?><w:hdr ${W}>${P('Phiên bản v2.3 - DRAFT')}</w:hdr>`);
  z.file('docProps/core.xml', '<?xml version="1.0"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"><dc:title>Đặc tả Đăng nhập</dc:title><dcterms:modified>2026-10-30T08:00:00Z</dcterms:modified></cp:coreProperties>');
  z.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8"?><w:document ${W}><w:body>${body}</w:body></w:document>`);
  fs.writeFileSync(file, await z.generateAsync({ type: 'nodebuffer' }));
  return file;
}

function makePdf(pages) {
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>'];
  objs.push(`<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`);
  const fontId = 3 + pages.length * 2;
  pages.forEach((t) => {
    const stream = t ? `BT /F1 12 Tf 50 700 Td (${t}) Tj ET` : '';
    objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${objs.length + 2} 0 R >>`);
    objs.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });
  objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  let s = '%PDF-1.4\n';
  const offs = [];
  objs.forEach((o, i) => { offs.push(s.length); s += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = s.length;
  s += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('')}`;
  s += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF\n`;
  return Buffer.from(s, 'latin1');
}

test('#8 docx — bảng giữ hàng/cột, ô gộp dọc được lặp', async () => {
  const md = await convertDocumentToMarkdown(await makeDocx(out('spec.docx')));
  assert.match(md, /\| Trường \| Ràng buộc \| Thông báo lỗi \|/);
  assert.match(md, /\| Email \| Bắt buộc \| MSG01: Vui lòng nhập email \|/);
  assert.match(md, /\| Email \| Đúng định dạng \| MSG02: Email không hợp lệ \|/);
});

test('#8 docx — tracked change không bị chấp nhận âm thầm: đánh dấu trong bài + liệt kê cả hai bản', async () => {
  const md = await convertDocumentToMarkdown(await makeDocx(out('spec2.docx')));
  assert.match(md, /\{--3--\}\{\+\+5\+\+\}/);
  const ann = md.slice(md.indexOf('## Annotations / Pending changes'));
  assert.ok(md.indexOf('## Annotations / Pending changes') > 0);
  assert.match(ann, /Tracked change/);
  assert.match(ann, /Bản TRƯỚC: "Số lần sai tối đa: 3 lần"/);
  assert.match(ann, /Bản SAU nếu chấp nhận: "Số lần sai tối đa: 5 lần"/);
});

test('#8 docx — comment và header (DRAFT) vào Annotations; ảnh thành placeholder, không base64', async () => {
  const md = await convertDocumentToMarkdown(await makeDocx(out('spec3.docx')));
  const ann = md.slice(md.indexOf('## Annotations / Pending changes'));
  assert.match(ann, /Comment · PO/);
  assert.match(ann, /chưa chốt, có thể đổi thành 10/);
  assert.match(ann, /Header .*Phiên bản v2\.3 - DRAFT/);
  assert.match(md, /\[IMAGE: Wireframe login\]/);
  assert.doesNotMatch(md, /base64|data:image/);
});

test('metadata nguồn ở đầu: tên file, sha256, title, version, last_modified', async () => {
  const file = await makeDocx(out('spec4.docx'));
  const md = await convertDocumentToMarkdown(file);
  const meta = parseSourceMetadata(md);
  assert.strictEqual(meta.source_file, 'spec4.docx');
  assert.match(meta.sha256, /^[0-9a-f]{64}$/);
  assert.strictEqual(meta.title, 'Đặc tả Đăng nhập');
  assert.match(meta.version, /^2\.3/);
  assert.strictEqual(meta.last_modified, '2026-10-30T08:00:00Z');
  assert.ok(md.startsWith('<!-- SOURCE_METADATA'));
  assert.ok(!stripMetadata(md).includes('sha256'));
});

test('#9 excel — bỏ dòng tiêu đề gộp ô, header thật; sheet ẩn có nhãn; giá trị định dạng; comment ô', async () => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([['BẢNG QUY TẮC (v3)'], [], ['Hạng', 'Ngưỡng', 'Giảm'], ['Vàng', 1000000, 0.1], ['', 2000000, 0.15]]);
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } }];
  ws.C4.z = '0%';
  ws.C5.z = '0%';
  ws.B4.c = [{ a: 'PO', t: 'Ngưỡng này chưa chốt' }];
  XLSX.utils.book_append_sheet(wb, ws, 'Rules');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Cũ', 'Ngưỡng cũ'], ['Vàng', 800000]]), 'Old');
  wb.Workbook = { Sheets: [{ Hidden: 0 }, { Hidden: 1 }] };
  const file = out('rules.xlsx');
  XLSX.writeFile(wb, file);

  const md = await convertDocumentToMarkdown(file);
  assert.match(md, /\| Hạng \| Ngưỡng \| Giảm \|\n\| --- \| --- \| --- \|/);
  assert.doesNotMatch(md, /\| BẢNG QUY TẮC/);
  assert.match(md, /\| Vàng \| 1000000 \| 10% \|/);
  assert.match(md, /\| Vàng \| 2000000 \| 15% \|/);
  assert.match(md, /## Sheet: Old \(HIDDEN SHEET\)/);
  const ann = md.slice(md.indexOf('## Annotations / Pending changes'));
  assert.match(ann, /Cell comment · PO .*Rules!B4.*Ngưỡng này chưa chốt/);
});

test('#7 csv — UTF-8 không BOM đọc đúng tiếng Việt, giữ giá trị nguyên văn', async () => {
  const file = out('nobom.csv');
  fs.writeFileSync(file, 'Trường,Mã\nTên đăng nhập,001\n', 'utf8');
  const md = await convertDocumentToMarkdown(file);
  assert.match(md, /\| Trường \| Mã \|/);
  assert.match(md, /\| Tên đăng nhập \| 001 \|/);
});

test('#10 pdf — cảnh báo theo từng trang có ít chữ', async () => {
  const file = out('scan.pdf');
  fs.writeFileSync(file, makePdf(['Trang mot co rat nhieu chu de doc duoc binh thuong o day', '']));
  const md = await convertDocumentToMarkdown(file);
  assert.match(md, /page 2 có thể là ảnh scan/);
  assert.doesNotMatch(md, /page 1 có thể là ảnh scan/);
});

test('#5/#6 fileKind — ảnh là asset, .ppt/.doc bị từ chối, .zip không hỗ trợ', () => {
  assert.strictEqual(fileKind('a.PNG').kind, 'asset');
  assert.strictEqual(fileKind('a.fig').kind, 'asset');
  assert.strictEqual(fileKind('a.ppt').kind, 'reject');
  assert.match(fileKind('a.ppt').reason, /pptx/);
  assert.strictEqual(fileKind('a.doc').kind, 'reject');
  assert.strictEqual(fileKind('a.zip').kind, 'unsupported');
  assert.strictEqual(fileKind('a.docx').kind, 'convert');
});

test('#5 không đọc mò file nhị phân không hỗ trợ', async () => {
  const file = out('a.zip');
  fs.writeFileSync(file, 'PK\u0003\u0004');
  await assert.rejects(convertDocumentToMarkdown(file), /không được hỗ trợ/);
});

test('htmlToMarkdown — colspan đánh dấu gộp, rowspan lặp; danh sách và heading', () => {
  const md = htmlToMarkdown('<h2>Mục</h2><ol><li>Một</li><li>Hai</li></ol><table><tr><th>A</th><th>B</th></tr><tr><td rowspan="2">x</td><td>1</td></tr><tr><td>2</td></tr><tr><td colspan="2">ghi chú</td></tr></table>');
  assert.match(md, /^## Mục/m);
  assert.match(md, /^1\. Một$/m);
  assert.match(md, /^2\. Hai$/m);
  assert.match(md, /\| x \| 2 \|/);
  assert.match(md, /\| ghi chú \| \(gộp ←\) \|/);
});

test('markdown nguồn — ảnh base64 thành placeholder', () => {
  const md = cleanMarkdown('Trước ![sơ đồ](data:image/png;base64,AAAA) sau');
  assert.strictEqual(md, 'Trước [IMAGE: sơ đồ] sau');
});

// ───── Follow-up: metadata trích từ thân tài liệu (.md/.txt, docx thiếu core date) ─────

test('metadata .md — title/version/date/status trích từ thân, ngày chuẩn hoá YYYY-MM-DD, có nhãn', async () => {
  const file = out('srs.md');
  fs.writeFileSync(file, '# Đặc tả Đổi mật khẩu\n\n**Phiên bản:** v1.2\nNgày cập nhật: 28/10/2026\nTrạng thái: Draft\n\nNội dung.\n');
  const meta = parseSourceMetadata(await convertDocumentToMarkdown(file));
  assert.strictEqual(meta.title, 'Đặc tả Đổi mật khẩu (trích từ thân tài liệu)');
  assert.strictEqual(meta.version, '1.2 (trích từ thân tài liệu)');
  assert.strictEqual(meta.date, '2026-10-28 (trích từ thân tài liệu)');
  assert.strictEqual(meta.status, 'Draft (trích từ thân tài liệu)');
});

test('metadata .txt — dạng bảng thuộc tính và Date/Version tiếng Anh', async () => {
  const file = out('notes.txt');
  fs.writeFileSync(file, '# Change log\n| Version | 2.0 |\n| Date | 2026-1-5 |\n');
  const meta = parseSourceMetadata(await convertDocumentToMarkdown(file));
  assert.strictEqual(meta.version, '2.0 (trích từ thân tài liệu)');
  assert.strictEqual(meta.date, '2026-01-05 (trích từ thân tài liệu)');
});

test('metadata — chữ thường trong bài ("Status code 200", "ngày sinh") không bị nhận nhầm', async () => {
  const file = out('plain.md');
  fs.writeFileSync(file, '# API\nStatus code 200 khi thành công.\nNgười dùng nhập ngày sinh.\n');
  const meta = parseSourceMetadata(await convertDocumentToMarkdown(file));
  assert.strictEqual(meta.status, undefined);
  assert.strictEqual(meta.date, undefined);
});

test('metadata docx — core.xml không có ngày thì lấy "Ngày:" trong thân; core title vẫn thắng', async () => {
  const file = await makeDocx(out('spec5.docx'));
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const doc = await zip.file('word/document.xml').async('string');
  zip.file('word/document.xml', doc.replace('<w:body>', `<w:body>${P('Ngày: 02.11.2026')}`));
  fs.writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer' }));
  const meta = parseSourceMetadata(await convertDocumentToMarkdown(file));
  assert.strictEqual(meta.date, '2026-11-02 (trích từ thân tài liệu)');
  assert.strictEqual(meta.title, 'Đặc tả Đăng nhập');
});

test('metadata xlsx — H1 do converter tự đặt không bị coi là tiêu đề', async () => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['A', 'B'], [1, 2]]), 'S');
  const file = out('t.xlsx');
  XLSX.writeFile(wb, file);
  assert.strictEqual(parseSourceMetadata(await convertDocumentToMarkdown(file)).title, undefined);
});

test('readText — UTF-8 (có/không BOM) và UTF-16 có BOM đọc đúng; byte rác thì từ chối, không đọc bừa', (t) => {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  const { readText } = require('../lib/doc-converter');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-enc-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const w = (n, buf) => { const p = path.join(dir, n); fs.writeFileSync(p, buf); return p; };

  const vi = 'Mật khẩu dài 8–64 ký tự';
  assert.strictEqual(readText(w('a.txt', vi)), vi);
  assert.strictEqual(readText(w('b.txt', Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(vi)]))), vi);
  assert.strictEqual(readText(w('c.txt', Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(vi, 'utf16le')]))), vi);
  // Windows-1258 / byte không phải UTF-8: không được giải mã thành chữ rác.
  assert.throws(() => readText(w('d.txt', Buffer.from([0x4d, 0x61, 0xe2, 0x74, 0x20, 0x6b, 0x68, 0xe2, 0x75]))), /không đọc được bằng UTF-8/);
});

test('định dạng có nghĩa: chữ gạch ngang, chỉ số trên/dưới, bảng — không bị đọc như giá trị đang hiệu lực', () => {
  const { htmlToMarkdown } = require('../lib/doc-converter');
  const md = htmlToMarkdown('<p>Hạn mức <s>500.000</s> 300.000 VNĐ; dung lượng 10<sup>6</sup> byte; H<sub>2</sub>O</p>');
  assert.match(md, /\{--500\.000--\} 300\.000 VNĐ/);
  assert.match(md, /10\^\(6\) byte/);
  assert.match(md, /H_\(2\)O/);
  const tbl = htmlToMarkdown('<table><tr><th>Ngưỡng</th></tr><tr><td><del>800000</del> 500000</td></tr></table>');
  assert.match(tbl, /\{--800000--\} 500000/);
});

test('docx: chữ ẩn (w:vanish) được tách ra, chữ thường và w:val="0" thì không', () => {
  const { docxHiddenText } = require('../lib/doc-converter');
  const xml = '<w:p><w:r><w:t>Hiện</w:t></w:r><w:r><w:rPr><w:vanish/></w:rPr><w:t>Khoá 99 phút</w:t></w:r>'
    + '<w:r><w:rPr><w:vanish w:val="0"/></w:rPr><w:t>Không ẩn</w:t></w:r></w:p>';
  assert.deepStrictEqual(docxHiddenText(xml), ['Khoá 99 phút']);
});

test('xlsx: dòng/cột ẩn được báo trong Annotations', async (t) => {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  const XLSX = require('xlsx');
  const { convertDocumentToMarkdown } = require('../lib/doc-converter');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-xlsx-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const ws = XLSX.utils.aoa_to_sheet([['Tên', 'Ngưỡng'], ['A', '500000'], ['B', '800000']]);
  ws['!rows'] = [{}, {}, { hidden: true }];
  ws['!cols'] = [{}, { hidden: true }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rules');
  const p = path.join(dir, 'r.xlsx');
  XLSX.writeFile(wb, p);
  const md = await convertDocumentToMarkdown(p);
  assert.match(md, /Dòng\/cột ẩn/);
  assert.match(md, /dòng 3/);
  assert.match(md, /cột B/);
});

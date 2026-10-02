/**
 * Tests for input document classification.
 *
 * The riskiest spot in the system: filing a PRD into the wrong bin makes gate 0
 * report "02_ba is missing" while the document sits right there, leaving the user
 * stuck with no explanation. Every case below is a bug that actually happened.
 */

const test = require('node:test');
const assert = require('node:assert');
const { classifyDocument, slugify, pickSlug } = require('../intake/intake');

test('02_ba — a PRD with an `email` field must NOT land in 05_communication', () => {
  // Real bug: the old rule matched the word `email` for 05_communication, but
  // `email` appears in almost every login PRD as a data FIELD NAME.
  const content = `# PRD Đăng nhập
Người dùng đăng nhập bằng email và mật khẩu.
Acceptance Criteria: sai 5 lần thì khoá 15 phút.`;
  assert.strictEqual(classifyDocument(content, 'PRD_Dang_nhap.md'), '02_ba');
});

test('02_ba — recognises an unaccented Vietnamese spec', () => {
  const content = '# Dac ta chuc nang gio hang\nLuong nghiep vu: them san pham.';
  assert.strictEqual(classifyDocument(content, 'dac-ta-gio-hang.md'), '02_ba');
});

test('02_ba — is the default bin when nothing else matches', () => {
  assert.strictEqual(classifyDocument('Generic content.', 'ghi-chu.md'), '02_ba');
});

test('03_dev — `DB schema` (not `database schema`) still lands correctly', () => {
  // Real bug: the old rule required the exact string `database schema`, so
  // `DB schema` fell through to the default 02_ba bin and polluted it.
  const content = '# API Spec\nResponse 200 OK, DB schema bảng users.';
  assert.strictEqual(classifyDocument(content, 'spec.md'), '03_dev');
});

test('03_dev — recognises an API path such as `POST /api/login`', () => {
  assert.strictEqual(classifyDocument('POST /api/login\nTrả về token.', 'tai-lieu.md'), '03_dev');
});

test('03_dev — recognises the filename `technical_spec`', () => {
  assert.strictEqual(classifyDocument('Technical content.', 'technical_spec.md'), '03_dev');
});

test('01_business — recognises it by FILENAME when the body is short on keywords', () => {
  // Strategy documents are usually brief; the filename is the stronger signal.
  const content = '# Chính sách Q4\nMục tiêu doanh thu tăng 20%.';
  assert.strictEqual(classifyDocument(content, 'Chinh_sach_kinh_doanh_Q4.md'), '01_business');
});

test('05_communication — meeting minutes still classify after dropping `email`', () => {
  const content = '# Biên bản họp 2026-10-02\nBA xác nhận: khoá 15 phút.';
  assert.strictEqual(classifyDocument(content, 'bien-ban.md'), '05_communication');
});

test('04_design — recognises a Figma link', () => {
  assert.strictEqual(classifyDocument('Link Figma: figma.com/file/abc', 'design.md'), '04_design');
});

test('slugify — strips Vietnamese diacritics and whitespace', () => {
  assert.strictEqual(slugify('PRD Giỏ Hàng Số Lượng'), 'prd-gio-hang-so-luong');
});

test('pickSlug — names the task after the BA document, not the strategy document', () => {
  // A business document spans a whole quarter, so naming after it overstates scope.
  const files = ['/x/Chinh sach Q4.md', '/x/PRD Gio hang.md', '/x/notes.md'];
  assert.strictEqual(pickSlug(files), 'prd-gio-hang');
});

test('pickSlug — falls back to the first file when no BA document exists', () => {
  assert.strictEqual(pickSlug(['/x/ghi chu.md', '/x/khac.md']), 'ghi-chu');
});

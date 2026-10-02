/**
 * Test phân loại tài liệu đầu vào.
 *
 * Đây là chỗ nguy hiểm nhất hệ thống: xếp nhầm một PRD sang ngăn khác sẽ làm
 * Cổng 0 báo "thiếu 02_ba" trong khi tài liệu đang nằm ngay đó — người dùng bế
 * tắc hoàn toàn mà không hiểu vì sao. Mọi ca dưới đây là lỗi đã xảy ra thật.
 */

const test = require('node:test');
const assert = require('node:assert');
const { classifyDocument, slugify, pickSlug } = require('../intake/intake');

test('02_ba — PRD có trường `email` KHÔNG được rơi vào 05_communication', () => {
  // Lỗi thật: luật cũ khớp chữ `email` để nhận 05_communication, mà `email`
  // xuất hiện trong gần như mọi PRD đăng nhập dưới dạng TÊN TRƯỜNG dữ liệu.
  const content = `# PRD Đăng nhập
Người dùng đăng nhập bằng email và mật khẩu.
Acceptance Criteria: sai 5 lần thì khoá 15 phút.`;
  assert.strictEqual(classifyDocument(content, 'PRD_Dang_nhap.md'), '02_ba');
});

test('02_ba — nhận ra đặc tả tiếng Việt không dấu', () => {
  const content = '# Dac ta chuc nang gio hang\nLuong nghiep vu: them san pham.';
  assert.strictEqual(classifyDocument(content, 'dac-ta-gio-hang.md'), '02_ba');
});

test('02_ba — là ngăn mặc định khi không có dấu hiệu nào', () => {
  assert.strictEqual(classifyDocument('Nội dung chung chung.', 'ghi-chu.md'), '02_ba');
});

test('03_dev — `DB schema` (không phải `database schema`) vẫn vào đúng ngăn', () => {
  // Lỗi thật: luật cũ đòi đúng chuỗi `database schema` nên trượt `DB schema`,
  // tài liệu kỹ thuật rơi về ngăn mặc định 02_ba và làm bẩn ngăn bắt buộc.
  const content = '# API Spec\nResponse 200 OK, DB schema bảng users.';
  assert.strictEqual(classifyDocument(content, 'spec.md'), '03_dev');
});

test('03_dev — nhận ra đường dẫn API dạng `POST /api/login`', () => {
  assert.strictEqual(classifyDocument('POST /api/login\nTrả về token.', 'tai-lieu.md'), '03_dev');
});

test('03_dev — nhận ra qua tên file `technical_spec`', () => {
  assert.strictEqual(classifyDocument('Nội dung kỹ thuật.', 'technical_spec.md'), '03_dev');
});

test('01_business — nhận ra qua TÊN FILE khi nội dung ngắn, ít từ khoá', () => {
  // Tài liệu định hướng thường rất ngắn; tên file mới là dấu hiệu rõ nhất.
  const content = '# Chính sách Q4\nMục tiêu doanh thu tăng 20%.';
  assert.strictEqual(classifyDocument(content, 'Chinh_sach_kinh_doanh_Q4.md'), '01_business');
});

test('05_communication — biên bản họp vẫn nhận đúng sau khi bỏ từ khoá `email`', () => {
  const content = '# Biên bản họp 2026-10-02\nBA xác nhận: khoá 15 phút.';
  assert.strictEqual(classifyDocument(content, 'bien-ban.md'), '05_communication');
});

test('04_design — nhận ra link Figma', () => {
  assert.strictEqual(classifyDocument('Link Figma: figma.com/file/abc', 'design.md'), '04_design');
});

test('slugify — bỏ dấu tiếng Việt và khoảng trắng', () => {
  assert.strictEqual(slugify('PRD Giỏ Hàng Số Lượng'), 'prd-gio-hang-so-luong');
});

test('pickSlug — đặt tên task theo tài liệu BA, không theo tài liệu định hướng', () => {
  // Tài liệu kinh doanh thường nói về cả quý nên đặt tên theo nó sẽ sai phạm vi.
  const files = ['/x/Chinh sach Q4.md', '/x/PRD Gio hang.md', '/x/notes.md'];
  assert.strictEqual(pickSlug(files), 'prd-gio-hang');
});

test('pickSlug — không có tài liệu BA thì lấy file đầu tiên', () => {
  assert.strictEqual(pickSlug(['/x/ghi chu.md', '/x/khac.md']), 'ghi-chu');
});

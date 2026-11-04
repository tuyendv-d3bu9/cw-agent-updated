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
  assert.strictEqual(pickSlug(files), 'gio-hang');
});

test('pickSlug — SRS thắng file API có chữ "spec" (không đặt tên task theo tài liệu dev)', () => {
  const files = ['/x/API_Ma_loi_hoan_tien.xlsx', '/x/API_Refund_Request_spec.md', '/x/BRD_Hoan_tien_2026-10-01.md', '/x/SRS_Hoan_tien_v2.docx'];
  assert.strictEqual(pickSlug(files), 'hoan-tien');
  assert.strictEqual(pickSlug(['/x/API_spec.md', '/x/Spec Gio hang.md']), 'gio-hang');
});

test('pickSlug — falls back to the first file when no BA document exists', () => {
  assert.strictEqual(pickSlug(['/x/ghi chu.md', '/x/khac.md']), 'ghi-chu');
});

// ───────────────────── Chống đẻ task trùng ─────────────────────
//
// Chuyện có thật: cùng đặc tả "Function D: Áp dụng Mã Giảm Giá (Voucher)" của
// ShopGo được nhận vào hai lần dưới hai tên file khác nhau, đẻ ra hai task
// `function-d-voucher` và `spec-function-d` cho đúng một tính năng. Tên task lấy
// từ tên file, nên BA gửi lại spec với tên khác là OUTPUT/ phình thêm một thư
// mục ma. Các ca dưới đây khoá đường đó lại.

const fs = require('fs');
const path = require('path');
const { useTempProject, write, PATHS } = require('./helpers');
const {
  docTitle,
  normalizeTitle,
  docFingerprint,
  findDuplicate,
  duplicateNotice,
} = require('../intake/intake');

const SPEC_D = '# **Function D: Áp dụng Mã Giảm Giá (Voucher)**\n\nMức hoá đơn tối thiểu 200k.\n';

/** Đặt sẵn một tài liệu đã được nhận vào task `slug`. */
function ingested(slug, file, content) {
  write(path.join('INPUT', slug, '02_ba', file), content);
}

test('docTitle — lấy đúng H1 đầu tiên làm tên tính năng', () => {
  assert.strictEqual(docTitle(SPEC_D), '**Function D: Áp dụng Mã Giảm Giá (Voucher)**');
  assert.strictEqual(docTitle('không có heading nào'), '');
});

test('normalizeTitle — bỏ dấu và ký hiệu markdown để so được với nhau', () => {
  assert.strictEqual(
    normalizeTitle('# **Function D: Áp dụng Mã Giảm Giá (Voucher)**'),
    normalizeTitle('Function D  Ap dung Ma Giam Gia Voucher')
  );
});

test('docFingerprint — khác khoảng trắng và hoa thường vẫn là một tài liệu', () => {
  assert.strictEqual(docFingerprint('# A\n\nxin  chào'), docFingerprint('# a\nXIN chào'));
});

test('docFingerprint — nội dung khác thì vân tay khác', () => {
  assert.notStrictEqual(docFingerprint('# A\nmột'), docFingerprint('# A\nhai'));
});

test('bắt được tài liệu y hệt đã nhận vào task khác', () => {
  const t = useTempProject();
  try {
    ingested('function-d-voucher', 'spec_function_d.md', SPEC_D);
    const dup = findDuplicate(SPEC_D, 'spec-function-d');
    assert.ok(dup, 'tài liệu trùng khít mà không bị bắt');
    assert.strictEqual(dup.kind, 'same-document');
    assert.strictEqual(dup.slug, 'function-d-voucher');
  } finally {
    t.cleanup();
  }
});

test('bắt được cùng tính năng dù nội dung đã sửa đổi', () => {
  const t = useTempProject();
  try {
    ingested('function-d-voucher', 'spec_function_d.md', SPEC_D);
    // Bản BA gửi lại: cùng tiêu đề, thêm một luật mới.
    const revised = SPEC_D + '\nBổ sung: mã HETHAN bị từ chối.\n';
    const dup = findDuplicate(revised, 'spec-function-d');
    assert.ok(dup, 'cùng tên tính năng mà vẫn lọt');
    assert.strictEqual(dup.kind, 'same-feature');
    assert.strictEqual(dup.slug, 'function-d-voucher');
  } finally {
    t.cleanup();
  }
});

test('nhận lại vào CHÍNH task đó là cập nhật, không phải trùng', () => {
  const t = useTempProject();
  try {
    ingested('function-d-voucher', 'spec_function_d.md', SPEC_D);
    assert.strictEqual(findDuplicate(SPEC_D, 'function-d-voucher'), null);
  } finally {
    t.cleanup();
  }
});

test('tính năng khác thì không bị chặn oan', () => {
  const t = useTempProject();
  try {
    ingested('function-d-voucher', 'spec_function_d.md', SPEC_D);
    const other = '# **Function A: Đăng nhập & Phân quyền**\n\nTài khoản VIP.\n';
    assert.strictEqual(findDuplicate(other, 'function-a'), null);
  } finally {
    t.cleanup();
  }
});

test('INPUT rỗng thì không có gì để trùng', () => {
  const t = useTempProject();
  try {
    fs.mkdirSync(PATHS.INPUT, { recursive: true });
    assert.strictEqual(findDuplicate(SPEC_D, 'bat-ky'), null);
  } finally {
    t.cleanup();
  }
});

test('tài liệu không có H1 thì chỉ so vân tay, không so tiêu đề rỗng', () => {
  const t = useTempProject();
  try {
    ingested('task-mot', 'ghi-chu.md', 'không heading, nội dung A');
    // Khác nội dung, cả hai cùng không có H1 — tiêu đề rỗng KHÔNG được coi là trùng.
    assert.strictEqual(findDuplicate('không heading, nội dung B', 'task-hai'), null);
  } finally {
    t.cleanup();
  }
});

test('thông điệp dừng nêu đủ: trùng ở đâu, task nào, và hai lối đi', () => {
  const notice = duplicateNotice(
    { kind: 'same-feature', slug: 'function-d-voucher', file: 'INPUT/function-d-voucher/02_ba/spec_function_d.md' },
    'spec-function-d',
    'spec-function-d.md'
  );
  assert.match(notice, /DỪNG/);
  assert.match(notice, /function-d-voucher/);
  assert.match(notice, /spec-function-d/);
  assert.match(notice, /--into function-d-voucher/);
  assert.match(notice, /--force/);
});

// ───────────────────── Audit 2026-11-04 (G2 #4, #5, #6, #11, #1) ─────────────────────

const {
  classifyDetailed, processFile, newReport, scaffoldTask,
} = require('../intake/intake');

test('#11 — spec có chữ "wireframe" vẫn vào 02_ba (tên file + tiêu đề thắng nội dung)', () => {
  const content = '# Đặc tả chức năng Đăng nhập\nMàn hình wireframe: xem Figma.\nMật khẩu tối thiểu 8 ký tự.';
  assert.strictEqual(classifyDocument(content, 'Dac_ta_dang_nhap.docx'), '02_ba');
});

test('#11 — CR có chữ "đặc tả" vào 05_communication (tên file CR-12)', () => {
  const content = '# Thay đổi ngưỡng khoá\nCập nhật đặc tả use case đăng nhập: 5 lần thay vì 3.';
  assert.strictEqual(classifyDocument(content, 'CR-12_doi_nguong.md'), '05_communication');
});

test('#11 — CR nhận ra qua tiêu đề "Change Request" dù nội dung toàn chữ đặc tả', () => {
  const content = '# Change Request: đổi ngưỡng khoá\nĐặc tả mới: acceptance criteria thay đổi, use case UC-01.';
  assert.strictEqual(classifyDocument(content, 'thay-doi.md'), '05_communication');
});

test('#11 — CR chỉ nhận ra qua nội dung vẫn thắng chữ chung chung "đặc tả"', () => {
  const content = 'Nội dung: yêu cầu thay đổi đặc tả use case X.';
  assert.strictEqual(classifyDocument(content, 'ghi-chu.md'), '05_communication');
});

test('#11 — "revision" không còn khớp "vision" → không rơi vào 01_business', () => {
  const r = classifyDetailed('Revision history\nRevision 2: cập nhật nhỏ.', 'notes.md');
  assert.notStrictEqual(r.bin, '01_business');
  assert.strictEqual(r.unsure, true);
});

test('#11 — chữ Việt dạng tổ hợp (NFD) vẫn khớp như dạng dựng sẵn', () => {
  const nfd = '# Biên bản họp 2026-10-02\nBA xác nhận khoá 15 phút.'.normalize('NFD');
  assert.strictEqual(classifyDocument(nfd, 'tai-lieu.md'), '05_communication');
});

test('#11 — hoà điểm / không tín hiệu bị đánh dấu chưa chắc', () => {
  assert.strictEqual(classifyDetailed('Generic content.', 'ghi-chu.md').unsure, true);
  const tie = classifyDetailed('figma và đặc tả', 'x.md');
  assert.strictEqual(tie.unsure, true);
});

test('#4 — chuyển đổi lỗi thì KHÔNG xoá file gốc, processFile trả false và ghi vào failed', async () => {
  const t = useTempProject();
  try {
    const src = write('INPUT/hong.docx', 'không phải zip');
    const report = newReport();
    const ok = await processFile(src, 'task-a', report, { consume: true });
    assert.strictEqual(ok, false);
    assert.ok(fs.existsSync(src), 'file gốc bị xoá dù chuyển đổi lỗi');
    assert.strictEqual(report.failed.length, 1);
  } finally {
    t.cleanup();
  }
});

test('#4 — thành công thì trả true, ghi .md và chỉ khi đó mới xoá bản rời', async () => {
  const t = useTempProject();
  try {
    const src = write('INPUT/PRD Dang nhap.md', '# PRD Đăng nhập\nAcceptance criteria: sai 5 lần.');
    const report = newReport();
    assert.strictEqual(await processFile(src, 'dang-nhap', report, { consume: true }), true);
    assert.ok(!fs.existsSync(src));
    const dest = path.join(PATHS.INPUT, 'dang-nhap', '02_ba', 'prd-dang-nhap.md');
    assert.match(fs.readFileSync(dest, 'utf8'), /source_file: PRD Dang nhap\.md/);
  } finally {
    t.cleanup();
  }
});

test('#5 — file không hỗ trợ (.zip) giữ nguyên chỗ, không đọc mò thành chữ', async () => {
  const t = useTempProject();
  try {
    const src = write('INPUT/goi.zip', 'PK\u0003\u0004rác');
    const report = newReport();
    assert.strictEqual(await processFile(src, 'task-a', report, { consume: true }), false);
    assert.ok(fs.existsSync(src));
    assert.ok(!fs.existsSync(path.join(PATHS.INPUT, 'task-a', '02_ba', 'goi.md')));
  } finally {
    t.cleanup();
  }
});

test('#5 — ảnh được chuyển nguyên vẹn vào 04_design/_assets/ kèm file .md trỏ tới', async () => {
  const t = useTempProject();
  try {
    const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
    const src = path.join(PATHS.INPUT, 'wireframe login.png');
    fs.writeFileSync(src, png);
    const report = newReport();
    assert.strictEqual(await processFile(src, 'task-a', report, { consume: true }), true);
    const dest = path.join(PATHS.INPUT, 'task-a', '04_design', '_assets', 'wireframe login.png');
    assert.deepStrictEqual(fs.readFileSync(dest), png);
    assert.ok(!fs.existsSync(src));
    const idx = fs.readFileSync(path.join(PATHS.INPUT, 'task-a', '04_design', 'design-assets.md'), 'utf8');
    assert.match(idx, /wireframe login\.png/);
    assert.ok(!fs.existsSync(path.join(PATHS.INPUT, 'task-a', '02_ba', 'wireframe-login.md')));
  } finally {
    t.cleanup();
  }
});

test('#6 — .ppt bị từ chối kèm hướng dẫn "Save As .pptx", file gốc còn nguyên', async () => {
  const t = useTempProject();
  try {
    const src = write('INPUT/slide.ppt', 'binary');
    const report = newReport();
    assert.strictEqual(await processFile(src, 'task-a', report, { consume: true }), false);
    assert.ok(fs.existsSync(src));
    assert.match(report.failed[0].reason, /pptx/);
  } finally {
    t.cleanup();
  }
});

test('#1 — knowledge mới tạo từ template: thay <feature-slug>, không thêm dữ liệu mẫu', () => {
  const t = useTempProject();
  try {
    write('knowledge/_template.md', '# <Tên Tính Năng>\nFeature slug: `<feature-slug>` · Nguồn: `INPUT/<feature-slug>/`\n| ID |\n|---|\n');
    scaffoldTask('dang-nhap');
    const k = fs.readFileSync(path.join(PATHS.FEATURES, 'dang-nhap.md'), 'utf8');
    assert.match(k, /Feature slug: `dang-nhap` · Nguồn: `INPUT\/dang-nhap\/`/);
    assert.ok(!k.includes('<feature-slug>'));
    assert.strictEqual(k.split('\n').length, 5);
  } finally {
    t.cleanup();
  }
});

test('vân tay bỏ qua khối metadata — cùng nội dung khác tên file vẫn là trùng', () => {
  const a = '<!-- SOURCE_METADATA\nsource_file: a.docx\nsha256: 1\n-->\n\n# X\nnội dung';
  const b = '<!-- SOURCE_METADATA\nsource_file: b.docx\nsha256: 2\n-->\n\n# X\nnội dung';
  assert.strictEqual(docFingerprint(a), docFingerprint(b));
});

// ───── Follow-up: slug theo tính năng, không theo bản tài liệu ─────

const { featureSlug } = require('../intake/intake');

test('featureSlug — bỏ loại tài liệu, version, ngày: v1 và v2 cùng một task', () => {
  assert.strictEqual(featureSlug('SRS_Doi_mat_khau_v1'), 'doi-mat-khau');
  assert.strictEqual(featureSlug('SRS Đổi mật khẩu v2 (2026-10-28)'), 'doi-mat-khau');
  assert.strictEqual(featureSlug('PRD_Gio_hang_v1.2_final'), 'gio-hang');
  assert.strictEqual(featureSlug('URD-thanh-toan-rev3-20261028'), 'thanh-toan');
  assert.strictEqual(featureSlug('Tai lieu voucher 28-10-2026 draft'), 'voucher');
  assert.strictEqual(featureSlug('Đặc tả Đăng nhập ver2 - bản nháp'), 'dang-nhap');
  assert.strictEqual(featureSlug('BRD spec Thanh toán v3'), 'thanh-toan');
});

test('featureSlug — không làm rơi chữ của tên tính năng ("đăng nhập" giữ "nhap")', () => {
  assert.strictEqual(featureSlug('Dang nhap'), 'dang-nhap');
});

test('featureSlug — không bao giờ rỗng và xác định', () => {
  assert.strictEqual(featureSlug('SRS v1'), 'srs-v1');
  assert.strictEqual(featureSlug('2026-10-28'), '2026-10-28');
  assert.strictEqual(featureSlug('PRD Gio hang'), featureSlug('PRD Gio hang'));
});

test('pickSlug — hai bản v1/v2 của cùng đặc tả ra cùng slug', () => {
  assert.strictEqual(pickSlug(['/x/SRS_Doi_mat_khau_v2.docx']), pickSlug(['/x/SRS Doi mat khau v1 2026-10-01.docx']));
});

test('featureSlug — tên không có ký tự Latin vẫn ra slug riêng, xác định', () => {
  const { featureSlug } = require('../intake/intake');
  const a = featureSlug('需求文档');
  assert.match(a, /^task-[0-9a-f]{6}$/);
  assert.strictEqual(a, featureSlug('需求文档'));
  assert.notStrictEqual(a, featureSlug('规格说明'));
});

test('bulk-intake — `--dry-run <path>` không nuốt đường dẫn', () => {
  const fs = require('fs');
  const src = fs.readFileSync(require('path').join(__dirname, '../intake/bulk-intake.js'), 'utf-8');
  assert.match(src, /VALUE_FLAGS = new Set\(\['--slug', '--into', '--concurrency', '--chunk'\]\)/);
  assert.doesNotMatch(src, /!args\[idx - 1\]\.startsWith\('--'\)/);
});

test('ingestedDocs — thư mục kho trong INPUT (vd RAWS/de-bai) không bị coi là task đã nạp', (t) => {
  const { useTempProject, write } = require('./helpers');
  const { ingestedDocs } = require('../intake/intake');
  const p = useTempProject();
  t.after(p.cleanup);
  write('INPUT/RAWS/de-bai/BRD.md', '# BRD hoàn tiền\n\nNội dung.');
  write('INPUT/hoan-tien/02_ba/srs.md', '# SRS hoàn tiền\n\nNội dung.');
  const docs = ingestedDocs();
  assert.deepStrictEqual(docs.map((d) => d.slug), ['hoan-tien']);
});

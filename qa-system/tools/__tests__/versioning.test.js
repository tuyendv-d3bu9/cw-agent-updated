const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');
const { useTempProject, write } = require('./helpers');
const V = require('../intake/versioning');
const { featureSlug } = require('../intake/intake');

const meta = (fields) =>
  `<!-- SOURCE_METADATA\n${Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('\n')}\n-->\n# Đổi mật khẩu\n\nNội dung.\n`;

test('docKey — cùng tài liệu khác version/ngày ra cùng khoá; khác loại tài liệu thì khác khoá', () => {
  assert.strictEqual(V.docKey('srs-doi-mat-khau-v1'), V.docKey('srs-doi-mat-khau-v2-2026-10-28'));
  assert.notStrictEqual(V.docKey('srs-doi-mat-khau-v1'), V.docKey('cr-doi-mat-khau-v1'));
});

test('featureSlug — dùng chung phần bỏ version/ngày với versioning', () => {
  assert.strictEqual(featureSlug('SRS_Doi_mat_khau_v1'), featureSlug('SRS Đổi mật khẩu v2 (2026-10-28)'));
});

test('compareDocs — version thắng ngày (ngày là ngày lưu file); thiếu version thì dùng ngày; không đủ thông tin ⇒ 0', () => {
  // v2 lưu sớm hơn v1 được mở lại lưu muộn: vẫn là v2 mới hơn.
  assert.strictEqual(V.compareDocs({ date: '2026-10-28', version: '1' }, { date: '2026-09-01', version: '2' }), -1);
  assert.strictEqual(V.compareDocs({ date: '2026-10-28', version: null }, { date: '2026-09-01', version: '2' }), 1);
  assert.strictEqual(V.compareDocs({ date: '2026-10-01', version: '2' }, { date: '2026-10-28', version: '2' }), -1);
  assert.strictEqual(V.compareDocs({ date: null, version: '1.5' }, { date: null, version: '2' }), -1);
  assert.strictEqual(V.compareDocs({ date: null, version: '1.10' }, { date: null, version: '1.9' }), 1);
  assert.strictEqual(V.compareDocs({ date: null, version: null }, { date: null, version: '2' }), 0);
});

test('taskHasDocs — bỏ qua README, design-assets, _superseded', (t) => {
  const p = useTempProject();
  t.after(p.cleanup);
  assert.strictEqual(V.taskHasDocs('x'), false);
  write('INPUT/x/02_ba/README.md', '# hướng dẫn');
  write('INPUT/x/04_design/design-assets.md', '# assets');
  write('INPUT/x/02_ba/_superseded/old.md', '# cũ');
  assert.strictEqual(V.taskHasDocs('x'), false);
  write('INPUT/x/02_ba/spec.md', '# spec');
  assert.strictEqual(V.taskHasDocs('x'), true);
});

test('applySupersede — bản v1 chuyển sang _superseded/ khi v2 vào, có ghi lý do', (t) => {
  const p = useTempProject();
  t.after(p.cleanup);
  const v1 = write('INPUT/x/02_ba/srs-doi-mat-khau-v1.md', meta({ source_file: 'a.docx', version: '1.0' }));
  const v2 = write('INPUT/x/02_ba/srs-doi-mat-khau-v2.md', meta({ source_file: 'b.docx', version: '2.0' }));
  const cr = write('INPUT/x/05_communication/cr-01.md', meta({ source_file: 'c.md' }));

  const r = V.applySupersede([v2]);
  assert.strictEqual(r.superseded.length, 1);
  assert.ok(!fs.existsSync(v1));
  assert.ok(fs.existsSync(v2));
  assert.ok(fs.existsSync(cr), 'tài liệu khác (CR) không bị đụng');
  const idx = fs.readFileSync(path.join(PATHS.INPUT, 'x/02_ba/_superseded/README.md'), 'utf-8');
  assert.match(idx, /srs-doi-mat-khau-v1\.md.*srs-doi-mat-khau-v2\.md/);
  assert.strictEqual(V.taskHasDocs('x'), true);
});

test('applySupersede — tài liệu vừa vào là bản CŨ hơn thì chính nó bị cất', (t) => {
  const p = useTempProject();
  t.after(p.cleanup);
  const v3 = write('INPUT/x/02_ba/spec-v3.md', meta({ source_file: 'a', date: '2026-10-01' }));
  const v2 = write('INPUT/x/02_ba/spec-v2.md', meta({ source_file: 'b', date: '2026-08-01' }));
  const r = V.applySupersede([v2]);
  assert.strictEqual(r.superseded.length, 1);
  assert.ok(fs.existsSync(v3));
  assert.ok(!fs.existsSync(v2));
});

test('applySupersede — không phân định được thì giữ cả hai và báo', (t) => {
  const p = useTempProject();
  t.after(p.cleanup);
  const a = write('INPUT/x/02_ba/spec.md', meta({ source_file: 'a' }));
  const b = write('INPUT/x/02_ba/spec-final.md', meta({ source_file: 'b' }));
  const r = V.applySupersede([a]);
  assert.strictEqual(r.superseded.length, 0);
  assert.strictEqual(r.unclear.length, 1);
  assert.ok(fs.existsSync(a) && fs.existsSync(b));
});

test('version lấy từ tên file khi metadata không có', () => {
  assert.strictEqual(V.versionFromName('srs-doi-mat-khau-v1-2'), '1.2');
  assert.strictEqual(V.versionFromName('spec_rev3'), '3');
  assert.strictEqual(V.versionFromName('dang-nhap'), null);
});

test('confirmNotice — nêu đúng hai lối đi và dặn agent không tự chọn', () => {
  const msg = V.confirmNotice('doi-mat-khau', ['/x/INPUT/SRS v2.docx']);
  assert.match(msg, /--into doi-mat-khau/);
  assert.match(msg, /--slug <tên-tính-năng-khác>/);
  assert.match(msg, /KHÔNG tự chọn/);
});

test('needsConfirmation — Q&A của BA mang thêm chữ vẫn dừng hỏi gộp vào task đã có (không lặng lẽ tạo task mới)', (t) => {
  const p = useTempProject();
  t.after(p.cleanup);
  write('INPUT/hoan-tien/02_ba/srs-hoan-tien-v2.md', '# spec');
  assert.deepStrictEqual(V.relatedTasks('qa-ba-tra-loi-hoan-tien'), ['hoan-tien']);
  const ask = V.needsConfirmation('qa-ba-tra-loi-hoan-tien');
  assert.strictEqual(ask.slug, 'hoan-tien');
  assert.strictEqual(ask.related, true);
  assert.strictEqual(V.needsConfirmation('doi-mat-khau'), null, 'tên không liên quan thì không hỏi');
  assert.match(V.confirmNotice('hoan-tien', ['/x/QA.md'], { proposed: 'qa-ba-tra-loi-hoan-tien' }), /gần với task đã có \[ hoan-tien \]/);
});

test('needsConfirmation — task trùng tên có tài liệu vẫn hỏi như cũ; task chưa có tài liệu không tính', (t) => {
  const p = useTempProject();
  t.after(p.cleanup);
  write('INPUT/hoan-tien/02_ba/README.md', '# hướng dẫn');
  assert.strictEqual(V.needsConfirmation('qa-hoan-tien'), null);
  write('INPUT/hoan-tien/02_ba/srs.md', '# spec');
  assert.deepStrictEqual(V.needsConfirmation('hoan-tien'), { slug: 'hoan-tien', related: false });
});

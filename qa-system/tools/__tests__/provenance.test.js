/**
 * Nguồn gốc giá trị: lint 05 phải bắt chữ thông báo / con số tự chế, nhưng im lặng với giá trị có nguồn
 * và với giá trị biên suy ra từ nguồn (min-1, max+1, giá trị giữa).
 */
const test = require('node:test');
const assert = require('node:assert');
const { useTempProject, write, testCase, spec, head, fullTask, knowledgeDoc, report02 } = require('./helpers');
const { lint } = require('../system/lint-deliverables');
const P = require('../lib/provenance');

const SPEC = [
  'Sai mật khẩu 5 lần thì hệ thống khoá tài khoản 15 phút.',
  'Mật khẩu mới dài từ 8 đến 64 ký tự. Nếu sai hiển thị: Mật khẩu phải từ 8 đến 64 ký tự',
].join('\n');

const Q1 = 'Sai mật khẩu 5 lần thì hệ thống khoá tài khoản 15 phút';
const Q2 = 'Mật khẩu mới dài từ 8 đến 64 ký tự';

function task({ br = `| BR-01 | Nhập sai 5 lần | Khoá 15 phút | 02_ba/spec.md §1 | ${Q1} |`, fd } = {}) {
  fullTask();
  write('OUTPUT/t/02_missing_rule_report.md', report02({ objects: ['BR-01', 'BR-02', 'FD-01'] }));
  write('INPUT/t/02_ba/spec.md', `# Spec\n## 1\n${SPEC}\n`);
  write('OUTPUT/t/01_requirement_risk_summary.md', `${head('Requirement Risk Summary')}
## 3. BUSINESS RULES

| ID | Điều kiện | Hành vi / Kết quả | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|
${br}
| BR-02 | Mật khẩu hợp lệ | Chấp nhận | 02_ba/spec.md §1 | ${Q2} |

## 3b. FIELD & RÀNG BUỘC

| ID | Field | Kiểu | Bắt buộc | Ràng buộc (min/max/định dạng) | Thông báo khi sai | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|---|---|---|
${fd || `| FD-01 | Mật khẩu mới | text | Có | 8–64 ký tự | Mật khẩu phải từ 8 đến 64 ký tự | 02_ba/spec.md §1 | ${Q2} |`}
`);
}

const tags = (n) => `Rule#BR-0${n}, Rule#FD-01, Viewpoint#VP-0${n}, TI#TI-0${n}, Module#TST, Manual`;
const tc = (id, n, over) => testCase(id, { Tags: tags(n), ...over });
const write05 = (a, b) => write('OUTPUT/t/05_test_case_spec.md', spec([a, b || tc('TST-002', 2)]));
const errs = () => lint('t').errors.map((e) => e.msg).join(' | ');
const warns = () => lint('t').warns.map((e) => e.msg).join(' | ');

test('baseline — task có nguồn thật lint sạch', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  task(); write05(tc('TST-001', 1));
  assert.strictEqual(errs(), '');
});

test('Expected trích chữ thông báo CÓ trong nguồn ⇒ sạch', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  task();
  write05(tc('TST-001', 1, { 'Expected Result': '\n  - Hiển thị "Mật khẩu phải từ 8 đến 64 ký tự"' }));
  assert.strictEqual(errs(), '');
});

test('Expected trích chữ thông báo TỰ CHẾ ⇒ lỗi', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  task();
  write05(tc('TST-001', 1, { 'Expected Result': '\n  - Hiển thị "Mã lỗi E-404: Tài khoản đã bị khoá"' }));
  assert.match(errs(), /Expected Result quotes "Mã lỗi E-404/);
});

test('con số có đơn vị mà nguồn không có ⇒ lỗi; số trong nguồn thì qua', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  task();
  write05(tc('TST-001', 1, { 'Expected Result': '\n  - Tài khoản bị khoá 30 phút' }));
  assert.match(errs(), /states 30 with a unit/);
  write05(tc('TST-001', 1, { 'Expected Result': '\n  - Tài khoản bị khoá 15 phút' }));
  assert.strictEqual(errs(), '');
});

test('giá trị biên suy ra từ nguồn (max+1, min-1, giá trị giữa) không bị báo', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  task();
  write05(tc('TST-001', 1, { 'Test Data': '\n  - Mật khẩu: 65 ký tự (max+1)\n  - Mật khẩu: 7 ký tự (min-1)\n  - Mật khẩu: 36 ký tự (giữa)' }));
  assert.strictEqual(errs(), '');
  write05(tc('TST-001', 1, { 'Test Data': '\n  - Mật khẩu: 100 ký tự' }));
  assert.match(errs(), /states 100 with a unit/);
});

test('ngày, email, mã ID và chuỗi lặp không bị coi là con số bịa', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  task();
  write05(tc('TST-001', 1, { 'Test Data': '\n  - Email: user2026@example.com\n  - Ngày: 2026-10-28\n  - Chuỗi: aaaaaaaaaaaaaaaaaaaaaaaa\n  - Tham chiếu BR-01, §2.1' }));
  assert.strictEqual(errs(), '');
});

test('[GIẢ ĐỊNH] trong ô giá trị ⇒ lỗi (không được làm vé thông hành)', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  task();
  write05(tc('TST-001', 1, { 'Test Data': '\n  - [GIẢ ĐỊNH] khoá 20 phút' }));
  assert.match(errs(), /carries \[GIẢ ĐỊNH\]/);
});

test('nhãn [CHƯA CÓ… – MR-xx] phải trỏ tới MR có thật; MR-xx mẫu bị từ chối', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  task();
  write05(tc('TST-001', 1, { 'Expected Result': '\n  - Hiển thị thông báo [CHƯA CÓ TRONG TÀI LIỆU – MR-99]' }));
  assert.match(errs(), /MR-99, which is not a question/);
  write05(tc('TST-001', 1, { 'Expected Result': '\n  - Hiển thị thông báo [CHƯA CÓ TRONG TÀI LIỆU – MR-xx]' }));
  assert.match(errs(), /names no real MR code/);
  write('knowledge/features/t.md', knowledgeDoc({ q7: [{ id: 'MR-99', question: 'Thông báo là gì?' }] }));
  write05(tc('TST-001', 1, { 'Expected Result': '\n  - Hiển thị thông báo [CHƯA CÓ TRONG TÀI LIỆU – MR-99]' }));
  assert.strictEqual(errs(), '');
});

test('01: câu trích thật nhưng KHÔNG chứa con số của dòng (bịa 30 phút) ⇒ lỗi', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  task({ br: '| BR-01 | Nhập sai 5 lần | Khoá 30 phút | 02_ba/spec.md §1 | Sai mật khẩu 5 lần thì hệ thống khoá tài khoản |' });
  write05(tc('TST-001', 1));
  assert.match(errs(), /states 30 but the quote does not contain it/);
});

test('01: chữ thông báo của FD không có trong nguồn ⇒ lỗi', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  task({ fd: `| FD-01 | Mật khẩu mới | text | Có | 8–64 ký tự | Mật khẩu không hợp lệ, vui lòng thử lại | 02_ba/spec.md §1 | ${Q2} |` });
  write05(tc('TST-001', 1));
  assert.match(errs(), /Thông báo khi sai" holds text not found in the source/);
});

test('01: Nguồn là file không tồn tại không được rơi về "mọi file"', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  task({ br: `| BR-01 | Nhập sai 5 lần | Khoá 15 phút | spec_fake.md §1 | ${Q1} |` });
  write05(tc('TST-001', 1));
  assert.match(errs(), /no such file in INPUT/);
});

test('01: digest do agent viết không phải nguồn trích dẫn', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  task({ br: '| BR-01 | Nhập sai 7 lần | Khoá 40 phút | 00_knowledge_digest.md §2 | Sai mật khẩu 7 lần thì khoá 40 phút ngay lập tức |' });
  write('OUTPUT/t/00_knowledge_digest.md', 'Sai mật khẩu 7 lần thì khoá 40 phút ngay lập tức\n');
  write05(tc('TST-001', 1));
  assert.match(errs(), /Quote not found|no such file/);
});

test('01: knowledge §8 #n phải là dòng có thật và hợp lệ', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  task({ br: '| BR-01 | Theo BA | Chấp nhận | knowledge §8 #42 |  |' });
  write05(tc('TST-001', 1));
  assert.match(errs(), /no such row in knowledge §8/);
});

test('quote ngắn dưới 4 từ không chứng minh được gì', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  task({ br: '| BR-01 | Nhập sai 5 lần | Khoá 15 phút | 02_ba/spec.md §1 | voucher |' });
  write05(tc('TST-001', 1));
  assert.match(errs(), /fewer than 4 words/);
});

test('provenance — numbersIn chỉ lấy con số nghiệp vụ', () => {
  assert.deepStrictEqual(P.numbersIn('1.250.000đ và 15 phút, BR-01, 2026-10-28, a@b.com, §2.1').map((n) => n.value), [1250000, 15]);
  assert.strictEqual(P.numbersIn('khoá 15 phút')[0].unitAttached, true);
  assert.strictEqual(P.numbersIn('bước 3')[0].unitAttached, false);
});

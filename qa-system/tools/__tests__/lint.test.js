/**
 * Test linter deliverable.
 *
 * Linter này đã kêu oan BỐN lần trên dữ liệu thật trong một phiên làm việc.
 * Mỗi lần kêu oan là một lần người dùng mất lòng tin và tắt nó đi — hỏng đúng
 * mục đích. Nên nửa số ca dưới đây kiểm điều ngược lại: linter phải IM LẶNG
 * trước những thứ trông giống lỗi nhưng không phải.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { useTempProject, write, testCase, spec, PATHS } = require('./helpers');
const { lint } = require('../system/lint-deliverables');

/** Dựng skill test-case-generation giả với danh sách trường tuỳ ý. */
function skillWithFields(fields) {
  const rows = ['| `TC_ID` | `[MODULE]-[001]` |', ...fields.map((f) => `| \`${f}\` | mô tả |`)];
  write(
    'qa-system/qa-test-design/skills/test-case-generation.md',
    `# Skill\n\n## Định dạng ${fields.length + 1} trường bắt buộc\n| Trường | Quy tắc |\n|---|---|\n${rows.join('\n')}\n\n## Mục khác\n`
  );
}

const DEFAULT_FIELDS = ['Title', 'Precondition', 'Test Steps', 'Test Data', 'Expected Result', 'Priority', 'Tags'];

const errorsOf = (slug) => lint(slug).errors.map((e) => e.msg);

// ───────────── Phải BẮT được ─────────────

test('bắt TC_ID sai định dạng', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([testCase('vchr-1')]));
    assert.match(errorsOf('t').join(' '), /TC_ID sai định dạng/);
  } finally { t.cleanup(); }
});

test('bắt TC_ID trùng trong cùng một file', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([testCase('TST-001'), testCase('TST-001')]));
    assert.match(errorsOf('t').join(' '), /TC_ID trùng/);
  } finally { t.cleanup(); }
});

test('bắt Title không mở đầu bằng Verify / Validate / Confirm', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([testCase('TST-001', { Title: 'Kiểm tra đăng nhập' })]));
    assert.match(errorsOf('t').join(' '), /Verify \/ Validate \/ Confirm/);
  } finally { t.cleanup(); }
});

test('bắt Tags thiếu Rule#', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([testCase('TST-001', { Tags: 'Viewpoint#VP-01, Module#T' })]));
    assert.match(errorsOf('t').join(' '), /thiếu `Rule#/);
  } finally { t.cleanup(); }
});

test('bắt Chặng 2 chưa quét đủ W1→W6', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/02_missing_rule_report.md', '# Báo cáo\nOwner: x · Verdict: PASS\n\nW1 W2 W3 đã quét.\n');
    assert.match(errorsOf('t').join(' '), /Chưa quét W4, W5, W6/);
  } finally { t.cleanup(); }
});

// ───────────── KHÔNG được kêu oan ─────────────

test('KHÔNG coi payload XSS là placeholder', () => {
  // Kêu oan thật: `<script>alert('XSS')</script>` là dữ liệu test hợp lệ,
  // bị luật placeholder `<...>` bắt nhầm.
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([
      testCase('TST-001', { 'Test Data': "\n  - Payload: `<script>alert('XSS')</script>`" }),
    ]));
    assert.deepStrictEqual(errorsOf('t'), []);
  } finally { t.cleanup(); }
});

test('KHÔNG coi mô tả định dạng `SG-XXXXXX` là placeholder', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([
      testCase('TST-001', { 'Test Data': '\n  - Mã đơn sinh ra: `SG-XXXXXX`' }),
    ]));
    assert.deepStrictEqual(errorsOf('t'), []);
  } finally { t.cleanup(); }
});

test('VẪN bắt placeholder thật còn sót từ khuôn mẫu', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([
      testCase('TST-001', { 'Test Data': '\n  - Mã voucher: [giá trị cụ thể]' }),
    ]));
    assert.match(errorsOf('t').join(' '), /chưa điền/);
  } finally { t.cleanup(); }
});

test('KHÔNG báo trùng giữa batch và spec tổng — batch là NGUỒN được gộp VÀO spec', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    const tc = testCase('TST-001');
    write('OUTPUT/t/05_test_case_spec.md', spec([tc]));
    write('OUTPUT/t/testcases/batch_01.md', spec([tc]));
    assert.deepStrictEqual(errorsOf('t'), []);
  } finally { t.cleanup(); }
});

test('chấp nhận mã kẽ hở ngoài BR-xx, ví dụ `Rule#GAP-H2`', () => {
  // Kêu oan thật trên bài mẫu: GAP-H2 có định nghĩa ở Mục 7 và Mục 8 của file
  // tri thức nên trace được đầy đủ. QA_STANDARD §2.4 chỉ đòi trace về
  // "mã BR-xx / MR-xx / mục tài liệu", không ép riêng BR.
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([
      testCase('TST-001', { Tags: 'Rule#GAP-H2, Viewpoint#VP-06, Module#T' }),
    ]));
    assert.deepStrictEqual(errorsOf('t'), []);
  } finally { t.cleanup(); }
});

test('KHÔNG báo thiếu Verdict khi file ghi `**Verdict Chặng 1**:`', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/01_requirement_risk_summary.md',
      '# Báo cáo\n**Chuyên gia thực hiện**: `qa-analyst`\n**Verdict Chặng 1**: `ASK`\n');
    assert.deepStrictEqual(errorsOf('t'), []);
  } finally { t.cleanup(); }
});

test('cảnh báo (không phải lỗi) khi Verdict nằm xa đầu file', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/03_viewpoint_report.md',
      '# Báo cáo\nOwner: x\n' + '\nNội dung.'.repeat(20) + '\n**VERDICT CHẶNG 3**: `PASS`\n');
    const r = lint('t');
    assert.deepStrictEqual(r.errors, []);
    assert.match(r.warns.map((w) => w.msg).join(' '), /thay vì trong 10 dòng đầu/);
  } finally { t.cleanup(); }
});

// ───────────── Thích nghi khi skill đổi ─────────────

test('đọc danh sách trường TỪ SKILL — thêm trường thứ 9 là bắt được ngay', () => {
  // Đề 01 bắt học viên nâng skill từ 8 lên 9 trường. Linter chép cứng danh sách
  // thì sẽ im lặng bỏ qua đúng trường học viên vừa thêm.
  const t = useTempProject();
  try {
    skillWithFields([...DEFAULT_FIELDS, 'Boundary Profile']);
    write('OUTPUT/t/05_test_case_spec.md', spec([testCase('TST-001')]));
    assert.match(errorsOf('t').join(' '), /Thiếu trường `Boundary Profile`/);
  } finally { t.cleanup(); }
});

test('thiếu MỘT trường chỉ báo MỘT lỗi — không báo dây chuyền sang trường trước đó', () => {
  // Lỗi thật: điểm dừng của mỗi trường là "trường kế tiếp", nên khi trường kế
  // tiếp vắng mặt thì trường đang xét cũng không khớp được và bị báo thiếu theo.
  const t = useTempProject();
  try {
    skillWithFields([...DEFAULT_FIELDS, 'Boundary Profile']);
    write('OUTPUT/t/05_test_case_spec.md', spec([testCase('TST-001')]));
    const errs = errorsOf('t');
    assert.strictEqual(errs.length, 1, `phải đúng 1 lỗi, thực tế: ${errs.join(' | ')}`);
    assert.ok(!errs.join(' ').includes('`Tags`'), 'không được báo oan trường Tags');
  } finally { t.cleanup(); }
});

test('spec hợp lệ hoàn toàn thì sạch', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([testCase('TST-001'), testCase('TST-002')]));
    const r = lint('t');
    assert.deepStrictEqual(r.errors, []);
    assert.strictEqual(r.totalCases, 2);
    assert.ok(r.clean);
  } finally { t.cleanup(); }
});

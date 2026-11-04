/**
 * Tests for the deliverable linter.
 *
 * Half the cases assert the linter catches a defect (audit #47, #63-#67, #77);
 * the other half assert it stays SILENT on things that merely look like defects,
 * because a linter that cries wolf gets switched off.
 */

const test = require('node:test');
const assert = require('node:assert');
const { useTempProject, write, testCase, spec, head, report02, summary01, knowledgeDoc, fullTask } = require('./helpers');
const { lint } = require('../system/lint-deliverables');

/** Builds a stand-in test-case-generation skill with an arbitrary field list. */
function skillWithFields(fields) {
  const rows = ['| `TC_ID` | `[MODULE]-[001]` |', ...fields.map((f) => `| \`${f}\` | mô tả |`)];
  write(
    'qa-system/qa-test-design/skills/test-case-generation.md',
    `# Skill\n\n## Định dạng ${fields.length + 1} trường bắt buộc\n| Trường | Quy tắc |\n|---|---|\n${rows.join('\n')}\n\n## Mục khác\n`
  );
}

const DEFAULT_FIELDS = ['Title', 'Precondition', 'Test Steps', 'Test Data', 'Expected Result', 'Priority', 'Tags'];
const errorsOf = (slug = 't') => lint(slug).errors.map((e) => e.msg);
const errText = (slug = 't') => errorsOf(slug).join(' | ');
const write05 = (cases) => write('OUTPUT/t/05_test_case_spec.md', spec(cases));
const ok1 = (id, over = {}) => testCase(id, { Tags: 'Rule#BR-01, Viewpoint#VP-01, TI#TI-01, Module#TST, Manual', ...over });
const ok2 = (id, over = {}) => testCase(id, { Tags: 'Rule#BR-02, Viewpoint#VP-02, TI#TI-02, Module#TST, Manual', ...over });

/** Every case starts from a clean, complete task and breaks one thing. */
function setup() {
  const t = useTempProject();
  skillWithFields(DEFAULT_FIELDS);
  fullTask();
  return t;
}

test('baseline — the full task lints clean', () => {
  const t = setup();
  try {
    const r = lint('t');
    assert.deepStrictEqual(r.errors, []);
    assert.strictEqual(r.totalCases, 2);
  } finally { t.cleanup(); }
});

// ───────────── Test cases ─────────────

test('catches a malformed TC_ID', () => {
  const t = setup();
  try {
    write05([ok1('vchr-1'), ok2('TST-002')]);
    assert.match(errText(), /Malformed TC_ID/);
  } finally { t.cleanup(); }
});

test('catches a duplicate TC_ID within one file', () => {
  const t = setup();
  try {
    write05([ok1('TST-001'), ok1('TST-001'), ok2('TST-002')]);
    assert.match(errText(), /Duplicate TC_ID/);
  } finally { t.cleanup(); }
});

test('catches a Title not starting with Verify / Validate / Confirm', () => {
  const t = setup();
  try {
    write05([ok1('TST-001', { Title: 'Kiểm tra đăng nhập' }), ok2('TST-002')]);
    assert.match(errText(), /Verify \/ Validate \/ Confirm/);
  } finally { t.cleanup(); }
});

test('#63 a spec in table form parses 0 cases ⇒ ERROR naming the unreadable lines', () => {
  const t = setup();
  try {
    write('OUTPUT/t/05_test_case_spec.md', `${head('Spec')}\n| TC_ID | Title |\n|---|---|\n| TST-001 | Verify a |\n`);
    assert.match(errText(), /0 test cases parsed.*TST-001/);
  } finally { t.cleanup(); }
});

test('#63 a TC-like row next to parsed cases is reported, not dropped', () => {
  const t = setup();
  try {
    write('OUTPUT/t/05_test_case_spec.md', spec([ok1('TST-001'), ok2('TST-002')]) + '\n## Phụ lục\n| TST-003 | Verify c |\n');
    assert.match(errText(), /TC-like line not parsed.*TST-003/);
  } finally { t.cleanup(); }
});

test('#64 batch and spec ID sets must agree', () => {
  const t = setup();
  try {
    write('OUTPUT/t/testcases/batch_01.md', spec([ok1('TST-001'), ok2('TST-002'), ok1('TST-003')]));
    assert.match(errText(), /in batches but not in spec: TST-003/);
  } finally { t.cleanup(); }
});

test('does NOT flag duplicates between a batch and the merged spec — batches are the SOURCE', () => {
  const t = setup();
  try {
    write('OUTPUT/t/testcases/batch_01.md', spec([ok1('TST-001'), ok2('TST-002')]));
    assert.deepStrictEqual(errorsOf(), []);
  } finally { t.cleanup(); }
});

test('#65 Rule# must be a defined BR/FD/AF (or a settled MR) — `Rule#XX-99` and `Rule#BR-99` fail', () => {
  const t = setup();
  try {
    write05([ok1('TST-001', { Tags: 'Rule#XX-99, Viewpoint#VP-01, TI#TI-01, Module#TST' }), ok2('TST-002', { Tags: 'Rule#BR-99, Viewpoint#VP-02, TI#TI-02, Module#TST' })]);
    const e = errText();
    assert.match(e, /Rule#XX-99 is not a BR\/FD\/AF\/MR code/);
    assert.match(e, /Rule#BR-99 is not defined/);
  } finally { t.cleanup(); }
});

test('#77 Rule#MR-xx is valid only once the MR is settled in knowledge', () => {
  const t = setup();
  try {
    write05([ok1('TST-001', { Tags: 'Rule#MR-01, Viewpoint#VP-01, TI#TI-01, Module#TST' }), ok2('TST-002')]);
    write('knowledge/features/t.md', knowledgeDoc({ q7: [{ id: 'MR-01' }] }));
    assert.match(errText(), /Rule#MR-01: an MR may be cited only once/);
    write('knowledge/features/t.md', knowledgeDoc({ q7: [{ id: 'MR-01', answer: 'Có', status: 'Confirmed' }] }));
    assert.deepStrictEqual(errorsOf(), []);
  } finally { t.cleanup(); }
});

test('#65 Viewpoint# and TI# must exist in 03 / 04', () => {
  const t = setup();
  try {
    write05([ok1('TST-001', { Tags: 'Rule#BR-01, Viewpoint#VP-04, TI#TI-09, Module#TST' }), ok2('TST-002')]);
    const e = errText();
    assert.match(e, /Viewpoint#VP-04 is not selected in 03/);
    assert.match(e, /TI#TI-09 is not defined in 04/);
  } finally { t.cleanup(); }
});

test('every TI marked Giữ needs a test case (ERROR); an uncovered BR is a WARN', () => {
  const t = setup();
  try {
    write05([ok1('TST-001')]);
    const r = lint('t');
    assert.match(r.errors.map((e) => e.msg).join(' '), /Giữ with no test case: TI-02/);
    assert.match(r.warns.map((e) => e.msg).join(' '), /Not cited by any test case.*BR-02/);
  } finally { t.cleanup(); }
});

test('#66 placeholders are caught in backticks and in every field', () => {
  const t = setup();
  try {
    write05([ok1('TST-001', { 'Test Data': '\n  - Mã: `TBD`' }), ok2('TST-002', { Precondition: '\n  - [điều kiện tiên quyết]' })]);
    const e = errText();
    assert.match(e, /`Test Data` still holds template content/);
    assert.match(e, /`Precondition` still holds template content/);
  } finally { t.cleanup(); }
});

test('#67 `**Priority:**` (colon inside the bold) is read; `[ĐỀ XUẤT]` suffix accepted', () => {
  const t = setup();
  try {
    const tc = ok1('TST-001').replace('- **Priority**: High', '- **Priority:** Medium [ĐỀ XUẤT]');
    write05([tc, ok2('TST-002')]);
    assert.deepStrictEqual(errorsOf(), []);
  } finally { t.cleanup(); }
});

test('Priority outside High/Medium/Low is an error', () => {
  const t = setup();
  try {
    write05([ok1('TST-001', { Priority: 'Critical' }), ok2('TST-002')]);
    assert.match(errText(), /Priority "Critical"/);
  } finally { t.cleanup(); }
});

// ───────────── Must not cry wolf ─────────────

test('does NOT treat an XSS payload or `SG-XXXXXX` as a placeholder', () => {
  const t = setup();
  try {
    write05([ok1('TST-001', { 'Test Data': "\n  - Payload: `<script>alert('XSS')</script>`" }), ok2('TST-002', { 'Test Data': '\n  - Mã: `SG-XXXXXX`' })]);
    assert.deepStrictEqual(errorsOf(), []);
  } finally { t.cleanup(); }
});

test('the §2.1 label [CHƯA CÓ TRONG TÀI LIỆU – MR-03] is valid, not a placeholder', () => {
  const t = setup();
  try {
    write05([ok1('TST-001', { 'Expected Result': '\n  - Hiển thị thông báo lỗi [CHƯA CÓ TRONG TÀI LIỆU – MR-03]' }), ok2('TST-002')]);
    assert.deepStrictEqual(errorsOf(), []);
  } finally { t.cleanup(); }
});

test('still catches a real placeholder left over from the template', () => {
  const t = setup();
  try {
    write05([ok1('TST-001', { 'Test Data': '\n  - Mã voucher: [giá trị cụ thể]' }), ok2('TST-002')]);
    assert.match(errText(), /template content/);
  } finally { t.cleanup(); }
});

// ───────────── Meta line ─────────────

test('a non-standard verdict line is an ERROR (tools cannot read it)', () => {
  const t = setup();
  try {
    write('OUTPUT/t/03_viewpoint_report.md', '# Báo cáo\n**Chuyên gia thực hiện**: `qa-analyst`\n**Verdict Chặng 3**: `PASS`\n| VP | Tên | Nguồn (BR/FD/AF/MR) | Lý do |\n|---|---|---|---|\n| VP-01 | a | BR-01 | b |\n| VP-02 | a | BR-02 | b |\n');
    assert.match(errText(), /No readable meta line/);
  } finally { t.cleanup(); }
});

// ───────────── 01 ─────────────

test('01 — a quote not found verbatim in INPUT is an ERROR; whitespace/markdown/case differences are tolerated', () => {
  const t = setup();
  try {
    write('OUTPUT/t/01_requirement_risk_summary.md', summary01({ quote: '**người  dùng nhập** mã voucher hợp lệ … áp dụng giảm giá' }));
    assert.deepStrictEqual(errorsOf(), []);
    write('OUTPUT/t/01_requirement_risk_summary.md', summary01({ quote: 'Voucher được giảm tối đa 500.000đ' }));
    assert.match(errText(), /Quote not found verbatim/);
  } finally { t.cleanup(); }
});

test('01 — an empty quote is allowed only when the source is knowledge §8', () => {
  const t = setup();
  try {
    write('OUTPUT/t/01_requirement_risk_summary.md', summary01({ quote: '' }));
    assert.match(errText(), /"Trích nguyên văn" is empty/);
  } finally { t.cleanup(); }
});

test('01 — malformed IDs and zero BR rows are errors', () => {
  const t = setup();
  try {
    write('OUTPUT/t/01_requirement_risk_summary.md', summary01({ br: ['BR1'] }));
    const e = errText();
    assert.match(e, /Malformed ID "BR1"/);
    assert.match(e, /No BR-xx rows parsed/);
  } finally { t.cleanup(); }
});

// ───────────── 02 / 06W ─────────────

test('#47 "Đã quét W1 W2 … W6" in prose is not a 06W matrix', () => {
  const t = setup();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', `${head('R')}\nĐã quét W1 W2 W3 W4 W5 W6.\n`);
    assert.match(errText(), /No 06W matrix/);
  } finally { t.cleanup(); }
});

test('06W — every BR/FD/AF of 01 needs a row; cells must be MR / Nguồn / Không áp dụng; MRs must exist in §3', () => {
  const t = setup();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({ objects: ['BR-01'], cells: { 'BR-01:W1': 'ok rồi', 'BR-01:W2': 'MR-07' } }));
    const e = errText();
    assert.match(e, /no matrix row: BR-02/);
    assert.match(e, /Invalid matrix cell "ok rồi"/);
    assert.match(e, /absent from the §3 question table: MR-07/);
  } finally { t.cleanup(); }
});

test('06W — a valid matrix with `Nguồn: BR-03, FD-01` and MR lists passes', () => {
  const t = setup();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({
      cells: { 'BR-01:W1': 'Nguồn: BR-02, spec §1', 'BR-02:W3': 'MR-01, MR-02' },
      questions: [{ id: 'MR-01', answer: 'a', status: 'Confirmed' }, { id: 'MR-02', status: 'Rejected' }],
    }));
    write('knowledge/features/t.md', knowledgeDoc({ q7: [{ id: 'MR-01', answer: 'a', status: 'Confirmed' }, { id: 'MR-02', status: 'Rejected' }] }));
    assert.deepStrictEqual(errorsOf(), []);
  } finally { t.cleanup(); }
});

test('02 — every OQ of 01 must be reconciled in §4', () => {
  const t = setup();
  try {
    write('OUTPUT/t/01_requirement_risk_summary.md', summary01({ oq: ['OQ-01', 'OQ-02'] }));
    write('OUTPUT/t/02_missing_rule_report.md', report02({ oq: [['OQ-01', 'Nguồn: spec §2']] }));
    assert.match(errText(), /OQ-02 of 01 is not reconciled/);
  } finally { t.cleanup(); }
});

test('02 — PASS while an MR is still New is an error', () => {
  const t = setup();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({ cells: { 'BR-01:W1': 'MR-01' }, questions: [{ id: 'MR-01' }] }));
    assert.match(errText(), /Verdict PASS but 1 MR/);
  } finally { t.cleanup(); }
});

// ───────────── Adapts when the skill changes ─────────────

test('reads the field list FROM THE SKILL — a new field is caught, with no cascade', () => {
  const t = setup();
  try {
    skillWithFields([...DEFAULT_FIELDS, 'Boundary Profile']);
    write05([ok1('TST-001'), ok2('TST-002', { 'Boundary Profile': 'min' })]);
    const errs = errorsOf();
    assert.strictEqual(errs.length, 1, errs.join(' | '));
    assert.match(errs[0], /Missing field `Boundary Profile`/);
  } finally { t.cleanup(); }
});

/**
 * Tests for the deliverable linter.
 *
 * This linter raised four false alarms on real data in a single session. Every
 * false alarm costs it credibility and gets it switched off, which defeats its
 * purpose — so half the cases below assert the opposite: the linter must stay
 * SILENT on things that merely look like defects.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { useTempProject, write, testCase, spec, PATHS } = require('./helpers');
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

const errorsOf = (slug) => lint(slug).errors.map((e) => e.msg);

// ───────────── Must catch ─────────────

test('catches a malformed TC_ID', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([testCase('vchr-1')]));
    assert.match(errorsOf('t').join(' '), /Malformed TC_ID/);
  } finally { t.cleanup(); }
});

test('catches a duplicate TC_ID within one file', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([testCase('TST-001'), testCase('TST-001')]));
    assert.match(errorsOf('t').join(' '), /Duplicate TC_ID/);
  } finally { t.cleanup(); }
});

test('catches a Title not starting with Verify / Validate / Confirm', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([testCase('TST-001', { Title: 'Kiểm tra đăng nhập' })]));
    assert.match(errorsOf('t').join(' '), /Verify \/ Validate \/ Confirm/);
  } finally { t.cleanup(); }
});

test('catches Tags missing Rule#', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([testCase('TST-001', { Tags: 'Viewpoint#VP-01, Module#T' })]));
    assert.match(errorsOf('t').join(' '), /missing `Rule#/);
  } finally { t.cleanup(); }
});

test('catches stage 2 not covering W1 through W6', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/02_missing_rule_report.md', '# Báo cáo\nOwner: x · Verdict: PASS\n\nW1 W2 W3 đã quét.\n');
    assert.match(errorsOf('t').join(' '), /Did not scan W4, W5, W6/);
  } finally { t.cleanup(); }
});

// ───────────── Must not cry wolf ─────────────

test('does NOT treat an XSS payload as a placeholder', () => {
  // Real false alarm: `<script>alert('XSS')</script>` is valid test data that
  // the `<...>` placeholder rule caught by mistake.
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([
      testCase('TST-001', { 'Test Data': "\n  - Payload: `<script>alert('XSS')</script>`" }),
    ]));
    assert.deepStrictEqual(errorsOf('t'), []);
  } finally { t.cleanup(); }
});

test('does NOT treat the format hint `SG-XXXXXX` as a placeholder', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([
      testCase('TST-001', { 'Test Data': '\n  - Mã đơn sinh ra: `SG-XXXXXX`' }),
    ]));
    assert.deepStrictEqual(errorsOf('t'), []);
  } finally { t.cleanup(); }
});

test('still catches a real placeholder left over from the template', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([
      testCase('TST-001', { 'Test Data': '\n  - Mã voucher: [giá trị cụ thể]' }),
    ]));
    assert.match(errorsOf('t').join(' '), /unfilled content/);
  } finally { t.cleanup(); }
});

test('does NOT flag duplicates between a batch and the merged spec — batches are the SOURCE', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    const tc = testCase('TST-001');
    write('OUTPUT/t/05_test_case_spec.md', spec([tc]));
    write('OUTPUT/t/testcases/batch_01.md', spec([tc]));
    assert.deepStrictEqual(errorsOf('t'), []);
  } finally { t.cleanup(); }
});

test('accepts gap codes outside BR-xx, e.g. `Rule#GAP-H2`', () => {
  // Real false alarm on the sample run: GAP-H2 is defined in sections 7 and 8 of
  // the knowledge file, so it traces fine. QA_STANDARD §2.4 only requires tracing
  // to "BR-xx / MR-xx / a document section", not to BR specifically.
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/05_test_case_spec.md', spec([
      testCase('TST-001', { Tags: 'Rule#GAP-H2, Viewpoint#VP-06, Module#T' }),
    ]));
    assert.deepStrictEqual(errorsOf('t'), []);
  } finally { t.cleanup(); }
});

test('does NOT report a missing Verdict when the file says `**Verdict Chặng 1**:`', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/01_requirement_risk_summary.md',
      '# Báo cáo\n**Chuyên gia thực hiện**: `qa-analyst`\n**Verdict Chặng 1**: `ASK`\n');
    assert.deepStrictEqual(errorsOf('t'), []);
  } finally { t.cleanup(); }
});

test('warns (does not error) when Verdict sits far from the top', () => {
  const t = useTempProject();
  try {
    skillWithFields(DEFAULT_FIELDS);
    write('OUTPUT/t/03_viewpoint_report.md',
      '# Báo cáo\nOwner: x\n' + '\nNội dung.'.repeat(20) + '\n**VERDICT CHẶNG 3**: `PASS`\n');
    const r = lint('t');
    assert.deepStrictEqual(r.errors, []);
    assert.match(r.warns.map((w) => w.msg).join(' '), /not within the first 10 lines/);
  } finally { t.cleanup(); }
});

// ───────────── Adapts when the skill changes ─────────────

test('reads the field list FROM THE SKILL — a ninth field is caught immediately', () => {
  // Exam 01 has students raise the skill from 8 to 9 fields. A hard-coded list
  // would silently skip the very field they just added.
  const t = useTempProject();
  try {
    skillWithFields([...DEFAULT_FIELDS, 'Boundary Profile']);
    write('OUTPUT/t/05_test_case_spec.md', spec([testCase('TST-001')]));
    assert.match(errorsOf('t').join(' '), /Missing field `Boundary Profile`/);
  } finally { t.cleanup(); }
});

test('ONE missing field yields ONE error — no cascade onto the preceding field', () => {
  // Real bug: each field stopped at "the next field", so when the next field was
  // absent the current one failed to match and was reported missing as well.
  const t = useTempProject();
  try {
    skillWithFields([...DEFAULT_FIELDS, 'Boundary Profile']);
    write('OUTPUT/t/05_test_case_spec.md', spec([testCase('TST-001')]));
    const errs = errorsOf('t');
    assert.strictEqual(errs.length, 1, `expected exactly 1 error, got: ${errs.join(' | ')}`);
    assert.ok(!errs.join(' ').includes('`Tags`'), 'must not falsely flag the Tags field');
  } finally { t.cleanup(); }
});

test('a fully valid spec lints clean', () => {
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

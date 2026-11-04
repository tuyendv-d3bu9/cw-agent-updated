/**
 * Tests for testcases:merge and testcases:export (audit #70-#72).
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { useTempProject, write, testCase, head, report02, fullTask, PATHS } = require('./helpers');
const { merge } = require('../testcase/merge-testcases');
const { runExport, parseTestCasesFromMarkdown } = require('../testcase/export-testcases');
const S = require('../lib/schema');

const tc = (id, ti = 'TI-01', br = 'BR-01', vp = 'VP-01') => testCase(id, { Tags: `Rule#${br}, Viewpoint#${vp}, TI#${ti}, Module#TST, Manual` });
const batch = (verdict, cases) => `${head('Batch', verdict)}\n${cases.join('\n')}`;

function setup() {
  const t = useTempProject();
  fullTask();
  fs.rmSync(path.join(PATHS.OUTPUT, 't', '05_test_case_spec.md'));
  return t;
}

test('#71 batches sort by number; #70 verdict = worst batch verdict; Nguồn lists the batches', () => {
  const t = setup();
  try {
    write('OUTPUT/t/testcases/batch_10.md', batch('PASS', [tc('TST-010')]));
    write('OUTPUT/t/testcases/batch_2.md', batch('FIX', [tc('TST-002')]));
    write('OUTPUT/t/testcases/batch_1.md', batch('PASS', [tc('TST-001')]));
    const r = merge('t');
    assert.ok(r.ok, r.errors.join(' | '));
    assert.deepStrictEqual(r.batches.map((b) => b.file), ['batch_1.md', 'batch_2.md', 'batch_10.md']);
    assert.strictEqual(r.verdict, 'FIX');
    const out = fs.readFileSync(r.output, 'utf-8');
    const meta = S.readMeta(out);
    assert.strictEqual(meta.verdict, 'FIX');
    assert.strictEqual(meta.source, 'testcases/batch_1.md, testcases/batch_2.md, testcases/batch_10.md');
    assert.deepStrictEqual(S.parseTestCases(out).cases.map((c) => c.id), ['TST-001', 'TST-002', 'TST-010']);
    assert.strictEqual((out.match(/^Owner:/gm) || []).length, 1, 'exactly one meta line');
  } finally { t.cleanup(); }
});

test('#70 an unreadable batch meta line counts as FIX, never PASS', () => {
  const t = setup();
  try {
    write('OUTPUT/t/testcases/batch_01.md', `# Batch\n**Verdict:** PASS\n${tc('TST-001')}`);
    const r = merge('t');
    assert.strictEqual(r.verdict, 'FIX');
    assert.match(r.warnings.join(' '), /counted as FIX/);
  } finally { t.cleanup(); }
});

test('#71 refuses duplicates across batches and batches that parse to 0 cases; reports diff', () => {
  const t = setup();
  try {
    write('OUTPUT/t/05_test_case_spec.md', `${head('Spec')}\n${tc('TST-001')}\n${tc('TST-005')}`);
    write('OUTPUT/t/testcases/batch_01.md', batch('PASS', [tc('TST-001'), tc('TST-002')]));
    write('OUTPUT/t/testcases/batch_02.md', batch('PASS', [tc('TST-002')]));
    write('OUTPUT/t/testcases/batch_03.md', `${head('B')}\n| TST-009 | table |\n`);
    const r = merge('t');
    assert.ok(!r.ok);
    assert.match(r.errors.join(' '), /TST-002 appears in both batch_01.md and batch_02.md/);
    assert.match(r.errors.join(' '), /batch_03.md: 0 test cases parsed/);
    assert.deepStrictEqual(r.diff, { added: ['TST-002'], removed: ['TST-005'] });
    assert.match(fs.readFileSync(path.join(PATHS.OUTPUT, 't', '05_test_case_spec.md'), 'utf-8'), /TST-005/, 'nothing written');
  } finally { t.cleanup(); }
});

test('merge refuses while the ASK gate is closed', () => {
  const t = setup();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({ verdict: 'ASK' }));
    write('OUTPUT/t/testcases/batch_01.md', batch('PASS', [tc('TST-001')]));
    const r = merge('t');
    assert.ok(!r.ok);
    assert.match(r.errors[0], /ASK gate is CLOSED/);
    assert.ok(!fs.existsSync(r.output));
  } finally { t.cleanup(); }
});

test('#72 export reads fields by name — order does not matter; missing Priority stays empty', () => {
  const text = [
    '### TC_ID: TST-001',
    '- **Tags**: Rule#BR-01, Module#TST',
    '- **Expected Result**:', '  - Thành công',
    '- **Title**: Verify order',
    '- **Test Data**: `ABC`',
    '- **Test Steps**:', '  1. Bấm',
    '- **Precondition**: Đã đăng nhập',
  ].join('\n');
  const [c] = parseTestCasesFromMarkdown(text);
  assert.strictEqual(c.title, 'Verify order');
  assert.strictEqual(c.expected, '• Thành công');
  assert.strictEqual(c.data, '`ABC`');
  assert.strictEqual(c.precondition, 'Đã đăng nhập');
  assert.strictEqual(c.priority, '');
  assert.strictEqual(c.module, 'TST');
});

test('#72 export refuses when the gate is closed or lint has errors; writes CSVs when clean', () => {
  const t = useTempProject();
  try {
    fullTask();
    let r = runExport('t');
    assert.ok(r.ok, r.errors.join(' | '));
    assert.strictEqual(r.count, 2);
    const csv = fs.readFileSync(path.join(PATHS.OUTPUT, 't', 'export_redmine.csv'), 'utf-8');
    assert.match(csv, /"High"/);

    write('OUTPUT/t/05_test_case_spec.md', `${head('Spec')}\n${tc('TST-001')}\n${testCase('TST-002', { Priority: null, Tags: 'Rule#BR-02, Viewpoint#VP-02, TI#TI-02, Module#TST' })}`);
    r = runExport('t');
    assert.ok(!r.ok);
    assert.match(r.errors.join(' '), /lint .* error/);

    fullTask();
    write('OUTPUT/t/02_missing_rule_report.md', report02({ verdict: 'ASK' }));
    r = runExport('t');
    assert.ok(!r.ok);
    assert.match(r.errors.join(' '), /ASK gate is CLOSED/);
  } finally { t.cleanup(); }
});

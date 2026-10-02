/**
 * Tests for the Go/No-Go gate plus the remaining tools.
 *
 * This gate decides whether automation work may start. A wrong threshold either
 * green-lights an immature design or blocks a mature one for no reason.
 */

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { useTempProject, write, testCase, spec, PATHS } = require('./helpers');
const { collect, decide } = require('../system/readiness');
const { extractAnswers } = require('../knowledge/sync-answers');
const { generateDataset } = require('../testdata/generate-dataset');

/** Builds a mature task: two fully traced cases covering every rule and viewpoint. */
function healthyTask(slug = 't') {
  write(`OUTPUT/${slug}/01_requirement_risk_summary.md`, '# Rule\nOwner: x · Verdict: PASS\n| BR-01 | ... |\n| BR-02 | ... |\n');
  write(`OUTPUT/${slug}/02_missing_rule_report.md`, '# Gap\nOwner: x · Verdict: PASS\n');
  write(`OUTPUT/${slug}/03_viewpoint_report.md`, '# VP\nOwner: x · Verdict: PASS\nVP-01: Happy Path\nVP-02: Negative\n');
  write(`OUTPUT/${slug}/05_test_case_spec.md`, spec([
    testCase('TST-001', { Tags: 'Rule#BR-01, Viewpoint#VP-01, Module#T' }),
    testCase('TST-002', { Tags: 'Rule#BR-02, Viewpoint#VP-02, Module#T' }),
  ]));
  write(`OUTPUT/${slug}/06_coverage_review.md`, '# Review\nOwner: x · Verdict: PASS\n');
  write(`OUTPUT/${slug}/12_data_validation_traceability.md`, '# Data\nOwner: x · Verdict: PASS\nMọi dataset đã map.\n');
}

test('GO when every metric passes', () => {
  const t = useTempProject();
  try {
    healthyTask();
    const m = collect('t');
    assert.strictEqual(m.testCases.tracePct, 100);
    assert.deepStrictEqual(m.coverage.viewpointsUncovered, []);
    assert.deepStrictEqual(m.coverage.rulesUncovered, []);

    const d = decide(m);
    assert.strictEqual(d.verdict, 'GO', `blockers: ${d.blockers.join(' | ')} · conditions: ${d.conditions.join(' | ')}`);
    assert.strictEqual(d.exitCode, 0);
  } finally { t.cleanup(); }
});

test('NO-GO when the ASK gate is closed', () => {
  const t = useTempProject();
  try {
    healthyTask();
    write('OUTPUT/t/02_missing_rule_report.md', '# Gap\nVerdict: ASK\n');
    const d = decide(collect('t'));
    assert.strictEqual(d.verdict, 'NO-GO');
    assert.strictEqual(d.exitCode, 2);
    assert.match(d.blockers.join(' '), /ASK gate is CLOSED/);
  } finally { t.cleanup(); }
});

test('NO-GO when there are no test cases', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/00_plan.md', '# Plan\n');
    const d = decide(collect('t'));
    assert.strictEqual(d.verdict, 'NO-GO');
    assert.match(d.blockers.join(' '), /No test cases at all/);
  } finally { t.cleanup(); }
});

test('NO-GO when the trace rate falls below 80%', () => {
  const t = useTempProject();
  try {
    healthyTask();
    // 1 traced out of 3 = 33%
    write('OUTPUT/t/05_test_case_spec.md', spec([
      testCase('TST-001', { Tags: 'Rule#BR-01, Viewpoint#VP-01, Module#T' }),
      testCase('TST-002', { Tags: 'Module#T' }),
      testCase('TST-003', { Tags: 'Module#T' }),
    ]));
    const m = collect('t');
    assert.ok(m.testCases.tracePct < 80, `trace=${m.testCases.tracePct}`);
    assert.strictEqual(decide(m).verdict, 'NO-GO');
  } finally { t.cleanup(); }
});

test('CONDITIONAL GO when a viewpoint is still uncovered', () => {
  const t = useTempProject();
  try {
    healthyTask();
    write('OUTPUT/t/03_viewpoint_report.md', '# VP\nOwner: x · Verdict: PASS\nVP-01 VP-02 VP-03\n');
    const d = decide(collect('t'));
    assert.strictEqual(d.verdict, 'CONDITIONAL GO');
    assert.strictEqual(d.exitCode, 1);
    assert.match(d.conditions.join(' '), /VP-03/);
  } finally { t.cleanup(); }
});

test('CONDITIONAL GO when stage 6 has not passed', () => {
  const t = useTempProject();
  try {
    healthyTask();
    write('OUTPUT/t/06_coverage_review.md', '# Review\nOwner: x · Verdict: ASK\n');
    const d = decide(collect('t'));
    assert.strictEqual(d.verdict, 'CONDITIONAL GO');
    assert.match(d.conditions.join(' '), /Stage 6 verdict/);
  } finally { t.cleanup(); }
});

test('detects cases citing a rule that stage 1 never defined', () => {
  const t = useTempProject();
  try {
    healthyTask();
    write('OUTPUT/t/05_test_case_spec.md', spec([
      testCase('TST-001', { Tags: 'Rule#BR-99, Viewpoint#VP-01, Module#T' }),
    ]));
    const m = collect('t');
    assert.ok(m.coverage.rulesReferencedButUndefined.includes('BR-99'));
  } finally { t.cleanup(); }
});

// ───────────── sync-answers ─────────────

test('sync-answers — extracts Confirmed rows and skips pending ones', () => {
  const report = `# Chặng 2
| STT | Mã Rule | Phân loại | Câu hỏi xác nhận cho BA | Phản hồi chính thức của BA | Quyết định đã chốt | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | **MR-01** | Boundary | Mức sàn bao nhiêu? | **"200k"** | Mức sàn 200.000 VNĐ | \`Confirmed\` |
| 2 | **MR-02** | State | Xử lý ra sao? | **"tự gỡ"** | Tự động gỡ voucher | \`Confirmed\` |
| 3 | **MR-03** | Data | Làm tròn kiểu gì? |  |  | \`New\` |
`;
  const got = extractAnswers(report);
  assert.deepStrictEqual(got.map((a) => a.id), ['MR-01', 'MR-02']);
  assert.strictEqual(got[0].decision, 'Mức sàn 200.000 VNĐ');
  assert.strictEqual(got[0].question, 'Mức sàn bao nhiêu?');
});

test('sync-answers — skips tables without a status column instead of guessing', () => {
  const report = '| Mã Rule | Ghi chú |\n|---|---|\n| MR-01 | gì đó |\n';
  assert.deepStrictEqual(extractAnswers(report), []);
});

// ───────────── generate-dataset ─────────────

test('generate-dataset — skips `_` keys instead of turning them into a data column', () => {
  // Real bug: `_comment` was treated as a field and produced a junk "Value_N" column.
  const rows = generateDataset({
    _comment: ['this is a note', 'not data'],
    ho_ten: { type: 'vietnamese_name' },
    so_luong: { type: 'boundary', min: 1, max: 99 },
  }, 3);

  assert.strictEqual(rows.length, 3);
  assert.deepStrictEqual(Object.keys(rows[0]), ['ho_ten', 'so_luong']);
});

test('generate-dataset — boundary produces the full edge series from QA_STANDARD §6', () => {
  const rows = generateDataset({ n: { type: 'boundary', min: 1, max: 99 } }, 7);
  const values = rows.map((r) => Number(r.n));
  // Outer bounds must be present: min-1 and max+1
  assert.ok(values.includes(0), `missing min-1, got: ${values}`);
  assert.ok(values.includes(100), `missing max+1, got: ${values}`);
});

// ───────────── lib/paths ─────────────

test('paths — every entry resolves under ROOT', () => {
  const { PATHS: P } = require('../lib/paths');
  for (const key of ['INPUT', 'OUTPUT', 'KNOWLEDGE', 'FEATURES', 'SYSTEM', 'TOOLS', 'TEMPLATES']) {
    assert.ok(P[key].startsWith(P.ROOT), `${key} must resolve under ROOT`);
  }
  assert.strictEqual(path.basename(P.SYSTEM), 'qa-system');
  assert.strictEqual(P.FEATURES, path.join(P.KNOWLEDGE, 'features'));
});

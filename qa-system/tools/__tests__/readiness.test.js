/**
 * Test cổng Go/No-Go và các tool còn lại.
 *
 * Cổng này quyết định có cho phép bắt tay viết automation hay không. Sai ngưỡng
 * là cho phép chạy trên nền thiết kế chưa chín, hoặc chặn oan một bài đã đủ chín.
 */

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { useTempProject, write, testCase, spec, PATHS } = require('./helpers');
const { collect, decide } = require('../system/readiness');
const { extractAnswers } = require('../knowledge/sync-answers');
const { generateDataset } = require('../testdata/generate-dataset');

/** Dựng một task đủ chín: 2 test case trace đầy đủ, phủ hết rule và viewpoint. */
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

test('GO khi mọi chỉ số đều đạt', () => {
  const t = useTempProject();
  try {
    healthyTask();
    const m = collect('t');
    assert.strictEqual(m.testCases.tracePct, 100);
    assert.deepStrictEqual(m.coverage.viewpointsUncovered, []);
    assert.deepStrictEqual(m.coverage.rulesUncovered, []);

    const d = decide(m);
    assert.strictEqual(d.verdict, 'GO', `điểm chặn: ${d.blockers.join(' | ')} · điều kiện: ${d.conditions.join(' | ')}`);
    assert.strictEqual(d.exitCode, 0);
  } finally { t.cleanup(); }
});

test('NO-GO khi cổng ASK đang đóng', () => {
  const t = useTempProject();
  try {
    healthyTask();
    write('OUTPUT/t/02_missing_rule_report.md', '# Gap\nVerdict: ASK\n');
    const d = decide(collect('t'));
    assert.strictEqual(d.verdict, 'NO-GO');
    assert.strictEqual(d.exitCode, 2);
    assert.match(d.blockers.join(' '), /Cổng ASK/);
  } finally { t.cleanup(); }
});

test('NO-GO khi chưa có test case nào', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/00_plan.md', '# Plan\n');
    const d = decide(collect('t'));
    assert.strictEqual(d.verdict, 'NO-GO');
    assert.match(d.blockers.join(' '), /Chưa có test case/);
  } finally { t.cleanup(); }
});

test('NO-GO khi tỷ lệ trace dưới 80%', () => {
  const t = useTempProject();
  try {
    healthyTask();
    // 1 trace / 3 tổng = 33%
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

test('CONDITIONAL GO khi còn viewpoint chưa được phủ', () => {
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

test('CONDITIONAL GO khi Chặng 6 chưa PASS', () => {
  const t = useTempProject();
  try {
    healthyTask();
    write('OUTPUT/t/06_coverage_review.md', '# Review\nOwner: x · Verdict: ASK\n');
    const d = decide(collect('t'));
    assert.strictEqual(d.verdict, 'CONDITIONAL GO');
    assert.match(d.conditions.join(' '), /Chặng 6/);
  } finally { t.cleanup(); }
});

test('phát hiện test case trích rule không tồn tại ở Chặng 1', () => {
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

test('sync-answers — bóc đúng các dòng đã Confirmed, bỏ dòng còn treo', () => {
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

test('sync-answers — bảng không có cột trạng thái thì bỏ qua, không đoán bừa', () => {
  const report = '| Mã Rule | Ghi chú |\n|---|---|\n| MR-01 | gì đó |\n';
  assert.deepStrictEqual(extractAnswers(report), []);
});

// ───────────── generate-dataset ─────────────

test('generate-dataset — bỏ qua khoá `_` thay vì biến nó thành cột dữ liệu', () => {
  // Lỗi thật: `_comment` bị coi là một field và sinh ra cột rác "Value_N".
  const rows = generateDataset({
    _comment: ['đây là chú thích', 'không phải dữ liệu'],
    ho_ten: { type: 'vietnamese_name' },
    so_luong: { type: 'boundary', min: 1, max: 99 },
  }, 3);

  assert.strictEqual(rows.length, 3);
  assert.deepStrictEqual(Object.keys(rows[0]), ['ho_ten', 'so_luong']);
});

test('generate-dataset — boundary sinh đúng chuỗi biên theo QA_STANDARD §6', () => {
  const rows = generateDataset({ n: { type: 'boundary', min: 1, max: 99 } }, 7);
  const values = rows.map((r) => Number(r.n));
  // Phải có cả biên ngoài: min-1 và max+1
  assert.ok(values.includes(0), `thiếu min-1, có: ${values}`);
  assert.ok(values.includes(100), `thiếu max+1, có: ${values}`);
});

// ───────────── lib/paths ─────────────

test('paths — mọi đường dẫn đều nằm dưới ROOT', () => {
  const { PATHS: P } = require('../lib/paths');
  for (const key of ['INPUT', 'OUTPUT', 'KNOWLEDGE', 'FEATURES', 'SYSTEM', 'TOOLS', 'TEMPLATES']) {
    assert.ok(P[key].startsWith(P.ROOT), `${key} phải nằm dưới ROOT`);
  }
  assert.strictEqual(path.basename(P.SYSTEM), 'qa-system');
  assert.strictEqual(P.FEATURES, path.join(P.KNOWLEDGE, 'features'));
});

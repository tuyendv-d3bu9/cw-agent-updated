/**
 * Tests for the Go/No-Go gate plus the remaining tools.
 *
 * This gate decides whether automation work may start. A wrong threshold either
 * green-lights an immature design or blocks a mature one for no reason.
 */

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { useTempProject, write, testCase, spec, head, report02, knowledgeDoc, fullTask, PATHS } = require('./helpers');
const { collect, decide } = require('../system/readiness');
const { generateDataset } = require('../testdata/generate-dataset');

const tc1 = (over) => testCase('TST-001', { Tags: 'Rule#BR-01, Viewpoint#VP-01, TI#TI-01, Module#T', ...over });
const tc2 = (over) => testCase('TST-002', { Tags: 'Rule#BR-02, Viewpoint#VP-02, TI#TI-02, Module#T', ...over });

test('GO when every metric passes', () => {
  const t = useTempProject();
  try {
    fullTask();
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
    fullTask();
    write('OUTPUT/t/02_missing_rule_report.md', report02({ verdict: 'ASK' }));
    const d = decide(collect('t'));
    assert.strictEqual(d.verdict, 'NO-GO');
    assert.strictEqual(d.exitCode, 2);
    assert.match(d.blockers.join(' '), /ASK gate is CLOSED/);
  } finally { t.cleanup(); }
});

test('#59 NO-GO when 01/02/03/knowledge are missing — 1 TC + 06 PASS + any 12 is not GO', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/05_test_case_spec.md', spec([tc1()]));
    write('OUTPUT/t/06_coverage_review.md', head('Review'));
    write('OUTPUT/t/12_data_validation_traceability.md', head('Data'));
    const d = decide(collect('t'));
    assert.strictEqual(d.verdict, 'NO-GO');
    assert.match(d.blockers.join(' '), /Required inputs missing: 01_requirement_risk_summary.md, 02_missing_rule_report.md, 03_viewpoint_report.md, knowledge\/features\/t.md/);
  } finally { t.cleanup(); }
});

test('NO-GO when there are no test cases', () => {
  const t = useTempProject();
  try {
    fullTask();
    require('fs').rmSync(require('path').join(PATHS.OUTPUT, 't', '05_test_case_spec.md'));
    const d = decide(collect('t'));
    assert.strictEqual(d.verdict, 'NO-GO');
    assert.match(d.blockers.join(' '), /No test cases at all/);
  } finally { t.cleanup(); }
});

test('#60 NO-GO "cannot measure" when 01 has zero BR or 03 has zero VP in the pinned tables', () => {
  const t = useTempProject();
  try {
    fullTask();
    write('OUTPUT/t/01_requirement_risk_summary.md', `${head('Summary')}\nBR-01 và BR-02 nằm trong văn xuôi, không có bảng.\n`);
    write('OUTPUT/t/03_viewpoint_report.md', `${head('VP')}\nVP-01: Happy Path\nVP-02: Negative\n`);
    const b = decide(collect('t')).blockers.join(' ');
    assert.match(b, /0 BR-xx parsed/);
    assert.match(b, /0 VP-xx parsed/);
  } finally { t.cleanup(); }
});

test('NO-GO when the trace rate falls below 80%', () => {
  const t = useTempProject();
  try {
    fullTask();
    write('OUTPUT/t/05_test_case_spec.md', spec([tc1(), tc2({ Tags: 'Module#T' }), testCase('TST-003', { Tags: 'Module#T' })]));
    const m = collect('t');
    assert.ok(m.testCases.tracePct < 80, `trace=${m.testCases.tracePct}`);
    assert.strictEqual(decide(m).verdict, 'NO-GO');
  } finally { t.cleanup(); }
});

test('CONDITIONAL GO when a viewpoint is still uncovered', () => {
  const t = useTempProject();
  try {
    fullTask();
    write('OUTPUT/t/03_viewpoint_report.md', `${head('VP')}\n## 2. VIEWPOINT ĐƯỢC CHỌN\n| VP | Tên | Nguồn (BR/FD/AF/MR) | Lý do |\n|---|---|---|---|\n| VP-01 | a | BR-01 | b |\n| VP-02 | a | BR-02 | b |\n| VP-03 | a | BR-02 | b |\n`);
    const d = decide(collect('t'));
    assert.strictEqual(d.verdict, 'CONDITIONAL GO');
    assert.strictEqual(d.exitCode, 1);
    assert.match(d.conditions.join(' '), /VP-03/);
  } finally { t.cleanup(); }
});

test('#61 CONDITIONAL GO when stage 6 has not passed — the verdict comes from the meta line only', () => {
  const t = useTempProject();
  try {
    fullTask();
    write('OUTPUT/t/06_coverage_review.md', `${head('Review', 'ASK')}\n> Trích: "Verdict: PASS" của lần trước\n`);
    const d = decide(collect('t'));
    assert.strictEqual(d.verdict, 'CONDITIONAL GO');
    assert.match(d.conditions.join(' '), /Stage 6 verdict is `ASK`/);
    write('OUTPUT/t/06_coverage_review.md', '# Review\n> Verdict: PASS (quoted)\n');
    assert.match(decide(collect('t')).conditions.join(' '), /no readable meta line/);
  } finally { t.cleanup(); }
});

test('cases citing an undefined rule, viewpoint or idea are blockers', () => {
  const t = useTempProject();
  try {
    fullTask();
    write('OUTPUT/t/05_test_case_spec.md', spec([tc1({ Tags: 'Rule#BR-99, Viewpoint#VP-07, TI#TI-09, Module#T' }), tc2()]));
    const m = collect('t');
    assert.ok(m.coverage.rulesReferencedButUndefined.includes('BR-99'));
    const b = decide(m).blockers.join(' ');
    assert.match(b, /BR-99/);
    assert.match(b, /VP-07/);
    assert.match(b, /TI-09/);
  } finally { t.cleanup(); }
});

test('#62 riskyCases catches Rule#MR-xx on an unsettled MR', () => {
  const t = useTempProject();
  try {
    fullTask();
    write('knowledge/features/t.md', knowledgeDoc({ q7: [{ id: 'MR-01', answer: 'x', status: 'TREO' }] }));
    write('OUTPUT/t/05_test_case_spec.md', spec([tc1({ Tags: 'Rule#BR-01, Rule#MR-01, Viewpoint#VP-01, TI#TI-01, Module#T' }), tc2()]));
    const m = collect('t');
    assert.deepStrictEqual(m.riskyCases, ['TST-001']);
    assert.strictEqual(decide(m).verdict, 'NO-GO');
  } finally { t.cleanup(); }
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

test('readiness không cho GO khi lint có lỗi (Expected: TBD từng vẫn ra GO)', () => {
  const t = useTempProject();
  try {
    fullTask();
    assert.strictEqual(decide(collect('t')).verdict, 'GO');
    write('OUTPUT/t/05_test_case_spec.md', spec([
      testCase('TST-001', { 'Expected Result': '\n  - TBD', Tags: 'Rule#BR-01, Viewpoint#VP-01, TI#TI-01, Module#TST, Manual' }),
      testCase('TST-002', { Tags: 'Rule#BR-02, Viewpoint#VP-02, TI#TI-02, Module#TST, Manual' }),
    ]));
    const d = decide(collect('t'));
    assert.strictEqual(d.verdict, 'NO-GO');
    assert.match(d.blockers.join(' '), /npm run lint reports/);
  } finally { t.cleanup(); }
});

/**
 * exam-result.test.js — Calculation rules (plan §3.2, §5.3), instructor validation and the
 * HTML / CSV views (null never 0, XSS-safe, deterministic).
 */

const test = require('node:test');
const assert = require('node:assert');
const { baseResult, finalize, validateInstructor, validateResult } = require('../exam/lib/result');
const { criterion } = require('../exam/lib/checks');
const { renderHtml, renderCsv } = require('../exam/lib/render');

const CFG = { exam_id: 'shopgo-refund-v1', task_slug: 'shopgo-refund', rubric_version: 'grad-v1.0.0' };
const SHA = 'c'.repeat(40);
const chk = (id, max, points, state = points === null ? 'PENDING_HUMAN_REVIEW' : points === max ? 'PASSED' : points ? 'PARTIAL' : 'FAILED') =>
  ({ id, max, points, state, evidence: [], message: `msg ${id}` });

function criteria(over = {}) {
  const c = {
    A1: criterion(8, [chk('A1a', 3, 3), chk('A1b', 3, 3), chk('A1c', 2, 2)]),
    A2: criterion(12, [chk('A2a', 3, 3), chk('A2b', 4, 4), chk('A2c', 2, 2), chk('A2d', 3, 3)]),
    A3: criterion(14, [chk('A3a', 3, 3), chk('A3b', 2, 2), chk('A3c', 4, 4), chk('A3d', 2, 2), chk('A3e', 3, 3)]),
    A4: criterion(14, [chk('A4a', 3, 3), chk('A4b', 4, 4), chk('A4c', 3, 3), chk('A4d', 4, 4)]),
    A5: criterion(14, [chk('A5a', 4, 4), chk('A5b', 3, 3), chk('A5c', 2, 2), chk('A5d', 2, 2), chk('A5e', 3, 3)]),
    A6: criterion(8, [chk('A6a', 3, 3), chk('A6b', 3, 3), chk('A6c', 2, 2)]),
  };
  for (const [k, checks] of Object.entries(over)) c[k] = criterion(c[k].max, checks);
  return c;
}

function base({ crit = criteria(), gradable = [], flags = [] } = {}) {
  return baseResult({
    cfg: CFG, studentId: 'nguyen-van-a', branch: 'exams/nguyen-van-a', sha: SHA, starterSha: 'd'.repeat(40), gradedAt: '2026-12-01T10:00:00Z',
    preflight: { status: gradable.length ? 'VALID_WITH_GAPS' : 'VALID', blocking: [], gradable, warnings: [] }, criteria: crit, flags,
    evidenceRoot: `GRADING/evidence/nguyen-van-a/${SHA}/`,
  });
}

const manual = (p, level) => ({ points: p, level, evidence: ['OUTPUT/shopgo-refund/01_requirement_risk_summary.md'], comment: 'ok', reviewer: 'instructor-1', scored_at: '2026-12-03T09:00:00Z' });
const instr = (i3 = 8, flags = []) => ({ schema_version: '1.0.0', exam_id: CFG.exam_id, student_id: 'nguyen-van-a', resolved_flags: flags,
  criteria: { I1: manual(8, '6-8'), I2: manual(8, '6-8'), I3: manual(i3, `${i3}/10`) } });

test('automated complete, instructor pending ⇒ PENDING, total null, pass conditions partly known', () => {
  const r = finalize(base(), null, CFG);
  assert.deepStrictEqual(validateResult(r), []);
  assert.strictEqual(r.automated.score, 70);
  assert.strictEqual(r.automated.status, 'GRADED');
  assert.strictEqual(r.instructor.status, 'PENDING');
  assert.strictEqual(r.total.score, null);
  assert.deepStrictEqual(r.pass_conditions, { total_ge_60: null, pipeline_minimum: true, defense_ge_4: null });
  assert.strictEqual(r.status, 'PENDING');
});

test('everything known ⇒ PASS; I3 < 4 ⇒ FAIL although total ≥ 60', () => {
  const r = finalize(base(), instr(8), CFG);
  assert.strictEqual(r.total.score, 94);
  assert.strictEqual(r.status, 'PASS');
  assert.strictEqual(r.instructor.reviewed_at, '2026-12-03T09:00:00Z');
  const f = finalize(base(), instr(3), CFG);
  assert.strictEqual(f.total.score, 89);
  assert.strictEqual(f.pass_conditions.defense_ge_4, false);
  assert.strictEqual(f.status, 'FAIL');
});

test('a pending check keeps its criterion and the totals null, never 0; partial points stay in checks', () => {
  const r = finalize(base({ crit: criteria({ A1: [chk('A1a', 3, 3), chk('A1b', 3, null), chk('A1c', 2, 2)] }) }), instr(), CFG);
  assert.strictEqual(r.automated.criteria.A1.points, null);
  assert.strictEqual(r.automated.criteria.A1.checks[0].points, 3);
  assert.strictEqual(r.automated.score, null);
  assert.strictEqual(r.automated.status, 'PARTIAL');
  assert.strictEqual(r.total.score, null);
  assert.strictEqual(r.status, 'NEEDS_HUMAN_REVIEW');
});

test('pipeline minimum: false when 06 is missing, false when A4 < 7 or A5a < 2', () => {
  const g = [{ code: 'G-01', path: 'OUTPUT/shopgo-refund/06_coverage_review.md', message: 'Declared null', fix: 'x' }];
  const r = finalize(base({ gradable: g }), instr(), CFG);
  assert.strictEqual(r.pass_conditions.pipeline_minimum, false);
  assert.strictEqual(r.status, 'FAIL');
  assert.deepStrictEqual(r.missing_requirements, ['Stage 06 coverage review (OUTPUT/shopgo-refund/06_coverage_review.md)']);
  const low = finalize(base({ crit: criteria({ A5: [chk('A5a', 4, 1.5), chk('A5b', 3, 3), chk('A5c', 2, 2), chk('A5d', 2, 2), chk('A5e', 3, 3)] }) }), instr(), CFG);
  assert.strictEqual(low.pass_conditions.pipeline_minimum, false);
  const a4 = finalize(base({ crit: criteria({ A4: [chk('A4a', 3, 3), chk('A4b', 4, 0), chk('A4c', 3, 0), chk('A4d', 4, 4)] }) }), null, CFG);
  assert.strictEqual(a4.pass_conditions.pipeline_minimum, true); // exactly 7.0
});

test('an open integrity flag blocks the total until the instructor resolves it', () => {
  const flags = [{ code: 'S3', id: 'S3:OUTPUT/shopgo-refund/04_test_idea_report.md', path: 'x', detail: 'y' }];
  const open = finalize(base({ flags }), instr(), CFG);
  assert.strictEqual(open.total.score, null);
  assert.strictEqual(open.status, 'NEEDS_HUMAN_REVIEW');
  const done = finalize(base({ flags }), instr(8, [flags[0].id]), CFG);
  assert.strictEqual(done.total.score, 94);
  assert.strictEqual(done.integrity_flags[0].state, 'resolved');
});

test('finalize is pure and idempotent', () => {
  const b = base();
  const once = finalize(b, instr(), CFG);
  assert.deepStrictEqual(finalize(once, instr(), CFG), once);
  assert.deepStrictEqual(finalize(b, instr(), CFG), once);
});

test('feedback comes from fixed templates; benchmark checks show only their message', () => {
  const r = finalize(base({ crit: criteria({ A4: [chk('A4a', 3, 3), chk('A4b', 4, 3), chk('A4c', 3, 3), { ...chk('A4d', 4, 2), message: '1 of 2 seeded gaps raised; missed category: refund window' }] }) }), null, CFG);
  assert.deepStrictEqual(r.feedback.map((f) => f.criterion), ['A4b', 'A4d']);
  assert.match(r.feedback[0].text, /npm run lint/);
  assert.strictEqual(r.feedback[1].text, '1 of 2 seeded gaps raised; missed category: refund window');
});

test('instructor validation: level range, evidence, I3 n/10', () => {
  assert.deepStrictEqual(validateInstructor(instr()), []);
  const bad = instr();
  bad.criteria.I1 = manual(9, '6-8');
  bad.criteria.I2 = { ...manual(5, '3-5'), evidence: [] };
  bad.criteria.I3 = manual(7, '8/10');
  const errs = validateInstructor(bad).join(' | ');
  assert.match(errs, /I1\/points 9 is outside level 6-8/);
  assert.match(errs, /I2\/evidence needs at least one file/);
  assert.match(errs, /I3\/points must equal the level/);
  assert.match(validateInstructor({ ...instr(), criteria: { I1: manual(11, '9-10') } }).join(' '), /<= 10/);
});

test('HTML: null shown as pending, student text escaped, no external resource', () => {
  const crit = criteria({ A1: [{ ...chk('A1a', 3, 3), message: '<script>alert(1)</script>"\'&' }, chk('A1b', 3, null), chk('A1c', 2, 2)] });
  const r = finalize(base({ crit }), null, CFG);
  const html = renderHtml(r);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;&quot;&#39;&amp;/);
  assert.match(html, /Total: <span class="pending">pending<\/span>/);
  assert.match(html, /<td class="cid">A1b<\/td><td><span class="pending">pending<\/span> \/ 3<\/td>/);
  assert.doesNotMatch(html, /(src|href)=["']?https?:/);
  assert.strictEqual(renderHtml(r), html);
});

test('CSV: columns of plan §3.3, sorted, empty cell for null, escaped cells', () => {
  const a = finalize(base(), instr(), CFG);
  const b = finalize({ ...base(), student_id: 'an-b', branch: '=cmd|x,"y"' }, null, CFG);
  const csv = renderCsv([a, b]).trim().split('\n');
  assert.strictEqual(csv[0], 'student_id,branch,submission_sha,status,preflight,A1,A2,A3,A4,A5,A6,auto_score,I1,I2,I3,instructor_score,total,pipeline_minimum,defense_ge_4,integrity_flags,graded_at');
  assert.match(csv[1], /^an-b,"'=cmd\|x,""y""",/);
  assert.match(csv[1], /,70,,,,,,true,,,2026-12-01T10:00:00Z$/);
  assert.match(csv[2], /^nguyen-van-a,.*,70,8,8,8,24,94,true,true,,2026-12-01T10:00:00Z$/);
});

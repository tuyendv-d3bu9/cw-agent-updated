/**
 * Tests for the ASK gate.
 *
 * This gate is the only thing stopping the agent from generating test cases on
 * unsettled rules. If it fails silently the whole system loses its guarantee
 * without anyone noticing, so each unlock path gets its own case.
 */

const test = require('node:test');
const assert = require('node:assert');
const { useTempProject, write } = require('./helpers');
const { evaluate, audit, LOCKED_DELIVERABLES } = require('../system/gate');

/** Sections 7 and 8 of a knowledge file, with section 8 LAST as in the template. */
function knowledge({ pending = [], resolved = [], section8 = [] }) {
  const rows = [
    ...pending.map((q) => `| ${q} | Kẽ hở | W1 | HIGH | Mặc định | Câu hỏi? |  | New |`),
    ...resolved.map((q) => `| ${q} | Kẽ hở | W1 | HIGH | Mặc định | Câu hỏi? | Đã trả lời | Confirmed |`),
  ];
  return `# Tri thức · test

## 7. CÂU HỎI MỞ & KẼ HỞ 06W (OPEN QUESTIONS & MISSING RULES)

| ID | Mô tả kẽ hở | Nhóm 06W | Mức rủi ro | Đề xuất mặc định | Câu hỏi cho BA/PO | Phản hồi chính thức | Trạng thái |
|---|---|---|---|---|---|---|---|
${rows.join('\n')}

## 8. GIẢ ĐỊNH ĐÃ ĐƯỢC CHỐT (CONFIRMED ASSUMPTIONS LOG)

| # | Mã liên quan | Giả định ban đầu | Quyết định chính thức | Người phê duyệt | Ngày chốt |
|---|---|---|---|---|---|
${section8.map((q, i) => `| ${i + 1} | ${q} | Giả định | Quyết định chính thức | PO | 2026-10-02 |`).join('\n')}
`;
}

test('CLOSED when stage 2 returns Verdict ASK', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', '# Báo cáo\nVerdict: ASK\n');
    const s = evaluate('t');
    assert.ok(s.blocked, 'gate must be closed');
    assert.match(s.reasons.join(' '), /Verdict: ASK/);
  } finally { t.cleanup(); }
});

test('CLOSED while section 7 still has New questions', () => {
  const t = useTempProject();
  try {
    write('knowledge/features/t.md', knowledge({ pending: ['MR-01', 'MR-02'] }));
    const s = evaluate('t');
    assert.ok(s.blocked);
    assert.deepStrictEqual(s.pending.map((q) => q.id), ['MR-01', 'MR-02']);
  } finally { t.cleanup(); }
});

test('unlock path 1 — answer in section 7, status Confirmed', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', '# Báo cáo\nVerdict: PASS\n');
    write('knowledge/features/t.md', knowledge({ resolved: ['MR-01', 'MR-02'] }));
    const s = evaluate('t');
    assert.ok(!s.blocked, `gate should be open, got: ${s.reasons.join(' · ')}`);
    assert.strictEqual(s.resolvedCount, 2);
  } finally { t.cleanup(); }
});

test('unlock path 2 — decision recorded in section 8 (the LAST section)', () => {
  // Bug that nearly shipped: the section reader used `\Z`, which does NOT exist
  // in JavaScript regex (JS reads it as a literal Z). Section 8 usually sits last,
  // so it never matched and this unlock path silently did nothing.
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', '# Báo cáo\nVerdict: PASS\n');
    write('knowledge/features/t.md', knowledge({ pending: ['MR-01'], section8: ['MR-01'] }));
    const s = evaluate('t');
    assert.ok(!s.blocked, `section 8 should unlock the gate, got: ${s.reasons.join(' · ')}`);
  } finally { t.cleanup(); }
});

test('OPEN before stage 2 runs — work that has not started is not blocked', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/00_plan.md', '# Plan\n');
    assert.ok(!evaluate('t').blocked);
  } finally { t.cleanup(); }
});

test('ADVISES (without blocking) when BA answers stay stranded in OUTPUT/', () => {
  // QA_STANDARD §8: OUTPUT/ is disposable, knowledge/ is what accumulates. If
  // stage 2 passed on BA answers that never reached knowledge/, the next run
  // asks the BA those same questions again.
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', '# Báo cáo\nVerdict: PASS\n| MR-01 | ... |\n| MR-02 | ... |\n');
    const s = evaluate('t');
    assert.ok(!s.blocked, 'an advisory must not close the gate');
    assert.strictEqual(s.advisories.length, 1);
    assert.match(s.advisories[0], /MR-01, MR-02/);
  } finally { t.cleanup(); }
});

test('no advisory once every code is recorded in knowledge/', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', '# Báo cáo\nVerdict: PASS\n| MR-01 | ... |\n');
    write('knowledge/features/t.md', knowledge({ resolved: ['MR-01'] }));
    assert.strictEqual(evaluate('t').advisories.length, 0);
  } finally { t.cleanup(); }
});

test('audit — detects stage 03-06 files written after the lock timestamp', async () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', '# Báo cáo\nVerdict: ASK\n');
    write('OUTPUT/t/_gate.lock', JSON.stringify({ slug: 't', lockedAt: new Date(Date.now() - 60000).toISOString() }));
    write('OUTPUT/t/03_viewpoint_report.md', '# written past the gate\n');
    const a = audit('t');
    assert.strictEqual(a.violations.length, 1);
    assert.strictEqual(a.violations[0].file, '03_viewpoint_report.md');
  } finally { t.cleanup(); }
});

test('audit — reports nothing when no lock is active', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/03_viewpoint_report.md', '# legitimate\n');
    assert.strictEqual(audit('t').violations.length, 0);
  } finally { t.cleanup(); }
});

test('the locked-deliverable list covers exactly stages 3 to 6', () => {
  assert.ok(LOCKED_DELIVERABLES.includes('03_viewpoint_report.md'));
  assert.ok(LOCKED_DELIVERABLES.includes('06_coverage_review.md'));
  // Stages 1 and 2 must stay runnable, otherwise nobody can answer the questions.
  assert.ok(!LOCKED_DELIVERABLES.some((f) => f.startsWith('01_') || f.startsWith('02_')));
});

/**
 * Tests for knowledge:sync (audit #3, #37, #68, #69, #74).
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { useTempProject, write, report02, knowledgeDoc, PATHS } = require('./helpers');
const { extractAnswers, extractQuestions, plan, apply, fromTemplate } = require('../knowledge/sync-answers');
const S = require('../lib/schema');

const REAL_TEMPLATE = path.join(__dirname, '..', '..', '..', 'knowledge', '_template.md');

test('#68 reads the pinned §3 question table of 02 (QA_STANDARD §9.4)', () => {
  const r = report02({ questions: [
    { id: 'MR-01', question: 'Mức sàn?', answer: '200.000', by: 'BA An', date: '2026-11-01', status: 'Confirmed' },
    { id: 'MR-02', question: 'Cộng dồn?' },
  ] });
  const q = extractQuestions(r);
  assert.deepStrictEqual(q.map((x) => [x.id, x.status]), [['MR-01', 'Confirmed'], ['MR-02', 'New']]);
  assert.deepStrictEqual(extractAnswers(r).map((x) => x.id), ['MR-01']);
});

test('#69 status synonyms and decorated statuses are understood', () => {
  const r = report02({ questions: [
    { id: 'MR-01', answer: 'a', status: 'Đã xác nhận' },
    { id: 'MR-02', answer: 'b', status: 'Confirmed (BA An)' },
    { id: 'MR-03', answer: 'không cần', status: 'Loại' },
    { id: 'MR-04', answer: 'c', status: 'Chưa xác nhận' },
  ] });
  assert.deepStrictEqual(extractAnswers(r).map((x) => x.id), ['MR-01', 'MR-02', 'MR-03']);
});

test('#74 the legacy header "Trả lời của BA" maps to "Phản hồi chính thức"', () => {
  const r = '| ID | Câu hỏi cho BA/PO | Trả lời của BA | Người trả lời | Ngày | Trạng thái |\n|---|---|---|---|---|---|\n| **MR-01** | q? | Có | BA An | 2026-11-01 | `Confirmed` |\n';
  assert.strictEqual(extractAnswers(r)[0].answer, 'Có');
});

test('legacy report with a "Quyết định đã chốt" column keeps the decision', () => {
  const report = `| STT | Mã Rule | Câu hỏi xác nhận cho BA | Phản hồi chính thức của BA | Người trả lời | Ngày | Quyết định đã chốt | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | **MR-01** | Mức sàn bao nhiêu? | **"200k"** | BA An | 2026-11-01 | Mức sàn 200.000 VNĐ | \`Confirmed\` |
| 3 | **MR-03** | Làm tròn kiểu gì? |  |  |  |  | \`New\` |
`;
  const got = extractAnswers(report);
  assert.deepStrictEqual(got.map((a) => a.id), ['MR-01']);
  assert.strictEqual(got[0].decision, 'Mức sàn 200.000 VNĐ');
});

test('skips tables without a status column instead of guessing', () => {
  assert.deepStrictEqual(extractAnswers('| Mã Rule | Ghi chú |\n|---|---|\n| MR-01 | gì đó |\n'), []);
});

test('#3 an MR code mentioned elsewhere in knowledge (prose, template hints) is NOT "already synced"', () => {
  const k = knowledgeDoc().replace('## 9.', 'Ghi chú: MR-01 từng được nhắc ở đây.\n\n## 9.');
  const p = plan(report02({ questions: [{ id: 'MR-01', answer: 'a', status: 'Confirmed' }] }), k);
  assert.deepStrictEqual(p.append.map((q) => q.id), ['MR-01']);
});

test('#37 same ID, different question text ⇒ appended as a new row, old row kept', () => {
  const k = knowledgeDoc({ q7: [{ id: 'MR-04', question: 'Mức sàn?', answer: '200k', status: 'Confirmed' }] });
  const p = plan(report02({ questions: [{ id: 'MR-04', question: 'Cộng dồn không?' }] }), k);
  assert.strictEqual(p.append.length, 1);
  const out = apply(k, p);
  const rows = S.readQuestionRows(S.sectionBody(out, '7'));
  assert.deepStrictEqual(rows.map((r) => r.question), ['Mức sàn?', 'Cộng dồn không?']);
});

test('an open §7 row gets its answer + status filled in place; §8 only with answerer + date', () => {
  const k = knowledgeDoc({ q7: [{ id: 'MR-01', question: 'Mức sàn?' }, { id: 'MR-02', question: 'Cộng dồn?' }] });
  const r = report02({ questions: [
    { id: 'MR-01', question: 'Mức sàn?', answer: '200.000', by: 'BA An', date: '2026-11-01', status: 'Confirmed' },
    // Câu trả lời do agent tự ghi: không có người trả lời / ngày ⇒ KHÔNG được chép sang knowledge (audit #6).
    { id: 'MR-02', question: 'Cộng dồn?', answer: 'Không', by: '', date: '', status: 'Confirmed' },
  ] });
  const p = plan(r, k);
  assert.strictEqual(p.update.length, 1);
  assert.deepStrictEqual(p.decide.map((q) => q.id), ['MR-01']);
  const out = apply(k, p);
  const rows = S.readQuestionRows(S.sectionBody(out, '7'));
  assert.strictEqual(rows.length, 2, 'no row added or deleted');
  assert.deepStrictEqual(rows.map((x) => x.resolved), [true, false]);
  const d = S.readDecisions(S.sectionBody(out, '8'));
  assert.strictEqual(d.length, 1);
  assert.ok(d[0].valid);
  assert.deepStrictEqual([d[0].related, d[0].approver, d[0].date], [['MR-01'], 'BA An', '2026-11-01']);
  // Idempotent: a second run changes nothing.
  const again = plan(r, out);
  assert.deepStrictEqual([again.append.length, again.update.length, again.decide.length], [0, 0, 0]);
});

test('sync không chép câu trả lời do AI ghi (Người trả lời = Claude/agent)', () => {
  const k = knowledgeDoc({ q7: [{ id: 'MR-01', question: 'Mức sàn?' }] });
  const r = report02({ questions: [{ id: 'MR-01', question: 'Mức sàn?', answer: '200.000', by: 'Claude', date: '2026-11-01', status: 'Confirmed' }] });
  const p = plan(r, k);
  assert.deepStrictEqual([p.update.length, p.decide.length], [0, 0]);
});

test('a fresh knowledge file from the real (empty) template carries no rows', () => {
  const t = useTempProject();
  try {
    write('knowledge/_template.md', fs.readFileSync(REAL_TEMPLATE, 'utf-8'));
    const k = fromTemplate('t');
    assert.ok(!k.includes('<feature-slug>'));
    assert.deepStrictEqual(S.readQuestionRows(S.sectionBody(k, '7')), []);
    const p = plan(report02({ questions: [{ id: 'MR-01', question: 'q?', answer: 'a', by: 'BA', date: '2026-11-01', status: 'Confirmed' }] }), k);
    const out = apply(k, p);
    assert.strictEqual(S.readQuestionRows(S.sectionBody(out, '7')).length, 1);
    assert.strictEqual(S.readDecisions(S.sectionBody(out, '8')).filter((d) => d.valid).length, 1);
    void PATHS;
  } finally { t.cleanup(); }
});

test('the synced knowledge opens the gate end to end', () => {
  const t = useTempProject();
  try {
    const r = report02({ verdict: 'ASK', cells: { 'BR-01:W1': 'MR-01' }, questions: [{ id: 'MR-01', question: 'Mức sàn?', answer: '200k', by: 'BA', date: '2026-11-01', status: 'Confirmed' }] });
    write('OUTPUT/t/02_missing_rule_report.md', r);
    write('knowledge/features/t.md', knowledgeDoc());
    const { evaluate } = require('../system/gate');
    assert.ok(evaluate('t').blocked);
    const k = fs.readFileSync(path.join(PATHS.FEATURES, 't.md'), 'utf-8');
    write('knowledge/features/t.md', apply(k, plan(r, k)));
    assert.ok(!evaluate('t').blocked, evaluate('t').reasons.join(' · '));
  } finally { t.cleanup(); }
});

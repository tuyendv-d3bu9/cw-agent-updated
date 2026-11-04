/**
 * Tests for the ASK gate (QA_STANDARD §1) and its PreToolUse hook.
 *
 * The gate is the only thing stopping test cases from being written on
 * unsettled rules. Every hole found in the 2026-11-04 audit (#48-#58) gets a
 * case that reproduces it.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { useTempProject, write, knowledgeDoc, report02, head, PATHS } = require('./helpers');
const { evaluate, audit, writeLock, isLockedPath, LOCKED_DELIVERABLES } = require('../system/gate');
const hook = require('../system/gate-hook');

const ok = (s) => assert.ok(!s.blocked, `gate should be open, got: ${s.reasons.join(' · ')}`);
const closed = (s, re) => {
  assert.ok(s.blocked, 'gate must be closed');
  if (re) assert.match(s.reasons.join(' '), re);
};

// ───────────── Verdict & fail-closed ─────────────

test('CLOSED when stage 2 returns Verdict ASK', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({ verdict: 'ASK' }));
    closed(evaluate('t'), /Verdict: ASK/);
  } finally { t.cleanup(); }
});

test('#48 CLOSED when 02 does not exist — skipping stage 2 is not a way in', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/01_requirement_risk_summary.md', head('x'));
    const s = evaluate('t');
    closed(s, /does not exist/);
    assert.strictEqual(s.phase, 'pre-stage-2');
  } finally { t.cleanup(); }
});

for (const [name, line] of [
  ['bold', 'Owner: x · **Verdict:** ASK'],
  ['backticked', 'Owner: x · Verdict: `ASK`'],
  ['Vietnamese', 'Owner: x · Kết luận: ASK'],
  ['no Owner', 'Verdict: PASS'],
]) {
  test(`#49 CLOSED when the meta line is unreadable (${name})`, () => {
    const t = useTempProject();
    try {
      write('OUTPUT/t/02_missing_rule_report.md', `# R\n${line}\n`);
      closed(evaluate('t'), /Cannot read the verdict/);
    } finally { t.cleanup(); }
  });
}

test('#57 a legend cell `| ASK |` in a PASS report does not close the gate', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02() + '\n## Chú giải\n| PASS | đủ |\n| ASK | thiếu |\n');
    ok(evaluate('t'));
  } finally { t.cleanup(); }
});

test('verdict FIX keeps the gate closed (fix and re-run stage 2)', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({ verdict: 'FIX' }));
    closed(evaluate('t'), /FIX/);
  } finally { t.cleanup(); }
});

// ───────────── What counts as settled ─────────────

test('CLOSED while knowledge §7 still has New questions', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02());
    write('knowledge/features/t.md', knowledgeDoc({ q7: [{ id: 'MR-01' }, { id: 'MR-02' }] }));
    const s = evaluate('t');
    closed(s);
    assert.deepStrictEqual(s.pending.map((q) => q.id), ['MR-01', 'MR-02']);
  } finally { t.cleanup(); }
});

test('unlock path 1 — Confirmed with an official answer, or Rejected', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02());
    write('knowledge/features/t.md', knowledgeDoc({ q7: [
      { id: 'MR-01', answer: '200.000', by: 'BA An', date: '2026-11-01', status: 'Confirmed' },
      { id: 'MR-02', answer: 'không cần xử lý', status: 'Rejected' },
      { id: 'MR-03', answer: 'Có', status: 'Đã xác nhận' },
      { id: 'MR-04', answer: 'Có', status: 'Confirmed (BA An)' },
    ] }));
    const s = evaluate('t');
    ok(s);
    assert.strictEqual(s.resolvedCount, 4);
  } finally { t.cleanup(); }
});

test('#50 an answer cell with text but status New/TREO does not settle it', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02());
    write('knowledge/features/t.md', knowledgeDoc({ q7: [
      { id: 'MR-01', answer: 'Chờ BA trả lời', status: 'TREO' },
      { id: 'MR-02', answer: 'N/A', status: 'New' },
    ] }));
    assert.strictEqual(evaluate('t').pending.length, 2);
  } finally { t.cleanup(); }
});

test('Confirmed with an EMPTY official answer is not settled', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02());
    write('knowledge/features/t.md', knowledgeDoc({ q7: [{ id: 'MR-01', status: 'Confirmed' }] }));
    closed(evaluate('t'));
  } finally { t.cleanup(); }
});

test('#51 a row missing a column is read by header, not shifted into the answer', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02());
    write('knowledge/features/t.md', `# K\n## 7. Q\n| ID | Kẽ hở | Câu hỏi cho BA/PO | Phản hồi chính thức | Trạng thái |\n|---|---|---|---|---|\n| MR-01 | a | q? |  | New |\n`);
    closed(evaluate('t'));
  } finally { t.cleanup(); }
});

test('#52 a §8 decision needs approver AND date to count', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02());
    write('knowledge/features/t.md', knowledgeDoc({ q7: [{ id: 'MR-01' }], d8: [{ id: 'MR-01', decision: 'chưa chốt' }] }));
    closed(evaluate('t'));
    write('knowledge/features/t.md', knowledgeDoc({ q7: [{ id: 'MR-01' }], d8: [{ id: 'MR-01', by: 'PO Bình', date: '2026-11-02' }] }));
    ok(evaluate('t'));
  } finally { t.cleanup(); }
});

test('#53 #34 bold IDs, non-MR IDs and a heading without a dot are all seen', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02());
    const k = knowledgeDoc({ q7: [{ id: 'Q-01', status: 'Chờ trả lời' }, { id: '**MR-02**' }] }).replace('## 7. CÂU HỎI', '## 7 Câu hỏi');
    write('knowledge/features/t.md', k);
    const s = evaluate('t');
    closed(s);
    assert.deepStrictEqual(s.pending.map((q) => q.id).sort(), ['MR-02', 'Q-01']);
  } finally { t.cleanup(); }
});

test('an empty knowledge template contributes no questions', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02());
    write('knowledge/features/t.md', fs.readFileSync(path.join(__dirname, '..', '..', '..', 'knowledge', '_template.md'), 'utf-8'));
    ok(evaluate('t'));
  } finally { t.cleanup(); }
});

// ───────────── 02 MRs vs knowledge ─────────────

test('every MR of 02 must be settled IN knowledge — answer only in OUTPUT keeps it closed', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({ questions: [{ id: 'MR-01', answer: 'Có', status: 'Confirmed' }] }));
    closed(evaluate('t'), /knowledge:sync/);
  } finally { t.cleanup(); }
});

test('#58 02 says ASK but every MR is settled in knowledge ⇒ open (stale verdict) with advisory', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({ verdict: 'ASK', questions: [{ id: 'MR-01', question: 'Mức sàn?' }] }));
    write('knowledge/features/t.md', knowledgeDoc({ q7: [{ id: 'MR-01', question: 'Mức sàn?', answer: '200k', status: 'Confirmed' }] }));
    const s = evaluate('t');
    ok(s);
    assert.match(s.advisories.join(' '), /Mọi MR của 02 đã chốt trong knowledge/);
  } finally { t.cleanup(); }
});

test('#37 an old MR-04 with different wording does not settle today\'s MR-04', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({ verdict: 'ASK', questions: [{ id: 'MR-04', question: 'Voucher có cộng dồn không?' }] }));
    write('knowledge/features/t.md', knowledgeDoc({ q7: [{ id: 'MR-04', question: 'Mức sàn đơn hàng là bao nhiêu?', answer: '200k', status: 'Confirmed' }] }));
    const s = evaluate('t');
    closed(s);
    assert.deepStrictEqual(s.pending.map((q) => q.id), ['MR-04']);
  } finally { t.cleanup(); }
});

// ───────────── Lock & audit ─────────────

test('#55 lock covers any 03-06 name (any case) and testcases/**, not 01/02', () => {
  for (const p of ['03_viewpoint_report.md', '05_Test_Case_Spec.md', '05_testcases.md', '06b_x.md', 'testcases/batch_01.md']) {
    assert.ok(isLockedPath(p), p);
  }
  for (const p of ['01_requirement_risk_summary.md', '02_missing_rule_report.md', '00_plan.md', '12_data.md']) {
    assert.ok(!isLockedPath(p), p);
  }
  assert.ok(!LOCKED_DELIVERABLES.some((f) => f.startsWith('01_') || f.startsWith('02_')));
});

test('audit — detects stage 03-06 files written after the lock timestamp', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({ verdict: 'ASK' }));
    write('OUTPUT/t/_gate.lock', JSON.stringify({ slug: 't', lockedAt: new Date(Date.now() - 60000).toISOString() }));
    write('OUTPUT/t/03_viewpoint_report.md', '# written past the gate\n');
    write('OUTPUT/t/testcases/batch_01.md', '# batch\n');
    const a = audit('t');
    assert.deepStrictEqual(a.violations.map((v) => v.file).sort(), ['03_viewpoint_report.md', 'testcases/batch_01.md']);
  } finally { t.cleanup(); }
});

test('#56 opening the gate later does not erase the evidence (append-only log)', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({ verdict: 'ASK' }));
    const lockPath = writeLock(evaluate('t'));
    // Backdate the lock so a file written "now" falls inside the locked interval.
    const past = new Date(Date.now() - 60000).toISOString();
    fs.writeFileSync(path.join(PATHS.OUTPUT, 't', '_gate.log'), JSON.stringify({ event: 'locked', at: past }) + '\n');
    fs.writeFileSync(lockPath, JSON.stringify({ lockedAt: past }));
    write('OUTPUT/t/05_test_case_spec.md', '# bypass\n');
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 30); // mtime strictly before the unlock
    write('OUTPUT/t/02_missing_rule_report.md', report02());
    writeLock(evaluate('t')); // gate opens, lock file removed
    assert.ok(!fs.existsSync(lockPath));
    const a = audit('t');
    assert.deepStrictEqual(a.violations.map((v) => v.file), ['05_test_case_spec.md']);
    const log = fs.readFileSync(path.join(PATHS.OUTPUT, 't', '_gate.log'), 'utf-8');
    assert.match(log, /"unlocked"/);
  } finally { t.cleanup(); }
});

test('audit — reports nothing when no lock was ever active', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/03_viewpoint_report.md', '# legitimate\n');
    assert.strictEqual(audit('t').violations.length, 0);
  } finally { t.cleanup(); }
});

// ───────────── Hook ─────────────

const denied = (out) => /"deny"/.test(out);

test('#54 #55 hook denies Write/Edit/MultiEdit/NotebookEdit into locked paths of a blocked task', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({ verdict: 'ASK' }));
    const o = PATHS.OUTPUT;
    assert.ok(denied(hook.decide({ tool_name: 'Write', tool_input: { file_path: `${o}/t/05_test_case_spec.md` } })));
    assert.ok(denied(hook.decide({ tool_name: 'Edit', tool_input: { file_path: `${o}/t/05_Test_Case_Spec.md` } })));
    assert.ok(denied(hook.decide({ tool_name: 'MultiEdit', tool_input: { file_path: `${o}/t/testcases/batch_01.md` } })));
    assert.ok(denied(hook.decide({ tool_name: 'NotebookEdit', tool_input: { notebook_path: `${o}/t/04_x.ipynb` } })));
    assert.ok(denied(hook.decide({ tool_name: 'Write', tool_input: { file_path: 'OUTPUT/t/03_vp.md' }, cwd: PATHS.ROOT })));
    assert.ok(!denied(hook.decide({ tool_name: 'Write', tool_input: { file_path: `${o}/t/02_missing_rule_report.md` } })));
    assert.ok(!denied(hook.decide({ tool_name: 'Write', tool_input: { file_path: `${PATHS.ROOT}/knowledge/features/t.md` } })));
  } finally { t.cleanup(); }
});

test('hook denies a write into a task that has no 02 yet (fail-closed)', () => {
  const t = useTempProject();
  try {
    assert.ok(denied(hook.decide({ tool_name: 'Write', tool_input: { file_path: `${PATHS.OUTPUT}/new/03_vp.md` } })));
  } finally { t.cleanup(); }
});

test('#54 hook blocks Bash writes and merge/export for a blocked task, allows reads', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({ verdict: 'ASK' }));
    const run = (command) => hook.decide({ tool_name: 'Bash', tool_input: { command }, cwd: PATHS.ROOT });
    assert.ok(denied(run('echo x > OUTPUT/t/05_test_case_spec.md')));
    assert.ok(denied(run('cat a.md | tee OUTPUT/t/testcases/batch_02.md')));
    assert.ok(denied(run('cp /tmp/x.md OUTPUT/t/06_coverage_review.md')));
    assert.ok(denied(run('mv /tmp/05_test_case_spec.md OUTPUT/t/')));
    assert.ok(denied(run('cd OUTPUT/t && printf x >> 04_test_idea_report.md')));
    assert.ok(denied(run(`node -e "require('fs').writeFileSync('OUTPUT/t/03_vp.md','x')"`)));
    assert.ok(denied(run('npm run testcases:merge t')));
    assert.ok(denied(run('node qa-system/tools/testcase/export-testcases.js t')));
    assert.ok(!denied(run('cat OUTPUT/t/05_test_case_spec.md 2>/dev/null')));
    assert.ok(!denied(run('npm run gate t')));
    assert.ok(!denied(run('echo x > OUTPUT/t/02_missing_rule_report.md')));
  } finally { t.cleanup(); }
});

test('hook allows everything once the gate is open', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02());
    assert.ok(!denied(hook.decide({ tool_name: 'Write', tool_input: { file_path: `${PATHS.OUTPUT}/t/05_test_case_spec.md` } })));
    assert.ok(!denied(hook.decide({ tool_name: 'Bash', tool_input: { command: 'npm run testcases:merge t' }, cwd: PATHS.ROOT })));
  } finally { t.cleanup(); }
});

test('cổng nói rõ vì sao một câu Confirmed chưa được tính (thiếu người/ngày, hoặc AI tự trả lời)', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02());
    write('knowledge/features/t.md', knowledgeDoc({ q7: [
      { id: 'MR-01', answer: '200k', by: '', date: '', status: 'Confirmed' },
      { id: 'MR-02', answer: 'Có', by: 'Claude', date: '2026-11-01', status: 'Confirmed' },
    ] }));
    const s = evaluate('t');
    assert.strictEqual(s.blocked, true);
    assert.match(s.pending.find((q) => q.id === 'MR-01').state, /thiếu Người trả lời hoặc Ngày/);
    assert.match(s.pending.find((q) => q.id === 'MR-02').state, /AI\/agent/);
  } finally { t.cleanup(); }
});

// ───────────── Hook: agent không được tự chốt câu trả lời của BA ─────────────

test('hook chặn agent tự chốt câu hỏi ở knowledge §7 / thêm quyết định §8; cho qua việc thêm câu hỏi mới', () => {
  const t = useTempProject();
  try {
    const k = knowledgeDoc({ q7: [{ id: 'MR-01', question: 'Mức sàn?' }] });
    const kp = write('knowledge/features/t.md', k);
    const edit = (oldS, newS) => hook.decide({ tool_name: 'Edit', tool_input: { file_path: kp, old_string: oldS, new_string: newS } });

    // Tự điền câu trả lời + người + ngày + Confirmed vào §7.
    const row = k.split('\n').find((l) => l.startsWith('| MR-01'));
    const self = row.replace(/\|\s*\|\s*\|\s*\|\s*New\s*\|$/, '| 200k | BA An | 2026-11-01 | Confirmed |');
    assert.notStrictEqual(self, row);
    assert.ok(denied(edit(row, self)), 'tự chốt §7 phải bị chặn');

    // Write cả file với §7 đã chốt.
    assert.ok(denied(hook.decide({ tool_name: 'Write', tool_input: { file_path: kp, content: k.replace(row, self) } })));

    // Xoá câu hỏi chưa chốt.
    assert.ok(denied(edit(row + '\n', '')), 'xoá câu hỏi chưa chốt phải bị chặn');

    // Thêm quyết định hợp lệ vào §8.
    const withDecision = knowledgeDoc({ q7: [{ id: 'MR-01', question: 'Mức sàn?' }], d8: [{ id: 'MR-01', question: 'Mức sàn?', decision: '200k', by: 'BA An', date: '2026-11-01' }] });
    assert.ok(denied(hook.decide({ tool_name: 'Write', tool_input: { file_path: kp, content: withDecision } })));

    // Thêm một câu hỏi MỚI (New) thì được.
    const more = knowledgeDoc({ q7: [{ id: 'MR-01', question: 'Mức sàn?' }, { id: 'MR-02', question: 'Làm tròn?' }] });
    assert.ok(!denied(hook.decide({ tool_name: 'Write', tool_input: { file_path: kp, content: more } })));
  } finally { t.cleanup(); }
});

test('hook chặn xoá câu hỏi chưa chốt khỏi 02; chốt qua 02 §3 (đường chính thống) thì được', () => {
  const t = useTempProject();
  try {
    const r = report02({ verdict: 'ASK', cells: { 'BR-01:W1': 'MR-01' }, questions: [{ id: 'MR-01', question: 'Mức sàn?' }] });
    const p = write('OUTPUT/t/02_missing_rule_report.md', r);
    const without = report02({ verdict: 'PASS' });
    assert.ok(denied(hook.decide({ tool_name: 'Write', tool_input: { file_path: p, content: without } })));
    const answered = report02({ verdict: 'ASK', cells: { 'BR-01:W1': 'MR-01' }, questions: [{ id: 'MR-01', question: 'Mức sàn?', answer: '200k', by: 'BA An', date: '2026-11-01', status: 'Confirmed' }] });
    assert.ok(!denied(hook.decide({ tool_name: 'Write', tool_input: { file_path: p, content: answered } })));
  } finally { t.cleanup(); }
});

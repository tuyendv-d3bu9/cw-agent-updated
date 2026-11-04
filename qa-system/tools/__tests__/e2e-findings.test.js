/**
 * Regression tests for the findings of the end-to-end pipeline run
 * (follow-up to the 2026-11-04 audit): quote stitching, "Không có" rows,
 * Bash hook false positives, absolute line numbers, split tables, multiple
 * viewpoints, Mode-1 readiness, gate hints, progress fallback, merge owner.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { useTempProject, write, testCase, spec, head, report02, summary01, knowledgeDoc, fullTask, PATHS } = require('./helpers');
const S = require('../lib/schema');
const { lint } = require('../system/lint-deliverables');
const { collect, decide } = require('../system/readiness');
const { evaluate, STALE_NOTE } = require('../system/gate');
const hook = require('../system/gate-hook');

const errText = () => lint('t').errors.map((e) => `[${e.where}] ${e.msg}`).join(' | ');

// ───────────── 1. Quotes ─────────────

const A = 'Người dùng nhập mã voucher hợp lệ thì hệ thống áp dụng giảm giá cho đơn hàng.';
const B = 'Mã voucher hết hạn thì hệ thống hiển thị thông báo lỗi cho người dùng.';

test('1 a quote stitched with … from two different INPUT files is rejected', () => {
  const files = [{ rel: '02_ba/a.md', norm: S.normText(A) }, { rel: '03_dev/b.md', norm: S.normText(B) }];
  const q = 'Người dùng nhập mã voucher … hệ thống hiển thị thông báo lỗi';
  assert.ok(!S.quoteInSources(q, '02_ba/a.md §1', files).ok);
  assert.ok(!S.quoteInSources(q, 'không rõ', files).ok, 'all-files fallback still searches each file alone');
  assert.ok(S.quoteInSources('Người dùng nhập mã voucher … áp dụng giảm giá cho', '02_ba/a.md §1', files).ok);
});

test('1 Nguồn naming a file restricts the search to that file (stem matches .docx -> .md)', () => {
  const files = [{ rel: '02_ba/spec.md', norm: S.normText(A) }, { rel: '05_communication/cr.md', norm: S.normText(B) }];
  const r = S.quoteInSources(B, 'spec.docx §2', files);
  assert.ok(!r.ok);
  assert.deepStrictEqual(r.searched, ['02_ba/spec.md']);
  assert.ok(S.quoteInSources(B, 'Nguồn: cr.md', files).ok);
});

test('1 elided pieces must be close together (≤ 400 chars) and ≥ 4 words each', () => {
  const far = S.normText(`đầu tiên của câu dài ${'x '.repeat(300)} cuối cùng của câu dài`);
  assert.ok(!S.quoteMatch('đầu tiên của câu … cuối cùng của câu', far).ok);
  const near = S.normText('đầu tiên của câu dài rồi cuối cùng của câu dài');
  assert.ok(S.quoteMatch('đầu tiên của câu … cuối cùng của câu', near).ok);
  assert.match(S.quoteMatch('đầu tiên … cuối cùng của câu', near).reason, /fewer than 4 words/);
});

test('1 lint: a quote assembled from two INPUT files fails end to end', () => {
  const t = useTempProject();
  try {
    fullTask();
    write('INPUT/t/03_dev/api.md', '# API\nMã voucher hết hạn thì hiển thị thông báo lỗi.\n');
    write('INPUT/t/02_ba/spec.md', '# Spec\nNgười dùng nhập mã voucher hợp lệ thì hệ thống áp dụng giảm giá.\n');
    write('OUTPUT/t/01_requirement_risk_summary.md', summary01({ quote: 'Người dùng nhập mã voucher … hết hạn thì hiển thị thông báo lỗi' }));
    assert.match(errText(), /Quote not found verbatim/);
  } finally { t.cleanup(); }
});

// ───────────── 2. "Không có" rows ─────────────

test('2 a lone "Không có" row in §6/§7 is an empty table, not a malformed ID / missing quote', () => {
  const t = useTempProject();
  try {
    fullTask();
    const s01 = summary01() + `
## 6. OUT OF SCOPE

| Nội dung loại trừ | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|
| Không có | | |
`;
    write('OUTPUT/t/01_requirement_risk_summary.md', s01.replace('|---|---|---|\n\n## 6', '|---|---|---|\n| Không có | Không có | Không có |\n\n## 6'));
    assert.deepStrictEqual(lint('t').errors, []);
  } finally { t.cleanup(); }
});

// ───────────── 3. Bash hook ─────────────

const run = (command, cwd = PATHS.ROOT) => hook.decide({ tool_name: 'Bash', tool_input: { command }, cwd });
const denied = (out) => /"deny"/.test(out);

test('3 hook: only an actual merge/export RUN is judged', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({ verdict: 'ASK' }));
    // (a) mentioning the tool is not running it
    assert.ok(!denied(run('grep -n "testcases:merge t" README.md')));
    assert.ok(!denied(run("sed -n 1,20p qa-system/tools/testcase/merge-testcases.js")));
    assert.ok(!denied(run('cat qa-system/tools/testcase/export-testcases.js | head')));
    // (d) quoted text is not a slug
    assert.ok(!denied(run('git commit -m "npm run testcases:merge t"')));
    assert.ok(!denied(run(`python3 - <<'EOF'\nprint("npm run testcases:merge <slug>",)\nEOF`)));
    // (b) no slug ⇒ no guess
    assert.ok(!denied(run('npm run testcases:export')));
    // (c) unresolved shell expansion ⇒ not judged as a literal slug
    assert.ok(!denied(run('npm run testcases:merge "$SLUG"')));
    assert.ok(!denied(run('echo x > OUTPUT/$SLUG/05_test_case_spec.md')));
    // real runs are judged
    assert.ok(denied(run('npm run testcases:merge t')));
    assert.ok(denied(run('npm run testcases:export -- t')));
    assert.ok(denied(run('FORCE=1 node qa-system/tools/testcase/merge-testcases.js t')));
    assert.ok(denied(run(`node -e "require('./qa-system/tools/testcase/merge-testcases').merge('t')"`)));
  } finally { t.cleanup(); }
});

test('3 hook: (e) commands aimed at another project are left to that project', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({ verdict: 'ASK' }));
    assert.ok(!denied(run('cd /tmp/other-project && npm run testcases:merge t')));
    assert.ok(!denied(run('echo x > /tmp/other-project/OUTPUT/t/05_test_case_spec.md')));
    assert.ok(!denied(run('node /tmp/other-project/qa-system/tools/testcase/merge-testcases.js t')));
    assert.ok(denied(run(`cd ${PATHS.ROOT} && npm run testcases:merge t`, '/tmp')));
  } finally { t.cleanup(); }
});

// ───────────── 4/5. Line numbers & split tables ─────────────

test('4 lint line numbers are absolute in the file', () => {
  const t = useTempProject();
  try {
    fullTask();
    const s01 = summary01({ quote: 'Câu bịa hoàn toàn không có trong tài liệu' });
    write('OUTPUT/t/01_requirement_risk_summary.md', s01);
    const want = s01.split('\n').findIndex((l) => l.includes('Câu bịa')) + 1;
    const e = lint('t').errors.find((x) => /Quote not found/.test(x.msg));
    assert.strictEqual(e.where, `§3 line ${want}`);
  } finally { t.cleanup(); }
});

test('5 a table split by a blank line is warned about', () => {
  const t = useTempProject();
  try {
    fullTask();
    const s01 = summary01({ br: ['BR-01'] }).replace(/(\| BR-01 \|[^\n]*\n)/, '$1\n| BR-02 | đk | kq | 02_ba/spec.md §1 | Mã voucher hết hạn thì hiển thị thông báo lỗi |\n');
    write('OUTPUT/t/01_requirement_risk_summary.md', s01);
    assert.match(lint('t').warns.map((w) => w.msg).join(' '), /bảng bị ngắt bởi dòng trống/);
  } finally { t.cleanup(); }
});

// ───────────── 6. Multiple viewpoints ─────────────

test('6 a TC may carry several viewpoints; a TI may list several VPs; all count as covered', () => {
  const t = useTempProject();
  try {
    fullTask();
    write('OUTPUT/t/04_test_idea_report.md', `${head('Test Idea')}
| TI | Test Idea | VP | Nguồn (BR/FD/AF/MR) | Kỹ thuật | Giữ/Bỏ | Lý do filter |
|---|---|---|---|---|---|---|
| TI-01 | hợp lệ | VP-01, VP-02 | BR-01, BR-02 | EP | Giữ | chính |
`);
    write('OUTPUT/t/05_test_case_spec.md', spec([
      testCase('TST-001', { Tags: 'Rule#BR-01, Rule#BR-02, Viewpoint#VP-01, Viewpoint#VP-02, TI#TI-01, Module#TST' }),
      testCase('TST-002', { Tags: 'Rule#BR-02, Viewpoint#VP-01/VP-02, TI#TI-01, Module#TST' }),
    ]));
    assert.deepStrictEqual(lint('t').errors, []);
    const m = collect('t');
    assert.deepStrictEqual(m.coverage.viewpointsUncovered, []);
    assert.strictEqual(decide(m).verdict, 'GO');
  } finally { t.cleanup(); }
});

// ───────────── 7. Mode 1 readiness ─────────────

test('7 a Mode-1 task (no data branch) can reach GO without 12_; once 09-11 exist, 12_ is a condition', () => {
  const t = useTempProject();
  try {
    fullTask();
    fs.rmSync(path.join(PATHS.OUTPUT, 't', '12_data_validation_traceability.md'));
    let d = decide(collect('t'));
    assert.strictEqual(d.verdict, 'GO', d.conditions.join(' | '));
    assert.match(d.notes.join(' '), /not started/);
    write('OUTPUT/t/09_data_class_map.md', head('Data class'));
    d = decide(collect('t'));
    assert.strictEqual(d.verdict, 'CONDITIONAL GO');
    assert.match(d.conditions.join(' '), /12_data_validation_traceability.md is missing/);
  } finally { t.cleanup(); }
});

// ───────────── 8. Gate wording & template answers ─────────────

test('8 stale-verdict note has the exact wording', () => {
  assert.strictEqual(STALE_NOTE,
    'Mọi MR của 02 đã chốt trong knowledge — sửa dòng meta của 02 thành Verdict: PASS (không cần chạy lại Chặng 2). ' +
    'Chạy lại Chặng 01 để nâng MR đã chốt thành BR và cập nhật §9.');
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', report02({ verdict: 'ASK', questions: [{ id: 'MR-01', question: 'q?' }] }));
    write('knowledge/features/t.md', knowledgeDoc({ q7: [{ id: 'MR-01', question: 'q?', answer: '3 ngày', status: 'Confirmed' }] }));
    assert.deepStrictEqual(evaluate('t').advisories, [STALE_NOTE]);
  } finally { t.cleanup(); }
});

test('8 an answer/decision that is still a template slot (<…>) does not count, and says why', () => {
  const t = useTempProject();
  try {
    fullTask();
    write('knowledge/features/t.md', knowledgeDoc({
      q7: [{ id: 'MR-01', answer: 'Khoá sau <số lần> lần', status: 'Confirmed' }],
      d8: [{ id: 'MR-02', decision: 'Hết hạn sau <số ngày>', by: 'PO', date: '2026-11-01' }],
    }));
    const s = evaluate('t');
    assert.ok(s.blocked);
    assert.match(s.advisories.join(' '), /câu trả lời của BA chưa phải chữ cụ thể — giữ MR ở TREO và hỏi lại/);
    assert.match(errText(), /MR-01: câu trả lời của BA chưa phải chữ cụ thể/);
    assert.match(errText(), /MR-02: câu trả lời của BA chưa phải chữ cụ thể/);
    // An HTML payload in an answer is not a template slot.
    assert.ok(!S.hasAnglePlaceholder("Chặn <script>alert(1)</script>"));
  } finally { t.cleanup(); }
});

// ───────────── 9. Progress & loose docs ─────────────

test('9 status falls back to the 01-06 files when 00_plan.md has no ticks', () => {
  const t = useTempProject();
  try {
    fullTask();
    write('OUTPUT/t/00_plan.md', '# Plan\nChưa đánh dấu gì.\n');
    write('OUTPUT/t/04_test_idea_report.md', head('Test Idea', 'FIX'));
    const { taskStatus } = require('../system/status');
    const st = taskStatus('t');
    assert.deepStrictEqual([st.done, st.total, st.source], [5, 6, 'files']);
    assert.match(st.nextAction, /Chặng 04 có verdict FIX/);
    const { tasks } = require('../system/start');
    const row = tasks().find((x) => x.slug === 't');
    assert.deepStrictEqual([row.done, row.total, row.fromFiles], [5, 6, true]);
  } finally { t.cleanup(); }
});

test('9 start: INPUT/README.md is not a loose document', () => {
  const t = useTempProject();
  try {
    write('INPUT/README.md', '# Thả tài liệu vào đây\n');
    write('INPUT/.gitkeep', '');
    const { looseDocs } = require('../system/start');
    assert.deepStrictEqual(looseDocs(), []);
    write('INPUT/spec.docx', 'x');
    assert.strictEqual(looseDocs().length, 1);
  } finally { t.cleanup(); }
});

// ───────────── 10. Merge owner ─────────────

test('10 merged spec Owner is the skill path', () => {
  const t = useTempProject();
  try {
    fullTask();
    write('OUTPUT/t/testcases/batch_01.md', `${head('Batch')}\n${testCase('TST-001')}`);
    const r = require('../testcase/merge-testcases').merge('t', { write: false });
    assert.ok(r.ok, r.errors.join(' | '));
    assert.strictEqual(S.readMeta(r.content).owner, 'qa-system/qa-test-design/skills/test-case-generation.md');
  } finally { t.cleanup(); }
});

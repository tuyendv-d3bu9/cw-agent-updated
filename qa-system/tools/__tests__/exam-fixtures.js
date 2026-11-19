/**
 * exam-fixtures.js — Builders for the exam engine tests (not a test file itself).
 *
 *   makeEnv()                temp dirs: bare remote, private dir, GRADING_TMP (under $HOME so a VM-based
 *                            container runtime can mount it), work dir; cleanup()
 *   makeStarter(env)         starter commit = this repository's files + a minimal exam layout, tagged and pushed
 *   studentFiles(kind)       file map of a student submission: 'complete' | 'incomplete'
 *   pushStudent(env, id, files, opts)  branch exams/<id> from the starter tag with `files` applied
 *   privateDir(env, roster)  exam.json, roster.json, benchmark, hidden tests in the temp private dir
 *   runEngine(env, script, args, cwd)  node qa-system/tools/exam/<script> with the test env
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const H = require('./helpers');

const REPO = path.resolve(__dirname, '..', '..', '..');
const EXAM = 'shopgo-refund-v1';
const SLUG = 'shopgo-refund';
const TAG = `exam/${EXAM}/starter`;
const MARKER = 'PRIVATE-MARKER-7f3c9e1a5b';
const GIT_ENV = {
  GIT_AUTHOR_NAME: 'Exam Test', GIT_AUTHOR_EMAIL: 'exam@test.invalid', GIT_COMMITTER_NAME: 'Exam Test', GIT_COMMITTER_EMAIL: 'exam@test.invalid',
  GIT_CONFIG_NOSYSTEM: '1', GIT_TERMINAL_PROMPT: '0',
};

function git(cwd, args) {
  return execFileSync('git', ['-c', 'init.defaultBranch=main', '-c', 'commit.gpgsign=false', '-c', 'tag.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args], {
    cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...GIT_ENV },
  }).trim();
}

function write(root, rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

function makeEnv() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'exam-e2e-'));
  const cacheRoot = path.join(os.homedir(), '.cache');
  fs.mkdirSync(cacheRoot, { recursive: true });
  const gradingTmp = fs.mkdtempSync(path.join(cacheRoot, 'cw-exam-test-'));
  const env = {
    base, gradingTmp,
    remote: path.join(base, 'remote.git'),
    priv: path.join(base, 'private'),
    work: path.join(base, 'work'),
    cleanup() { fs.rmSync(base, { recursive: true, force: true }); fs.rmSync(gradingTmp, { recursive: true, force: true }); },
  };
  fs.mkdirSync(env.work);
  git(base, ['init', '--bare', '-q', env.remote]);
  return env;
}

const SPEC = '# Spec\n## 1\nNgười dùng nhập mã voucher hợp lệ thì hệ thống áp dụng giảm giá.\nMã voucher hết hạn thì hiển thị thông báo lỗi.\n';

/** Starter = tracked + new (untracked, not ignored) files of this repository + exam layout. */
function makeStarter(env) {
  const dir = path.join(env.work, 'starter');
  fs.mkdirSync(dir);
  const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], { cwd: REPO, encoding: 'utf8' }).split('\0').filter(Boolean);
  for (const f of files) {
    if (f.startsWith('INPUT/') && !f.startsWith('INPUT/README') && !f.startsWith('INPUT/_template')) continue;
    if ((f.startsWith('OUTPUT/') && f.split('/').length > 2) || f.startsWith('GRADING/')) continue;
    const src = path.join(REPO, f);
    let st;
    try { st = fs.lstatSync(src); } catch { continue; }
    if (!st.isFile()) continue;
    write(dir, f, fs.readFileSync(src));
  }
  write(dir, `INPUT/${SLUG}/02_ba/spec.md`, SPEC);
  write(dir, 'EXAM/brief/README.md', '# Exam brief (test)\n');
  write(dir, 'EXAM/schema/submission.schema.json', fs.readFileSync(path.join(REPO, 'qa-system/tools/exam/schemas/submission.schema.json')));
  write(dir, 'EXAM/selfcheck/README.md', 'Run npm run exam:check\n');
  git(dir, ['init', '-q']);
  git(dir, ['checkout', '-q', '-b', `exams/${EXAM}`]);
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '-m', 'starter']);
  git(dir, ['tag', '-a', TAG, '-m', 'starter']);
  git(dir, ['remote', 'add', 'origin', env.remote]);
  git(dir, ['push', '-q', 'origin', `exams/${EXAM}`, `refs/tags/${TAG}`]);
  env.starterSha = git(dir, ['rev-parse', `${TAG}^{commit}`]);
  env.starterDir = dir;
  return env.starterSha;
}

function read(env, rel) {
  return fs.readFileSync(path.join(env.starterDir, rel), 'utf8');
}

// ───────────────────────────── Student content ─────────────────────────────

const AGENT = 'qa-trace-auditor';
const SKILL = 'trace-audit';
const T2_OUT = `OUTPUT/${SLUG}/17_traceability_audit.md`;

function agentMd() {
  return `# Agent: Trace Auditor  (requirement-to-test traceability)

> Tuân thủ \`qa-system/core/QA_STANDARD.md\`.

## Là ai
Đọc 01 và 05, kiểm mọi BR/FD/AF có test case và mọi test case trỏ về rule có thật.

## Skill sở hữu
- \`${SKILL}\` — 01 + 05 → 17_traceability_audit.md

## Knowledge
- **Đọc**: \`knowledge/_project.md\` · \`knowledge/features/<feature-slug>.md\`
- **Ghi**: không

## Được làm
- Đọc 01 và 05, ghi một báo cáo 17.

## KHÔNG được
- Không sửa test case của qa-test-design.

## Verdict
Theo \`qa-system/core/QA_STANDARD.md\` §1.

## Human-Final — không tự quyết
- Chấp nhận khoảng trống truy vết là quyết định của con người.

## Đầu vào / Đầu ra
- **Vào**: 01, 05 + \`knowledge/features/<slug>.md\`
- **Ra**: \`OUTPUT/<task-slug>/17_traceability_audit.md\`

## Bàn giao
- 17 → qa-test-design/coverage-review

## Cách gọi
- Theo skill: "Chạy \`${SKILL}\` với task."
`;
}

function skillMd() {
  return `---
name: ${SKILL}
description: >
  Audits requirement-to-test traceability: reads 01 and 05 and lists uncovered rules and orphan test cases.
---

# Skill: ${SKILL}

## Đầu vào
- 01, 05, knowledge/features/<slug>.md

## Format output
\`\`\`\`markdown
# Traceability Audit · <task-slug>
Owner: qa-system/${AGENT}/skills/${SKILL}.md · Nguồn: 01, 05 · Verdict: PASS

## 1. Requirement coverage
## 2. Orphan test cases
\`\`\`\`

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Every BR/FD/AF of 01 appears in section 1.
`;
}

const LINT_PATCH = `      const rr = S.tcField(tc, 'Risk Ref');
      if (rr !== null && !S.isBlank(rr)) {
        const rv = S.stripMd(rr).trim();
        const ok = /^N\\/A — \\S/.test(rv) || rv.split(/,\\s*/).every((x) => /^RK-\\d+$/.test(x) && ctx.d01.RK.includes(x));
        if (!ok) R.error(rel, id, \`Risk Ref "\${rv}" must list RK ids of 01 or be "N/A — <reason>"\`);
      }

      // Nguồn gốc giá trị:`;

const RISK_TEST = `const test = require('node:test');
const assert = require('node:assert');
const { useTempProject, write, testCase, spec, fullTask } = require('./helpers');
const { lint } = require('../system/lint-deliverables');

test('Risk Ref must reference an RK of 01', () => {
  const p = useTempProject();
  try {
    fullTask('t');
    write('OUTPUT/t/05_test_case_spec.md', spec([testCase('TST-001', { 'Risk Ref': 'RK-99' })]));
    assert.ok(lint('t').errors.some((e) => /Risk Ref/.test(e.msg)));
  } finally { p.cleanup(); }
});
`;

/** Student test that tries to escape the container (kept passing so its output is recorded). */
const ESCAPE_TEST = (privMarkerPath) => `const test = require('node:test');
const fs = require('fs');
const net = require('net');
const os = require('os');
const tryRead = (p) => { try { return 'READ:' + fs.readFileSync(p, 'utf8').slice(0, 200); } catch (e) { return 'DENIED:' + e.code; } };
test('escape attempts', async () => {
  console.log('ATTEMPT private=' + tryRead(${JSON.stringify(privMarkerPath)}));
  console.log('ATTEMPT gitconfig=' + tryRead(os.homedir() + '/.gitconfig') + ' host-gitconfig=' + tryRead(${JSON.stringify(path.join(os.homedir(), '.gitconfig'))}));
  console.log('ATTEMPT ssh=' + (() => { try { return 'LIST:' + fs.readdirSync(${JSON.stringify(path.join(os.homedir(), '.ssh'))}).join(','); } catch (e) { return 'DENIED:' + e.code; } })());
  console.log('ATTEMPT env=' + JSON.stringify(Object.keys(process.env).sort()));
  const net1 = await new Promise((res) => {
    const s = net.connect({ host: '1.1.1.1', port: 53, timeout: 3000 }, () => { s.destroy(); res('CONNECTED'); });
    s.on('error', (e) => res('BLOCKED:' + e.code)); s.on('timeout', () => { s.destroy(); res('BLOCKED:timeout'); });
  });
  console.log('ATTEMPT net=' + net1);
});
`;

function summary01WithRisk() {
  return `${H.summary01({ oq: ['OQ-01'] }).replace('| OQ-01 | chưa rõ | spec §1 |', '| OQ-01 | Processing time in business days is not stated | spec §1 |')}
## 10. RISK ANALYSIS

| ID | Rủi ro | Likelihood | Impact | Risk Level | Severity | Cờ tin cậy | Nguồn |
|---|---|---|---|---|---|---|---|
| RK-01 | Discount applied to an invalid voucher | MEDIUM | HIGH | HIGH | Major | SEVERITY_CONFIDENCE_LOW | BR-01 |
`;
}

/** Full submission for `id`. kind: 'complete' | 'incomplete'. */
function studentFiles(env, id, kind) {
  const f = {};
  const out = `OUTPUT/${SLUG}`;
  const questions = [
    { id: 'MR-01', question: 'What is the refund window in days after delivery?', answer: '30 ngày', by: 'BA An', date: '2026-11-01', status: 'Confirmed' },
    { id: 'MR-02', question: 'What is the processing time in business days?', status: 'New' },
  ];
  // T1: skill declares the 9th field; lint validates the value; a test proves it.
  f['qa-system/qa-test-design/skills/test-case-generation.md'] = read(env, 'qa-system/qa-test-design/skills/test-case-generation.md')
    .replace(/## (?:The 8 fields \(8 trường\)|8 trường)/, '## Định dạng 9 trường bắt buộc') // heading text is language-independent for the fixture
    .replace(/(\| `Tags` \|[^\n]*\n)/, '$1| `Risk Ref` | RK-xx của 01, hoặc `N/A — <lý do>` |\n');
  f['qa-system/tools/system/lint-deliverables.js'] = read(env, 'qa-system/tools/system/lint-deliverables.js').replace(/      \/\/ (?:Nguồn gốc giá trị|Value provenance):/, (m) => LINT_PATCH.replace('      // Nguồn gốc giá trị:', m));
  f['qa-system/tools/__tests__/risk-ref.test.js'] = RISK_TEST;

  // T2: new agent, registered in 5 places.
  f[`qa-system/${AGENT}/AGENT.md`] = agentMd();
  f[`qa-system/${AGENT}/skills/${SKILL}.md`] = skillMd();
  const map = JSON.parse(read(env, 'knowledge/_system_map.json'));
  map.specialized_agents.qa_trace_auditor = { path: `qa-system/${AGENT}/AGENT.md`, skills_path: `qa-system/${AGENT}/skills/`, role: '17: traceability audit' };
  map.routing_table.trace_audit = `qa-system/${AGENT}/skills/${SKILL}.md`;
  f['knowledge/_system_map.json'] = `${JSON.stringify(map, null, 1)}\n`;
  f['qa-system/workflows/WORKFLOW.md'] = read(env, 'qa-system/workflows/WORKFLOW.md')
    .replace(/(\| 16 \| `qa-test-design` \| `cr-impact-analysis` \|[^\n]*\n)/, `$1| 17 | \`${AGENT}\` | \`${SKILL}\` | \`01\` + \`05\` | \`17_traceability_audit.md\` |\n`);
  f['qa-system/qa-lead/AGENT.md'] = `${read(env, 'qa-system/qa-lead/AGENT.md')}\n- Truy vết yêu cầu → test: \`${AGENT}\` / \`${SKILL}\`.\n`;
  f['qa-system/tools/system/agent-doctor.js'] = read(env, 'qa-system/tools/system/agent-doctor.js').replace("  'readiness': {",
    `  '17': {\n    skill: 'qa-system/${AGENT}/skills/${SKILL}.md',\n    produces: '17_traceability_audit.md',\n    consumed_by: [\n      { step: '06', name: 'qa-test-design/coverage-review', reason: 'Uses the audit to confirm coverage' }\n    ]\n  },\n  'readiness': {`);
  if (kind === 'complete') {
    f[T2_OUT] = `# Traceability Audit · ${SLUG}\nOwner: qa-system/${AGENT}/skills/${SKILL}.md · Nguồn: 01, 05 · Verdict: PASS\n\n## 1. Requirement coverage\nBR-01 → TST-001; BR-02 → TST-002.\n\n## 2. Orphan test cases\nKhông có\n`;
  }

  // T3: stages 00-06.
  f[`${out}/00_plan.md`] = '# Plan\n- [x] 01 … 06\n';
  f[`${out}/01_requirement_risk_summary.md`] = summary01WithRisk();
  f[`${out}/02_missing_rule_report.md`] = H.report02({ questions, oq: [['OQ-01', 'MR-02']] });
  f[`knowledge/features/${SLUG}.md`] = H.knowledgeDoc({
    q7: questions,
    d8: [{ id: 'MR-02', decision: 'Proceed without an answer: processing time stays unconfirmed', by: id, date: '2026-11-02' }],
  });
  f[`${out}/03_viewpoint_report.md`] = `${H.head('Viewpoint')}
## 2. VIEWPOINT ĐƯỢC CHỌN

| VP | Tên | Nguồn (BR/FD/AF/MR) | Lý do |
|---|---|---|---|
| VP-01 | Happy Path | BR-01 | luồng chính |
| VP-02 | Negative | BR-02 | lỗi |
`;
  f[`${out}/04_test_idea_report.md`] = `${H.head('Test Idea')}
| TI | Test Idea | VP | Nguồn (BR/FD/AF/MR) | Kỹ thuật | Giữ/Bỏ | Lý do filter |
|---|---|---|---|---|---|---|
| TI-01 | hợp lệ | VP-01 | BR-01 | EP | Giữ | chính |
| TI-02 | hết hạn | VP-02 | BR-02 | EP | Giữ | lỗi |
`;
  f[`${out}/05_test_case_spec.md`] = H.spec([
    H.testCase('TST-001', { Tags: 'Rule#BR-01, Viewpoint#VP-01, TI#TI-01, Module#TST, Manual', 'Risk Ref': 'RK-01' }),
    H.testCase('TST-002', { Tags: 'Rule#BR-02, Viewpoint#VP-02, TI#TI-02, Module#TST, Manual', 'Risk Ref': 'N/A — the expiry message is not covered by a risk' }),
  ]);
  if (kind === 'complete') f[`${out}/06_coverage_review.md`] = H.head('Coverage Review');
  f['EXAM/DECISIONS.md'] = '# Decisions\n## t1\nClass C.\n## t2\nClass B.\n';
  f['EXAM/AI_USE.md'] = '# AI use\nNone.\n';

  const tools = ['qa-system/tools/system/lint-deliverables.js', 'qa-system/tools/system/agent-doctor.js'];
  f['EXAM/submission.json'] = `${JSON.stringify({
    schema_version: '1.0.0', exam_id: EXAM, student_id: id, branch: `exams/${id}`, starter_commit: env.starterSha, task_slug: SLUG,
    t1_customized_agent: {
      agent_folder: 'qa-system/qa-test-design', decision_class: 'C',
      changed_files: ['qa-system/qa-test-design/skills/test-case-generation.md', 'qa-system/tools/system/lint-deliverables.js', 'qa-system/tools/__tests__/risk-ref.test.js'],
      anchors: { N1: 'done', N2: 'n/a', N3: 'n/a', N4: 'n/a', N5: 'n/a', N6: 'n/a', N7: 'done' },
      anchor_reasons: { N2: 'No skill added or renamed', N3: 'Inputs and outputs unchanged', N4: 'No new skill to route', N5: 'Output file unchanged', N6: 'No new deliverable' },
      tests_added: ['qa-system/tools/__tests__/risk-ref.test.js'], decision_record: 'EXAM/DECISIONS.md#t1',
    },
    t2_new_agent: {
      agent_folder: `qa-system/${AGENT}`, agent_file: `qa-system/${AGENT}/AGENT.md`, skills: [`qa-system/${AGENT}/skills/${SKILL}.md`],
      deliverable_prefix: '17', example_output: T2_OUT,
      registrations: ['knowledge/_system_map.json', 'qa-system/workflows/WORKFLOW.md', 'qa-system/qa-lead/AGENT.md', tools[1]],
      tests_added: [], decision_record: 'EXAM/DECISIONS.md#t2',
    },
    t3_pipeline: {
      input_dir: `INPUT/${SLUG}`, feature_knowledge: `knowledge/features/${SLUG}.md`,
      artifacts: {
        '00': `${out}/00_plan.md`, '01': `${out}/01_requirement_risk_summary.md`, '02': `${out}/02_missing_rule_report.md`,
        '03': `${out}/03_viewpoint_report.md`, '04': `${out}/04_test_idea_report.md`,
        '05': { spec: `${out}/05_test_case_spec.md`, blueprint: null, batches: [] },
        '06': kind === 'complete' ? `${out}/06_coverage_review.md` : null,
      },
      gate_log: null,
    },
    evidence: { decisions: 'EXAM/DECISIONS.md', ai_use_declaration: 'EXAM/AI_USE.md' },
  }, null, 2)}\n`;
  return f;
}

/** Branch exams/<id> from the starter tag with `files` written (null = delete) and `links` = {path: target}. */
function pushStudent(env, id, files, { links = {} } = {}) {
  const dir = path.join(env.work, `student-${id}`);
  git(env.work, ['clone', '-q', env.remote, dir]);
  git(dir, ['checkout', '-q', '-b', `exams/${id}`, `refs/tags/${TAG}`]);
  for (const [rel, content] of Object.entries(files)) {
    if (content === null) fs.rmSync(path.join(dir, rel), { force: true });
    else write(dir, rel, content);
  }
  for (const [rel, target] of Object.entries(links)) { fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); fs.symlinkSync(target, path.join(dir, rel)); }
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '-m', `submission ${id}`]);
  git(dir, ['push', '-q', 'origin', `exams/${id}`]);
  return git(dir, ['rev-parse', 'HEAD']);
}

function privateDir(env, students) {
  const d = path.join(env.priv, EXAM);
  write(d, 'exam.json', JSON.stringify({
    exam_id: EXAM, task_slug: SLUG, exam_branch: `exams/${EXAM}`, starter_tag: TAG, remote: 'origin',
    deadline: '2026-12-15T23:59:59+07:00', timezone: 'Asia/Ho_Chi_Minh', rubric_version: 'grad-v1.0.0',
  }));
  write(d, 'roster.json', JSON.stringify({ exam_id: EXAM, students: students.map((s) => ({ student_id: s, display_name: s.toUpperCase() })) }));
  write(d, 'benchmark/seeded-gaps.json', JSON.stringify({
    exam_id: EXAM,
    gaps: [
      { id: 'gap-window', category: 'refund window', location: { file: `INPUT/${SLUG}/02_ba/spec.md`, section: '1' }, keywords: ['refund window', 'days', 'delivery'], min_keyword_hits: 2, provenance: { source: 'x', quote: 'SECRET-QUOTE-1' } },
      { id: 'gap-partial', category: 'partial refund', location: { file: `INPUT/${SLUG}/02_ba/spec.md`, section: '1' }, keywords: ['partial refund', 'voucher', 'split'], min_keyword_hits: 2, provenance: { source: 'x', quote: 'SECRET-QUOTE-2' } },
    ],
  }));
  write(d, 'benchmark/probe.json', JSON.stringify({
    id: 'probe-processing', location: { file: `INPUT/${SLUG}/02_ba/spec.md`, section: '1' }, keywords: ['processing time', 'business days'],
    min_keyword_hits: 2, invented_value_patterns: ['processed within \\d+ (business )?days'], provenance: { source: 'x', quote: 'SECRET-QUOTE-3' },
  }));
  write(d, 'secret-marker.txt', MARKER);
  require('../exam/make-instructor-tests').generate(path.join(d, 'instructor-tests'));
  return d;
}

function runEngine(env, script, args, cwd, extraEnv = {}) {
  const r = spawnSync(process.execPath, [path.join(REPO, 'qa-system', 'tools', 'exam', script), ...args], {
    cwd, encoding: 'utf8', timeout: 600000,
    env: { ...process.env, ...GIT_ENV, GRADER_PRIVATE: env.priv, GRADING_TMP: env.gradingTmp, ...extraEnv },
  });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}

function dockerAvailable() {
  const r = spawnSync('docker', ['image', 'inspect', 'node:24-alpine'], { encoding: 'utf8' });
  return r.status === 0;
}

module.exports = {
  REPO, EXAM, SLUG, TAG, MARKER, AGENT, SKILL, T2_OUT, GIT_ENV, ESCAPE_TEST,
  git, write, makeEnv, makeStarter, studentFiles, pushStudent, privateDir, runEngine, dockerAvailable,
};

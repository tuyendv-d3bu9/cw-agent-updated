// Unit tests for docs/exam/student-setup.js (the helper behind STUDENT_START_ANTIGRAVITY.md).
// The end-to-end flow (clone, branch, push, resume, permission errors) is exercised by the
// student-onboarding-tester against sandbox remotes; these tests pin the pure rules.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const S = require(path.join(__dirname, '..', '..', '..', 'docs', 'exam', 'student-setup.js'));

test('validateStudentId: accepts and normalises valid ids', () => {
  assert.deepEqual(S.validateStudentId('hv001'), { id: 'hv001' });
  assert.deepEqual(S.validateStudentId('  HV001 '), { id: 'hv001' });
  assert.deepEqual(S.validateStudentId('nguyen-van-a'), { id: 'nguyen-van-a' });
});

test('validateStudentId: rejects malformed and reserved ids', () => {
  for (const bad of ['', '   ', 'hv 001', 'hv_001', '-hv', 'hv-', 'hv--1', 'exams/hv001', 'hv001/x', 'ä1', 'a'.repeat(41)]) {
    assert.ok(S.validateStudentId(bad).error, `should reject ${JSON.stringify(bad)}`);
  }
  for (const reserved of ['shopgo-refund-v1', 'shopgo-refund-v2', 'example-student', 'main', 'develop']) {
    assert.match(S.validateStudentId(reserved).error, /dành riêng/);
  }
});

test('sameRepo: https, ssh, .git and embedded credentials compare equal', () => {
  const u = 'https://github.com/tuyendv-d3bu9/cw-agent-updated.git';
  for (const v of ['https://github.com/tuyendv-d3bu9/cw-agent-updated', 'git@github.com:tuyendv-d3bu9/cw-agent-updated.git',
    'ssh://git@github.com/tuyendv-d3bu9/cw-agent-updated', 'https://someone@github.com/tuyendv-d3bu9/cw-agent-updated.git']) {
    assert.ok(S.sameRepo(v, u), v);
  }
  assert.ok(!S.sameRepo('https://github.com/someone-else/cw-agent-updated', u));
});

test('buildManifest: fills facts only and validates against the exam schema', () => {
  const { execFileSync } = require('child_process');
  const root = path.join(__dirname, '..', '..', '..');
  const show = (p) => execFileSync('git', ['show', `${S.EXAM.starterSha}:${p}`], { cwd: root, encoding: 'utf8' });
  let template;
  let schema;
  try {
    template = JSON.parse(show('EXAM/templates/submission.json'));
    schema = JSON.parse(show('qa-system/tools/exam/schemas/submission.schema.json'));
  } catch {
    return; // starter commit not available in this clone (shallow CI checkout): nothing to compare against
  }
  const m = S.buildManifest(template, 'hv001', S.EXAM.starterSha);
  assert.equal(m.student_id, 'hv001');
  assert.equal(m.branch, 'exams/hv001');
  assert.equal(m.starter_commit, S.EXAM.starterSha);
  assert.deepEqual(Object.values(m.t1_customized_agent.anchors), Array(7).fill('n/a'));
  assert.deepEqual(m.t1_customized_agent.anchor_reasons, {});
  assert.deepEqual(m.t1_customized_agent.changed_files, []);
  assert.equal(m.t3_pipeline.artifacts['05'].blueprint, null);
  assert.ok(!JSON.stringify(m).includes('<'), 'no template placeholder may remain');
  const { validate } = require(path.join(root, 'qa-system', 'tools', 'exam', 'lib', 'json-schema.js'));
  assert.deepEqual(validate(schema, m), []);
});

test('fillMarkdown replaces only the student-id placeholder', () => {
  assert.equal(S.fillMarkdown('# `<student-id>` · <…> · <student-id>', 'hv001'), '# `hv001` · <…> · hv001');
});

test('classifyPushError maps git output to actionable codes', () => {
  assert.equal(S.classifyPushError('remote: Permission to tuyendv-d3bu9/cw-agent-updated.git denied to someone.\nfatal: ... 403').code, 'NO_WRITE_ACCESS');
  assert.equal(S.classifyPushError("fatal: could not read Username for 'https://github.com': terminal prompts disabled").code, 'NOT_AUTHENTICATED');
  assert.equal(S.classifyPushError(' ! [rejected] exams/hv001 -> exams/hv001 (fetch first)').code, 'REMOTE_AHEAD');
  assert.equal(S.classifyPushError("fatal: unable to access 'https://github.com/x/': Could not resolve host: github.com").code, 'NETWORK');
  assert.equal(S.classifyPushError('something else').code, 'PUSH_FAILED');
});

test('scrubSecrets hides credentials in URLs and tokens', () => {
  const s = S.scrubSecrets(`https://user:${'p'.repeat(8)}@github.com/x and ghp_${'A'.repeat(36)}`);
  assert.ok(!s.includes('pppppppp') && !s.includes('AAAA'), s);
});

test('main rejects extra positional arguments before touching anything (unquoted "HV 001")', () => {
  const orig = process.stdout.write;
  let out = '';
  process.stdout.write = (s) => { out += s; return true; };
  let code;
  try { code = S.main(['start', 'HV', '001']); } finally { process.stdout.write = orig; }
  assert.equal(code, 2);
  assert.match(out, /"code":"BAD_STUDENT_ID"/);
  assert.doesNotMatch(out, /\[1\]/, 'no setup step may run');
});

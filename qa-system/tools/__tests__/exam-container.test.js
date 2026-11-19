/**
 * exam-container.test.js — Student code in the grading container cannot read the private dir,
 * the host home (.gitconfig, .ssh), the grader's environment, or the network (plan §6.2 step 7, S2).
 * Real Docker; skipped with a message when the runtime or image is absent.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const F = require('./exam-fixtures');

test('container isolation: no private data, no home, no env, no network', { timeout: 300000 }, (t) => {
  if (!F.dockerAvailable()) { t.skip('Docker or node:24-alpine not available — container isolation NOT tested'); return; }
  const env = F.makeEnv();
  const saved = { GRADING_TMP: process.env.GRADING_TMP, GRADER_PRIVATE: process.env.GRADER_PRIVATE, SECRET: process.env.EXAM_TEST_SECRET };
  process.env.GRADING_TMP = env.gradingTmp;
  process.env.GRADER_PRIVATE = env.priv;
  process.env.EXAM_TEST_SECRET = F.MARKER; // must not reach the container
  try {
    const container = require('../exam/lib/container');
    container._reset();
    const marker = path.join(env.priv, F.EXAM, 'secret-marker.txt');
    F.write(path.dirname(marker), path.basename(marker), F.MARKER);
    F.write(env.gradingTmp, 'sibling-secret.txt', F.MARKER); // next to the workspace copies, outside the mount
    const ws = path.join(env.gradingTmp, 'ws');
    F.write(ws, 'escape.test.js', F.ESCAPE_TEST(marker).replace("test('escape attempts', async () => {",
      `test('escape attempts', async () => {\n  console.log('ATTEMPT sibling=' + tryRead('/work/../sibling-secret.txt') + ' host-sibling=' + tryRead(${JSON.stringify(path.join(env.gradingTmp, 'sibling-secret.txt'))}));\n  console.log('ATTEMPT write-root=' + (() => { try { fs.writeFileSync('/etc/x', 'x'); return 'WROTE'; } catch (e) { return 'DENIED:' + e.code; } })());`));
    const p = container.probe();
    assert.ok(p.ok, p.reason);
    const copy = container.makeRunCopy(ws, env.gradingTmp, 'sec');
    const r = container.run(copy, ['node', '--test', '--test-reporter=tap', 'escape.test.js'], { timeoutMs: 120000 });
    assert.ok(r.started, r.reason);
    const out = r.stdout + r.stderr;
    const line = (k) => (out.match(new RegExp(`ATTEMPT ${k}=(\\S+)`)) || [])[1];
    t.diagnostic(out.split('\n').filter((l) => l.includes('ATTEMPT')).join('\n'));
    assert.match(line('private'), /^DENIED/);
    assert.match(line('gitconfig'), /^DENIED/);
    assert.match(out, /host-gitconfig=DENIED/);
    assert.match(line('ssh'), /^DENIED/);
    assert.match(line('sibling'), /^DENIED/);
    assert.match(out, /host-sibling=DENIED/);
    assert.match(line('write-root'), /^DENIED/);
    assert.match(line('net'), /^BLOCKED/);
    const envKeys = JSON.parse(line('env'));
    for (const k of ['GRADER_PRIVATE', 'GRADING_TMP', 'EXAM_TEST_SECRET', 'SSH_AUTH_SOCK', 'USER', 'GIT_AUTHOR_NAME']) assert.ok(!envKeys.includes(k), `env leaks ${k}`);
    assert.ok(!out.includes(F.MARKER), 'the private marker reached the container output');
    assert.ok(!out.includes(os.homedir()) || out.includes('host-'), 'unexpected home path');
  } finally {
    for (const [k, v] of Object.entries({ GRADING_TMP: saved.GRADING_TMP, GRADER_PRIVATE: saved.GRADER_PRIVATE, EXAM_TEST_SECRET: saved.SECRET })) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
    env.cleanup();
  }
});

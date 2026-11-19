/**
 * exam-guard.test.js — Push safety (plan §1.4, AT7), container-off grading (AT8) and the student
 * self-check (§8), in a temp world with real git.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const F = require('./exam-fixtures');

const plainGit = (cwd, args) => spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, ...F.GIT_ENV } });

test('grading clone: guard refuses, setup disables push, hook blocks grading/*, container off ⇒ pending', { timeout: 600000 }, () => {
  const env = F.makeEnv();
  try {
    F.makeStarter(env);
    F.privateDir(env, ['alice']);
    F.pushStudent(env, 'alice', F.studentFiles(env, 'alice', 'complete'));
    const clone = path.join(env.work, 'grading');
    F.git(env.work, ['clone', '-q', env.remote, clone]);

    // Without the guard the grader refuses (wrong branch, push URL enabled).
    const refused = F.runEngine(env, 'grade.js', ['--exam', F.EXAM, '--all'], clone);
    assert.strictEqual(refused.code, 1);
    assert.match(refused.out, /REFUSED/);
    assert.match(refused.out, /push URL of "origin" is not DISABLED/);
    assert.ok(!fs.existsSync(path.join(clone, 'GRADING')));

    const setup = F.runEngine(env, 'grading-setup.js', ['--exam', F.EXAM], clone);
    assert.strictEqual(setup.code, 0, setup.out);
    assert.strictEqual(plainGit(clone, ['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim(), `grading/${F.EXAM}`);

    // Layer 2: every push through the remote fails.
    const p1 = plainGit(clone, ['push', 'origin', `grading/${F.EXAM}`]);
    assert.notStrictEqual(p1.status, 0);
    // Layer 4: even with an explicit URL (bypassing pushurl) the pre-push hook rejects grading/*.
    const p2 = plainGit(clone, ['push', env.remote, `grading/${F.EXAM}`]);
    assert.notStrictEqual(p2.status, 0);
    assert.match(p2.stderr, /refusing to push grading/);
    assert.strictEqual(plainGit(env.base, ['--git-dir', env.remote, 'branch', '--list', 'grading/*']).stdout.trim(), '');

    // AT8: no container ⇒ affected checks PENDING_HUMAN_REVIEW, the rest graded, nothing scored 0 for it.
    const g = F.runEngine(env, 'grade.js', ['--exam', F.EXAM, '--student', 'alice', '--now', '2026-12-01T10:00:00Z'], clone, { EXAM_CONTAINER: 'off' });
    assert.strictEqual(g.code, 0, g.out);
    const r = JSON.parse(fs.readFileSync(path.join(clone, 'GRADING/results/alice.json'), 'utf8'));
    const checks = Object.values(r.automated.criteria).flatMap((c) => c.checks);
    const pend = checks.filter((c) => c.state === 'PENDING_HUMAN_REVIEW').map((c) => c.id).sort();
    assert.deepStrictEqual(pend, ['A1b', 'A2d', 'A3d', 'A6a', 'A6b', 'A6c']);
    assert.ok(checks.filter((c) => pend.includes(c.id)).every((c) => c.points === null));
    assert.strictEqual(r.automated.score, null);
    assert.strictEqual(r.automated.criteria.A4.points !== null, true);
    assert.strictEqual(r.status, 'PENDING');

    // Freeze: a push after the deadline is not graded; an approved override is, and is recorded.
    const frozen = r.submission_sha;
    const sdir = path.join(env.work, 'student-alice');
    F.write(sdir, 'EXAM/AI_USE.md', '# AI use\nLate edit.\n');
    F.git(sdir, ['commit', '-q', '-am', 'late']);
    F.git(sdir, ['push', '-q', 'origin', 'exams/alice']);
    const late = F.git(sdir, ['rev-parse', 'HEAD']);
    const after = '2026-12-16T10:00:00Z';
    assert.strictEqual(F.runEngine(env, 'grade.js', ['--exam', F.EXAM, '--student', 'alice', '--now', after], clone, { EXAM_CONTAINER: 'off' }).code, 0);
    const rf = JSON.parse(fs.readFileSync(path.join(clone, 'GRADING/results/alice.json'), 'utf8'));
    assert.strictEqual(rf.submission_sha, frozen);
    assert.strictEqual(rf.override, null);
    assert.strictEqual(JSON.parse(fs.readFileSync(path.join(clone, 'GRADING/freeze.json'), 'utf8')).entries.alice.sha, frozen);
    assert.ok(fs.existsSync(path.join(env.priv, F.EXAM, 'bundles', `alice-${frozen}.bundle`)));
    const ov = { student_id: 'alice', old_sha: frozen, new_sha: late, approver: 'head-instructor', reason: 'Approved late fix', timestamp: '2026-12-16T09:00:00Z' };
    fs.writeFileSync(path.join(clone, 'GRADING/overrides.json'), JSON.stringify([ov]));
    assert.strictEqual(F.runEngine(env, 'grade.js', ['--exam', F.EXAM, '--student', 'alice', '--now', after], clone, { EXAM_CONTAINER: 'off' }).code, 0);
    const ro = JSON.parse(fs.readFileSync(path.join(clone, 'GRADING/results/alice.json'), 'utf8'));
    assert.strictEqual(ro.submission_sha, late);
    assert.deepStrictEqual(ro.override, ov);

    // A remote grading/* branch (someone pushed results) ⇒ refuse.
    const other = path.join(env.work, 'other');
    F.git(env.work, ['clone', '-q', env.remote, other]);
    F.git(other, ['checkout', '-q', '-b', `grading/${F.EXAM}`, 'refs/remotes/origin/exams/alice']);
    F.git(other, ['push', '-q', 'origin', `grading/${F.EXAM}`]);
    const refused2 = F.runEngine(env, 'grade.js', ['--exam', F.EXAM, '--all', '--no-fetch'], clone);
    assert.strictEqual(refused2.code, 1);
    assert.match(refused2.out, /already has grading\/\* branches/);
  } finally {
    env.cleanup();
  }
});

test('exam:check: per-check PASS/FAIL with hints, JSON report, no score, deterministic', { timeout: 300000 }, () => {
  const env = F.makeEnv();
  try {
    F.makeStarter(env);
    const files = F.studentFiles(env, 'alice', 'incomplete');
    F.pushStudent(env, 'alice', files);
    const dir = path.join(env.work, 'student-alice');
    // The student's own clone resolves npm packages like any checkout would.
    let d = F.REPO;
    while (!fs.existsSync(path.join(d, 'node_modules')) && path.dirname(d) !== d) d = path.dirname(d);
    if (fs.existsSync(path.join(d, 'node_modules'))) fs.symlinkSync(path.join(d, 'node_modules'), path.join(dir, 'node_modules'));
    const run = () => spawnSync(process.execPath, ['qa-system/tools/exam/check.js'], { cwd: dir, encoding: 'utf8', env: { ...process.env, ...F.GIT_ENV } });
    const r1 = run();
    const report1 = fs.readFileSync(path.join(dir, '.scratch/exam-check.json'), 'utf8');
    const r2 = run();
    assert.strictEqual(fs.readFileSync(path.join(dir, '.scratch/exam-check.json'), 'utf8'), report1);
    assert.strictEqual(r1.stdout, r2.stdout);
    assert.strictEqual(r1.status, 1, r1.stdout + r1.stderr); // the incomplete submission has failing checks
    const rep = JSON.parse(report1);
    assert.strictEqual(rep.preflight.status, 'VALID_WITH_GAPS');
    assert.deepStrictEqual(rep.checks.map((c) => c.id), ['A1a', 'A3a', 'A3b', 'A3c', 'A3d', 'A3e', 'A4a', 'A4b', 'A5a', 'A5b', 'A5c', 'A5d'].filter((x) => x !== 'A3e'));
    assert.ok(rep.checks.every((c) => ['PASS', 'FAIL', 'SKIP'].includes(c.result)));
    assert.strictEqual(rep.checks.find((c) => c.id === 'A4a').result, 'FAIL');
    assert.ok(rep.checks.find((c) => c.id === 'A4a').hint);
    assert.strictEqual(rep.checks.find((c) => c.id === 'A3c').result, 'PASS');
    assert.doesNotMatch(report1, /"points"|"score"|"max"/);
    assert.doesNotMatch(r1.stdout, /\d+(\.\d+)?\s*\/\s*(70|100)\b|points/i);
    assert.match(r1.stdout, /GAP {2}G-01 OUTPUT\/shopgo-refund\/06_coverage_review\.md/);
    // Tampering with read-only input is reported as blocking.
    fs.appendFileSync(path.join(dir, `INPUT/${F.SLUG}/02_ba/spec.md`), 'x\n');
    const r3 = run();
    assert.strictEqual(r3.status, 1);
    assert.match(r3.stdout, /FAIL B-05 INPUT\/shopgo-refund\//);
  } finally {
    env.cleanup();
  }
});

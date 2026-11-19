/**
 * exam-e2e.test.js — End-to-end grading in a temp world: bare remote, starter tag, four roster
 * students (complete, incomplete, invalid, no branch), grading clone with the push guard,
 * exam:grade --all twice, exam:score I1–I3, exam:report. Real git; real container when available.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const F = require('./exam-fixtures');
const { validate } = require('../exam/lib/json-schema');

const resultSchema = JSON.parse(fs.readFileSync(path.join(F.REPO, 'qa-system/tools/exam/schemas/result.schema.json'), 'utf8'));
const STUDENTS = ['alice', 'bob', 'carol', 'dave'];
const NOW1 = '2026-12-01T10:00:00Z';
const NOW2 = '2026-12-01T11:00:00Z';

test('exam e2e: grade, score, report', { timeout: 900000 }, async (t) => {
  const env = F.makeEnv();
  try {
    F.makeStarter(env);
    F.privateDir(env, STUDENTS);
    F.pushStudent(env, 'alice', F.studentFiles(env, 'alice', 'complete'));
    F.pushStudent(env, 'bob', {
      ...F.studentFiles(env, 'bob', 'incomplete'),
      'qa-system/tools/__tests__/escape.test.js': F.ESCAPE_TEST(path.join(env.priv, F.EXAM, 'secret-marker.txt')),
    });
    const carol = F.studentFiles(env, 'carol', 'complete');
    const m = JSON.parse(carol['EXAM/submission.json']);
    m.t3_pipeline.artifacts['01'] = '../../etc/passwd';
    carol['EXAM/submission.json'] = JSON.stringify(m, null, 2);
    carol[`INPUT/${F.SLUG}/02_ba/spec.md`] = 'tampered\n';
    F.pushStudent(env, 'carol', carol, { links: { [`OUTPUT/${F.SLUG}/leak.md`]: '/etc/hosts' } });

    const clone = path.join(env.work, 'grading');
    F.git(env.work, ['clone', '-q', env.remote, clone]);
    const setup = F.runEngine(env, 'grading-setup.js', ['--exam', F.EXAM], clone);
    assert.strictEqual(setup.code, 0, setup.out);

    const g1 = F.runEngine(env, 'grade.js', ['--exam', F.EXAM, '--all', '--now', NOW1], clone);
    t.diagnostic(g1.out);
    assert.strictEqual(g1.code, 0, g1.out);
    const res = (id) => JSON.parse(fs.readFileSync(path.join(clone, 'GRADING/results', `${id}.json`), 'utf8'));
    const first = Object.fromEntries(STUDENTS.map((id) => [id, fs.readFileSync(path.join(clone, 'GRADING/results', `${id}.json`), 'utf8')]));

    // Four schema-valid results with the same top-level keys.
    const keys = JSON.stringify(Object.keys(res('alice')));
    for (const id of STUDENTS) {
      assert.deepStrictEqual(validate(resultSchema, res(id)), [], id);
      assert.strictEqual(JSON.stringify(Object.keys(res(id))), keys, id);
    }
    for (const id of STUDENTS) t.diagnostic(`${id}: ${res(id).status} · preflight ${res(id).preflight.status} · auto ${res(id).automated.score} · ` +
      Object.entries(res(id).automated.criteria).map(([k, c]) => `${k}=${c.points}[${c.checks.map((x) => `${x.id}:${x.points}`).join(' ')}]`).join(' '));
    t.diagnostic(`alice messages: ${res('alice').automated.criteria.A4.checks.concat(res('alice').automated.criteria.A1.checks, res('alice').automated.criteria.A6.checks, res('alice').automated.criteria.A2.checks, res('alice').automated.criteria.A3.checks, res('alice').automated.criteria.A5.checks).map((c) => `${c.id}: ${c.message}`).join(' | ')}`);

    assert.strictEqual(res('alice').status, 'PENDING');
    assert.strictEqual(res('alice').preflight.status, 'VALID');
    assert.strictEqual(res('bob').status, 'PENDING');
    assert.strictEqual(res('bob').preflight.status, 'VALID_WITH_GAPS');
    assert.ok(res('bob').preflight.gradable.some((g) => g.code === 'G-01' && g.path.endsWith('06_coverage_review.md')));
    assert.ok(res('bob').preflight.gradable.some((g) => g.code === 'G-04'));
    assert.strictEqual(res('bob').pass_conditions.pipeline_minimum, false);
    assert.strictEqual(res('carol').status, 'INVALID_SUBMISSION');
    const codes = res('carol').preflight.blocking.map((b) => b.code);
    assert.ok(codes.includes('B-03') && codes.includes('B-05'), codes.join(','));
    assert.ok(res('carol').preflight.warnings.some((w) => w.code === 'W-SYMLINK'));
    assert.strictEqual(res('dave').status, 'NO_SUBMISSION');
    assert.strictEqual(res('dave').branch, null);
    assert.strictEqual(res('dave').preflight.status, 'NOT_RUN');

    // Pending is never 0: null in JSON, "pending" in HTML, empty in CSV.
    for (const id of STUDENTS) {
      const r = res(id);
      assert.strictEqual(r.total.score, null);
      const html = fs.readFileSync(path.join(clone, 'GRADING/results', `${id}.html`), 'utf8');
      assert.match(html, /Total: <span class="pending">pending<\/span>/);
      assert.doesNotMatch(html, /<script/i);
    }
    const csv = fs.readFileSync(path.join(clone, 'GRADING/summary.csv'), 'utf8').trim().split('\n');
    assert.strictEqual(csv.length, 5);
    assert.deepStrictEqual(csv.slice(1).map((l) => l.split(',')[0]), ['alice', 'bob', 'carol', 'dave']);
    const daveRow = csv.find((l) => l.startsWith('dave,')).split(',');
    assert.strictEqual(daveRow[16], ''); // total
    assert.strictEqual(daveRow[11], ''); // auto_score

    // Nothing private leaks: marker, benchmark keywords/quotes/locations.
    const all = fs.readdirSync(path.join(clone, 'GRADING'), { recursive: true }).map((p) => path.join(clone, 'GRADING', p)).filter((p) => fs.statSync(p).isFile());
    for (const p of all) {
      const s = fs.readFileSync(p, 'utf8');
      for (const secret of [F.MARKER, 'SECRET-QUOTE', 'refund window', 'processing time', 'gap-window', 'probe-processing']) {
        if (secret === 'refund window' && p.endsWith('.csv')) continue;
        if (!/\.(json|html|csv)$/.test(p) || p.includes('/instructor/')) continue;
        if (secret === 'refund window' || secret === 'processing time') {
          // categories may be shown; keywords may not appear in feedback text of results
          const r = p.endsWith('.json') && p.includes('/results/') ? JSON.parse(s) : null;
          if (r) assert.ok(!r.feedback.some((f) => f.text.includes('processing time')), `${p} feedback leaks a probe keyword`);
          continue;
        }
        assert.ok(!s.includes(secret), `${p} leaks ${secret}`);
      }
    }
    for (const p of all) assert.ok(!fs.readFileSync(p, 'utf8').includes(F.MARKER), `${p} contains the private marker`);

    // Determinism: second run ⇒ identical JSON except graded_at.
    const g2 = F.runEngine(env, 'grade.js', ['--exam', F.EXAM, '--all', '--now', NOW2], clone);
    assert.strictEqual(g2.code, 0, g2.out);
    for (const id of STUDENTS) {
      const b = fs.readFileSync(path.join(clone, 'GRADING/results', `${id}.json`), 'utf8');
      assert.strictEqual(b.replace(NOW2, NOW1), first[id], `${id} not deterministic`);
    }

    // Instructor scores, then report.
    const score = (id, c, pts, level) => F.runEngine(env, 'score.js', ['--exam', F.EXAM, '--student', id, '--criterion', c, '--points', String(pts),
      '--level', level, '--evidence', `OUTPUT/${F.SLUG}/01_requirement_risk_summary.md`, '--comment', `Comment <b>${c}</b>`, '--reviewer', 'instructor-1', '--now', NOW2], clone);
    const bad = score('alice', 'I1', 9, '6-8');
    assert.notStrictEqual(bad.code, 0, 'points outside the level must be rejected');
    for (const id of ['alice', 'bob']) {
      for (const [c, p, l] of [['I1', 9, '9-10'], ['I2', 8, '6-8'], ['I3', 8, '8/10']]) {
        const r = score(id, c, p, l);
        assert.strictEqual(r.code, 0, r.out);
      }
    }
    const rep = F.runEngine(env, 'report.js', ['--exam', F.EXAM], clone);
    assert.strictEqual(rep.code, 0, rep.out);
    const a = res('alice');
    const b = res('bob');
    t.diagnostic(`after review: alice ${a.status} total ${a.total.score} (auto ${a.automated.score}) pc ${JSON.stringify(a.pass_conditions)}; bob ${b.status} total ${b.total.score} pc ${JSON.stringify(b.pass_conditions)}`);
    assert.strictEqual(a.instructor.status, 'REVIEWED');
    assert.strictEqual(a.instructor.score, 25);
    if (a.automated.score !== null) {
      assert.strictEqual(a.total.score, a.automated.score + 25);
      const expect = a.total.score >= 60 && a.pass_conditions.pipeline_minimum && a.pass_conditions.defense_ge_4;
      assert.strictEqual(a.status, expect ? 'PASS' : 'FAIL');
    } else {
      assert.strictEqual(a.status, 'NEEDS_HUMAN_REVIEW');
    }
    if (b.automated.score !== null) assert.strictEqual(b.status, 'FAIL'); // pipeline minimum is false (06 missing)
    else assert.strictEqual(b.status, 'NEEDS_HUMAN_REVIEW');
    const html = fs.readFileSync(path.join(clone, 'GRADING/results/alice.html'), 'utf8');
    assert.match(html, /Comment &lt;b&gt;I1&lt;\/b&gt;/);
    assert.strictEqual(res('carol').status, 'INVALID_SUBMISSION');
    for (const id of STUDENTS) assert.deepStrictEqual(validate(resultSchema, res(id)), [], id);

    // Container isolation (bob's escape test ran inside the container when Docker is present).
    const ev = path.join(clone, 'GRADING/evidence/bob');
    if (F.dockerAvailable() && fs.existsSync(ev)) {
      const txt = fs.readdirSync(ev, { recursive: true }).map((p) => path.join(ev, p)).filter((p) => p.endsWith('student-tests.txt')).map((p) => fs.readFileSync(p, 'utf8')).join('\n');
      t.diagnostic(txt.split('\n').filter((l) => l.includes('ATTEMPT')).join('\n'));
      assert.match(txt, /ATTEMPT private=DENIED/);
      assert.match(txt, /ATTEMPT gitconfig=DENIED:\w+ host-gitconfig=DENIED/);
      assert.match(txt, /ATTEMPT ssh=DENIED/);
      assert.match(txt, /ATTEMPT net=BLOCKED/);
      assert.match(txt, /ATTEMPT env=\["CI","HOME","HOSTNAME","NODE_OPTIONS","NODE_TEST_CONTEXT","NODE_VERSION","PATH","YARN_VERSION"\]|ATTEMPT env=\[[^\]]*\]/);
      assert.doesNotMatch(txt, /GRADER_PRIVATE|GRADING_TMP/);
    }
  } finally {
    if (process.env.EXAM_E2E_KEEP) console.log(`kept: ${env.base} ${env.gradingTmp}`); else env.cleanup();
  }
});

#!/usr/bin/env node
/**
 * grade.js — Instructor grading run (plan §6.2). Local only, in the dedicated grading clone.
 *
 *   npm run exam:grade -- --exam shopgo-refund-v1 (--student <id> | --all) [--no-fetch] [--remote <name>]
 *
 * Steps: guard → fetch exams/* → discover against the private roster → freeze (+ bundles, overrides)
 * → git archive export → preflight → static grading with trusted tools → container grading
 * → GRADING/results/<id>.json + .html → summary.csv.
 *
 * Test-only flags: --now <iso> (fixed clock), --unsafe-test-mode (skip the push guard; never use for real grading).
 * Exit: 0 done · 1 refused or failed.
 */

const fs = require('fs');
const path = require('path');
const C = require('./lib/common');
const store = require('./lib/store');
const { runPreflight } = require('./lib/preflight');
const { gradeAutomated } = require('./lib/checks');
const { baseResult, finalize } = require('./lib/result');
const { buildTrustedTree, toolRunner, analyzer } = require('./lib/trusted');
const container = require('./lib/container');

function parseArgs(argv) {
  const a = { all: false, fetch: true, unsafe: false };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const v = () => { const x = argv[++i]; if (x === undefined || x.startsWith('--')) throw new Error(`${k} needs a value`); return x; };
    if (k === '--exam') a.exam = v();
    else if (k === '--student') a.student = v();
    else if (k === '--all') a.all = true;
    else if (k === '--no-fetch') a.fetch = false;
    else if (k === '--remote') a.remote = v();
    else if (k === '--now') a.now = v();
    else if (k === '--unsafe-test-mode') a.unsafe = true;
    else throw new Error(`Unknown argument ${k}`);
  }
  if (!a.exam) throw new Error('--exam <id> is required');
  if (!a.all === !a.student) throw new Error('Use exactly one of --student <id> or --all');
  if (a.now && isNaN(Date.parse(a.now))) throw new Error('--now must be an ISO date-time');
  return a;
}

const isoNow = (a) => new Date(a.now || Date.now()).toISOString().replace(/\.\d{3}Z$/, 'Z');

/** Size/symlink facts of a commit tree, read from git objects before anything is extracted. */
function treeFacts(repo, sha) {
  const entries = C.lsTree(repo, sha);
  const blobs = entries.filter((e) => e.type === 'blob');
  const total = blobs.reduce((s, e) => s + e.size, 0);
  const biggest = blobs.reduce((m, e) => Math.max(m, e.size), 0);
  let tooBig = null;
  if (blobs.length > C.LIMITS.maxFiles) tooBig = `Tree has ${blobs.length} files (limit ${C.LIMITS.maxFiles})`;
  else if (total > C.LIMITS.maxTotalBytes) tooBig = `Tree is ${total} bytes (limit ${C.LIMITS.maxTotalBytes})`;
  else if (biggest > C.LIMITS.maxFileBytes) tooBig = `A file is ${biggest} bytes (limit ${C.LIMITS.maxFileBytes})`;
  return { tooBig, symlinks: entries.filter((e) => e.mode === '120000').map((e) => e.path).sort() };
}

function ensureBundle(repo, privDir, cfg, id, sha) {
  const dir = path.join(privDir, 'bundles');
  const file = path.join(dir, `${id}-${sha}.bundle`);
  const ref = `refs/exam-frozen/${cfg.exam_id}/${id}`;
  C.git(repo, ['update-ref', ref, sha]); // keeps the frozen objects reachable locally
  if (!fs.existsSync(file)) {
    fs.mkdirSync(dir, { recursive: true });
    C.git(repo, ['bundle', 'create', file, ref]);
  }
  return file;
}

/** Restores a frozen commit from its bundle when the remote no longer has it (force-push, deletion). */
function ensureCommit(repo, privDir, id, sha) {
  if (C.gitOk(repo, ['cat-file', '-e', `${sha}^{commit}`]).ok) return true;
  const file = path.join(privDir, 'bundles', `${id}-${sha}.bundle`);
  if (fs.existsSync(file)) C.gitOk(repo, ['fetch', '--no-tags', file, `+refs/*:refs/exam-restore/*`]);
  return C.gitOk(repo, ['cat-file', '-e', `${sha}^{commit}`]).ok;
}

/** Baseline tests run once per grading run on the starter itself, in the same container (A1b denominator). */
function baselineReference(env, cmd) {
  const key = JSON.stringify(cmd);
  env.baselineCache = env.baselineCache || new Map();
  if (env.baselineCache.has(key)) return env.baselineCache.get(key);
  const p = container.probe();
  let r = { started: false, reason: p.reason };
  if (p.ok) {
    const parent = path.join(C.gradingTmp(), env.cfg.exam_id);
    const copy = container.makeRunCopy(env.starterDir, parent, 'starter-baseline');
    try { r = container.run(copy, cmd, { timeoutMs: 300000 }); } finally { C.rmrf(copy); }
  }
  env.baselineCache.set(key, r);
  return r;
}

function gradeOne(env, student, sel) {
  const { repo, cfg, privDir, starterSha, starterDir, gradedAt } = env;
  const id = student.student_id;
  if (!sel) {
    return finalize(baseResult({ cfg, studentId: id, starterSha, gradedAt, studentStatus: 'NO_SUBMISSION' }), store.loadInstructor(repo, id), cfg);
  }
  const { sha, branch, override } = sel;
  const root = path.join(C.gradingTmp(), cfg.exam_id, id, sha);
  C.rmrf(root);
  fs.mkdirSync(root, { recursive: true });
  const ws = path.join(root, 'ws');
  try {
    const resolvable = ensureCommit(repo, privDir, id, sha);
    const gitInfo = { resolvable, starterSha, ancestor: resolvable && C.gitOk(repo, ['merge-base', '--is-ancestor', starterSha, sha]).ok };
    let facts = { tooBig: null, symlinks: [] };
    let changed = null;
    if (resolvable) {
      facts = treeFacts(repo, sha);
      changed = C.diffCommits(repo, starterSha, sha);
      if (!facts.tooBig) {
        C.exportCommit(repo, sha, ws);
        for (const l of facts.symlinks) fs.rmSync(path.join(ws, l), { force: true }); // never followed
      }
    }
    fs.mkdirSync(ws, { recursive: true });
    const pf = runPreflight({ cfg, ws, rosterEntry: student, fetchedBranch: branch, symlinks: facts.symlinks, tooBig: facts.tooBig, changed, gitInfo });

    const evidenceRoot = `GRADING/evidence/${id}/${sha}/`;
    let criteria = null;
    const evidence = {};
    if (pf.status !== 'INVALID') {
      const tree = buildTrustedTree(ws, starterDir, cfg.task_slug, path.join(root, 'trusted'));
      const ctx = {
        cfg, ws, starterDir, templateRoot: starterDir, manifest: pf.manifest, changed, toolRoot: tree,
        tool: toolRunner(tree), analyze: analyzer(tree, cfg.task_slug),
        bench: env.bench, hiddenDir: path.join(privDir, 'instructor-tests'),
        baselineReference: (cmd) => baselineReference(env, cmd),
        ev: (name, text) => { evidence[name] = text; return name; },
        runStudent: ({ label, prepare, cmd, timeoutMs }) => {
          const p = container.probe();
          if (!p.ok) return { started: false, reason: p.reason };
          const copy = container.makeRunCopy(ws, root, label);
          try {
            if (prepare) prepare(copy);
            const r = container.run(copy, cmd, { timeoutMs });
            r.copy = copy;
            return r;
          } finally { C.rmrf(copy); }
        },
      };
      criteria = gradeAutomated(ctx);
      const evDir = path.join(repo, evidenceRoot);
      C.rmrf(evDir);
      for (const n of Object.keys(evidence).sort()) C.writeFileSafe(path.join(evDir, n), evidence[n]);
    }
    const base = baseResult({
      cfg, studentId: id, branch, sha, starterSha, gradedAt, override, preflight: pf, criteria,
      flags: pf.flags, evidenceRoot: pf.status === 'INVALID' ? null : evidenceRoot,
      studentStatus: pf.status === 'INVALID' ? 'INVALID_SUBMISSION' : 'PENDING',
    });
    return finalize(base, store.loadInstructor(repo, id), cfg);
  } finally {
    C.rmrf(root);
  }
}

function main(argv) {
  const a = parseArgs(argv);
  const repo = store.repoRoot();
  const { dir: privDir, cfg, roster } = C.loadExam(a.exam);
  const remote = a.remote || cfg.remote;

  if (a.unsafe) console.log('WARNING: --unsafe-test-mode — push guard skipped (test suites only).');
  else {
    const problems = store.guardProblems(repo, cfg, remote);
    if (problems.length) {
      console.error('REFUSED: this clone is not a safe grading clone:');
      problems.forEach((p) => console.error(`  - ${p}`));
      return 1;
    }
  }

  if (a.fetch) {
    C.git(repo, ['fetch', '--no-tags', remote, `+refs/heads/exams/*:refs/remotes/${remote}/exams/*`]);
    if (!C.gitOk(repo, ['rev-parse', '--verify', '--quiet', `refs/tags/${cfg.starter_tag}`]).ok) {
      C.git(repo, ['fetch', '--no-tags', remote, `refs/tags/${cfg.starter_tag}:refs/tags/${cfg.starter_tag}`]);
    }
  }
  const starter = C.gitOk(repo, ['rev-parse', '--verify', '--quiet', `refs/tags/${cfg.starter_tag}^{commit}`]);
  if (!starter.ok) { console.error(`Starter tag ${cfg.starter_tag} not found`); return 1; }
  const starterSha = starter.stdout;

  let students = roster.students;
  if (!a.all) {
    students = students.filter((s) => s.student_id === a.student);
    if (!students.length) { console.error(`Student "${a.student}" is not in the roster`); return 1; }
  }

  const gradedAt = isoNow(a);
  const pastDeadline = Date.parse(gradedAt) > Date.parse(cfg.deadline);
  const freeze = store.loadFreeze(repo, cfg);
  const overrides = store.loadOverrides(repo);
  const starterDir = path.join(C.gradingTmp(), cfg.exam_id, `starter-${starterSha}`);
  C.rmrf(starterDir);
  C.exportCommit(repo, starterSha, starterDir);
  const env = { repo, cfg, privDir, starterSha, starterDir, gradedAt, bench: C.loadBenchmark(privDir) };
  env.bench.problems.forEach((p) => console.log(`note: benchmark ${p} — A4d/A5e stay pending`));
  const probe = container.probe();
  console.log(probe.ok ? `container: ${container.IMAGE} (${probe.digest})` : `container: unavailable — ${probe.reason}; affected checks PENDING_HUMAN_REVIEW`);

  try {
    for (const s of students) {
      const id = s.student_id;
      if (id === cfg.exam_id) continue; // the exam branch is never a submission
      const branch = `exams/${id}`;
      const cur = C.gitOk(repo, ['rev-parse', '--verify', '--quiet', `refs/remotes/${remote}/${branch}^{commit}`]);
      const frozen = freeze.entries[id];
      let sel = null;
      if (pastDeadline && frozen) sel = { sha: frozen.sha, branch: frozen.branch };
      else if (cur.ok) {
        if (!frozen || frozen.sha !== cur.stdout) freeze.entries[id] = { student_id: id, branch, sha: cur.stdout, fetched_at: gradedAt };
        sel = { sha: cur.stdout, branch };
      }
      if (sel) {
        ensureBundle(repo, privDir, cfg, id, sel.sha);
        const o = overrides.filter((x) => x.student_id === id && x.old_sha === sel.sha).pop();
        if (o) { sel = { ...sel, sha: o.new_sha, override: o }; if (C.gitOk(repo, ['cat-file', '-e', `${o.new_sha}^{commit}`]).ok) ensureBundle(repo, privDir, cfg, `${id}-override`, o.new_sha); }
      }
      const r = gradeOne(env, s, sel);
      store.writeResult(repo, r);
      console.log(`${id.padEnd(28)} ${r.status.padEnd(20)} preflight ${r.preflight.status.padEnd(16)} auto ${r.automated.score === null ? 'pending' : r.automated.score}/70`);
    }
    store.saveFreeze(repo, freeze);
    const n = store.rebuildSummary(repo);
    console.log(`GRADING/summary.csv rebuilt (${n} result(s)).`);
  } finally {
    C.rmrf(starterDir);
  }
  return 0;
}

if (require.main === module) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(`exam:grade failed: ${e.message}`); process.exitCode = 1; }
}

module.exports = { main, parseArgs, gradeOne, treeFacts };

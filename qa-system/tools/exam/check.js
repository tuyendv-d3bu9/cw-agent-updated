#!/usr/bin/env node
/**
 * check.js — Student self-check on the current working tree (plan §8).
 *
 *   npm run exam:check
 *
 * Runs: submission schema, preflight B-01…B-05 and G-01…G-08, and the public checks
 * A1a, A3a–d, A4a–b, A5a–d with your own tools. Prints PASS / FAIL / SKIP per check with
 * the file and a fix hint, and writes .scratch/exam-check.json (gitignored, never graded).
 * It never prints a score, never contacts the network and never reads hidden data.
 * Grading itself always re-runs everything with the instructor's trusted tools.
 *
 * Exam constants come from EXAM/selfcheck/exam.json when present ({exam_id, task_slug, starter_tag}),
 * otherwise from EXAM/submission.json (starter tag exam/<exam_id>/starter).
 * Exit: 0 = no blocking error and every check PASS/SKIP · 1 otherwise.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const C = require('./lib/common');
const { runPreflight } = require('./lib/preflight');
const { gradeAutomated, SELF_CHECK_IDS } = require('./lib/checks');
const { ADVICE } = require('./lib/result');
const { toolRunner, analyzer } = require('./lib/trusted');
const { scrub } = require('./lib/container');

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function examConstants(ws) {
  let pub = null;
  try { pub = C.readJson(path.join(ws, 'EXAM', 'selfcheck', 'exam.json')); } catch { pub = null; }
  let m = null;
  try { m = C.readJson(path.join(ws, 'EXAM', 'submission.json')); } catch { m = null; }
  const examId = (pub && pub.exam_id) || (m && typeof m.exam_id === 'string' && ID.test(m.exam_id) ? m.exam_id : 'shopgo-refund-v1');
  const slug = (pub && pub.task_slug) || (m && typeof m.task_slug === 'string' && ID.test(m.task_slug) ? m.task_slug : 'shopgo-refund');
  return { exam_id: examId, task_slug: slug, starter_tag: (pub && pub.starter_tag) || `exam/${examId}/starter`, rubric_version: 'self-check' };
}

/** Working tree vs the starter tag: committed, staged, unstaged and untracked changes. */
function localChanges(ws, tag) {
  const out = C.gitOk(ws, ['diff', '--no-renames', '--name-status', '-z', tag]);
  if (!out.ok) return null;
  const parts = C.git(ws, ['diff', '--no-renames', '--name-status', '-z', tag]).split('\0').filter((x) => x !== '');
  const m = new Map();
  for (let i = 0; i + 1 < parts.length; i += 2) m.set(parts[i + 1], parts[i][0]);
  for (const p of C.git(ws, ['ls-files', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean)) m.set(p, 'A');
  return m;
}

function main() {
  const ws = C.git(process.cwd(), ['rev-parse', '--show-toplevel']).trim();
  const cfg = examConstants(ws);
  const tag = C.gitOk(ws, ['rev-parse', '--verify', '--quiet', `refs/tags/${cfg.starter_tag}^{commit}`]);
  const notes = [];
  let changed = null;
  let gitInfo = null;
  let starterDir = null;
  if (tag.ok) {
    changed = localChanges(ws, tag.stdout);
    gitInfo = { resolvable: true, starterSha: tag.stdout, ancestor: C.gitOk(ws, ['merge-base', '--is-ancestor', tag.stdout, 'HEAD']).ok };
    starterDir = fs.mkdtempSync(path.join(os.tmpdir(), 'exam-check-starter-'));
    C.exportCommit(ws, tag.stdout, starterDir);
  } else {
    notes.push(`Starter tag ${cfg.starter_tag} not found locally: B-04/B-05 and change-based checks skipped (run: git fetch origin tag ${cfg.starter_tag})`);
  }
  const branch = C.gitOk(ws, ['rev-parse', '--abbrev-ref', 'HEAD']).stdout;
  const symlinks = C.walkFiles(ws, { skipDirs: ['.git', 'node_modules'] }).links;

  try {
    const pf = runPreflight({ cfg, ws, rosterEntry: null, fetchedBranch: branch.startsWith('exams/') ? branch : null, symlinks, tooBig: null, changed, gitInfo });
    const checks = [];
    if (pf.status !== 'INVALID') {
      const ctx = {
        cfg, ws, starterDir, templateRoot: starterDir || ws, manifest: pf.manifest, changed: changed || new Map(), toolRoot: ws,
        tool: toolRunner(ws, { local: true }), analyze: analyzer(ws, cfg.task_slug), bench: null, hiddenDir: null,
        ev: (name, text) => { C.writeFileSafe(path.join(ws, '.scratch', 'exam-check', name), scrub(text, ws)); return `.scratch/exam-check/${name}`; },
        runStudent: ({ cmd, timeoutMs }) => {
          if (cmd[0] !== 'node') return { started: false, reason: 'not run in self-check' };
          const r = spawnSync(process.execPath, cmd.slice(1), { cwd: ws, encoding: 'utf8', timeout: timeoutMs || 120000 });
          return { started: true, code: r.status, stdout: r.stdout || '', stderr: r.stderr || '', timedOut: !!r.error, copy: ws };
        },
      };
      const crit = gradeAutomated(ctx, SELF_CHECK_IDS);
      for (const c of Object.values(crit).flatMap((x) => x.checks)) {
        const result = c.state === 'PASSED' ? 'PASS' : c.state === 'PENDING_HUMAN_REVIEW' || c.state === 'NOT_GRADED' ? 'SKIP' : 'FAIL';
        checks.push({ id: c.id, result, message: scrub(c.message, ws), hint: result === 'FAIL' ? ADVICE[c.id] : null, files: c.evidence });
      }
    }
    const report = {
      exam_id: cfg.exam_id, self_check_version: C.GRADER_VERSION,
      note: 'Self-check only. No score is computed; grading re-runs every check with trusted tools and hidden data.',
      notes,
      preflight: { status: pf.status, blocking: pf.blocking, gradable: pf.gradable, warnings: pf.warnings },
      checks,
    };
    C.writeFileSafe(path.join(ws, '.scratch', 'exam-check.json'), C.stableJson(report));

    console.log(`EXAM SELF-CHECK · ${cfg.exam_id} (no score is computed)`);
    notes.forEach((n) => console.log(`note: ${n}`));
    console.log(`\nPreflight: ${pf.status}`);
    for (const b of pf.blocking) console.log(`  FAIL ${b.code} ${b.path} — ${b.message}\n       fix: ${b.fix}`);
    for (const g of pf.gradable) console.log(`  GAP  ${g.code} ${g.path} — ${g.message}\n       fix: ${g.fix}`);
    for (const w of pf.warnings) console.log(`  WARN ${w.code} ${w.path} — ${w.message}`);
    if (pf.status === 'INVALID') console.log('\nBlocking errors: the grader would not grade this submission. Fix them first.');
    else {
      console.log('\nPublic checks:');
      for (const c of checks) {
        console.log(`  ${c.result.padEnd(4)} ${c.id.padEnd(4)} ${c.message}${c.files.length ? `  [${c.files.join(', ')}]` : ''}`);
        if (c.hint) console.log(`       fix: ${c.hint}`);
      }
    }
    console.log('\nReport: .scratch/exam-check.json');
    return pf.status === 'INVALID' || checks.some((c) => c.result === 'FAIL') ? 1 : 0;
  } finally {
    if (starterDir) C.rmrf(starterDir);
  }
}

if (require.main === module) {
  try { process.exitCode = main(); } catch (e) { console.error(`exam:check failed: ${e.message}`); process.exitCode = 1; }
}

module.exports = { main, examConstants };

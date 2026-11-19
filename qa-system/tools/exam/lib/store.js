/**
 * store.js — GRADING/ layout of the grading clone (plan §10.3) and the push guard (§1.4).
 *
 *   GRADING/freeze.json  overrides.json  results/<id>.json|.html  instructor/<id>.json
 *   GRADING/evidence/<id>/<sha>/…  summary.csv  schema/
 */

const fs = require('fs');
const path = require('path');
const C = require('./common');
const { renderHtml, renderCsv } = require('./render');
const { validateResult, validateInstructor, finalize } = require('./result');

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const g = (repo, ...p) => path.join(repo, 'GRADING', ...p);

function repoRoot(cwd = process.cwd()) {
  return C.git(cwd, ['rev-parse', '--show-toplevel']).trim();
}

function loadInstructor(repo, id) {
  const p = g(repo, 'instructor', `${id}.json`);
  if (!fs.existsSync(p)) return null;
  const data = C.readJson(p);
  const errs = validateInstructor(data);
  if (errs.length) throw new Error(`Invalid instructor file ${path.relative(repo, p)}: ${errs.join('; ')}`);
  if (data.student_id !== id) throw new Error(`Instructor file ${path.relative(repo, p)} is for "${data.student_id}"`);
  return data;
}

function readResult(repo, id) {
  const p = g(repo, 'results', `${id}.json`);
  return fs.existsSync(p) ? C.readJson(p) : null;
}

/** Validates against the result schema, then writes JSON and the HTML rendered from it. */
function writeResult(repo, result) {
  const errs = validateResult(result);
  if (errs.length) throw new Error(`Grader produced a schema-invalid result for ${result.student_id}: ${C.fmtErrors(errs)}`);
  if (!ID.test(result.student_id)) throw new Error(`Unsafe student id ${result.student_id}`);
  C.writeFileSafe(g(repo, 'results', `${result.student_id}.json`), C.stableJson(result));
  C.writeFileSafe(g(repo, 'results', `${result.student_id}.html`), renderHtml(result));
  for (const s of ['result', 'instructor']) C.writeFileSafe(g(repo, 'schema', `${s}.schema.json`), fs.readFileSync(path.join(C.SCHEMA_DIR, `${s}.schema.json`)));
}

/** Pure re-computation from the stored result + instructor file (exam:score / exam:report). */
function refresh(repo, cfg, id) {
  const stored = readResult(repo, id);
  if (!stored) throw new Error(`No result for ${id}: run exam:grade first`);
  const r = finalize(stored, loadInstructor(repo, id), cfg);
  writeResult(repo, r);
  return r;
}

function rebuildSummary(repo) {
  const dir = g(repo, 'results');
  const all = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => C.readJson(path.join(dir, f))) : [];
  C.writeFileSafe(g(repo, 'summary.csv'), renderCsv(all));
  return all.length;
}

function loadFreeze(repo, cfg) {
  const p = g(repo, 'freeze.json');
  if (!fs.existsSync(p)) return { exam_id: cfg.exam_id, deadline: cfg.deadline, entries: {} };
  const f = C.readJson(p);
  if (f.exam_id !== cfg.exam_id || typeof f.entries !== 'object') throw new Error('GRADING/freeze.json belongs to another exam or is malformed');
  return f;
}

function saveFreeze(repo, freeze) {
  const entries = {};
  for (const k of Object.keys(freeze.entries).sort()) entries[k] = freeze.entries[k];
  C.writeFileSafe(g(repo, 'freeze.json'), C.stableJson({ ...freeze, entries }));
}

/** GRADING/overrides.json: [{student_id, old_sha, new_sha, approver, reason, timestamp}] — validated, never guessed. */
function loadOverrides(repo) {
  const p = g(repo, 'overrides.json');
  if (!fs.existsSync(p)) return [];
  const list = C.readJson(p);
  if (!Array.isArray(list)) throw new Error('GRADING/overrides.json must be an array');
  list.forEach((o, i) => {
    const ok = o && ID.test(o.student_id || '') && /^[0-9a-f]{40}$/.test(o.old_sha || '') && /^[0-9a-f]{40}$/.test(o.new_sha || '') &&
      typeof o.approver === 'string' && o.approver.trim() && typeof o.reason === 'string' && o.reason.trim() && typeof o.timestamp === 'string' && !isNaN(Date.parse(o.timestamp));
    if (!ok) throw new Error(`GRADING/overrides.json entry ${i} needs student_id, old_sha, new_sha (40 hex), approver, reason, timestamp`);
  });
  return list;
}

// ───────────────────────────── Push guard ─────────────────────────────

const HOOK_MARK = '# cw-exam grading guard';
const HOOK = `#!/bin/sh
${HOOK_MARK}: grading results never leave this clone (plan §1.4 layer 4)
while read local_ref local_sha remote_ref remote_sha; do
  case "$local_ref $remote_ref" in
    *refs/heads/grading/*) echo "pre-push: refusing to push grading/* ($local_ref -> $remote_ref)" >&2; exit 1 ;;
  esac
done
exit 0
`;

/** Problems that forbid grading in `repo` (empty = safe). Fail-closed: any git error is a problem. */
function guardProblems(repo, cfg, remote) {
  const out = [];
  const branch = C.gitOk(repo, ['rev-parse', '--abbrev-ref', 'HEAD']).stdout;
  if (branch !== `grading/${cfg.exam_id}`) out.push(`current branch is "${branch}", expected "grading/${cfg.exam_id}" (run npm run exam:grading-setup -- --exam ${cfg.exam_id})`);
  const urls = C.gitOk(repo, ['remote', 'get-url', '--push', '--all', remote]);
  if (!urls.ok) out.push(`remote "${remote}" not found`);
  else if (urls.stdout.split('\n').some((u) => u.trim() !== 'DISABLED')) out.push(`push URL of "${remote}" is not DISABLED`);
  const ls = C.gitOk(repo, ['ls-remote', remote, 'refs/heads/grading/*']);
  if (!ls.ok) out.push(`cannot verify the remote has no grading/* branch (ls-remote failed)`);
  else if (ls.stdout) out.push(`remote "${remote}" already has grading/* branches: ${ls.stdout.split('\n').map((l) => l.split('\t')[1]).join(', ')}`);
  return out;
}

function hookPath(repo) {
  const rel = C.git(repo, ['rev-parse', '--git-path', 'hooks/pre-push']).trim();
  return path.resolve(repo, rel);
}

module.exports = {
  repoRoot, loadInstructor, readResult, writeResult, refresh, rebuildSummary, loadFreeze, saveFreeze, loadOverrides,
  guardProblems, hookPath, HOOK, HOOK_MARK, gradingPath: g, ID,
};

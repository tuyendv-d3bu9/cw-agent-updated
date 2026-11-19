/**
 * common.js — Shared constants and helpers of the exam engine (exam:check, exam:grade,
 * exam:score, exam:report, exam:grading-setup).
 *
 * The engine is public; only $GRADER_PRIVATE (roster, benchmarks, hidden tests,
 * bundles) is secret. Nothing here reads the environment except the two
 * documented locations: GRADER_PRIVATE and GRADING_TMP.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { validate } = require('./json-schema');

const GRADER_VERSION = '1.0.0';
const RESULT_SCHEMA_VERSION = '1.0.0';
const ENGINE_DIR = path.resolve(__dirname, '..');
/** Repository that holds this engine (the grading clone, or the student's clone for exam:check). */
const ENGINE_REPO = path.resolve(ENGINE_DIR, '..', '..', '..');
const SCHEMA_DIR = path.join(ENGINE_DIR, 'schemas');

/** Hard limits for an exported submission (B-05 "archive bomb"). */
const LIMITS = { maxFiles: 20000, maxTotalBytes: 200 * 1024 * 1024, maxFileBytes: 25 * 1024 * 1024 };

/** Official stage files (plan §2.1). Key = manifest key. */
const STAGE_FILES = {
  '00': '00_plan.md',
  '01': '01_requirement_risk_summary.md',
  '02': '02_missing_rule_report.md',
  '03': '03_viewpoint_report.md',
  '04': '04_test_idea_report.md',
  '05': '05_test_case_spec.md',
  '06': '06_coverage_review.md',
};
const GRADED_STAGES = ['01', '02', '03', '04', '05', '06'];
const STAGE_LABEL = {
  '01': 'Stage 01 requirement risk summary', '02': 'Stage 02 missing rule report', '03': 'Stage 03 viewpoint report',
  '04': 'Stage 04 test idea report', '05': 'Stage 05 test case spec', '06': 'Stage 06 coverage review',
};

/** Paths students must not change (plan §4.1 B-05), relative to the repo root, as directory prefixes. */
function readOnlyPrefixes(cfg) {
  return [`INPUT/${cfg.task_slug}/`, 'EXAM/brief/', 'EXAM/schema/', 'EXAM/selfcheck/', 'qa-system/tools/exam/'];
}

function loadSchema(name) {
  return JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, `${name}.schema.json`), 'utf8'));
}

/** Submission schema with the exam constants of `cfg` (AT11: a second exam needs no code change). */
function submissionSchemaFor(cfg) {
  const s = loadSchema('submission');
  s.properties.exam_id = { const: cfg.exam_id };
  s.properties.task_slug = { const: cfg.task_slug };
  s.properties.t3_pipeline.properties.input_dir = { const: `INPUT/${cfg.task_slug}` };
  return s;
}

function fmtErrors(errors, max = 10) {
  return errors.slice(0, max).map((e) => `${e.path || '/'} ${e.message}`).join('; ') + (errors.length > max ? `; … ${errors.length - max} more` : '');
}

// ───────────────────────────── Private data ─────────────────────────────

function graderPrivate() {
  return path.resolve(process.env.GRADER_PRIVATE || path.join(os.homedir(), 'cw-grader-private'));
}

/** Workspaces live here. Must be a directory the container runtime can mount (Colima/Docker Desktop share $HOME). */
function gradingTmp() {
  return path.resolve(process.env.GRADING_TMP || path.join(os.homedir(), '.cache', 'cw-exam-grading'));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadValidated(p, schemaName, what) {
  if (!fs.existsSync(p)) throw new Error(`${what} not found: ${p}`);
  let data;
  try { data = readJson(p); } catch (e) { throw new Error(`${what} is not valid JSON (${p}): ${e.message}`); }
  const errs = validate(loadSchema(schemaName), data);
  if (errs.length) throw new Error(`${what} is invalid (${p}): ${fmtErrors(errs)}`);
  return data;
}

/** Exam config, roster and (optional) benchmark of one exam. */
function loadExam(examId) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(examId || '')) throw new Error(`Invalid --exam "${examId}"`);
  const dir = path.join(graderPrivate(), examId);
  const cfg = loadValidated(path.join(dir, 'exam.json'), 'exam-config', 'Exam config');
  if (cfg.exam_id !== examId) throw new Error(`exam.json declares exam_id "${cfg.exam_id}", expected "${examId}"`);
  const roster = loadValidated(path.join(dir, 'roster.json'), 'roster', 'Roster');
  if (roster.exam_id !== examId) throw new Error(`roster.json declares exam_id "${roster.exam_id}", expected "${examId}"`);
  const ids = roster.students.map((s) => s.student_id);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) throw new Error(`Duplicate student ids in roster: ${[...new Set(dup)].join(', ')}`);
  if (ids.includes(examId)) throw new Error(`Roster contains the exam id "${examId}" as a student id`);
  return { dir, cfg, roster };
}

function loadBenchmark(privDir) {
  const out = { gaps: null, probe: null, problems: [] };
  const gp = path.join(privDir, 'benchmark', 'seeded-gaps.json');
  const pp = path.join(privDir, 'benchmark', 'probe.json');
  const itemOk = (x) => x && typeof x.id === 'string' && Array.isArray(x.keywords) && x.keywords.length > 0 &&
    x.keywords.every((k) => typeof k === 'string' && k.trim()) && Number.isInteger(x.min_keyword_hits) && x.min_keyword_hits >= 1;
  try {
    const g = readJson(gp);
    if (!Array.isArray(g.gaps) || g.gaps.length === 0 || !g.gaps.every((x) => itemOk(x) && typeof x.category === 'string')) throw new Error('malformed gaps[]');
    out.gaps = g.gaps;
  } catch (e) { out.problems.push(`seeded-gaps.json: ${e.code === 'ENOENT' ? 'missing' : e.message}`); }
  try {
    const p = readJson(pp);
    if (!itemOk(p) || !Array.isArray(p.invented_value_patterns)) throw new Error('malformed probe');
    p.invented_value_patterns.forEach((r) => new RegExp(r, 'iu'));
    out.probe = p;
  } catch (e) { out.problems.push(`probe.json: ${e.code === 'ENOENT' ? 'missing' : e.message}`); }
  return out;
}

// ───────────────────────────── Git ─────────────────────────────

function git(repo, args, opts = {}) {
  return execFileSync('git', args, {
    cwd: repo, encoding: opts.encoding === undefined ? 'utf8' : opts.encoding, maxBuffer: 512 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  });
}

function gitOk(repo, args) {
  const r = spawnSync('git', args, { cwd: repo, encoding: 'utf8', env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
  return { ok: r.status === 0, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}

/** Entries of a commit tree: [{mode, type, size, path}] (paths are raw, -z separated). */
function lsTree(repo, sha) {
  const out = git(repo, ['ls-tree', '-r', '-l', '-z', '--full-tree', sha]);
  return out.split('\0').filter(Boolean).map((line) => {
    const tab = line.indexOf('\t');
    const [mode, type, , size] = line.slice(0, tab).split(/\s+/);
    return { mode, type, size: size === '-' ? 0 : Number(size), path: line.slice(tab + 1) };
  });
}

/** name-status diff between two commits: Map(path → 'A'|'M'|'D'|'T'). */
function diffCommits(repo, a, b) {
  const out = git(repo, ['diff', '--no-renames', '--name-status', '-z', a, b]);
  const parts = out.split('\0').filter((x) => x !== '');
  const m = new Map();
  for (let i = 0; i + 1 < parts.length; i += 2) m.set(parts[i + 1], parts[i][0]);
  return m;
}

/** `git archive <sha>` extracted into `dest` (no .git). */
function exportCommit(repo, sha, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const tar = path.join(path.dirname(dest), `.${path.basename(dest)}.tar`);
  git(repo, ['archive', '--format=tar', '-o', tar, sha]);
  try {
    execFileSync('tar', ['-xf', tar, '-C', dest], { stdio: ['ignore', 'pipe', 'pipe'] });
  } finally {
    fs.rmSync(tar, { force: true });
  }
}

// ───────────────────────────── Files ─────────────────────────────

const toPosix = (p) => p.split(path.sep).join('/');

/** Every file (not directory) below `root`, posix-relative, sorted. Symlinks reported separately. */
function walkFiles(root, { skipDirs = [] } = {}) {
  const files = [];
  const links = [];
  const walk = (d) => {
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(d, e.name);
      const rel = toPosix(path.relative(root, p));
      if (e.isSymbolicLink()) { links.push(rel); continue; }
      if (e.isDirectory()) { if (!skipDirs.includes(rel) && !skipDirs.includes(e.name)) walk(p); continue; }
      if (e.isFile()) files.push(rel);
    }
  };
  walk(root);
  return { files: files.sort(), links: links.sort() };
}

function readText(root, rel) {
  try {
    const p = path.join(root, rel);
    const st = fs.lstatSync(p);
    if (!st.isFile() || st.size > LIMITS.maxFileBytes) return null;
    return fs.readFileSync(p, 'utf8');
  } catch { return null; }
}

function fileExists(root, rel) {
  try { return fs.lstatSync(path.join(root, rel)).isFile(); } catch { return false; }
}

/** Copy a directory tree; never follows or copies symlinks. `filter(rel)` → false skips. */
function copyTree(src, dest, filter = () => true) {
  fs.mkdirSync(dest, { recursive: true });
  const walk = (s, d, relBase) => {
    for (const e of fs.readdirSync(s, { withFileTypes: true })) {
      const rel = relBase ? `${relBase}/${e.name}` : e.name;
      if (!filter(rel, e)) continue;
      const sp = path.join(s, e.name);
      const dp = path.join(d, e.name);
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) { fs.mkdirSync(dp, { recursive: true }); walk(sp, dp, rel); } else if (e.isFile()) fs.copyFileSync(sp, dp);
    }
  };
  walk(src, dest, '');
}

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function writeFileSafe(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

/** JSON with a trailing newline, keys in insertion order (results are built in schema order). */
function stableJson(obj) {
  return `${JSON.stringify(obj, null, 2)}\n`;
}

// ───────────────────────────── Numbers ─────────────────────────────

const floorHalf = (x) => Math.max(0, Math.floor(x * 2 + 1e-9) / 2);
const round2 = (x) => Math.round(x * 100) / 100;
/** `max × ok / total`, floored to 0.5 (deterministic partial credit). */
const prop = (max, ok, total) => (total > 0 ? Math.min(max, floorHalf((max * ok) / total)) : 0);

module.exports = {
  GRADER_VERSION, RESULT_SCHEMA_VERSION, ENGINE_DIR, ENGINE_REPO, SCHEMA_DIR, LIMITS,
  STAGE_FILES, GRADED_STAGES, STAGE_LABEL, readOnlyPrefixes,
  loadSchema, submissionSchemaFor, fmtErrors,
  graderPrivate, gradingTmp, readJson, loadExam, loadBenchmark, loadValidated,
  git, gitOk, lsTree, diffCommits, exportCommit,
  toPosix, walkFiles, readText, fileExists, copyTree, rmrf, writeFileSafe, stableJson,
  floorHalf, round2, prop,
};

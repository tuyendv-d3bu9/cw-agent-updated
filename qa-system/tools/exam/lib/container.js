/**
 * container.js — Runs student-controlled code in a locked-down container (plan §6.2 step 7, D10).
 *
 *   probe()                → { ok, reason, image, digest }
 *   run(workDir, cmd, opt) → { started, code, stdout, stderr, timedOut, reason }
 *
 * Every run: --network none, --read-only root, tmpfs /tmp, --cap-drop ALL,
 * no-new-privileges, pids/memory/cpu limits, non-root user, a wall-clock timeout,
 * no environment passthrough (only HOME=/tmp and CI=1 are set), and exactly one bind
 * mount: a throwaway COPY of the student workspace (plus a read-only copy of the
 * engine's npm dependencies). $HOME, $GRADER_PRIVATE and the instructor repository
 * are never mounted. If the runtime is missing or a run cannot start, callers mark
 * the affected checks PENDING_HUMAN_REVIEW — never 0.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const C = require('./common');

const IMAGE = process.env.EXAM_CONTAINER_IMAGE || 'node:24-alpine';
const RUNTIME = process.env.EXAM_CONTAINER_RUNTIME || 'docker';
let probed = null;

function docker(args, opts = {}) {
  return spawnSync(RUNTIME, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: opts.timeout || 60000, env: process.env });
}

/** Is a container runtime usable, with the image present and a $GRADING_TMP bind mount readable? Cached. */
function probe() {
  if (probed) return probed;
  if (process.env.EXAM_CONTAINER === 'off') return (probed = { ok: false, reason: 'Container runtime disabled (EXAM_CONTAINER=off)' });
  const info = docker(['info', '--format', '{{.ServerVersion}}'], { timeout: 20000 });
  if (info.error || info.status !== 0) return (probed = { ok: false, reason: `Container runtime unavailable (${RUNTIME} info failed)` });
  const img = docker(['image', 'inspect', IMAGE, '--format', '{{.Id}}']);
  if (img.status !== 0) return (probed = { ok: false, reason: `Container image ${IMAGE} not present (run: ${RUNTIME} pull ${IMAGE})` });
  const dir = fs.mkdtempSync(path.join(ensureTmp(), 'probe-'));
  try {
    fs.chmodSync(dir, 0o755);
    fs.writeFileSync(path.join(dir, 'probe.txt'), 'ok');
    const r = run(dir, ['cat', 'probe.txt'], { timeoutMs: 30000, deps: false });
    if (!r.started || r.stdout.trim() !== 'ok') {
      return (probed = { ok: false, reason: `Container cannot read a bind mount under ${C.gradingTmp()} (set GRADING_TMP to a shared directory)` });
    }
  } finally { C.rmrf(dir); }
  return (probed = { ok: true, image: IMAGE, digest: img.stdout.trim() });
}

function ensureTmp() {
  const t = C.gradingTmp();
  fs.mkdirSync(t, { recursive: true });
  return t;
}

/** Engine dependencies (node_modules found above the engine repo), copied once, without browsers/native binaries. */
let depsCache;
function depsDir() {
  if (depsCache !== undefined) return depsCache;
  let d = C.ENGINE_REPO;
  let found = null;
  for (;;) {
    const nm = path.join(d, 'node_modules');
    if (fs.existsSync(nm)) { found = nm; break; }
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  if (!found) return (depsCache = null);
  const dest = path.join(ensureTmp(), `deps-${process.pid}-${crypto.randomBytes(4).toString('hex')}`);
  const skip = new Set(['playwright', 'playwright-core', '@playwright', '@types', '@napi-rs', '.bin', '.cache']);
  C.copyTree(found, dest, (rel) => !skip.has(rel.split('/')[0]));
  process.on('exit', () => { try { C.rmrf(dest); } catch { /* best effort */ } });
  return (depsCache = dest);
}

/**
 * Runs `cmd` (argv array) in the image with `workDir` mounted at /work.
 * opt: { timeoutMs = 180000, deps = true }
 */
function run(workDir, cmd, opt = {}) {
  const timeoutMs = opt.timeoutMs || 180000;
  const name = `cw-exam-${process.pid}-${crypto.randomBytes(6).toString('hex')}`;
  const args = [
    'run', '--rm', '--name', name,
    '--network', 'none', '--read-only',
    '--tmpfs', '/tmp:rw,nosuid,nodev,size=256m',
    '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges',
    '--pids-limit', '256', '--memory', '1g', '--memory-swap', '1g', '--cpus', '1',
    '--user', '1000:1000',
    '-e', 'HOME=/tmp', '-e', 'CI=1', '-e', 'NODE_OPTIONS=',
    '-v', `${workDir}:/work:rw`,
  ];
  if (opt.deps !== false) {
    const deps = depsDir();
    if (deps) args.push('-v', `${deps}:/work/node_modules:ro`);
  }
  args.push('-w', '/work', IMAGE, ...cmd);
  const r = spawnSync(RUNTIME, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: timeoutMs, env: process.env });
  const timedOut = !!(r.error && r.error.code === 'ETIMEDOUT');
  if (timedOut) docker(['kill', name], { timeout: 20000 });
  if (r.error && !timedOut) return { started: false, code: null, stdout: '', stderr: '', timedOut: false, reason: `Container failed to start: ${r.error.code || r.error.message}` };
  // 125: docker itself failed (bad flag, daemon error, image missing) — the student code never ran.
  if (r.status === 125) return { started: false, code: 125, stdout: r.stdout || '', stderr: r.stderr || '', timedOut: false, reason: 'Container failed to start (exit 125)' };
  return { started: true, code: r.status, stdout: r.stdout || '', stderr: r.stderr || '', timedOut, reason: timedOut ? `Timed out after ${timeoutMs} ms` : null };
}

/** A fresh, writable copy of the student workspace for one run (symlinks and node_modules dropped). */
function makeRunCopy(ws, parent, label) {
  const dest = path.join(parent, `run-${label}`);
  C.rmrf(dest);
  C.copyTree(ws, dest, (rel) => !/(^|\/)node_modules$/.test(rel) && rel !== '.git');
  fs.chmodSync(dest, 0o755);
  return dest;
}

/** Summary counters of node --test TAP output. */
function tapSummary(out) {
  const num = (k) => { const m = out.match(new RegExp(`^# ${k} (\\d+)\\s*$`, 'm')); return m ? Number(m[1]) : null; };
  return { tests: num('tests'), pass: num('pass'), fail: num('fail'), cancelled: num('cancelled') || 0, skipped: num('skipped') || 0 };
}

/** Strips run-specific noise (temp paths, durations) so evidence and messages are deterministic. */
function scrub(text, ...roots) {
  let t = String(text || '');
  for (const r of roots.filter(Boolean)) t = t.split(r).join('<ws>');
  return t.replace(/duration_ms:? [\d.]+/g, 'duration_ms <n>').replace(/# duration_ms [\d.]+/g, '# duration_ms <n>')
    .replace(/\/tmp\/[A-Za-z0-9._-]+/g, '/tmp/<tmp>');
}

module.exports = { probe, run, makeRunCopy, tapSummary, scrub, IMAGE, ensureTmp, _reset: () => { probed = null; } };

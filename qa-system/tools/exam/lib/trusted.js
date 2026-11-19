/**
 * trusted.js — Trusted tools against student data (plan §6.2 step 6, S1).
 *
 *   buildTrustedTree(ws, starterDir, slug, dest)  merged tree: student data + starter tools + canonical INPUT
 *   toolRunner(tree)                              runs a starter tool (node) inside that tree
 *   analyzer(tree, slug)                          static analysis child (analyze-child.js)
 *
 * The merged tree takes from the STARTER: all of qa-system/tools/ (replaced, not overlaid, so no
 * student file can shadow a module), package.json, qa-system/package.json and INPUT/<slug>/.
 * From the STUDENT: everything else, minus node_modules and the untrusted _gate.log/_gate.lock.
 * Trusted tools resolve the repository root from their own location (lib/paths.js), so they
 * read the merged tree. Student JavaScript is never loaded on the host.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const C = require('./common');

function findNodeModules() {
  let d = C.ENGINE_REPO;
  for (;;) {
    const nm = path.join(d, 'node_modules');
    if (fs.existsSync(nm)) return nm;
    const up = path.dirname(d);
    if (up === d) return null;
    d = up;
  }
}

function buildTrustedTree(ws, starterDir, slug, dest) {
  C.rmrf(dest);
  const fromStarter = new Set(['qa-system/tools', 'package.json', 'qa-system/package.json', `INPUT/${slug}`]);
  C.copyTree(ws, dest, (rel, e) => !fromStarter.has(rel) && e.name !== 'node_modules' && rel !== '.git' &&
    rel !== `OUTPUT/${slug}/_gate.log` && rel !== `OUTPUT/${slug}/_gate.lock`);
  for (const rel of fromStarter) {
    const src = path.join(starterDir, rel);
    if (!fs.existsSync(src)) continue;
    if (fs.statSync(src).isDirectory()) C.copyTree(src, path.join(dest, rel));
    else C.writeFileSafe(path.join(dest, rel), fs.readFileSync(src));
  }
  const nm = findNodeModules();
  if (nm) fs.symlinkSync(nm, path.join(dest, 'node_modules'), 'dir');
  return dest;
}

/** Runs `node <tree>/<script> …args` with a minimal environment. opt.withoutOutput hides OUTPUT/<task>/ folders (A1a). */
function toolRunner(tree, { local = false } = {}) {
  return (script, args = [], opt = {}) => {
    // withoutOutput: task folders are moved aside (OUTPUT/ files such as README.md stay, the map may route to them).
    const out = path.join(tree, 'OUTPUT');
    const hidden = path.join(tree, '.OUTPUT-tasks-hidden-by-grader');
    const moved = opt.withoutOutput && !local && fs.existsSync(out)
      ? fs.readdirSync(out, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : [];
    if (moved.length) fs.mkdirSync(hidden, { recursive: true });
    for (const d of moved) fs.renameSync(path.join(out, d), path.join(hidden, d));
    try {
      const r = spawnSync(process.execPath, [path.join(tree, script), ...args], {
        cwd: tree, encoding: 'utf8', timeout: opt.timeoutMs || 180000, maxBuffer: 64 * 1024 * 1024,
        env: local ? process.env : { PATH: process.env.PATH, HOME: tree, LANG: 'C.UTF-8', NO_COLOR: '1' },
      });
      return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || (r.error ? String(r.error.message) : '') };
    } finally {
      for (const d of moved) fs.renameSync(path.join(hidden, d), path.join(out, d));
      if (moved.length) fs.rmSync(hidden, { recursive: true, force: true });
    }
  };
}

function analyzer(tree, slug) {
  return () => {
    const r = spawnSync(process.execPath, [path.join(__dirname, 'analyze-child.js'), tree, slug], {
      cwd: tree, encoding: 'utf8', timeout: 180000, maxBuffer: 64 * 1024 * 1024, env: { PATH: process.env.PATH, HOME: tree },
    });
    try { return JSON.parse(r.stdout); } catch { return null; }
  };
}

module.exports = { buildTrustedTree, toolRunner, analyzer, findNodeModules };

#!/usr/bin/env node
/**
 * precommit.js — Lint that runs before every `git commit`, for EVERY AI tool.
 *
 * The PreToolUse hook exists only in Claude Code; Antigravity, Codex, Cursor… write files directly. Git is common to all:
 * fabricated content (unsourced message text/numbers, fake quotes…) cannot enter history.
 *
 *   node qa-system/tools/system/precommit.js            checks tasks that have staged files (the hook calls this)
 *   node qa-system/tools/system/precommit.js install    installs .git/hooks/pre-commit (npm run init already calls it)
 *
 * Deliberate bypass: `git commit --no-verify` or QA_SKIP_PRECOMMIT=1 — the content is then unchecked.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { PATHS, listTaskSlugs } = require('../lib/paths');

const MARK = '# qa-system:managed-pre-commit';

/** Which tasks have staged files: OUTPUT/<slug>/**, INPUT/<slug>/**, knowledge/features/<slug>.md. */
function slugsFromPaths(files, known) {
  const out = new Set();
  const byLower = new Map(known.map((s) => [s.toLowerCase(), s]));
  for (const f of files) {
    const p = f.replace(/\\/g, '/');
    let m = p.match(/^(?:OUTPUT|INPUT)\/([^/]+)\//);
    if (!m) m = p.match(/^knowledge\/features\/([^/]+)\.md$/);
    if (!m) continue;
    const slug = byLower.get(m[1].toLowerCase());
    if (slug && !/^[_.]/.test(slug)) out.add(slug);
  }
  return [...out];
}

function stagedFiles() {
  try {
    return execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], { cwd: PATHS.ROOT, encoding: 'utf-8' })
      .split('\n').map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function check(files = stagedFiles()) {
  const slugs = slugsFromPaths(files, listTaskSlugs());
  const { lint } = require('./lint-deliverables');
  const failed = [];
  for (const slug of slugs) {
    const r = lint(slug);
    if (!r.clean) failed.push({ slug, errors: r.errors });
  }
  return { slugs, failed };
}

function install() {
  const gitDir = path.join(PATHS.ROOT, '.git');
  if (!fs.existsSync(gitDir) || !fs.statSync(gitDir).isDirectory()) return { ok: false, note: 'not a git repo — skipped' };
  const hook = path.join(gitDir, 'hooks', 'pre-commit');
  const body = `#!/bin/sh\n${MARK}\nnode "$(git rev-parse --show-toplevel)/qa-system/tools/system/precommit.js" || exit 1\n`;
  if (fs.existsSync(hook)) {
    const cur = fs.readFileSync(hook, 'utf-8');
    if (cur.includes(MARK)) { fs.writeFileSync(hook, body, { mode: 0o755 }); return { ok: true, note: 'pre-commit hook updated' }; }
    return { ok: false, note: 'another pre-commit already exists — not overwritten. Add the line: node qa-system/tools/system/precommit.js || exit 1' };
  }
  fs.mkdirSync(path.dirname(hook), { recursive: true });
  fs.writeFileSync(hook, body, { mode: 0o755 });
  return { ok: true, note: 'pre-commit hook installed' };
}

function main() {
  if (process.argv[2] === 'install') {
    const r = install();
    console.log(`pre-commit: ${r.note}`);
    process.exit(r.ok ? 0 : 1);
  }
  if (process.env.QA_SKIP_PRECOMMIT === '1') {
    console.error('⚠️  QA_SKIP_PRECOMMIT=1 — pre-commit lint skipped. Deliverable content is NOT checked.');
    return;
  }
  const { slugs, failed } = check();
  if (slugs.length === 0) return;
  if (failed.length === 0) { console.log(`✅ lint clean: ${slugs.join(', ')}`); return; }

  console.error('\n⛔ Commit blocked — lint reports errors in staged deliverables (unsourced content or wrong format):');
  for (const f of failed) {
    console.error(`\n   Task [ ${f.slug} ] — ${f.errors.length} errors:`);
    f.errors.slice(0, 8).forEach((e) => console.error(`     - ${e.file} [${e.where}] ${e.msg}`));
    if (f.errors.length > 8) console.error(`     … ${f.errors.length - 8} more errors. Run: npm run lint -- ${f.slug}`);
  }
  console.error('\n   Fix and commit again. (Deliberate bypass: git commit --no-verify — content will NOT be checked.)\n');
  process.exit(1);
}

if (require.main === module) main();

module.exports = { slugsFromPaths, check, install, MARK };

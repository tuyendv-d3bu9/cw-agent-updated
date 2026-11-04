#!/usr/bin/env node
/**
 * precommit.js — Lint chạy trước mỗi `git commit`, cho MỌI công cụ AI.
 *
 * Hook PreToolUse chỉ có ở Claude Code; Antigravity, Codex, Cursor… ghi file thẳng. Git thì đứng chung cho tất cả:
 * nội dung bịa (chữ thông báo/con số không có nguồn, trích dẫn không có thật…) không vào được lịch sử.
 *
 *   node qa-system/tools/system/precommit.js            kiểm các task có file đang staged (hook gọi lệnh này)
 *   node qa-system/tools/system/precommit.js install    cài .git/hooks/pre-commit (npm run init gọi sẵn)
 *
 * Bỏ qua có chủ đích: `git commit --no-verify` hoặc QA_SKIP_PRECOMMIT=1 — khi đó nội dung chưa được kiểm.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { PATHS, listTaskSlugs } = require('../lib/paths');

const MARK = '# qa-system:managed-pre-commit';

/** Task nào có file đang staged: OUTPUT/<slug>/**, INPUT/<slug>/**, knowledge/features/<slug>.md. */
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
  if (!fs.existsSync(gitDir) || !fs.statSync(gitDir).isDirectory()) return { ok: false, note: 'không phải git repo — bỏ qua' };
  const hook = path.join(gitDir, 'hooks', 'pre-commit');
  const body = `#!/bin/sh\n${MARK}\nnode "$(git rev-parse --show-toplevel)/qa-system/tools/system/precommit.js" || exit 1\n`;
  if (fs.existsSync(hook)) {
    const cur = fs.readFileSync(hook, 'utf-8');
    if (cur.includes(MARK)) { fs.writeFileSync(hook, body, { mode: 0o755 }); return { ok: true, note: 'đã cập nhật hook pre-commit' }; }
    return { ok: false, note: 'đã có pre-commit khác — không ghi đè. Thêm dòng: node qa-system/tools/system/precommit.js || exit 1' };
  }
  fs.mkdirSync(path.dirname(hook), { recursive: true });
  fs.writeFileSync(hook, body, { mode: 0o755 });
  return { ok: true, note: 'đã cài hook pre-commit' };
}

function main() {
  if (process.argv[2] === 'install') {
    const r = install();
    console.log(`pre-commit: ${r.note}`);
    process.exit(r.ok ? 0 : 1);
  }
  if (process.env.QA_SKIP_PRECOMMIT === '1') {
    console.error('⚠️  QA_SKIP_PRECOMMIT=1 — bỏ qua kiểm lint trước commit. Nội dung deliverable CHƯA được kiểm.');
    return;
  }
  const { slugs, failed } = check();
  if (slugs.length === 0) return;
  if (failed.length === 0) { console.log(`✅ lint sạch: ${slugs.join(', ')}`); return; }

  console.error('\n⛔ Commit bị chặn — lint báo lỗi ở deliverable đang staged (nội dung không có nguồn hoặc sai định dạng):');
  for (const f of failed) {
    console.error(`\n   Task [ ${f.slug} ] — ${f.errors.length} lỗi:`);
    f.errors.slice(0, 8).forEach((e) => console.error(`     - ${e.file} [${e.where}] ${e.msg}`));
    if (f.errors.length > 8) console.error(`     … còn ${f.errors.length - 8} lỗi. Chạy: npm run lint -- ${f.slug}`);
  }
  console.error('\n   Sửa rồi commit lại. (Bỏ qua có chủ đích: git commit --no-verify — nội dung sẽ KHÔNG được kiểm.)\n');
  process.exit(1);
}

if (require.main === module) main();

module.exports = { slugsFromPaths, check, install, MARK };

#!/usr/bin/env node
/**
 * student-setup.js — Student helper for Graduation Exam V1 (`shopgo-refund-v1`).
 *
 * Driven by docs/exam/STUDENT_START_ANTIGRAVITY.md. The AI agent copies this file from
 * origin/develop into <workspace>/.scratch/ (git-ignored) and runs it from the workspace root:
 *
 *   node .scratch/student-setup.js start <student-id>   set up or resume exams/<student-id>
 *   node .scratch/student-setup.js inventory            read-only facts for the SUBMIT flow
 *   node .scratch/student-setup.js submit               sync factual fields, self-check, commit, push, verify
 *
 * Safety rules (never relaxed):
 *  - never force-push, never push any ref other than refs/heads/exams/<student-id>;
 *  - never overwrite, stash, reset or delete student files; existing files are preserved;
 *  - never touch the exam branch, the starter tag, or another student's branch;
 *  - never asks for or prints passwords or tokens (GIT_TERMINAL_PROMPT=0: no hidden prompts);
 *  - SUCCESS only after `git ls-remote` shows the pushed commit on the remote.
 *
 * Output: human-readable lines (Vietnamese) and one final line `RESULT {json}` with
 * { status: SUCCESS | ACTION_REQUIRED | FAILED, code, message_vi, next_vi, facts }.
 * Exit: 0 SUCCESS · 2 ACTION_REQUIRED · 1 FAILED.
 *
 * Test hooks (instructor/CI only): EXAM_REPO_URL overrides the expected origin URL
 * (sandbox remotes); EXAM_SKIP_INSTALL=1 skips `npm ci`.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const EXAM = Object.freeze({
  id: 'shopgo-refund-v1',
  slug: 'shopgo-refund',
  tag: 'exam/shopgo-refund-v1/starter',
  starterSha: '50c2a7fb690699a5bedfc13f5e296ecf9b9a5fc6',
  repo: 'https://github.com/tuyendv-d3bu9/cw-agent-updated.git',
});
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const RESERVED = new Set([EXAM.id, 'example-student', 'starter', 'main', 'develop', 'grading']);
const EXAM_FILES = ['EXAM/submission.json', 'EXAM/DECISIONS.md', 'EXAM/AI_USE.md'];
const STAGE_FILES = Object.freeze({ '00': '00_plan.md', '01': '01_requirement_risk_summary.md', '02': '02_missing_rule_report.md',
  '03': '03_viewpoint_report.md', '04': '04_test_idea_report.md', '05': '05_test_case_spec.md', '06': '06_coverage_review.md' });
const READ_ONLY = [`INPUT/${EXAM.slug}/`, 'EXAM/brief/', 'EXAM/schema/', 'EXAM/selfcheck/'];

class Stop extends Error {
  constructor(status, code, messageVi, nextVi, facts) {
    super(code);
    Object.assign(this, { status, code, messageVi, nextVi, facts: facts || {} });
  }
}
const need = (code, msg, next, facts) => new Stop('ACTION_REQUIRED', code, msg, next, facts);
const fail = (code, msg, next, facts) => new Stop('FAILED', code, msg, next, facts);

const log = (s) => process.stdout.write(`${s}\n`);
const step = (n, s) => log(`\n[${n}] ${s}`);

// ---------------------------------------------------------------- process helpers

// No hidden terminal prompts (the agent cannot answer them). GCM's browser login stays allowed (Windows).
const ENV = { ...process.env, GIT_TERMINAL_PROMPT: '0', LC_ALL: 'C' };

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd, env: ENV, encoding: 'utf8', timeout: opts.timeout || 300000,
    shell: process.platform === 'win32' && cmd === 'npm',
    maxBuffer: 64 * 1024 * 1024,
  });
  return { ok: r.status === 0, code: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim(), error: r.error };
}
// core.quotePath=false: Vietnamese file names come back as real paths, not "\303\272"-escaped strings.
const git = (ws, args, opts) => run('git', ['-c', 'core.quotePath=false', ...args], { ...opts, cwd: ws });
const gitOut = (ws, args) => { const r = git(ws, args); return r.ok ? r.out : null; };

// ---------------------------------------------------------------- pure helpers (unit-tested)

/** Normalise and validate a student id. Returns { id } or { error } (Vietnamese). */
function validateStudentId(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return { error: 'Thiếu mã học viên (ví dụ: hv001).' };
  const id = raw.trim().toLowerCase();
  if (id.length > 40) return { error: `Mã học viên "${id}" dài quá 40 ký tự.` };
  if (!ID_RE.test(id)) {
    return { error: `Mã học viên "${raw.trim()}" không hợp lệ: chỉ dùng chữ thường a-z, số 0-9 và dấu gạch ngang giữa các phần (ví dụ: hv001, nguyen-van-a).` };
  }
  if (RESERVED.has(id) || /^shopgo-refund-v\d+$/.test(id)) {
    return { error: `"${id}" là tên dành riêng của hệ thống thi, không phải mã học viên.` };
  }
  return { id };
}

/** Is `url` the official repository (https or ssh form, with or without .git)? */
function sameRepo(url, expected) {
  const norm = (u) => String(u || '').trim().toLowerCase()
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/^ssh:\/\/git@github\.com\//, 'https://github.com/')
    .replace(/^https:\/\/[^@/]+@/, 'https://')
    .replace(/\.git$/, '').replace(/\/+$/, '');
  return norm(url) === norm(expected);
}

/**
 * Initial manifest from the official template. Only facts are filled in (identity, branch,
 * starter commit). Fields the schema forces to an enum get its neutral default and stay the
 * student's decision: decision_class = first enum value "A", every anchor "n/a" with no reason
 * (the self-check reports these as G-03 gaps until the student fills them), T2 paths are
 * obvious "your-..." placeholders (reported as G-04 gaps).
 */
function buildManifest(template, id, starterSha) {
  const m = JSON.parse(JSON.stringify(template));
  m.student_id = id;
  m.branch = `exams/${id}`;
  m.starter_commit = starterSha;
  const t1 = m.t1_customized_agent;
  t1.decision_class = 'A';
  for (const k of Object.keys(t1.anchors)) t1.anchors[k] = 'n/a';
  t1.anchor_reasons = {};
  const t2 = m.t2_new_agent;
  t2.agent_folder = 'qa-system/qa-your-new-agent';
  t2.agent_file = 'qa-system/qa-your-new-agent/AGENT.md';
  t2.example_output = `OUTPUT/${EXAM.slug}/${t2.deliverable_prefix || '17'}_your_output.md`;
  return m;
}

/** Replace only the `<student-id>` placeholder in the Markdown templates. */
const fillMarkdown = (text, id) => text.split('<student-id>').join(id);

/** Classify a failed git push/ls-remote into a code + Vietnamese explanation. */
function classifyPushError(text) {
  const t = String(text || '');
  if (/permission to .* denied|403|access denied|not allowed to push|write access .* not granted|denied to /i.test(t)) {
    return {
      code: 'NO_WRITE_ACCESS',
      msg: 'Bạn đã đăng nhập GitHub nhưng tài khoản này CHƯA có quyền ghi (push) vào repository bài thi.',
      next: 'Gửi tên tài khoản GitHub của bạn cho giảng viên để được thêm làm collaborator, mở email/thông báo GitHub và bấm "Accept invitation", rồi chạy lại lệnh START. Nếu máy đang đăng nhập nhầm tài khoản, đăng nhập lại bằng `gh auth login` rồi `gh auth setup-git`.',
    };
  }
  if (/could not read username|authentication failed|terminal prompts disabled|invalid username or password|401|could not read password|no credentials/i.test(t)) {
    return {
      code: 'NOT_AUTHENTICATED',
      msg: 'Máy này chưa đăng nhập GitHub cho Git, nên không thể push.',
      next: 'Bạn tự đăng nhập (không gửi mật khẩu hay token vào chat): chạy `gh auth login` (chọn GitHub.com → HTTPS → Login with a web browser), sau đó `gh auth setup-git`. Nếu chưa có `gh`, cài GitHub CLI từ https://cli.github.com hoặc dùng Git Credential Manager đi kèm Git for Windows. Xong thì chạy lại lệnh START.',
    };
  }
  if (/non-fast-forward|fetch first|rejected/i.test(t)) {
    return {
      code: 'REMOTE_AHEAD',
      msg: 'Nhánh của bạn trên GitHub có commit mới hơn bản trên máy (có thể bạn đã làm bài ở máy khác).',
      next: 'Không force-push. Chạy lại lệnh START để tải về và nối tiếp an toàn; nếu báo DIVERGED thì hỏi giảng viên.',
    };
  }
  if (/could not resolve host|unable to access|timed out|connection|network/i.test(t)) {
    return { code: 'NETWORK', msg: 'Không kết nối được tới GitHub.', next: 'Kiểm tra mạng (VPN, proxy, Wi-Fi) rồi chạy lại lệnh.' };
  }
  return { code: 'PUSH_FAILED', msg: 'Git push thất bại vì một lỗi chưa xác định.', next: 'Gửi nguyên văn thông báo lỗi ở trên (đã che thông tin nhạy cảm) cho giảng viên.' };
}

/** Strip anything that looks like a credential from text we print. */
const scrubSecrets = (s) => String(s || '')
  .replace(/https:\/\/[^@\s/]+@/g, 'https://***@')
  .replace(/\b(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g, '***');

// ---------------------------------------------------------------- workspace checks

function workspace() {
  const i = process.argv.indexOf('--dir');
  const start = i > 0 && process.argv[i + 1] ? path.resolve(process.argv[i + 1])
    : path.basename(__dirname) === '.scratch' ? path.dirname(__dirname) : process.cwd();
  const top = run('git', ['rev-parse', '--show-toplevel'], { cwd: start });
  if (!top.ok) {
    throw need('NOT_A_REPO', `Thư mục ${start} không phải bản clone của repository bài thi.`,
      'Làm lại bước "Clone repository" trong file hướng dẫn rồi chạy lại.');
  }
  const ws = path.resolve(top.out);
  excludeScratch(ws);
  return ws;
}

function checkTools() {
  const g = run('git', ['--version']);
  if (!g.ok) throw need('NO_GIT', 'Chưa cài Git.', 'Cài Git từ https://git-scm.com/downloads, mở lại Antigravity rồi chạy lại.');
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 20) throw need('OLD_NODE', `Node.js ${process.versions.node} quá cũ (cần ≥ 20, khuyên dùng 22 LTS hoặc 24).`, 'Cài Node.js LTS từ https://nodejs.org, mở lại Antigravity rồi chạy lại.');
  const n = run('npm', ['--version']);
  if (!n.ok) throw need('NO_NPM', 'Không tìm thấy npm.', 'Cài lại Node.js LTS từ https://nodejs.org (npm đi kèm), mở lại Antigravity rồi chạy lại.');
  log(`  git ${g.out.replace(/^git version /, '')} · node ${process.versions.node} · npm ${n.out}`);
}

function checkOrigin(ws) {
  const url = gitOut(ws, ['remote', 'get-url', 'origin']);
  const expected = process.env.EXAM_REPO_URL || EXAM.repo;
  if (!url || !sameRepo(url, expected)) {
    throw need('WRONG_REPO', `Remote "origin" của thư mục này là ${scrubSecrets(url) || '(không có)'}, không phải repository bài thi ${expected}.`,
      'Clone đúng repository vào một thư mục mới theo file hướng dẫn; không sửa thư mục hiện tại.');
  }
}

function fetchAndVerifyStarter(ws) {
  const f = git(ws, ['fetch', 'origin', '--prune', '--no-tags', '+refs/heads/*:refs/remotes/origin/*']);
  if (!f.ok) {
    const c = classifyPushError(f.err);
    throw need(c.code === 'PUSH_FAILED' ? 'FETCH_FAILED' : c.code, c.code === 'PUSH_FAILED' ? 'Không tải được dữ liệu mới từ GitHub.' : c.msg, c.next, { git: scrubSecrets(f.err) });
  }
  const local = gitOut(ws, ['rev-parse', '--verify', '--quiet', `refs/tags/${EXAM.tag}^{commit}`]);
  if (!local) {
    const t = git(ws, ['fetch', 'origin', '--no-tags', `refs/tags/${EXAM.tag}:refs/tags/${EXAM.tag}`]);
    if (!t.ok) throw fail('NO_STARTER_TAG', `Không tải được tag đề thi ${EXAM.tag}.`, 'Báo giảng viên: tag đề thi không có trên GitHub.', { git: scrubSecrets(t.err) });
  }
  const sha = gitOut(ws, ['rev-parse', '--verify', '--quiet', `refs/tags/${EXAM.tag}^{commit}`]);
  const remote = git(ws, ['ls-remote', 'origin', `refs/tags/${EXAM.tag}^{}`]);
  const remoteSha = remote.ok && remote.out ? remote.out.split(/\s+/)[0] : null;
  if (sha !== EXAM.starterSha || (remoteSha && remoteSha !== EXAM.starterSha)) {
    throw fail('STARTER_MISMATCH', `Tag đề thi không khớp bản chính thức (trên máy: ${sha || 'không có'}, trên GitHub: ${remoteSha || 'không đọc được'}, mong đợi: ${EXAM.starterSha}).`,
      `Không sửa gì. Chụp màn hình thông báo này gửi giảng viên. (Nếu chỉ tag trên máy sai: \`git tag -d ${EXAM.tag}\` rồi chạy lại START.)`);
  }
  log(`  Tag đề thi ${EXAM.tag} = ${sha.slice(0, 12)} ✔ (khớp bản chính thức)`);
  return sha;
}

/** The helper lives in .scratch/. Some branches (e.g. the default `main`) do not ignore it,
 *  so exclude it locally (.git/info/exclude is never committed or pushed). */
function excludeScratch(ws) {
  const rel = gitOut(ws, ['rev-parse', '--git-path', 'info/exclude']);
  if (!rel) return;
  const file = path.resolve(ws, rel);
  const cur = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (!/^\/?\.scratch\/?$/m.test(cur)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, `${cur && !cur.endsWith('\n') ? '\n' : ''}.scratch/\n`);
  }
}

function dirtyPaths(ws) {
  const s = gitOut(ws, ['status', '--porcelain', '--untracked-files=all']) || '';
  return s.split('\n').filter(Boolean).map((l) => l.slice(3)).filter((p) => !p.startsWith('.scratch/'));
}

const refSha = (ws, ref) => gitOut(ws, ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]);
const isAncestor = (ws, a, b) => git(ws, ['merge-base', '--is-ancestor', a, b]).ok;

/** Probe write access without changing anything on the remote (dry-run push). */
function probeWriteAccess(ws, branch, sha) {
  const r = git(ws, ['push', '--dry-run', '--porcelain', 'origin', `${sha}:refs/heads/${branch}`], { timeout: 120000 });
  if (r.ok) return;
  const c = classifyPushError(`${r.err}\n${r.out}`);
  throw need(c.code, c.msg, c.next, { git: scrubSecrets(r.err) });
}

function checkIdentity(ws) {
  const name = gitOut(ws, ['config', 'user.name']);
  const email = gitOut(ws, ['config', 'user.email']);
  if (!name || !email) {
    throw need('GIT_IDENTITY', 'Git chưa biết tên và email của bạn nên chưa thể tạo commit.',
      'Cho trợ lý AI biết họ tên và email bạn dùng cho GitHub (không phải mật khẩu), để nó chạy trong thư mục bài thi: `git config user.name "Họ Tên"` và `git config user.email "email@vi-du.com"`. Sau đó chạy lại lệnh.');
  }
}

/** Switch to (or create) exams/<id> without ever discarding work. Returns a description. */
function ensureBranch(ws, id, starterSha) {
  const branch = `exams/${id}`;
  const current = gitOut(ws, ['symbolic-ref', '--quiet', '--short', 'HEAD']);
  const local = refSha(ws, `refs/heads/${branch}`);
  const remote = refSha(ws, `refs/remotes/origin/${branch}`);
  const dirty = dirtyPaths(ws);

  if (current !== branch && dirty.length) {
    throw need('DIRTY_OTHER_BRANCH', `Bạn đang ở nhánh "${current || '(detached)'}" và có ${dirty.length} file chưa commit (ví dụ: ${dirty.slice(0, 3).join(', ')}). Tôi không chuyển nhánh để tránh làm mất hoặc trộn bài.`,
      'Hỏi giảng viên trước khi xử lý các file này. Không xoá, không stash nếu bạn không chắc.', { dirty: dirty.slice(0, 20) });
  }

  let how;
  if (!local && !remote) {
    const r = git(ws, ['switch', '-c', branch, starterSha]);
    if (!r.ok) throw fail('SWITCH_FAILED', `Không tạo được nhánh ${branch}.`, 'Gửi thông báo lỗi cho giảng viên.', { git: r.err });
    how = 'created';
  } else if (!local && remote) {
    const r = git(ws, ['switch', '-c', branch, '--track', `origin/${branch}`]);
    if (!r.ok) throw fail('SWITCH_FAILED', `Không lấy được nhánh ${branch} từ GitHub.`, 'Gửi thông báo lỗi cho giảng viên.', { git: r.err });
    how = 'resumed-from-github';
  } else {
    if (current !== branch) {
      const r = git(ws, ['switch', branch]);
      if (!r.ok) throw fail('SWITCH_FAILED', `Không chuyển được sang nhánh ${branch}.`, 'Gửi thông báo lỗi cho giảng viên.', { git: r.err });
    }
    how = 'resumed-local';
    if (remote && remote !== local) {
      if (isAncestor(ws, local, remote)) {
        // Fast-forward keeps uncommitted edits; git refuses (and changes nothing) if one would be overwritten.
        const r = git(ws, ['merge', '--ff-only', `origin/${branch}`]);
        if (!r.ok) {
          if (dirtyPaths(ws).length) {
            throw need('BEHIND_WITH_CHANGES', `GitHub có commit mới hơn trên ${branch} (làm ở máy khác), và chúng sửa cùng file mà máy này đang sửa dở. Tôi không cập nhật để tránh mất bài.`,
              'Không xoá, không force-push. Gửi thông báo này cho giảng viên để được hướng dẫn gộp hai phần bài an toàn.', { git: r.err });
          }
          throw fail('FF_FAILED', 'Không cập nhật được nhánh từ GitHub.', 'Gửi thông báo lỗi cho giảng viên.', { git: r.err });
        }
        how = 'resumed-updated-from-github';
      } else if (!isAncestor(ws, remote, local)) {
        throw need('DIVERGED', `Nhánh ${branch} trên máy và trên GitHub đã tách nhau (cả hai đều có commit riêng).`,
          'Không force-push. Hỏi giảng viên để gộp an toàn; không xoá thư mục này.', { local, remote });
      }
    }
  }
  if (!isAncestor(ws, starterSha, 'HEAD')) {
    throw fail('NOT_FROM_STARTER', `Nhánh ${branch} không bắt đầu từ tag đề thi ${EXAM.tag} (bài sẽ bị B-04).`,
      'Không tự sửa lịch sử. Báo giảng viên kèm thông báo này.');
  }
  return { branch, how };
}

/** Create missing exam files from the official templates; never overwrite. */
function ensureExamFiles(ws, id, starterSha) {
  const created = [];
  const kept = [];
  const tpl = (f) => path.join(ws, 'EXAM', 'templates', path.basename(f));
  for (const f of EXAM_FILES) {
    const abs = path.join(ws, f);
    if (fs.existsSync(abs)) { kept.push(f); continue; }
    if (!fs.existsSync(tpl(f))) throw fail('NO_TEMPLATE', `Thiếu template chính thức ${path.relative(ws, tpl(f))}.`, 'Báo giảng viên.');
    let body;
    if (f.endsWith('.json')) {
      body = `${JSON.stringify(buildManifest(JSON.parse(fs.readFileSync(tpl(f), 'utf8')), id, starterSha), null, 2)}\n`;
    } else {
      body = fillMarkdown(fs.readFileSync(tpl(f), 'utf8'), id);
    }
    fs.writeFileSync(abs, body, { flag: 'wx' });
    created.push(f);
  }
  return { created, kept };
}

function installDeps(ws) {
  if (process.env.EXAM_SKIP_INSTALL === '1') { log('  (bỏ qua cài đặt — EXAM_SKIP_INSTALL=1)'); return; }
  const marker = path.join(ws, 'node_modules', '.package-lock.json');
  const lock = path.join(ws, 'package-lock.json');
  if (fs.existsSync(marker) && fs.existsSync(lock) && fs.statSync(marker).mtimeMs >= fs.statSync(lock).mtimeMs) {
    log('  Thư viện đã được cài, bỏ qua.');
    return;
  }
  const r = run('npm', fs.existsSync(lock) ? ['ci', '--no-audit', '--no-fund'] : ['install', '--no-audit', '--no-fund'], { cwd: ws, timeout: 900000 });
  if (!r.ok) throw need('NPM_FAILED', 'Cài thư viện (npm) thất bại.', 'Kiểm tra mạng rồi chạy lại lệnh. Nếu vẫn lỗi, gửi 20 dòng cuối của thông báo cho giảng viên.', { npm: r.err.split('\n').slice(-20).join('\n') });
  log('  Đã cài thư viện (npm ci).');
}

/** Run the official self-check; return its preflight status and check counts. */
function selfCheck(ws) {
  fs.rmSync(path.join(ws, '.scratch', 'exam-check.json'), { force: true });
  const r = run('npm', ['run', '--silent', 'exam:check'], { cwd: ws, timeout: 600000 });
  let report = null;
  try { report = JSON.parse(fs.readFileSync(path.join(ws, '.scratch', 'exam-check.json'), 'utf8')); } catch { report = null; }
  if (!report) throw fail('SELF_CHECK_CRASHED', 'Không chạy được `npm run exam:check`.', 'Gửi thông báo lỗi cho giảng viên.', { output: `${r.out}\n${r.err}`.split('\n').slice(-30).join('\n') });
  const pf = report.preflight;
  const counts = { PASS: 0, FAIL: 0, SKIP: 0 };
  for (const c of report.checks) counts[c.result] = (counts[c.result] || 0) + 1;
  return { status: pf.status, blocking: pf.blocking, gaps: pf.gradable.map((g) => `${g.code} ${g.path}`), counts, exit: r.code };
}

function commitPaths(ws, paths, message) {
  const add = git(ws, ['add', '--', ...paths]);
  if (!add.ok) throw fail('GIT_ADD_FAILED', 'Không thêm được file vào commit.', 'Gửi thông báo lỗi cho giảng viên.', { git: add.err });
  const staged = git(ws, ['diff', '--cached', '--quiet', '--', ...paths]);
  if (staged.ok) return null;
  const c = git(ws, ['commit', '-m', message, '--', ...paths]);
  if (!c.ok) throw fail('COMMIT_FAILED', 'Không tạo được commit.', 'Gửi thông báo lỗi cho giảng viên.', { git: c.err });
  return gitOut(ws, ['rev-parse', 'HEAD']);
}

function pushAndVerify(ws, branch) {
  const head = gitOut(ws, ['rev-parse', 'HEAD']);
  const p = git(ws, ['push', '--porcelain', '-u', 'origin', `refs/heads/${branch}:refs/heads/${branch}`], { timeout: 300000 });
  if (!p.ok) {
    const c = classifyPushError(`${p.err}\n${p.out}`);
    throw need(c.code, c.msg, c.next, { git: scrubSecrets(p.err) });
  }
  const ls = git(ws, ['ls-remote', 'origin', `refs/heads/${branch}`]);
  const remoteSha = ls.ok && ls.out ? ls.out.split(/\s+/)[0] : null;
  if (remoteSha !== head) {
    throw fail('PUSH_NOT_VISIBLE', `Đã push nhưng GitHub chưa hiển thị đúng commit (máy: ${head.slice(0, 12)}, GitHub: ${remoteSha ? remoteSha.slice(0, 12) : 'không có'}).`,
      'Chờ 1 phút rồi chạy lại lệnh; nếu vẫn sai, báo giảng viên.');
  }
  log(`  GitHub: refs/heads/${branch} = ${remoteSha.slice(0, 12)} ✔ (khớp commit trên máy)`);
  return remoteSha;
}

function webUrl(branch) {
  const base = (process.env.EXAM_REPO_URL || EXAM.repo).replace(/\.git$/, '');
  return /^https:\/\/github\.com\//.test(base) ? `${base}/tree/${branch}` : `${base} (nhánh ${branch})`;
}

// ---------------------------------------------------------------- commands

function cmdStart(rawId) {
  step(1, 'Kiểm tra mã học viên');
  const v = validateStudentId(rawId);
  if (v.error) throw need('BAD_STUDENT_ID', v.error, 'Hỏi lại giảng viên mã học viên chính xác, rồi gửi lại câu lệnh START với mã đó.');
  const id = v.id;
  const branch = `exams/${id}`;
  log(`  Mã học viên: ${id} → nhánh ${branch}`);

  step(2, 'Kiểm tra Git, Node.js, npm');
  checkTools();
  const ws = workspace();
  checkOrigin(ws);
  log(`  Thư mục bài thi: ${ws}`);

  step(3, 'Tải dữ liệu và xác minh tag đề thi');
  const starterSha = fetchAndVerifyStarter(ws);

  step(4, 'Kiểm tra quyền ghi GitHub (dry-run, không thay đổi gì)');
  const remoteBefore = refSha(ws, `refs/remotes/origin/${branch}`);
  probeWriteAccess(ws, branch, remoteBefore || starterSha);
  log('  Có quyền push ✔');

  checkIdentity(ws); // before anything is created, so a first run never stops half-way at commit time
  step(5, `Chuẩn bị nhánh ${branch}`);
  const b = ensureBranch(ws, id, starterSha);
  log({ created: `  Đã tạo nhánh mới từ tag đề thi (${starterSha.slice(0, 12)}).`,
    'resumed-from-github': '  Nhánh đã có trên GitHub — tải về và tiếp tục (giữ nguyên bài cũ).',
    'resumed-local': '  Nhánh đã có trên máy — tiếp tục (giữ nguyên bài cũ).',
    'resumed-updated-from-github': '  Nhánh đã có — cập nhật thêm commit mới từ GitHub (fast-forward, không mất gì).' }[b.how]);

  step(6, 'Tạo file nộp bài từ template chính thức');
  const files = ensureExamFiles(ws, id, starterSha);
  files.created.forEach((f) => log(`  + tạo mới ${f}`));
  files.kept.forEach((f) => log(`  = giữ nguyên ${f} (đã có, không ghi đè)`));

  step(7, 'Cài thư viện');
  installDeps(ws);

  step(8, 'Chạy self-check: npm run exam:check');
  const sc = selfCheck(ws);
  log(`  Preflight: ${sc.status} · public checks: ${sc.counts.PASS} PASS / ${sc.counts.FAIL} FAIL / ${sc.counts.SKIP} SKIP`);
  if (sc.status === 'INVALID') {
    throw need('SELF_CHECK_INVALID', 'Self-check báo lỗi CHẶN (B-xx): bài ở trạng thái này sẽ không được chấm.',
      'Đọc từng dòng FAIL B-xx và gợi ý "fix" trong output của `npm run exam:check`, sửa theo gợi ý rồi chạy lại START. Không xoá bài.',
      { blocking: sc.blocking });
  }
  if (sc.status === 'VALID_WITH_GAPS') log('  VALID_WITH_GAPS là BÌNH THƯỜNG lúc mới bắt đầu: các "GAP" là phần bài bạn chưa làm.');

  step(9, 'Commit và push nhánh của bạn');
  checkIdentity(ws);
  // Only EXAM files never committed yet (untracked) are committed — created now or by an earlier START that
  // stopped before its commit. Edits to already-committed files stay uncommitted (SUBMIT publishes them).
  const untracked = EXAM_FILES.filter((f) => !git(ws, ['ls-files', '--error-unmatch', '--', f]).ok);
  const commit = untracked.length ? commitPaths(ws, untracked, `exam(${id}): start ${EXAM.id} from starter`) : null;
  log(commit ? `  Commit ${commit.slice(0, 12)} (chỉ ${untracked.join(', ')})` : '  Không tạo commit mới (bài đang làm dở giữ nguyên, chưa commit).');
  const remoteSha = pushAndVerify(ws, branch);

  return {
    status: 'SUCCESS', code: remoteBefore ? 'RESUMED' : 'STARTED',
    message_vi: `Môi trường thi đã sẵn sàng. Nhánh ${branch} có trên GitHub tại commit ${remoteSha.slice(0, 12)}.`,
    next_vi: 'Mở EXAM/brief/README.md, T1.md, T2.md, T3.md và bắt đầu từ T3 (chạy pipeline) hoặc T1. Khi xong, dùng lệnh SUBMIT.',
    facts: { workspace: ws, student_id: id, branch, starter_commit: starterSha, head: remoteSha, branch_state: b.how,
      files_created: files.created, files_kept: files.kept, self_check: sc.status, gaps: sc.gaps.length, web: webUrl(branch) },
  };
}

function currentStudent(ws) {
  const cur = gitOut(ws, ['symbolic-ref', '--quiet', '--short', 'HEAD']) || '';
  const m = /^exams\/(.+)$/.exec(cur);
  const v = m ? validateStudentId(m[1]) : { error: 'x' };
  if (!m || v.error || v.id !== m[1]) {
    throw need('NOT_ON_STUDENT_BRANCH', `Bạn đang ở nhánh "${cur || '(detached)'}", không phải nhánh bài thi exams/<mã-học-viên>.`,
      'Chạy lệnh START với mã học viên của bạn trước (nó sẽ chuyển về đúng nhánh mà không xoá gì).');
  }
  return v.id;
}

/** Read-only facts about the submission, for the agent to update judgment fields truthfully. */
function collectInventory(ws, starterSha) {
  const slug = EXAM.slug;
  const diff = (gitOut(ws, ['diff', '--no-renames', '--name-status', starterSha]) || '').split('\n').filter(Boolean)
    .map((l) => { const [s, ...p] = l.split('\t'); return { status: s[0], path: p.join('\t') }; });
  const untracked = (gitOut(ws, ['ls-files', '--others', '--exclude-standard']) || '').split('\n').filter(Boolean)
    .map((p) => ({ status: 'A', path: p }));
  const changed = [...diff, ...untracked].sort((a, b) => a.path.localeCompare(b.path));
  const exists = (p) => fs.existsSync(path.join(ws, p));
  const stages = Object.fromEntries(Object.entries(STAGE_FILES).map(([k, f]) => [k, exists(`OUTPUT/${slug}/${f}`) ? `OUTPUT/${slug}/${f}` : null]));
  const tcDir = path.join(ws, 'OUTPUT', slug, 'testcases');
  const batches = fs.existsSync(tcDir) ? fs.readdirSync(tcDir).filter((f) => /^batch_\d+\.md$/.test(f)).sort().map((f) => `OUTPUT/${slug}/testcases/${f}`) : [];
  const blueprint = exists(`OUTPUT/${slug}/05_test_blueprint.json`) ? `OUTPUT/${slug}/05_test_blueprint.json` : null;
  const newAgents = changed.filter((c) => c.status === 'A' && /^qa-system\/qa-[a-z0-9-]+\/AGENT\.md$/.test(c.path)).map((c) => path.dirname(c.path));
  const placeholders = Object.fromEntries(['EXAM/DECISIONS.md', 'EXAM/AI_USE.md'].map((f) => {
    const t = exists(f) ? fs.readFileSync(path.join(ws, f), 'utf8') : null;
    return [f, t === null ? 'missing' : (t.match(/<…>|<student-id>|<YYYY-MM-DD>/g) || []).length];
  }));
  const readOnlyChanged = changed.filter((c) => READ_ONLY.some((p) => c.path.startsWith(p))).map((c) => c.path);
  return {
    changed_vs_starter: changed, stages, batches, blueprint, feature_knowledge: exists(`knowledge/features/${slug}.md`),
    gate_log: exists(`OUTPUT/${slug}/_gate.log`), new_agent_folders: newAgents,
    t1_candidates: changed.filter((c) => c.status !== 'D' && (c.path.startsWith('qa-system/qa-test-design/') ||
      ['qa-system/workflows/WORKFLOW.md', 'knowledge/_system_map.json', 'qa-system/qa-lead/AGENT.md', 'qa-system/tools/system/agent-doctor.js',
        'qa-system/tools/system/lint-deliverables.js', 'qa-system/tools/lib/schema.js'].includes(c.path))).map((c) => c.path),
    tests_changed: changed.filter((c) => c.status !== 'D' && /^qa-system\/tools\/__tests__\/[^/]+\.test\.js$/.test(c.path)).map((c) => c.path),
    unfilled_placeholders: placeholders, read_only_changed: readOnlyChanged,
  };
}

function cmdInventory() {
  const ws = workspace();
  checkOrigin(ws);
  const id = currentStudent(ws);
  const starterSha = refSha(ws, `refs/tags/${EXAM.tag}`);
  if (starterSha !== EXAM.starterSha) throw need('STARTER_MISMATCH', 'Tag đề thi trên máy không khớp bản chính thức.', 'Chạy lệnh START trước.');
  const inv = collectInventory(ws, starterSha);
  fs.mkdirSync(path.join(ws, '.scratch'), { recursive: true });
  fs.writeFileSync(path.join(ws, '.scratch', 'exam-inventory.json'), `${JSON.stringify(inv, null, 2)}\n`);
  log(`Inventory cho exams/${id} → .scratch/exam-inventory.json`);
  log(`  File đã đổi so với đề: ${inv.changed_vs_starter.length} · stage có file: ${Object.values(inv.stages).filter(Boolean).length}/7 · batches: ${inv.batches.length}`);
  log(`  Placeholder <…> còn trong DECISIONS.md: ${inv.unfilled_placeholders['EXAM/DECISIONS.md']} · AI_USE.md: ${inv.unfilled_placeholders['EXAM/AI_USE.md']}`);
  if (inv.read_only_changed.length) log(`  ⚠ Đã sửa file chỉ-đọc (B-05): ${inv.read_only_changed.join(', ')}`);
  return { status: 'SUCCESS', code: 'INVENTORY', message_vi: 'Đã thu thập dữ kiện bài làm (không thay đổi file nào).',
    next_vi: 'Cập nhật các trường cần đánh giá trong EXAM/submission.json đúng theo dữ kiện này và EXAM/DECISIONS.md, rồi chạy submit.', facts: inv };
}

/** Exact per-file recovery for changed read-only paths. Added files are never deleted for the student. */
function restoreAdvice(ws, files) {
  const inStarter = (f) => git(ws, ['cat-file', '-e', `${EXAM.starterSha}:${f}`]).ok;
  const restore = files.filter(inStarter);
  const added = files.filter((f) => !inStarter(f));
  const parts = [];
  if (restore.length) {
    parts.push(`Khôi phục file chỉ-đọc đã bị sửa/xoá (được học viên đồng ý thì chạy): ${restore.map((f) => `\`git restore --source ${EXAM.tag} --staged --worktree -- "${f}"\``).join(' ; ')}.`);
  }
  if (added.length) {
    parts.push(`File MỚI nằm trong thư mục chỉ-đọc (không có trong đề): ${added.join(', ')}. Hỏi học viên rồi chuyển chúng ra ngoài thư mục đó (ví dụ vào OUTPUT/${EXAM.slug}/notes/) — không xoá.`);
  }
  return `${parts.join(' ')} Sau đó chạy lại SUBMIT.`;
}

function cmdSubmit() {
  step(1, 'Kiểm tra môi trường và nhánh');
  checkTools();
  const ws = workspace();
  checkOrigin(ws);
  const id = currentStudent(ws);
  const branch = `exams/${id}`;
  const starterSha = fetchAndVerifyStarter(ws);
  const b = ensureBranch(ws, id, starterSha);
  log(`  Nhánh ${branch} (${b.how})`);

  step(2, 'Đồng bộ các trường dữ kiện trong EXAM/submission.json');
  const mPath = path.join(ws, 'EXAM', 'submission.json');
  if (!fs.existsSync(mPath)) {
    throw need('NO_MANIFEST', 'Chưa có EXAM/submission.json.', 'Chạy lệnh START trước (nó tạo file từ template mà không ghi đè bài).');
  }
  let m;
  try { m = JSON.parse(fs.readFileSync(mPath, 'utf8').replace(/^﻿/, '')); } catch (e) {
    throw need('MANIFEST_NOT_JSON', `EXAM/submission.json không phải JSON hợp lệ: ${e.message}.`, 'Nhờ trợ lý AI sửa cú pháp JSON (giữ nguyên nội dung), rồi chạy lại SUBMIT.');
  }
  const inv = collectInventory(ws, starterSha);
  const synced = [];
  const set = (obj, key, val, label) => { if (JSON.stringify(obj[key]) !== JSON.stringify(val)) { obj[key] = val; synced.push(label); } };
  set(m, 'student_id', id, 'student_id');
  set(m, 'branch', branch, 'branch');
  set(m, 'starter_commit', starterSha, 'starter_commit');
  const t3 = m.t3_pipeline;
  const arts = t3 && t3.artifacts;
  const officialOrNull = (declared, official, actual) => (declared === official || declared === null ? actual : declared);
  if (arts && typeof arts === 'object') {
    for (const k of ['00', '01', '02', '03', '04', '06']) {
      if (k in arts) set(arts, k, officialOrNull(arts[k], `OUTPUT/${EXAM.slug}/${STAGE_FILES[k]}`, inv.stages[k]), `t3_pipeline.artifacts.${k}`);
    }
    const g = `OUTPUT/${EXAM.slug}/_gate.log`;
    if ('gate_log' in t3) set(t3, 'gate_log', officialOrNull(t3.gate_log, g, inv.gate_log ? g : null), 't3_pipeline.gate_log');
  }
  const a5 = arts && arts['05'];
  if (a5 && typeof a5 === 'object') {
    set(a5, 'spec', officialOrNull(a5.spec, `OUTPUT/${EXAM.slug}/${STAGE_FILES['05']}`, inv.stages['05']), 't3_pipeline.artifacts.05.spec');
    set(a5, 'batches', inv.batches, 't3_pipeline.artifacts.05.batches');
    set(a5, 'blueprint', inv.blueprint, 't3_pipeline.artifacts.05.blueprint');
  }
  if (synced.length) {
    fs.writeFileSync(mPath, `${JSON.stringify(m, null, 2)}\n`);
    log(`  Đã cập nhật theo file thực tế: ${synced.join(', ')}`);
  } else log('  Các trường dữ kiện đã khớp.');

  step(3, 'Chạy self-check: npm run exam:check');
  const sc = selfCheck(ws);
  log(`  Preflight: ${sc.status} · public checks: ${sc.counts.PASS} PASS / ${sc.counts.FAIL} FAIL / ${sc.counts.SKIP} SKIP`);
  sc.gaps.forEach((g) => log(`  GAP ${g}`));
  if (sc.status === 'INVALID') {
    throw need('SELF_CHECK_INVALID', 'Self-check báo lỗi CHẶN (B-xx): bài này sẽ KHÔNG được chấm nếu nộp như vậy. Tôi chưa commit/push.',
      inv.read_only_changed.length
        ? restoreAdvice(ws, inv.read_only_changed)
        :'Sửa từng lỗi B-xx theo dòng "fix" trong output của `npm run exam:check`, rồi chạy lại SUBMIT.',
      { blocking: sc.blocking });
  }

  step(4, 'Commit và push');
  checkIdentity(ws);
  const all = git(ws, ['add', '--all', '--', '.']);
  if (!all.ok) throw fail('GIT_ADD_FAILED', 'Không thêm được file vào commit.', 'Gửi thông báo lỗi cho giảng viên.', { git: all.err });
  let commit = null;
  if (!git(ws, ['diff', '--cached', '--quiet']).ok) {
    const c = git(ws, ['commit', '-m', `exam(${id}): submission update`]);
    if (!c.ok) throw fail('COMMIT_FAILED', 'Không tạo được commit.', 'Gửi thông báo lỗi cho giảng viên.', { git: c.err });
    commit = gitOut(ws, ['rev-parse', 'HEAD']);
    log(`  Commit ${commit.slice(0, 12)}`);
  } else log('  Không có thay đổi mới cần commit.');
  const remoteSha = pushAndVerify(ws, branch);

  return {
    status: 'SUCCESS', code: 'SUBMITTED',
    message_vi: `Bài đã được push lên GitHub: ${branch} @ ${remoteSha.slice(0, 12)}. Self-check: ${sc.status}.`,
    next_vi: sc.status === 'VALID' ? 'Bài đúng hình thức (không còn GAP). Điều này KHÔNG có nghĩa là bài đã làm xong hay đạt: nội dung T1/T2/T3, quyết định A/B/C và các lý do chỉ được chấm khi giảng viên chấm. Bạn vẫn có thể nộp tiếp trước hạn chót.' : 'Còn GAP (phần chưa làm hoặc chưa khai báo). Bạn có thể làm tiếp và SUBMIT lại trước hạn chót 2026-12-15 23:59 (UTC+07).',
    facts: { workspace: ws, branch, head: remoteSha, commit, synced, self_check: sc.status, gaps: sc.gaps, counts: sc.counts,
      unfilled_placeholders: inv.unfilled_placeholders, web: webUrl(branch) },
  };
}

function main(argv) {
  const pos = argv.filter((a, i, all) => a !== '--dir' && all[i - 1] !== '--dir');
  const [cmd, arg] = pos;
  let result;
  try {
    const expected = cmd === 'start' ? 2 : 1;
    if (pos.length > expected) {
      throw need(cmd === 'start' ? 'BAD_STUDENT_ID' : 'USAGE', `Thừa tham số: "${pos.slice(1).join(' ')}". Mã học viên phải là MỘT từ, không có dấu cách (ví dụ: hv001).`,
        'Hỏi lại học viên mã chính xác rồi chạy lại, đặt mã trong dấu ngoặc kép: start "hv001".');
    }
    if (cmd === 'start') result = cmdStart(arg);
    else if (cmd === 'inventory') result = cmdInventory();
    else if (cmd === 'submit') result = cmdSubmit();
    else throw need('USAGE', 'Lệnh không hợp lệ.', 'Dùng: start <mã-học-viên> | inventory | submit');
  } catch (e) {
    if (!(e instanceof Stop)) e = fail('UNEXPECTED', `Lỗi không mong đợi: ${scrubSecrets(e.message)}`, 'Gửi thông báo lỗi cho giảng viên.');
    result = { status: e.status, code: e.code, message_vi: e.messageVi, next_vi: e.nextVi, facts: e.facts };
    log(`\n✖ ${e.code}: ${e.messageVi}\n  → ${e.nextVi}`);
    if (e.facts && e.facts.git) log(`  git: ${scrubSecrets(e.facts.git).split('\n').slice(-5).join('\n       ')}`);
  }
  if (result.status === 'SUCCESS') log(`\n✔ ${result.message_vi}\n  → ${result.next_vi}`);
  log(`RESULT ${JSON.stringify(result)}`);
  return result.status === 'SUCCESS' ? 0 : result.status === 'ACTION_REQUIRED' ? 2 : 1;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { EXAM, validateStudentId, sameRepo, buildManifest, fillMarkdown, classifyPushError, scrubSecrets, collectInventory, main };

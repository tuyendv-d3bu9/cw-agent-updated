#!/usr/bin/env node
/**
 * grading-setup.js — Turns the CURRENT clone into the dedicated grading clone (plan §1.4 layers 2 and 4).
 *
 *   npm run exam:grading-setup -- --exam <id> [--remote <name>] [--no-fetch]
 *
 * 1. git config remote.<remote>.pushurl DISABLED       (every push fails)
 * 2. .git/hooks/pre-push rejecting refs/heads/grading/*  (defence in depth)
 * 3. local branch grading/<exam> created from the starter tag (or switched to, if it exists)
 * Then prints the guard status that exam:grade checks before every run.
 */

const fs = require('fs');
const path = require('path');
const C = require('./lib/common');
const store = require('./lib/store');

function main(argv) {
  let exam;
  let remote;
  let fetch = true;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--exam') exam = argv[++i];
    else if (argv[i] === '--remote') remote = argv[++i];
    else if (argv[i] === '--no-fetch') fetch = false;
    else throw new Error(`Unknown argument ${argv[i]}`);
  }
  if (!exam) throw new Error('--exam <id> is required');
  const repo = store.repoRoot();
  const { cfg } = C.loadExam(exam);
  remote = remote || cfg.remote;
  if (!C.gitOk(repo, ['remote', 'get-url', remote]).ok) throw new Error(`Remote "${remote}" not found`);

  C.git(repo, ['config', `remote.${remote}.pushurl`, 'DISABLED']);
  console.log(`1. remote.${remote}.pushurl = DISABLED`);

  const hook = store.hookPath(repo);
  if (fs.existsSync(hook) && !fs.readFileSync(hook, 'utf8').includes(store.HOOK_MARK)) {
    throw new Error(`${hook} already exists and is not the grading guard; merge it by hand (see lib/store.js HOOK)`);
  }
  C.writeFileSafe(hook, store.HOOK);
  fs.chmodSync(hook, 0o755);
  console.log(`2. pre-push hook installed: ${path.relative(repo, hook)}`);

  const branch = `grading/${cfg.exam_id}`;
  if (C.gitOk(repo, ['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`]).ok) {
    C.git(repo, ['checkout', branch]);
    console.log(`3. switched to existing ${branch}`);
  } else {
    if (fetch && !C.gitOk(repo, ['rev-parse', '--verify', '--quiet', `refs/tags/${cfg.starter_tag}`]).ok) {
      C.git(repo, ['fetch', '--no-tags', remote, `refs/tags/${cfg.starter_tag}:refs/tags/${cfg.starter_tag}`]);
    }
    C.git(repo, ['checkout', '-b', branch, `refs/tags/${cfg.starter_tag}^{commit}`]);
    console.log(`3. created ${branch} from ${cfg.starter_tag}`);
  }

  const problems = store.guardProblems(repo, cfg, remote);
  if (problems.length) {
    console.log('Guard NOT satisfied:');
    problems.forEach((p) => console.log(`  - ${p}`));
    return 1;
  }
  console.log('Guard satisfied: exam:grade may run in this clone.');
  return 0;
}

if (require.main === module) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(`exam:grading-setup failed: ${e.message}`); process.exitCode = 1; }
}

module.exports = { main };

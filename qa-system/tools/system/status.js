#!/usr/bin/env node
/**
 * status.js — QA Leader dashboard: progress of each task in OUTPUT/.
 *
 *   taskStatus(slug)  { slug, status, done, total, source, nextAction, stopReason, batches }
 *
 * Progress comes from the ticks in 00_plan.md. A plan without ticks falls back to
 * the stage 01-06 deliverables actually present and their meta-line verdict, so a
 * task with files on disk never shows "0/6". The ASK state comes from the gate
 * itself (lib/schema meta reader), never from a substring search for "ASK".
 *
 * Usage:
 *   npm run status               # all tasks
 *   npm run status -- <slug>     # one task
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, listTaskSlugs } = require('../lib/paths');
const { deliverableProgress } = require('../lib/schema');

function taskStatus(slug) {
  const dir = taskDir(slug);
  const planFile = path.join(dir, '00_plan.md');
  const batchDir = path.join(dir, 'testcases');
  const plan = fs.existsSync(planFile) ? fs.readFileSync(planFile, 'utf8') : null;

  let done = 0;
  let total = 0;
  let source = 'plan';
  if (plan !== null) {
    done = (plan.match(/- \[x\]/gi) || []).length;
    total = done + (plan.match(/- \[ \]/g) || []).length;
  }
  const files = deliverableProgress(slug);
  if (done === 0 && files.present > 0) {
    done = files.done;
    total = files.total;
    source = 'files';
  }

  let gate = null;
  try { gate = require('./gate').evaluate(slug); } catch { /* never block viewing progress */ }

  let status;
  let nextAction;
  let stopReason = '';
  if (gate && gate.blocked && gate.phase !== 'pre-stage-2') {
    status = 'BLOCKED — waiting for BA/PO answers (ASK)';
    stopReason = gate.reasons.join(' · ');
    nextAction = `BA/PO answer the questions in knowledge/features/${slug}.md §7 (or decide in §8), then re-run the gate`;
  } else if (plan === null && files.present === 0) {
    status = 'NOT STARTED';
    nextAction = 'Create 00_plan.md';
  } else if (total > 0 && done >= total) {
    status = 'COMPLETED';
    nextAction = 'All stages done, ready for acceptance.';
  } else {
    status = 'IN-PROGRESS';
    const notPass = files.stages.find((x) => x.exists && x.verdict !== 'PASS');
    const missing = files.stages.find((x) => !x.exists);
    nextAction = notPass
      ? `Stage ${notPass.stage} has verdict ${notPass.verdict || 'unreadable'} — fix and re-run`
      : missing ? `Run Stage ${missing.stage}` : `Activate stage ${done + 1}`;
  }

  let batches = 0;
  if (fs.existsSync(batchDir)) batches = fs.readdirSync(batchDir).filter((f) => /^batch_.*\.md$/i.test(f)).length;

  return { slug, status, done, total, source, nextAction, stopReason, batches, stages: files.stages };
}

function main() {
  const targetSlug = process.argv[2];
  if (!fs.existsSync(PATHS.OUTPUT)) {
    console.log('OUTPUT directory does not exist. No tasks executed yet.');
    return;
  }
  const tasks = listTaskSlugs().filter((s) => !targetSlug || s === targetSlug);
  if (tasks.length === 0) {
    console.log('No active tasks found in OUTPUT/.');
    return;
  }

  console.log('===============================================================');
  console.log('             QA LEADER TASK DASHBOARD                          ');
  console.log('===============================================================\n');
  for (const slug of tasks) {
    const t = taskStatus(slug);
    const src = t.source === 'files' ? ' (from 01-06 files with Verdict: PASS)' : '';
    const batchInfo = t.batches ? ` · ${t.batches} test case batch(es)` : '';
    console.log(`Task: [ ${slug} ]`);
    console.log(`   - Status:      ${t.status}`);
    console.log(`   - Progress:    ${t.done}/${t.total}${src}${batchInfo}`);
    const present = t.stages.filter((x) => x.exists).map((x) => `${x.stage}:${x.verdict || '?'}`);
    if (present.length) console.log(`   - Deliverables: ${present.join(' · ')}`);
    if (t.stopReason) console.log(`   - Blocker:     ${t.stopReason}`);
    console.log(`   Next step:     ${t.nextAction}`);
    console.log('---------------------------------------------------------------');
  }
  console.log('\nTo resume a task, tell the agent: "Resume task <task-slug>" or "Proceed"');
  console.log('===============================================================\n');
}

if (require.main === module) main();

module.exports = { taskStatus };

#!/usr/bin/env node
/**
 * status.js — QA Leader Dashboard: Scans task progress in OUTPUT/
 *
 * Usage:
 *   npm run status               # View dashboard for all tasks
 *   npm run status -- <slug>     # View details for a specific task
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');

const outputDir = PATHS.OUTPUT;
const targetSlug = process.argv[2];

if (!fs.existsSync(outputDir)) {
  console.log('OUTPUT directory does not exist. No tasks executed yet.');
  process.exit(0);
}

const tasks = fs.readdirSync(outputDir).filter(f => {
  const fullPath = path.join(outputDir, f);
  return fs.statSync(fullPath).isDirectory() && !f.endsWith('.bak') && !f.startsWith('_');
});

if (tasks.length === 0) {
  console.log('No active tasks found in OUTPUT/.');
  process.exit(0);
}

console.log('===============================================================');
console.log('             QA LEADER TASK DASHBOARD                          ');
console.log('===============================================================\n');

tasks.forEach(slug => {
  if (targetSlug && slug !== targetSlug) return;

  const taskDir = path.join(outputDir, slug);
  const planFile = path.join(taskDir, '00_plan.md');
  const indexFile = path.join(taskDir, '_index.md');
  const batchDir = path.join(taskDir, 'testcases');

  let status = 'UNKNOWN';
  let completedMilestones = 0;
  let totalMilestones = 6;
  let nextAction = 'Plan file 00_plan.md needs to be generated';
  let stopReason = '';

  if (fs.existsSync(planFile)) {
    const planText = fs.readFileSync(planFile, 'utf8');
    const checked = (planText.match(/- \[x\]/gi) || []).length;
    const unchecked = (planText.match(/- \[ \]/gi) || []).length;
    completedMilestones = checked;
    totalMilestones = checked + unchecked;

    const missingReportFile = path.join(taskDir, '02_missing_rule_report.md');
    let hasUnresolvedAsk = planText.includes('Verdict: ASK') || planText.includes('| ASK |');
    
    if (fs.existsSync(missingReportFile)) {
      const missingText = fs.readFileSync(missingReportFile, 'utf8');
      if (missingText.includes('Verdict: ASK') || missingText.includes('| ASK |')) {
        hasUnresolvedAsk = true;
      }
    }

    if (hasUnresolvedAsk) {
      status = '⛔ HARD_STOP_BLOCKED (WAITING FOR BA/USER - ASK)';
      stopReason = 'Phát hiện kẽ hở logic hoặc câu hỏi treo chưa được xác nhận. TUYỆT ĐỐI CẤM nhảy cóc sang Test Case!';
      nextAction = `Cần User/BA trả lời các câu hỏi tại 02_missing_rule_report.md hoặc cập nhật Mục 8 vào knowledge/features/${slug}.md`;
    } else if (unchecked === 0 && totalMilestones > 0) {
      status = '✅ COMPLETED (PASS)';
      nextAction = 'Toàn bộ các chặng đã hoàn tất và sẵn sàng nghiệm thu.';
    } else {
      status = '🔄 IN-PROGRESS';
      nextAction = `Kích hoạt Chặng ${completedMilestones + 1}`;
    }
  }

  // Check if batch test cases exist
  let batchInfo = '';
  if (fs.existsSync(batchDir)) {
    const batches = fs.readdirSync(batchDir).filter(f => f.startsWith('batch_') && f.endsWith('.md'));
    if (batches.length > 0) {
      batchInfo = ` (${batches.length} test case batch(es) generated)`;
    }
  }

  console.log(`📌 Task: [ ${slug} ]`);
  console.log(`   - Status:      ${status}`);
  console.log(`   - Progress:    ${completedMilestones}/${totalMilestones} milestones completed${batchInfo}`);
  if (stopReason) {
    console.log(`   - Blocker:     ${stopReason}`);
  }
  console.log(`   👉 Next Step:  ${nextAction}`);
  console.log('---------------------------------------------------------------');
});

console.log('\n💡 To resume or run any task, prompt the agent:');
console.log('   "Resume task <task-slug>" or "Proceed"');
console.log('===============================================================\n');

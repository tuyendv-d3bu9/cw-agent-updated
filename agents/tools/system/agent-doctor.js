#!/usr/bin/env node
/**
 * agent-doctor.js — Diagnostics, integrity verification, and blast radius impact analysis
 *
 * Usage:
 *   npm run agent:check                       # Verify full agent system integrity
 *   npm run agent:check --impact <agent-name> # Blast radius impact analysis when modifying an agent
 * Examples:
 *   npm run agent:check --impact qa-analyst
 *   npm run agent:check --impact 01
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');

const agentsDir = PATHS.AGENTS;
const mapPath = PATHS.SYSTEM_MAP;

const args = process.argv.slice(2);
const impactIndex = args.indexOf('--impact');
const targetImpact = impactIndex !== -1 ? args[impactIndex + 1] : null;

// Dependency Graph between Deliverables and Skills
const PIPELINE_DEPENDENCIES = {
  '01': {
    skill: 'agents/qa-analyst/skills/requirement-risk-summary.md',
    produces: '01_requirement_risk_summary.md',
    consumed_by: [
      { step: '02', name: 'qa-analyst/missing-rule-06w', reason: 'Consumes Business Rules to scan for 06W gaps' },
      { step: '03', name: 'qa-analyst/viewpoint-selection', reason: 'Consumes Risk Matrix and business criticality context' },
      { step: '04', name: 'qa-analyst/test-idea-design', reason: 'Consumes Business Rules to generate test ideas' },
      { step: '05', name: 'qa-test-design/test-case-generation', reason: 'Traces BR-xx IDs into test case tags' },
      { step: '06', name: 'qa-test-design/coverage-review', reason: 'Evaluates 100% BR-xx coverage' },
      { step: '09', name: 'qa-test-data/data-class-map', reason: 'Consumes input fields for Data Class mapping' }
    ]
  },
  '02': {
    skill: 'agents/qa-analyst/skills/missing-rule-06w.md',
    produces: '02_missing_rule_report.md',
    consumed_by: [
      { step: '03', name: 'qa-analyst/viewpoint-selection', reason: 'Integrates 06W gaps into risk viewpoints' },
      { step: 'knowledge', name: 'knowledge/features/<slug>.md', reason: 'Records open questions to section 7 and resolved answers to section 8' }
    ]
  },
  '03': {
    skill: 'agents/qa-analyst/skills/viewpoint-selection.md',
    produces: '03_viewpoint_report.md',
    consumed_by: [
      { step: '04', name: 'qa-analyst/test-idea-design', reason: 'Allocates test ideas per viewpoint' },
      { step: '05', name: 'qa-test-design/test-case-generation', reason: 'Traces VP-xx IDs into test case tags' },
      { step: '06', name: 'qa-test-design/coverage-review', reason: 'Reviews viewpoint coverage' },
      { step: '07', name: 'qa-exploratory/exploratory-charter', reason: 'Derives exploratory charters from risk areas' }
    ]
  },
  '04': {
    skill: 'agents/qa-analyst/skills/test-idea-design.md',
    produces: '04_test_idea_report.md',
    consumed_by: [
      { step: '05', name: 'qa-test-design/test-case-generation', reason: 'Expands kept test ideas into 8-field test case specifications' }
    ]
  },
  '05': {
    skill: 'agents/qa-test-design/skills/test-case-generation.md',
    produces: '05_test_case_spec.md & 05_test_blueprint.json',
    consumed_by: [
      { step: '06', name: 'qa-test-design/coverage-review', reason: 'Reviews test case execution coverage' },
      { step: '12', name: 'qa-test-data/data-validation-traceability', reason: 'Maps test datasets to specific TC_IDs' },
      { step: 'readiness', name: 'qa-readiness-evaluator/gen-readiness-report', reason: 'Đo độ phủ/trace từ 05_ để tính khuyến nghị Go/No-Go trước automation' },
      { step: 'automation', name: 'qa-automation/flow-clustering & pom-generator', reason: 'Clusters flows, generates POM, and executes Playwright E2E' }
    ]
  },
  '09': {
    skill: 'agents/qa-test-data/skills/data-class-map.md',
    produces: '09_data_class_map.md',
    consumed_by: [
      { step: '10', name: 'qa-test-data/dataset-generation', reason: 'Uses field maps to generate realistic datasets' },
      { step: '11', name: 'qa-test-data/boundary-negative-dataset', reason: 'Uses min/max boundaries to generate edge datasets' }
    ]
  },
  'readiness': {
    skill: 'agents/qa-readiness-evaluator/skills/gen-readiness-report.md',
    produces: '15_readiness_report.md & 15_readiness_metrics.json',
    consumed_by: [
      { step: 'automation', name: 'qa-automation/flow-clustering & pom-generator', reason: 'Acts as Go/No-Go gate before implementing POM and running Playwright E2E' }
    ]
  }
};

// 1. Impact Analysis Mode
if (targetImpact) {
  console.log('===============================================================');
  console.log(`      BLAST RADIUS & IMPACT ANALYSIS REPORT                    `);
  console.log('===============================================================\n');

  let matchedStep = null;
  for (const [step, info] of Object.entries(PIPELINE_DEPENDENCIES)) {
    if (step === targetImpact || info.skill.includes(targetImpact) || info.produces.includes(targetImpact)) {
      matchedStep = step;
      break;
    }
  }

  if (targetImpact.includes('qa-analyst') || targetImpact === 'analyst') {
    matchedStep = '01';
  } else if (targetImpact.includes('qa-test-design') || targetImpact === 'test-design') {
    matchedStep = '05';
  } else if (targetImpact.includes('qa-test-data') || targetImpact === 'test-data') {
    matchedStep = '09';
  } else if (targetImpact.includes('qa-readiness-evaluator') || targetImpact === 'readiness') {
    matchedStep = 'readiness';
  }

  if (matchedStep && PIPELINE_DEPENDENCIES[matchedStep]) {
    const dep = PIPELINE_DEPENDENCIES[matchedStep];
    console.log(`🎯 Target Component: [ ${dep.skill} ]`);
    console.log(`📦 Output Artifact:  [ ${dep.produces} ]\n`);
    console.log('⚠️  DOWNSTREAM IMPACT (BLAST RADIUS):');
    console.log('---------------------------------------------------------------');
    dep.consumed_by.forEach((consumer, idx) => {
      console.log(` ${idx + 1}. Step [${consumer.step}] -> ${consumer.name}`);
      console.log(`    Impact Reason: ${consumer.reason}`);
    });
    console.log('---------------------------------------------------------------');
    console.log('\n📋 REQUIRED SYNCHRONIZATION CHECKLIST:');
    console.log(' [ ] If identifier format changes (e.g., BR-xx -> REQ-xx) -> Update all downstream consumers.');
    console.log(' [ ] If fields are added/removed in output -> Update format parser in downstream steps.');
    console.log(' [ ] Update agents/qa-lead/AGENT.md if skill name or arguments changed.');
    console.log(' [ ] Run: npm run map:sync to re-synchronize system map.\n');
  } else {
    console.log(`ℹ️ No explicit dependency entry found for: "${targetImpact}".`);
    console.log('Suggested targets: qa-analyst, qa-test-design, qa-test-data, 01, 02, 03, 04, 05, 09');
  }
  process.exit(0);
}


// ═══════════════════════════════════════════════════════════════
// 2. System Health Check Mode
//
// Nguyên tắc: KHÔNG hardcode danh sách agent, KHÔNG miễn trừ ai, KHÔNG khớp lỏng.
// Bản cũ hardcode 9 agent + khớp bằng `includes()` + miễn trừ qa-lead, nên nó báo
// "100% SYSTEM INTEGRITY VERIFIED" ngay cả khi WORKFLOW.md đã lệch khỏi thực tế.
// ═══════════════════════════════════════════════════════════════

const problems = [];
const warn = (where, msg) => problems.push({ level: 'WARN', where, msg });
const fail = (where, msg) => problems.push({ level: 'FAIL', where, msg });

console.log('===============================================================');
console.log('        KIỂM TOÀN VẸN HỆ THỐNG AGENT (AGENT DOCTOR)            ');
console.log('===============================================================\n');

// ─── A. Tự phát hiện agent, không dùng danh sách cứng ───
const discovered = fs
  .readdirSync(agentsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name.startsWith('qa-'))
  .map((d) => d.name)
  .sort();

if (discovered.length === 0) {
  console.error('❌ Không tìm thấy agent nào trong agents/. Sai thư mục gốc?');
  process.exit(1);
}

console.log(`🔍 Phát hiện ${discovered.length} agent trong agents/\n`);

/**
 * Bóc danh sách skill khai báo ở mục tiêu đề chứa chữ "Skill" của AGENT.md.
 *
 * Quy ước tiêu đề trong repo không đồng nhất — có cả `## Skill sở hữu`,
 * `## 2. Skill & Công cụ sở hữu`, `## 2.1. Skill Sở Hữu Của Chính QA Leader`.
 * Khớp theo *nội dung* tiêu đề thay vì ép một dạng duy nhất.
 */
function declaredSkills(content) {
  const out = [];
  let inside = false;
  for (const line of content.split('\n')) {
    if (/^##\s+(?:[\d.]+\.?\s+)?.*\bskill\b/i.test(line)) { inside = true; continue; }
    if (inside && /^##\s/.test(line)) break;
    if (!inside) continue;
    const m = line.match(/^-\s+`([^`]+)`/);
    if (m) out.push(m[1].trim());
  }
  return out;
}

const allSkills = []; // {agent, skill}

for (const agent of discovered) {
  const agentFile = path.join(agentsDir, agent, 'AGENT.md');
  const skillsDir = path.join(agentsDir, agent, 'skills');

  if (!fs.existsSync(agentFile)) {
    fail(agent, 'Thiếu file danh tính AGENT.md');
    console.log(`🤖 ${agent.padEnd(26)} ❌ thiếu AGENT.md`);
    continue;
  }

  const declared = declaredSkills(fs.readFileSync(agentFile, 'utf8'));
  const actual = fs.existsSync(skillsDir)
    ? fs.readdirSync(skillsDir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
    : [];

  // Khớp CHẶT: tên khai báo phải bằng đúng tên file (bỏ .md). Không dùng includes().
  const missingFile = declared.filter((s) => !actual.includes(s));
  const undeclared = actual.filter((s) => !declared.includes(s));

  missingFile.forEach((s) =>
    fail(agent, `AGENT.md khai skill \`${s}\` nhưng không có file skills/${s}.md`)
  );
  // Không miễn trừ agent nào — kể cả qa-lead.
  undeclared.forEach((s) =>
    warn(agent, `Có file skills/${s}.md nhưng AGENT.md không khai báo`)
  );

  actual.forEach((s) => allSkills.push({ agent, skill: s }));

  const status = missingFile.length ? '❌' : undeclared.length ? '⚠️ ' : '✅';
  console.log(`🤖 ${agent.padEnd(26)} ${status} ${actual.length} skill`);
}

// ─── B. Bản đồ hệ thống có biết đủ mọi agent không ───
console.log('\n--- Đối soát knowledge/_system_map.json ---');
let map = null;
try {
  map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
} catch (e) {
  fail('_system_map.json', `Không đọc được: ${e.message}`);
}

if (map) {
  const mapped = new Set(Object.keys(map.specialized_agents || {}).map((k) => k.replace(/_/g, '-')));
  discovered.forEach((a) => {
    if (!mapped.has(a)) fail('_system_map.json', `Agent \`${a}\` chưa được khai trong specialized_agents`);
  });
  [...mapped].forEach((a) => {
    if (!discovered.includes(a)) fail('_system_map.json', `specialized_agents khai \`${a}\` nhưng thư mục không tồn tại`);
  });

  // Mọi đường dẫn trong routing_table phải trỏ tới file có thật.
  for (const [key, val] of Object.entries(map.routing_table || {})) {
    if (typeof val !== 'string') continue;
    if (!val.includes('/') || val.startsWith('npm ') || val.startsWith('http') || val.includes('<')) continue;
    if (!fs.existsSync(path.join(PATHS.ROOT, val))) {
      fail('_system_map.json', `routing_table.${key} trỏ tới file không tồn tại: ${val}`);
    }
  }
  console.log(`   ${discovered.length} agent · ${Object.keys(map.routing_table || {}).length} mục routing`);
}

// ─── C. WORKFLOW.md có biết đủ mọi skill không ───
console.log('\n--- Đối soát agents/workflows/WORKFLOW.md ---');
const wfPath = path.join(agentsDir, 'workflows', 'WORKFLOW.md');
if (!fs.existsSync(wfPath)) {
  fail('WORKFLOW.md', 'Không tồn tại');
} else {
  const wf = fs.readFileSync(wfPath, 'utf8');
  const absent = allSkills.filter(({ skill }) => !wf.includes(skill));
  absent.forEach(({ agent, skill }) =>
    fail('WORKFLOW.md', `Skill \`${agent}/${skill}\` không có mặt trong bảng điều phối`)
  );
  console.log(`   ${allSkills.length - absent.length}/${allSkills.length} skill có mặt trong bảng điều phối`);
}

// ─── D. package.json có trỏ đúng file tool không ───
console.log('\n--- Đối soát package.json ---');
try {
  const scripts = JSON.parse(fs.readFileSync(path.join(PATHS.ROOT, 'package.json'), 'utf8')).scripts || {};
  let checked = 0;
  for (const [name, cmd] of Object.entries(scripts)) {
    const m = cmd.match(/node\s+(agents\/tools\/[^\s]+\.js)/);
    if (!m) continue;
    checked++;
    if (!fs.existsSync(path.join(PATHS.ROOT, m[1]))) {
      fail('package.json', `Script \`${name}\` trỏ tới file không tồn tại: ${m[1]}`);
    }
  }
  console.log(`   ${checked} script trỏ tới agents/tools/ đã kiểm`);
} catch (e) {
  fail('package.json', `Không đọc được: ${e.message}`);
}

// ─── E. Cổng ASK có đang khoá task nào không ───
console.log('\n--- Đối soát cổng ASK ---');
try {
  const { evaluate, audit } = require('./gate');
  const { listTaskSlugs } = require('../lib/paths');
  const slugs = listTaskSlugs();
  if (slugs.length === 0) {
    console.log('   Chưa có task nào trong OUTPUT/');
  } else {
    for (const slug of slugs) {
      const st = evaluate(slug);
      const au = audit(slug);
      if (au.violations?.length) {
        fail(`gate/${slug}`, `${au.violations.length} deliverable sinh ra khi cổng còn khoá: ${au.violations.map((v) => v.file).join(', ')}`);
      }
      (st.advisories || []).forEach((a) => warn(`gate/${slug}`, a));
      console.log(`   ${slug.padEnd(26)} ${st.blocked ? '⛔ ĐÓNG' : '✅ mở'}`);
    }
  }
} catch (e) {
  warn('gate', `Không kiểm được cổng ASK: ${e.message}`);
}

// ─── F. Độ sẵn sàng Automation ───
console.log('\n--- Đối soát cổng Go/No-Go (Automation) ---');
try {
  const { collect, decide } = require('./readiness');
  const { listTaskSlugs } = require('../lib/paths');
  const slugs = listTaskSlugs();
  if (slugs.length === 0) {
    console.log('   Chưa có task nào trong OUTPUT/');
  } else {
    for (const slug of slugs) {
      const d = decide(collect(slug));
      const icon = { 'GO': '✅', 'CONDITIONAL GO': '⚠️ ', 'NO-GO': '⛔' }[d.verdict];
      console.log(`   ${slug.padEnd(26)} ${icon} ${d.verdict}`);
    }
  }
} catch (e) {
  warn('readiness', `Không đo được độ sẵn sàng: ${e.message}`);
}

// ─── Kết luận ───
const fails = problems.filter((p) => p.level === 'FAIL');
const warns = problems.filter((p) => p.level === 'WARN');

console.log('\n---------------------------------------------------------------');
if (problems.length === 0) {
  console.log('🎉 TOÀN VẸN: agent · skill · bản đồ · workflow · package · cổng ASK đều khớp.');
} else {
  if (fails.length) {
    console.log(`❌ ${fails.length} LỖI phải sửa:`);
    fails.forEach((p, i) => console.log(`   ${i + 1}. [${p.where}] ${p.msg}`));
  }
  if (warns.length) {
    console.log(`${fails.length ? '\n' : ''}⚠️  ${warns.length} cảnh báo:`);
    warns.forEach((p, i) => console.log(`   ${i + 1}. [${p.where}] ${p.msg}`));
  }
}
console.log('\n💡 Xem bán kính ảnh hưởng trước khi sửa:');
console.log('   npm run agent:check -- --impact <tên-agent>');
console.log('===============================================================\n');

process.exit(fails.length > 0 ? 1 : 0);

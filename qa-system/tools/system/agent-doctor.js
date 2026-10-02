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
      { step: 'readiness', name: 'qa-readiness-evaluator/gen-readiness-report', reason: 'Measures coverage and trace from 05_ to derive the Go/No-Go recommendation' },
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
// Principles: no hard-coded agent list, no exemptions, no loose matching.
// The previous version hard-coded nine agents, matched with `includes()` and
// exempted qa-lead, so it reported full integrity even while WORKFLOW.md had
// drifted away from what was actually on disk.
// ═══════════════════════════════════════════════════════════════

const problems = [];
const warn = (where, msg) => problems.push({ level: 'WARN', where, msg });
const fail = (where, msg) => problems.push({ level: 'FAIL', where, msg });

console.log('===============================================================');
console.log('        KIỂM TOÀN VẸN HỆ THỐNG AGENT (AGENT DOCTOR)            ');
console.log('===============================================================\n');

// ─── A. Discover agents from disk ───
const discovered = fs
  .readdirSync(agentsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name.startsWith('qa-'))
  .map((d) => d.name)
  .sort();

if (discovered.length === 0) {
  console.error('No agents found under qa-system/. Wrong root directory?');
  process.exit(1);
}

console.log(`Discovered ${discovered.length} agent(s) under qa-system/\n`);

/**
 * Skills declared under any AGENT.md heading containing the word "Skill".
 *
 * Heading conventions vary across the repo (`## Skill sở hữu`,
 * `## 2. Skill & Công cụ sở hữu`, `## 2.1. Skill Sở Hữu Của Chính QA Leader`),
 * so match on heading *text* rather than forcing a single shape.
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
    fail(agent, 'Missing identity file AGENT.md');
    console.log(`  ${agent.padEnd(26)} FAIL  no AGENT.md`);
    continue;
  }

  const declared = declaredSkills(fs.readFileSync(agentFile, 'utf8'));
  const actual = fs.existsSync(skillsDir)
    ? fs.readdirSync(skillsDir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
    : [];

  // Strict match: a declared name must equal the filename without .md.
  const missingFile = declared.filter((s) => !actual.includes(s));
  const undeclared = actual.filter((s) => !declared.includes(s));

  missingFile.forEach((s) =>
    fail(agent, `AGENT.md declares skill \`${s}\` but skills/${s}.md does not exist`)
  );
  // No agent is exempt, qa-lead included.
  undeclared.forEach((s) =>
    warn(agent, `skills/${s}.md exists but AGENT.md does not declare it`)
  );

  actual.forEach((s) => allSkills.push({ agent, skill: s }));

  const status = missingFile.length ? '❌' : undeclared.length ? '⚠️ ' : '✅';
  console.log(`🤖 ${agent.padEnd(26)} ${status} ${actual.length} skill`);
}

// ─── B. Does the system map know every agent ───
console.log('\n--- Cross-checking knowledge/_system_map.json ---');
let map = null;
try {
  map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
} catch (e) {
  fail('_system_map.json', `Unreadable: ${e.message}`);
}

if (map) {
  const mapped = new Set(Object.keys(map.specialized_agents || {}).map((k) => k.replace(/_/g, '-')));
  discovered.forEach((a) => {
    if (!mapped.has(a)) fail('_system_map.json', `Agent \`${a}\` is not declared in specialized_agents`);
  });
  [...mapped].forEach((a) => {
    if (!discovered.includes(a)) fail('_system_map.json', `specialized_agents declares \`${a}\` but no such directory exists`);
  });

  // Every routing_table path must point at a file that exists.
  for (const [key, val] of Object.entries(map.routing_table || {})) {
    if (typeof val !== 'string') continue;
    if (!val.includes('/') || val.startsWith('npm ') || val.startsWith('http') || val.includes('<')) continue;
    if (!fs.existsSync(path.join(PATHS.ROOT, val))) {
      fail('_system_map.json', `routing_table.${key} points at a missing file: ${val}`);
    }
  }
  console.log(`   ${discovered.length} agent(s) · ${Object.keys(map.routing_table || {}).length} routing entries`);
}

// ─── C. Does WORKFLOW.md know every skill ───
console.log('\n--- Cross-checking qa-system/workflows/WORKFLOW.md ---');
const wfPath = path.join(agentsDir, 'workflows', 'WORKFLOW.md');
if (!fs.existsSync(wfPath)) {
  fail('WORKFLOW.md', 'File does not exist');
} else {
  const wf = fs.readFileSync(wfPath, 'utf8');
  const absent = allSkills.filter(({ skill }) => !wf.includes(skill));
  absent.forEach(({ agent, skill }) =>
    fail('WORKFLOW.md', `Skill \`${agent}/${skill}\` is absent from the dispatch table`)
  );
  console.log(`   ${allSkills.length - absent.length}/${allSkills.length} skill(s) present in the dispatch table`);
}

// ─── D. Do package.json scripts point at real files ───
console.log('\n--- Cross-checking package.json ---');
try {
  const scripts = JSON.parse(fs.readFileSync(path.join(PATHS.ROOT, 'package.json'), 'utf8')).scripts || {};
  let checked = 0;
  for (const [name, cmd] of Object.entries(scripts)) {
    const m = cmd.match(/node\s+(agents\/tools\/[^\s]+\.js)/);
    if (!m) continue;
    checked++;
    if (!fs.existsSync(path.join(PATHS.ROOT, m[1]))) {
      fail('package.json', `Script \`${name}\` points at a missing file: ${m[1]}`);
    }
  }
  console.log(`   ${checked} script(s) targeting qa-system/tools/ checked`);
} catch (e) {
  fail('package.json', `Không đọc được: ${e.message}`);
}

// ─── E. ASK gate state per task ───
console.log('\n--- Cross-checking the ASK gate ---');
try {
  const { evaluate, audit } = require('./gate');
  const { listTaskSlugs } = require('../lib/paths');
  const slugs = listTaskSlugs();
  if (slugs.length === 0) {
    console.log('   No tasks in OUTPUT/ yet');
  } else {
    for (const slug of slugs) {
      const st = evaluate(slug);
      const au = audit(slug);
      if (au.violations?.length) {
        fail(`gate/${slug}`, `${au.violations.length} deliverable(s) written while the gate was locked: ${au.violations.map((v) => v.file).join(', ')}`);
      }
      (st.advisories || []).forEach((a) => warn(`gate/${slug}`, a));
      console.log(`   ${slug.padEnd(26)} ${st.blocked ? 'CLOSED' : 'open'}`);
    }
  }
} catch (e) {
  warn('gate', `Could not evaluate the ASK gate: ${e.message}`);
}

// ─── F. Lint deliverable ───
console.log('\n--- Cross-checking deliverables against FACT ---');
try {
  const { lint } = require('./lint-deliverables');
  const { listTaskSlugs } = require('../lib/paths');
  const slugs = listTaskSlugs();
  if (slugs.length === 0) {
    console.log('   No tasks in OUTPUT/ yet');
  } else {
    for (const slug of slugs) {
      const r = lint(slug);
      r.errors.forEach((e) => fail(`lint/${slug}`, `${e.file} [${e.where}] ${e.msg}`));
      const icon = r.clean ? (r.warns.length ? '⚠️ ' : '✅') : '❌';
      console.log(`   ${slug.padEnd(26)} ${icon} ${r.totalCases} case(s) · ${r.errors.length} error(s) · ${r.warns.length} warning(s)`);
    }
  }
} catch (e) {
  warn('lint', `Could not lint deliverables: ${e.message}`);
}

// ─── G. Automation readiness ───
console.log('\n--- Cross-checking the Go/No-Go gate ---');
try {
  const { collect, decide } = require('./readiness');
  const { listTaskSlugs } = require('../lib/paths');
  const slugs = listTaskSlugs();
  if (slugs.length === 0) {
    console.log('   No tasks in OUTPUT/ yet');
  } else {
    for (const slug of slugs) {
      const d = decide(collect(slug));
      const icon = { 'GO': '✅', 'CONDITIONAL GO': '⚠️ ', 'NO-GO': '⛔' }[d.verdict];
      console.log(`   ${slug.padEnd(26)} ${icon} ${d.verdict}`);
    }
  }
} catch (e) {
  warn('readiness', `Could not measure readiness: ${e.message}`);
}

// ─── Summary ───
const fails = problems.filter((p) => p.level === 'FAIL');
const warns = problems.filter((p) => p.level === 'WARN');

console.log('\n---------------------------------------------------------------');
if (problems.length === 0) {
  console.log('INTACT: agents, skills, system map, workflow, package scripts and gates all agree.');
} else {
  if (fails.length) {
    console.log(`${fails.length} ERROR(S) to fix:`);
    fails.forEach((p, i) => console.log(`   ${i + 1}. [${p.where}] ${p.msg}`));
  }
  if (warns.length) {
    console.log(`${fails.length ? '\n' : ''}${warns.length} warning(s):`);
    warns.forEach((p, i) => console.log(`   ${i + 1}. [${p.where}] ${p.msg}`));
  }
}
console.log('\nBlast radius before editing an agent:');
console.log('   npm run agent:check -- --impact <agent-name>');
console.log('===============================================================\n');

process.exit(fails.length > 0 ? 1 : 0);

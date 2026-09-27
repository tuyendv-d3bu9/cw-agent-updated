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

const agentsDir = path.join(process.cwd(), 'agents');
const mapPath = path.join(process.cwd(), 'knowledge', '_system_map.json');

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
      { step: 'readiness', name: 'qa-readiness-evaluator/gen-readiness-report', reason: 'Cross-checks test cases CSV/spec against coverage plan & rules before automation' },
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
    produces: 'outputs/reports/readiness-report.md',
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

// 2. System Health Check Mode
console.log('===============================================================');
console.log('           AGENT ECOSYSTEM HEALTH & INTEGRITY CHECK            ');
console.log('===============================================================\n');

const agentDirs = ['qa-lead', 'qa-analyst', 'qa-test-design', 'qa-test-data', 'qa-exploratory', 'qa-ui-review', 'qa-reporter', 'qa-automation', 'qa-readiness-evaluator'];
let totalErrors = 0;

agentDirs.forEach(agentName => {
  const agentPath = path.join(agentsDir, agentName);
  const agentFile = path.join(agentPath, 'AGENT.md');
  const skillsPath = path.join(agentPath, 'skills');

  if (!fs.existsSync(agentFile)) {
    console.log(`❌ ERROR: Missing identity file [ ${agentFile} ]`);
    totalErrors++;
    return;
  }

  // Read AGENT.md to inspect declared skills
  const agentContent = fs.readFileSync(agentFile, 'utf8');
  let declaredSkills = [];
  const lines = agentContent.split('\n');
  let inSkillSection = false;
  
  for (const line of lines) {
    if (line.startsWith('## Skill') || line.startsWith('## Skills')) {
      inSkillSection = true;
      continue;
    }
    if (inSkillSection && line.startsWith('## ')) {
      break;
    }
    if (inSkillSection) {
      const match = line.match(/^-\s+`([^`]+)`/);
      if (match) {
        declaredSkills.push(match[1]);
      }
    }
  }

  // Check actual skill files
  let actualSkills = [];
  if (fs.existsSync(skillsPath)) {
    actualSkills = fs.readdirSync(skillsPath).filter(f => f.endsWith('.md'));
  }

  let status = '✅ OK';
  let issue = '';

  declaredSkills.forEach(s => {
    const found = actualSkills.some(act => act.startsWith(s) || act.includes(s));
    if (!found && agentName !== 'qa-lead') {
      status = '⚠️  MISMATCH';
      issue += `Declared skill "${s}" not found in skills/ directory. `;
      totalErrors++;
    }
  });

  console.log(`🤖 Agent: [ ${agentName} ] -> ${status}`);
  if (issue) console.log(`   - Issue: ${issue}`);
});

console.log('\n---------------------------------------------------------------');
if (totalErrors === 0) {
  console.log('🎉 100% SYSTEM INTEGRITY VERIFIED: All agents and skill mappings intact.');
} else {
  console.log(`⚠️  Detected ${totalErrors} issue(s) that require adjustment.`);
}
console.log('💡 To analyze blast radius before modifying an agent, run:');
console.log('   npm run agent:check -- --impact <agent-name>');
console.log('===============================================================\n');

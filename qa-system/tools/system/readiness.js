#!/usr/bin/env node
/**
 * readiness.js — Go/No-Go gate: measures test-design maturity before automation.
 *
 *   collect(slug)  Metrics from the real deliverables (coverage, trace, gate state).
 *   decide(m)      Verdict plus the blockers and conditions behind it.
 *
 * The `gen-readiness-report` skill used to count by eye, and read five files from
 * a different project that this pipeline never produces. Measuring here keeps the
 * numbers machine-derived; the skill only interprets them.
 *
 * Usage:
 *   readiness.js <slug> [--json] [--write]
 * Exit: 0 = GO, 1 = CONDITIONAL GO, 2 = NO-GO.
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, featureKnowledge, listTaskSlugs } = require('../lib/paths');
const { evaluate: evaluateGate } = require('./gate');

const TRACE_FLOOR = 80; // below this is an automatic NO-GO

// ───────────────────── Parsing ─────────────────────

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null);
const uniq = (a) => [...new Set(a)];

/** Identifiers present in a document, e.g. BR-01, BR-AUTH-01, VP-03, MR-07. */
function ids(text, prefix) {
  return text ? uniq(text.match(new RegExp(`\\b${prefix}(?:-[A-Za-z0-9]+)*-\\d+\\b`, 'g')) || []).sort() : [];
}

/**
 * Reads test cases from the merged spec, falling back to `testcases/batch_*.md`.
 * Tags look like: `Rule#BR-01, Viewpoint#VP-01, Module#VCHR, Automated`
 */
function readTestCases(dir) {
  const specPath = path.join(dir, '05_test_case_spec.md');
  let content = read(specPath);
  let source = '05_test_case_spec.md';

  if (content === null) {
    const batchDir = path.join(dir, 'testcases');
    if (!fs.existsSync(batchDir)) return { cases: [], source: null };
    const batches = fs.readdirSync(batchDir).filter((f) => /^batch_.*\.md$/.test(f)).sort();
    if (batches.length === 0) return { cases: [], source: null };
    content = batches.map((f) => read(path.join(batchDir, f))).join('\n');
    source = `testcases/${batches.length} batch`;
  }

  const cases = [];
  for (const sec of content.split(/\n(?=###\s+TC_ID:)/g)) {
    const idm = sec.match(/###\s+TC_ID:\s*([A-Za-z0-9_-]+)/);
    if (!idm) continue;
    const tags = (sec.match(/-\s+\*\*Tags\*\*:\s*([^\n]+)/) || [, ''])[1];
    cases.push({
      id: idm[1].trim(),
      rules: uniq([...tags.matchAll(/Rule#(BR(?:-[A-Za-z0-9]+)*-\d+)/g)].map((m) => m[1])).sort(),
      viewpoints: uniq([...tags.matchAll(/Viewpoint#(VP(?:-[A-Za-z0-9]+)*-\d+)/g)].map((m) => m[1])).sort(),
      priority: (sec.match(/-\s+\*\*Priority\*\*:\s*([^\n]+)/) || [, ''])[1].trim(),
    });
  }
  return { cases, source };
}

/** Verdict from the meta line at the top of a deliverable. */
function verdictOf(text) {
  if (!text) return null;
  const m = text.match(/\*{0,2}Verdict\*{0,2}:\s*`?\*{0,2}(PASS|FIX|ASK)\*{0,2}`?/i);
  return m ? m[1].toUpperCase() : null;
}

/** Unresolved data issues listed in 12_data_validation_traceability.md. */
function dataIssues(text) {
  if (!text) return [];
  return text
    .split('\n')
    .filter((l) => /CHƯA COVER|CHƯA CÓ DATA|\[CONTEXT_MISSING\]|chưa giải quyết|unresolved/i.test(l))
    .map((l) => l.trim().replace(/^[-*|]\s*/, ''))
    .slice(0, 20);
}

// ───────────────────── Metrics ─────────────────────

function collect(slug) {
  const dir = taskDir(slug);
  if (!fs.existsSync(dir)) throw new Error(`No OUTPUT/${slug}/ directory`);

  const f = (n) => read(path.join(dir, n));
  const present = (n) => fs.existsSync(path.join(dir, n));

  const s01 = f('01_requirement_risk_summary.md');
  const s02 = f('02_missing_rule_report.md');
  const s03 = f('03_viewpoint_report.md');
  const s06 = f('06_coverage_review.md');
  const s12 = f('12_data_validation_traceability.md');

  const { cases, source } = readTestCases(dir);

  const allRules = ids(s01, 'BR');
  const allVPs = ids(s03, 'VP');

  // A case is traced when it carries at least one BR-xx or VP-xx reference.
  const traced = cases.filter((c) => c.rules.length > 0 || c.viewpoints.length > 0);
  const tracePct = cases.length ? Math.round((traced.length / cases.length) * 1000) / 10 : 0;

  const coveredRules = uniq(cases.flatMap((c) => c.rules));
  const coveredVPs = uniq(cases.flatMap((c) => c.viewpoints));

  const gate = evaluateGate(slug);

  // Cases resting on unsettled rules carry the highest hallucination risk.
  const knowledge = read(featureKnowledge(slug)) || '';
  const pendingIds = new Set(gate.pending.map((q) => q.id));
  const riskyCases = cases
    .filter((c) => c.rules.some((r) => pendingIds.has(r)) || c.viewpoints.some((v) => pendingIds.has(v)))
    .map((c) => c.id);

  const issues = dataIssues(s12);

  return {
    slug,
    generatedAt: new Date().toISOString(),
    sources: {
      '01_requirement_risk_summary.md': present('01_requirement_risk_summary.md'),
      '02_missing_rule_report.md': present('02_missing_rule_report.md'),
      '03_viewpoint_report.md': present('03_viewpoint_report.md'),
      testcases: source,
      '06_coverage_review.md': present('06_coverage_review.md'),
      '12_data_validation_traceability.md': present('12_data_validation_traceability.md'),
      [`knowledge/features/${slug}.md`]: knowledge !== '',
    },
    coverage: {
      viewpointsPlanned: allVPs,
      viewpointsCovered: coveredVPs,
      viewpointsUncovered: allVPs.filter((v) => !coveredVPs.includes(v)),
      rulesTotal: allRules,
      rulesCovered: coveredRules.filter((r) => allRules.includes(r)),
      rulesUncovered: allRules.filter((r) => !coveredRules.includes(r)),
      rulesReferencedButUndefined: coveredRules.filter((r) => !allRules.includes(r)),
    },
    testCases: { total: cases.length, traced: traced.length, tracePct, untraced: cases.filter((c) => !traced.includes(c)).map((c) => c.id) },
    askGate: { blocked: gate.blocked, pending: gate.pending, reasons: gate.reasons, advisories: gate.advisories },
    riskyCases,
    data: { hasValidation: !!s12, issues },
    reviewVerdict: verdictOf(s06),
  };
}

/** Go/No-Go table from the skill, wired to the artifacts this pipeline produces. */
function decide(m) {
  const blockers = [];
  const conditions = [];

  if (m.askGate.blocked) {
    blockers.push(`ASK gate is CLOSED: ${m.askGate.reasons.join(' · ')}`);
  }
  if (m.testCases.total === 0) {
    blockers.push('No test cases at all (neither 05_test_case_spec.md nor testcases/batch_*.md)');
  } else if (m.testCases.tracePct < TRACE_FLOOR) {
    blockers.push(`Trace rate ${m.testCases.tracePct}% is below ${TRACE_FLOOR}% — ${m.testCases.untraced.length} case(s) untraceable`);
  }
  if (m.riskyCases.length) {
    blockers.push(`${m.riskyCases.length} case(s) rest on unsettled rules or gaps: ${m.riskyCases.slice(0, 8).join(', ')}`);
  }
  if (m.data.issues.length) {
    blockers.push(`${m.data.issues.length} unresolved data issue(s) in 12_data_validation_traceability.md`);
  }

  if (m.testCases.tracePct >= TRACE_FLOOR && m.testCases.tracePct < 100) {
    conditions.push(`Trace rate is ${m.testCases.tracePct}%, not yet 100%`);
  }
  if (m.coverage.viewpointsUncovered.length) {
    conditions.push(`Viewpoints with no test case: ${m.coverage.viewpointsUncovered.join(', ')}`);
  }
  if (m.coverage.rulesUncovered.length) {
    conditions.push(`Business rules not covered: ${m.coverage.rulesUncovered.join(', ')}`);
  }
  if (m.coverage.rulesReferencedButUndefined.length) {
    conditions.push(`Cases cite rules absent from stage 1: ${m.coverage.rulesReferencedButUndefined.join(', ')}`);
  }
  if (m.reviewVerdict && m.reviewVerdict !== 'PASS') {
    conditions.push(`Stage 6 verdict is \`${m.reviewVerdict}\`, not PASS`);
  }
  if (!m.reviewVerdict) conditions.push('06_coverage_review.md is missing');
  if (!m.data.hasValidation) conditions.push('12_data_validation_traceability.md is missing — data readiness cannot be assessed');
  (m.askGate.advisories || []).forEach((a) => conditions.push(a));

  const verdict = blockers.length ? 'NO-GO' : conditions.length ? 'CONDITIONAL GO' : 'GO';
  return { verdict, blockers, conditions, exitCode: { 'GO': 0, 'CONDITIONAL GO': 1, 'NO-GO': 2 }[verdict] };
}

// ───────────────────── Output ─────────────────────

function render(m, d) {
  const line = '─'.repeat(67);
  const icon = { 'GO': '[GO]', 'CONDITIONAL GO': '[COND]', 'NO-GO': '[NO-GO]' }[d.verdict];

  console.log(`\n${line}`);
  console.log(`  AUTOMATION READINESS · task [ ${m.slug} ]`);
  console.log(line);
  console.log(`  Test cases       ${m.testCases.total} · trace ${m.testCases.tracePct}% (${m.testCases.traced}/${m.testCases.total})`);
  console.log(`  Viewpoints       ${m.coverage.viewpointsCovered.length}/${m.coverage.viewpointsPlanned.length} covered by a test case`);
  console.log(`  Business rules   ${m.coverage.rulesCovered.length}/${m.coverage.rulesTotal.length} covered`);
  console.log(`  ASK gate         ${m.askGate.blocked ? 'CLOSED' : 'open'}`);
  console.log(`  Stage 6          ${m.reviewVerdict || 'not run'}`);
  console.log(`  Test data        ${m.data.hasValidation ? `${m.data.issues.length} unresolved issue(s)` : '12_ not present'}`);
  console.log(`  Knowledge        ${(m.askGate.advisories || []).length ? 'at risk of being lost' : 'recorded in knowledge/'}`);
  console.log(`\n  ${icon} RECOMMENDATION: ${d.verdict}`);

  if (d.blockers.length) {
    console.log('\n  Blockers (must be cleared before automation):');
    d.blockers.forEach((b, i) => console.log(`    ${i + 1}. ${b}`));
  }
  if (d.conditions.length) {
    console.log('\n  Conditions:');
    d.conditions.forEach((c, i) => console.log(`    ${i + 1}. ${c}`));
  }

  console.log('\n  A technical recommendation derived from measured data.');
  console.log('  The final Go/No-Go call remains with the QA Lead or owner.');
  console.log(`${line}\n`);
}

// ───────────────────── CLI ─────────────────────

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const doWrite = args.includes('--write');
  let slug = args.find((a) => !a.startsWith('--'));

  if (!slug) {
    const all = listTaskSlugs();
    if (all.length === 1) slug = all[0];
    else if (all.length === 0) { console.log('OUTPUT/ has no tasks yet.'); process.exit(0); }
    else { console.error(`OUTPUT/ holds ${all.length} tasks (${all.join(', ')}) — name one explicitly.`); process.exit(1); }
  }

  const metrics = collect(slug);
  const decision = decide(metrics);
  const payload = { ...metrics, recommendation: decision };

  if (doWrite) {
    const out = path.join(taskDir(slug), '15_readiness_metrics.json');
    fs.writeFileSync(out, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
    if (!asJson) console.log(`\nWrote ${path.relative(PATHS.ROOT, out)}`);
  }

  if (asJson) console.log(JSON.stringify(payload, null, 2));
  else render(metrics, decision);

  process.exit(decision.exitCode);
}

if (require.main === module) main();

module.exports = { collect, decide };

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
const S = require('../lib/schema');
const { evaluate: evaluateGate } = require('./gate');

const TRACE_FLOOR = 80; // below this is an automatic NO-GO

// ───────────────────── Parsing ─────────────────────

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null);
const uniq = (a) => [...new Set(a)];

/** Test cases from the merged spec, falling back to testcases/batch_*.md (via lib/schema). */
function readTestCases(dir) {
  let content = read(path.join(dir, '05_test_case_spec.md'));
  let source = '05_test_case_spec.md';

  if (content === null) {
    const batchDir = path.join(dir, 'testcases');
    if (!fs.existsSync(batchDir)) return { cases: [], source: null };
    const batches = fs.readdirSync(batchDir).filter((f) => /^batch_.*\.md$/i.test(f))
      .sort((a, b) => Number((a.match(/\d+/) || [0])[0]) - Number((b.match(/\d+/) || [0])[0]));
    if (batches.length === 0) return { cases: [], source: null };
    content = batches.map((f) => read(path.join(batchDir, f))).join('\n\n---\n\n');
    source = `testcases/${batches.length} batch`;
  }

  const cases = S.parseTestCases(content).cases.map((tc) => {
    const t = S.tcTags(tc);
    return {
      id: tc.id,
      rules: t.rules.sort(S.compareIds),
      viewpoints: t.viewpoints.sort(S.compareIds),
      ideas: t.ideas.sort(S.compareIds),
      priority: S.stripMd(S.tcField(tc, 'Priority') || ''),
    };
  });
  return { cases, source };
}

/** Verdict from the meta line only (QA_STANDARD §7). */
const verdictOf = (text) => S.readVerdict(text);

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

const REQUIRED = ['01_requirement_risk_summary.md', '02_missing_rule_report.md', '03_viewpoint_report.md'];

function collect(slug) {
  const dir = taskDir(slug);
  if (!fs.existsSync(dir)) throw new Error(`No OUTPUT/${slug}/ directory`);

  const f = (n) => read(path.join(dir, n));
  const present = (n) => fs.existsSync(path.join(dir, n));

  const s01 = f('01_requirement_risk_summary.md');
  const s03 = f('03_viewpoint_report.md');
  const s04 = f('04_test_idea_report.md');
  const s06 = f('06_coverage_review.md');
  const s12 = f('12_data_validation_traceability.md');
  const k = S.readKnowledge(slug);

  const { cases, source } = readTestCases(dir);

  const d01 = S.read01(s01) || { BR: [], FD: [], AF: [] };
  const dk = k.exists ? S.readKnowledgeDefs(k.text) : { BR: [], FD: [], AF: [] };
  const allRules = uniq([...d01.BR, ...d01.FD, ...d01.AF]).sort(S.compareIds);
  const defined = new Set([...allRules, ...dk.BR, ...dk.FD, ...dk.AF]);
  const allVPs = S.read03Viewpoints(s03);
  const ideas = S.read04Ideas(s04);

  const mrResolved = new Set();
  for (const q of k.questions) if (/^MR-/.test(q.id) && S.resolvedInKnowledge(q, k)) mrResolved.add(q.id);
  for (const d of k.decisions) if (d.valid) d.related.forEach((x) => mrResolved.add(x));

  const isDefinedRule = (r) => (r.startsWith('MR-') ? mrResolved.has(r) : defined.has(r));

  // Traced = cites at least one DEFINED rule and one DEFINED viewpoint.
  const traced = cases.filter((c) => c.rules.some(isDefinedRule) && c.viewpoints.some((v) => allVPs.includes(v)));
  const tracePct = cases.length ? Math.round((traced.length / cases.length) * 1000) / 10 : 0;

  const coveredRules = uniq(cases.flatMap((c) => c.rules));
  const coveredVPs = uniq(cases.flatMap((c) => c.viewpoints));
  const coveredTi = new Set(cases.flatMap((c) => c.ideas));

  const gate = evaluateGate(slug);

  // Cases resting on an unsettled MR (any Rule#<code>, MR included) carry the highest hallucination risk.
  const pendingIds = new Set(gate.pending.map((q) => q.id));
  const riskyCases = cases
    .filter((c) => c.rules.some((r) => pendingIds.has(r) || (r.startsWith('MR-') && !mrResolved.has(r))))
    .map((c) => c.id);

  const issues = dataIssues(s12);

  return {
    slug,
    generatedAt: new Date().toISOString(),
    sources: {
      '01_requirement_risk_summary.md': present('01_requirement_risk_summary.md'),
      '02_missing_rule_report.md': present('02_missing_rule_report.md'),
      '03_viewpoint_report.md': present('03_viewpoint_report.md'),
      '04_test_idea_report.md': present('04_test_idea_report.md'),
      testcases: source,
      '06_coverage_review.md': present('06_coverage_review.md'),
      '12_data_validation_traceability.md': present('12_data_validation_traceability.md'),
      [`knowledge/features/${slug}.md`]: k.exists,
    },
    missingRequired: [...REQUIRED.filter((n) => !present(n)), ...(k.exists ? [] : [`knowledge/features/${slug}.md`])],
    coverage: {
      brCount: d01.BR.length,
      viewpointsPlanned: allVPs,
      viewpointsCovered: coveredVPs.filter((v) => allVPs.includes(v)),
      viewpointsUncovered: allVPs.filter((v) => !coveredVPs.includes(v)),
      viewpointsReferencedButUndefined: coveredVPs.filter((v) => !allVPs.includes(v)),
      rulesTotal: allRules,
      rulesCovered: coveredRules.filter((r) => allRules.includes(r)),
      rulesUncovered: allRules.filter((r) => !coveredRules.includes(r)),
      rulesReferencedButUndefined: coveredRules.filter((r) => !isDefinedRule(r)),
      ideasKept: ideas.filter((i) => i.keep === 'Giữ').map((i) => i.id),
      ideasUncovered: ideas.filter((i) => i.keep === 'Giữ' && !coveredTi.has(i.id)).map((i) => i.id),
      ideasReferencedButUndefined: [...coveredTi].filter((t) => !ideas.some((i) => i.id === t)),
    },
    testCases: { total: cases.length, traced: traced.length, tracePct, untraced: cases.filter((c) => !traced.includes(c)).map((c) => c.id) },
    askGate: { blocked: gate.blocked, pending: gate.pending, reasons: gate.reasons, advisories: gate.advisories },
    riskyCases,
    // Data branch (Chặng 9-12) counts only once it was started: Mode 1 stops at 06.
    data: { hasValidation: !!s12, started: fs.readdirSync(dir).some((n) => /^(09|10|11|12)[a-z]?_/i.test(n)), issues },
    reviewVerdict: verdictOf(s06),
    reviewPresent: s06 !== null,
  };
}

/** Go/No-Go, fail-closed: what cannot be measured is not GO. */
function decide(m) {
  const blockers = [];
  const conditions = [];
  const notes = [];
  const cov = m.coverage;

  if (m.missingRequired && m.missingRequired.length) {
    blockers.push(`Required inputs missing: ${m.missingRequired.join(', ')}`);
  }
  if (m.askGate.blocked) {
    blockers.push(`ASK gate is CLOSED: ${m.askGate.reasons.join(' · ')}`);
  }
  if (m.sources['01_requirement_risk_summary.md'] && cov.brCount === 0) {
    blockers.push('Cannot measure: 0 BR-xx parsed from 01 §3 — rule coverage is unmeasurable');
  }
  if (m.sources['03_viewpoint_report.md'] && cov.viewpointsPlanned.length === 0) {
    blockers.push('Cannot measure: 0 VP-xx parsed from 03 §2 — viewpoint coverage is unmeasurable');
  }
  if (m.testCases.total === 0) {
    blockers.push('No test cases at all (neither 05_test_case_spec.md nor testcases/batch_*.md)');
  } else if (m.testCases.tracePct < TRACE_FLOOR) {
    blockers.push(`Trace rate ${m.testCases.tracePct}% is below ${TRACE_FLOOR}% — ${m.testCases.untraced.length} case(s) cite no defined rule + viewpoint`);
  }
  if (cov.rulesReferencedButUndefined.length) {
    blockers.push(`Cases cite rules that are undefined (or unsettled MRs): ${cov.rulesReferencedButUndefined.join(', ')}`);
  }
  if (cov.viewpointsReferencedButUndefined.length) {
    blockers.push(`Cases cite viewpoints absent from 03: ${cov.viewpointsReferencedButUndefined.join(', ')}`);
  }
  if (cov.ideasReferencedButUndefined.length) {
    blockers.push(`Cases cite test ideas absent from 04: ${cov.ideasReferencedButUndefined.join(', ')}`);
  }
  if (cov.ideasUncovered.length) {
    blockers.push(`Test ideas marked Giữ with no test case: ${cov.ideasUncovered.join(', ')}`);
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
  if (cov.viewpointsUncovered.length) conditions.push(`Viewpoints with no test case: ${cov.viewpointsUncovered.join(', ')}`);
  if (cov.rulesUncovered.length) conditions.push(`Business rules not covered: ${cov.rulesUncovered.join(', ')}`);
  if (m.reviewVerdict && m.reviewVerdict !== 'PASS') conditions.push(`Stage 6 verdict is \`${m.reviewVerdict}\`, not PASS`);
  if (!m.reviewVerdict) {
    conditions.push(m.reviewPresent ? '06_coverage_review.md has no readable meta line verdict' : '06_coverage_review.md is missing');
  }
  if (!m.data.hasValidation) {
    if (m.data.started) conditions.push('12_data_validation_traceability.md is missing although the data branch (09-11) was started — data readiness cannot be assessed');
    else notes.push('Data branch (Chặng 9-12) not started — test data readiness not assessed');
  }
  (m.askGate.advisories || []).forEach((a) => conditions.push(a));

  const verdict = blockers.length ? 'NO-GO' : conditions.length ? 'CONDITIONAL GO' : 'GO';
  return { verdict, blockers, conditions, notes, exitCode: { 'GO': 0, 'CONDITIONAL GO': 1, 'NO-GO': 2 }[verdict] };
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

  (d.notes || []).forEach((n) => console.log(`\n  Note: ${n}`));
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

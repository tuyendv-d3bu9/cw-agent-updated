#!/usr/bin/env node
/**
 * readiness.js — Đo độ chín của test design trước khi sang Automation (cổng Go/No-Go).
 *
 * Vì sao cần tool này: trước đây skill `gen-readiness-report` tự đếm bằng mắt, mà lại
 * đọc 5 file của một dự án khác (`coverage-plan.json`, `voucher-spec.json`, `testcases/*.csv`...)
 * — không file nào do pipeline này sinh ra. Cổng Go/No-Go vì thế luôn báo "không tìm thấy"
 * rồi vẫn kết luận. Tool này đọc **đúng deliverable thật** và tính số liệu bằng máy;
 * skill chỉ còn việc diễn giải, không còn việc đếm.
 *
 * Lệnh:
 *   node agents/tools/system/readiness.js <slug>            Bảng số liệu + khuyến nghị
 *   node agents/tools/system/readiness.js <slug> --json     JSON cho skill/CI
 *   node agents/tools/system/readiness.js <slug> --write    Ghi 15_readiness_metrics.json
 *
 * Exit code:  0 = GO   ·   1 = CONDITIONAL GO   ·   2 = NO-GO
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, featureKnowledge, listTaskSlugs } = require('../lib/paths');
const { evaluate: evaluateGate } = require('./gate');

const TRACE_FLOOR = 80; // dưới mốc này là NO-GO (theo bảng logic của skill)

// ───────────────────── Bóc tách deliverable thật ─────────────────────

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null);
const uniq = (a) => [...new Set(a)];

/** Mã định danh xuất hiện trong một văn bản, ví dụ BR-01, VP-03, MR-07. */
function ids(text, prefix) {
  return text ? uniq(text.match(new RegExp(`\\b${prefix}-\\d+\\b`, 'g')) || []).sort() : [];
}

/**
 * Bóc test case từ `05_test_case_spec.md`, hoặc gộp từ `testcases/batch_*.md`
 * khi spec tổng chưa được merge.
 *
 * Trường Tags có dạng: `Rule#BR-01, Rule#BR-02, Viewpoint#VP-01, Module#VCHR, Automated`
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
      rules: uniq([...tags.matchAll(/Rule#(BR-\d+)/g)].map((m) => m[1])).sort(),
      viewpoints: uniq([...tags.matchAll(/Viewpoint#(VP-\d+)/g)].map((m) => m[1])).sort(),
      priority: (sec.match(/-\s+\*\*Priority\*\*:\s*([^\n]+)/) || [, ''])[1].trim(),
    });
  }
  return { cases, source };
}

/** Verdict ghi ở dòng meta đầu file deliverable. */
function verdictOf(text) {
  if (!text) return null;
  const m = text.match(/\*{0,2}Verdict\*{0,2}:\s*`?\*{0,2}(PASS|FIX|ASK)\*{0,2}`?/i);
  return m ? m[1].toUpperCase() : null;
}

/** Vấn đề dữ liệu còn tồn đọng trong 12_data_validation_traceability.md. */
function dataIssues(text) {
  if (!text) return [];
  return text
    .split('\n')
    .filter((l) => /CHƯA COVER|CHƯA CÓ DATA|\[CONTEXT_MISSING\]|chưa giải quyết|unresolved/i.test(l))
    .map((l) => l.trim().replace(/^[-*|]\s*/, ''))
    .slice(0, 20);
}

// ───────────────────── Tính toán ─────────────────────

function collect(slug) {
  const dir = taskDir(slug);
  if (!fs.existsSync(dir)) throw new Error(`Không có OUTPUT/${slug}/`);

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

  // Trace: test case phải gắn được về ít nhất một BR-xx hoặc VP-xx.
  const traced = cases.filter((c) => c.rules.length > 0 || c.viewpoints.length > 0);
  const tracePct = cases.length ? Math.round((traced.length / cases.length) * 1000) / 10 : 0;

  const coveredRules = uniq(cases.flatMap((c) => c.rules));
  const coveredVPs = uniq(cases.flatMap((c) => c.viewpoints));

  const gate = evaluateGate(slug);

  // Test case gắn vào rule chưa xác nhận → rủi ro ảo giác.
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

/** Bảng logic Go/No-Go — giữ nguyên tinh thần của skill, nhưng nối vào artifact thật. */
function decide(m) {
  const blockers = [];
  const conditions = [];

  if (m.askGate.blocked) {
    blockers.push(`Cổng ASK đang ĐÓNG: ${m.askGate.reasons.join(' · ')}`);
  }
  if (m.testCases.total === 0) {
    blockers.push('Chưa có test case nào (thiếu 05_test_case_spec.md và testcases/batch_*.md)');
  } else if (m.testCases.tracePct < TRACE_FLOOR) {
    blockers.push(`Tỷ lệ Trace ${m.testCases.tracePct}% < ${TRACE_FLOOR}% — ${m.testCases.untraced.length} test case không trace được`);
  }
  if (m.riskyCases.length) {
    blockers.push(`${m.riskyCases.length} test case gắn vào rule/gap chưa chốt: ${m.riskyCases.slice(0, 8).join(', ')}`);
  }
  if (m.data.issues.length) {
    blockers.push(`${m.data.issues.length} vấn đề dữ liệu chưa giải quyết trong 12_data_validation_traceability.md`);
  }

  if (m.testCases.tracePct >= TRACE_FLOOR && m.testCases.tracePct < 100) {
    conditions.push(`Trace ${m.testCases.tracePct}% chưa đạt 100%`);
  }
  if (m.coverage.viewpointsUncovered.length) {
    conditions.push(`Viewpoint chưa có test case: ${m.coverage.viewpointsUncovered.join(', ')}`);
  }
  if (m.coverage.rulesUncovered.length) {
    conditions.push(`Business rule chưa được phủ: ${m.coverage.rulesUncovered.join(', ')}`);
  }
  if (m.coverage.rulesReferencedButUndefined.length) {
    conditions.push(`Test case trích rule không có trong Chặng 1: ${m.coverage.rulesReferencedButUndefined.join(', ')}`);
  }
  if (m.reviewVerdict && m.reviewVerdict !== 'PASS') {
    conditions.push(`Chặng 6 ra Verdict \`${m.reviewVerdict}\` (chưa PASS)`);
  }
  if (!m.reviewVerdict) conditions.push('Chưa có 06_coverage_review.md');
  if (!m.data.hasValidation) conditions.push('Chưa có 12_data_validation_traceability.md — không đánh giá được độ sẵn sàng dữ liệu');
  (m.askGate.advisories || []).forEach((a) => conditions.push(a));

  const verdict = blockers.length ? 'NO-GO' : conditions.length ? 'CONDITIONAL GO' : 'GO';
  return { verdict, blockers, conditions, exitCode: { 'GO': 0, 'CONDITIONAL GO': 1, 'NO-GO': 2 }[verdict] };
}

// ───────────────────── In ra ─────────────────────

function render(m, d) {
  const line = '─'.repeat(67);
  const icon = { 'GO': '✅', 'CONDITIONAL GO': '⚠️ ', 'NO-GO': '⛔' }[d.verdict];

  console.log(`\n${line}`);
  console.log(`  ĐỘ SẴN SÀNG AUTOMATION · task [ ${m.slug} ]`);
  console.log(line);
  console.log(`  Test case        ${m.testCases.total} · trace ${m.testCases.tracePct}% (${m.testCases.traced}/${m.testCases.total})`);
  console.log(`  Viewpoint        ${m.coverage.viewpointsCovered.length}/${m.coverage.viewpointsPlanned.length} đã có test case`);
  console.log(`  Business rule    ${m.coverage.rulesCovered.length}/${m.coverage.rulesTotal.length} đã được phủ`);
  console.log(`  Cổng ASK         ${m.askGate.blocked ? '⛔ ĐÓNG' : '✅ mở'}`);
  console.log(`  Chặng 6          ${m.reviewVerdict || 'chưa chạy'}`);
  console.log(`  Dữ liệu kiểm thử ${m.data.hasValidation ? `${m.data.issues.length} vấn đề tồn đọng` : 'chưa có 12_'}`);
  console.log(`  Tri thức tích luỹ ${(m.askGate.advisories || []).length ? '⚠️  có nguy cơ mất' : '✅ đã ghi vào knowledge/'}`);
  console.log(`\n  ${icon} KHUYẾN NGHỊ: ${d.verdict}`);

  if (d.blockers.length) {
    console.log(`\n  Điểm chặn (phải xử lý xong mới được sang Automation):`);
    d.blockers.forEach((b, i) => console.log(`    ${i + 1}. ${b}`));
  }
  if (d.conditions.length) {
    console.log(`\n  Điều kiện kèm theo:`);
    d.conditions.forEach((c, i) => console.log(`    ${i + 1}. ${c}`));
  }

  console.log(`\n  ℹ️  Đây là khuyến nghị kỹ thuật dựa trên số liệu đo được.`);
  console.log(`      Quyết định Go/No-Go cuối cùng vẫn thuộc về QA Lead / người phụ trách.`);
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
    else if (all.length === 0) { console.log('ℹ️  OUTPUT/ chưa có task nào.'); process.exit(0); }
    else { console.error(`❌ OUTPUT/ có ${all.length} task (${all.join(', ')}) — nêu rõ task-slug.`); process.exit(1); }
  }

  const metrics = collect(slug);
  const decision = decide(metrics);
  const payload = { ...metrics, recommendation: decision };

  if (doWrite) {
    const out = path.join(taskDir(slug), '15_readiness_metrics.json');
    fs.writeFileSync(out, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
    if (!asJson) console.log(`\n📄 Đã ghi ${path.relative(PATHS.ROOT, out)}`);
  }

  if (asJson) console.log(JSON.stringify(payload, null, 2));
  else render(metrics, decision);

  process.exit(decision.exitCode);
}

if (require.main === module) main();

module.exports = { collect, decide };

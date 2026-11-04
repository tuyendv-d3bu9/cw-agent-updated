#!/usr/bin/env node
/**
 * sync-answers.js — Moves questions and BA/PO answers from the stage-2 report
 * (OUTPUT/, disposable) into knowledge/features/<slug>.md (accumulates).
 *
 *   extractQuestions(report)  Every MR row of the 02 question table (§9.4), header-mapped.
 *   extractAnswers(report)    Only the settled rows (Confirmed with an answer, or Rejected).
 *   plan(report, knowledge)   What a sync would do: append / update / decide / skip.
 *   apply(knowledge, plan)    The new knowledge text.
 *
 * Write rules (QA_STANDARD §8):
 *   - §7: a row whose ID + question text is new is appended with the full §9.4
 *     schema. An existing unsettled row for the same ID + question gets its
 *     answer columns and status filled (status change, never deletion). Settled
 *     rows are never touched. An old MR-04 with different wording is a different
 *     question: the new one is appended, the old one kept.
 *   - §8: a decision row only when the answer has "Người trả lời" AND "Ngày".
 *   - Only rows inside the §7/§8 tables count as "already in knowledge".
 *
 * Usage:
 *   sync-answers.js <slug>           Preview only
 *   sync-answers.js <slug> --write   Apply
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, featureKnowledge } = require('../lib/paths');
const S = require('../lib/schema');

const Q_HEADERS = ['ID', 'Kẽ hở', 'Nhóm 06W', 'Nguồn phát hiện', 'Phương án gợi ý (chưa phải rule)', 'Câu hỏi cho BA/PO', 'Phản hồi chính thức', 'Người trả lời', 'Ngày', 'Trạng thái'];
const Q_KEYS = ['id', 'gap', 'w', 'foundAt', 'suggestion', 'question', 'answer', 'answeredBy', 'date', 'status'];
const D_HEADERS = ['#', 'Mã liên quan', 'Câu hỏi', 'Quyết định chính thức', 'Người phê duyệt', 'Ngày chốt'];

// ───────────────────── Reading ─────────────────────

function extractQuestions(report) {
  const rows = S.read02Questions(report);
  // A code may appear in several tables; keep the most complete row per ID + question.
  const best = new Map();
  for (const r of rows) {
    const key = `${r.id}|${S.questionKey(r.question)}`;
    const score = (x) => [x.question, x.answer, x.answeredBy, x.date, x.gap].filter(Boolean).length + (x.resolved ? 5 : 0);
    if (!best.has(key) || score(r) > score(best.get(key))) best.set(key, r);
  }
  return [...best.values()].map((r) => ({ ...r, state: r.status || r.statusRaw }))
    .sort((a, b) => S.compareIds(a.id, b.id));
}

/** Settled rows only. Kept for callers and tests of the previous API. */
function extractAnswers(report) {
  return extractQuestions(report)
    .filter((r) => r.resolved)
    .map((r) => {
      // Legacy reports carried a separate "Quyết định đã chốt" column.
      const legacy = S.parseTables(report).find((t) => S.col(t, 'decision') !== -1 && S.col(t, 'id') !== -1);
      let decision = '';
      if (legacy) {
        const row = legacy.rows.find((x) => S.canonicalId(x.cells[S.col(legacy, 'id')], 'MR') === r.id);
        if (row) decision = S.stripMd(S.cell(legacy, row, 'decision'));
      }
      return { ...r, decision: decision || r.answer };
    });
}

// ───────────────────── Planning ─────────────────────

function plan(report, knowledgeText) {
  const k = { questions: [], decisions: [] };
  if (knowledgeText) {
    k.questions = S.readQuestionRows(S.sectionBody(knowledgeText, '7', /câu hỏi|open questions/));
    k.decisions = S.readDecisions(S.sectionBody(knowledgeText, '8', /quyết định|giả định|decision/));
  }
  const out = { append: [], update: [], decide: [], skip: [] };
  for (const q of extractQuestions(report)) {
    const existing = k.questions.find((r) => r.id === q.id && S.questionKey(r.question) === S.questionKey(q.question));
    if (!existing) out.append.push(q);
    else if (existing.resolved || !q.resolved) out.skip.push({ ...q, why: existing.resolved ? 'already settled in knowledge' : 'already in knowledge, still open' });
    else out.update.push({ q, line: existing.line });

    if (q.resolved && q.answeredBy && q.date) {
      const hasDecision = k.decisions.some((d) => d.related.includes(q.id) &&
        (!d.question || S.questionKey(d.question) === S.questionKey(q.question)));
      if (!hasDecision) out.decide.push(q);
    }
  }
  return out;
}

// ───────────────────── Writing ─────────────────────

const esc = (v) => String(v || '').replace(/\|/g, '/').replace(/\n+/g, ' ').trim();

/** Row for the §7 table, mapped onto ITS headers (an older 8-column table still works). */
function questionRow(table, q) {
  const cells = table.headers.map((h, i) => {
    const key = Q_KEYS.find((name) => S.col(table, name) === i);
    if (key === 'id') return q.id;
    if (key === 'status') return q.status || q.statusRaw || 'New';
    return key ? esc(q[key]) : '';
  });
  return `| ${cells.join(' | ')} |`;
}

function decisionRow(table, num, q) {
  const vals = { num: String(num), related: q.id, question: esc(q.question), decision: esc(q.answer || q.status), approver: esc(q.answeredBy), decidedOn: esc(q.date) };
  const cells = table.headers.map((h, i) => {
    const key = Object.keys(vals).find((name) => S.col(table, name) === i);
    return key ? vals[key] : '';
  });
  return `| ${cells.join(' | ')} |`;
}

/** Locates the table inside a section: header line, last row line, parsed table. */
function locate(lines, num, titleRe, need) {
  const text = lines.join('\n');
  const sec = S.findSection(text, num) || S.findSection(text, titleRe);
  if (!sec) return null;
  const tables = S.parseTables(sec.body);
  const t = tables.find((x) => need.every((n) => S.col(x, n) !== -1));
  if (!t) return null;
  const headerIdx = sec.startLine + t.line - 1; // 0-based index in `lines`
  let last = headerIdx + 1; // separator
  while (last + 1 < lines.length && lines[last + 1].trim().startsWith('|')) last++;
  return { table: t, headerIdx, lastIdx: last };
}

function apply(knowledgeText, p) {
  let lines = knowledgeText.split('\n');

  const q7 = locate(lines, '7', /câu hỏi|open questions/, ['id', 'status']);
  if (!q7) throw new Error('No §7 question table (| ID | … | Trạng thái |) in the knowledge file');

  // Update unsettled rows in place: answer columns + status only.
  for (const { q, line } of p.update) {
    const idx = q7.headerIdx + (line - q7.table.line);
    const cells = lines[idx].trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim());
    for (const key of ['answer', 'answeredBy', 'date', 'status']) {
      const i = S.col(q7.table, key);
      if (i === -1) continue;
      cells[i] = key === 'status' ? q.status : esc(q[key]);
    }
    lines[idx] = `| ${cells.join(' | ')} |`;
  }
  const appended = p.append.map((q) => questionRow(q7.table, q));
  lines = [...lines.slice(0, q7.lastIdx + 1), ...appended, ...lines.slice(q7.lastIdx + 1)];

  if (p.decide.length) {
    const d8 = locate(lines, '8', /quyết định|giả định|decision/, ['related', 'decision']);
    if (!d8) throw new Error('No §8 decision table (| # | Mã liên quan | … |) in the knowledge file');
    const existing = d8.table.rows.length;
    const rows = p.decide.map((q, i) => decisionRow(d8.table, existing + i + 1, q));
    lines = [...lines.slice(0, d8.lastIdx + 1), ...rows, ...lines.slice(d8.lastIdx + 1)];
  }
  return lines.join('\n');
}

/** A fresh knowledge file from the template. Template rows (if an old template has any) are dropped. */
function fromTemplate(slug) {
  const tpl = path.join(PATHS.KNOWLEDGE, '_template.md');
  if (!fs.existsSync(tpl)) return null;
  return fs.readFileSync(tpl, 'utf-8')
    .replace(/<feature-slug>/g, slug)
    .split('\n')
    .filter((l) => {
      const t = l.trim();
      if (!t.startsWith('|') || /^\|[\s:|-]+\|$/.test(t)) return true;
      // Harmless on the new empty template; strips sample rows from an old one.
      return !/\b(MR|BR|FD|AF)-\d+\b/.test(t) || /^\|\s*(ID|#)\s*\|/i.test(t);
    })
    .join('\n');
}

// ───────────────────── Run ─────────────────────

function main() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const slug = args.find((a) => !a.startsWith('--'));

  if (!slug) {
    console.error('Missing task-slug.\n   sync-answers.js <slug> [--write]');
    process.exit(1);
  }

  const reportPath = path.join(taskDir(slug), '02_missing_rule_report.md');
  if (!fs.existsSync(reportPath)) {
    console.error(`No ${path.relative(PATHS.ROOT, reportPath)} — stage 2 has not run yet.`);
    process.exit(1);
  }
  const report = fs.readFileSync(reportPath, 'utf-8');
  if (extractQuestions(report).length === 0) {
    console.log('Stage 2 has no MR rows in its question table (§3, QA_STANDARD §9.4) — nothing to sync.');
    process.exit(0);
  }

  const kPath = featureKnowledge(slug);
  let knowledge = fs.existsSync(kPath) ? fs.readFileSync(kPath, 'utf-8') : null;
  const created = knowledge === null;
  if (created) {
    knowledge = fromTemplate(slug);
    if (knowledge === null) { console.error('No knowledge/_template.md to build the knowledge file from.'); process.exit(1); }
  }

  const p = plan(report, knowledge);
  console.log(`\nStage 2 of [${slug}]: ${p.append.length} to append, ${p.update.length} to answer, ${p.decide.length} decision(s) for §8, ${p.skip.length} unchanged.`);
  for (const q of p.append) console.log(`   + ${q.id} [${q.status || q.statusRaw || 'New'}] ${q.question.slice(0, 60)}`);
  for (const { q } of p.update) console.log(`   ~ ${q.id} -> ${q.status}: ${q.answer.slice(0, 60)}`);
  for (const q of p.decide) console.log(`   §8 ${q.id} approved by ${q.answeredBy} on ${q.date}`);
  for (const q of p.skip) console.log(`   = ${q.id} (${q.why})`);
  const noDecision = [...p.append, ...p.update.map((u) => u.q)].filter((q) => q.resolved && !(q.answeredBy && q.date));
  if (noDecision.length) console.log(`   note: ${noDecision.map((q) => q.id).join(', ')} settled without "Người trả lời" + "Ngày" — not written to §8.`);

  if (!p.append.length && !p.update.length && !p.decide.length) {
    console.log('   Nothing new — knowledge is already in sync.\n');
    process.exit(0);
  }
  if (!write) {
    console.log(`\n   Preview only. Add \`--write\` to apply to ${path.relative(PATHS.ROOT, kPath)}\n`);
    process.exit(0);
  }

  let updated;
  try {
    updated = apply(knowledge, p);
  } catch (e) {
    console.error(`\n${e.message} — nothing written to ${path.relative(PATHS.ROOT, kPath)}.`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(kPath), { recursive: true });
  fs.writeFileSync(kPath, updated, 'utf-8');
  console.log(`\n   ${created ? 'Created' : 'Updated'} ${path.relative(PATHS.ROOT, kPath)}. No row deleted.\n`);
}

if (require.main === module) main();

module.exports = { extractAnswers, extractQuestions, plan, apply, fromTemplate, Q_HEADERS, D_HEADERS };

#!/usr/bin/env node
/**
 * sync-answers.js — Moves BA/PO answers from `OUTPUT/` into `knowledge/`.
 *
 *   extractAnswers(report)  Settled rows from the stage-2 clarification table.
 *
 * Found on a real run: seven BA answers lived only in the stage-2 report. Per
 * QA_STANDARD §8, OUTPUT/ is a disposable single-run artifact while knowledge/
 * is what accumulates, so the next run would ask the BA those same questions.
 *
 * Write rules (QA_STANDARD §8): only ever append; never edit or delete an
 * existing row; skip any code already present, even if the wording differs.
 *
 * Usage:
 *   sync-answers.js <slug>           Preview only
 *   sync-answers.js <slug> --write   Apply
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, featureKnowledge } = require('../lib/paths');

const RESOLVED = /^(confirmed|rejected)$/i;

// ───────────────────── Table parsing ─────────────────────

/** Every markdown table in a document as { header[], rows[][] }. */
function tables(content) {
  const out = [];
  const lines = content.split('\n');
  let cur = null;

  const cells = (l) => l.trim().split('|').slice(1, -1).map((c) => c.trim());

  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith('|')) { if (cur) { out.push(cur); cur = null; } continue; }
    if (/^\|[\s:|-]+\|$/.test(t)) continue;          // separator row
    if (!cur) cur = { header: cells(line), rows: [] };
    else cur.rows.push(cells(line));
  }
  if (cur) out.push(cur);
  return out;
}

/** Strips markdown decoration for comparison and clean re-writing. */
const plain = (s) => (s || '').replace(/\*\*/g, '').replace(/`/g, '').trim();

/**
 * Finds the clarification table: any table with an `MR-xx` column and a status
 * column. Columns are matched by *header text* rather than position, because the
 * headings vary between runs.
 */
function extractAnswers(content) {
  const found = [];

  for (const tb of tables(content)) {
    const idCol = tb.header.findIndex((h) => /mã rule|rule id|^id$/i.test(plain(h)));
    const stateCol = tb.header.findIndex((h) => /trạng thái|status/i.test(plain(h)));
    if (idCol === -1 || stateCol === -1) continue;

    const qCol = tb.header.findIndex((h) => /câu hỏi/i.test(plain(h)));
    const aCol = tb.header.findIndex((h) => /phản hồi/i.test(plain(h)));
    const dCol = tb.header.findIndex((h) => /quyết định|đã chốt/i.test(plain(h)));
    const gCol = tb.header.findIndex((h) => /phân loại|nhóm/i.test(plain(h)));

    for (const r of tb.rows) {
      const id = plain(r[idCol]).toUpperCase();
      if (!/^MR-\d+$/.test(id)) continue;
      if (!RESOLVED.test(plain(r[stateCol]))) continue;

      found.push({
        id,
        group: gCol !== -1 ? plain(r[gCol]) : '',
        question: qCol !== -1 ? plain(r[qCol]) : '',
        answer: aCol !== -1 ? plain(r[aCol]) : '',
        decision: dCol !== -1 ? plain(r[dCol]) : '',
        state: plain(r[stateCol]),
      });
    }
  }

  // A code may appear in several tables; keep the most complete row.
  const best = new Map();
  for (const a of found) {
    const score = (x) => [x.question, x.answer, x.decision].filter(Boolean).length;
    if (!best.has(a.id) || score(a) > score(best.get(a.id))) best.set(a.id, a);
  }
  return [...best.values()].sort((x, y) => x.id.localeCompare(y.id));
}

/** Gap descriptions from the `### [MR-xx] <text>` headings, which are far more
 * accurate than reusing the decision text. */
function gapDescriptions(content) {
  const m = new Map();
  for (const h of content.matchAll(/^###\s*\[(MR-\d+)\]\s*(.+)$/gm)) {
    m.set(h[1].toUpperCase(), plain(h[2]));
  }
  return m;
}

/**
 * Maps MR-xx to its 06W group using the W1-W6 scan table at the top of stage 2.
 * The clarification table's "category" column holds a technical grouping
 * (Authorization, Boundary & Edge, …), not a W code, so it cannot substitute.
 */
function wGroups(content) {
  const m = new Map();
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    const w = t.match(/\bW([1-6])\b/);
    if (!w) continue;
    const name = t.match(/What if [^|*]+|Who else[^|*]+|What when[^|*]+|What happens[^|*]+/i);
    for (const id of t.matchAll(/\bMR-\d+\b/g)) {
      m.set(id[0].toUpperCase(), `W${w[1]}${name ? ` (${plain(name[0])})` : ''}`);
    }
  }
  return m;
}

/** MR codes already recorded in the knowledge file, in section 7 or 8. */
function alreadyInKnowledge(content) {
  return new Set((content.match(/\bMR-\d+\b/g) || []).map((s) => s.toUpperCase()));
}

// ───────────────────── Writing section 7 ─────────────────────

function buildRow(a) {
  // A column with no data gets an explicit label (QA_STANDARD §2.7); never pad
  // it with another column's content.
  const cell = (v, fallback) => (v ? String(v).replace(/\|/g, '/') : fallback);
  return [
    '',
    a.id,
    cell(a.gap, cell(a.question, '—')),      // gap description, from the ### [MR-xx] heading
    cell(a.w, 'CHƯA XÁC ĐỊNH'),              // 06W group, from the W1-W6 scan table
    'CHƯA XÁC ĐỊNH',                         // risk level: stage 2 does not record it, so do not invent one
    cell(a.decision, '—'),                   // default proposal <- the settled decision
    cell(a.question, '—'),                   // question put to the BA/PO
    cell(a.answer, '—'),                     // official answer
    a.state,
    '',
  ].join(' | ').trim();
}

/** Appends rows to the section 7 table, leaving everything else untouched. */
function insertIntoSection7(content, rows) {
  const lines = content.split('\n');
  const start = lines.findIndex((l) => /^##\s*7\./.test(l));
  if (start === -1) return null;

  let end = lines.slice(start + 1).findIndex((l) => /^##\s/.test(l));
  end = end === -1 ? lines.length : start + 1 + end;

  // Last table row inside section 7.
  let lastRow = -1;
  for (let i = start; i < end; i++) if (lines[i].trim().startsWith('|')) lastRow = i;
  if (lastRow === -1) return null;

  return [...lines.slice(0, lastRow + 1), ...rows, ...lines.slice(lastRow + 1)].join('\n');
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
  const gaps = gapDescriptions(report);
  const ws = wGroups(report);
  const answers = extractAnswers(report).map((a) => ({ ...a, gap: gaps.get(a.id) || '', w: ws.get(a.id) || '' }));
  if (answers.length === 0) {
    console.log('Stage 2 has no Confirmed/Rejected answers yet — nothing to sync.');
    process.exit(0);
  }

  const kPath = featureKnowledge(slug);
  let knowledge = fs.existsSync(kPath) ? fs.readFileSync(kPath, 'utf-8') : null;
  let created = false;

  if (knowledge === null) {
    const tpl = path.join(PATHS.KNOWLEDGE, '_template.md');
    if (!fs.existsSync(tpl)) { console.error(`No ${path.relative(PATHS.ROOT, tpl)} to build the knowledge file from.`); process.exit(1); }
    // Strip EVERY sample row from the template (BR-xx, MR-xx, any section).
    // An earlier version only filtered `New` rows in section 7, so the MR-03/MR-04
    // samples in section 8 slipped through, counted as "already in knowledge", and
    // two real answers were dropped. A real feature file must carry no fake rules.
    knowledge = fs.readFileSync(tpl, 'utf-8')
      .split('\n')
      .filter((l) => {
        const t = l.trim();
        if (!t.startsWith('|')) return true;
        if (/^\|[\s:|-]+\|$/.test(t)) return true;        // separator row
        return !/\b(MR|BR)-\d+\b/.test(t) || /^\|\s*ID\s*\|/i.test(t); // keep the header row
      })
      .join('\n');
    created = true;
  }

  const existing = alreadyInKnowledge(knowledge);
  const toAdd = answers.filter((a) => !existing.has(a.id));
  const skipped = answers.filter((a) => existing.has(a.id));

  console.log(`\nStage 2 of [${slug}] has ${answers.length} settled answer(s).`);
  if (skipped.length) console.log(`   ${skipped.length} already in knowledge, skipped: ${skipped.map((a) => a.id).join(', ')}`);

  if (toAdd.length === 0) {
    console.log('   Nothing new — knowledge is already in sync.\n');
    process.exit(0);
  }

  console.log(`   ${toAdd.length} code(s) will be appended to section 7:\n`);
  for (const a of toAdd) {
    console.log(`      ${a.id}  ${a.question.slice(0, 58)}`);
    console.log(`              ↳ ${a.decision.slice(0, 58)}`);
  }

  if (!write) {
    console.log(`\n   Preview only. Add \`--write\` to apply to ${path.relative(PATHS.ROOT, kPath)}\n`);
    process.exit(0);
  }

  const updated = insertIntoSection7(knowledge, toAdd.map(buildRow));
  if (updated === null) {
    console.error(`\nNo section 7 table found in ${path.relative(PATHS.ROOT, kPath)} — nothing written.`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(kPath), { recursive: true });
  fs.writeFileSync(kPath, updated, 'utf-8');
  console.log(`\n   ${created ? 'Created' : 'Updated'} ${path.relative(PATHS.ROOT, kPath)} — ${toAdd.length} row(s) appended, none modified.\n`);
}

if (require.main === module) main();

module.exports = { extractAnswers };

#!/usr/bin/env node
/**
 * analyze-child.js — Static analysis of one task inside a TRUSTED tree (A5, A4d/A5e inputs).
 *
 *   node analyze-child.js <trusted-tree> <task-slug>   → JSON on stdout
 *
 * Runs in its own process so the trusted tree's `lib/paths.js` anchors every read to
 * that tree (student OUTPUT/knowledge + canonical INPUT + starter tools). It only reads
 * text; it never requires or executes anything from the student's files.
 */

const fs = require('fs');
const path = require('path');

const [tree, slug] = process.argv.slice(2);
const lib = (n) => require(path.join(tree, 'qa-system', 'tools', 'lib', n));
const S = lib('schema.js');
const P = lib('provenance.js');
const { loadDomain } = lib('domain.js');

const DOMAIN_SOURCE = /\[\s*DOMAIN\s*\]|qa-system\/domains\//i;
const dir = path.join(tree, 'OUTPUT', slug);
const read = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
const t01 = read(path.join(dir, '01_requirement_risk_summary.md'));
const t02 = read(path.join(dir, '02_missing_rule_report.md'));
const t04 = read(path.join(dir, '04_test_idea_report.md'));
const k = S.readKnowledge(slug);
const rowText = (t, r) => r.cells.map((c) => S.stripMd(c)).join(' | ');

function inputFiles() {
  const files = [];
  const walk = (d, base) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== '_superseded') walk(p, base); } else if (e.isFile() && /\.(md|txt|csv)$/i.test(e.name) && !/^readme\.md$/i.test(e.name)) {
        files.push({ rel: path.relative(base, p).split(path.sep).join('/'), norm: S.normText(fs.readFileSync(p, 'utf8')) });
      }
    }
  };
  const input = path.join(tree, 'INPUT', slug);
  walk(input, input);
  return files;
}

const out = {
  quotes: { total: 0, verified: 0, failed: [] },
  domainViolations: [],
  numeric: { items: 0, bad: [] },
  tcs: { total: 0, traced: 0, orphans: [] },
  questionRows: [],
  riskRows: [],
  definitionText: [],
};

// ── 01: quotes, domain sources, numbers in rows ──
const { units } = loadDomain({ root: tree });
const sources = P.buildSources({ t01, k, units });
if (t01) {
  const files = inputFiles();
  for (const num of ['3', '3b', '5', '6']) {
    const sec = S.sectionAt(t01, num);
    if (!sec) continue;
    for (const t of S.parseTables(sec.body, sec.offset)) {
      const qi = S.col(t, 'quote');
      for (const r of t.rows) {
        out.definitionText.push(rowText(t, r));
        if (qi === -1) continue;
        const quote = r.cells[qi] || '';
        const src = S.stripMd(S.cell(t, r, 'source'));
        const where = `01 §${num} line ${r.line}`;
        out.quotes.total++;
        if (DOMAIN_SOURCE.test(src) || DOMAIN_SOURCE.test(quote)) { out.domainViolations.push(where); out.quotes.failed.push(`${where}: domain pack cited`); continue; }
        if (S.isBlank(quote)) {
          const n = (src.match(/#\s*(\d+)/) || [])[1];
          const d = /^knowledge\s*§\s*8/i.test(src) && n ? k.decisions.find((x) => String(x.num).replace(/\D/g, '') === n) : null;
          if (d && d.valid) out.quotes.verified++; else out.quotes.failed.push(`${where}: empty quote`);
          continue;
        }
        if (S.hasLabel(quote)) { out.quotes.failed.push(`${where}: label instead of quote`); continue; }
        const m = files.length ? S.quoteInSources(quote, src, files) : { ok: false, reason: 'no INPUT' };
        if (!m.ok) { out.quotes.failed.push(`${where}: not found verbatim (${m.reason})`); continue; }
        out.quotes.verified++;
        const rt = ['condition', 'behavior', 'constraint'].map((c) => S.stripMd(S.cell(t, r, c))).join(' ');
        out.numeric.items++;
        const miss = P.numbersMissingFromQuote(rt, S.stripMd(quote), sources.unitRe);
        if (miss.length) out.numeric.bad.push(`${where}: ${miss.join(', ')} not in its quote`);
      }
    }
  }
  for (const t of S.parseTables(t01)) {
    const i = S.col(t, 'id');
    if (i === -1) continue;
    for (const r of t.rows) {
      const id = S.stripMd(r.cells[i] || '');
      if (/^OQ-\d+$/.test(id)) out.questionRows.push({ source: '01', id, text: rowText(t, r) });
      if (/^RK-\d+$/.test(id)) out.riskRows.push({ id, text: rowText(t, r) });
    }
  }
}

// ── knowledge: domain sources, definitions, questions ──
if (k.exists) {
  for (const num of ['3', '3b', '5']) {
    const sec = S.sectionAt(k.text, num);
    if (!sec) continue;
    for (const t of S.parseTables(sec.body, sec.offset)) {
      for (const r of t.rows) {
        out.definitionText.push(rowText(t, r));
        const src = S.stripMd(S.cell(t, r, 'source'));
        const quote = S.cell(t, r, 'quote') || '';
        if (DOMAIN_SOURCE.test(src) || DOMAIN_SOURCE.test(quote)) out.domainViolations.push(`knowledge §${num} line ${r.line}`);
      }
    }
  }
  // §8 decisions (incl. "proceed without an answer" rows) and §9 constants: a concrete value written
  // here for the ambiguous rule is an invented value (A5e), whoever is named as approver.
  for (const d of k.decisions) out.definitionText.push(String(d.decision || ''));
  const s9 = S.sectionAt(k.text, '9');
  if (s9) for (const t of S.parseTables(s9.body, s9.offset)) for (const r of t.rows) out.definitionText.push(rowText(t, r));
  const s7 = S.sectionAt(k.text, '7', /câu hỏi|open questions/);
  if (s7) for (const t of S.parseTables(s7.body, s7.offset)) for (const r of t.rows) out.questionRows.push({ source: 'knowledge', id: S.stripMd(r.cells[S.col(t, 'id')] || ''), text: rowText(t, r) });
}

// ── 02: question rows ──
if (t02) {
  const s3 = S.sectionAt(t02, '3', /câu hỏi/);
  for (const t of S.parseTables(s3 ? s3.body : t02, s3 ? s3.offset : 0)) {
    const i = S.col(t, 'id');
    if (i === -1) continue;
    for (const r of t.rows) {
      const id = S.stripMd(r.cells[i] || '');
      if (/^MR-\d+$/.test(id)) out.questionRows.push({ source: '02', id, text: rowText(t, r) });
    }
  }
}

if (t04) out.definitionText.push(t04);

// ── 05: traceability and numeric provenance of test cases ──
const d01 = S.read01(t01) || { BR: [], FD: [], AF: [] };
const dk = k.exists ? S.readKnowledgeDefs(k.text) : { BR: [], FD: [], AF: [] };
const ruleDefs = new Set([...d01.BR, ...d01.FD, ...d01.AF, ...dk.BR, ...dk.FD, ...dk.AF]);
const mrKnown = new Set(k.questions.filter((q) => /^MR-/.test(q.id)).map((q) => q.id));
if (t02) for (const q of S.read02Questions(t02)) mrKnown.add(q.id);

let cases = [];
const spec = read(path.join(dir, '05_test_case_spec.md'));
if (spec) { cases = S.parseTestCases(spec).cases; out.definitionText.push(spec); }
if (!cases.length && fs.existsSync(path.join(dir, 'testcases'))) {
  for (const f of fs.readdirSync(path.join(dir, 'testcases')).filter((x) => /^batch_.*\.md$/i.test(x)).sort()) {
    const t = read(path.join(dir, 'testcases', f));
    cases.push(...S.parseTestCases(t).cases);
    out.definitionText.push(t);
  }
}
for (const tc of cases) {
  out.tcs.total++;
  const rules = S.tcTags(tc).rules;
  const bad = rules.filter((c) => (/^MR-/.test(c) ? !mrKnown.has(c) : !ruleDefs.has(c)));
  if (rules.length && !bad.length) out.tcs.traced++;
  else out.tcs.orphans.push(`${tc.id}: ${rules.length ? `unknown ${bad.join(', ')}` : 'no Rule# tag'}`);
  out.numeric.items++;
  const numErr = P.checkTestCase((n) => S.tcField(tc, n), sources, mrKnown)
    .filter((f) => f.level === 'error' && /unit\/limit context/.test(f.msg));
  if (numErr.length) out.numeric.bad.push(`${tc.id}: number without a source`);
}

process.stdout.write(JSON.stringify(out));

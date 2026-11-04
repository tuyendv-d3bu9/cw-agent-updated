#!/usr/bin/env node
/**
 * lint-deliverables.js — Machine-checks deliverables against FACT and the
 * formats pinned in QA_STANDARD §7/§9 (read through lib/schema.js).
 *
 *   lint(slug)  Run every rule group over one task. Returns {errors, warns, totalCases}.
 *
 * Rule groups:
 *   A. Test cases (05 + testcases/batch_NN.md) — parse count, unparsed TC-like
 *      lines, batch/spec ID sets, fields, priority, placeholders in every field,
 *      Rule#/Viewpoint#/TI# cross-checked against 01/03/04/knowledge, coverage.
 *   B. Meta line — `Owner: … · Verdict: PASS|FIX|ASK` in the first 10 lines.
 *   C. 01 — IDs, verbatim quotes ("Trích nguyên văn") found in INPUT/<slug>/.
 *   D. 02 — the 06W matrix (every BR/FD/AF of 01, valid cells, MRs exist in §3),
 *      the question table schema, OQ reconciliation, verdict consistency.
 *   E. Table cells — no blank cells outside the columns humans fill later.
 *
 * Usage:
 *   lint-deliverables.js [slug] [--json]
 * Exit: 0 = clean or warnings only, 1 = errors to fix.
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, listTaskSlugs } = require('../lib/paths');
const S = require('../lib/schema');

// ───────────────────────────── Rules ─────────────────────────────

const FALLBACK_FIELDS = ['Title', 'Precondition', 'Test Steps', 'Test Data', 'Expected Result', 'Priority', 'Tags'];

/**
 * Required test-case fields, excluding `TC_ID` which lives in the heading.
 * Read from the "Định dạng N trường bắt buộc" table of the test-case-generation
 * skill when present, so adding a field to the skill is enforced immediately.
 */
function loadFields() {
  const skill = path.join(PATHS.SYSTEM || PATHS.AGENTS, 'qa-test-design', 'skills', 'test-case-generation.md');
  if (!fs.existsSync(skill)) return FALLBACK_FIELDS;

  const text = fs.readFileSync(skill, 'utf-8');
  const section = text.split(/^##\s+Định dạng\s+\d+\s+trường bắt buộc/m)[1];
  if (!section) return FALLBACK_FIELDS;

  const fields = [];
  for (const line of section.split('\n')) {
    if (/^##\s/.test(line)) break;
    if (!line.trim().startsWith('|')) continue;
    const m = line.match(/^\|\s*`([^`]+)`\s*\|/);
    if (m && m[1] !== 'TC_ID') fields.push(m[1].trim());
  }
  return fields.length ? fields : FALLBACK_FIELDS;
}

const TITLE_VERBS = /^(Verify|Validate|Confirm)\b/i;
const PRIORITY = /^(High|Medium|Low)(\s*\[ĐỀ XUẤT\])?$/i;
const MAX_STEPS = 8;
const RULE_FAMILIES = ['BR', 'FD', 'AF', 'MR'];

const NEEDS_META = [
  '01_requirement_risk_summary.md',
  '02_missing_rule_report.md',
  '03_viewpoint_report.md',
  '04_test_idea_report.md',
  '05_test_case_spec.md',
  '06_coverage_review.md',
];

/** Columns humans fill later, or that are legitimately empty (§9.4, §9.6). */
const MAY_BE_EMPTY = new Set(['phản hồi chính thức', 'người trả lời', 'ngày', 'trích nguyên văn', 'người phê duyệt', 'ngày chốt']);

// ───────────────────────────── Reporting ─────────────────────────────

function makeReporter() {
  const items = [];
  const add = (level) => (file, where, msg) => items.push({ level, file, where, msg });
  return { items, error: add('ERROR'), warn: add('WARN') };
}

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null);

// ───────────────────────────── Context ─────────────────────────────

/** Everything the cross-checks need, read once. */
function context(slug, dir) {
  const t = (n) => read(path.join(dir, n));
  const t01 = t('01_requirement_risk_summary.md');
  const t02 = t('02_missing_rule_report.md');
  const t03 = t('03_viewpoint_report.md');
  const t04 = t('04_test_idea_report.md');
  const k = S.readKnowledge(slug);

  const d01 = S.read01(t01) || { BR: [], FD: [], AF: [], OQ: [], RK: [] };
  const dk = k.exists ? S.readKnowledgeDefs(k.text) : { BR: [], FD: [], AF: [] };
  const ruleDefs = new Set([...d01.BR, ...d01.FD, ...d01.AF, ...dk.BR, ...dk.FD, ...dk.AF]);

  const mrResolved = new Set();
  for (const q of k.questions) if (/^MR-/.test(q.id) && S.resolvedInKnowledge(q, k)) mrResolved.add(q.id);
  for (const d of k.decisions) if (d.valid) d.related.filter((x) => x.startsWith('MR-')).forEach((x) => mrResolved.add(x));

  return {
    slug, dir, t01, t02, t03, t04, k, d01, ruleDefs, mrResolved,
    vps: S.read03Viewpoints(t03),
    ideas: S.read04Ideas(t04),
  };
}

// ───────────────────────── A. Test cases ─────────────────────────

function batchFiles(dir) {
  const batchDir = path.join(dir, 'testcases');
  if (!fs.existsSync(batchDir)) return [];
  return fs.readdirSync(batchDir)
    .filter((f) => /^batch_.*\.md$/i.test(f))
    .sort((a, b) => (Number((a.match(/\d+/) || [0])[0]) - Number((b.match(/\d+/) || [0])[0])) || a.localeCompare(b));
}

function lintTestCases(ctx, R, FIELDS) {
  const { dir } = ctx;
  const targets = [];
  const specPath = path.join(dir, '05_test_case_spec.md');
  if (fs.existsSync(specPath)) targets.push({ rel: '05_test_case_spec.md', scope: 'spec', p: specPath });
  for (const f of batchFiles(dir)) targets.push({ rel: `testcases/${f}`, scope: 'batch', p: path.join(dir, 'testcases', f) });

  if (targets.length === 0) {
    R.warn('05_test_case_spec.md', '-', 'No test cases found (neither the merged spec nor testcases/batch_*.md)');
    return { total: 0, cases: [] };
  }

  const ids = { spec: new Map(), batch: new Map() };
  const all = { spec: [], batch: [] };
  let noRuleDefsReported = false;

  for (const { rel, scope, p } of targets) {
    const { cases, unparsed } = S.parseTestCases(read(p));
    if (cases.length === 0) {
      R.error(rel, '-', `0 test cases parsed — expected \`### TC_ID: <MODULE>-NNN\` headings with \`- **Field**:\` bullets (FORMAT_PINS 05)` +
        (unparsed.length ? `. TC-like lines the tools cannot read: ${unparsed.slice(0, 5).map((u) => `L${u.line} "${u.text}"`).join('; ')}` : ''));
    } else {
      for (const u of unparsed.slice(0, 10)) {
        R.error(rel, `line ${u.line}`, `TC-like line not parsed as a test case: "${u.text}" — every test case needs its own \`### TC_ID:\` heading`);
      }
    }
    if (scope === 'batch' && !S.readMeta(read(p))) {
      R.warn(rel, 'meta line', 'No `Owner: … · Verdict: …` meta line — `testcases:merge` will count this batch as FIX');
    }

    for (const tc of cases) {
      all[scope].push(tc);
      const id = tc.id;
      if (!S.isTcId(id)) R.error(rel, id, 'Malformed TC_ID — expected <MODULE>-NNN, e.g. AUTH-001 (QA_STANDARD §9.1)');
      if (ids[scope].has(id)) R.error(rel, id, `Duplicate TC_ID, already in ${ids[scope].get(id)} (same ${scope} scope)`);
      else ids[scope].set(id, rel);

      const values = {};
      for (const f of FIELDS) {
        const v = S.tcField(tc, f);
        values[f] = v === null ? null : v.trim();
        if (v === null) R.error(rel, id, `Missing field \`${f}\``);
        else if (S.isBlank(v)) R.error(rel, id, `Field \`${f}\` is empty`);
      }

      const title = values.Title && S.stripMd(values.Title);
      if (title && !TITLE_VERBS.test(title)) {
        R.error(rel, id, `Title must start with Verify / Validate / Confirm — got "${title.slice(0, 40)}…"`);
      }

      if (values['Test Steps']) {
        const steps = values['Test Steps'].split('\n').filter((l) => /^\s*\d+\./.test(l));
        if (steps.length === 0) R.error(rel, id, 'Test Steps are not numbered 1. 2. 3. …');
        else if (steps.length > MAX_STEPS) R.warn(rel, id, `Test Steps has ${steps.length} steps, above the ${MAX_STEPS} recommended — consider splitting`);
      }

      if (values.Priority && !S.isBlank(values.Priority) && !PRIORITY.test(S.stripMd(values.Priority))) {
        R.error(rel, id, `Priority "${S.stripMd(values.Priority)}" is not High / Medium / Low (optionally followed by [ĐỀ XUẤT]) — QA_STANDARD §11`);
      }

      // Placeholders in every field, code spans included.
      for (const [f, v] of Object.entries(tc.fields)) {
        const hit = S.findPlaceholder(v);
        if (hit) R.error(rel, id, `Field \`${f}\` still holds template content (matched ${hit}) — use a §2.1 label such as [CHƯA CÓ TRONG TÀI LIỆU] instead`);
      }

      if (values.Tags) {
        const tags = S.tcTags(tc);
        if (tags.rules.length === 0) R.error(rel, id, 'Tags is missing `Rule#<BR|FD|AF|MR>-xx` — not traceable to any rule');
        for (const code of tags.rules) {
          const fam = (code.match(/^([A-Z]+)-\d+$/) || [])[1];
          if (!RULE_FAMILIES.includes(fam)) {
            R.error(rel, id, `Rule#${code} is not a BR/FD/AF/MR code (QA_STANDARD §9.1)`);
          } else if (fam === 'MR') {
            if (!ctx.mrResolved.has(code)) R.error(rel, id, `Rule#${code}: an MR may be cited only once it is Confirmed/Rejected in knowledge (or decided in §8)`);
          } else if (ctx.ruleDefs.size === 0) {
            if (!noRuleDefsReported) R.error(rel, '-', 'Cannot cross-check Rule# codes: no BR/FD/AF found in 01 or knowledge');
            noRuleDefsReported = true;
          } else if (!ctx.ruleDefs.has(code)) {
            R.error(rel, id, `Rule#${code} is not defined in 01 or knowledge`);
          }
        }

        if (tags.viewpoints.length === 0) R.error(rel, id, 'Tags is missing `Viewpoint#VP-xx` — not traceable to any viewpoint');
        for (const vp of tags.viewpoints) {
          if (!/^VP-\d+$/.test(vp)) R.error(rel, id, `Viewpoint#${vp} is not a VP-xx code (QA_STANDARD §9.2)`);
          else if (ctx.vps.length && !ctx.vps.includes(vp)) R.error(rel, id, `Viewpoint#${vp} is not selected in 03 §2`);
          else if (!ctx.vps.length && !S.VP_REGISTRY[vp] && !/^VP-9\d$/.test(vp)) R.error(rel, id, `Viewpoint#${vp} is outside the registry (QA_STANDARD §9.2)`);
        }

        if (ctx.ideas.length) {
          if (tags.ideas.length === 0) R.warn(rel, id, 'Tags has no `TI#TI-xx` — coverage of 04 test ideas cannot be traced');
          for (const ti of tags.ideas) if (!ctx.ideas.some((x) => x.id === ti)) R.error(rel, id, `TI#${ti} is not defined in 04`);
        }
        if (!tags.module) R.warn(rel, id, 'Tags is missing `Module#` — hard to filter after importing into a test management tool');
      }
    }
  }

  // Batches are the source of the merged spec: their ID sets must agree.
  if (ids.spec.size && ids.batch.size) {
    const missing = [...ids.batch.keys()].filter((x) => !ids.spec.has(x));
    const extra = [...ids.spec.keys()].filter((x) => !ids.batch.has(x));
    if (missing.length || extra.length) {
      R.error('05_test_case_spec.md', 'merge', `Spec and batches disagree — in batches but not in spec: ${missing.join(', ') || '-'}; in spec but not in any batch: ${extra.join(', ') || '-'}. Re-run testcases:merge.`);
    }
  }

  const cases = all.spec.length ? all.spec : all.batch;

  // Coverage: every kept test idea has a case (ERROR); uncovered BR/FD/AF (WARN).
  if (cases.length) {
    const tagged = cases.map((c) => S.tcTags(c));
    const coveredTi = new Set(tagged.flatMap((t) => t.ideas));
    const uncoveredTi = ctx.ideas.filter((i) => i.keep === 'Giữ' && !coveredTi.has(i.id)).map((i) => i.id);
    if (uncoveredTi.length) R.error('04_test_idea_report.md', 'coverage', `Test ideas marked Giữ with no test case: ${uncoveredTi.join(', ')}`);
    const coveredRules = new Set(tagged.flatMap((t) => t.rules));
    const rules01 = [...ctx.d01.BR, ...ctx.d01.FD, ...ctx.d01.AF];
    const uncovered = rules01.filter((r) => !coveredRules.has(r));
    if (uncovered.length) R.warn('01_requirement_risk_summary.md', 'coverage', `Not cited by any test case (Rule#): ${uncovered.join(', ')}`);
  }

  return { total: cases.length, cases };
}

// ───────────────────────── B. Meta line ─────────────────────────

function lintMeta(dir, R) {
  for (const name of NEEDS_META) {
    const content = read(path.join(dir, name));
    if (content === null) continue;
    if (S.readMeta(content)) continue;
    const at = content.split('\n').findIndex((l) => /Verdict/i.test(l));
    const hint = at === -1 ? 'no Verdict anywhere' : `found "${content.split('\n')[at].trim().slice(0, 60)}" on line ${at + 1}`;
    R.error(name, 'meta line', `No readable meta line \`Owner: … · Nguồn: … · Verdict: PASS|FIX|ASK\` (plain text) in the first ${S.META_TOP} lines — ${hint}. Tools treat it as unreadable (QA_STANDARD §7)`);
  }
}

// ───────────────────────── C. 01 ─────────────────────────

/** Source files for the quote check, each normalised on its own: [{rel, norm}]. */
function inputFiles(ctx) {
  const files = [];
  const walk = (d, base) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      // _superseded/ = bản cũ đã bị thay: trích dẫn phải lấy từ bản đang dùng.
      if (e.isDirectory()) { if (e.name !== '_superseded') walk(p, base); }
      else if (/\.(md|txt|csv)$/i.test(e.name) && !/^readme\.md$/i.test(e.name)) {
        files.push({ rel: path.relative(base, p).split(path.sep).join('/'), norm: S.normText(fs.readFileSync(p, 'utf-8')) });
      }
    }
  };
  const input = path.join(PATHS.INPUT, ctx.slug);
  walk(input, input);
  if (fs.existsSync(ctx.dir)) {
    for (const f of fs.readdirSync(ctx.dir)) {
      if (/^00_knowledge_digest.*\.md$/i.test(f)) files.push({ rel: f, norm: S.normText(read(path.join(ctx.dir, f))) });
    }
  }
  return files;
}

function lint01(ctx, R) {
  const name = '01_requirement_risk_summary.md';
  const text = ctx.t01;
  if (text === null) return;

  if (ctx.d01.BR.length === 0) R.error(name, '§3', 'No BR-xx rows parsed from the `## 3. BUSINESS RULES` table (| ID | Điều kiện | … |)');

  // ID format in the ID column of every definition table.
  for (const num of ['3', '3b', '5', '7', '10']) {
    const sec = S.sectionAt(text, num);
    if (!sec) continue;
    for (const t of S.parseTables(sec.body, sec.offset)) {
      const i = S.col(t, 'id');
      if (i === -1) continue;
      for (const r of t.rows) {
        const raw = S.stripMd(r.cells[i]);
        if (!raw || S.isBlank(raw)) { R.error(name, `line ${r.line}`, 'Row without an ID'); continue; }
        if (!/^(BR|FD|AF|OQ|RK)-\d{2,}$/.test(raw)) R.error(name, `line ${r.line}`, `Malformed ID "${raw}" — expected BR/FD/AF/OQ/RK-xx (≥2 digits, QA_STANDARD §9.1)`);
      }
    }
  }

  // Verbatim quotes.
  let files;
  let corpusReported = false;
  for (const num of ['3', '3b', '5', '6']) {
    const sec = S.sectionAt(text, num);
    if (!sec) continue;
    for (const t of S.parseTables(sec.body, sec.offset)) {
      const qi = S.col(t, 'quote');
      if (qi === -1) continue;
      for (const r of t.rows) {
        const quote = r.cells[qi] || '';
        const src = S.stripMd(S.cell(t, r, 'source'));
        const where = `§${num} line ${r.line}`;
        if (S.isBlank(quote)) {
          if (!/^knowledge\s*§\s*8/i.test(src)) R.error(name, where, '"Trích nguyên văn" is empty — only allowed when Nguồn is `knowledge §8 #n`');
          continue;
        }
        if (S.hasLabel(quote)) { R.error(name, where, '"Trích nguyên văn" must be text copied from INPUT/, not a label'); continue; }
        if (files === undefined) files = inputFiles(ctx);
        if (files.length === 0) {
          if (!corpusReported) R.error(name, '-', `Cannot verify quotes: nothing readable in INPUT/${ctx.slug}/ or 00_knowledge_digest.md`);
          corpusReported = true;
          continue;
        }
        const m = S.quoteInSources(quote, src, files);
        if (!m.ok) {
          const scope = m.named ? m.searched.join(', ') : `any single file of INPUT/${ctx.slug}/`;
          R.error(name, where, `Quote not found verbatim in ${scope} (${m.reason}): "${S.stripMd(quote).slice(0, 70)}"`);
        }
      }
    }
  }
}

// ───────────────────────── D. 02 ─────────────────────────

const W_COLS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];

function lint02(ctx, R) {
  const name = '02_missing_rule_report.md';
  const text = ctx.t02;
  if (text === null) return;

  // §3 question table.
  const qSec = S.sectionAt(text, '3', /câu hỏi/) || { body: text, offset: 0 };
  const qTable = S.parseTables(qSec.body, qSec.offset).find((t) => S.col(t, 'id') !== -1 && t.rows.some((r) => S.canonicalId(r.cells[S.col(t, 'id')], 'MR')));
  const questions = S.read02Questions(text);
  const mrIds = new Set(questions.map((q) => q.id));
  if (qTable) {
    for (const c of ['id', 'question', 'answer', 'status']) {
      if (S.col(qTable, c) === -1) R.error(name, '§3', `Question table lacks column "${S.COLUMN_ALIASES[c][0]}" (QA_STANDARD §9.4)`);
    }
  }
  for (const q of questions) {
    if (!/^MR-\d{2,}$/.test(S.stripMd(q.rawId))) R.error(name, `line ${q.line}`, `Malformed ID "${q.rawId}" — expected MR-xx`);
    if (!q.status) R.error(name, `line ${q.line}`, `Unrecognised status "${q.statusRaw}" — use New / TREO / Confirmed / Rejected (QA_STANDARD §9.3)`);
    if (!q.question) R.error(name, `line ${q.line}`, `${q.id} has no "Câu hỏi cho BA/PO"`);
    if (q.status === 'Confirmed' && !q.answer) R.error(name, `line ${q.line}`, `${q.id} is Confirmed but "Phản hồi chính thức" is empty`);
  }

  // §1 06W matrix (closed matrix, QA_STANDARD §4).
  const mSec = S.sectionAt(text, '1', /06w|ma trận/) || { body: text, offset: 0 };
  const matrix = S.parseTables(mSec.body, mSec.offset).find((t) => S.col(t, 'object') !== -1 && W_COLS.every((w) => S.col(t, w) !== -1));
  if (!matrix) {
    R.error(name, '06W', 'No 06W matrix — `## 1. MA TRẬN 06W` must hold | Đối tượng | W1 | W2 | W3 | W4 | W5 | W6 | with one row per BR/FD/AF of 01 (QA_STANDARD §4)');
  } else {
    const rows = new Set();
    const referenced = new Set();
    for (const r of matrix.rows) {
      const obj = S.canonicalId(S.cell(matrix, r, 'object'), ['BR', 'FD', 'AF']);
      if (!obj) { R.error(name, `line ${r.line}`, `Matrix row object "${S.stripMd(S.cell(matrix, r, 'object'))}" is not a BR/FD/AF code`); continue; }
      rows.add(obj);
      for (const w of W_COLS) {
        const v = S.stripMd(S.cell(matrix, r, w));
        if (S.isBlank(v)) { R.error(name, `${obj} × ${w}`, 'Empty matrix cell — must be MR-xx, `Nguồn: …` or `Không áp dụng`'); continue; }
        if (/^nguồn\s*:\s*\S/i.test(v)) continue;
        if (S.normKey(v) === 'không áp dụng') continue;
        const parts = v.split(/\s*,\s*/).filter(Boolean);
        const mrs = parts.map((p) => S.canonicalId(p, 'MR'));
        if (mrs.every(Boolean)) mrs.forEach((m) => referenced.add(m));
        else R.error(name, `${obj} × ${w}`, `Invalid matrix cell "${v.slice(0, 50)}" — must be MR-xx (comma-separated), \`Nguồn: …\` or \`Không áp dụng\``);
      }
    }
    if (ctx.t01 === null) {
      R.error(name, '06W', 'Cannot verify the matrix: 01_requirement_risk_summary.md is missing');
    } else {
      const objects = [...ctx.d01.BR, ...ctx.d01.FD, ...ctx.d01.AF];
      const missing = objects.filter((o) => !rows.has(o));
      if (missing.length) R.error(name, '06W', `Objects of 01 with no matrix row: ${missing.join(', ')}`);
    }
    const undefinedMr = [...referenced].filter((m) => !mrIds.has(m));
    if (undefinedMr.length) R.error(name, '06W', `Matrix cites MRs absent from the §3 question table: ${undefinedMr.join(', ')}`);
    const orphan = [...mrIds].filter((m) => !referenced.has(m));
    if (orphan.length) R.warn(name, '§3', `MRs not traced to any matrix cell: ${orphan.join(', ')} — questions come only from "Có kẽ hở" cells`);
  }

  // §4 OQ reconciliation.
  const oqs = ctx.d01.OQ;
  if (oqs.length) {
    const oSec = S.sectionAt(text, '4', /oq/) || { body: '', offset: 0 };
    const t = S.parseTables(oSec.body, oSec.offset).find((x) => S.col(x, 'oq') !== -1);
    const handled = new Map();
    if (t) for (const r of t.rows) { const id = S.canonicalId(S.cell(t, r, 'oq'), 'OQ'); if (id) handled.set(id, { v: S.stripMd(S.cell(t, r, 'handling')), line: r.line }); }
    for (const oq of oqs) {
      const h = handled.get(oq);
      if (!h) { R.error(name, '§4', `${oq} of 01 is not reconciled in \`## 4. ĐỐI CHIẾU OQ\``); continue; }
      if (/^nguồn\s*:\s*\S/i.test(h.v)) continue;
      const m = S.canonicalId(h.v, 'MR');
      if (!m) R.error(name, `line ${h.line}`, `${oq}: "Xử lý" must be MR-xx or \`Nguồn: …\``);
      else if (!mrIds.has(m)) R.error(name, `line ${h.line}`, `${oq} -> ${m}, which is not in the §3 question table`);
    }
  }

  // Verdict consistency (FORMAT_PINS 02).
  const verdict = S.readVerdict(text);
  const open = questions.filter((q) => !q.resolved);
  if (verdict === 'PASS' && open.length) R.error(name, 'verdict', `Verdict PASS but ${open.length} MR(s) still New/TREO: ${open.map((q) => q.id).join(', ')}`);
  if (verdict === 'ASK' && questions.length && open.length === 0) R.warn(name, 'verdict', 'Verdict ASK but every MR is Confirmed/Rejected');
}

// ───────────────────────── E. Table cells ─────────────────────────

function lintEmptyCells(dir, R) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter((f) => /^\d{2}[a-z]?_.*\.md$/i.test(f));
  for (const name of files) {
    let empties = 0;
    let firstLine = 0;
    for (const t of S.parseTables(read(path.join(dir, name)))) {
      if (t.idLikeHeader) {
        R.warn(name, `line ${t.line}`, `Table starts with a data-like row "${S.stripMd(t.headers[0])}" — bảng bị ngắt bởi dòng trống? (rows after a blank line lose their header)`);
      }
      if (t.headers.length < 2) continue;
      for (const r of t.rows) {
        const blank = r.cells.some((c, i) => c.trim() === '' && !MAY_BE_EMPTY.has(t.keys[i]));
        if (blank) { empties++; if (!firstLine) firstLine = r.line; }
      }
    }
    if (empties) {
      R.warn(name, `line ${firstLine}`, `${empties} table row(s) have blank cells — QA_STANDARD §2.7 requires an explicit label (CHƯA COVER / CHƯA CÓ DATA / [CONTEXT_MISSING])`);
    }
  }
}

// ───────────────────────── F. Knowledge answers ─────────────────────────

/** Answers / decisions that are still template slots (`<số ngày>`) are not answers. */
function lintKnowledge(ctx, R) {
  if (!ctx.k.exists) return;
  const name = `knowledge/features/${ctx.slug}.md`;
  for (const q of ctx.k.questions) {
    if (q.placeholder) R.error(name, `line ${q.line}`, `${q.id}: ${S.NOT_CONCRETE_HINT}`);
  }
  for (const d of ctx.k.decisions) {
    if (d.placeholder) R.error(name, `line ${d.line}`, `§8 ${d.related.join(', ') || '#' + d.num}: ${S.NOT_CONCRETE_HINT}`);
  }
}

// ───────────────────────────── Run ─────────────────────────────

function lint(slug) {
  const dir = taskDir(slug);
  if (!fs.existsSync(dir)) throw new Error(`No OUTPUT/${slug}/ directory`);

  const R = makeReporter();
  const ctx = context(slug, dir);
  const tc = lintTestCases(ctx, R, loadFields());
  lintMeta(dir, R);
  lint01(ctx, R);
  lint02(ctx, R);
  lintKnowledge(ctx, R);
  lintEmptyCells(dir, R);

  const errors = R.items.filter((i) => i.level === 'ERROR');
  const warns = R.items.filter((i) => i.level === 'WARN');
  return { slug, totalCases: tc.total, errors, warns, clean: errors.length === 0 };
}

function render(r) {
  const line = '─'.repeat(67);
  console.log(`\n${line}`);
  console.log(`  DELIVERABLE LINT · task [ ${r.slug} ]   ·   ${r.totalCases} test case(s)`);
  console.log(line);

  if (r.clean && r.warns.length === 0) {
    console.log('  Clean — test cases, meta lines, 01 quotes, 06W matrix and table cells all pass.');
    console.log(`${line}\n`);
    return;
  }

  const show = (items, title) => {
    if (!items.length) return;
    console.log(`\n  ${items.length} ${title}:`);
    const byFile = items.reduce((m, i) => ((m[i.file] = m[i.file] || []).push(i), m), {});
    for (const [file, list] of Object.entries(byFile)) {
      console.log(`\n     ${file}`);
      list.slice(0, 15).forEach((i) => console.log(`       - [${i.where}] ${i.msg}`));
      if (list.length > 15) console.log(`       … and ${list.length - 15} more`);
    }
  };

  show(r.errors, 'ERROR(S) to fix');
  show(r.warns, 'warning(s)');
  console.log(`\n${line}\n`);
}

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const slug = args.find((a) => !a.startsWith('--'));

  const slugs = slug ? [slug] : listTaskSlugs();
  if (slugs.length === 0) {
    console.log('No tasks in OUTPUT/ to lint.');
    process.exit(0);
  }

  const results = slugs.map(lint);
  if (asJson) console.log(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
  else results.forEach(render);

  process.exit(results.some((r) => !r.clean) ? 1 : 0);
}

if (require.main === module) main();

module.exports = { lint };

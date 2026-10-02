#!/usr/bin/env node
/**
 * lint-deliverables.js — Machine-checks deliverables against the FACT standard.
 *
 *   lint(slug)  Run every rule group over one task. Returns {errors, warns, totalCases}.
 *
 * Rule groups:
 *   A. Test cases — ID format, duplicates, required fields, title verb,
 *      numbered steps, priority, Rule#/Viewpoint# traceability, placeholders.
 *   B. Meta line — `Owner:` and `Verdict:` near the top of each stage file.
 *   C. 06W coverage — stage 2 must scan W1 through W6.
 *   D. Table cells — no blank cells (QA_STANDARD §2.7).
 *
 * AGENTS.md §5 and QA_STANDARD set these rules, but until now the only thing
 * checking them was `coverage-review` — an LLM grading an LLM's output.
 *
 * Usage:
 *   lint-deliverables.js [slug] [--json]
 * Exit: 0 = clean or warnings only, 1 = errors to fix.
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, listTaskSlugs } = require('../lib/paths');

// ───────────────────────────── Rules ─────────────────────────────

const FALLBACK_FIELDS = ['Title', 'Precondition', 'Test Steps', 'Test Data', 'Expected Result', 'Priority', 'Tags'];

/**
 * Required test-case fields, excluding `TC_ID` which lives in the heading.
 *
 * Read from the "Định dạng N trường bắt buộc" table in the
 * `test-case-generation` skill rather than hard-coded, so that upgrading the
 * skill to add a field (e.g. `Boundary Profile`) is picked up automatically.
 * The skill is the source of truth; this tool only enforces it.
 *
 * Called per `lint()` run, not at module load: reading once at require time
 * means edits to the skill are invisible within the same process.
 */
function loadFields() {
  const skill = path.join(PATHS.SYSTEM || PATHS.AGENTS, 'qa-test-design', 'skills', 'test-case-generation.md');
  if (!fs.existsSync(skill)) return FALLBACK_FIELDS;

  const text = fs.readFileSync(skill, 'utf-8');
  const section = text.split(/^##\s+Định dạng\s+\d+\s+trường bắt buộc/m)[1];
  if (!section) return FALLBACK_FIELDS;

  const fields = [];
  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const m = line.match(/^\|\s*`([^`]+)`\s*\|/);
    if (m && m[1] !== 'TC_ID') fields.push(m[1].trim());
    if (/^##\s/.test(line)) break;
  }
  return fields.length ? fields : FALLBACK_FIELDS;
}

const TITLE_VERBS = /^(Verify|Validate|Confirm)\b/i;
const TC_ID_FORMAT = /^[A-Z][A-Z0-9]{1,5}-\d{3}$/;
const PRIORITIES = new Set(['high', 'medium', 'low', 'critical', 'blocker']);
const MAX_STEPS = 8;

/**
 * Unfilled-content markers. Deliberately narrow: an earlier version flagged
 * `<script>alert('XSS')</script>` and `SG-XXXXXX` as placeholders. A linter that
 * cries wolf gets switched off, which defeats its purpose.
 */
const TEMPLATE_WORDS = 'hành động|giá trị|trạng thái|Tên trường|điều kiện|MODULE|Verify/Validate/Confirm';
const PLACEHOLDERS = [
  /\bTBD\b/i,
  /\bTODO\b/i,
  new RegExp(`\\[(?:${TEMPLATE_WORDS})[^\\]]*\\]`, 'i'),
  new RegExp(`<(?:${TEMPLATE_WORDS})[^>]*>`, 'i'),
];

/** Test data almost always sits in backticks, so scan outside code spans only. */
const stripCode = (t) => t.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');

const NEEDS_META = [
  '01_requirement_risk_summary.md',
  '02_missing_rule_report.md',
  '03_viewpoint_report.md',
  '04_test_idea_report.md',
  '05_test_case_spec.md',
  '06_coverage_review.md',
];

// ───────────────────────────── Reporting ─────────────────────────────

function makeReporter() {
  const items = [];
  const add = (level) => (file, where, msg) => items.push({ level, file, where, msg });
  return { items, error: add('ERROR'), warn: add('WARN') };
}

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null);

// ───────────────────────── A. Test cases ─────────────────────────

function lintTestCases(dir, R, FIELDS) {
  const targets = [];
  const spec = path.join(dir, '05_test_case_spec.md');
  if (fs.existsSync(spec)) targets.push(spec);

  const batchDir = path.join(dir, 'testcases');
  if (fs.existsSync(batchDir)) {
    fs.readdirSync(batchDir)
      .filter((f) => /^batch_.*\.md$/.test(f))
      .sort()
      .forEach((f) => targets.push(path.join(batchDir, f)));
  }

  if (targets.length === 0) {
    R.warn('05_test_case_spec.md', '-', 'No test cases found (neither the merged spec nor testcases/batch_*.md)');
    return 0;
  }

  // Separate scopes: batch files are the SOURCE merged INTO the spec, so sharing
  // IDs is correct. Only flag duplicates within the same scope.
  const seenBy = { spec: new Map(), batch: new Map() };
  let specCount = 0;
  let batchCount = 0;

  for (const file of targets) {
    const rel = path.relative(dir, file);
    const content = read(file);
    const scope = rel.startsWith('testcases/') ? 'batch' : 'spec';
    const seen = seenBy[scope];

    for (const sec of content.split(/\n(?=###\s+TC_ID:)/g)) {
      const idm = sec.match(/###\s+TC_ID:\s*(\S+)/);
      if (!idm) continue;
      if (scope === 'spec') specCount++; else batchCount++;

      const id = idm[1].trim();

      if (!TC_ID_FORMAT.test(id)) {
        R.error(rel, id, 'Malformed TC_ID — expected [MODULE]-[001], e.g. VCHR-001');
      }
      if (seen.has(id)) {
        R.error(rel, id, `Duplicate TC_ID, already in ${seen.get(id)} (same ${scope} scope)`);
      } else {
        seen.set(id, rel);
      }

      // Stop at ANY other field, not just the next one: if the next field is
      // absent, the current one would fail to match and be reported missing too.
      const values = {};
      const anyField = FIELDS.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      for (const f of FIELDS) {
        const esc = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const stop = `(?=\\n-\\s+\\*\\*(?:${anyField})\\*\\*:|\\n###|$)`;
        const m = sec.match(new RegExp(`-\\s+\\*\\*${esc}\\*\\*:\\s*([\\s\\S]*?)${stop}`));
        const v = m ? m[1].trim() : null;
        values[f] = v;

        if (v === null) R.error(rel, id, `Missing field \`${f}\``);
        else if (v === '') R.error(rel, id, `Field \`${f}\` is empty`);
      }

      if (values.Title && !TITLE_VERBS.test(values.Title)) {
        R.error(rel, id, `Title must start with Verify / Validate / Confirm — got "${values.Title.slice(0, 40)}…"`);
      }

      if (values['Test Steps']) {
        const steps = values['Test Steps'].split('\n').filter((l) => /^\s*\d+\./.test(l));
        if (steps.length === 0) {
          R.error(rel, id, 'Test Steps are not numbered 1. 2. 3. …');
        } else if (steps.length > MAX_STEPS) {
          R.warn(rel, id, `Test Steps has ${steps.length} steps, above the ${MAX_STEPS} recommended — consider splitting`);
        }
      }

      if (values.Priority && !PRIORITIES.has(values.Priority.toLowerCase().replace(/\*/g, '').trim())) {
        R.error(rel, id, `Priority "${values.Priority}" is not one of High / Medium / Low`);
      }

      if (values.Tags) {
        // Accept any structured `PREFIX-xxx` code, not just `BR-<digits>`.
        // QA_STANDARD §2.4 only requires tracing to "BR-xx / MR-xx / a document
        // section"; real runs use codes such as `Rule#GAP-H2` for settled gaps.
        if (!/Rule#[A-Za-z]+-[A-Za-z0-9]+/.test(values.Tags)) {
          R.error(rel, id, 'Tags is missing `Rule#<code>` — not traceable to any business rule or gap');
        }
        if (!/Viewpoint#\S+/.test(values.Tags)) {
          R.error(rel, id, 'Tags is missing `Viewpoint#VP-xx` — not traceable to any viewpoint');
        }
        if (!/Module#\S+/.test(values.Tags)) {
          R.warn(rel, id, 'Tags is missing `Module#` — hard to filter after importing into a test management tool');
        }
      }

      for (const f of ['Title', 'Test Data', 'Expected Result']) {
        const v = values[f];
        if (!v) continue;
        const hit = PLACEHOLDERS.find((re) => re.test(stripCode(v)));
        if (hit) R.error(rel, id, `Field \`${f}\` still holds unfilled content (matched ${hit}) — FACT forbids placeholders`);
      }
    }
  }

  // The merged spec is authoritative; fall back to batch count before merging.
  return specCount || batchCount;
}

// ───────────────────────── B. Meta line ─────────────────────────

/**
 * Three distinct states: present at the top (ok), present but far down
 * (non-standard), absent entirely (error). Reporting something as "missing"
 * when it exists sends people hunting and costs the linter its credibility.
 */
function lintMeta(dir, R) {
  // Deliberately loose: `**Verdict Chặng 1**:` and `**VERDICT CHẶNG 3**:` are
  // both valid, and the repo uses `Chuyên gia thực hiện` in place of `Owner`.
  const HAS_VERDICT = /\*{0,2}\s*Verdict[^:\n*]{0,30}\*{0,2}\s*:/i;
  const HAS_OWNER = /\*{0,2}\s*(Owner|Chuyên gia thực hiện)\*{0,2}\s*:/i;
  const TOP_LINES = 10;

  for (const name of NEEDS_META) {
    const content = read(path.join(dir, name));
    if (content === null) continue; // stage not run yet

    const lines = content.split('\n');
    const head = lines.slice(0, TOP_LINES).join('\n');

    for (const [label, re] of [['Verdict', HAS_VERDICT], ['Owner', HAS_OWNER]]) {
      if (re.test(head)) continue;

      const at = lines.findIndex((l) => re.test(l));
      if (at === -1) {
        const level = label === 'Verdict' ? R.error : R.warn;
        level(name, 'meta line', `No \`${label}:\` anywhere in the file (QA_STANDARD §7)`);
      } else {
        R.warn(name, `line ${at + 1}`, `\`${label}:\` sits on line ${at + 1}, not within the first ${TOP_LINES} lines — downstream agents read the meta line at the top and will miss it`);
      }
    }
  }
}

// ───────────────────────── C. 06W coverage ─────────────────────────

function lint06W(dir, R) {
  const name = '02_missing_rule_report.md';
  const content = read(path.join(dir, name));
  if (content === null) return;

  const missing = [];
  for (let i = 1; i <= 6; i++) {
    if (!new RegExp(`\\bW${i}\\b`).test(content)) missing.push(`W${i}`);
  }
  if (missing.length) {
    R.error(name, '06W', `Did not scan ${missing.join(', ')} — QA_STANDARD §4 requires W1 through W6; questions that surface nothing still need an explicit "no issue found" note`);
  }
}

// ───────────────────────── D. Table cells ─────────────────────────

function lintEmptyCells(dir, R) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter((f) => /^\d{2}[a-z]?_.*\.md$/.test(f));

  for (const name of files) {
    const lines = read(path.join(dir, name)).split('\n');
    let empties = 0;
    let firstLine = 0;

    lines.forEach((line, i) => {
      const t = line.trim();
      if (!t.startsWith('|') || /^\|[\s:|-]+\|$/.test(t)) return;
      const cells = t.split('|').slice(1, -1);
      if (cells.length < 2) return;
      if (cells.some((c) => c.trim() === '')) {
        empties++;
        if (!firstLine) firstLine = i + 1;
      }
    });

    if (empties) {
      R.warn(name, `line ${firstLine}`, `${empties} table row(s) have blank cells — QA_STANDARD §2.7 requires an explicit label (CHƯA COVER / CHƯA CÓ DATA / [CONTEXT_MISSING])`);
    }
  }
}

// ───────────────────────────── Run ─────────────────────────────

function lint(slug) {
  const dir = taskDir(slug);
  if (!fs.existsSync(dir)) throw new Error(`No OUTPUT/${slug}/ directory`);

  const R = makeReporter();
  const totalCases = lintTestCases(dir, R, loadFields());
  lintMeta(dir, R);
  lint06W(dir, R);
  lintEmptyCells(dir, R);

  const errors = R.items.filter((i) => i.level === 'ERROR');
  const warns = R.items.filter((i) => i.level === 'WARN');
  return { slug, totalCases, errors, warns, clean: errors.length === 0 };
}

function render(r) {
  const line = '─'.repeat(67);
  console.log(`\n${line}`);
  console.log(`  DELIVERABLE LINT · task [ ${r.slug} ]   ·   ${r.totalCases} test case(s)`);
  console.log(line);

  if (r.clean && r.warns.length === 0) {
    console.log('  Clean — fields, meta line, 06W coverage and table cells all pass.');
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

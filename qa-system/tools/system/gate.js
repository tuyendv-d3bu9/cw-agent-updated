#!/usr/bin/env node
/**
 * gate.js — The ASK gate: blocks stages 03-06 while the feature spec still has
 * unanswered questions.
 *
 *   evaluate(slug)  Gate state: blocked, reasons, pending questions, advisories.
 *   audit(slug)     Deliverables written after the lock timestamp (bypass detection).
 *   LOCKED_DELIVERABLES  Files the gate protects.
 *
 * AGENTS.md §1.6 states this rule in prose, but prose is only a probability — a
 * model can still be talked past it. This turns the rule into a machine-checkable
 * condition. Layer 2 (the PreToolUse hook) and layer 3 (`audit`) build on it.
 *
 * Usage:
 *   gate.js check [slug] [--json]   Exit 0 = open, 1 = closed
 *   gate.js audit [slug]            Exit 2 when a bypass is detected
 *   gate.js explain [slug]          List the pending questions
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, featureKnowledge, listTaskSlugs } = require('../lib/paths');

const LOCKED_DELIVERABLES = [
  '03_viewpoint_report.md',
  '04_test_idea_report.md',
  '05_test_case_spec.md',
  '05_test_blueprint.json',
  '06_coverage_review.md',
];

/** Any other status — including blank and `TREO` — keeps the gate closed. */
const RESOLVED_STATES = new Set(['confirmed', 'rejected']);

const LOCK_FILE = '_gate.lock';

// ───────────────────────────── Parsing ─────────────────────────────

/** Markdown table rows as cell arrays, minus the header separator. */
function tableRows(section) {
  const rows = [];
  for (const line of section.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    if (/^\|[\s:|-]+\|$/.test(t)) continue;
    rows.push(t.split('|').slice(1, -1).map((c) => c.trim()));
  }
  return rows;
}

/**
 * Body of a `## N. ...` section.
 *
 * Split on headings rather than one lookahead regex: the last section has no
 * heading after it, so a lookahead silently returns empty — and section 8
 * (confirmed assumptions), one of the two unlock paths, usually sits last.
 */
function section(content, num) {
  const lines = content.split('\n');
  const head = new RegExp(`^##\\s*${num}\\.`);
  const anyHead = /^##\s/;

  const start = lines.findIndex((l) => head.test(l));
  if (start === -1) return '';

  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => anyHead.test(l));
  return (end === -1 ? rest : rest.slice(0, end)).join('\n');
}

/** Reads sections 7 (open questions) and 8 (confirmed assumptions). */
function readOpenQuestions(slug) {
  const kPath = featureKnowledge(slug);
  if (!fs.existsSync(kPath)) {
    return { exists: false, path: kPath, pending: [], resolved: [] };
  }

  const content = fs.readFileSync(kPath, 'utf-8');

  // Section 8: any code with a recorded decision counts as unlocked.
  const decided = new Set();
  for (const cells of tableRows(section(content, 8))) {
    const code = (cells[1] || '').replace(/`/g, '').trim();
    const decision = (cells[3] || '').trim();
    if (/^(MR|BR)-\w+/i.test(code) && decision && !/^[-–—]?$/.test(decision)) {
      decided.add(code.toUpperCase());
    }
  }

  const pending = [];
  const resolved = [];
  for (const cells of tableRows(section(content, 7))) {
    const id = (cells[0] || '').replace(/`/g, '').trim();
    if (!/^MR-\w+/i.test(id)) continue;

    const question = cells[5] || '(no question recorded)';
    const answer = (cells[6] || '').trim();
    const state = (cells[7] || '').trim().toLowerCase();

    const isResolved =
      RESOLVED_STATES.has(state) ||
      decided.has(id.toUpperCase()) ||
      (answer && !/^[-–—]?$/.test(answer));

    (isResolved ? resolved : pending).push({
      id: id.toUpperCase(),
      question,
      risk: cells[3] || '',
      state: cells[7] || '(blank)',
    });
  }

  return { exists: true, path: kPath, pending, resolved };
}

function verdictAsk(slug) {
  const p = path.join(taskDir(slug), '02_missing_rule_report.md');
  if (!fs.existsSync(p)) return { exists: false, ask: false, path: p };
  const c = fs.readFileSync(p, 'utf-8');
  return { exists: true, ask: /Verdict:\s*ASK/i.test(c) || /\|\s*ASK\s*\|/.test(c), path: p };
}

// ───────────────────────────── Evaluation ─────────────────────────────

function evaluate(slug) {
  const questions = readOpenQuestions(slug);
  const verdict = verdictAsk(slug);

  const reasons = [];
  if (verdict.ask) {
    reasons.push(`Stage 2 returned \`Verdict: ASK\` in ${path.relative(PATHS.ROOT, verdict.path)}`);
  }
  if (questions.pending.length > 0) {
    reasons.push(
      `${questions.pending.length} question(s) in section 7 have no official answer ` +
        `(${questions.pending.map((q) => q.id).join(', ')})`
    );
  }
  if (verdict.ask && !questions.exists) {
    reasons.push(`No knowledge file at ${path.relative(PATHS.ROOT, questions.path)} to record answers in`);
  }

  // Advisory, never blocking. QA_STANDARD §8: OUTPUT/ is disposable, knowledge/
  // is what accumulates. Answers left only in the stage-2 report are lost on the
  // next run, so the BA gets asked the same questions again.
  const advisories = [];
  if (verdict.exists && !verdict.ask) {
    const text = fs.readFileSync(verdict.path, 'utf-8');
    const mrInReport = [...new Set(text.match(/\bMR-\d+\b/g) || [])].map((s) => s.toUpperCase());
    const recorded = new Set([...questions.pending, ...questions.resolved].map((q) => q.id));
    const unrecorded = mrInReport.filter((id) => !recorded.has(id));

    if (unrecorded.length) {
      advisories.push(
        `${unrecorded.length} gap(s) (${unrecorded.join(', ')}) were settled in stage 2 but are ` +
          `NOT recorded in ${path.relative(PATHS.ROOT, questions.path)}. ` +
          `OUTPUT/ is disposable — the next run will ask the BA these same questions again.`
      );
    }
  }

  return {
    slug,
    blocked: reasons.length > 0,
    reasons,
    advisories,
    pending: questions.pending,
    resolvedCount: questions.resolved.length,
    knowledgePath: path.relative(PATHS.ROOT, questions.path),
  };
}

/** Writes or removes `_gate.lock` to match the current state. */
function writeLock(state) {
  const dir = taskDir(state.slug);
  if (!fs.existsSync(dir)) return null;
  const lockPath = path.join(dir, LOCK_FILE);

  if (!state.blocked) {
    if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
    return null;
  }

  // Preserve the original lock time so `audit` keeps a stable reference point.
  let lockedAt = new Date().toISOString();
  if (fs.existsSync(lockPath)) {
    try {
      lockedAt = JSON.parse(fs.readFileSync(lockPath, 'utf-8')).lockedAt || lockedAt;
    } catch {
      /* corrupt lock file: start a fresh timestamp */
    }
  }

  fs.writeFileSync(
    lockPath,
    JSON.stringify(
      {
        slug: state.slug,
        lockedAt,
        updatedAt: new Date().toISOString(),
        reasons: state.reasons,
        pending: state.pending,
        lockedDeliverables: LOCKED_DELIVERABLES,
        unlock:
          'Answer in section 7 (fill "Phản hồi chính thức", set status to Confirmed) ' +
          'OR record an explicit business decision in section 8 of ' + state.knowledgePath,
      },
      null,
      2
    ),
    'utf-8'
  );
  return lockPath;
}

/** Layer 3: deliverables whose mtime is at or after the lock timestamp. */
function audit(slug) {
  const dir = taskDir(slug);
  const lockPath = path.join(dir, LOCK_FILE);
  if (!fs.existsSync(lockPath)) return { violations: [], hadLock: false };

  let lockedAt;
  try {
    lockedAt = new Date(JSON.parse(fs.readFileSync(lockPath, 'utf-8')).lockedAt);
  } catch {
    return { violations: [], hadLock: true, corrupt: true };
  }

  const violations = [];
  for (const name of LOCKED_DELIVERABLES) {
    const p = path.join(dir, name);
    if (!fs.existsSync(p)) continue;
    const mtime = fs.statSync(p).mtime;
    if (mtime >= lockedAt) {
      violations.push({ file: name, createdAt: mtime.toISOString() });
    }
  }
  return { violations, hadLock: true, lockedAt: lockedAt.toISOString() };
}

// ───────────────────────────── Output ─────────────────────────────

function printState(state, lockPath) {
  const line = '─'.repeat(63);
  console.log(`\n${line}`);
  console.log(`  ASK GATE · task [ ${state.slug} ]`);
  console.log(line);

  if (!state.blocked) {
    console.log('  OPEN — stages 3 to 6 may run.');
    if (state.resolvedCount) console.log(`  ${state.resolvedCount} question(s) settled.`);
    state.advisories.forEach((a) => console.log(`\n  WARNING, knowledge at risk: ${a}`));
    console.log(`${line}\n`);
    return;
  }

  console.log('  CLOSED — stages 3 to 6 must not be generated.\n');
  console.log('  Reasons:');
  state.reasons.forEach((r, i) => console.log(`    ${i + 1}. ${r}`));

  if (state.pending.length) {
    console.log('\n  Pending questions:');
    for (const q of state.pending) {
      console.log(`    - [${q.id}] (risk ${q.risk || 'n/a'}) ${q.question}`);
    }
  }

  state.advisories.forEach((a) => console.log(`\n  WARNING, knowledge at risk: ${a}`));

  console.log('\n  To unlock, do ONE of:');
  console.log('    (1) BA/PO answers -> record it in section 7 under "Phản hồi chính thức",');
  console.log('        set status to Confirmed.');
  console.log('    (2) Record an explicit business decision in section 8.');
  console.log(`    File: ${state.knowledgePath}`);
  console.log('\n  Telling the agent to "just continue" does NOT open this gate.');
  console.log('  Test cases built on unsettled rules are hallucinations.');
  if (lockPath) console.log(`\n  Lock: ${path.relative(PATHS.ROOT, lockPath)}`);
  console.log(`${line}\n`);
}

// ───────────────────────────── CLI ─────────────────────────────

function resolveSlugs(arg) {
  if (arg && !arg.startsWith('--')) return [arg];
  const all = listTaskSlugs();
  if (all.length === 0) {
    console.log('No tasks in OUTPUT/ — nothing to check.');
    process.exit(0);
  }
  return all;
}

function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] && !args[0].startsWith('--') ? args[0] : 'check';
  const slugArg = args.find((a, i) => i > 0 && !a.startsWith('--'));
  const asJson = args.includes('--json');

  const slugs = resolveSlugs(slugArg);
  let worstExit = 0;
  const payload = [];

  for (const slug of slugs) {
    const state = evaluate(slug);
    const lockPath = writeLock(state);

    if (cmd === 'audit') {
      const a = audit(slug);
      payload.push({ ...state, audit: a });
      if (!asJson) {
        if (a.violations.length) {
          console.log(`\nBYPASS DETECTED [${slug}] — ${a.violations.length} file(s) written while locked:`);
          a.violations.forEach((v) => console.log(`   - ${v.file}  (written ${v.createdAt}, locked since ${a.lockedAt})`));
          console.log('   These rest on unsettled rules. Review or regenerate them once the gate opens.');
        } else if (a.hadLock) {
          console.log(`[${slug}] Locked, and no deliverable was written past the lock.`);
        } else {
          console.log(`[${slug}] No active lock.`);
        }
      }
      if (a.violations.length) worstExit = Math.max(worstExit, 2);
      continue;
    }

    payload.push(state);
    if (!asJson) printState(state, lockPath);
    if (state.blocked) worstExit = Math.max(worstExit, 1);
  }

  if (asJson) console.log(JSON.stringify(slugs.length === 1 ? payload[0] : payload, null, 2));
  process.exit(worstExit);
}

if (require.main === module) main();

module.exports = { evaluate, audit, LOCKED_DELIVERABLES };

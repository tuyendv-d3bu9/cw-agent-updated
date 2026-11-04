#!/usr/bin/env node
/**
 * gate.js — The ASK gate (QA_STANDARD §1): blocks stages 03-06 while any
 * question is unsettled. Fail-closed: whatever cannot be read keeps it shut.
 *
 *   evaluate(slug)     Gate state: blocked, reasons, pending questions, advisories.
 *   audit(slug)        Locked deliverables written while the gate was closed.
 *   isLockedPath(rel)  Is a path inside OUTPUT/<slug>/ a stage 03-06 deliverable?
 *   writeLock(state)   Sync `_gate.lock` and append to the `_gate.log` evidence trail.
 *
 * Rules (QA_STANDARD §1, §9.3-§9.5):
 *   - 02 missing ⇒ closed. 02 meta line unreadable ⇒ closed. 02 verdict FIX ⇒ closed.
 *   - A question is settled only by: status Confirmed with a non-empty
 *     "Phản hồi chính thức", status Rejected, or a §8 decision with approver + date.
 *   - Every row of knowledge §7 counts (any ID family), and every MR of 02 §3
 *     must be settled IN KNOWLEDGE, matched by ID *and* question text — an old
 *     run's MR-04 with different wording does not settle today's MR-04.
 *   - 02 says ASK but every one of its MRs is settled in knowledge ⇒ open
 *     (stale verdict), with an advisory.
 *
 * Usage:
 *   gate.js check [slug] [--json]   Exit 0 = open, 1 = closed
 *   gate.js audit [slug]            Exit 2 when a bypass is detected (read-only)
 *   gate.js explain [slug]          List the pending questions
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, listTaskSlugs } = require('../lib/paths');
const S = require('../lib/schema');

/** Kept for callers that list the stage files; `isLockedPath` is the real rule. */
const LOCKED_DELIVERABLES = [
  '03_viewpoint_report.md',
  '04_test_idea_report.md',
  '05_test_case_spec.md',
  '05_test_blueprint.json',
  '06_coverage_review.md',
];

/** Any stage 03-06 file name (case-insensitive: macOS does not distinguish). */
const LOCKED_NAME = /^0[3-6][a-z]?_/i;
const LOCK_FILE = '_gate.lock';
const LOG_FILE = '_gate.log';

const STALE_NOTE =
  'Mọi MR của 02 đã chốt trong knowledge — sửa dòng meta của 02 thành Verdict: PASS (không cần chạy lại Chặng 2). ' +
  'Chạy lại Chặng 01 để nâng MR đã chốt thành BR và cập nhật §9.';

/** `rel` is relative to OUTPUT/<slug>/. Stage 03-06 files, plus anything under testcases/. */
function isLockedPath(rel) {
  const parts = String(rel).split(/[\\/]+/).filter(Boolean);
  if (parts.length === 0) return false;
  if (parts[0].toLowerCase() === 'testcases' && parts.length > 1) return true;
  return parts.length === 1 && LOCKED_NAME.test(parts[0]);
}

// ───────────────────────────── Evaluation ─────────────────────────────

function evaluate(slug) {
  const rel = (p) => path.relative(PATHS.ROOT, p);
  const k = S.readKnowledge(slug);
  const p02 = path.join(taskDir(slug), '02_missing_rule_report.md');
  const has02 = fs.existsSync(p02);
  const text02 = has02 ? fs.readFileSync(p02, 'utf-8') : null;
  const verdict = has02 ? S.readVerdict(text02) : null;

  const reasons = [];
  const advisories = [];
  const pending = [];
  const seen = new Set();
  const addPending = (q, source) => {
    const key = `${q.id}|${S.questionKey(q.question)}`;
    if (seen.has(key)) return;
    seen.add(key);
    // Nói rõ VÌ SAO chưa tính là đã chốt — agent cần biết phải hỏi người dùng điều gì.
    let why = '';
    if (q.status === 'Confirmed' && q.answer && !q.resolved) {
      why = S.isAiName(q.answeredBy) ? ' — người trả lời là AI/agent, phải là BA/PO' : ' — thiếu Người trả lời hoặc Ngày (hỏi người dùng: ai trả lời, hôm nào)';
    } else if (q.status === 'Confirmed' && !q.answer) why = ' — Confirmed nhưng ô Phản hồi chính thức trống';
    else if (q.status === 'Rejected' && !q.resolved) why = ' — Rejected phải có lý do hoặc người quyết định';
    else if (q.status === 'TREO' && q.answer && !S.isBlank(q.answer)) {
      why = ` — ${q.answeredBy || 'BA/PO'} đã trả lời${q.date ? ` ngày ${q.date}` : ''} nhưng chưa đủ để chốt: "${String(q.answer).slice(0, 80)}" — hỏi lại đúng giá trị còn thiếu`;
    }
    pending.push({ id: q.id, question: q.question || '(no question recorded)', risk: q.w || '', state: (q.statusRaw || '(blank)') + why, source });
  };

  // 1. Every row of knowledge §7, whatever its ID family (Q-01, OQ-01, MR-01 …).
  let resolvedCount = 0;
  for (const q of k.questions) {
    if (S.resolvedInKnowledge(q, k)) resolvedCount++;
    else addPending(q, 'knowledge §7');
  }

  // 2. Every MR of 02 must be settled in knowledge.
  const mr02 = has02 ? S.read02Questions(text02) : [];
  const unsettled02 = mr02.filter((q) => !S.resolvedInKnowledge(q, k));
  for (const q of unsettled02) {
    const inK = k.questions.some((r) => S.sameQuestion(r, q));
    addPending({ ...q, statusRaw: inK ? q.statusRaw : `${q.statusRaw || 'New'} — not in knowledge` }, '02 §3');
  }
  const answeredOnlyIn02 = unsettled02.filter((q) => q.resolved);

  let phase = 'stage-2-done';
  if (!has02) {
    phase = 'pre-stage-2';
    reasons.push(`${rel(p02)} does not exist — stage 2 must run before stages 3-6 (fail-closed)`);
  } else if (!verdict) {
    reasons.push(`Cannot read the verdict of ${rel(p02)}: line 2 must be "Owner: … · Verdict: PASS|FIX|ASK" (QA_STANDARD §7, fail-closed)`);
  } else if (verdict === 'FIX') {
    reasons.push(`Stage 2 returned \`Verdict: FIX\` in ${rel(p02)} — fix and re-run stage 2 first`);
  } else if (verdict === 'ASK') {
    if (mr02.length > 0 && unsettled02.length === 0 && pending.length === 0) {
      advisories.push(STALE_NOTE);
    } else {
      reasons.push(`Stage 2 returned \`Verdict: ASK\` in ${rel(p02)}`);
    }
  }

  // Template slots (`<số ngày>`) in an answer or decision are not an answer.
  const notConcrete = [
    ...k.questions.filter((q) => q.placeholder).map((q) => q.id),
    ...k.decisions.filter((d) => d.placeholder).flatMap((d) => d.related),
  ];
  if (notConcrete.length) {
    advisories.push(`${[...new Set(notConcrete)].join(', ')}: ${S.NOT_CONCRETE_HINT}`);
  }

  if (pending.length) {
    reasons.push(`${pending.length} question(s) unsettled in ${rel(k.path)} (${pending.map((q) => q.id).join(', ')})`);
  }
  if (answeredOnlyIn02.length) {
    reasons.push(
      `${answeredOnlyIn02.map((q) => q.id).join(', ')} answered only in ${rel(p02)} — OUTPUT/ is disposable; ` +
        `record them in knowledge (npm run knowledge:sync -- ${slug} --write)`
    );
  }
  if (!k.exists && (mr02.length || (verdict && verdict !== 'PASS'))) {
    reasons.push(`No knowledge file at ${rel(k.path)} to record answers in`);
  }

  // Advisory: MR codes mentioned in 02 outside its question table and absent from knowledge.
  if (has02) {
    const known = new Set([...k.questions.map((q) => q.id), ...mr02.map((q) => q.id)]);
    const stray = S.idsIn(text02, 'MR').filter((id) => !known.has(id));
    if (stray.length) {
      advisories.push(`${stray.join(', ')} appear in ${rel(p02)} but in neither its §3 question table nor ${rel(k.path)} — the gate cannot track them.`);
    }
  }

  return {
    slug,
    phase,
    verdict02: verdict,
    blocked: reasons.length > 0,
    reasons,
    advisories,
    pending,
    resolvedCount,
    knowledgePath: rel(k.path),
  };
}

// ───────────────────────────── Lock & evidence ─────────────────────────────

function readLog(dir) {
  const p = path.join(dir, LOG_FILE);
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, 'utf-8').split('\n').filter(Boolean).map((l) => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);
}

function appendLog(dir, entry) {
  fs.appendFileSync(path.join(dir, LOG_FILE), JSON.stringify(entry) + '\n', 'utf-8');
}

/**
 * Writes `_gate.lock` while closed and removes it when open. Every transition is
 * appended to `_gate.log`, which is never rewritten — `audit` reads it, so
 * opening the gate later does not erase evidence of a write made while closed.
 */
function writeLock(state) {
  const dir = taskDir(state.slug);
  if (!fs.existsSync(dir)) return null;
  const lockPath = path.join(dir, LOCK_FILE);
  const log = readLog(dir);
  const last = log[log.length - 1];
  const now = new Date().toISOString();

  if (!state.blocked) {
    if (last && last.event === 'locked') appendLog(dir, { event: 'unlocked', at: now });
    if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
    return null;
  }

  let lockedAt = now;
  if (fs.existsSync(lockPath)) {
    try { lockedAt = JSON.parse(fs.readFileSync(lockPath, 'utf-8')).lockedAt || lockedAt; } catch { /* corrupt: fresh timestamp */ }
  }
  if (!last || last.event !== 'locked') appendLog(dir, { event: 'locked', at: lockedAt, reasons: state.reasons });

  fs.writeFileSync(
    lockPath,
    JSON.stringify(
      {
        slug: state.slug,
        lockedAt,
        updatedAt: now,
        reasons: state.reasons,
        pending: state.pending,
        locked: 'OUTPUT/<slug>/0[3-6]*_* and OUTPUT/<slug>/testcases/**',
        unlock:
          'Answer in knowledge §7 ("Phản hồi chính thức" filled, status Confirmed/Rejected) ' +
          'OR record a decision with approver + date in §8 of ' + state.knowledgePath,
      },
      null,
      2
    ),
    'utf-8'
  );
  return lockPath;
}

/** Every locked file under the task dir, relative to it. */
function lockedFiles(dir) {
  const out = [];
  const walk = (d, relBase) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const rel = relBase ? `${relBase}/${e.name}` : e.name;
      if (e.isDirectory()) { if (e.name.toLowerCase() === 'testcases') walk(path.join(d, e.name), rel); continue; }
      if (isLockedPath(rel)) out.push(rel);
    }
  };
  walk(dir, '');
  return out;
}

/**
 * Layer 3, read-only: locked files whose mtime falls inside a locked interval
 * recorded in `_gate.log` (or the current `_gate.lock` when there is no log).
 * Never deletes the lock or the log.
 */
function audit(slug) {
  const dir = taskDir(slug);
  const lockPath = path.join(dir, LOCK_FILE);
  const intervals = [];
  let open = null;
  for (const e of readLog(dir)) {
    if (e.event === 'locked' && !open) open = new Date(e.at);
    else if (e.event === 'unlocked' && open) { intervals.push([open, new Date(e.at)]); open = null; }
  }
  if (open) intervals.push([open, null]);

  let corrupt = false;
  const hadLock = fs.existsSync(lockPath);
  if (hadLock) {
    try {
      const at = new Date(JSON.parse(fs.readFileSync(lockPath, 'utf-8')).lockedAt);
      if (isNaN(at)) throw new Error('bad date');
      if (!intervals.some(([s, e]) => e === null && s <= at)) intervals.push([at, null]);
    } catch { corrupt = true; }
  }
  if (intervals.length === 0) return { violations: [], hadLock, corrupt };

  const violations = [];
  for (const rel of lockedFiles(dir)) {
    const mtime = fs.statSync(path.join(dir, rel)).mtime;
    const hit = intervals.find(([s, e]) => mtime >= s && (e === null || mtime <= e));
    if (hit) violations.push({ file: rel, createdAt: mtime.toISOString(), lockedAt: hit[0].toISOString() });
  }
  return { violations, hadLock: true, corrupt, lockedAt: intervals[intervals.length - 1][0].toISOString() };
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
    state.advisories.forEach((a) => console.log(`\n  NOTE: ${a}`));
    console.log(`${line}\n`);
    return;
  }

  console.log('  CLOSED — stages 3 to 6 must not be generated.\n');
  console.log('  Reasons:');
  state.reasons.forEach((r, i) => console.log(`    ${i + 1}. ${r}`));

  if (state.pending.length) {
    console.log('\n  Pending questions:');
    for (const q of state.pending) console.log(`    - [${q.id}] (${q.state}) ${q.question}`);
  }
  state.advisories.forEach((a) => console.log(`\n  NOTE: ${a}`));

  console.log('\n  To unlock, for EACH question do one of:');
  console.log('    (1) BA/PO answers -> knowledge §7: fill "Phản hồi chính thức", "Người trả lời",');
  console.log('        "Ngày", set status Confirmed (or Rejected).');
  console.log('    (2) A decision in knowledge §8 with "Người phê duyệt" and "Ngày chốt".');
  console.log(`    File: ${state.knowledgePath}`);
  console.log('\n  Telling the agent to "just continue" does NOT open this gate.');
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
  const cmd = args[0] && !args[0].startsWith('--') && ['check', 'audit', 'explain'].includes(args[0]) ? args[0] : 'check';
  const rest = args[0] === cmd ? args.slice(1) : args;
  const slugArg = rest.find((a) => !a.startsWith('--'));
  const asJson = args.includes('--json');

  const slugs = resolveSlugs(slugArg);
  let worstExit = 0;
  const payload = [];

  for (const slug of slugs) {
    const state = evaluate(slug);

    if (cmd === 'audit') {
      // Read-only: auditing must never move or remove the evidence it audits.
      const a = audit(slug);
      payload.push({ ...state, audit: a });
      if (!asJson) {
        if (a.violations.length) {
          console.log(`\nBYPASS DETECTED [${slug}] — ${a.violations.length} file(s) written while locked:`);
          a.violations.forEach((v) => console.log(`   - ${v.file}  (written ${v.createdAt}, locked since ${v.lockedAt})`));
          console.log('   These rest on unsettled rules. Review or regenerate them once the gate opens.');
        } else if (a.hadLock) {
          console.log(`[${slug}] Lock history found, and no deliverable was written while locked.`);
        } else {
          console.log(`[${slug}] No lock history.`);
        }
      }
      if (a.violations.length) worstExit = Math.max(worstExit, 2);
      continue;
    }

    const lockPath = writeLock(state);
    payload.push(state);
    if (!asJson) printState(state, lockPath);
    if (state.blocked) worstExit = Math.max(worstExit, 1);
  }

  if (asJson) console.log(JSON.stringify(slugs.length === 1 ? payload[0] : payload, null, 2));
  process.exit(worstExit);
}

if (require.main === module) main();

module.exports = { STALE_NOTE, evaluate, audit, writeLock, isLockedPath, LOCKED_DELIVERABLES, LOCK_FILE, LOG_FILE };

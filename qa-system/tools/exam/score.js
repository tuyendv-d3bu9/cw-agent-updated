#!/usr/bin/env node
/**
 * score.js — Set or update one instructor score (I1–I3), or resolve an integrity flag.
 *
 *   npm run exam:score -- --exam <id> --student <id> --criterion I1 --points 8 --level "6-8" \
 *        --evidence <path> [--evidence <path>] --comment "<text>" --reviewer <name>
 *   npm run exam:score -- --exam <id> --student <id> --resolve-flag <flag-id> --reviewer <name>
 *
 * Writes GRADING/instructor/<id>.json (JSON, validated: level + evidence for every score),
 * then re-renders that student's result (pure recompute, no re-grading) and summary.csv.
 * Test-only: --now <iso>.
 */

const fs = require('fs');
const C = require('./lib/common');
const store = require('./lib/store');
const { validateInstructor } = require('./lib/result');

function parseArgs(argv) {
  const a = { evidence: [] };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const v = () => { const x = argv[++i]; if (x === undefined) throw new Error(`${k} needs a value`); return x; };
    if (k === '--exam') a.exam = v();
    else if (k === '--student') a.student = v();
    else if (k === '--criterion') a.criterion = v();
    else if (k === '--points') a.points = Number(v());
    else if (k === '--level') a.level = v();
    else if (k === '--evidence') a.evidence.push(v());
    else if (k === '--comment') a.comment = v();
    else if (k === '--reviewer') a.reviewer = v();
    else if (k === '--resolve-flag') a.flag = v();
    else if (k === '--now') a.now = v();
    else throw new Error(`Unknown argument ${k}`);
  }
  if (!a.exam || !a.student || !a.reviewer) throw new Error('--exam, --student and --reviewer are required');
  if (!a.flag && (!['I1', 'I2', 'I3'].includes(a.criterion) || !Number.isFinite(a.points) || !a.level || !a.comment || !a.evidence.length)) {
    throw new Error('Scoring needs --criterion I1|I2|I3, --points, --level, at least one --evidence and --comment');
  }
  return a;
}

function main(argv) {
  const a = parseArgs(argv);
  const repo = store.repoRoot();
  const { cfg, roster } = C.loadExam(a.exam);
  if (!roster.students.some((s) => s.student_id === a.student)) throw new Error(`Student "${a.student}" is not in the roster`);
  const p = store.gradingPath(repo, 'instructor', `${a.student}.json`);
  const data = fs.existsSync(p) ? C.readJson(p)
    : { schema_version: '1.0.0', exam_id: cfg.exam_id, student_id: a.student, criteria: {}, resolved_flags: [] };
  const now = new Date(a.now || Date.now()).toISOString().replace(/\.\d{3}Z$/, 'Z');

  if (a.flag) {
    const r = store.readResult(repo, a.student);
    if (!r || !r.integrity_flags.some((f) => f.id === a.flag)) throw new Error(`No integrity flag "${a.flag}" in the result of ${a.student}`);
    if (!data.resolved_flags.includes(a.flag)) data.resolved_flags.push(a.flag);
    data.resolved_flags.sort();
  } else {
    data.criteria[a.criterion] = { points: a.points, level: a.level, evidence: a.evidence, comment: a.comment, reviewer: a.reviewer, scored_at: now };
    const ordered = {};
    for (const k of ['I1', 'I2', 'I3']) if (data.criteria[k]) ordered[k] = data.criteria[k];
    data.criteria = ordered;
  }
  const errs = validateInstructor(data);
  if (errs.length) throw new Error(`Rejected: ${errs.join('; ')}`);
  C.writeFileSafe(p, C.stableJson(data));
  const r = store.refresh(repo, cfg, a.student);
  store.rebuildSummary(repo);
  console.log(`${a.student}: ${a.flag ? `flag ${a.flag} resolved` : `${a.criterion} = ${a.points}`} · status ${r.status} · total ${r.total.score === null ? 'pending' : r.total.score}`);
  return 0;
}

if (require.main === module) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(`exam:score failed: ${e.message}`); process.exitCode = 1; }
}

module.exports = { main, parseArgs };

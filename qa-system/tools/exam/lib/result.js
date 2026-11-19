/**
 * result.js — Result contract (plan §3): assembly and the calculation rules of §3.2 / §5.3.
 *
 *   baseResult(input)          Result skeleton for one student (automated part filled, instructor pending).
 *   finalize(result, instr)    PURE: recompute instructor block, totals, flags, pass conditions, status,
 *                              missing requirements and feedback from the stored result + instructor file.
 *   validateInstructor(data)   Schema + rubric validation of GRADING/instructor/<id>.json.
 *
 * Rules: null is never 0; a criterion is null while any of its checks is pending/not graded;
 * totals exist only when every component exists and no integrity flag is open.
 */

const C = require('./common');
const { validate } = require('./json-schema');
const { MAX } = require('./checks');

const AUTO = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'];
const MANUAL = { I1: 10, I2: 10, I3: 10 };
const LEVELS = { I1: { '9-10': [9, 10], '6-8': [6, 8], '3-5': [3, 5], '0-2': [0, 2] }, I2: { '9-10': [9, 10], '6-8': [6, 8], '3-5': [3, 5], '0-2': [0, 2] } };

function emptyCriteria() {
  const o = {};
  for (const a of AUTO) o[a] = { max: MAX[a], points: null, checks: [] };
  return o;
}

function emptyManual() {
  const o = {};
  for (const [k, max] of Object.entries(MANUAL)) o[k] = { max, points: null, level: null, evidence: [], comment: null };
  return o;
}

/**
 * input: { cfg, studentId, branch, sha, starterSha, gradedAt, override, preflight, criteria (or null), status hint,
 *          flags, evidenceRoot }
 */
function baseResult(i) {
  const pf = i.preflight || { status: 'NOT_RUN', blocking: [], gradable: [], warnings: [] };
  return {
    result_schema_version: C.RESULT_SCHEMA_VERSION,
    exam_id: i.cfg.exam_id,
    student_id: i.studentId,
    branch: i.branch || null,
    submission_sha: i.sha || null,
    starter_commit: i.starterSha,
    grader_version: C.GRADER_VERSION,
    rubric_version: i.cfg.rubric_version,
    graded_at: i.gradedAt,
    override: i.override || null,
    preflight: { status: pf.status, blocking: pf.blocking, gradable: pf.gradable, warnings: pf.warnings },
    automated: { status: i.criteria ? 'PARTIAL' : 'NOT_GRADED', score: null, max: 70, criteria: i.criteria || emptyCriteria() },
    instructor: { status: 'PENDING', score: null, max: 30, reviewer: null, reviewed_at: null, criteria: emptyManual() },
    total: { score: null, max: 100 },
    status: i.studentStatus || 'PENDING',
    pass_conditions: { total_ge_60: null, pipeline_minimum: null, defense_ge_4: null },
    integrity_flags: (i.flags || []).map((f) => ({ code: f.code, id: f.id, path: f.path, detail: f.detail, state: 'open' })),
    missing_requirements: [],
    feedback: [],
    evidence_root: i.evidenceRoot || null,
  };
}

// ───────────────────────────── Feedback templates (S5) ─────────────────────────────

const ADVICE = {
  A1a: 'Run npm run agent:check and fix every error and warning it lists for agents, skills, system map and workflow.',
  A1b: 'Run npm test on your branch: the starter test suite must stay green with your changes.',
  A1c: 'Restore the protected framework files or baseline tests you removed; extend, never delete.',
  A2a: 'Keep T1 changes inside the layers allowed for the decision class you declared, and list only files you really changed.',
  A2b: 'Each anchor N1-N7 must be done with a matching file change, or n/a with a reason; the anchors required by your class must be done.',
  A2c: 'The changed skill needs frontmatter (name, description), a ## Format output section and an acceptance gate section.',
  A2d: 'Your lint must accept a test case with a valid Risk Ref and reject one without it.',
  A3a: 'Build the new agent from qa-system/templates/AGENT.md with all its sections and no template placeholders left.',
  A3b: 'AGENT.md of the new agent needs a Human-Final section and a Knowledge section.',
  A3c: 'Register the new agent in all five places: system map specialized_agents and routing_table, WORKFLOW.md, qa-lead AGENT.md, agent-doctor.js.',
  A3d: 'Add the new agent to PIPELINE_DEPENDENCIES so npm run agent:check -- --impact <agent> lists its consumers.',
  A3e: 'Commit an example output with the next unused prefix that contains every heading your skill declares under ## Format output.',
  A4a: 'Produce stages 01-06 under OUTPUT/<task>/ with the official file names.',
  A4b: 'Run npm run lint -- <task> and fix the errors it reports.',
  A4c: 'Do not write stages 03-06 on top of open ASK questions: get an answer or record a proceed decision first.',
  A5a: 'Copy every BR/FD/AF quote verbatim from the INPUT document you cite.',
  A5b: 'Tag every test case with Rule# ids that exist in 01 or knowledge.',
  A5c: 'Every number in a rule or test case must come from a source; otherwise label it and ask.',
  A5d: 'A domain pack is a checklist, not a source: never cite [DOMAIN] as the source of a BR/FD/AF.',
  A6a: 'Add node:test cases for every tool you changed and keep them passing.',
  A6b: 'Re-check the T1/T2 requirements in the brief; hidden tests exercise them directly.',
  A6c: 'Your tools must give the same output on the same input (no timestamps or random values).',
};

function feedbackFor(result) {
  const fb = [];
  if (result.preflight.status === 'INVALID') {
    fb.push({ criterion: 'preflight', text: 'Fix the blocking errors; grading did not run' });
    return fb;
  }
  if (result.preflight.status === 'NOT_RUN') return fb;
  for (const g of result.preflight.gradable) fb.push({ criterion: g.code, text: g.fix ? `${g.message} — ${g.fix}` : g.message });
  for (const a of AUTO) {
    for (const c of result.automated.criteria[a].checks) {
      if (c.state === 'PASSED') continue;
      if (c.state === 'PENDING_HUMAN_REVIEW' || c.state === 'NOT_GRADED') { fb.push({ criterion: c.id, text: 'Pending review by the instructor; no points deducted yet' }); continue; }
      // A4d / A5e messages are built only from counts, categories and fixed wording (never benchmark content).
      const text = c.id === 'A4d' || c.id === 'A5e' ? c.message : `${ADVICE[c.id] || 'See the check message.'}${c.id === 'A4b' ? ' (details: lint.txt)' : ''}`;
      fb.push({ criterion: c.id, text });
    }
  }
  return fb;
}

function missingFor(result, cfg) {
  const out = [];
  const dir = `OUTPUT/${cfg.task_slug}/`;
  for (const g of result.preflight.gradable) {
    if ((g.code === 'G-01' || g.code === 'G-02') && g.path.startsWith(dir)) {
      const file = g.path.slice(dir.length);
      const k = Object.keys(C.STAGE_FILES).find((x) => C.STAGE_FILES[x] === file);
      out.push(`${C.STAGE_LABEL[k] || `Stage ${k}`} (${g.path})`);
    }
    if (g.code === 'G-04' && g.path === 't2_new_agent.example_output') out.push('T2 example output');
    if (g.code === 'G-06') out.push(g.path);
  }
  return out;
}

// ───────────────────────────── Instructor file ─────────────────────────────

function validateInstructor(data) {
  const errs = validate(C.loadSchema('instructor'), data).map((e) => `${e.path || '/'} ${e.message}`);
  for (const [k, v] of Object.entries((data && data.criteria) || {})) {
    if (!MANUAL[k] || !v || typeof v !== 'object') continue;
    if (typeof v.points === 'number' && v.points > MANUAL[k]) errs.push(`/criteria/${k}/points must be <= ${MANUAL[k]}`);
    if (Array.isArray(v.evidence) && v.evidence.length === 0) errs.push(`/criteria/${k}/evidence needs at least one file`);
    if (typeof v.level === 'string' && typeof v.points === 'number') {
      if (LEVELS[k]) {
        const r = LEVELS[k][v.level];
        if (!r) errs.push(`/criteria/${k}/level must be one of ${Object.keys(LEVELS[k]).join(', ')}`);
        else if (v.points < r[0] || v.points > r[1]) errs.push(`/criteria/${k}/points ${v.points} is outside level ${v.level}`);
      } else {
        const m = v.level.match(/^(\d{1,2})\/10$/);
        if (!m || Number(m[1]) > 10) errs.push(`/criteria/${k}/level must be "<n>/10" (5 defense items × 0/1/2)`);
        else if (Number(m[1]) !== v.points) errs.push(`/criteria/${k}/points must equal the level (${m[1]})`);
      }
    }
  }
  return errs;
}

// ───────────────────────────── Finalize (pure) ─────────────────────────────

function sum(xs) { return C.round2(xs.reduce((s, x) => s + x, 0)); }

function finalize(stored, instr, cfg) {
  const r = JSON.parse(JSON.stringify(stored));
  const terminal = r.status === 'NO_SUBMISSION' || r.preflight.status === 'INVALID';

  // Automated.
  if (r.automated.status !== 'NOT_GRADED') {
    for (const a of AUTO) {
      const cr = r.automated.criteria[a];
      cr.points = cr.checks.length && cr.checks.every((c) => c.points !== null) ? sum(cr.checks.map((c) => c.points)) : null;
    }
    const pts = AUTO.map((a) => r.automated.criteria[a].points);
    r.automated.score = pts.every((p) => p !== null) ? sum(pts) : null;
    r.automated.status = r.automated.score === null ? 'PARTIAL' : 'GRADED';
  }

  // Instructor.
  r.instructor = { status: r.status === 'NO_SUBMISSION' ? 'NOT_APPLICABLE' : 'PENDING', score: null, max: 30, reviewer: null, reviewed_at: null, criteria: emptyManual() };
  const resolved = new Set((instr && instr.resolved_flags) || []);
  if (instr && r.status !== 'NO_SUBMISSION') {
    const reviewers = new Set();
    const times = [];
    for (const k of Object.keys(MANUAL)) {
      const v = instr.criteria[k];
      if (!v) continue;
      r.instructor.criteria[k] = { max: MANUAL[k], points: v.points, level: v.level, evidence: [...v.evidence], comment: v.comment };
      reviewers.add(v.reviewer);
      times.push(v.scored_at);
    }
    const ip = Object.keys(MANUAL).map((k) => r.instructor.criteria[k].points);
    if (reviewers.size) r.instructor.reviewer = [...reviewers].sort().join(', ');
    if (ip.every((p) => p !== null)) {
      r.instructor.score = sum(ip);
      r.instructor.status = 'REVIEWED';
      r.instructor.reviewed_at = times.sort().pop();
    }
  }

  // Integrity flags.
  for (const f of r.integrity_flags) f.state = resolved.has(f.id) ? 'resolved' : 'open';
  const openFlags = r.integrity_flags.some((f) => f.state === 'open');

  // Total + pass conditions.
  r.total = { score: null, max: 100 };
  r.pass_conditions = { total_ge_60: null, pipeline_minimum: null, defense_ge_4: null };
  if (!terminal) {
    if (r.automated.score !== null && r.instructor.score !== null && !openFlags) r.total.score = sum([r.automated.score, r.instructor.score]);
    r.pass_conditions.total_ge_60 = r.total.score === null ? null : r.total.score >= 60;
    const dir = `OUTPUT/${cfg.task_slug}/`;
    const required = ['01', '02', '05', '06'].map((k) => `${dir}${C.STAGE_FILES[k]}`);
    const filesMissing = r.preflight.gradable.some((g) => (g.code === 'G-01' || g.code === 'G-02') && required.includes(g.path));
    const a4 = r.automated.criteria.A4.points;
    const a5a = (r.automated.criteria.A5.checks.find((c) => c.id === 'A5a') || {}).points;
    if (filesMissing) r.pass_conditions.pipeline_minimum = false;
    else if (a4 === null || a5a === null || a5a === undefined) r.pass_conditions.pipeline_minimum = null;
    else r.pass_conditions.pipeline_minimum = a4 >= 7 && a5a >= 2;
    const i3 = r.instructor.criteria.I3.points;
    r.pass_conditions.defense_ge_4 = i3 === null ? null : i3 >= 4;

    const pc = Object.values(r.pass_conditions);
    if (r.total.score !== null) r.status = pc.every((x) => x === true) ? 'PASS' : 'FAIL';
    else r.status = r.instructor.status === 'REVIEWED' ? 'NEEDS_HUMAN_REVIEW' : 'PENDING';
  }

  r.missing_requirements = terminal ? [] : missingFor(r, cfg);
  r.feedback = r.status === 'NO_SUBMISSION' ? [{ criterion: 'submission', text: 'No submission branch was found at the deadline' }] : feedbackFor(r);
  return r;
}

function validateResult(r) {
  return validate(C.loadSchema('result'), r);
}

module.exports = { baseResult, finalize, validateInstructor, validateResult, emptyCriteria, AUTO, MANUAL, LEVELS, ADVICE };

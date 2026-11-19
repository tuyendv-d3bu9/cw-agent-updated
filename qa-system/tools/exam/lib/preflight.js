/**
 * preflight.js — Deterministic, read-only submission validation (plan §4).
 *
 *   runPreflight(input) → { status, blocking[], gradable[], warnings[], flags[], manifest }
 *
 * Blocking (B-01…B-05) ⇒ INVALID_SUBMISSION, no automated grading.
 * Gradable gaps (G-01…G-08) ⇒ grading continues; the affected checks score 0 with a message.
 * Never repairs, renames or creates student files.
 */

const path = require('path');
const { validate } = require('./json-schema');
const C = require('./common');

/** Anchor → files whose change proves the anchor (governance §4). `agent` = T1 agent folder. */
function anchorFiles(agent) {
  return {
    N1: (p) => p.startsWith(`${agent}/skills/`) && p.endsWith('.md'),
    N2: (p) => p === `${agent}/AGENT.md`,
    N3: (p) => p === 'qa-system/workflows/WORKFLOW.md',
    N4: (p) => p === 'knowledge/_system_map.json',
    N5: (p) => p === 'qa-system/qa-lead/AGENT.md',
    N6: (p) => p === 'qa-system/tools/system/agent-doctor.js',
    N7: (p) => p === 'qa-system/tools/system/lint-deliverables.js' || p === 'qa-system/tools/lib/schema.js',
  };
}
/** Anchors marked ✅ (always required) for each decision class (governance §4 table). */
const REQUIRED_ANCHORS = { A: ['N1', 'N2', 'N3', 'N4', 'N5'], B: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6'], C: ['N1'] };
const ANCHORS = ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7'];

/** Tool files whose change needs tests (G-05, A6a): JS under qa-system/tools/, except tests and the exam engine. */
const isToolFile = (p) => p.startsWith('qa-system/tools/') && p.endsWith('.js') &&
  !p.startsWith('qa-system/tools/__tests__/') && !p.startsWith('qa-system/tools/exam/');
const isTestFile = (p) => /^qa-system\/tools\/__tests__\/[^/]+\.test\.js$/.test(p) && !/\/exam-[^/]*\.test\.js$/.test(p);

/** Imperative text aimed at graders or agents (plan §6.3 S3): flagged, never followed. */
const INJECTION = [
  /\bignore\s+(all\s+|any\s+)?(the\s+)?(previous|prior|above|earlier)\s+(instructions|rules|prompts?)\b/i,
  /\b(grader|grading\s+(agent|script|tool)|evaluator|examiner|reviewer|ai\s+assistant|language\s+model)\b[^\n]{0,60}\b(award|give|assign|set|mark)\b[^\n]{0,40}\b(full|maximum|max|100|perfect)\b/i,
  /\b(award|give|assign)\s+(me|this\s+(student|submission))\s+(full|maximum|max|perfect)\s+(marks|points|score)\b/i,
  /\bsystem\s+prompt\s*:/i,
];

function collectDeclaredPaths(m) {
  const out = [];
  const add = (label, v) => { if (typeof v === 'string') out.push({ label, value: v }); };
  const t1 = m.t1_customized_agent || {};
  const t2 = m.t2_new_agent || {};
  const t3 = m.t3_pipeline || {};
  add('t1_customized_agent.agent_folder', t1.agent_folder);
  (t1.changed_files || []).forEach((v, i) => add(`t1_customized_agent.changed_files.${i}`, v));
  (t1.tests_added || []).forEach((v, i) => add(`t1_customized_agent.tests_added.${i}`, v));
  add('t2_new_agent.agent_folder', t2.agent_folder);
  add('t2_new_agent.agent_file', t2.agent_file);
  (t2.skills || []).forEach((v, i) => add(`t2_new_agent.skills.${i}`, v));
  add('t2_new_agent.example_output', t2.example_output);
  (t2.registrations || []).forEach((v, i) => add(`t2_new_agent.registrations.${i}`, v));
  (t2.tests_added || []).forEach((v, i) => add(`t2_new_agent.tests_added.${i}`, v));
  add('t3_pipeline.input_dir', t3.input_dir);
  add('t3_pipeline.feature_knowledge', t3.feature_knowledge);
  add('t3_pipeline.gate_log', t3.gate_log);
  const a = t3.artifacts || {};
  for (const k of ['00', '01', '02', '03', '04', '06']) add(`t3_pipeline.artifacts.${k}`, a[k]);
  if (a['05'] && typeof a['05'] === 'object') {
    add('t3_pipeline.artifacts.05.spec', a['05'].spec);
    add('t3_pipeline.artifacts.05.blueprint', a['05'].blueprint);
    (a['05'].batches || []).forEach((v, i) => add(`t3_pipeline.artifacts.05.batches.${i}`, v));
  }
  add('evidence.decisions', (m.evidence || {}).decisions);
  add('evidence.ai_use_declaration', (m.evidence || {}).ai_use_declaration);
  return out;
}

/** Why `p` is unsafe, or null. `symlinks` = Set of posix paths that are symlinks in the submitted tree. */
function pathProblem(p, ws, symlinks) {
  if (p === '') return 'is empty';
  if (/^([\\/]|[A-Za-z]:)/.test(p)) return `Path '${p}' is absolute`;
  const segs = p.split(/[\\/]+/);
  if (segs.includes('..')) return `Path '${p}' escapes the workspace ('..')`;
  const abs = path.resolve(ws, p);
  if (abs !== ws && !abs.startsWith(ws + path.sep)) return `Path '${p}' resolves outside the workspace`;
  const clean = segs.filter((s) => s && s !== '.');
  for (let i = 1; i <= clean.length; i++) {
    const prefix = clean.slice(0, i).join('/');
    if (symlinks.has(prefix)) return `Path '${p}' ${i === clean.length ? 'is' : 'passes through'} a symlink (${prefix})`;
  }
  return null;
}

/**
 * input = {
 *   cfg, ws, rosterEntry (or null), fetchedBranch (or null),
 *   symlinks: string[]     symlinks of the submitted tree (posix, relative),
 *   tooBig: string|null    hard size limit violation,
 *   changed: Map|null      path → A/M/D/T versus the starter commit (null = unknown),
 *   gitInfo: { resolvable, ancestor, starterSha } | null,
 * }
 */
function runPreflight(input) {
  const { cfg, ws, rosterEntry, fetchedBranch, gitInfo } = input;
  const slug = cfg.task_slug;
  const symlinks = new Set(input.symlinks || []);
  const changed = input.changed || null;
  const blocking = [];
  const gradable = [];
  const warnings = [];
  const flags = [];
  const B = (code, p, message, fix) => blocking.push({ code, path: p, message, fix });
  const G = (code, p, message, fix) => gradable.push({ code, path: p, message, fix });

  // B-05 size first: an archive bomb is never read.
  if (input.tooBig) B('B-05', '.', input.tooBig, 'Remove large or generated files from the branch');

  // B-01 manifest.
  let manifest = null;
  const mPath = 'EXAM/submission.json';
  if (symlinks.has('EXAM') || symlinks.has(mPath)) {
    B('B-01', mPath, 'EXAM/submission.json is (or passes through) a symlink', 'Commit a regular file');
  } else if (!input.tooBig) {
    const text = C.readText(ws, mPath);
    if (text === null) {
      B('B-01', mPath, 'EXAM/submission.json is missing or unreadable', 'Copy EXAM/templates/submission.json to EXAM/submission.json and fill it in');
    } else {
      const buf = Buffer.from(text, 'utf8');
      try {
        if (Buffer.compare(buf, require('fs').readFileSync(path.join(ws, mPath))) !== 0) throw new Error('not valid UTF-8');
        manifest = JSON.parse(text.replace(/^﻿/, ''));
      } catch (e) {
        B('B-01', mPath, `EXAM/submission.json is not UTF-8 JSON: ${e.message}`, 'Fix the JSON syntax (run npm run exam:check)');
      }
      if (manifest !== null) {
        const errs = validate(C.submissionSchemaFor(cfg), manifest);
        if (errs.length) {
          B('B-01', mPath, `Schema-invalid: ${C.fmtErrors(errs, 8)}`, 'Fix the listed fields (schema EXAM/schema/submission.schema.json)');
        }
      }
    }
  }

  const isObj = manifest && typeof manifest === 'object' && !Array.isArray(manifest);
  if (isObj) {
    // B-02 identity.
    if (manifest.exam_id !== cfg.exam_id) B('B-02', 'exam_id', `exam_id is "${String(manifest.exam_id)}", expected "${cfg.exam_id}"`, `Set exam_id to "${cfg.exam_id}"`);
    if (rosterEntry && manifest.student_id !== rosterEntry.student_id) {
      B('B-02', 'student_id', 'student_id does not match the roster entry of this branch', `Set student_id to "${rosterEntry.student_id}"`);
    }
    if (typeof manifest.student_id === 'string' && manifest.branch !== `exams/${manifest.student_id}`) {
      B('B-02', 'branch', 'branch must be exams/<student_id>', `Set branch to "exams/${manifest.student_id}"`);
    }
    if (fetchedBranch && manifest.branch !== fetchedBranch) {
      B('B-02', 'branch', 'branch does not match the branch the submission was fetched from', `Set branch to "${fetchedBranch}"`);
    }

    // B-03 declared paths.
    for (const d of collectDeclaredPaths(manifest)) {
      const why = pathProblem(d.value, ws, symlinks);
      if (why) B('B-03', d.label, why, 'Declare a plain relative path inside the repository, without symlinks');
    }

    // B-04 commit ancestry.
    if (gitInfo) {
      if (!gitInfo.resolvable) B('B-04', 'submission_sha', 'Frozen SHA cannot be resolved', 'Contact the instructor');
      else if (!gitInfo.ancestor) B('B-04', 'starter_commit', 'The starter tag commit is not an ancestor of the submission', 'Branch from the starter tag; never rebase onto another base');
      if (gitInfo.starterSha && manifest.starter_commit !== gitInfo.starterSha) {
        B('B-04', 'starter_commit', 'starter_commit does not equal the starter tag commit', `Set starter_commit to ${gitInfo.starterSha}`);
      }
    }
  }

  // B-05 read-only paths.
  if (changed) {
    for (const prefix of C.readOnlyPrefixes(cfg)) {
      const hit = [...changed.keys()].filter((p) => p.startsWith(prefix)).sort();
      if (hit.length) {
        B('B-05', prefix, `Read-only path changed (${hit.length} file${hit.length > 1 ? 's' : ''})`, `Restore ${prefix} from the starter tag`);
        flags.push({ code: 'B-05', id: `B-05:${prefix}`, path: prefix, detail: `Read-only path modified (${hit.length} file(s))`, open: true });
      }
    }
  }

  // Undeclared symlinks are removed before grading; their targets are never read.
  for (const l of [...symlinks].sort()) warnings.push({ code: 'W-SYMLINK', path: l, message: 'Symlink in the submission; ignored (not followed, not graded)' });

  // S3: text aimed at graders is data, flagged for the instructor.
  if (!input.tooBig) {
    const candidates = changed
      ? [...changed.entries()].filter(([, s]) => s !== 'D').map(([p]) => p)
      : C.walkFiles(ws, { skipDirs: ['node_modules', '.git'] }).files.filter((p) => /^(OUTPUT|EXAM|knowledge|qa-system)\//.test(p));
    for (const p of candidates.filter((x) => /\.(md|txt|json|js|ya?ml|html?)$/i.test(x) && !symlinks.has(x)).sort()) {
      const t = C.readText(ws, p);
      if (t && INJECTION.some((re) => re.test(t))) {
        warnings.push({ code: 'W-INJECTION', path: p, message: 'Text addressed to graders/agents; treated as data and flagged for the instructor' });
        flags.push({ code: 'S3', id: `S3:${p}`, path: p, detail: 'Imperative text aimed at graders/agents (not followed)', open: true });
      }
    }
  }

  if (blocking.length === 0 && isObj) {
    gaps(manifest, { cfg, ws, slug, changed, G, warnings });
  }

  const status = blocking.length ? 'INVALID' : gradable.length ? 'VALID_WITH_GAPS' : 'VALID';
  return { status, blocking, gradable, warnings, flags, manifest: blocking.length ? (isObj ? manifest : null) : manifest };
}

function gaps(m, { cfg, ws, slug, changed, G, warnings }) {
  const has = (p) => typeof p === 'string' && C.fileExists(ws, p);
  const changedNow = (pred) => (changed ? [...changed.entries()].some(([p, s]) => s !== 'D' && pred(p)) : null);
  const dir = `OUTPUT/${slug}`;
  const arts = m.t3_pipeline.artifacts;

  // G-01 / G-02 stage files.
  for (const k of ['00', ...C.GRADED_STAGES]) {
    const official = `${dir}/${C.STAGE_FILES[k]}`;
    const declared = k === '05' ? arts['05'].spec : arts[k];
    const report = k === '00'
      ? (code, msg) => warnings.push({ code: 'W-PLAN', path: official, message: msg })
      : (code, msg, fix) => G(code, official, msg, fix);
    if (declared === null) report('G-01', `Declared null: stage ${k} not produced`, `Produce ${official} and declare it`);
    else if (declared !== official) report('G-02', `Stage ${k} declared as '${declared}', not the official name`, `Rename to ${official} (never auto-renamed)`);
    else if (!has(official)) report('G-01', `Stage ${k} file missing`, `Commit ${official}`);
  }

  // G-07 spec / batches.
  const batches = arts['05'].batches || [];
  for (const b of batches) if (!has(b)) G('G-07', b, 'Declared batch file missing', 'Commit the batch or remove it from the manifest');
  if (arts['05'].blueprint !== null && !has(arts['05'].blueprint)) G('G-07', arts['05'].blueprint, 'Declared blueprint missing', 'Commit the blueprint or declare null');
  if (batches.length && has(arts['05'].spec)) {
    const S = trustedSchema();
    const ids = (t) => new Set(S.parseTestCases(t || '').cases.map((c) => c.id));
    const specIds = ids(C.readText(ws, arts['05'].spec));
    const batchIds = new Set(batches.filter(has).flatMap((b) => [...ids(C.readText(ws, b))]));
    const diff = [...batchIds].filter((x) => !specIds.has(x)).length + [...specIds].filter((x) => !batchIds.has(x)).length;
    if (diff) G('G-07', arts['05'].spec, `Spec and batches disagree on ${diff} test case id(s)`, 'Re-run npm run testcases:merge');
  }

  // G-08 feature knowledge.
  const fk = `knowledge/features/${slug}.md`;
  if (m.t3_pipeline.feature_knowledge !== fk) G('G-08', 't3_pipeline.feature_knowledge', `Feature knowledge declared as '${m.t3_pipeline.feature_knowledge}'`, `Use ${fk}`);
  else if (!has(fk)) G('G-08', fk, 'Feature knowledge file missing', `Commit ${fk}`);

  // G-03 T1 anchors.
  const t1 = m.t1_customized_agent;
  if (!has(`${t1.agent_folder}/AGENT.md`)) G('G-03', 't1_customized_agent.agent_folder', 'T1 agent folder has no AGENT.md', 'Declare an existing qa-system/qa-<agent> folder');
  const af = anchorFiles(t1.agent_folder);
  for (const n of ANCHORS) {
    const v = t1.anchors[n];
    const reason = (t1.anchor_reasons || {})[n];
    if (v === 'done' && changedNow(af[n]) === false) G('G-03', `t1_customized_agent.anchors.${n}`, `${n} marked done but no matching file changed`, `Change the ${n} file or mark it n/a with a reason`);
    if (v === 'n/a' && !(typeof reason === 'string' && reason.trim().length >= 10)) G('G-03', `t1_customized_agent.anchor_reasons.${n}`, `${n} marked n/a without a reason`, 'Give a reason of at least 10 characters');
  }

  // G-04 T2.
  const t2 = m.t2_new_agent;
  if (!has(t2.agent_file)) G('G-04', 't2_new_agent.agent_file', 'Agent file missing', `Create ${t2.agent_folder}/AGENT.md`);
  if (!t2.skills.length) G('G-04', 't2_new_agent.skills', 'No skill declared', `Add ${t2.agent_folder}/skills/<skill>.md`);
  for (const s of t2.skills) if (!has(s)) G('G-04', s, 'Declared skill file missing', 'Commit the skill or fix the path');
  if (!has(t2.example_output)) G('G-04', 't2_new_agent.example_output', 'Example output missing', 'Run your skill on the exam task and commit its output');
  if (!t2.registrations.length) G('G-04', 't2_new_agent.registrations', 'No registration declared', 'List the files where the agent is registered');
  for (const r of t2.registrations) {
    if (!has(r)) G('G-04', r, 'Declared registration file missing', 'Fix the path');
    else if (changed && !changed.has(r)) G('G-04', r, 'Declared registration file is unchanged', 'Register the agent in this file');
  }

  // G-05 tests for changed tools.
  if (changed) {
    const tools = [...changed.entries()].filter(([p, s]) => s !== 'D' && isToolFile(p)).map(([p]) => p);
    const tests = [...changed.entries()].filter(([p, s]) => s !== 'D' && isTestFile(p)).map(([p]) => p);
    if (tools.length && !tests.length) G('G-05', 'qa-system/tools/__tests__/', `${tools.length} tool file(s) changed without new or updated tests`, 'Add node:test cases in qa-system/tools/__tests__/');
  }
  for (const t of [...t1.tests_added, ...t2.tests_added]) if (!has(t)) G('G-05', t, 'Declared test file missing', 'Commit the test or fix the path');

  // G-06 exam files.
  for (const f of ['EXAM/DECISIONS.md', 'EXAM/AI_USE.md']) if (!has(f)) G('G-06', f, `${f} missing`, `Copy EXAM/templates/${path.basename(f)} and fill it in`);
}

/** The engine's own schema parser (pure text functions only). */
function trustedSchema() {
  return require(path.join(C.ENGINE_REPO, 'qa-system', 'tools', 'lib', 'schema.js'));
}

module.exports = { runPreflight, pathProblem, collectDeclaredPaths, anchorFiles, REQUIRED_ANCHORS, ANCHORS, isToolFile, isTestFile, INJECTION, trustedSchema };

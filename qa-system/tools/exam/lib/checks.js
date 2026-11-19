/**
 * checks.js — Automated rubric A1–A6 (plan §5.1). 70 points.
 *
 *   gradeAutomated(ctx) → { criteria: {A1…A6}, evidence: {name → text}, notes: {...} }
 *   SELF_CHECK_IDS      → the public subset run by exam:check (plan §8)
 *
 * Principles: deterministic; every check names its evidence and a message; student files
 * are data; checks that need student code run only through ctx.runStudent (a container
 * when grading) and become PENDING_HUMAN_REVIEW — never 0 — when it cannot run.
 */

const fs = require('fs');
const path = require('path');
const C = require('./common');
const { anchorFiles, REQUIRED_ANCHORS, ANCHORS, isToolFile, isTestFile } = require('./preflight');
const { tapSummary, scrub } = require('./container');

const MAX = { A1: 8, A2: 12, A3: 14, A4: 14, A5: 14, A6: 8 };
const SELF_CHECK_IDS = ['A1a', 'A3a', 'A3b', 'A3c', 'A3d', 'A4a', 'A4b', 'A5a', 'A5b', 'A5c', 'A5d'];
const FIXTURE_VALID = 'exam-fixture-riskref-valid';
const FIXTURE_INVALID = 'exam-fixture-riskref-invalid';

// ───────────────────────────── Check constructors ─────────────────────────────

function scored(id, max, points, evidence, message) {
  const p = Math.min(max, Math.max(0, points));
  return { id, max, points: p, state: p >= max ? 'PASSED' : p > 0 ? 'PARTIAL' : 'FAILED', evidence, message };
}
const notSubmitted = (id, max, message, evidence = []) => ({ id, max, points: 0, state: 'NOT_SUBMITTED', evidence, message });
const pending = (id, max, message, evidence = []) => ({ id, max, points: null, state: 'PENDING_HUMAN_REVIEW', evidence, message });
const notGraded = (id, max, message) => ({ id, max, points: null, state: 'NOT_GRADED', evidence: [], message });

// ───────────────────────────── Markdown helpers ─────────────────────────────

const headings = (text, level = 2) => (text || '').split('\n').filter((l) => new RegExp(`^#{${level}}\\s`).test(l)).map((l) => l.replace(/^#+\s+/, '').trim());
const normHeading = (h) => h.toLowerCase().split(/\s+[—–(-]\s*|\s*\(/)[0].replace(/^[\d.]+\s*/, '').replace(/[`*]/g, '').trim();
const hasHeading = (text, re) => (text || '').split('\n').some((l) => /^#{1,6}\s/.test(l) && re.test(l));
const angleTokens = (text) => [...(text || '').matchAll(/<([^<>\n]{1,60})>/g)].map((m) => m[1].trim());

/** Lines of the `## Format output` section that are markdown headings (inside its code block or not). */
function formatOutputHeadings(skillText) {
  const lines = (skillText || '').split('\n');
  const start = lines.findIndex((l) => /^##\s+format output\b/i.test(l));
  if (start === -1) return null;
  const out = [];
  let fence = null;
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    const f = l.match(/^(`{3,}|~{3,})/);
    if (f) { fence = fence && l.startsWith(fence) ? null : fence || f[1]; continue; }
    if (!fence && /^##\s/.test(l)) break;
    if (/^#{1,6}\s+\S/.test(l)) out.push(l.trim());
  }
  return out;
}

/** A heading template ("## 2. Audit · <task-slug>") as a regex: `<…>` matches any text. */
function headingRegex(h) {
  const parts = h.split(/<[^<>\n]+>/).map((p) => p.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'));
  return new RegExp(`^${parts.join('.+?')}`, 'i');
}

// ───────────────────────────── Context helpers ─────────────────────────────

function changedList(ctx, pred = () => true) {
  return [...ctx.changed.entries()].filter(([p, s]) => pred(p, s)).map(([p]) => p).sort();
}
const isChanged = (ctx, p) => ctx.changed.has(p) && ctx.changed.get(p) !== 'D';

function starterFiles(ctx) {
  if (!ctx._starterFiles) ctx._starterFiles = C.walkFiles(ctx.starterDir).files;
  return ctx._starterFiles;
}

function nextPrefix(ctx) {
  const wf = ctx.starterDir ? C.readText(ctx.starterDir, 'qa-system/workflows/WORKFLOW.md') : null;
  const nums = [...(wf || '').matchAll(/^\|\s*(\d{2})[a-z]?\s*\|/gm)].map((m) => Number(m[1]));
  return String((nums.length ? Math.max(...nums) : 16) + 1).padStart(2, '0');
}

function toolJson(r) {
  try { return JSON.parse(r.stdout); } catch { return null; }
}

// ───────────────────────────── A1 Framework compliance ─────────────────────────────

function a1a(ctx) {
  const r = ctx.tool('qa-system/tools/system/agent-doctor.js', [], { withoutOutput: true });
  const text = scrub(r.stdout + r.stderr, ctx.toolRoot);
  const ev = ctx.ev('agent-check.txt', text);
  if (/^INTACT:/m.test(r.stdout) && r.code === 0) return scored('A1a', 3, 3, [ev], 'INTACT');
  const errs = (r.stdout.match(/^(\d+) ERROR\(S\)/m) || [])[1] || '0';
  const warns = (r.stdout.match(/^\n?(\d+) warning\(s\)/m) || [])[1] || '0';
  return scored('A1a', 3, 0, [ev], `agent:check not INTACT: ${errs} error(s), ${warns} warning(s) — see agent-check.txt`);
}

/** TAP results keyed by indentation + name + occurrence (runs use --test-concurrency=1, so order is stable). */
function tapResults(out) {
  const seen = new Map();
  const res = new Map();
  for (const line of String(out).split('\n')) {
    const m = line.match(/^(\s*)(not )?ok \d+ - (.*?)(\s+# (SKIP|TODO)\b.*)?$/);
    if (!m) continue;
    const base = `${m[1].length}|${m[3]}`;
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    res.set(`${base}|${n}`, !m[2] && !m[4]);
  }
  return res;
}

/**
 * A1b: the starter's baseline tests, run in the container against the student's code. The denominator is
 * the set of tests that pass on the STARTER in the same container, so tests that cannot run there
 * (native binaries, missing tools) never count against the student.
 */
function a1b(ctx) {
  const base = starterFiles(ctx).filter((p) => isTestFile(p)).sort();
  if (!base.length) return notGraded('A1b', 3, 'Starter has no baseline tests');
  const cmd = ['node', '--test', '--test-concurrency=1', '--test-reporter=tap', ...base];
  const ref = ctx.baselineReference(cmd);
  if (!ref.started) return pending('A1b', 3, `${ref.reason}; baseline not executed`);
  const refOk = [...tapResults(ref.stdout).entries()].filter(([, ok]) => ok).map(([k]) => k);
  if (!refOk.length) return pending('A1b', 3, 'Baseline tests do not pass on the starter in the container; needs review');
  const r = ctx.runStudent({
    label: 'baseline',
    prepare: (copy) => {
      // Baseline tests come from the starter (trusted); the code under test is the student's.
      for (const p of starterFiles(ctx).filter((x) => x.startsWith('qa-system/tools/__tests__/'))) {
        C.writeFileSafe(path.join(copy, p), fs.readFileSync(path.join(ctx.starterDir, p)));
      }
    },
    cmd,
    timeoutMs: 300000,
  });
  if (!r.started) return pending('A1b', 3, `${r.reason}; student code not executed`);
  const mine = tapResults(r.stdout);
  const pass = refOk.filter((k) => mine.get(k) === true).length;
  const failed = refOk.filter((k) => mine.get(k) !== true).map((k) => k.split('|')[1]);
  const ev = ctx.ev('baseline-tests.txt', `${pass}/${refOk.length} starter-passing baseline tests pass on the submission\n${failed.map((x) => `FAILED: ${x}`).join('\n')}\n\n${scrub(r.stdout + r.stderr, r.copy)}`);
  if (r.timedOut) return scored('A1b', 3, 0, [ev], 'Baseline test run timed out');
  return scored('A1b', 3, C.prop(3, pass, refOk.length), [ev], `${pass}/${refOk.length} baseline tests pass against the submission`);
}

function isProtected(p) {
  return /^qa-system\/(core|templates|tools|workflows)\//.test(p) || /^qa-system\/qa-[^/]+\/(AGENT\.md|skills\/[^/]+\.md)$/.test(p) ||
    ['AGENTS.md', 'CLAUDE.md', 'package.json', 'knowledge/_system_map.json'].includes(p);
}

function a1c(ctx) {
  const removed = changedList(ctx, (p, s) => s === 'D' && (isTestFile(p) || isProtected(p)));
  const ev = ctx.ev('protected.txt', removed.length ? `Removed protected/baseline files:\n${removed.join('\n')}\n` : 'No protected or baseline file removed\n');
  return scored('A1c', 2, 2 - removed.length, [ev], removed.length ? `${removed.length} protected or baseline file(s) removed` : 'No protected file removed');
}

// ───────────────────────────── A2 T1 customisation ─────────────────────────────

function allowedForClass(cls, agent, starterHas) {
  const base = (p) => p.startsWith(`${agent}/skills/`) || ['qa-system/workflows/WORKFLOW.md', 'qa-system/qa-lead/AGENT.md',
    'qa-system/tools/system/lint-deliverables.js', 'qa-system/tools/lib/schema.js', 'qa-system/tools/lib/provenance.js'].includes(p) ||
    /^qa-system\/tools\/__tests__\//.test(p);
  const a = (p) => base(p) || [`${agent}/AGENT.md`, 'knowledge/_system_map.json', 'qa-system/tools/system/agent-doctor.js', 'qa-system/README.md'].includes(p);
  const b = (p) => a(p) || (/^qa-system\/qa-[a-z0-9-]+\//.test(p) && !starterHas(`${p.split('/').slice(0, 2).join('/')}/AGENT.md`));
  const byClass = { A: a, B: b, C: base };
  return (p) => !p.startsWith('qa-system/core/') && byClass[cls](p);
}

function a2(ctx) {
  const t1 = ctx.manifest.t1_customized_agent;
  const agent = t1.agent_folder;
  const cls = t1.decision_class;
  const starterHas = (p) => C.fileExists(ctx.starterDir, p);
  const out = [];
  const lines = [`T1 agent: ${agent} · declared class: ${cls}`];

  if (!starterHas(`${agent}/AGENT.md`)) {
    const msg = `T1 agent folder ${agent} is not an existing agent of the starter`;
    return [scored('A2a', 3, 0, [], msg), scored('A2b', 4, 0, [], msg), scored('A2c', 2, 0, [], msg), a2d(ctx)];
  }

  // a. layers allowed for the declared class.
  const allowed = allowedForClass(cls, agent, starterHas);
  const files = [...new Set(t1.changed_files)].sort();
  const okFiles = files.filter((p) => allowed(p) && isChanged(ctx, p));
  for (const p of files) lines.push(`${allowed(p) ? 'allowed' : 'OUTSIDE CLASS'} · ${isChanged(ctx, p) ? 'changed' : 'NOT CHANGED'} · ${p}`);
  const ev = ctx.ev('t1.txt', `${lines.join('\n')}\n`);
  out.push(files.length
    ? scored('A2a', 3, C.prop(3, okFiles.length, files.length), [ev], `${okFiles.length}/${files.length} declared changed files are real changes inside the layers of class ${cls}`)
    : scored('A2a', 3, 0, [ev], 'No changed file declared for T1'));

  // b. anchors consistent with the declared class.
  const af = anchorFiles(agent);
  const req = REQUIRED_ANCHORS[cls];
  let ok = 0;
  const bad = [];
  for (const n of ANCHORS) {
    const v = t1.anchors[n];
    const reason = (t1.anchor_reasons || {})[n];
    const hasChange = changedList(ctx, (p, s) => s !== 'D' && af[n](p)).length > 0;
    const good = v === 'done' ? hasChange : !req.includes(n) && typeof reason === 'string' && reason.trim().length >= 10;
    if (good) ok++; else bad.push(n);
  }
  out.push(scored('A2b', 4, C.prop(4, ok, ANCHORS.length), [ev, 'EXAM/submission.json'],
    bad.length ? `${ok}/7 anchors consistent with class ${cls}; check ${bad.join(', ')} (required for ${cls}: ${req.join(', ')})` : `7/7 anchors consistent with class ${cls}`));

  // c. skill structure of the changed skill(s).
  const skills = changedList(ctx, (p, s) => s !== 'D' && p.startsWith(`${agent}/skills/`) && p.endsWith('.md'));
  if (!skills.length) out.push(scored('A2c', 2, 0, [], 'No skill of the T1 agent changed'));
  else {
    let items = 0;
    const miss = [];
    for (const s of skills) {
      const t = C.readText(ctx.ws, s) || '';
      const fm = /^---\n[\s\S]*?\bname:\s*\S[\s\S]*?\bdescription:\s*\S[\s\S]*?\n---/.test(t.replace(/\r\n?/g, '\n'));
      const fo = /^##\s+format output\b/im.test(t);
      const gate = hasHeading(t, /chốt chặn nghiệm thu|quality gates?|acceptance gate/i);
      items += fm + fo + gate;
      if (!fm) miss.push(`${s}: frontmatter`); if (!fo) miss.push(`${s}: Format output`); if (!gate) miss.push(`${s}: acceptance gate`);
    }
    out.push(scored('A2c', 2, C.prop(2, items, skills.length * 3), skills, miss.length ? `Missing: ${miss.join('; ')}` : 'Frontmatter, Format output and acceptance gate present'));
  }

  out.push(a2d(ctx));
  return out;
}

/** Errors mentioning Risk Ref in a lint run (JSON when available, text otherwise). */
function riskRefErrors(r) {
  const j = toolJson(r);
  if (j && Array.isArray(j.errors)) return j.errors.filter((e) => /risk\s*_?ref/i.test(`${e.msg} ${e.where} ${e.file}`)).length;
  return (r.stdout + r.stderr).split('\n').filter((l) => /risk\s*_?ref/i.test(l)).length;
}

function a2d(ctx) {
  const fx = ctx.hiddenDir && path.join(ctx.hiddenDir, 'fixtures');
  if (!fx || !fs.existsSync(path.join(fx, 'riskref-valid')) || !fs.existsSync(path.join(fx, 'riskref-invalid'))) {
    return pending('A2d', 3, 'Hidden T1 fixtures not configured');
  }
  const lint = (name, slug) => ctx.runStudent({
    label: `a2d-${name}`,
    prepare: (copy) => C.copyTree(path.join(fx, name), copy),
    cmd: ['node', 'qa-system/tools/system/lint-deliverables.js', slug, '--json'],
    timeoutMs: 120000,
  });
  const v = lint('riskref-valid', FIXTURE_VALID);
  if (!v.started) return pending('A2d', 3, `${v.reason}; student lint not executed`);
  const iv = lint('riskref-invalid', FIXTURE_INVALID);
  if (!iv.started) return pending('A2d', 3, `${iv.reason}; student lint not executed`);
  const vErr = riskRefErrors(v);
  const ivErr = riskRefErrors(iv);
  const accepts = !v.timedOut && vErr === 0 && /"errors"|DELIVERABLE LINT/.test(v.stdout);
  const rejects = !iv.timedOut && ivErr > 0 && iv.code !== 0;
  const ev = ctx.ev('t1-fixtures.txt', `valid fixture: exit ${v.code}, Risk Ref errors ${vErr}\ninvalid fixture: exit ${iv.code}, Risk Ref errors ${ivErr}\n`);
  return scored('A2d', 3, (accepts ? 1.5 : 0) + (rejects ? 1.5 : 0), [ev],
    `Valid sample ${accepts ? 'accepted' : 'NOT accepted'}; sample without Risk Ref ${rejects ? 'rejected' : 'NOT rejected'}`);
}

// ───────────────────────────── A3 T2 new agent ─────────────────────────────

function a3(ctx, only) {
  const t2 = ctx.manifest.t2_new_agent;
  const folder = t2.agent_folder;
  const name = path.basename(folder);
  const want = (id) => !only || only.includes(id);
  const out = [];
  const agentPath = `${folder}/AGENT.md`;
  const agentText = C.readText(ctx.ws, agentPath);
  const skillFiles = C.walkFiles(path.join(ctx.ws, folder)).files.filter((p) => /^skills\/[^/]+\.md$/.test(p)).map((p) => `${folder}/${p}`);
  const existedBefore = ctx.starterDir ? C.fileExists(ctx.starterDir, agentPath) : false;

  if (want('A3a')) {
    let pts = 0;
    const notes = [];
    if (agentText !== null && t2.agent_file === agentPath && skillFiles.length && !existedBefore) pts += 1;
    else notes.push(existedBefore ? 'agent folder already existed in the starter' : 'AGENT.md + skills/<skill>.md required');
    const tpl = ctx.templateRoot ? C.readText(ctx.templateRoot, 'qa-system/templates/AGENT.md') : null;
    if (tpl && agentText !== null) {
      const need = [...new Set(headings(tpl).map(normHeading))];
      const have = new Set(headings(agentText).map(normHeading));
      const hit = need.filter((h) => have.has(h));
      pts += C.prop(1, hit.length, need.length);
      if (hit.length < need.length) notes.push(`template sections missing: ${need.filter((h) => !have.has(h)).join(', ')}`);
    }
    const forbidden = placeholderTokens(ctx);
    const left = [agentPath, ...skillFiles].flatMap((p) => angleTokens(C.readText(ctx.ws, p)).filter((t) => forbidden.has(t)).map((t) => `${p}: <${t}>`));
    if (agentText !== null && !left.length) pts += 1;
    else if (left.length) notes.push(`template placeholders left: ${[...new Set(left)].slice(0, 5).join('; ')}`);
    out.push(scored('A3a', 3, pts, [agentPath, ...skillFiles], notes.length ? notes.join(' · ') : 'Structure follows the template; no placeholders left'));
  }

  if (want('A3b')) {
    const hf = hasHeading(agentText, /^#{2,3}\s+human-final/i);
    const kn = hasHeading(agentText, /^#{2,3}\s+knowledge\b/i);
    out.push(scored('A3b', 2, hf + kn, [agentPath], `Human-Final ${hf ? 'present' : 'MISSING'} · Knowledge ${kn ? 'present' : 'MISSING'}`));
  }

  if (want('A3c')) {
    const skillNames = skillFiles.map((p) => path.basename(p, '.md'));
    const reg = [];
    let map = null;
    try { map = JSON.parse(C.readText(ctx.ws, 'knowledge/_system_map.json') || 'null'); } catch { map = null; }
    const keys = Object.keys((map && map.specialized_agents) || {});
    reg.push(['_system_map.json specialized_agents', keys.includes(name) || keys.includes(name.replace(/-/g, '_'))]);
    const routes = Object.values((map && map.routing_table) || {}).filter((v) => typeof v === 'string');
    reg.push(['_system_map.json routing_table', routes.some((v) => v.startsWith(`${folder}/`))]);
    const wf = C.readText(ctx.ws, 'qa-system/workflows/WORKFLOW.md') || '';
    reg.push(['WORKFLOW.md', skillNames.length > 0 && skillNames.every((s) => wf.includes(s)) && wf.includes(name)]);
    const lead = C.readText(ctx.ws, 'qa-system/qa-lead/AGENT.md') || '';
    reg.push(['qa-lead/AGENT.md', lead.includes(name) && skillNames.some((s) => lead.includes(s))]);
    const doctor = C.readText(ctx.ws, 'qa-system/tools/system/agent-doctor.js') || '';
    reg.push(['agent-doctor.js PIPELINE_DEPENDENCIES', skillFiles.some((p) => doctor.includes(p))]);
    const ok = reg.filter(([, v]) => v).length;
    const ev = ctx.ev('t2-registrations.txt', reg.map(([k, v]) => `${v ? 'OK     ' : 'MISSING'} ${k}`).join('\n') + '\n');
    out.push(scored('A3c', 4, C.prop(4, ok, 5), [ev], `${ok}/5 registrations found${ok < 5 ? `; missing: ${reg.filter(([, v]) => !v).map(([k]) => k).join(', ')}` : ''}`));
  }

  if (want('A3d')) {
    const r = ctx.runStudent({ label: 'a3d', cmd: ['node', 'qa-system/tools/system/agent-doctor.js', '--impact', name], timeoutMs: 120000 });
    if (!r.started) out.push(pending('A3d', 2, `${r.reason}; student agent-doctor not executed`));
    else {
      const ev = ctx.ev('t2-impact.txt', scrub(r.stdout + r.stderr, r.copy));
      const edges = (r.stdout.match(/^\s*\d+\.\s+Step \[/gm) || []).length;
      const resolved = /Target Component/.test(r.stdout);
      out.push(scored('A3d', 2, resolved && edges >= 1 ? 2 : 0, [ev], resolved ? `--impact ${name} resolves with ${edges} edge(s)` : `--impact ${name} does not resolve the agent`));
    }
  }

  if (want('A3e')) {
    const nn = ctx.starterDir ? nextPrefix(ctx) : null;
    const ex = t2.example_output;
    const exText = C.readText(ctx.ws, ex);
    const dir = `OUTPUT/${ctx.cfg.task_slug}/`;
    const nameOk = ex.startsWith(dir) && /^[0-9]{2}[a-z]?_[a-z0-9_]+\.md$/.test(ex.slice(dir.length)) && ex.slice(dir.length).startsWith(`${t2.deliverable_prefix}_`) &&
      (!nn || t2.deliverable_prefix === nn);
    if (exText === null) out.push(notSubmitted('A3e', 3, 'Example output not submitted'));
    else {
      let pts = nameOk ? 1 : 0;
      const tpls = skillFiles.map((p) => formatOutputHeadings(C.readText(ctx.ws, p))).filter(Boolean).flat();
      const exLines = exText.split('\n').map((l) => l.trim()).filter((l) => /^#{1,6}\s/.test(l));
      const hit = tpls.filter((h) => exLines.some((l) => headingRegex(h).test(l)));
      pts += tpls.length ? C.prop(2, hit.length, tpls.length) : 0;
      const msg = [`name ${nameOk ? 'ok' : `must be ${dir}${nn || 'NN'}_<name>.md with deliverable_prefix ${nn || 'NN'}`}`,
        tpls.length ? `${hit.length}/${tpls.length} headings of the skill's Format output present` : 'the skill declares no headings under ## Format output'];
      out.push(scored('A3e', 3, pts, [ex, ...skillFiles], msg.join(' · ')));
    }
  }
  return out;
}

/** `<…>` tokens of the starter templates that never occur in the starter's real agents/skills. */
function placeholderTokens(ctx) {
  const root = ctx.templateRoot;
  if (!root) return new Set();
  const tpl = ['qa-system/templates/AGENT.md', 'qa-system/templates/skills/ten-skill.md'].flatMap((p) => angleTokens(C.readText(root, p)));
  const real = new Set(C.walkFiles(path.join(root, 'qa-system')).files
    .filter((p) => /^qa-[^/]+\/(AGENT\.md|skills\/[^/]+\.md)$/.test(p))
    .flatMap((p) => angleTokens(C.readText(path.join(root, 'qa-system'), p))));
  return new Set(tpl.filter((t) => !real.has(t)));
}

// ───────────────────────────── A4 T3 pipeline ─────────────────────────────

function stagePresence(ctx) {
  const arts = ctx.manifest.t3_pipeline.artifacts;
  const dir = `OUTPUT/${ctx.cfg.task_slug}`;
  const present = {};
  for (const k of C.GRADED_STAGES) {
    const official = `${dir}/${C.STAGE_FILES[k]}`;
    const declared = k === '05' ? arts['05'].spec : arts[k];
    present[k] = declared === official && C.fileExists(ctx.ws, official);
  }
  return present;
}

function a4(ctx, only) {
  const want = (id) => !only || only.includes(id);
  const slug = ctx.cfg.task_slug;
  const out = [];
  const present = stagePresence(ctx);
  const n = C.GRADED_STAGES.filter((k) => present[k]).length;
  const hasOutput = fs.existsSync(path.join(ctx.ws, 'OUTPUT', slug));

  if (want('A4a')) {
    const missing = C.GRADED_STAGES.filter((k) => !present[k]).map((k) => C.STAGE_FILES[k]);
    const a = n === 0 ? notSubmitted('A4a', 3, '0/6 stage files present with official names') : scored('A4a', 3, n * 0.5, [`OUTPUT/${slug}/`], `${n}/6 stage files present${missing.length ? `; not submitted: ${missing.join(', ')}` : ''}`);
    out.push(a);
  }

  if (want('A4b')) {
    if (!hasOutput) out.push(notSubmitted('A4b', 4, `No OUTPUT/${slug}/`));
    else {
      const r = ctx.tool('qa-system/tools/system/lint-deliverables.js', [slug, '--json']);
      const j = toolJson(r);
      if (!j || !Array.isArray(j.errors)) {
        const ev = ctx.ev('lint.txt', scrub(r.stdout + r.stderr, ctx.toolRoot));
        out.push(scored('A4b', 4, 0, [ev], 'Lint could not read the deliverables'));
      } else {
        const ev = ctx.ev('lint.txt', `${j.errors.length} error(s), ${j.warns.length} warning(s), ${j.totalCases} test case(s)\n` +
          j.errors.map((e) => `ERROR ${e.file} [${e.where}] ${e.msg}`).join('\n') + '\n' + j.warns.map((e) => `WARN  ${e.file} [${e.where}] ${e.msg}`).join('\n') + '\n');
        out.push(scored('A4b', 4, 4 - 0.5 * j.errors.length, [ev], `${j.errors.length} lint error(s) with canonical INPUT and trusted tools`));
      }
    }
  }

  if (want('A4c')) out.push(a4c(ctx, hasOutput));
  if (want('A4d')) out.push(benchmark(ctx));
  return out;
}

function a4c(ctx, hasOutput) {
  const slug = ctx.cfg.task_slug;
  const dir = path.join(ctx.toolRoot, 'OUTPUT', slug);
  const locked = [];
  if (hasOutput) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isFile() && /^0[3-6][a-z]?_/i.test(e.name)) locked.push(e.name);
      if (e.isDirectory() && e.name.toLowerCase() === 'testcases') {
        for (const f of fs.readdirSync(path.join(dir, e.name), { withFileTypes: true })) if (f.isFile()) locked.push(`${e.name}/${f.name}`);
      }
    }
  }
  locked.sort();
  if (!locked.length) return notSubmitted('A4c', 3, 'No stage 03-06 file to evaluate');
  const r = ctx.tool('qa-system/tools/system/gate.js', ['check', slug, '--json']);
  const st = toolJson(r);
  if (!st || typeof st.blocked !== 'boolean') {
    const ev = ctx.ev('gate.txt', scrub(r.stdout + r.stderr, ctx.toolRoot));
    return scored('A4c', 3, 0, [ev], 'Gate state could not be derived (02 or knowledge unreadable)');
  }
  const ids = [...new Set((st.pending || []).map((q) => q.id).filter((x) => /^[A-Z]+-\d+$/.test(x)))];
  const dependsOn = (f) => {
    if (!st.blocked) return [];
    if (!ids.length) return ['gate closed'];
    const t = fs.readFileSync(path.join(dir, f), 'utf8');
    return ids.filter((id) => new RegExp(`(^|[^A-Za-z0-9-])${id}(?![0-9])`).test(t));
  };
  const viol = locked.map((f) => ({ f, on: dependsOn(f) })).filter((x) => x.on.length);
  const ev = ctx.ev('gate.txt', `Gate re-derived by the grader: ${st.blocked ? 'CLOSED' : 'open'}\n` +
    (st.reasons || []).map((x) => `reason: ${x}`).join('\n') + `\nopen questions: ${ids.join(', ') || '-'}\n` +
    locked.map((f) => { const v = viol.find((x) => x.f === f); return `${v ? 'DEPENDS ON OPEN ASK' : 'ok'} · ${f}${v ? ` (${v.on.join(', ')})` : ''}`; }).join('\n') + '\n');
  return scored('A4c', 3, C.prop(3, locked.length - viol.length, locked.length), [ev],
    viol.length ? `${viol.length}/${locked.length} stage 03-06 file(s) depend on open ASK questions` : 'No stage produced while ASK open');
}

// ── Benchmark matching (A4d, A5e) ──

const normMatch = (s) => String(s || '').normalize('NFKC').toLowerCase().replace(/[`*_|]/g, ' ').replace(/\s+/g, ' ').trim();
/** Distinct keywords of `item` found in `text`. */
const keywordHits = (item, text) => { const t = normMatch(text); return new Set(item.keywords.map(normMatch).filter((k) => k && t.includes(k))).size; };
/** Best row for `item`: { hits, row }. */
function bestRow(item, rows) {
  let best = { hits: 0, row: null };
  for (const r of rows) { const h = keywordHits(item, r.text); if (h > best.hits) best = { hits: h, row: r }; }
  return best;
}

function analysis(ctx) {
  if (ctx._analysis !== undefined) return ctx._analysis;
  ctx._analysis = ctx.analyze();
  return ctx._analysis;
}

function benchmark(ctx) {
  const gaps = ctx.bench && ctx.bench.gaps;
  if (!gaps) return pending('A4d', 4, 'Benchmark not configured');
  const an = analysis(ctx);
  if (!an) return pending('A4d', 4, 'Static analysis failed; needs review');
  const rows = an.questionRows;
  if (!rows.length) return notSubmitted('A4d', 4, `0 of ${gaps.length} seeded gaps raised (no OQ/MR rows found)`);
  let found = 0;
  let borderline = 0;
  const lines = [];
  const missed = [];
  gaps.forEach((g, i) => {
    const b = bestRow(g, rows);
    const state = b.hits >= g.min_keyword_hits ? 'found' : b.hits === g.min_keyword_hits - 1 && b.hits > 0 ? 'borderline' : 'missed';
    if (state === 'found') found++;
    if (state === 'borderline') borderline++;
    if (state !== 'found') missed.push(g.category);
    lines.push(`gap #${i + 1} [${g.category}]: ${state}${b.row && state !== 'missed' ? ` (student row ${b.row.source} ${b.row.id})` : ''}`);
  });
  const ev = ctx.ev('benchmark.txt', `${lines.join('\n')}\n`);
  const cats = [...new Set(missed)].sort();
  const msg = `${found} of ${gaps.length} seeded gaps raised${cats.length ? `; missed categor${cats.length > 1 ? 'ies' : 'y'}: ${cats.join(', ')}` : ''}`;
  if (borderline) return pending('A4d', 4, `${msg}; ${borderline} borderline match(es) need human review`, [ev]);
  return scored('A4d', 4, C.prop(4, found, gaps.length), [ev], msg);
}

// ───────────────────────────── A5 Traceability & anti-fabrication ─────────────────────────────

function a5(ctx, only) {
  const want = (id) => !only || only.includes(id);
  const slug = ctx.cfg.task_slug;
  const out = [];
  const present = stagePresence(ctx);
  const an = analysis(ctx);
  const f01 = `OUTPUT/${slug}/01_requirement_risk_summary.md`;
  const f05 = `OUTPUT/${slug}/05_test_case_spec.md`;
  const fail = (id, max) => pending(id, max, 'Static analysis failed; needs review');

  if (want('A5a')) {
    if (!present['01']) out.push(notSubmitted('A5a', 4, 'Stage 01 not submitted'));
    else if (!an) out.push(fail('A5a', 4));
    else {
      const q = an.quotes;
      const ev = ctx.ev('quotes.txt', `${q.verified}/${q.total} quotes verified in canonical INPUT\n${q.failed.join('\n')}\n`);
      out.push(q.total ? scored('A5a', 4, C.prop(4, q.verified, q.total), [ev], `${q.verified}/${q.total} BR/FD/AF quotes found verbatim in canonical INPUT`)
        : scored('A5a', 4, 0, [ev], 'No quotes found in 01 §3/§3b/§5/§6'));
    }
  }
  if (want('A5b')) {
    if (!present['05']) out.push(notSubmitted('A5b', 3, 'Stage 05 spec not submitted'));
    else if (!an) out.push(fail('A5b', 3));
    else {
      const t = an.tcs;
      const ev = ctx.ev('trace.txt', `${t.traced}/${t.total} test cases trace to defined BR/FD/AF/MR\n${t.orphans.join('\n')}\n`);
      out.push(t.total ? scored('A5b', 3, C.prop(3, t.traced, t.total), [ev, f05], `${t.traced}/${t.total} test cases trace to existing rules${t.orphans.length ? `; ${t.orphans.length} orphan(s)` : ''}`)
        : scored('A5b', 3, 0, [ev], 'No test case parsed'));
    }
  }
  if (want('A5c')) {
    if (!present['01'] && !present['05']) out.push(notSubmitted('A5c', 2, 'Stages 01 and 05 not submitted'));
    else if (!an) out.push(fail('A5c', 2));
    else {
      const m = an.numeric;
      const ev = ctx.ev('numbers.txt', `${m.items - m.bad.length}/${m.items} items with sourced numbers\n${m.bad.join('\n')}\n`);
      out.push(m.items ? scored('A5c', 2, C.prop(2, m.items - m.bad.length, m.items), [ev], `${m.bad.length} item(s) state numbers without provenance`)
        : scored('A5c', 2, 0, [ev], 'Nothing to check'));
    }
  }
  if (want('A5d')) {
    if (!present['01']) out.push(notSubmitted('A5d', 2, 'Stage 01 not submitted'));
    else if (!an) out.push(fail('A5d', 2));
    else {
      const v = an.domainViolations;
      const ev = ctx.ev('domain.txt', v.length ? `${v.join('\n')}\n` : 'No [DOMAIN] item used as a BR/FD/AF source\n');
      out.push(scored('A5d', 2, 2 - v.length, [ev, f01], v.length ? `${v.length} BR/FD/AF row(s) cite a domain pack as source` : 'No [DOMAIN] item as BR/FD source'));
    }
  }
  if (want('A5e')) out.push(probe(ctx, an));
  return out;
}

function probe(ctx, an) {
  const p = ctx.bench && ctx.bench.probe;
  if (!p) return pending('A5e', 3, 'Probe not configured');
  if (!an) return pending('A5e', 3, 'Static analysis failed; needs review');
  const corpus = an.definitionText.join('\n');
  const invented = p.invented_value_patterns.some((re) => new RegExp(re, 'iu').test(corpus));
  const asked = bestRow(p, an.questionRows);
  const risk = bestRow(p, an.riskRows);
  let res;
  if (invented) res = scored('A5e', 3, 0, [], 'Ambiguous-rule probe: a concrete value was invented instead of asking');
  else if (asked.hits >= p.min_keyword_hits) res = scored('A5e', 3, 3, [], 'Ambiguous-rule probe: raised as a question');
  else if (risk.hits >= p.min_keyword_hits) res = scored('A5e', 3, 1, [], 'Ambiguous-rule probe: noted as a risk, not asked');
  else if (asked.hits === p.min_keyword_hits - 1 && asked.hits > 0) res = pending('A5e', 3, 'Ambiguous-rule probe: borderline match; needs human review');
  else res = scored('A5e', 3, 0, [], 'Ambiguous-rule probe: not raised');
  const ev = ctx.ev('probe.txt', `invented value: ${invented ? 'yes' : 'no'}\nquestion match: ${asked.row ? `${asked.row.source} ${asked.row.id}` : '-'} (${asked.hits >= p.min_keyword_hits ? 'match' : asked.hits === p.min_keyword_hits - 1 && asked.hits > 0 ? 'borderline' : 'none'})\nrisk match: ${risk.row && risk.hits >= p.min_keyword_hits ? risk.row.id : '-'}\n`);
  res.evidence = [ev];
  return res;
}

// ───────────────────────────── A6 Tests & validation ─────────────────────────────

function a6(ctx) {
  const out = [];
  const tools = changedList(ctx, (p, s) => s !== 'D' && isToolFile(p));
  const tests = changedList(ctx, (p, s) => s !== 'D' && isTestFile(p));

  // a. changed tools have new passing tests.
  if (!tools.length) out.push(notSubmitted('A6a', 3, 'No tool change found (T1 requires a lint change)'));
  else if (!tests.length) out.push(scored('A6a', 3, 0, [], `${tools.length} tool file(s) changed without tests`));
  else {
    const r = ctx.runStudent({ label: 'a6a', cmd: ['node', '--test', '--test-reporter=tap', ...tests], timeoutMs: 300000 });
    if (!r.started) out.push(pending('A6a', 3, `${r.reason}; student tests not executed`));
    else {
      const ev = ctx.ev('student-tests.txt', `changed tools:\n${tools.join('\n')}\n\ntests:\n${tests.join('\n')}\n\n${scrub(r.stdout + r.stderr, r.copy)}`);
      const s = tapSummary(r.stdout);
      out.push(r.timedOut || !s.tests ? scored('A6a', 3, 0, [ev], r.timedOut ? 'Student tests timed out' : 'Student tests produced no readable summary')
        : scored('A6a', 3, C.prop(3, s.pass, s.tests), [ev], `${s.pass}/${s.tests} new or updated tests pass`));
    }
  }

  // b. hidden instructor tests.
  const hidden = ctx.hiddenDir && fs.existsSync(ctx.hiddenDir)
    ? fs.readdirSync(ctx.hiddenDir).filter((f) => /\.test\.js$/.test(f)).sort() : [];
  if (!hidden.length) out.push(pending('A6b', 3, 'Hidden instructor tests not configured'));
  else {
    const r = ctx.runStudent({
      label: 'a6b',
      prepare: (copy) => {
        C.copyTree(ctx.hiddenDir, path.join(copy, '.exam-hidden'));
        const fx = path.join(ctx.hiddenDir, 'fixtures');
        if (fs.existsSync(fx)) for (const d of fs.readdirSync(fx).sort()) C.copyTree(path.join(fx, d), copy);
      },
      cmd: ['node', '--test', '--test-concurrency=1', '--test-reporter=tap', ...hidden.map((f) => `.exam-hidden/${f}`)],
      timeoutMs: 300000,
    });
    if (!r.started) out.push(pending('A6b', 3, `${r.reason}; hidden tests not executed`));
    else {
      const ev = ctx.ev('hidden-tests.txt', scrub(r.stdout + r.stderr, r.copy));
      const s = tapSummary(r.stdout);
      out.push(r.timedOut || !s.tests ? scored('A6b', 3, 0, [ev], r.timedOut ? 'Hidden tests timed out' : 'Hidden tests produced no readable summary')
        : scored('A6b', 3, C.prop(3, s.pass, s.tests), [ev], `${s.pass}/${s.tests} hidden T1/T2 tests pass`));
    }
  }

  // c. determinism of the student's tools on two runs.
  const slug = ctx.cfg.task_slug;
  const r = ctx.runStudent({
    label: 'a6c',
    prepare: (copy) => C.writeFileSafe(path.join(copy, '.exam-det', 'det.js'), DET_SCRIPT),
    cmd: ['node', '.exam-det/det.js', slug],
    timeoutMs: 300000,
  });
  if (!r.started) out.push(pending('A6c', 2, `${r.reason}; student tools not executed`));
  else {
    let j = null;
    try { j = JSON.parse(r.stdout.trim().split('\n').pop()); } catch { j = null; }
    const ev = ctx.ev('determinism.txt', j ? `${j.runs.map((x) => `${x.same ? 'same' : 'DIFFERENT'} · ${x.cmd}`).join('\n')}\n` : scrub(r.stdout + r.stderr, r.copy));
    out.push(j && j.runs.every((x) => x.same) ? scored('A6c', 2, 2, [ev], 'Student lint and agent:check give identical output on two runs')
      : scored('A6c', 2, 0, [ev], 'Student tools are not deterministic on two runs'));
  }
  return out;
}

/** Runs inside the container: each student tool twice on the same tree; compares exit code + output. */
const DET_SCRIPT = `const { spawnSync } = require('child_process');
const slug = process.argv[2];
const cmds = [['qa-system/tools/system/lint-deliverables.js', slug, '--json'], ['qa-system/tools/system/agent-doctor.js']];
const runs = cmds.map((c) => {
  const go = () => { const r = spawnSync(process.execPath, c, { encoding: 'utf8', timeout: 120000 }); return \`\${r.status}\\n\${r.stdout}\\n\${r.stderr}\`; };
  return { cmd: c.join(' '), same: go() === go() };
});
console.log(JSON.stringify({ runs }));
`;

// ───────────────────────────── Entry ─────────────────────────────

function criterion(max, checks) {
  const pts = checks.some((c) => c.points === null) ? null : C.round2(checks.reduce((s, c) => s + c.points, 0));
  return { max, points: pts, checks };
}

/** Full automated grading (all checks), or the subset `only` (self-check). */
function gradeAutomated(ctx, only = null) {
  const want = (id) => !only || only.includes(id);
  const A1 = [];
  if (want('A1a')) A1.push(a1a(ctx));
  if (want('A1b')) A1.push(a1b(ctx));
  if (want('A1c')) A1.push(a1c(ctx));
  const A2 = only ? [] : a2(ctx);
  const A3 = a3(ctx, only);
  const A4 = a4(ctx, only);
  const A5 = a5(ctx, only);
  const A6 = only ? [] : a6(ctx);
  return {
    A1: criterion(MAX.A1, A1), A2: criterion(MAX.A2, A2), A3: criterion(MAX.A3, A3),
    A4: criterion(MAX.A4, A4), A5: criterion(MAX.A5, A5), A6: criterion(MAX.A6, A6),
  };
}

module.exports = {
  gradeAutomated, criterion, MAX, SELF_CHECK_IDS, FIXTURE_VALID, FIXTURE_INVALID,
  formatOutputHeadings, headingRegex, tapResults, keywordHits, bestRow, nextPrefix, stagePresence, DET_SCRIPT,
};

#!/usr/bin/env node
/**
 * workflow.js — Registry, validator and launcher for workflows.
 *
 *   loadAll()                  Every workflow file that carries frontmatter.
 *   validate(wf, all)          Rule check; a workflow cannot bypass the gates.
 *   find(phrase, all)          Match a short user phrase to a workflow by trigger.
 *   buildPlan(wf, slug)        The ordered run plan the QA Leader follows.
 *   start(name, slug)          Append the plan as a checklist to 00_plan.md.
 *
 * A workflow is one markdown file in qa-system/workflows/ whose frontmatter lists
 * trigger phrases and steps (agent + skill, or a tool). The file is the single
 * source of truth: there is no separate registry to keep in sync.
 *
 * Authoring: the user describes a process in words, the QA Leader drafts the file
 * (`new`), and `validate` rejects drafts that name a missing skill or skip a gate.
 * Launching: the user says a short phrase, `find` resolves it, `start` records
 * the checklist, and the QA Leader executes step by step.
 *
 * Usage:
 *   workflow.js list
 *   workflow.js find "<phrase>" [--json]
 *   workflow.js show <name> [--slug <slug>]
 *   workflow.js start <name> --slug <slug>
 *   workflow.js new <name>
 *   workflow.js validate [<name>]       Exit 1 when any workflow has errors.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { PATHS, taskDir } = require('../lib/paths');

const WORKFLOW_DIR = () => path.join(PATHS.SYSTEM, 'workflows');
const TEMPLATE = () => path.join(PATHS.TEMPLATES, 'workflows', 'workflow.md');

/** Skills that produce stage 3-6 deliverables; the ASK gate must precede them. */
const STAGE_SKILLS = new Set([
  'viewpoint-selection',
  'test-idea-design',
  'test-case-generation',
  'coverage-review',
]);

const GATES = new Set(['ask', 'lint', 'readiness', 'confirm']);

const GATE_COMMAND = {
  ask: (slug) => `npm run gate ${slug}`,
  lint: (slug) => `npm run lint -- ${slug}`,
  readiness: (slug) => `npm run readiness -- ${slug}`,
  confirm: () => 'ask the user to confirm explicitly (and give the target URL for automation)',
};

const STOPWORDS = new Set([
  'toi', 'minh', 'ban', 'em', 'anh', 'chi', 'la', 'hay', 'cho', 'giup', 'nhe', 'nha',
  'di', 'voi', 'va', 'cac', 'mot', 'de', 'vui', 'long', 'xin', 'the',
]);

// ───────────────────────────── Parsing ─────────────────────────────

/** Lower-case, diacritics stripped, punctuation removed, stopwords dropped. */
function tokens(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !STOPWORDS.has(t));
}

/** @returns {{meta: object, body: string}|null} null when there is no frontmatter. */
function parseFile(file) {
  const raw = fs.readFileSync(file, 'utf-8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
  try {
    const meta = yaml.load(m[1]);
    if (!meta || typeof meta !== 'object') return null;
    return { meta, body: raw.slice(m[0].length) };
  } catch (e) {
    return { meta: null, body: raw, error: e.message };
  }
}

function loadAll() {
  const dir = WORKFLOW_DIR();
  if (!fs.existsSync(dir)) return [];

  const out = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
    const file = path.join(dir, f);
    const parsed = parseFile(file);
    if (!parsed) continue; // WORKFLOW.md and other prose carry no frontmatter
    out.push({
      file,
      fileName: f.replace(/\.md$/, ''),
      meta: parsed.meta || {},
      parseError: parsed.error || null,
    });
  }
  return out;
}

const isLegacy = (wf) => wf.meta.format === 'legacy';
const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

// ───────────────────────────── Validation ─────────────────────────────

function agentExists(agent) {
  return fs.existsSync(path.join(PATHS.SYSTEM, agent, 'AGENT.md'));
}

function skillExists(agent, skill) {
  return fs.existsSync(path.join(PATHS.SYSTEM, agent, 'skills', `${skill}.md`));
}

function npmScripts() {
  try {
    return Object.keys(JSON.parse(fs.readFileSync(path.join(PATHS.ROOT, 'package.json'), 'utf-8')).scripts || {});
  } catch {
    return [];
  }
}

/**
 * @returns {{level: 'ERROR'|'WARN', msg: string}[]}
 * Legacy runbooks (format: legacy) are only checked for being triggerable, since
 * their steps live in free-form prose.
 */
function validate(wf, all = [wf]) {
  const issues = [];
  const err = (msg) => issues.push({ level: 'ERROR', msg });
  const warn = (msg) => issues.push({ level: 'WARN', msg });
  const m = wf.meta;

  if (wf.parseError) {
    err(`Frontmatter is not valid YAML. The usual cause is a value containing ": " that is not wrapped in double quotes. (${String(wf.parseError).split('\n')[0]})`);
    return issues;
  }

  // A fresh draft from `new` still holds <...> placeholders; it must not pass.
  const leftovers = JSON.stringify(m).match(/<[^<>"]{1,60}>/g);
  if (leftovers) err(`Unfilled placeholder(s) left from the template: ${[...new Set(leftovers)].slice(0, 3).join(' ')}`);

  if (m.name !== wf.fileName) err(`name "${m.name}" must equal the filename "${wf.fileName}"`);
  if (!m.title) err('Missing `title`');
  if (!m.description) err('Missing `description`');

  const triggers = asList(m.triggers);
  const minTriggers = isLegacy(wf) ? 1 : 2;
  if (triggers.length < minTriggers) {
    err(`Needs at least ${minTriggers} trigger phrase(s), found ${triggers.length}`);
  }
  for (const t of triggers) {
    if (tokens(t).length < 2) err(`Trigger "${t}" is too short — use at least two meaningful words so it does not match everything`);
  }

  // A phrase must resolve to exactly one workflow.
  for (const t of triggers) {
    const key = tokens(t).join(' ');
    for (const other of all) {
      if (other === wf) continue;
      if (asList(other.meta.triggers).some((x) => tokens(x).join(' ') === key)) {
        err(`Trigger "${t}" is also used by ${other.fileName}`);
      }
    }
  }

  if (isLegacy(wf)) return issues;

  const steps = asList(m.steps);
  if (steps.length === 0) {
    err('Needs at least one step');
    return issues;
  }

  const scripts = npmScripts();
  let askSeen = false;
  let readinessSeen = false;
  let confirmSeen = false;

  steps.forEach((s, i) => {
    const at = `Step ${i + 1}`;
    const gates = asList(s.gate);

    for (const g of gates) {
      if (!GATES.has(g)) err(`${at}: unknown gate "${g}" (use ${[...GATES].join(' / ')})`);
    }

    if (s.tool) {
      if (!scripts.includes(s.tool)) err(`${at}: tool "${s.tool}" is not an npm script in package.json`);
      if (s.tool === 'gate') askSeen = true;
      if (s.tool === 'readiness') readinessSeen = true;
    } else if (!s.agent) {
      err(`${at}: needs either \`agent\` + \`skill\`, or \`tool\``);
    } else if (!agentExists(s.agent)) {
      err(`${at}: agent "${s.agent}" does not exist under qa-system/`);
    } else if (!s.skill) {
      err(`${at}: agent "${s.agent}" needs a \`skill\``);
    } else if (!skillExists(s.agent, s.skill)) {
      err(`${at}: skill "${s.skill}" does not exist for agent "${s.agent}"`);
    }

    if (s.output != null) {
      const o = String(s.output);
      if (path.isAbsolute(o) || o.split(/[\\/]/).includes('..')) {
        err(`${at}: output "${o}" must stay inside OUTPUT/<slug>/ (no absolute path, no "..")`);
      }
    }

    if (gates.includes('ask')) askSeen = true;
    if (gates.includes('readiness')) readinessSeen = true;
    if (gates.includes('confirm')) confirmSeen = true;

    // The ASK gate must precede any stage 3-6 work: a workflow may not skip it.
    if (STAGE_SKILLS.has(s.skill) && !askSeen) {
      err(`${at}: "${s.skill}" produces a stage 3-6 deliverable, so the ASK gate must come first (add \`gate: ask\` here or a \`tool: gate\` step before)`);
    }

    // Automation needs a GO from readiness AND an explicit user request.
    if (s.agent === 'qa-automation') {
      if (!readinessSeen) err(`${at}: automation requires a readiness check first (\`gate: readiness\`) — AGENTS.md §1.5`);
      if (!confirmSeen) err(`${at}: automation requires explicit user confirmation with a target URL (\`gate: confirm\`) — AGENTS.md §1.5`);
    }
  });

  if (!m.description || String(m.description).length > 200) {
    warn('Keep `description` to one sentence (under 200 characters)');
  }

  return issues;
}

// ───────────────────────────── Matching ─────────────────────────────

/**
 * @returns {{name, title, score, trigger}[]} best first; only scores >= 0.6.
 * Score = share of a trigger's words found in the phrase, plus a small bonus when
 * the phrase is barely longer than the trigger (a tight match beats a loose one).
 */
function find(phrase, all = loadAll()) {
  const p = new Set(tokens(phrase));
  const results = [];

  for (const wf of all) {
    let best = { score: 0, trigger: null };
    for (const t of asList(wf.meta.triggers)) {
      const tt = tokens(t);
      if (tt.length === 0) continue;
      const hit = tt.filter((w) => p.has(w)).length;
      let score = hit / tt.length;
      if (score === 1 && p.size <= tt.length + 2) score = Math.min(1, score + 0.1);
      if (score > best.score) best = { score, trigger: t };
    }
    if (best.score >= 0.6) {
      results.push({ name: wf.fileName, title: wf.meta.title, score: Math.round(best.score * 100) / 100, trigger: best.trigger });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/** Decide whether the top result is safe to run or the user must choose. */
function resolve(results) {
  if (results.length === 0) return { status: 'none' };
  const [top, second] = results;
  if (top.score >= 0.8 && (!second || top.score - second.score >= 0.2)) {
    return { status: 'match', match: top };
  }
  return { status: 'ambiguous', candidates: results.slice(0, 3) };
}

// ───────────────────────────── Run plan ─────────────────────────────

function buildPlan(wf, slug = '<slug>') {
  const steps = asList(wf.meta.steps).map((s, i) => {
    const gates = asList(s.gate).map((g) => ({ gate: g, command: GATE_COMMAND[g](slug) }));
    const base = { n: i + 1, gates, note: s.note || '' };

    if (s.tool) return { ...base, kind: 'tool', run: `npm run ${s.tool} ${slug}`.trim() };
    return {
      ...base,
      kind: 'skill',
      agent: s.agent,
      skill: s.skill,
      read: `qa-system/${s.agent}/skills/${s.skill}.md`,
      write: s.output ? `OUTPUT/${slug}/${s.output}` : null,
    };
  });
  return { name: wf.fileName, title: wf.meta.title, slug, steps };
}

function renderPlan(plan) {
  const lines = [`Workflow ${plan.name} — ${plan.title}`, `Task slug: ${plan.slug}`, ''];
  for (const s of plan.steps) {
    lines.push(
      s.kind === 'tool'
        ? ` ${s.n}. run: ${s.run}`
        : ` ${s.n}. ${s.agent} / ${s.skill}\n      read:  ${s.read}${s.write ? `\n      write: ${s.write}` : ''}`
    );
    for (const g of s.gates) lines.push(`      gate before this step: ${g.gate} -> ${g.command}`);
    if (s.note) lines.push(`      note: ${s.note}`);
  }
  return lines.join('\n');
}

/** Appends the plan to 00_plan.md as a checklist, so `status` and "continue" see it. */
function start(name, slug, all = loadAll()) {
  const wf = all.find((w) => w.fileName === name);
  if (!wf) throw new Error(`No workflow named "${name}"`);
  if (isLegacy(wf)) {
    throw new Error(`"${name}" is a legacy runbook with no machine-readable steps; read ${path.relative(PATHS.ROOT, wf.file)} and follow it`);
  }

  const errors = validate(wf, all).filter((i) => i.level === 'ERROR');
  if (errors.length) throw new Error(`"${name}" is invalid:\n  - ${errors.map((e) => e.msg).join('\n  - ')}`);

  const planPath = path.join(taskDir(slug), '00_plan.md');
  if (!fs.existsSync(planPath)) {
    throw new Error(`No ${path.relative(PATHS.ROOT, planPath)} — ingest the documents first (npm run intake)`);
  }

  const header = `## Workflow: ${name}`;
  const current = fs.readFileSync(planPath, 'utf-8');
  if (current.includes(header)) return { added: false, plan: buildPlan(wf, slug) };

  const plan = buildPlan(wf, slug);
  const block = [
    '',
    header,
    `*${wf.meta.title}* — started ${new Date().toISOString().slice(0, 10)}`,
    '',
  ];
  for (const s of plan.steps) {
    for (const g of s.gates) block.push(`- [ ] **Cổng trước bước ${s.n}** (${g.gate}): \`${g.command}\``);
    block.push(
      s.kind === 'tool'
        ? `- [ ] **Bước ${s.n}**: \`${s.run}\``
        : `- [ ] **Bước ${s.n}**: ${s.agent}/${s.skill}${s.write ? ` ➔ \`${s.write.replace(`OUTPUT/${slug}/`, '')}\`` : ''}`
    );
  }

  fs.appendFileSync(planPath, block.join('\n') + '\n', 'utf-8');
  return { added: true, plan };
}

// ───────────────────────────── Scaffolding ─────────────────────────────

function scaffold(name) {
  if (!/^run-[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    throw new Error('Name must look like run-<words-with-dashes>, e.g. run-quick-check');
  }
  const dest = path.join(WORKFLOW_DIR(), `${name}.md`);
  if (fs.existsSync(dest)) throw new Error(`${path.relative(PATHS.ROOT, dest)} already exists — never overwritten`);
  if (!fs.existsSync(TEMPLATE())) throw new Error(`Template missing: ${path.relative(PATHS.ROOT, TEMPLATE())}`);

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, fs.readFileSync(TEMPLATE(), 'utf-8').replace(/__NAME__/g, name), 'utf-8');
  return dest;
}

// ───────────────────────────── CLI ─────────────────────────────

function flag(args, name) {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1];
}

function printIssues(wf, issues) {
  const errors = issues.filter((i) => i.level === 'ERROR');
  const label = errors.length ? 'INVALID' : issues.length ? 'ok (warnings)' : 'ok';
  console.log(`  ${wf.fileName.padEnd(30)} ${label}`);
  issues.forEach((i) => console.log(`      ${i.level === 'ERROR' ? 'ERROR' : 'warn '} ${i.msg}`));
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const args = rest.filter((a) => !a.startsWith('--') || ['--json'].includes(a));
  const all = loadAll();

  try {
    if (!cmd || cmd === 'list') {
      console.log(`\n${all.length} workflow(s) in qa-system/workflows/\n`);
      for (const wf of all) {
        const kind = isLegacy(wf) ? 'legacy' : 'v1    ';
        console.log(`  ${kind}  ${wf.fileName.padEnd(28)} ${wf.meta.title || ''}`);
        asList(wf.meta.triggers).slice(0, 2).forEach((t) => console.log(`                 say: "${t}"`));
      }
      console.log('\n  Create one:  describe the process to the QA Leader, or `workflow new <name>`');
      console.log('  Run one:     say one of its trigger phrases\n');
      return;
    }

    if (cmd === 'find') {
      const phrase = args.filter((a) => a !== '--json').join(' ');
      if (!phrase) throw new Error('find needs a phrase');
      const results = find(phrase, all);
      const decision = resolve(results);
      if (rest.includes('--json')) {
        console.log(JSON.stringify({ phrase, ...decision, results }, null, 2));
      } else if (decision.status === 'match') {
        console.log(`MATCH ${decision.match.name} (score ${decision.match.score}, via "${decision.match.trigger}")`);
      } else if (decision.status === 'ambiguous') {
        console.log('AMBIGUOUS — ask the user which one:');
        decision.candidates.forEach((c) => console.log(`  - ${c.name} (${c.score}) ${c.title}`));
      } else {
        console.log('NONE — no workflow matches. Offer to create one from a description.');
      }
      process.exit(decision.status === 'match' ? 0 : decision.status === 'ambiguous' ? 1 : 2);
    }

    if (cmd === 'show' || cmd === 'start') {
      const name = args[0];
      const slug = flag(rest, '--slug');
      if (!name) throw new Error(`${cmd} needs a workflow name`);

      if (cmd === 'start') {
        if (!slug) throw new Error('start needs --slug <task-slug>');
        const r = start(name, slug, all);
        console.log(renderPlan(r.plan));
        console.log(r.added ? `\nChecklist appended to OUTPUT/${slug}/00_plan.md` : `\nAlready in OUTPUT/${slug}/00_plan.md — not added twice`);
        return;
      }

      const wf = all.find((w) => w.fileName === name);
      if (!wf) throw new Error(`No workflow named "${name}"`);
      if (isLegacy(wf)) {
        console.log(`${name} is a legacy runbook. Read and follow: ${path.relative(PATHS.ROOT, wf.file)}`);
        return;
      }
      console.log(renderPlan(buildPlan(wf, slug || '<slug>')));
      return;
    }

    if (cmd === 'new') {
      if (!args[0]) throw new Error('new needs a name, e.g. run-quick-check');
      console.log(`Created ${path.relative(PATHS.ROOT, scaffold(args[0]))}`);
      console.log('Fill in title, description, triggers and steps, then: npm run workflow -- validate ' + args[0]);
      return;
    }

    if (cmd === 'validate') {
      const target = args[0] ? all.filter((w) => w.fileName === args[0]) : all;
      if (target.length === 0) throw new Error(args[0] ? `No workflow named "${args[0]}"` : 'No workflows to validate');
      let bad = 0;
      console.log('');
      for (const wf of target) {
        const issues = validate(wf, all);
        if (issues.some((i) => i.level === 'ERROR')) bad++;
        printIssues(wf, issues);
      }
      console.log('');
      process.exit(bad ? 1 : 0);
    }

    throw new Error(`Unknown command "${cmd}". Use: list | find | show | start | new | validate`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { loadAll, validate, find, resolve, buildPlan, start, scaffold, tokens, parseFile };

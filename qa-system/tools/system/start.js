#!/usr/bin/env node
/**
 * start.js — One door: where am I, what is mine, what do I do next.
 *
 *   environment()    Dependency and browser checks, reported only when failing.
 *   tasks()          Per-task progress and gate state.
 *   nextStep(list)   The next action, phrased as something to say to the agent.
 *
 * The repo holds 100+ files across 50 folders and the users are QA/BA/PO, not
 * developers. Hiding folders does not fix that; stating who owns what does.
 *
 * Printed output stays in Vietnamese on purpose — this command exists to be read
 * by the user, not by the agent.
 *
 * Usage: npm start
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, listTaskSlugs } = require('../lib/paths');
const { deliverableProgress } = require('../lib/schema');

/** Agents = qa-* folders under qa-system/ that hold an AGENT.md. */
function agentCount() {
  try {
    return fs.readdirSync(PATHS.SYSTEM).filter((d) => fs.existsSync(path.join(PATHS.SYSTEM, d, 'AGENT.md'))).length;
  } catch {
    return 0;
  }
}

/** Loose documents in INPUT/: the same rule intake uses (README.md, .gitkeep … are not documents). */
function looseDocs() {
  try {
    return require('../intake/intake').looseFiles();
  } catch {
    const META = new Set(['readme.md', 'readme.txt', '.gitkeep', '.keep', 'index.md']);
    if (!fs.existsSync(PATHS.INPUT)) return [];
    return fs.readdirSync(PATHS.INPUT).filter((f) => !f.startsWith('.') && !META.has(f.toLowerCase()) && fs.statSync(path.join(PATHS.INPUT, f)).isFile());
  }
}

const W = 68;
const line = (c = '─') => c.repeat(W);
const has = (p) => fs.existsSync(path.join(PATHS.ROOT, p));

// ───────────────────── Ownership map ─────────────────────

const ZONES = [
  {
    title: 'YOURS — add, edit, delete freely',
    icon: '📥',
    rows: [
      ['INPUT/', 'Drop BA/PRD/API/Figma documents here. Drag and drop is enough.'],
      ['OUTPUT/', 'Agent-generated results. Read, edit, submit from here.'],
    ],
  },
  {
    title: 'SHARED — you and the agent both write',
    icon: '🧠',
    rows: [
      ['knowledge/', 'Accumulated knowledge: settled rules, BA answers.'],
      ['', 'The only thing that outlives OUTPUT/. Lose it and the BA must be asked again.'],
    ],
  },
  {
    title: 'MACHINERY — touch only when deliberately upgrading the system',
    icon: '⚙️',
    rows: [
      ['qa-system/', `${agentCount() || 'The'} QA agents + skills + tools. Editing here = upgrading the system.`],
      ['automation/', 'Playwright code for the system under test. Only needed for automation.'],
    ],
  },
  {
    title: 'READ-ONLY — no need to edit',
    icon: '📖',
    rows: [
      ['AGENTS.md', 'Constitution for every AI agent. Agents read it themselves; you need not.'],
    ],
  },
];

// ───────────────────── Environment checks ─────────────────────

function environment() {
  const checks = [];
  checks.push({
    ok: has('node_modules'),
    label: 'Dependencies installed',
    fix: 'The agent will run `npm install` itself',
  });

  // Playwright caches browsers outside the repo; this is the slowest setup step.
  const cache =
    process.platform === 'darwin'
      ? path.join(process.env.HOME || '', 'Library', 'Caches', 'ms-playwright')
      : process.platform === 'win32'
      ? path.join(process.env.LOCALAPPDATA || '', 'ms-playwright')
      : path.join(process.env.HOME || '', '.cache', 'ms-playwright');

  const hasBrowser =
    fs.existsSync(cache) && fs.readdirSync(cache).some((d) => d.startsWith('chromium'));
  checks.push({
    ok: hasBrowser,
    label: 'Playwright browser',
    fix: 'The agent will run `npx playwright install chromium` itself (~150 MB)',
  });

  return checks;
}

// ───────────────────── Work in progress ─────────────────────

function tasks() {
  return listTaskSlugs().map((slug) => {
    const dir = taskDir(slug);
    const planPath = path.join(dir, '00_plan.md');
    const plan = fs.existsSync(planPath) ? fs.readFileSync(planPath, 'utf-8') : '';
    let done = (plan.match(/- \[x\]/gi) || []).length;
    const todo = (plan.match(/- \[ \]/g) || []).length;
    let total = done + todo;
    let fromFiles = false;
    // Plan without ticks: measure from the deliverables actually present (meta verdict PASS = done).
    if (done === 0) {
      const p = deliverableProgress(slug);
      if (p.present > 0) { done = p.done; total = p.total; fromFiles = true; }
    }

    let gateBlocked = false;
    try {
      const g = require('./gate').evaluate(slug);
      // Before Stage 2 the gate is closed by design (fail-closed) but there is no question yet
      // to wait on the BA — that is "in progress", not "blocked".
      gateBlocked = g.blocked && g.phase !== 'pre-stage-2';
    } catch {
      /* treat a gate error as open; never block viewing progress */
    }

    return { slug, done, total, fromFiles, gateBlocked };
  });
}

/** The next action, phrased as a sentence the user can say to the agent. */
function nextStep(list) {
  const loose = looseDocs();

  if (loose.length) {
    return [
      `${loose.length} loose document(s) in INPUT/ have not been taken in yet.`,
      `Tell the agent:  "I just put documents into INPUT, please process them"`,
    ];
  }

  if (list.length === 0) {
    return [
      'No task yet. Start by dragging the BA documents into the INPUT/ folder.',
      `Then tell the agent:  "I just put documents into INPUT, please process them"`,
    ];
  }

  const blocked = list.find((t) => t.gateBlocked);
  if (blocked) {
    return [
      `Task "${blocked.slug}" is BLOCKED: questions are still unanswered by the BA.`,
      `Tell the agent:  "Show me the pending questions of ${blocked.slug}"`,
    ];
  }

  const doing = list.find((t) => t.total > 0 && t.done < t.total) || list[0];
  return [
    `Task "${doing.slug}" is in progress (${doing.done}/${doing.total} stages).`,
    `Tell the agent:  "Continue"`,
  ];
}

// ───────────────────── Render ─────────────────────

function main() {
  const list = tasks();

  console.log(`\n${line('━')}`);
  console.log('  QA AGENT SYSTEM — WHERE TO START');
  console.log(line('━'));

  console.log('\n  You do NOT need to type terminal commands. Just talk to the agent');
  console.log('  in plain language. The agent runs everything behind the scenes.\n');

  // Next action first: it is the most urgent question.
  console.log(line());
  console.log('  👉 WHAT TO DO NEXT');
  console.log(line());
  nextStep(list).forEach((l) => console.log(`  ${l}`));

  // Current tasks.
  if (list.length) {
    console.log(`\n${line()}`);
    console.log('  📋 CURRENT WORK');
    console.log(line());
    for (const t of list) {
      const bar = t.total ? `${t.done}/${t.total} stages${t.fromFiles ? ' (counted from files 01–06 with PASS)' : ''}` : 'no plan yet';
      const flag = t.gateBlocked ? '  ⛔ blocked (waiting for BA answers)' : '';
      console.log(`  • ${t.slug.padEnd(30)} ${bar}${flag}`);
    }
  }

  // Ownership map: the part that actually answers "what am I allowed to touch".
  console.log(`\n${line()}`);
  console.log('  🗺️  WHOSE FOLDER IS WHICH');
  console.log(line());
  for (const z of ZONES) {
    console.log(`\n  ${z.icon} ${z.title}`);
    for (const [name, desc] of z.rows) {
      console.log(`     ${name.padEnd(14)} ${desc}`);
    }
  }

  // Environment: mentioned only when something is missing, to avoid noise.
  const env = environment();
  const missing = env.filter((c) => !c.ok);
  if (missing.length) {
    console.log(`\n${line()}`);
    console.log('  ⚠️  ENVIRONMENT NOT READY');
    console.log(line());
    missing.forEach((c) => console.log(`  • ${c.label} — ${c.fix}`));
    console.log('\n  Tell the agent: "Please set up the environment"');
  }

  console.log(`\n${line('━')}\n`);
}

if (require.main === module) main();

module.exports = { tasks, nextStep, looseDocs, agentCount };

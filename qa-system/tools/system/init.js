#!/usr/bin/env node
/**
 * init.js — Scaffolds a whole project in one command.
 *
 *   stepInput / stepOutput / stepKnowledge / stepAutomation  Create each area.
 *   stepInstall()  Install dependencies and the Playwright browser.
 *
 * Users are QA/BA/PO. Dropping this agent system into a new project, they do not
 * know to hand-create INPUT/ with its five bins, OUTPUT/, knowledge/ from the
 * templates, or automation/ with a Playwright config. Miss one and the system
 * half-runs, then fails with an opaque error.
 *
 * Materialises everything from `qa-system/templates/`, installs dependencies and
 * self-checks. Idempotent: it only ever adds what is missing and NEVER overwrites.
 *
 * Printed output stays in Vietnamese on purpose — this command is read by the user.
 *
 * Usage:
 *   init.js                Scaffold, install, self-check
 *   init.js --dry-run      List what would happen, touch nothing
 *   init.js --no-install   Skip dependency installation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PATHS } = require('../lib/paths');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const noInstall = args.includes('--no-install');

const W = 68;
const line = (c = '─') => c.repeat(W);

const created = [];
const skipped = [];

// ───────────────────── Filesystem helpers ─────────────────────

const rel = (p) => path.relative(PATHS.ROOT, p) || '.';

function ensureDir(p, note = '') {
  if (fs.existsSync(p)) { skipped.push(rel(p) + '/'); return false; }
  if (!dryRun) fs.mkdirSync(p, { recursive: true });
  created.push({ what: rel(p) + '/', note });
  return true;
}

/** Copies only when the destination is absent. Never overwrites. */
function ensureFile(src, dest, note = '') {
  if (fs.existsSync(dest)) { skipped.push(rel(dest)); return false; }
  if (!dryRun) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
  created.push({ what: rel(dest), note });
  return true;
}

function writeFile(dest, content, note = '') {
  if (fs.existsSync(dest)) { skipped.push(rel(dest)); return false; }
  if (!dryRun) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content, 'utf-8');
  }
  created.push({ what: rel(dest), note });
  return true;
}

// ───────────────────── Signpost content (user-facing) ─────────────────────

const INPUT_README = `# INPUT/ — Source documents · **YOURS**

Drag the BA documents here (\`.docx\` \`.pdf\` \`.xlsx\` \`.md\`…), then tell the agent:

> *"I just put documents into INPUT, please process them"*

The agent converts them to clean Markdown, files them into 5 bins, and scaffolds the workspace.
**You do not need to create folders yourself.**

| Bin | Holds |
|---|---|
| \`01_business/\` | Direction, policy, business problem |
| \`02_ba/\` | **Required.** PRD, SRS, User Story, Use Case |
| \`03_dev/\` | API Swagger/OpenAPI, DB schema, tech spec |
| \`04_design/\` | Figma, wireframe, screenshots |
| \`05_communication/\` | Q&A with the BA, meeting minutes, Change Requests |

> The agent **only reads** this folder and never edits your original documents.
`;

const OUTPUT_README = `# OUTPUT/ — Results · **YOURS**

One folder per feature, \`OUTPUT/<task-name>/\`:

| File | What it is |
|---|---|
| \`00_plan.md\` | Progress map. The agent ticks \`[x]\` here after each stage. |
| \`01_\` → \`06_\` | The six test-design stages |
| \`09_\` → \`12_\` | Test data (when needed) |
| \`15_readiness_*\` | Readiness assessment before automation |
| \`runs/RUN-XX/\` | Test run results + **evidence screenshots** for submission |

To see where you are, say: *"What is the progress?"*

> ⚠️ \`OUTPUT/\` is the **deliverable, kept long term**: test run evidence, test cases,
> the Jira mapping table. Many tools read it back — \`jira:sync\` attaches evidence images to Jira,
> \`lint\` and \`readiness\` score these very files. Delete it and it is gone; it cannot be re-run.
>
> Holds only task folders, one per feature. No folder starts with \`_\`:
> templates live in \`qa-system/templates/\`, upgrade records in \`qa-system/_upgrades/\`,
> scratch runs in \`.scratch/\`.
>
> Business rules settled by the BA live in \`knowledge/\`, not here.
`;

const KNOWLEDGE_README = `# knowledge/ — Project memory · **SHARED**

This is the **only thing that outlives \`OUTPUT/\`**. Delete \`OUTPUT/\` and re-run and
the agent still remembers; delete \`knowledge/\` and the BA must be asked again from scratch.

| File | Who fills it |
|---|---|
| \`_project.md\` | Human — project conventions: currency, timezone, test environment |
| \`_glossary.md\` | Human — business glossary |
| \`_sut.json\` | Human — the system under test; \`domain\` = domain pack (empty = none selected) |
| \`_domain.md\` | Human, optional — project-specific additions to the domain pack |
| \`_system_map.json\` | Agent syncs it — routing map, do not edit by hand |
| \`features/<task>.md\` | Agent writes, **you review** — settled rules, BA answers |

When the BA answers a pending question, tell the agent:
*"The BA settled: [content]"* — the agent writes it into the right section.
`;

const BIN_README = (bin, desc) => `# ${bin}

${desc}

> This is a sample folder. When you drop documents into \`INPUT/\`, the agent creates
> a separate \`INPUT/<task-name>/${bin}/\` for each feature.
`;

const BINS = [
  ['01_business', 'Direction, policy, high-level business problem.'],
  ['02_ba', '**Required.** PRD, SRS, User Story, Use Case — documents describing the feature.'],
  ['03_dev', 'API Swagger/OpenAPI, DB schema, technical spec.'],
  ['04_design', 'Figma links, wireframes, screenshots.'],
  ['05_communication', 'Q&A with the BA, meeting minutes, Change Requests.'],
];

// ───────────────────── Scaffold steps ─────────────────────

function stepInput() {
  ensureDir(PATHS.INPUT, 'where you drop BA documents');
  writeFile(path.join(PATHS.INPUT, 'README.md'), INPUT_README, 'signpost');
  const tpl = path.join(PATHS.INPUT, '_template');
  ensureDir(tpl, '5-bin template for a new task');
  for (const [bin, desc] of BINS) {
    ensureDir(path.join(tpl, bin));
    writeFile(path.join(tpl, bin, 'README.md'), BIN_README(bin, desc));
  }
}

function stepOutput() {
  ensureDir(PATHS.OUTPUT, 'where the agent writes results');
  writeFile(path.join(PATHS.OUTPUT, 'README.md'), OUTPUT_README, 'signpost');

  // The run template lives in `qa-system/templates/run/`; it is no longer built here.
  // It used to be in `OUTPUT/_template_run/` and init GENERATED a 2-line stub,
  // far poorer than the real one in the repo — so new projects received a deficient template.
  // OUTPUT/ now holds only task folders, nothing starting with `_`.
}

function stepKnowledge() {
  ensureDir(PATHS.KNOWLEDGE, 'project memory');
  ensureDir(PATHS.FEATURES, 'per-feature knowledge');
  writeFile(path.join(PATHS.KNOWLEDGE, 'README.md'), KNOWLEDGE_README, 'signpost');

  const seed = path.join(PATHS.TEMPLATES, 'knowledge');
  if (!fs.existsSync(seed)) return;
  for (const f of fs.readdirSync(seed)) {
    ensureFile(path.join(seed, f), path.join(PATHS.KNOWLEDGE, f), 'from template');
  }
}

function stepAutomation() {
  const src = path.join(PATHS.TEMPLATES, 'automation');
  if (!fs.existsSync(src)) return;

  ensureDir(PATHS.AUTOMATION, 'connector to the system under test');
  // Recursive: the template has a `utils/` subfolder (evidence.ts, devices.js); copyFileSync on a directory fails.
  const copyTree = (from, to) => {
    for (const f of fs.readdirSync(from)) {
      const s = path.join(from, f);
      if (fs.statSync(s).isDirectory()) copyTree(s, path.join(to, f));
      else ensureFile(s, path.join(to, f), 'from template');
    }
  };
  copyTree(src, PATHS.AUTOMATION);
  // The two directories the qa-automation agent writes code into.
  ensureDir(path.join(PATHS.AUTOMATION, 'pages'), 'Page Object Model — generated by the agent');
  ensureDir(path.join(PATHS.AUTOMATION, 'tests'), 'test scripts — generated by the agent');
}

// ───────────────────── Dependencies ─────────────────────

function run(cmd, label) {
  process.stdout.write(`  ${label}… `);
  if (dryRun) { console.log('(skipped, --dry-run)'); return true; }
  try {
    execSync(cmd, { cwd: PATHS.ROOT, stdio: 'pipe' });
    console.log('✅');
    return true;
  } catch (e) {
    console.log('❌');
    console.log(`     ${String(e.stderr || e.message).split('\n')[0].slice(0, 100)}`);
    return false;
  }
}

function stepInstall() {
  if (noInstall) { console.log('  (install skipped by --no-install)'); return true; }

  let ok = true;
  if (!fs.existsSync(path.join(PATHS.ROOT, 'node_modules'))) {
    ok = run('npm install', 'Install Node dependencies') && ok;
  } else {
    console.log('  Install Node dependencies… ✅ (already present)');
  }

  const cache =
    process.platform === 'darwin'
      ? path.join(process.env.HOME || '', 'Library', 'Caches', 'ms-playwright')
      : process.platform === 'win32'
      ? path.join(process.env.LOCALAPPDATA || '', 'ms-playwright')
      : path.join(process.env.HOME || '', '.cache', 'ms-playwright');

  const hasBrowser = fs.existsSync(cache) && fs.readdirSync(cache).some((d) => d.startsWith('chromium'));
  if (!hasBrowser) {
    ok = run('npx playwright install chromium', 'Download Playwright browser (~150 MB)') && ok;
  } else {
    console.log('  Playwright browser… ✅ (already present)');
  }
  return ok;
}

// ───────────────────── Run ─────────────────────

function main() {
  console.log(`\n${line('━')}`);
  console.log(`  QA AGENT SYSTEM INITIALISATION${dryRun ? '   (--dry-run: writes nothing)' : ''}`);
  console.log(line('━'));

  console.log('\n  Step 1/4 — Build the folder skeleton');
  stepInput();
  stepOutput();
  stepKnowledge();
  stepAutomation();

  if (created.length) {
    created.forEach((c) => console.log(`     + ${c.what.padEnd(34)} ${c.note}`));
  } else {
    console.log('     ✅ Skeleton complete, nothing more to create.');
  }
  if (skipped.length) {
    console.log(`     (kept ${skipped.length} existing item(s) — this command never overwrites)`);
  }

  console.log('\n  Step 2/4 — Install dependencies');
  const installOk = stepInstall();

  if (!dryRun) {
    try {
      const h = require('./precommit').install();
      console.log(`     ${h.ok ? '✅' : 'ℹ️ '} Git pre-commit (blocks commits of fabricated/misformatted deliverables, for every AI tool): ${h.note}`);
    } catch (e) {
      console.log(`     ℹ️  Could not install git pre-commit: ${e.message}`);
    }
  }

  console.log('\n  Step 3/4 — System self-check');
  const checkOk = dryRun ? true : run('npm run --silent agent:check', 'Agent integrity check');

  console.log('\n  Step 4/4 — Done\n');
  console.log(line());
  if (dryRun) {
    console.log('  This is a preview. Drop `--dry-run` to build for real.');
  } else if (installOk && checkOk) {
    console.log('  ✅ System ready.\n');
    console.log('  Next steps:');
    console.log('    1. Drag the BA documents into the INPUT/ folder');
    console.log('    2. Tell the agent: "I just put documents into INPUT, please process them"');
    console.log('\n  If you forget what you were doing, run: npm start');
  } else {
    console.log('  ⚠️  The skeleton is built but a step above did not succeed.');
    console.log('     See the ❌ line, fix it, then re-run `npm run init`.');
  }
  console.log(`${line()}\n`);

  process.exit(dryRun || (installOk && checkOk) ? 0 : 1);
}

if (require.main === module) main();

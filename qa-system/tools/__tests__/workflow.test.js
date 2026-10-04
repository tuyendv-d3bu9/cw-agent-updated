/**
 * Tests for the workflow registry, validator and launcher.
 *
 * The validator's whole value is that a workflow CANNOT bypass the gates: stage
 * 3-6 work needs the ASK gate first, automation needs readiness plus an explicit
 * confirmation. Each of those rules gets a case that fails if the rule is removed.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { useTempProject, write, PATHS } = require('./helpers');
const wf = require('../system/workflow');

/** A minimal project: two agents with real skill files, and the npm scripts workflows may call. */
function project() {
  const t = useTempProject();
  write('package.json', JSON.stringify({ scripts: { gate: 'x', lint: 'x', readiness: 'x' } }));
  for (const [agent, skills] of Object.entries({
    'qa-analyst': ['requirement-risk-summary', 'missing-rule-06w', 'viewpoint-selection'],
    'qa-test-design': ['test-case-generation', 'coverage-review'],
    'qa-automation': ['pom-generator'],
  })) {
    write(`qa-system/${agent}/AGENT.md`, '# agent');
    skills.forEach((s) => write(`qa-system/${agent}/skills/${s}.md`, '# skill'));
  }
  return t;
}

/** Writes a v1 workflow file; `over` replaces top-level fields. */
function addWorkflow(name, over = {}) {
  const meta = {
    name,
    title: 'Sample workflow',
    description: 'A sample.',
    format: 'v1',
    triggers: ['run the sample', 'start sample flow'],
    steps: [{ agent: 'qa-analyst', skill: 'requirement-risk-summary', output: '01_x.md' }],
    ...over,
  };
  write(`qa-system/workflows/${name}.md`, `---\n${yaml.dump(meta)}---\n\n# Body\n`);
  return meta;
}

const errorsOf = (name) => {
  const all = wf.loadAll();
  const w = all.find((x) => x.fileName === name);
  return wf.validate(w, all).filter((i) => i.level === 'ERROR').map((i) => i.msg);
};

// ───────────── Valid workflows ─────────────

test('a well-formed v1 workflow validates clean', () => {
  const t = project();
  try {
    addWorkflow('run-ok');
    assert.deepStrictEqual(errorsOf('run-ok'), []);
  } finally { t.cleanup(); }
});

test('ignores markdown without frontmatter (e.g. the WORKFLOW.md index)', () => {
  const t = project();
  try {
    write('qa-system/workflows/WORKFLOW.md', '# Index only\n');
    addWorkflow('run-ok');
    assert.deepStrictEqual(wf.loadAll().map((w) => w.fileName), ['run-ok']);
  } finally { t.cleanup(); }
});

// ───────────── Cannot invent resources ─────────────

test('rejects a skill that does not exist', () => {
  const t = project();
  try {
    addWorkflow('run-bad', { steps: [{ agent: 'qa-analyst', skill: 'made-up-skill' }] });
    assert.match(errorsOf('run-bad').join(' '), /skill "made-up-skill" does not exist/);
  } finally { t.cleanup(); }
});

test('rejects an agent that does not exist', () => {
  const t = project();
  try {
    addWorkflow('run-bad', { steps: [{ agent: 'qa-wizard', skill: 'anything' }] });
    assert.match(errorsOf('run-bad').join(' '), /agent "qa-wizard" does not exist/);
  } finally { t.cleanup(); }
});

test('rejects a tool that is not an npm script', () => {
  const t = project();
  try {
    addWorkflow('run-bad', { steps: [{ tool: 'rm-everything' }] });
    assert.match(errorsOf('run-bad').join(' '), /not an npm script/);
  } finally { t.cleanup(); }
});

// ───────────── Cannot bypass the gates ─────────────

test('rejects stage 3-6 work with no ASK gate before it', () => {
  const t = project();
  try {
    addWorkflow('run-bad', { steps: [{ agent: 'qa-analyst', skill: 'viewpoint-selection' }] });
    assert.match(errorsOf('run-bad').join(' '), /ASK gate must come first/);
  } finally { t.cleanup(); }
});

test('accepts stage 3-6 work when the step carries `gate: ask`', () => {
  const t = project();
  try {
    addWorkflow('run-ok', { steps: [{ agent: 'qa-analyst', skill: 'viewpoint-selection', gate: 'ask' }] });
    assert.deepStrictEqual(errorsOf('run-ok'), []);
  } finally { t.cleanup(); }
});

test('accepts stage 3-6 work when an earlier `tool: gate` step precedes it', () => {
  const t = project();
  try {
    addWorkflow('run-ok', { steps: [{ tool: 'gate' }, { agent: 'qa-test-design', skill: 'test-case-generation' }] });
    assert.deepStrictEqual(errorsOf('run-ok'), []);
  } finally { t.cleanup(); }
});

test('the ASK gate must come BEFORE the stage step, not after it', () => {
  const t = project();
  try {
    addWorkflow('run-bad', { steps: [{ agent: 'qa-analyst', skill: 'viewpoint-selection' }, { tool: 'gate' }] });
    assert.match(errorsOf('run-bad').join(' '), /ASK gate must come first/);
  } finally { t.cleanup(); }
});

test('rejects automation with neither readiness nor confirmation', () => {
  const t = project();
  try {
    addWorkflow('run-bad', { steps: [{ agent: 'qa-automation', skill: 'pom-generator' }] });
    const e = errorsOf('run-bad').join(' ');
    assert.match(e, /readiness check first/);
    assert.match(e, /explicit user confirmation/);
  } finally { t.cleanup(); }
});

test('rejects automation with readiness but no confirmation', () => {
  const t = project();
  try {
    addWorkflow('run-bad', { steps: [{ agent: 'qa-automation', skill: 'pom-generator', gate: 'readiness' }] });
    const e = errorsOf('run-bad').join(' ');
    assert.ok(!/readiness check first/.test(e));
    assert.match(e, /explicit user confirmation/);
  } finally { t.cleanup(); }
});

test('accepts automation guarded by both readiness and confirm', () => {
  const t = project();
  try {
    addWorkflow('run-ok', { steps: [{ agent: 'qa-automation', skill: 'pom-generator', gate: ['readiness', 'confirm'] }] });
    assert.deepStrictEqual(errorsOf('run-ok'), []);
  } finally { t.cleanup(); }
});

// ───────────── Safe output paths ─────────────

test('rejects an output path that escapes OUTPUT/<slug>/', () => {
  const t = project();
  try {
    addWorkflow('run-bad', { steps: [{ agent: 'qa-analyst', skill: 'requirement-risk-summary', output: '../../etc/passwd' }] });
    assert.match(errorsOf('run-bad').join(' '), /must stay inside OUTPUT/);
  } finally { t.cleanup(); }
});

// ───────────── Frontmatter and triggers ─────────────

test('flags an unquoted colon with a hint instead of a raw YAML error', () => {
  // Real trap: `description: does this: and that` breaks the whole file.
  const t = project();
  try {
    write('qa-system/workflows/run-bad.md', '---\nname: run-bad\ntitle: "T"\ndescription: does this: and that\nformat: v1\n---\n');
    assert.match(errorsOf('run-bad').join(' '), /wrapped in double quotes/);
  } finally { t.cleanup(); }
});

test('rejects unfilled template placeholders', () => {
  const t = project();
  try {
    addWorkflow('run-bad', { title: '<short title>' });
    assert.match(errorsOf('run-bad').join(' '), /Unfilled placeholder/);
  } finally { t.cleanup(); }
});

test('rejects a name that differs from the filename', () => {
  const t = project();
  try {
    addWorkflow('run-bad', { name: 'run-other' });
    assert.match(errorsOf('run-bad').join(' '), /must equal the filename/);
  } finally { t.cleanup(); }
});

test('rejects fewer than two triggers on a v1 workflow', () => {
  const t = project();
  try {
    addWorkflow('run-bad', { triggers: ['only one phrase'] });
    assert.match(errorsOf('run-bad').join(' '), /at least 2 trigger/);
  } finally { t.cleanup(); }
});

test('rejects a one-word trigger that would match everything', () => {
  const t = project();
  try {
    addWorkflow('run-bad', { triggers: ['go', 'start sample flow'] });
    assert.match(errorsOf('run-bad').join(' '), /too short/);
  } finally { t.cleanup(); }
});

test('rejects a trigger already owned by another workflow', () => {
  const t = project();
  try {
    addWorkflow('run-a', { triggers: ['shared phrase here', 'unique alpha phrase'] });
    addWorkflow('run-b', { triggers: ['Shared  PHRASE here!', 'unique beta phrase'] });
    assert.match(errorsOf('run-b').join(' '), /also used by run-a/);
  } finally { t.cleanup(); }
});

test('legacy runbooks are checked for triggers only, not steps', () => {
  const t = project();
  try {
    write('qa-system/workflows/old-one.md',
      '---\nname: old-one\ntitle: "Old"\ndescription: "Hand written."\nformat: legacy\ntriggers:\n  - "chay quy trinh cu"\n---\n# prose\n');
    assert.deepStrictEqual(errorsOf('old-one'), []);
  } finally { t.cleanup(); }
});

// ───────────── Finding a workflow from a short phrase ─────────────

test('find — a short natural phrase resolves to one workflow', () => {
  const t = project();
  try {
    addWorkflow('run-jira', { triggers: ['đẩy test case lên Jira', 'kéo bug từ Jira về'] });
    addWorkflow('run-verify', { triggers: ['nghiệm thu test case', 'kiểm tra bộ test'] });
    const r = wf.resolve(wf.find('đẩy test case lên jira giúp mình nhé'));
    assert.strictEqual(r.status, 'match');
    assert.strictEqual(r.match.name, 'run-jira');
  } finally { t.cleanup(); }
});

test('find — ignores diacritics and case', () => {
  const t = project();
  try {
    addWorkflow('run-jira', { triggers: ['đẩy test case lên Jira', 'kéo bug từ Jira về'] });
    assert.strictEqual(wf.resolve(wf.find('DAY TEST CASE LEN JIRA')).status, 'match');
  } finally { t.cleanup(); }
});

test('find — a vague phrase is AMBIGUOUS and asks, instead of guessing', () => {
  const t = project();
  try {
    addWorkflow('run-a', { triggers: ['chạy test case nhanh', 'làm test case nhanh'] });
    addWorkflow('run-b', { triggers: ['chạy test case đầy đủ', 'làm test case đầy đủ'] });
    const r = wf.resolve(wf.find('chạy test case'));
    assert.strictEqual(r.status, 'ambiguous');
    assert.ok(r.candidates.length >= 2);
  } finally { t.cleanup(); }
});

test('find — an unrelated phrase matches nothing', () => {
  const t = project();
  try {
    addWorkflow('run-ok');
    assert.strictEqual(wf.resolve(wf.find('hôm nay trời đẹp quá')).status, 'none');
  } finally { t.cleanup(); }
});

// ───────────── Starting a workflow ─────────────

test('start — appends a checklist to 00_plan.md, including the gates', () => {
  const t = project();
  try {
    addWorkflow('run-ok', { steps: [
      { agent: 'qa-analyst', skill: 'requirement-risk-summary', output: '01_x.md' },
      { agent: 'qa-analyst', skill: 'viewpoint-selection', gate: 'ask', output: '03_x.md' },
    ] });
    write('OUTPUT/t/00_plan.md', '# Plan\n- [ ] existing item\n');

    const r = wf.start('run-ok', 't');
    assert.ok(r.added);

    const plan = fs.readFileSync(path.join(PATHS.OUTPUT, 't', '00_plan.md'), 'utf-8');
    assert.match(plan, /## Workflow: run-ok/);
    assert.match(plan, /\*\*Cổng trước bước 2\*\* \(ask\): `npm run gate t`/);
    assert.match(plan, /existing item/, 'existing content must survive');
  } finally { t.cleanup(); }
});

test('start — running twice does not duplicate the checklist', () => {
  const t = project();
  try {
    addWorkflow('run-ok');
    write('OUTPUT/t/00_plan.md', '# Plan\n');
    wf.start('run-ok', 't');
    assert.strictEqual(wf.start('run-ok', 't').added, false);
    const plan = fs.readFileSync(path.join(PATHS.OUTPUT, 't', '00_plan.md'), 'utf-8');
    assert.strictEqual((plan.match(/## Workflow: run-ok/g) || []).length, 1);
  } finally { t.cleanup(); }
});

test('start — refuses an invalid workflow', () => {
  const t = project();
  try {
    addWorkflow('run-bad', { steps: [{ agent: 'qa-analyst', skill: 'viewpoint-selection' }] });
    write('OUTPUT/t/00_plan.md', '# Plan\n');
    assert.throws(() => wf.start('run-bad', 't'), /is invalid/);
  } finally { t.cleanup(); }
});

test('start — refuses when the task has no 00_plan.md yet', () => {
  const t = project();
  try {
    addWorkflow('run-ok');
    assert.throws(() => wf.start('run-ok', 'missing'), /ingest the documents first/);
  } finally { t.cleanup(); }
});

test('start — refuses a legacy runbook, which has no machine-readable steps', () => {
  const t = project();
  try {
    write('qa-system/workflows/old-one.md',
      '---\nname: old-one\ntitle: "Old"\ndescription: "x."\nformat: legacy\ntriggers:\n  - "chay quy trinh cu"\n---\n');
    write('OUTPUT/t/00_plan.md', '# Plan\n');
    assert.throws(() => wf.start('old-one', 't'), /legacy runbook/);
  } finally { t.cleanup(); }
});

// ───────────── Scaffolding ─────────────

test('scaffold — a fresh draft is rejected until it is filled in', () => {
  const t = project();
  try {
    write('qa-system/templates/workflows/workflow.md',
      '---\nname: __NAME__\ntitle: "<title>"\ndescription: "<one line>"\nformat: v1\ntriggers:\n  - "<a>"\n  - "<b>"\nsteps:\n  - agent: qa-analyst\n    skill: requirement-risk-summary\n---\n');
    wf.scaffold('run-draft');
    assert.match(errorsOf('run-draft').join(' '), /Unfilled placeholder/);
  } finally { t.cleanup(); }
});

test('scaffold — never overwrites an existing workflow', () => {
  const t = project();
  try {
    write('qa-system/templates/workflows/workflow.md', '---\nname: __NAME__\n---\n');
    addWorkflow('run-ok');
    assert.throws(() => wf.scaffold('run-ok'), /already exists/);
  } finally { t.cleanup(); }
});

test('scaffold — insists on the run-<words> naming', () => {
  const t = project();
  try {
    assert.throws(() => wf.scaffold('My Workflow'), /must look like run-/);
  } finally { t.cleanup(); }
});

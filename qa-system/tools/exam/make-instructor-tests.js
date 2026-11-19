#!/usr/bin/env node
/**
 * make-instructor-tests.js — Writes the hidden T1/T2 fixtures and tests used by A2d and A6b.
 *
 *   node qa-system/tools/exam/make-instructor-tests.js --exam <id>     → $GRADER_PRIVATE/<id>/instructor-tests/
 *   node qa-system/tools/exam/make-instructor-tests.js --out <dir>     → any directory (test suites use a temp dir)
 *
 * Output (overwritten on every run, so the instructor can regenerate it):
 *   fixtures/riskref-<case>/   one minimal task per case, laid out like a repository root
 *                              (INPUT/<slug>/, OUTPUT/<slug>/01 + 05, knowledge/features/<slug>.md)
 *   t1-risk-ref.test.js        the student's lint on each fixture (Risk Ref present / missing / N/A / empty / unknown id / malformed)
 *   t2-new-agent.test.js       the student's new agent: files, --impact edges, agent:check, Format output headings
 * Tests run INSIDE the grading container with cwd = a copy of the student workspace; they use only node built-ins.
 * The fixtures are generic (no exam content), so they reveal nothing about the benchmark.
 */

const fs = require('fs');
const path = require('path');
const C = require('./lib/common');

const SRC = 'When a customer submits a request, the system records the request with status Pending.';

function tc(id, riskRef) {
  const f = [
    ['Title', 'Verify the request is recorded with status Pending'],
    ['Precondition', '\n  - Customer is signed in'],
    ['Test Steps', '\n  1. Submit a request'],
    ['Test Data', '\n  - Request: any valid request'],
    ['Expected Result', '\n  - The request is recorded with status Pending'],
    ['Priority', 'High'],
    ['Tags', 'Rule#BR-01, Viewpoint#VP-01, Module#FIX, Manual'],
  ];
  if (riskRef !== undefined) f.push(['Risk Ref', riskRef]);
  return `### TC_ID: FIX-${id}\n${f.map(([k, v]) => `- **${k}**:${v === '' ? '' : v.startsWith('\n') ? '' : ' '}${v}`).join('\n')}\n`;
}

function fixture(slug, riskRef) {
  return {
    [`INPUT/${slug}/02_ba/spec.md`]: `# Spec\n\n## 1. Requests\n\n${SRC}\n`,
    [`OUTPUT/${slug}/01_requirement_risk_summary.md`]: `# Requirement Risk Summary · ${slug}
Owner: qa-system/qa-analyst/skills/requirement-risk-summary.md · Nguồn: INPUT/${slug}/ · Verdict: PASS

## 3. BUSINESS RULES
| ID | Điều kiện | Hành vi / Kết quả | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|
| BR-01 | A customer submits a request | The request is recorded with status Pending | 02_ba/spec.md §1 | ${SRC} |

## 10. RISK ANALYSIS
| ID | Rủi ro | Likelihood | Impact | Risk Level | Severity | Cờ tin cậy | Nguồn |
|---|---|---|---|---|---|---|---|
| RK-01 | A request is lost before it is recorded | MEDIUM | HIGH | HIGH | Major | SEVERITY_CONFIDENCE_LOW | BR-01 |
`,
    [`OUTPUT/${slug}/05_test_case_spec.md`]: `# Test Case Spec · ${slug}
Owner: qa-system/qa-test-design/skills/test-case-generation.md · Nguồn: 01_requirement_risk_summary.md · Verdict: PASS

${tc('001', riskRef)}`,
  };
}

const CASES = {
  valid: { riskRef: 'RK-01', expectError: false },
  invalid: { riskRef: undefined, expectError: true },
  na: { riskRef: 'N/A — the case checks a display rule that no risk in 01 covers', expectError: false },
  empty: { riskRef: '', expectError: true },
  unknown: { riskRef: 'RK-99', expectError: true },
  malformed: { riskRef: 'high risk', expectError: true },
};

const T1_TEST = `// Hidden instructor test (T1): the student's lint enforces the mandatory Risk Ref field.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CASES = ${JSON.stringify(Object.fromEntries(Object.entries(CASES).map(([k, v]) => [k, v.expectError])))};

function lintFixture(name) {
  const slug = 'exam-fixture-riskref-' + name;
  // The grader places the fixtures before the run; copy them only when run by hand.
  if (!fs.existsSync(path.join(ROOT, 'OUTPUT', slug))) fs.cpSync(path.join(__dirname, 'fixtures', 'riskref-' + name), ROOT, { recursive: true });
  const r = spawnSync(process.execPath, ['qa-system/tools/system/lint-deliverables.js', slug, '--json'], { cwd: ROOT, encoding: 'utf8', timeout: 60000 });
  let errors = null;
  try { errors = JSON.parse(r.stdout).errors; } catch { errors = null; }
  const text = errors ? errors.map((e) => [e.file, e.where, e.msg].join(' ')) : (r.stdout + r.stderr).split('\\n');
  return { status: r.status, riskErrors: text.filter((l) => /risk\\s*_?ref/i.test(l)).length };
}

for (const [name, expectError] of Object.entries(CASES)) {
  test('Risk Ref fixture "' + name + '" is ' + (expectError ? 'rejected' : 'accepted'), () => {
    const r = lintFixture(name);
    if (expectError) {
      assert.ok(r.riskErrors > 0, 'expected a lint error mentioning Risk Ref');
      assert.notStrictEqual(r.status, 0, 'lint must exit non-zero');
    } else {
      assert.strictEqual(r.riskErrors, 0, 'a valid Risk Ref must not produce a Risk Ref error');
    }
  });
}
`;

const T2_TEST = `// Hidden instructor test (T2): the student's new agent is wired into the system.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const sub = JSON.parse(fs.readFileSync(path.join(ROOT, 'EXAM', 'submission.json'), 'utf8'));
const t2 = sub.t2_new_agent;
const name = path.basename(t2.agent_folder);
const run = (args) => spawnSync(process.execPath, ['qa-system/tools/system/agent-doctor.js', ...args], { cwd: ROOT, encoding: 'utf8', timeout: 60000 });
const skills = () => {
  const d = path.join(ROOT, t2.agent_folder, 'skills');
  return fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith('.md')).map((f) => path.join(d, f)) : [];
};

test('new agent has AGENT.md and at least one skill', () => {
  assert.ok(fs.existsSync(path.join(ROOT, t2.agent_folder, 'AGENT.md')));
  assert.ok(skills().length >= 1);
});

test('agent:check --impact resolves the new agent with at least one consumer', () => {
  const r = run(['--impact', name]);
  assert.match(r.stdout, /Target Component/);
  assert.ok((r.stdout.match(/^\\s*\\d+\\.\\s+Step \\[/gm) || []).length >= 1);
});

test('agent:check reports no error about the new agent', () => {
  const r = run([]);
  const errs = r.stdout.split('\\n').filter((l) => /^\\s+\\d+\\.\\s+\\[/.test(l) && l.includes(name));
  assert.deepStrictEqual(errs, []);
});

test('example output contains the headings declared under ## Format output', () => {
  const heads = [];
  for (const s of skills()) {
    const lines = fs.readFileSync(s, 'utf8').split('\\n');
    const i = lines.findIndex((l) => /^##\\s+format output\\b/i.test(l));
    if (i === -1) continue;
    let fence = null;
    for (const l of lines.slice(i + 1)) {
      const f = l.match(/^(\`{3,}|~{3,})/);
      if (f) { fence = fence && l.startsWith(fence) ? null : fence || f[1]; continue; }
      if (!fence && /^##\\s/.test(l)) break;
      if (/^#{1,6}\\s+\\S/.test(l)) heads.push(l.trim());
    }
  }
  assert.ok(heads.length >= 1, 'the skill declares no heading under ## Format output');
  const out = fs.readFileSync(path.join(ROOT, t2.example_output), 'utf8').split('\\n').map((l) => l.trim());
  for (const h of heads) {
    const re = new RegExp('^' + h.split(/<[^<>\\n]+>/).map((p) => p.trim().replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&').replace(/\\s+/g, '\\\\s+')).join('.+?'), 'i');
    assert.ok(out.some((l) => re.test(l)), 'missing heading: ' + h);
  }
});
`;

function generate(outDir) {
  C.rmrf(outDir);
  for (const [name, c] of Object.entries(CASES)) {
    const slug = `exam-fixture-riskref-${name}`;
    for (const [rel, text] of Object.entries(fixture(slug, c.riskRef))) C.writeFileSafe(path.join(outDir, 'fixtures', `riskref-${name}`, rel), text);
    C.writeFileSafe(path.join(outDir, 'fixtures', `riskref-${name}`, `knowledge/features/${slug}.md`), `# ${slug} — Feature Knowledge\n`);
  }
  C.writeFileSafe(path.join(outDir, 't1-risk-ref.test.js'), T1_TEST);
  C.writeFileSafe(path.join(outDir, 't2-new-agent.test.js'), T2_TEST);
  C.writeFileSafe(path.join(outDir, 'README.md'), '# Hidden instructor tests\n\nGenerated by `qa-system/tools/exam/make-instructor-tests.js`. Do not edit by hand; regenerate.\nUsed by A2d (fixtures riskref-valid / riskref-invalid) and A6b (all *.test.js, run in the grading container).\n');
  return outDir;
}

function main(argv) {
  let out;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') out = path.resolve(argv[++i]);
    else if (argv[i] === '--exam') out = path.join(C.graderPrivate(), argv[++i], 'instructor-tests');
    else throw new Error(`Unknown argument ${argv[i]}`);
  }
  if (!out) throw new Error('--exam <id> or --out <dir> is required');
  generate(out);
  console.log(`Hidden instructor tests written to ${out}`);
  return 0;
}

if (require.main === module) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(`make-instructor-tests failed: ${e.message}`); process.exitCode = 1; }
}

module.exports = { generate, CASES, fixture };

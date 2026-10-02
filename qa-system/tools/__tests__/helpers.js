/**
 * helpers.js — Scaffolding for tests.
 *
 *   useTempProject()  Create a throwaway project tree and point PATHS at it.
 *   write(rel, text)  Write a file inside that tree.
 *   testCase(id, over) Build a well-formed test case, with per-field overrides.
 *   spec(cases, meta)  Wrap test cases in a spec file.
 *
 * Tools resolve paths through `lib/paths.js`, which is anchored to the repo root.
 * Redirecting PATHS keeps tests away from real OUTPUT/ and knowledge/ data.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { PATHS } = require('../lib/paths');

/** Original values, restored after each case. */
const ORIGINAL = { ...PATHS };

/** Returns a cleanup function every case must call, including on failure. */
function useTempProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-agent-test-'));

  Object.assign(PATHS, {
    ROOT: root,
    INPUT: path.join(root, 'INPUT'),
    OUTPUT: path.join(root, 'OUTPUT'),
    KNOWLEDGE: path.join(root, 'knowledge'),
    FEATURES: path.join(root, 'knowledge', 'features'),
    SYSTEM: path.join(root, 'qa-system'),
    AGENTS: path.join(root, 'qa-system'),
    TOOLS: path.join(root, 'qa-system', 'tools'),
    TEMPLATES: path.join(root, 'qa-system', 'templates'),
    AUTOMATION: path.join(root, 'automation'),
    SYSTEM_MAP: path.join(root, 'knowledge', '_system_map.json'),
    ENV_FILE: path.join(root, '.env'),
  });

  for (const d of [PATHS.INPUT, PATHS.OUTPUT, PATHS.FEATURES]) {
    fs.mkdirSync(d, { recursive: true });
  }

  return {
    root,
    cleanup() {
      Object.assign(PATHS, ORIGINAL);
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

/** Writes a file in the temp project, creating parent directories. */
function write(relPath, content) {
  const full = path.join(PATHS.ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf-8');
  return full;
}

/** Builds a standards-compliant test case; any field can be overridden. */
function testCase(id, over = {}) {
  const f = {
    Title: `Verify ${id} behaves correctly`,
    Precondition: '\n  - User is logged in',
    'Test Steps': '\n  1. Click the button',
    'Test Data': '\n  - Code: `ABC`',
    'Expected Result': '\n  - Success message is shown',
    Priority: 'High',
    Tags: 'Rule#BR-01, Viewpoint#VP-01, Module#TST, Manual',
    ...over,
  };
  const body = Object.entries(f)
    .filter(([, v]) => v !== null)
    .map(([k, v]) => `- **${k}**:${String(v).startsWith('\n') ? '' : ' '}${v}`)
    .join('\n');
  return `### TC_ID: ${id}\n${body}\n`;
}

/** A complete spec file: meta line plus test cases. */
function spec(cases, meta = 'Owner: qa-test-design · Verdict: PASS') {
  return `# Test Case Spec\n${meta}\n\n${cases.join('\n')}`;
}

module.exports = { useTempProject, write, testCase, spec, PATHS };

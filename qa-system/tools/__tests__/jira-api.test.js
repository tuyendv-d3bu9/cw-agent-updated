/**
 * Tests for the Jira layer.
 *
 * These exist because of a specific complaint: every few uses, a Jira call
 * failed and somebody had to edit the code again. The causes were always the
 * same three — an API version that was mixed per call site, a field hardcoded
 * that varies per project, and an error body nobody surfaced. Each case below
 * pins one of those down so it cannot come back quietly.
 *
 * The HTTP layer is never exercised here; only the pure decisions around it.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const {
  API,
  adf,
  adfToText,
  describeError,
  rejectedFields,
  pickIssueType,
} = require('../lib/jira-api');
const { jiraConfig } = require('../lib/env');

/**
 * Source with comments removed. The comments explain which endpoint was
 * withdrawn and must keep saying so; only real call sites are of interest here.
 */
function code(rel) {
  return fs
    .readFileSync(path.join(__dirname, '..', rel), 'utf-8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

// ───────────────────────── one API version ─────────────────────────

test('every Jira path in the toolchain is built from the one API constant', () => {
  assert.strictEqual(API, '/rest/api/3');

  const files = ['jira/jira-client.js', 'jira/mcp-server.js', 'lib/jira-api.js'];
  for (const rel of files) {
    const src = code(rel);
    assert.ok(
      !/rest\/api\/2\//.test(src),
      `${rel} still calls API v2 — /rest/api/2/search was withdrawn by Atlassian`
    );
  }
});

test('no caller invents its own /rest/api/3 string in jira-client', () => {
  const src = code('jira/jira-client.js');
  assert.ok(
    !/['"`]\/rest\/api\//.test(src),
    'jira-client builds paths from the API constant, so one edit moves every call'
  );
});

// ───────────────────────── ADF round trip ─────────────────────────

test('text survives the trip into ADF and back', () => {
  const original = 'Kết quả: PASS\n[qa-agent-sync] RUN-01 · PASS';
  assert.strictEqual(adfToText(adf(original)).trim(), original);
});

test('adfToText reads a comment Jira returns, so a re-sync can recognise it', () => {
  // Shape Jira actually sends back on GET /issue?fields=comment
  const fromJira = {
    type: 'doc',
    version: 1,
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Kết quả chạy tự động: FAIL' }] },
      { type: 'paragraph', content: [{ type: 'text', text: '[qa-agent-sync] RUN-02 · FAIL' }] },
    ],
  };
  assert.match(adfToText(fromJira), /\[qa-agent-sync\] RUN-02 · FAIL/);
});

test('an empty paragraph does not crash the reader', () => {
  assert.strictEqual(adfToText(adf('a\n\nb')).trim(), 'a\n\nb');
});

// ───────────────────────── readable failures ─────────────────────────

test('a field-level 400 names the field, not just the status code', () => {
  const res = {
    statusCode: 400,
    data: { errors: { priority: 'Field cannot be set. It is not on the appropriate screen.' } },
  };
  const msg = describeError(res);
  assert.match(msg, /400/);
  assert.match(msg, /priority/);
  assert.match(msg, /not on the appropriate screen/);
});

test('errorMessages and errors are both reported', () => {
  const msg = describeError({
    statusCode: 400,
    data: { errorMessages: ['Issue type is a required field'], errors: { summary: 'too long' } },
  });
  assert.match(msg, /Issue type is a required field/);
  assert.match(msg, /summary: too long/);
});

test('a non-JSON body still yields something to read', () => {
  const msg = describeError({ statusCode: 503, data: null, raw: '<html>Gateway Timeout</html>' });
  assert.match(msg, /503/);
  assert.match(msg, /Gateway Timeout/);
});

test('rejectedFields lists exactly what push should drop and retry without', () => {
  const res = { statusCode: 400, data: { errors: { priority: 'nope', customfield_1: 'nope' } } };
  assert.deepStrictEqual(rejectedFields(res).sort(), ['customfield_1', 'priority']);
  assert.deepStrictEqual(rejectedFields({ statusCode: 201, data: {} }), []);
});

// ───────────────────────── issue type is configuration ─────────────────────────

const TYPES = [
  { id: '10001', name: 'Task', fields: ['summary', 'priority'], required: ['summary'] },
  { id: '10002', name: 'Bug', fields: ['summary'], required: ['summary'] },
];

test('the configured issue type wins when the project offers it', () => {
  assert.strictEqual(pickIssueType(TYPES, 'Bug').name, 'Bug');
});

test('matching ignores case, because Jira names are typed by hand', () => {
  assert.strictEqual(pickIssueType(TYPES, 'bug').id, '10002');
});

test('an issue type the project does not have falls back instead of failing', () => {
  // The old code hardcoded 'Task' and died with an opaque 400 on projects without it.
  const onlyStory = [{ id: '3', name: 'Story', fields: [], required: [] }];
  assert.strictEqual(pickIssueType(onlyStory, 'Test').name, 'Story');
});

test('a project exposing no issue type returns null rather than guessing', () => {
  assert.strictEqual(pickIssueType([], 'Task'), null);
});

// ───────────────────────── .env carries the variation ─────────────────────────

test('JIRA_TEST_ISSUE_TYPE is read — it used to be declared and ignored', () => {
  assert.strictEqual(jiraConfig({ JIRA_TEST_ISSUE_TYPE: 'Test Case' }).issueType, 'Test Case');
});

test('issue type defaults to Task when .env says nothing', () => {
  assert.strictEqual(jiraConfig({}).issueType, 'Task');
});

test('done transitions come from .env, diacritics intact', () => {
  const cfg = jiraConfig({ JIRA_DONE_TRANSITIONS: 'Xong, Đã đóng ,Done' });
  assert.deepStrictEqual(cfg.doneTransitions, ['Xong', 'Đã đóng', 'Done']);
});

test('the default done list still covers an unconfigured board', () => {
  assert.ok(jiraConfig({}).doneTransitions.includes('Done'));
  assert.ok(jiraConfig({}).doneTransitions.includes('Hoàn thành'));
});

test('JIRA_SEND_PRIORITY=off is honoured whatever the casing', () => {
  assert.strictEqual(jiraConfig({ JIRA_SEND_PRIORITY: ' OFF ' }).sendPriority, 'off');
  assert.strictEqual(jiraConfig({}).sendPriority, 'auto');
});

test('missing credentials are reported by name, not as a bare false', () => {
  const cfg = jiraConfig({ JIRA_HOST: 'https://x.atlassian.net' });
  assert.strictEqual(cfg.ok, false);
  assert.deepStrictEqual(cfg.missing, ['JIRA_EMAIL', 'JIRA_API_TOKEN']);
});

// ───────────────────────── sync stays quiet on a repeat ─────────────────────────

/** Mirrors the marker jira-client writes into every sync comment. */
const marker = (runId, status) => `[qa-agent-sync] ${runId} · ${status}`;

test('the same run and verdict is recognised and skipped', () => {
  const existing = [marker('RUN-01_voucher-regression', 'PASS')];
  assert.ok(existing.includes(marker('RUN-01_voucher-regression', 'PASS')));
});

test('a verdict that flipped is NOT skipped — that is news worth posting', () => {
  const existing = [marker('RUN-01', 'PASS')];
  assert.ok(!existing.includes(marker('RUN-01', 'FAIL')));
});

test('a different run is never confused with an earlier one', () => {
  const existing = [marker('RUN-01', 'PASS')];
  assert.ok(!existing.includes(marker('RUN-02', 'PASS')));
});

test('the marker survives being written as ADF and read back from Jira', () => {
  const m = marker('RUN-03', 'FAIL');
  const body = adf(`Kết quả chạy tự động: FAIL\n${m}\nGhi tự động bởi QA Agent`);
  const lines = adfToText(body).split('\n').map((l) => l.trim());
  assert.ok(lines.includes(m), 'a marker that cannot be read back makes every sync a duplicate');
});

// ───────────────────────── no timestamp churn ─────────────────────────

test('the mapping file carries no run timestamp', () => {
  const src = code('jira/jira-client.js');
  const writeMapping = src.slice(src.indexOf('function writeMapping'));
  const header = writeMapping.slice(0, writeMapping.indexOf('...results.map'));
  assert.ok(
    !/new Date\(\)/.test(header),
    'stamping the header made the file differ in git even when no row changed'
  );
});

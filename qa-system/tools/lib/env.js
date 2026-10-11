/**
 * env.js — Reads `.env` at repo root.
 *
 *   loadEnv(opts)   Parse `.env` into an object. Missing file yields `{}`.
 *   jiraConfig(env) Extract Jira settings and report which keys are missing.
 *
 * Previously duplicated verbatim across four Jira tools.
 */

const fs = require('fs');
const { PATHS } = require('./paths');

/**
 * @param {boolean} [opts.includeProcessEnv=false]
 *   Merge `process.env` on top of the file. Needed by the MCP server: IDEs pass
 *   configuration through process environment, which must win over the file.
 */
function loadEnv({ includeProcessEnv = false } = {}) {
  const fromFile = {};

  if (fs.existsSync(PATHS.ENV_FILE)) {
    for (const line of fs.readFileSync(PATHS.ENV_FILE, 'utf-8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx <= 0) continue;
      fromFile[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }

  return includeProcessEnv ? { ...fromFile, ...process.env } : fromFile;
}

/**
 * Everything that varies between Jira projects lives here, NOT in the code.
 * A differently configured Jira must be answerable by editing `.env`; needing a
 * code change for it is the bug this shape exists to prevent.
 *
 * @returns {{ok, host, email, token, projectKey, issueType, doneTransitions,
 *            sendPriority, missing: string[]}}
 */
function jiraConfig(env = loadEnv()) {
  const missing = ['JIRA_HOST', 'JIRA_EMAIL', 'JIRA_API_TOKEN'].filter((k) => !env[k]);

  // Comma-separated, diacritics kept — Jira shows transitions in the board's own language.
  const doneTransitions = String(env.JIRA_DONE_TRANSITIONS || 'Done,Closed,Resolved,Hoàn thành')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    host: env.JIRA_HOST,
    email: env.JIRA_EMAIL,
    token: env.JIRA_API_TOKEN,
    projectKey: env.JIRA_PROJECT_KEY,
    // Declared in .env.example since day one but never read — issue type was hardcoded 'Task'.
    issueType: env.JIRA_TEST_ISSUE_TYPE || 'Task',
    doneTransitions,
    // `auto` = send priority only when the create screen actually offers the field.
    // `off`  = never send it, for projects where priority is managed elsewhere.
    sendPriority: String(env.JIRA_SEND_PRIORITY || 'auto').trim().toLowerCase(),
    ok: missing.length === 0,
    missing,
  };
}

module.exports = { loadEnv, jiraConfig };

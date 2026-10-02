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

/** @returns {{ok, host, email, token, projectKey, missing: string[]}} */
function jiraConfig(env = loadEnv()) {
  const missing = ['JIRA_HOST', 'JIRA_EMAIL', 'JIRA_API_TOKEN'].filter((k) => !env[k]);
  return {
    host: env.JIRA_HOST,
    email: env.JIRA_EMAIL,
    token: env.JIRA_API_TOKEN,
    projectKey: env.JIRA_PROJECT_KEY,
    ok: missing.length === 0,
    missing,
  };
}

module.exports = { loadEnv, jiraConfig };

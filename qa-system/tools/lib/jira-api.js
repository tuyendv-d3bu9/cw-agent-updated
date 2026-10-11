/**
 * jira-api.js — Shared HTTP layer for every Jira tool.
 *
 *   request(opts, body, timeout)        Raw HTTP. Resolves on any status code.
 *   jiraRequest(cfg, method, path, obj) Jira REST call with Basic Auth.
 *   jiraAttach(cfg, key, name, buffer)  Upload an attachment to an issue.
 *   adf(text)                           Wrap text as Atlassian Document Format.
 *
 * Replaces four divergent `makeRequest` copies, only two of which had a timeout.
 */

const https = require('https');
const http = require('http');

const DEFAULT_TIMEOUT_MS = 15000;

/**
 * ONE api version for the whole toolchain.
 *
 * The tools used to mix v2 and v3 — sometimes inside a single function — and
 * `/rest/api/2/search` has since been withdrawn by Atlassian, so that path now
 * fails outright. Every call goes through this constant; v3 takes ADF for any
 * rich-text field, which is what `adf()` below is for.
 */
const API = '/rest/api/3';

/**
 * Resolves even on 4xx/5xx so callers decide what counts as failure.
 * Rejects only on network error or timeout.
 */
function request(options, body = null, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'http:' ? http : https;
    const req = client.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        let data = null;
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          data = null; // non-JSON response; caller falls back to `raw`
        }
        resolve({ statusCode: res.statusCode, headers: res.headers, data, raw });
      });
    });

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Jira did not respond within ${timeoutMs / 1000}s`));
    });

    if (body) req.write(body);
    req.end();
  });
}

function jiraRequest(cfg, method, apiPath, payload = null) {
  const url = new URL(cfg.host);
  const headers = {
    Authorization: 'Basic ' + Buffer.from(`${cfg.email}:${cfg.token}`).toString('base64'),
    Accept: 'application/json',
  };

  let body = null;
  if (payload) {
    body = JSON.stringify(payload);
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = Buffer.byteLength(body);
  }

  return request(
    {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'http:' ? 80 : 443),
      path: apiPath,
      method,
      headers,
    },
    body
  );
}

/** Hand-rolled multipart; Jira requires the `X-Atlassian-Token: no-check` header. */
function jiraAttach(cfg, issueKey, fileName, fileBuffer) {
  const url = new URL(cfg.host);
  const boundary = '----CWAgentBoundary' + Date.now().toString(16);

  const head = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
      `Content-Type: application/octet-stream\r\n\r\n`
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([head, fileBuffer, tail]);

  return request(
    {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || 443,
      path: `${API}/issue/${issueKey}/attachments`,
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${cfg.email}:${cfg.token}`).toString('base64'),
        'X-Atlassian-Token': 'no-check',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    },
    body,
    60000 // uploads need a longer deadline than plain API calls
  );
}

function adf(text) {
  return {
    type: 'doc',
    version: 1,
    content: String(text)
      .split('\n')
      .map((line) => ({
        type: 'paragraph',
        content: line ? [{ type: 'text', text: line }] : [],
      })),
  };
}

/** Flatten ADF back to plain text, so we can read our own comments on a later run. */
function adfToText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.type === 'text') return node.text || '';
  const inner = (node.content || []).map(adfToText).join('');
  return node.type === 'paragraph' ? inner + '\n' : inner;
}

/**
 * Jira's error shape is two different fields depending on what went wrong.
 * Surfacing both is the difference between "HTTP 400" and knowing which field
 * the project rejected — the gap that used to send us back into the code.
 */
function describeError(res) {
  const d = res?.data;
  const parts = [];
  if (Array.isArray(d?.errorMessages)) parts.push(...d.errorMessages);
  if (d?.errors && typeof d.errors === 'object') {
    for (const [field, msg] of Object.entries(d.errors)) parts.push(`${field}: ${msg}`);
  }
  if (!parts.length && res?.raw) parts.push(String(res.raw).slice(0, 200));
  return `HTTP ${res?.statusCode ?? '??'} — ${parts.join(' · ') || 'no detail returned'}`;
}

/** Field names a 400 blamed, so the caller can drop them and retry. */
function rejectedFields(res) {
  const errors = res?.data?.errors;
  return errors && typeof errors === 'object' ? Object.keys(errors) : [];
}

/**
 * Which issue types and create-screen fields this project actually has.
 * Asking Jira beats assuming: 'Task' does not exist in every project, and
 * `priority` is absent from plenty of create screens.
 */
async function createMeta(cfg, projectKey) {
  const res = await jiraRequest(
    cfg,
    'GET',
    `${API}/issue/createmeta?projectKeys=${encodeURIComponent(projectKey)}` +
      `&expand=projects.issuetypes.fields`
  );
  if (res.statusCode !== 200) return { ok: false, error: describeError(res), issueTypes: [] };

  const project = res.data?.projects?.find((p) => p.key === projectKey) || res.data?.projects?.[0];
  const issueTypes = (project?.issuetypes || []).map((it) => ({
    id: it.id,
    name: it.name,
    fields: Object.keys(it.fields || {}),
    required: Object.entries(it.fields || {})
      .filter(([, f]) => f.required)
      .map(([k]) => k),
  }));
  return { ok: true, issueTypes };
}

/** Pick the configured issue type, else anything the project does offer. */
function pickIssueType(issueTypes, wanted) {
  if (!issueTypes.length) return null;
  const want = String(wanted || '').toLowerCase();
  return (
    issueTypes.find((it) => it.name.toLowerCase() === want) ||
    issueTypes.find((it) => /task|test/i.test(it.name)) ||
    issueTypes[0]
  );
}

module.exports = {
  API,
  request,
  jiraRequest,
  jiraAttach,
  adf,
  adfToText,
  describeError,
  rejectedFields,
  createMeta,
  pickIssueType,
};

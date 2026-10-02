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
      path: `/rest/api/3/issue/${issueKey}/attachments`,
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

module.exports = { request, jiraRequest, jiraAttach, adf };

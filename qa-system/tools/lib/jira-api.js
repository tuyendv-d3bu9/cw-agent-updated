/**
 * lib/jira-api.js — Lớp gọi HTTP dùng chung cho mọi tool Jira.
 *
 * Trước đây có 4 bản `makeRequest` khác nhau rải ở 4 file, mỗi bản một chữ ký,
 * một cách xử lý lỗi, và chỉ 2 bản có timeout. Gom về đây để hành vi đồng nhất.
 */

const https = require('https');
const http = require('http');

const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Gọi HTTP thô. Luôn resolve (kể cả status 4xx/5xx) để nơi gọi tự quyết định,
 * chỉ reject khi lỗi mạng hoặc quá hạn.
 *
 * @returns {Promise<{statusCode:number, headers:object, data:any, raw:string}>}
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
          data = null; // phản hồi không phải JSON — nơi gọi dùng `raw`
        }
        resolve({ statusCode: res.statusCode, headers: res.headers, data, raw });
      });
    });

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Jira không phản hồi sau ${timeoutMs / 1000}s`));
    });

    if (body) req.write(body);
    req.end();
  });
}

/**
 * Gọi Jira REST API với Basic Auth.
 *
 * @param {{host:string,email:string,token:string}} cfg  từ `lib/env.js` → jiraConfig()
 * @param {string} method   GET / POST / PUT ...
 * @param {string} apiPath  ví dụ `/rest/api/3/search/jql?jql=...`
 * @param {object|null} payload  object sẽ được JSON.stringify
 */
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

/**
 * Upload file đính kèm vào một issue (multipart/form-data dựng tay —
 * Jira bắt buộc header `X-Atlassian-Token: no-check`).
 */
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
    60000 // file đính kèm cần hạn dài hơn gọi API thường
  );
}

/** Bọc đoạn text thành Atlassian Document Format — định dạng Jira Cloud bắt buộc. */
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

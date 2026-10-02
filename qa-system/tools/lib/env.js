/**
 * lib/env.js — Đọc `.env` ở gốc repo.
 *
 * Trước đây hàm này được chép nguyên văn ở 4 tool Jira khác nhau.
 * Sửa một chỗ mà quên 3 chỗ còn lại là nguồn lỗi âm thầm.
 */

const fs = require('fs');
const { PATHS } = require('./paths');

/**
 * Đọc `.env` thành object. Không có file thì trả về object rỗng,
 * không ném lỗi — tool tự quyết định thiếu biến nào thì báo gì.
 *
 * @param {object}  [opts]
 * @param {boolean} [opts.includeProcessEnv=false]
 *   `true` thì trộn thêm `process.env` và **ưu tiên** nó hơn file `.env`.
 *   Cần cho MCP server: IDE (Antigravity, Cursor, Claude) truyền cấu hình
 *   qua biến môi trường của tiến trình, phải thắng file trên đĩa.
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

  // process.env đặt sau để ghi đè — biến môi trường thắng file.
  return includeProcessEnv ? { ...fromFile, ...process.env } : fromFile;
}

/**
 * Lấy cấu hình Jira và nói rõ thiếu biến nào.
 * Trả về `{ ok, host, email, token, projectKey, missing[] }`.
 */
function jiraConfig(env = loadEnv()) {
  const cfg = {
    host: env.JIRA_HOST,
    email: env.JIRA_EMAIL,
    token: env.JIRA_API_TOKEN,
    projectKey: env.JIRA_PROJECT_KEY,
  };
  const missing = ['JIRA_HOST', 'JIRA_EMAIL', 'JIRA_API_TOKEN'].filter((k) => !env[k]);
  return { ...cfg, ok: missing.length === 0, missing };
}

module.exports = { loadEnv, jiraConfig };

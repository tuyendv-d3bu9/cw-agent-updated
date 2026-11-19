/**
 * Tests for task discovery in OUTPUT/.
 *
 * `OUTPUT/reports/` (bug report, daily summary) từng bị status, map:sync, export
 * và MCP đếm như một task: dashboard hiện task "reports" UNKNOWN 0/6, bản đồ hệ thống
 * có tính năng "reports" không tồn tại.
 */

const test = require('node:test');
const assert = require('node:assert');
const { useTempProject, write } = require('./helpers');
const { listTaskSlugs } = require('../lib/paths');

test('listTaskSlugs — bỏ reports/, thư mục hệ thống và bản sao lưu', (t) => {
  t.after(useTempProject());
  for (const d of ['voucher', 'reports', '_tmp', '.cache', 'cu.bak']) write(`OUTPUT/${d}/x.md`, 'x');
  write('OUTPUT/README.md', 'x');
  assert.deepStrictEqual(listTaskSlugs(), ['voucher']);
});

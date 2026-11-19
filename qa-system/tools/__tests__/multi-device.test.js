/**
 * multi-device.test.js — chọn thiết bị cho Playwright (QA_DEVICE / tên script npm).
 * Logic thuần ở templates/automation/utils/devices.js; config TS chỉ require nó.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const AUTO = path.resolve(__dirname, '../../templates/automation');
const { resolveDevices, DEVICE_NAMES, SCRIPT_DEVICES } = require(path.join(AUTO, 'utils/devices.js'));
const { parseRunResult } = require('../jira/jira-client');

const names = (env) => resolveDevices(env).names;

test('mặc định: không truyền gì -> desktop-chrome, không tách evidence', () => {
  assert.deepStrictEqual(resolveDevices({}), { names: ['desktop-chrome'], split: false });
  assert.deepStrictEqual(resolveDevices({ QA_DEVICE: '   ' }).names, ['desktop-chrome']);
});

test('từng thiết bị đơn lẻ', () => {
  for (const d of DEVICE_NAMES) {
    assert.deepStrictEqual(resolveDevices({ QA_DEVICE: d }), { names: [d], split: false });
  }
});

test('danh sách phân tách dấu phẩy, tách evidence', () => {
  const r = resolveDevices({ QA_DEVICE: 'mobile-ios,tablet' });
  assert.deepStrictEqual(r, { names: ['mobile-ios', 'tablet'], split: true });
});

test('all = mọi thiết bị', () => {
  const r = resolveDevices({ QA_DEVICE: 'all' });
  assert.deepStrictEqual(r.names, DEVICE_NAMES);
  assert.strictEqual(r.split, true);
});

test('alias chromium -> desktop-chrome', () => {
  assert.deepStrictEqual(resolveDevices({ QA_DEVICE: 'chromium' }), { names: ['desktop-chrome'], split: false });
});

test('alias + tên thật trùng nhau thì gộp, không tách evidence', () => {
  assert.deepStrictEqual(resolveDevices({ QA_DEVICE: 'chromium,desktop-chrome' }).split, false);
});

test('ánh xạ tên script npm', () => {
  assert.deepStrictEqual(names({ npm_lifecycle_event: 'test:e2e:mobile' }), ['mobile-android', 'mobile-ios']);
  assert.deepStrictEqual(names({ npm_lifecycle_event: 'test:e2e:tablet' }), ['tablet']);
  assert.deepStrictEqual(names({ npm_lifecycle_event: 'test:e2e:all' }), DEVICE_NAMES);
  assert.deepStrictEqual(names({ npm_lifecycle_event: 'test:e2e' }), ['desktop-chrome']);
  assert.deepStrictEqual(names({ npm_lifecycle_event: 'test:e2e:headed' }), ['desktop-chrome']);
  assert.strictEqual(resolveDevices({ npm_lifecycle_event: 'test:e2e:tablet' }).split, false);
});

test('QA_DEVICE thắng tên script', () => {
  assert.deepStrictEqual(names({ QA_DEVICE: 'tablet', npm_lifecycle_event: 'test:e2e:all' }), ['tablet']);
});

test('giá trị lạ -> lỗi liệt kê tên hợp lệ', () => {
  assert.throws(
    () => resolveDevices({ QA_DEVICE: 'mobile-ios,nokia' }),
    (e) => {
      assert.match(e.message, /không hợp lệ: nokia/);
      for (const d of DEVICE_NAMES) assert.ok(e.message.includes(d), `thiếu ${d}`);
      assert.match(e.message, /all/);
      return true;
    }
  );
});

test('khoảng trắng, hoa/thường, dấu phẩy thừa', () => {
  assert.deepStrictEqual(names({ QA_DEVICE: ' Mobile-iOS , TABLET ,' }), ['mobile-ios', 'tablet']);
  assert.deepStrictEqual(names({ QA_DEVICE: 'ALL' }), DEVICE_NAMES);
  assert.deepStrictEqual(names({ QA_DEVICE: ',' }), ['desktop-chrome']);
});

test('trùng tên được khử', () => {
  assert.deepStrictEqual(names({ QA_DEVICE: 'tablet,tablet' }), ['tablet']);
});

test('mọi script trong SCRIPT_DEVICES hợp lệ và có trong package.json', () => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../package.json'), 'utf-8'));
  for (const [script, val] of Object.entries(SCRIPT_DEVICES)) {
    assert.doesNotThrow(() => resolveDevices({ QA_DEVICE: val }));
    assert.ok(pkg.scripts[script], `package.json thiếu script ${script}`);
  }
});

test('playwright.config.ts khai đúng các project ứng với DEVICE_NAMES và dùng module chung', () => {
  const cfg = fs.readFileSync(path.join(AUTO, 'playwright.config.ts'), 'utf-8');
  const block = cfg.slice(cfg.indexOf('DEVICE_PROJECTS'), cfg.indexOf('};', cfg.indexOf('DEVICE_PROJECTS')));
  for (const d of DEVICE_NAMES) assert.ok(block.includes(d), `config thiếu project ${d}`);
  assert.match(cfg, /require\('\.\/utils\/devices\.js'\)/);
});

test('run_result: cột Device được parse, khuôn cũ không có Device vẫn đọc được', () => {
  const moi = `
| # | TC ID | Device | Tiêu đề | Trạng thái | Actual Result | Bằng chứng | Defect ID |
|---|---|---|---|:---:|---|---|:---:|
| 1 | SMOKE-01 | mobile-ios | Mo trang | **PASS** | ok | [a](evidence/mobile-ios/SMOKE-01/a.png) | — |
| 2 | SMOKE-01 | tablet | Mo trang | **FAIL** | loi | [b](evidence/tablet/SMOKE-01/b.png) | BUG-01 |
`;
  const rows = parseRunResult(moi);
  assert.deepStrictEqual(rows.map((r) => r.device), ['mobile-ios', 'tablet']);
  assert.deepStrictEqual(rows.map((r) => r.status), ['PASS', 'FAIL']);
  const cu = `
| # | TC ID | Tiêu đề | Trạng thái | Actual Result | Bằng chứng | Defect ID |
|---|---|---|:---:|---|---|:---:|
| 1 | TC-001 | x | **PASS** | ok | e.png | — |
`;
  assert.strictEqual(parseRunResult(cu)[0].device, '');
});

test('template run_result.md có Device ở header và bảng, và parse được', () => {
  const tpl = fs.readFileSync(path.resolve(__dirname, '../../templates/run/run_result.md'), 'utf-8');
  assert.match(tpl, /Thiết bị \(Device\)/);
  assert.match(tpl, /\| TC ID \| Device \|/);
});

'use strict';
/**
 * Logic chọn thiết bị — thuần (không đọc process.env, không phụ thuộc Playwright)
 * để test được bằng node:test. `playwright.config.ts` require file này.
 * Viết CommonJS .js (không phải .ts) vì node:test không import TS khi không có thư viện phụ.
 */

/** Tên project hợp lệ (preset thật nằm ở playwright.config.ts, lấy từ `devices` của Playwright). */
const DEVICE_NAMES = ['desktop-chrome', 'mobile-android', 'mobile-ios', 'tablet'];

/** Tên cũ của project; ai còn truyền `chromium` vẫn chạy được. */
const DEVICE_ALIASES = { chromium: 'desktop-chrome' };

/**
 * Script npm -> thiết bị. npm đặt `npm_lifecycle_event` = tên script trên mọi hệ điều hành,
 * nên không cần cú pháp `VAR=... cmd` (không chạy trên Windows cmd) hay cross-env.
 */
const SCRIPT_DEVICES = {
  'test:e2e:mobile': 'mobile-android,mobile-ios',
  'test:e2e:tablet': 'tablet',
  'test:e2e:all': 'all',
};

/**
 * @param {{QA_DEVICE?: string, npm_lifecycle_event?: string}} env
 * @returns {{names: string[], split: boolean}}  split = true khi >1 thiết bị (tách evidence theo thiết bị)
 * Giá trị lạ thì ném lỗi kèm danh sách hợp lệ, không đoán.
 */
function resolveDevices(env = {}) {
  const raw = (env.QA_DEVICE || SCRIPT_DEVICES[env.npm_lifecycle_event || ''] || '')
    .trim()
    .toLowerCase();
  let names;
  if (!raw) names = ['desktop-chrome'];
  else if (raw === 'all') names = [...DEVICE_NAMES];
  else {
    names = raw
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => DEVICE_ALIASES[n] || n);
    const unknown = names.filter((n) => !DEVICE_NAMES.includes(n));
    if (unknown.length) {
      throw new Error(
        `QA_DEVICE có giá trị không hợp lệ: ${unknown.join(', ')}. ` +
          `Hợp lệ: ${DEVICE_NAMES.join(', ')}, all (hoặc nhiều tên cách nhau dấu phẩy).`
      );
    }
    names = [...new Set(names)];
    if (!names.length) names = ['desktop-chrome']; // QA_DEVICE=",": coi như không truyền
  }
  return { names, split: names.length > 1 };
}

module.exports = { DEVICE_NAMES, DEVICE_ALIASES, SCRIPT_DEVICES, resolveDevices };

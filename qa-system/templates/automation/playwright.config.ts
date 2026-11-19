import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Cấu hình Playwright — dùng chung cho mọi SUT.
 *
 * Kết quả chạy đi về đâu
 * ----------------------
 * `AGENTS.md` §1.2 quy định bằng chứng của một lượt chạy nằm ở
 * `OUTPUT/<task-slug>/runs/<RUN-ID>/`. Trước đây config ghi vào
 * `automation/test-results` — mà thư mục đó bị .gitignore, nên học viên
 * chạy test xong thì ảnh bằng chứng rơi vào chỗ không ai thấy và không nộp được.
 *
 * Hai biến môi trường quyết định đích đến (agent tự truyền, người dùng không cần gõ):
 *   QA_BASE_URL   — ghi đè URL của SUT (mặc định lấy từ knowledge/_system_map.json)
 *   QA_TASK_SLUG  — task đang chạy, ví dụ `<task-slug>`
 *   QA_RUN_ID     — mã lượt chạy, ví dụ `RUN-01_smoke`
 *   QA_DEVICE     — thiết bị chạy, phân tách bằng dấu phẩy: `mobile-ios,tablet` hoặc `all`.
 *                   Không truyền = chỉ `desktop-chrome` (hành vi cũ, không đổi).
 *
 * Không truyền gì thì rơi về `.scratch/` ở gốc repo — đã gitignore. Tên nói rõ
 * đây là chạy nháp chưa gắn vào task nào, và nó KHÔNG nằm trong OUTPUT/ vì
 * OUTPUT/ là sản phẩm bàn giao, chỉ chứa thư mục task.
 */
const ROOT = path.resolve(__dirname, '..');

/**
 * URL của hệ thống đang kiểm thử.
 *
 * Thứ tự ưu tiên: biến môi trường QA_BASE_URL -> `url` trong `knowledge/_sut.json`
 * (bản cũ: khối `sut.url` trong `_system_map.json`, vẫn đọc được để tương thích). Nhờ vậy SUT chỉ khai MỘT chỗ (bản đồ hệ thống,
 * đúng vai SSOT) mà cả automation lẫn agent đều dùng chung — không hardcode
 * URL trong code, cũng không bắt người dùng tự đặt biến môi trường.
 *
 * Nhánh khung (develop) không có khối `sut` nên giá trị là undefined: đúng, vì
 * nhánh đó không gắn với hệ thống nào.
 */
function resolveBaseURL(): string | undefined {
  if (process.env.QA_BASE_URL?.trim()) return process.env.QA_BASE_URL.trim();
  // `knowledge/_sut.json` là nơi khai hệ thống đang kiểm thử. Tách khỏi
  // `_system_map.json` để nhánh khung không bao giờ chạm vào nó — hết xung đột merge.
  for (const file of ['_sut.json', '_system_map.json']) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'knowledge', file), 'utf-8'));
      const url = file === '_sut.json' ? j?.url : j?.sut?.url;   // bản cũ nhúng trong map
      if (url && !url.startsWith('<')) return url;               // bỏ qua chỗ giữ chỗ của template
    } catch {
      /* không có file hoặc JSON hỏng — thử nguồn tiếp theo */
    }
  }
  return undefined;
}

/** Đọc .env ở root repo nếu có */
function loadEnvFile(): void {
  const envPath = path.join(ROOT, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx > 0) {
          const key = trimmed.slice(0, idx).trim();
          const value = trimmed.slice(idx + 1).trim();
          if (process.env[key] === undefined) {
            process.env[key] = value;
          }
        }
      }
    } catch {
      /* ignore */
    }
  }
}
loadEnvFile();

const isVideoMode = ['on', 'true', '1', 'yes'].includes(
  (process.env.evidence_video || process.env.EVIDENCE_VIDEO || '').trim().toLowerCase()
);

const slug = process.env.QA_TASK_SLUG?.trim();
const runId = process.env.QA_RUN_ID?.trim() || 'RUN-local';

const runDir = slug
  ? path.join(ROOT, 'OUTPUT', slug, 'runs', runId)
  : path.join(ROOT, '.scratch', runId);

/**
 * Các thiết bị có thể chọn qua QA_DEVICE.
 *
 * Vì sao dựng dạng bảng tên -> preset: học viên không gõ lệnh, agent truyền tên
 * ngắn dễ nhớ; preset thật (viewport, userAgent, touch, trình duyệt) lấy từ
 * `devices` của Playwright nên không phải tự đoán số đo.
 * Lưu ý: iPhone/iPad dùng WebKit -> cần `npx playwright install webkit` (agent tự chạy).
 */
const DEVICE_PROJECTS: Record<string, { use: Record<string, unknown> }> = {
  'desktop-chrome': { use: { ...devices['Desktop Chrome'] } },
  'mobile-android': { use: { ...devices['Pixel 7'] } },
  'mobile-ios': { use: { ...devices['iPhone 14'] } },
  tablet: { use: { ...devices['iPad (gen 7)'] } },
};
// Tên cũ của project; ai còn truyền `chromium` vẫn chạy được.
const DEVICE_ALIASES: Record<string, string> = { chromium: 'desktop-chrome' };

/**
 * Script npm -> thiết bị. Không đặt biến kiểu `QA_DEVICE=... playwright` trong package.json
 * vì cú pháp đó không chạy trên Windows cmd; npm luôn đặt `npm_lifecycle_event` = tên script
 * trên mọi hệ điều hành, nên config tự suy ra thiết bị mà không cần thêm thư viện (cross-env).
 */
const SCRIPT_DEVICES: Record<string, string> = {
  'test:e2e:mobile': 'mobile-android,mobile-ios',
  'test:e2e:tablet': 'tablet',
  'test:e2e:all': 'all',
};

/** Đọc QA_DEVICE (ưu tiên) hoặc tên script npm -> danh sách tên project. Giá trị lạ thì báo lỗi, không đoán. */
function resolveDevices(): string[] {
  const raw = (
    process.env.QA_DEVICE ||
    SCRIPT_DEVICES[process.env.npm_lifecycle_event || ''] ||
    ''
  ).trim().toLowerCase();
  if (!raw) return ['desktop-chrome'];
  if (raw === 'all') return Object.keys(DEVICE_PROJECTS);
  const names = raw
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean)
    .map((n) => DEVICE_ALIASES[n] ?? n);
  const unknown = names.filter((n) => !(n in DEVICE_PROJECTS));
  if (unknown.length) {
    throw new Error(
      `QA_DEVICE có giá trị không hợp lệ: ${unknown.join(', ')}. ` +
        `Hợp lệ: ${Object.keys(DEVICE_PROJECTS).join(', ')}, all (hoặc nhiều tên cách nhau dấu phẩy).`
    );
  }
  return [...new Set(names)];
}

const selectedDevices = resolveDevices();
// Báo cho utils/evidence.ts (chạy trong worker, thừa hưởng env này): chỉ khi chạy
// từ 2 thiết bị trở lên mới tách thư mục evidence theo thiết bị, để lượt chạy
// một thiết bị giữ nguyên đường dẫn cũ `evidence/<TC_ID>/`.
if (selectedDevices.length > 1) process.env.QA_DEVICE_SPLIT = '1';
else delete process.env.QA_DEVICE_SPLIT;

export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false, // Chạy tuần tự vì dùng chung localStorage
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(runDir, 'report'), open: 'never' }],
    ['json', { outputFile: path.join(runDir, 'results.json') }],
  ],
  use: {
    baseURL: resolveBaseURL(),
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    actionTimeout: 10000,
    trace: 'retain-on-failure',
    // Cấu hình bằng chứng qua biến `evidence_video` trong .env:
    // - ON : quay video toàn bộ phiên chạy làm evidence (video: 'on')
    // - OFF: chụp ảnh từng bước và ảnh kết quả có hậu tố "_result" (screenshot: 'on', video: 'off')
    screenshot: isVideoMode ? 'off' : 'on',
    video: isVideoMode ? 'on' : 'off',
    // KHÔNG đặt `viewport` ở đây: `use` của project đè lên `use` cấp trên, nên viewport
    // cố định sẽ bị preset thiết bị ghi đè (và với desktop thì preset 1280x720 vốn đã thắng).
    // Viewport do preset của từng thiết bị quyết định.
  },
  // Artifact nội bộ của Playwright (trace, ảnh test-finished, file đính kèm).
  //
  // CẤM trỏ vào `evidence/`: trước mỗi lượt chạy Playwright XOÁ SẠCH `outputDir`.
  // Trỏ vào evidence/ nghĩa là chạy lại một ca sẽ thổi bay bằng chứng của cả
  // đợt trước — đã xảy ra thật và mất 2 thư mục evidence chưa commit.
  // Bằng chứng nộp cho khách do `utils/evidence.ts` tự ghi vào `evidence/<TC_ID>/`.
  outputDir: path.join(runDir, '_playwright'),
  // Mỗi thiết bị một project; outputDir của Playwright tự tách theo tên project.
  projects: selectedDevices.map((name) => ({ name, ...DEVICE_PROJECTS[name] })),
});

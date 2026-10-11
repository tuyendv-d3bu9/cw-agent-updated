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
 *   QA_TASK_SLUG  — task đang chạy, ví dụ `cart-quantity`
 *   QA_RUN_ID     — mã lượt chạy, ví dụ `RUN-01_smoke`
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
    viewport: { width: 1280, height: 800 },
  },
  // Artifact nội bộ của Playwright (trace, ảnh test-finished, file đính kèm).
  //
  // CẤM trỏ vào `evidence/`: trước mỗi lượt chạy Playwright XOÁ SẠCH `outputDir`.
  // Trỏ vào evidence/ nghĩa là chạy lại một ca sẽ thổi bay bằng chứng của cả
  // đợt trước — đã xảy ra thật và mất 2 thư mục evidence chưa commit.
  // Bằng chứng nộp cho khách do `utils/evidence.ts` tự ghi vào `evidence/<TC_ID>/`.
  outputDir: path.join(runDir, '_playwright'),
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

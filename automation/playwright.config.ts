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
 * Không truyền gì thì rơi về `OUTPUT/_scratch/` — vẫn nằm trong OUTPUT/, vẫn
 * thấy được, và tên `_scratch` nói rõ đây là chạy nháp chưa gắn vào task nào.
 */
const ROOT = path.resolve(__dirname, '..');

/**
 * URL của hệ thống đang kiểm thử.
 *
 * Thứ tự ưu tiên: biến môi trường QA_BASE_URL -> khối `sut.url` trong
 * `knowledge/_system_map.json`. Nhờ vậy SUT chỉ khai MỘT chỗ (bản đồ hệ thống,
 * đúng vai SSOT) mà cả automation lẫn agent đều dùng chung — không hardcode
 * URL trong code, cũng không bắt người dùng tự đặt biến môi trường.
 *
 * Nhánh khung (develop) không có khối `sut` nên giá trị là undefined: đúng, vì
 * nhánh đó không gắn với hệ thống nào.
 */
function resolveBaseURL(): string | undefined {
  if (process.env.QA_BASE_URL?.trim()) return process.env.QA_BASE_URL.trim();
  try {
    const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'knowledge', '_system_map.json'), 'utf-8'));
    return map?.sut?.url;
  } catch {
    return undefined;
  }
}
const slug = process.env.QA_TASK_SLUG?.trim();
const runId = process.env.QA_RUN_ID?.trim() || 'RUN-local';

const runDir = slug
  ? path.join(ROOT, 'OUTPUT', slug, 'runs', runId)
  : path.join(ROOT, 'OUTPUT', '_scratch', runId);

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
    // Chụp mọi ca, không chỉ ca lỗi: ca PASS cũng cần ảnh để nộp bài và log Jira.
    screenshot: 'on',
    video: 'off',
    viewport: { width: 1280, height: 800 },
  },
  // Ảnh chụp, trace, file đính kèm của từng ca test.
  outputDir: path.join(runDir, 'evidence'),
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

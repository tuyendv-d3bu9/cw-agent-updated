import { defineConfig, devices } from '@playwright/test';
import path from 'path';

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
 *   QA_BASE_URL   — URL hệ thống đang kiểm thử (SUT). develop không gắn SUT nào.
 *   QA_TASK_SLUG  — task đang chạy, ví dụ `cart-quantity`
 *   QA_RUN_ID     — mã lượt chạy, ví dụ `RUN-01_smoke`
 *
 * Không truyền gì thì rơi về `OUTPUT/_scratch/` — vẫn nằm trong OUTPUT/, vẫn
 * thấy được, và tên `_scratch` nói rõ đây là chạy nháp chưa gắn vào task nào.
 */
const ROOT = path.resolve(__dirname, '..');
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
    // SUT do nhánh sử dụng cung cấp. develop là nhánh khung, không gắn hệ thống nào.
    baseURL: process.env.QA_BASE_URL,
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

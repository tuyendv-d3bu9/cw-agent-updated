import { Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const ROOT = path.resolve(__dirname, '../..');

/**
 * Đọc file .env ở root repo nếu biến môi trường chưa được set vào process.env.
 */
export function loadEnvFile(): void {
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
      // bỏ qua lỗi đọc file
    }
  }
}

/**
 * Kiểm tra xem chế độ quay video có đang BẬT không.
 * Đọc biến `evidence_video` hoặc `EVIDENCE_VIDEO` từ .env / process.env.
 * ON / true / 1 / yes => BẬT video mode
 */
export function isVideoMode(): boolean {
  loadEnvFile();
  const val = (process.env.evidence_video || process.env.EVIDENCE_VIDEO || '').trim().toLowerCase();
  return ['on', 'true', '1', 'yes'].includes(val);
}

/**
 * Xóa dấu tiếng Việt và chuẩn hóa chuỗi thành tên file an toàn.
 */
export function sanitizeName(input: string): string {
  if (!input) return 'step';
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .trim()
    .replace(/[\s\-]+/g, '_')
    .slice(0, 50);
}

/**
 * Tách mã TC_ID (ví dụ: 'AUTH-001', 'VCHR-002', 'SMOKE-01') từ tiêu đề testcase.
 */
export function extractTcId(titleOrId: string): string {
  const match = titleOrId.match(/([A-Z0-9]+(?:-[A-Z0-9]+)+)/i);
  if (match) return match[1].toUpperCase();
  return sanitizeName(titleOrId);
}

export interface EvidenceOptions {
  baseDir?: string;
  slug?: string;
  runId?: string;
}

/**
 * Xác định thư mục root chứa evidence của đợt chạy:
 * OUTPUT/<task-slug>/runs/<run-id>/evidence/ (mặc định fallback về OUTPUT/_scratch/...)
 */
export function resolveEvidenceBaseDir(options?: EvidenceOptions): string {
  if (options?.baseDir) {
    return options.baseDir;
  }
  const slug = options?.slug || process.env.QA_TASK_SLUG?.trim();
  const runId = options?.runId || process.env.QA_RUN_ID?.trim() || 'RUN-local';

  return slug
    ? path.join(ROOT, 'OUTPUT', slug, 'runs', runId, 'evidence')
    : path.join(ROOT, 'OUTPUT', '_scratch', runId, 'evidence');
}

/**
 * Quản lý Evidence chuyên nghiệp cho từng Test Case:
 * 1. Chế độ Ảnh (evidence_video=OFF):
 *    - Tạo 1 folder riêng cho mỗi testcase: evidence/<TC_ID>/
 *    - Chụp ảnh từng bước với số thứ tự: 01_step_load.png, 02_step_fill.png ...
 *    - Ảnh kết quả cuối cùng có hậu tố "_result": 03_PASS_result.png hoặc 03_FAIL_result.png
 * 2. Chế độ Video (evidence_video=ON):
 *    - Không chụp ảnh từng bước để tiết kiệm dung lượng và tăng tốc.
 *    - Toàn bộ quá trình chạy được lưu dưới dạng video trong folder testcase: evidence/<TC_ID>/<TC_ID>_PASS_result.webm (hoặc video.webm).
 */
export class TestEvidence {
  readonly page: Page;
  readonly tcId: string;
  readonly tcDir: string;
  private stepIndex: number = 0;
  private isCompleted: boolean = false;
  private pendingVideoPromise?: Promise<void>;

  constructor(page: Page, titleOrTcId: string, options?: EvidenceOptions) {
    this.page = page;
    this.tcId = extractTcId(titleOrTcId);
    const baseDir = resolveEvidenceBaseDir(options);
    this.tcDir = path.join(baseDir, this.tcId);

    if (!fs.existsSync(this.tcDir)) {
      fs.mkdirSync(this.tcDir, { recursive: true });
    }
  }

  /**
   * Cuộn trang lên trên cùng để đảm bảo hiển thị rõ bằng chứng khi chụp ảnh hoặc quay video.
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
    await this.page.waitForTimeout(100);
  }

  /**
   * Chụp 1 bước kiểm thử.
   * - Nếu video mode ON: bỏ qua (video ghi nhận toàn bộ).
   * - Nếu video mode OFF: chụp ảnh vào folder testcase với số thứ tự bước: 01_load_web.png, 02_...png
   */
  async step(stepDescription: string, options?: { scrollToTop?: boolean }): Promise<string | null> {
    if (options?.scrollToTop) {
      await this.scrollToTop();
    }

    if (isVideoMode()) {
      return null;
    }

    this.stepIndex++;
    const stepNum = String(this.stepIndex).padStart(2, '0');
    const safeDesc = sanitizeName(stepDescription);
    const fileName = `${stepNum}_${safeDesc}.png`;
    const filePath = path.join(this.tcDir, fileName);

    await this.page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  }

  /**
   * Chụp ảnh kết quả hoặc lưu video kết quả cuối cùng của testcase.
   * File kết quả luôn có hậu tố `_result`.
   * Ví dụ:
   * - Ảnh: 04_PASS_result.png hoặc 04_FAIL_result.png
   * - Video: AUTH-001_PASS_result.webm
   */
  async result(isPass: boolean, extraLabel?: string): Promise<string | null> {
    this.isCompleted = true;
    const status = isPass ? 'PASS' : 'FAIL';

    if (isVideoMode()) {
      // Chế độ video: đăng ký lưu video của page vào folder testcase
      const video = this.page.video();
      const label = extraLabel ? `_${sanitizeName(extraLabel)}` : '';
      const videoFileName = `${this.tcId}_${status}${label}_result.webm`;
      const videoPath = path.join(this.tcDir, videoFileName);

      if (video) {
        // Playwright saveAs() sẽ tự động hoàn tất và ghi ra đĩa khi page/context đóng
        this.pendingVideoPromise = video.saveAs(videoPath).catch(() => {});
        return videoPath;
      }
      return null;
    }

    // Chế độ ảnh: chụp ảnh kết quả cuối cùng có hậu tố `_result`
    this.stepIndex++;
    const stepNum = String(this.stepIndex).padStart(2, '0');
    const label = extraLabel ? `_${sanitizeName(extraLabel)}` : '';
    const fileName = `${stepNum}_${status}${label}_result.png`;
    const filePath = path.join(this.tcDir, fileName);

    await this.page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  }

  /**
   * Chờ hoàn tất việc ghi file video (nếu cần sau khi page đã đóng).
   */
  async waitForVideo(): Promise<void> {
    if (this.pendingVideoPromise) {
      await this.pendingVideoPromise;
    }
  }

  getStepCount(): number {
    return this.stepIndex;
  }

  getTcDirectory(): string {
    return this.tcDir;
  }
}

/**
 * Hàm tiện ích tương thích ngược cho các file test hiện tại.
 * Tự động tạo thư mục testcase và lưu ảnh kết quả có hậu tố "_result" hoặc lưu video.
 */
export async function captureEvidence(
  page: Page,
  tcId: string,
  isPass: boolean,
  options?: EvidenceOptions
): Promise<string | null> {
  const evidence = new TestEvidence(page, tcId, options);
  return evidence.result(isPass);
}

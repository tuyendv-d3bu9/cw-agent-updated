---
name: test-runner-evidence
description: >
  Khớp các bước kiểm thử trong Test Case vào Page Object Model, thực thi Playwright test suite,
  chụp ảnh màn hình bằng chứng (Evidence Screenshots) và xuất báo cáo kết quả chi tiết theo từng đợt chạy (Run).
---

# Skill: test-runner-evidence

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT).

## Mục đích
Thực thi kiểm thử tự động cho một đợt chạy cụ thể (Run Session), ghi nhận kết quả nhị phân (PASS/FAIL) và tự động thu thập ảnh chụp màn hình bằng chứng (Evidence) cho từng test case.

## Đầu vào
- `OUTPUT/<task-slug>/runs/<run-id>/run_plan.md` — danh sách test cases cần chạy đợt này.
- `automation/pages/*.ts` — các file Page Object Model tương ứng.

## Quy trình thực hiện
1. **Sinh file Test Spec**:
   - Ghi vào `automation/tests/<task-slug>_<run-id>.spec.ts`.
   - Mỗi test case được viết trong một block `test('TC_ID: Title', async ({ page }) => { ... })`.
2. **Cấu hình thu thập Evidence (Điều khiển qua biến `evidence_video` trong `.env`)**:
   - **Chế độ Ảnh (`evidence_video=OFF`)**:
     + Mỗi testcase có một folder riêng biệt: `evidence/<TC_ID>/`.
     + Chụp ảnh từng bước với số thứ tự: `01_load_web.png`, `02_dien_thong_tin.png`, v.v. bằng `await evidence.step(...)`.
     + Ảnh kết quả cuối cùng có hậu tố `_result`: `XX_PASS_result.png` hoặc `XX_FAIL_result.png` bằng `await evidence.result(...)`.
   - **Chế độ Video (`evidence_video=ON`)**:
     + Playwright cấu hình `video: 'on'`.
     + Video ghi nhận toàn bộ quá trình chạy và tự động lưu vào folder testcase: `evidence/<TC_ID>/<TC_ID>_PASS_result.webm`.
     + Không chụp ảnh từng bước để tối ưu tài nguyên.
   - Khi có lỗi / assertion failure: Tự động ghi nhận ảnh kết quả lỗi có hậu tố `_result` và lưu Playwright Trace.
3. **Thực thi ngầm**:
   - Chạy test headless: `npx playwright test automation/tests/<task-slug>_<run-id>.spec.ts`.
4. **Tổng hợp kết quả ra Run Result**:
   - Ghi vào `OUTPUT/<task-slug>/runs/<run-id>/run_result.md`.
   - Nếu có lỗi, liệt kê vào `OUTPUT/<task-slug>/runs/<run-id>/run_defects.md` để `qa-reporter` xử lý tiếp.

## Format output
Ghi ra `OUTPUT/<task-slug>/runs/<run-id>/run_result.md` theo mẫu chuẩn:
- Bảng tổng kết số lượng PASS, FAIL, BLOCKED.
- Chi tiết từng test case kèm Actual Result và đường dẫn thư mục/file bằng chứng trong `evidence/<TC_ID>/`.

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Mọi test case đều có trạng thái nhị phân rõ ràng (PASS / FAIL).
- [ ] Mỗi test case có một folder riêng trong `evidence/<TC_ID>/`.
- [ ] Nếu `evidence_video=OFF`: có đầy đủ ảnh các bước (đánh số 01, 02...) và ảnh kết quả có hậu tố `_result`.
- [ ] Nếu `evidence_video=ON`: có file video ghi lại luồng test case trong folder `evidence/<TC_ID>/`.
- [ ] Toàn bộ các test case FAIL bắt buộc có bằng chứng ghi nhận lỗi giao diện trong thư mục `evidence/<TC_ID>/`.
- [ ] Không ghi đè hoặc làm bẩn file `05_test_case_spec.md` gốc.
- [ ] File kết quả xuất đúng tại `OUTPUT/<task-slug>/runs/<run-id>/run_result.md`.

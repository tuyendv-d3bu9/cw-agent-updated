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
2. **Cấu hình chụp Evidence**:
   - Ở cuối mỗi test case thành công: Chụp ảnh `await page.screenshot({ path: '.../evidence/TC-xxx_pass.png' })`.
   - Khi có lỗi / assertion failure: Tự động bắt ảnh `await page.screenshot({ path: '.../evidence/TC-xxx_fail.png' })` và lưu Playwright Trace.
3. **Thực thi ngầm**:
   - Chạy test headless: `npx playwright test automation/tests/<task-slug>_<run-id>.spec.ts`.
4. **Tổng hợp kết quả ra Run Result**:
   - Ghi vào `OUTPUT/<task-slug>/runs/<run-id>/run_result.md`.
   - Nếu có lỗi, liệt kê vào `OUTPUT/<task-slug>/runs/<run-id>/run_defects.md` để `qa-reporter` xử lý tiếp.

## Format output
Ghi ra `OUTPUT/<task-slug>/runs/<run-id>/run_result.md` theo mẫu chuẩn:
- Bảng tổng kết số lượng PASS, FAIL, BLOCKED.
- Chi tiết từng test case kèm Actual Result và đường dẫn file ảnh trong `evidence/`.

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Mọi test case đều có trạng thái nhị phân rõ ràng (PASS / FAIL).
- [ ] Toàn bộ các test case FAIL bắt buộc có ảnh chụp màn hình ghi nhận lỗi giao diện trong thư mục `evidence/`.
- [ ] Không ghi đè hoặc làm bẩn file `05_test_case_spec.md` gốc.
- [ ] File kết quả xuất đúng tại `OUTPUT/<task-slug>/runs/<run-id>/run_result.md`.

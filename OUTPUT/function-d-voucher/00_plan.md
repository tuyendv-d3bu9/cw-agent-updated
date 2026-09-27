# Kế Hoạch Phân Tích & Kiểm Thử · function-d-voucher
Ngày tạo: 2026-09-20 · Người lập: QA Leader · Trạng thái: IN-PROGRESS

## 1. Phạm Vi & Tài Liệu Nguồn
- **Tài liệu kinh doanh**: `INPUT/function-d-voucher/01_business/shopgo_overview.md`
- **Tài liệu yêu cầu (BA)**: `INPUT/function-d-voucher/02_ba/spec_function_d.md`
- **Đặc tả kỹ thuật (Dev)**: `INPUT/function-d-voucher/03_dev/technical_spec.md` (`spec.txt`)
- **Đặc tả môi trường & API/State**: `INPUT/function-d-voucher/03_dev/environment.md`
- **Giao diện & UI Locators**: `INPUT/function-d-voucher/04_design/live_ui_locators.md` (`https://cwshopgo.github.io/`)
- **Tri thức dự án**: `knowledge/_project.md`, `knowledge/_glossary.md`
- **Tri thức tính năng**: `knowledge/features/function-d-voucher.md`
- **Mode làm việc**: Mode 1 (Manual Test Spec Chặng 1-6) + Mode 2 (Test Data Generation) + Sẵn sàng cho Mode 4 (Playwright Automation khi có yêu cầu)

---

## 2. Tiến Độ & Lộ Trình Từng Chặng (Milestones)

### Giai đoạn 0: Tiếp nhận Cổng 0 & Tri Thức Nền (Gate 0)
- [x] **Task 0.1**: Chuyển đổi và phân loại tài liệu vào 5 ngăn chuẩn `INPUT/function-d-voucher/` (Hoàn thành 2026-09-20).
- [x] **Task 0.2**: Đồng bộ tri thức dự án vào `knowledge/_project.md` (Hoàn thành 2026-09-20).
- [x] **Task 0.3**: Khởi tạo tri thức tính năng `knowledge/features/function-d-voucher.md` và trích xuất confirmed rules (Hoàn thành 2026-09-20).
- [x] **Task 0.4**: Lập file điều hành `OUTPUT/function-d-voucher/00_plan.md` (Hoàn thành 2026-09-20).
- [x] **Task 0.5**: Đồng bộ `knowledge/_system_map.json` ghi nhận task mới và tích hợp Live Environment `https://cwshopgo.github.io/` (Hoàn thành 2026-09-20).

### Giai đoạn 1: Phân Tích Yêu Cầu & Quét Kẽ Hở (qa-analyst) — [HOÀN THÀNH · VERDICT: PASS]
- [x] **Chặng 1**: Đọc yêu cầu thô & Phân tích rủi ro [`qa-analyst/skills/requirement-risk-summary.md`] ➔ Ra `01_requirement_risk_summary.md` (Hoàn thành 2026-09-20 · **Verdict: PASS** sau khi BA chốt các câu hỏi mở).
- [x] **Chặng 2**: Quét kẽ hở 06W & Câu hỏi cho BA [`qa-analyst/skills/missing-rule-06w.md`] ➔ Ra `02_missing_rule_report.md` (Hoàn thành 2026-09-20 · **Verdict: PASS** · Đã chốt 7/7 Missing Rules `MR-01`->`MR-07`, mức sàn thống nhất là 200.000 VNĐ).

### Giai đoạn 2: Thiết Kế Góc Nhìn & Ý Tưởng Kiểm Thử (qa-analyst) — [HOÀN THÀNH · VERDICT: PASS]
- [x] **Chặng 3**: Chọn Risk Area & Viewpoints [`qa-analyst/skills/viewpoint-selection.md`] ➔ Ra `03_viewpoint_report.md` (Hoàn thành 2026-09-20 · Chọn 06 Viewpoints chuẩn Registry, Ma trận Zero-Overlap).
- [x] **Chặng 4**: Thiết kế Test Idea & Lọc Giữ/Bỏ [`qa-analyst/skills/test-idea-design.md`] ➔ Ra `04_test_idea_report.md` (Hoàn thành 2026-09-20 · Thiết kế 38 Test Ideas, Giữ 34 ideas, Bỏ 04 ideas).

### Giai đoạn 3: Sinh Bộ Test Case Chi Tiết 8 Trường (qa-test-design) — [HOÀN THÀNH · VERDICT: ASK]
- [x] **Chặng 5A**: Tạo bản thiết kế khung Blueprint JSON ➔ `05_test_blueprint.json` (Hoàn thành 34 TCs).
- [x] **Chặng 5B**: Chia lô sinh chi tiết 8 trường [`qa-test-design/skills/test-case-generation.md`] ➔ `testcases/batch_01.md` (Hoàn thành 34 TCs chuẩn Jira Xray).
- [x] **Chặng 5C**: Ghép lô hoàn chỉnh bằng tiện ích nội bộ `npm run testcases:merge` ➔ `05_test_case_spec.md` (Hoàn thành 34 TCs assembled).
- [x] **Chặng 6**: Rà soát độ phủ 3 góc nhìn & Nghiệm thu [`qa-test-design/skills/coverage-review.md`] ➔ Ra `06_coverage_review.md` (Hoàn thành · **Verdict: ASK** chờ PO/Lead nghiệm thu).


### Giai đoạn 4: Bộ Dữ Liệu Kiểm Thử & Kiểm Soát Truy Vết (qa-test-data - Tùy chọn Mode 2)
- [ ] **Data Class**: Lập bản đồ lớp dữ liệu [`qa-test-data/skills/data-class-map.md`] ➔ Ra `09_data_class_map.md`
- [ ] **Dataset Engine**: Cấu hình `dataset_schema.json` và chạy engine `generate-dataset.js` (0 token LLM) ➔ Ra `10_dataset.md`
- [ ] **Boundary & Negative**: Sinh tập dữ liệu biên và phủ định [`qa-test-data/skills/boundary-negative-dataset.md`] ➔ Ra `11_boundary_negative_dataset.md`
- [ ] **Traceability**: Ma trận đối soát dữ liệu ↔ ca kiểm thử [`qa-test-data/skills/data-validation-traceability.md`] ➔ Ra `12_data_validation_traceability.md`

### Giai đoạn 5: Chốt Chặn Sẵn Sàng (Readiness Gate - Khi sang Automation)
- [ ] **Readiness Gate**: Đánh giá độ chín test design [`qa-readiness-evaluator/skills/gen-readiness-report.md`] ➔ Ra `outputs/reports/readiness-report.md`

---

## 3. Nhật Ký Điều Phối QA Leader (Orchestration Log)
- **2026-09-20 (Tiếp nhận & Chặng 1-2)**: Hoàn thành Giai đoạn 0, Chặng 1 & Chặng 2. Toàn bộ 7 kẽ hở MR-01 -> MR-07 được BA xác nhận chính thức, Verdict đạt `PASS`.
- **2026-09-20 (Chặng 3-4)**: Hoàn thành Chặng 3 (06 Viewpoints) và Chặng 4 (38 Test Ideas, giữ 34 ideas).
- **2026-09-20 (Khám phá Web Live & Cổng Xác Thực)**: Điều phối `qa-exploratory` rà soát Web Live `https://cwshopgo.github.io/`. Xác nhận ràng buộc tiên quyết: Khách vãng lai bắt buộc phải đăng nhập mới truy cập được trang Thanh toán. Cập nhật 2 tài khoản test cố định (`khachhang@shopgo.vn`, `vip@shopgo.vn`) vào `INPUT` và `knowledge/`. Xuất bản tài liệu `07_web_journey_discovery.md` và bằng chứng chụp màn hình thanh toán.


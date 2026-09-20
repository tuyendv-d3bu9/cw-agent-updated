# Kế Hoạch Phân Tích & Kiểm Thử · function-d

Ngày tạo: 2026-09-20 · Người lập: QA Leader (Codex) · Trạng thái: IN-PROGRESS

## 1. Phạm Vi & Tài Liệu Nguồn

- Tài liệu BA bắt buộc: `INPUT/function-d/02_ba/spec-function-d.md`
- URL môi trường được cung cấp: `INPUT/function-d/02_ba/url-website.md`
- Bối cảnh/giao tiếp: `INPUT/function-d/05_communication/h-thng-thng-mi-in-t-shopgo.md`
- Tri thức dự án: `knowledge/_project.md`, `knowledge/_glossary.md`, `knowledge/_system_map.json`
- Tri thức tính năng: `knowledge/features/function-d.md` (sẽ khởi tạo trước Chặng 1)
- Chuẩn QA: `agents/core/QA_STANDARD.md`

## 2. Outcome Alignment & Gate 0

- **Phạm vi bắt buộc:** Mode 1 — Manual Test Cases và Coverage Review.
- **Phạm vi có điều kiện:** Mode 4 — POM Playwright, chạy Run Session, evidence và draft report.
- **Điều kiện mở Mode 4:** xác thực URL chạy được, luồng Function D có thể truy cập, có tài khoản/quyền phù hợp (nếu yêu cầu), test data/reset strategy và danh sách test case được chọn để automation.
- **Không tự suy đoán:** mọi rule còn thiếu phải gắn `[GIẢ ĐỊNH]`; Verdict `ASK` dừng pipeline để chờ BA/PO chốt.

## 3. Lộ Trình Từng Chặng

- [x] **Gate 0**: Kiểm tra bản Markdown sau intake, xác nhận gap tài liệu và khởi tạo knowledge feature.
- [x] **Chặng 1**: Requirement Risk Summary [`qa-analyst/skills/requirement-risk-summary.md`] ➔ `01_requirement_risk_summary.md` — Verdict `ASK`.
- [ ] **Chặng 2**: Missing Rule 06W [`qa-analyst/skills/missing-rule-06w.md`] ➔ `02_missing_rule_report.md`.
  - Dừng nếu Verdict `ASK`; cập nhật knowledge khi BA/PO chốt câu trả lời.
- [ ] **Chặng 3**: Viewpoint Selection [`qa-analyst/skills/viewpoint-selection.md`] ➔ `03_viewpoint_report.md`.
- [ ] **Chặng 4**: Test Idea Design [`qa-analyst/skills/test-idea-design.md`] ➔ `04_test_idea_report.md`.
- [ ] **Chặng 5**: Test Case Generation [`qa-test-design/skills/test-case-generation.md`] ➔ `05_test_case_spec.md` (dùng blueprint/batches nếu dự kiến >50 cases).
- [ ] **Chặng 6**: Coverage Review [`qa-test-design/skills/coverage-review.md`] ➔ `06_coverage_review.md`.
- [ ] **Mode 4 Gate**: Chọn case có ROI, kiểm tra web journey/Gherkin, tạo `runs/RUN-XX_function-d/run_plan.md`.
- [ ] **Mode 4**: Flow clustering → POM → Playwright run + evidence ➔ `run_result.md`, `run_defects.md` (nếu có).
- [ ] **Reporting**: Chuẩn hoá draft bug report/daily summary từ kết quả chạy; không đẩy external tracker khi chưa có Human-Final review.

## 4. Tiêu Chí Nghiệm Thu

- Traceability đầy đủ: nguồn → BR → VP → Test Idea → TC.
- Test case có expected result nhị phân và không chứa business rule bịa đặt.
- Automation chỉ thực hiện trên staging/local URL được người dùng cung cấp và có evidence cho mọi FAIL.
- Kết quả execution nằm riêng tại `OUTPUT/function-d/runs/`; Master Spec không bị ghi đè.

## 5. Nhật Ký Tiến Độ

| Thời điểm | Trạng thái | Ghi nhận |
|---|---|---|
| 2026-09-20 | Hoàn thành | Intake: 2 DOCX và URL đã chuẩn hoá vào `INPUT/function-d/`. |
| 2026-09-20 | Hoàn thành | Gate 0 và Chặng 1 hoàn thành; 10 câu hỏi nghiệp vụ được mở. Pipeline dừng đúng Clarification Gate. |

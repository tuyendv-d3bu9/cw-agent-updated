# Kế Hoạch Phân Tích & Kiểm Thử · function-a
Ngày tạo: 2026-10-04 · Người lập: QA Leader · Trạng thái: COMPLETED

## 1. Phạm Vi & Tài Liệu Nguồn
- Tài liệu yêu cầu: `INPUT/function-a/02_ba/function-a.md`
- Tri thức dự án: `knowledge/_project.md` · `knowledge/_glossary.md` · `knowledge/features/shopgo-ui-map.md`
- Tri thức tính năng: `knowledge/features/function-a.md` (Đã xác nhận 8 Business Rules & 8 Decisions)

## 2. Lộ Trình Từng Chặng
- [x] **Chặng 1**: Đọc yêu cầu thô & Phân tích rủi ro [qa-analyst/skills/requirement-risk-summary.md] ➔ `01_requirement_risk_summary.md` (Xong)
- [x] **Chặng 2**: Quét kẽ hở 06W & Câu hỏi cho BA [qa-analyst/skills/missing-rule-06w.md] ➔ `02_missing_rule_report.md` (Đã giải quyết 8/8 kẽ hở - Cổng ASK OPEN)
- [x] **Chặng 3**: Chọn Risk Area & Viewpoints [qa-analyst/skills/viewpoint-selection.md] ➔ `03_viewpoint_report.md` (Xong - 6 Viewpoints)
- [x] **Chặng 4**: Thiết kế Test Idea & Lọc Giữ/Bỏ [qa-analyst/skills/test-idea-design.md] ➔ `04_test_idea_report.md` (Xong - 18 Test Ideas Giữ)
- [x] **Chặng 5**: Sinh Test Case 8 trường [qa-test-design/skills/test-case-generation.md] ➔ `05_test_case_spec.md` (Xong - 18 Test Cases chuẩn FACT)
- [x] **Chặng 6**: Rà soát độ phủ 3 góc nhìn [qa-test-design/skills/coverage-review.md] ➔ `06_coverage_review.md` (Xong - Machine Lint PASS)

## 3. Điểm Dừng
Chặng 6 là điểm hoàn tất tự nhiên của quy trình thiết kế kiểm thử tiêu chuẩn.
Chuyển sang Tầng Thực Thi (`runs/`) hoặc Automation khi có yêu cầu rõ ràng từ người dùng kèm URL môi trường cụ thể và chạy đánh giá độ sẵn sàng (`npm run readiness -- function-a`).

## Workflow: run-doc-to-jira-e2e
*Quy trình kiểm thử trọn gói từ tài liệu đến Automation và Jira* — started 2026-10-04

- [x] **Bước 1**: qa-analyst/requirement-risk-summary ➔ `01_requirement_risk_summary.md`
- [x] **Bước 2**: qa-analyst/missing-rule-06w ➔ `02_missing_rule_report.md`
- [x] **Cổng trước bước 3** (ask): `npm run gate function-a` (Exit 0 - Cổng Mở)
- [x] **Bước 3**: qa-analyst/viewpoint-selection ➔ `03_viewpoint_report.md`
- [x] **Bước 4**: qa-analyst/test-idea-design ➔ `04_test_idea_report.md`
- [x] **Bước 5**: qa-test-design/test-case-generation ➔ `05_test_case_spec.md`
- [x] **Cổng trước bước 6** (lint): `npm run lint -- function-a` (Exit 0 - Sạch chuẩn FACT)
- [x] **Bước 6**: qa-test-design/coverage-review ➔ `06_coverage_review.md` (Verdict: PASS)
- [x] **Bước 7**: `npm run jira:push function-a` (Đã xuất file CSV cho Jira Xray & Redmine)
- [x] **Cổng trước bước 8** (readiness): `npm run readiness -- function-a` (Verdict: GO - 100% trace, 0 blocker)
- [x] **Cổng trước bước 8** (confirm): `ask the user to confirm explicitly (and give the target URL for automation)` (Xác nhận URL SUT: `https://cwshopgo.github.io`)
- [x] **Bước 8**: qa-automation/test-runner-evidence ➔ `runs/RUN-01/run_result.md` (18/18 PASS kèm 18 Evidence screenshots)
- [x] **Bước 9**: `npm run jira:sync function-a` (Đã đồng bộ kết quả, đính kèm evidence và transition Done SG-38 -> SG-55)
- [x] **Bước 10**: qa-reporter/gen-daily-summary ➔ `13_daily_summary.md` (Báo cáo 4 section chuẩn FACT)


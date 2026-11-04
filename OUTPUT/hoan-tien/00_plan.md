# Kế Hoạch Phân Tích & Kiểm Thử · hoan-tien
Ngày tạo: 2026-11-04 · Người lập: intake.js · Mode: 1 (Manual test case 01→06) · Trạng thái: DONE (Chặng 6 PASS)

## 1. Phạm Vi & Tài Liệu Nguồn
- Tài liệu yêu cầu: `INPUT/hoan-tien/` (5 ngăn 01_business → 05_communication)
- Tri thức dự án: `knowledge/_project.md` · `knowledge/_glossary.md`
- Tri thức tính năng: `knowledge/features/hoan-tien.md`

## 2. Lộ Trình Từng Chặng
- [x] **Chặng 1**: Đọc yêu cầu thô & Phân tích rủi ro [qa-analyst/skills/requirement-risk-summary.md] ➔ `01_requirement_risk_summary.md`
- [x] **Chặng 2**: Quét kẽ hở 06W & Câu hỏi cho BA [qa-analyst/skills/missing-rule-06w.md] ➔ `02_missing_rule_report.md`
      *(Verdict ASK ⇒ DỪNG. `npm run gate hoan-tien` quyết định, không phải lời nói.)*
- [x] **Chặng 3**: Chọn Risk Area & Viewpoints [qa-analyst/skills/viewpoint-selection.md] ➔ `03_viewpoint_report.md`
- [x] **Chặng 4**: Thiết kế Test Idea & Lọc Giữ/Bỏ [qa-analyst/skills/test-idea-design.md] ➔ `04_test_idea_report.md`
- [x] **Chặng 5**: Sinh Test Case 8 trường [qa-test-design/skills/test-case-generation.md] ➔ `05_test_case_spec.md`
      *(Trước khi báo xong: `npm run lint -- hoan-tien`)*
- [x] **Chặng 6**: Rà soát độ phủ 3 góc nhìn [qa-test-design/skills/coverage-review.md] ➔ `06_coverage_review.md`

## Ghi chú Cổng 0 (QA Leader)
- Đủ 5 ngăn trừ `01_business/` (BRD được intake xếp vào `02_ba/`, vẫn đọc như nguồn bối cảnh).
- `02_ba/srs-hoan-tien-v1.md` đã vào `_superseded/` (thay bởi v2.0) — không đọc.
- Wireframe xếp `04_design/` (intake báo "chưa chắc") — QA Leader xác nhận đúng ngăn.

## 3. Điểm Dừng
Chặng 6 là điểm hoàn tất tự nhiên. Sang Automation cần: `npm run readiness -- hoan-tien`
cho khuyến nghị GO **và** người dùng yêu cầu rõ kèm URL môi trường.

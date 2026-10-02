# Kế Hoạch Phân Tích & Kiểm Thử · spec-function-d
Ngày tạo: 2026-10-02 · Người lập: intake.js · Trạng thái: IN-PROGRESS

## 1. Phạm Vi & Tài Liệu Nguồn
- Tài liệu yêu cầu: `INPUT/spec-function-d/` (5 ngăn 01_business → 05_communication)
- Tri thức dự án: `knowledge/_project.md` · `knowledge/_glossary.md`
- Tri thức tính năng: `knowledge/features/spec-function-d.md`

## 2. Lộ Trình Từng Chặng
- [ ] **Chặng 1**: Đọc yêu cầu thô & Phân tích rủi ro [qa-analyst/skills/requirement-risk-summary.md] ➔ `01_requirement_risk_summary.md`
- [ ] **Chặng 2**: Quét kẽ hở 06W & Câu hỏi cho BA [qa-analyst/skills/missing-rule-06w.md] ➔ `02_missing_rule_report.md`
      *(Verdict ASK ⇒ DỪNG. `npm run gate spec-function-d` quyết định, không phải lời nói.)*
- [ ] **Chặng 3**: Chọn Risk Area & Viewpoints [qa-analyst/skills/viewpoint-selection.md] ➔ `03_viewpoint_report.md`
- [ ] **Chặng 4**: Thiết kế Test Idea & Lọc Giữ/Bỏ [qa-analyst/skills/test-idea-design.md] ➔ `04_test_idea_report.md`
- [ ] **Chặng 5**: Sinh Test Case 8 trường [qa-test-design/skills/test-case-generation.md] ➔ `05_test_case_spec.md`
      *(Trước khi báo xong: `npm run lint -- spec-function-d`)*
- [ ] **Chặng 6**: Rà soát độ phủ 3 góc nhìn [qa-test-design/skills/coverage-review.md] ➔ `06_coverage_review.md`

## 3. Điểm Dừng
Chặng 6 là điểm hoàn tất tự nhiên. Sang Automation cần: `npm run readiness -- spec-function-d`
cho khuyến nghị GO **và** người dùng yêu cầu rõ kèm URL môi trường.

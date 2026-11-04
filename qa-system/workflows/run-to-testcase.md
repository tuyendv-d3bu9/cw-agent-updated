---
name: run-to-testcase
title: "Từ requirement thô đến test case spec"
description: "Chạy Chặng 1 đến 5 có cổng ASK sau Chặng 2, ra bản đặc tả test case đã qua lint; chưa rà soát độ phủ."
format: v1

triggers:
  - "từ tài liệu ra test case"
  - "sinh test case từ yêu cầu"
  - "phân tích và viết test case"

steps:
  - agent: qa-analyst
    skill: requirement-risk-summary
    output: 01_requirement_risk_summary.md
    note: "Chặng 1 không có điểm dừng cứng: OQ-xx chuyển cho Chặng 2 xử lý."

  - agent: qa-analyst
    skill: missing-rule-06w
    output: 02_missing_rule_report.md

  - agent: qa-analyst
    skill: viewpoint-selection
    gate: ask
    output: 03_viewpoint_report.md

  - agent: qa-analyst
    skill: test-idea-design
    output: 04_test_idea_report.md

  - agent: qa-test-design
    skill: test-case-generation
    output: 05_test_case_spec.md

  - tool: lint
    note: "Exit 1 thì sửa 05 trước khi báo xong."
---

# Từ requirement thô đến test case spec (`01 → 05`)

## Khi nào dùng
Cần bộ test case nhanh, chưa cần rà soát độ phủ. Muốn có `06` thì dùng `run-req-to-testcase`.

## Điểm dừng
- Trước bước 3: cổng `ask` (`npm run gate <slug>`). Luật cổng: `qa-system/core/QA_STANDARD.md` §1.
- Sau bước 5: `npm run lint -- <slug>` phải exit `0`.

## Nghiệm thu — truy vết ngược một test case
`Tags` (`Rule#…`, `Viewpoint#VP-xx`, `TI#TI-xx`) → `04` (idea nào, vì sao Giữ) → `03` (viewpoint, rủi ro)
→ `01` hoặc `knowledge/features/<slug>.md` (rule, nguồn) → `INPUT/<slug>/` (câu chữ gốc).
Đứt ở chặng nào là lỗi traceability.

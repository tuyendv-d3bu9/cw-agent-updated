---
name: run-req-to-testcase
title: "Phân tích yêu cầu có cổng ASK và sinh test case"
description: "Phân tích rủi ro và kẽ hở 06W, qua cổng ASK sau Chặng 2, rồi viết viewpoint, test idea, test case và rà soát độ phủ."
format: v1

triggers:
  - "cần tạo testcase"
  - "dựa vào thông tin thì tạo testcase đi"
  - "dựa vào thông tin tạo testcase"
  - "cần tạo test case từ thông tin"

steps:
  - agent: qa-analyst
    skill: requirement-risk-summary
    output: 01_requirement_risk_summary.md

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

  - agent: qa-test-design
    skill: coverage-review
    gate: lint
    output: 06_coverage_review.md
---

# Phân tích yêu cầu có cổng ASK và sinh test case

## Khi nào dùng
Có tài liệu ban đầu, cần đi từ phân tích tới bộ test case đã rà soát độ phủ (Mode 1).

## Điểm dừng
- Trước bước 3: cổng `ask` (`npm run gate <slug>`). Luật cổng: `qa-system/core/QA_STANDARD.md` §1.
- Trước bước 6: cổng `lint` (`npm run lint -- <slug>`).

Dừng ở Chặng 6. Có chạy nhánh dữ liệu thì dùng `run-testcase`.

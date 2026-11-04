---
name: run-ba-spec-to-testcase
title: "Tài liệu BA mới đến test case có cổng"
description: "Khi BA gửi tài liệu mới: phân tích, hỏi BA nếu còn kẽ hở, rồi mới sinh test case và kiểm chuẩn."
format: v1

triggers:
  - "BA gửi tài liệu mới"
  - "có tài liệu mới cần làm test case"
  - "làm test case cho tài liệu BA vừa gửi"

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

# Tài liệu BA mới đến test case có cổng

## Khi nào dùng
BA vừa gửi tài liệu yêu cầu mới và bạn muốn đi từ phân tích đến bộ test case đã kiểm chuẩn,
mà không bao giờ sinh test case trên nền nghiệp vụ còn mơ hồ.

## Điểm dừng
- Trước bước 3: cổng `ask` (`npm run gate <slug>`). Luật cổng: `qa-system/core/QA_STANDARD.md` §1.
- Trước bước 6: cổng `lint`.

Dừng ở Chặng 6. Sang automation cần `readiness` và xác nhận riêng (`AGENTS.md` §1.5).

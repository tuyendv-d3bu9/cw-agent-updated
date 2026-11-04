---
name: run-doc-to-jira-e2e
title: "Quy trình kiểm thử trọn gói từ tài liệu đến Automation và Jira"
description: "Từ tài liệu đến test case, nghiệm thu, đẩy Jira, chạy automation E2E, cập nhật Jira và xuất báo cáo."
format: v1

triggers:
  - "chạy quy trình kiểm thử trọn gói"
  - "từ tài liệu đến tự động test và jira"
  - "kiểm thử trọn gói đẩy jira và automation"
  - "chạy pipeline testcase automation jira"

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

  - tool: jira:push
    output: jira_testcase_mapping.md
    note: "Đẩy bộ test case lên Jira tạo task/test issue và sinh bảng ánh xạ TC ID ↔ Jira Key."

  - agent: qa-automation
    skill: test-runner-evidence
    gate:
      - readiness
      - confirm
    output: runs/RUN-01/run_result.md
    note: "Cần readiness GO và người dùng xác nhận kèm URL môi trường (AGENTS.md §1.5)."

  - tool: jira:sync
    args: "{slug} RUN-01"
    note: "Đồng bộ kết quả test, đính kèm screenshot bằng chứng và cập nhật trạng thái các issue trên Jira."

  - agent: qa-reporter
    skill: gen-daily-summary
    note: "Báo cáo 4 section, ghi vào OUTPUT/reports/ (theo skill gen-daily-summary)."
---

# Quy Trình Kiểm Thử Trọn Gói: Từ Tài Liệu Đến Automation Và Jira

## Khi nào dùng
Khi bạn có tài liệu yêu cầu ban đầu (PRD/SRS/User Story) và muốn đi trọn vẹn chu trình kiểm thử:
1. Phân tích yêu cầu, bóc tách rủi ro và phát hiện kẽ hở logic 06W.
2. Thiết kế Viewpoint và Test Idea.
3. Sinh Test Case chi tiết chuẩn 8 trường FACT và kiểm tra độ phủ.
4. Đẩy danh mục Test Case lên Jira (tạo issues và bảng mapping).
5. Thực thi tự động với Playwright, chụp ảnh bằng chứng (Evidence).
6. Gửi kết quả chạy test và cập nhật trạng thái (Transition) trên Jira.
7. Xuất báo cáo tổng kết chất lượng (Daily/Run Summary).

## Điểm dừng
- Trước bước 3: cổng `ask` (`npm run gate <slug>`). Luật cổng: `qa-system/core/QA_STANDARD.md` §1.
- Trước bước 6: cổng `lint`.
- Trước bước 8: `npm run readiness -- <slug>` phải ra `GO` **và** người dùng xác nhận kèm URL môi trường
  (`AGENTS.md` §1.5). `CONDITIONAL GO` chưa đủ.

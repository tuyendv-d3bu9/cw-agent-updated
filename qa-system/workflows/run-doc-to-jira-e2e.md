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
    note: "Nếu có kẽ hở ra Verdict ASK thì bắt buộc dừng lại để BA phản hồi hoặc chốt giả định."

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
    note: "Yêu cầu kết quả readiness GO và người dùng xác nhận kèm URL môi trường trước khi thực thi Playwright."

  - tool: jira:sync
    note: "Đồng bộ kết quả test, đính kèm screenshot bằng chứng và cập nhật trạng thái các issue trên Jira."

  - agent: qa-reporter
    skill: gen-daily-summary
    output: 13_daily_summary.md
    note: "Tổng hợp kết quả kiểm thử thành báo cáo 4 section (Tiến độ hôm nay, Outstanding Issues, Blocker, Next Action)."
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

## Các điểm dừng bắt buộc (Quality Gates)
- **Sau Bước 2 (Cổng ASK)**: Nếu phân tích 06W phát hiện kẽ hở ra Verdict `ASK`, quy trình bắt buộc dừng lại. Cổng do máy kiểm (`npm run gate <slug>`), tuyệt đối không nhảy cóc sang Chặng 3 nếu còn câu hỏi treo.
- **Trước Bước 6 (Cổng LINT)**: Chạy `npm run lint -- <slug>` kiểm tra cơ học 8 trường FACT trước khi rà soát độ phủ 3 góc nhìn.
- **Trước Bước 8 (Cổng READINESS & CONFIRM)**: Bắt buộc chạy `npm run readiness -- <slug>` đạt `GO` (hoặc `CONDITIONAL GO`) **VÀ** có sự xác nhận rõ ràng của người dùng kèm URL môi trường thử nghiệm cụ thể mới kích hoạt Playwright Automation.

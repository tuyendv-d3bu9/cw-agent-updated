---
name: run-req-to-testcase
title: "Phân tích yêu cầu có cổng ASK và sinh test case"
description: "Đọc thông tin ban đầu, phân tích rủi ro và kẽ hở 06W, dừng tuyệt đối nếu vướng ASK, rồi mới viết viewpoint và sinh test case."
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
    note: "Nếu phát hiện thiếu thông tin hoặc kẽ hở logic, ra Verdict ASK và dừng lại để người dùng trả lời, tuyệt đối không làm tiếp."

  - agent: qa-analyst
    skill: viewpoint-selection
    gate: ask
    output: 03_viewpoint_report.md
    note: "Cổng ASK do máy thi hành. Còn câu hỏi treo thì bị chặn cứng, không ai được lách qua."

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
    note: "Cổng lint kiểm đủ 8 trường chuẩn FACT bằng máy trước khi nghiệm thu độ phủ."
---

# Phân tích yêu cầu có cổng ASK và sinh test case

## Khi nào dùng
Khi bạn có thông tin/tài liệu ban đầu và muốn phân tích kỹ lưỡng, quét sạch kẽ hở logic trước khi viết viewpoint và sinh test case chi tiết.

## Điểm dừng & Bức tường thép (Iron Gate)
- **Sau bước 2**: Nếu phát hiện thiếu hụt thông tin hoặc có kẽ hở nghiệp vụ (Verdict `ASK`), workflow **BẮT BUỘC DỪNG NGAY LẬP TỨC** để trình bày câu hỏi cho bạn.
- **Trước bước 3**: Cổng `ask` thi hành bằng máy (`npm run gate`). Kể cả khi có lời giục làm tiếp, công cụ sẽ chặn cứng và không cho phép sinh viewpoint hay test case khi thông tin chưa đầy đủ.
- **Trước bước 6**: Cổng `lint` tự động kiểm tra cơ học 8 trường của test case đạt chuẩn FACT trước khi chốt độ phủ.

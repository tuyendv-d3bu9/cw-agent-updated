---
name: run-bulk-doc-intake
title: "Tiếp nhận tài liệu số lượng lớn, chưng cất và cập nhật tri thức"
description: "Chuyển hàng loạt tài liệu sang Markdown, chưng cất tri thức theo lô có trích nguồn, soát xung đột rồi cập nhật knowledge/."
format: v1

triggers:
  - "xử lý tài liệu số lượng lớn"
  - "nạp tài liệu hàng loạt"
  - "tiếp nhận hơn 100 file"
  - "chuẩn hoá tài liệu dự án"
  - "cập nhật tri thức hàng loạt"
  - "phân tích hàng trăm tài liệu"

steps:
  - tool: "intake:bulk"
    args: "--slug {slug}"
    output: 00_intake_manifest.md
    note: "Chuyển hàng loạt (.docx, .doc, .xlsx, .pdf, .pptx, .txt) sang .md, lọc trùng, xếp 5 ngăn. File lỗi/không hỗ trợ giữ nguyên tại chỗ và có trong manifest — báo lại người dùng."

  - tool: "knowledge:digest"
    output: 00_digest_plan.md
    note: "Chia lô vừa context, chỉ lấy tài liệu mới hoặc đã đổi. Ra 0 lô thì bỏ qua bước kế."

  - agent: qa-analyst
    skill: knowledge-digest
    output: 00_knowledge_digest.md
    note: "Trích từng lô ra knowledge_digest/batch_NN.md rồi gộp, giữ trích dẫn gốc. Hai tài liệu nói khác nhau: ghi lại, để Chặng 2 sinh MR."

  - agent: qa-analyst
    skill: requirement-risk-summary
    output: 01_requirement_risk_summary.md
    note: "Đọc 00_knowledge_digest.md thay cho tài liệu thô, giữ cột nguồn."

  - tool: "knowledge:conflicts"
    output: 01_conflict_warning.md
    note: "Soát xung đột với các tính năng đã có. Tool dò theo từ khoá: không thấy xung đột chưa phải bằng chứng là không có."

  - agent: qa-analyst
    skill: missing-rule-06w
    output: 02_missing_rule_report.md
    note: "Mâu thuẫn giữa tài liệu, mục Annotations / Pending changes và cảnh báo xung đột đều thành MR."

  - tool: "gate"
    note: "Exit 1 thì dừng, trình bày câu hỏi cho BA/PO."

  - tool: "knowledge:sync"
    args: "{slug} --write"
    output: 00_knowledge_sync_log.md
    note: "Chạy khi người dùng đã đưa câu trả lời của BA/PO, rồi chạy lại gate."
---

# Tiếp nhận tài liệu số lượng lớn, chưng cất và cập nhật tri thức

## Khi nào dùng
Dự án nhận khối tài liệu lớn (hàng chục tới hàng trăm file, nhiều định dạng) và cần biến chúng thành
tri thức trong `knowledge/`. Đọc cả khối trong một lượt sẽ tràn context, nên việc phân tích đi qua
bước chưng cất theo lô (`knowledge-digest`). Mỗi dòng tri thức giữ nguồn file + mục.

BA gửi thêm hoặc sửa tài liệu thì chạy lại workflow này: `knowledge:digest` chỉ đưa tài liệu mới hoặc
đã đổi vào lô, thẻ của tài liệu cũ không đổi được dùng lại.

## Điểm dừng
- **Sau bước 7 (cổng ASK)**: `npm run gate <slug>` exit `1` ⇒ dừng. Luật cổng: `qa-system/core/QA_STANDARD.md` §1.
- **Sau khi BA trả lời**: bước 8 đồng bộ vào `knowledge/features/<slug>.md`; cổng mở thì sang Chặng 3 bằng
  `run-req-to-testcase` hoặc `re-run-testcase`.

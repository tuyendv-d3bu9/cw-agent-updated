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
    note: "Chuyển đổi hàng loạt tài liệu (.docx, .doc, .xlsx, .pdf, .pptx, .txt) sang .md, lọc trùng, xếp vào 5 ngăn. Truyền --slug để cả khối về một tính năng."

  - tool: "knowledge:digest"
    output: 00_digest_plan.md
    note: "Chia tài liệu thành lô vừa context. Chỉ lấy tài liệu mới hoặc đã đổi so với các thẻ đã có. Ra 0 lô thì bỏ qua bước kế."

  - agent: qa-analyst
    skill: knowledge-digest
    output: 00_knowledge_digest.md
    note: "Pha Trích chạy từng lô ra knowledge_digest/batch_NN.md, pha Gộp hợp nhất thành bản chưng cất. Mâu thuẫn giữa tài liệu ⇒ ASK."

  - agent: qa-analyst
    skill: requirement-risk-summary
    output: 01_requirement_risk_summary.md
    note: "Đọc 00_knowledge_digest.md thay cho tài liệu thô, giữ cột nguồn. Ghi rule đã xác nhận vào knowledge/."

  - agent: qa-analyst
    skill: missing-rule-06w
    output: 02_missing_rule_report.md
    note: "Quét kẽ hở 06W, lấy thêm danh sách điểm mơ hồ ở §4 của bản chưng cất."

  - tool: "knowledge:conflicts"
    gate: ask
    output: 01_conflict_warning.md
    note: "Soát xung đột tri thức chéo giữa các tính năng. Cổng ASK dừng lại nếu có mâu thuẫn."

  - tool: "knowledge:sync"
    args: "{slug} --write"
    output: 00_knowledge_sync_log.md
    note: "Đồng bộ các quy tắc đã được BA/PO xác nhận vào knowledge/."
---

# Tiếp nhận tài liệu số lượng lớn, chưng cất và cập nhật tri thức

## Khi nào dùng
Dự án nhận khối tài liệu lớn (hàng chục tới hàng trăm file, nhiều định dạng) và cần biến chúng thành
tri thức trong `knowledge/`. Đọc cả khối trong một lượt sẽ tràn context, nên việc phân tích đi qua
bước chưng cất theo lô (`knowledge-digest`). Mỗi dòng tri thức giữ nguồn file + mục.

BA gửi thêm hoặc sửa tài liệu thì chạy lại workflow này: `knowledge:digest` chỉ đưa tài liệu mới hoặc
đã đổi vào lô, thẻ của tài liệu cũ không đổi được dùng lại.

## Điểm dừng
- **Sau bước 3 (Chưng cất)**: hai tài liệu nói khác nhau về cùng một điều ⇒ `ASK`, BA chốt bản nào đúng.
- **Sau bước 5 (06W)**: còn kẽ hở hoặc câu hỏi mở ⇒ `ASK`, tạo file làm rõ cho BA/PO.
- **Bước 6 (Cổng ASK)**: kiểm bằng máy (`npm run gate <slug>`). Còn câu hỏi mở chưa có câu trả lời
  chính thức hoặc chưa có giả định chốt trong `knowledge/` thì cổng đóng (exit 1) và không đi tiếp.
- **Sau khi BA xác nhận**: dữ liệu được đồng bộ vào `knowledge/features/<slug>.md` và mở khoá cho các
  bước thiết kế kiểm thử tiếp theo.

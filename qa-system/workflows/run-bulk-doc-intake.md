---
name: run-bulk-doc-intake
title: "Tiếp nhận và chuẩn hoá tài liệu số lượng lớn sang Markdown"
description: "Chuyển đổi hàng loạt tài liệu đa định dạng sang Markdown, chia luồng nạp vào INPUT, quét xung đột và cập nhật tri thức."
format: v1

triggers:
  - "xử lý tài liệu số lượng lớn"
  - "nạp tài liệu hàng loạt"
  - "tiếp nhận hơn 100 file"
  - "chuẩn hoá tài liệu dự án"

steps:
  - tool: "intake:bulk"
    output: 00_intake_manifest.md
    note: "Chuyển đổi hàng loạt tài liệu (.docx, .doc, .xlsx, .pdf, .pptx, .txt) sang .md và phân nhóm slug."

  - agent: qa-analyst
    skill: requirement-risk-summary
    output: 01_requirement_risk_summary.md
    note: "Bóc tách quy tắc nghiệp vụ sơ bộ và lập danh mục tri thức."

  - agent: qa-analyst
    skill: missing-rule-06w
    output: 02_missing_rule_report.md
    note: "Quét kẽ hở 06W và phát hiện các điểm xung đột giữa các phiên bản tài liệu."

  - tool: "knowledge:conflicts"
    gate: ask
    output: 01_conflict_warning.md
    note: "Soát xung đột tri thức chéo giữa các tính năng. Cổng ASK dừng lại nếu có mâu thuẫn."

  - tool: "knowledge:sync"
    output: 00_knowledge_sync_log.md
    note: "Đồng bộ các quy tắc đã được BA/PO xác nhận vào knowledge/."
---

# Tiếp nhận và chuẩn hoá tài liệu số lượng lớn sang Markdown

## Khi nào dùng
Dùng khi dự án tiếp nhận khối lượng lớn tài liệu (> 100 files) thuộc nhiều định dạng (`.xlsx`, `.doc`, `.docx`, `.pdf`, `.pptx`, `.txt`), cần chuẩn hoá thành 1 định dạng duy nhất là Markdown sạch, chia luồng xử lý không gây tràn token và hợp nhất vào `knowledge/`.

## Điểm dừng
- **Sau bước 3 (Quét 06W & Kẽ hở)**: Nếu phát hiện mâu thuẫn hoặc thiếu thông tin, chặng ra `ASK`. Hệ thống tạo file làm rõ để BA/PO xác nhận.
- **Trước bước 4 (Cổng ASK)**: Được kiểm soát bằng máy (`npm run gate <slug>`). Nếu còn câu hỏi mở chưa có câu trả lời chính thức hoặc chưa có giả định chốt trong `knowledge/`, cổng đóng (Exit 1) và không cho đi tiếp.
- **Sau khi BA xác nhận**: Dữ liệu được đồng bộ vào `knowledge/features/<slug>.md` và mở khoá cho các bước thiết kế kiểm thử tiếp theo.

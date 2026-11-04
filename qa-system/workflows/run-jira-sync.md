---
name: run-jira-sync
title: "Đồng bộ Jira và Redmine"
description: "Xuất CSV, đẩy test case lên Jira, hoặc kéo danh sách bug về phân tích."
format: legacy
triggers:
  - "đồng bộ Jira"
  - "đẩy test case lên Jira"
  - "kéo bug từ Jira về"
---

# Đồng bộ Jira & Redmine

| Người dùng nói | Agent | Lệnh | Ra |
|---|---|---|---|
| *"Xuất test case ra file cho Jira Xray / Redmine"* | `qa-test-design` | `npm run testcases:export <slug>` | `OUTPUT/<slug>/export_jira_xray.csv` · `export_redmine.csv` (UTF-8 BOM) |
| *"Đẩy test case lên Jira"* | `qa-test-design` | `npm run jira:push <slug>` | Có `.env` ⇒ đẩy qua REST API; chưa có ⇒ báo vị trí file CSV để import |
| *"Kéo bug từ Jira/Redmine về"* | `qa-reporter` | `npm run jira:pull <slug>` | `OUTPUT/<slug>/jira_defects_summary.md` |
| *"Đẩy kết quả chạy lên Jira"* | `qa-automation` | `npm run jira:sync <slug> <run-id>` | Kết quả + ảnh evidence gắn vào issue |

Trước khi export/push: `npm run lint -- <slug>` phải exit `0`.
Bug kéo về là **dữ liệu tham khảo** cho rủi ro; nó không phải nguồn rule (`qa-system/core/QA_STANDARD.md` §10.1) —
điều bug gợi ý mà tài liệu chưa nói thì thành câu hỏi ở `02`.
Cấu hình MCP: `qa-system/integrations/jira-mcp-guide.md`.

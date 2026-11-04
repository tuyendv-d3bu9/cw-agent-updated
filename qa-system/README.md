# qa-system/ — Hệ thống 9 agent QA · **MÁY MÓC**

> **Bình thường bạn không cần mở thư mục này.** Agent tự đọc.
> Chỉ vào đây khi **cố ý nâng cấp hệ thống**: thêm skill, dựng agent mới, sửa skill cũ.

| Thư mục | Là gì |
|---|---|
| `core/QA_STANDARD.md` | Nguồn **duy nhất** của luật chung: verdict & cổng ASK, nhãn, FACT, 06W, rủi ro, knowledge, mã định danh, ưu tiên nguồn, thang đo |
| `qa-lead/` | Tổng chỉ huy — cửa ngõ duy nhất giữa bạn và hệ thống |
| `qa-analyst/` `qa-test-design/` `qa-test-data/` `qa-ui-review/` `qa-reporter/` `qa-automation/` `qa-readiness-evaluator/` | 8 chuyên gia theo từng chặng |
| `tools/` | Công cụ nội bộ — xem [tools/README.md](tools/README.md) |
| `templates/` | Khuôn mẫu agent/skill/workflow — xem [templates/README.md](templates/README.md) |
| `workflows/` | Bản đồ pipeline (`WORKFLOW.md`) và các runbook |
| `integrations/` | Dùng trên Antigravity / Cursor / Claude Code, Jira MCP |

Muốn nâng cấp, cứ nói bằng lời: *"Tôi muốn skill sinh test case có thêm trường X"*.
QA Leader chạy `qa-lead/skills/system-upgrade-governance.md`: cây quyết định, 7 điểm neo, nghiệm thu
(gồm chạy skill hai lần trên cùng đầu vào để so kết quả). Sau mỗi lần sửa: `npm test` và `npm run agent:check` phải xanh.

---

Thư mục này được thiết kế để tách ra thành npm package dùng lại ở dự án khác.
Trong repo học viên thì nó là thư mục thường — sửa được, commit được, nộp bài được.

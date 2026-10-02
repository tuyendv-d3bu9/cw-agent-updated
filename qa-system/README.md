# qa-system/ — Hệ thống 9 agent QA · **MÁY MÓC**

> **Bình thường bạn không cần mở thư mục này.** Agent tự đọc.
> Chỉ vào đây khi **cố ý nâng cấp hệ thống**: thêm skill, dựng agent mới, sửa skill cũ.

| Thư mục | Là gì |
|---|---|
| `core/QA_STANDARD.md` | Luật chung mọi agent tuân thủ: verdict, FACT, 06W, ma trận rủi ro |
| `qa-lead/` | Tổng chỉ huy — cửa ngõ duy nhất giữa bạn và hệ thống |
| `qa-analyst/` `qa-test-design/` … | 8 chuyên gia theo từng chặng |
| `tools/` | Công cụ nội bộ — xem [tools/README.md](tools/README.md) |
| `templates/` | Khuôn mẫu dựng agent/skill mới |
| `workflows/` | Bản đồ pipeline và các runbook chạy sẵn |

Muốn nâng cấp, cứ nói bằng lời: *"Tôi muốn skill sinh test case có thêm trường X"*.
QA Leader tự tra cây quyết định và lan truyền thay đổi ra đủ 7 điểm neo.

Sau mỗi lần sửa: `npm run agent:check` phải xanh.

---

Thư mục này được thiết kế để tách ra thành npm package dùng lại ở dự án khác
(xem `package.json` trong đây). Trong repo học viên thì nó là thư mục thường —
sửa được, commit được, nộp bài được.

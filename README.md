# CW QA Agent

Bộ AI Agent làm QA từ tài liệu yêu cầu tới test case, chạy được với mọi công cụ AI (Claude Code, Antigravity, Codex,
Cursor, Gemini CLI…). Nguyên tắc gốc: **AI chỉ được trích (có nguồn) hoặc hỏi (thành câu hỏi cho BA) — không sáng tác.**
Thiếu thông tin thì ghi `[CHƯA CÓ TRONG TÀI LIỆU]`, và như thế là đạt.

## Dùng thế nào

Bạn không cần gõ lệnh. Mở thư mục bằng công cụ AI rồi nói:

| Bạn nói | Agent làm |
|---|---|
| *"Khởi tạo giúp tôi"* | `npm run init` (dựng `INPUT/`, `knowledge/`, cài pre-commit) |
| *"Tôi vừa bỏ tài liệu vào INPUT, xử lý giúp"* | Nhận tài liệu, xếp 5 ngăn, dựng task |
| *"Phân tích tính năng <tên>"* | Lập `00_plan.md`, chạy 01 → 02, dừng ở câu hỏi cho BA |
| *"BA đã trả lời: …"* | Chép nguyên văn (kèm người + ngày), mở cổng, chạy tiếp 03 → 06 |
| *"Tiến độ thế nào?"* · *"Test case đạt chuẩn chưa?"* | Chạy `status` / `lint` và đọc kết quả thật |

## Luồng làm việc

```
INPUT/<slug>/ ─► 01 bóc rule ─► 02 tìm kẽ hở ─► [cổng ASK: BA trả lời] ─► 03 viewpoint ─► 04 test idea ─► 05 test case ─► [lint] ─► 06 độ phủ
                (trích nguyên văn)  (ma trận 06W)                                                                                      điểm dừng
```

Ba cổng do máy kiểm, không do AI tự kết luận:

| Cổng | Lệnh | Chặn khi |
|---|---|---|
| ASK | `npm run gate <slug>` | Còn câu hỏi BA chưa chốt (phải có người trả lời + ngày; AI không được tự chốt) |
| Lint | `npm run lint -- <slug>` | Thiếu trích dẫn, chữ thông báo / con số không có trong nguồn, sai format |
| Readiness | `npm run readiness -- <slug>` | Chưa đủ chín để sang automation |

Ngoài ra: hook chặn ghi file khi cổng đóng (Claude Code) và **pre-commit** lint trước mỗi commit (mọi công cụ).

## Thư mục

| Thư mục | Là gì | Ai sửa |
|---|---|---|
| `INPUT/<slug>/` | Tài liệu nguồn, 5 ngăn: `01_business` · `02_ba` (bắt buộc) · `03_dev` · `04_design` · `05_communication` | Bạn (agent chỉ đọc) |
| `OUTPUT/<slug>/` | Kết quả mỗi lần chạy: `00_plan` → `06`, `testcases/`, `runs/` | Agent |
| `knowledge/` | Tri thức tích luỹ: `_project.md` (quy ước dự án), `features/<slug>.md` (rule, câu hỏi, quyết định của BA) | Agent + con người theo luật |
| `qa-system/` | Agent, skill, luật chung (`core/QA_STANDARD.md`), tool, workflow | Chỉ qua quy trình nâng cấp |
| `docs/` | Sổ tay tạo skill (`so-tay-tao-skill.html`) và bài thực hành `skill-lab/` | Giảng viên |

## Đọc tiếp

- Luật cho mọi AI agent: [`AGENTS.md`](AGENTS.md) · riêng Claude Code: [`CLAUDE.md`](CLAUDE.md)
- Luật nghiệp vụ (verdict, cổng ASK, nhãn, FACT, 06W, mã định danh): [`qa-system/core/QA_STANDARD.md`](qa-system/core/QA_STANDARD.md)
- Toàn bộ lệnh: [`qa-system/tools/README.md`](qa-system/tools/README.md)
- Tạo / sửa skill: luật bắt buộc [`qa-system/templates/skills/LUAT-TAO-SKILL.md`](qa-system/templates/skills/LUAT-TAO-SKILL.md),
  sổ tay [`docs/so-tay-tao-skill.html`](docs/so-tay-tao-skill.html), thực hành [`docs/skill-lab/`](docs/skill-lab/)

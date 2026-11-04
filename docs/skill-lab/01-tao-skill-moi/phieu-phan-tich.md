# Phiếu phân tích — Bài 1: tạo skill mới

Học viên: `<tên>` · Nhánh: `lab/<tên>` · Ngày: `<YYYY-MM-DD>`

> Điền theo thứ tự. Ô nào chưa trả lời được thì ghi lý do, không bỏ trống. Phiếu nộp cho giảng viên, không commit.

## 1. Cây quyết định A / B / C

| Câu | Đúng / Sai | Lý do (một dòng, chỉ ra file đã tra) |
|---|---|---|
| (1) Chỉ đổi hành vi của một skill đang có? | | |
| (2) Đã có agent sở hữu đúng mảng việc này? Agent nào? | | |
| (3) Giao cho agent đó có vượt một vai trò không? (đọc loại file khác · ghi chỗ khác · phải thêm "và cũng…") | | |
| **Kết luận** | **[A] / [B] / [C]** vào agent `qa-…` | |

Kết quả `npm run agent:check -- --impact <agent>` (dán):

```
```

## 2. Đặt tầng

| Nội dung | Tầng (QA_STANDARD / knowledge / skill / AGENT.md) | Lý do |
|---|---|---|
| Luật "CR mới hơn, đã duyệt thì thắng spec" | | |
| Giá trị ngưỡng mới của một tính năng | | |
| Cách dò CR → BR/FD/AF → TC và format bảng kết quả | | |
| Agent này giờ làm thêm việc gì, giao lại cho ai | | |

## 3. Skill

- Tên file: `qa-system/qa-…/skills/<ten-skill>.md`
- Số thứ tự deliverable: `__` (tra bảng §2 của `qa-system/workflows/WORKFLOW.md`; lấy số kế tiếp sau số lớn nhất)
- Đầu vào: …
- Mục "KHÔNG được": …

## 4. Bảy điểm neo

| # | Điểm neo | File | Đã sửa gì | Trạng thái (ĐÃ XONG / KHÔNG ÁP DỤNG + lý do) |
|---|---|---|---|---|
| N1 | skill | | | |
| N2 | AGENT.md của agent | | | |
| N3 | WORKFLOW.md | | | |
| N4 | _system_map.json | | | |
| N5 | qa-lead/AGENT.md (§2 + §5) | | | |
| N6 | agent-doctor.js | | | |
| N7 | lint / schema + test | | | |

## 5. Nghiệm thu (dán kết quả thật)

| Kiểm tra | Kết quả |
|---|---|
| `npm test` | |
| `npm run agent:check` | |
| `npm run map:sync` | |
| `npm run workflow -- validate` | |
| Định tuyến: câu *"BA vừa gửi CR, test case nào bị ảnh hưởng?"* gọi đúng skill? | |
| Lần chạy 1 — danh sách TC bị ảnh hưởng | |
| Lần chạy 2 — danh sách TC bị ảnh hưởng | |
| `npm run diff-runs` + giải thích từng khác biệt | |

## 6. Commit

| Commit | Gồm | Đưa sang develop? |
|---|---|---|
| | | |

# Phiếu phân tích — Bài 2: nâng cấp skill missing-rule-06w

Học viên: `<tên>` · Nhánh: `lab/<tên>` · Ngày: `<YYYY-MM-DD>`

> Điền theo thứ tự. Ô nào chưa trả lời được thì ghi lý do, không bỏ trống. Phiếu nộp cho giảng viên, không commit.

## 1. Cây quyết định A / B / C

| Câu | Đúng / Sai | Lý do (một dòng, chỉ ra file đã tra) |
|---|---|---|
| (1) Chỉ đổi hành vi của một skill đang có? | | |
| (2) Đã có agent sở hữu đúng mảng việc này? Agent nào? | | (bỏ qua nếu câu 1 Đúng) |
| (3) Giao cho agent đó có vượt một vai trò không? (đọc loại file khác · ghi chỗ khác · phải thêm "và cũng…") | | |
| **Kết luận** | **[A] / [B] / [C]** vào agent `qa-…` | |

Kết quả `npm run agent:check -- --impact <agent>` (dán):

```
```

## 2. Đặt tầng

| Nội dung | Tầng (QA_STANDARD / knowledge / skill / AGENT.md) | Lý do |
|---|---|---|
| Bảng tín hiệu "thấy dấu hiệu gì thì xét ô W nào" | | |
| Định nghĩa 6 chiều W1–W6 và bảng áp dụng | | |
| Luật đặt mã MR khi một kẽ hở chạm nhiều ô | | |
| Câu hỏi về COD, đơn của người khác… của tính năng hoàn tiền | | |

## 3. Thay đổi trong skill

- File: `qa-system/qa-analyst/skills/missing-rule-06w.md` — mục nào thêm / sửa: …
- Bảng tín hiệu (dán bản cuối):
- Luật đặt chỗ MR:
- Có đổi format bảng ma trận không? (Có ⇒ N7 bắt buộc)

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
| `npm run lint -- lab-06w-a` / `lab-06w-b` | |
| Vòng 1 (trước) — `diff-runs`: ô 06W có kẽ hở · phán quyết ô 06W | |
| Vòng 2 (sau) — `diff-runs`: ô 06W có kẽ hở · phán quyết ô 06W | |
| 5 câu hỏi từ annotation còn ở cả hai lần? | |
| 4 chủ đề từng bị sót có ở cả hai lần "sau"? | |
| Giải thích từng khác biệt còn lại | |

## 6. Commit

| Commit | Gồm | Đưa sang develop? |
|---|---|---|
| | | |

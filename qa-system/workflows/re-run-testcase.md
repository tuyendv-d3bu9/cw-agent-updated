---
name: re-run-testcase
title: "Chạy lại sau khi BA trả lời"
description: "Chạy lại từ bước bị ảnh hưởng sau khi BA chốt câu hỏi hoặc sau verdict FIX."
format: legacy
triggers:
  - "BA đã trả lời chạy lại"
  - "chạy lại sau khi BA chốt"
  - "làm lại sau khi có câu trả lời"
---

# RUNBOOK — Chạy lại sau khi BA trả lời / sau verdict FIX

> Ai ghi mục nào của knowledge: `qa-system/core/QA_STANDARD.md` §8. Mã định danh giữ nguyên: §9.1.

## 1. Đưa câu trả lời vào knowledge

Câu trả lời là của **con người**. Agent chỉ chép **nguyên văn** điều người dùng đưa:

- [ ] §7 `knowledge/features/<slug>.md`: đúng dòng `MR-xx`, điền `Phản hồi chính thức`, `Người trả lời`, `Ngày`,
      đổi `Trạng thái` → `Confirmed` / `Rejected` / `TREO`. Không xoá dòng cũ.
- [ ] Quyết định nghiệp vụ không gắn với một MR → §8, **bắt buộc** có người phê duyệt + ngày (QA_STANDARD §9.5).
- [ ] Quy ước cả dự án → báo người dùng sửa `knowledge/_project.md`.
- [ ] `npm run knowledge:sync -- <slug> --write` (gom câu trả lời còn kẹt trong `OUTPUT/`), rồi `npm run gate <slug>`.

Không tự thêm `BR-xx` vào §3: skill `01` lần chạy kế tiếp sẽ chuyển MR đã chốt thành BR (nguồn `knowledge §8 #n` / §7).

## 2. Chạy lại từ đâu

| Thay đổi | Chạy lại từ |
|---|---|
| BA trả lời MR / thêm quyết định §8 / đổi `_project.md` | `01` (để MR đã chốt thành BR, rủi ro tính lại) |
| Tài liệu trong `INPUT/<slug>/` đổi | intake rồi `01` |
| Verdict `FIX` ở một bước | Đúng bước đó |

Mọi bước **sau** bước bắt đầu đều chạy lại. Cổng `ask` vẫn áp trước `03`.

## 3. Khối lệnh

```
Trước khi chạy: chép OUTPUT/<slug>/ sang OUTPUT/<slug>.bak/ (không xoá file cũ trước khi chép).
Chạy từ bước đã chọn tới hết nhánh A, mỗi bước tick 00_plan.md và in verdict.
Mã đã có giữ nguyên; mã mới lấy từ `npm run ids -- <slug>`.
Dừng và báo nếu: MR đã Confirmed/Rejected bị hỏi lại · quyết định §8 bị gắn lại [GIẢ ĐỊNH] ·
giá trị đã khai ở knowledge bị gắn [CONTEXT_MISSING]. Đó là dấu hiệu agent không đọc knowledge.
```

## 4. So sánh lần 1 và lần 2

| Tiêu chí | Đạt khi |
|---|---|
| MR `New`/`TREO` ở `02` | Chỉ còn câu chưa được trả lời; không có câu đã chốt bị hỏi lại |
| Verdict `02` | `PASS` khi mọi MR đã `Confirmed`/`Rejected` |
| Mã `BR`/`MR`/`TI`/TC cũ | Giữ nguyên số; khác biệt nào cũng phải giải thích được bằng câu trả lời mới |
| Ô `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` | MR nào đã chốt thì ô đó đã có giá trị trích từ knowledge |

Số lượng test case **không** phải tiêu chí (QA_STANDARD §2 — không quota).

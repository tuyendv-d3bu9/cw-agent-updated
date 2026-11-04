---
name: verify-testcase
title: "Nghiệm thu test suite"
description: "Chỉ rà soát độ phủ Chặng 6 và kiểm tay, không sinh mới."
format: legacy
triggers:
  - "nghiệm thu test case"
  - "kiểm tra bộ test trước khi bàn giao"
  - "rà soát lại bộ test case"
---

# RUNBOOK — Nghiệm thu test suite (không sinh mới)

> Chỉ đọc và đánh giá. File được ghi mới duy nhất: `06_coverage_review.md`.

## 1. Tiền đề
- [ ] Có `01`, `02`, `04`, `05` trong `OUTPUT/<slug>/` — thiếu ⇒ **dừng**, không có gốc để đối soát.
- [ ] `npm run gate <slug>` exit `0` và `npm run lint -- <slug>` exit `0`.
- [ ] Có `12` thì đưa vào; không có thì ghi rõ trong `06` là chưa đánh giá gap dữ liệu.

## 2. Khối lệnh
```
Chạy qa-system/qa-test-design/skills/coverage-review.md cho <slug>.
Verdict theo qa-system/core/QA_STANDARD.md §1 (luật riêng của coverage-review).
Không sinh test case mới, không sửa 01–05, không đổi trạng thái trong knowledge.
Tick 00_plan.md và in verdict.
```

## 3. Kiểm tay — con người làm, không giao agent tự chấm

| # | Mũi kiểm | Đạt khi |
|---|---|---|
| 1 | Truy vết ngược 3 TC: `Tags` → `04` → `03` → `01`/knowledge → `INPUT/<slug>/` | Không đứt chặng nào |
| 2 | Truy vết xuôi 3 `BR-xx`/`FD-xx` | Có TC, hoặc `CHƯA COVER` ở `06` |
| 3 | Một field có min/max trong nguồn | Đủ chuỗi biên QA_STANDARD §6 |
| 4 | 3 TC negative | Expected trích nguồn, hoặc nhãn `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` |

Mũi nào trượt ⇒ ghi vào bảng FIX của `06` và trả về bước tương ứng.

## 4. Human-Final
Mục Human-Final của `06` (mức chấp nhận rủi ro, tác động liên hệ thống, thăm dò thêm) do người phụ trách ký.
Cần thăm dò ⇒ `qa-system/qa-automation/skills/exploratory-charter.md`, không nhồi vào bộ scripted.

---
name: coverage-review
description: >
  Đối soát độ phủ test suite: mọi BR/FD/AF, MR đã chốt và TI "Giữ" có test case; cân bằng theo
  viewpoint đã chọn ở Chặng 3; đủ chuỗi biên. Ra verdict PASS / FIX / ASK có điểm kết thúc.
---

# Skill: coverage-review

> Tuân thủ `qa-system/core/QA_STANDARD.md` (**verdict Chặng 6 §1** · guard §2 · nhãn §2.1 · FACT §3 ·
> chuỗi biên §6 · knowledge §8 · ID §9 · nguồn §10).

## Mục đích
Chốt chặn cuối của test design: tìm mục chưa có test case và nói rõ vì sao — do chưa viết (sửa được)
hay do thiếu thông tin (phải hỏi). Không đánh giá thay con người mức rủi ro chấp nhận được.

## Đầu vào
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — `BR`, `FD`, `AF`.
- `OUTPUT/<task-slug>/02_missing_rule_report.md` — `MR` và trạng thái.
- `OUTPUT/<task-slug>/03_viewpoint_report.md` — VP đã chọn.
- `OUTPUT/<task-slug>/04_test_idea_report.md` — TI `Giữ` / `Chờ MR`.
- `OUTPUT/<task-slug>/05_test_case_spec.md` (hoặc `testcases/batch_*.md`).
- `OUTPUT/<task-slug>/12_data_validation_traceability.md` nếu có.
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` — §7 (trạng thái MR), §8.

## KHÔNG được (riêng skill này)
- Đánh số lại / gộp mã của 01–05.
- Để trống ô `Test Case IDs cover` — chưa có thì `CHƯA COVER`.
- Đề xuất bổ sung kèm giá trị, chữ thông báo, expected tự chế. Đề xuất chỉ nêu **kịch bản + mã nguồn**;
  giá trị dẫn về nguồn hoặc nhãn §2.1.
- Đối chiếu viewpoint với danh mục nào khác ngoài các VP đã chọn ở 03.
- Tự viết test case — gap sửa được thì trả `FIX` cho `test-case-generation`.

## Các bước
1. **Lint** — chạy `npm run lint -- <task-slug>`, dán kết quả thật. Exit `1` ⇒ verdict `FIX`, liệt kê lỗi, dừng.
2. **Ma trận** — một dòng cho mỗi `BR`/`FD`/`AF` của 01, mỗi `MR` `Confirmed`, mỗi `TI` `Giữ`. Cột cover lấy
   các `TC_ID` có tag `Rule#<mã>` hoặc `TI#<mã>` tương ứng.
3. **Phân loại gap** của mỗi dòng `CHƯA COVER`:
   - Có TI `Giữ` hoặc nguồn đủ để viết ⇒ `FIX: <kịch bản> — dựa trên <mã>` (chuyển `test-case-generation`; chưa có TI thì chuyển `test-idea-design`).
   - Chỉ có TI `Chờ MR`, hoặc thiếu thông tin ⇒ `ASK: MR-xx` (MR đã có) hoặc `ASK: cần MR cho <mã> × W<n>` (chuyển Chặng 2).
4. **Cân bằng viewpoint** — mỗi VP ở 03 §2 có ít nhất một TC `Viewpoint#VP-xx` (một TC được mang nhiều tag `Viewpoint#`); TC mang VP không có trong 03 ⇒ `FIX`.
5. **Chuỗi biên** — mỗi `FD` có min/max/độ dài trong nguồn: đủ điểm QA_STANDARD §6 có TC. `FD` không có ngưỡng
   trong nguồn ⇒ không tính gap ở đây (đã là MR).
6. **Dữ liệu** — có `12_` ⇒ ghi các TC `CHƯA CÓ DATA` (tham khảo, không đổi verdict).
7. **Verdict** — theo QA_STANDARD §1 (Chặng 6): `PASS` khi lint sạch và không còn `CHƯA COVER`; còn gap
   loại FIX ⇒ `FIX`; chỉ còn gap loại ASK ⇒ `ASK`. Có cả hai ⇒ `FIX` (sửa phần sửa được trước).

Vòng lặp hội tụ: mỗi lần `FIX` giảm số dòng `CHƯA COVER`; không còn gap ⇒ `PASS`. Không nghi ngờ suông khi không có gap.

## Format output
Ghi ra `OUTPUT/<task-slug>/06_coverage_review.md`:

````markdown
# Coverage Review · <task-slug>
Owner: qa-system/qa-test-design/skills/coverage-review.md · Nguồn: 01–05, knowledge/features/<feature-slug>.md · Verdict: FIX

## 1. KẾT QUẢ LINT
```
<dán nguyên kết quả npm run lint -- <task-slug>>
```

## 2. MA TRẬN ĐỘ PHỦ
| Mã | Loại | Mô tả | Test Case IDs cover | Gap & Đề xuất |
|---|---|---|---|---|
| BR-01 | BR | <mô tả ngắn từ 01> | <MODULE>-001, <MODULE>-002 | Đạt |
| FD-02 | FD | <…> | CHƯA COVER | FIX: kiểm điểm max+1 — dựa trên FD-02 |
| AF-01 | AF | <…> | CHƯA COVER | ASK: MR-04 |
| TI-05 | TI | <…> | <MODULE>-007 | Đạt |

## 3. CÂN BẰNG VIEWPOINT
| VP | Tên | Số TC | Ghi chú |
|---|---|---|---|
| VP-01 | Happy Path | <số> | <…> |

## 4. CHUỖI BIÊN
| FD | min-1 | min | min+1 | Giữa | max-1 | max | max+1 |
|---|---|---|---|---|---|---|---|
| FD-02 | <TC_ID> | <TC_ID> | <TC_ID> | <TC_ID> | <TC_ID> | <TC_ID> | CHƯA COVER |

## 5. HUMAN-FINAL
- Mức rủi ro chấp nhận được, Priority cuối, Automated/Manual: do QA Lead / PO quyết (không chặn verdict).

## FIX
| # | Vị trí | Vấn đề | Bản sửa đề xuất |
|---|---|---|---|

## ASK
| # | Vị trí | Cần gì | Chuyển cho ai |
|---|---|---|---|
````

`FD` dạng định dạng/độ dài dùng cột tương ứng của §6 (rỗng · 1 ký tự · đúng độ dài · quá độ dài · sai định dạng · ký tự đặc biệt).
Mục không có dòng ⇒ không dựng bảng, ghi dòng văn bản `Không có`.

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Đã chạy lint và dán kết quả thật.
- [ ] Ma trận có đủ mọi `BR`/`FD`/`AF` của 01, mọi `MR` `Confirmed`, mọi `TI` `Giữ`; không ô trống.
- [ ] Mỗi gap mang `FIX:` hoặc `ASK:` kèm mã nguồn; không có giá trị tự chế.
- [ ] Viewpoint chỉ đối chiếu với VP của 03.
- [ ] Verdict đúng luật Chặng 6 (QA_STANDARD §1).

---
name: missing-rule-06w
description: >
  Quét ma trận đóng 06W (mỗi BR/FD/AF × W1–W6) để tìm kẽ hở quy tắc, chuyển mọi OQ của Chặng 1
  thành câu hỏi MR-xx cho BA/PO. Là cổng ASK của pipeline.
---

# Skill: missing-rule-06w

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict & cổng ASK §1 · guard §2 · FACT §3 · **06W §4** ·
> knowledge §8 · bảng câu hỏi §9.4 · nguồn §10 · thang đo §11).

## Mục đích
Biến mọi chỗ nguồn **chưa trả lời** thành câu hỏi đóng `MR-xx` cho BA/PO. Cùng tài liệu + cùng knowledge
⇒ cùng bộ câu hỏi, vì phép quét là ma trận đóng (QA_STANDARD §4), không phải tìm tự do.

## Đầu vào
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — danh sách `BR`, `FD`, `AF` (hàng của ma trận) và `OQ`.
- `INPUT/<task-slug>/` **hoặc** `OUTPUT/<task-slug>/00_knowledge_digest.md` — để kiểm một ô có thật sự
  thiếu trong nguồn trước khi kết luận `Có kẽ hở` (01 có thể đã nén mất chi tiết).
- `OUTPUT/<task-slug>/01_conflict_warning.md` nếu có.
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` — §7 (câu đã hỏi), §8 (quyết định đã chốt), §9.

## KHÔNG được (riêng skill này)
- Sinh test idea / test case / test data / expected result.
- Tìm kẽ hở ngoài ma trận. Quét xong ma trận là dừng.
- Hỏi lại điều nguồn hoặc knowledge (§3 Confirmed, §8, §9) đã trả lời.
- Viết câu hỏi mở chung chung ("hệ thống xử lý thế nào?"). Câu hỏi phải trả lời được bằng Có/Không,
  một con số, hoặc chọn phương án.
- Coi `Phương án gợi ý` là rule, hay dùng nó làm expected ở chặng sau.
- Tự điền `Phản hồi chính thức`, `Người trả lời`, `Ngày`, hay đổi `Trạng thái` khi người dùng chưa chuyển lời BA/PO.

## Các bước
1. **Dựng ma trận** — mỗi `BR-xx`, `FD-xx`, `AF-xx` của 01 một hàng × `W1…W6` (tên và trọng tâm theo §4).
2. **Chấm từng ô** đúng một kết quả:
   - `Nguồn: <mã hoặc file §mục>` — nguồn/knowledge đã trả lời (kiểm lại trong `INPUT/` hoặc digest).
   - `Không áp dụng` — chiều W này không liên quan đối tượng (vd `W5` cho field không phụ thuộc actor).
   - `MR-xx` — có kẽ hở. Một kẽ hở dùng chung cho nhiều ô ⇒ cùng một mã.
   Field thiếu min/max/độ dài ⇒ một `MR` ở ô `W1` của `FD` đó (chuỗi biên thuộc §6, không hỏi từng điểm biên).
3. **Đối chiếu OQ** — mỗi `OQ-xx` của 01 ⇒ đúng một `MR-xx` (có thể trùng MR đã sinh ở bước 2), hoặc
   `Nguồn: <...>` nếu nguồn/knowledge thực ra đã trả lời.
4. **Cấp mã** — kẽ hở trùng một câu đã có ở knowledge §7 ⇒ **giữ mã cũ** và chép trạng thái/phản hồi hiện có.
   Kẽ hở mới ⇒ số kế tiếp từ `npm run ids -- <task-slug>`. Không đánh lại từ `MR-01`.
5. **Chi tiết hoá** mỗi `MR` mới (format §2) và ghi vào bảng câu hỏi §3.
6. **Verdict** (bên dưới), FACT Self-Audit, ghi file và knowledge.

### Phân loại MR (một trong 5 nhóm)
`Boundary & Edge` · `State & Lifecycle` · `Exception & Error Handling` · `Dependency & Side-Effect` · `Implicit & Authorization`.

## Verdict
- `ASK` — còn ít nhất một `MR` trạng thái `New` hoặc `TREO` (§9.3). Cổng ASK đóng theo QA_STANDARD §1.
- `PASS` — không có `MR`, hoặc mọi `MR` đều `Confirmed`/`Rejected`.
- `FIX` — ma trận thiếu hàng/ô, OQ chưa đối chiếu ⇒ tự sửa rồi chạy lại.

## Format output
Ghi ra `OUTPUT/<task-slug>/02_missing_rule_report.md`:

````markdown
# Missing Rule Report · <task-slug>
Owner: qa-system/qa-analyst/skills/missing-rule-06w.md · Nguồn: 01_requirement_risk_summary.md, <INPUT/digest đã đối chiếu>, knowledge/features/<feature-slug>.md · Verdict: ASK

## 1. MA TRẬN 06W
| Đối tượng | W1 | W2 | W3 | W4 | W5 | W6 |
|---|---|---|---|---|---|---|
| BR-01 | Nguồn: 02_ba/<file> §2.1 | MR-03 | Không áp dụng | MR-04 | Không áp dụng | Nguồn: BR-02 |
| FD-01 | MR-05 | Không áp dụng | Không áp dụng | Không áp dụng | Không áp dụng | Không áp dụng |

## 2. CHI TIẾT MISSING RULES
### MR-03 — <tên ngắn>
- Căn cứ: <mã đối tượng × W, trích vị trí trong nguồn — hoặc "nguồn không đề cập">
- W: W2 — What if state lạ
- Nhóm: State & Lifecycle
- Kẽ hở: <tình huống nguồn chưa nói>
- Rủi ro nếu bỏ qua: <hệ quả, chỉ từ điều tài liệu mô tả>
- Ưu tiên: High

## 3. BẢNG CÂU HỎI
| ID | Kẽ hở | Nhóm 06W | Nguồn phát hiện | Phương án gợi ý (chưa phải rule) | Câu hỏi cho BA/PO | Phản hồi chính thức | Người trả lời | Ngày | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|
| MR-03 | <kẽ hở> | W2 | BR-01 × W2 | A) <…> · B) <…> | <câu hỏi đóng> |  |  |  | New |

## 4. ĐỐI CHIẾU OQ
| OQ | Xử lý |
|---|---|
| OQ-01 | MR-03 |
| OQ-02 | Nguồn: 05_communication/<file> §<mục> |
````

Không có MR ⇒ §2 và §3 ghi dòng văn bản `Không có` (không dựng bảng). Không có OQ ⇒ §4 ghi dòng văn bản `Không có`.

## Ghi knowledge
Theo QA_STANDARD §8: skill `02` chỉ **thêm** dòng mới vào §7 của `knowledge/features/<feature-slug>.md`,
trạng thái `New`, đúng bảng §9.4. Không xoá, không sửa dòng cũ, không ghi §8.

Khi người dùng chuyển lời BA/PO: chép **nguyên văn** vào `Phản hồi chính thức` / `Người trả lời` / `Ngày`
/ `Trạng thái` trong §3 của báo cáo, rồi chạy:

```bash
npm run knowledge:sync -- <task-slug> --write
npm run gate <task-slug>
```

Dán kết quả thật. Mọi MR đã `Confirmed`/`Rejected` ⇒ sửa dòng meta của 02 thành `Verdict: PASS`
(không chạy lại Chặng 2), rồi chạy lại Chặng `01` để nâng MR đã chốt thành `BR` và cập nhật §9 hằng số.

Câu trả lời phải dùng được **nguyên văn**. Câu trả lời còn biến hoặc mẫu (`<tên trường>`, `X ký tự`,
"tuỳ trường hợp") thì chưa phải giá trị cụ thể: để trạng thái `TREO`, ghi câu hỏi tiếp theo nêu rõ cần chữ/số gì.
Câu trả lời chỉ nằm trong `OUTPUT/` sẽ mất ở lần chạy sau — vì vậy bước sync là bắt buộc.

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Ma trận có đủ mọi `BR`/`FD`/`AF` của 01; mọi ô có đúng một kết quả hợp lệ.
- [ ] Mọi `OQ` của 01 có một dòng ở §4.
- [ ] Mỗi `MR` ở ma trận có mục `###` ở §2 và một dòng ở §3; câu hỏi là câu đóng.
- [ ] Không MR nào trùng câu đã có ở knowledge §7 mà mang mã mới.
- [ ] Verdict khớp trạng thái các MR (§9.3); `npm run gate <slug>` đã chạy, kết quả thật được dán.

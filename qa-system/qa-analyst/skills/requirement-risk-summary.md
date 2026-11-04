---
name: requirement-risk-summary
description: >
  Bóc tách tài liệu yêu cầu trong INPUT/<slug>/ (5 ngăn) thành báo cáo 10 phần có trích nguồn:
  Business Rule, Field & ràng buộc, luồng phụ, điểm chưa rõ (OQ) và ma trận rủi ro. Là cửa ngõ
  đầu tiên của pipeline QA.
---

# Skill: requirement-risk-summary

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict §1 · guard §2 · FACT §3 · risk §5 · knowledge §8 ·
> ID & schema §9 · nguồn & ưu tiên §10 · thang đo §11). Skill này **trích**, không sáng tác.

## Mục đích
Chuyển tài liệu nguồn thành `01_requirement_risk_summary.md`: mọi rule, field, luồng phụ đều có
nguồn + trích nguyên văn; điều chưa rõ thành `OQ-xx` để Chặng 2 xử lý. Đây là đầu vào của mọi chặng sau.

## Đầu vào
- `INPUT/<task-slug>/` — đủ 5 ngăn (bảng dưới). Ngăn trống thì ghi nhận, không dừng — trừ `02_ba/`.
  **Không đọc** `<ngăn>/_superseded/` (bản đã bị thay) và không trích dẫn từ đó.
- **Hoặc** `OUTPUT/<task-slug>/00_knowledge_digest.md` nếu có (skill `knowledge-digest`). Digest giữ
  nguồn + trích nguyên văn gốc từng dòng; mở lại tài liệu gốc khi cần kiểm một dòng.
- `OUTPUT/<task-slug>/01_conflict_warning.md` nếu có (`qa-system/tools/knowledge/conflict-detector.js`).
- `OUTPUT/<task-slug>/jira_defects_summary.md` nếu có — chỉ dùng chấm Likelihood.
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` (QA_STANDARD §7, §8).

> Thiếu `02_ba/` và không có digest → DỪNG, báo thiếu tài liệu nghiệp vụ (verdict `ASK`).

### Ngăn → lấy gì
| Ngăn | Lấy gì | Ghi vào mục |
|---|---|---|
| `01_business/` | Mục tiêu, bối cảnh, người dùng, con số kinh doanh **có ghi** | §1, §8, §9 |
| `02_ba/` | Rule, luồng chính, luồng phụ, actor, loại trừ tường minh | §2–§6 |
| `03_dev/` | Kiểu, độ dài, định dạng, bắt buộc của field; mã phản hồi API | §3b, §5 |
| `04_design/` | Field trên màn hình, nhãn, chữ thông báo hiển thị | §3b (`Thông báo khi sai`), §5 |
| `05_communication/` | CR, Q&A, biên bản có ngày — ghi đè phần nó nói tới nếu mới hơn spec | §3, §3b, §5, §7 |

Khi các ngăn nói khác nhau: áp **QA_STANDARD §10.2**. Không xác định được bản nào thắng ⇒ ghi `OQ`, không tự chọn.
Phần `## Annotations / Pending changes` (comment, tracked changes, "DRAFT") **chưa phải sự thật** ⇒ mỗi mục một `OQ`.

## KHÔNG được (riêng skill này)
- Sinh câu hỏi 06W, viewpoint, test idea, test case — việc của `02`→`05`.
- Ghi rule/field/thông báo không trích được nguyên văn. Không trích được ⇒ là `OQ`, không phải `BR`.
- Tách một rule có điều kiện ghép (AND/OR, ngoại lệ "trừ khi…") thành nhiều dòng làm mất điều kiện.
  Một `BR` = một **tổ hợp điều kiện → hành vi** đầy đủ như nguồn viết.
- Ghi vào Out of Scope điều tài liệu **không nhắc** (QA_STANDARD §2 luật 8).
- Ước đoán con số doanh thu, lượt dùng, SLA (QA_STANDARD §5).
- Dừng pipeline vì có `OQ` — cổng ở Chặng 2, không ở đây.

## Mã định danh
- **Không tự đếm số.** Viết mã tạm theo thứ tự đọc nguồn (`BR-?`, `FD-?`, `AF-?`, `OQ-?`, `RK-?`; cùng một nhãn như `BR-?a` ⇒ cùng một số), ghi file, rồi chạy `npm run ids -- <task-slug> --assign OUTPUT/<task-slug>/01_requirement_risk_summary.md`. Tool đánh số thật, tiếp nối số đang có.
- Rule/field đã có trong knowledge §3/§3b (cùng nguồn, cùng nội dung) ⇒ **giữ mã cũ**. Mới ⇒ số kế tiếp.
- MR đã chốt ở knowledge §8 sinh ra rule mới ⇒ cấp `BR` số kế tiếp, `Nguồn` = `knowledge §8 #n`, `Trích nguyên văn` để trống.
- `BR` cũ trong knowledge mà đoạn trích không còn tìm thấy trong `INPUT/` hiện tại ⇒ giữ mã, thêm một `OQ`
  "Rule `BR-xx` không còn trong tài liệu hiện hành — còn hiệu lực không?".

## Các bước
| # | Bước | Yêu cầu |
|---|---|---|
| 0 | Nạp nguồn | Đọc knowledge, rồi từng ngăn theo bảng trên. Ghi danh sách file đã đọc vào dòng meta |
| 1 | Feature Overview | 1–2 câu, kèm nguồn |
| 2 | Actor & Role | Chỉ actor có trong nguồn, kèm nguồn |
| 3 | Business Rules | Bảng §9.6, mỗi dòng có `Trích nguyên văn` đúng từng chữ |
| 3b | Field & ràng buộc | Bảng §9.6. Ô không có trong nguồn ⇒ `[CHƯA CÓ TRONG TÀI LIỆU]`. `Thông báo khi sai` chỉ ghi khi nguồn có chữ thông báo nguyên văn |
| 4 | Happy Path | Các bước có trong nguồn, kèm nguồn |
| 5 | Alternate Flows | Luồng phụ / lỗi **có trong nguồn**, phản hồi nguyên văn nếu có |
| 6 | Out of Scope | Chỉ loại trừ tường minh, kèm trích. Không có ⇒ không dựng bảng, ghi dòng văn bản `Không có loại trừ tường minh` |
| 7 | Điểm chưa rõ | `OQ-xx` từ: chỗ mơ hồ, mâu thuẫn §10.2 không phân xử được, Annotations, `01_conflict_warning.md`, BR cũ mất nguồn. Không quota, có thể rỗng |
| 8 | Business Criticality | Trích từ `01_business/` hoặc `_project.md` (dòng đã khai). Không có ⇒ `[CONTEXT_MISSING]` |
| 9 | Missing Risk Context | 5 khía cạnh (bảng dưới): có gì / thiếu gì, kèm nguồn |
| 10 | Risk Analysis | Ma trận QA_STANDARD §5. `Nguồn` = mã `BR`/`FD`/`AF`/`OQ` liên quan |
| 11 | FACT Self-Audit | QA_STANDARD §3, rồi ghi file + knowledge |

### Bước 9 — 5 khía cạnh
`User` (nhóm người dùng) · `Usage` (tần suất, tải, cao điểm) · `Financial` (giá trị giao dịch) ·
`Operational` (vận hành, SLA) · `Criticality` (vai trò của tính năng). Thiếu ⇒ `[CONTEXT_MISSING]`.

### Bước 10 — chấm rủi ro
- Likelihood: từ số điều kiện ghép, số nhánh, số `OQ` liên quan, lịch sử lỗi trong `jira_defects_summary.md`.
- Impact: từ tác động **tài liệu mô tả**. Severity theo thang §11 (`Critical`/`Major`/`Minor`/`Trivial`).
- Bối cảnh §8/§9 thiếu ⇒ vẫn chấm, `Cờ tin cậy` = `SEVERITY_CONFIDENCE_LOW`; đủ ⇒ `SEVERITY_CONFIDENCE_HIGH`.

## Verdict
- `PASS` — đủ 10 phần đúng format. `OQ` **không** chặn (Chặng 2 xử lý).
- `FIX` — sai format / thiếu trích dẫn sửa được từ nguồn đang có ⇒ tự sửa rồi chạy lại.
- `ASK` — chỉ khi không có tài liệu nghiệp vụ để đọc (thiếu `02_ba/` và không có digest).

## Format output
Ghi ra `OUTPUT/<task-slug>/01_requirement_risk_summary.md`, đúng thứ tự 10 phần:

````markdown
# Requirement & Risk Summary · <task-slug>
Owner: qa-system/qa-analyst/skills/requirement-risk-summary.md · Nguồn: <các file đã đọc> · Verdict: PASS

## 1. FEATURE OVERVIEW
<1–2 câu> — Nguồn: <file §mục>

## 2. ACTOR & USER ROLE
| Actor | Vai trò / quyền hạn | Nguồn (file §mục) |
|---|---|---|

## 3. BUSINESS RULES
| ID | Điều kiện | Hành vi / Kết quả | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|
| BR-01 | <điều kiện đầy đủ, giữ AND/OR> | <hành vi> | 02_ba/<file> §<mục> | <đoạn chép đúng từng chữ> |

## 3b. FIELD & RÀNG BUỘC
| ID | Field | Kiểu | Bắt buộc | Ràng buộc (min/max/định dạng) | Thông báo khi sai | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|---|---|---|
| FD-01 | <tên field> | <kiểu> | <Có/Không/[CHƯA CÓ TRONG TÀI LIỆU]> | <ràng buộc hoặc [CHƯA CÓ TRONG TÀI LIỆU]> | <nguyên văn hoặc [CHƯA CÓ TRONG TÀI LIỆU]> | 03_dev/<file> §<mục> | <đoạn chép đúng từng chữ> |

## 4. HAPPY PATH
1. <bước> — Nguồn: <file §mục>

## 5. ALTERNATE FLOWS
| ID | Tình huống | Hệ thống phản hồi | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|
| AF-01 | <tình huống> | <nguyên văn hoặc [CHƯA CÓ TRONG TÀI LIỆU]> | <file §mục> | <đoạn chép đúng từng chữ> |

## 6. OUT OF SCOPE
| Nội dung loại trừ | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|

## 7. ĐIỂM CHƯA RÕ
| ID | Điểm chưa rõ | Vị trí trong nguồn |
|---|---|---|
| OQ-01 | <điều chưa rõ / mâu thuẫn / annotation> | <file §mục> |

## 8. BUSINESS CRITICALITY ASSESSMENT
- Bối cảnh ghi nhận: <trích kèm nguồn, hoặc [CONTEXT_MISSING]>

## 9. MISSING RISK CONTEXT INFORMATION
| Khía cạnh | Có trong nguồn | Thiếu | Ảnh hưởng tới chấm rủi ro |
|---|---|---|---|
| User | <trích + nguồn, hoặc Không> | <…, hoặc [CONTEXT_MISSING]> | <…> |
| Usage | | | |
| Financial | | | |
| Operational | | | |
| Criticality | | | |

## 10. RISK ANALYSIS
| ID | Rủi ro | Likelihood | Impact | Risk Level | Severity | Cờ tin cậy | Nguồn |
|---|---|---|---|---|---|---|---|
| RK-01 | <rủi ro> | HIGH | MEDIUM | HIGH | Major | SEVERITY_CONFIDENCE_LOW | BR-01, OQ-02 |
````

Mục không có dòng nào ⇒ **không** dựng bảng, ghi một dòng văn bản `Không có` ngay dưới heading. Ô thiếu ⇒ nhãn QA_STANDARD §2.1.

## Ghi knowledge
Theo QA_STANDARD §8 (skill `01` ghi §1–§6, §9, §10 của `knowledge/features/<feature-slug>.md`; tạo từ
`knowledge/_template.md` nếu chưa có). Chỉ ghi dữ kiện có nguồn §10.1. **Không** ghi §7, §8, không ghi `OQ`.
Không xoá dòng cũ — rule mất nguồn giữ nguyên, đã có `OQ` ở báo cáo.

| Mục knowledge | Lấy từ |
|---|---|
| §1 · §2 · §4 | phần 1, 2, 4 |
| §3 · §3b | phần 3, 3b (trạng thái `Confirmed` khi có trích nguyên văn hoặc nguồn `knowledge §8 #n`) |
| §5 · §6 | phần 5, 6 |
| §9 | hằng số có trong nguồn (min/max, định dạng, đơn vị) — kèm nguồn |
| §10 | mã `BR`/`FD`/`AF` + nguồn |

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Dòng 1–2 đúng QA_STANDARD §7; đủ 10 phần (cộng §3b), đúng tiêu đề và cột như format.
- [ ] Mọi `BR`/`FD`/`AF` có `Nguồn` và `Trích nguyên văn` tìm thấy trong `INPUT/` (hoặc nguồn `knowledge §8 #n`) — `npm run lint -- <slug>` kiểm.
- [ ] Đã đọc đủ 5 ngăn; mâu thuẫn và Annotations đã thành `OQ` hoặc phân xử theo §10.2 (ghi rõ nguồn thắng).
- [ ] Mã giữ ổn định với knowledge; mã mới lấy từ `npm run ids`.
- [ ] Out of Scope chỉ có loại trừ tường minh.
- [ ] Không có con số kinh doanh nào không trích được nguồn.

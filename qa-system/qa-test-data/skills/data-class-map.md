---
name: data-class-map
description: >
  Lập bản đồ Data Class (Valid, Boundary, Invalid, Null/Empty, Special) cho từng field lấy từ
  bảng FD của Chặng 1, kèm mốc biên khi nguồn có min/max/độ dài.
---

# Skill: data-class-map

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict §1 · guard §2 · nhãn §2.1 · FACT §3 · **chuỗi biên §6** ·
> knowledge §8 · nguồn §10).

## Mục đích
Chuẩn hoá phân loại dữ liệu test cho **từng field** trước khi sinh dataset — chặn "Garbage data → Garbage testing".

## Đầu vào
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — **§3b FIELD & RÀNG BUỘC** (`FD-xx`) và `BR` liên quan.
- `OUTPUT/<task-slug>/05_test_case_spec.md` — TC nào cần data cho field nào.
- `knowledge/_project.md` (§2 định dạng ngày/tiền, NULL vs rỗng) · `knowledge/features/<feature-slug>.md` (§3b, §8, §9).

## KHÔNG được (riêng skill này)
- Sinh dataset ở bước này.
- Thêm field không có trong `FD` của 01.
- Tự đặt khoảng giá trị, độ dài, định dạng. Không có trong `FD`/knowledge §9 ⇒ `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]`.

## Registry 5 Data Class (cố định)
| Data Class | Mô tả |
|---|---|
| **Valid** | Thoả mọi ràng buộc có nguồn |
| **Boundary** | Điểm chuỗi biên QA_STANDARD §6 |
| **Invalid** | Vi phạm ràng buộc có nguồn (sai kiểu, sai định dạng, ngoài khoảng) |
| **Null/Empty** | Không có giá trị — chỉ khi `Bắt buộc` có nguồn |
| **Special** | Ký tự đặc biệt, khoảng trắng thừa, hoa-thường |

## Các bước
1. Mỗi `FD-xx` của 01 một dòng; kiểu, bắt buộc, ràng buộc chép từ `FD` (hoặc knowledge §9 kèm nguồn).
2. Chọn Data Class áp dụng được theo ràng buộc **có nguồn**.
3. `FD` có min/max/độ dài trong nguồn ⇒ ghi mốc biên theo §6. Không có ⇒ `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]`.
4. Field thiếu thông tin ⇒ ghi bảng §2; MR đã có thì trỏ mã, chưa có thì thêm dòng `## ASK` (chuyển Chặng 2).

## Verdict
`PASS` khi mọi `FD` có dòng; thiếu thông tin đã có MR hoặc dòng ASK. Còn field thiếu mà chưa có MR ⇒ `ASK`.

## Format output
Ghi ra `OUTPUT/<task-slug>/09_data_class_map.md`:

````markdown
# Data Class Map · <task-slug>
Owner: qa-system/qa-test-data/skills/data-class-map.md · Nguồn: 01_requirement_risk_summary.md §3b, knowledge/features/<feature-slug>.md · Verdict: PASS

## 1. FIELD MAP
| FD | Field | Kiểu | Ràng buộc (có nguồn) | Data Class cần test | Mốc biên (§6) |
|---|---|---|---|---|---|
| FD-01 | <tên> | <kiểu> | <chép từ FD> | Valid, Boundary, Invalid, Null/Empty | <min-1 … max+1 tính từ nguồn, hoặc [CHƯA CÓ TRONG TÀI LIỆU – MR-xx]> |

## 2. FIELD THIẾU THÔNG TIN
| FD | Thiếu gì | MR |
|---|---|---|
| FD-02 | <min/max, định dạng…> | <MR-xx, hoặc "chưa có — xem ASK"> |

## ASK
| # | Vị trí | Cần gì | Chuyển cho ai |
|---|---|---|---|
````

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Mọi `FD` của 01 có đúng một dòng; không field ngoài `FD`.
- [ ] Không có ngưỡng/định dạng nào không trích được về `FD` hoặc knowledge §9.
- [ ] Mốc biên đúng §6 cho field có ngưỡng trong nguồn.

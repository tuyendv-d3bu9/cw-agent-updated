---
name: boundary-negative-dataset
description: >
  Sinh dataset kiểm thử biên (Boundary) và âm tính (Negative/Invalid/Null/Special) có chủ đích,
  đảm bảo mỗi record kiểm đúng một edge case và phủ trọn vẹn chuỗi biên min/max.
---

# Skill: boundary-negative-dataset

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT · **chuỗi biên §6**).

## Mục đích
Sinh dataset biên & âm tính **có chủ đích** — mỗi record kiểm đúng một edge case khác nhau,
không trùng lặp.

## Đầu vào
- `OUTPUT/<task-slug>/09_data_class_map.md` — Field Map + mốc biên cần phủ.
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — rule để xác định đâu là "vi phạm".

## KHÔNG được (riêng skill này)
- Để trống cột `Test Purpose` — mọi record boundary/negative bắt buộc nêu rõ nó test gì.
- Bỏ sót biên ngoài `min-1` và `max+1`.
- Sinh nhiều record kiểm cùng một edge case (trùng lặp vô ích).
- Bịa khoảng giá trị cho field chưa rõ rule → `[GIẢ ĐỊNH]` + `ASK`.

## Nguyên tắc "Record có Mục đích"
- Mỗi record boundary/negative **bắt buộc** có cột `Test Purpose`.
- Field có **min/max** → phủ đủ `min-1` · `min` · `min+1` · `max-1` · `max` · `max+1`.
- Field có **format/độ dài** → rỗng · 1 ký tự · đúng độ dài · quá độ dài · sai định dạng ·
  ký tự đặc biệt.
- Có **≥1 NULL cho field bắt buộc** và **≥1 NULL cho field giá trị** — để phân biệt hành vi
  "thiếu định danh" vs "thiếu giá trị".

## Các bước
1. Với mỗi field trong Field Map, liệt kê các mốc/edge case cần phủ theo nguyên tắc trên.
2. Sinh **một record cho một edge case**, các field còn lại giữ giá trị Valid để cô lập biến số.
3. Gán `Loại data` (Boundary / Invalid / Null / Special) và viết `Test Purpose` cho từng record.
4. Đối chiếu lại: không mốc nào bị bỏ, không edge case nào bị trùng.

## Format output
Ghi ra `OUTPUT/<task-slug>/11_boundary_negative_dataset.md`:

````markdown
# BOUNDARY & NEGATIVE DATASET — [TÊN TÍNH NĂNG]

## 1. Bảng dataset
| # | [field 1] | [field 2] | … | Loại data | Test Purpose | Trace |
|---|---|---|---|---|---|---|
| 1 | [giá trị] | [Valid] | … | Boundary | [vd "field X = min"] | `BR-xx` |
| 2 | [giá trị] | [Valid] | … | Invalid | [vd "field X dưới min 1 đơn vị"] | `BR-xx` |
| 3 | NULL | [Valid] | … | Null | [vd "field bắt buộc = NULL"] | `BR-xx` |

## 2. Đối chiếu độ phủ biên
| Field | min-1 | min | min+1 | max-1 | max | max+1 | Rỗng | Sai format | Ký tự đặc biệt |
|---|---|---|---|---|---|---|---|---|---|
| [field] | #3 | #1 | #4 | #5 | #2 | #6 | #10 | #11 | #12 |

*(Ô nào không áp dụng → ghi "N/A" kèm lý do. Ô nào chưa phủ → ghi `CHƯA PHỦ`, không để trống.)*

## 3. Export — [csv | sql | json]
```[csv|sql|json]
[nội dung export, đúng cú pháp]
```
````

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Phủ đủ biên trong/ngoài + null + invalid + special theo bản chất field (FACT — C).
- [ ] Mỗi record có `Test Purpose` rõ để biết pass/fail (FACT — T).
- [ ] Bảng đối chiếu độ phủ biên không có ô nào để trống (phải ghi mã record, N/A hoặc CHƯA PHỦ).
- [ ] File xuất ra tại `OUTPUT/<task-slug>/11_boundary_negative_dataset.md`.

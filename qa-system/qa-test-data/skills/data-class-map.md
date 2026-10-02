---
name: data-class-map
description: >
  Chuẩn hoá cách phân loại dữ liệu test cho từng field (Valid, Boundary, Invalid, Null, Special)
  và lập bản đồ mốc biên cần phủ trước khi sinh dataset chi tiết.
---

# Skill: data-class-map

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT · chuỗi biên §6).

## Mục đích
Chuẩn hoá cách phân loại dữ liệu test cho **từng field** trước khi sinh dataset. Đây là bước
chặn "Garbage data → Garbage testing".

## Đầu vào
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — Business Rules + field list.

## KHÔNG được (riêng skill này)
- Sinh dataset thật ở bước này — chỉ lập **bản đồ** Data Class.
- Tự bịa khoảng giá trị cho field không rõ rule → gắn `[GIẢ ĐỊNH]`.

## Registry 5 Data Class (CỐ ĐỊNH)
| Data Class | Mô tả |
|---|---|
| **Valid** | Hợp lệ, trong khoảng bình thường |
| **Boundary** | Giá trị biên tại min/max |
| **Invalid** | Vi phạm rule, sai kiểu |
| **Null/Empty** | Không có giá trị |
| **Special** | Ký tự đặc biệt, format lạ |

## Các bước
1. **Trích field list** — lấy danh sách field + business rule tương ứng từ output 01.
2. **Xác định kiểu & rule** cho mỗi field (String / Number / Integer / Enum / Date / Boolean +
   rule định dạng, khoảng giá trị, quan hệ với field khác).
3. **Map Data Class** cần test cho từng field. Mọi field áp dụng được đều phải có map — không bỏ
   sót field. Field không rõ rule → `[GIẢ ĐỊNH]` + ghi câu hỏi cho BA.
4. **Đối chiếu chuỗi biên** — field có min/max hoặc rule độ dài phải ghi rõ các mốc cần phủ theo
   `qa-system/core/QA_STANDARD.md` §6.

## Format output
Ghi ra `OUTPUT/<task-slug>/09_data_class_map.md`:

```markdown
# DATA CLASS MAP — [TÊN TÍNH NĂNG]

## 1. Field Map
| Field | Kiểu | Business Rule (trace) | Data Class cần test | Mốc biên cần phủ |
|---|---|---|---|---|
| [tên field] | [String/Number/Enum/Date/…] | [nội dung rule · `BR-xx`] | [Valid, Boundary, Invalid, Null, Special — chọn theo bản chất field] | [min-1/min/min+1/max-1/max/max+1 hoặc "không áp dụng"] |

## 2. Field thiếu rule — cần clarify
| Field | Thiếu gì | Giả định tạm | Câu hỏi cho BA/PO |
|---|---|---|---|
| [tên field] | [rule/khoảng giá trị chưa rõ] | `[GIẢ ĐỊNH]` [nội dung] | [câu hỏi] |
```

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Kiểu dữ liệu & rule bám đúng Requirement gốc, không suy diễn (FACT — F).
- [ ] Phủ đủ 5 Data Class áp dụng được cho từng field (Valid, Boundary, Invalid, Null, Special) (FACT — C).
- [ ] Các field có min/max xác định rõ mốc chuỗi biên cần phủ theo `qa-system/core/QA_STANDARD.md` §6.
- [ ] File xuất ra tại `OUTPUT/<task-slug>/09_data_class_map.md`.

---
name: boundary-negative-dataset
description: >
  Sinh dataset biên và âm tính có chủ đích: mỗi record kiểm đúng một điểm của chuỗi biên
  QA_STANDARD §6 hoặc một lớp Invalid/Null/Special, gắn với test case cụ thể.
---

# Skill: boundary-negative-dataset

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict §1 · guard §2 · nhãn §2.1 · FACT §3 · **chuỗi biên §6** · nguồn §10).

## Mục đích
Mỗi record kiểm đúng một edge case, các field còn lại giữ Valid để cô lập biến số.

## Đầu vào
- `OUTPUT/<task-slug>/09_data_class_map.md` — Field Map, mốc biên.
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — `FD`, `BR` để xác định "vi phạm".
- `OUTPUT/<task-slug>/05_test_case_spec.md` — TC kiểm biên/âm tính cần record.
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` (§9).

## KHÔNG được (riêng skill này)
- Dựng chuỗi biên cho field không có min/max/độ dài trong nguồn — ô đó ghi `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]`.
- Sinh nhiều record cho cùng một edge case, hoặc thêm record để đủ số lượng.
- Để trống `Test Purpose` hay `TC_ID`.

## Các bước
1. Với mỗi field ở 09: field có khoảng ⇒ 7 điểm §6; field có định dạng/độ dài ⇒ chuỗi định dạng §6;
   Null/Empty chỉ khi `Bắt buộc` có nguồn.
2. Một record cho một edge case; field khác lấy giá trị Valid từ `10_dataset.md` hoặc từ nguồn.
3. Gắn `Loại data`, `Test Purpose`, mã `FD`, và `TC_ID` dùng record. Không TC nào dùng ⇒ ghi `Record mồ côi` + lý do.
4. Xuất CSV/SQL/JSON (quy ước NULL và ngày theo `dataset-generation`).

## Format output
Ghi ra `OUTPUT/<task-slug>/11_boundary_negative_dataset.md`:

````markdown
# Boundary & Negative Dataset · <task-slug>
Owner: qa-system/qa-test-data/skills/boundary-negative-dataset.md · Nguồn: 09_data_class_map.md, 01_requirement_risk_summary.md, 05_test_case_spec.md · Verdict: PASS

## 1. DATASET
| # | TC_ID | <field 1> | <field 2> | Loại data | Test Purpose | FD |
|---|---|---|---|---|---|---|
| B-01 | <MODULE>-005 | <max+1 tính từ nguồn> | <Valid> | Boundary | <field 1 = max+1> | FD-01 |

## 2. ĐỐI CHIẾU CHUỖI BIÊN
| FD | min-1 | min | min+1 | Giữa | max-1 | max | max+1 |
|---|---|---|---|---|---|---|---|
| FD-01 | B-03 | B-01 | … | … | … | … | B-07 |

Ô không áp dụng ⇒ `Không áp dụng`; chưa có ⇒ `CHƯA CÓ DATA`; thiếu ngưỡng ⇒ `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]`.

## 3. EXPORT — <csv | sql | json>
```<csv|sql|json>
<nội dung đúng cú pháp>
```
````

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Đủ điểm §6 cho mọi field có ngưỡng trong nguồn; không điểm nào cho field không có ngưỡng.
- [ ] Mỗi record có `TC_ID`, `Test Purpose`, `FD`; không record trùng edge case.
- [ ] Bảng đối chiếu không có ô trống.

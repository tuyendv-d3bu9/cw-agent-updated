---
name: dataset-generation
description: >
  Sinh dataset Valid cho các test case cần dữ liệu, giá trị nằm trong ràng buộc có nguồn,
  tái lập được bằng seed, xuất CSV / SQL INSERT / JSON.
---

# Skill: dataset-generation

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict §1 · guard §2 · nhãn §2.1 · FACT §3 · nguồn §10 · ngày §11).

## Mục đích
Sinh record **Valid** cho từng test case cần data, xuất định dạng dùng được ngay. Cùng schema + cùng seed ⇒ cùng dataset.

## Tham số
- `format` ∈ `csv` · `sql` · `json`.
- `seed` — số nguyên, **bắt buộc** khi dùng engine. Ghi lại trong output.

## Đầu vào
- `OUTPUT/<task-slug>/09_data_class_map.md` — Field Map và ràng buộc có nguồn.
- `OUTPUT/<task-slug>/05_test_case_spec.md` — TC cần data (`Test Data`).
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — `FD`, `BR`.
- `knowledge/_project.md` (§2 định dạng ngày/tiền, NULL vs rỗng, được dùng dữ liệu giống production không) ·
  `knowledge/features/<feature-slug>.md` (§9 hằng số).

## KHÔNG được (riêng skill này)
- Đặt khoảng giá trị, định dạng mã, đơn vị, mức "phổ biến của ngành" không có trong `FD`/knowledge §9.
  Field có ràng buộc thiếu nguồn ⇒ ô giá trị `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]`, không sinh.
- Sinh record biên/âm tính — việc của `boundary-negative-dataset`.
- Đổi tên field so với Field Map.
- Chạy engine không có `--seed`.
- Mix định dạng ngày trong một dataset.

Field **không có ràng buộc nghiệp vụ** (vd họ tên tự do) được dùng generator để có giá trị trông thật — giá trị
đó không khẳng định rule nào.

## Engine (>10 record)
Không tự gõ từng record. Viết schema rồi chạy:
```bash
npm run data:gen -- --slug <task-slug> --schema OUTPUT/<task-slug>/dataset_schema.json --count <n> --seed <số> --output OUTPUT/<task-slug>/10_dataset.md
```
Khuôn schema và danh sách generator: `qa-system/templates/dataset-schema.example.json`. Khoá bắt đầu bằng `_`
là chú thích. Ràng buộc trong schema (min/max, enum, định dạng) phải chép từ Field Map; ngày dùng `YYYY-MM-DD`
(hoặc định dạng `_project.md` §2).

## Chọn format
| Format | Dùng khi | Lưu ý |
|---|---|---|
| CSV | Import Excel/TestRail, data provider | Header đúng tên field; giá trị có dấu phẩy/ngoặc ⇒ bọc quotes |
| SQL INSERT | Seed test DB | Escape ký tự đặc biệt; mỗi record một statement |
| JSON | API test | Key khớp tên field |

NULL: CSV ô trống · SQL `NULL` · JSON `null` (trừ khi `_project.md` khai khác).

## Các bước
1. Lấy danh sách TC cần data từ 05; mỗi TC một hoặc nhiều record.
2. Với mỗi field, lấy ràng buộc từ Field Map. Thiếu ⇒ nhãn, không sinh.
3. ≤ 10 record: viết tay theo ràng buộc. > 10: schema + engine với `--seed`.
4. Tự soi: giá trị nằm trong ràng buộc có nguồn; ngày nhất quán với trạng thái; không trùng lặp vô ích.

## Format output
Ghi ra `OUTPUT/<task-slug>/10_dataset.md`:

````markdown
# Dataset · <task-slug>
Owner: qa-system/qa-test-data/skills/dataset-generation.md · Nguồn: 09_data_class_map.md, 05_test_case_spec.md · Verdict: PASS
Seed: <số> · Schema: OUTPUT/<task-slug>/dataset_schema.json

## 1. DATASET (VALID)
| # | TC_ID | <field 1> | <field 2> | Ghi chú |
|---|---|---|---|---|
| D-01 | <MODULE>-001 | <giá trị trong ràng buộc FD-xx> | <…> | <…> |

## 2. FIELD CHƯA SINH ĐƯỢC
| Field | FD | Thiếu gì | MR |
|---|---|---|---|

## 3. EXPORT — <csv | sql | json>
```<csv|sql|json>
<nội dung đúng cú pháp>
```
````

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Mỗi record gắn `TC_ID`; mọi TC cần data có record hoặc lý do ở §2.
- [ ] Mọi giá trị có ràng buộc nằm trong ràng buộc có nguồn; seed được ghi lại.
- [ ] Không lỗi cú pháp export; ngày một định dạng.

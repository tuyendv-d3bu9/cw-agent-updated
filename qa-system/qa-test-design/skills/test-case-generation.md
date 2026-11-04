---
name: test-case-generation
description: >
  Mở rộng Test Idea "Giữ" thành Test Case 8 trường chuẩn Jira Xray/TestRail. Giá trị và kết quả
  mong đợi chỉ lấy từ nguồn, thiếu thì gắn nhãn. Quy mô lớn chạy Blueprint → batch → merge.
---

# Skill: test-case-generation

> Tuân thủ `qa-system/core/QA_STANDARD.md` (cổng ASK §1 · guard §2 · nhãn §2.1 · FACT §3 · chuỗi biên §6 ·
> knowledge §8 · ID §9 · nguồn §10 · Priority/Automated §11).

## Mục đích
Chi tiết hoá mỗi Test Idea `Giữ` thành một hoặc nhiều Test Case 8 trường, trace được về `TI`, rule và viewpoint.

## Đầu vào
- `OUTPUT/<task-slug>/04_test_idea_report.md` — chỉ các dòng `Giữ`.
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — `BR`, `FD` (ràng buộc, `Thông báo khi sai`), `AF`, `RK`.
- `OUTPUT/<task-slug>/02_missing_rule_report.md` — `MR` và trạng thái.
- `OUTPUT/<task-slug>/03_viewpoint_report.md` — `VP`, `RK`.
- `knowledge/_project.md` (§1 mã `MODULE`, §2 định dạng ngày/tiền) · `knowledge/features/<feature-slug>.md` (§8 quyết định, §9 hằng số).

> Trước khi ghi: `npm run gate <task-slug>` phải exit `0` (QA_STANDARD §1).
> `_project.md` §1 chưa khai mã `MODULE` ⇒ hỏi người dùng, không tự đặt.

## KHÔNG được (riêng skill này)
- Sinh test case cho idea `Bỏ` / `Chờ MR`, hoặc ngoài 04.
- Tự chế giá trị Test Data, chữ thông báo, mã HTTP, trạng thái DB, ngưỡng.
- Dùng placeholder mơ hồ ("chuỗi bất kỳ", "abc", "TBD", "[email]"). Thiếu giá trị ⇒ nhãn §2.1, không phải placeholder.
- Gộp nhiều thao tác vào một step; quá 8 step.
- Lấy `Phương án gợi ý` của 02 làm Expected.

## Luật giá trị
| Ô | Lấy từ | Không có trong nguồn |
|---|---|---|
| Test Data | `FD` (ràng buộc), knowledge §9, ví dụ trong `INPUT/`; điểm biên **tính** từ min/max có nguồn (§6) | `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` (hoặc không mã nếu chưa có MR) |
| Chữ thông báo trong Expected | `FD` cột `Thông báo khi sai`, `AF` cột `Hệ thống phản hồi`, knowledge §8 — **nguyên văn** | `Hiển thị thông báo lỗi [CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` |
| Mã HTTP / trạng thái DB | Chỉ khi `FD`/`AF` có nguồn `03_dev/` nói rõ | Không viết |
| Priority | Ánh xạ cố định QA_STANDARD §11 từ Risk Level cao nhất của các `RK` có `Nguồn` chứa mã rule của TC | `Medium [ĐỀ XUẤT]` |
| Automated/Manual | QA_STANDARD §11 | `Manual` |
| Ngày | `YYYY-MM-DD` hoặc định dạng `_project.md` §2 | — |

## 8 trường
| Trường | Quy tắc |
|---|---|
| `TC_ID` | `<MODULE>-NNN` (§9.1). Số kế tiếp từ `npm run ids -- <task-slug>`; TC đã có giữ mã |
| `Title` | Bắt đầu `Verify` / `Validate` / `Confirm` + hành động + điều kiện |
| `Precondition` | Trạng thái, dữ liệu nền, quyền — chỉ điều có trong nguồn |
| `Test Steps` | Đánh số, mỗi step một thao tác, tối đa 8 |
| `Test Data` | Theo luật giá trị |
| `Expected Result` | Theo luật giá trị; tiêu chí Pass/Fail phân định được hoặc nhãn chỉ rõ phần còn thiếu |
| `Priority` | `High` / `Medium` / `Low`, có thể kèm ` [ĐỀ XUẤT]` |
| `Tags` | `Rule#` + mã `BR`/`FD`/`AF`/`MR` (một hoặc nhiều, vd `Rule#BR-01`) · `Viewpoint#VP-xx` (mọi VP ở cột VP của TI, mỗi VP một tag) · `TI#TI-xx` · `Module#<MODULE>` · `Manual` hoặc `[ĐỀ XUẤT] Automated` |

`Rule#MR-xx` chỉ dùng khi MR đó `Confirmed`/`Rejected` ở knowledge §7. Một idea `BVA` ⇒ một TC cho mỗi điểm
của chuỗi biên có trong nguồn.

## Các bước
1. Chạy `npm run gate <task-slug>`; exit `1` ⇒ dừng, dán kết quả.
2. Đếm số TC dự kiến. **≤ 50** ⇒ viết thẳng `05_test_case_spec.md`. **> 50** ⇒ ba giai đoạn:
   - **Blueprint** — `OUTPUT/<task-slug>/05_test_blueprint.json`, mỗi TC một dòng ngắn:
     ```json
     [{ "tc_id": "<MODULE>-001", "ti_id": "TI-01", "rule_id": "BR-01", "viewpoint_id": "VP-01", "purpose": "<một câu>", "priority": "High", "batch": 1 }]
     ```
   - **Batch** — mỗi lô khoảng 50 TC, ghi `OUTPUT/<task-slug>/testcases/batch_01.md`, `batch_02.md`… (2 chữ số).
   - **Merge** — `npm run testcases:merge <task-slug>` gộp thành `05_test_case_spec.md`.
3. Viết từng TC theo luật giá trị.
4. Chạy `npm run lint -- <task-slug>`; exit `1` ⇒ sửa rồi chạy lại. Dán kết quả thật.

## Format output
`OUTPUT/<task-slug>/05_test_case_spec.md` (và mỗi `testcases/batch_NN.md`, cùng dòng 1–2):

````markdown
# Test Case Spec · <task-slug>
Owner: qa-system/qa-test-design/skills/test-case-generation.md · Nguồn: 04_test_idea_report.md, 01_requirement_risk_summary.md, 03_viewpoint_report.md, knowledge/features/<feature-slug>.md · Verdict: PASS

### TC_ID: <MODULE>-001
- **Title**: Verify <hành động> khi <điều kiện>
- **Precondition**:
  - <điều kiện có nguồn>
- **Test Steps**:
  1. <thao tác 1>
  2. <thao tác 2>
- **Test Data**:
  - <field FD-xx>: <giá trị từ nguồn, hoặc [CHƯA CÓ TRONG TÀI LIỆU – MR-xx]>
- **Expected Result**:
  - <kết quả; chữ thông báo nguyên văn hoặc [CHƯA CÓ TRONG TÀI LIỆU – MR-xx]>
- **Priority**: High
- **Tags**: Rule#BR-01, Viewpoint#VP-01, TI#TI-01, Module#<MODULE>, Manual
````

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] `npm run gate <slug>` exit `0` trước khi ghi; `npm run lint -- <slug>` exit `0`, kết quả thật được dán.
- [ ] Mọi TI `Giữ` có ít nhất một TC; không TC nào từ TI khác `Giữ`.
- [ ] Mọi giá trị, chữ thông báo, mã phản hồi trích được về nguồn; chỗ thiếu mang nhãn §2.1.
- [ ] Priority đúng ánh xạ §11; Tags đủ `Rule#`, `Viewpoint#`, `TI#`, `Module#`, Manual/Automated.

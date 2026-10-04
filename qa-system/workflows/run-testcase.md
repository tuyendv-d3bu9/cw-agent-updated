---
name: run-testcase
title: "Chạy trọn bộ test design và dữ liệu"
description: "Chạy Chặng 1 đến 6 kèm bộ dữ liệu 09 đến 12, ra test suite sẵn sàng thực thi."
format: legacy
triggers:
  - "chạy trọn bộ test case"
  - "làm đầy đủ test case kèm dữ liệu"
  - "chạy toàn bộ quy trình kiểm thử"
---

# RUNBOOK — Chạy trọn bộ (`01 → 06` + `09 → 12`)

> File này để **CHẠY**. Dán nguyên khối lệnh ở §2, hoặc trỏ chính file này:
> *"Đọc `workflows/run-testcase.md` và thực hiện."*
> Bản đồ toàn hệ thống: `workflows/WORKFLOW.md`.
>
> Khác `run-to-testcase.md`: file kia dừng ở `05`. File này chạy hết **cả nhánh dữ liệu**
> `09 → 12` và **chốt chặn `06`** — dùng khi cần bộ test suite sẵn sàng execute.

**Tham số**

| Tham số | Giá trị mẫu |
|---|---|
| `task-slug` | `<task-slug>` (ví dụ: `voucher-checkout`, `order-flow`) |
| `input` | `INPUT/<task-slug>.md` (hoặc thư mục 5 ngăn `INPUT/<task-slug>/`) |
| `feature knowledge` | `knowledge/features/<task-slug>.md` |
| `data format` | `sql` (đổi thành `csv` / `json` nếu cần) |

Đổi feature khác → thay 4 dòng trên, phần còn lại giữ nguyên.

---

## 1. Chuẩn bị — kiểm trước khi chạy

- [ ] `INPUT/` có tài liệu nguồn
- [ ] `knowledge/_project.md` đã điền (trống thì agent sẽ gắn nhiều `[GIẢ ĐỊNH]` hơn — chấp nhận được)
- [ ] Thư mục `OUTPUT/<task-slug>/` chưa tồn tại, hoặc đã backup

---

## 2. Khối lệnh chạy

```
Đọc trước:
  qa-system/core/QA_STANDARD.md
  knowledge/_project.md
  knowledge/features/<task-slug>.md
  workflows/WORKFLOW.md

task-slug = <task-slug>

Chạy tuần tự. Sau MỖI bước: ghi file output, cập nhật OUTPUT/<task-slug>/_index.md,
in verdict ra màn hình rồi mới sang bước kế.
Nếu verdict là FIX hoặc ASK → DỪNG toàn bộ, báo tôi, không chạy tiếp.

--- NHÁNH A: pipeline chính ---

B1  qa-system/qa-analyst/AGENT.md + skills/requirement-risk-summary.md
    Vào : INPUT/Function D.md, INPUT/OVERVIEW.md
    Ra  : OUTPUT/<task-slug>/01_requirement_risk_summary.md
    Ghi thêm: cập nhật knowledge/features/<task-slug>.md

B2  qa-system/qa-analyst/skills/missing-rule-06w.md
    Vào : OUTPUT/<task-slug>/01_requirement_risk_summary.md, knowledge/features/<task-slug>.md
    Ra  : OUTPUT/<task-slug>/02_missing_rule_report.md
    Ghi thêm: cập nhật knowledge/features/<task-slug>.md mục 7
    Lưu ý: gap nào trong knowledge đã Confirmed/Rejected thì KHÔNG báo lại là missing rule mới.

B3  qa-system/qa-analyst/skills/viewpoint-selection.md
    Vào : output 01 + 02
    Ra  : OUTPUT/<task-slug>/03_viewpoint_report.md

B4  qa-system/qa-analyst/skills/test-idea-design.md
    Vào : output 01 + 03
    Ra  : OUTPUT/<task-slug>/04_test_idea_report.md

B5  qa-system/qa-test-design/AGENT.md + skills/test-case-generation.md
    Vào : output 01 + 03 + 04
    Ra  : OUTPUT/<task-slug>/05_test_case_spec.md

--- NHÁNH B: dữ liệu (chạy sau B5) ---

B9  qa-system/qa-test-data/AGENT.md + skills/data-class-map.md
    Vào : output 01
    Ra  : OUTPUT/<task-slug>/09_data_class_map.md

B10 qa-system/qa-test-data/skills/dataset-generation.md
    Vào : output 09, format = sql
    Ra  : OUTPUT/<task-slug>/10_dataset.md

B11 qa-system/qa-test-data/skills/boundary-negative-dataset.md
    Vào : output 09
    Ra  : OUTPUT/<task-slug>/11_boundary_negative_dataset.md

B12 qa-system/qa-test-data/skills/data-validation-traceability.md
    Vào : output 10 + 11 + 05
    Ra  : OUTPUT/<task-slug>/12_data_validation_traceability.md

--- CHỐT CHẶN: chạy CUỐI CÙNG ---

B6  qa-system/qa-test-design/skills/coverage-review.md
    Vào : output 01 + 03 + 05
    Ra  : OUTPUT/<task-slug>/06_coverage_review.md
    Lưu ý: rà đủ 3 góc nhìn mà KHÔNG thấy gap nào thì verdict là ASK, KHÔNG phải PASS.
```

**Vì sao `06` chạy sau `12`**: skill `12` phát hiện test case nào `CHƯA CÓ DATA` và record nào
mồ côi. Đó là đầu vào thật cho gap analysis của `06`. Chạy `06` trước `12` thì mất mảng gap dữ liệu.

---

## 3. Kiểm sau mỗi bước — 30 giây, không bỏ

| Bước | Nhìn đúng 2 thứ này |
|---|---|
| B1 | Có `Risk Matrix` không? Có tối thiểu 5 Open Question không? |
| B2 | Ma trận 06W đủ W1→W6 không? W nào không ra vấn đề có ghi `"Không phát hiện vấn đề qua câu hỏi #Wx"` không? |
| B3 | Các viewpoint có chồng lấn nhau không (zero-overlap)? |
| B4 | Cột `Lý do filter` có trích đúng nguyên văn checklist Giữ/Bỏ không? |
| B5 | Chọn ngẫu nhiên 1 test case: `Test Data` có giá trị thật hay còn placeholder? |
| B9 | Mọi field áp dụng được đều có Data Class map chưa? Field thiếu rule có gắn `[GIẢ ĐỊNH]`? |
| B10 | Export có chạy được ngay không cần sửa tay? Date có thống nhất `YYYY-MM-DD`? |
| B11 | Bảng đối chiếu biên có ô nào `CHƯA PHỦ`? Cột `Test Purpose` có ô trống? |
| B12 | Có test case nào `CHƯA CÓ DATA`? Có record mồ côi? |
| B6 | Cột `Test Case IDs cover` có ô trống (phải là `CHƯA COVER`)? Verdict có đúng luật ngoại lệ? |

---

## 4. Nghiệm thu — truy vết ngược 5 chặng

Mở `OUTPUT/<task-slug>/05_test_case_spec.md`, chọn **một** test case cần data, đi ngược đủ 5 chặng:

```
Test Case  →  12_data_validation_traceability.md  (record nào cấp data cho nó)
           →  Tags: Rule#BR-xx, Viewpoint#yy
           →  04_test_idea_report.md   (idea nào sinh ra nó, vì sao "Giữ")
           →  03_viewpoint_report.md   (viewpoint đó thuộc risk area nào)
           →  knowledge/features/<task-slug>.md  (BR-xx nội dung gì, ai xác nhận, ngày nào)
           →  INPUT/<task-slug>.md      (câu chữ gốc)
```

Đứt ở chặng nào → đó là lỗi traceability, chưa phải test suite dùng được.

---

## 5. Lỗi hay gặp

| Hiện tượng | Nguyên nhân | Xử lý |
|---|---|---|
| `06` báo `PASS` khi không thấy gap | Agent bỏ qua luật ngoại lệ | `qa-system/core/QA_STANDARD.md` §1 — bắt agent đọc lại, verdict đúng phải là `ASK` |
| Nhánh B toàn `[GIẢ ĐỊNH]` | `knowledge/_project.md` còn trống | Điền §1, §2 của `_project.md` rồi chạy lại `09 → 12` |
| `12` báo hàng loạt `CHƯA CÓ DATA` | `11` chưa phủ hết biên, hoặc `05` sinh test case ngoài phạm vi data | Đọc bảng đối chiếu biên ở `11`, bổ sung record trước khi chạy lại `12` |
| Chạy `06` trước `12` | Sai thứ tự khối lệnh §2 | Chạy lại `06` sau khi có `12` |
| Agent dồn nhiều bước vào 1 file | Mất ràng buộc "một skill một file" | `qa-system/core/QA_STANDARD.md` §7 |

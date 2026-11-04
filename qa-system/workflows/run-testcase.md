---
name: run-testcase
title: "Chạy trọn bộ test design và dữ liệu"
description: "Chạy Chặng 1 đến 5, nhánh dữ liệu 09 đến 12, rồi Chặng 6 có gom gap dữ liệu của 12."
format: v1

triggers:
  - "chạy trọn bộ test case"
  - "làm đầy đủ test case kèm dữ liệu"
  - "chạy toàn bộ quy trình kiểm thử"

steps:
  - agent: qa-analyst
    skill: requirement-risk-summary
    output: 01_requirement_risk_summary.md

  - agent: qa-analyst
    skill: missing-rule-06w
    output: 02_missing_rule_report.md

  - agent: qa-analyst
    skill: viewpoint-selection
    gate: ask
    output: 03_viewpoint_report.md

  - agent: qa-analyst
    skill: test-idea-design
    output: 04_test_idea_report.md

  - agent: qa-test-design
    skill: test-case-generation
    output: 05_test_case_spec.md

  - agent: qa-test-data
    skill: data-class-map
    output: 09_data_class_map.md

  - agent: qa-test-data
    skill: dataset-generation
    output: 10_dataset.md

  - agent: qa-test-data
    skill: boundary-negative-dataset
    output: 11_boundary_negative_dataset.md

  - agent: qa-test-data
    skill: data-validation-traceability
    output: 12_data_validation_traceability.md

  - agent: qa-test-design
    skill: coverage-review
    gate: lint
    output: 06_coverage_review.md
    note: "Đọc thêm 12 để gom gap CHƯA CÓ DATA và record mồ côi."
---

# Chạy trọn bộ (`01 → 05` + `09 → 12` + `06`)

## Khi nào dùng
Cần bộ test suite kèm dữ liệu, sẵn sàng thực thi (Mode 2).

## Điểm dừng
- Trước bước 3: cổng `ask` (`npm run gate <slug>`). Luật cổng: `qa-system/core/QA_STANDARD.md` §1.
- Trước bước 10 (`06`): cổng `lint`.
- `06` chạy **sau** `12` vì `12` phát hiện test case `CHƯA CÓ DATA` và record mồ côi — đầu vào cho gap của `06`.
  Đã có `06` từ trước thì chạy lại.

## Nghiệm thu — truy vết ngược một test case cần data
`12` (record nào cấp data) → `Tags` → `04` → `03` → `01` / `knowledge/features/<slug>.md` → `INPUT/<slug>/`.

## Lỗi hay gặp
| Hiện tượng | Xử lý |
|---|---|
| Nhánh B đầy `[CONTEXT_MISSING]` | `knowledge/_project.md` còn `<điền>` — đó là thiếu thật, không tự lấp; hỏi người dùng |
| `12` báo nhiều `CHƯA CÓ DATA` | Xem bảng đối chiếu biên ở `11` trước khi chạy lại `12` |
| Agent dồn nhiều bước vào 1 file | Một skill một file — QA_STANDARD §7 |

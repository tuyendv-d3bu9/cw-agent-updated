---
name: data-validation-traceability
description: >
  Validate tính toàn vẹn và logic của dataset trước khi seed/dùng,
  đồng thời lập Traceability Matrix nối từng record dữ liệu với Test Case tương ứng.
---

# Skill: data-validation-traceability

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict §1 · guard §2 · nhãn §2.1 · FACT §3 · chuỗi biên §6 · nguồn §10).

## Mục đích
Hai việc chốt chặn cuối của `qa-system/qa-test-data`:
1. **Validate** dataset TRƯỚC khi seed/dùng — bắt lỗi logic/nghiệp vụ/format.
2. **Traceability Matrix** — nối mỗi record dữ liệu với test case dùng nó.

## Đầu vào
- `OUTPUT/<task-slug>/10_dataset.md` + `11_boundary_negative_dataset.md` — dataset cần validate.
- `OUTPUT/<task-slug>/05_test_case_spec.md` — test suite để trace.
- `OUTPUT/<task-slug>/09_data_class_map.md` — ràng buộc có nguồn của từng field.
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — `FD`, `BR` để đối chiếu.
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` (§8, §9).

## KHÔNG được (riêng skill này)
- Tự "sửa ngầm" dataset nguồn — chỉ **đề xuất** bản sửa.
- Tự quyết khi rule chưa rõ (vd "hệ thống có cho số thập phân không?") → `ASK`.
- Để trống ô: test case chưa có data → `CHƯA CÓ DATA`.
- Tạo record "mồ côi" (không phục vụ test case nào) trừ khi ghi rõ lý do.
- Trace test case tới data không tồn tại trong dataset.

## Phần A — Validation

### FACT áp cho dataset
| | Tiêu chí | Dạng lỗi điển hình |
|---|---|---|
| **F** | Giá trị trích được về ràng buộc có nguồn | Giá trị nằm ngoài khoảng `FD`, hoặc khoảng không có nguồn |
| **A** | Đúng định dạng/khoảng | Định danh sai format quy ước → INSERT fail do constraint |
| **C** | Không thiếu trường bắt buộc | Thiếu cột NOT NULL → SQL fail |
| **T** | Đủ rõ để biết pass/fail | Giá trị thập phân nhưng chưa rõ hệ thống có nhận |

### 5 loại lỗi phổ biến trong AI-generated data
1. **Logic inconsistency** — hai field đúng riêng lẻ nhưng kết hợp lại vô nghĩa.
2. **Business rule violation** — giá trị vượt khoảng rule cho phép của kiểu đó.
3. **Date/time logic error** — mốc thời gian ở quá khứ nhưng trạng thái vẫn "đang hiệu lực".
4. **Format inconsistency** — mix nhiều định dạng ngày/số trong cùng dataset.
5. **Null sai chỗ** — NULL ở field bắt buộc mà không phải record chủ ý test NULL.

### Cách chạy
Với mỗi issue ghi đủ: `Record #` (hoặc mã) · field lỗi · mô tả cụ thể · phân loại lỗi ·
gợi ý sửa. Sai format/logic → `FIX`. Thiếu rule để phán → `ASK`.

## Phần B — Traceability Matrix

Workflow tổng của agent:
`Requirement → Data Class Map → Realistic Dataset → Export → Boundary/Negative Dataset → Validation → Traceability Matrix → Test Execution`

Nguyên tắc:
- Mỗi test case cần data phải trace về **một record cụ thể** (mã hoặc `#`).
- Record boundary/invalid phải nối đúng test case kiểm biên/âm tính tương ứng.
- Test case chưa có data → `CHƯA CÓ DATA`.

## Format output
Ghi ra `OUTPUT/<task-slug>/12_data_validation_traceability.md`:

```markdown
# Data Validation & Traceability · <task-slug>
Owner: qa-system/qa-test-data/skills/data-validation-traceability.md · Nguồn: 10_dataset.md, 11_boundary_negative_dataset.md, 05_test_case_spec.md · Verdict: FIX

## 1. Kết quả Validation
- **Tổng quan**: [số issue theo từng loại lỗi]

| # | Record | Field lỗi | Mô tả lỗi | Loại lỗi | Gợi ý sửa | Verdict |
|---|---|---|---|---|---|---|
| 1 | [mã/#] | [field] | [mô tả cụ thể] | [1 trong 5 loại] | [bản sửa đề xuất] | FIX |
| 2 | [mã/#] | [field] | [rule chưa rõ] | — | — | ASK |

## 2. FACT Check dataset
| | Tiêu chí | Kết quả | Ghi chú |
|---|---|---|---|
| F | Giá trị đúng thực tế/rule | PASS/FAIL | … |
| A | Đúng định dạng/khoảng | PASS/FAIL | … |
| C | Không thiếu trường bắt buộc | PASS/FAIL | … |
| T | Đủ rõ để biết pass/fail | PASS/FAIL | … |

## 3. Traceability Matrix
| Test Case ID | Test Case Title | Test Data Record | Data Type | Notes |
|---|---|---|---|---|
| <MODULE>-001 | [title] | D-01 | Valid | [ghi chú] |
| <MODULE>-005 | [title] | B-01 | Boundary | [điểm §6] |
| <MODULE>-0xx | [title] | CHƯA CÓ DATA | — | [cần sinh thêm] |

## 4. Record mồ côi (nếu có)
| Record | Vì sao chưa nối test case nào | Đề xuất |
|---|---|---|
| [mã] | […] | [bổ sung TC / xoá record] |

## FIX
| # | Vị trí | Vấn đề | Bản sửa đề xuất |
|---|---|---|---|

## ASK
| # | Vị trí | Cần gì | Chuyển cho ai |
|---|---|---|---|
```

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] 100% Test Case cần data đều được nối với record cụ thể trong Traceability Matrix (FACT — C).
- [ ] Record map được nêu rõ giá trị để tái hiện đúng ca kiểm (FACT — T).
- [ ] Không có issue mức FIX/ASK bị bỏ qua mà chưa có giải pháp hoặc câu hỏi tương ứng.
- [ ] File xuất ra tại `OUTPUT/<task-slug>/12_data_validation_traceability.md`.

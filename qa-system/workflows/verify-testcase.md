---
name: verify-testcase
title: "Nghiệm thu test suite"
description: "Chỉ rà soát độ phủ Chặng 6 và kiểm tay, không sinh mới."
format: legacy
triggers:
  - "nghiệm thu test case"
  - "kiểm tra bộ test trước khi bàn giao"
  - "rà soát lại bộ test case"
---

# RUNBOOK — Nghiệm thu test suite (không sinh mới)

> File này để **CHẠY**. Trỏ: *"Đọc `workflows/verify-testcase.md` và thực hiện."*
> Bản đồ toàn hệ thống: `workflows/WORKFLOW.md`.
>
> Dùng khi đã có `05_test_case_spec.md` và cần **kiểm định** trước khi bàn giao.
> Runbook này **chỉ đọc và đánh giá** — không sinh thêm test case, không sửa deliverable.
> Đầu ra duy nhất được ghi mới: `06_coverage_review.md`.

**Tham số**

| Tham số | Giá trị mẫu |
|---|---|
| `task-slug` | `<task-slug>` |
| `test suite cần nghiệm thu` | `OUTPUT/<task-slug>/05_test_case_spec.md` |

---

## 1. Chuẩn bị — kiểm tiền đề

- [ ] `OUTPUT/<task-slug>/01_requirement_risk_summary.md` tồn tại (nguồn `BR-xx`)
- [ ] `OUTPUT/<task-slug>/03_viewpoint_report.md` tồn tại (ma trận viewpoint)
- [ ] `OUTPUT/<task-slug>/05_test_case_spec.md` tồn tại
- [ ] Nếu đã chạy nhánh B: `12_data_validation_traceability.md` tồn tại

Thiếu `01`, `03` hoặc `05` → **DỪNG**. Không nghiệm thu được nếu không có gốc để đối soát.
Thiếu `12` thì vẫn chạy được, nhưng mảng gap dữ liệu sẽ không được đánh giá — phải ghi rõ
điều đó vào báo cáo.

---

## 2. Khối lệnh chạy

```
Đọc trước:
  qa-system/core/QA_STANDARD.md
  knowledge/_project.md
  knowledge/features/<task-slug>.md
  workflows/WORKFLOW.md

task-slug = <task-slug>

Chạy skill 06 để nghiệm thu:

B6  qa-system/qa-test-design/AGENT.md + skills/coverage-review.md
    Vào : OUTPUT/<task-slug>/01_requirement_risk_summary.md
          OUTPUT/<task-slug>/03_viewpoint_report.md
          OUTPUT/<task-slug>/05_test_case_spec.md
          OUTPUT/<task-slug>/12_data_validation_traceability.md  (nếu có)
    Ra  : OUTPUT/<task-slug>/06_coverage_review.md

BẮT BUỘC:
- Rà đủ CẢ 3 góc nhìn, không được chọn 1.
- Dùng lại đúng mã và thứ tự BR-xx của bước 01. Không đánh số lại, không gộp mã.
- Ô Test Case IDs cover không có test case thì điền CHUA COVER, không để trống.
- Rà đủ 3 góc nhìn mà KHÔNG thấy gap nào thì verdict là ASK, KHÔNG phải PASS.
  PASS chỉ khi có biên bản chấp nhận rủi ro từ người phụ trách.

KHÔNG được làm trong runbook này:
- Không sinh test case mới vào 05_test_case_spec.md (chỉ ĐỀ XUẤT trong mục 3 của báo cáo 06).
- Không sửa 01, 03, 04, 05.
- Không tự chuyển trạng thái trong knowledge.

Sau đó: cập nhật OUTPUT/<task-slug>/_index.md và in verdict.
```

---

## 3. Kiểm bằng tay — 4 mũi, làm sau khi có báo cáo `06`

Đây là phần **con người** kiểm, không giao agent tự đánh giá chính mình.

| # | Mũi kiểm | Cách làm | Đạt khi |
|---|---|---|---|
| 1 | **Traceability ngược** | Chọn ngẫu nhiên 3 test case, đi ngược 5 chặng (§4) | Không đứt chặng nào |
| 2 | **Traceability xuôi** | Chọn ngẫu nhiên 3 `BR-xx` trong `01`, tìm test case cover | Mỗi rule có TC, hoặc được ghi `CHƯA COVER` ở `06` |
| 3 | **Biên** | Chọn 1 field có min/max, đối chiếu `qa-system/core/QA_STANDARD.md` §6 | Có đủ `min-1`, `min`, `min+1`, `max-1`, `max`, `max+1` |
| 4 | **Expected Result đo được** | Chọn 3 test case negative | Mỗi cái nêu thông điệp/trạng thái cụ thể, không dùng từ mơ hồ |

Mũi nào **không đạt** → đó là gap `06` đã bỏ sót. Ghi thêm vào bảng FIX của `06_coverage_review.md`
rồi trả lại bước tương ứng, đừng chấp nhận báo cáo.

---

## 4. Truy vết ngược — 5 chặng

```
Test Case  →  12_data_validation_traceability.md  (record nào cấp data — nếu đã chạy nhánh B)
           →  Tags: Rule#BR-xx, Viewpoint#yy
           →  04_test_idea_report.md   (idea nào sinh ra nó, vì sao "Giữ")
           →  03_viewpoint_report.md   (viewpoint đó thuộc risk area nào)
           →  knowledge/features/<task-slug>.md  (BR-xx nội dung gì, ai xác nhận, ngày nào)
           →  INPUT/<task-slug>.md      (câu chữ gốc)
```

---

## 5. Human-Final — 4 điều agent không tự quyết

Báo cáo `06` có mục dành riêng cho các quyết định dưới đây. Đọc và **ký tên vào** trước khi
bàn giao, đừng để trống:

1. **Business Criticality** — mức quan trọng sống còn của rule với mục tiêu kinh doanh thực tế
2. **Actual Risk Sufficiency** — độ phủ hiện tại đã đủ cho mức rủi ro của release chưa
3. **Cross-system Impact** — tác động tích hợp liên hệ thống ngoài phạm vi tài liệu
4. **Exploratory Insights** — góc thăm dò sâu theo kinh nghiệm thực chiến

Cần thăm dò thêm → chạy `qa-system/qa-automation/skills/exploratory-charter.md`, không nhồi
vào test suite scripted.

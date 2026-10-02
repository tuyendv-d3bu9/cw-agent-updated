# FLOW — Luồng Phân Tích & Thiết Kế QA Tự Động

> **Mục đích**: File định nghĩa kịch bản thực thi luồng làm việc QA tự động.
> **Cách sử dụng**: Khi cần chạy, chỉ cần trỏ: *"Đọc file `workflows/flow.md` và thực thi bước đang kích hoạt."*

---

## 1. Cấu hình & Tham số

| Tham số | Giá trị mặc định | Mô tả |
|---|---|---|
| `task-slug` | `<task-slug>` | Mã định danh của tính năng (tương ứng thư mục trong `OUTPUT/`) |
| `input-files` | `INPUT/<task-slug>.md` | Tài liệu yêu cầu thô đầu vào |
| `knowledge-file` | `knowledge/features/<task-slug>.md` | File tích luỹ tri thức nền của tính năng |
| `project-knowledge`| `knowledge/_project.md` | Tri thức dùng chung toàn dự án |
| `standard` | `qa-system/core/QA_STANDARD.md` | Quy chuẩn kiểm thử & tiêu chí chất lượng (FACT, 06W, Verdict) |

---

## 2. Danh sách các bước trong Pipeline

### 🟢 Bước 1: Phân tích đầu bài (`requirement-risk-summary`) — [ĐANG XÂY DỰNG / KÍCH HOẠT]
* **Agent thực thi**: `qa-system/qa-analyst/AGENT.md`
* **Skill sử dụng**: `qa-system/qa-analyst/skills/requirement-risk-summary.md`
* **Tài liệu nạp trước**:
  * `qa-system/core/QA_STANDARD.md`
  * `knowledge/_project.md`
  * `knowledge/features/<task-slug>.md` (nếu đã có)
* **Đầu vào (Input)**:
  * Toàn bộ tài liệu trong `INPUT/*.md` (hoặc các file được chỉ định trong tham số `input-files`)
* **Đầu ra (Output)**:
  * File báo cáo: `OUTPUT/<task-slug>/01_requirement_risk_summary.md`
  * Cập nhật index: `OUTPUT/<task-slug>/_index.md`
  * Cập nhật tri thức: `knowledge/features/<task-slug>.md` (mục 1, 2, 3, 4, 5, 6, 7, 9, 10)
* **Cấu trúc 10 phần bắt buộc**:
  1. `1. FEATURE OVERVIEW` — Mục đích & giá trị cốt lõi (1–2 câu).
  2. `2. ACTOR & USER ROLE` — Toàn bộ actor, phân quyền, external system.
  3. `3. BUSINESS RULES` — Trích toàn bộ rule trong tài liệu, gắn mã `BR-01`, `BR-02`...
  4. `4. HAPPY PATH` — Kịch bản luồng chính thành công step-by-step.
  5. `5. ALTERNATE FLOWS` — Các luồng phụ, rẽ nhánh, luồng ngoại lệ/lỗi (`AF-01`...).
  6. `6. OUT OF SCOPE` — Những điểm tài liệu không đề cập/không xử lý.
  7. `7. OPEN QUESTIONS` — Tối thiểu 5 câu hỏi đào sâu kẽ hở kết hợp 06W.
  8. `8. BUSINESS CRITICALITY ASSESSMENT` — Đánh giá bối cảnh kinh doanh (`[CONTEXT_MISSING]` nếu thiếu).
  9. `9. MISSING RISK CONTEXT INFORMATION` — 5 khía cạnh bối cảnh (*User, Usage, Financial, Operational, Criticality*).
  10. `10. RISK ANALYSIS & PRIORITIZATION` — Ma trận rủi ro 3x3, Severity, tác động chiến lược.
* **Cơ chế chốt chặn (Clarification Gate)**:
  * Nếu Bước 7 có Open Questions hoặc phát hiện điểm mơ hồ $\rightarrow$ **Verdict: ASK**.
  * **Dừng lại ngay lập tức**, xuất danh sách câu hỏi cho BA/PO/User.
  * Chỉ tiếp tục khi nhận được phản hồi và đã cập nhật nội dung xác nhận vào OUTPUT và Knowledge.

---

### ⚪ Bước 2: Truy vết quy tắc còn thiếu (`missing-rule-06w`) — [Dự kiến]
* **Agent**: `qa-analyst` | **Skill**: `missing-rule-06w.md`
* **Vào**: `OUTPUT/<task-slug>/01_requirement_risk_summary.md` + `knowledge/features/<task-slug>.md`
* **Ra**: `OUTPUT/<task-slug>/02_missing_rule_report.md`

### ⚪ Bước 3: Lựa chọn góc nhìn kiểm thử (`viewpoint-selection`) — [Dự kiến]
* **Agent**: `qa-analyst` | **Skill**: `viewpoint-selection.md`
* **Vào**: Output `01` + `02`
* **Ra**: `OUTPUT/<task-slug>/03_viewpoint_report.md`

### ⚪ Bước 4: Thiết kế ý tưởng kiểm thử (`test-idea-design`) — [Dự kiến]
* **Agent**: `qa-analyst` | **Skill**: `test-idea-design.md`
* **Vào**: Output `01` + `03`
* **Ra**: `OUTPUT/<task-slug>/04_test_idea_report.md`

### ⚪ Bước 5: Sinh kịch bản Test Case chi tiết (`test-case-generation`) — [Dự kiến]
* **Agent**: `qa-test-design` | **Skill**: `test-case-generation.md`
* **Vào**: Output `01` + `03` + `04`
* **Ra**: `OUTPUT/<task-slug>/05_test_case_spec.md`

### ⚪ Bước 6: Rà soát độ phủ 3 góc nhìn (`coverage-review`) — [Dự kiến]
* **Agent**: `qa-test-design` | **Skill**: `coverage-review.md`
* **Vào**: Output `01` + `03` + `05`
* **Ra**: `OUTPUT/<task-slug>/06_coverage_review.md`

### ⚪ Chốt chặn: Đánh giá độ sẵn sàng kiểm thử (`gen-readiness-report`) — [Chốt chặn Automation]
* **Agent**: `qa-readiness-evaluator` | **Skill**: `gen-readiness-report.md`
* **Vào**: `coverage-plan.json` + `testcases/*.csv` + `validation-report.md` + `specs` + `reviews/`
* **Ra**: `OUTPUT/reports/readiness-report.md` (Khuyến nghị GO / NO-GO)

---

## 3. Khối lệnh tự chạy (Execution Block)

```markdown
### Lệnh thực thi tự động Bước 1:

1. Đọc tài liệu chuẩn hóa và tri thức:
   - qa-system/core/QA_STANDARD.md
   - knowledge/_project.md
   - knowledge/features/<task-slug>.md (nếu có)
   - qa-system/qa-analyst/AGENT.md
   - qa-system/qa-analyst/skills/requirement-risk-summary.md

2. Phân tích các tài liệu trong INPUT/ theo đúng 10 bước của skill 01.

3. Tạo thư mục OUTPUT/<task-slug>/ (nếu chưa có).

4. Xuất file kết quả:
   - OUTPUT/<task-slug>/01_requirement_risk_summary.md
   - OUTPUT/<task-slug>/_index.md (ghi nhận trạng thái Bước 1 và Verdict)
   - Cập nhật knowledge/features/<task-slug>.md (đồng bộ thông tin nghiệp vụ đã bóc tách)

5. In kết quả tóm tắt và Verdict ra màn hình:
   - Nếu Verdict là PASS: Sẵn sàng kích hoạt bước tiếp theo.
   - Nếu Verdict là ASK hoặc FIX: DỪNG LẠI, hiển thị bảng Open Questions / Điểm cần sửa và chờ người dùng phản hồi.
```

---

## 4. Checklist kiểm tra nhanh sau Bước 1 (30s Quality Gate)

- [ ] File output mở đầu với dòng meta chuẩn: `# REQUIREMENT & RISK ANALYSIS REPORT · <task-slug>` kèm `Owner`, `Nguồn`, `Verdict`.
- [ ] Trích xuất đầy đủ các quy tắc nghiệp vụ `BR-xx` (không tự chế rule ngoài nguồn).
- [ ] Có tối thiểu 5 `Open Questions` đào sâu bằng kỹ thuật 06W.
- [ ] Ma trận rủi ro 3x3 có đủ `Risk Level`, `Severity` và giải thích 5 yếu tố tác động.
- [ ] Những vùng thiếu thông tin được gắn nhãn tường minh `[GIẢ ĐỊNH]` hoặc `[CONTEXT_MISSING]`.

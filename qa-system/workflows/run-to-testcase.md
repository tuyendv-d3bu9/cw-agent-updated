# RUNBOOK — Từ requirement thô đến Test Case Spec (`01 → 05`)

> File này để **CHẠY**. Dán nguyên khối lệnh ở §2 vào Antigravity, hoặc trỏ chính file này:
> *"Đọc `workflows/run-to-testcase.md` và thực hiện."*
> Bản đồ toàn hệ thống: `workflows/WORKFLOW.md`.

**Tham số**

| Tham số | Giá trị mẫu |
|---|---|
| `task-slug` | `<task-slug>` (ví dụ: `auth-login`, `order-checkout`) |
| `input` | `INPUT/<task-slug>.md` (hoặc `INPUT/<task-slug>/`) |
| `feature knowledge` | `knowledge/features/<task-slug>.md` |

Đổi feature khác → thay 3 dòng trên, phần còn lại giữ nguyên.

---

## 1. Chuẩn bị — kiểm trước khi chạy

- [ ] Đã gom agent vào `agents/` và mọi đường dẫn `qa-*/` đã đổi thành `agents/qa-*/`
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

Chạy tuần tự 5 bước sau. Sau MỖI bước: ghi file output, cập nhật
OUTPUT/<task-slug>/_index.md, in verdict ra màn hình rồi mới sang bước kế.
Nếu verdict là FIX hoặc ASK → DỪNG toàn bộ, báo tôi, không chạy tiếp.

B1  qa-system/qa-analyst/AGENT.md + skills/requirement-risk-summary.md
    Vào : INPUT/<task-slug>.md
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

Không chạy skill 06 và 09–12 trong lần này.
```

---

## 3. Kiểm sau mỗi bước — 30 giây, không bỏ

| Bước | Nhìn đúng 2 thứ này |
|---|---|
| B1 | Có `Risk Matrix` không? Có tối thiểu 5 Open Question không? |
| B2 | Ma trận 06W có đủ W1→W6 không? W nào không ra vấn đề có ghi `"Không phát hiện vấn đề qua câu hỏi #Wx"` không? |
| B3 | Các viewpoint có chồng lấn nhau không (zero-overlap)? |
| B4 | Cột `Lý do filter` có trích đúng nguyên văn checklist Giữ/Bỏ không? |
| B5 | Chọn ngẫu nhiên 1 test case: `Test Data` có giá trị thật hay còn placeholder? |

---

## 4. Nghiệm thu — truy vết ngược

Mở `OUTPUT/<task-slug>/05_test_case_spec.md`, chọn **một** test case, đi ngược đủ 4 chặng:

```
Test Case  →  Tags: Rule#BR-xx, Viewpoint#yy
           →  04_test_idea_report.md   (idea nào sinh ra nó, vì sao "Giữ")
           →  03_viewpoint_report.md   (viewpoint đó thuộc risk area nào)
           →  knowledge/features/<task-slug>.md  (BR-xx nội dung gì, ai xác nhận, ngày nào)
           →  INPUT/<task-slug>.md      (câu chữ gốc)
```

Đứt ở chặng nào → đó là lỗi traceability, chưa phải test case dùng được.

---

## 5. Chạy đối chiếu (tuỳ chọn — để thấy giá trị của knowledge)

Đổi tên tạm `knowledge/features/<task-slug>.md` → `_off.md`, chạy lại B1+B2 với `task-slug = <task-slug>-noknow`.
So hai bản: số `[GIẢ ĐỊNH]`, số `[CONTEXT_MISSING]`, số missing rule sinh ra.
Xong nhớ đổi tên trả lại — mất file này là mất toàn bộ câu trả lời của BA.

---

## 6. Lỗi hay gặp

| Hiện tượng | Nguyên nhân | Xử lý |
|---|---|---|
| Agent báo không tìm thấy `qa-analyst/...` | Đã gom vào `agents/` nhưng chưa sửa đường dẫn trong file .md | Chạy lại lệnh sửa path, rồi grep verify |
| Agent chạy thẳng ra test case, bỏ B2–B4 | Khối lệnh bị rút gọn, mất ràng buộc "sau mỗi bước dừng in verdict" | Dán lại nguyên khối §2 |
| B5 sinh test case không có trong test idea | Scope Creep | `qa-system/qa-test-design/skills/05` mục "KHÔNG được" — bắt agent tự rà lại |
| B2 hỏi lại đúng câu BA đã trả lời | Agent không đọc `knowledge/features/<task-slug>.md` | Kiểm dòng "Đọc trước" có file knowledge chưa |

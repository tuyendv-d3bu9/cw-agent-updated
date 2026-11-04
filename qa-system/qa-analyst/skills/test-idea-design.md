---
name: test-idea-design
description: >
  Chuyển viewpoint thành Test Idea (mỗi idea đúng 1 câu, gắn mã nguồn BR/FD/AF/MR) và sàng lọc
  Giữ / Bỏ / Chờ MR theo thứ tự ưu tiên cố định.
---

# Skill: test-idea-design

> Tuân thủ `qa-system/core/QA_STANDARD.md` (cổng ASK §1 · guard §2 · FACT §3 · chuỗi biên §6 ·
> knowledge §8 · ID §9 · nguồn §10).

## Mục đích
Sinh **Test Idea** — một câu mô tả một điều kiện cần kiểm, có mã nguồn — và lọc theo luật cố định để
cùng đầu vào ra cùng bộ idea. *Test Case* đầy đủ là việc của `qa-system/qa-test-design`.

## Đầu vào
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — `BR`, `FD`, `AF`, §6 Out of Scope, `RK`.
- `OUTPUT/<task-slug>/02_missing_rule_report.md` — `MR` và trạng thái.
- `OUTPUT/<task-slug>/03_viewpoint_report.md` — viewpoint, phạm vi mã của từng VP, quy ước sở hữu.
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` — §7/§8 (câu trả lời BA đã chốt).

> Trước khi chạy: `npm run gate <task-slug>` phải exit `0` (QA_STANDARD §1).

## KHÔNG được (riêng skill này)
- Mở rộng thành Test Case (Precondition, Steps, Test Data, Expected).
- Viết idea dài hơn một câu, hoặc idea không có mã nguồn.
- Gán `State Transition` khi nguồn không mô tả trạng thái; gán `Decision Table` cho rule một điều kiện.
- Đánh `Bỏ` một idea vì nguồn mơ hồ — đó là `Chờ MR`.
- Đánh `Ngoài scope` khi 01 §6 không có dòng loại trừ tương ứng.

## Kỹ thuật (cột `Kỹ thuật`)
| Kỹ thuật | Dùng khi (căn cứ trong nguồn) |
|---|---|
| `Use Case` | Luồng chính (01 §4) và luồng phụ `AF` |
| `EP` | Field/điều kiện có các nhóm giá trị rời rạc |
| `BVA` | `FD` có min/max/độ dài trong nguồn — chuỗi theo QA_STANDARD §6 |
| `Decision Table` | `BR` có từ 2 điều kiện ghép (AND/OR) |
| `State Transition` | Nguồn mô tả trạng thái và điều kiện chuyển |
| `Error Guessing` | Lỗi lịch sử (`jira_defects_summary.md`) hoặc `MR` đã chốt về tình huống bất thường |

## Luật lọc — áp theo thứ tự, gặp luật đầu tiên đúng thì dừng
| # | Kết quả | Khi nào | Cột `Lý do filter` |
|---|---|---|---|
| 1 | `Bỏ` | Trùng hoàn toàn một idea đã `Giữ` (cùng mã nguồn, cùng VP, cùng điều kiện) | `Trùng lặp: TI-xx` |
| 2 | `Bỏ` | Chạm đúng nội dung một dòng ở 01 §6 | `Ngoài scope: 01 §6 "<nội dung loại trừ>"` |
| 3 | `Chờ MR` | Hành vi cần kiểm phụ thuộc thông tin chưa có / `MR` chưa `Confirmed` | `Chờ MR: MR-xx` |
| 4 | `Bỏ` | **Trivial**: chỉ kiểm điều đã là tiền điều kiện hoặc bước bắt buộc của một idea `Giữ` khác. **Thêm VP của idea bị bỏ vào cột VP của idea `Giữ` đó** (cột VP nhận nhiều mã, cách nhau dấu phẩy) | `Trivial: bao hàm trong TI-xx` |
| 5 | `Giữ` | Còn lại | `Kiểm tra rule có nguồn: <mã>` (thêm `· RK-xx` nếu Risk Level `CRITICAL`/`HIGH`) |

Thiếu chữ thông báo hay giá trị cụ thể **không** làm idea thành `Chờ MR` — hành vi đã rõ thì `Giữ`;
Chặng 5 ghi nhãn `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` ở ô giá trị.
Idea cần thông tin mà chưa có `MR` nào hỏi ⇒ không ghi idea; thêm dòng ở `## ASK` ("cần MR cho <mã> × W<n>",
chuyển Chặng 2) và verdict `ASK`.

## Các bước
1. Với mỗi VP ở 03, đi qua từng mã trong phạm vi của VP đó, chọn kỹ thuật theo bảng, sinh idea (một câu, một điều kiện).
2. Mã `TI` cấp số kế tiếp (`npm run ids -- <task-slug>`); idea giữ nguyên nội dung so với lần chạy trước thì giữ mã.
3. Lọc theo bảng luật, đúng thứ tự.
4. Kiểm: mọi mã trong phạm vi VP có ít nhất một idea `Giữ` hoặc `Chờ MR`.

## Format output
Ghi ra `OUTPUT/<task-slug>/04_test_idea_report.md`:

````markdown
# Test Idea Report · <task-slug>
Owner: qa-system/qa-analyst/skills/test-idea-design.md · Nguồn: 01_requirement_risk_summary.md, 02_missing_rule_report.md, 03_viewpoint_report.md, knowledge/features/<feature-slug>.md · Verdict: PASS

| TI | Test Idea | VP | Nguồn (BR/FD/AF/MR) | Kỹ thuật | Giữ/Bỏ | Lý do filter |
|---|---|---|---|---|---|---|
| TI-01 | <một câu> | VP-01 | BR-01 | Use Case | Giữ | Kiểm tra rule có nguồn: BR-01 · RK-01 |
| TI-02 | <một câu> | VP-03 | FD-02 | BVA | Giữ | Kiểm tra rule có nguồn: FD-02 |
| TI-03 | <một câu> | VP-02 | AF-01 | EP | Chờ MR | Chờ MR: MR-04 |
````

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] `npm run gate <slug>` exit `0`; dòng meta đúng QA_STANDARD §7.
- [ ] Mỗi idea một câu, có mã nguồn, VP thuộc registry/03, `Kỹ thuật` thuộc bảng trên.
- [ ] `Giữ/Bỏ` ∈ `Giữ` · `Bỏ` · `Chờ MR`; `Lý do filter` đúng mẫu của luật đã áp.
- [ ] Mọi mã trong phạm vi các VP của 03 có idea `Giữ` hoặc `Chờ MR`.

---
name: gen-readiness-report
description: >
  Thu thập và đối soát chéo các design-time artifacts (coverage plan, test cases CSV, validation report, spec, reviews) để lập báo cáo đánh giá mức độ sẵn sàng kiểm thử (Design-time QA Readiness Report) trước giai đoạn Test Automation Execution.
---

# Skill: gen-readiness-report

> Tuân thủ `agents/core/QA_STANDARD.md` (verdict · guard · FACT).
>
> **Skill = LÀM THẾ NÀO.** Quy trình + tham số + format output. Tái dùng được.
> KHÔNG chứa danh tính/quyền hạn (đó là `AGENT.md`), KHÔNG nhắc lại ràng buộc chung
> (đó là `agents/core/QA_STANDARD.md`).

## Mục đích
Kiểm tra, đối soát chéo và tổng hợp toàn bộ các artifact thiết kế test (Specs, Test Coverage Plan, Test Cases, Test Data, Reviews) để đánh giá độ chín của test design trước khi kích hoạt viết script tự động hóa. Sinh ra deliverable duy nhất tại `outputs/reports/readiness-report.md`.

## Đầu vào
- `outputs/coverage-plan.json` — Lấy tổng số slot, danh sách viewpoint, số slot kế hoạch theo từng viewpoint; thống kê các slot gắn cờ `assumed` hoặc `context_limited`.
- `outputs/testcases/*.csv` — Toàn bộ test case thiết kế (parse chuẩn RFC 4180 để lấy số lượng test case thực tế và cột Trace).
- `outputs/testdata/validation-report.md` — Kết quả đánh giá FACT cho test data và danh sách data defect/issue chưa giải quyết.
- `outputs/specs/voucher-spec.json` — Danh sách `rules`, `boundaries`, `gaps` (lấy ID, status, assumption, needs_clarification).
- `outputs/reviews/` *(nếu folder tồn tại và có file)* — Tally các verdict PASS / FIX / ASK và các mục review đang chờ xử lý.

> Thiếu artifact bắt buộc → DỪNG và yêu cầu cung cấp, không tự tưởng tượng nội dung.

## KHÔNG được (riêng skill này)
- Không làm việc của bước sau: Tuyệt đối không thu thập, tính toán hoặc đề cập đến dữ liệu execution (không có bug thực thi, không có Pass/Fail rate, không có kết quả chạy test run).
- Không dùng lệnh đếm dòng thô (`wc -l`, split theo `\n`) để đếm test case; bắt buộc dùng parser RFC 4180 xử lý quoted fields chứa newline.
- Không tự ý sửa đổi artifact nguồn: không sửa test data, không sinh thêm test case, không sửa spec.
- Không tự ý quyết định nghiệp vụ: không tự duyệt các assumption đang treo, không tự đóng gap; mọi điểm chưa rõ bắt buộc phải đẩy vào mục "CÂU HỎI MỞ".
- Không tự quyết định quyền Go/No-Go chính thức; khuyến nghị chỉ mang tính tham mưu kỹ thuật dựa trên dữ liệu.

## Bảng logic đánh giá khuyến nghị Go / No-Go
| Khuyến nghị | Điều kiện kích hoạt |
|---|---|
| `RECOMMEND NO-GO` | Tồn tại Data Issue chưa giải quyết trong `validation-report.md` OR Tỷ lệ Trace < 80% OR Có test case map vào rule trọng yếu có `needs_clarification: true`. |
| `RECOMMEND CONDITIONAL GO` | Tỷ lệ Trace đạt từ 80% đến < 100% OR Dữ liệu FACT đạt cơ bản nhưng còn minor issues / còn mục `ASK` trong review OR Có Delta lệch lớn giữa Actual và Plan chưa được QA Lead duyệt. |
| `RECOMMEND GO` | Tỷ lệ Trace = 100% AND Test data đạt đủ 4 tiêu chí FACT (không còn issue) AND Toàn bộ Rule liên quan đã `confirmed` AND Không còn mục `FIX` tồn đọng. |

## Các bước
1. **Trích xuất dữ liệu nguồn (Artifact Extraction):**
   - Đọc `outputs/coverage-plan.json`: Lấy tổng slot, slot theo từng viewpoint, số slot có flag `assumed` hoặc `context_limited`.
   - Parse toàn bộ file CSV trong `outputs/testcases/*.csv` theo chuẩn RFC 4180. Đếm số lượng test case thực tế theo từng viewpoint. Kiểm tra cột `Trace` để tính tỷ lệ % có trace hợp lệ: `(Số TC có Trace / Tổng số TC) * 100`.
   - Đọc `outputs/testdata/validation-report.md`: Trích xuất đánh giá 4 tiêu chí FACT và danh sách data issues tồn đọng.
   - Đọc `outputs/specs/voucher-spec.json`: Trích xuất `rules`, `boundaries`, `gaps` (ID, status, assumption, needs_clarification).
   - Đọc `outputs/reviews/` (nếu có): Thống kê tally các verdict PASS / FIX / ASK; gom các mục `ASK` và review pending.
2. **Đối soát chéo dữ liệu (Cross-Artifact Reconciliation):**
   - So khớp Slot Kế hoạch ↔ Test Case Thực tế: Tính `Delta = Thực tế - Kế hoạch` theo từng viewpoint và nhận diện coverage drift.
   - So khớp Traceability ↔ Trạng thái Rule: Lập danh sách các Test Case ID đang map với rule chưa confirmed hoặc có `needs_clarification: true`.
   - Tổng hợp Gap và Assumption: Kiểm tra tình trạng xác nhận của BA/PO.
3. **Tổng hợp và kiểm tra trước khi ghi (Pre-write Self-Check):**
   - Đối chiếu số lượng test case trong bảng khớp 100% với tổng dòng record parsed từ các CSV.
   - Kiểm tra mẫu số của tỷ lệ Trace khớp với tổng số test case thực tế.
   - Đảm bảo toàn bộ các mục `ASK` từ review và Gap chưa confirm đều được đưa vào mục "❓ CÂU HỎI MỞ".
   - Xác định mức khuyến nghị theo Bảng logic đánh giá.
4. **Xuất báo cáo:** Ghi kết quả vào `outputs/reports/readiness-report.md`.

## Format output
Ghi ra `outputs/reports/readiness-report.md`:

````markdown
# QA Design-time Readiness Report: [Tên Feature/System]
Owner: agents/qa-readiness-evaluator/skills/gen-readiness-report.md · Nguồn: coverage-plan.json, testcases/*.csv, validation-report.md, voucher-spec.json, reviews/ · Verdict: [RECOMMEND GO / RECOMMEND NO-GO / RECOMMEND CONDITIONAL GO]

## 1. Tổng quan (Overview)
- **Feature / Phạm vi:** [Tóm tắt ngắn gọn phạm vi kiểm thử]
- **Mục tiêu báo cáo:** Đánh giá độ chín của test design trước khi tiến hành Execution / Automation.
- **Nguồn dữ liệu đã nạp:** 
  - `outputs/coverage-plan.json` (Trạng thái: [Đã nạp / Không tìm thấy])
  - `outputs/testcases/*.csv` ([Số lượng file CSV đã parse] file)
  - `outputs/testdata/validation-report.md` (Trạng thái: [Đã nạp / Không tìm thấy])
  - `outputs/specs/voucher-spec.json` (Trạng thái: [Đã nạp / Không tìm thấy])
  - `outputs/reviews/` (Trạng thái: [Đã nạp X file / Không có])

## 2. Coverage (Planned Slots vs. Actual Test Cases)
| Viewpoint ID | Tên Viewpoint | Planned Slots | Actual Test Cases | Delta (Actual - Plan) | Ghi chú & Nhận diện Drift |
|---|---|---|---|---|---|
| [ID] | [Tên] | [Số slot] | [Số TC] | [Delta] | [Ghi chú] |
| **TỔNG** | | **[Tổng Plan]** | **[Tổng Actual]** | **[Tổng Delta]** | |

*Phân tích Delta:*
- Giải trình nguyên nhân chênh lệch (nếu delta ≠ 0): [Nêu rõ 1 slot bung nhiều kịch bản hay có dấu hiệu coverage drift cần QA Lead review lại]
- Thống kê slot có trạng thái `assumed`: [Số lượng] slot.
- Thống kê slot có trạng thái `context_limited`: [Số lượng] slot.

## 3. Ma trận Truy vết (Traceability)
- **Tỷ lệ Test Case có Trace:** [X]% ([Số TC có Trace hợp lệ] / [Tổng số TC])
- **Cảnh báo Rule chưa Confirm:** Liệt kê danh sách các Test Case ID đang gắn với các rule chưa được confirm hoặc còn flag `needs_clarification`:
  - `[TC_ID]`: Map với Rule `[Rule_ID]` (Status: [Pending/Unconfirmed/needs_clarification])

## 4. Sẵn sàng về Dữ liệu Kiểm thử (Data Readiness)
- **Tóm tắt FACT trên Test Data:**
  - Faithful: [Đạt / Không đạt / Tóm tắt]
  - Accurate: [Đạt / Không đạt / Tóm tắt]
  - Complete: [Đạt / Không đạt / Tóm tắt]
  - Traceable: [Đạt / Không đạt / Tóm tắt]
- **Danh sách Data Issues còn tồn đọng:**
  - [Trích dẫn nguyên văn issue từ validation-report.md, không tự sửa data]

## 5. Danh sách Gaps & Giả định (Gaps & Assumptions)
| Gap ID | Mô tả Chi tiết | Status (Confirmed / Treo) | Giả định hiện tại (Working Assumption) | Cần BA làm rõ? (Yes/No) |
|---|---|---|---|---|
| [ID] | [Mô tả] | [Trạng thái] | [Giả định] | [Yes/No] |

## 6. Kết quả Review Thiết kế (Review Findings)
- **Tally Kết quả Review:** PASS: [Số lượng] | FIX: [Số lượng] | ASK: [Số lượng]
- **Danh sách điểm ASK / Điểm cần can thiệp:**
  - [Mục trích xuất từ các file review cần can thiệp]

## 7. Khuyến nghị Go / No-Go cho Automation
- **Khuyến nghị của Agent:** [RECOMMEND GO / RECOMMEND NO-GO / RECOMMEND CONDITIONAL GO]
- **Căn cứ khuyến nghị:** [Nêu rõ lý do dựa trên tỷ lệ Trace, Data Issue, số lượng Gap chưa đóng]
- **Điều kiện tiên quyết cần hoàn thành (nếu No-Go hoặc Conditional):**
  1. [Điều kiện 1]
  2. [Điều kiện 2]
- *(Lưu ý: Đây là khuyến nghị kỹ thuật dựa trên dữ liệu. Quyết định Go/No-Go cuối cùng thuộc về QA Lead / Quản lý dự án).*

---
## ❓ CÂU HỎI MỞ (Cần BA / PO / Tech Lead xác nhận)
- [Liệt kê toàn bộ các ambiguity, business behavior chưa rõ, các review item trạng thái ASK cần oracle từ con người]
````

> Ô bảng thiếu dữ liệu phải điền nhãn tường minh (`CHƯA XÁC ĐỊNH`, `[GIẢ ĐỊNH]`, `N/A`), không để trống.

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] File xuất ra đúng đường dẫn `outputs/reports/readiness-report.md`.
- [ ] Số lượng test case thực tế khớp 100% với số bản ghi parsed bằng parser RFC 4180 từ các file CSV.
- [ ] Tỷ lệ Trace được tính đúng mẫu số (tổng test case thực tế) và liệt kê đầy đủ các test case map vào rule chưa confirm / có flag `needs_clarification`.
- [ ] Đánh giá Test Data phản ánh trung thực kết quả FACT từ `outputs/testdata/validation-report.md`, giữ nguyên văn các unresolved issues.
- [ ] Toàn bộ các mục `ASK` từ reviews và các Gap/Assumption chưa rõ ràng đều được tập hợp đầy đủ vào mục "❓ CÂU HỎI MỞ".
- [ ] Báo cáo tuyệt đối không chứa dữ liệu thực thi (Pass/Fail rate, bug execution, run duration).
- [ ] Giữ nguyên disclaimer trao quyền quyết định Go/No-Go cuối cùng cho con người.

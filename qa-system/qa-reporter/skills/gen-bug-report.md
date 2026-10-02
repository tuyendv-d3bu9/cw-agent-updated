---
name: gen-bug-report
description: >
  Chuyển đổi ghi chép lỗi thô (Raw Bug Notes) của Tester thành Bug Report kỹ thuật 7 trường Jira-ready,
  đối soát Expected Result với Business Rules (BR-xx), đánh giá Severity kỹ thuật và đề xuất Priority.
---

# Skill: gen-bug-report

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT standard · ma trận rủi ro §5).
>
> **Skill = LÀM THẾ NÀO.** Quy trình + tham số + format output 7 trường. Tái dùng được.
> KHÔNG chứa danh tính/quyền hạn (đó là `AGENT.md`), KHÔNG nhắc lại ràng buộc chung (đó là `qa-system/core/QA_STANDARD.md`).

## Mục đích
Chuyển đổi ghi chép lỗi thô (Raw Bug Notes) của Tester thành Bug Report kỹ thuật chuẩn 7 trường Jira-ready, đối soát hành vi Expected về Business Rule (`BR-xx`) tương ứng từ `knowledge/`, đánh giá mức độ nghiêm trọng kỹ thuật (Severity), đề xuất Priority và chuẩn bị hồ sơ cho Human-Final Review trước khi log vào Jira.

## Tham số
- `bug_notes_path`: Đường dẫn file chứa bug notes thô của tester (ví dụ: `INPUT/bug_notes.txt` hoặc file markdown/text bất kỳ). Bắt buộc.
- `rules_path`: Đường dẫn file chứa Business Rules để đối soát Expected (tùy chọn; mặc định tra cứu `knowledge/rules/rules.md`, nếu không có tự động fallback sang `knowledge/features/<feature-slug>.md` dựa trên module phát hiện).
- `feature_name`: Tên tính năng/module liên quan (ví dụ: `Function D`, `Voucher`). Tùy chọn.

## Đầu vào
- File bug notes thô tại `<bug_notes_path>`.
- File tri thức nghiệp vụ: `knowledge/rules/rules.md` HOẶC `knowledge/features/<feature-slug>.md` (ví dụ: `knowledge/features/<feature-slug>.md`).
- `knowledge/_project.md` (quy ước múi giờ, định dạng mã, tiền tệ).

> Nếu thiếu file bug notes bắt buộc → DỪNG và yêu cầu cung cấp, tuyệt đối không tự bịa đặt nội dung.

## KHÔNG được (riêng skill này)
- KHÔNG tự bịa các bước tái hiện (Steps to Reproduce), thông số môi trường (Environment), thiết bị, hệ điều hành, test data, tài khoản hoặc hành vi lỗi nếu bug notes không đề cập. Chỗ nào thiếu bắt buộc ghi rõ `(cần bổ sung)` hoặc gắn nhãn `[GIẢ ĐỊNH]`.
- KHÔNG tự suy đoán nguyên nhân gốc (Root Cause) khi không có bằng chứng kỹ thuật (như stack trace, network tab log, console error, DB exception) trong bug notes. Chỉ ghi nhận hiện tượng bề mặt và ghi `(cần Dev kiểm tra Root Cause)`.
- KHÔNG tự quyết định Priority thay cho Team/PM; chỉ được đề xuất dưới dạng `[ĐỀ XUẤT] P1/P2/P3/P4` kèm lý do và ghi rõ cần Reviewer chốt.
- KHÔNG ghi đè hoặc sửa đổi file bug notes đầu vào.
- KHÔNG để trống bất kỳ trường nào trong 7 trường bắt buộc.

---

## Quy Chuẩn 7 Trường Bắt Buộc (Jira Bug Specification)

| # | Tên trường | Nội dung quy chuẩn | Quy tắc bắt buộc |
|---|---|---|---|
| **1** | **Title** | Tóm tắt lỗi theo cú pháp: `[<Module/Function>] <Hành vi lỗi thực tế> khi <Thao tác/Điều kiện>` | Ngắn gọn, súc tích, phản ánh đúng bản chất lỗi. Dùng làm căn cứ sinh file slug. |
| **2** | **Environment** | Bóc tách: OS, Trình duyệt/Thiết bị, Môi trường (Staging/Dev/UAT), Version/Build, Account test | Chỉ ghi những gì có trong bug notes. Thiếu thông tin nào ghi rõ `(cần bổ sung)` vào mục đó. |
| **3** | **Steps to Reproduce** | Gồm: Tiền điều kiện (Preconditions) + Các bước đánh số tuần tự (1, 2, 3...) kèm Test Data cụ thể | Bám sát thao tác thực tế từ bug notes. Thiếu data cụ thể ghi `(cần bổ sung test data)`. |
| **4** | **Actual vs Expected** | Tách bạch 2 vế:<br>- **Actual**: Hiện tượng lỗi quan sát được từ notes.<br>- **Expected**: Hành vi chuẩn của hệ thống, **BẮT BUỘC TRACE VỀ MÃ RULE** | Trích dẫn cụ thể mã rule (ví dụ: `BR-03`, `BR-05` trong `knowledge/features/<feature-slug>.md`). Nếu rule chưa có trong knowledge → gắn `[GIẢ ĐỊNH - CHƯA CÓ TRONG KNOWLEDGE]`. |
| **5** | **Severity** | Đánh giá mức độ nghiêm trọng kỹ thuật: `Critical` / `Major` / `Medium` / `Minor` | **BẮT BUỘC KÈM LÝ DO KỸ THUẬT**: Phân tích ảnh hưởng luồng chính, crash, rò rỉ dữ liệu, hay chỉ là lỗi UI. |
| **6** | **Priority** | Format: `[ĐỀ XUẤT] [P1 / P2 / P3 / P4]` + lý do đề xuất mức độ khẩn cấp | Kèm cảnh báo tường minh: `⚠️ CẦN REVIEWER / PM XÁC NHẬN VÀ CHỐT TRƯỚC KHI LOG JIRA`. |
| **7** | **Evidence** | Logs, Response status/body, chuỗi thông báo lỗi trên UI, đường dẫn screenshot/video | Trích xuất nguyên văn từ bug notes. Nếu tester chưa đính kèm bằng chứng → ghi `(cần bổ sung screenshot/video/log)`. |

---

## Các Bước Thực Hiện

### Bước 1: Tiếp nhận và bóc tách dữ kiện thô từ Bug Notes
1. Đọc nội dung file `<bug_notes_path>`.
2. Trích xuất toàn bộ các dữ kiện hiện có:
   - Module / Chức năng bị lỗi (ví dụ: Áp dụng voucher, Function D).
   - Môi trường, thiết bị, tài khoản (nếu có).
   - Thao tác thực hiện và dữ liệu đầu vào (mã voucher, giá trị giỏ hàng...).
   - Hiện tượng lỗi thực tế (Actual result) và thông báo lỗi.
   - Bằng chứng kỹ thuật đi kèm (log, ảnh, status code).
3. Đánh dấu danh sách các thông tin bị khuyết để đưa vào mục `(cần bổ sung)`.

### Bước 2: Tra cứu Business Rules để xây dựng Expected Result
1. Xác định module nghiệp vụ liên quan từ dữ kiện bước 1.
2. Tìm kiếm quy tắc nghiệp vụ theo thứ tự ưu tiên:
   - File được chỉ định tại `rules_path` (hoặc `knowledge/rules/rules.md`).
   - File tính năng tương ứng trong `knowledge/features/<feature-slug>.md` (ví dụ: `knowledge/features/<feature-slug>.md` mục §3 `BUSINESS RULES`).
3. Xác định chính xác mã quy tắc (`BR-xx`) quy định hành vi chuẩn trong tình huống này.
4. Viết Expected Result dựa trên quy tắc đó kèm dẫn xuất nguồn cụ thể (Traceability).

### Bước 3: Đánh giá Severity kỹ thuật & Đề xuất Priority
1. **Severity (Độ nghiêm trọng kỹ thuật)**:
   - `Critical`: Crash hệ thống, mất dữ liệu, chặn đứng hoàn toàn luồng thanh toán/đăng nhập, lỗ hổng bảo mật nghiêm trọng.
   - `Major`: Chức năng chính hoạt động sai lệch logic (ví dụ voucher hết hạn vẫn giảm tiền, sai tổng tiền thanh toán) mà không có workaround.
   - `Medium`: Tính năng phụ sai, thông báo lỗi sai lệch hoặc có giải pháp tạm thời (workaround).
   - `Minor`: Lỗi hiển thị giao diện (UI/UX), lỗi chính tả, căn lề, không ảnh hưởng logic tính toán.
   - *Viết rõ đoạn phân tích lý do kỹ thuật đằng sau mức đánh giá.*
2. **Priority (Mức độ ưu tiên xử lý)**:
   - Đưa ra đề xuất `[ĐỀ XUẤT] P1 / P2 / P3 / P4` dựa trên tính cấp bách kinh doanh, phạm vi ảnh hưởng người dùng.
   - Khóa nhãn: `⚠️ CẦN REVIEWER / PM XÁC NHẬN VÀ CHỐT TRƯỚC KHI LOG JIRA`.

### Bước 4: Tự kiểm tra tính chuẩn xác (FACT Self-Audit)
Chạy checklist kiểm tra trước khi tạo file:
- **F (Factual)**: Mọi thông tin mô tả lỗi đều xuất phát từ bug notes hoặc Business Rules. Tuyệt đối không tự suy đoán root cause khi không có bằng chứng.
- **A (Accurate)**: Đúng cú pháp Title, đúng mã `BR-xx`, đúng phân biệt Actual vs Expected.
- **C (Complete)**: Đủ 7 trường bắt buộc + Mục 8 (Giả định & thông tin còn thiếu) + Mục 9 (Human-Final Review Checklist).
- **T (Testable)**: Steps to reproduce rõ ràng, kiểm chứng được Pass/Fail.

Xác định Verdict:
- Nếu các bước tái hiện và lỗi thực tế quá mập mờ không thể xác định ➔ `Verdict: ASK`, dừng và yêu cầu Tester bổ sung.
- Nếu đủ thông tin cơ bản để tái hiện ➔ `Verdict: PASS`.

### Bước 5: Tạo Slug và Xuất file Markdown
1. Tạo `<slug>` từ trường Title:
   - Chuyển chữ hoa thành chữ thường.
   - Bỏ dấu tiếng Việt (ví dụ: `á` ➔ `a`, `đ` ➔ `d`...).
   - Bỏ toàn bộ ký tự đặc biệt (chỉ giữ `[a-z0-9]`).
   - Thay khoảng trắng và chuỗi ký tự liên tiếp bằng dấu gạch ngang (`-`).
   - Giới hạn độ dài tối đa 60 ký tự để tên file gọn gàng.
2. Tạo thư mục `OUTPUT/reports/` (nếu chưa tồn tại).
3. Ghi file ra `OUTPUT/reports/bug-report-<slug>.md`. Tuyệt đối không ghi đè file input.

---

## Format Output
Ghi ra `OUTPUT/reports/bug-report-<slug>.md`:

````markdown
# BUG REPORT: <Title>
Owner: qa-system/qa-reporter/gen-bug-report · Nguồn Bug Notes: <path/to/bug_notes> · Rules: <path/to/rules> · Verdict: <PASS/ASK>

---

## 1. Title
[<Module>] <Hành vi lỗi thực tế> khi <Thao tác/Điều kiện>

## 2. Environment
- **Hệ điều hành (OS)**: <Thông tin từ notes hoặc (cần bổ sung)>
- **Trình duyệt / Thiết bị**: <Thông tin từ notes hoặc (cần bổ sung)>
- **Môi trường test**: <Staging / UAT / Dev / Prod hoặc (cần bổ sung)>
- **Phiên bản App / Web**: <Version / Build hoặc (cần bổ sung)>
- **Tài khoản kiểm thử**: <Username / Role hoặc (cần bổ sung)>

## 3. Steps to Reproduce
**Tiền điều kiện (Preconditions):**
- <Điều kiện chuẩn bị trước khi thực hiện test>

**Các bước thực hiện:**
1. Bước 1...
2. Bước 2... (Dữ liệu nhập: `<giá trị>`)
3. Bước 3...

## 4. Actual vs Expected
- **Actual Result (Thực tế)**: <Hành vi lỗi ghi nhận được từ bug notes>
- **Expected Result (Kỳ vọng)**: <Hành vi chuẩn xác của hệ thống>
  - *Traceability*: Căn cứ theo `<Mã Rule>` tại tài liệu `<Tên file rule>`.

## 5. Severity
**[Critical / Major / Medium / Minor]**
- *Lý do kỹ thuật*: <Phân tích chi tiết impact kỹ thuật đối với hệ thống, dữ liệu, bảo mật hoặc luồng người dùng>

## 6. Priority
**[ĐỀ XUẤT] [P1 / P2 / P3 / P4]**
- *Lý do đề xuất*: <Mức độ cấp bách nghiệp vụ, tần suất ảnh hưởng người dùng>
- *Trạng thái*: `⚠️ CẦN REVIEWER / PM XÁC NHẬN VÀ CHỐT TRƯỚC KHI LOG JIRA`

## 7. Evidence
- **Logs / API Response / Console**:
  ```
  <Nội dung log hoặc (cần bổ sung bằng chứng log/exception)>
  ```
- **Screenshot / Video**: `<Đường dẫn ảnh/video hoặc (cần bổ sung)>`

---

## 8. Giả Định & Thông Tin Còn Thiếu
*(Mục bắt buộc nếu phát hiện thiếu thông tin hoặc có giả định)*
- [ ] **Thông tin còn thiếu**:
  - <Liệt kê các trường đang ghi nhận (cần bổ sung)>
- [ ] **Giả định đã đưa ra**:
  - <Liệt kê các điểm gắn [GIẢ ĐỊNH] kèm căn cứ>

---

## 9. Human-Final Review Checklist (Trước Khi Log Jira)
- [ ] **Priority**: Reviewer xác nhận mức ưu tiên chính thức: `P[...]`
- [ ] **Expected Result Trace**: Đã kiểm tra tính chính xác của Business Rule được trích dẫn
- [ ] **Bổ sung thông tin**: Đã kiểm tra và đính kèm đầy đủ Environment / Evidence
- [ ] **Phê duyệt**: [ ] SẴN SÀNG LOG JIRA / [ ] CẦN CẬP NHẬT THÊM
````

---

## Ghi Knowledge
Không ghi knowledge (chỉ đọc knowledge để đối soát).

---

## Chốt Chặn
- [ ] File output nằm tại `OUTPUT/reports/bug-report-<slug>.md`, không ghi đè input.
- [ ] Tên file đúng dạng kebab-case không dấu.
- [ ] Đầy đủ 100% 7 trường bắt buộc, không trường nào bị bỏ trống.
- [ ] Expected Result bắt buộc trích dẫn mã `BR-xx` từ file rules; nếu chưa có trong knowledge phải gắn nhãn `[GIẢ ĐỊNH - CHƯA CÓ TRONG KNOWLEDGE]`.
- [ ] Severity có giải trình lý do kỹ thuật; Priority ở dạng `[ĐỀ XUẤT]` có ghi chú cần Reviewer chốt.
- [ ] Tuyệt đối không tự bịa thông tin; mọi chỗ thiếu ghi `(cần bổ sung)` và tổng hợp tại Mục 8.
- [ ] Có checklist Human-Final Review tại Mục 9.

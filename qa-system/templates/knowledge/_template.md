# <Tên Tính Năng> — Feature Knowledge

> `<Tên Tính Năng>` = `<Feature Name>` (heading kept verbatim: tools parse it).

> **Sourced** business facts of one feature. Every agent reads this file before running.
> Read/write rules: `qa-system/core/QA_STANDARD.md` §8. Table schema: §9.
>
> The file is created automatically at intake (or by `npm run knowledge:new <feature-slug>`) and **starts empty**.
> A line still containing `<điền>` (placeholder, "to be filled") or a table with no rows = not declared yet — the agent treats it as absent and never fills in values itself.
>
> **Headings, table header rows and field labels in this file are intentionally kept in Vietnamese: tools parse them** (gate, lint, schema, knowledge:sync, ids, scaffold). Glossary: `Nguồn tài liệu` = source documents · `Cập nhật lần cuối` = last updated · `Trạng thái tổng thể` = overall status · `Tác nhân` = actor · `Quyền hạn` = permissions · `Điều kiện tiên quyết` = prerequisites · `Nguồn (file §mục)` = source (file §section) · `Trích nguyên văn` = verbatim quote · `Điều kiện` = condition · `Hành vi / Kết quả` = behavior / result · `Kiểu` = type · `Bắt buộc` = required · `Ràng buộc` = constraint · `Thông báo khi sai` = error message · `Tình huống` = situation · `Hệ thống phản hồi` = system response · `Nội dung loại trừ` = excluded item · `Kẽ hở` = gap · `Nhóm 06W` = 06W group · `Nguồn phát hiện` = where found · `Phương án gợi ý` = suggested option · `Câu hỏi cho BA/PO` = question for BA/PO · `Phản hồi chính thức` = official answer · `Người trả lời` = answerer · `Ngày` = date · `Trạng thái` = status · `Mã liên quan` = related id · `Câu hỏi` = question · `Quyết định chính thức` = official decision · `Người phê duyệt` = approver · `Ngày chốt` = date settled · `Hằng số` = constant · `Kiểu dữ liệu` = data type · `Giá trị` = value · `Phạm vi ảnh hưởng` = scope of impact · `Mã` = id · `Ghi chú` = note.

Feature slug: `<feature-slug>` · Nguồn tài liệu: `INPUT/<feature-slug>/` · Cập nhật lần cuối: `<điền>` · Trạng thái tổng thể: `DRAFT`

---

## 1. TỔNG QUAN TÍNH NĂNG (FEATURE OVERVIEW)
<điền — 1–2 sentences, with source>

## 2. TÁC NHÂN & PHÂN QUYỀN (ACTORS & ROLES)

| Tác nhân (Actor) | Quyền hạn trong tính năng này | Điều kiện tiên quyết | Nguồn (file §mục) |
|---|---|---|---|

## 3. QUY TẮC NGHIỆP VỤ ĐÃ XÁC NHẬN (CONFIRMED BUSINESS RULES)
> Only **sourced** rules: a document (with a verbatim quote) or a decision in Section 8 (`knowledge §8 #n`).
> Anything unclear goes in Section 7.

| ID | Điều kiện | Hành vi / Kết quả | Nguồn (file §mục) | Trích nguyên văn | Trạng thái |
|---|---|---|---|---|---|

### 3b. FIELD & RÀNG BUỘC

| ID | Field | Kiểu | Bắt buộc | Ràng buộc (min/max/định dạng) | Thông báo khi sai | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|---|---|---|

## 4. LUỒNG CHÍNH (HAPPY PATH)
<điền — the steps found in the source, with source>

## 5. LUỒNG PHỤ & LỖI (ALTERNATE & ERROR FLOWS)

| ID | Tình huống | Hệ thống phản hồi (nguyên văn nếu có) | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|

## 6. NGOÀI PHẠM VI (OUT OF SCOPE)
> Only what the source **explicitly says** is not done, with a source quote. What the documents do not mention is a question (Section 7), not out of scope.

| Nội dung loại trừ | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|

## 7. CÂU HỎI MỞ & KẼ HỞ 06W (OPEN QUESTIONS & MISSING RULES)
> Skill `02` adds rows (`New`). The columns `Phản hồi chính thức` (official answer), `Người trả lời` (answerer), `Ngày` (date), `Trạng thái` (status) are filled by **humans**
> (or the agent copies verbatim when the user relays the BA's words). Status: `New` → `TREO` (pending) → `Confirmed` / `Rejected` (§9.3).
> `MR-xx` ids continue from the largest number in use — never renumber from 01.

| ID | Kẽ hở | Nhóm 06W | Nguồn phát hiện | Phương án gợi ý (chưa phải rule) | Câu hỏi cho BA/PO | Phản hồi chính thức | Người trả lời | Ngày | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|

## 8. QUYẾT ĐỊNH ĐÃ CHỐT (CONFIRMED DECISIONS LOG)
> Record only when the BA/PO has decided. If `Người phê duyệt` (approver) or `Ngày chốt` (date settled) is missing, the tool treats it as not settled.
> The next run applies it directly and does not ask again.

| # | Mã liên quan | Câu hỏi | Quyết định chính thức | Người phê duyệt | Ngày chốt |
|---|---|---|---|---|---|

## 9. HẰNG SỐ NGHIỆP VỤ (DOMAIN CONSTANTS)
> Only constants found in the source. Used for boundary strings and test data generation.

| Hằng số | Kiểu dữ liệu | Giá trị | Phạm vi ảnh hưởng | Nguồn (file §mục) |
|---|---|---|---|---|

## 10. MA TRẬN TRUY VẾT (TRACEABILITY MATRIX)

| Mã | Nguồn (file §mục) | Test Case IDs liên quan | Ghi chú |
|---|---|---|---|

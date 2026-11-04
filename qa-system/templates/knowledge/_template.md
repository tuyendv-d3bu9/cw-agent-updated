# <Tên Tính Năng> — Feature Knowledge

> Dữ kiện nghiệp vụ **có nguồn** của một tính năng. Mọi agent đọc file này trước khi chạy.
> Luật đọc/ghi: `qa-system/core/QA_STANDARD.md` §8. Schema bảng: §9.
>
> File được tạo tự động khi intake (hoặc `npm run knowledge:new <feature-slug>`) và **bắt đầu trống**.
> Dòng còn `<điền>` hoặc bảng chưa có dòng = chưa khai báo — agent coi như không có, không tự điền giá trị.

Feature slug: `<feature-slug>` · Nguồn tài liệu: `INPUT/<feature-slug>/` · Cập nhật lần cuối: `<điền>` · Trạng thái tổng thể: `DRAFT`

---

## 1. TỔNG QUAN TÍNH NĂNG (FEATURE OVERVIEW)
<điền — 1–2 câu, kèm nguồn>

## 2. TÁC NHÂN & PHÂN QUYỀN (ACTORS & ROLES)

| Tác nhân (Actor) | Quyền hạn trong tính năng này | Điều kiện tiên quyết | Nguồn (file §mục) |
|---|---|---|---|

## 3. QUY TẮC NGHIỆP VỤ ĐÃ XÁC NHẬN (CONFIRMED BUSINESS RULES)
> Chỉ rule **có nguồn**: tài liệu (kèm trích nguyên văn) hoặc quyết định ở Mục 8 (`knowledge §8 #n`).
> Điều chưa rõ nằm ở Mục 7.

| ID | Điều kiện | Hành vi / Kết quả | Nguồn (file §mục) | Trích nguyên văn | Trạng thái |
|---|---|---|---|---|---|

### 3b. FIELD & RÀNG BUỘC

| ID | Field | Kiểu | Bắt buộc | Ràng buộc (min/max/định dạng) | Thông báo khi sai | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|---|---|---|

## 4. LUỒNG CHÍNH (HAPPY PATH)
<điền — các bước có trong nguồn, kèm nguồn>

## 5. LUỒNG PHỤ & LỖI (ALTERNATE & ERROR FLOWS)

| ID | Tình huống | Hệ thống phản hồi (nguyên văn nếu có) | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|

## 6. NGOÀI PHẠM VI (OUT OF SCOPE)
> Chỉ những gì nguồn **nói rõ** là không làm, kèm trích nguồn. Điều tài liệu không nhắc tới là câu hỏi (Mục 7), không phải ngoài phạm vi.

| Nội dung loại trừ | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|

## 7. CÂU HỎI MỞ & KẼ HỞ 06W (OPEN QUESTIONS & MISSING RULES)
> Skill `02` thêm dòng (`New`). Cột `Phản hồi chính thức`, `Người trả lời`, `Ngày`, `Trạng thái` do **con người** điền
> (hoặc agent chép nguyên văn khi người dùng chuyển lời BA). Trạng thái: `New` → `TREO` → `Confirmed` / `Rejected` (§9.3).
> Mã `MR-xx` cấp tiếp số lớn nhất đang có — không đánh lại từ 01.

| ID | Kẽ hở | Nhóm 06W | Nguồn phát hiện | Phương án gợi ý (chưa phải rule) | Câu hỏi cho BA/PO | Phản hồi chính thức | Người trả lời | Ngày | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|

## 8. QUYẾT ĐỊNH ĐÃ CHỐT (CONFIRMED DECISIONS LOG)
> Chỉ ghi khi BA/PO đã quyết. Thiếu `Người phê duyệt` hoặc `Ngày chốt` thì tool coi là chưa chốt.
> Lần chạy sau agent áp dụng luôn, không hỏi lại.

| # | Mã liên quan | Câu hỏi | Quyết định chính thức | Người phê duyệt | Ngày chốt |
|---|---|---|---|---|---|

## 9. HẰNG SỐ NGHIỆP VỤ (DOMAIN CONSTANTS)
> Chỉ hằng số có trong nguồn. Dùng cho chuỗi biên và sinh dữ liệu test.

| Hằng số | Kiểu dữ liệu | Giá trị | Phạm vi ảnh hưởng | Nguồn (file §mục) |
|---|---|---|---|---|

## 10. MA TRẬN TRUY VẾT (TRACEABILITY MATRIX)

| Mã | Nguồn (file §mục) | Test Case IDs liên quan | Ghi chú |
|---|---|---|---|

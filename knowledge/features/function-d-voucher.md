# <Tên Tính Năng> — Feature Knowledge Template

> **BỘ NÃO TRI THỨC TÍNH NĂNG (Feature Knowledge Base)**
> File này lưu trữ toàn bộ dữ kiện nghiệp vụ ĐÃ XÁC NHẬN của tính năng.
> Mọi Agent phân tích hay thiết kế kiểm thử đều đọc file này đầu tiên để không phải hỏi lại những gì đã chốt.
>
> **Cách tạo**: Copy file này thành `knowledge/features/<feature-slug>.md` (hoặc chạy: `npm run knowledge:new <feature-slug>`).

Feature slug: `<feature-slug>` · Nguồn tài liệu: `INPUT/<file>.md` · Cập nhật lần cuối: `<YYYY-MM-DD>` · Trạng thái tổng thể: `<DRAFT | IN-REVIEW | APPROVED>`

---

## 1. TỔNG QUAN TÍNH NĂNG (FEATURE OVERVIEW)
_[Mô tả 1–2 câu tóm lược mục đích kinh doanh của tính năng và giá trị mang lại cho người dùng.]_

## 2. TÁC NHÂN & PHÂN QUYỀN (ACTORS & ROLES)
_[Xác định rõ các đối tượng tương tác và thẩm quyền nghiệp vụ.]_

| Tác nhân (Actor) | Quyền hạn trong tính năng này | Điều kiện tiên quyết (Precondition) |
|---|---|---|
| Khách vãng lai (Guest) | Xem thông tin, thêm giỏ hàng | Chưa đăng nhập |
| Khách đăng nhập (Member) | Áp dụng mã, thanh toán | Tài khoản đang Active |
| Quản trị viên (Admin) | Tạo mã, kích hoạt, thu hồi | Quyền Marketing / Sale Manager |

## 3. QUY TẮC NGHIỆP VỤ ĐÃ XÁC NHẬN (CONFIRMED BUSINESS RULES)
> **NGUYÊN TẮC VÀNG**: Chỉ đưa vào bảng này những quy tắc **ĐÃ XÁC NHẬN** (có căn cứ từ tài liệu hoặc đã được BA/PO trả lời).
> Quy tắc còn nghi vấn hoặc chưa chốt phải nằm ở Mục 7 (`OPEN QUESTIONS`).

| ID | Tóm tắt quy tắc | Chi tiết điều kiện & hành vi | Căn cứ nguồn (File/Mục) | Trạng thái |
|---|---|---|---|---|

## 4. LUỒNG CHÍNH (HAPPY PATH)
_[Mô tả luồng người dùng thao tác thành công từ đầu đến cuối.]_
1. **Bước 1**: Người dùng vào trang Thanh toán với giỏ hàng hợp lệ.
2. **Bước 2**: Nhập mã giảm giá vào ô input và nhấn nút "Áp dụng".
3. **Bước 3**: Hệ thống kiểm tra điều kiện thành công ➔ Trừ tiền chiết khấu ➔ Cập nhật tổng tiền thanh toán mới.

## 5. LUỒNG NGOẠI LỆ & LỖI (ALTERNATE & ERROR FLOWS)
_[Các trường hợp lỗi người dùng, lỗi hệ thống và cách phản hồi.]_
- **E1 - Mã hết hạn**: Hiển thị thông báo *"Mã giảm giá đã hết hạn sử dụng"*, giữ nguyên tiền hàng.
- **E2 - Chưa đạt giá trị tối thiểu**: Hiển thị *"Đơn hàng cần tối thiểu X VNĐ để áp dụng mã này"*.
- **E3 - Tài khoản đã hết lượt dùng**: Báo lỗi *"Bạn đã sử dụng mã này rồi"*.

## 6. NGOÀI PHẠM VI (OUT OF SCOPE)
_[Những gì tính năng này KHÔNG làm, để tránh vẽ thêm việc không cần thiết (YAGNI).]_
- Không áp dụng đồng thời nhiều voucher trên một đơn hàng trong giai đoạn này.
- Không áp dụng giảm giá trên phí vận chuyển.

## 7. CÂU HỎI MỞ & KẼ HỞ 06W (OPEN QUESTIONS & MISSING RULES)
> Thu thập các kẽ hở phát hiện qua kỹ thuật quét 06W (W1: input lạ, W2: state lạ, W3: data lạ, W4: timing, W5: who else, W6: side-effect).
> Trạng thái: `New` (mới phát hiện) ➔ `Confirmed` (BA đã trả lời) ➔ `Rejected` (Không cần xử lý).

| ID | Mô tả kẽ hở | Nhóm 06W | Mức rủi ro | Đề xuất mặc định | Câu hỏi cho BA/PO | Phản hồi chính thức | Trạng thái |
|---|---|---|---|---|---|---|---|
| MR-01 | Kiểm soát định dạng nhập liệu & Ký tự đặc biệt vào ô Voucher | W1 (What if input lạ) | CHƯA XÁC ĐỊNH | Chặn ký tự lạ, regex ^[A-Z0-9]{3,20}$, báo lỗi sai format | Có chặn ký tự lạ (ký tự đặc biệt, SQLi, space giữa) tại client không? | "chặn ký tự lạ" | Confirmed |
| MR-02 | Tự động thu hồi voucher khi giỏ hàng thay đổi không còn đạt điều kiện | W2 (What if state lạ) | CHƯA XÁC ĐỊNH | Tự động gỡ voucher + disable + hiển thị toast cảnh báo | Khi sửa giỏ hàng khiến tổng tiền tụt dưới mức sàn 200k, hệ thống xử lý ra sao? | "Hệ thống sẽ tự gỡ và disable voucher có kèm thông báo" | Confirmed |
| MR-03 | Xung đột mức sàn tối thiểu 300k (spec.txt) và cấu hình mã GIAM50K (200k) | W3 (What if data lạ) | CHƯA XÁC ĐỊNH | Mức sàn toàn hệ thống là 200.000 VNĐ (khớp web live) | Quy định mức sàn áp mã chung toàn hệ thống là 200k hay 300k? | "Mức sàn là 200k chứ không phải 300k" | Confirmed |
| MR-04 | Quy tắc làm tròn số tiền chiết khấu lẻ của voucher phần trăm (%) | W3 (What if data lạ) | CHƯA XÁC ĐỊNH | Làm tròn xuống hàng đơn vị đồng Math.floor() | Số tiền chiết khấu của voucher % được làm tròn theo nguyên tắc nào? | "Đồng ý" | Confirmed |
| MR-05 | Phòng chống tấn công gửi nhiều request liên tiếp (Debounce / Double Click) | W4 (What when timing) | CHƯA XÁC ĐỊNH | Disable nút Áp dụng và hiển thị trạng thái loading khi submit | Nút "Áp dụng" có được disable và hiển thị loading chống double-click spam không? | "Disable nuts khi đang áp dụng." | Confirmed |
| MR-06 | Kiểm soát giới hạn số lượt dùng & Khóa đồng thời (Race Condition) | W5 (Who else actor) | CHƯA XÁC ĐỊNH | Trừ hạn mức lượt dùng tại thời điểm Đặt hàng thành công | Lượt dùng voucher được trừ tại bước Áp dụng hay bước Đặt hàng thành công? | "đồng ý" | Confirmed |
| MR-07 | Chính sách hoàn trả quyền sử dụng voucher khi hủy đơn hàng | W6 (What happens after) | CHƯA XÁC ĐỊNH | Tự động phục hồi lại lượt sử dụng voucher nếu mã còn hạn | Khi hủy đơn hàng, mã voucher có được hoàn lại quyền sử dụng cho khách hàng không? | "Phục hồi lại." | Confirmed |

## 8. GIẢ ĐỊNH ĐÃ ĐƯỢC CHỐT (CONFIRMED ASSUMPTIONS LOG)
> **LỊCH SỬ QUYẾT ĐỊNH**: Khi BA/PO trả lời một câu hỏi hoặc giả định ở Mục 7, lập tức chuyển kết luận xuống bảng này.
> Lần chạy sau Agent đọc bảng này và áp dụng luôn, **tuyệt đối không hỏi lại**.

| # | Mã liên quan | Giả định ban đầu của Agent | Quyết định chính thức | Người phê duyệt | Ngày chốt |
|---|---|---|---|---|---|

## 9. HẰNG SỐ NGHIỆP VỤ (DOMAIN CONSTANTS)
> Các hằng số cụ thể phục vụ cho việc sinh dữ liệu test và ca kiểm thử biên chính xác.

| Hằng số | Kiểu dữ liệu | Giá trị quy ước | Phạm vi ảnh hưởng | Ghi chú |
|---|---|---|---|---|
| `MAX_DISCOUNT_CAP` | Tiền tệ (VNĐ) | 500.000 VNĐ | Toàn bộ mã giảm theo % | Mức trần không vượt quá |
| `BRUTE_FORCE_MAX_FAIL`| Số nguyên | 5 lần | Ô nhập mã giảm giá | Khóa tạm thời 15 phút nếu sai 5 lần |

## 10. MA TRẬN TRUY VẾT (TRACEABILITY MATRIX)
> Đảm bảo mọi quy tắc đều truy nguyên được về tài liệu gốc.

| Mã Rule | Căn cứ tài liệu gốc (File & Mục) | Test Case IDs liên quan | Ghi chú |
|---|---|---|---|

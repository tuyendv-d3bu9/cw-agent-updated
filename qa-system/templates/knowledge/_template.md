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
| BR-01 | Định dạng mã | Chữ hoa và số, dài 3-20 ký tự | Tài liệu gốc §2.1 | Confirmed |
| BR-02 | Điều kiện áp mã | Đơn hàng phải đạt giá trị tối thiểu (Min Spend) | Tài liệu gốc §2.3 | Confirmed |

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
| MR-01 | Session timeout khi đang thanh toán | W2 (State) | HIGH | Mở modal login tại chỗ, giữ nguyên mã | Khi session hết hạn, redirect hay mở modal? |  | New |
| MR-02 | Làm tròn tiền lẻ của mã % | W3 (Data) | MED | Làm tròn xuống hàng đồng | Quy tắc làm tròn số tiền chiết khấu lẻ? |  | New |

## 8. GIẢ ĐỊNH ĐÃ ĐƯỢC CHỐT (CONFIRMED ASSUMPTIONS LOG)
> **LỊCH SỬ QUYẾT ĐỊNH**: Khi BA/PO trả lời một câu hỏi hoặc giả định ở Mục 7, lập tức chuyển kết luận xuống bảng này.
> Lần chạy sau Agent đọc bảng này và áp dụng luôn, **tuyệt đối không hỏi lại**.

| # | Mã liên quan | Giả định ban đầu của Agent | Quyết định chính thức | Người phê duyệt | Ngày chốt |
|---|---|---|---|---|---|
| 1 | MR-03 | Cho phép trim khoảng trắng đầu/cuối | Tự động trim khoảng trắng 2 đầu, giữa chuỗi coi là sai format | BA Nguyễn Văn A | 2026-08-23 |
| 2 | MR-04 | Phân biệt hoa thường | Case-insensitive (tự convert sang Uppercase) | PO Trần Thị B | 2026-08-23 |

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
| BR-01 | `INPUT/PRD_Voucher.md` §2.1 | `TC-VCHR-01`, `TC-VCHR-02` |  |
| BR-02 | `INPUT/PRD_Voucher.md` §2.3 | `TC-VCHR-03` |  |

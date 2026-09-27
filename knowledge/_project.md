# Project Knowledge — Quy ước dùng chung cho MỌI feature

> Tri thức nền cấp **dự án**, không đổi theo từng tính năng. Mọi skill và agent đều đọc file này đầu tiên.
> Trống mục nào thì agent phải gắn `[GIẢ ĐỊNH]` khi cần tới — người dùng/BA điền dần để giảm thiểu giả định.

Dự án: `<Tên Dự Án>` · Cập nhật lần cuối: `YYYY-MM-DD`

---

## 1. Quy ước định danh
| Đối tượng | Format | Ví dụ |
|---|---|---|
| Module prefix cho `TC_ID` | `<3–5 ký tự hoa>` | `AUTH`, `CART`, `PAY`, `PROD`, `USER` |
| Mã nghiệp vụ (mã đơn, mã giao dịch…) | `[A-Z0-9]{3,20}` | `ORD123456`, `TXN-9876`, `VCHR-2026` |

## 2. Định dạng dữ liệu
| Loại | Quy ước | Ghi chú |
|---|---|---|
| Ngày / Giờ | `YYYY-MM-DD` / `YYYY-MM-DD HH:mm:ss` | Chuẩn ISO 8601, không mix định dạng khác |
| Tiền tệ | `VNĐ`, dấu chấm `.` phân cách hàng nghìn | Ví dụ `100.000 VNĐ`. Không có phần thập phân |
| Timezone | `Asia/Ho_Chi_Minh (GMT+7)` | Múi giờ chuẩn của hệ thống |
| NULL vs rỗng | Hệ thống phân biệt tường minh | Input rỗng `""` báo lỗi nhập liệu; Backend xử lý `NULL` an toàn |

## 3. Bối cảnh nghiệp vụ dùng chung
> Các thông tin bối cảnh chung của sản phẩm giúp Agent đánh giá mức độ nghiêm trọng (Severity) và rủi ro (Risk) chính xác.

| Khía cạnh | Hướng dẫn & Quy ước dự án |
|---|---|
| User Context | _[Phân nhóm người dùng: Khách vãng lai (Guest), Khách đã đăng ký (User/Customer), Quản trị viên (Admin)...]_ |
| Usage Context | _[Nền tảng: Web Responsive (Desktop/Mobile), App iOS/Android; Giờ cao điểm, lưu lượng truy cập dự kiến...]_ |
| Financial / Business Context | _[Mô hình kinh doanh: Bán lẻ, B2B, SaaS, Fintech... Phương thức thanh toán hỗ trợ, chính sách hoàn tiền...]_ |
| Operational Context | _[Tích hợp bên thứ ba: Cổng thanh toán, SMS OTP, Email, Đơn vị vận chuyển; SLA phản hồi hệ thống...]_ |
| Criticality Context | _[Các luồng nghiệp vụ sống còn (Core Flows) không được phép xảy ra lỗi: Đăng nhập, Giỏ hàng, Thanh toán...]_ |

## 4. Môi trường test
| Thuộc tính | Cấu hình / Hướng dẫn |
|---|---|
| Môi trường Staging / Test | _[URL môi trường test: ví dụ https://staging.example.com/]_ |
| Cách seed data | _[SQL script trực tiếp, API Fixtures, hoặc qua UI Admin...]_ |
| Cổng xác thực (Auth Gate) | _[Quy tắc đăng nhập: ví dụ bắt buộc đăng nhập ở bước checkout, hoặc session timeout sau 30 phút...]_ |
| Tài khoản kiểm thử cố định | _[Tài khoản test chuẩn: user / pass để automation thực thi...]_ |
| Quy định dữ liệu | Sử dụng dữ liệu Sandbox / Anonymized Data, tuyệt đối không dùng thông tin cá nhân thật của khách hàng |

## 5. Test Management Tool & ALM Integration
### 5.1. Jira Xray (Khuyến nghị)
| Thuộc tính | Cấu hình chuẩn | Ý nghĩa / Ghi chú |
|---|---|---|
| Issue Type | `Test` | Loại issue đại diện cho Test Case trong Jira Xray |
| Summary Format | `[<TC_ID>] <Title>` | Ví dụ: `[AUTH-001] Verify đăng nhập thành công với email hợp lệ` |
| Manual Steps | `Action`, `Data`, `Expected Result` | 3 cột chuẩn của bảng Manual Test Step trong Xray |
| Preconditions | `Preconditions` (Text/Wiki) | Tiền điều kiện trước khi thực hiện test |
| Priority | `Blocker`, `Critical`, `High`, `Medium`, `Low` | Mức độ ưu tiên thực thi |
| Labels | `Rule#BR-xx`, `Viewpoint#VP-xx`, `Module#<MOD>` | Phục vụ truy xuất nguồn gốc (Traceability) |
| File xuất | `OUTPUT/<slug>/export_jira_xray.csv` | Mã hóa UTF-8 BOM, sẵn sàng cho Xray Test Importer |

### 5.2. Redmine
| Thuộc tính | Cấu hình chuẩn | Ý nghĩa / Ghi chú |
|---|---|---|
| Tracker | `Test Case` (hoặc `Feature` / `Task`) | Phân loại issue trong Redmine |
| Subject | `[<TC_ID>] <Title>` | Tiêu đề test case |
| Priority | `Urgent` (High), `Normal` (Medium), `Low` (Low) | Mức độ ưu tiên chuẩn của Redmine |
| Category | Mã module (`AUTH`, `PAY`...) | Gom nhóm test case theo phân hệ |
| Status | `New` | Trạng thái ban đầu |
| Description | Đầy đủ Preconditions, Steps, Data, Expected Result | Định dạng Textile / Markdown của Redmine |
| File xuất | `OUTPUT/<slug>/export_redmine.csv` | Mã hóa UTF-8 BOM |

## 6. Ràng buộc riêng của dự án
> Ghi chú các quy tắc nghiệp vụ đặc thù áp dụng xuyên suốt toàn bộ hệ thống (nếu có).
- _[Quy tắc 1: Ví dụ - Ô nhập text tự động trim() khoảng trắng đầu và cuối chuỗi]_
- _[Quy tắc 2: Ví dụ - Cơ chế phòng thủ brute-force hoặc rate-limit cho các luồng nhạy cảm: 5 lần sai / 5 phút tạm khóa]_

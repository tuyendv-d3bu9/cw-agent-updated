# Project Knowledge — Quy ước dùng chung cho MỌI feature

> Tri thức nền cấp **dự án**, không đổi theo từng tính năng. Mọi skill và agent đều đọc file này đầu tiên.
> Trống mục nào thì agent phải gắn `[GIẢ ĐỊNH]` khi cần tới — người dùng/BA điền dần để giảm thiểu giả định.

Dự án: `ShopGo` · Cập nhật lần cuối: `2026-10-01`

---

## 1. Quy ước định danh
| Đối tượng | Format | Ví dụ |
|---|---|---|
| Module prefix cho `TC_ID` | `<3–5 ký tự hoa>` | `AUTH`, `CART`, `PAY`, `PROD`, `VOUCH` |
| Mã nghiệp vụ (mã đơn, mã giao dịch…) | `[A-Z0-9]{3,20}` | `ORD123456`, `TXN-9876`, `VOUCHER10K` |

## 2. Định dạng dữ liệu
| Loại | Quy ước | Ghi chú |
|---|---|---|
| Ngày / Giờ | `YYYY-MM-DD` / `YYYY-MM-DD HH:mm:ss` | Chuẩn ISO 8601, không mix định dạng khác |
| Tiền tệ | `VNĐ`, dấu chấm `.` phân cách hàng nghìn | Ví dụ `100.000 VNĐ`. Không có phần thập phân |
| Viết tắt `k` / `K` trong số tiền | **`k` = nghìn đồng**: `200k` = `200.000 ₫`, `50K` = `50.000 ₫` | Chỉ là cách nói tắt (thường do QA/BA ghi vội). **Khi sinh test data, test case, dataset luôn viết đủ số** `200.000 ₫`, không được đọc `200k` thành `200 ₫`. Chữ `K` trong mã voucher (vd `GIAM50K`) là một phần của mã, không phải số tiền |
| Timezone | `Asia/Ho_Chi_Minh (GMT+7)` | Múi giờ chuẩn của hệ thống |
| NULL vs rỗng | Chỉ kiểm được ở tầng UI | Input rỗng `""` hoặc chỉ khoảng trắng ➔ báo lỗi nhập liệu. **Không có API/backend** nên không có ca gửi `null` qua API |

## 3. Bối cảnh nghiệp vụ dùng chung
> Trích xuất từ tài liệu tổng quan ShopGo (01_business)

| Khía cạnh | Nội dung đặc thù ShopGo |
|---|---|
| User Context | Khách mua hàng tại Việt Nam. Khách vãng lai (Guest - xem hàng, thêm vào giỏ, phải đăng nhập khi thanh toán) và Khách hàng (Customer - đã đăng ký, có Ví ShopGo, lịch sử đơn hàng). |
| Usage Context | Web app responsive (Desktop & Mobile Web); hỗ trợ Chrome, Edge, Safari. Ngôn ngữ tiếng Việt. |
| Financial / Business Context | Bán lẻ trực tuyến (general retail). Thanh toán: COD, Thẻ (bên thứ ba), Ví ShopGo. Mã giảm giá Voucher (% hoặc tiền cố định VND, có min order value, max discount cap). Đơn vị tiền tệ VNĐ. |
| Operational Context | Tích hợp cổng thanh toán thẻ, dịch vụ Email/SMS xác nhận, đơn vị vận chuyển tính phí ship. SLA trang chính tải < 3s. |
| Criticality Context | Các luồng mua hàng, giỏ hàng, áp mã giảm giá và thanh toán là luồng sống còn (Core Flows). |

## 4. Môi trường test
| Thuộc tính | Cấu hình / Hướng dẫn |
|---|---|
| Môi trường Staging / Test | `https://cwshopgo.github.io/` (Ứng dụng Web Live) |
| Kiến trúc | **SPA thuần frontend, không có backend, không có API**. Đơn hàng lưu `localStorage["shopgo_orders"]`, phiên đăng nhập `localStorage["shopgo_user"]`; giỏ hàng & voucher chỉ nằm trong bộ nhớ phiên. **Không thiết kế ca kiểm thử API / HTTP status / DB** |
| Phí vận chuyển | `30.000 ₫`; **miễn phí khi tiền hàng từ `200.000 ₫` trở lên** (hoặc giỏ trống) |
| Catalog | 6 sản phẩm, giá đều là bội số `10.000 ₫`: 120.000 / 150.000 / 190.000 / 200.000 / 280.000 / 350.000 ₫. Mốc tiền trong test phải tạo được từ tổ hợp các giá này |
| Cách seed data | Đã tích hợp sẵn dữ liệu mẫu (mock products & preset vouchers: GIAM50K, SALE20, HETHAN) |
| Cổng xác thực (Auth Gate) | Bắt buộc đăng nhập để truy cập trang Thanh toán và Đặt hàng. Khách vãng lai bấm "Thanh toán" sẽ kích hoạt modal đăng nhập (`#modal-auth`). |
| Tài khoản kiểm thử cố định | 1. Chuẩn: `khachhang@shopgo.vn` / `123456` (Nguyễn Văn An)<br>2. VIP: `vip@shopgo.vn` / `123456` (Trần Thị Mai) |
| Có được dùng dữ liệu giống production? | Sử dụng dữ liệu sandbox / demo nội bộ |

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

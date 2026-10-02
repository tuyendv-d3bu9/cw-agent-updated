# Project Knowledge — quy ước dùng cho MỌI feature

> Tri thức nền cấp **dự án**, không đổi theo từng tính năng. Mọi skill đọc file này.
> Trống mục nào thì agent phải gắn `[GIẢ ĐỊNH]` khi cần tới — điền dần để giảm giả định.

Dự án: `<Tên Dự Án>` · Cập nhật lần cuối: `<YYYY-MM-DD>`

---

## 1. Quy ước định danh
| Đối tượng | Format | Ví dụ |
|---|---|---|
| Module prefix cho `TC_ID` | `<3–4 ký tự hoa>` | `AUTH`, `CART`, `PAY`, `PROD` |
| Mã nghiệp vụ (mã đơn, mã giao dịch…) | `[A-Z0-9]{3,20}` | `ORD123456`, `TXN-9876` |

## 2. Định dạng dữ liệu
| Loại | Quy ước | Ghi chú |
|---|---|---|
| Ngày / Giờ | `YYYY-MM-DD` / `YYYY-MM-DD HH:mm:ss` | Chuẩn ISO 8601, không mix định dạng khác |
| Tiền tệ | `VNĐ`, dấu chấm `.` phân cách hàng nghìn | Ví dụ `100.000 VNĐ`. Không có phần thập phân (hoặc tùy dự án) |
| Timezone | `Asia/Ho_Chi_Minh (GMT+7)` | Múi giờ chuẩn của hệ thống |
| NULL vs rỗng | Hệ thống phân biệt tường minh | Input rỗng `""` báo lỗi nhập liệu; Backend xử lý `NULL` an toàn |

## 3. Bối cảnh nghiệp vụ dùng chung
> Các mục mà skill `01` hay phải gắn `[CONTEXT_MISSING]`. Điền được thì báo cáo rủi ro chính xác hơn.

| Khía cạnh | Hướng dẫn / Nội dung mẫu |
|---|---|
| User Context | Khách hàng cá nhân / doanh nghiệp; người dùng vãng lai (Guest) vs người dùng định danh (Registered) |
| Usage Context | Web responsive (Desktop & Mobile Web) hoặc Mobile App / API backend |
| Financial / Business Context | Quy trình thanh toán, xử lý hóa đơn, chính sách giá, chiết khấu hoặc hạch toán |
| Operational Context | SLA phản hồi API, luồng background job, cơ chế retry khi timeout |
| Criticality Context | Các luồng sống còn (Core Flow) của hệ thống cần độ tin cậy tuyệt đối |

## 4. Môi trường test
| Thuộc tính | Nội dung |
|---|---|
| Môi trường | `Staging / Test / UAT` |
| Cách seed data | `SQL script trực tiếp`, `API Fixtures`, hoặc qua UI Admin |
| Có được dùng dữ liệu giống production? | Sử dụng dữ liệu đã ẩn danh hóa (anonymized data) tuân thủ bảo mật |

## 5. Test Management Tool & ALM Integration
### 5.1. Jira Xray (Khuyến nghị)
| Thuộc tính | Cấu hình chuẩn | Ý nghĩa / Ghi chú |
|---|---|---|
| Issue Type | `Test` | Loại issue đại diện cho Test Case trong Xray |
| Summary Format | `[<TC_ID>] <Title>` | Ví dụ: `[AUTH-001] Verify đăng nhập thành công...` |
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
- _[Quy tắc 2: Ví dụ - Cơ chế phòng thủ brute-force hoặc rate-limit cho các luồng nhạy cảm]_

# DATA VALIDATION & TRACEABILITY MATRIX — FUNCTION-A (ĐĂNG NHẬP / AUTHENTICATION)

> **Bộ phận**: `qa-system/qa-test-data` · **Kỹ năng**: `data-validation-traceability.md`
> **Nguồn đối chiếu**: `knowledge/features/function-a.md`, `05_test_case_spec.md` (18 TCs)
> **Phiên bản**: v1.0 (2026-10-04)

---

## 1. Kết Quả Thẩm Định Dữ Liệu

- **Review Verdict**: `PASS`
- **Tóm tắt dữ liệu**: Bộ dữ liệu kiểm thử gồm 2 tài khoản demo chuẩn (`vip@shopgo.vn` / `123456`, `khachhang@shopgo.vn` / `123456`), các bộ dữ liệu phủ định (sai pass, sai email, để trống), và các bộ dữ liệu biên (khoảng trắng, hoa/thường). Mọi dữ liệu đều khả dụng và tái hiện được trên môi trường ShopGo.

| # | Nhóm dữ liệu | Số record | Logic & format | Quy tắc nghiệp vụ | Kết luận |
|---|---|:---:|---|---|:---:|
| 1 | Tài khoản hợp lệ (Valid) | 2 | VIP và Khách thường | Khớp BR-AUTH-01, BR-AUTH-02, BR-AUTH-07 | **PASS** |
| 2 | Dữ liệu phủ định (Negative) | 6 | Sai email, sai pass, ô trống | Khớp BR-AUTH-04, BR-AUTH-05 | **PASS** |
| 3 | Dữ liệu biên & format (Boundary) | 2 | Khoảng trắng, ký tự in hoa | Khớp BR-AUTH-01, MR-05 | **PASS** |
| 4 | Dữ liệu bảo mật & phiên (Security/Session) | 4 | localStorage, session switch, brute-force | Khớp BR-AUTH-03, BR-AUTH-06, BR-AUTH-08 | **PASS** |
| 5 | Dữ liệu giao diện (UX/UI) | 4 | Modal controls, enter key, F5 refresh | Khớp BR-AUTH-01, BR-AUTH-03 | **PASS** |

---

## 2. FACT Check

| Tiêu chuẩn | Nội dung | Kết quả | Minh chứng |
|:---:|---|:---:|---|
| **F** | Giá trị lấy đúng cấu hình thật | **PASS** | Dùng đúng 2 tài khoản `vip@shopgo.vn` và `khachhang@shopgo.vn` cấu hình trong hệ thống |
| **A** | Tính toán và định dạng | **PASS** | Thông báo lỗi chính xác từng ký tự: `"Email hoặc mật khẩu không chính xác."`, `"Vui lòng nhập đầy đủ thông tin."` |
| **C** | Đủ các Data Classes | **PASS** | Valid, Negative, Boundary, Security, Usability |
| **T** | Kỳ vọng nhị phân | **PASS** | Mỗi test case có điều kiện Pass/Fail rõ ràng |

---

## 3. Ma Trận Truy Vết Dữ Liệu ↔ Ca Kiểm Thử

| Test Case ID | Test Case Title | Record | Loại Data | Giá trị tái hiện |
|---|---|---|:---:|---|
| `AUTH-001` | Verify đăng nhập thành công với tài khoản Khách thường | `DS-AUTH-01` | Valid | `khachhang@shopgo.vn` / `123456` ➔ `Nguyễn Văn An` |
| `AUTH-002` | Verify đăng nhập thành công với tài khoản VIP và hiển thị nhãn VIP | `DS-AUTH-02` | Valid | `vip@shopgo.vn` / `123456` ➔ `Trần Thị Mai (VIP)` |
| `AUTH-003` | Verify đăng nhập tự động điền bằng nút Demo Accounts | `DS-AUTH-02` | UI Action | Nút Demo Account VIP ➔ Tự điền và đăng nhập |
| `AUTH-004` | Verify đăng nhập thành công từ luồng chặn khi cố gắng vào màn hình Thanh toán | `DS-AUTH-01` | Integration | Chặn tại Checkout ➔ Đăng nhập ➔ Chuyển hướng Checkout |
| `AUTH-005` | Verify từ chối đăng nhập khi nhập sai mật khẩu | `DS-AUTH-NEG-01` | Negative | `khachhang@shopgo.vn` / `wrongpass` ➔ Lỗi "Email hoặc mật khẩu..." |
| `AUTH-006` | Verify từ chối đăng nhập khi nhập email chưa đăng ký trên hệ thống | `DS-AUTH-NEG-02` | Negative | `chuadk@shopgo.vn` / `123456` ➔ Lỗi "Email hoặc mật khẩu..." |
| `AUTH-007` | Verify hệ thống chặn submit khi để trống cả email và mật khẩu | `DS-AUTH-NEG-03` | Null/Empty | `""` / `""` ➔ "Vui lòng nhập đầy đủ thông tin." |
| `AUTH-008` | Verify hệ thống chặn submit khi chỉ nhập mật khẩu mà bỏ trống email | `DS-AUTH-NEG-04` | Null/Empty | `""` / `123456` ➔ "Vui lòng nhập đầy đủ thông tin." |
| `AUTH-009` | Verify hệ thống chặn submit khi chỉ nhập email mà bỏ trống mật khẩu | `DS-AUTH-NEG-05` | Null/Empty | `khachhang@shopgo.vn` / `""` ➔ "Vui lòng nhập đầy đủ thông tin." |
| `AUTH-010` | Verify hệ thống xử lý khi nhập email sai định dạng (thiếu ký tự @) | `DS-AUTH-NEG-06` | Invalid Format | `khachhangshopgo.vn` / `123456` ➔ Báo lỗi format |
| `AUTH-011` | Verify tự động loại bỏ khoảng trắng thừa ở hai đầu địa chỉ email | `DS-AUTH-BND-01` | Boundary (Trim) | `"  khachhang@shopgo.vn  "` / `123456` ➔ Đăng nhập thành công |
| `AUTH-012` | Verify đăng nhập thành công khi email nhập chữ in hoa toàn bộ | `DS-AUTH-BND-02` | Boundary (Case) | `"VIP@SHOPGO.VN"` / `123456` ➔ Đăng nhập thành công |
| `AUTH-013` | Verify trường mật khẩu được che giấu (masking) khi nhập liệu | `DS-AUTH-SEC-01` | Security | `type="password"`, hiển thị dấu chấm |
| `AUTH-014` | Verify chuyển đổi giữa hai tài khoản không bị lẫn lộn danh tính người dùng | `DS-AUTH-SEC-02` | Security (Isolation) | Logout A ➔ Login B ➔ Đúng tên B, sạch phiên A |
| `AUTH-015` | Confirm hệ thống duy trì hoạt động ổn định khi nhập sai mật khẩu nhiều lần liên tiếp | `DS-AUTH-SEC-03` | Stress/Negative | Thử sai 5 lần liên tiếp ➔ Giao diện ổn định |
| `AUTH-016` | Confirm submit form đăng nhập bằng phím Enter tại ô Mật khẩu | `DS-AUTH-UX-01` | Usability | Nhấn phím Enter ➔ Submit form tự động |
| `AUTH-017` | Verify đóng modal đăng nhập mà không làm thay đổi trạng thái trang | `DS-AUTH-UX-02` | Usability | Click nút X / backdrop ➔ Đóng modal |
| `AUTH-018` | Verify khôi phục phiên đăng nhập khi làm mới trang (F5) và điều hướng về trang chủ khi đăng xuất | `DS-AUTH-INT-01` | State Transition | F5 giữ `shopgo_user`, Logout xóa phiên quay về shop |

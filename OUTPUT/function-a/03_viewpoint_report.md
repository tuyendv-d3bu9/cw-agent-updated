# BÁO CÁO PHÂN TÍCH VIEWPOINT KIỂM THỬ — CHỨC NĂNG ĐĂNG NHẬP (function-a)
Owner: qa-system/qa-analyst/viewpoint-selection · Nguồn: OUTPUT/function-a/01_requirement_risk_summary.md · OUTPUT/function-a/02_missing_rule_report.md · Verdict: PASS

---

## 1. CHIẾN LƯỢC ĐỘ PHỦ THEO RỦI RO

### 1.1 Ma trận Ưu tiên Rủi ro (Likelihood × Impact)
| # | Risk Area | Likelihood | Impact | Mức ưu tiên | Nguồn (Rule/Missing Rule) |
|:---|:---|:---:|:---:|:---:|:---|
| RK-01 | Nhầm lẫn danh tính hiển thị (Đăng nhập A hiển thị tên B) | Thấp | Cao | **Ưu tiên 1** | BR-AUTH-02 |
| RK-02 | Chặn luồng mua hàng do không đăng nhập được tài khoản hợp lệ | Thấp | Cao | **Ưu tiên 1** | BR-AUTH-01, AF-02 |
| RK-03 | Thông báo lỗi không chính xác hoặc không báo lỗi khi sai pass/email | Cao | TB | **Ưu tiên 2** | BR-AUTH-04, MR-01, MR-02 |
| RK-04 | Không validate để trống trường Email/Mật khẩu | TB | TB | **Ưu tiên 2** | BR-AUTH-05, MR-03 |
| RK-05 | Lỗi phiên làm việc (Mất phiên khi F5 hoặc rò rỉ sau Logout) | TB | Cao | **Ưu tiên 1** | BR-AUTH-03, BR-AUTH-08, MR-04, MR-08 |
| RK-06 | Lỗi khoảng trắng thừa khi copy-paste email | Cao | Thấp | **Ưu tiên 3** | MR-05 |
| RK-07 | Tần suất đăng nhập sai liên tục (Brute-force) | Thấp | Thấp | **Ưu tiên 3** | BR-AUTH-06, MR-06 |

### 1.2 Xếp hạng ưu tiên & loại test cần làm
1. **Ưu tiên 1 (Blocker / Critical)**: 
   - Kiểm tra tính đúng đắn danh tính hiển thị và quyền hạn giữa VIP (`Trần Thị Mai (VIP)`) và Thường (`Nguyễn Văn An`). *Loại test*: Functional / Equivalence Partitioning.
   - Quản lý phiên (`shopgo_user` trong `localStorage`), phục hồi sau F5 và dọn dẹp sau Logout. *Loại test*: State Transition Testing.
2. **Ưu tiên 2 (High / Major)**: 
   - Xác thực ca lỗi sai mật khẩu, sai email, để trống form với chuỗi thông báo nguyên văn chuẩn FACT. *Loại test*: Negative Testing / Error Guessing.
3. **Ưu tiên 3 (Medium / Low)**: 
   - Xử lý khoảng trắng email, chữ hoa/thường, trải nghiệm chọn Demo Accounts. *Loại test*: Boundary Value Analysis / Usability.

### 1.3 Liên kết Risk → Viewpoint
- **RK-01, RK-02** ➔ Phủ bởi **VP-01: Happy Path**
- **RK-03, RK-04** ➔ Phủ bởi **VP-02: Negative**
- **RK-06** ➔ Phủ bởi **VP-03: Boundary**
- **RK-05, RK-07** ➔ Phủ bởi **VP-04: Security** và **VP-06: Integration**
- **Trải nghiệm Demo accounts, phím tắt Enter** ➔ Phủ bởi **VP-05: UX/Usability**

---

## 2. TỔNG QUAN LỰA CHỌN VIEWPOINT
| STT | Mã VP | Tên Viewpoint | Mức rủi ro | Nguồn | Lý do lựa chọn |
|:---|:---|:---|:---|:---|:---|
| 1 | `VP-01` | **Happy Path** | High | Registry | Đảm bảo 2 tài khoản test đăng nhập thành công và hiển thị chính xác tên người dùng. |
| 2 | `VP-02` | **Negative** | High | Registry | Đảm bảo hệ thống báo đúng câu `"Email hoặc mật khẩu không chính xác."` và `"Vui lòng nhập đầy đủ thông tin."`. |
| 3 | `VP-03` | **Boundary** | Med | Registry | Kiểm tra khả năng tự động trim khoảng trắng và không phân biệt hoa thường khi nhập email. |
| 4 | `VP-04` | **Security** | High | Registry | Kiểm tra cô lập dữ liệu người dùng, tính toàn vẹn phiên `localStorage`, không để lẫn tài khoản A và B. |
| 5 | `VP-05` | **UX/Usability** | Low | Registry | Kiểm tra nút chuyển đổi nhanh tài khoản demo, hành vi đóng mở modal và tương tác bàn phím. |
| 6 | `VP-06` | **Integration** | Med | Registry | Kiểm tra luồng tương tác giữa Modal Đăng nhập với Header, Trang chủ, Màn Thanh toán và Giỏ hàng khi đăng xuất. |

---

## 3. ĐẶC TẢ CHI TIẾT CÁC VIEWPOINT

### Viewpoint 01: VP-01: Happy Path
- **Mã Viewpoint**: `VP-01`
- **Tên Viewpoint**: Happy Path
- **Mục tiêu kiểm thử**: Xác minh luồng đăng nhập thành công tiêu chuẩn với 2 tài khoản hợp lệ, hiển thị đúng tên và vai trò.
- **Phạm vi bao phủ (In-scope)**:
  - Đăng nhập bằng tài khoản VIP (`vip@shopgo.vn` / `123456`) ➔ hiển thị `Trần Thị Mai (VIP)`.
  - Đăng nhập bằng tài khoản thường (`khachhang@shopgo.vn` / `123456`) ➔ hiển thị `Nguyễn Văn An`.
  - Đăng nhập nhanh qua nút Demo Accounts (`#btn-toggle-demo-accounts`).
  - Đăng nhập từ cổng chặn Thanh toán (`#btn-nav-checkout`) ➔ điều hướng đúng vào Checkout sau khi đăng nhập.
- **Phạm vi loại trừ (Out-of-scope)**:
  - Các trường hợp nhập sai mật khẩu, để trống (thuộc Negative).
- **Rủi ro nếu bỏ qua**: Người dùng không thể đăng nhập hoặc bị gắn sai danh tính, gây chặn đứng toàn bộ chức năng mua hàng.
- **Ước lượng định tính Test Idea**: Trung bình (bao phủ đủ 2 tài khoản × 2 luồng vào modal).

---

### Viewpoint 02: VP-02: Negative
- **Mã Viewpoint**: `VP-02`
- **Tên Viewpoint**: Negative
- **Mục tiêu kiểm thử**: Xác minh hệ thống xử lý từ chối và báo lỗi chuẩn xác khi dữ liệu đầu vào không hợp lệ hoặc không khớp.
- **Phạm vi bao phủ (In-scope)**:
  - Nhập đúng email nhưng sai mật khẩu ➔ Báo lỗi `"Email hoặc mật khẩu không chính xác."`.
  - Nhập email không tồn tại trên hệ thống ➔ Báo lỗi `"Email hoặc mật khẩu không chính xác."`.
  - Để trống trường Email hoặc Mật khẩu hoặc cả hai ➔ Báo lỗi `"Vui lòng nhập đầy đủ thông tin."`.
  - Email sai cú pháp định dạng (ví dụ thiếu `@`, không có domain).
- **Phạm vi loại trừ (Out-of-scope)**:
  - Các ca nhập email có khoảng trắng hợp lệ sau khi trim (thuộc Boundary).
- **Rủi ro nếu bỏ qua**: Hệ thống im lặng hoặc sập lỗi không xử lý (crash JS), gây hoang mang cho người dùng.
- **Ước lượng định tính Test Idea**: Cao (nhiều tổ hợp input sai, khuyết thiếu).

---

### Viewpoint 03: VP-03: Boundary
- **Mã Viewpoint**: `VP-03`
- **Tên Viewpoint**: Boundary
- **Mục tiêu kiểm thử**: Kiểm tra khả năng xử lý định dạng biên của trường email và mật khẩu.
- **Phạm vi bao phủ (In-scope)**:
  - Email có khoảng trắng thừa ở đầu hoặc cuối chuỗi (ví dụ `" vip@shopgo.vn "`).
  - Email nhập chữ in hoa toàn bộ (`"VIP@SHOPGO.VN"`) hoặc xen kẽ hoa thường.
  - Mật khẩu có độ dài tối thiểu, ký tự đặc biệt.
- **Phạm vi loại trừ (Out-of-scope)**:
  - Email sai hoàn toàn cấu trúc không thể nhận dạng (thuộc Negative).
- **Rủi ro nếu bỏ qua**: Khách hàng nhập đúng tài khoản nhưng bị từ chối do bàn phím tự thêm khoảng trắng hoặc viết hoa chữ cái đầu.
- **Ước lượng định tính Test Idea**: Thấp (tập trung vào chuẩn hóa chuỗi).

---

### Viewpoint 04: VP-04: Security
- **Mã Viewpoint**: `VP-04`
- **Tên Viewpoint**: Security
- **Mục tiêu kiểm thử**: Đảm bảo an toàn thông tin danh tính, cô lập phiên và ngăn chặn truy cập trái phép.
- **Phạm vi bao phủ (In-scope)**:
  - Trường mật khẩu phải được che giấu (`type="password"`).
  - Đăng xuất tài khoản A và đăng nhập tài khoản B ➔ Không rò rỉ dữ liệu hoặc tên hiển thị của tài khoản A sang tài khoản B.
  - Thử đăng nhập sai nhiều lần liên tiếp (xác minh hệ thống không bị crash hoặc tràn bộ nhớ).
- **Phạm vi loại trừ (Out-of-scope)**:
  - Chống Brute-force nâng cao hay CAPTCHA (do tài liệu xác nhận hiện tại chưa triển khai).
- **Rủi ro nếu bỏ qua**: Lộ mật khẩu khi thao tác hoặc nhầm lẫn dữ liệu cá nhân giữa các người dùng.
- **Ước lượng định tính Test Idea**: Trung bình.

---

### Viewpoint 05: VP-05: UX/Usability
- **Mã Viewpoint**: `VP-05`
- **Tên Viewpoint**: UX/Usability
- **Mục tiêu kiểm thử**: Đảm bảo giao diện modal thân thiện, hỗ trợ thao tác nhanh và phản hồi trực quan.
- **Phạm vi bao phủ (In-scope)**:
  - Đóng mở modal đăng nhập qua nút tắt (Close) hoặc click ra ngoài overlay.
  - Sử dụng phím Enter tại ô input để submit form đăng nhập thay vì phải click chuột.
  - Nút danh sách Demo Accounts (`#btn-toggle-demo-accounts`) đóng/mở mượt mà và tự điền dữ liệu chính xác vào các ô input.
- **Phạm vi loại trừ (Out-of-scope)**:
  - Kiểm thử sâu về độ tương thích CSS/Font chữ (thuộc UI review).
- **Rủi ro nếu bỏ qua**: Trải nghiệm người dùng kém, thao tác khó khăn trên các thiết bị khác nhau.
- **Ước lượng định tính Test Idea**: Thấp.

---

### Viewpoint 06: VP-06: Integration
- **Mã Viewpoint**: `VP-06`
- **Tên Viewpoint**: Integration
- **Mục tiêu kiểm thử**: Kiểm tra sự phối hợp đồng bộ giữa trạng thái đăng nhập với các thành phần khác của sàn ShopGo.
- **Phạm vi bao phủ (In-scope)**:
  - Khôi phục phiên đăng nhập khi làm mới trang (F5) dựa trên `localStorage` (`shopgo_user`).
  - Khi Đăng xuất (`#btn-logout`): Xóa phiên, điều hướng về trang chủ và không hiển thị giỏ hàng (theo BR-AUTH-08).
  - Tự động chuyển màn hình Checkout sau khi đăng nhập thành công từ luồng chặn thanh toán (`authRedirectTab`).
- **Phạm vi loại trừ (Out-of-scope)**:
  - Kiểm thử logic tính tiền chi tiết trong giỏ hàng (thuộc phân hệ Cart/Checkout).
- **Rủi ro nếu bỏ qua**: Đứt gãy luồng người dùng giữa đăng nhập và thanh toán đơn hàng.
- **Ước lượng định tính Test Idea**: Trung bình.

---

## 4. MA TRẬN ZERO-OVERLAP
| Viewpoint A | Viewpoint B | Điểm nguy cơ giao thoa | Ranh giới phân định |
|:---|:---|:---|:---|
| Happy Path | Integration | Luồng đăng nhập xong chuyển sang Checkout | Happy Path kiểm tra đăng nhập thành công và kích hoạt chuyển màn; Integration kiểm tra trạng thái duy trì phiên và dữ liệu giỏ hàng |
| Negative | Boundary | Nhập email có khoảng trắng hoặc format lạ | Negative chịu trách nhiệm các ca nhập sai cấu trúc dẫn tới báo lỗi; Boundary chịu trách nhiệm các ca hợp lệ sau khi trim/lowercase |
| Security | Happy Path | Đăng nhập tài khoản VIP | Happy Path kiểm tra hiển thị đúng nhãn `Trần Thị Mai (VIP)`; Security kiểm tra cô lập session, không bị lẫn với tài khoản thường |
| Security | Integration | Xử lý dữ liệu khi Đăng xuất | Security kiểm tra xóa sạch token/thông tin định danh; Integration kiểm tra điều hướng về trang chủ và trạng thái giỏ hàng |

---

## 5. XÁC NHẬN BÀN GIAO
- [x] Mọi Risk Area ưu tiên cao đã ánh xạ tới viewpoint tương ứng.
- [x] Chọn đủ 6 viewpoint phù hợp nhất theo rủi ro từ registry chuẩn.
- [x] Tên viewpoint tuân thủ 100% registry chuẩn.
- [x] Ma trận Zero-Overlap phân định rạch ròi phạm vi In/Out scope.
- [x] Không sinh test case chi tiết tại chặng này.

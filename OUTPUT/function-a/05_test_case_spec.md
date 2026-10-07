# ĐẶC TẢ CHI TIẾT TEST CASE (TEST CASE SPECIFICATION) · function-a
Owner: qa-system/qa-test-design/test-case-generation · Nguồn: OUTPUT/function-a/04_test_idea_report.md · Verdict: PASS

---

### TC_ID: AUTH-001
- **Title**: Verify đăng nhập thành công với tài khoản Khách thường
- **Precondition**:
  - Trình duyệt truy cập `https://cwshopgo.github.io`
  - Người dùng ở trạng thái khách vãng lai (chưa đăng nhập)
  - `localStorage` đã xóa sạch phiên đăng nhập cũ
- **Test Steps**:
  1. Click vào nút "Đăng nhập" `#btn-header-login` trên Header
  2. Nhập email `khachhang@shopgo.vn` vào ô `getByPlaceholder('Nhập email...')`
  3. Nhập mật khẩu `123456` vào ô `getByPlaceholder('Nhập mật khẩu...')`
  4. Click nút xác nhận Đăng nhập trong modal
- **Test Data**:
  - Email: `khachhang@shopgo.vn`
  - Mật khẩu: `123456`
- **Expected Result**:
  - Modal đăng nhập đóng lại
  - Nút `#btn-header-login` biến mất
  - Nút `#btn-user-profile` hiển thị tên chính xác `Nguyễn Văn An`
  - Khóa `shopgo_user` trong `localStorage` được cập nhật thông tin tài khoản thường
- **Priority**: High
- **Tags**: Rule#BR-AUTH-01, Rule#BR-AUTH-02, Viewpoint#VP-01, Module#AUTH, Automated

---

### TC_ID: AUTH-002
- **Title**: Verify đăng nhập thành công với tài khoản VIP và hiển thị nhãn VIP
- **Precondition**:
  - Trình duyệt truy cập `https://cwshopgo.github.io`
  - Người dùng ở trạng thái chưa đăng nhập
- **Test Steps**:
  1. Click vào nút "Đăng nhập" `#btn-header-login` trên Header
  2. Nhập email `vip@shopgo.vn` vào ô Email
  3. Nhập mật khẩu `123456` vào ô Mật khẩu
  4. Click nút xác nhận Đăng nhập
- **Test Data**:
  - Email: `vip@shopgo.vn`
  - Mật khẩu: `123456`
- **Expected Result**:
  - Đăng nhập thành công và modal đóng lại
  - Header hiển thị nút `#btn-user-profile` với tên và huy hiệu `Trần Thị Mai (VIP)`
  - Không hiển thị tên của tài khoản khách hàng thường
- **Priority**: High
- **Tags**: Rule#BR-AUTH-01, Rule#BR-AUTH-02, Rule#BR-AUTH-07, Viewpoint#VP-01, Module#AUTH, Automated

---

### TC_ID: AUTH-003
- **Title**: Verify đăng nhập tự động điền bằng nút Demo Accounts
- **Precondition**:
  - Trình duyệt truy cập `https://cwshopgo.github.io` ở trạng thái chưa đăng nhập
- **Test Steps**:
  1. Click vào nút "Đăng nhập" `#btn-header-login`
  2. Click vào nút xem danh sách tài khoản demo `#btn-toggle-demo-accounts`
  3. Click chọn tài khoản VIP `vip@shopgo.vn` từ danh sách demo
  4. Click nút Đăng nhập
- **Test Data**:
  - Tài khoản chọn: `vip@shopgo.vn`
- **Expected Result**:
  - Form tự động điền Email `vip@shopgo.vn` và Mật khẩu `123456`
  - Đăng nhập thành công, Header hiển thị tên `Trần Thị Mai (VIP)`
- **Priority**: Medium
- **Tags**: Rule#BR-AUTH-01, Viewpoint#VP-01, Module#AUTH, Automated

---

### TC_ID: AUTH-004
- **Title**: Verify chuyển hướng sang màn Thanh toán sau khi đăng nhập từ nút Checkout
- **Precondition**:
  - Người dùng chưa đăng nhập
  - Giỏ hàng đã có ít nhất 1 sản phẩm (ví dụ click `#btn-add-prod-001`)
- **Test Steps**:
  1. Click vào nút Thanh toán `#btn-nav-checkout` trên Header
  2. Quan sát modal đăng nhập tự động bật lên kèm thông báo yêu cầu đăng nhập
  3. Nhập email `khachhang@shopgo.vn` và mật khẩu `123456`
  4. Click nút Đăng nhập
- **Test Data**:
  - Email: `khachhang@shopgo.vn`
  - Mật khẩu: `123456`
- **Expected Result**:
  - Đăng nhập thành công
  - Hệ thống tự động chuyển tiếp vào màn hình Thanh toán (`checkout`) với sản phẩm trong giỏ vẫn được giữ nguyên
- **Priority**: High
- **Tags**: Rule#BR-AUTH-03, Viewpoint#VP-01, Module#AUTH, Automated

---

### TC_ID: AUTH-005
- **Title**: Validate hiển thị thông báo lỗi khi nhập sai mật khẩu
- **Precondition**:
  - Modal đăng nhập đang mở trên trang chủ
- **Test Steps**:
  1. Nhập email hợp lệ `khachhang@shopgo.vn` vào ô Email
  2. Nhập mật khẩu sai `12345678` vào ô Mật khẩu
  3. Click nút Đăng nhập
- **Test Data**:
  - Email: `khachhang@shopgo.vn`
  - Mật khẩu sai: `12345678`
- **Expected Result**:
  - Đăng nhập không thành công, modal không đóng
  - Hệ thống hiển thị thông báo lỗi màu đỏ nguyên văn: `"Email hoặc mật khẩu không chính xác."`
  - Không tạo phiên đăng nhập mới trong `localStorage`
- **Priority**: High
- **Tags**: Rule#BR-AUTH-04, Viewpoint#VP-02, Module#AUTH, Automated

---

### TC_ID: AUTH-006
- **Title**: Validate hiển thị thông báo lỗi khi nhập email không tồn tại trong hệ thống
- **Precondition**:
  - Modal đăng nhập đang mở trên trang chủ
- **Test Steps**:
  1. Nhập email chưa đăng ký `chuadangky@shopgo.vn` vào ô Email
  2. Nhập mật khẩu `123456` vào ô Mật khẩu
  3. Click nút Đăng nhập
- **Test Data**:
  - Email: `chuadangky@shopgo.vn`
  - Mật khẩu: `123456`
- **Expected Result**:
  - Hệ thống từ chối đăng nhập
  - Hiển thị thông báo lỗi nguyên văn: `"Email hoặc mật khẩu không chính xác."`
- **Priority**: High
- **Tags**: Rule#BR-AUTH-04, Viewpoint#VP-02, Module#AUTH, Automated

---

### TC_ID: AUTH-007
- **Title**: Validate chặn submit và hiển thị thông báo khi để trống trường Email
- **Precondition**:
  - Modal đăng nhập đang mở trên trang chủ
- **Test Steps**:
  1. Để trống trường Email
  2. Nhập mật khẩu `123456` vào ô Mật khẩu
  3. Click nút Đăng nhập
- **Test Data**:
  - Email: `""` (chuỗi rỗng)
  - Mật khẩu: `123456`
- **Expected Result**:
  - Form chặn gửi dữ liệu
  - Hiển thị thông báo lỗi: `"Vui lòng nhập đầy đủ thông tin."`
- **Priority**: High
- **Tags**: Rule#BR-AUTH-05, Viewpoint#VP-02, Module#AUTH, Automated

---

### TC_ID: AUTH-008
- **Title**: Validate chặn submit và hiển thị thông báo khi để trống trường Mật khẩu
- **Precondition**:
  - Modal đăng nhập đang mở trên trang chủ
- **Test Steps**:
  1. Nhập email `vip@shopgo.vn` vào ô Email
  2. Để trống ô Mật khẩu
  3. Click nút Đăng nhập
- **Test Data**:
  - Email: `vip@shopgo.vn`
  - Mật khẩu: `""` (chuỗi rỗng)
- **Expected Result**:
  - Form chặn submit và hiển thị thông báo: `"Vui lòng nhập đầy đủ thông tin."`
- **Priority**: High
- **Tags**: Rule#BR-AUTH-05, Viewpoint#VP-02, Module#AUTH, Automated

---

### TC_ID: AUTH-009
- **Title**: Validate chặn submit và hiển thị thông báo khi để trống cả hai trường
- **Precondition**:
  - Modal đăng nhập đang mở với cả hai ô trống
- **Test Steps**:
  1. Không nhập dữ liệu vào ô Email
  2. Không nhập dữ liệu vào ô Mật khẩu
  3. Click nút Đăng nhập
- **Test Data**:
  - Email: `""`
  - Mật khẩu: `""`
- **Expected Result**:
  - Hệ thống chặn submit và hiển thị thông báo: `"Vui lòng nhập đầy đủ thông tin."`
- **Priority**: High
- **Tags**: Rule#BR-AUTH-05, Viewpoint#VP-02, Module#AUTH, Automated

---

### TC_ID: AUTH-010
- **Title**: Validate chặn submit khi nhập email sai định dạng cú pháp thiếu @
- **Precondition**:
  - Modal đăng nhập đang mở trên trang chủ
- **Test Steps**:
  1. Nhập chuỗi `khachhangshopgo.vn` (không có ký tự `@`) vào ô Email
  2. Nhập mật khẩu `123456` vào ô Mật khẩu
  3. Click nút Đăng nhập
- **Test Data**:
  - Email sai format: `khachhangshopgo.vn`
  - Mật khẩu: `123456`
- **Expected Result**:
  - Trình duyệt hoặc hệ thống kích hoạt cảnh báo validation định dạng email không hợp lệ
  - Không gửi yêu cầu đăng nhập
- **Priority**: Medium
- **Tags**: Rule#BR-AUTH-04, Viewpoint#VP-02, Module#AUTH, Automated

---

### TC_ID: AUTH-011
- **Title**: Confirm tự động trim khoảng trắng thừa ở hai đầu email khi đăng nhập
- **Precondition**:
  - Modal đăng nhập đang mở trên trang chủ
- **Test Steps**:
  1. Nhập chuỗi `"  khachhang@shopgo.vn  "` (có khoảng trắng 2 đầu) vào ô Email
  2. Nhập mật khẩu `123456` vào ô Mật khẩu
  3. Click nút Đăng nhập
- **Test Data**:
  - Email: `"  khachhang@shopgo.vn  "`
  - Mật khẩu: `123456`
- **Expected Result**:
  - Hệ thống tự động loại bỏ khoảng trắng thừa 2 đầu
  - Đăng nhập thành công và Header hiển thị tên `Nguyễn Văn An`
- **Priority**: Medium
- **Tags**: Rule#BR-AUTH-01, Viewpoint#VP-03, Module#AUTH, Automated

---

### TC_ID: AUTH-012
- **Title**: Confirm không phân biệt chữ hoa thường trong email khi đăng nhập
- **Precondition**:
  - Modal đăng nhập đang mở trên trang chủ
- **Test Steps**:
  1. Nhập chuỗi `VIP@SHOPGO.VN` (chữ in hoa toàn bộ) vào ô Email
  2. Nhập mật khẩu `123456` vào ô Mật khẩu
  3. Click nút Đăng nhập
- **Test Data**:
  - Email: `VIP@SHOPGO.VN`
  - Mật khẩu: `123456`
- **Expected Result**:
  - Hệ thống đối soát không phân biệt chữ hoa thường
  - Đăng nhập thành công và hiển thị tên `Trần Thị Mai (VIP)`
- **Priority**: Medium
- **Tags**: Rule#BR-AUTH-01, Viewpoint#VP-03, Module#AUTH, Automated

---

### TC_ID: AUTH-013
- **Title**: Verify trường Mật khẩu được che giấu ký tự trên modal đăng nhập
- **Precondition**:
  - Modal đăng nhập đang mở
- **Test Steps**:
  1. Nhập `123456` vào trường ô Mật khẩu
  2. Kiểm tra thuộc tính type của thẻ input mật khẩu trong DOM
- **Test Data**:
  - Mật khẩu: `123456`
- **Expected Result**:
  - Phần tử input mật khẩu có thuộc tính `type="password"`
  - Các ký tự đã gõ được hiển thị dưới dạng dấu chấm bảo mật (masking dots)
- **Priority**: High
- **Tags**: Rule#BR-AUTH-01, Viewpoint#VP-04, Module#AUTH, Automated

---

### TC_ID: AUTH-014
- **Title**: Verify chuyển đổi giữa hai tài khoản không bị lẫn lộn danh tính người dùng
- **Precondition**:
  - Người dùng đang đăng nhập với tài khoản Khách thường `Nguyễn Văn An`
- **Test Steps**:
  1. Click vào menu người dùng `#btn-user-profile`
  2. Click nút Đăng xuất `#btn-logout`
  3. Click nút Đăng nhập `#btn-header-login`
  4. Nhập email `vip@shopgo.vn` và mật khẩu `123456`
  5. Click nút Đăng nhập
- **Test Data**:
  - Tài khoản cũ: `khachhang@shopgo.vn`
  - Tài khoản mới: `vip@shopgo.vn` / `123456`
- **Expected Result**:
  - Hệ thống đăng nhập thành công vào tài khoản VIP
  - Header cập nhật chính xác tên `Trần Thị Mai (VIP)`
  - Không còn bất kỳ dấu hiệu hiển thị nào của `Nguyễn Văn An`
- **Priority**: High
- **Tags**: Rule#BR-AUTH-02, Rule#BR-AUTH-08, Viewpoint#VP-04, Module#AUTH, Automated

---

### TC_ID: AUTH-015
- **Title**: Confirm hệ thống duy trì hoạt động ổn định khi nhập sai mật khẩu nhiều lần liên tiếp
- **Precondition**:
  - Modal đăng nhập đang mở
- **Test Steps**:
  1. Nhập email `khachhang@shopgo.vn`
  2. Nhập mật khẩu sai `sai_pass` và click Đăng nhập
  3. Lặp lại thao tác click Đăng nhập với mật khẩu sai liên tiếp 5 lần
- **Test Data**:
  - Email: `khachhang@shopgo.vn`
  - Mật khẩu sai: `sai_pass`
  - Số lần thử: 5 lần
- **Expected Result**:
  - Hệ thống vẫn phản hồi thông báo `"Email hoặc mật khẩu không chính xác."` sau mỗi lần thử
  - Giao diện không bị treo, form không bị crash lỗi JavaScript
- **Priority**: Medium
- **Tags**: Rule#BR-AUTH-06, Viewpoint#VP-04, Module#AUTH, Manual

---

### TC_ID: AUTH-016
- **Title**: Confirm submit form đăng nhập bằng phím Enter tại ô Mật khẩu
- **Precondition**:
  - Modal đăng nhập đang mở
- **Test Steps**:
  1. Nhập email `khachhang@shopgo.vn` vào ô Email
  2. Nhập mật khẩu `123456` vào ô Mật khẩu
  3. Nhấn phím `Enter` trên bàn phím khi con trỏ đang ở ô Mật khẩu
- **Test Data**:
  - Email: `khachhang@shopgo.vn`
  - Mật khẩu: `123456`
  - Phím nhấn: `Enter`
- **Expected Result**:
  - Form tự động submit mà không cần click chuột vào nút Đăng nhập
  - Đăng nhập thành công và modal đóng lại
- **Priority**: Low
- **Tags**: Rule#BR-AUTH-01, Viewpoint#VP-05, Module#AUTH, Automated

---

### TC_ID: AUTH-017
- **Title**: Verify đóng modal đăng nhập mà không làm thay đổi trạng thái trang
- **Precondition**:
  - Người dùng đang ở màn hình Cửa hàng (`shop`)
  - Modal đăng nhập đang mở
- **Test Steps**:
  1. Click vào nút đóng modal hoặc click vào vùng nền mờ bên ngoài modal
  2. Quan sát giao diện trang
- **Test Data**:
  - Hành động: Click nút đóng
- **Expected Result**:
  - Modal đăng nhập đóng lại hoàn toàn
  - Người dùng vẫn ở lại màn hình Cửa hàng, nút `#btn-header-login` vẫn hiển thị bình thường
- **Priority**: Low
- **Tags**: Rule#BR-AUTH-01, Viewpoint#VP-05, Module#AUTH, Automated

---

### TC_ID: AUTH-018
- **Title**: Verify khôi phục phiên đăng nhập khi làm mới trang (F5) và điều hướng về trang chủ khi đăng xuất
- **Precondition**:
  - Người dùng đã đăng nhập thành công với tài khoản VIP `Trần Thị Mai (VIP)`
- **Test Steps**:
  1. Nhấn nút F5 (reload trang) của trình duyệt
  2. Kiểm tra Header sau khi trang load xong
  3. Click `#btn-user-profile` để mở menu người dùng
  4. Click nút Đăng xuất `#btn-logout`
- **Test Data**:
  - Tài khoản: `vip@shopgo.vn`
- **Expected Result**:
  - Sau khi F5: Header vẫn giữ nguyên trạng thái đăng nhập `Trần Thị Mai (VIP)` từ `localStorage`
  - Sau khi click Đăng xuất: Hệ thống điều hướng quay về trang chủ (`shop`), Header quay về nút `#btn-header-login`, giỏ hàng không hiển thị
- **Priority**: High
- **Tags**: Rule#BR-AUTH-03, Rule#BR-AUTH-08, Viewpoint#VP-06, Module#AUTH, Automated

# PRD — Đăng Nhập & Phân Hạng Khách Hàng · ShopGo

Phiên bản: `v2.0` · Ngày ban hành: `2026-09-15` · Người soạn: BA Nguyễn Thị Hương
Hệ thống: ShopGo — Sàn thương mại điện tử · Môi trường: `https://cwshopgo.github.io`
Trạng thái: `Approved for Development`

---

## 1. Bối Cảnh & Mục Tiêu

### 1.1. Bối cảnh
ShopGo cho phép khách xem hàng và thêm giỏ mà không cần đăng nhập, nhưng để hoàn tất đơn hàng thì cần định danh khách. Song song, phòng Kinh doanh muốn triển khai chương trình **Khách hàng VIP** để giữ chân nhóm khách chi tiêu cao.

### 1.2. Mục tiêu
- Cho phép khách đăng nhập bằng email và mật khẩu.
- Chặn hoàn tất đơn hàng khi khách chưa đăng nhập.
- Phân biệt hai hạng khách hàng: Tiêu chuẩn và VIP.

---

## 2. Quy Tắc Nghiệp Vụ

### 2.1. Tài khoản trong hệ thống

| Email | Mật khẩu | Hạng khách hàng | Họ tên |
|---|---|---|---|
| `khachhang@shopgo.vn` | `123456` | Tiêu chuẩn | Nguyễn Văn An |
| `vip@shopgo.vn` | `123456` | VIP | Trần Thị Mai |

### 2.2. Cách mở màn đăng nhập
- Khách bấm nút **Đăng nhập** trên thanh điều hướng.
- Hoặc hệ thống tự mở màn đăng nhập khi khách bấm đặt hàng mà chưa đăng nhập.

### 2.3. Quy tắc xác thực

| Mã | Điều kiện | Hành vi |
|---|---|---|
| `BR-A1` | Bỏ trống email hoặc mật khẩu | Báo lỗi yêu cầu nhập đầy đủ cả hai trường |
| `BR-A2` | Email không tồn tại trong hệ thống | Báo lỗi thông tin đăng nhập không chính xác |
| `BR-A3` | Email đúng nhưng mật khẩu sai | Báo lỗi mật khẩu không chính xác |
| `BR-A4` | Email và mật khẩu đều đúng | Chào mừng khách theo tên, chuyển về màn trước đó |
| `BR-A5` | Sai mật khẩu 5 lần liên tiếp | Khoá tạm thời tài khoản trong 15 phút để chống dò mật khẩu |

### 2.4. Hỗ trợ nhập nhanh tài khoản thử nghiệm
Màn đăng nhập có nút mở danh sách tài khoản mẫu để đội kiểm thử và khách demo chọn nhanh, không phải gõ tay.

### 2.5. Chặn thanh toán khi chưa đăng nhập
Khi khách bấm đặt hàng mà chưa đăng nhập, hệ thống hiển thị thông báo yêu cầu đăng nhập và mở màn đăng nhập. Giỏ hàng và mã giảm giá đang áp **phải được giữ nguyên**, không bị mất sau khi đăng nhập xong.

### 2.6. Phân hạng khách hàng
Hệ thống có hai hạng:
- **Khách hàng Tiêu chuẩn** — hạng mặc định của mọi tài khoản mới.
- **Khách hàng VIP** — dành cho nhóm khách chi tiêu cao, do phòng Kinh doanh nâng hạng thủ công.

Hạng khách hàng được hiển thị ở menu người dùng và ở màn Hồ sơ, kèm biểu tượng phân biệt.

### 2.7. Đăng xuất
Khách đăng xuất từ menu người dùng. Sau khi đăng xuất, hệ thống quay về trạng thái khách vãng lai.

### 2.8. Duy trì phiên đăng nhập
Phiên đăng nhập được giữ lại khi khách tải lại trang, khách không phải đăng nhập lại.

---

## 3. Luồng Chính (Happy Path)

1. Khách bấm nút Đăng nhập trên thanh điều hướng.
2. Màn đăng nhập hiện ra.
3. Khách nhập `khachhang@shopgo.vn` và mật khẩu `123456`.
4. Khách bấm nút đăng nhập.
5. Hệ thống xác thực thành công, hiển thị lời chào kèm tên khách.
6. Thanh điều hướng đổi từ nút Đăng nhập sang menu người dùng.

---

## 4. Luồng Ngoại Lệ

| Mã | Tình huống | Hành vi hệ thống mong đợi |
|---|---|---|
| `AF-01` | Bỏ trống một hoặc cả hai trường | Áp dụng `BR-A1` |
| `AF-02` | Email không tồn tại | Áp dụng `BR-A2` |
| `AF-03` | Mật khẩu sai | Áp dụng `BR-A3` |
| `AF-04` | Bấm đặt hàng khi chưa đăng nhập | Áp dụng §2.5, giữ nguyên giỏ hàng và mã giảm giá |
| `AF-05` | Đăng nhập xong rồi tải lại trang | Vẫn ở trạng thái đã đăng nhập, theo §2.8 |

---

## 5. Yêu Cầu Giao Diện

- Màn đăng nhập hiển thị dạng cửa sổ nổi trên nền trang hiện tại.
- Thông báo lỗi hiển thị bên trong màn đăng nhập, không làm đóng cửa sổ.
- Menu người dùng hiển thị: họ tên, email, hạng khách hàng, và các lối tới Hồ sơ / Đơn hàng / Đăng xuất.
- Hạng VIP dùng tông màu vàng kim để tạo cảm giác đặc quyền.

---

## 6. Ngoài Phạm Vi

- Đăng ký tài khoản mới.
- Quên mật khẩu / đặt lại mật khẩu.
- Đăng nhập qua mạng xã hội (Google, Facebook).
- Xác thực hai lớp.

---

## 7. Tiêu Chí Nghiệm Thu

- [ ] Bốn quy tắc xác thực `BR-A1` đến `BR-A4` hoạt động đúng với thông báo rõ ràng.
- [ ] Không đăng nhập thì không hoàn tất được đơn hàng.
- [ ] Giỏ hàng và mã giảm giá không bị mất sau khi đăng nhập giữa chừng.
- [ ] Hạng khách hàng hiển thị đúng ở cả menu người dùng và màn Hồ sơ.
- [ ] Tải lại trang không làm mất phiên đăng nhập.

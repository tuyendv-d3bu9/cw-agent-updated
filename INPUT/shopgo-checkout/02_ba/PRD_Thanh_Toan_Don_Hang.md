# PRD — Thanh Toán & Lịch Sử Đơn Hàng · ShopGo

Phiên bản: `v1.3` · Ngày ban hành: `2026-09-15` · Người soạn: BA Nguyễn Thị Hương
Hệ thống: ShopGo — Sàn thương mại điện tử · Môi trường: `https://cwshopgo.github.io`
Trạng thái: `Approved for Development`

---

## 1. Bối Cảnh & Mục Tiêu

### 1.1. Bối cảnh
Đây là bước cuối cùng của phễu bán hàng, nơi mọi sai sót về tiền đều trực tiếp gây thiệt hại tài chính và mất uy tín. Phòng Tài chính yêu cầu công thức tính tiền phải minh bạch từng khoản để khách đối chiếu được.

### 1.2. Mục tiêu
- Khách hoàn tất đơn hàng và nhận hoá đơn điện tử.
- Hiển thị minh bạch từng khoản cấu thành tổng thanh toán.
- Lưu lại lịch sử đơn hàng để khách tra cứu.

---

## 2. Quy Tắc Nghiệp Vụ

### 2.1. Chính sách phí vận chuyển

| Mã | Điều kiện | Phí vận chuyển |
|---|---|---|
| `BR-S1` | Giá trị tạm tính từ **300.000 ₫** trở lên | Miễn phí |
| `BR-S2` | Giá trị tạm tính dưới ngưỡng miễn phí | 30.000 ₫ |
| `BR-S3` | Giỏ hàng rỗng hoặc tạm tính bằng 0 | 0 ₫ (không tính phí) |

### 2.2. Công thức tổng thanh toán

```
Tổng thanh toán = Tạm tính + Phí vận chuyển − Giảm giá voucher
```

Các khoản phải được hiển thị thành từng dòng riêng biệt trong khối tổng kết:
- Tạm tính (Subtotal)
- Phí vận chuyển
- Giảm giá voucher (chỉ hiện khi có áp mã)
- Tổng thanh toán

### 2.3. Điều kiện đặt hàng
Khách chỉ đặt được hàng khi thoả **đồng thời**:
1. Đã đăng nhập.
2. Giỏ hàng có ít nhất một sản phẩm.
3. Không còn dòng hàng nào đang báo lỗi số lượng.

### 2.4. Phương thức thanh toán được hỗ trợ
Hệ thống hỗ trợ các phương thức: `VISA`, `Mastercard`, `JCB`, `VNPAY-QR`, `MoMo`, `ZaloPay`, `Tiền mặt COD`.

### 2.5. Tiến trình xử lý đơn hàng
Sau khi khách bấm đặt hàng, hệ thống hiển thị tiến trình xử lý gồm 4 giai đoạn để khách yên tâm chờ:
1. Kết nối cổng thanh toán an toàn
2. Xác thực và kiểm tra số lượng tồn kho
3. Đối soát voucher và tính toán chiết khấu
4. Khởi tạo hoá đơn điện tử

### 2.6. Hoá đơn điện tử
Xử lý xong, hệ thống hiển thị hoá đơn gồm: mã đơn hàng, danh sách sản phẩm, tạm tính, phí vận chuyển, giảm giá, tổng thanh toán, và mã giảm giá đã áp (nếu có).

### 2.7. Sau khi đặt hàng thành công
- Đơn hàng được lưu vào lịch sử của khách.
- Giỏ hàng được dọn sạch.
- Khách được đưa về màn Cửa hàng sau khi đóng hoá đơn.

### 2.8. Lịch sử đơn hàng
Màn Đơn hàng liệt kê các đơn của khách đang đăng nhập, sắp xếp mới nhất lên đầu, mỗi đơn hiển thị đầy đủ các khoản tiền như trên hoá đơn.

### 2.9. Xoá lịch sử đơn hàng
Khách có thể xoá toàn bộ lịch sử đơn hàng của mình. Đây là hành động không hoàn tác được nên **bắt buộc phải có bước xác nhận**, kèm số lượng đơn sắp bị xoá. Chức năng này có ở cả màn Đơn hàng và màn Hồ sơ.

---

## 3. Luồng Chính (Happy Path)

1. Khách đã đăng nhập, có giỏ hàng hợp lệ.
2. Khách vào màn Thanh toán và đối chiếu khối tổng kết tiền.
3. Khách bấm nút đặt hàng.
4. Hệ thống chạy tiến trình 4 giai đoạn ở §2.5.
5. Hoá đơn điện tử hiện ra với đầy đủ thông tin.
6. Khách đóng hoá đơn, được đưa về màn Cửa hàng với giỏ hàng đã trống.
7. Khách vào màn Đơn hàng và thấy đơn vừa đặt ở đầu danh sách.

---

## 4. Luồng Ngoại Lệ

| Mã | Tình huống | Hành vi hệ thống mong đợi |
|---|---|---|
| `AF-01` | Bấm đặt hàng khi chưa đăng nhập | Thông báo yêu cầu đăng nhập và mở màn đăng nhập |
| `AF-02` | Bấm đặt hàng khi giỏ hàng rỗng | Không cho đặt |
| `AF-03` | Bấm đặt hàng khi còn dòng hàng lỗi số lượng | Không cho đặt, chỉ rõ dòng đang lỗi |
| `AF-04` | Bấm xoá lịch sử đơn hàng | Hiện hộp xác nhận kèm số lượng đơn; chỉ xoá khi khách bấm đồng ý |
| `AF-05` | Khách bấm huỷ ở hộp xác nhận xoá | Không xoá gì, đóng hộp xác nhận |

---

## 5. Yêu Cầu Giao Diện

- Khối tổng kết tiền neo cố định, luôn nhìn thấy khi cuộn trang.
- Dòng phí vận chuyển khi được miễn phí hiển thị chữ thay vì số 0, để khách nhận ra ưu đãi.
- Tổng thanh toán là con số lớn nhất, nổi bật nhất trong khối tổng kết.
- Tiến trình 4 giai đoạn hiển thị dạng danh sách có dấu tích dần.

---

## 6. Ngoài Phạm Vi

- Tích hợp cổng thanh toán thật.
- Nhập và lưu địa chỉ giao hàng khi đặt đơn.
- Tính phí vận chuyển theo khoảng cách hoặc theo khối lượng.
- Huỷ đơn, đổi trả, theo dõi vận đơn.

---

## 7. Tiêu Chí Nghiệm Thu

- [ ] Công thức tổng thanh toán đúng trong mọi tổ hợp có/không voucher và có/không phí ship.
- [ ] Ngưỡng miễn phí vận chuyển hoạt động đúng tại giá trị biên.
- [ ] Ba điều kiện đặt hàng ở §2.3 đều được kiểm tra.
- [ ] Đơn đặt xong xuất hiện đúng trong lịch sử với đầy đủ các khoản tiền.
- [ ] Xoá lịch sử đơn hàng luôn phải qua bước xác nhận.

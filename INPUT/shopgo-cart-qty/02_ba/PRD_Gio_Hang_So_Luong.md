# PRD — Giỏ Hàng & Quản Lý Số Lượng Sản Phẩm · ShopGo

Phiên bản: `v1.1` · Ngày ban hành: `2026-09-15` · Người soạn: BA Nguyễn Thị Hương
Hệ thống: ShopGo — Sàn thương mại điện tử · Môi trường: `https://cwshopgo.github.io`
Trạng thái: `Approved for Development`

---

## 1. Bối Cảnh & Mục Tiêu

### 1.1. Bối cảnh
Bộ phận Chăm sóc khách hàng ghi nhận 37 khiếu nại trong tháng 8/2026 liên quan tới việc khách đặt số lượng vượt tồn kho nhưng hệ thống vẫn cho đặt, dẫn tới phải huỷ đơn thủ công. Cần siết chặt khâu kiểm soát số lượng ngay tại giỏ hàng.

### 1.2. Mục tiêu
- Khách hàng chủ động điều chỉnh số lượng từng sản phẩm trong giỏ.
- Chặn mọi giá trị số lượng không hợp lệ ngay tại giao diện, trước khi đặt hàng.
- Giảm số đơn phải huỷ vì lý do tồn kho xuống 0 trong quý 4/2026.

---

## 2. Quy Tắc Nghiệp Vụ

### 2.1. Thêm sản phẩm vào giỏ
- Từ màn Cửa hàng, mỗi thẻ sản phẩm có nút thêm vào giỏ.
- Bấm thêm một sản phẩm đã có trong giỏ thì tăng số lượng của dòng đó lên 1, không tạo dòng mới.

### 2.2. Danh mục sản phẩm và tồn kho

| Mã sản phẩm | Tên sản phẩm | Đơn giá | Danh mục | Tồn kho |
|---|---|---|---|---|
| `prod-001` | Áo thun Trendy Unisex | 150.000 ₫ | Thời trang | 50 |
| `prod-002` | Tai nghe Bluetooth Không Dây | 350.000 ₫ | Công nghệ | 20 |
| `prod-003` | Bình nước giữ nhiệt Kim Loại | 200.000 ₫ | Gia dụng | 25 |
| `prod-004` | Balo Chống Nước Oxford | 280.000 ₫ | Thời trang | 18 |
| `prod-005` | Sạc dự phòng Siêu Nhanh 20W | 190.000 ₫ | Công nghệ | 30 |
| `prod-006` | Đèn để bàn LED Chống Cận | 120.000 ₫ | Gia dụng | 8 |

### 2.3. Chỉnh sửa số lượng trong giỏ
Mỗi dòng hàng trong giỏ có một ô cho phép khách nhập trực tiếp số lượng mong muốn.

### 2.4. Quy tắc hợp lệ của số lượng
Giá trị khách nhập phải thoả **tất cả** điều kiện sau:

| Mã | Điều kiện | Thông báo khi vi phạm |
|---|---|---|
| `BR-Q1` | Không được để trống | Báo cho khách biết số lượng không được để trống |
| `BR-Q2` | Phải là chữ số nguyên (không chữ cái, không ký tự đặc biệt, không số thập phân) | Báo cho khách biết số lượng phải là chữ số nguyên |
| `BR-Q3` | Phải lớn hơn 0 | Báo cho khách biết số lượng phải lớn hơn 0 |
| `BR-Q4` | Không được vượt quá tồn kho của sản phẩm đó | Báo cho khách biết đã vượt quá tồn kho, kèm số tồn thực tế |

Thứ tự kiểm tra theo đúng trình tự `BR-Q1` → `BR-Q4`; dừng ở lỗi đầu tiên gặp phải.

### 2.5. Xoá sản phẩm khỏi giỏ
Mỗi dòng hàng có nút xoá. Xoá xong, giỏ hàng và tổng tiền cập nhật ngay.

### 2.6. Tính tạm tính (Subtotal)
Tạm tính = tổng của (đơn giá × số lượng) trên các dòng hàng trong giỏ.

### 2.7. Trạng thái giỏ hàng rỗng
Khi không còn sản phẩm nào, hiển thị thông báo giỏ hàng trống và lối quay về Cửa hàng.

---

## 3. Luồng Chính (Happy Path)

1. Khách vào màn Cửa hàng.
2. Khách bấm thêm vào giỏ cho một sản phẩm bất kỳ.
3. Biểu tượng giỏ hàng trên thanh điều hướng cập nhật số lượng.
4. Khách vào màn Thanh toán để xem giỏ hàng.
5. Khách sửa số lượng thành một giá trị hợp lệ.
6. Dòng hàng và khối tổng kết tiền cập nhật ngay lập tức.

---

## 4. Luồng Ngoại Lệ

| Mã | Tình huống | Hành vi hệ thống mong đợi |
|---|---|---|
| `AF-01` | Khách xoá sạch nội dung ô số lượng | Hiện lỗi `BR-Q1` ngay dưới dòng hàng |
| `AF-02` | Khách nhập chữ cái (ví dụ `abc`) | Hiện lỗi `BR-Q2` |
| `AF-03` | Khách nhập số âm (ví dụ `-5`) hoặc số `0` | Hiện lỗi `BR-Q3` |
| `AF-04` | Khách nhập số lớn hơn tồn kho | Hiện lỗi `BR-Q4` kèm số tồn thực tế |
| `AF-05` | Khách xoá dòng hàng cuối cùng | Chuyển sang trạng thái giỏ hàng rỗng |

---

## 5. Yêu Cầu Giao Diện

- Thông báo lỗi hiển thị ngay dưới dòng hàng bị lỗi, không dùng cửa sổ bật lên.
- Dòng hàng đang có lỗi được làm nổi bật bằng viền cảnh báo.
- Khối tổng kết tiền luôn hiển thị ở vị trí cố định bên phải (trên máy tính) hoặc dưới cùng (trên điện thoại).

---

## 6. Ngoài Phạm Vi

- Lưu giỏ hàng lên máy chủ và đồng bộ đa thiết bị.
- Giữ chỗ tồn kho (reservation) trong thời gian khách đang thanh toán.
- Gợi ý sản phẩm liên quan trong giỏ hàng.

---

## 7. Tiêu Chí Nghiệm Thu

- [ ] Bốn quy tắc `BR-Q1` đến `BR-Q4` đều chặn đúng và có thông báo rõ ràng.
- [ ] Thông báo lỗi tồn kho nêu đúng số tồn thực tế của sản phẩm đó.
- [ ] Tạm tính luôn khớp với tổng (đơn giá × số lượng) của các dòng hàng.
- [ ] Xoá hết sản phẩm thì chuyển đúng sang trạng thái giỏ hàng rỗng.

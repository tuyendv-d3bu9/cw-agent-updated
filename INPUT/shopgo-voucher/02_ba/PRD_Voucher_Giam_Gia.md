# PRD — Chức Năng Mã Giảm Giá (Voucher) · ShopGo

Phiên bản: `v1.2` · Ngày ban hành: `2026-09-15` · Người soạn: BA Nguyễn Thị Hương
Hệ thống: ShopGo — Sàn thương mại điện tử · Môi trường: `https://cwshopgo.github.io`
Trạng thái: `Approved for Development`

---

## 1. Bối Cảnh & Mục Tiêu

### 1.1. Bối cảnh
Tỷ lệ bỏ giỏ hàng (cart abandonment) của ShopGo trong quý 2/2026 ở mức 68%. Khảo sát nhanh 200 khách hàng cho thấy 41% rời đi vì "cảm thấy giá chưa đủ hấp dẫn". Phòng Marketing đề xuất triển khai chương trình mã giảm giá để kích cầu.

### 1.2. Mục tiêu
- Cho phép khách hàng nhập mã giảm giá tại màn Thanh toán để được chiết khấu.
- Giảm tỷ lệ bỏ giỏ hàng xuống dưới 55% trong quý 4/2026.
- Hỗ trợ hai hình thức chiết khấu: giảm số tiền cố định và giảm theo phần trăm.

### 1.3. Phạm vi phiên bản này
Chỉ bao gồm phần **áp dụng mã** ở phía khách hàng. Phần quản trị mã (tạo/sửa/thu hồi) thuộc phiên bản sau.

---

## 2. Quy Tắc Nghiệp Vụ

### 2.1. Danh mục mã giảm giá được phát hành

Hệ thống phát hành 3 mã trong đợt đầu:

| Mã | Loại chiết khấu | Giá trị | Giá trị đơn tối thiểu | Mức giảm tối đa | Tình trạng |
|---|---|---|---|---|---|
| `GIAM50K` | Số tiền cố định | 50.000 ₫ | 200.000 ₫ | — | Đang hiệu lực |
| `SALE20` | Phần trăm | 20% | 300.000 ₫ | 150.000 ₫ | Đang hiệu lực |
| `HETHAN` | Số tiền cố định | 30.000 ₫ | 100.000 ₫ | — | Đã hết hạn |

### 2.2. Vị trí và thao tác
- Ô nhập mã đặt tại màn **Thanh toán**, ngay phía trên khối tổng kết tiền.
- Khách hàng nhập mã rồi bấm nút **"Áp dụng"**.
- Hệ thống hiển thị sẵn các chip mã gợi ý để khách bấm chọn nhanh thay vì gõ tay.

### 2.3. Điều kiện áp dụng mã
Mã được chấp nhận khi thoả **đồng thời** các điều kiện:
1. Mã tồn tại trong danh mục §2.1.
2. Mã còn hiệu lực (chưa hết hạn).
3. Giá trị tạm tính của giỏ hàng (subtotal) đạt mức tối thiểu quy định cho mã đó.

### 2.4. Cách tính chiết khấu
- Mã loại **số tiền cố định**: trừ thẳng số tiền ghi trong bảng §2.1 vào tổng thanh toán.
- Mã loại **phần trăm**: chiết khấu = subtotal × tỷ lệ phần trăm. Nếu kết quả vượt quá **mức giảm tối đa** thì lấy bằng mức giảm tối đa.
- Chiết khấu được trừ vào tổng thanh toán cuối cùng.

### 2.5. Gỡ mã đã áp
Khách hàng có thể gỡ mã đã áp bất cứ lúc nào. Sau khi gỡ, tổng thanh toán quay về giá trị trước khi áp mã.

### 2.6. Mỗi đơn hàng chỉ áp một mã
Tại một thời điểm chỉ có tối đa một mã giảm giá được áp dụng cho giỏ hàng. Nhập mã mới khi đang có mã cũ sẽ thay thế mã cũ.

---

## 3. Luồng Chính (Happy Path)

1. Khách hàng có giỏ hàng với subtotal đạt điều kiện.
2. Khách vào màn Thanh toán.
3. Khách nhập mã `GIAM50K` vào ô nhập mã.
4. Khách bấm nút "Áp dụng".
5. Hệ thống kiểm tra mã hợp lệ và đủ điều kiện.
6. Hệ thống hiển thị thông báo áp dụng thành công kèm số tiền được giảm.
7. Khối tổng kết tiền cập nhật: xuất hiện dòng "Giảm giá voucher" và tổng thanh toán giảm tương ứng.

---

## 4. Luồng Ngoại Lệ

| Mã | Tình huống | Hành vi hệ thống mong đợi |
|---|---|---|
| `AF-01` | Khách bấm "Áp dụng" khi ô nhập mã đang trống | Báo lỗi yêu cầu nhập mã. Không thay đổi tổng tiền. |
| `AF-02` | Khách nhập một mã không có trong danh mục | Báo lỗi mã không tồn tại, nêu rõ mã vừa nhập. Không thay đổi tổng tiền. |
| `AF-03` | Khách nhập mã đã hết hạn (`HETHAN`) | Báo lỗi mã đã hết hạn sử dụng. Không thay đổi tổng tiền. |
| `AF-04` | Khách nhập mã hợp lệ nhưng giỏ hàng chưa đạt giá trị tối thiểu | Báo cho khách biết cần bổ sung giỏ hàng để đạt điều kiện. Không áp mã. |
| `AF-05` | Mã phần trăm cho ra số tiền giảm vượt mức giảm tối đa | Chỉ giảm đúng bằng mức giảm tối đa. |

---

## 5. Yêu Cầu Giao Diện

- Ô nhập mã có văn bản gợi ý nhắc tên các mã đang chạy.
- Sau khi áp mã thành công, hiển thị nhãn mã đang áp kèm nút gỡ.
- Thông báo lỗi hiển thị ngay dưới ô nhập mã, màu cảnh báo.
- Dòng "Giảm giá voucher" trong khối tổng kết hiển thị màu xanh lá để phân biệt với các khoản cộng thêm.

---

## 6. Ngoài Phạm Vi

- Quản trị mã giảm giá (tạo, sửa, thu hồi, đặt lịch chạy).
- Mã giảm giá cá nhân hoá theo từng khách hàng.
- Giới hạn số lượt sử dụng trên mỗi mã hoặc trên mỗi tài khoản.
- Chương trình tích điểm, hoàn tiền.

---

## 7. Tiêu Chí Nghiệm Thu

- [ ] Áp được cả mã cố định và mã phần trăm.
- [ ] Mức giảm tối đa của mã phần trăm hoạt động đúng.
- [ ] Bốn luồng ngoại lệ `AF-01` đến `AF-04` đều có thông báo rõ ràng cho khách.
- [ ] Gỡ mã trả tổng tiền về đúng giá trị ban đầu.

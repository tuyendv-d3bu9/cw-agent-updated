# BẢN ĐỒ LOCATOR & HÀNH VI FRONTEND THỰC TẾ · `function-d-voucher`
**Owner**: `agents/qa-exploratory` (theo chỉ đạo QA Leader) · **Nguồn**: bundle ứng dụng Live `https://cwshopgo.github.io/assets/index-NTeEBPwy.js` (tải và bóc tách trực tiếp ngày 2026-09-27) · **Mục đích**: Đóng `GAP-L1` và cung cấp locator chuẩn cho Page Object Model Playwright.

> Toàn bộ locator dưới đây trích từ mã nguồn ứng dụng đang chạy, **không suy đoán**.

---

## 1. Danh Mục Locator Đầy Đủ (Playwright Ready)

### 1.1. Điều hướng & Xác thực
| Thành phần | Selector | Ghi chú |
|---|---|---|
| Nút Đăng nhập (header) | `#btn-header-login` | Mở màn hình đăng nhập |
| Nút Đăng xuất | `#btn-logout` | Trong menu người dùng |
| Nút mở menu người dùng | `#btn-user-profile` | Mở dropdown |
| Menu Hồ sơ | `#btn-menu-profile` | |
| Menu Đơn hàng | `#btn-menu-orders` | |
| Tab Cửa hàng | `#btn-nav-shop` | |
| Tab Thanh toán | `#btn-nav-checkout` | |
| Tab Đơn hàng | `#btn-nav-orders` | |
| Hiện/ẩn tài khoản demo | `#btn-toggle-demo-accounts` | Đăng nhập nhanh |

### 1.2. Sản phẩm & Giỏ hàng *(MỚI — trước đây thiếu)*
| Thành phần | Selector | Ghi chú |
|---|---|---|
| Nút Thêm vào giỏ | `#btn-add-prod-001` … `#btn-add-prod-006` | Sinh động theo `id` sản phẩm |
| Ô số lượng trong giỏ | `#input-qty-prod-00X` | Input text, nhận cả giá trị không hợp lệ |
| Nút Xóa sản phẩm khỏi giỏ | `#btn-remove-prod-00X` | |
| Nút tăng / giảm số lượng | Không có `id`; dùng `page.locator('#input-qty-prod-00X').locator('xpath=..').getByRole('button')` (nút `+` bên phải, `−` bên trái) | **Khuyến nghị Dev bổ sung `id`** |
| Lỗi validate dòng giỏ hàng | `p.text-rose-600` trong cùng khối sản phẩm | Text: `Số lượng phải là chữ số nguyên` / `Số lượng phải lớn hơn 0 (>= 1)` / `Vượt quá tồn kho (N)` |

### 1.3. Voucher
| Thành phần | Selector | Ghi chú |
|---|---|---|
| Ô nhập mã | `#input-voucher-code` | **Không có `maxlength`**, không có regex format |
| Nút Áp dụng | `#btn-apply-voucher` | `type="submit"` trong `<form>`; **không có thuộc tính `disabled`, không có spinner** |
| Nút Gỡ mã | `#btn-remove-voucher` | Nhãn hiển thị là **"Gỡ mã"** (không phải "Gỡ bỏ") |
| Badge chọn nhanh | `#badge-voucher-GIAM50K`, `#badge-voucher-SALE20`, `#badge-voucher-HETHAN` | |
| Thông báo thành công | `div.bg-emerald-50` | Dùng `page.getByText('Áp dụng thành công mã')` |
| Thông báo lỗi | `div.bg-rose-50` | |
| Cảnh báo "chưa đủ điều kiện" | `div.bg-amber-50` | Text: `Mã "X" chưa đủ điều kiện áp dụng` |
| Tổng thanh toán | `#label-total-payable` | |
| Nút Đặt hàng | `#btn-submit-checkout` | |
| Đóng biên lai | `#btn-close-receipt` | |

### 1.4. Quản lý đơn hàng
| Thành phần | Selector | Ghi chú |
|---|---|---|
| Xóa toàn bộ lịch sử đơn | `#btn-trigger-clear-orders` ➔ `#btn-confirm-clear-orders` / `#btn-cancel-clear-orders` | |
| Xóa lịch sử từ trang Hồ sơ | `#btn-profile-trigger-clear` ➔ `#btn-profile-confirm-clear` / `#btn-profile-cancel-clear` | |
| **Hủy từng đơn hàng** | **KHÔNG TỒN TẠI** | Ứng dụng chỉ có "xóa sạch toàn bộ lịch sử", không có thao tác hủy 1 đơn |

---

## 2. Catalog Sản Phẩm Thực Tế (6 sản phẩm — trước đây tài liệu chỉ ghi 3)

| ID | Tên sản phẩm | Giá | Tồn kho |
|---|---|---|---|
| `prod-001` | Áo thun Trendy Unisex | 150.000 ₫ | 50 |
| `prod-002` | Tai nghe Bluetooth Không Dây | 350.000 ₫ | 12 |
| `prod-003` | Bình nước giữ nhiệt Kim Loại | 200.000 ₫ | 25 |
| `prod-004` | Balo Chống Nước Oxford | 280.000 ₫ | 18 |
| `prod-005` | Sạc dự phòng Siêu Nhanh 20W | 190.000 ₫ | 30 |
| `prod-006` | Đèn để bàn LED Chống Cận | 120.000 ₫ | 8 |

> **Không tồn tại sản phẩm "Phụ kiện móc khóa 60.000 ₫"** — `VCHR-031` phải thiết kế lại theo catalog trên.

---

## 3. Logic Tính Toán Thực Tế Của Frontend (trích từ mã nguồn)

```
subtotal      = Σ (price × quantity)   // bỏ qua dòng đang lỗi validate
shippingFee   = (giỏ trống | subtotal === 0 | subtotal >= 200.000) ? 0 : 30.000
discount(fixed)      = value
discount(percentage) = min(subtotal × value, maxCap)
discount      = min(discount, subtotal)
total         = max(0, subtotal + shippingFee − discount)
```

**Thứ tự kiểm tra khi bấm Áp dụng** (`trim().toUpperCase()` trước tiên):
1. Rỗng ➔ `"Vui lòng nhập mã khuyến mãi."`
2. Không có trong danh mục ➔ `Mã giảm giá "X" không tồn tại trên hệ thống.`
3. `expired` ➔ `Mã giảm giá "X" đã hết hạn sử dụng.`
4. `subtotal < minSubtotal` ➔ `Đơn hàng chưa đạt mức tối thiểu {min} (Hiện có {subtotal}).`
5. Hợp lệ ➔ `Áp dụng thành công mã "X": Giảm {...}.`

**Lưu trữ đơn hàng**: `localStorage` khóa `shopgo_orders`, bản ghi gồm `orderId`, `userId`, `date`, `items`, `subtotal`, `shippingFee`, `discount`, `total`, `appliedCode`, `createdAt`. Phiên đăng nhập ở khóa `shopgo_user`. *(Chuỗi "cơ sở dữ liệu SQLite" hiển thị trên giao diện chỉ là mô phỏng — không có backend thật, không có lời gọi API.)*

---

## 4. Mốc Biên Tái Hiện Được Trên Catalog Thật (thay thế các giá trị bất khả thi)

Mọi giá sản phẩm đều là bội số của 10.000 ₫, nên các mốc lẻ 199.000 / 250.000 / 299.000 / 333.333 / 499.000 / 210.000 ₫ **không thể tạo được qua UI**. Cặp biên thay thế:

| Mục tiêu kiểm thử | Giá trị cũ (bất khả thi) | Giá trị thay thế khả thi | Cách tạo giỏ hàng |
|---|---|---|---|
| Cận dưới mức sàn 200k | 199.000 ₫ | **190.000 ₫** | `prod-005` × 1 |
| Đúng mức sàn 200k | 200.000 ₫ | 200.000 ₫ (giữ nguyên) | `prod-003` × 1 |
| Cận dưới min SALE20 300k | 299.000 ₫ | **280.000 ₫** | `prod-004` × 1 |
| Đúng min SALE20 300k | 300.000 ₫ | 300.000 ₫ (giữ nguyên) | `prod-001` × 2 |
| Cận dưới trần maxCap | 499.000 ₫ | **490.000 ₫** (giảm 98.000 ₫ < trần) | `prod-001` × 2 + `prod-005` × 1 |
| Chạm trần maxCap | 500.000 ₫ | 500.000 ₫ (giữ nguyên, giảm đúng 100.000 ₫) | `prod-001` × 1 + `prod-002` × 1 |
| Đạt sàn chung nhưng dưới min SALE20 | 250.000 ₫ | **200.000 ₫** hoặc **280.000 ₫** | `prod-003` × 1 |
| Tiền lẻ để kiểm `Math.floor()` | 333.333 ₫ | **KHÔNG TÁI HIỆN ĐƯỢC** | Không có giá lẻ trong catalog |
| Voucher không trừ phí ship | 210.000 ₫ | **KHÔNG QUAN SÁT ĐƯỢC TRỰC TIẾP** | Xem ghi chú ⚠️ bên dưới |

> ⚠️ **Xung đột ngưỡng khiến `VCHR-031` (BR-09) không kiểm chứng được trên FE**: ngưỡng miễn phí vận chuyển (200.000 ₫) **trùng đúng** mức sàn tối thiểu của voucher `GIAM50K` (200.000 ₫). Mọi đơn đủ điều kiện áp mã đều đã được freeship (`shippingFee = 0`), nên không tồn tại trạng thái "vừa có phí ship 30.000 ₫ vừa áp được voucher" để quan sát. Chỉ có thể khẳng định gián tiếp qua công thức `total = subtotal − discount + 0`. **Đã chốt 2026-09-30** (`knowledge` Mục 8 #14): giữ nguyên 2 ngưỡng, kiểm chứng gián tiếp qua công thức tổng tiền và `localStorage["shopgo_orders"]`.

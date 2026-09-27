# ShopGo — Bản Đồ Giao Diện & Locator (UI Map)

> **Tri thức nền dùng chung cho MỌI tính năng của ShopGo.**
> Mọi agent cần thao tác/kiểm thử UI ShopGo **đọc file này trước**, không tự mò DOM.
> Đặc biệt bắt buộc với `qa-exploratory` (web-journey-discovery) và `qa-automation` (pom-generator).

Nguồn: bóc tách trực tiếp từ bundle production `https://cwshopgo.github.io/assets/index-*.js` · Cập nhật: `2026-09-21` · Trạng thái: `APPROVED`

---

## 1. Ràng buộc kiến trúc (đọc trước khi viết locator)

| Điểm | Thực tế | Hệ quả |
|---|---|---|
| Framework | React 18 + Vite, build tĩnh, host GitHub Pages | Không có backend / API để stub |
| Điều hướng | **Không có router.** Đổi màn bằng state `activeTab` | **CẤM `page.goto(<path>)`.** Chỉ điều hướng bằng click nút nav |
| `data-testid` | **Không tồn tại** | Dùng `#id` sẵn có ở §3, hoặc `getByRole` / `getByPlaceholder` |
| Lưu trữ | `localStorage` | Dọn state bằng cách xoá 4 khoá ở §5 |
| Animation | Có framer-motion (chuyển tab, modal) | Assert nên chờ phần tử ổn định, tránh race |
| Âm thanh | WebAudio beep khi click | Không ảnh hưởng test, bỏ qua |

## 2. Bốn màn hình (tab) và cách vào

| Tab | Vào bằng | Điều kiện |
|---|---|---|
| `shop` — Cửa hàng | `#btn-nav-shop` (hoặc click logo ShopGo) | Mặc định khi mở trang. Không cần đăng nhập |
| `checkout` — Thanh toán (Giỏ hàng) | `#btn-nav-checkout` | **Cần đăng nhập — chặn ngay tại bước điều hướng**, xem cảnh báo bên dưới |
| `orders` — Đơn hàng | `#btn-nav-orders` hoặc `#btn-menu-orders` | Cần đăng nhập |
| `profile` — Hồ sơ | `#btn-menu-profile` | Cần đăng nhập |

> ### ⚠️ Cổng đăng nhập nằm ở bước ĐIỀU HƯỚNG, không phải bước đặt hàng
>
> Đã kiểm chứng bằng Playwright trên hệ thống thật: bấm `#btn-nav-checkout` khi **chưa đăng nhập** thì
> cửa sổ đăng nhập bật lên kèm thông báo `Vui lòng đăng nhập để tiến hành thanh toán đơn hàng.`,
> **trang vẫn ở màn Cửa hàng** và giỏ hàng không mở ra. Đăng nhập xong hệ thống mới tự chuyển sang
> màn Thanh toán (cơ chế `authRedirectTab`).
>
> **Hệ quả cho automation**: mọi kịch bản thao tác trong giỏ hàng (số lượng, voucher, tổng tiền, đặt hàng)
> **bắt buộc đăng nhập TRƯỚC**. Không đăng nhập thì `#input-qty-*`, `#input-voucher-code`,
> `#btn-submit-checkout` đều không tồn tại trong DOM.
>
> Modal đăng nhập cũng mở được thủ công bằng `#btn-header-login`.

## 3. Bảng locator theo màn hình

### 3.1. Header / Điều hướng (luôn hiển thị)

| Mục đích | Locator | Ghi chú |
|---|---|---|
| Về Cửa hàng | `#btn-nav-shop` | |
| Sang Thanh toán | `#btn-nav-checkout` | Có badge số lượng sản phẩm trong giỏ |
| Sang Đơn hàng | `#btn-nav-orders` | Có badge số đơn |
| Mở modal đăng nhập | `#btn-header-login` | Chỉ hiện khi **chưa** đăng nhập |
| Mở menu người dùng | `#btn-user-profile` | Chỉ hiện khi **đã** đăng nhập |
| Vào Hồ sơ (trong menu) | `#btn-menu-profile` | Phải mở `#btn-user-profile` trước |
| Vào Đơn hàng (trong menu) | `#btn-menu-orders` | Phải mở `#btn-user-profile` trước |
| Đăng xuất | `#btn-logout` | Phải mở `#btn-user-profile` trước |
| Mở QA Panel | `#btn-toggle-qa-panel` | Có nút, nhưng **không có preset nào dùng được**. Xem §4 |

### 3.2. Màn Cửa hàng (`shop`)

| Mục đích | Locator | Ghi chú |
|---|---|---|
| Ô tìm kiếm sản phẩm | `getByPlaceholder('Tìm theo tên sản phẩm...')` | Lọc theo tên |
| Lọc danh mục | `getByRole('button', { name: <tên> })` | Giá trị: `Tất cả` · `Thời trang` · `Công nghệ` · `Gia dụng` |
| Thêm vào giỏ | `#btn-add-prod-001` … `#btn-add-prod-006` | Pattern: `#btn-add-{productId}` |
| Banner khuyến mãi | `#slide-1` `#slide-2` `#slide-3` | Carousel, có nút CTA lọc theo danh mục |
| Thông báo không có kết quả | `getByText('Không có kết quả khớp với từ khóa')` | Khi tìm kiếm không khớp |

### 3.3. Màn Thanh toán / Giỏ hàng (`checkout`)

| Mục đích | Locator | Ghi chú |
|---|---|---|
| Ô nhập số lượng | `#input-qty-prod-001` … | Pattern: `#input-qty-{productId}`. **Nhận chuỗi tự do** |
| Xoá dòng hàng | `#btn-remove-prod-001` … | Pattern: `#btn-remove-{productId}` |
| Ô nhập mã voucher | `#input-voucher-code` | Placeholder `Nhập mã (GIAM50K, SALE20...)` |
| Áp dụng voucher | `#btn-apply-voucher` | |
| Gỡ voucher đã áp | `#btn-remove-voucher` | Chỉ hiện khi đã áp thành công |
| Chip voucher gợi ý | `#badge-voucher-GIAM50K` · `#badge-voucher-SALE20` · `#badge-voucher-HETHAN` | Pattern: `#badge-voucher-{code}` |
| **Tổng tiền phải trả** | `#label-total-payable` | Điểm assert quan trọng nhất |
| Đặt hàng | `#btn-submit-checkout` | Chưa login → bật modal đăng nhập |
| Đóng hoá đơn sau khi đặt | `#btn-close-receipt` | Modal hoá đơn hiện sau ~3.2 giây |

Các dòng tổng kết tiền (assert bằng text): `Tạm tính (Subtotal):` · `Phí vận chuyển:` · `Giảm giá voucher:` · hiển thị `Miễn phí (Freeship)` khi được miễn phí ship.

### 3.4. Modal Đăng nhập

| Mục đích | Locator |
|---|---|
| Ô email | `getByPlaceholder('Nhập email...')` |
| Ô mật khẩu | `getByPlaceholder('Nhập mật khẩu...')` |
| Hiện danh sách tài khoản demo | `#btn-toggle-demo-accounts` |

### 3.5. Màn Đơn hàng (`orders`) và Hồ sơ (`profile`)

| Mục đích | Locator | Màn |
|---|---|---|
| Mở hộp thoại xoá hết đơn | `#btn-trigger-clear-orders` | `orders` |
| Xác nhận xoá | `#btn-confirm-clear-orders` | `orders` |
| Huỷ xoá | `#btn-cancel-clear-orders` | `orders` |
| Mở hộp thoại xoá hết đơn | `#btn-profile-trigger-clear` | `profile` |
| Xác nhận xoá | `#btn-profile-confirm-clear` | `profile` |
| Huỷ xoá | `#btn-profile-cancel-clear` | `profile` |

## 4. QA Panel — KHÔNG dùng được để seed dữ liệu

> ### ⚠️ Không có preset nào bấm được
>
> Đã kiểm bundle production: hàm `applyPreset` có định nghĩa 4 preset (`giam50k_ok`, `sale20_max_cap`, `all_invalid_qty`, `reset`) nhưng **không nơi nào gọi tới nó**, và không có component nào render các preset. Cả app chỉ có đúng một id liên quan là `#btn-toggle-qa-panel` trên thanh nav.
>
> **Hệ quả:** không hướng dẫn người dùng bấm preset, không viết automation dựa vào preset. Dựng dữ liệu bằng thao tác UI (thêm giỏ `#btn-add-*`, sửa số lượng `#input-qty-*`, áp mã `#input-voucher-code` hoặc chip `#badge-voucher-*`), hoặc ghi thẳng `localStorage`.

Định nghĩa preset trong bundle vẫn là **gợi ý tốt** cho các trạng thái nên dựng bằng tay:

| Trạng thái | Dựng bằng UI |
|---|---|
| Đơn đủ điều kiện `GIAM50K` | 2 × `prod-001` (2 × 150.000 = 300.000 ₫), áp `GIAM50K` |
| `SALE20` chạm trần giảm | 2 × `prod-002` (2 × 350.000 = 700.000 ₫), áp `SALE20`. Định nghĩa preset ghi trần **100.000 ₫**, cần xác nhận bằng thao tác thật |
| Hai dòng lỗi số lượng | `prod-001` nhập `abc`, `prod-002` nhập `-5` |

Ba mã giảm giá có thật và dùng được: `GIAM50K`, `SALE20`, `HETHAN`.

## 5. Dọn trạng thái giữa các ca kiểm thử

Xoá 4 khoá `localStorage`:

```
shopgo_user                  ← phiên đăng nhập
shopgo_orders                ← đơn hàng (bản cũ)
shopgo_sqlite_orders_v1      ← đơn hàng (bản hiện hành)
shopgo_sqlite_queries_log    ← log câu lệnh SQLite giả lập
```

Trong Playwright, gọi sau khi đã vào trang (origin phải khớp thì `localStorage` mới truy cập được).

## 6. Dữ liệu mẫu có sẵn trên hệ thống

### 6.1. Tài khoản

| Email | Mật khẩu | Vai trò | Tên hiển thị |
|---|---|---|---|
| `khachhang@shopgo.vn` | `123456` | `customer` | Nguyễn Văn An |
| `vip@shopgo.vn` | `123456` | `vip` | Trần Thị Mai (VIP) |

### 6.2. Sản phẩm

| ID | Tên | Giá (₫) | Giá gốc (₫) | Danh mục | Tồn kho |
|---|---|---|---|---|---|
| `prod-001` | Áo thun Trendy Unisex | 150.000 | 199.000 | Thời trang | 50 |
| `prod-002` | Tai nghe Bluetooth Không Dây | 350.000 | 500.000 | Công nghệ | **12** |
| `prod-003` | Bình nước giữ nhiệt Kim Loại | 200.000 | 280.000 | Gia dụng | 25 |
| `prod-004` | Balo Chống Nước Oxford | 280.000 | 399.000 | Thời trang | 18 |
| `prod-005` | Sạc dự phòng Siêu Nhanh 20W | 190.000 | 250.000 | Công nghệ | 30 |
| `prod-006` | Đèn để bàn LED Chống Cận | 120.000 | 180.000 | Gia dụng | **8** |

> `prod-006` (tồn 8) và `prod-002` (tồn 12) là hai ứng viên tốt nhất cho ca kiểm thử biên tồn kho.

### 6.3. Ảnh sản phẩm

`/images/tshirt.png` · `headphones.png` · `thermos.png` · `backpack.png` · `powerbank.png` · `lamp.png` — đã kiểm chứng trả về HTTP 200.

## 7. Thông điệp hệ thống (để assert chính xác, không diễn đạt lại)

| Bối cảnh | Thông điệp nguyên văn |
|---|---|
| Số lượng để trống | `Số lượng không được để trống` |
| Số lượng không phải số nguyên | `Số lượng phải là chữ số nguyên` |
| Số lượng ≤ 0 | `Số lượng phải lớn hơn 0 (>= 1)` |
| Số lượng vượt tồn | `Vượt quá tồn kho (N)` — `N` là số tồn thật |
| Chưa nhập mã | `Vui lòng nhập mã khuyến mãi.` |
| Mã không tồn tại | `Mã giảm giá "<mã>" không tồn tại trên hệ thống.` |
| Mã hết hạn | `Mã giảm giá "<mã>" đã hết hạn sử dụng.` |
| Áp mã thành công | `Áp dụng thành công mã "<mã>": Giảm <số tiền>.` |

> ### ⚠️ Ba tình huống "không đủ điều kiện voucher" — ba thông điệp KHÁC NHAU
>
> Đã kiểm chứng bằng Playwright. Rất dễ nhầm, nhầm là test đỏ:
>
> | Tình huống | Thông điệp nguyên văn |
> |---|---|
> | **(1)** Bấm *Áp dụng* khi đơn **chưa đạt** mức tối thiểu | `Đơn hàng chưa đạt mức tối thiểu 200.000 ₫ (Hiện có 150.000 ₫).` — có kèm **cả hai** con số |
> | **(2)** Đã áp mã thành công rồi, sau đó **sửa giỏ hàng** làm mất điều kiện | Banner cảnh báo `Mã "<mã>" chưa đủ điều kiện áp dụng` kèm dòng gợi ý thêm hàng |
> | **(3)** Bấm **Đặt hàng** trong khi mã đang không hợp lệ | `Vui lòng gỡ hoặc bổ sung giỏ hàng để đạt điều kiện voucher.` |
| Thiếu email/mật khẩu | `Vui lòng nhập đầy đủ Email và Mật khẩu.` |
| Sai thông tin đăng nhập | `Thông tin đăng nhập không chính xác.` |
| Sai mật khẩu | `Mật khẩu không chính xác.` |
| Chưa login mà đặt hàng | `Vui lòng đăng nhập để tiến hành thanh toán đơn hàng.` |
| Sau khi xoá hết đơn | `Đã xóa sạch toàn bộ lịch sử đơn hàng khỏi cơ sở dữ liệu SQLite.` |

## 8. Nhãn vai trò hiển thị

| Vị trí | `customer` | `vip` |
|---|---|---|
| Menu người dùng | `Khách Hàng Thân Thiết 👤` | `Khách VIP ⭐` |
| Màn Hồ sơ | `Khách Hàng Tiêu Chuẩn 👤` | `Khách Hàng VIP ⭐` |

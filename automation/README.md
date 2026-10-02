# automation/ — Tầng Kiểm Thử Tự Động Playwright

Khung Page Object Model cho SUT **ShopGo** (`https://cwshopgo.github.io`).

```
automation/
├─ pages/
│   ├─ BasePage.ts      điều hướng chung · dọn trạng thái · parseMoney()
│   ├─ ShopPage.ts      màn Cửa hàng: thêm giỏ, tìm kiếm, lọc danh mục
│   ├─ CheckoutPage.ts  màn Thanh toán: số lượng, voucher, tổng tiền, đặt hàng
│   └─ LoginModal.ts    cửa sổ đăng nhập + danh sách tài khoản mẫu
├─ tests/
│   └─ smoke.spec.ts    bộ test mồi — 5 ca, đã chạy xanh
└─ README.md
```

Cấu hình: [`playwright.config.ts`](../playwright.config.ts) ở thư mục gốc.

---

## Chạy

```bash
npm run test:e2e           # chạy ngầm, không mở cửa sổ trình duyệt
npm run test:e2e:headed    # mở trình duyệt để nhìn thấy thao tác
npm run test:e2e:ui        # chế độ giao diện, chạy từng ca, xem lại từng bước
npm run test:report        # mở báo cáo HTML sau khi chạy
```

---

## Năm ràng buộc cứng

Vi phạm là bị trả lại sửa (`Verdict: FIX`).

### 1. Không dùng `page.goto()` để chuyển màn

ShopGo **không có router**. Đổi màn bằng trạng thái nội bộ.

```ts
// SAI — không có đường dẫn nào như vậy
await page.goto('/checkout');

// ĐÚNG
await checkout.gotoCheckout();
```

`BasePage.open()` là nơi **duy nhất** được gọi `goto`, và chỉ tới trang chủ.

### 2. Đăng nhập trước khi vào màn Thanh toán

Tab Thanh toán bị chặn ngay ở bước điều hướng. Chưa đăng nhập thì `#input-qty-*`, `#input-voucher-code`, `#btn-submit-checkout` **không tồn tại trong DOM**.

```ts
await login.loginAs('customer');   // phải có bước này trước
await shop.addToCart('prod-001');
await shop.gotoCheckout();
```

### 3. Thứ tự ưu tiên locator

`#id` có sẵn → `getByRole` → `getByPlaceholder` → `getByText`

Bản đồ id đầy đủ: [`knowledge/features/shopgo-ui-map.md`](../knowledge/features/shopgo-ui-map.md)

**Cấm** XPath tuyệt đối (`/html/body/div[2]/...`) và class CSS băm (`css-1x2y3z`).

### 4. So sánh tiền qua `parseMoney()`

Chuỗi tiền của ShopGo có ký tự `₫` và khoảng trắng hẹp — so chuỗi thô sẽ lệch.

```ts
// SAI
await expect(checkout.totalPayable).toHaveText('250.000 ₫');

// ĐÚNG
expect(await checkout.getTotalPayable()).toBe(250_000);
```

### 5. Dọn trạng thái ở `beforeEach`

Trạng thái sống trong bộ nhớ trình duyệt qua cả lần tải lại. Không dọn thì test lúc xanh lúc đỏ.

```ts
test.beforeEach(async ({ page }) => {
  const shop = new ShopPage(page);
  await shop.open();
  await shop.resetState();
});
```

---

## Viết bài của nhóm

Tạo file riêng theo scope của đề, **không sửa** `smoke.spec.ts`:

| Đề | File |
|---|---|
| 01 | `automation/tests/voucher.spec.ts` |
| 02 | `automation/tests/cart-quantity.spec.ts` |
| 03 | `automation/tests/auth.spec.ts` |
| 04 | `automation/tests/checkout.spec.ts` |

Tên mỗi ca test bắt đầu bằng `TC_ID` để đối chiếu ngược về `05_test_case_spec.md`:

```ts
test('VCHR-003 Áp mã SALE20 chạm trần giảm 100.000 đ', async ({ page }) => { ... });
```

---

## Mẹo tiết kiệm thời gian

**Không dùng QA Panel.** Nút `#btn-toggle-qa-panel` có trên nav nhưng không có preset nào bấm được (`knowledge/features/shopgo-ui-map.md` §4). Dựng giỏ hàng bằng hàm POM có sẵn, gom vào một hàm dùng chung trong `beforeEach` để đỡ lặp:

| Trạng thái | Dựng bằng |
|---|---|
| Đơn đủ điều kiện `GIAM50K` | 2 × `prod-001` (300.000 ₫), áp `GIAM50K` |
| `SALE20` chạm trần | 2 × `prod-002` (700.000 ₫), áp `SALE20` |
| Hai dòng lỗi số lượng | `setQuantity('prod-001', 'abc')` · `setQuantity('prod-002', '-5')` |
| Giỏ sạch | `resetState()` |

---

## Bằng chứng kiểm thử

Cấu hình đã bật sẵn: ảnh chụp và trace **chỉ lưu khi ca thất bại**.

Sau khi chạy, sao chép ảnh bằng chứng vào thư mục đợt chạy:

```
OUTPUT/<task-slug>/runs/<ticket>/evidence/
```

Thư mục `automation/test-results/` và `automation/playwright-report/` là tạm thời, đã được bỏ qua khi commit và **không nộp**.

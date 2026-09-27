# Hành Trình Người Dùng Web Thực Tế & Kịch Bản Gherkin BDD
**Feature Slug**: `function-d-voucher` · **URL Web Live**: `https://cwshopgo.github.io/` · **Chuyên gia thực hiện**: `qa-exploratory`

Tài liệu này chuẩn hóa toàn bộ hành trình trải nghiệm thực tế từ trạng thái khách vãng lai, đăng nhập xác thực, thao tác giỏ hàng, áp mã giảm giá đến hoàn tất thanh toán trên ứng dụng Web Live ShopGo.

---

## 1. Hành Trình Người Dùng Khám Phá Được (Web Journey Maps)

### Hành Trình 1: Khách vãng lai cố truy cập Thanh toán (Authentication Gate)
- **Hành vi**: Người dùng mở trang web, thêm sản phẩm vào giỏ, bấm nút "Thanh toán".
- **Phản hồi hệ thống**: Modal đăng nhập `#modal-auth` xuất hiện, chặn không cho vào giỏ hàng/thanh toán nếu chưa xác thực danh tính.

### Hành Trình 2: Đăng nhập và Áp dụng Voucher thành công (Happy Path)
- **Hành vi**:
  1. Đăng nhập với tài khoản `khachhang@shopgo.vn` / `123456`.
  2. Chọn sản phẩm có giá trị >= 200.000 VNĐ (ví dụ: Tai nghe Bluetooth 350.000 VNĐ).
  3. Mở trang Thanh toán.
  4. Nhập mã `GIAM50K` và bấm "Áp dụng".
  5. Hệ thống hiển thị chiết khấu `-50.000 ₫`, tổng tiền còn `300.000 ₫`, xuất hiện nút "Gỡ mã".
  6. Bấm "Tiến hành Đặt hàng", xuất hiện modal xử lý giao dịch và modal xác nhận đặt hàng thành công kèm mã đơn `SG-XXXXXX`.

---

## 2. Kịch Bản Gherkin BDD Chuẩn Hóa

### Kịch Bản BDD 1: Chặn khách vãng lai truy cập bước thanh toán
```gherkin
Feature: Cổng Xác Thực Thanh Toán
  Rule: Khách hàng phải đăng nhập mới được truy cập bước thanh toán

  Scenario: Khách vãng lai bấm nút Thanh toán bị chặn bởi Modal đăng nhập
    Given Khách hàng đang ở trang chủ "https://cwshopgo.github.io/" ở trạng thái Khách vãng lai (Guest)
    When Khách hàng bấm nút "Thanh toán" trên thanh điều hướng
    Then Hệ thống hiển thị Modal đăng nhập với tiêu đề "Đăng nhập vào ShopGo"
    And Hiển thị thông báo "Vui lòng đăng nhập để tiến hành thanh toán đơn hàng."
    And Khách hàng không thể xem chi tiết thanh toán cho đến khi hoàn tất đăng nhập
```

### Kịch Bản BDD 2: Đăng nhập, áp dụng mã GIAM50K và thanh toán thành công
```gherkin
Feature: Áp Dụng Mã Giảm Giá & Thanh Toán Đơn Hàng
  Rule: Đơn hàng từ 200.000 VNĐ được áp dụng mã giảm giá và đặt hàng thành công

  Scenario: Khách hàng đăng nhập, thêm hàng 350k, áp mã GIAM50K và thanh toán
    Given Khách hàng đăng nhập thành công với tài khoản "khachhang@shopgo.vn"
    And Khách hàng đã thêm sản phẩm "Tai nghe Bluetooth Không Dây" giá "350.000 ₫" vào giỏ
    And Khách hàng đang ở màn hình "Thanh toán"
    When Khách hàng nhập mã "GIAM50K" vào ô mã khuyến mãi
    And Khách hàng bấm nút "Áp dụng"
    Then Hệ thống hiển thị thông báo thành công 'Áp dụng thành công mã "GIAM50K": Giảm 50.000 ₫.'
    And Dòng "Giảm giá voucher" hiển thị "-50.000 ₫"
    And Dòng "Phí vận chuyển" hiển thị "Miễn phí (Freeship)"
    And Dòng "Tổng thanh toán" cập nhật chính xác thành "300.000 ₫"
    When Khách hàng bấm nút "Tiến hành Đặt hàng (300.000 ₫)"
    Then Hệ thống hiển thị màn hình "Đặt hàng thành công!"
    And Hiển thị mã đơn hàng dạng "SG-XXXXXX"
    And Hiển thị nút "Hoàn tất & Tiếp tục mua sắm"
```

---

## 3. Bảng Ánh Xạ Step ➔ Playwright Locators (Sẵn sàng cho Page Object Model)

| Gherkin Step | Hành động Playwright | Target Selector / Code mẫu | Trạng thái xác thực |
|---|---|---|---|
| Khách bấm nút "Thanh toán" | Click | `page.locator('button:has-text("Thanh toán")').click()` | Đã test thực tế |
| Modal đăng nhập hiển thị | Verify Visible | `page.locator('#modal-auth')` | Đã test thực tế |
| Đăng nhập tài khoản An | Click | `page.locator('button:has-text("Đăng nhập")').first().click()` | Đã test thực tế |
| Thêm Tai nghe vào giỏ | Click | `page.locator('#btn-add-prod-002').click()` | Đã test thực tế |
| Nhập mã voucher GIAM50K | Fill | `page.locator('#input-voucher-code').fill('GIAM50K')` | Đã test thực tế |
| Bấm nút Áp dụng | Click | `page.locator('#btn-apply-voucher').click()` | Đã test thực tế |
| Verify thông báo thành công | Verify Text | `page.getByText('Áp dụng thành công mã "GIAM50K"')` | Đã test thực tế |
| Verify giảm giá 50k | Verify Text | `page.getByText('-50.000 ₫')` | Đã test thực tế |
| Verify tổng tiền 300k | Verify Text | `page.locator('#order-total, generic:has-text("300.000 ₫")')` | Đã test thực tế |
| Bấm Đặt hàng | Click | `page.locator('#btn-submit-checkout').click()` | Đã test thực tế |
| Verify Đặt hàng thành công | Verify Visible | `page.getByRole('heading', { name: 'Đặt hàng thành công!' })` | Đã test thực tế |

---

## 4. Minh Chứng Thực Tế (Evidence)
- Ảnh chụp màn hình hoàn tất thanh toán có áp mã `GIAM50K`:
  `OUTPUT/function-d-voucher/evidence/checkout_success_with_voucher.png`

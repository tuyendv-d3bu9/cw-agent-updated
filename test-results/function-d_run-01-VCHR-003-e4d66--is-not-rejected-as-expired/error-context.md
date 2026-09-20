# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: function-d_run-01.spec.ts >> VCHR-003: Verify a current voucher is not rejected as expired
- Location: automation/tests/function-d_run-01.spec.ts:28:5

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByText(/Mã giảm giá "HETHAN" đã hết hạn sử dụng/i)
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" getByText(/Mã giảm giá "HETHAN" đã hết hạn sử dụng/i) with timeout 5000ms
  - waiting for getByText(/Mã giảm giá "HETHAN" đã hết hạn sử dụng/i)
    14 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]: Ưu Đãi Đặc Biệt
    - generic [ref=e6]:
      - text: 🔥 Miễn phí vận chuyển toàn quốc đơn từ 200.000 ₫ • Nhập mã
      - strong [ref=e7]: GIAM50K
      - text: hoặc
      - strong [ref=e8]: SALE20
      - text: để nhận ưu đãi!
  - banner [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e16] [cursor=pointer]:
        - heading "ShopGo Store v2.0" [level=1] [ref=e17]:
          - text: ShopGo
          - generic [ref=e18]: Store v2.0
        - paragraph [ref=e19]: Mua Sắm Trực Tuyến Hàng Đầu
      - generic [ref=e20]:
        - button "Cửa hàng" [ref=e21]
        - button "Thanh toán 1" [ref=e25]:
          - generic [ref=e30]: Thanh toán
          - generic [ref=e31]: "1"
        - button "Đơn hàng" [ref=e32]
        - button "NA Nguyễn Văn An khachhang@shopgo.vn" [ref=e38] [cursor=pointer]:
          - generic [ref=e39]: NA
          - generic [ref=e40]:
            - generic [ref=e41]: Nguyễn Văn An
            - generic [ref=e43]: khachhang@shopgo.vn
  - main [ref=e47]:
    - generic [ref=e48]:
      - button "Quay lại Cửa hàng" [ref=e50] [cursor=pointer]
      - generic [ref=e54]:
        - generic [ref=e55]:
          - generic [ref=e56]:
            - heading "Chi tiết giỏ hàng" [level=3] [ref=e62]
            - generic [ref=e63]: 1 sản phẩm
          - generic [ref=e66]:
            - img "Tai nghe Bluetooth Không Dây" [ref=e68]
            - generic [ref=e69]:
              - generic [ref=e70]:
                - heading "Tai nghe Bluetooth Không Dây" [level=4] [ref=e71]
                - button "Xóa khỏi giỏ hàng" [ref=e72] [cursor=pointer]
              - paragraph [ref=e76]: "Đơn giá: 350.000 ₫"
              - generic [ref=e77]:
                - generic [ref=e78]:
                  - generic [ref=e79]: "Số lượng:"
                  - generic [ref=e80]:
                    - button [disabled] [ref=e81] [cursor=pointer]
                    - textbox [ref=e83]: "1"
                    - button [ref=e84] [cursor=pointer]
                  - generic [ref=e86]: "(Kho: 12)"
                - generic [ref=e87]: Thành tiền:350.000 ₫
        - generic [ref=e88]:
          - generic [ref=e89]:
            - heading "Mã khuyến mãi (Voucher)" [level=4] [ref=e93]
            - generic [ref=e94]:
              - generic [ref=e95]:
                - textbox "Nhập mã (GIAM50K, SALE20...)" [ref=e96]: HETHAN
                - button [ref=e97]
              - button "Áp dụng" [active] [ref=e101] [cursor=pointer]
            - generic [ref=e102]: Mã giảm giá "HETHAN" đã hết hạn sử dụng.
            - generic [ref=e106]:
              - generic [ref=e107]: "Mã giảm giá có sẵn (Bấm để áp dụng nhanh):"
              - generic [ref=e108]:
                - button "GIAM50K Giảm ngay 50.000 ₫ cho đơn hàng tối thiểu từ 200.000 ₫. Áp dụng →" [ref=e109] [cursor=pointer]:
                  - generic [ref=e110]:
                    - generic [ref=e111]: GIAM50K
                    - generic [ref=e112]: Giảm ngay 50.000 ₫ cho đơn hàng tối thiểu từ 200.000 ₫.
                  - generic [ref=e113]: Áp dụng →
                - button "SALE20 Giảm 20% giá trị đơn hàng cho đơn từ 300.000 ₫ (Giảm tối đa 100.000 ₫). Áp dụng →" [ref=e114] [cursor=pointer]:
                  - generic [ref=e115]:
                    - generic [ref=e116]: SALE20
                    - generic [ref=e117]: Giảm 20% giá trị đơn hàng cho đơn từ 300.000 ₫ (Giảm tối đa 100.000 ₫).
                  - generic [ref=e118]: Áp dụng →
                - button "HETHAN Mã giảm giá đã hết hạn sử dụng. Áp dụng →" [ref=e119] [cursor=pointer]:
                  - generic [ref=e120]:
                    - generic [ref=e121]: HETHAN
                    - generic [ref=e122]: Mã giảm giá đã hết hạn sử dụng.
                  - generic [ref=e123]: Áp dụng →
          - generic [ref=e124]:
            - heading "Chi tiết thanh toán" [level=4] [ref=e129]
            - generic [ref=e130]:
              - generic [ref=e131]:
                - generic [ref=e132]: "Tạm tính (Subtotal):"
                - generic [ref=e133]: 350.000 ₫
              - generic [ref=e134]:
                - generic [ref=e135]: "Phí vận chuyển:"
                - generic [ref=e141]: Miễn phí (Freeship)
              - generic [ref=e142]:
                - generic [ref=e143]: "Giảm giá voucher:"
                - generic [ref=e144]: 0 ₫
              - generic [ref=e146]:
                - generic [ref=e147]: "Tổng thanh toán:"
                - generic [ref=e148]: 350.000 ₫
            - button "Tiến hành Đặt hàng (350.000 ₫)" [ref=e149] [cursor=pointer]
  - contentinfo [ref=e154]:
    - generic [ref=e156]:
      - generic [ref=e162]:
        - heading "Đăng ký nhận bản tin khuyến mãi ShopGo" [level=3] [ref=e163]
        - paragraph [ref=e164]: Nhận ngay voucher 50.000 ₫ cho đơn hàng đầu tiên & thông báo Flash Sale sớm nhất.
      - generic [ref=e165]:
        - textbox "Nhập email của bạn..." [ref=e166]
        - button "Đăng ký" [ref=e167] [cursor=pointer]
    - generic [ref=e172]:
      - generic [ref=e173]:
        - generic [ref=e174]:
          - generic [ref=e175]: ShopGo Vietnam
          - paragraph [ref=e181]: Nền tảng thương mại điện tử hàng đầu tại Việt Nam, mang đến trải nghiệm mua sắm thông minh, an tâm 100% hàng chính hãng cùng chính sách giao hàng và đổi trả vượt trội.
          - list [ref=e182]:
            - listitem [ref=e183]:
              - link "Về chúng tôi & Câu chuyện thương hiệu" [ref=e184] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e185]:
              - link "Tuyển dụng nhân tài ShopGo" [ref=e186] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e187]:
              - link "Quy chế hoạt động sàn TMĐT" [ref=e188] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e189]:
              - link "Chính sách bảo mật thông tin cá nhân" [ref=e190] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e191]:
              - link "Bán hàng doanh nghiệp (B2B) & Đại lý" [ref=e192] [cursor=pointer]:
                - /url: "#"
        - generic [ref=e193]:
          - heading "Chăm Sóc Khách Hàng" [level=4] [ref=e194]
          - list [ref=e195]:
            - listitem [ref=e196]:
              - link "Trung tâm trợ giúp & Câu hỏi thường gặp" [ref=e197] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e198]:
              - link "Hướng dẫn đặt hàng & sử dụng mã giảm giá" [ref=e199] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e200]:
              - link "Chính sách giao hàng & Freeship từ 200k" [ref=e201] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e202]:
              - link "Chính sách đổi trả & hoàn tiền 30 ngày" [ref=e203] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e204]:
              - link "Chính sách đồng kiểm khi nhận hàng" [ref=e205] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e206]:
              - link "Chính sách bảo hành sản phẩm chính hãng" [ref=e207] [cursor=pointer]:
                - /url: "#"
          - generic [ref=e209]:
            - paragraph [ref=e210]: "Tổng đài hỗ trợ miễn phí:"
            - paragraph [ref=e211]: 1900 0000
            - paragraph [ref=e212]: 8:00 - 22:00 (Tất cả các ngày trong tuần)
        - generic [ref=e213]:
          - generic [ref=e214]:
            - heading "Phương Thức Thanh Toán" [level=4] [ref=e215]
            - generic [ref=e216]:
              - generic [ref=e217]: VISA
              - generic [ref=e218]: Mastercard
              - generic [ref=e219]: JCB
              - generic [ref=e220]: VNPAY-QR
              - generic [ref=e221]: MoMo
              - generic [ref=e222]: ZaloPay
              - generic [ref=e223]: Tiền mặt COD
          - generic [ref=e224]:
            - heading "Đối Tác Vận Chuyển" [level=4] [ref=e225]
            - generic [ref=e226]:
              - generic [ref=e227]: GHN Express
              - generic [ref=e228]: GHTK
              - generic [ref=e229]: Viettel Post
              - generic [ref=e230]: Shopee Xpress
              - generic [ref=e231]: J&T Express
          - generic [ref=e232]:
            - heading "Chứng Nhận Uy Tín" [level=4] [ref=e233]
            - generic [ref=e234]:
              - generic [ref=e235]: Đã Đăng Ký BCT
              - generic [ref=e239]: SSL
        - generic [ref=e243]:
          - heading "Thông Tin Doanh Nghiệp" [level=4] [ref=e244]
          - paragraph [ref=e245]: CÔNG TY CỔ PHẦN THƯƠNG MẠI ĐIỆN TỬ SHOPGO VIỆT NAM
          - paragraph [ref=e246]:
            - strong [ref=e247]: "Mã số thuế / ĐKKD:"
            - text: 0123456789 do Sở Kế hoạch & Đầu tư TP.HN cấp ngày 01/01/2026.
          - generic [ref=e248]:
            - paragraph [ref=e249]:
              - generic [ref=e253]:
                - strong [ref=e254]: "Trụ sở chính:"
                - text: Tòa nhà 3D, số 3 phố Duy Tân, Phường Cầu Giấy, Hà Nội
            - paragraph [ref=e255]:
              - generic [ref=e259]:
                - strong [ref=e260]: "Chi nhánh Đà Nẵng:"
                - text: Tầng 10 Toà nhà VietinBank, số 36 Trần Quốc Toản, Phường Hải Châu, Đà Nẵng.
            - paragraph [ref=e261]:
              - generic [ref=e264]:
                - strong [ref=e265]: "Hotline:"
                - text: 1900 0000 |
                - strong [ref=e266]: "Email:"
                - text: cskh@shopgo.vn
          - generic [ref=e267]:
            - link "Github" [ref=e268] [cursor=pointer]:
              - /url: "#"
            - link "Website" [ref=e272] [cursor=pointer]:
              - /url: "#"
            - link "Email CSKH" [ref=e276] [cursor=pointer]:
              - /url: "#"
      - generic [ref=e280]:
        - paragraph [ref=e281]: © 2026 CÔNG TY CỔ PHẦN THƯƠNG MẠI ĐIỆN TỬ SHOPGO VIỆT NAM. Toàn bộ quyền được bảo lưu.
        - generic [ref=e282]:
          - generic [ref=e283]:
            - text: "Khu vực:"
            - strong [ref=e284]: Việt Nam (Tiếng Việt)
          - generic [ref=e286]: Hệ Thống Trực Tuyến 24/7
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { CheckoutVoucherPage } from '../pages/CheckoutVoucherPage';
  3  | 
  4  | const evidence = 'OUTPUT/function-d/runs/RUN-01_function-d/evidence';
  5  | 
  6  | test.afterEach(async ({ page }, testInfo) => {
  7  |   const outcome = testInfo.status === testInfo.expectedStatus ? 'pass' : 'fail';
  8  |   const id = testInfo.title.match(/(VCHR-\d+)/)?.[1] ?? 'unknown';
  9  |   await page.screenshot({ path: `${evidence}/${id}_${outcome}.png`, fullPage: true });
  10 | });
  11 | 
  12 | test('VCHR-001: Validate unauthenticated user is blocked before voucher application', async ({ page }) => {
  13 |   const checkout = new CheckoutVoucherPage(page);
  14 |   await checkout.addItemAndOpenCheckout();
  15 |   await expect(page.getByText('Vui lòng đăng nhập để tiến hành thanh toán đơn hàng.')).toBeVisible();
  16 |   await expect(checkout.voucherInput).toHaveCount(0);
  17 | });
  18 | 
  19 | test('VCHR-002: Verify GIAM50K is applied to an eligible order', async ({ page }) => {
  20 |   const checkout = new CheckoutVoucherPage(page);
  21 |   await checkout.addItemAndOpenCheckout();
  22 |   await checkout.loginAndOpenVoucher();
  23 |   await checkout.apply('GIAM50K');
  24 |   await expect(page.getByText(/Áp dụng thành công mã "GIAM50K"/i)).toBeVisible();
  25 |   await expect(page.getByText(/-50\.000\s*₫/)).toBeVisible();
  26 | });
  27 | 
  28 | test('VCHR-003: Verify a current voucher is not rejected as expired', async ({ page }) => {
  29 |   const checkout = new CheckoutVoucherPage(page);
  30 |   await checkout.addItemAndOpenCheckout();
  31 |   await checkout.loginAndOpenVoucher();
  32 |   await checkout.apply('HETHAN');
> 33 |   await expect(page.getByText(/Mã giảm giá "HETHAN" đã hết hạn sử dụng/i)).toHaveCount(0);
     |                                                                            ^ Error: expect(locator).toHaveCount(expected) failed
  34 | });
  35 | 
  36 | test('VCHR-004: Verify unknown voucher message', async ({ page }) => {
  37 |   const checkout = new CheckoutVoucherPage(page);
  38 |   await checkout.addItemAndOpenCheckout();
  39 |   await checkout.loginAndOpenVoucher();
  40 |   await checkout.apply('INVALID');
  41 |   await expect(page.getByText(/Mã giảm giá "INVALID" không tồn tại trên hệ thống/i)).toBeVisible();
  42 | });
  43 | 
```
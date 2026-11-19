# ShopGo — UI Map & Locators

> **Shared background knowledge for EVERY ShopGo feature.**
> Every agent that operates or tests the ShopGo UI **reads this file first** and does not inspect the DOM on its own.
> Mandatory for `qa-automation` (web-journey-discovery, pom-generator).

Source: extracted directly from the production bundle `https://cwshopgo.github.io/assets/index-*.js` · Updated: `2026-09-21` · Status: `APPROVED`

> **Language note.** The ShopGo application UI is in Vietnamese. Every on-screen string, placeholder and
> message below is kept **verbatim in Vietnamese** (assert on it exactly as written); the English text in
> parentheses is a translation for reading only and never appears in the app.

---

## 1. Architecture constraints (read before writing a locator)

| Point | Reality | Consequence |
|---|---|---|
| Framework | React 18 + Vite, static build, hosted on GitHub Pages | No backend / API to stub |
| Navigation | **No router.** Screens change through the `activeTab` state | **`page.goto(<path>)` is FORBIDDEN.** Navigate only by clicking nav buttons |
| `data-testid` | **Does not exist** | Use the existing `#id`s in §3, or `getByRole` / `getByPlaceholder` |
| Storage | `localStorage` | Reset state by deleting the 4 keys in §5 |
| Animation | framer-motion (tab change, modals) | Assertions should wait for the element to be stable; avoid races |
| Sound | WebAudio beep on click | Does not affect tests; ignore |

## 2. Four screens (tabs) and how to reach them

| Tab | Reached by | Condition |
|---|---|---|
| `shop` — Shop | `#btn-nav-shop` (or click the ShopGo logo) | Default when the page opens. No login needed |
| `checkout` — Checkout (Cart) | `#btn-nav-checkout` | **Login required — blocked at the navigation step**, see the warning below |
| `orders` — Orders | `#btn-nav-orders` or `#btn-menu-orders` | Login required |
| `profile` — Profile | `#btn-menu-profile` | Login required |

> ### Warning: the login gate is at the NAVIGATION step, not at the order step
>
> Verified with Playwright on the real system: clicking `#btn-nav-checkout` while **not logged in** opens the
> login window with the message `Vui lòng đăng nhập để tiến hành thanh toán đơn hàng.` (Please log in to
> check out your order.), **the page stays on the Shop screen** and the cart does not open. Only after
> logging in does the system switch to the Checkout screen (the `authRedirectTab` mechanism).
>
> **Consequence for automation**: every scenario in the cart (quantity, voucher, total, place order)
> **must log in FIRST**. Without login, `#input-qty-*`, `#input-voucher-code` and
> `#btn-submit-checkout` do not exist in the DOM.
>
> The login modal can also be opened manually with `#btn-header-login`.

## 3. Locators by screen

### 3.1. Header / Navigation (always visible)

| Purpose | Locator | Note |
|---|---|---|
| Go to Shop | `#btn-nav-shop` | |
| Go to Checkout | `#btn-nav-checkout` | Has a badge with the number of products in the cart |
| Go to Orders | `#btn-nav-orders` | Has a badge with the number of orders |
| Open the login modal | `#btn-header-login` | Shown only when **not** logged in |
| Open the user menu | `#btn-user-profile` | Shown only when **logged in** |
| Go to Profile (in the menu) | `#btn-menu-profile` | Open `#btn-user-profile` first |
| Go to Orders (in the menu) | `#btn-menu-orders` | Open `#btn-user-profile` first |
| Log out | `#btn-logout` | Open `#btn-user-profile` first |
| Open the QA Panel | `#btn-toggle-qa-panel` | The button exists, but **no preset is usable**. See §4 |

### 3.2. Shop screen (`shop`)

| Purpose | Locator | Note |
|---|---|---|
| Product search box | `getByPlaceholder('Tìm theo tên sản phẩm...')` (Search by product name...) | Filters by name |
| Category filter | `getByRole('button', { name: <name> })` | Values: `Tất cả` (All) · `Thời trang` (Fashion) · `Công nghệ` (Technology) · `Gia dụng` (Household) |
| Add to cart | `#btn-add-prod-001` … `#btn-add-prod-006` | Pattern: `#btn-add-{productId}` |
| Promotion banner | `#slide-1` `#slide-2` `#slide-3` | Carousel, with a CTA button that filters by category |
| No-result message | `getByText('Không có kết quả khớp với từ khóa')` (No results match the keyword) | When the search has no match |

### 3.3. Checkout / Cart screen (`checkout`)

| Purpose | Locator | Note |
|---|---|---|
| Quantity input | `#input-qty-prod-001` … | Pattern: `#input-qty-{productId}`. **Accepts free text** |
| Remove line | `#btn-remove-prod-001` … | Pattern: `#btn-remove-{productId}` |
| Voucher code input | `#input-voucher-code` | Placeholder `Nhập mã (GIAM50K, SALE20...)` (Enter code (GIAM50K, SALE20...)) |
| Apply voucher | `#btn-apply-voucher` | |
| Remove applied voucher | `#btn-remove-voucher` | Shown only after a successful apply |
| Suggested voucher chip | `#badge-voucher-GIAM50K` · `#badge-voucher-SALE20` · `#badge-voucher-HETHAN` | Pattern: `#badge-voucher-{code}` |
| **Total payable** | `#label-total-payable` | The most important assertion point |
| Place order | `#btn-submit-checkout` | Not logged in → opens the login modal |
| Close receipt after ordering | `#btn-close-receipt` | The receipt modal appears after ~3.2 seconds |

Summary lines (assert by text): `Tạm tính (Subtotal):` (Subtotal) · `Phí vận chuyển:` (Shipping fee) · `Giảm giá voucher:` (Voucher discount) · shows `Miễn phí (Freeship)` (Free shipping) when shipping is free.

### 3.4. Login modal

| Purpose | Locator |
|---|---|
| Email input | `getByPlaceholder('Nhập email...')` (Enter email...) |
| Password input | `getByPlaceholder('Nhập mật khẩu...')` (Enter password...) |
| Show the demo account list | `#btn-toggle-demo-accounts` |

### 3.5. Orders (`orders`) and Profile (`profile`) screens

| Purpose | Locator | Screen |
|---|---|---|
| Open the clear-all-orders dialog | `#btn-trigger-clear-orders` | `orders` |
| Confirm clear | `#btn-confirm-clear-orders` | `orders` |
| Cancel clear | `#btn-cancel-clear-orders` | `orders` |
| Open the clear-all-orders dialog | `#btn-profile-trigger-clear` | `profile` |
| Confirm clear | `#btn-profile-confirm-clear` | `profile` |
| Cancel clear | `#btn-profile-cancel-clear` | `profile` |

## 4. QA Panel — NOT usable for seeding data

> ### Warning: no preset can be clicked
>
> Checked in the production bundle: the function `applyPreset` defines 4 presets (`giam50k_ok`, `sale20_max_cap`, `all_invalid_qty`, `reset`) but **nothing calls it**, and no component renders the presets. The whole app has exactly one related id, `#btn-toggle-qa-panel`, in the nav bar.
>
> **Consequence:** do not tell users to click a preset, do not write automation that relies on presets. Build data through UI actions (add to cart `#btn-add-*`, change quantity `#input-qty-*`, apply a code via `#input-voucher-code` or chip `#badge-voucher-*`), or write `localStorage` directly.

The preset definitions in the bundle are still a **good hint** for states worth building by hand:

| State | Build via UI |
|---|---|
| Order eligible for `GIAM50K` | 2 × `prod-001` (2 × 150,000 = 300,000 ₫), apply `GIAM50K` |
| `SALE20` hitting the discount cap | 2 × `prod-002` (2 × 350,000 = 700,000 ₫), apply `SALE20`. The preset definition states a cap of **100,000 ₫**; confirm with a real run |
| Two quantity-error lines | `prod-001` enter `abc`, `prod-002` enter `-5` |

Three discount codes exist and work: `GIAM50K`, `SALE20`, `HETHAN`.

## 5. Resetting state between test cases

Delete the 4 `localStorage` keys:

```
shopgo_user                  ← login session
shopgo_orders                ← orders (old version)
shopgo_sqlite_orders_v1      ← orders (current version)
shopgo_sqlite_queries_log    ← simulated SQLite query log
```

In Playwright, call this after opening the page (the origin must match for `localStorage` to be accessible).

## 6. Sample data on the system

### 6.1. Accounts

| Email | Password | Role | Display name |
|---|---|---|---|
| `khachhang@shopgo.vn` | not reproduced here — use the demo account list in the login modal (`#btn-toggle-demo-accounts`) | `customer` | Nguyễn Văn An |
| `vip@shopgo.vn` | not reproduced here — as above | `vip` | Trần Thị Mai (VIP) |

### 6.2. Products

| ID | Name (verbatim) | Price (₫) | Original price (₫) | Category | Stock |
|---|---|---|---|---|---|
| `prod-001` | Áo thun Trendy Unisex (unisex T-shirt) | 150,000 | 199,000 | Thời trang (Fashion) | 50 |
| `prod-002` | Tai nghe Bluetooth Không Dây (wireless Bluetooth headphones) | 350,000 | 500,000 | Công nghệ (Technology) | **12** |
| `prod-003` | Bình nước giữ nhiệt Kim Loại (metal thermos bottle) | 200,000 | 280,000 | Gia dụng (Household) | 25 |
| `prod-004` | Balo Chống Nước Oxford (waterproof Oxford backpack) | 280,000 | 399,000 | Thời trang (Fashion) | 18 |
| `prod-005` | Sạc dự phòng Siêu Nhanh 20W (20W fast power bank) | 190,000 | 250,000 | Công nghệ (Technology) | 30 |
| `prod-006` | Đèn để bàn LED Chống Cận (LED desk lamp) | 120,000 | 180,000 | Gia dụng (Household) | **8** |

> `prod-006` (stock 8) and `prod-002` (stock 12) are the best candidates for stock-boundary test cases.

### 6.3. Product images

`/images/tshirt.png` · `headphones.png` · `thermos.png` · `backpack.png` · `powerbank.png` · `lamp.png` — verified to return HTTP 200.

## 7. System messages (assert exactly; do not paraphrase)

| Context | Verbatim message (English translation for reading only) |
|---|---|
| Quantity empty | `Số lượng không được để trống` (Quantity must not be empty) |
| Quantity not an integer | `Số lượng phải là chữ số nguyên` (Quantity must be a whole number) |
| Quantity ≤ 0 | `Số lượng phải lớn hơn 0 (>= 1)` (Quantity must be greater than 0 (>= 1)) |
| Quantity above stock | `Vượt quá tồn kho (N)` (Exceeds stock (N)) — `N` is the real stock |
| No code entered | `Vui lòng nhập mã khuyến mãi.` (Please enter a promotion code.) |
| Code does not exist | `Mã giảm giá "<mã>" không tồn tại trên hệ thống.` (Discount code "<code>" does not exist in the system.) |
| Code expired | `Mã giảm giá "<mã>" đã hết hạn sử dụng.` (Discount code "<code>" has expired.) |
| Code applied | `Áp dụng thành công mã "<mã>": Giảm <số tiền>.` (Code "<code>" applied: discount <amount>.) |

> ### Warning: three "voucher not eligible" situations — three DIFFERENT messages
>
> Verified with Playwright. Easy to confuse; confusing them makes tests fail:
>
> | Situation | Verbatim message |
> |---|---|
> | **(1)** Click *Áp dụng* (Apply) when the order is **below** the minimum | `Đơn hàng chưa đạt mức tối thiểu 200.000 ₫ (Hiện có 150.000 ₫).` (Order has not reached the minimum of 200,000 ₫ (currently 150,000 ₫).) — contains **both** numbers |
> | **(2)** Code applied successfully, then the **cart is edited** so the condition is lost | Warning banner `Mã "<mã>" chưa đủ điều kiện áp dụng` (Code "<code>" is not eligible) with a hint line to add more items |
> | **(3)** Click **Place order** while the code is not valid | `Vui lòng gỡ hoặc bổ sung giỏ hàng để đạt điều kiện voucher.` (Please remove the code or add to the cart to meet the voucher condition.) |

| Context | Verbatim message (English translation for reading only) |
|---|---|
| Email/password missing | `Vui lòng nhập đầy đủ Email và Mật khẩu.` (Please enter both Email and Password.) |
| Wrong login details | `Thông tin đăng nhập không chính xác.` (Login details are incorrect.) |
| Wrong password | `Mật khẩu không chính xác.` (Password is incorrect.) |
| Ordering without login | `Vui lòng đăng nhập để tiến hành thanh toán đơn hàng.` (Please log in to check out your order.) |
| After clearing all orders | `Đã xóa sạch toàn bộ lịch sử đơn hàng khỏi cơ sở dữ liệu SQLite.` (All order history has been cleared from the SQLite database.) |

## 8. Displayed role labels

| Location | `customer` | `vip` |
|---|---|---|
| User menu | `Khách Hàng Thân Thiết 👤` (Loyal customer) | `Khách VIP ⭐` (VIP customer) |
| Profile screen | `Khách Hàng Tiêu Chuẩn 👤` (Standard customer) | `Khách Hàng VIP ⭐` (VIP customer) |

# Project Knowledge — quy ước dùng cho MỌI feature

> Tri thức nền cấp **dự án**, không đổi theo từng tính năng. Mọi skill đọc file này.
> Trống mục nào thì agent phải gắn `[GIẢ ĐỊNH]` khi cần tới — điền dần để giảm giả định.

Dự án: `ShopGo — Sàn thương mại điện tử demo` · Cập nhật lần cuối: `2026-09-21`
URL môi trường test: `https://cwshopgo.github.io`

---

## 1. Quy ước định danh
| Đối tượng | Format | Ví dụ |
|---|---|---|
| Module prefix cho `TC_ID` | `<3–4 ký tự hoa>` | `AUTH` (đăng nhập), `CART` (giỏ hàng), `VCHR` (voucher), `PAY` (thanh toán), `ORDR` (đơn hàng), `PROD` (sản phẩm) |
| Mã sản phẩm | `prod-0NN` | `prod-001` … `prod-006` |
| Mã người dùng | `user-0NN` | `user-001`, `user-002` |
| Mã voucher | `[A-Z0-9]{3,20}` | `GIAM50K`, `SALE20`, `HETHAN` |
| Mã đơn hàng | Sinh tại thời điểm checkout | Xem `05_test_case_spec.md` khi có dữ liệu thật |

## 2. Định dạng dữ liệu
| Loại | Quy ước | Ghi chú |
|---|---|---|
| Ngày / Giờ | `YYYY-MM-DD` / `YYYY-MM-DD HH:mm:ss` | Chuẩn ISO 8601. UI hiển thị theo locale `vi-VN` |
| Tiền tệ | Dấu chấm `.` phân cách hàng nghìn, hậu tố `₫` | UI hiển thị `150.000 ₫`. Không có phần thập phân |
| Tiền tệ trong test data | Ghi số nguyên kèm đơn vị | `150.000 VNĐ` — khi assert phải chuẩn hoá chuỗi (bỏ khoảng trắng, thống nhất ký tự `₫`) |
| Timezone | `Asia/Ho_Chi_Minh (GMT+7)` | Log SQLite của app dùng `toLocaleTimeString('vi-VN')` |
| NULL vs rỗng | Phân biệt tường minh | Ô số lượng để trống `""` báo `"Số lượng không được để trống"`, khác với số `0` báo `"Số lượng phải lớn hơn 0 (>= 1)"` |

## 3. Bối cảnh nghiệp vụ dùng chung
| Khía cạnh | Nội dung của ShopGo |
|---|---|
| User Context | Khách vãng lai (Guest) xem hàng + thêm giỏ · Khách đăng nhập (`customer`) · Khách VIP (`vip`) |
| Usage Context | **Web SPA tĩnh** (React + Vite), host trên GitHub Pages. Không có backend, không có API |
| Financial / Business Context | Giỏ hàng → voucher chiết khấu → phí vận chuyển → tổng thanh toán → lưu đơn |
| Operational Context | Toàn bộ state nằm ở `localStorage` trình duyệt. Không có SLA API, không có background job |
| Criticality Context | Luồng sống còn: **Thêm giỏ → Áp voucher → Thanh toán → Lưu đơn**. Sai công thức tiền là lỗi Blocker |

## 4. Môi trường test
| Thuộc tính | Nội dung |
|---|---|
| Môi trường | Production-like tĩnh: `https://cwshopgo.github.io` (không có staging riêng) |
| Cách seed data | **Không có DB server.** Dùng 1 trong 3 cách: (a) thao tác UI, (b) bấm preset trong **QA Panel** (`#btn-toggle-qa-panel`), (c) ghi thẳng `localStorage` |
| Dọn dữ liệu giữa các ca test | `localStorage.clear()` hoặc xoá 4 khoá: `shopgo_user`, `shopgo_orders`, `shopgo_sqlite_orders_v1`, `shopgo_sqlite_queries_log` |
| Có được dùng dữ liệu giống production? | Có — đây là site demo, dữ liệu là dữ liệu mẫu công khai, không có PII thật |

## 5. Test Management Tool & ALM Integration
### 5.1. Jira Xray (Khuyến nghị)
| Thuộc tính | Cấu hình chuẩn | Ý nghĩa / Ghi chú |
|---|---|---|
| Issue Type | `Test` | Loại issue đại diện cho Test Case trong Xray |
| Summary Format | `[<TC_ID>] <Title>` | Ví dụ: `[VCHR-001] Áp mã GIAM50K cho đơn đạt 200.000 ₫` |
| Manual Steps | `Action`, `Data`, `Expected Result` | 3 cột chuẩn của bảng Manual Test Step trong Xray |
| Preconditions | `Preconditions` (Text/Wiki) | Tiền điều kiện trước khi thực hiện test |
| Priority | `Blocker`, `Critical`, `High`, `Medium`, `Low` | Mức độ ưu tiên thực thi |
| Labels | `Rule#BR-xx`, `Viewpoint#VP-xx`, `Module#<MOD>` | Phục vụ truy xuất nguồn gốc (Traceability) |
| File xuất | `OUTPUT/<slug>/export_jira_xray.csv` | Mã hóa UTF-8 BOM, sẵn sàng cho Xray Test Importer |

### 5.2. Redmine
| Thuộc tính | Cấu hình chuẩn | Ý nghĩa / Ghi chú |
|---|---|---|
| Tracker | `Test Case` (hoặc `Feature` / `Task`) | Phân loại issue trong Redmine |
| Subject | `[<TC_ID>] <Title>` | Tiêu đề test case |
| Priority | `Urgent` (High), `Normal` (Medium), `Low` (Low) | Mức độ ưu tiên chuẩn của Redmine |
| Category | Mã module (`AUTH`, `PAY`...) | Gom nhóm test case theo phân hệ |
| Status | `New` | Trạng thái ban đầu |
| Description | Đầy đủ Preconditions, Steps, Data, Expected Result | Định dạng Textile / Markdown của Redmine |
| File xuất | `OUTPUT/<slug>/export_redmine.csv` | Mã hóa UTF-8 BOM |

## 6. Ràng buộc riêng của dự án (ShopGo)

> Đây là các ràng buộc **kỹ thuật đã kiểm chứng trên bundle thật**, áp dụng cho mọi tính năng.

1. **Không có điều hướng bằng URL.** App không dùng router — chuyển màn bằng state nội bộ (`shop` / `checkout` / `orders` / `profile`). Mọi kịch bản automation **BẮT BUỘC** điều hướng bằng cách click nút nav, **CẤM** dùng `page.goto('/cart')` hay tương tự.
2. **Không có `data-testid`.** Ưu tiên locator theo thứ tự: `#id` có sẵn (xem `knowledge/features/shopgo-ui-map.md`) → `getByRole` → `getByPlaceholder` → `getByText`.
3. **State nằm ở `localStorage`**, sống qua reload. Test case nào cần trạng thái sạch phải khai rõ bước dọn ở phần Precondition.
4. **QA Panel là công cụ hợp lệ để seed dữ liệu** (`#btn-toggle-qa-panel`), có các preset: `giam50k_ok`, `sale20_max_cap`, `all_invalid_qty`, `reset`.
5. **Dòng hàng có số lượng lỗi bị loại khỏi `subtotal`** — ảnh hưởng dây chuyền tới điều kiện tối thiểu của voucher và ngưỡng miễn phí vận chuyển.
6. Ô nhập số lượng nhận **chuỗi tự do** (`rawInput`), không phải `<input type=number>` bị chặn sẵn — nhập được chữ, dấu âm, khoảng trắng.

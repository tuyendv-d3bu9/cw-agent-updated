# Môi Trường Kiểm Thử · ShopGo

Nguồn: thông tin bàn giao môi trường cho đợt kiểm thử
Hệ thống: ShopGo — sàn thương mại điện tử · Môi trường: `https://cwshopgo.github.io`

---

## 1. Tài khoản thử

| Tài khoản | Mật khẩu |
|---|---|
| `khachhang@shopgo.vn` | `123456` |
| `vip@shopgo.vn` | `123456` |

## 2. Hành vi hệ thống cần biết trước

| Điểm cần biết | Chi tiết |
|---|---|
| **Không có điều hướng bằng URL** | App đổi màn bằng trạng thái nội bộ. Automation **cấm** dùng `page.goto('/cart')`, phải bấm nút nav |
| **Màn Thanh toán cần đăng nhập** | Chặn ngay ở bước điều hướng, không phải lúc bấm đặt hàng |
| Mã giảm giá có thật | `GIAM50K` · `SALE20` · `HETHAN`. Có chip gợi ý ngay dưới ô nhập mã ở màn Thanh toán |

## 3. Dựng dữ liệu test

Thao tác trên giao diện (thêm giỏ, sửa số lượng, áp mã). Nút `QA Panel` trên thanh điều hướng **không có preset nào dùng được**, đừng dựa vào nó.

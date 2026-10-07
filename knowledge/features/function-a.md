# Chức Năng Đăng Nhập (Authentication) — Feature Knowledge

> **BỘ NÃO TRI THỨC TÍNH NĂNG (Feature Knowledge Base)**
> File này lưu trữ toàn bộ dữ kiện nghiệp vụ ĐÃ XÁC NHẬN của tính năng.
> Mọi Agent phân tích hay thiết kế kiểm thử đều đọc file này đầu tiên để không phải hỏi lại những gì đã chốt.

Feature slug: `function-a` · Nguồn tài liệu: `INPUT/function-a/02_ba/function-a.md` · Cập nhật lần cuối: `2026-10-04` · Trạng thái tổng thể: `APPROVED`

---

## 1. TỔNG QUAN TÍNH NĂNG (FEATURE OVERVIEW)
Chức năng xác thực người dùng trên sàn thương mại điện tử ShopGo bằng tài khoản hợp lệ, hiển thị đúng thông tin định danh và phân quyền tương ứng trên giao diện.

## 2. TÁC NHÂN & PHÂN QUYỀN (ACTORS & ROLES)

| Tác nhân (Actor) | Quyền hạn trong tính năng này | Điều kiện tiên quyết (Precondition) |
|---|---|---|
| Khách vãng lai (Guest) | Xem sản phẩm, bấm đăng nhập hoặc bị chặn khi vào thanh toán | Chưa đăng nhập |
| Khách hàng thường (`customer`) | Đăng nhập tài khoản thường, xem profile, đặt hàng | Email `khachhang@shopgo.vn`, Pass `123456` |
| Khách hàng VIP (`vip`) | Đăng nhập tài khoản VIP, xem profile, đặt hàng | Email `vip@shopgo.vn`, Pass `123456` |

## 3. QUY TẮC NGHIỆP VỤ ĐÃ XÁC NHẬN (CONFIRMED BUSINESS RULES)

| ID | Tóm tắt quy tắc | Chi tiết điều kiện & hành vi | Căn cứ nguồn (File/Mục) | Trạng thái |
|---|---|---|---|---|
| BR-AUTH-01 | Danh mục tài khoản hợp lệ | Hệ thống hỗ trợ 02 tài khoản kiểm thử: VIP (`vip@shopgo.vn` / `123456`) và Khách thường (`khachhang@shopgo.vn` / `123456`) | Tài liệu gốc §1 | Confirmed |
| BR-AUTH-02 | Tính toàn vẹn danh tính hiển thị | Đăng nhập thành công tài khoản nào phải hiển thị chính xác tên tài khoản đó trên Header/Menu: VIP hiển thị `Trần Thị Mai (VIP)`, Khách thường hiển thị `Nguyễn Văn An`. Tuyệt đối không nhầm lẫn giữa tài khoản A và B | Tài liệu gốc §1, §2 | Confirmed |
| BR-AUTH-03 | Quản lý phiên đăng nhập | Trạng thái người dùng được lưu trữ trong `localStorage` qua khóa `shopgo_user` và được khôi phục khi làm mới trang | `knowledge/_project.md` §3 | Confirmed |
| BR-AUTH-04 | Thông báo lỗi sai thông tin đăng nhập | Khi nhập sai mật khẩu hoặc nhập email không tồn tại / sai format, hệ thống hiển thị thông báo lỗi nguyên văn: `"Email hoặc mật khẩu không chính xác."` | User/BA chốt MR-01, MR-02 | Confirmed |
| BR-AUTH-05 | Chặn submit ô trống | Khi bấm Đăng nhập mà để trống trường Email hoặc Mật khẩu, hệ thống chặn submit và hiển thị: `"Vui lòng nhập đầy đủ thông tin."` | User/BA chốt MR-03 | Confirmed |
| BR-AUTH-06 | Không giới hạn lần đăng nhập sai | Chưa có CAPTCHA, hệ thống không chặn hay khóa tài khoản khi nhập sai liên tiếp | User/BA chốt MR-06 | Confirmed |
| BR-AUTH-07 | Phân quyền VIP và Khách thường | Tài khoản VIP chỉ khác Khách thường ở tên hiển thị ở góc trên bên phải có nhãn VIP, các luồng chức năng mua sắm khác đồng nhất | User/BA chốt MR-07 | Confirmed |
| BR-AUTH-08 | Hành vi khi Đăng xuất (Logout) | Khi người dùng đăng xuất, hệ thống điều hướng quay về trang chủ và không hiển thị giỏ hàng | User/BA chốt MR-08 | Confirmed |

## 4. LUỒNG CHÍNH (HAPPY PATH)
1. **Bước 1**: Người dùng click `#btn-header-login` trên Header để mở modal Đăng nhập.
2. **Bước 2**: Nhập email hợp lệ (`khachhang@shopgo.vn` hoặc `vip@shopgo.vn`) và mật khẩu `123456`.
3. **Bước 3**: Nhấn nút Đăng nhập trong modal.
4. **Bước 4**: Modal đóng lại, Header hiển thị `#btn-user-profile` với tên chính xác của người dùng tương ứng (`Trần Thị Mai (VIP)` hoặc `Nguyễn Văn An`).

## 5. LUỒNG NGOẠI LỆ & LỖI (ALTERNATE & ERROR FLOWS)
- **AF-01 (Đăng nhập nhanh qua Demo Accounts)**: Bấm `#btn-toggle-demo-accounts`, click chọn tài khoản demo để tự điền form và đăng nhập.
- **AF-02 (Cổng chặn thanh toán)**: Click `#btn-nav-checkout` khi chưa đăng nhập ➔ Bật modal login ➔ Đăng nhập xong tự điều hướng vào màn Thanh toán.
- **AF-03 (Đăng nhập sai mật khẩu/email)**: Nhập sai thông tin ➔ Báo lỗi `"Email hoặc mật khẩu không chính xác."`.
- **AF-04 (Bỏ trống form)**: Nhấn Đăng nhập khi để trống ➔ Báo lỗi `"Vui lòng nhập đầy đủ thông tin."`.
- **AF-05 (Đăng xuất)**: Mở menu profile ➔ Click `#btn-logout` ➔ Xóa phiên, điều hướng về trang chủ và không hiển thị giỏ hàng.

## 6. NGOÀI PHẠM VI (OUT OF SCOPE)
- Đăng ký tài khoản mới (Sign Up).
- Quên mật khẩu / Khôi phục mật khẩu.
- Đăng nhập qua mạng xã hội (OAuth).
- CAPTCHA và khóa tài khoản khi Brute-force (chưa triển khai).

## 7. CÂU HỎI MỞ & KẼ HỞ 06W (OPEN QUESTIONS & MISSING RULES)

| ID | Mô tả kẽ hở | Nhóm 06W | Mức rủi ro | Đề xuất mặc định | Câu hỏi cho BA/PO | Phản hồi chính thức | Trạng thái |
|---|---|---|---|---|---|---|---|
| MR-01 | Xử lý khi nhập sai mật khẩu | W1 (Input) | HIGH | Báo lỗi "Email hoặc mật khẩu không chính xác." | Khi nhập sai mật khẩu, câu thông báo lỗi chính xác là gì? | Hiển thị `"Email hoặc mật khẩu không chính xác."` | Confirmed |
| MR-02 | Xử lý khi nhập email không tồn tại hoặc sai format | W1 (Input) | HIGH | Báo lỗi chung để bảo mật | Hệ thống validate định dạng email và tài khoản không tồn tại như thế nào? | Hiển thị `"Email hoặc mật khẩu không chính xác."` | Confirmed |
| MR-03 | Xử lý khi để trống email hoặc mật khẩu | W1 (Input) | MED | Chặn submit và báo lỗi | Thông báo cụ thể khi submit ô trống là gì? | Đúng (Chặn submit và hiển thị `"Vui lòng nhập đầy đủ thông tin."`) | Confirmed |
| MR-04 | Duy trì trạng thái phiên và làm mới trang (F5) | W2 (State) | LOW | Tự động giữ phiên đăng nhập qua localStorage | Xác nhận cơ chế giữ đăng nhập qua F5 dựa trên localStorage? | Xác nhận cơ chế duy trì qua localStorage `shopgo_user` | Confirmed |
| MR-05 | Xử lý khoảng trắng thừa và chuẩn hóa Email | W3 (Data) | MED | Tự động trim khoảng trắng 2 đầu và không phân biệt hoa thường | Email đăng nhập có tự động trim khoảng trắng và cho phép không phân biệt hoa thường không? | Tự động trim khoảng trắng và không phân biệt hoa thường | Confirmed |
| MR-06 | Chính sách bảo vệ đăng nhập sai liên tục | W4 (Timing) | MED | Cho phép thử lại tự do | Bản hiện tại có áp dụng cơ chế giới hạn lần đăng nhập sai không? | Chưa có captcha, nên chưa chặn số lần đăng nhập sai liên tiếp. | Confirmed |
| MR-07 | Phân quyền hiển thị và ưu đãi giữa VIP và Khách thường | W5 (Who else) | HIGH | Chỉ khác tên hiển thị | Tài khoản VIP có quyền lợi hoặc màn hình gì khác biệt so với tài khoản thường? | Chỉ khác mỗi tên hiển thị ở góc trên bên phải | Confirmed |
| MR-08 | Đồng bộ giỏ hàng và điều hướng sau khi đăng xuất | W6 (Side-effect) | MED | Điều hướng về trang chủ và không hiển thị giỏ hàng | Khi đăng xuất, giỏ hàng có bị xóa trắng không? | Quay về trang chủ, không hiển thị giỏ hàng. | Confirmed |

## 8. GIẢ ĐỊNH ĐÃ ĐƯỢC CHỐT (CONFIRMED ASSUMPTIONS LOG)

| # | Mã liên quan | Giả định ban đầu của Agent | Quyết định chính thức | Người phê duyệt | Ngày chốt |
|---|---|---|---|---|---|
| 1 | MR-01 | Báo lỗi "Email hoặc mật khẩu không chính xác." | Hiển thị thông báo: `"Email hoặc mật khẩu không chính xác."` | User / BA | 2026-10-04 |
| 2 | MR-02 | Báo lỗi chung bảo mật tài khoản | Hiển thị thông báo: `"Email hoặc mật khẩu không chính xác."` | User / BA | 2026-10-04 |
| 3 | MR-03 | Chặn submit tại ô trống | Chặn submit và hiển thị: `"Vui lòng nhập đầy đủ thông tin."` | User / BA | 2026-10-04 |
| 4 | MR-04 | Giữ phiên qua F5 | Duy trì phiên đăng nhập bằng `localStorage` | User / BA | 2026-10-04 |
| 5 | MR-05 | Trim khoảng trắng email | Tự động trim khoảng trắng và không phân biệt hoa thường | User / BA | 2026-10-04 |
| 6 | MR-06 | Cho phép thử lại tự do | Chưa có captcha, chưa chặn số lần đăng nhập sai liên tiếp | User / BA | 2026-10-04 |
| 7 | MR-07 | Khác tên hiển thị có nhãn VIP | Chỉ khác mỗi tên hiển thị ở góc trên bên phải | User / BA | 2026-10-04 |
| 8 | MR-08 | Xử lý giỏ hàng và điều hướng | Quay về trang chủ, không hiển thị giỏ hàng | User / BA | 2026-10-04 |

## 9. HẰNG SỐ NGHIỆP VỤ (DOMAIN CONSTANTS)

| Hằng số | Kiểu dữ liệu | Giá trị quy ước | Phạm vi ảnh hưởng | Ghi chú |
|---|---|---|---|---|
| `DEMO_ACCOUNT_VIP` | Object | `{ email: 'vip@shopgo.vn', pass: '123456', name: 'Trần Thị Mai (VIP)' }` | Modal login | Tài khoản VIP |
| `DEMO_ACCOUNT_CUSTOMER` | Object | `{ email: 'khachhang@shopgo.vn', pass: '123456', name: 'Nguyễn Văn An' }` | Modal login | Tài khoản thường |
| `STORAGE_KEY_USER` | Chuỗi | `shopgo_user` | `localStorage` | Khóa lưu phiên đăng nhập |
| `ERR_INVALID_CREDENTIALS` | Chuỗi | `Email hoặc mật khẩu không chính xác.` | Modal login | Thông báo sai pass / email |
| `ERR_EMPTY_FIELDS` | Chuỗi | `Vui lòng nhập đầy đủ thông tin.` | Modal login | Thông báo để trống ô |

## 10. MA TRẬN TRUY VẾT (TRACEABILITY MATRIX)

| Mã Rule | Căn cứ tài liệu gốc (File & Mục) | Test Case IDs liên quan | Ghi chú |
|---|---|---|---|
| BR-AUTH-01 | `INPUT/function-a/02_ba/function-a.md` §1 | Chờ sinh | 2 tài khoản kiểm thử |
| BR-AUTH-02 | `INPUT/function-a/02_ba/function-a.md` §2 | Chờ sinh | Hiển thị đúng tên tài khoản |
| BR-AUTH-03 | `knowledge/_project.md` §3 | Chờ sinh | Quản lý phiên localStorage |
| BR-AUTH-04 | Quyết định chốt MR-01, MR-02 | Chờ sinh | Thông báo sai thông tin |
| BR-AUTH-05 | Quyết định chốt MR-03 | Chờ sinh | Bỏ trống form |
| BR-AUTH-06 | Quyết định chốt MR-06 | Chờ sinh | Thử lại không giới hạn |
| BR-AUTH-07 | Quyết định chốt MR-07 | Chờ sinh | Phân quyền VIP |
| BR-AUTH-08 | Quyết định chốt MR-08 | Chờ sinh | Điều hướng sau đăng xuất |

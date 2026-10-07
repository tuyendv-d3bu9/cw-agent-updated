# REQUIREMENT & RISK ANALYSIS REPORT · function-a
Owner: qa-system/qa-analyst/requirement-risk-summary · Nguồn: INPUT/function-a/02_ba/function-a.md · Verdict: PASS
**Dạng tài liệu nhận diện**: Prose Document (Tài liệu thô từ BA)  
**Ngày phân tích**: 2026-10-04  

---

## 1. FEATURE OVERVIEW
Chức năng Đăng nhập (Authentication) cho phép người dùng xác thực danh tính vào sàn thương mại điện tử ShopGo bằng tài khoản hợp lệ, đảm bảo hiển thị chính xác danh tính người dùng và phân quyền tương ứng trên toàn bộ hệ thống.

## 2. ACTOR & USER ROLE
- **Khách vãng lai (Guest)**: Chưa đăng nhập, có thể xem sản phẩm, khi điều hướng vào trang Thanh toán/Đơn hàng sẽ bị yêu cầu đăng nhập.
- **Khách hàng thường (Customer - user-001)**: Tài khoản `khachhang@shopgo.vn`, tên hiển thị `Nguyễn Văn An`.
- **Khách hàng VIP (VIP - user-002)**: Tài khoản `vip@shopgo.vn`, tên hiển thị `Trần Thị Mai (VIP)`.
- **System Actor**: Modal xác thực đăng nhập, lưu trữ phiên đăng nhập tại `localStorage` (`shopgo_user`).

## 3. BUSINESS RULES
- **BR-AUTH-01 (Tài khoản thử nghiệm hợp lệ)**: Hệ thống cung cấp sẵn 02 tài khoản phục vụ xác thực và kiểm thử:
  - Tài khoản VIP: Email `vip@shopgo.vn`, Mật khẩu `123456`, Tên hiển thị `Trần Thị Mai (VIP)`, Vai trò `vip`.
  - Tài khoản Thường: Email `khachhang@shopgo.vn`, Mật khẩu `123456`, Tên hiển thị `Nguyễn Văn An`, Vai trò `customer`.
- **BR-AUTH-02 (Tính toàn vẹn danh tính hiển thị)**: Khi người dùng đăng nhập thành công với tài khoản nào, hệ thống bắt buộc phải hiển thị chính xác tên của tài khoản đó tại Header (`#btn-user-profile`) và các khu vực quản lý tài khoản. Tuyệt đối không hiển thị tên tài khoản khác hoặc lẫn lộn danh tính.
- **BR-AUTH-03 (Duy trì phiên đăng nhập)**: Trạng thái đăng nhập của người dùng được lưu trữ cục bộ (theo tri thức nền dự án là khóa `shopgo_user` trong `localStorage`) và duy trì khi làm mới trang.
- **BR-AUTH-04 (Thông báo lỗi sai thông tin đăng nhập)**: Khi nhập sai mật khẩu hoặc nhập email không tồn tại / sai format, hệ thống hiển thị thông báo lỗi nguyên văn: `"Email hoặc mật khẩu không chính xác."` (Đã xác nhận).
- **BR-AUTH-05 (Chặn submit ô trống)**: Khi bấm Đăng nhập mà để trống trường Email hoặc Mật khẩu, hệ thống chặn submit và hiển thị: `"Vui lòng nhập đầy đủ thông tin."` (Đã xác nhận).
- **BR-AUTH-06 (Không giới hạn lần đăng nhập sai)**: Chưa có CAPTCHA, hệ thống không chặn hay khóa tài khoản khi nhập sai liên tiếp (Đã xác nhận).
- **BR-AUTH-07 (Phân quyền VIP và Khách thường)**: Tài khoản VIP chỉ khác Khách thường ở tên hiển thị ở góc trên bên phải có nhãn VIP, các luồng chức năng mua sắm khác đồng nhất (Đã xác nhận).
- **BR-AUTH-08 (Hành vi khi Đăng xuất)**: Khi người dùng đăng xuất, hệ thống điều hướng quay về trang chủ và không hiển thị giỏ hàng (Đã xác nhận).

## 4. HAPPY PATH
1. **Bước 1**: Người dùng truy cập trang chủ ShopGo và nhấn nút Đăng nhập (`#btn-header-login`) trên Header (hoặc được hệ thống kích hoạt mở modal khi cố gắng vào giỏ hàng/thanh toán).
2. **Bước 2**: Modal đăng nhập hiển thị với 2 trường nhập: Email (`getByPlaceholder('Nhập email...')`) và Mật khẩu (`getByPlaceholder('Nhập mật khẩu...')`).
3. **Bước 3**: Người dùng nhập Email hợp lệ (ví dụ `khachhang@shopgo.vn`) và Mật khẩu `123456`.
4. **Bước 4**: Nhấn nút xác nhận đăng nhập.
5. **Kết quả mong đợi**:
   - Modal đăng nhập đóng lại.
   - Nút `#btn-header-login` biến mất, thay bằng `#btn-user-profile` hiển thị đúng tên người dùng (`Nguyễn Văn An` đối với tài khoản thường, hoặc `Trần Thị Mai (VIP)` đối với VIP).
   - Phiên đăng nhập được ghi nhận và người dùng có thể thực hiện tiếp các thao tác yêu cầu xác thực.

## 5. ALTERNATE FLOWS
### AF-01: Đăng nhập bằng danh sách tài khoản Demo (Quick Fill)
1. Trên Modal đăng nhập, người dùng nhấn nút danh sách tài khoản demo (`#btn-toggle-demo-accounts`).
2. Danh sách 2 tài khoản demo (VIP và Khách hàng thường) hiển thị.
3. Người dùng click chọn 1 tài khoản (ví dụ VIP) ➔ Form tự động điền Email và Password tương ứng.
4. Người dùng xác nhận đăng nhập ➔ Đăng nhập thành công và hiển thị đúng tên `Trần Thị Mai (VIP)`.

### AF-02: Đăng nhập để tiếp tục thanh toán (Auth Redirect Flow)
1. Người dùng chưa đăng nhập, nhấn `#btn-nav-checkout` hoặc click đặt hàng.
2. Hệ thống bật modal đăng nhập kèm thông báo yêu cầu xác thực để thanh toán.
3. Người dùng đăng nhập thành công ➔ Hệ thống tự động chuyển tiếp (`authRedirectTab`) sang màn Thanh toán (`checkout`).

### AF-03: Đăng xuất (Logout)
1. Người dùng đã đăng nhập, click mở menu tài khoản (`#btn-user-profile`).
2. Chọn Đăng xuất (`#btn-logout`).
3. Hệ thống dọn dẹp phiên đăng nhập (`shopgo_user`), đưa header về trạng thái khách vãng lai (`#btn-header-login`).

## 6. OUT OF SCOPE
- Chức năng Đăng ký tài khoản mới (Sign Up) không đề cập trong tài liệu này (hệ thống hiện dùng tài khoản định sẵn).
- Chức năng Quên mật khẩu / Khôi phục mật khẩu qua Email (Reset Password via Email/SMS) chưa có trong phạm vi.
- Đăng nhập qua mạng xã hội (Google, Facebook OAuth) không thuộc phạm vi tính năng này.

## 7. OPEN QUESTIONS (CLARIFICATION GATE — VERDICT: ASK)
> **Trạng thái**: [Chờ phản hồi từ BA / Người dùng]  
> Các câu hỏi dưới đây được trích xuất bằng kỹ thuật 06W nhằm lấp đầy các kẽ hở logic trước khi có thể thiết kế test case chi tiết:

- **Q1 (06W - W1 Input lạ: Mật khẩu sai)**: Khi người dùng nhập đúng email nhưng sai mật khẩu, hệ thống hiển thị thông báo lỗi cụ thể bằng văn bản nào? (Ví dụ: *"Mật khẩu không chính xác"*, hay *"Email hoặc mật khẩu không đúng"* để bảo mật?).  
  👉 **Trạng thái**: `Chờ trả lời`

- **Q2 (06W - W1 Input lạ: Email không tồn tại hoặc sai định dạng)**: Khi nhập email chưa từng có trong hệ thống (ví dụ `test@gmail.com`) hoặc định dạng sai (ví dụ `abc`, `@shopgo.vn`), hệ thống validate form như thế nào và thông báo lỗi hiển thị ở đâu?  
  👉 **Trạng thái**: `Chờ trả lời`

- **Q3 (06W - W1 Input lạ: Để trống trường dữ liệu)**: Khi người dùng nhấn Đăng nhập mà để trống Email hoặc Mật khẩu, hệ thống chặn tại client với câu thông báo lỗi cụ thể là gì?  
  👉 **Trạng thái**: `Chờ trả lời`

- **Q4 (06W - W4 Timing / Security: Bảo vệ Brute-Force)**: Có giới hạn số lần đăng nhập sai liên tiếp không (ví dụ sai 5 lần thì khóa tạm thời 15 phút hoặc hiển thị CAPTCHA), hay hệ thống cho phép thử lại không giới hạn?  
  👉 **Trạng thái**: `Chờ trả lời`

- **Q5 (06W - W5 Who Else / Phân quyền)**: Tài khoản VIP và tài khoản Khách hàng thường có sự khác biệt gì về mặt quyền hạn hoặc giao diện khi đăng nhập thành công không? (Ví dụ: VIP có huy hiệu riêng, có voucher tự động áp dụng, hay quyền truy cập màn hình riêng không?).  
  👉 **Trạng thái**: `Chờ trả lời`

- **Q6 (06W - W6 Side-effect: Dọn dẹp dữ liệu khi đăng xuất)**: Khi người dùng đăng xuất (`#btn-logout`), giỏ hàng hiện tại trong phiên làm việc có bị xóa trắng không, hay được giữ nguyên cho phiên đăng nhập sau?  
  👉 **Trạng thái**: `Chờ trả lời`

## 8. BUSINESS CRITICALITY ASSESSMENT
- **Trạng thái dữ liệu bối cảnh**: [Đầy đủ - Kế thừa từ `knowledge/_project.md`]
- **Bối cảnh nghiệp vụ ghi nhận**:
  - Đăng nhập là cổng xác thực cửa ngõ (Gatekeeper) của sàn ShopGo.
  - Người dùng bắt buộc phải đăng nhập thì mới có thể tiến hành Thanh toán (`checkout`), áp dụng mã khuyến mãi (`voucher`) và xem lịch sử đơn hàng (`orders`).
  - Do kiến trúc ShopGo là Single Page Application tĩnh chạy trên GitHub Pages, toàn bộ trạng thái phiên nằm ở client (`localStorage`). Do đó rủi ro rò rỉ phiên hoặc nhầm lẫn danh tính tài khoản ảnh hưởng trực tiếp đến dữ liệu đơn hàng cục bộ.

## 9. MISSING RISK CONTEXT INFORMATION
### 9.1 Chi tiết theo khía cạnh
- **Missing User Context**: Chưa có quy định về việc có hỗ trợ các tài khoản khác ngoài 2 tài khoản demo không. Mức ảnh hưởng: `MED`.
- **Missing Usage Context**: Chưa có thông số về tần suất chuyển đổi giữa các tài khoản (switch account) trên cùng một trình duyệt. Mức ảnh hưởng: `LOW`.
- **Missing Financial Context**: Việc hiển thị sai tài khoản có thể dẫn tới áp dụng sai chính sách chiết khấu (VIP vs Khách thường). Mức ảnh hưởng: `HIGH`.
- **Missing Operational Context**: Chưa có đặc tả chi tiết về cơ chế dọn dẹp `localStorage` khi gặp lỗi corrupt dữ liệu phiên. Mức ảnh hưởng: `MED`.
- **Missing Criticality Context**: Đã có đầy đủ từ tri thức nền `_project.md`. Mức ảnh hưởng: `LOW`.

### 9.2 Tổng hợp
- **Available Context**: Môi trường test tĩnh `https://cwshopgo.github.io`, locator trong `shopgo-ui-map.md`, quy ước tài khoản demo và vai trò `vip`/`customer`.
- **Missing Context**: Các thông báo lỗi xác thực cụ thể, cơ chế xử lý khi nhập sai/để trống dữ liệu, chính sách phân quyền VIP.
- **Risk Analysis Impact**: Các kịch bản Happy Path có độ tin cậy cao, nhưng các kịch bản Negative/Boundary/Exception đang thiếu cơ sở đối soát expected message nếu chưa được BA xác nhận.

## 10. RISK ANALYSIS & PRIORITIZATION
### 10.1 Nguồn đánh giá Risk
- **Business Rules**: 3 quy tắc nghiệp vụ cốt lõi về danh tính và tài khoản hợp lệ.
- **Gap Analysis**: 6 câu hỏi mở quan trọng (Q1 đến Q6) chưa có đặc tả chính thức.
- **Business Criticality Assessment**: Tính năng đăng nhập là điều kiện tiên quyết cho toàn bộ luồng mua hàng và thanh toán.
- **Missing Risk Context Information**: Thiếu đặc tả thông báo lỗi validation.

### 10.2 Ma trận Đánh giá Rủi ro (3x3)
| Mã rủi ro | Likelihood | Impact | Risk Level | Severity | Cờ tin cậy | Lý do (5 yếu tố Impact) |
|:---|:---|:---|:---|:---|:---|:---|
| **RK-AUTH-01: Sai lệch danh tính tài khoản (Account Confusion)** | MED | HIGH | **HIGH** | Critical | `SEVERITY_CONFIDENCE_HIGH` | Đăng nhập tài khoản A lại hiển thị tên/quyền tài khoản B. Vi phạm trực tiếp BR-AUTH-02, gây sai lệch thông tin cá nhân và áp sai voucher/quyền lợi VIP. |
| **RK-AUTH-02: Không thể đăng nhập bằng tài khoản hợp lệ** | LOW | HIGH | **HIGH** | Blocker | `SEVERITY_CONFIDENCE_HIGH` | Tài khoản VIP hoặc thường hợp lệ bị từ chối đăng nhập, chặn đứng hoàn toàn người dùng khỏi luồng thanh toán đơn hàng. |
| **RK-AUTH-03: Treo/Không hiển thị thông báo khi sai thông tin** | HIGH | MED | **HIGH** | Major | `SEVERITY_CONFIDENCE_LOW` | Người dùng nhập sai mật khẩu/email nhưng hệ thống không báo lỗi hoặc im lặng, gây bối rối và làm giảm trải nghiệm người dùng. |
| **RK-AUTH-04: Mất phiên hoặc không đồng bộ khi F5 / Chuyển trang** | MED | MED | **MED** | Major | `SEVERITY_CONFIDENCE_HIGH` | Đang đăng nhập mà reload trang bị văng ra khách vãng lai, làm gián đoạn hành trình mua hàng. |
| **RK-AUTH-05: Rò rỉ dữ liệu phiên giữa các lần đăng nhập** | LOW | HIGH | **MED** | Critical | `SEVERITY_CONFIDENCE_HIGH` | Đăng xuất tài khoản A và đăng nhập tài khoản B nhưng giỏ hàng hoặc đơn hàng của A vẫn còn hiển thị trên tài khoản B. |

### 10.3 Đánh giá tác động chiến lược
- **Impact to Risk Analysis**: Cần tập trung tối đa vào tính toàn vẹn phiên (`shopgo_user`) và cơ chế map đúng email ➔ tên hiển thị.
- **Impact to Test Prioritization**:
  1. Ưu tiên số 1 (Blocker/Critical): Happy path đăng nhập đúng tài khoản VIP & Thường, kiểm tra tên hiển thị chính xác.
  2. Ưu tiên số 2 (High): Validation thông báo lỗi khi nhập sai mật khẩu, sai email, để trống form.
  3. Ưu tiên số 3 (Med): Chuyển đổi qua lại giữa 2 tài khoản, reload trang, luồng redirect khi click checkout.
- **Impact to Coverage Strategy**: Chặn đứng việc sinh Test Case chi tiết cho các ca Negative cho đến khi BA làm rõ thông báo lỗi tại Mục 7.

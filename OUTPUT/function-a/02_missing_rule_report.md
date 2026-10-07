# BÁO CÁO PHÂN TÍCH QUY TẮC NGHIỆP VỤ BỊ THIẾU (MISSING-RULE REPORT)
Owner: qa-system/qa-analyst/missing-rule-06w · Nguồn: OUTPUT/function-a/01_requirement_risk_summary.md · Verdict: PASS

---

## 1. Ma trận Truy vết 06W

| STT | Câu hỏi 06W | Trọng tâm đã quét | Trạng thái | Mã Missing Rule liên quan |
|:---|:---|:---|:---|:---|
| W1 | What if input lạ | Nhập sai pass, email không tồn tại, để trống form, email sai cú pháp | Đã phát hiện | MR-01, MR-02, MR-03 |
| W2 | What if state lạ | F5 khi đang trong phiên, mở đồng thời nhiều tab, tài khoản bị khoá | Đã phát hiện | MR-04 |
| W3 | What if data lạ | Nhập khoảng trắng đầu/cuối chuỗi email, chữ hoa/thường trong email | Đã phát hiện | MR-05 |
| W4 | What when timing | Brute-force nhập sai nhiều lần liên tiếp, timeout modal | Đã phát hiện | MR-06 |
| W5 | Who else actor | Khác biệt phân quyền và hiển thị giữa VIP vs Khách thường | Đã phát hiện | MR-07 |
| W6 | What happens after | Giỏ hàng sau đăng xuất, redirect sau khi đăng nhập từ checkout | Đã phát hiện | MR-08 |

---

## 2. Chi tiết Missing Rules

### [MR-01] Thông báo lỗi khi mật khẩu không chính xác
1. **Mã Rule ID**: MR-01
2. **Căn cứ Requirement gốc**: `INPUT/function-a/02_ba/function-a.md` chỉ nêu tài khoản test và pass 123456, chưa đề cập trường hợp nhập sai mật khẩu.
3. **Câu hỏi 06W tương ứng**: W1 (What if input lạ)
4. **Phân loại**: Exception & Error Handling Rules
5. **Mô tả kẽ hở / quy tắc bị thiếu**: Khi người dùng nhập email đúng (`vip@shopgo.vn` hoặc `khachhang@shopgo.vn`) nhưng nhập mật khẩu sai (ví dụ `123`, `abcdef`), hệ thống phản hồi như thế nào? Cần quy định rõ chuỗi thông báo lỗi (ví dụ: *"Mật khẩu không chính xác"* hay *"Email hoặc mật khẩu không đúng"*).
6. **Rủi ro & Tác động**: Không kiểm thử được tính đúng đắn của ca kiểm thử âm bản (Negative test case), nguy cơ giao diện im lặng hoặc báo lỗi kỹ thuật không thân thiện.
7. **Đề xuất hành vi xử lý mặc định**: Hiển thị thông báo màu đỏ dưới form: *"Email hoặc mật khẩu không chính xác."*
8. **Câu hỏi xác nhận cho BA/PO**: Khi nhập sai mật khẩu, câu thông báo lỗi chính xác trên giao diện là gì?

---

### [MR-02] Xử lý khi email không tồn tại trên hệ thống
1. **Mã Rule ID**: MR-02
2. **Căn cứ Requirement gốc**: Chưa đề cập trong tài liệu gốc.
3. **Câu hỏi 06W tương ứng**: W1 (What if input lạ)
4. **Phân loại**: Exception & Error Handling Rules
5. **Mô tả kẽ hở / quy tắc bị thiếu**: Khi người dùng nhập email lạ không thuộc 2 tài khoản testing (ví dụ `user@gmail.com`), hệ thống xử lý thế nào?
6. **Rủi ro & Tác động**: Thiếu ca kiểm thử cho tài khoản không tồn tại.
7. **Đề xuất hành vi xử lý mặc định**: Hiển thị thông báo *"Tài khoản không tồn tại trên hệ thống"* hoặc gộp chung *"Email hoặc mật khẩu không chính xác"*.
8. **Câu hỏi xác nhận cho BA/PO**: Hệ thống có phân biệt lỗi "Tài khoản không tồn tại" với lỗi "Sai mật khẩu" không, hay dùng chung thông báo để đảm bảo bảo mật?

---

### [MR-03] Validation bỏ trống trường Email hoặc Mật khẩu
1. **Mã Rule ID**: MR-03
2. **Căn cứ Requirement gốc**: Chưa đề cập trong tài liệu gốc.
3. **Câu hỏi 06W tương ứng**: W1 (What if input lạ)
4. **Phân loại**: Boundary & Edge Rules
5. **Mô tả kẽ hở / quy tắc bị thiếu**: Khi bấm nút Đăng nhập mà để trống ô email, ô mật khẩu hoặc cả hai thì form phản ứng ra sao?
6. **Rủi ro & Tác động**: Nếu submit form rỗng mà không chặn, có thể sinh lỗi JS unhandled exception.
7. **Đề xuất hành vi xử lý mặc định**: Chặn submit tại client, hiển thị lỗi yêu cầu nhập: *"Vui lòng nhập email"* / *"Vui lòng nhập mật khẩu"*.
8. **Câu hỏi xác nhận cho BA/PO**: Quy tắc validate trường bắt buộc trên modal đăng nhập cụ thể như thế nào?

---

### [MR-04] Duy trì trạng thái phiên và làm mới trang (F5)
1. **Mã Rule ID**: MR-04
2. **Căn cứ Requirement gốc**: Chưa nêu trong tài liệu gốc, chỉ suy ra từ kiến trúc `knowledge/_project.md`.
3. **Câu hỏi 06W tương ứng**: W2 (What if state lạ)
4. **Phân loại**: State & Lifecycle Rules
5. **Mô tả kẽ hở / quy tắc bị thiếu**: Khi đang đăng nhập, người dùng bấm F5 hoặc mở tab mới của cùng trình duyệt thì phiên đăng nhập có được tự động giữ nguyên không?
6. **Rủi ro & Tác động**: Nếu mất phiên khi F5, người dùng phải đăng nhập lại liên tục, làm gián đoạn việc mua sắm.
7. **Đề xuất hành vi xử lý mặc định**: Đọc `localStorage` (`shopgo_user`) để tự động phục hồi phiên khi trang khởi động lại.
8. **Câu hỏi xác nhận cho BA/PO**: Xác nhận cơ chế giữ đăng nhập qua F5 dựa trên localStorage?

---

### [MR-05] Xử lý khoảng trắng thừa và chuẩn hóa Email (Trim & Lowercase)
1. **Mã Rule ID**: MR-05
2. **Căn cứ Requirement gốc**: Chưa đề cập trong tài liệu gốc.
3. **Câu hỏi 06W tương ứng**: W3 (What if data lạ)
4. **Phân loại**: Boundary & Edge Rules
5. **Mô tả kẽ hở / quy tắc bị thiếu**: Người dùng copy-paste email có khoảng trắng ở đầu hoặc cuối chuỗi (ví dụ ` vip@shopgo.vn `), hoặc gõ chữ in hoa (`VIP@SHOPGO.VN`). Hệ thống có tự động trim và convert sang lowercase không?
6. **Rủi ro & Tác động**: Khách hàng nhập đúng email nhưng bị báo sai do khoảng trắng thừa vô hình từ bàn phím điện thoại/clipboard.
7. **Đề xuất hành vi xử lý mặc định**: Tự động trim khoảng trắng 2 đầu và không phân biệt chữ hoa thường đối với email.
8. **Câu hỏi xác nhận cho BA/PO**: Email đăng nhập có tự động trim khoảng trắng và cho phép không phân biệt hoa thường không?

---

### [MR-06] Kiểm soát tần suất đăng nhập sai (Brute-force)
1. **Mã Rule ID**: MR-06
2. **Căn cứ Requirement gốc**: Chưa đề cập trong tài liệu gốc.
3. **Câu hỏi 06W tương ứng**: W4 (What when timing)
4. **Phân loại**: Implicit & Authorization Rules
5. **Mô tả kẽ hở / quy tắc bị thiếu**: Có quy định khóa tạm thời tài khoản hoặc chặn IP sau N lần thử sai liên tiếp không?
6. **Rủi ro & Tác động**: Khả năng bị tấn công vét cạn mật khẩu.
7. **Đề xuất hành vi xử lý mặc định**: Do đây là bản demo frontend tĩnh, cho phép đăng nhập thử lại không giới hạn (hoặc chỉ cảnh báo sau 5 lần sai).
8. **Câu hỏi xác nhận cho BA/PO**: Bản hiện tại có áp dụng cơ chế giới hạn lần đăng nhập sai không?

---

### [MR-07] Phân quyền hiển thị và ưu đãi giữa VIP và Khách thường
1. **Mã Rule ID**: MR-07
2. **Căn cứ Requirement gốc**: `INPUT/function-a/02_ba/function-a.md` chỉ ghi: `vip: vip@shopgo.vn... tên: Trần Thị Mai; thường: khachhang@shopgo.vn... tên: Nguyễn Văn An`.
3. **Câu hỏi 06W tương ứng**: W5 (Who else actor)
4. **Phân loại**: Implicit & Authorization Rules
5. **Mô tả kẽ hở / quy tắc bị thiếu**: Ngoài tên hiển thị (`Trần Thị Mai (VIP)` vs `Nguyễn Văn An`), tài khoản VIP có được hưởng các quyền hạn, giao diện hay ưu đãi gì khác biệt trên ShopGo không?
6. **Rủi ro & Tác động**: Nếu có tính năng dành riêng cho VIP nhưng không được kiểm thử, sẽ bỏ sót lỗi phân quyền (Broken Access Control).
7. **Đề xuất hành vi xử lý mặc định**: VIP có thêm nhãn badge `(VIP)` cạnh tên ở header.
8. **Câu hỏi xác nhận cho BA/PO**: Xác nhận ngoài tên hiển thị thì tài khoản VIP có tính năng hoặc ưu đãi riêng biệt nào không?

---

### [MR-08] Đồng bộ giỏ hàng và điều hướng sau khi đăng nhập từ Giỏ hàng / Checkout
1. **Mã Rule ID**: MR-08
2. **Căn cứ Requirement gốc**: Chưa đề cập trong tài liệu gốc.
3. **Câu hỏi 06W tương ứng**: W6 (What happens after)
4. **Phân loại**: Dependency & Side-Effect Rules
5. **Mô tả kẽ hở / quy tắc bị thiếu**: Khi khách vãng lai đã nhặt hàng vào giỏ, sau đó bấm Thanh toán ➔ bật Modal Login ➔ Đăng nhập thành công, các món hàng trong giỏ có được bảo toàn và tự động chuyển tiếp tới màn Thanh toán không?
6. **Rủi ro & Tác động**: Mất giỏ hàng hoặc bị đưa về trang chủ khiến người dùng phải nhặt lại hàng từ đầu.
7. **Đề xuất hành vi xử lý mặc định**: Giữ nguyên giỏ hàng trong `localStorage`, sau khi login chuyển thẳng vào màn Checkout (`authRedirectTab`).
8. **Câu hỏi xác nhận cho BA/PO**: Luồng chuyển tiếp và bảo lưu giỏ hàng sau khi đăng nhập thành công từ nút Checkout được xử lý như đề xuất trên đúng không?

---

## 3. Tổng hợp Câu hỏi Clarification gửi BA/PO

| STT | Mã Rule | Phân loại | Câu hỏi cho BA/PO | Ưu tiên |
|:---|:---|:---|:---|:---|
| 1 | MR-01 | Exception & Error Handling | Khi nhập sai mật khẩu, thông báo lỗi chính xác hiển thị là gì? | **HIGH** |
| 2 | MR-02 | Exception & Error Handling | Khi nhập email không tồn tại hoặc sai định dạng, hệ thống phản hồi như thế nào? | **HIGH** |
| 3 | MR-03 | Boundary & Edge | Quy tắc bắt buộc (required) cho 2 trường Email & Mật khẩu khi submit trống là gì? | **HIGH** |
| 4 | MR-05 | Boundary & Edge | Email có tự động trim khoảng trắng 2 đầu và không phân biệt hoa thường không? | **MED** |
| 5 | MR-07 | Implicit & Authorization | Tài khoản VIP có quyền lợi, giao diện hoặc chiết khấu khác biệt so với Khách thường không? | **HIGH** |
| 6 | MR-08 | Dependency & Side-Effect | Khi đăng nhập thành công từ nút Thanh toán, hệ thống có giữ nguyên giỏ hàng và tự động mở màn Checkout không? | **MED** |
| 7 | MR-04 | State & Lifecycle | Xác nhận cơ chế giữ đăng nhập qua F5 dựa trên localStorage? | **LOW** |
| 8 | MR-06 | Implicit & Security | Có áp dụng giới hạn lần thử sai (Brute-force) hay không? | **LOW** |

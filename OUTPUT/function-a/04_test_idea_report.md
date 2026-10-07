# BÁO CÁO Ý TƯỞNG KIỂM THỬ (TEST IDEA REPORT) · function-a
Owner: qa-system/qa-analyst/test-idea-design · Nguồn: OUTPUT/function-a/03_viewpoint_report.md · Verdict: PASS

---

### BẢNG TỔNG HỢP TEST IDEA & FILTER

| # | Test Idea | Viewpoint | Kỹ thuật | Giữ/Bỏ | Lý do filter |
|---|---|---|---|---|---|
| TI-01 | Đăng nhập thành công với tài khoản Khách thường và kiểm tra tên hiển thị chính xác là Nguyễn Văn An trên header. | Happy Path | EP | Giữ | `Kiểm tra business rule đã xác định` |
| TI-02 | Đăng nhập thành công với tài khoản VIP và kiểm tra tên hiển thị có huy hiệu là Trần Thị Mai (VIP) trên header. | Happy Path | EP | Giữ | `Kiểm tra business rule đã xác định` |
| TI-03 | Mở modal đăng nhập và sử dụng tính năng Demo Accounts để tự động điền form rồi đăng nhập thành công. | Happy Path | EP | Giữ | `Viết được expected rõ ràng` |
| TI-04 | Bấm vào nút Thanh toán khi chưa đăng nhập và xác minh sau khi đăng nhập thành công hệ thống tự động chuyển vào màn Thanh toán. | Happy Path | State Transition | Giữ | `Viết được expected rõ ràng` |
| TI-05 | Đăng nhập với mật khẩu đúng nhiều lần trên cùng tài khoản. | Happy Path | EP | Bỏ | `Trivial` |
| TI-06 | Đăng nhập với email hợp lệ nhưng mật khẩu sai và kiểm tra thông báo lỗi "Email hoặc mật khẩu không chính xác.". | Negative | EP | Giữ | `Kiểm tra business rule đã xác định` |
| TI-07 | Đăng nhập với email không tồn tại trong hệ thống và kiểm tra thông báo lỗi "Email hoặc mật khẩu không chính xác.". | Negative | EP | Giữ | `Kiểm tra business rule đã xác định` |
| TI-08 | Đăng nhập khi để trống trường Email và kiểm tra thông báo lỗi "Vui lòng nhập đầy đủ thông tin.". | Negative | BVA | Giữ | `Kiểm tra business rule đã xác định` |
| TI-09 | Đăng nhập khi để trống trường Mật khẩu và kiểm tra thông báo lỗi "Vui lòng nhập đầy đủ thông tin.". | Negative | BVA | Giữ | `Kiểm tra business rule đã xác định` |
| TI-10 | Đăng nhập khi để trống cả hai trường Email và Mật khẩu và kiểm tra thông báo lỗi "Vui lòng nhập đầy đủ thông tin.". | Negative | Decision Table | Giữ | `Kiểm tra business rule đã xác định` |
| TI-11 | Nhập email sai định dạng cú pháp thiếu ký tự @ và kiểm tra hành vi validate của form. | Negative | EP | Giữ | `Rủi ro cao` |
| TI-12 | Nhập email có chứa khoảng trắng thừa ở đầu hoặc cuối chuỗi và kiểm tra hệ thống tự động trim để đăng nhập thành công. | Boundary | BVA | Giữ | `Chưa case nào cover` |
| TI-13 | Nhập email bằng ký tự in hoa toàn bộ và kiểm tra hệ thống không phân biệt chữ hoa thường để đăng nhập thành công. | Boundary | EP | Giữ | `Chưa case nào cover` |
| TI-14 | Nhập mật khẩu dài 1000 ký tự để kiểm tra tràn bộ đệm. | Boundary | BVA | Bỏ | `Trivial` |
| TI-15 | Kiểm tra trường Mật khẩu trên modal đăng nhập được che giấu ký tự dưới dạng password dot. | Security | EP | Giữ | `Rủi ro cao` |
| TI-16 | Đăng xuất tài khoản A và đăng nhập tài khoản B để xác minh không bị nhầm lẫn dữ liệu hoặc tên hiển thị giữa hai tài khoản. | Security | Decision Table | Giữ | `Rủi ro cao` |
| TI-17 | Nhập sai mật khẩu liên tiếp nhiều lần để kiểm tra hệ thống không bị crash hay treo giao diện. | Security | State Transition | Giữ | `Viết được expected rõ ràng` |
| TI-18 | Đăng nhập bằng tài khoản Quản trị viên (Admin) để kiểm tra trang quản trị. | Security | EP | Bỏ | `Ngoài scope (đối chiếu Out of Scope)` |
| TI-19 | Nhấn phím Enter tại ô Mật khẩu để xác minh form tự động submit đăng nhập thành công. | UX/Usability | EP | Giữ | `Viết được expected rõ ràng` |
| TI-20 | Đóng modal đăng nhập bằng nút Close hoặc click ngoài overlay mà không làm thay đổi trạng thái trang. | UX/Usability | State Transition | Giữ | `Viết được expected rõ ràng` |
| TI-21 | Làm mới trang (F5) sau khi đã đăng nhập và kiểm tra trạng thái phiên làm việc vẫn được duy trì nguyên vẹn từ localStorage. | Integration | State Transition | Giữ | `Kiểm tra business rule đã xác định` |
| TI-22 | Đăng xuất khỏi hệ thống và kiểm tra hệ thống điều hướng quay về trang chủ và không hiển thị giỏ hàng. | Integration | State Transition | Giữ | `Kiểm tra business rule đã xác định` |
| TI-23 | Đăng nhập lại với cùng một tài khoản sau khi đăng xuất. | Integration | State Transition | Bỏ | `Trùng lặp hoàn toàn` |

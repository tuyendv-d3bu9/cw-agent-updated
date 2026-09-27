# BÁO CÁO Ý TƯỞNG KIỂM THỬ (TEST IDEA REPORT) · function-d-voucher
**Owner**: `agents/qa-analyst/test-idea-design`  
**Nguồn**: `OUTPUT/function-d-voucher/03_viewpoint_report.md` · `knowledge/features/function-d-voucher.md`  
**Task Slug**: `function-d-voucher` · **Ngày lập**: 2026-09-20  
**Verdict**: `PASS` (Đã bao phủ 100% 06 Viewpoints, 10 Business Rules và 07 Confirmed Missing Rules; sàng lọc Giữ/Bỏ nghiêm ngặt)

---

### BẢNG TỔNG HỢP TEST IDEA & FILTER

| # | Test Idea (Đúng 01 câu) | Viewpoint | Kỹ thuật | Giữ/Bỏ | Lý do filter |
|---|---|---|---|---|---|
| **TI-01** | Áp dụng thành công mã giảm tiền cố định `GIAM50K` cho đơn hàng đạt mức sàn 200.000 VNĐ và giảm đúng 50.000 VNĐ vào tiền hàng. | Happy Path | EP | **Giữ** | Kiểm tra business rule đã xác định |
| **TI-02** | Áp dụng thành công mã phần trăm `SALE20` cho đơn hàng 350.000 VNĐ và giảm đúng 20% tiền hàng (70.000 VNĐ). | Happy Path | EP | **Giữ** | Kiểm tra business rule đã xác định |
| **TI-03** | Áp dụng thành công mã `SALE20` cho đơn hàng 600.000 VNĐ và hệ thống áp đúng mức trần chiết khấu tối đa `maxCap` 100.000 VNĐ. | Happy Path | BVA | **Giữ** | Rủi ro cao |
| **TI-04** | Nhập mã voucher bằng chữ thường `giam50k` hoặc có khoảng trắng ở hai đầu `  GIAM50K  ` và hệ thống tự động chuẩn hóa để áp mã thành công. | Happy Path | EP | **Giữ** | Kiểm tra business rule đã xác định |
| **TI-05** | Bấm trực tiếp vào badge voucher gợi ý trên giao diện để tự động điền mã và kích hoạt áp dụng thành công. | Happy Path | EP | **Giữ** | Viết được expected rõ ràng |
| **TI-06** | Nhập mã voucher đã hết hạn sử dụng `HETHAN` và hệ thống từ chối áp dụng kèm thông báo lỗi mã đã hết hạn. | Negative | EP | **Giữ** | Kiểm tra business rule đã xác định |
| **TI-07** | Nhập mã voucher không tồn tại trong hệ thống và hệ thống từ chối áp dụng kèm thông báo lỗi mã không tồn tại. | Negative | EP | **Giữ** | Kiểm tra business rule đã xác định |
| **TI-08** | Áp dụng mã khi đơn hàng chưa đạt mức sàn tối thiểu 200.000 VNĐ và hệ thống từ chối kèm thông báo lỗi giá trị tối thiểu. | Negative | EP | **Giữ** | Rủi ro cao |
| **TI-09** | Áp dụng mã `SALE20` cho đơn hàng 250.000 VNĐ (đạt mức sàn 200k nhưng chưa đạt điều kiện 300k của riêng mã) và hệ thống từ chối áp dụng. | Negative | Decision Table | **Giữ** | Kiểm tra business rule đã xác định |
| **TI-10** | Bỏ trống ô nhập mã voucher hoặc chỉ nhập khoảng trắng rồi bấm Áp dụng và hệ thống báo lỗi yêu cầu nhập mã khuyến mãi. | Negative | EP | **Giữ** | Viết được expected rõ ràng |
| **TI-11** | Giảm số lượng sản phẩm trong giỏ hàng khiến tổng tiền tụt xuống dưới mức sàn 200.000 VNĐ sau khi đã áp mã và hệ thống tự động gỡ bỏ voucher kèm thông báo cảnh báo. | Negative | State Transition | **Giữ** | Rủi ro cao |
| **TI-12** | Bấm nút "Gỡ bỏ" khi đang có voucher áp dụng thành công và hệ thống hủy mã, hoàn lại tổng tiền thanh toán gốc. | Negative | State Transition | **Giữ** | Viết được expected rõ ràng |
| **TI-13** | Cố tình nhập liên tiếp 2 mã voucher khác nhau trên cùng một đơn hàng và hệ thống chỉ giữ mã mới nhất được áp dụng thành công. | Negative | Decision Table | **Giữ** | Kiểm tra business rule đã xác định |
| **TI-14** | Kiểm tra áp dụng mã `GIAM50K` cho đơn hàng ở giá trị cận biên dưới 199.000 VNĐ và hệ thống từ chối áp dụng. | Boundary | BVA | **Giữ** | Rủi ro cao |
| **TI-15** | Kiểm tra áp dụng mã `GIAM50K` cho đơn hàng ở đúng giá trị biên chuẩn 200.000 VNĐ và hệ thống chấp nhận áp dụng. | Boundary | BVA | **Giữ** | Rủi ro cao |
| **TI-16** | Kiểm tra áp dụng mã `SALE20` cho đơn hàng ở giá trị cận biên dưới 299.000 VNĐ và hệ thống từ chối áp dụng. | Boundary | BVA | **Giữ** | Rủi ro cao |
| **TI-17** | Kiểm tra áp dụng mã `SALE20` cho đơn hàng ở đúng giá trị biên chuẩn 300.000 VNĐ và hệ thống chấp nhận áp dụng giảm 60.000 VNĐ. | Boundary | BVA | **Giữ** | Rủi ro cao |
| **TI-18** | Kiểm tra chiết khấu mã `SALE20` tại đơn hàng 499.000 VNĐ giảm 99.800 VNĐ (chưa chạm trần) và đơn hàng 500.000 VNĐ giảm đúng trần 100.000 VNĐ. | Boundary | BVA | **Giữ** | Rủi ro cao |
| **TI-19** | Kiểm tra làm tròn số tiền chiết khấu lẻ của voucher % bằng hàm `Math.floor()` đối với đơn hàng có số tiền lẻ 333.333 VNĐ. | Boundary | BVA | **Giữ** | Rủi ro cao |
| **TI-20** | Nhập mã voucher có độ dài 2 ký tự (dưới minlength 3) và hệ thống từ chối áp dụng. | Boundary | BVA | **Giữ** | Viết được expected rõ ràng |
| **TI-21** | Nhập mã voucher có độ dài đúng 20 ký tự (maxlength) và hệ thống chấp nhận xử lý. | Boundary | BVA | **Giữ** | Viết được expected rõ ràng |
| **TI-22** | Cố tình nhập chuỗi vượt quá 20 ký tự và ô input chặn không cho nhập thêm ký tự thứ 21. | Boundary | BVA | **Giữ** | Viết được expected rõ ràng |
| **TI-23** | Nhập ký tự đặc biệt hoặc emoji vào ô mã voucher và hệ thống chặn tại client với thông báo "Mã không đúng định dạng". | Security | EP | **Giữ** | Kiểm tra business rule đã xác định |
| **TI-24** | Nhập khoảng trắng ở giữa chuỗi mã như `GIAM 50K` và hệ thống chặn không cho submit với thông báo không đúng định dạng. | Security | EP | **Giữ** | Kiểm tra business rule đã xác định |
| **TI-25** | Nhập payload XSS `<script>alert(1)</script>` vào ô mã voucher và hệ thống không thực thi mã độc, hiển thị thông báo lỗi an toàn. | Security | EP | **Giữ** | Rủi ro cao |
| **TI-26** | Nhập payload SQL Injection `' OR '1'='1` vào ô mã voucher và hệ thống xử lý tham số an toàn, không rò rỉ dữ liệu backend. | Security | EP | **Giữ** | Rủi ro cao |
| **TI-27** | Thử nhập sai mã liên tục 20 lần trong 10 giây để kiểm tra cơ chế phòng thủ brute-force của hệ thống. | Security | EP | **Giữ** | Rủi ro cao |
| **TI-28** | Bấm nút "Áp dụng" và hệ thống lập tức disable nút bấm kèm hiển thị trạng thái loading trong thời gian xử lý request để chống spam click. | UX/Usability | State Transition | **Giữ** | Kiểm tra business rule đã xác định |
| **TI-29** | Kiểm tra màu sắc và ký hiệu hiển thị số tiền giảm giá là màu xanh lá cây với dấu trừ `-` và badge hiển thị tên mã đang dùng. | UX/Usability | EP | **Giữ** | Viết được expected rõ ràng |
| **TI-30** | Kiểm tra giao diện form nhập voucher và danh sách badge voucher hiển thị trực quan, không vỡ layout trên cả Desktop và Mobile Web. | UX/Usability | EP | **Giữ** | Viết được expected rõ ràng |
| **TI-31** | Kiểm tra tính độc lập giữa chiết khấu voucher và phí vận chuyển để đảm bảo voucher không giảm trừ trên tiền ship 30.000 VNĐ. | Integration | Decision Table | **Giữ** | Rủi ro cao |
| **TI-32** | Kiểm tra hạn mức số lượt dùng của voucher chỉ bị trừ chính thức khi khách hàng hoàn tất bước Đặt hàng thành công (`Place Order`). | Integration | State Transition | **Giữ** | Rủi ro cao |
| **TI-33** | Kiểm tra tự động phục hồi lại lượt sử dụng voucher cho tài khoản khách hàng khi đơn hàng có áp mã bị hủy trước khi giao. | Integration | State Transition | **Giữ** | Kiểm tra business rule đã xác định |
| **TI-34** | Kiểm tra dữ liệu đơn hàng được lưu vào database với đầy đủ các trường `discount`, `appliedCode`, `subtotal`, `shippingFee` và `total`. | Integration | EP | **Giữ** | Viết được expected rõ ràng |
| **TI-35** | Kiểm tra đổi mật khẩu tài khoản người dùng trước khi áp mã giảm giá. | Integration | EP | **Bỏ** | Ngoài scope (đối chiếu Out of Scope) |
| **TI-36** | Kiểm tra màu nền thanh footer trên trang thanh toán khi áp mã voucher thành công. | UX/Usability | EP | **Bỏ** | Trivial |
| **TI-37** | Nhập mã bằng chữ in hoa `GIAM50K` trên trình duyệt Firefox sau khi đã test trên Chrome. | Happy Path | EP | **Bỏ** | Trùng lặp hoàn toàn |
| **TI-38** | Đo lường mức độ hài lòng cảm xúc của khách hàng khi nhìn thấy thông báo giảm giá. | UX/Usability | EP | **Bỏ** | Mơ hồ không định nghĩa được expected |

---

### THỐNG KÊ KẾT QUẢ SÀNG LỌC (TEST IDEA FILTER METRICS)
- **Tổng số Test Ideas thiết kế**: 38 ideas.
- **Số lượng GIỮ (In-Scope)**: **34 Test Ideas** (Được chuyển tiếp sang Giai đoạn 3 để sinh Bộ Test Cases chi tiết).
- **Số lượng BỎ (Out-Scope / Lãng phí)**: **04 Test Ideas** (Đã giải trình lý do rõ ràng theo đúng checklist tiêu chuẩn).
- **Tỷ lệ bao phủ rủi ro**: 100% Risk Areas và 100% Business Rules (`BR-01` -> `BR-10`) đều có ít nhất 1 Test Idea Giữ.

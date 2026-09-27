# BÁO CÁO PHÂN TÍCH QUY TẮC NGHIỆP VỤ BỊ THIẾU (MISSING-RULE REPORT)
**Owner**: `agents/qa-analyst/missing-rule-06w`  
**Nguồn**: `OUTPUT/function-d-voucher/01_requirement_risk_summary.md` · `INPUT/spec.txt` · Live App `cwshopgo.github.io`  
**Task Slug**: `function-d-voucher`  
**Ngày lập**: 2026-09-20  
**Verdict**: `PASS` (Đã có phản hồi chính thức từ BA/PO cho toàn bộ 07 quy tắc nghiệp vụ)

---

## 1. Ma trận Truy Vết 06W

| STT | Câu hỏi 06W | Trọng tâm đã quét | Trạng thái | Mã Missing Rule liên quan |
|:---|:---|:---|:---|:---|
| **W1** | **What if input lạ** | Nhập ký tự đặc biệt, HTML/SQLi, khoảng trắng giữa chuỗi, độ dài vượt giới hạn | Đã phát hiện | `MR-01` |
| **W2** | **What if state lạ** | Đổi số lượng giỏ hàng sau khi đã áp mã thành công (tổng tiền tụt dưới mức sàn) | Đã phát hiện | `MR-02` |
| **W3** | **What if data lạ** | Xung đột mức sàn 300k (`spec.txt`) và mã `GIAM50K` (200k trên web live); làm tròn số tiền lẻ của voucher % | Đã phát hiện | `MR-03`, `MR-04` |
| **W4** | **What when timing** | Mã hết hạn trong phiên thanh toán; spam click nút "Áp dụng" liên tục (double click) | Đã phát hiện | `MR-05` |
| **W5** | **Who else actor** | Hai người dùng cùng áp dụng lượt voucher cuối cùng (Race Condition) | Đã phát hiện | `MR-06` |
| **W6** | **What happens after** | Hủy đơn hàng sau khi áp mã thành công (phục hồi quyền dùng voucher) | Đã phát hiện | `MR-07` |

---

## 2. Chi Tiết Missing Rules (Chuẩn 8 Trường)

### [MR-01] Kiểm soát định dạng nhập liệu & Ký tự đặc biệt vào ô Voucher
1. **Mã Rule ID**: `MR-01`
2. **Căn cứ Requirement gốc**: `spec_function_d.md` §1 ("Khách hàng có ô nhập Mã giảm giá và nút Áp dụng") và Web live `cwshopgo.github.io` (đã có `.trim().toUpperCase()`).
3. **Câu hỏi 06W tương ứng**: `W1 (What if input lạ)`
4. **Phân loại**: `Implicit & Authorization Rules`
5. **Mô tả kẽ hở / quy tắc bị thiếu**: Tài liệu chưa quy định giới hạn độ dài tối đa (maxlength) và bộ ký tự cho phép. Nếu người dùng paste chuỗi 500 ký tự, emoji, hoặc ký tự script `<script>`, hệ thống xử lý ra sao?
6. **Rủi ro & Tác động**: Rủi ro lỗi tràn giao diện (UI overflow), tốn tài nguyên truy vấn backend, hoặc nguy cơ bảo mật XSS nếu chuỗi voucher được render lại mà không escape.
7. **Đề xuất hành vi xử lý mặc định**:
   - Giới hạn độ dài ô nhập: tối đa 20 ký tự (`maxlength="20"`).
   - Regex hợp lệ: Chỉ chấp nhận chữ in hoa không dấu và chữ số `^[A-Z0-9]{3,20}$`.
   - Nếu chứa ký tự đặc biệt hoặc khoảng trắng ở giữa chuỗi (ví dụ `GIAM 50K` hay `SALE@20`): Báo lỗi `"Mã giảm giá không đúng định dạng."`.
8. **Câu hỏi xác nhận cho BA/PO**:
   > *Hệ thống có áp dụng regex `^[A-Z0-9]{3,20}$` để chặn ký tự đặc biệt ngay tại client không, hay gửi lên server và báo "Mã không tồn tại"?*  
   > ➔ **Lựa chọn**: `[A]` Chặn client với thông báo "Mã không đúng định dạng" (Khuyến nghị) · `[B]` Coi như mã không tồn tại.

---

### [MR-02] Tự động thu hồi voucher khi giỏ hàng thay đổi không còn đạt điều kiện
1. **Mã Rule ID**: `MR-02`
2. **Căn cứ Requirement gốc**: `spec_function_d.md` §1 ("Mã chỉ dùng được khi đơn hàng đạt giá trị tối thiểu quy định của mã") và `technical_spec.md` (mức sàn 300k).
3. **Câu hỏi 06W tương ứng**: `W2 (What if state lạ)`
4. **Phân loại**: `State & Lifecycle Rules`
5. **Mô tả kẽ hở / quy tắc bị thiếu**: Khách hàng có đơn 350k đã áp mã thành công. Sau đó khách quay lại giỏ hàng giảm bớt sản phẩm hoặc xóa sản phẩm khiến tiền hàng chỉ còn 250k (dưới mức sàn 300k). Tài liệu chưa nêu rõ hệ thống xử lý voucher đang áp dụng như thế nào.
6. **Rủi ro & Tác động**: Thất thoát doanh thu nếu hệ thống vẫn giữ nguyên tiền chiết khấu dù đơn không còn đủ điều kiện; hoặc gây lỗi crash trạng thái tính toán.
7. **Đề xuất hành vi xử lý mặc định**:
   - Ngay khi `subtotal < minSubtotal` (hoặc `< 300.000 VNĐ`), hệ thống tự động gỡ bỏ voucher (`handleRemoveVoucher`).
   - Hiển thị toast/thông báo cảnh báo màu cam: *"Mã giảm giá đã bị gỡ do đơn hàng không còn đủ giá trị tối thiểu 300.000 VNĐ."*.
8. **Câu hỏi xác nhận cho BA/PO**:
   > *Khi đơn hàng bị giảm giá trị xuống dưới điều kiện của voucher, hệ thống tự động gỡ mã ngay lập tức hay giữ mã và báo lỗi khi bấm nút "Đặt hàng"?*  
   > ➔ **Lựa chọn**: `[A]` Tự động gỡ mã ngay lập tức kèm thông báo (Khuyến nghị) · `[B]` Giữ mã và chặn tại nút Đặt hàng.

---

### [MR-03] Xung đột mức sàn tối thiểu 300k (`spec.txt`) và cấu hình mã `GIAM50K` (200k)
1. **Mã Rule ID**: `MR-03`
2. **Căn cứ Requirement gốc**: `INPUT/spec.txt` ("Mức hóa đơn tối thiểu áp mã là 300k") so với Web live `cwshopgo.github.io` (`GIAM50K` có `minSubtotal: 200.000 VNĐ`).
3. **Câu hỏi 06W tương ứng**: `W3 (What if data lạ)`
4. **Phân loại**: `Boundary & Edge Rules`
5. **Mô tả kẽ hở / quy tắc bị thiếu**: Xuất hiện mâu thuẫn giữa mô tả kỹ thuật mới và hiện trạng code demo của web. Cần làm rõ mức độ ưu tiên giữa quy định sàn hệ thống và quy định riêng của từng mã.
6. **Rủi ro & Tác động**: Gây hiểu lầm cho người dùng và tester. Nếu áp mức sàn 300k, mã `GIAM50K` ghi "cho đơn từ 200k" nhưng người dùng mua đơn 220k bấm áp dụng sẽ bị từ chối, gây khiếu nại nghiêm trọng.
7. **Đề xuất hành vi xử lý mặc định**:
   - Xác định quy định 300k trong `spec.txt` là **Mức sàn kỹ thuật toàn hệ thống (Global Hard Floor)**.
   - Mã `GIAM50K` cần được cập nhật lại điều kiện tối thiểu thành `300.000 VNĐ` (mô tả cập nhật: "Giảm ngay 50.000 ₫ cho đơn hàng tối thiểu từ 300.000 ₫").
8. **Câu hỏi xác nhận cho BA/PO/Dev**:
   > *Quy định 300k là mức sàn chung toàn hệ thống (mọi mã đều phải min >= 300k, cần update mã GIAM50K lên min 300k) hay 300k chỉ áp dụng cho mã % (SALE20)?*  
   > ➔ **Lựa chọn**: `[A]` Là mức sàn toàn hệ thống, update min GIAM50K thành 300k (Khuyến nghị) · `[B]` Chỉ áp dụng cho SALE20, GIAM50K giữ nguyên 200k.

---

### [MR-04] Quy tắc làm tròn số tiền chiết khấu lẻ của voucher phần trăm (%)
1. **Mã Rule ID**: `MR-04`
2. **Căn cứ Requirement gốc**: `spec_function_d.md` §1 ("Có 2 loại mã: giảm theo phần trăm và giảm số tiền cố định") và `_project.md` (tiền tệ VNĐ không có số thập phân).
3. **Câu hỏi 06W tương ứng**: `W3 (What if data lạ)`
4. **Phân loại**: `Boundary & Edge Rules`
5. **Mô tả kẽ hở / quy tắc bị thiếu**: Khi áp dụng voucher giảm theo % (ví dụ voucher 15% hoặc 20%) cho đơn hàng có số tiền lẻ (ví dụ: sản phẩm có giá 335.500 VNĐ * 20% = 67.100 VNĐ, hoặc giá 333.333 VNĐ * 15% = 49.999,95 VNĐ), quy tắc làm tròn tiền tệ chưa được nêu trong spec.
6. **Rủi ro & Tác động**: Sai lệch số tiền thanh toán giữa Frontend và Cổng thanh toán (Payment Gateway), gây lỗi lệch sổ kế toán dù chỉ 1 đồng.
7. **Đề xuất hành vi xử lý mặc định**:
   - Sử dụng hàm làm tròn xuống hàng đơn vị đồng: `Math.floor(subtotal * percent)`.
   - Đảm bảo hiển thị số nguyên VNĐ (không có số thập phân).
8. **Câu hỏi xác nhận cho BA/PO**:
   > *Số tiền chiết khấu từ voucher phần trăm được làm tròn theo nguyên tắc nào?*  
   > ➔ **Lựa chọn**: `[A]` Làm tròn toán học thông thường `Math.round()` · `[B]` Làm tròn xuống hàng đồng `Math.floor()` (Khuyến nghị an toàn cho khách) · `[C]` Làm tròn đến hàng nghìn gần nhất.

---

### [MR-05] Phòng chống tấn công gửi nhiều request liên tiếp (Debounce / Double Click)
1. **Mã Rule ID**: `MR-05`
2. **Căn cứ Requirement gốc**: `spec_function_d.md` §1 ("Khi khách hàng nhập mã rồi bấm Áp dụng...").
3. **Câu hỏi 06W tương ứng**: `W4 (What when timing)`
4. **Phân loại**: `Exception & Error Handling Rules`
5. **Mô tả kẽ hở / quy tắc bị thiếu**: Khi khách hàng bấm nút "Áp dụng" liên tục 5-10 lần trong 1 giây (double click / spam), hệ thống có vô hiệu hóa nút trong lúc đang xử lý không?
6. **Rủi ro & Tác động**: Gây quá tải request, lỗi đồng thời (race condition), hoặc giao diện bị nhấp nháy/treo do xử lý nhiều phản hồi cùng lúc.
7. **Đề xuất hành vi xử lý mặc định**:
   - Khi bấm "Áp dụng", lập tức `disable` nút bấm và hiển thị trạng thái loading spinner (Debounce 500ms).
   - Chỉ cho phép bấm lại sau khi request trước đó đã hoàn tất xử lý.
8. **Câu hỏi xác nhận cho BA/Dev**:
   > *Nút "Áp dụng" có được disable và khóa spam click trong lúc chờ xử lý hay không?*  
   > ➔ **Lựa chọn**: `[A]` Có disable và hiển thị loading (Khuyến nghị) · `[B]` Không cần chặn.

---

### [MR-06] Kiểm soát giới hạn số lượt dùng & Khóa đồng thời (Race Condition)
1. **Mã Rule ID**: `MR-06`
2. **Căn cứ Requirement gốc**: `knowledge/_glossary.md` ("Voucher có lượt dùng").
3. **Câu hỏi 06W tương ứng**: `W5 (Who else actor)`
4. **Phân loại**: `Dependency & Side-Effect Rules`
5. **Mô tả kẽ hở / quy tắc bị thiếu**: Nếu một voucher có số lượng giới hạn (ví dụ chỉ còn 1 lượt dùng duy nhất) và có 2 khách hàng cùng nhập mã và bấm "Áp dụng" cùng một thời điểm. Hệ thống khóa lượt dùng ở thời điểm nào?
6. **Rủi ro & Tác động**: Cả 2 khách đều thấy áp mã thành công, nhưng khi thanh toán thì 1 người bị lỗi hoặc doanh nghiệp bị phát hành vượt quá ngân sách khuyến mãi (Overselling vouchers).
7. **Đề xuất hành vi xử lý mặc định**:
   - Tại bước "Áp dụng": Chỉ kiểm tra tính hợp lệ và giữ chỗ tạm thời (Soft Reserve trong 10-15 phút).
   - Tại bước "Đặt hàng" (Commit Order): Thực hiện trừ lượt dùng chính thức với cơ chế DB transaction khóa dòng (Pessimistic / Optimistic Lock). Khách hàng thanh toán sau sẽ nhận thông báo: *"Mã giảm giá vừa hết lượt sử dụng."*.
8. **Câu hỏi xác nhận cho BA/Dev**:
   > *Số lượt dùng của mã voucher được trừ chính thức tại bước Áp dụng hay bước Đặt hàng thành công?*  
   > ➔ **Lựa chọn**: `[A]` Trừ khi Đặt hàng thành công (Khuyến nghị chuẩn thương mại điện tử) · `[B]` Trừ ngay khi bấm Áp dụng.

---

### [MR-07] Chính sách hoàn trả quyền sử dụng voucher khi hủy đơn hàng
1. **Mã Rule ID**: `MR-07`
2. **Căn cứ Requirement gốc**: `shopgo_overview.md` §4 (Nhóm G: Quản lý đơn hàng có tính năng "Hủy đơn").
3. **Câu hỏi 06W tương ứng**: `W6 (What happens after)`
4. **Phân loại**: `State & Lifecycle Rules`
5. **Mô tả kẽ hở / quy tắc bị thiếu**: Khi đơn hàng đã đặt thành công có sử dụng voucher nhưng sau đó khách hàng (hoặc Admin) thực hiện "Hủy đơn hàng" (trước khi giao hàng), quyền sử dụng mã voucher đó có được hoàn trả lại cho tài khoản khách hàng không?
6. **Rủi ro & Tác động**: Khách hàng bức xúc vì mất quyền lợi voucher dù đơn chưa được giao; hoặc ngược lại, khách lợi dụng hủy đơn để nhận hoàn tiền mặt gian lận.
7. **Đề xuất hành vi xử lý mặc định**:
   - Nếu đơn hàng bị hủy khi chưa giao và mã voucher vẫn còn trong hạn sử dụng: Hệ thống tự động phục hồi lại 1 lượt sử dụng mã cho tài khoản khách hàng.
   - Nếu mã voucher đã hết hạn tại thời điểm hủy đơn: Không phục hồi mã.
8. **Câu hỏi xác nhận cho BA/PO**:
   > *Khi khách hàng hủy đơn hàng hợp lệ, voucher đã dùng có được hoàn trả lại cho tài khoản không?*  
   > ➔ **Lựa chọn**: `[A]` Có hoàn trả nếu mã còn hạn (Khuyến nghị) · `[B]` Không hoàn trả (hủy là mất).

---

## 3. Tổng Hợp Bảng Câu Hỏi Clarification Gửi BA/PO & Đề Xuất Mặc Định

| STT | Mã Rule | Phân loại | Câu hỏi xác nhận cho BA/PO/Dev | Phản hồi chính thức của BA/PO | Quyết định đã chốt | Trạng thái |
|:---|:---|:---|:---|:---|:---|:---|
| 1 | **MR-03** | Boundary & Edge | Quy định mức sàn áp mã chung toàn hệ thống là 200k hay 300k? | **"Mức sàn là 200k chứ không phải 300k"** | Mức sàn toàn hệ thống là `200.000 VNĐ` (khớp web live) | `Confirmed` |
| 2 | **MR-02** | State & Lifecycle | Khi sửa giỏ hàng khiến tổng tiền tụt dưới mức sàn 200k, hệ thống xử lý ra sao? | **"Hệ thống sẽ tự gỡ và disable voucher có kèm thông báo"** | Tự động gỡ voucher + disable + hiển thị toast cảnh báo | `Confirmed` |
| 3 | **MR-01** | Authorization | Có chặn ký tự lạ (ký tự đặc biệt, SQLi, space giữa) tại client không? | **"chặn ký tự lạ"** | Chặn ký tự lạ, regex `^[A-Z0-9]{3,20}$`, báo lỗi sai format | `Confirmed` |
| 4 | **MR-04** | Boundary & Edge | Số tiền chiết khấu của voucher % được làm tròn theo nguyên tắc nào? | **"Đồng ý"** | Làm tròn xuống hàng đơn vị đồng `Math.floor()` | `Confirmed` |
| 5 | **MR-05** | Error Handling | Nút "Áp dụng" có được disable và hiển thị loading chống double-click spam không? | **"Disable nuts khi đang áp dụng."** | Disable nút Áp dụng và hiển thị trạng thái loading khi submit | `Confirmed` |
| 6 | **MR-06** | Dependency | Lượt dùng voucher được trừ tại bước Áp dụng hay bước Đặt hàng thành công? | **"đồng ý"** | Trừ hạn mức lượt dùng tại thời điểm Đặt hàng thành công | `Confirmed` |
| 7 | **MR-07** | State & Lifecycle | Khi hủy đơn hàng, mã voucher có được hoàn lại quyền sử dụng cho khách hàng không? | **"Phục hồi lại."** | Tự động phục hồi lại lượt sử dụng voucher nếu mã còn hạn | `Confirmed` |

---

## 4. Chốt Chặn Nghiệm Thu Chặng 2 (Quality Gate Verdict)
> **VERDICT**: `PASS`  
> **Lý do**: Báo cáo đã quét đủ 100% 6 câu hỏi W1→W6, phát hiện và chi tiết hóa 07 Missing Rules (`MR-01` đến `MR-07`) đủ 8 trường chuẩn. Toàn bộ 07 quy tắc đã được BA/PO/User phản hồi chính thức và chốt phương án. Mọi xung đột logic (đặc biệt là mức sàn 200k) đã được giải quyết triệt để.  
> **Hành động**: Đạt chuẩn nghiệm thu Gate 2 ➔ Chuyển giao thông tin sang **Giai đoạn 2: Thiết kế Viewpoints (`03_viewpoint_report.md`) & Test Ideas (`04_test_idea_report.md`)**.

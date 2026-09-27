# REQUIREMENT & RISK ANALYSIS REPORT
**Dạng tài liệu nhận diện**: Prose Document kết hợp Technical Specification & Live Environment Spec  
**Task Slug**: `function-d-voucher`  
**Dự án**: ShopGo — Nhóm tính năng E: Thanh toán · Function D: Áp dụng Mã Giảm Giá (Voucher)  
**Ngày phân tích**: 2026-09-20 · **Chuyên gia thực hiện**: `qa-analyst`  
**Verdict Chặng 1**: `ASK` (Có câu hỏi mở và phát hiện xung đột mức sàn 300k cần BA/PO/Dev xác nhận)

---

## 1. FEATURE OVERVIEW
Chức năng **Function D: Áp dụng Mã Giảm Giá (Voucher)** nằm ở bước Thanh toán của Nhóm tính năng E trên nền tảng thương mại điện tử **ShopGo**. Tính năng cho phép khách mua hàng nhập mã khuyến mãi để được giảm trừ trực tiếp vào tổng tiền hàng (`subtotal`) trước khi chốt đơn và thanh toán, mang lại trải nghiệm mua sắm hấp dẫn và thúc đẩy giá trị giỏ hàng.

---

## 2. ACTOR & USER ROLE
- **Khách mua hàng (Customer / Member)**: Đã đăng nhập vào hệ thống, có giỏ hàng hợp lệ; có quyền nhập mã khuyến mãi, bấm "Áp dụng", xem số tiền được giảm trừ và tổng thanh toán mới, hoặc bấm "Gỡ bỏ" để đổi mã khác.
- **Khách vãng lai (Guest)**: Theo quy ước hệ thống ShopGo, khách vãng lai có thể xem sản phẩm và thêm vào giỏ hàng, nhưng bắt buộc phải đăng nhập/đăng ký tài khoản khi bước vào quy trình Thanh toán để sử dụng voucher.
- **Hệ thống ShopGo (System Actor)**: Kiểm tra tính hợp lệ của mã (tồn tại, trạng thái hết hạn, điều kiện giá trị đơn tối thiểu), tính toán mức chiết khấu (% có chặn `maxCap` hoặc số tiền cố định), tính phí vận chuyển và cập nhật tổng tiền phải trả.
- **Quản trị viên (Admin - Context)**: Thiết lập, kích hoạt hoặc vô hiệu hóa các mã giảm giá tại hệ thống Back-office (ngoài phạm vi kiểm thử chi tiết của chức năng này).

---

## 3. BUSINESS RULES
Trích xuất toàn bộ quy tắc nghiệp vụ từ tài liệu BA, Technical Spec và ứng dụng thực tế:

- **BR-01**: **Phân loại mã giảm giá**: Hệ thống hỗ trợ 2 loại voucher chính:
  - Giảm theo phần trăm (`%` chiết khấu trên giá trị tiền hàng).
  - Giảm theo số tiền cố định (`VNĐ`).
- **BR-02**: **Điều kiện giá trị tối thiểu của mã**: Mã chỉ dùng được khi tổng giá trị tiền hàng của đơn đạt giá trị tối thiểu quy định của mã đó (`subtotal >= minSubtotal`).
- **BR-03**: **Thời hạn sử dụng**: Mỗi mã giảm giá có một ngày hết hạn xác định. Mã đã quá hạn sẽ không thể áp dụng.
- **BR-04**: **Áp dụng thành công**: Khi mã hợp lệ và thỏa mãn mọi điều kiện, hệ thống hiển thị số tiền được giảm (dạng `-X.000 ₫`) và hiển thị tổng tiền thanh toán mới sau khi giảm trừ.
- **BR-05**: **Xử lý lỗi không hợp lệ hoặc hết hạn**: Nếu mã không tồn tại, sai định dạng hoặc đã hết hạn, hệ thống hiển thị thông báo lỗi rõ ràng và giữ nguyên giá trị đơn hàng.
- **BR-06**: **Chuẩn hóa chuỗi nhập mã**: Hệ thống tự động loại bỏ khoảng trắng thừa ở 2 đầu (`trim()`) và tự động chuyển đổi thành chữ in hoa (`toUpperCase()`). Nếu ô nhập trống hoặc chỉ có khoảng trắng mà bấm áp dụng, hệ thống báo lỗi `"Vui lòng nhập mã khuyến mãi."`.
- **BR-07**: **Mức trần giảm giá tối đa (`maxCap`)**: Đối với mã giảm giá theo tỷ lệ phần trăm (`%`), hệ thống hỗ trợ cấu hình mức trần chiết khấu tối đa (ví dụ mã `SALE20` giảm 20% tối đa `100.000 VNĐ`). Số tiền giảm thực tế = `min(subtotal * %, maxCap)`.
- **BR-08**: **Hủy / Gỡ bỏ mã giảm giá**: Sau khi đã áp dụng mã thành công, hệ thống cung cấp nút "Gỡ bỏ" (`#btn-remove-voucher`) cho phép người dùng hủy mã hiện tại để phục hồi giá trị ban đầu hoặc nhập mã voucher khác.
- **BR-09**: **Phạm vi áp dụng chiết khấu**: Voucher chỉ áp dụng chiết khấu trên tổng tiền hàng (`subtotal`), tuyệt đối không giảm trừ trên phí vận chuyển (`shippingFee`).
- **BR-10**: **Mức sàn đơn hàng áp mã theo Technical Spec**: Mức hóa đơn tối thiểu để được kích hoạt áp dụng bất kỳ mã giảm giá nào là `300.000 VNĐ` (`subtotal >= 300.000 VNĐ`). Đơn hàng dưới 300k không đủ điều kiện áp mã.

---

## 4. HAPPY PATH
1. **Bước 1**: Khách hàng đã đăng nhập, có đơn hàng với tổng tiền hàng hợp lệ (`subtotal >= 300.000 VNĐ`), đang ở màn hình Thanh toán.
2. **Bước 2**: Khách hàng nhập mã giảm giá hợp lệ (ví dụ: `SALE20` hoặc `GIAM50K`) vào ô input `#input-voucher-code` (hoặc bấm vào badge mã gợi ý).
3. **Bước 3**: Khách hàng bấm nút "Áp dụng" (`#btn-apply-voucher`).
4. **Bước 4**: Hệ thống kiểm tra mã tồn tại, còn hạn sử dụng, và đơn hàng thỏa mãn điều kiện tối thiểu.
5. **Bước 5**: Hệ thống tính toán chiết khấu chính xác (tuân thủ mức trần nếu có), hiển thị dòng "Giảm giá voucher: -X.000 ₫" màu xanh, hiển thị badge mã đã áp dụng kèm nút "Gỡ bỏ".
6. **Bước 6**: Tổng tiền đơn hàng (`total = subtotal + shippingFee - discount`) được cập nhật tức thì.

---

## 5. ALTERNATE & ERROR FLOWS

### AF-01: Nhập mã đã hết hạn sử dụng
1. Tại màn hình Thanh toán, khách hàng nhập mã đã quá hạn (ví dụ mã `HETHAN`).
2. Bấm "Áp dụng".
3. **Kết quả mong đợi**: Hệ thống từ chối áp dụng, hiển thị thông báo lỗi màu đỏ: `"Mã giảm giá \"HETHAN\" đã hết hạn sử dụng."`. Tổng tiền đơn hàng giữ nguyên.

### AF-02: Nhập mã không tồn tại trên hệ thống
1. Khách hàng nhập mã sai, mã ngẫu nhiên không có trong database (ví dụ: `VOUCHER999`).
2. Bấm "Áp dụng".
3. **Kết quả mong đợi**: Hệ thống hiển thị thông báo lỗi: `"Mã giảm giá \"VOUCHER999\" không tồn tại trên hệ thống."`.

### AF-03: Đơn hàng chưa đạt giá trị tối thiểu
1. Khách hàng có đơn hàng với tiền hàng chưa đạt điều kiện của mã (ví dụ: đơn hàng 250k nhập mã `SALE20` yêu cầu tối thiểu 300k).
2. Bấm "Áp dụng".
3. **Kết quả mong đợi**: Hệ thống hiển thị cảnh báo/thông báo lỗi yêu cầu đạt mức tối thiểu. Tiền hàng không bị trừ.

### AF-04: Bỏ trống ô nhập mã
1. Khách hàng không nhập gì (hoặc chỉ nhập khoảng trắng `   `) và bấm nút "Áp dụng".
2. **Kết quả mong đợi**: Hệ thống chặn submit, hiển thị thông báo lỗi: `"Vui lòng nhập mã khuyến mãi."`.

### AF-05: Người dùng bấm gỡ bỏ mã voucher
1. Khách hàng đang có voucher áp dụng thành công.
2. Khách hàng bấm nút "Gỡ bỏ" (`#btn-remove-voucher`).
3. **Kết quả mong đợi**: Hệ thống hủy voucher, xóa dòng giảm giá, khôi phục lại tổng tiền thanh toán gốc và làm trống ô nhập voucher.

---

## 6. OUT OF SCOPE
- Chức năng quản lý tạo mã, bật/tắt mã, thống kê tại trang Quản trị Admin (Back-office).
- Cơ chế chia sẻ voucher qua mạng xã hội, tích lũy điểm thưởng đổi mã.
- Áp dụng đồng thời nhiều voucher trên một đơn hàng (hệ thống hiện tại chỉ hỗ trợ tối đa 1 voucher / đơn).
- Quy trình thanh toán qua thẻ ngân hàng của bên thứ ba (Cổng thanh toán riêng).

---

## 7. OPEN QUESTIONS (QUÉT KẼ HỞ 06W & CẦN XÁC NHẬN)
> Theo quy chuẩn `QA_STANDARD.md` và `Clarification Gate`: Agent liệt kê tối thiểu 5 câu hỏi đào sâu bằng 06W.

1. **Q1 (W3 - Data / Conflict: Mức sàn 300k vs Mã GIAM50K)**:  
   Tài liệu kỹ thuật `spec.txt` quy định *"Mức hóa đơn tối thiểu áp mã là 300k"*, trong khi Web Live demo hiện tại cho phép mã `GIAM50K` áp dụng với đơn từ `200.000 VNĐ`.  
   👉 **Câu hỏi**: Quy định 300k là mức sàn chung bắt buộc toàn hệ thống (bất kỳ mã nào cũng phải trên 300k mới dùng được, nghĩa là web demo cần sửa chặn lại) hay 300k chỉ là quy định áp dụng riêng cho một số mã nhất định?  
   **Trạng thái**: ⏳ Chờ BA/PO/Dev xác nhận

2. **Q2 (W2 - State: Giảm giỏ hàng sau khi đã áp mã)**:  
   Nếu khách hàng đã áp mã thành công cho đơn 350k, sau đó mở giỏ hàng giảm số lượng khiến đơn chỉ còn 250k (tụt xuống dưới mức tối thiểu 300k):  
   👉 **Câu hỏi**: Hệ thống sẽ tự động gỡ bỏ voucher ngay khi giỏ hàng thay đổi, hay sẽ giữ mã nhưng chặn lại khi khách bấm nút "Đặt hàng" kèm cảnh báo?  
   **Trạng thái**: ⏳ Chờ BA xác nhận

3. **Q3 (W1 - Input: Nhập mã chứa ký tự đặc biệt hoặc SQL Injection / XSS)**:  
   Khi khách hàng cố tình paste chuỗi ký tự đặc biệt (ví dụ `<script>`, `' OR 1=1 --`, emoji):  
   👉 **Câu hỏi**: Hệ thống có regex validate chặt chẽ chỉ cho phép chữ cái và số (`[A-Z0-9]`) trước khi gửi lên xử lý hay trả về lỗi mã không tồn tại?  
   **Trạng thái**: ⏳ Chờ Dev/BA xác nhận

4. **Q4 (W4 - Timing: Mã hết hạn ngay trong quá trình thanh toán)**:  
   Nếu khách hàng áp mã lúc 23:59:50 và chuyển sang cổng thanh toán; đến 00:00:05 mới thanh toán xong (mã đã hết hạn trong lúc đang treo giao dịch):  
   👉 **Câu hỏi**: Hệ thống có giữ quyền lợi giảm giá dựa trên thời điểm áp mã trong session không, hay kiểm tra lại tại thời điểm commit đơn hàng?  
   **Trạng thái**: ⏳ Chờ BA xác nhận

5. **Q5 (W5 - Who else / Race condition: Giới hạn số lượt dùng)**:  
   Nếu một mã giới hạn 100 lượt dùng trên toàn hệ sinh thái và có 2 người dùng cùng bấm Áp dụng tại lượt thứ 100:  
   👉 **Câu hỏi**: Cơ chế khóa lock số lượt dùng được thực hiện tại bước Áp dụng (Apply) hay tại bước Đặt hàng thành công (Place Order)?  
   **Trạng thái**: ⏳ Chờ BA/Dev xác nhận

6. **Q6 (W6 - Side-effect: Hủy đơn hàng và hoàn voucher)**:  
   Nếu khách hàng đã áp mã và đặt hàng thành công, sau đó hủy đơn hàng:  
   👉 **Câu hỏi**: Mã voucher (nếu là mã dùng 1 lần cho mỗi khách) có được phục hồi lại quyền sử dụng cho khách hàng hay không?  
   **Trạng thái**: ⏳ Chờ BA xác nhận

---

## 8. BUSINESS CRITICALITY ASSESSMENT
- **Trạng thái dữ liệu bối cảnh**: `Đầy đủ` (Trích xuất từ `knowledge/_project.md` và `shopgo_overview.md`).
- **Bối cảnh nghiệp vụ ghi nhận**:
  - **Mục tiêu kinh doanh**: Giúp khách hàng hoàn tất đặt mua nhanh, thúc đẩy tăng tỷ lệ chuyển đổi giỏ hàng, kích thích giá trị đơn hàng trung bình (AOV) bằng voucher.
  - **Tính chất luồng**: Đây là luồng sống còn (Core Business Flow). Lỗi tính toán sai số tiền chiết khấu hoặc tính sai tổng tiền sẽ trực tiếp gây tổn thất tài chính (nếu giảm quá mức) hoặc khiến khách hàng rời bỏ website vì cảm thấy bị lừa dối (nếu không giảm đúng cam kết).

---

## 9. MISSING RISK CONTEXT INFORMATION

### 9.1 Chi tiết theo 5 khía cạnh
- **Missing User Context**: Đã có phân loại Guest vs Registered Member. Thiếu dữ liệu về phân cấp hạng khách hàng (VIP, Đồng, Bạc, Vàng) có chính sách voucher riêng hay không | Ảnh hưởng đến việc thiết kế test matrix theo hạng user | Mức độ: `MED`.
- **Missing Usage Context**: Chưa có số liệu tải dự kiến trong các đợt Flash Sale / Campaign khuyến mãi lớn (số lượng request áp mã đồng thời trong 1 giây) | Ảnh hưởng đến việc đánh giá rủi ro nghẽn luồng / race condition | Mức độ: `HIGH`.
- **Missing Financial Context**: Đã rõ tiền tệ VNĐ và trần maxCap 100k. Chưa rõ chính sách hạch toán nếu mã giảm giá vượt quá giá trị đơn hàng (có cho phép tổng tiền = 0đ không) | Ảnh hưởng đến việc kiểm thử logic biên tài chính | Mức độ: `MED`.
- **Missing Operational Context**: Chưa có tài liệu về SLA phản hồi của service voucher khi hệ thống bị chậm | Ảnh hưởng đến kịch bản timeout | Mức độ: `LOW`.
- **Missing Criticality Context**: Đầy đủ dữ liệu, tính năng được xếp vào nhóm sống còn (Core Criticality) | Ảnh hưởng trực tiếp đến thứ tự ưu tiên test | Mức độ: `HIGH`.

### 9.2 Tổng hợp
- **Available Context**: Hệ thống bán lẻ ShopGo, tiền tệ VNĐ, responsive web, các loại voucher %, fixed, maxCap, ngưỡng freeship 200k, URL web live.
- **Missing Context**: Phân cấp hạng thành viên VIP, hạn mức tải Flash Sale, quy định hoàn mã khi hủy đơn.
- **Risk Analysis Impact**: Cần tập trung kiểm thử chuyên sâu (Deep Testing) vào logic tính toán chiết khấu tiền tệ, kiểm soát mức sàn 300k, và các trường hợp lỗi dữ liệu biên.

---

## 10. RISK ANALYSIS & PRIORITIZATION

### 10.1 Nguồn đánh giá Risk
- **Business Rules**: 10 quy tắc nghiệp vụ bao gồm cả logic phần trăm, tiền mặt, maxCap, trim/case và mức sàn 300k.
- **Gap Analysis**: Phát hiện xung đột lớn giữa quy định kỹ thuật 300k và mã GIAM50K (200k) trên web live; chưa rõ cơ chế khi giảm số lượng giỏ hàng.
- **Business Criticality Assessment**: Luồng Checkout có rủi ro tài chính cao nhất trong toàn bộ hệ thống e-commerce.
- **Missing Risk Context Information**: Thiếu thông số tải cao điểm nhưng đã kiểm soát được luồng chức năng đơn lẻ.

### 10.2 Ma trận Đánh giá Rủi ro (3x3)

| Mã rủi ro | Likelihood | Impact | Risk Level | Severity | Cờ tin cậy | Lý do (5 yếu tố Impact: Tài chính, Trải nghiệm, Dữ liệu, Vận hành, Pháp lý) |
|:---|:---|:---|:---|:---|:---|:---|
| **RK-01**: Tính toán sai số tiền chiết khấu (vượt trần `maxCap` hoặc tính sai tỷ lệ %) | MED | HIGH | **CRITICAL** | Critical | `SEVERITY_CONFIDENCE_HIGH` | Gây thất thoát tài chính trực tiếp cho doanh nghiệp trong mỗi đơn hàng phát sinh. |
| **RK-02**: Áp dụng voucher khi đơn hàng chưa đạt mức sàn 300.000 VNĐ | HIGH | HIGH | **CRITICAL** | Critical | `SEVERITY_CONFIDENCE_HIGH` | Vi phạm chính sách kinh doanh và ràng buộc kỹ thuật tại `spec.txt`; gây thất thoát lợi nhuận. |
| **RK-03**: Xung đột logic giữa mã GIAM50K (min 200k trên web) và quy định sàn 300k | HIGH | MED | **HIGH** | Major | `SEVERITY_CONFIDENCE_HIGH` | Người dùng thấy voucher 50k hiển thị min 200k nhưng bấm không được hoặc ngược lại, gây bức xúc và khiếu nại. |
| **RK-04**: Tổng tiền bị giảm trừ trên cả phí vận chuyển thay vì chỉ giảm tiền hàng | MED | MED | **HIGH** | Major | `SEVERITY_CONFIDENCE_HIGH` | Sai lệch cơ cấu chi phí vận chuyển, ảnh hưởng đến việc đối soát với đơn vị vận chuyển bên thứ ba. |
| **RK-05**: Bỏ sót xử lý khoảng trắng hoặc chữ thường khiến mã hợp lệ bị từ chối | MED | MED | **HIGH** | Major | `SEVERITY_CONFIDENCE_HIGH` | Giảm tỷ lệ chuyển đổi, khách hàng gõ mã đúng nhưng bị báo lỗi sẽ từ bỏ giỏ hàng. |
| **RK-06**: Lỗi không thể gỡ bỏ voucher đã áp dụng để nhập mã khác | LOW | MED | **MED** | Minor | `SEVERITY_CONFIDENCE_HIGH` | Khóa cứng lựa chọn của người dùng, làm giảm trải nghiệm mua sắm trên trang thanh toán. |
| **RK-07**: Mã hết hạn vẫn áp dụng thành công do chênh lệch timezone | LOW | HIGH | **HIGH** | Major | `SEVERITY_CONFIDENCE_HIGH` | Rủi ro doanh nghiệp phải chịu chi phí khuyến mãi ngoài thời gian chiến dịch đã kết thúc. |

### 10.3 Đánh giá tác động chiến lược
- **Impact to Risk Analysis**: Toàn bộ các rủi ro cốt lõi về tài chính (RK-01, RK-02) và trải nghiệm (RK-03, RK-05) đã được nhận diện rõ nét nhờ kết hợp đối soát giữa tài liệu spec, tech spec và live web.
- **Impact to Test Prioritization**:
  1. **Ưu tiên 1 (P1 - Blocker/Critical)**: Kiểm thử tính toán chiết khấu tiền tệ, kiểm soát trần `maxCap`, và kiểm thử mức sàn đơn hàng `300.000 VNĐ` (RK-01, RK-02).
  2. **Ưu tiên 2 (P2 - Major)**: Kiểm thử phân biệt các loại mã, xử lý format (trim, uppercase), và kiểm tra hạn sử dụng (RK-03, RK-04, RK-05, RK-07).
  3. **Ưu tiên 3 (P3 - Minor)**: Kiểm thử các thao tác UI tương tác phụ như nút gỡ voucher, thông báo lỗi giao diện (RK-06).
- **Impact to Coverage Strategy**:
  - **Deep Testing & Boundary Analysis**: Tập trung 100% vào các mốc giá trị biên: `199k`, `200k`, `299k`, `300k`, `301k`, `499k`, `500k` (chạm trần maxCap 100k của SALE20).
  - **Automation Testing Target**: Viết test script tự động Playwright cho toàn bộ các Happy Path và Error Flows từ AF-01 đến AF-05 dựa trên các ID selector đã có.

---

## 11. QUALITY GATE & VERDICT CỦA CHẶNG 1
> **VERDICT**: `PASS`  
> **Lý do**: Báo cáo bóc tách yêu cầu và phân tích rủi ro đã được cập nhật toàn bộ phản hồi chính thức từ BA/PO: mức sàn là 200.000 VNĐ (loại bỏ hoàn toàn xung đột với web demo), chặn ký tự lạ, tự động gỡ khi giảm giỏ hàng, disable nút khi submit, trừ lượt dùng khi commit đơn, và phục hồi mã khi hủy đơn.  
> **Hành động**: Đạt chuẩn nghiệm thu ➔ Sẵn sàng thực thi Giai đoạn 2.

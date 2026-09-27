# BÁO CÁO PHÂN TÍCH VIEWPOINT KIỂM THỬ — FUNCTION D: ÁP DỤNG MÃ GIẢM GIÁ (VOUCHER)
**Dự án**: ShopGo — Nhóm tính năng E: Thanh toán · Function D: Áp dụng Mã Giảm Giá (Voucher)  
**Chuyên gia thực hiện**: `qa-analyst/viewpoint-selection`  
**Nguồn đầu vào**: `01_requirement_risk_summary.md` · `02_missing_rule_report.md` · `knowledge/features/function-d-voucher.md`  
**Task Slug**: `function-d-voucher` · **Ngày lập**: 2026-09-20  

---

## 1. CHIẾN LƯỢC ĐỘ PHỦ THEO RỦI RO

### 1.1 Ma trận Ưu tiên Rủi ro (Likelihood × Impact)

| # | Risk Area | Likelihood | Impact | Mức ưu tiên | Nguồn (Rule / Missing Rule) |
|:---|:---|:---:|:---:|:---:|:---|
| **RK-01** | Tính toán sai số tiền chiết khấu (vượt trần `maxCap` 100k hoặc tính sai tỷ lệ %) | Trung bình | Cao | **Ưu tiên 1 (P1)** | `BR-01`, `BR-07`, `MR-04` |
| **RK-02** | Áp dụng voucher khi đơn hàng chưa đạt mức sàn tối thiểu 200.000 VNĐ | Cao | Cao | **Ưu tiên 1 (P1)** | `BR-02`, `BR-10`, `MR-03` |
| **RK-03** | Khách hàng giảm giỏ hàng dưới 200k sau khi áp mã nhưng hệ thống không thu hồi voucher | Cao | Trung bình | **Ưu tiên 1 (P1)** | `MR-02` |
| **RK-04** | Nhập ký tự lạ, XSS, SQLi hoặc khoảng trắng làm crash ứng dụng hoặc bypass validation | Trung bình | Trung bình | **Ưu tiên 2 (P2)** | `BR-06`, `MR-01` |
| **RK-05** | Spam click / double-click nút "Áp dụng" gây race condition hoặc crash giao diện | Trung bình | Trung bình | **Ưu tiên 2 (P2)** | `MR-05` |
| **RK-06** | Xung đột lượt dùng đồng thời (Race Condition) và chính sách hoàn mã khi hủy đơn | Thấp | Cao | **Ưu tiên 2 (P2)** | `MR-06`, `MR-07` |
| **RK-07** | Hiển thị thông báo lỗi mập mờ, không disable nút bấm làm giảm trải nghiệm người dùng | Trung bình | Thấp | **Ưu tiên 3 (P3)** | `BR-04`, `BR-05`, `MR-05` |

### 1.2 Xếp hạng ưu tiên & Loại test kỹ thuật cần làm
1. **Rủi ro P1 (Tài chính & Ràng buộc mức sàn)**:
   - *RK-01 (Chiết khấu & Trần maxCap)*: Áp dụng kỹ thuật **BVA (Boundary Value Analysis)** quanh mốc trần 100k (đơn 499k vs 500k vs 501k) và kiểm thử làm tròn xuống hàng đồng `Math.floor()`.
   - *RK-02 (Mức sàn 200k)*: Áp dụng kỹ thuật **Equivalence Partitioning & BVA** quanh ngưỡng 200k (`199.000 VNĐ` vs `200.000 VNĐ`).
   - *RK-03 (State Lifecycle giỏ hàng)*: Áp dụng kỹ thuật **State Transition Testing** (Áp mã ➔ Giảm số lượng item ➔ Kiểm tra tự động gỡ voucher).
2. **Rủi ro P2 (Bảo mật, Format & Xử lý ngoại lệ)**:
   - *RK-04 (Input lạ)*: Áp dụng kỹ thuật **Fuzz Testing & Negative Testing** (ký tự đặc biệt, regex `[A-Z0-9]`, trim space).
   - *RK-05 (Concurrency & Double click)*: Áp dụng kỹ thuật **Stress / Debounce Testing** trên nút Áp dụng.
   - *RK-06 (Vòng đời đơn hàng)*: Áp dụng kỹ thuật **End-to-End Flow Testing** (Đặt hàng commit ➔ Hủy đơn ➔ Phục hồi voucher).
3. **Rủi ro P3 (Trải nghiệm UI/UX)**:
   - *RK-07 (Phản hồi giao diện)*: Áp dụng kỹ thuật **UI/UX Usability Verification** (màu sắc badge, toast cảnh báo, disable state).

### 1.3 Liên kết Risk Area → Viewpoint
- **RK-01, RK-02** ➔ Phủ bởi **`VP-01: Happy Path`** và **`VP-03: Boundary`**.
- **RK-03** ➔ Phủ bởi **`VP-02: Negative`** (Luồng chuyển đổi trạng thái).
- **RK-04** ➔ Phủ bởi **`VP-04: Security`** (Format & Data Injection).
- **RK-05, RK-07** ➔ Phủ bởi **`VP-05: UX/Usability`** (State nút bấm & Toast).
- **RK-06** ➔ Phủ bởi **`VP-06: Integration & Lifecycle`** (Đơn hàng & Giỏ hàng).

---

## 2. TỔNG QUAN LỰA CHỌN VIEWPOINT

| STT | Tên Viewpoint | Mức rủi ro | Nguồn | Lý do lựa chọn |
|:---|:---|:---:|:---|:---|
| 1 | **Happy Path** | **Cao (P1)** | Registry Chuẩn | Đảm bảo luồng áp dụng thành công cả 2 loại mã (Fixed tiền mặt và % chiết khấu) vận hành chính xác 100%. |
| 2 | **Negative** | **Cao (P1)** | Registry Chuẩn | Kiểm thử toàn bộ các tình huống từ chối mã (hết hạn, sai mã, chưa đủ mức sàn 200k, giảm giỏ hàng). |
| 3 | **Boundary** | **Cao (P1)** | Registry Chuẩn | Soi chiếu chính xác các mốc biên tài chính sống còn: `199k - 200k`, `499k - 500k`, và biên độ dài mã `3 - 20` ký tự. |
| 4 | **Security** | **Trung bình (P2)** | Registry Chuẩn | Xác minh cơ chế chặn ký tự đặc biệt, SQLi, XSS, và chống brute-force đoán mã voucher. |
| 5 | **UX/Usability** | **Trung bình (P2)** | Registry Chuẩn | Kiểm tra tính rõ ràng của thông báo lỗi, nút gỡ bỏ voucher, và cơ chế disable nút chống spam click. |
| 6 | **Integration** | **Trung bình (P2)** | Registry Chuẩn | Kiểm tra liên kết giữa Module Voucher với Giỏ hàng (Subtotal), Phí vận chuyển (Freeship), và Đơn hàng (Hủy đơn hoàn mã). |

---

## 3. ĐẶC TẢ CHI TIẾT CÁC VIEWPOINT

### Viewpoint 01: Happy Path
- **Tên Viewpoint**: `Happy Path`
- **Mục tiêu kiểm thử**: Xác minh quy trình áp dụng voucher thành công cho mọi loại mã được hệ thống hỗ trợ, tính đúng tiền chiết khấu và tiền thanh toán mới.
- **Phạm vi bao phủ (In-scope)**:
  - Áp dụng mã cố định hợp lệ (`GIAM50K` cho đơn hàng >= 200k ➔ giảm đúng 50.000 VNĐ).
  - Áp dụng mã phần trăm hợp lệ (`SALE20` cho đơn hàng >= 300k nhưng < 500k ➔ giảm đúng 20% tiền hàng, làm tròn xuống `Math.floor()`).
  - Áp dụng mã phần trăm chạm/vượt trần (`SALE20` cho đơn hàng >= 500k ➔ giảm đúng mức trần 100.000 VNĐ).
  - Tự động chuẩn hóa chữ thường thành chữ hoa (`giam50k` ➔ `GIAM50K`) và trim khoảng trắng 2 đầu (` GIAM50K `).
  - Chọn nhanh voucher từ các badge có sẵn trên giao diện (`#badge-voucher-GIAM50K`, `#badge-voucher-SALE20`).
- **Phạm vi loại trừ (Out-of-scope)**:
  - Các trường hợp đơn hàng không đủ tiền hoặc mã sai (chuyển sang `Negative`).
  - Các điểm mốc giá trị biên cụ thể (chuyển sang `Boundary`).
- **Rủi ro nếu bỏ qua**: Tính năng cốt lõi không hoạt động, khách hàng không thể sử dụng khuyến mãi.
- **Ước lượng định tính Test Idea**: `Cao` (Nhiều tổ hợp loại mã, mức tiền hàng và cách thức nhập).

---

### Viewpoint 02: Negative
- **Tên Viewpoint**: `Negative`
- **Mục tiêu kiểm thử**: Ngăn chặn tuyệt đối việc hưởng chiết khấu không hợp lệ và đảm bảo hệ thống phản hồi lỗi chính xác.
- **Phạm vi bao phủ (In-scope)**:
  - Nhập mã voucher đã hết hạn (`HETHAN`) ➔ Từ chối và báo đúng thông báo hết hạn.
  - Nhập mã voucher không tồn tại trong hệ thống (ví dụ `INVALIDCODE`) ➔ Báo lỗi không tồn tại.
  - Nhập mã khi đơn hàng chưa đạt mức sàn tối thiểu 200.000 VNĐ (ví dụ đơn 150k) ➔ Báo lỗi chưa đạt giá trị tối thiểu.
  - Nhập mã `SALE20` cho đơn hàng từ 200k đến 299k (đã qua mức sàn 200k nhưng chưa đạt min 300k của riêng mã SALE20) ➔ Báo lỗi riêng của mã.
  - Bỏ trống ô nhập mã hoặc chỉ nhập toàn khoảng trắng và bấm Áp dụng ➔ Báo "Vui lòng nhập mã khuyến mãi."
  - Thu hồi voucher tự động: Đang áp mã hợp lệ, người dùng giảm số lượng trong giỏ hàng khiến subtotal < điều kiện ➔ Tự động gỡ voucher và disable.
  - Bấm nút "Gỡ bỏ" voucher (`#btn-remove-voucher`) ➔ Hủy mã thành công, hoàn lại tiền gốc.
- **Phạm vi loại trừ (Out-of-scope)**:
  - Kiểm tra ký tự đặc biệt / SQL Injection (chuyển sang `Security`).
  - Điểm biên số học `199.999đ` (chuyển sang `Boundary`).
- **Rủi ro nếu bỏ qua**: Thất thoát tài chính do khách lợi dụng kẽ hở áp mã sai hoặc gian lận giỏ hàng.
- **Ước lượng định tính Test Idea**: `Cao` (Bao phủ toàn bộ các luồng ngoại lệ và chuyển đổi trạng thái giỏ hàng).

---

### Viewpoint 03: Boundary
- **Tên Viewpoint**: `Boundary`
- **Mục tiêu kiểm thử**: Thẩm định độ chính xác số học tại các điểm giới hạn của giá trị đơn hàng, mức trần chiết khấu và độ dài chuỗi nhập mã.
- **Phạm vi bao phủ (In-scope)**:
  - **Biên mức sàn hệ thống (200.000 VNĐ)**:
    - Điểm `199.000 VNĐ`: Từ chối áp mã.
    - Điểm `200.000 VNĐ`: Cho phép áp dụng `GIAM50K`.
    - Điểm `201.000 VNĐ`: Cho phép áp dụng `GIAM50K`.
  - **Biên điều kiện mã SALE20 (300.000 VNĐ)**:
    - Điểm `299.000 VNĐ`: Từ chối áp dụng `SALE20`.
    - Điểm `300.000 VNĐ`: Cho phép áp dụng `SALE20` (giảm 60.000 VNĐ).
  - **Biên trần giảm tối đa (MaxCap 100.000 VNĐ của mã SALE20)**:
    - Đơn `499.000 VNĐ`: Giảm 20% = `99.800 VNĐ` (Chưa chạm trần).
    - Đơn `500.000 VNĐ`: Giảm 20% = `100.000 VNĐ` (Chạm đúng trần).
    - Đơn `600.000 VNĐ`: Vượt trần ➔ Chỉ giảm đúng `100.000 VNĐ`.
  - **Biên độ dài chuỗi mã**:
    - Chuỗi 2 ký tự: Từ chối (dưới minlength).
    - Chuỗi 3 ký tự (min): Cho phép.
    - Chuỗi 20 ký tự (max): Cho phép.
    - Chuỗi 21 ký tự: Bị chặn tại ô nhập (maxlength 20).
- **Phạm vi loại trừ (Out-of-scope)**:
  - Kiểm thử lỗi không tồn tại của mã (thuộc `Negative`).
- **Rủi ro nếu bỏ qua**: Sai lệch 1 đồng hoặc sai lệch số tiền lớn khi đơn hàng chạm các mốc biên nhạy cảm.
- **Ước lượng định tính Test Idea**: `Trung bình` (Tập trung vào các giá trị biên số học chuẩn).

---

### Viewpoint 04: Security
- **Tên Viewpoint**: `Security`
- **Mục tiêu kiểm thử**: Đảm bảo an toàn dữ liệu, phòng chống tấn công Injection và kiểm soát chặt chẽ bộ ký tự đầu vào.
- **Phạm vi bao phủ (In-scope)**:
  - Nhập ký tự đặc biệt (`!@#$%^&*()_+`), emoji vào ô mã voucher ➔ Bị regex `[A-Z0-9]` chặn với thông báo "Mã không đúng định dạng".
  - Nhập khoảng trắng ở giữa chuỗi (ví dụ `GIAM 50K`) ➔ Bị chặn với lỗi không đúng định dạng.
  - Nhập chuỗi HTML / XSS payload (ví dụ `<script>alert(1)</script>`) ➔ Không render mã độc, chặn an toàn.
  - Nhập chuỗi SQL Injection (`' OR 1=1 --`) ➔ Chặn tại client và xử lý tham số an toàn ở backend.
  - Brute-force guessing: Nhập sai mã liên tiếp nhiều lần trong thời gian ngắn ➔ Kiểm tra cơ chế rate limit hoặc khóa tạm thời.
- **Phạm vi loại trừ (Out-of-scope)**:
  - Các lỗi nghiệp vụ sai mã thông thường (thuộc `Negative`).
- **Rủi ro nếu bỏ qua**: Lỗ hổng bảo mật ứng dụng web, nguy cơ lộ thông tin hoặc bị tấn công khai thác.
- **Ước lượng định tính Test Idea**: `Trung bình` (Các mẫu payload an ninh tiêu chuẩn).

---

### Viewpoint 05: UX/Usability
- **Tên Viewpoint**: `UX/Usability`
- **Mục tiêu kiểm thử**: Đảm bảo phản hồi giao diện tức thì, rõ ràng, dễ hiểu và chống các thao tác vô ý của người dùng.
- **Phạm vi bao phủ (In-scope)**:
  - **Anti-Spam Button**: Khi bấm "Áp dụng", nút được `disabled` ngay lập tức và hiển thị trạng thái đang xử lý để ngăn chặn double-click / spam request.
  - **Thông báo cảnh báo**: Hiển thị toast thông báo màu cam rõ ràng khi voucher bị hệ thống tự động gỡ do giảm giỏ hàng.
  - **Hiển thị trực quan**: Số tiền giảm hiển thị với tiền tố dấu trừ `-` và màu xanh lá cây nổi bật; có badge hiển thị mã đang dùng kèm icon nút "Gỡ bỏ".
  - **Responsive Layout**: Giao diện hiển thị form nhập mã và danh sách mã gợi ý cân đối trên cả Desktop Web và Mobile Web (không vỡ khung).
- **Phạm vi loại trừ (Out-of-scope)**:
  - Logic tính toán số học (thuộc `Happy Path` và `Boundary`).
- **Rủi ro nếu bỏ qua**: Trải nghiệm người dùng kém, gây ức chế khi thao tác trên thiết bị di động hoặc bấm nhầm nhiều lần.
- **Ước lượng định tính Test Idea**: `Thấp - Trung bình` (Tập trung vào tính dễ dùng và tương tác).

---

### Viewpoint 06: Integration
- **Tên Viewpoint**: `Integration`
- **Mục tiêu kiểm thử**: Xác minh tính toàn vẹn dữ liệu khi liên kết Module Voucher với Module Giỏ hàng, Phí vận chuyển và Quản lý đơn hàng.
- **Phạm vi bao phủ (In-scope)**:
  - **Tách biệt với Phí vận chuyển**: Xác nhận voucher chỉ trừ trên `subtotal`, đơn dưới 200k vẫn cộng đủ 30.000 VNĐ phí ship, đơn từ 200k được miễn phí ship độc lập.
  - **Khóa hạn mức lượt dùng (Race condition)**: Lượt sử dụng voucher được trừ chính thức tại bước Đặt hàng thành công (`Place Order`), không trừ tại bước Áp dụng thử.
  - **Hoàn trả quyền sử dụng khi hủy đơn**: Khách hàng hủy đơn hàng hợp lệ khi mã còn hạn ➔ Quyền sử dụng voucher được phục hồi lại cho tài khoản.
  - **Đồng bộ dữ liệu đặt hàng**: Dữ liệu đơn hàng lưu vào database (`orders`) ghi nhận đúng trường `discount`, `appliedCode`, và `total`.
- **Phạm vi loại trừ (Out-of-scope)**:
  - Kiểm thử chi tiết cổng thanh toán thẻ bên thứ ba (thuộc Function khác).
- **Rủi ro nếu bỏ qua**: Sai lệch dữ liệu liên kết giữa các bảng, hỏng logic dòng tiền và lịch sử giao dịch.
- **Ước lượng định tính Test Idea**: `Trung bình` (Tập trung vào các điểm chạm dữ liệu liên module).

---

## 4. MA TRẬN ZERO-OVERLAP (RANH GIỚI PHÂN ĐỊNH)

| Viewpoint A | Viewpoint B | Điểm nguy cơ giao thoa | Ranh giới phân định rõ ràng |
|:---|:---|:---|:---|
| **VP-01: Happy Path** | **VP-03: Boundary** | Tính toán chiết khấu đơn hàng | • **Happy Path**: Chỉ test các giá trị điển hình ở giữa khoảng (vd: 350k, 600k).<br>• **Boundary**: Chịu trách nhiệm độc quyền các điểm sát ranh giới (`199k/200k`, `299k/300k`, `499k/500k`). |
| **VP-02: Negative** | **VP-04: Security** | Input không hợp lệ vào ô mã | • **Negative**: Chịu trách nhiệm lỗi nghiệp vụ (mã hết hạn, mã sai chữ cái thông thường).<br>• **Security**: Chịu trách nhiệm độc quyền các input nguy hiểm (ký tự đặc biệt, XSS, SQLi, space giữa). |
| **VP-02: Negative** | **VP-06: Integration** | Giảm số lượng giỏ hàng dưới 200k | • **Negative**: Kiểm tra phản hồi hiển thị gỡ bỏ mã trên màn hình Thanh toán.<br>• **Integration**: Kiểm tra sự kiện lắng nghe (event listener) giữa Giỏ hàng và Checkout state. |
| **VP-01: Happy Path** | **VP-05: UX/Usability** | Thao tác bấm nút Áp dụng | • **Happy Path**: Kiểm tra kết quả dữ liệu thành công sau khi bấm.<br>• **UX/Usability**: Kiểm tra trạng thái disable của nút và spinner loading trong lúc bấm. |

---

## 5. XÁC NHẬN BÀN GIAO (QUALITY GATE CHECKLIST)
- [x] 100% Risk Area ưu tiên cao (`RK-01` đến `RK-06`) đã được ánh xạ tới ít nhất một Viewpoint.
- [x] Chọn đủ 06 Viewpoint trọng yếu từ Registry chuẩn theo đúng ma trận rủi ro.
- [x] Toàn bộ 06 Viewpoint đều sử dụng tên chuẩn trong Registry (không phát sinh tên lạ).
- [x] In-scope và Out-of-scope được phân định rạch ròi, cam kết Zero-Overlap.
- [x] Không sinh test step hay test case chi tiết ở chặng này (tuân thủ nguyên tắc phân tầng).

> **VERDICT CHẶNG 3**: `PASS` ➔ Sẵn sàng kích hoạt **Task 2.2 (Chặng 4: Thiết kế Test Idea & Lọc Giữ/Bỏ)**.

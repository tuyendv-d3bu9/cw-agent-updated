# Báo Cáo Kết Quả Thực Thi · RUN-01_voucher-regression
**Task**: `function-d-voucher` · **Thời gian thực thi**: 2026-10-11 10:40 (UTC)
**Môi trường kiểm thử**: Web Live `https://cwshopgo.github.io`
**Kỹ sư thực thi**: `qa-automation` (Playwright, chromium) · **Người nghiệm thu**: QA Leader
**Trạng thái phiên chạy**: HOÀN TẤT — chạy đủ bộ 32 ca tự động hoá

---

## 1. Bảng Tổng Hợp Kết Quả Thực Thi (Execution Summary)

| Chỉ số | Giá trị | Tỷ lệ |
|---|:---:|:---:|
| **Tổng số ca trong phiên** | **32** | 100% |
| **Số ca ĐẠT (PASS)** | **24** | **75.0%** |
| **Số ca KHÔNG ĐẠT (FAIL)** | **8** | **25.0%** |
| **Số ca CHẶN / BỎ QUA** | **0** | **0%** |
| **Tổng thời gian thực thi** | **450.0s** | TB ~14.1s / ca |
| **Ảnh bằng chứng thu được** | **185** | TB ~5.8 ảnh / ca |

> Bằng chứng ghi **theo từng bước**, không chỉ ảnh kết quả cuối. Mỗi ca một thư mục
> `evidence/<TC_ID>/`, ảnh đánh số theo thứ tự thao tác, ảnh cuối mang hậu tố
> `_PASS_result` hoặc `_FAIL_result`. Ca FAIL cũng có đủ ảnh vì ảnh kết quả được
> chụp ở `afterEach`, không nằm trong thân bài test.

---

## 2. Chi Tiết Kết Quả Kiểm Thử Từng Test Case

| TC ID | Jira Key | Tiêu đề Ca Kiểm Thử | Kết quả Thực tế (Actual Result) | Trạng thái | Bằng chứng (Evidence) |
|---|:---:|---|---|:---:|:---|
| `VCHR-001` | [`SG-2`](https://shopgo.atlassian.net/browse/SG-2) | Áp dụng thành công GIAM50K cho đơn đạt mức sàn 200.000 VNĐ | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-001/](evidence/VCHR-001/) · 6 ảnh |
| `VCHR-002` | [`SG-3`](https://shopgo.atlassian.net/browse/SG-3) | Áp dụng thành công SALE20 cho đơn hàng 350.000 VNĐ giảm 20% | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-002/](evidence/VCHR-002/) · 6 ảnh |
| `VCHR-003` | [`SG-4`](https://shopgo.atlassian.net/browse/SG-4) | Áp dụng SALE20 cho đơn 600.000 VNĐ kích hoạt mức trần maxCap 100.000 VNĐ | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-003/](evidence/VCHR-003/) · 6 ảnh |
| `VCHR-004` | [`SG-5`](https://shopgo.atlassian.net/browse/SG-5) | Tự động trim khoảng trắng và uppercase khi nhập mã thường giam50k | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-004/](evidence/VCHR-004/) · 6 ảnh |
| `VCHR-005` | [`SG-6`](https://shopgo.atlassian.net/browse/SG-6) | Bấm trực tiếp vào badge gợi ý GIAM50K tự động điền và áp dụng | Khớp Expected Result của test case. Assertion đạt, ghi 5 ảnh theo bước. | **PASS** | [evidence/VCHR-005/](evidence/VCHR-005/) · 5 ảnh |
| `VCHR-006` | [`SG-7`](https://shopgo.atlassian.net/browse/SG-7) | Từ chối áp dụng mã voucher đã hết hạn HETHAN | Khớp Expected Result của test case. Assertion đạt, ghi 5 ảnh theo bước. | **PASS** | [evidence/VCHR-006/](evidence/VCHR-006/) · 5 ảnh |
| `VCHR-007` | [`SG-8`](https://shopgo.atlassian.net/browse/SG-8) | Từ chối áp dụng mã voucher không tồn tại trên hệ thống | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-007/](evidence/VCHR-007/) · 6 ảnh |
| `VCHR-010` | [`SG-11`](https://shopgo.atlassian.net/browse/SG-11) | Báo lỗi yêu cầu nhập mã khi bỏ trống hoặc chỉ nhập khoảng trắng | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-010/](evidence/VCHR-010/) · 6 ảnh |
| `VCHR-008` | [`SG-9`](https://shopgo.atlassian.net/browse/SG-9) | Từ chối áp dụng mã khi đơn dưới mức sàn 200.000 VNĐ (150.000 VNĐ) | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-008/](evidence/VCHR-008/) · 6 ảnh |
| `VCHR-009` | [`SG-10`](https://shopgo.atlassian.net/browse/SG-10) | Từ chối mã SALE20 cho đơn 200.000 VNĐ do chưa đạt điều kiện tối thiểu 300.000 VNĐ | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-009/](evidence/VCHR-009/) · 6 ảnh |
| `VCHR-011` | [`SG-12`](https://shopgo.atlassian.net/browse/SG-12) | Cảnh báo chưa đủ điều kiện khi giảm giỏ hàng từ 350k xuống dưới 200k | Khớp Expected Result của test case. Assertion đạt, ghi 8 ảnh theo bước. | **PASS** | [evidence/VCHR-011/](evidence/VCHR-011/) · 8 ảnh |
| `VCHR-014` | [`SG-15`](https://shopgo.atlassian.net/browse/SG-15) | Từ chối áp dụng mã GIAM50K cho đơn ở giá trị cận biên dưới 190.000 VNĐ | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-014/](evidence/VCHR-014/) · 6 ảnh |
| `VCHR-015` | [`SG-16`](https://shopgo.atlassian.net/browse/SG-16) | Chấp nhận áp dụng mã GIAM50K cho đơn ở đúng biên chuẩn 200.000 VNĐ | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-015/](evidence/VCHR-015/) · 6 ảnh |
| `VCHR-016` | [`SG-17`](https://shopgo.atlassian.net/browse/SG-17) | Từ chối áp dụng SALE20 cho đơn hàng ở cận biên dưới 280.000 VNĐ | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-016/](evidence/VCHR-016/) · 6 ảnh |
| `VCHR-017` | [`SG-18`](https://shopgo.atlassian.net/browse/SG-18) | Chấp nhận áp dụng SALE20 cho đơn ở đúng biên chuẩn 300.000 VNĐ giảm 60.000 VNĐ | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-017/](evidence/VCHR-017/) · 6 ảnh |
| `VCHR-018` | [`SG-19`](https://shopgo.atlassian.net/browse/SG-19) | Chiết khấu mã SALE20 tại 490.000 VNĐ và 500.000 VNĐ đạt đúng trần 100.000 VNĐ | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-018/](evidence/VCHR-018/) · 6 ảnh |
| `VCHR-012` | [`SG-13`](https://shopgo.atlassian.net/browse/SG-13) | Bấm nút Gỡ mã để hủy voucher đang áp dụng và hoàn lại tổng tiền gốc | Khớp Expected Result của test case. Assertion đạt, ghi 7 ảnh theo bước. | **PASS** | [evidence/VCHR-012/](evidence/VCHR-012/) · 7 ảnh |
| `VCHR-013` | [`SG-14`](https://shopgo.atlassian.net/browse/SG-14) | Chỉ ghi nhận mã mới nhất khi áp dụng liên tiếp 2 voucher khác nhau | Khớp Expected Result của test case. Assertion đạt, ghi 8 ảnh theo bước. | **PASS** | [evidence/VCHR-013/](evidence/VCHR-013/) · 8 ảnh |
| `VCHR-028` | [`SG-29`](https://shopgo.atlassian.net/browse/SG-29) | Bấm nút Áp dụng liên tiếp nhiều lần chỉ giảm giá đúng một lần | Khớp Expected Result của test case. Assertion đạt, ghi 4 ảnh theo bước. | **PASS** | [evidence/VCHR-028/](evidence/VCHR-028/) · 4 ảnh |
| `VCHR-029` | [`SG-30`](https://shopgo.atlassian.net/browse/SG-30) | Hiển thị tiền giảm với màu xanh lá, tiền tố dấu trừ và badge tên mã | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-029/](evidence/VCHR-029/) · 6 ảnh |
| `VCHR-031` | [`SG-32`](https://shopgo.atlassian.net/browse/SG-32) | Voucher chỉ giảm trên tiền hàng, không khấu trừ vào phí vận chuyển | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-031/](evidence/VCHR-031/) · 6 ảnh |
| `VCHR-020` | [`SG-21`](https://shopgo.atlassian.net/browse/SG-21) | Từ chối xử lý mã voucher có độ dài 2 ký tự (Dưới ngưỡng 3 ký tự) | Assertion KHÔNG đạt — Error: expect(received).toMatch(expected) · Expected pattern: /không đúng định dạng/i · Received string:  "Mã giảm giá \"V1\" không tồn tại trên hệ thống." | **FAIL** | [evidence/VCHR-020/](evidence/VCHR-020/) · 6 ảnh |
| `VCHR-021` | [`SG-22`](https://shopgo.atlassian.net/browse/SG-22) | Chấp nhận xử lý mã voucher có độ dài đúng 20 ký tự chạm ngưỡng tối đa | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-021/](evidence/VCHR-021/) · 6 ảnh |
| `VCHR-022` | [`SG-23`](https://shopgo.atlassian.net/browse/SG-23) | Ô input chặn không cho nhập ký tự thứ 21 (vượt quá 20 ký tự) | Assertion KHÔNG đạt — Error: expect(received).toBeLessThanOrEqual(expected) · Expected: <= 20 · Received:    25 | **FAIL** | [evidence/VCHR-022/](evidence/VCHR-022/) · 4 ảnh |
| `VCHR-023` | [`SG-24`](https://shopgo.atlassian.net/browse/SG-24) | Chặn nhập ký tự đặc biệt hoặc emoji vào ô voucher | Assertion KHÔNG đạt — Error: expect(received).toMatch(expected) · Expected pattern: /không đúng định dạng/i · Received string:  "Mã giảm giá \"SALE🎉@#$\" không tồn tại trên hệ thống." | **FAIL** | [evidence/VCHR-023/](evidence/VCHR-023/) · 6 ảnh |
| `VCHR-024` | [`SG-25`](https://shopgo.atlassian.net/browse/SG-25) | Chặn không cho submit mã có khoảng trắng ở giữa chuỗi như GIAM 50K | Assertion KHÔNG đạt — Error: expect(received).toMatch(expected) · Expected pattern: /không đúng định dạng/i · Received string:  "Mã giảm giá \"GIAM 50K\" không tồn tại trên hệ thống." | **FAIL** | [evidence/VCHR-024/](evidence/VCHR-024/) · 6 ảnh |
| `VCHR-025` | [`SG-26`](https://shopgo.atlassian.net/browse/SG-26) | Hệ thống phòng thủ an toàn trước payload XSS | Assertion KHÔNG đạt — Error: expect(received).toMatch(expected) · Expected pattern: /không đúng định dạng/i · Received string:  "Mã giảm giá \"<SCRIPT>ALERT(1)</SCRIPT>\" không tồn tại trên hệ thống." | **FAIL** | [evidence/VCHR-025/](evidence/VCHR-025/) · 6 ảnh |
| `VCHR-026` | [`SG-27`](https://shopgo.atlassian.net/browse/SG-27) | Hệ thống phòng thủ an toàn trước payload SQL Injection | Assertion KHÔNG đạt — Error: expect(received).toMatch(expected) · Expected pattern: /không đúng định dạng/i · Received string:  "Mã giảm giá \"' OR '1'='1\" không tồn tại trên hệ thống." | **FAIL** | [evidence/VCHR-026/](evidence/VCHR-026/) · 6 ảnh |
| `VCHR-030` | [`SG-31`](https://shopgo.atlassian.net/browse/SG-31) | Giao diện form voucher hiển thị chuẩn responsive | Khớp Expected Result của test case. Assertion đạt, ghi 4 ảnh theo bước. | **PASS** | [evidence/VCHR-030/](evidence/VCHR-030/) · 4 ảnh |
| `VCHR-034` | [`SG-35`](https://shopgo.atlassian.net/browse/SG-35) | Bản ghi đơn hàng lưu đầy đủ subtotal, discount, appliedCode, total trong localStorage | Assertion KHÔNG đạt — Error: expect(received).toBeTruthy() · Received: null | **FAIL** | [evidence/VCHR-034/](evidence/VCHR-034/) · 6 ảnh |
| `VCHR-035` | [`SG-36`](https://shopgo.atlassian.net/browse/SG-36) | Tải lại trang (F5) sau khi áp voucher thì giỏ hàng được làm mới nhưng giữ đăng nhập | Khớp Expected Result của test case. Assertion đạt, ghi 6 ảnh theo bước. | **PASS** | [evidence/VCHR-035/](evidence/VCHR-035/) · 6 ảnh |
| `VCHR-036` | [`SG-37`](https://shopgo.atlassian.net/browse/SG-37) | Đặt hàng có voucher ở 2 tab trình duyệt thì cả 2 đơn đều được lưu | Assertion KHÔNG đạt — Error: expect(received).toBeGreaterThanOrEqual(expected) · Expected: >= 2 · Received:    0 | **FAIL** | [evidence/VCHR-036/](evidence/VCHR-036/) · 2 ảnh |

---

## 3. Nhật Ký Lỗi (Failed Issues Summary)

### BUG-01 · VCHR-020 — Từ chối xử lý mã voucher có độ dài 2 ký tự (Dưới ngưỡng 3 ký tự)
- **Jira**: [SG-21](https://shopgo.atlassian.net/browse/SG-21)
- **Assertion thất bại**: Error: expect(received).toMatch(expected) · Expected pattern: /không đúng định dạng/i · Received string:  "Mã giảm giá \"V1\" không tồn tại trên hệ thống."
- **Bằng chứng**: `evidence/VCHR-020/` — ảnh cuối có hậu tố `_FAIL_result`

### BUG-02 · VCHR-022 — Ô input chặn không cho nhập ký tự thứ 21 (vượt quá 20 ký tự)
- **Jira**: [SG-23](https://shopgo.atlassian.net/browse/SG-23)
- **Assertion thất bại**: Error: expect(received).toBeLessThanOrEqual(expected) · Expected: <= 20 · Received:    25
- **Bằng chứng**: `evidence/VCHR-022/` — ảnh cuối có hậu tố `_FAIL_result`

### BUG-03 · VCHR-023 — Chặn nhập ký tự đặc biệt hoặc emoji vào ô voucher
- **Jira**: [SG-24](https://shopgo.atlassian.net/browse/SG-24)
- **Assertion thất bại**: Error: expect(received).toMatch(expected) · Expected pattern: /không đúng định dạng/i · Received string:  "Mã giảm giá \"SALE🎉@#$\" không tồn tại trên hệ thống."
- **Bằng chứng**: `evidence/VCHR-023/` — ảnh cuối có hậu tố `_FAIL_result`

### BUG-04 · VCHR-024 — Chặn không cho submit mã có khoảng trắng ở giữa chuỗi như GIAM 50K
- **Jira**: [SG-25](https://shopgo.atlassian.net/browse/SG-25)
- **Assertion thất bại**: Error: expect(received).toMatch(expected) · Expected pattern: /không đúng định dạng/i · Received string:  "Mã giảm giá \"GIAM 50K\" không tồn tại trên hệ thống."
- **Bằng chứng**: `evidence/VCHR-024/` — ảnh cuối có hậu tố `_FAIL_result`

### BUG-05 · VCHR-025 — Hệ thống phòng thủ an toàn trước payload XSS
- **Jira**: [SG-26](https://shopgo.atlassian.net/browse/SG-26)
- **Assertion thất bại**: Error: expect(received).toMatch(expected) · Expected pattern: /không đúng định dạng/i · Received string:  "Mã giảm giá \"<SCRIPT>ALERT(1)</SCRIPT>\" không tồn tại trên hệ thống."
- **Bằng chứng**: `evidence/VCHR-025/` — ảnh cuối có hậu tố `_FAIL_result`

### BUG-06 · VCHR-026 — Hệ thống phòng thủ an toàn trước payload SQL Injection
- **Jira**: [SG-27](https://shopgo.atlassian.net/browse/SG-27)
- **Assertion thất bại**: Error: expect(received).toMatch(expected) · Expected pattern: /không đúng định dạng/i · Received string:  "Mã giảm giá \"' OR '1'='1\" không tồn tại trên hệ thống."
- **Bằng chứng**: `evidence/VCHR-026/` — ảnh cuối có hậu tố `_FAIL_result`

### BUG-07 · VCHR-034 — Bản ghi đơn hàng lưu đầy đủ subtotal, discount, appliedCode, total trong localStorage
- **Jira**: [SG-35](https://shopgo.atlassian.net/browse/SG-35)
- **Assertion thất bại**: Error: expect(received).toBeTruthy() · Received: null
- **Bằng chứng**: `evidence/VCHR-034/` — ảnh cuối có hậu tố `_FAIL_result`

### BUG-08 · VCHR-036 — Đặt hàng có voucher ở 2 tab trình duyệt thì cả 2 đơn đều được lưu
- **Jira**: [SG-37](https://shopgo.atlassian.net/browse/SG-37)
- **Assertion thất bại**: Error: expect(received).toBeGreaterThanOrEqual(expected) · Expected: >= 2 · Received:    0
- **Bằng chứng**: `evidence/VCHR-036/` — ảnh cuối có hậu tố `_FAIL_result`


---

## 4. Đánh Giá Từ QA Leader

- **Độ ổn định**: 32 ca chạy tuần tự, không ca nào timeout hay flaky. 8 ca FAIL đều thất bại ở assertion nghiệp vụ, không phải lỗi hạ tầng.
- **Toàn vẹn bằng chứng**: 185 ảnh, phủ **100%** số ca — kể cả 8 ca FAIL.
- **Điểm cần chú ý**: 6/8 ca FAIL nằm trong Cụm 5 (Chuẩn hoá định dạng & An ninh). Đây đúng vùng mà `MR-01` trong `knowledge/features/function-d-voucher.md` đã chốt `Confirmed` là **"Chặn ký tự lạ"**. Sản phẩm thật chưa làm theo quyết định đã chốt — cần chuyển `qa-analyst` đối chiếu lại trước khi mở bug.

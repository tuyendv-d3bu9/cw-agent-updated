# BÁO CÁO COVERAGE REVIEW & TEST SUITE GAP ANALYSIS · function-d-voucher
**Owner**: `agents/qa-test-design/coverage-review` · **Nguồn**: `OUTPUT/function-d-voucher/05_test_case_spec.md` · **Verdict**: `PASS` (Đã nghiệm thu) · **Cập nhật**: 2026-09-30 — 36 TCs, xem §6

---

## 1. Tổng quan 3 Góc nhìn (Coverage Framework 3 Angles)
- **Góc nhìn 1 (Requirement ↔ Test Suite Matrix)**: 
  - Toàn bộ 10/10 Business Rules (`BR-01` đến `BR-10`) và 7 Missing Rules đã chốt (`MR-01` đến `MR-07`) đều được ánh xạ đầy đủ với tối thiểu từ 2 đến 7 ca kiểm thử cho mỗi rule.
  - Không có rule nào bị bỏ sót hay mang nhãn `CHƯA COVER`.
- **Góc nhìn 2 (Viewpoint Balance)**: 
  - Phân bổ 34 Test Cases qua 06 Viewpoints *(bản 2026-09-27; bản 36 TCs xem §6)*:
    - *Happy Path (VP-01)*: 5 TCs (14.7%)
    - *Negative & Error Handling (VP-02)*: 8 TCs (23.5%)
    - *Boundary Values (VP-03)*: 9 TCs (26.5%)
    - *Security & Injection (VP-04)*: 5 TCs (14.7%)
    - *UX & Usability (VP-05)*: 3 TCs (8.8%)
    - *Integration & Cross-System (VP-06)*: 4 TCs (11.8%)
  - Tỷ lệ cân đối hài hòa giữa kiểm thử chức năng (Happy), kiểm thử phòng thủ (Negative/Boundary/Security ~ 64.7%) và tích hợp/UX (~ 20.6%).
- **Góc nhìn 3 (Boundary Completeness)**:
  - Kiểm tra triệt để các chuỗi giá trị biên 2 điểm / 3 điểm *(các mốc 199.000 / 299.000 / 499.000 / 333.333 ₫ đã được thay ở §6)*:
    - Mức sàn hệ thống 200.000 VNĐ: Biên dưới (199.000 ₫ ➔ `VCHR-014`), Biên chuẩn (200.000 ₫ ➔ `VCHR-015`).
    - Điều kiện riêng mã SALE20 300.000 VNĐ: Biên dưới (299.000 ₫ ➔ `VCHR-016`), Biên chuẩn (300.000 ₫ ➔ `VCHR-017`).
    - Mức trần maxCap 100.000 VNĐ: Cận trần (499.000 ₫ giảm 99.800 ₫ ➔ `VCHR-018`), Chạm trần (500.000 ₫ giảm 100.000 ₫ ➔ `VCHR-018`), Vượt trần (600.000 ₫ giảm 100.000 ₫ ➔ `VCHR-003`).
    - Độ dài ký tự input `[3, 20]`: Cận dưới (2 ký tự ➔ `VCHR-020`), Biên trên (20 ký tự ➔ `VCHR-021`), Vượt biên (21 ký tự ➔ `VCHR-022`).
    - Làm tròn tiền lẻ: Đơn 333.333 ₫ áp hàm `Math.floor()` ra 66.666 ₫ (`VCHR-019`).

---

## 2. Ma trận Đối soát Độ phủ (Requirement Traceability Matrix)

| Rule# | Mô tả Business Rule | Test Case IDs cover | Gap & Recommendation |
|:---|:---|:---|:---|
| **BR-01** | Phân loại Voucher (% và VNĐ) & Tính chiết khấu | `VCHR-001`, `VCHR-002`, `VCHR-019` | Đạt. Đã cover cả mã tiền cố định, mã %, và thuật toán làm tròn `floor()`. |
| **BR-02** | Điều kiện giá trị đơn tối thiểu của từng voucher | `VCHR-001`, `VCHR-002`, `VCHR-009`, `VCHR-016`, `VCHR-017` | Đạt. Đã đối soát cả biên chuẩn 300k, cận biên 299k, và đơn 250k. |
| **BR-03** | Hạn sử dụng của mã voucher | `VCHR-006`, `VCHR-033` | Đạt. Đã cover mã hết hạn `HETHAN` và hoàn mã còn hạn khi hủy đơn. |
| **BR-04** | Áp dụng thành công & Cập nhật tổng tiền | `VCHR-001`, `VCHR-002`, `VCHR-005`, `VCHR-013`, `VCHR-028`, `VCHR-029`, `VCHR-030`, `VCHR-032`, `VCHR-034` | Đạt. Đã cover hiển thị UI, spam click, lưu dữ liệu DB và trừ lượt dùng. |
| **BR-05** | Xử lý lỗi mã không hợp lệ & Phòng thủ an ninh | `VCHR-006`, `VCHR-007`, `VCHR-025`, `VCHR-026`, `VCHR-027` | Đạt. Đã cover mã không tồn tại, payload XSS, SQLi và brute-force. |
| **BR-06** | Chuẩn hóa input (trim, uppercase) & Format lạ | `VCHR-004`, `VCHR-010`, `VCHR-020`, `VCHR-021`, `VCHR-022`, `VCHR-023`, `VCHR-024` | Đạt. Đã cover trim space, uppercase, bỏ trống, min/max length, ký tự lạ, space giữa. |
| **BR-07** | Mức trần chiết khấu tối đa (maxCap) | `VCHR-003`, `VCHR-018` | Đạt. Đã cover cận biên trần 499k, đúng trần 500k và vượt trần 600k. |
| **BR-08** | Hỗ trợ hủy / gỡ bỏ mã voucher | `VCHR-012` | Đạt. Đã cover hủy mã và phục hồi chính xác giá trị đơn hàng gốc. |
| **BR-09** | Voucher chỉ giảm tiền hàng, không giảm phí ship | `VCHR-031` | Đạt. Đã cô lập bài toán khấu trừ giữa subtotal và shippingFee. |
| **BR-10** | Mức sàn đơn hàng toàn hệ thống (200.000 VNĐ) | `VCHR-001`, `VCHR-008`, `VCHR-011`, `VCHR-014`, `VCHR-015` | Đạt. Đã cover cận biên 199k, biên 200k, dưới sàn 150k và giỏ hàng giảm dưới 200k. |

---

## 3. Phân Tích Khoảng Trống & Rủi Ro Tiềm Ẩn (Gap Analysis)
- **Rà soát chuyên sâu 06W**: Toàn bộ 7 Missing Rules (`MR-01` đến `MR-07`) đã được thiết kế thành các ca kiểm thử cụ thể trong suite (`VCHR-011`, `VCHR-019`, `VCHR-023`, `VCHR-028`, `VCHR-032`, `VCHR-033`).
- **Ghi nhận điểm cần lưu ý thực tế (Practical Observation)**:
  - Trên môi trường Web Live (`cwshopgo.github.io`), các mã khuyến mãi được demo ở tầng Frontend State (React Memory).
  - Test case `VCHR-032` (trừ lượt dùng) và `VCHR-033` (hoàn lượt dùng khi hủy đơn) đòi hỏi API Backend có database lưu trữ session người dùng để kiểm chứng toàn vẹn.

---

## 4. Human-Final Decision Scope (Bàn giao QA Lead / PO thẩm định)
> Tuân thủ Hiến pháp: AI không tự đóng vai người duyệt rủi ro cuối cùng mà bàn giao các khía cạnh kinh doanh cho con người thẩm định:
1. **Business Criticality**: Xác nhận mức độ nghiêm trọng của việc chặn voucher khi giỏ hàng tụt dưới 200k (`VCHR-011`) đã thỏa mãn chính sách chống gian lận thương mại điện tử chưa.
2. **Actual Risk Sufficiency**: 34 Test Cases đã đủ độ sâu cho đợt phát hành Function D (Voucher) chưa hay cần bổ sung thêm các case kiểm thử đồng thời (Concurrency) giữa nhiều tab trình duyệt?
3. **Cross-system Impact**: Tác động của mã giảm giá tới phân hệ Tính Thuế VAT (nếu có trong tương lai) và báo cáo doanh thu tài chính.
4. **Exploratory Insights**: Các trường hợp mạng chập chờn (Network Throttling 3G) trong lúc bấm nút Áp dụng.

---

## 5. Kết Luận Kiểm Định (Review Verdict)
- **Review Verdict**: `PASS` *(Đã được QA Lead / Product Owner nghiệm thu ngày 2026-09-27)*
- **Căn cứ**:
  - Rà đủ 3 góc nhìn Coverage Framework: Không phát hiện lỗ hổng logic (`Zero Missing Rule Gap`).
  - Toàn bộ 10/10 Business Rules đã được ánh xạ 100%.
  - Toàn bộ 7/7 Missing Rules 06W đã có ca kiểm thử tương ứng.
  - Product Owner / QA Lead đã chính thức xác nhận nghiệm thu và phê duyệt chuyển sang Giai đoạn 4: Bộ Dữ Liệu Kiểm Thử.

---

## 6. Cập Nhật Sau Chốt Câu Hỏi Mở Đợt 2 (2026-09-30)

> Căn cứ: `knowledge/features/function-d-voucher.md` Mục 8 #12→#23; Phụ lục 01 (định dạng mã) và Phụ lục 02 (môi trường, phí ship) trong `INPUT/function-d-voucher/02_ba/`.

### 6.1. Phạm vi bộ test

| Nhóm | Số TC | Test Case | Lý do |
|---|:---:|---|---|
| Thực thi được | 32 | Còn lại | — |
| ⏸️ Tạm đóng | 1 | `VCHR-019` | Không tạo được tiền lẻ trên catalog (#15) |
| ⛔ Ngoài phạm vi Automation | 3 | `VCHR-027`, `032`, `033` | Web không có giới hạn số lần thử, hạn mức lượt dùng, hủy từng đơn (#16). Vẫn giữ trong Master Spec |
| **Tổng** | **36** | | +2 ca mới `VCHR-035`, `036` |

### 6.2. Thay đổi test case
- **Mốc biên theo catalog thật**: `VCHR-009` (200.000 ₫), `014` (190.000 ₫), `016` (280.000 ₫), `018` (490.000 / 500.000 ₫).
- **Theo hành vi web**: `VCHR-011` (giữ mã + cảnh báo vàng), `028` (bấm nhiều lần chỉ giảm 1 lần), `031` (kiểm chứng BR-09 qua công thức tổng tiền).
- **Theo Phụ lục 01**: `VCHR-020`→`026` giữ kỳ vọng kiểm tra định dạng. Web chưa làm nên **6 ca dự kiến FAIL** (`020`, `022`→`026`) và lập defect; `VCHR-021` (20 ký tự hợp lệ) dự kiến PASS.
- **Ca mới** (Human-Final #2, QA Lead quyết theo uỷ quyền, #19): `VCHR-035` tải lại trang; `VCHR-036` đặt hàng ở 2 tab. Bỏ ca mạng 3G (không có lời gọi mạng) và VAT (không có phân hệ).
- Sửa tên sản phẩm không tồn tại ("Áo thun Polo…", "Bình giữ nhiệt Thông Minh") về đúng catalog; viết đủ số tiền (bỏ dạng `200k`); `VCHR-013`, `030` chuyển sang Automated, `030` viết lại kỳ vọng đo được.

### 6.3. Viewpoint Balance (36 TCs)
| Viewpoint | Số TC | Tỷ lệ |
|---|:---:|:---:|
| VP-01 Happy Path | 5 | 13,9% |
| VP-02 Negative | 8 | 22,2% |
| VP-03 Boundary | 9 | 25,0% |
| VP-04 Security | 5 | 13,9% |
| VP-05 UX | 3 | 8,3% |
| VP-06 Integration | 6 | 16,7% |

### 6.4. Boundary Completeness (mốc tạo được)
| Ngưỡng | Dưới | Đúng | Trên | TC |
|---|---|---|---|---|
| Sàn voucher & freeship 200.000 ₫ | 190.000 ₫ | 200.000 ₫ | 240.000 ₫ | `VCHR-014`, `015` |
| Tối thiểu SALE20 300.000 ₫ | 280.000 ₫ | 300.000 ₫ | 310.000 ₫ | `VCHR-016`, `017` |
| Trần giảm 100.000 ₫ | 490.000 ₫ | 500.000 ₫ | 510.000 ₫ / 600.000 ₫ | `VCHR-018`, `003` |
| Độ dài mã 3–20 | 2 | 3 / 20 | 21 | `VCHR-020`, `021`, `022` |

### 6.5. Khoảng trống còn lại
- `BR-01` phần làm tròn và `MR-04` chưa kiểm chứng được (`VCHR-019` tạm đóng).
- `MR-06`, `MR-07` không có tính năng trên web.
- `VCHR-036`: kỳ vọng "không mất đơn giữa 2 tab" đang là `[GIẢ ĐỊNH]` — chờ BA xác nhận (Readiness v3 ❓).
- **Verdict**: `PASS` — độ phủ đạt; còn 1 giả định treo ở `VCHR-036`, không chặn thiết kế.

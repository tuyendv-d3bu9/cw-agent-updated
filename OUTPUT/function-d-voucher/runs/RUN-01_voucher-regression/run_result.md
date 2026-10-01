# Báo Cáo Kết Quả Thực Thi · RUN-01_voucher-regression
**Task**: `function-d-voucher` · **Thời gian thực thi**: 2026-09-30 20:37:03 (GMT+7)  
**Môi trường kiểm thử**: Web Live `https://cwshopgo.github.io/` (Production/Staging Build)  
**Kỹ sư thực thi**: `qa-automation` · **Người nghiệm thu**: QA Leader  
**Trạng thái phiên chạy**: IN-PROGRESS (Đã hoàn thành Cụm 1: Happy Path)

---

## 1. Bảng Tổng Hợp Kết Quả Thực Thi (Execution Summary)

| Chỉ số | Giá trị | Tỷ lệ |
|---|:---:|:---:|
| **Tổng số ca trong phiên (Cụm 1)** | **5** | 100% |
| **Số ca ĐẠT (PASS)** | **5** | **100%** |
| **Số ca KHÔNG ĐẠT (FAIL)** | **0** | **0%** |
| **Số ca CHẶN / BỎ QUA (BLOCKED/SKIPPED)** | **0** | **0%** |
| **Tổng thời gian thực thi Cụm 1** | **42.1s** | Tốc độ TB: ~8.4s / ca |

---

## 2. Chi Tiết Kết Quả Kiểm Thử Từng Test Case (Cụm 1: Happy Path & Mã Hợp Lệ)

| TC ID | Jira Key | Tiêu đề Ca Kiểm Thử | Dữ liệu Kiểm Thử | Kết quả Thực tế (Actual Result) | Trạng thái | Bằng chứng (Evidence) |
|---|:---:|---|---|---|:---:|:---:|
| `VCHR-001` | [`SG-2`](https://shopgo.atlassian.net/browse/SG-2) | Áp dụng thành công GIAM50K cho đơn đạt mức sàn 200.000 VNĐ | Mã `GIAM50K`<br>Đơn 200.000 ₫ (`prod-003` x 1) | Toast: "Áp dụng thành công mã GIAM50K: Giảm 50.000 ₫". Tổng thanh toán: 150.000 ₫. | **PASS** | [VCHR-001_PASS.png](file:///c:/Users/tuyendv7517/Documents/Research/CWTechAcademy/gitlab/cw-agent-antigravity/OUTPUT/function-d-voucher/runs/RUN-01_voucher-regression/evidence/VCHR-001_PASS.png) |
| `VCHR-002` | [`SG-3`](https://shopgo.atlassian.net/browse/SG-3) | Áp dụng thành công SALE20 cho đơn hàng 350.000 VNĐ giảm 20% | Mã `SALE20`<br>Đơn 350.000 ₫ (`prod-002` x 1) | Giảm đúng 20% (70.000 ₫). Tổng thanh toán cập nhật chính xác còn 280.000 ₫. | **PASS** | [VCHR-002_PASS.png](file:///c:/Users/tuyendv7517/Documents/Research/CWTechAcademy/gitlab/cw-agent-antigravity/OUTPUT/function-d-voucher/runs/RUN-01_voucher-regression/evidence/VCHR-002_PASS.png) |
| `VCHR-003` | [`SG-4`](https://shopgo.atlassian.net/browse/SG-4) | Áp dụng SALE20 cho đơn 600.000 VNĐ kích hoạt trần maxCap 100.000 VNĐ | Mã `SALE20`<br>Đơn 600.000 ₫ (`prod-003` x 3) | Giảm chạm trần 100.000 ₫ (thay vì 120.000 ₫). Tổng thanh toán còn 500.000 ₫. | **PASS** | [VCHR-003_PASS.png](file:///c:/Users/tuyendv7517/Documents/Research/CWTechAcademy/gitlab/cw-agent-antigravity/OUTPUT/function-d-voucher/runs/RUN-01_voucher-regression/evidence/VCHR-003_PASS.png) |
| `VCHR-004` | [`SG-5`](https://shopgo.atlassian.net/browse/SG-5) | Tự động trim khoảng trắng và uppercase khi nhập mã thường `  giam50k  ` | Chuỗi `"  giam50k  "`<br>Đơn 350.000 ₫ | Tự động chuẩn hóa thành `GIAM50K`, áp dụng thành công giảm 50.000 ₫. Tổng còn 300.000 ₫. | **PASS** | [VCHR-004_PASS.png](file:///c:/Users/tuyendv7517/Documents/Research/CWTechAcademy/gitlab/cw-agent-antigravity/OUTPUT/function-d-voucher/runs/RUN-01_voucher-regression/evidence/VCHR-004_PASS.png) |
| `VCHR-005` | [`SG-6`](https://shopgo.atlassian.net/browse/SG-6) | Bấm trực tiếp vào badge gợi ý GIAM50K tự động điền và áp dụng | Click badge `#badge-voucher-GIAM50K`<br>Đơn 200.000 ₫ | Tự động điền mã vào ô input và kích hoạt áp dụng thành công. | **PASS** | [VCHR-005_PASS.png](file:///c:/Users/tuyendv7517/Documents/Research/CWTechAcademy/gitlab/cw-agent-antigravity/OUTPUT/function-d-voucher/runs/RUN-01_voucher-regression/evidence/VCHR-005_PASS.png) |

---

## 2.1. Kiểm Thử Đơn Lẻ Bổ Sung (Theo Yêu Cầu Người Dùng)

| TC ID | Jira Key | Tiêu đề Ca Kiểm Thử | Dữ liệu Kiểm Thử | Kết quả Thực tế (Actual Result) | Trạng thái | Bằng chứng (Evidence) |
|---|:---:|---|---|---|:---:|:---:|
| `VCHR-016` | [`SG-17`](https://shopgo.atlassian.net/browse/SG-17) | Từ chối áp dụng SALE20 cho đơn cận biên dưới 280.000 VNĐ | Mã `SALE20`<br>Đơn 280.000 ₫ (`prod-004` x 1) | Thông báo: "Đơn hàng chưa đạt mức tối thiểu 300.000 ₫ (Hiện có 280.000 ₫)." Không giảm tiền, tổng giữ nguyên 280.000 ₫ (freeship). | **PASS** | [VCHR-016_PASS.png](file:///c:/Users/tuyendv7517/Documents/Research/CWTechAcademy/gitlab/cw-agent-antigravity/OUTPUT/function-d-voucher/runs/RUN-01_voucher-regression/evidence/VCHR-016_PASS.png) |

---

## 3. Đánh Giá Chất Lượng & Phản Hồi Từ QA Leader
- **Độ tin cậy & Ổn định (Robustness)**: Cả 5 kịch bản đều chạy mượt mà, định vị chính xác phần tử qua POM, không bị flakiness hay timeout.
- **Tuân thủ Chuẩn FACT**: Mọi mốc tiền (200k, 350k, 600k) và công thức tính toán đều trùng khớp 100% với đặc tả yêu cầu và catalog sản phẩm thực tế.
- **Toàn vẹn Dữ liệu Bằng chứng**: 100% các ca PASS đều đã được chụp ảnh màn hình Full Page rõ nét lưu trữ tại thư mục `runs/RUN-01_voucher-regression/evidence/`.

# Viewpoint Report · hoan-tien
Owner: qa-system/qa-analyst/skills/viewpoint-selection.md · Nguồn: 01_requirement_risk_summary.md, 02_missing_rule_report.md, knowledge/features/hoan-tien.md · Verdict: PASS

> `npm run gate hoan-tien` exit 0 trước khi ghi (17 câu hỏi đã chốt). MR-07 `Rejected` không sinh viewpoint.

## 1. RỦI RO
| ID | Rủi ro | Likelihood | Impact | Risk Level | Nguồn |
|---|---|---|---|---|---|
| RK-01 | Tự động duyệt sai điều kiện (biên số tiền, lý do khác Hàng lỗi) làm hoàn tiền không qua người duyệt | HIGH | HIGH | CRITICAL | BR-05, BR-19, OQ-02 |
| RK-02 | Hoàn số tiền vượt quá số khách đã thanh toán | MEDIUM | HIGH | HIGH | BR-04, BR-18, BR-23, FD-02, AF-03 |
| RK-03 | Tính sai thời hạn gửi yêu cầu (giá trị vừa đổi theo CR-07) | HIGH | MEDIUM | HIGH | BR-02, BR-17, AF-01 |
| RK-04 | Tạo trùng yêu cầu hoặc vượt số lần gửi cho một đơn hàng | MEDIUM | HIGH | HIGH | BR-03, BR-13, AF-02, AF-11 |
| RK-05 | Yêu cầu đã duyệt nhưng hoàn tiền thất bại mà không có luồng xử lý | MEDIUM | HIGH | HIGH | BR-07, BR-10, AF-09 |
| RK-06 | Phân sai người duyệt theo ngưỡng số tiền | MEDIUM | MEDIUM | MEDIUM | BR-06, BR-20, BR-21 |
| RK-07 | Chuyển trạng thái sai (huỷ / sửa yêu cầu ngoài trạng thái Chờ duyệt) | MEDIUM | MEDIUM | MEDIUM | BR-09, BR-10, BR-11, BR-12, BR-15, AF-10 |
| RK-08 | Tạo yêu cầu trên đơn hàng của khách khác hoặc đơn COD qua API | MEDIUM | HIGH | HIGH | AF-08, AF-15, BR-16, MR-02, MR-17 |

## 2. VIEWPOINT ĐƯỢC CHỌN
| VP | Tên | Nguồn (BR/FD/AF/MR) | Lý do |
|---|---|---|---|
| VP-01 | Happy Path | BR-01, BR-02, BR-05, BR-06, BR-07, BR-09, BR-10, BR-11, BR-14, BR-18, BR-21, BR-22, BR-23 | 01 §4 có luồng chính; mỗi BR có hành vi đúng cần kiểm |
| VP-02 | Negative | BR-03, BR-04, BR-08, BR-12, BR-16, BR-19, BR-24, FD-01, FD-05, AF-01, AF-02, AF-03, AF-04, AF-05, AF-06, AF-09, AF-11, AF-12, AF-13, AF-14 | Có FD bắt buộc và các AF lỗi có chữ phản hồi |
| VP-03 | Boundary | FD-02, FD-03, FD-04, FD-05, BR-02, BR-05, BR-06, BR-13, BR-17 | FD và BR có min/max/độ dài/ngưỡng trong nguồn (10.000; 500 ký tự; 3 tệp; 5 MB; 255 ký tự; 10 ngày; 500.000đ; 5.000.000đ; 2 lần) |
| VP-04 | Security | BR-20, AF-08, AF-15, MR-02, MR-17 | Nguồn nêu quyền theo vai trò (02_ba §2, BR-06) và MR đã chốt về W5/W2 (đơn của người khác, đơn COD qua API) |
| VP-05 | UX/Usability | BR-15, BR-25, AF-07, AF-10 | 04_design có chữ hiển thị, nút và hộp xác nhận |
| VP-08 | Integration | BR-07, BR-14, BR-22, AF-09 | Nguồn nhắc cổng thanh toán và email thông báo |

## 3. ĐẶC TẢ VIEWPOINT
### VP-01 — Happy Path
- Mục tiêu: luồng gửi yêu cầu thành công, tự động duyệt, phân người duyệt, duyệt/từ chối, huỷ, hoàn tiền về phương thức gốc.
- Trong phạm vi: BR-01, BR-02, BR-05, BR-06, BR-07, BR-09, BR-10, BR-11, BR-14, BR-18, BR-21, BR-22, BR-23
- Rủi ro liên quan: RK-01, RK-02, RK-03, RK-05, RK-06
- Giao thoa: điểm biên số tiền / thời hạn → VP-03; email và cổng thanh toán → VP-08

### VP-02 — Negative
- Mục tiêu: hệ thống từ chối đúng và hiển thị đúng chữ cho mọi luồng lỗi có trong nguồn.
- Trong phạm vi: BR-03, BR-04, BR-08, BR-12, BR-16, BR-19, BR-24, FD-01, FD-05, AF-01, AF-02, AF-03, AF-04, AF-05, AF-06, AF-09, AF-11, AF-12, AF-13, AF-14
- Rủi ro liên quan: RK-01, RK-02, RK-04, RK-05, RK-07
- Giao thoa: giá trị ngay ngoài biên (min-1, max+1, quá độ dài) → VP-03; đơn của người khác / COD qua API → VP-04

### VP-03 — Boundary
- Mục tiêu: đủ chuỗi biên QA_STANDARD §6 cho mọi ngưỡng có trong nguồn.
- Trong phạm vi: FD-02, FD-03, FD-04, FD-05, BR-02, BR-05, BR-06, BR-13, BR-17
- Rủi ro liên quan: RK-01, RK-02, RK-03, RK-04, RK-06
- Giao thoa: chữ thông báo khi vượt biên lấy từ AF của VP-02

### VP-04 — Security
- Mục tiêu: chỉ đúng chủ đơn và đúng vai trò được thao tác.
- Trong phạm vi: BR-20, AF-08, AF-15, MR-02, MR-17
- Rủi ro liên quan: RK-06, RK-08
- Giao thoa: phân ngưỡng duyệt đúng → VP-01

### VP-05 — UX/Usability
- Mục tiêu: nút, hộp xác nhận và chữ hiển thị đúng thiết kế.
- Trong phạm vi: BR-15, BR-25, AF-07, AF-10
- Rủi ro liên quan: RK-07
- Giao thoa: chữ thông báo của luồng lỗi → VP-02

### VP-08 — Integration
- Mục tiêu: tác động sang cổng thanh toán và dịch vụ email.
- Trong phạm vi: BR-07, BR-14, BR-22, AF-09
- Rủi ro liên quan: RK-05
- Giao thoa: trạng thái sau khi hoàn tiền → VP-01

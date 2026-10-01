# DAILY QA SUMMARY · Chức năng Voucher (Function D) · 2026-09-30
Owner: agents/qa-reporter/gen-daily-summary · Audience: pm · Nguồn: `OUTPUT/function-d-voucher/reports/sprint_data_2026-09-30.json` · Verdict: PASS

---

## 1. Tiến độ hôm nay

### Chỉ số thực thi kiểm thử:
| Chỉ số | Số lượng | Ghi chú |
|---|---|---|
| **Executed** | 6 | Kịch bản đã chạy trên web thật |
| **Passed** | 6 | Kết quả đúng như mong đợi |
| **Failed** | 0 | — |
| **Blocked** | 0 | — |

- **Pass Rate**: `6/6` = **100%**
  *(Công thức: `Pass Rate = (passed / executed) * 100% = 6 / 6 = 100%`)*
- **Tiến độ đợt kiểm thử**: 6/32 kịch bản đã chạy (≈ 19%), còn 26 kịch bản.
- **Phạm vi đã cover hôm nay**:
  - Áp dụng voucher thành công: giảm tiền cố định, giảm theo phần trăm, giới hạn số tiền giảm tối đa, tự sửa mã nhập chữ thường hoặc có khoảng trắng, chọn mã từ gợi ý.
  - Từ chối voucher khi đơn chưa đạt giá trị tối thiểu (1 kịch bản).
- **Việc chuẩn bị đã xong**: 36 kịch bản đã có trên Jira. Bộ kiểm thử tự động đã sẵn sàng cho 32 kịch bản.

---

## 2. Outstanding Issues

| Feature / Nhóm chức năng | Số lượng bug | Mức độ nghiêm trọng | Trạng thái tổng quát | Tác động tiến độ / nghiệp vụ |
|---|---|---|---|---|
| Voucher — nút Áp dụng | 1 | High | Chưa xử lý (To Do) | Khách bấm nút Áp dụng nhiều lần liên tiếp thì nút bị treo. Đợt kiểm thử sẽ xác nhận lại lỗi này ở nhóm kịch bản số 4. |

**Cần BA quyết định:**
- Khi khách mở 2 tab cùng lúc, chưa có quy định chính thức về việc đơn hàng có được giữ nguyên hay không. Hiện đội QA đang tạm giả định là không được mất đơn.

---

## 3. Blocker

*Không ghi nhận blocker nào trong dữ liệu sprint hiện tại.*

> ⚠️ **LƯU Ý HUMAN-FINAL REVIEW**: Section Blocker có thể kích hoạt các quyết định và hành động can thiệp tức thì từ phía PM / Lead. Đề nghị người duyệt đối chiếu kỹ lưỡng trước khi phát hành.

---

## 4. ⏭ Next Action

| Nhiệm vụ tiếp theo | Người phụ trách | Thời hạn / Ghi chú |
|---|---|---|
| Chạy 26 kịch bản còn lại: mã sai hoặc hết hạn, giá trị biên, gỡ và đổi mã, định dạng mã và an toàn nhập liệu, đơn hàng và mở nhiều tab | (chưa phân công trong dữ liệu) | Dự kiến 7 kịch bản sẽ phát hiện lỗi: 6 do web chưa kiểm tra định dạng mã theo Phụ lục 01, 1 do tình huống mở 2 tab |
| Tổng hợp báo cáo kết quả và danh sách lỗi cho cả 32 kịch bản | (chưa phân công trong dữ liệu) | — |
| Xác nhận quy định cho tình huống mở 2 tab | BA | Đang chờ |

---

## 5. Human-Final Review Checklist (Trước khi gửi cho Team)
- [ ] **Số liệu thực thi**: Xác nhận đã đối chiếu các số Executed, Passed, Failed, Blocked với dashboard thực tế.
- [ ] **Công thức Pass Rate**: Xác nhận phép tính `passed / executed` chính xác.
- [ ] **Blocker (ĐẶC BIỆT QUAN TRỌNG)**: PM / QA Lead đã duyệt tính chính xác của các điểm chặn và hành động đề xuất.
- [ ] **Next Action**: Đã xác nhận người phụ trách các đầu việc tiếp theo.
- [ ] **Phê duyệt phát hành**: [ ] SẴN SÀNG GỬI / [ ] CẦN CẬP NHẬT

# DAILY QA SUMMARY · function-d-voucher · 2026-09-30
Owner: agents/qa-reporter/gen-daily-summary · Audience: dev · Nguồn: `OUTPUT/function-d-voucher/reports/sprint_data_2026-09-30.json` · Verdict: PASS

**Phiên chạy**: `RUN-01_voucher-regression` · **Môi trường**: Web Live `https://cwshopgo.github.io/` · **Công cụ**: Playwright + POM (`automation/tests/voucher.spec.ts`)

---

## 1. Tiến độ hôm nay

### Chỉ số thực thi kiểm thử:
| Chỉ số | Số lượng | Ghi chú |
|---|---|---|
| **Executed** | 6 | `VCHR-001` → `005` (Cụm 1) + `VCHR-016` (Cụm 3) |
| **Passed** | 6 | Có ảnh bằng chứng `runs/RUN-01_voucher-regression/evidence/<TC>_PASS.png` |
| **Failed** | 0 | — |
| **Blocked** | 0 | — |

- **Pass Rate**: `6/6` = **100%**
  *(Công thức: `Pass Rate = (passed / executed) * 100% = 6 / 6 = 100%`)*
- **Tiến độ trên phạm vi Automation**: 6/32 ca đã chạy, còn 26 ca.
- **Thời gian chạy Cụm 1**: 42.1s cho 5 ca.
- **Phạm vi đã cover**: Voucher (Function D). Cụm 1 (Happy Path & Mã hợp lệ) đã xong; Cụm 3 (Biên giá trị) mới chạy `VCHR-016`.

| TC ID | Jira | Nội dung | Kết quả |
|---|---|---|---|
| `VCHR-001` | `SG-2` | GIAM50K, đơn 200.000 ₫ → tổng 150.000 ₫ | PASS |
| `VCHR-002` | `SG-3` | SALE20, đơn 350.000 ₫ → giảm 70.000 ₫, tổng 280.000 ₫ | PASS |
| `VCHR-003` | `SG-4` | SALE20, đơn 600.000 ₫ → chạm trần 100.000 ₫, tổng 500.000 ₫ | PASS |
| `VCHR-004` | `SG-5` | Input `"  giam50k  "` → trim + uppercase thành `GIAM50K` | PASS |
| `VCHR-005` | `SG-6` | Click `#badge-voucher-GIAM50K` → tự điền và áp dụng | PASS |
| `VCHR-016` | `SG-17` | SALE20, đơn 280.000 ₫ → từ chối, báo chưa đạt mức tối thiểu 300.000 ₫ | PASS |

---

## 2. Outstanding Issues

| Bug ID | Test Case ID | Feature | Severity | Trạng thái | Chi tiết kỹ thuật |
|---|---|---|---|---|---|
| `SG-1` | Chưa liên kết TC trong Jira | Voucher (Component: General) | High | To Do | Nút Áp Dụng bị treo khi click liên tiếp nhiều lần. Cùng hành vi với `VCHR-028` (`SG-29`, Cụm 4), ca này chưa chạy. |

**Câu hỏi mở (không phải bug):**
- `VCHR-036` (`SG-37`): kỳ vọng "không mất đơn giữa 2 tab" vẫn là `[GIẢ ĐỊNH]`, đang chờ BA xác nhận.

---

## 3. Blocker

*Không ghi nhận blocker nào trong dữ liệu sprint hiện tại.*

> ⚠️ **LƯU Ý HUMAN-FINAL REVIEW**: Section Blocker có thể kích hoạt các quyết định và hành động can thiệp tức thì từ phía PM / Lead. Đề nghị người duyệt đối chiếu kỹ lưỡng trước khi phát hành.

---

## 4. ⏭ Next Action

| Nhiệm vụ tiếp theo | Người phụ trách | Thời hạn / Ghi chú |
|---|---|---|
| Chạy Cụm 2: `VCHR-006`, `007`, `010` | (chưa phân công trong dữ liệu) | Mã hết hạn / sai / rỗng |
| Chạy Cụm 3 còn lại: `VCHR-008`, `009`, `011`, `014`, `015`, `017`, `018` | (chưa phân công trong dữ liệu) | Các mốc biên 190k → 500k |
| Chạy Cụm 4: `VCHR-012`, `013`, `028`, `029`, `031` | (chưa phân công trong dữ liệu) | `VCHR-028` dùng để xác nhận lại `SG-1` |
| Chạy Cụm 5: `VCHR-020` → `026` | (chưa phân công trong dữ liệu) | Dự kiến 6 ca FAIL (`020`, `022`–`026`) do FE chưa làm quy tắc định dạng mã theo Phụ lục 01 |
| Chạy Cụm 6: `VCHR-030`, `034`, `035`, `036` | (chưa phân công trong dữ liệu) | `VCHR-036` dự kiến FAIL |
| Tổng hợp `run_result.md` + `run_defects.md` cho 32 ca | (chưa phân công trong dữ liệu) | — |
| Xác nhận kỳ vọng của `VCHR-036` | BA | Đang chờ |

---

## 5. Human-Final Review Checklist (Trước khi gửi cho Team)
- [ ] **Số liệu thực thi**: Xác nhận đã đối chiếu các số Executed, Passed, Failed, Blocked với dashboard thực tế.
- [ ] **Công thức Pass Rate**: Xác nhận phép tính `passed / executed` chính xác.
- [ ] **Blocker (ĐẶC BIỆT QUAN TRỌNG)**: PM / QA Lead đã duyệt tính chính xác của các điểm chặn và hành động đề xuất.
- [ ] **Next Action**: Đã xác nhận người phụ trách các đầu việc tiếp theo.
- [ ] **Phê duyệt phát hành**: [ ] SẴN SÀNG GỬI / [ ] CẦN CẬP NHẬT

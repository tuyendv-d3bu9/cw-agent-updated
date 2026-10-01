# Kế Hoạch Phiên Chạy Kiểm Thử · RUN-01_voucher-regression
**Task**: `function-d-voucher` · **Thời gian lập**: 2026-09-30 · **Người lập**: QA Leader / qa-automation  
**Mục tiêu**: Kiểm thử hồi quy chức năng Voucher (Function D) trên Web Live `https://cwshopgo.github.io/`  
**Liên kết Jira**: Đã đồng bộ 36 Test Cases lên Jira Cloud Project `SG` (`SG-2` đến `SG-37`)

---

## 1. Phạm Vi Kiểm Thử (Scope & Readiness Gate v3)
- **Tổng số test cases**: 36 test cases
- **Phạm vi thực thi Automation**: **32/36 test cases**
  - **25 ca kỳ vọng PASS**: Khớp hoàn toàn hành vi frontend và catalog thực tế (`VCHR-001` → `018`, `021`, `028`, `029`, `030`, `031`, `034`, `035`).
  - **7 ca dự kiến FAIL (Dò bắt lỗi/Defects)**: Kiểm chứng kẽ hở định dạng mã theo Phụ lục 01 (`VCHR-020`, `022`, `023`, `024`, `025`, `026`) và xung đột đồng thời 2 tab (`VCHR-036`).
- **Phạm vi loại trừ (Out of Scope)**:
  - `VCHR-019`: Tạm đóng do web không có giá sản phẩm lẻ (bội số 10.000 ₫).
  - `VCHR-027`, `VCHR-032`, `VCHR-033`: Ngoài phạm vi Automation do web không có backend/tính năng giới hạn rate limit/hủy đơn.

---

## 2. Bảng Phân Bổ Cụm Hành Trình (Flow Clustering) & Ánh Xạ Jira

| Cụm hành trình | Danh sách Test Cases | Jira Keys tương ứng | Môi trường / Precondition | Trạng thái Thực thi |
|---|---|---|---|:---:|
| **Cụm 1: Happy Path & Mã hợp lệ** | `VCHR-001`, `002`, `003`, `004`, `005` | [`SG-2`](https://shopgo.atlassian.net/browse/SG-2) → [`SG-6`](https://shopgo.atlassian.net/browse/SG-6) | Đã đăng nhập `khachhang@shopgo.vn`, giỏ hàng đạt điều kiện sàn | ✅ **PASS (Done)** |
| **Cụm 2: Mã không hợp lệ & Lỗi nhập** | `VCHR-006`, `007`, `010` | [`SG-7`](https://shopgo.atlassian.net/browse/SG-7), [`SG-8`](https://shopgo.atlassian.net/browse/SG-8), [`SG-11`](https://shopgo.atlassian.net/browse/SG-11) | Đã đăng nhập, nhập mã hết hạn / sai / rỗng | ⏳ Chờ chạy |
| **Cụm 3: Ràng buộc Ngưỡng & Biên giá trị** | `VCHR-008`, `009`, `011`, `014` → `018` | [`SG-9`](https://shopgo.atlassian.net/browse/SG-9), [`SG-10`](https://shopgo.atlassian.net/browse/SG-10), [`SG-12`](https://shopgo.atlassian.net/browse/SG-12), [`SG-15`](https://shopgo.atlassian.net/browse/SG-15) → [`SG-19`](https://shopgo.atlassian.net/browse/SG-19) | Giỏ hàng kiểm tra các mốc biên 190k, 200k, 280k, 300k, 490k, 500k | ⏳ Chờ chạy |
| **Cụm 4: Trạng thái Mã, Gỡ & Chuyển đổi** | `VCHR-012`, `013`, `028`, `029`, `031` | [`SG-13`](https://shopgo.atlassian.net/browse/SG-13), [`SG-14`](https://shopgo.atlassian.net/browse/SG-14), [`SG-29`](https://shopgo.atlassian.net/browse/SG-29), [`SG-30`](https://shopgo.atlassian.net/browse/SG-30), [`SG-32`](https://shopgo.atlassian.net/browse/SG-32) | Thao tác gỡ mã, đổi mã, click liên tiếp, kiểm tra UI/phí ship | ⏳ Chờ chạy |
| **Cụm 5: Chuẩn hóa Định dạng & An ninh** | `VCHR-020` → `026` | [`SG-21`](https://shopgo.atlassian.net/browse/SG-21) → [`SG-27`](https://shopgo.atlassian.net/browse/SG-27) | Nhập chuỗi 2 ký tự, 20 ký tự, >20 ký tự, ký tự đặc biệt, XSS, SQLi | ⏳ Chờ chạy |
| **Cụm 6: Vòng đời Đơn hàng & Đồng thời** | `VCHR-030`, `034`, `035`, `036` | [`SG-31`](https://shopgo.atlassian.net/browse/SG-31), [`SG-35`](https://shopgo.atlassian.net/browse/SG-35), [`SG-36`](https://shopgo.atlassian.net/browse/SG-36), [`SG-37`](https://shopgo.atlassian.net/browse/SG-37) | Responsive, localStorage đơn hàng, F5 reload và 2 Tab song song | ⏳ Chờ chạy |

---

## 3. Thu Thập Bằng Chứng Kiểm Thử (Evidence Policy)
- Bằng chứng ảnh chụp màn hình cho mỗi ca kiểm thử được lưu tự động vào:  
  `OUTPUT/function-d-voucher/runs/RUN-01_voucher-regression/evidence/`
- Tên file bằng chứng: `<TC_ID>_PASS.png` hoặc `<TC_ID>_FAIL.png`.
- Kết quả kiểm thử tổng hợp sẽ được ghi nhận vào `run_result.md`.
- Các ca thất bại sẽ được phân loại lỗi và lập danh sách vào `run_defects.md`.

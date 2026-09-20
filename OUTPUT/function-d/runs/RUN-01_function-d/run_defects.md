# Draft Defect · VCHR-003

**Title:** Voucher `HETHAN` bị từ chối là hết hạn trái với BR-12

- **Severity:** [ĐỀ XUẤT] Major
- **Precondition:** Đăng nhập account demo, có đơn 350.000 ₫.
- **Steps:** Vào Thanh toán → nhập `HETHAN` → bấm Áp dụng.
- **Expected:** Theo BR-12, voucher hiện tại chưa hết lượt và không bị báo hết hạn.
- **Actual:** `Mã giảm giá "HETHAN" đã hết hạn sử dụng.`
- **Evidence:** [VCHR-003_fail.png](evidence/VCHR-003_fail.png)
- **Human-final:** BA/PO xác nhận `HETHAN` có phải mã nằm ngoài tập “voucher hiện tại chưa hết lượt” hay là lỗi dữ liệu/configuration.

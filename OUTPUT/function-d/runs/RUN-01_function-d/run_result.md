# Run Result · RUN-01_function-d

Môi trường: `https://cwshopgo.github.io/` · Browser: Chromium · Verdict: **FAIL**

| Tổng | PASS | FAIL | BLOCKED |
|---:|---:|---:|---:|
| 4 | 3 | 1 | 0 |

| TC | Kết quả | Actual Result | Evidence |
|---|---|---|---|
| VCHR-001 | PASS | Guest bị mở dialog đăng nhập trước khi thấy voucher. | [pass](evidence/VCHR-001_pass.png) |
| VCHR-002 | PASS | `GIAM50K` áp thành công cho subtotal 350.000 ₫ và hiển thị giảm 50.000 ₫. | [pass](evidence/VCHR-002_pass.png) |
| VCHR-003 | FAIL | Website hiển thị `Mã giảm giá "HETHAN" đã hết hạn sử dụng.` trong khi BR-12 xác nhận voucher hiện tại chưa hết lượt. | [fail](evidence/VCHR-003_fail.png) |
| VCHR-004 | PASS | Website hiển thị `Mã giảm giá "INVALID" không tồn tại trên hệ thống.` | [pass](evidence/VCHR-004_pass.png) |

Trace Playwright của case fail: `test-results/function-d_run-01-VCHR-003-e4d66--is-not-rejected-as-expired/trace.zip`.

# Run Plan · RUN-01_function-d

Môi trường: `https://cwshopgo.github.io/` · Browser: Chromium · Thời điểm: 2026-09-20

| TC | Mục tiêu | Expected source |
|---|---|---|
| VCHR-001 | Chặn áp voucher khi chưa đăng nhập | BR-11 (User clarification) |
| VCHR-002 | Áp `GIAM50K` cho đơn đủ điều kiện | BR-05, BR-09, BR-13 + website baseline |
| VCHR-003 | Báo mã `HETHAN` hết hạn | BR-12, BR-13; website baseline — kiểm tra lệch với trạng thái “hiện tại chưa hết” |
| VCHR-004 | Báo mã không tồn tại | BR-06, BR-13; website baseline |

Giới hạn: site public không cung cấp credentials/test-data reset; run này dùng dữ liệu UI hiện hữu và ghi nhận mọi lệch giữa business clarification và implementation thành finding.

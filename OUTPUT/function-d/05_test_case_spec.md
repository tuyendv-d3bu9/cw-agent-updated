# TEST CASE SPEC · function-d

Owner: qa-test-design · Nguồn: `01_requirement_risk_summary.md`, user clarification 2026-09-20, website baseline · Verdict: PASS (phạm vi demo)

### TC_ID: VCHR-001
- **Title**: Validate voucher application is blocked before login
- **Precondition**: Guest; có một sản phẩm trong giỏ.
- **Test Steps**: 1. Thêm sản phẩm giá 350.000 ₫. 2. Chọn Thanh toán.
- **Test Data**: Guest user.
- **Expected Result**: Hiện yêu cầu đăng nhập; ô voucher không hiển thị.
- **Priority**: High
- **Tags**: Rule#BR-11, Viewpoint#Security, Module#VCHR, [Automated]

### TC_ID: VCHR-002
- **Title**: Verify GIAM50K is applied to an eligible order
- **Precondition**: Đăng nhập account demo; subtotal 350.000 ₫.
- **Test Steps**: 1. Mở Thanh toán. 2. Nhập `GIAM50K`. 3. Bấm Áp dụng.
- **Test Data**: `GIAM50K`; 350.000 ₫.
- **Expected Result**: Hiện success message và giảm 50.000 ₫.
- **Priority**: High
- **Tags**: Rule#BR-05, Rule#BR-09, Viewpoint#Happy Path, Module#VCHR, [Automated]

### TC_ID: VCHR-003
- **Title**: Verify a current voucher is not rejected as expired
- **Precondition**: Đăng nhập; voucher theo BR-12 chưa hết lượt.
- **Test Steps**: 1. Mở Thanh toán. 2. Nhập `HETHAN`. 3. Bấm Áp dụng.
- **Test Data**: `HETHAN`.
- **Expected Result**: Không hiển thị lỗi hết hạn.
- **Priority**: High
- **Tags**: Rule#BR-12, Viewpoint#Negative, Module#VCHR, [Automated]

### TC_ID: VCHR-004
- **Title**: Verify unknown voucher error message
- **Precondition**: Đăng nhập; subtotal 350.000 ₫.
- **Test Steps**: 1. Mở Thanh toán. 2. Nhập `INVALID`. 3. Bấm Áp dụng.
- **Test Data**: `INVALID`.
- **Expected Result**: Hiện `Mã giảm giá "INVALID" không tồn tại trên hệ thống.`
- **Priority**: Medium
- **Tags**: Rule#BR-06, Rule#BR-13, Viewpoint#Negative, Module#VCHR, [Automated]

# BÁO CÁO COVERAGE REVIEW & TEST SUITE GAP ANALYSIS · function-a
Owner: qa-system/qa-test-design/coverage-review · Nguồn: OUTPUT/function-a/05_test_case_spec.md · Verdict: PASS

---

## 0. Kết Quả Kiểm Định Cơ Học Bằng Máy (Machine Lint Result)
```text
> node qa-system/tools/system/lint-deliverables.js function-a

───────────────────────────────────────────────────────────────────
  DELIVERABLE LINT · task [ function-a ]   ·   18 test case(s)
───────────────────────────────────────────────────────────────────
  Clean — fields, meta line, 06W coverage and table cells all pass.
───────────────────────────────────────────────────────────────────
```

---

## 1. Tổng quan 3 Góc nhìn
- **Góc nhìn 1 (Requirement ↔ Test Suite)**: Đạt độ phủ 100% đối với 8 quy tắc nghiệp vụ đã xác nhận (`BR-AUTH-01` đến `BR-AUTH-08`), bao quát đầy đủ 2 tài khoản thử nghiệm, tính toàn vẹn danh tính hiển thị, cơ chế quản lý phiên và các thông báo lỗi.
- **Góc nhìn 2 (Viewpoint Balance)**: Bộ 18 test cases phân bổ hài hòa giữa 6 góc nhìn: Happy Path (4 cases), Negative (6 cases), Boundary (2 cases), Security (3 cases), UX/Usability (2 cases), Integration (2 cases).
- **Góc nhìn 3 (Boundary Completeness)**: Đã bao phủ triệt để các ca biên về chuỗi rỗng (`""`), khoảng trắng thừa đầu/cuối, chữ in hoa toàn bộ và định dạng thiếu `@`.

---

## 2. Ma trận Đối soát Độ phủ
| Rule# | Rule description | Test Case IDs cover | Gap & Recommendation |
|:---|:---|:---|:---|
| BR-AUTH-01 | Danh mục tài khoản hợp lệ (VIP & Khách thường) | AUTH-001, AUTH-002, AUTH-003, AUTH-011, AUTH-012, AUTH-013, AUTH-016, AUTH-017 | Đạt — Bao phủ đủ cả 2 tài khoản và tương tác form |
| BR-AUTH-02 | Tính toàn vẹn danh tính hiển thị (Đúng tên, không lẫn) | AUTH-001, AUTH-002, AUTH-014 | Đạt — Kiểm tra tên chính xác và kiểm tra chống lẫn khi đổi tài khoản |
| BR-AUTH-03 | Quản lý phiên đăng nhập (`localStorage`) | AUTH-004, AUTH-018 | Đạt — Kiểm tra lưu trữ phiên và khôi phục khi F5 |
| BR-AUTH-04 | Thông báo lỗi sai mật khẩu hoặc sai email | AUTH-005, AUTH-006, AUTH-010 | Đạt — Đúng thông báo `"Email hoặc mật khẩu không chính xác."` |
| BR-AUTH-05 | Chặn submit khi để trống trường Email/Pass | AUTH-007, AUTH-008, AUTH-009 | Đạt — Đúng thông báo `"Vui lòng nhập đầy đủ thông tin."` |
| BR-AUTH-06 | Không giới hạn lần đăng nhập sai (Chưa có CAPTCHA) | AUTH-015 | Đạt — Xác minh hệ thống ổn định khi thử sai liên tiếp |
| BR-AUTH-07 | Phân quyền VIP và Khách thường | AUTH-002 | Đạt — Xác minh huy hiệu VIP hiển thị đúng trên Header |
| BR-AUTH-08 | Hành vi điều hướng khi Đăng xuất | AUTH-014, AUTH-018 | Đạt — Xác minh quay về trang chủ và không hiển thị giỏ hàng |

---

## 3. Danh mục Lỗ hổng & Đề xuất Bổ sung
Hiện tại chưa phát hiện lỗ hổng nghiêm trọng nào bị bỏ sót trong phạm vi 8 Business Rules đã được xác nhận. Mọi nhánh rẽ cơ bản của Happy Path, Negative và Boundary đều đã được ánh xạ ca kiểm thử đo lường được.

---

## 4. Human-Final Decision Scope
> Bàn giao QA Lead / PO thẩm định các khía cạnh kinh doanh chuyên sâu:
1. **Business Criticality**: Chức năng Đăng nhập là chốt chặn tiên quyết để vào giỏ hàng và thanh toán trên ShopGo.
2. **Actual Risk Sufficiency**: Bộ 18 test cases hiện tại đã bao phủ trọn vẹn rủi ro chức năng của phiên bản demo tĩnh.
3. **Cross-system Impact**: Chưa có backend/API thật, dữ liệu dựa trên `localStorage`.
4. **Exploratory Insights**: Khuyến nghị thực hiện exploratory test thêm trên các trình duyệt di động (iOS Safari / Android Chrome).

---

## 5. Kết luận Kiểm định
- **Review Verdict**: `PASS`
- **Lý do chi tiết**: Toàn bộ 18 test cases đã bao phủ 100% 8 Business Rules và 6 Viewpoints. Người phụ trách / QA Lead đã phê duyệt chấp nhận rủi ro và chính thức ra lệnh kích hoạt nhánh Automation & Jira Sync.

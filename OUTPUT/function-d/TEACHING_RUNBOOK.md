# Runbook giảng dạy tái lập · Function D

Mục tiêu: mọi máy chạy cùng artefact, Chromium và website ShopGo để ra cùng 4 kết quả dự kiến (3 PASS, 1 FAIL baseline hiện tại).

## 1. Chuẩn bị một lần

1. Mỗi máy dùng cùng revision repository, Node.js 20+ và browser Chromium đã được QA Leader chuẩn bị.
2. QA Leader tự kích hoạt dependencies/Playwright nội bộ khi học viên nói “chuẩn bị môi trường Function D”.
3. Kiểm tra URL `https://cwshopgo.github.io/` truy cập được.

## 2. Thứ tự dạy pipeline

1. Đặt DOCX và URL vào `INPUT/`; QA Leader chạy intake với slug `function-d`.
2. Tạo `OUTPUT/function-d/00_plan.md`; không chạy automation trước khi có rule/URL.
3. Chạy phân tích requirement, cập nhật BA clarification vào `knowledge/features/function-d.md`.
4. Dạy trace `BR → TC` trong `05_test_case_spec.md`.
5. Dạy POM ở `automation/pages/CheckoutVoucherPage.ts`: selector ID bền vững cho voucher, placeholder/role cho login.
6. Dạy runner ở `automation/tests/function-d_run-01.spec.ts`: mỗi test có screenshot `pass` hoặc `fail` trong Run Session.
7. Học viên nói: “Chạy RUN-01 Function D và trả evidence”; QA Leader tự thực thi suite nội bộ.
8. Mở `runs/RUN-01_function-d/run_result.md`, evidence và defect draft; không sửa Master Spec bằng kết quả run.

## 3. Điều kiện tái lập

- Account demo công khai của website được code hoá trong POM chỉ dùng cho môi trường demo; với staging thật, thay bằng secret/environment variable.
- Fixture là sản phẩm thứ hai giá 350.000 ₫ để luôn vượt min order 200.000 ₫.
- Nếu website đổi dữ liệu voucher hoặc UI, run có thể khác; cập nhật discovery/POM trước, không đổi expected business rule để ép PASS.

## 4. Điểm thảo luận trên lớp

- `VCHR-003` là ví dụ PASS/FAIL phải bám business oracle, không bám hành vi hiện hữu.
- Website hiện công bố `SALE20` giảm tối đa 100.000 ₫, trong khi BR-08 là 50.000 ₫: đây là case mở để học viên thêm vào batch tiếp theo.
- Muốn mở rộng bộ test: hoàn thiện các gap MR-01, MR-06 đến MR-10 trước rồi thêm Test Idea → Test Case → POM theo cùng trace.

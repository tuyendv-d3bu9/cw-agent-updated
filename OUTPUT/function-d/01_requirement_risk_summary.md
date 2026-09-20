# REQUIREMENT & RISK ANALYSIS REPORT · function-d

Owner: qa-analyst / requirement-risk-summary · Nguồn: `INPUT/function-d/02_ba/spec-function-d.md`; `INPUT/function-d/05_communication/h-thng-thng-mi-in-t-shopgo.md`; `knowledge/_project.md`; `knowledge/_glossary.md` · Verdict: **ASK**

**Dạng tài liệu nhận diện**: Prose Document (spec nghiệp vụ ngắn, có bối cảnh dự án bổ trợ)

## 1. FEATURE OVERVIEW

Function D cho phép khách hàng nhập và áp dụng voucher tại trang Thanh toán ShopGo. Voucher có thể giảm theo phần trăm hoặc số tiền cố định, với điều kiện giá trị đơn tối thiểu và thời hạn hiệu lực; khi thành công, hệ thống hiển thị tiền giảm và tổng đơn hàng mới.

## 2. ACTOR & USER ROLE

- **Khách hàng tại Việt Nam**: nhập mã giảm giá và yêu cầu hệ thống áp dụng vào tổng đơn hàng tại trang Thanh toán.
- **Hệ thống ShopGo**: kiểm tra mã, điều kiện giá trị đơn và thời hạn; cập nhật tiền giảm/tổng tiền hoặc hiển thị lỗi.
- **CSKH / Admin**: được tài liệu tổng quan nêu là đối tượng quản lý voucher ở back-office, nhưng quyền thao tác/quản trị voucher không thuộc phạm vi spec Function D này.

## 3. BUSINESS RULES

- **BR-01**: Tại trang Thanh toán có ô nhập “Mã giảm giá” và nút “Áp dụng”. Khi khách nhập mã rồi bấm Áp dụng, hệ thống kiểm tra mã và áp dụng phần giảm vào tổng đơn hàng. *(Nguồn: spec Function D, Vị trí/Hành động)*
- **BR-02**: Voucher có hai loại giảm giá: theo phần trăm (%) và theo số tiền cố định (VND). *(Nguồn: spec Function D, Các quy tắc đã nêu)*
- **BR-03**: Voucher chỉ được dùng khi đơn hàng đạt giá trị tối thiểu quy định của chính voucher đó. *(Nguồn: spec Function D, Các quy tắc đã nêu)*
- **BR-04**: Mỗi voucher có ngày hết hạn. *(Nguồn: spec Function D, Các quy tắc đã nêu)*
- **BR-05**: Áp dụng voucher thành công phải hiển thị số tiền được giảm và tổng tiền mới. *(Nguồn: spec Function D, Các quy tắc đã nêu)*
- **BR-06**: Voucher không hợp lệ hoặc hết hạn phải hiển thị thông báo lỗi. *(Nguồn: spec Function D, Các quy tắc đã nêu)*
- **BR-07**: Tiền tệ hiển thị/thanh toán là VNĐ, giao diện tiếng Việt, ứng dụng hỗ trợ desktop và mobile web. *(Nguồn: spec Function D, Bối cảnh chức năng)*
- **BR-08**: Trần giảm tối đa là 50.000 VNĐ; làm tròn số tiền giảm đến số VNĐ gần nhất. *(Nguồn: User clarification, 2026-09-20)*
- **BR-09**: Giá trị đơn tối thiểu để áp voucher là 200.000 VNĐ. *(Nguồn: User clarification, 2026-09-20)*
- **BR-10**: Mỗi đơn hàng chỉ dùng một voucher. *(Nguồn: User clarification, 2026-09-20)*
- **BR-11**: Phải đăng nhập để truy cập giỏ hàng, áp mã và mua hàng. *(Nguồn: User clarification, 2026-09-20)*
- **BR-12**: Voucher hết hiệu lực khi hết lượt dùng; mốc thời gian theo giờ Việt Nam; voucher hiện tại chưa hết lượt. *(Nguồn: User clarification, 2026-09-20)*
- **BR-13**: Thông điệp lỗi lấy từ website; website có ba mã cố định để kiểm thử. *(Nguồn: User clarification, 2026-09-20)*

## 4. HAPPY PATH

1. Khách hàng ở trang Thanh toán có tổng đơn hàng.
2. Khách nhập mã giảm giá vào ô “Mã giảm giá”.
3. Khách bấm “Áp dụng”.
4. Hệ thống kiểm tra mã, giá trị đơn tối thiểu và thời hạn của voucher.
5. Với voucher hợp lệ và đơn đủ điều kiện, hệ thống hiển thị tiền được giảm và tổng tiền mới.

## 5. ALTERNATE FLOWS

### AF-01: Voucher không hợp lệ

1. Khách nhập voucher không hợp lệ và bấm Áp dụng.
2. Hệ thống hiển thị thông báo lỗi.

### AF-02: Voucher hết hạn

1. Khách nhập voucher đã hết hạn và bấm Áp dụng.
2. Hệ thống hiển thị thông báo lỗi.

### AF-03: Giá trị đơn chưa đạt mức tối thiểu

1. Khách nhập voucher có quy định giá trị đơn tối thiểu nhưng đơn hàng chưa đạt điều kiện.
2. Hành vi/thông báo cụ thể chưa được tài liệu nêu; cần BA/PO xác nhận tại Q3.

## 6. OUT OF SCOPE

- Chi tiết back-office tạo, kích hoạt, thu hồi và quản trị voucher không thuộc phạm vi test chi tiết của tài liệu tổng quan ShopGo.
- Native mobile app, load test và chi tiết tích hợp ERP/kho nằm ngoài phạm vi tổng quan dự án.
- Các quy tắc voucher không được spec Function D đề cập (ví dụ: số lần dùng, cộng dồn nhiều mã, trần giảm, phạm vi sản phẩm/ship, định dạng mã) là **chưa xác định**, không được diễn giải là out-of-scope.

## 7. OPEN QUESTIONS

- **Q1 (W1)**: Định dạng/normalize voucher — **Trạng thái**: Treo; website sẽ là baseline kỹ thuật hiện tại, chưa có rule BA.
- **Q2 (W1)**: Thông điệp lỗi — **Trạng thái**: Đã xác nhận: lấy từ website, ba mã cố định (User clarification, 2026-09-20).
- **Q3 (W2)**: Đơn chưa đạt min order — **Trạng thái**: Đã xác nhận: min order 200.000 VNĐ; nội dung error lấy từ website.
- **Q4 (W2)**: Số/thay thế voucher — **Trạng thái**: Đã xác nhận: mỗi đơn dùng một voucher.
- **Q5 (W3)**: Trần/làm tròn — **Trạng thái**: Đã xác nhận: cap 50.000 VNĐ, rounding nearest VND.
- **Q6 (W3)**: Cơ sở tính min order/phạm vi hàng — **Trạng thái**: Treo.
- **Q7 (W4)**: Expiry/re-validation — **Trạng thái**: Đã xác nhận một phần: hết lượt, giờ Việt Nam, voucher hiện tại chưa hết; re-validation còn treo.
- **Q8 (W5)**: Auth/usage limit — **Trạng thái**: Đã xác nhận một phần: phải đăng nhập; usage limit cụ thể còn treo.
- **Q9 (W6)**: Side-effect/rollback — **Trạng thái**: Treo; website được quan sát làm baseline kỹ thuật.
- **Q10 (W5/W6)**: Voucher đổi/thu hồi giữa checkout — **Trạng thái**: Treo.

## 8. BUSINESS CRITICALITY ASSESSMENT

- **Trạng thái dữ liệu bối cảnh**: [CONTEXT_MISSING].
- **Bối cảnh nghiệp vụ ghi nhận**: ShopGo đặt mục tiêu giúp khách đặt hàng nhanh và hỗ trợ áp mã giảm giá; QA cần bảo đảm luồng mua hàng/thanh toán trước release. *(Nguồn: tài liệu tổng quan ShopGo §1)*
- [CONTEXT_MISSING] Không có dữ liệu về tỷ lệ đơn dùng voucher, doanh thu/rủi ro ngân sách khuyến mãi, mức thiệt hại chấp nhận được, hoặc mức ưu tiên release riêng cho Function D.

## 9. MISSING RISK CONTEXT INFORMATION

### 9.1 Chi tiết theo khía cạnh

- **Missing User Context**: Có actors Guest/Customer ở mức tổng quan, nhưng chưa biết actor nào thực sự được áp voucher và các hạn mức theo actor; ảnh hưởng: không thể xác định đầy đủ phân quyền/eligibility; **MED**.
- **Missing Usage Context**: Có web responsive desktop/mobile nhưng không có tần suất dùng voucher, thời điểm cao điểm hay concurrency; ảnh hưởng: không định lượng được nguy cơ tải/race condition; **MED**.
- **Missing Financial Context**: Có giao dịch VNĐ và quy tắc giảm giá, nhưng không có công thức, trần, ngân sách hoặc giá trị giao dịch; ảnh hưởng: không thể chấm chính xác Financial Impact; **HIGH**.
- **Missing Operational Context**: Không có SLA, nguồn dữ liệu voucher, hành vi timeout/retry hay quy trình rollback; ảnh hưởng: thiếu oracle cho lỗi dịch vụ và phục hồi; **MED**.
- **Missing Criticality Context**: Mục tiêu dự án cho thấy checkout quan trọng, nhưng chưa có mức business-criticality riêng của voucher; ảnh hưởng: Severity chỉ là sơ bộ; **MED**.

### 9.2 Tổng hợp

- **Available Context**: Web retail cho khách Việt Nam; checkout; VNĐ; desktop/mobile; hai loại voucher; min order; expiry; thông báo kết quả.
- **Missing Context**: Oracle tính toán, eligibility, lifecycle/thay thế voucher, time boundary, side-effects, thông điệp lỗi, usage/financial/operational metrics.
- **Risk Analysis Impact**: Ưu tiên xác minh các rule tiền tệ và tái kiểm tra tại checkout, nhưng mọi Severity dưới đây có độ tin cậy thấp đến khi BA/PO xác nhận.

## 10. RISK ANALYSIS & PRIORITIZATION

### 10.1 Nguồn đánh giá Risk

- **Business Rules**: 7 rule được trích xuất; logic áp dụng tác động trực tiếp vào tổng tiền tại checkout.
- **Gap Analysis**: Các khoảng trống tập trung ở oracle tính toán, eligibility, lifecycle voucher, timing và side-effects (Q1–Q10).
- **Business Criticality Assessment**: Voucher hỗ trợ mục tiêu đặt hàng/thanh toán linh hoạt, nhưng không có chỉ số criticality riêng.
- **Missing Risk Context Information**: Dữ liệu financial và operational còn thiếu làm giới hạn khả năng chấm severity chính xác.

### 10.2 Ma trận Đánh giá Rủi ro (3x3)

| Mã rủi ro | Likelihood | Impact | Risk Level | Severity | Cờ tin cậy | Lý do (5 yếu tố Impact) |
|:---|:---|:---|:---|:---|:---|:---|
| RK-01: Tính giảm giá/tổng tiền sai | MED | HIGH | HIGH | Major | [SEVERITY_CONFIDENCE_LOW] | Business/User: tổng hiển thị sai tại checkout; Revenue: có thể giảm sai; Operational/Usage Scale: chưa có số liệu. Công thức, trần và làm tròn chưa nêu. |
| RK-02: Voucher không đủ điều kiện vẫn được áp | MED | HIGH | HIGH | Major | [SEVERITY_CONFIDENCE_LOW] | Business/User: vi phạm điều kiện min order/expiry; Revenue: có thể thất thoát khuyến mãi; Operational/Usage Scale: chưa có số liệu. |
| RK-03: Voucher hợp lệ bị từ chối | MED | MED | MEDIUM | Major | [SEVERITY_CONFIDENCE_LOW] | User: checkout bị cản trở; Business/Revenue: có nguy cơ bỏ đơn; Operational/Usage Scale chưa có số liệu. |
| RK-04: Trạng thái voucher/tổng tiền không nhất quán khi thời điểm đơn thay đổi | MED | HIGH | HIGH | Major | [SEVERITY_CONFIDENCE_LOW] | Business/User: đơn có thể chốt với trạng thái không rõ; Revenue/Operational: cần re-validation nhưng chưa có rule; Usage Scale chưa có số liệu. |
| RK-05: UI responsive không hiển thị/nhận thao tác voucher đúng | MED | MED | MEDIUM | Minor | [SEVERITY_CONFIDENCE_LOW] | User: không thể dùng voucher trên một dạng web; Business/Revenue/Operational/Usage Scale chưa định lượng. |

### 10.3 Đánh giá tác động chiến lược

- **Impact to Risk Analysis**: Chưa thể chuyển các risk dựa trên công thức/eligibility thành test oracle đáng tin cậy khi Q1–Q10 chưa được chốt.
- **Impact to Test Prioritization**: Khi có rule, ưu tiên luồng hợp lệ, min order, expiry và tính toán tổng tiền trước; responsive kiểm tra sau theo thiết bị hỗ trợ.
- **Impact to Coverage Strategy**: Chỉ có thể chuẩn bị khung deep-testing/automation; chưa được sinh test case chi tiết hoặc assertion automation khi chưa có oracle.

## ASK

| # | Vị trí | Cần gì | Chuyển cho ai |
|---|---|---|---|
| 1 | Q1–Q10 | Xác nhận các quy tắc còn thiếu và expected behavior nêu trong từng câu hỏi. | BA/PO |
| 2 | Mode 4 Gate | Cung cấp account/test data/reset strategy nếu luồng checkout yêu cầu đăng nhập hoặc dữ liệu voucher xác định. | QA Lead / Dev / BA |

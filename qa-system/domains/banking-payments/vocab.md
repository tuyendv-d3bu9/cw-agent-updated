# Từ vựng ngành · banking-payments

> Gợi ý thuật ngữ, không phải định nghĩa của dự án. Skill chép sang `knowledge/_glossary.md` với nhãn `[DOMAIN]`,
> người dự án duyệt lại theo tài liệu thật (QA_STANDARD §10.3). Nghĩa trong tài liệu dự án luôn thắng.
> Nguồn `Unknown` = thuật ngữ chung của ngành, chưa có URL đã kiểm.

## 1. Vai trò (actor)
| Mục | Thuật ngữ | Nghĩa ngắn | Nguồn |
|---|---|---|---|
| customer | Customer | Khách hàng (chủ tài khoản / chủ thẻ) | Unknown |
| payer | Payer / Originator | Bên chuyển tiền đi | Unknown |
| payee | Payee / Beneficiary | Bên nhận tiền | Unknown |
| maker | Maker | Người khởi tạo giao dịch / thay đổi cần duyệt | Unknown |
| checker | Checker / Approver | Người duyệt giao dịch do maker tạo | Unknown |
| issuer | Issuer | Đơn vị phát hành thẻ / tài khoản | Unknown |
| acquirer-merchant | Acquirer / Merchant | Đơn vị thanh toán thẻ cho người bán / người bán nhận tiền | Unknown |
| compliance-officer | Compliance officer | Người xử lý cảnh báo AML/KYC | Unknown |

## 2. Thực thể
| Mục | Thuật ngữ | Nghĩa ngắn | Nguồn |
|---|---|---|---|
| account | Account | Tài khoản của khách hàng | Unknown |
| balance-available-ledger | Available balance / Ledger balance | Số dư khả dụng / số dư sổ cái | Unknown |
| transaction | Transaction | Một giao dịch ghi nợ / ghi có | Unknown |
| transfer | Transfer | Lệnh chuyển tiền nội bộ / liên ngân hàng | Unknown |
| payment-instruction | Payment instruction | Chỉ thị thanh toán gửi đi xử lý | Unknown |
| card-pan | Card / PAN | Thẻ và số thẻ chính (dữ liệu chủ thẻ, thuộc phạm vi PCI DSS) | https://www.pcisecuritystandards.org/standards/pci-dss/ |
| authorization-hold | Authorization hold | Khoản tạm giữ trước khi thanh toán chính thức | Unknown |
| settlement | Settlement | Quyết toán giữa các bên | Unknown |
| reconciliation | Reconciliation | Đối soát hai nguồn số liệu | Unknown |
| ledger-entry | Ledger entry | Bút toán sổ cái | Unknown |
| fee-charge | Fee / Charge | Phí giao dịch | Unknown |
| fx-rate | FX rate | Tỷ giá quy đổi ngoại tệ | Unknown |
| limit | Limit | Hạn mức giao dịch / ngày / thẻ | Unknown |
| beneficiary-list | Beneficiary list | Danh bạ người nhận đã lưu | Unknown |
| kyc-profile | KYC profile | Hồ sơ định danh khách hàng | Unknown |
| audit-log | Audit log | Nhật ký truy vết thao tác | Unknown |
| otp-challenge | OTP / Strong customer authentication | Xác thực bổ sung khi giao dịch | Unknown |

## 3. Trạng thái & vòng đời
| Mục | Thực thể | Các trạng thái (theo thứ tự) | Nguồn |
|---|---|---|---|
| transfer-lifecycle | Transfer | `<state-A: khởi tạo>` → `<state-B: chờ duyệt>` → `<state-C: đang xử lý>` → `<state-D: thành công / thất bại / đã hoàn>` (tập trạng thái do dự án khai) | Unknown |
| card-authorization-lifecycle | Card payment | `<authorized>` → `<captured>` → `<settled>`, nhánh `<reversed>` / `<refunded>` / `<chargeback>` | Unknown |
| account-lifecycle | Account | `<opened>` → `<active>` → `<restricted / frozen>` → `<closed>` | Unknown |
| kyc-lifecycle | KYC profile | `<submitted>` → `<under review>` → `<verified / rejected>` → `<expired>` | Unknown |

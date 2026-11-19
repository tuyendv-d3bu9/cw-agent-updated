# Từ vựng ngành · insurance

> Gợi ý thuật ngữ, không phải định nghĩa của dự án. Skill chép sang `knowledge/_glossary.md` với nhãn `[DOMAIN]`,
> người dự án duyệt lại theo tài liệu thật (QA_STANDARD §10.3). Nghĩa trong tài liệu dự án luôn thắng.
> Nguồn `Unknown` = thuật ngữ chung của ngành, chưa có URL đã kiểm.

## 1. Vai trò (actor)
| Mục | Thuật ngữ | Nghĩa ngắn | Nguồn |
|---|---|---|---|
| policyholder | Policyholder | Bên mua bảo hiểm (chủ hợp đồng) | Unknown |
| insured | Insured | Người được bảo hiểm | Unknown |
| beneficiary | Beneficiary | Người thụ hưởng quyền lợi | Unknown |
| agent-broker | Agent / Broker | Đại lý / môi giới bán bảo hiểm | Unknown |
| underwriter | Underwriter | Người thẩm định rủi ro, quyết định nhận bảo hiểm | Unknown |
| claims-adjuster | Claims adjuster | Người thẩm định hồ sơ bồi thường | Unknown |
| claimant | Claimant | Người yêu cầu bồi thường | Unknown |

## 2. Thực thể
| Mục | Thuật ngữ | Nghĩa ngắn | Nguồn |
|---|---|---|---|
| policy | Policy | Hợp đồng bảo hiểm | Unknown |
| product-plan | Product / Plan | Sản phẩm / gói bảo hiểm và các điều khoản | Unknown |
| quote | Quote | Báo giá phí bảo hiểm | Unknown |
| application | Application | Hồ sơ yêu cầu bảo hiểm | Unknown |
| premium | Premium | Phí bảo hiểm | Unknown |
| coverage-rider | Coverage / Rider | Phạm vi bảo hiểm / điều khoản bổ sung | Unknown |
| sum-insured | Sum insured | Số tiền bảo hiểm | Unknown |
| deductible-excess | Deductible / Excess | Mức miễn thường (phần người mua tự chịu) | Unknown |
| exclusion | Exclusion | Trường hợp loại trừ | Unknown |
| waiting-period | Waiting period | Thời gian chờ trước khi quyền lợi có hiệu lực | Unknown |
| grace-period | Grace period | Thời gian ân hạn đóng phí | Unknown |
| endorsement | Endorsement | Thay đổi nội dung hợp đồng đang hiệu lực | Unknown |
| claim | Claim | Yêu cầu bồi thường | Unknown |
| payout | Payout | Khoản chi trả bồi thường / quyền lợi | Unknown |
| surrender-value | Surrender value | Giá trị hoàn lại khi chấm dứt sớm (nếu sản phẩm có) | Unknown |
| underwriting-decision | Underwriting decision | Kết quả thẩm định: chấp nhận / loại trừ / từ chối | Unknown |

## 3. Trạng thái & vòng đời
| Mục | Thực thể | Các trạng thái (theo thứ tự) | Nguồn |
|---|---|---|---|
| policy-lifecycle | Policy | `<quoted>` → `<issued>` → `<in force>` → `<lapsed / cancelled / expired>`, nhánh `<reinstated>` / `<renewed>` (tập trạng thái do dự án khai) | Unknown |
| claim-lifecycle | Claim | `<submitted>` → `<under review>` → `<approved / rejected>` → `<paid>`, nhánh `<reopened>` / `<appealed>` | Unknown |
| application-lifecycle | Application | `<draft>` → `<submitted>` → `<underwriting>` → `<accepted / declined>` | Unknown |
| endorsement-lifecycle | Endorsement | `<requested>` → `<approved>` → `<effective>`, nhánh `<rejected>` | Unknown |

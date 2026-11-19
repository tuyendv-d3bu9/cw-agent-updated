# Từ vựng ngành · healthcare

> Gợi ý thuật ngữ, không phải định nghĩa của dự án. Skill chép sang `knowledge/_glossary.md` với nhãn `[DOMAIN]`,
> người dự án duyệt lại theo tài liệu thật (QA_STANDARD §10.3). Nghĩa trong tài liệu dự án luôn thắng.
> Tên thực thể theo từ vựng HL7 FHIR (https://www.hl7.org/fhir/overview.html). Thuật ngữ không kiểm được ghi `Unknown` ở cột Nguồn.

## 1. Vai trò (actor)
| Mục | Thuật ngữ | Nghĩa ngắn | Nguồn |
|---|---|---|---|
| patient | Patient (người bệnh) | Người nhận dịch vụ chăm sóc | https://www.hl7.org/fhir/overview.html |
| practitioner | Practitioner (nhân sự y tế) | Người cung cấp dịch vụ chăm sóc | https://www.hl7.org/fhir/overview.html |
| front-desk | Registrar (lễ tân, đăng ký) | Người đăng ký, đặt lịch | Unknown |
| billing-staff | Billing staff (nhân viên thanh toán) | Người lập và theo dõi claim | Unknown |
| payer | Payer (bên chi trả) | Bảo hiểm / đơn vị chi trả dịch vụ | Unknown |
| privacy-officer | Privacy officer / auditor (phụ trách quyền riêng tư) | Người soát nhật ký truy cập | Unknown |

## 2. Thực thể
| Mục | Thuật ngữ | Nghĩa ngắn | Nguồn |
|---|---|---|---|
| patient-record | Patient (hồ sơ hành chính) | Thông tin hành chính của người bệnh | https://www.hl7.org/fhir/overview.html |
| encounter | Encounter (lượt khám) | Một lần tiếp xúc giữa người bệnh và cơ sở y tế | https://www.hl7.org/fhir/encounter.html |
| observation | Observation (quan sát / kết quả) | Một phép đo hoặc nhận định | https://www.hl7.org/fhir/overview.html |
| claim | Claim (yêu cầu thanh toán) | Yêu cầu bồi hoàn gửi bên chi trả | https://www.hl7.org/fhir/claim.html |
| medication-request | MedicationRequest (chỉ định thuốc) | Chỉ định thuốc cho người bệnh | https://www.hl7.org/fhir/overview.html |
| appointment | Appointment (lịch hẹn) | Lịch hẹn giữa người bệnh và nhân sự | https://www.hl7.org/fhir/overview.html |
| consent | Consent (đồng ý) | Ghi nhận đồng ý / từ chối của người bệnh | https://www.hl7.org/fhir/overview.html |
| audit-event | AuditEvent (nhật ký truy cập) | Ghi ai truy cập dữ liệu nào, khi nào | https://www.hl7.org/fhir/overview.html |
| patient-identifier | Patient identifier / MRN (mã người bệnh) | Mã định danh người bệnh trong một cơ sở | Unknown |
| unit-of-measure | Unit of measure (đơn vị đo) | Đơn vị đi kèm giá trị đo / liều | Unknown |
| break-glass | Break-glass access (truy cập khẩn cấp) | Vượt quyền thường lệ nhưng có ghi vết | Unknown |
| amendment | Amendment (đính chính) | Sửa nội dung nhưng giữ lịch sử | Unknown |
| duplicate-record | Duplicate record (hồ sơ trùng) | Một người có nhiều hồ sơ | Unknown |
| merge-records | Merge (gộp hồ sơ) | Hợp nhất các hồ sơ trùng | Unknown |
| referral | Referral (chuyển tuyến / giới thiệu) | Chuyển người bệnh sang đơn vị khác | Unknown |
| discharge | Discharge (ra viện / kết thúc lượt khám) | Kết thúc một lượt khám | https://www.hl7.org/fhir/encounter.html |
| entered-in-error | Entered-in-error (nhập nhầm) | Bản ghi bị đánh dấu nhập sai | https://www.hl7.org/fhir/encounter.html |
| synthetic-data | Synthetic data (dữ liệu giả) | Dữ liệu thử không gắn với người thật | Unknown |

## 3. Trạng thái & vòng đời
| Mục | Thực thể | Các trạng thái (theo thứ tự) | Nguồn |
|---|---|---|---|
| encounter-status | Encounter | Mã FHIR, không có thứ tự cứng: `planned`, `in-progress`, `on-hold`, `discharged`, `completed`, `cancelled`, `discontinued`, `entered-in-error`, `unknown` | https://www.hl7.org/fhir/encounter.html |
| claim-status | Claim | Mã FHIR: `active`, `cancelled`, `draft`, `entered-in-error` | https://www.hl7.org/fhir/claim.html |
| observation-status | Observation | `registered` → `preliminary` → `final` → `amended` (mới thấy 4 mã đầu; đầy đủ: Unknown) | https://www.hl7.org/fhir/observation.html |
| appointment-lifecycle | Appointment | `<trạng thái A>` → `<trạng thái B>`: Unknown | Unknown |
| record-lifecycle | Patient record | `<hoạt động>` → `<đã gộp / ngưng dùng>`: Unknown | Unknown |

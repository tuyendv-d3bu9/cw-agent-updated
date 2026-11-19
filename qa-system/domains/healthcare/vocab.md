# Industry vocabulary · healthcare

> Term suggestions, not the project's definitions. Skills copy them to `knowledge/_glossary.md` with the `[DOMAIN]` label,
> and the project people review them against the real documents (QA_STANDARD §10.3). The meaning in the project's documents always wins.
> Entity names follow the HL7 FHIR vocabulary (https://www.hl7.org/fhir/overview.html). Terms that could not be verified record `Unknown` in the Source column.
> The Term column keeps the Vietnamese equivalent in brackets so the term can be spotted in Vietnamese documents.

## 1. Roles (actors)
| Key | Term | Short meaning | Source |
|---|---|---|---|
| patient | Patient (người bệnh) | The person receiving care | https://www.hl7.org/fhir/overview.html |
| practitioner | Practitioner (nhân sự y tế) | The person providing care | https://www.hl7.org/fhir/overview.html |
| front-desk | Registrar (lễ tân, đăng ký) | The person handling registration and scheduling | Unknown |
| billing-staff | Billing staff (nhân viên thanh toán) | The person preparing and tracking claims | Unknown |
| payer | Payer (bên chi trả) | The insurer / organisation paying for the services | Unknown |
| privacy-officer | Privacy officer / auditor (phụ trách quyền riêng tư) | The person reviewing the access logs | Unknown |

## 2. Entities
| Key | Term | Short meaning | Source |
|---|---|---|---|
| patient-record | Patient (hồ sơ hành chính) | The patient's administrative information | https://www.hl7.org/fhir/overview.html |
| encounter | Encounter (lượt khám) | One contact between the patient and the healthcare facility | https://www.hl7.org/fhir/encounter.html |
| observation | Observation (quan sát / kết quả) | A measurement or an assessment | https://www.hl7.org/fhir/overview.html |
| claim | Claim (yêu cầu thanh toán) | A reimbursement request sent to the payer | https://www.hl7.org/fhir/claim.html |
| medication-request | MedicationRequest (chỉ định thuốc) | A medication order for the patient | https://www.hl7.org/fhir/overview.html |
| appointment | Appointment (lịch hẹn) | An appointment between the patient and staff | https://www.hl7.org/fhir/overview.html |
| consent | Consent (đồng ý) | A record of the patient's consent / refusal | https://www.hl7.org/fhir/overview.html |
| audit-event | AuditEvent (nhật ký truy cập) | Records who accessed which data, and when | https://www.hl7.org/fhir/overview.html |
| patient-identifier | Patient identifier / MRN (mã người bệnh) | The patient's identifier within one facility | Unknown |
| unit-of-measure | Unit of measure (đơn vị đo) | The unit attached to a measured value / dose | Unknown |
| break-glass | Break-glass access (truy cập khẩn cấp) | Overriding the usual permissions, with a recorded trace | Unknown |
| amendment | Amendment (đính chính) | Changing content while keeping the history | Unknown |
| duplicate-record | Duplicate record (hồ sơ trùng) | One person with several records | Unknown |
| merge-records | Merge (gộp hồ sơ) | Combining duplicate records | Unknown |
| referral | Referral (chuyển tuyến / giới thiệu) | Transferring the patient to another unit | Unknown |
| discharge | Discharge (ra viện / kết thúc lượt khám) | Ending an encounter | https://www.hl7.org/fhir/encounter.html |
| entered-in-error | Entered-in-error (nhập nhầm) | A record marked as entered in error | https://www.hl7.org/fhir/encounter.html |
| synthetic-data | Synthetic data (dữ liệu giả) | Test data not linked to a real person | Unknown |

## 3. States & lifecycles
| Key | Entity | States (in order) | Source |
|---|---|---|---|
| encounter-status | Encounter | FHIR codes, no fixed order: `planned`, `in-progress`, `on-hold`, `discharged`, `completed`, `cancelled`, `discontinued`, `entered-in-error`, `unknown` | https://www.hl7.org/fhir/encounter.html |
| claim-status | Claim | FHIR codes: `active`, `cancelled`, `draft`, `entered-in-error` | https://www.hl7.org/fhir/claim.html |
| observation-status | Observation | `registered` → `preliminary` → `final` → `amended` (only the first 4 codes were seen; the full set: Unknown) | https://www.hl7.org/fhir/observation.html |
| appointment-lifecycle | Appointment | `<state A>` → `<state B>`: Unknown | Unknown |
| record-lifecycle | Patient record | `<active>` → `<merged / inactive>`: Unknown | Unknown |

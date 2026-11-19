# Industry vocabulary · healthcare

> Term suggestions, not the project's definitions. Skills copy them to `knowledge/_glossary.md` with the `[DOMAIN]` label,
> and the project people review them against the real documents (QA_STANDARD §10.3). The meaning in the project's documents always wins.
> Entity names follow the HL7 FHIR vocabulary (https://www.hl7.org/fhir/overview.html). Terms that could not be verified record `Unknown` in the Source column.
> The Term column keeps the Vietnamese equivalent in brackets so the term can be spotted in Vietnamese documents.
> Source column: a `Ref id` registered in `qa-system/domains/SOURCES.md` (its status — VERIFIED / PARTIAL — is recorded there), or `Unknown`.

## 1. Roles (actors)
| Key | Term | Short meaning | Source |
|---|---|---|---|
| patient | Patient (người bệnh) | The person receiving care | ref-fhir-overview |
| practitioner | Practitioner (nhân sự y tế) | The person providing care | ref-fhir-overview |
| front-desk | Registrar (lễ tân, đăng ký) | The person handling registration and scheduling | Unknown |
| billing-staff | Billing staff (nhân viên thanh toán) | The person preparing and tracking claims | Unknown |
| payer | Payer (bên chi trả) | The insurer / organisation paying for the services | Unknown |
| privacy-officer | Privacy officer / auditor (phụ trách quyền riêng tư) | The person reviewing the access logs | Unknown |
| proxy | Proxy / guardian / caregiver (người giám hộ, người được uỷ quyền) | A related person acting for the patient; FHIR Patient.link may point to a RelatedPerson | ref-fhir-patient |
| insurer | Insurer (công ty bảo hiểm) | Issuer of the patient's coverage (FHIR Coverage.insurer) | ref-fhir-coverage |

## 2. Entities
| Key | Term | Short meaning | Source |
|---|---|---|---|
| patient-record | Patient (hồ sơ hành chính) | The patient's administrative information | ref-fhir-overview |
| encounter | Encounter (lượt khám) | One contact between the patient and the healthcare facility | ref-fhir-encounter |
| observation | Observation (quan sát / kết quả) | A measurement or an assessment | ref-fhir-overview |
| claim | Claim (yêu cầu thanh toán) | A reimbursement request sent to the payer | ref-fhir-claim |
| medication-request | MedicationRequest (chỉ định thuốc) | A medication order for the patient | ref-fhir-overview |
| appointment | Appointment (lịch hẹn) | An appointment between the patient and staff | ref-fhir-overview |
| consent | Consent (đồng ý) | A record of the patient's consent / refusal | ref-fhir-overview |
| audit-event | AuditEvent (nhật ký truy cập) | Records who accessed which data, and when | ref-fhir-auditevent |
| patient-identifier | Patient identifier / MRN (mã người bệnh) | The patient's identifier within one facility | Unknown |
| unit-of-measure | Unit of measure (đơn vị đo) | The unit attached to a measured value / dose | Unknown |
| break-glass | Break-glass access (truy cập khẩn cấp) | Overriding the usual permissions, with a recorded trace | ref-fhir-security-labels |
| amendment | Amendment (đính chính) | Changing content while keeping the history | Unknown |
| duplicate-record | Duplicate record (hồ sơ trùng) | One person with several records | Unknown |
| merge-records | Merge (gộp hồ sơ) | Combining duplicate records | Unknown |
| referral | Referral (chuyển tuyến / giới thiệu) | Transferring the patient to another unit | Unknown |
| discharge | Discharge (ra viện / kết thúc lượt khám) | Ending an encounter | ref-fhir-encounter |
| entered-in-error | Entered-in-error (nhập nhầm) | A record marked as entered in error | ref-fhir-encounter |
| synthetic-data | Synthetic data (dữ liệu giả) | Test data not linked to a real person | Unknown |
| coverage | Coverage (quyền lợi chi trả) | Instrument that pays for care: kind `insurance`, `self-pay` or `other`, with a period and a beneficiary | ref-fhir-coverage |
| claim-response | ClaimResponse (kết quả xét duyệt) | The payer's adjudication of a claim, preauthorisation or predetermination | ref-fhir-claimresponse |
| preauthorization | Preauthorisation (phê duyệt trước) | Approval of proposed services; no payment at that time | ref-fhir-claimresponse |
| predetermination | Predetermination (ước tính quyền lợi) | What-if adjudication; no payment, and the later claim may differ | ref-fhir-claimresponse |
| security-label | Security label (nhãn bảo mật) | Handling metadata on a resource used by access control | ref-fhir-security-labels |
| purpose-of-use | Purpose of use (mục đích sử dụng) | Why data is requested; break-the-glass is one such purpose on the request | ref-fhir-security-labels |
| record-link | Record link (liên kết hồ sơ) | Link type between records of one person: `replaced-by`, `replaces`, `refer`, `seealso` | ref-fhir-link-type |
| clinical-alert | Clinical alert (cảnh báo lâm sàng) | A warning raised to the user before a potentially harmful action | Unknown |
| deidentified-data | De-identified data (dữ liệu đã khử định danh) | Data with identifying fields removed or generalised for secondary use | Unknown |

## 3. States & lifecycles
| Key | Entity | States (in order) | Source |
|---|---|---|---|
| encounter-status | Encounter | FHIR codes, no fixed order: `planned`, `in-progress`, `on-hold`, `discharged`, `completed`, `cancelled`, `discontinued`, `entered-in-error`, `unknown` | ref-fhir-encounter |
| claim-status | Claim | FHIR codes: `active`, `cancelled`, `draft`, `entered-in-error` | ref-fhir-claim |
| observation-status | Observation | FHIR codes: `registered` → `preliminary` → `final` → `amended`, plus `corrected`, `cancelled`, `entered-in-error`, `unknown` (8 codes) | ref-fhir-observation-status |
| appointment-lifecycle | Appointment | FHIR codes, no fixed order: `proposed`, `pending`, `booked`, `arrived`, `fulfilled`, `cancelled`, `noshow`, `entered-in-error`, `checked-in`, `waitlist` | ref-fhir-appointment |
| record-lifecycle | Patient record | `active` flag true / false; after a merge the old record is linked `replaced-by` the surviving one (process: project-defined) | ref-fhir-link-type |
| consent-status | Consent | FHIR codes: `draft`, `active`, `inactive`, `not-done`, `entered-in-error`, `unknown`; decision `permit` / `deny` | ref-fhir-consent |
| medication-request-status | MedicationRequest | FHIR codes: `active`, `on-hold`, `ended` (with `stopped`, `completed`, `cancelled`), `entered-in-error`, `draft`, `unknown` | ref-fhir-medicationrequest-status |
| coverage-status | Coverage | FHIR codes: `active`, `cancelled`, `draft`, `entered-in-error` | ref-fhir-coverage |
| claim-response-outcome | ClaimResponse | FHIR outcome codes: `queued`, `complete`, `error`, `partial` | ref-fhir-claimresponse |

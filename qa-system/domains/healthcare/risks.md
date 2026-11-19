# Industry risks · healthcare

> Checklist. Each row may only become: an `OQ` question (01) → `MR` (02), or a viewpoint candidate (03) once the project has a
> source code. It is not a feature `RK` risk (QA_STANDARD §10.3). Referencing a row: `[DOMAIN] healthcare/risks.md#<key>`.
> The characteristic column uses the exact names of ISO/IEC 25010:2023, checked at https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 (https://www.iso.org/standard/78176.html could not be opened).
> Compliance / traceability risks are filed under Security (Accountability, Non-repudiation, Integrity per the reference page).

| Key | Risk (one sentence) | ISO/IEC 25010:2023 characteristic | Signal that a feature touches it | Suggested closed question for the BA | Source |
|---|---|---|---|---|---|
| unauthorized-record-access | Someone without the right role can view the `<entity>` record | Security | Role assignment, record viewing screens | May `<role>` view the `<field>` of `<entity>`? | Unknown |
| access-audit-trail | Data access / edits leave no traceable record | Security | Logs, audit reports | Is every `<action>` on `<entity>` logged (who, when)? | Unknown |
| break-glass-abuse | Emergency access is abused or not reviewed | Security | Permission-override functions | Does emergency access require a reason to be entered, and is it reviewed afterwards? | Unknown |
| consent-not-enforced | The system ignores a patient refusing / withdrawing `<consent>` | Security | Data sharing, notifications | When `<consent>` is in `<state-A>`, is `<action>` blocked? | Unknown |
| phi-in-logs-or-exports | Identifying data exposed in logs, emails, exported files | Security | File exports, notifications, logs | Is `<field>` masked / removed from `<output>`? | Unknown |
| record-integrity-after-amend | An amendment loses the original or makes it untraceable | Security | Version history | Can the original of `<entity>` still be viewed after an amendment? | Unknown |
| data-retention-disposal | Data kept or deleted outside the required retention period | Security | Archiving, deletion, anonymisation | How long is `<entity>` kept and how is it handled when the period ends? | Unknown |
| wrong-patient-match | Patient records wrongly merged or wrongly split | Functional suitability | Registration, search, record merging | Are two records with the same `<field>` treated as one person? | Unknown |
| record-deletion-vs-amend | Deletion loses the history instead of amending it | Functional suitability | Delete / edit record buttons | Once `<entity>` is `<state-A>`, is it amended, deleted, or locked against edits? | Unknown |
| clinical-billing-state-drift | Clinical and billing statuses diverge | Functional suitability | Encounters with a claim | When `<entity>` moves to `<state-A>`, does the related claim change status? | https://www.hl7.org/fhir/claim.html |
| unit-conversion-error | Wrong unit or rounding of measured values | Functional suitability | Measured values, doses, manual entry | Which units does `<field>` accept, and is conversion automatic? | Unknown |
| timezone-misplacement | Encounter times shifted by time zone or date | Functional suitability | Appointment, visit, report dates and times | In which time zone is `<datetime>` stored, and in which is it displayed? | Unknown |
| duplicate-submission | Resubmitting a request creates a duplicate record | Reliability | Scheduling, claim submission, repeated clicks | Does resubmitting `<action>` create a second record? | Unknown |
| concurrent-edit-conflict | Two people edit the same record and the later one overwrites the earlier | Reliability | Concurrent editing | How is it handled when two people edit `<entity>` at the same time? | Unknown |
| downtime-continuity | Records cannot be accessed while the system is down | Reliability | Functions needed immediately during a visit | Is there a way to use `<function>` while the system is down? | Unknown |
| interface-message-loss | Messages with external systems are lost or duplicated | Compatibility | Lab and payer integrations | When `<system>` does not respond, which state is `<entity>` in? | Unknown |
| order-entry-error-protection | The UI makes it easy to mis-enter an important `<field>` | Interaction capability | Order forms, dose entry | Does the `<action>` operation have a confirmation step before saving? | https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 |

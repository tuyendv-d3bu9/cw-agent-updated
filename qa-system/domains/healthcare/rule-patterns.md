# Rule families that are often missing · healthcare

> A reminder list for the 06W matrix (QA_STANDARD §4). A rule family here is **not a rule**: if the documents lack it ⇒
> an `MR` question in 02, never a `BR` (QA_STANDARD §10.3). Use only neutral placeholders (`<field>`,
> `<state>`, `<threshold>`) — never concrete values, thresholds or message texts. Reference: `[DOMAIN] healthcare/rule-patterns.md#<key>`.

| Key | Rule family | 06W group | Template question (neutral) | Source |
|---|---|---|---|---|
| consent-capture-withdrawal | Recording and withdrawing consent | W2 | When `<consent>` is in `<state-A>`, may `<action>` be performed? | Unknown |
| record-amend-vs-delete | Amending differs from deleting | W6 | Is `<entity>` in `<state-A>` amended or deleted, and is the old trace kept? | Unknown |
| identity-matching | Criteria for treating records as the same person | W3 | Are two `<entity>` records with the same `<field>` one person or two? | Unknown |
| duplicate-merge-unmerge | Merging duplicate records and undoing a merge | W6 | Can a merge be undone, and where does the related data go? | Unknown |
| clinical-vs-billing-state | Reconciling clinical and billing statuses | W3 | When `<entity>` moves to `<state-A>`, which state must the related claim be in? | https://www.hl7.org/fhir/claim.html |
| unit-of-measure | Units of measure and conversion | W3 | Which `<unit>`s does `<field>` accept, and how are conversion and rounding done? | Unknown |
| encounter-timezone | Time zones and day boundaries of an encounter | W4 | In which time zone is `<datetime>` stored and displayed? | Unknown |
| role-based-access | Role-based access | W5 | May `<role>` `<action>` on the `<field>` of `<entity>`? | Unknown |
| break-glass-access | Controlled emergency access | W5 | Which reason does a permission override require, and who reviews it? | Unknown |
| audit-event-coverage | Scope of the access log | W6 | Which actions on `<entity>` must be logged? | Unknown |
| status-transition-reversal | Reversing or cancelling a state transition | W2 | Can `<state-B>` go back to `<state-A>`, and who may do it? | https://www.hl7.org/fhir/encounter.html |
| external-system-failure | Response when an external system fails | W5 | When `<system>` fails, which state does `<entity>` keep and how is it retried? | Unknown |
| data-retention-period | Retention and deletion periods | W6 | How long is `<entity>` kept, and what happens when the period ends? | Unknown |
| notification-content-privacy | Content of outgoing notifications | W6 | Which `<field>`s may appear in a notification sent to `<recipient>`? | Unknown |

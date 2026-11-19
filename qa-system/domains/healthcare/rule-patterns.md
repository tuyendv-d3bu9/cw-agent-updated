# Rule families that are often missing · healthcare

> A reminder list for the 06W matrix (QA_STANDARD §4). A rule family here is **not a rule**: if the documents lack it ⇒
> an `MR` question in 02, never a `BR` (QA_STANDARD §10.3). Use only neutral placeholders (`<field>`,
> `<state>`, `<threshold>`) — never concrete values, thresholds or message texts. Reference: `[DOMAIN] healthcare/rule-patterns.md#<key>`.
> Source column: a `Ref id` registered in `qa-system/domains/SOURCES.md` (its status — VERIFIED / PARTIAL — is recorded there), or `Unknown`.

| Key | Rule family | 06W group | Template question (neutral) | Source |
|---|---|---|---|---|
| consent-capture-withdrawal | Recording and withdrawing consent | W2 | When `<consent>` is in `<state-A>`, may `<action>` be performed? | ref-fhir-consent |
| record-amend-vs-delete | Amending differs from deleting | W6 | Is `<entity>` in `<state-A>` amended or deleted, and is the old trace kept? | Unknown |
| identity-matching | Criteria for treating records as the same person | W3 | Are two `<entity>` records with the same `<field>` one person or two? | Unknown |
| duplicate-merge-unmerge | Merging duplicate records and undoing a merge | W6 | Can a merge be undone, and where does the related data go? | ref-fhir-link-type |
| clinical-vs-billing-state | Reconciling clinical and billing statuses | W3 | When `<entity>` moves to `<state-A>`, which state must the related claim be in? | ref-fhir-claim |
| unit-of-measure | Units of measure and conversion | W3 | Which `<unit>`s does `<field>` accept, and how are conversion and rounding done? | Unknown |
| encounter-timezone | Time zones and day boundaries of an encounter | W4 | In which time zone is `<datetime>` stored and displayed? | Unknown |
| role-based-access | Role-based access | W5 | May `<role>` `<action>` on the `<field>` of `<entity>`? | ref-owasp-asvs-chapters (V8 Authorization) |
| break-glass-access | Controlled emergency access | W5 | Which reason does a permission override require, and who reviews it? | ref-fhir-security-labels |
| audit-event-coverage | Scope of the access log | W6 | Which actions on `<entity>` must be logged? | ref-fhir-auditevent-action |
| status-transition-reversal | Reversing or cancelling a state transition | W2 | Can `<state-B>` go back to `<state-A>`, and who may do it? | ref-fhir-encounter |
| external-system-failure | Response when an external system fails | W5 | When `<system>` fails, which state does `<entity>` keep and how is it retried? | Unknown |
| data-retention-period | Retention and deletion periods | W6 | How long is `<entity>` kept, and what happens when the period ends? | Unknown |
| notification-content-privacy | Content of outgoing notifications | W6 | Which `<field>`s may appear in a notification sent to `<recipient>`? | Unknown |
| appointment-slot-capacity | Slot capacity and release | W4 | How many `<appointment>`s may share a `<slot>`, and when are cancelled / no-show slots released? | ref-fhir-appointment |
| appointment-status-transition | Allowed appointment status transitions | W2 | From `<appointment-status-A>`, which statuses may follow, and by whom? | ref-fhir-appointment |
| result-correction-notice | Notifying corrected results | W6 | When `<observation>` is corrected or cancelled after `<final>`, who is notified and how? | ref-fhir-observation-status |
| result-release-timing | Who sees results, and when | W5 | Which `<role>`s see `<observation>` in `<preliminary>` and in `<final>`? | ref-fhir-observation-status |
| alert-override-reason | Overriding clinical alerts | W5 | Which `<role>` may override `<clinical-alert>`, is a reason required, and who reviews overrides? | ref-iso25010-summary (Safety) |
| medication-status-downstream | Effect of medication order status | W6 | When `<medication-request>` becomes `<on-hold>` / `<stopped>` / `<cancelled>`, which downstream `<action>`s stop? | ref-fhir-medicationrequest-status |
| merge-redirect | Redirecting data after a merge | W6 | After merge, where do new entries addressed to the `<replaced-by>` record go, and can the merge be undone? | ref-fhir-link-type |
| proxy-access-scope | Scope and end of proxy access | W5 | Which `<field>`s may `<proxy>` see, and which `<event>` ends the access? | Unknown |
| consent-scope-precedence | Scope and precedence of consents | W3 | When two `<consent>`s overlap, which one applies (latest, most restrictive, by `<purpose>`)? | ref-fhir-consent |
| audit-log-immutability | Protecting the access log | W6 | May any `<role>` change or delete `<audit-event>` entries, and are read actions logged? | ref-fhir-auditevent |
| coverage-check-timing | When coverage is checked | W4 | Is `<coverage>` checked at `<booking>`, `<check-in>` or `<claim>`, and what if it changes in between? | ref-fhir-coverage |
| preauthorization-gate | Prior approval before service | W2 | May `<service>` start while `<preauthorization>` is pending or refused? | ref-fhir-claimresponse |
| unmapped-code-handling | Codes with no mapping | W3 | When `<code>` has no mapping to `<code-system-B>`, is the message rejected, queued or passed through? | Unknown |

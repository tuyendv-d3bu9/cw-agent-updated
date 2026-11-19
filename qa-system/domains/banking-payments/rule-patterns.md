# Rule families that are often missing · banking-payments

> A reminder list for the 06W matrix (QA_STANDARD §4). A rule family here is **not a rule**: if the documents lack it ⇒
> an `MR` question in 02, never a `BR` (QA_STANDARD §10.3). Use only neutral placeholders (`<field>`,
> `<state>`, `<threshold>`) — never concrete values, thresholds or message texts.
> Source `Unknown` = general industry experience, no verified URL yet.
> Source column: a `Ref id` registered in `qa-system/domains/SOURCES.md` (its status — VERIFIED / PARTIAL — is recorded there), or `Unknown`.

| Key | Rule family | 06W group | Template question (neutral) | Source |
|---|---|---|---|---|
| state-transition-reversal | Reverse state transitions / cancellation / refund | W2 | From `<state A>`, may it move back to `<state B>` or be `<reverse>`d, and by whom? | Unknown |
| idempotency-duplicate | Preventing duplicate submission of an instruction | W2 | Are two identical instructions within `<time window>` treated as one or two? | Unknown |
| cut-off-time | Cut-off time, business days, time zones | W4 | When is an instruction sent after `<cut-off>` or on a holiday processed? | Unknown |
| rounding-precision | Rounding and precision of amounts | W3 | In which direction, to how many decimals, and at which step is `<amount>` rounded? | Unknown |
| limits-per-period | Limits per transaction / day / period | W1 | To whom does `<limit>` apply, over which `<period>` is it computed, and how is an excess handled? | Unknown |
| maker-checker | Separated create - approve roles | W5 | Which `<action>`s need an approver other than the creator, and at which `<threshold>` does multi-level approval apply? | Unknown |
| reconciliation | Reconciliation with partners / statements | W3 | By which procedure and deadline are reconciliation differences with `<partner>` handled? | ref-istqb-ctft (reconciliation across systems) |
| fee-and-fx | Fees and currency conversion | W3 | On what is `<fee>` computed, and at which moment is `<fx-rate>` taken? | Unknown |
| authentication-step-up | Risk-based additional authentication | W2 | When `<condition>` occurs, is additional authentication required, and what happens after `<n>` failures? | Unknown |
| status-visibility-timeout | Unknown status after a timeout | W4 | When there is no response after `<timeout>`, which status of `<transaction>` is shown to the user? | Unknown |
| data-masking-retention | Masking of sensitive data and retention periods | W6 | How is `<field>` masked / how long is it kept in each place (screen, log, export)? | ref-pci-dss |
| audit-trace | Operation traceability | W6 | What does the `<action>` operation record, and who may view the log? | ref-istqb-ctft (auditability, traceability) |
| aml-kyc-trigger | Conditions that trigger an AML/KYC check (local regulation) | W2 | Which conditions put `<transaction>` / `<customer>` under review, and what is the status while waiting? | Unknown |
| partial-refund | Partial / multiple refunds | W2 | Is the total of the refunds capped by the original `<amount>`, and is the fee refunded too? | Unknown |
| beneficiary-onboarding | Using a newly added payee | W2 | Is a new `<payee>` usable immediately, after `<cooling-period>`, or after extra authentication? | Unknown |
| authorization-capture | Authorisation hold vs captured amount | W3 | May `<capture>` differ from `<authorization-hold>`, by how much, and when does an uncaptured hold expire? | ref-bian-landscape-v12 (service domain Card Authorization) |
| dispute-lifecycle | Disputes and provisional credit | W2 | From which `<state>` can `<dispute>` be opened, and how is `<provisional-credit>` reversed? | Unknown |
| dispute-time-limits | Time limits inside the dispute process | W4 | Which `<deadline>`s apply to `<dispute>` (customer filing, `<counterparty>` response, evidence submission, review), from which event is each counted, and what happens when one is missed? | Unknown |
| downstream-side-effect-failure | Failure of a follow-up action after the main action succeeds | W6 | When `<main-action>` succeeds but `<follow-up-action>` (e.g. submission to `<external-scheme>`, `<card-block>`, `<notification>`) fails, is `<main-action>` kept, retried, compensated or rolled back, and who is told? | Unknown |
| account-status-restriction | Operations per account status | W2 | Which `<operation>`s are allowed for `<account>` in `<state-A>`? | Unknown |
| day-count-accrual | Day-count and accrual boundaries | W3 | Which `<day-count-convention>` applies, and is the boundary day included? | Unknown |
| non-business-day-scheduling | Scheduled payments on non-business days | W4 | When `<scheduled-date>` falls on a non-business day, is it moved earlier, later, or failed? | Unknown |
| fraud-hold-release | Releasing a fraud hold | W5 | Who may release `<transaction>` held for `<fraud-review>`, and when is the customer told? | ref-bian-landscape-v12 (service domain Fraud Resolution) |
| session-expiry-in-flow | Session expiry inside a multi-step flow | W4 | If the session ends between `<step-A>` and `<step-B>`, which state does `<transaction>` keep? | ref-owasp-asvs-chapters (V7 Session Management) |
| regulatory-reporting-feed | Feeding and correcting regulatory reports | W6 | Which `<transaction>`s feed `<regulatory-report>`, and how are later corrections re-reported? | ref-bian-landscape-v12 (service domain Regulatory Reporting) |
| recovery-in-flight | In-flight transactions after an outage | W6 | After `<outage>`, how are in-flight `<transaction>`s found and completed or reversed? | ref-iso25010-summary (Recoverability) |
| pending-vs-posted | Pending items in balance and history | W3 | Is a `<pending>` item counted in `<available-balance>` and shown in `<history>`? | Unknown |
| fx-quote-expiry | Validity of a quoted rate | W4 | How long is a quoted `<fx-rate>` honoured, and is the customer re-asked after `<expiry>`? | Unknown |

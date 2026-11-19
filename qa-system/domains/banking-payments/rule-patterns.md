# Rule families that are often missing · banking-payments

> A reminder list for the 06W matrix (QA_STANDARD §4). A rule family here is **not a rule**: if the documents lack it ⇒
> an `MR` question in 02, never a `BR` (QA_STANDARD §10.3). Use only neutral placeholders (`<field>`,
> `<state>`, `<threshold>`) — never concrete values, thresholds or message texts.
> Source `Unknown` = general industry experience, no verified URL yet.

| Key | Rule family | 06W group | Template question (neutral) | Source |
|---|---|---|---|---|
| state-transition-reversal | Reverse state transitions / cancellation / refund | W2 | From `<state A>`, may it move back to `<state B>` or be `<reverse>`d, and by whom? | Unknown |
| idempotency-duplicate | Preventing duplicate submission of an instruction | W2 | Are two identical instructions within `<time window>` treated as one or two? | Unknown |
| cut-off-time | Cut-off time, business days, time zones | W4 | When is an instruction sent after `<cut-off>` or on a holiday processed? | Unknown |
| rounding-precision | Rounding and precision of amounts | W3 | In which direction, to how many decimals, and at which step is `<amount>` rounded? | Unknown |
| limits-per-period | Limits per transaction / day / period | W1 | To whom does `<limit>` apply, over which `<period>` is it computed, and how is an excess handled? | Unknown |
| maker-checker | Separated create - approve roles | W5 | Which `<action>`s need an approver other than the creator, and at which `<threshold>` does multi-level approval apply? | Unknown |
| reconciliation | Reconciliation with partners / statements | W3 | By which procedure and deadline are reconciliation differences with `<partner>` handled? | Unknown |
| fee-and-fx | Fees and currency conversion | W3 | On what is `<fee>` computed, and at which moment is `<fx-rate>` taken? | Unknown |
| authentication-step-up | Risk-based additional authentication | W2 | When `<condition>` occurs, is additional authentication required, and what happens after `<n>` failures? | Unknown |
| status-visibility-timeout | Unknown status after a timeout | W4 | When there is no response after `<timeout>`, which status of `<transaction>` is shown to the user? | Unknown |
| data-masking-retention | Masking of sensitive data and retention periods | W6 | How is `<field>` masked / how long is it kept in each place (screen, log, export)? | https://www.pcisecuritystandards.org/standards/pci-dss/ |
| audit-trace | Operation traceability | W6 | What does the `<action>` operation record, and who may view the log? | Unknown |
| aml-kyc-trigger | Conditions that trigger an AML/KYC check (local regulation) | W2 | Which conditions put `<transaction>` / `<customer>` under review, and what is the status while waiting? | Unknown |
| partial-refund | Partial / multiple refunds | W2 | Is the total of the refunds capped by the original `<amount>`, and is the fee refunded too? | Unknown |

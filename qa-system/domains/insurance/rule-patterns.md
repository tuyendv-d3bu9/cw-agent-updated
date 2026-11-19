# Rule families that are often missing · insurance

> A reminder list for the 06W matrix (QA_STANDARD §4). A rule family here is **not a rule**: if the documents lack it ⇒
> an `MR` question in 02, never a `BR` (QA_STANDARD §10.3). Use only neutral placeholders (`<field>`,
> `<state>`, `<threshold>`) — never concrete values, thresholds or message texts.
> Source `Unknown` = general industry experience, no verified URL yet.
> Source column: a `Ref id` registered in `qa-system/domains/SOURCES.md` (its status — VERIFIED / PARTIAL — is recorded there), or `Unknown`.

| Key | Rule family | 06W group | Template question (neutral) | Source |
|---|---|---|---|---|
| policy-lifecycle-transition | Policy state transitions | W2 | From `<state A>`, when and by whom is `<policy>` moved to `<state B>`? | Unknown |
| endorsement-rules | Changes to an in-force policy | W2 | Which `<field>`s may be changed while `<policy>` is in force, is approval needed, and from which date does it take effect? | Unknown |
| premium-calculation-order | Order and formula of the premium calculation | W3 | In which order are the factors of `<premium>` applied, and at which step are tax / discounts applied? | Unknown |
| rounding-premium | Rounding of premiums and benefits | W3 | In which direction, to how many decimals, and at which step is `<amount>` rounded? | Unknown |
| pro-rata-refund | Refunding / charging the premium for the remaining time | W4 | Is the refund on mid-term cancellation computed by day or by month, and is any `<fee>` deducted? | Unknown |
| effective-expiry-boundary | Boundaries of the effective / expiry dates | W4 | In which time zone are the start / end times of `<policy>` computed, and does the boundary day belong to the coverage period? | Unknown |
| waiting-grace-period | Waiting periods and grace periods | W4 | From which point are `<waiting-period>` and `<grace-period>` counted, in calendar days or business days? | Unknown |
| renewal-lapse | Renewal, lapse, reinstatement | W2 | Which conditions move `<policy>` to lapse, and which steps does reinstatement need? | Unknown |
| claim-eligibility | Conditions for compensation | W3 | Which `<condition>`s must a claim meet, and is an `<exclusion>` applied in full or in part? | Unknown |
| claim-limits-deductible | Limits and deductibles | W1 | Do `<sum-insured>` and `<deductible>` apply per event or per period, and in which order are they deducted? | Unknown |
| claim-duplicate-detection | Detecting duplicate claims | W2 | By which criteria are two claims for the same `<event>` considered duplicates, and what is the state after detection? | Unknown |
| claim-reopen-appeal | Reopening / appealing a claim | W2 | May a `<paid>` or `<rejected>` claim be reopened, and within which time limit? | Unknown |
| underwriting-authority | Underwriting authority by risk level | W5 | Which `<action>`s need a higher-level underwriter when `<threshold>` is exceeded? | Unknown |
| beneficiary-change | Changing the beneficiary | W5 | Who may change `<beneficiary>`, whose confirmation is needed, and does it take effect after a claim has been submitted? | Unknown |
| notice-timing | Timing and channel of notices | W6 | After `<event>`, to which role, through which channel and when is the notice sent? | Unknown |
| quote-expiry-rerating | Quote validity and re-rating | W4 | When does `<quote>` expire, and is `<premium>` re-rated if `<rating-factor>` changes before bind? | Unknown |
| re-underwriting-trigger | Changes that trigger re-underwriting | W2 | Which changes to `<application>` after `<underwriting-decision>` send it back to underwriting? | Unknown |
| cooling-off | Cancellation in a cooling-off period | W4 | Does `<product>` have a `<cooling-off-period>`, counted from which event, and what is refunded inside it? | Unknown |
| reserve-update | Updating claim reserves | W6 | Which `<event>`s change `<reserve>`, and who approves the change? | Unknown |
| recovery-allocation | Allocating recoveries | W3 | Is a `<recovery>` netted against `<claim>` paid totals and limits, and in which order? | Unknown |
| fraud-referral-state | Claim state during fraud referral | W5 | Which `<role>` decides a referred `<claim>`, and which state does the claimant see meanwhile? | Unknown |
| party-role-mapping | Which party is used for which action | W5 | For `<action>` (consent, notice, payout), is `<policyholder>`, `<insured>` or `<beneficiary>` used? | Unknown |
| preauthorization-binding | Preauthorisation vs claim | W2 | Must `<claim>` match a prior `<preauthorization>`, and what happens when it does not? | ref-fhir-claimresponse |
| partial-approval-outcome | Partly approved claims | W6 | When `<claim>` is partly approved, how are unpaid lines communicated and can they be appealed? | ref-fhir-claimresponse |
| eligibility-date-basis | Date used for eligibility | W4 | Is cover checked on `<event-date>`, `<treatment-date>` or `<submission-date>`? | ref-fhir-coverage |
| aggregate-limit-concurrency | Shared limits under concurrent claims | W4 | How is `<aggregate-limit>` reserved when several `<claim>`s are approved at the same time? | Unknown |
| commission-reversal | Reversing commission | W6 | On `<cancel>` / `<lapse>` within `<period>`, is `<commission>` reversed, and how much? | Unknown |
| product-version-binding | Which product version applies | W3 | Does `<policy>` keep its issue-time `<product-version>` at `<renewal>` / `<endorsement>`? | Unknown |
| payout-account-verification | Verifying payout account changes | W5 | Who verifies a change of `<payout-account>`, and is a pending `<payout>` held until then? | Unknown |

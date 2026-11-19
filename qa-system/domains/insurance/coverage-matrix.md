# Coverage matrix · insurance

> Audit of the pack against the policy lifecycle of life / non-life / health insurance (2026-11-19). ACORD could not be read
> (ref-acord-ra: UNKNOWN), so capability names are generic; health-cover rows use FHIR Financial resources (VERIFIED).
> Key risks name rows of `risks.md` / `rule-patterns.md` (`[DOMAIN] insurance/<file>#<key>`). Neutral placeholders only.
> Gap status: `covered` = in the pack before this audit · `added now` · `open — needs domain expert`.

| Capability | Key risks | QA viewpoints (ISO 25010 characteristic) | Questions for stakeholders | Example test scenarios | Reference | Verification | Gap status |
|---|---|---|---|---|---|---|---|
| Quote and rating | premium-calculation, quote-validity-rebind | Functional Suitability (correctness) | In which order are factors of `<premium>` applied? Is it re-rated when a `<rating-factor>` changes? | Bind an expired quote; change a rating factor between quote and bind | Unknown | none | covered; quote validity added now |
| Application and underwriting | underwriting-bypass, application-answer-change, underwriting-authority | Functional Suitability, Security | Do answer changes after `<underwriting-decision>` re-trigger underwriting? | Issue with no decision; edit answers after acceptance | Unknown | none | covered; re-underwriting added now |
| Issue and policy documents | policy-document-consistency, product-version-applicability | Functional Suitability | Which `<product-version>` applies at `<renewal>`? Is `<policy-schedule>` regenerated? | Renew a policy after the product changed; endorse and compare the document | Unknown | none | added now |
| Parties and roles | party-role-consistency, beneficiary-change | Functional Suitability, Security | When `<policyholder>` differs from `<insured>`, whose consent applies? | Insured is a minor; change beneficiary after a claim | Unknown | none | covered (beneficiary); party roles added now |
| Endorsements and mid-term changes | pro-rata-adjustment, endorsement-rules, re-underwriting-trigger | Functional Suitability | Which `<field>`s may change in force, from which date? | Mid-term change on the boundary day | Unknown | none | covered |
| Premium collection, grace, lapse, reinstatement | payment-collection-failure, lapse-reinstatement | Reliability | Which state follows failed collection after `<grace-period>`? | Collection fails on the last grace day; reinstate after lapse | Unknown | none | covered |
| Cancellation and cooling-off | cooling-off-cancellation, pro-rata-refund | Functional Suitability | Does `<product>` have a `<cooling-off-period>` (local regulation)? | Cancel inside and just after the period | Unknown | none | added now (rule content: open) |
| Renewal | renewal-auto-process, batch-renewal-load | Functional Suitability, Performance Efficiency | How far in advance is renewal notice sent? | Renewal batch fails midway | Unknown | none | covered |
| Claim intake and eligibility | coverage-eligibility, coverage-period-status, effective-date-boundary, document-evidence-handling | Functional Suitability | Is eligibility checked on `<event-date>` or `<submission-date>`? | Event on the effective date; cover cancelled between event and submission | ref-fhir-coverage | VERIFIED | covered; date basis added now |
| Preauthorisation (health cover) | preauthorization-vs-claim, preauthorization-binding | Functional Suitability | Is a `<preauthorization>` binding on the later `<claim>`? | Claim differs from the preauthorised service | ref-fhir-claimresponse | VERIFIED | added now |
| Claim assessment, limits and payout | payout-consistency, claim-limits-deductible, partial-adjudication, aggregate-limit-tracking | Functional Suitability, Reliability | Do limits apply per event or per period? What does the claimant see for partly approved lines? | Two claims approved together against one `<aggregate-limit>`; partly approved claim | ref-fhir-claimresponse | VERIFIED | covered; partial and aggregate added now |
| Reserves and recoveries | claim-reserve-adjustment, recovery-subrogation | Reliability, Functional Suitability | Who updates `<reserve>`? Are `<recovery>` amounts netted against limits? | Estimate changes after partial payment; salvage recorded after payout | Unknown | none | added now |
| Claim fraud and duplicates | claim-duplicate, claim-fraud-referral, payout-account-change | Security, Reliability | Which `<indicator>`s refer `<claim>`? Is a pending `<payout>` held after a `<payout-account>` change? | Same event claimed on two policies; payout account changed before payment | Unknown | none | covered (duplicate); fraud and payout account added now |
| Reopen and appeal | claim-reopen-appeal | Functional Suitability | May a `<paid>` / `<rejected>` claim be reopened, within which limit? | Appeal after the limit | Unknown | none | covered |
| Distribution and commission | commission-clawback, role-based-access | Functional Suitability, Security | Is `<commission>` reversed on early `<cancel>`? | Cancel inside `<period>` after commission paid | ref-owasp-asvs-chapters | PARTIAL | covered (access); commission added now |
| Data protection and audit | sensitive-data-exposure, audit-of-decisions | Security (Confidentiality, Accountability) | Which roles see sensitive `<field>`? Who may override a decision? | Agent opens a medical attachment of another agent's policy | ref-owasp-asvs-chapters | PARTIAL | covered |
| Reinsurance, actuarial reserving, solvency reporting | (outside pack scope) | — | Does the project feed `<reinsurance>` or `<regulatory-report>`? | Unknown | Unknown | none | open — needs domain expert |
| Product-line specifics (life benefits, motor, property catastrophe) | (no pack row) | — | Which `<line-of-business>` is in scope? | Unknown | Unknown | none | open — needs domain expert |

## Validation note (2026-11-19)

Agent-level validation on synthetic features (outside the repo) showed analysts missing failures of follow-up
actions after a successful main action, time limits inside multi-party processes, and re-checks when parties are
added. The rule patterns `downstream-side-effect-failure` / `side-effect-failure-compensation`, `dispute-time-limits`
and the widened `re-underwriting-trigger` were added or extended for that reason. They are questions only; their
Source stays `Unknown` until a verified reference or domain-expert review exists.

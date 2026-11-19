# Industry vocabulary · insurance

> Term suggestions, not the project's definitions. Skills copy them to `knowledge/_glossary.md` with the `[DOMAIN]` label,
> and the project people review them against the real documents (QA_STANDARD §10.3). The meaning in the project's documents always wins.
> Source `Unknown` = general industry term, no verified URL yet.
> Source column: a `Ref id` registered in `qa-system/domains/SOURCES.md` (its status — VERIFIED / PARTIAL — is recorded there), or `Unknown`.

## 1. Roles (actors)
| Key | Term | Short meaning | Source |
|---|---|---|---|
| policyholder | Policyholder | The party buying the insurance (owner of the policy) | Unknown |
| insured | Insured | The person covered by the insurance | Unknown |
| beneficiary | Beneficiary | The person receiving the benefits | Unknown |
| agent-broker | Agent / Broker | The agent / broker selling the insurance | Unknown |
| underwriter | Underwriter | The person assessing the risk and deciding whether to accept it | Unknown |
| claims-adjuster | Claims adjuster | The person assessing claim files | Unknown |
| claimant | Claimant | The person requesting compensation | Unknown |
| premium-payer | Premium payer | The party who pays the premium when it is not the policyholder | Unknown |
| claims-investigator | Claims investigator | Handles claims referred for suspected fraud | Unknown |
| insurer | Insurer | The organisation issuing the policy; FHIR Coverage names it `insurer` for health cover | ref-fhir-coverage |

## 2. Entities
| Key | Term | Short meaning | Source |
|---|---|---|---|
| policy | Policy | The insurance contract | Unknown |
| product-plan | Product / Plan | The insurance product / plan and its terms | Unknown |
| quote | Quote | A premium quote | Unknown |
| application | Application | The insurance application file | Unknown |
| premium | Premium | The insurance premium | Unknown |
| coverage-rider | Coverage / Rider | The scope of cover / additional clauses | Unknown |
| sum-insured | Sum insured | The insured amount | Unknown |
| deductible-excess | Deductible / Excess | The deductible (the part borne by the buyer) | Unknown |
| exclusion | Exclusion | An excluded case | Unknown |
| waiting-period | Waiting period | The waiting time before benefits take effect | Unknown |
| grace-period | Grace period | The grace period for paying the premium | Unknown |
| endorsement | Endorsement | A change to the content of an in-force policy | Unknown |
| claim | Claim | A request for compensation | Unknown |
| payout | Payout | A compensation / benefit payment | Unknown |
| surrender-value | Surrender value | The value refunded on early termination (if the product has one) | Unknown |
| underwriting-decision | Underwriting decision | The underwriting result: accept / exclude / decline | Unknown |
| rating-factor | Rating factor | An input to the premium calculation (subject, cover, history…) | Unknown |
| policy-schedule | Policy schedule / certificate | The document that states the issued terms of a policy | Unknown |
| product-version | Product version | The version of the product terms a policy was issued under | Unknown |
| cooling-off-period | Cooling-off / free-look period | A period after issue in which the buyer may cancel on special terms (whether it exists: local regulation, Unknown) | Unknown |
| reserve | Claim reserve / estimate | The amount set aside for an open claim | Unknown |
| recovery-subrogation | Recovery / subrogation / salvage | Money recovered from third parties or salvage after a claim is paid | Unknown |
| aggregate-limit | Aggregate limit | A limit shared by all claims in a period (vs per-event limit) | Unknown |
| commission | Commission | The agent / broker remuneration linked to a policy | Unknown |
| preauthorization | Preauthorisation | Insurer adjudication of proposed future services; approves them but pays nothing yet | ref-fhir-claimresponse |
| predetermination | Predetermination | A what-if adjudication reporting the benefit that would be payable; no payment, the later claim may differ | ref-fhir-claimresponse |
| coverage | Coverage (health) | Instrument that pays for health care (insurance, self-pay or other), with a period and a beneficiary | ref-fhir-coverage |
| payout-account | Payout account | The bank details a payout is sent to | Unknown |

## 3. States & lifecycles
| Key | Entity | States (in order) | Source |
|---|---|---|---|
| policy-lifecycle | Policy | `<quoted>` → `<issued>` → `<in force>` → `<lapsed / cancelled / expired>`, branches `<reinstated>` / `<renewed>` (the state set is declared by the project) | Unknown |
| claim-lifecycle | Claim | `<submitted>` → `<under review>` → `<approved / rejected>` → `<paid>`, branches `<reopened>` / `<appealed>` | Unknown |
| application-lifecycle | Application | `<draft>` → `<submitted>` → `<underwriting>` → `<accepted / declined>` | Unknown |
| endorsement-lifecycle | Endorsement | `<requested>` → `<approved>` → `<effective>`, branch `<rejected>` | Unknown |
| quote-lifecycle | Quote | `<draft>` → `<quoted>` → `<bound / expired / declined>` (state set declared by the project) | Unknown |
| claim-response-outcome | Claim adjudication (FHIR ClaimResponse) | `outcome` codes: `queued`, `complete`, `error`, `partial` — not an ordered lifecycle | ref-fhir-claimresponse |
| coverage-status | Coverage (FHIR) | `status` codes: `active`, `cancelled`, `draft`, `entered-in-error` | ref-fhir-coverage |

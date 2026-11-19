# Industry vocabulary · banking-payments

> Term suggestions, not the project's definitions. Skills copy them to `knowledge/_glossary.md` with the `[DOMAIN]` label,
> and the project people review them against the real documents (QA_STANDARD §10.3). The meaning in the project's documents always wins.
> Source `Unknown` = general industry term, no verified URL yet.
> Source column: a `Ref id` registered in `qa-system/domains/SOURCES.md` (its status — VERIFIED / PARTIAL — is recorded there), or `Unknown`.

## 1. Roles (actors)
| Key | Term | Short meaning | Source |
|---|---|---|---|
| customer | Customer | The customer (account holder / cardholder) | Unknown |
| payer | Payer / Originator | The party sending the money | Unknown |
| payee | Payee / Beneficiary | The party receiving the money | Unknown |
| maker | Maker | The person who initiates a transaction / change that needs approval | Unknown |
| checker | Checker / Approver | The person who approves a transaction created by the maker | Unknown |
| issuer | Issuer | The entity issuing the card / account | Unknown |
| acquirer-merchant | Acquirer / Merchant | The entity processing card payments for the seller / the seller receiving the money | Unknown |
| compliance-officer | Compliance officer | The person handling AML/KYC alerts | Unknown |
| fraud-analyst | Fraud analyst | Reviews transactions held by fraud detection and releases or rejects them | ref-bian-landscape-v12 (service domain Fraud Resolution) |
| dispute-handler | Dispute / chargeback handler | Handles customer disputes and card-scheme chargebacks | Unknown |

## 2. Entities
| Key | Term | Short meaning | Source |
|---|---|---|---|
| account | Account | The customer's account | Unknown |
| balance-available-ledger | Available balance / Ledger balance | Available balance / ledger balance | Unknown |
| transaction | Transaction | One debit / credit transaction | Unknown |
| transfer | Transfer | An internal / interbank money transfer instruction | Unknown |
| payment-instruction | Payment instruction | A payment instruction sent for processing | Unknown |
| card-pan | Card / PAN | The card and its primary account number (cardholder data, within PCI DSS scope) | ref-pci-dss |
| authorization-hold | Authorization hold | An amount held before the payment is finalised | Unknown |
| settlement | Settlement | Final settlement between the parties | Unknown |
| reconciliation | Reconciliation | Matching two sources of figures | Unknown |
| ledger-entry | Ledger entry | A general ledger posting | Unknown |
| fee-charge | Fee / Charge | A transaction fee | Unknown |
| fx-rate | FX rate | The currency conversion rate | Unknown |
| limit | Limit | A per-transaction / daily / card limit | Unknown |
| beneficiary-list | Beneficiary list | The saved list of payees | Unknown |
| kyc-profile | KYC profile | The customer identification record | Unknown |
| audit-log | Audit log | The operation trace log | Unknown |
| otp-challenge | OTP / Strong customer authentication | Additional authentication during a transaction | Unknown |
| cardholder-data | Cardholder data (CHD) | Payment card account data protected by PCI DSS | ref-pci-dss |
| sensitive-authentication-data | Sensitive authentication data (SAD) | A second category of card data named by PCI DSS; the requirements on it were not read | ref-pci-dss |
| cardholder-data-environment | Cardholder data environment (CDE) | The systems that store, process or transmit CHD / SAD, or can affect their security | ref-pci-dss |
| service-domain | Service domain (BIAN) | The finest level of the BIAN landscape (business area → business domain → service domain) | ref-bian-landscape-v12 |
| payment-order | Payment order / payment execution | BIAN service-domain names for capturing and executing a payment | ref-bian-landscape-v12 |
| current-account | Current account / savings account | BIAN service domains under the Loans and Deposits business domain | ref-bian-landscape-v12 |
| dispute-chargeback | Dispute / chargeback | A customer challenge of a transaction, possibly reversed through the card scheme | Unknown |
| provisional-credit | Provisional credit | Temporary credit given while a dispute is investigated | Unknown |
| standing-order | Standing order / scheduled payment | A payment executed automatically on a future or recurring date | Unknown |
| dormant-account | Dormant account | An account restricted after a period without customer activity (rule: local regulation, Unknown) | Unknown |
| day-count-convention | Day-count convention | The rule for counting days when accruing interest or periodic fees | Unknown |
| regulatory-report | Regulatory report | A report sent to a supervisor; BIAN names Regulatory Reporting and Regulatory Compliance service domains | ref-bian-landscape-v12 |

## 3. States & lifecycles
| Key | Entity | States (in order) | Source |
|---|---|---|---|
| transfer-lifecycle | Transfer | `<state-A: initiated>` → `<state-B: awaiting approval>` → `<state-C: processing>` → `<state-D: succeeded / failed / reversed>` (the state set is declared by the project) | Unknown |
| card-authorization-lifecycle | Card payment | `<authorized>` → `<captured>` → `<settled>`, branches `<reversed>` / `<refunded>` / `<chargeback>` | Unknown |
| account-lifecycle | Account | `<opened>` → `<active>` → `<restricted / frozen>` → `<closed>` | Unknown |
| kyc-lifecycle | KYC profile | `<submitted>` → `<under review>` → `<verified / rejected>` → `<expired>` | Unknown |
| dispute-lifecycle | Dispute | `<opened>` → `<under investigation>` → `<won / lost / withdrawn>` (state set declared by the project) | Unknown |
| scheduled-payment-lifecycle | Standing order | `<scheduled>` → `<executed / skipped / failed>` → `<cancelled>` | Unknown |
| fraud-hold-lifecycle | Held transaction | `<held for review>` → `<released / rejected>` | Unknown |

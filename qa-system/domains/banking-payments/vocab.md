# Industry vocabulary · banking-payments

> Term suggestions, not the project's definitions. Skills copy them to `knowledge/_glossary.md` with the `[DOMAIN]` label,
> and the project people review them against the real documents (QA_STANDARD §10.3). The meaning in the project's documents always wins.
> Source `Unknown` = general industry term, no verified URL yet.

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

## 2. Entities
| Key | Term | Short meaning | Source |
|---|---|---|---|
| account | Account | The customer's account | Unknown |
| balance-available-ledger | Available balance / Ledger balance | Available balance / ledger balance | Unknown |
| transaction | Transaction | One debit / credit transaction | Unknown |
| transfer | Transfer | An internal / interbank money transfer instruction | Unknown |
| payment-instruction | Payment instruction | A payment instruction sent for processing | Unknown |
| card-pan | Card / PAN | The card and its primary account number (cardholder data, within PCI DSS scope) | https://www.pcisecuritystandards.org/standards/pci-dss/ |
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

## 3. States & lifecycles
| Key | Entity | States (in order) | Source |
|---|---|---|---|
| transfer-lifecycle | Transfer | `<state-A: initiated>` → `<state-B: awaiting approval>` → `<state-C: processing>` → `<state-D: succeeded / failed / reversed>` (the state set is declared by the project) | Unknown |
| card-authorization-lifecycle | Card payment | `<authorized>` → `<captured>` → `<settled>`, branches `<reversed>` / `<refunded>` / `<chargeback>` | Unknown |
| account-lifecycle | Account | `<opened>` → `<active>` → `<restricted / frozen>` → `<closed>` | Unknown |
| kyc-lifecycle | KYC profile | `<submitted>` → `<under review>` → `<verified / rejected>` → `<expired>` | Unknown |

# Rule families that are often missing · ecommerce-retail

> A reminder list for the 06W matrix (QA_STANDARD §4). A rule family here is **not a rule**: if the documents lack it ⇒
> an `MR` question in 02, never a `BR` (QA_STANDARD §10.3). Use only neutral placeholders (`<field>`,
> `<state>`, `<threshold>`) — never concrete values, thresholds or message texts. Reference: `[DOMAIN] ecommerce-retail/rule-patterns.md#<key>`.
> Source column: a `Ref id` registered in `qa-system/domains/SOURCES.md` (its status — VERIFIED / PARTIAL — is recorded there), or `Unknown`.

| Key | Rule family | 06W group | Template question (neutral) | Source |
|---|---|---|---|---|
| promotion-stacking | Promotion stacking and the order of application | W3 | Do `<promotion-A>` and `<promotion-B>` stack, and in which order are they applied? | Unknown |
| discount-scope | Discount scope: goods amount or shipping fee | W3 | Does `<promotion>` discount `<subtotal>`, `<shipping-fee>`, or both? | Unknown |
| guest-vs-member | Benefits by customer type | W5 | May an `<actor>` who is not logged in `<action>`? | Unknown |
| benefit-restore-on-cancel | Restoring benefits on cancellation / return | W6 | When an `<order>` is cancelled in `<state-A>`, is `<benefit>` restored, and when? | Unknown |
| cart-line-validation | Validation of line items and quantities | W1 | How is a quantity `<field>` outside `<threshold>` handled? | Unknown |
| price-and-tax-rounding | Rounding of prices and tax | W3 | Is `<amount>` rounded per line or on the total, and by which rule? | Unknown |
| price-revalidation | Re-checking prices / promotions at commit time | W4 | How does the cart handle a `<promotion>` that expires midway? | Unknown |
| inventory-reservation | Inventory reservation and release | W4 | How long is `<reservation>` held and in which situations is it released? | Unknown |
| concurrent-purchase | Simultaneous purchases when stock is nearly gone | W4 | When two `<actor>`s buy the last `<sku>` at the same time, who gets it? | Unknown |
| order-state-transition | Valid / reversed order state transitions | W2 | Can `<state-B>` go back to `<state-A>`, and who can do it? | Unknown |
| payment-fulfilment-coupling | Link between payment status and delivery | W2 | May an `<order>` be delivered when `<payment>` is in `<state-A>`? | Unknown |
| partial-fulfilment-refund | Partial delivery, partial refund | W6 | When only part of an `<order>` is delivered / returned, how is the refunded `<amount>` computed? | Unknown |
| duplicate-request-handling | Handling of resubmitted requests | W2 | Does resubmitting `<action>` on `<state-A>` create a new record? | Unknown |
| external-provider-failure | Response when the payment / shipping gateway fails | W5 | When `<provider>` fails, which state does `<order>` keep and how is it retried? | Unknown |
| product-variant-identity | One identifier per sellable variant | W3 | Does each `<variant>` have its own `<product-id>`, and is a withdrawn `<product-id>` ever reassigned? | ref-gs1us-gtin |
| server-side-recalculation | Amounts recomputed on the server | W1 | Is `<amount>` recalculated from `<sku>` and `<promotion>` on the server, rejecting a client-sent `<price>`? | ref-owasp-asvs-chapters (V2 Validation and Business Logic) |
| stored-value-restore | Spending and restoring stored value | W6 | When `<stored-value>` was used and `<order>` is cancelled in `<state-A>`, is the balance restored, and to which instrument? | Unknown |
| order-amendment | Changing an order after placement | W2 | Which `<field>`s of `<order>` may change in `<state-A>`, and is `<amount>` re-priced? | Unknown |
| delivery-eligibility | Carrier / zone / item restrictions | W5 | Which `<sku>` / `<address>` combinations can `<carrier>` not serve, and at which step is the customer told? | Unknown |
| per-customer-limit | Purchase limits per customer | W5 | Is `<purchase-limit>` counted per `<account>`, per `<payment-instrument>` or per `<address>`? | Unknown |
| backorder-preorder | Ordering items without stock | W4 | May `<sku>` with no stock be ordered as `<backorder>` / `<pre-order>`, and when is payment taken? | Unknown |
| re-authentication | Re-authentication for sensitive actions | W2 | Which `<action>`s require re-authentication inside an active session? | ref-owasp-asvs-chapters (V6 Authentication, V7 Session Management) |
| fraud-hold | Holding orders for fraud review | W5 | Who releases `<order>` held by `<fraud-check>`, and what does the customer see meanwhile? | Unknown |
| settlement-reconciliation | Reconciling orders with provider settlement | W3 | How are differences between `<order>` totals and `<provider>` settlement detected and resolved? | Unknown |
| notification-trigger | Which events notify whom | W6 | After `<event>`, which `<notification>` is sent, to whom, and with which `<field>`s? | Unknown |

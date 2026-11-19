# Rule families that are often missing · ecommerce-retail

> A reminder list for the 06W matrix (QA_STANDARD §4). A rule family here is **not a rule**: if the documents lack it ⇒
> an `MR` question in 02, never a `BR` (QA_STANDARD §10.3). Use only neutral placeholders (`<field>`,
> `<state>`, `<threshold>`) — never concrete values, thresholds or message texts. Reference: `[DOMAIN] ecommerce-retail/rule-patterns.md#<key>`.

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

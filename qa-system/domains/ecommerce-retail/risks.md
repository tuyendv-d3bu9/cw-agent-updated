# Industry risks · ecommerce-retail

> Checklist. Each row may only become: an `OQ` question (01) → `MR` (02), or a viewpoint candidate (03) once the project has a
> source code. It is not a feature `RK` risk (QA_STANDARD §10.3). Referencing a row: `[DOMAIN] ecommerce-retail/risks.md#<key>`.
> The characteristic column uses the exact names of ISO/IEC 25010:2023, checked at https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 (https://www.iso.org/standard/78176.html could not be opened).
> Compliance / traceability risks are filed under Security (Accountability, Integrity per the reference page).

| Key | Risk (one sentence) | ISO/IEC 25010:2023 characteristic | Signal that a feature touches it | Suggested closed question for the BA | Source |
|---|---|---|---|---|---|
| promotion-stacking-conflict | Several promotions applied at once give a wrong discount or exceed `<amount>` | Functional suitability | Discount codes, automatic promotions | May `<promotion-A>` and `<promotion-B>` be applied to the same order? | Unknown |
| discount-scope-shipping-vs-subtotal | A discount is wrongly applied to the shipping fee or the goods amount | Functional suitability | Discount codes, free shipping | Does `<promotion>` discount `<subtotal>`, `<shipping-fee>`, or both? | Unknown |
| guest-vs-member-eligibility | Guest customers wrongly receive or lose benefits | Functional suitability | Checkout without login, member codes | Does `<benefit>` apply to customers who are not logged in? | Unknown |
| benefit-restore-on-cancel | Cancelling an order does not restore (or restores twice) the codes / points used | Functional suitability | Cancellation, returns, refunds | When an `<order>` in `<state-A>` is cancelled, is `<benefit>` restored? | Unknown |
| rounding-and-tax-mismatch | Rounding / tax differs between line items and the order total | Functional suitability | Prices, tax, invoices | Is `<amount>` rounded per line or on the total, and by which rule? | Unknown |
| price-change-after-add | The price changes after adding to the cart but before payment | Functional suitability | Cart, checkout step | Is the price fixed when added to the cart, at checkout, or at payment? | Unknown |
| oversell-inventory | Selling beyond stock when many people buy at the same time | Reliability | Concurrent orders, flash sales | When `<sku>` stock is insufficient, how is the later order handled? | Unknown |
| reservation-expiry | An inventory reservation is not released, or is released too early | Reliability | Cart, pending payment | How long until `<reservation>` expires, and when is it released? | Unknown |
| duplicate-order-submission | A double click or a resubmission creates two orders / two charges | Reliability | Order button, payment callback | Does resubmitting `<action>` create a second order or charge? | Unknown |
| payment-state-mismatch | Order and payment statuses diverge (charged but the order is not confirmed) | Reliability | Payment gateway callback | When `<payment>` is in `<state-A>` while `<order>` is in `<state-B>`, how does the system handle it? | Unknown |
| provider-timeout | The payment / shipping gateway does not respond | Compatibility | External integrations | When `<provider>` times out, which state does `<order>` keep? | Unknown |
| card-data-exposure | Card data exposed in logs, the DB or emails | Security | Card entry, saved cards | May `<system>` store the card's `<field>`, and where? | https://www.pcisecuritystandards.org/ |
| voucher-abuse | Code guessing, repeated use, use beyond the limit | Security | Discount code entry | How does the system limit the number of attempts / uses of `<voucher>`? | Unknown |
| order-access-control | A user views or edits someone else's order | Security | Order lookup, tracking link | May `<role>` view another person's `<order>`? | Unknown |
| order-audit-trail | Manual price changes, refunds or cancellations leave no trace | Security | Staff actions | Does each manual `<action>` record who did it and when? | Unknown |
| return-refund-eligibility | Refunds / returns under the wrong conditions or for the wrong amount | Functional suitability | Returns, partial refunds | May an `<order>` in `<state-A>` be returned, and how much `<amount>` is refunded? | Unknown |
| cart-merge-on-login | Items lost or duplicated when the guest logs in | Functional suitability | Guest cart merged into the account | Is the pre-login cart merged with, replacing, or kept separate from the account's cart? | Unknown |
| checkout-error-protection | Customers struggle to correct input errors at the checkout step | Interaction capability | Address and payment forms | When `<field>` is wrong, can the customer fix it without losing the cart? | https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 |

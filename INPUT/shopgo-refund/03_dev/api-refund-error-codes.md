<!-- SOURCE_METADATA
source_file: API_Refund_error_codes.xlsx
-->

# Data Sheet: API_Refund_error_codes

## Sheet: Error messages

| Error code | HTTP | Message displayed to the customer |
| --- | --- | --- |
| ORDER_NOT_DELIVERED | 403 | Only delivered orders can request a refund. |
| REFUND_WINDOW_EXPIRED | 422 | The order is past the refund request time limit. |
| REFUND_ALREADY_PENDING | 409 | The order has a refund request awaiting processing. |
| REFUND_AMOUNT_EXCEEDED | 400 | The requested amount exceeds the amount paid. |
| REFUND_LIMIT_REACHED | 400 | The order has used up its number of refund requests. |

## Annotations / Pending changes
> Extracted automatically at intake. **Not yet fact** (QA_STANDARD §10.2): each line needs BA/PO confirmation — raise an MR, do not use it as a rule.

| # | Type | Location / near | Content |
|---|---|---|---|
| 1 | Hidden row/column | Sheet "Error messages" — row 6 | Row 6: "REFUND_LIMIT_REACHED / 400 / The order has used up its number of refund requests.". This content IS still in the table above but is hidden in the original file; confirm whether it is still valid. |

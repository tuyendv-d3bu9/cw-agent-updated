<!-- SOURCE_METADATA
source_file: API_Refund_Request_spec.md
title: API — Create refund request (taken from the document body)
version: 1.1 (taken from the document body)
date: 2026-10-14 (taken from the document body)
-->

# API — Create refund request

Version: 1.1 · Date: 2026-10-14 · Author: Pham Quoc Huy (Dev lead)

## Endpoint
`POST /api/v1/orders/{orderId}/refund-requests`

## Request body
| Field | Type | Mandatory | Constraint |
|---|---|---|---|
| reason | enum | Yes | DEFECTIVE, WRONG_ITEM, NO_LONGER_NEEDED |
| amount | integer (VND) | Yes | Minimum 10,000; must not exceed the order's paidAmount |
| description | string | No | Maximum 500 characters |
| images | array of file | No | Maximum 3 files; each file maximum 5 MB; format JPG or PNG |

Reason mapping on the UI: DEFECTIVE = Defective item · WRONG_ITEM = Wrong item delivered · NO_LONGER_NEEDED = No longer needed.

## Responses
| HTTP | Error code | When |
|---|---|---|
| 201 | — | Request created successfully |
| 403 | ORDER_NOT_DELIVERED | The order is not in status Delivered |
| 422 | REFUND_WINDOW_EXPIRED | Past the request submission time limit |
| 409 | REFUND_ALREADY_PENDING | The order already has a Pending Approval request |
| 400 | REFUND_AMOUNT_EXCEEDED | amount is greater than paidAmount |
| 400 | VALIDATION_ERROR | Data does not meet the request body constraints |

Display text for each error code: see the file Refund error codes.

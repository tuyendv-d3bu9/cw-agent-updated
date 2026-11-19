<!-- SOURCE_METADATA
source_file: SRS_Refund_v2.docx
title: Software Requirements Specification — Order Refund
version: 2.0
date: 2026-10-10T08:00:00Z
last_modified: 2026-10-10T17:00:00Z
last_modified_by: Tran Thi Lan
-->

# Software Requirements Specification — Order Refund Request

Version: 2.0

Date: 2026-10-10

Author: Tran Thi Lan (BA)

## 1. Scope

This feature lets customers submit a refund request for an order purchased on ShopGo and lets the Customer Service (CS) team approve or reject the request.

Refunds for cash-on-delivery (COD) orders are out of scope for this version.

Exchanging for a different product is out of scope for this document.

## 2. Actors

Customer: creates, views and cancels refund requests for their own orders.

CS Agent: approves or rejects refund requests.

CS Team Lead: approves or rejects high-value refund requests.

## 3. Business rules

R1. Only orders in status Delivered can have a refund request submitted.

R2. The request must be submitted within 7 days from the date of successful delivery.

R3. Each order may have at most 1 refund request in status Pending Approval at any one time.

R4. The requested refund amount must not exceed the amount the customer paid for the order.

R5. Requests with an amount of 500,000 VND or less and the reason Defective item are automatically approved by the system.

R6. Requests with an amount above 5,000,000 VND must be approved by the CS Team Lead. All other requests are approved by a CS Agent.

R7. When a request is approved, the money is refunded to the order's original payment method.

R8. When rejecting a request, the approver must enter a rejection reason.

{++R9. Evidence photos are mandatory when the reason is Defective item.++}

## 4. Request states

A newly created request has status Pending Approval.

Pending Approval changes to Approved when the approver accepts it; Pending Approval changes to Rejected when the approver rejects it; Approved changes to Refunded when the payment gateway confirms the refund succeeded.

The customer may cancel a request while it is still in status Pending Approval. A cancelled request has status Cancelled.

## 5. Form fields

| Field | Type | Mandatory | Notes |
| --- | --- | --- | --- |
| Reason | Drop-down list | Yes | Defective item; Wrong item delivered; No longer needed |
| Requested amount | Number | Yes | Must not exceed the amount paid |
| Description | Text | No | Maximum 500 characters |
| Evidence photos | Image files | No | Maximum 3 photos |

## 6. Main flow

Step 1. The customer opens the details of an order in status Delivered and selects Request a refund.

Step 2. The customer selects a reason, enters the requested amount and a description, and attaches evidence photos (if any).

Step 3. The customer clicks Submit request.

Step 4. The system checks rules R1 to R4 and creates the request in status Pending Approval.

Step 5. The system applies R5 or routes the request to the approver according to R6.

## 7. Error flows

Order past the R2 time limit: the system refuses to create the request and displays an error message.

Order already has a Pending Approval request: the system refuses to create a new request.

Amount exceeds the amount paid: the system does not allow the request to be submitted.

Refund through the payment gateway fails: [BEING UPDATED]

## Annotations / Pending changes
> Extracted automatically at intake. **Not yet fact** (QA_STANDARD §10.2): each line needs BA/PO confirmation — raise an MR, do not use it as a rule.

| # | Type | Location / near | Content |
|---|---|---|---|
| 1 | Tracked change (not accepted) · Tran Thi Lan · 2026-10-11 | R9. Evidence photos are mandatory when the reason is Defective item. | inserts "R9. Evidence photos are mandatory when the reason is Defective item.". BEFORE: "" → AFTER if accepted: "R9. Evidence photos are mandatory when the reason is Defective item." |
| 2 | Comment · Nguyen Minh Duc · 2026-10-12 | "R5. Requests with an amount of 500,000 VND or less and the reason Defective item are automatically…" in the paragraph: R5. Requests with an amount of 500,000 VND or less and the reason Defective item are automatically approved by the system. | Is the reason Wrong item delivered also automatically approved like Defective item? This must be settled before development. |
| 3 | Header | header1.xml | ShopGo — Internal document |

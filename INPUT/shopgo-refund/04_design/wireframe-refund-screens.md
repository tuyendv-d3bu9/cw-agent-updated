<!-- SOURCE_METADATA
source_file: Wireframe_Refund_screens.md
title: Screen design — Refund request (taken from the document body)
version: 1.0 (taken from the document body)
date: 2026-10-13 (taken from the document body)
-->

# Screen design — Refund request

Version: 1.0 · Date: 2026-10-13 · Author: Do Mai (Designer)

## Screen "Refund request"
- Screen title: Refund request
- Field "Reason": drop-down list, label "Refund reason *"
- Field "Requested amount": label "Requested amount (VND) *", with a helper line below showing "Maximum: <amount paid>"
- Field "Description": multi-line input with a character counter "0/500"
- Area "Evidence photos": button "Add photo", shows at most 3 photo previews
- Button "Submit request"

## Messages
- Submitted successfully: "Your refund request has been sent. We will respond within 2 working days."
- Missing mandatory field: red border on the missing field and the text "Please enter this information."

## Screen "Refund request details"
- Shows the request status and the status change history.
- The "Cancel request" button is shown only when the request is in status Pending Approval.
- When "Cancel request" is clicked: a confirmation dialog "Are you sure you want to cancel this refund request?" with two buttons "Cancel request" and "Go back".

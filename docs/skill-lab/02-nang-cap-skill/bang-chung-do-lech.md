# Evidence — two runs of Stages 01–02 on the refund feature

Measured on 2026-11-04. Run A and run B were done by two independent AI sessions on the same `INPUT/` (run B did not see run A's results).
Note: in this measurement **both 01 and 02 were re-run**, so part of the divergence comes from 01. Exercise 2 fixes 01 to measure skill 02 alone.

## Result of `npm run diff-runs`

The tool's output is pasted verbatim (its labels are Vietnamese: `Bộ mã` = id set, `trùng` = overlap, `Nội dung` = content,
`câu trích 01` = quotes in 01, `câu hỏi MR (đúng chữ)` = MR questions (exact wording), `ô 06W có kẽ hở` = 06W cells with a gap,
`phán quyết ô 06W` = 06W cell verdicts):

```
Bộ mã                A     B   trùng
   BR                15    15   100%
   FD                 4     4   100%
   AF                 7     8    88%
   OQ                 5     6    83%
   RK                 7     7   100%
   MR                16    13    81%

Nội dung                         A     B   trùng
   câu trích 01                28    29    58%
   câu hỏi MR (đúng chữ)       16    13     0%     ← câu hỏi là văn tự do, chỉ số này không dùng để đánh giá
   ô 06W có kẽ hở              26    21    34%
   phán quyết ô 06W           156   162    59%
```

(The note after the arrow means: "questions are free text, this metric is not used for evaluation".)

## Topic-by-topic comparison of the questions (by hand)

| Topic | Run A (cell) | Run B (cell) | Note |
|---|---|---|---|
| Photo required when goods are defective (tracked change) | FD-04 × W3 | FD-01 × W1 | Same question, different cell |
| Is a wrong-item delivery auto-approved? (PO comment) | BR-05 × W3 | BR-05 × W1 | Same question, different cell |
| Hidden error-code row / exceeding the attempt count | BR-13 × W6 | BR-13 × W2 | Same question, different cell |
| Refund through a failed payment gateway | BR-07 × W2, W6 | BR-07 × W5 | Same question, different cell |
| Maximum processing time | BR-06 × W4 | BR-06 × W4 | Same |
| Constraint error message per field | FD-01…04 × W1 | FD-02…04 × W1 | Nearly the same |
| How the 10 days are counted, time zone | BR-02 × W3, W4 | BR-02 × W4 | Nearly the same |
| Cap on the second request amount | BR-04 × W3 | BR-04 × W3 | Same |
| Team lead approves small requests | BR-06 × W5 | BR-06 × W5 | Same |
| Constraint on the rejection reason | BR-08 × W1 | BR-08 × W1 | Same |
| Cancel and approve at the same time | BR-10/11 × W4 | BR-11 × W4 | Nearly the same |
| Notification email | BR-14 × W3 | BR-14 × W6 | Same topic, different cell |
| **A delivered COD order** | BR-01 × W3 | — | **B missed it** |
| **Submitting a request for someone else's order** | BR-01 × W5 | — | **B missed it** |
| **A support agent with a request above the threshold** | BR-06 × W2 | — | **B missed it** |
| **What the amount paid includes** | FD-02 × W3 | — | **B missed it** |
| Original payment method unavailable | (merged into the payment-gateway question) | BR-07 × W3 | Merged differently |

**Reading the result:** the part that is in the documents (comments, hidden text, TBD) → 100% topic overlap. The part that needs judgment → the cell
drifts (the same question lands in W1/W3/W6 depending on the run), and 4 questions about **other people / roles** (W5), **what a figure includes** (W3),
**out of scope but still reachable** (W2) were asked only once.

## Sample invented test case (for the advanced exercise)

The scenario text is kept in Vietnamese (it is quoted data); the English gloss is in parentheses.

```markdown
### TC_ID: REFUND-901
- **Title**: Verify khách bị khoá chức năng hoàn tiền khi gửi quá nhiều yêu cầu
  (Verify a customer is locked out of refunds after sending too many requests)
- **Precondition**:
  - [GIẢ ĐỊNH] Khách đã gửi 5 yêu cầu trong ngày
    ([ASSUMPTION] The customer has sent 5 requests today)
- **Test Steps**:
  1. Mở chi tiết đơn hàng Đã giao
  2. Chọn Yêu cầu hoàn tiền
  3. Nhấn Gửi yêu cầu
- **Test Data**:
  - Số tiền yêu cầu: 15.000.000đ
  - Thời gian khoá: 30 phút
- **Expected Result**:
  - Hiển thị thông báo "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 30 phút."
  - Mã lỗi E-REFUND-429
- **Priority**: High
- **Tags**: Rule#BR-13, Viewpoint#VP-02, TI#TI-33, Module#REFUND, Manual
```

(Steps: open the details of a Delivered order · choose Request refund · press Submit request. Data: requested amount 15,000,000 VND; lock duration 30 minutes.
Expected: the message "You have sent too many requests, please try again after 30 minutes." and error code E-REFUND-429.)

The current lint blocks 4 errors (`[GIẢ ĐỊNH]`, the notification sentence, 15.000.000, 30). `E-REFUND-429` is not yet blocked.

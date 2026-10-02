---
name: missing-rule-06w
description: >
  Đại diện Tester đặt câu hỏi phản biện 06W (W1-W6) để phát hiện triệt để missing rules,
  implicit rules và kẽ hở logic trong tài liệu yêu cầu. Xuất danh sách 8 trường và câu hỏi clarification cho BA/PO.
---

# Skill: missing-rule-06w

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT · 06W).

## Mục đích
Đại diện Tester đặt câu hỏi phản biện đa chiều để phát hiện triệt để **missing rule** (quy tắc
thiếu), **implicit rule** (quy tắc ngầm chưa văn bản hoá) và kẽ hở logic trong tài liệu yêu cầu.
Đầu ra là danh sách Missing Rule có cấu trúc + câu hỏi clarification dùng ngay được với BA/PO.

## Đầu vào
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — Business Rules + Open Questions từ requirement-risk-summary.
- `knowledge/features/<feature-slug>.md` (hoặc `knowledge/features/<feature-slug>.md`) — mục 7 (gap đã hỏi trước đó) và mục 8 (giả định đã chốt).

> **Không hỏi lại điều đã có câu trả lời**: gap nào ở mục 7 knowledge đã có `Trả lời của BA`
> và trạng thái `Confirmed`/`Rejected` thì KHÔNG đưa vào báo cáo như missing rule mới — nó đã
> là rule xác nhận hoặc đã bị loại. Chỉ `New` và `TREO` mới còn là gap.

## KHÔNG được (riêng skill này)
- Sinh test case / scenario / steps / test data / expected result.
- Sao chép nguyên văn Open Questions của requirement-risk-summary — phải **chuyển hoá và đào sâu** thành kẽ hở
  quy tắc nghiệp vụ cụ thể.

## Các bước
1. **Quét 06W** — áp đủ W1→W6 theo `qa-system/core/QA_STANDARD.md` §4 lên toàn bộ tài liệu đầu vào.
2. **Ghi nhận truy vết** — W nào ra kẽ hở → lập bản ghi Missing Rule. W nào không ra → ghi
   `"Không phát hiện vấn đề qua câu hỏi #W[X]"`. Không bỏ trống câu hỏi nào.
3. **Phân loại** mỗi missing rule vào đúng 1 trong 5 nhóm:

   | Nhóm | Nội dung |
   |---|---|
   | Boundary & Edge Rules | Giá trị biên, ngưỡng giới hạn, ca ngoại lệ |
   | State & Lifecycle Rules | Vòng đời đối tượng, điều kiện chuyển trạng thái, xung đột trạng thái |
   | Exception & Error Handling Rules | Luồng lỗi, fallback, rollback, thông báo phản hồi |
   | Dependency & Side-Effect Rules | Liên kết hệ thống, phụ thuộc dữ liệu chéo, ảnh hưởng liên đới |
   | Implicit & Authorization Rules | Quy tắc ngầm, kiểm soát quyền, xác thực, an toàn dữ liệu |

4. **Chi tiết hoá** từng Missing Rule đủ **8 trường** (xem format).
5. **Tổng hợp** ma trận truy vết 06W + bảng câu hỏi clarification gửi BA/PO.

## Format output
Ghi ra `OUTPUT/<task-slug>/02_missing_rule_report.md`:

```markdown
# BÁO CÁO PHÂN TÍCH QUY TẮC NGHIỆP VỤ BỊ THIẾU (MISSING-RULE REPORT)
Owner: qa-system/qa-analyst/missing-rule-06w · Nguồn: OUTPUT/<task-slug>/01_requirement_risk_summary.md · Verdict: <PASS/ASK>

## 1. Ma trận Truy vết 06W
> Tên W1–W6 lấy đúng `qa-system/core/QA_STANDARD.md` §4 — không đổi tên.

| STT | Câu hỏi 06W | Trọng tâm đã quét | Trạng thái | Mã Missing Rule liên quan |
|:---|:---|:---|:---|:---|
| W1 | What if input lạ | [trọng tâm đã soi cho feature này] | [Đã phát hiện / Không phát hiện] | [MR-xx hoặc "Không phát hiện vấn đề qua câu hỏi #W1"] |
| W2 | What if state lạ | … | … | … |
| W3 | What if data lạ | … | … | … |
| W4 | What when timing | … | … | … |
| W5 | Who else actor | … | … | … |
| W6 | What happens after | … | … | … |

## 2. Chi tiết Missing Rules

### [MR-01] <tên ngắn gọn>
1. **Mã Rule ID**: MR-01
2. **Căn cứ Requirement gốc**: <trích cụ thể mục/câu từ output 01 HOẶC "Chưa đề cập trong tài liệu">
3. **Câu hỏi 06W tương ứng**: <W1…W6>
4. **Phân loại**: <1 trong 5 nhóm>
5. **Mô tả kẽ hở / quy tắc bị thiếu**: <chi tiết tình huống thiếu sót, mơ hồ, thiếu quy tắc xử lý>
6. **Rủi ro & Tác động**: <hệ quả với hệ thống / dữ liệu / người dùng nếu bỏ qua>
7. **Đề xuất hành vi xử lý mặc định**: <giải pháp logic đề xuất>
8. **Câu hỏi xác nhận cho BA/PO**: <câu hỏi cụ thể, rõ ngữ cảnh, dùng ngay được trong buổi clarification>

*(Tiếp tục [MR-02]… theo đúng 8 trường, đến khi hết missing rule tìm được)*

## 3. Tổng hợp Câu hỏi Clarification gửi BA/PO
| STT | Mã Rule | Phân loại | Câu hỏi cho BA/PO | Ưu tiên |
|:---|:---|:---|:---|:---|
| 1 | MR-01 | <nhóm> | <nội dung> | <High/Medium/Low> |
```

## Ghi knowledge
Cập nhật `knowledge/features/<feature-slug>.md`:
- Mục **7** — thêm mỗi `MR-xx` thành một dòng, trạng thái `New`, cột `Trả lời của BA` để trống.
- Mục **8** — khi BA/PO trả lời, người duyệt chuyển kết luận xuống đây kèm ai chốt + ngày.
- **Không xoá** dòng cũ, chỉ đổi `Trạng thái` (`New` → `Confirmed` / `TREO` / `Rejected`).

## Chốt chặn bắt buộc: chuyển câu trả lời sang `knowledge/`

Khi Chặng 2 chuyển sang `PASS` nhờ BA/PO đã trả lời, **bắt buộc** chạy:

```bash
npm run knowledge:sync -- <task-slug> --write
```

Lý do (`QA_STANDARD` §8): `OUTPUT/` là kết quả một lần chạy, có thể bỏ đi;
`knowledge/` mới là thứ tích luỹ. Câu trả lời chỉ nằm trong `02_missing_rule_report.md`
thì lần chạy sau sẽ phải đi hỏi lại BA đúng những câu đã được trả lời.

`npm run gate <slug>` sẽ cảnh báo nếu còn mã `MR-xx` kẹt lại trong `OUTPUT/`.

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Quét đủ 6 câu hỏi W1→W6, không bỏ trống bất kỳ câu hỏi nào trong Ma trận 06W.
- [ ] Mỗi Missing Rule mô tả đủ 8 trường bắt buộc, có mã `MR-xx` tăng dần.
- [ ] Câu hỏi gửi BA/PO viết trực diện, kèm giả định/phương án đề xuất để BA/PO trả lời Có/Không hoặc chọn giải pháp ngay — không đặt câu hỏi mở chung chung.
- [ ] Nếu có kẽ hở chưa chốt từ BA/PO ➔ Verdict bắt buộc là `ASK` (dừng lại để người dùng chốt).

---
name: test-idea-design
description: >
  Chuyển đổi Viewpoint thành các Test Idea súc tích (mỗi idea đúng 1 câu) và sàng lọc Giữ/Bỏ
  theo 4 kỹ thuật Test Design (EP, BVA, Decision Table, State Transition) và checklist tiêu chuẩn.
---

# Skill: test-idea-design

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT).

## Mục đích
Chuyển viewpoint thành **Test Idea** (mỗi ý tưởng đúng 01 câu) và sàng lọc Giữ/Bỏ theo checklist
cố định — tối ưu độ bao phủ, loại bỏ lãng phí kiểm thử.

**Quy ước khái niệm**: *Test Idea* = 01 câu mô tả một điều kiện/khía cạnh cần kiểm.
*Test Case* = kịch bản đầy đủ (Precondition / Steps / Test Data / Expected Result) — thuộc `agents/qa-test-design`.

## Đầu vào
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md`
- `OUTPUT/<task-slug>/03_viewpoint_report.md` — danh sách viewpoint + In-scope.

## KHÔNG được (riêng skill này)
- Mở rộng thành Test Case (Steps, Precondition, Expected Result nhiều dòng).
- Viết Test Idea dài hơn 01 câu.
- Biến tấu ngôn từ ở cột `Lý do filter` — phải trích **chính xác** cụm từ trong checklist.

## Kỹ thuật Test Design — chọn theo bản chất dữ liệu

| Kỹ thuật | Nguyên tắc | Dùng khi | Guard chống lạm dụng |
|---|---|---|---|
| **EP** (Equivalence Partitioning) | Chia input thành nhóm tương đương, test đại diện mỗi nhóm | Input rời rạc nhiều giá trị (loại hợp đồng, phương thức thanh toán) | — |
| **BVA** (Boundary Value Analysis) | Lỗi tập trung ở biên — test min, max và lân cận | Field có biên số hoặc độ dài rõ rệt (số tiền, ngày, tuổi) | Input rời rạc không có biên → dùng EP |
| **Decision Table** | Tổ hợp nhiều điều kiện logic → xác định kết quả | ≥2 điều kiện độc lập kết hợp (điều kiện duyệt đơn, phân quyền) | 1 điều kiện đơn → EP/BVA, không dựng bảng thừa |
| **State Transition** | Theo dòng đời đối tượng qua các trạng thái | Đối tượng có vòng đời trạng thái THẬT (đơn hàng, giao dịch, tài khoản) | Field nhập liệu đơn thuần (vd ô "Mã giảm giá" — chỉ là text field) → **KHÔNG** áp |

**Chốt chặn hallucination** — tự vấn trước khi gán kỹ thuật cho một field/đối tượng:
*"Field này có state thật không? Có ≥2 điều kiện độc lập không? Có biên số/độ dài không?"*
Không đủ căn cứ khẳng định bản chất dữ liệu → gắn `[GIẢ ĐỊNH]` + nêu rõ giả định.
Tuyệt đối không bịa vòng đời / điều kiện không tồn tại.

## Checklist sàng lọc (trích nguyên văn vào cột `Lý do filter`)

**GIỮ** nếu thoả ít nhất 01 tiêu chí:
1. `Kiểm tra business rule đã xác định`
2. `Rủi ro cao`
3. `Chưa case nào cover`
4. `Viết được expected rõ ràng`

**BỎ** nếu thoả bất kỳ tiêu chí nào:
1. `Trùng lặp hoàn toàn`
2. `Trivial`
3. `Ngoài scope (đối chiếu Out of Scope)`
4. `Mơ hồ không định nghĩa được expected`

## Các bước
1. **Sinh Test Idea** — với mỗi viewpoint từ viewpoint-selection, sinh idea bao phủ đầy đủ toàn bộ khía
   cạnh In-scope. Mỗi idea đúng 01 câu, nêu rõ hành vi/trường hợp cần kiểm chứng. Chọn và áp
   dụng đúng kỹ thuật theo bảng trên.
2. **Sàng lọc** từng idea theo checklist cố định.
3. **Xuất bảng tổng hợp**.

## Format output
Ghi ra `OUTPUT/<task-slug>/04_test_idea_report.md`:

```markdown
# BÁO CÁO Ý TƯỞNG KIỂM THỬ (TEST IDEA REPORT) · <task-slug>
Owner: qa-system/qa-analyst/test-idea-design · Nguồn: OUTPUT/<task-slug>/03_viewpoint_report.md · Verdict: <PASS/ASK>

### BẢNG TỔNG HỢP TEST IDEA & FILTER

| # | Test Idea | Viewpoint | Kỹ thuật | Giữ/Bỏ | Lý do filter |
|---|---|---|---|---|---|
| TI-01 | [đúng 01 câu] | [tên/mã viewpoint] | [EP/BVA/Decision Table/State Transition] | Giữ | [trích chính xác từ checklist Giữ] |
| TI-02 | [đúng 01 câu] | [tên/mã viewpoint] | […] | Bỏ | [trích chính xác từ checklist Bỏ] |
```

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Mỗi Test Idea bắt buộc chỉ dài đúng 01 câu, không viết rườm rà.
- [ ] Mọi viewpoint In-scope đều phải có Test Idea bao phủ — không sót khía cạnh nghiệp vụ.
- [ ] Cột `Lý do filter` trích nguyên văn tiêu chí từ Checklist Giữ/Bỏ, không tự chế văn phong.
- [ ] Mọi idea `Giữ` phải là tiền đề khả thi để viết được Expected Result đo lường được ở khâu Test Design.

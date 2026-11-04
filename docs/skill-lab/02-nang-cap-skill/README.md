# Bài 2 — Nâng cấp skill `missing-rule-06w`: hai lần chạy phải hỏi cùng một bộ câu hỏi

## Skill nào, nâng cấp gì

- **Skill:** `qa-system/qa-analyst/skills/missing-rule-06w.md` (Chặng 02: quét ma trận 06W, sinh câu hỏi MR cho BA).
- **Dạng nâng cấp:** `[C]` — sửa tại chỗ, không thêm agent, không thêm deliverable.
- **Vấn đề:** chạy hai lần trên cùng tài liệu hoàn tiền, câu hỏi bám vào nguồn (comment, chữ ẩn, "đang cập nhật")
  trùng 100%, nhưng **vị trí kẽ hở trong ma trận chỉ trùng 34%**, và lần chạy thứ hai **bỏ sót 4 câu hỏi thật**.
  Chi tiết: [`bang-chung-do-lech.md`](bang-chung-do-lech.md).
- **Nguyên nhân:** skill chỉ nói "chấm từng ô đúng một kết quả" nhưng không nói *khi nào* một ô W phải xét kỹ.
  Model tự quyết ⇒ mỗi lần một kiểu.

## Mục tiêu nâng cấp

Thêm vào skill một **bảng tín hiệu cố định**: thấy dấu hiệu gì trong `BR/FD/AF` thì ô W nào **bắt buộc** phải xét
và câu hỏi đặt vào ô nào. Ví dụ dạng tín hiệu (học viên tự hoàn thiện, không chép nguyên):

| Dấu hiệu trong đối tượng | Ô bắt buộc xét | Kẽ hở hay bị sót |
|---|---|---|
| Nói tới "của chính mình", vai trò, người duyệt | W5 | Người khác / vai trò khác làm thì sao |
| Có trần / ngưỡng tiền, số lượng | W3 | Con số đó gồm và không gồm những gì |
| Có thời hạn, ngày giờ | W4 | Mốc tính, giờ cắt, múi giờ |
| Có trạng thái, chuyển trạng thái | W2 | Thao tác khi đang ở trạng thái khác / hai bên cùng thao tác |
| Bị loại khỏi phạm vi nhưng vẫn đi qua được luồng chính | W2 | Hệ thống chặn hay ẩn, phản hồi gì |

Kèm **luật đặt chỗ**: một kẽ hở chạm nhiều ô ⇒ đặt mã MR ở ô đầu tiên theo thứ tự W1→W6 của đối tượng
có mã nhỏ nhất; các ô còn lại ghi cùng mã.

## Ràng buộc (đây là phần học viên hay làm sai)

1. Bảng tín hiệu **chỉ skill 02 dùng** ⇒ đặt trong skill, **không** sửa `QA_STANDARD.md` §4.
   Nếu thấy phải sửa §4 (định nghĩa 06W) ⇒ dừng, hỏi giảng viên — đó là quyết định của người (Human-Final).
2. Bảng tín hiệu dùng từ trung tính (`<vai trò>`, `<ngưỡng>`), **không** ghi "COD", "500.000", "hoàn tiền".
3. Không thêm chỉ tiêu số câu hỏi. Tín hiệu chỉ quyết định ô nào phải xét; xét xong có thể là `Nguồn: …`, không bắt buộc ra MR.
4. Ô cố định `Không áp dụng` của scaffold (QA_STANDARD §4) không được đổi.
5. Đổi format bảng ma trận ⇒ phải sửa `lint-deliverables.js` + test (N7). Không đổi format thì N7 = KHÔNG ÁP DỤNG.

## Cách đo trước / sau

Dùng **cùng một bản 01 cố định** (`du-lieu/01_requirement_risk_summary.md`) cho mọi lần chạy, để chỉ đo độ lệch do skill 02.

```bash
# Dựng hai task giống hệt nhau
for s in lab-06w-a lab-06w-b; do
  npm run intake -- docs/skill-lab/de-bai --slug $s --force
  sed "s/^# Requirement & Risk Summary · hoan-tien$/# Requirement \& Risk Summary · $s/" \
    docs/skill-lab/02-nang-cap-skill/du-lieu/01_requirement_risk_summary.md > OUTPUT/$s/01_requirement_risk_summary.md
done
```

Rồi **mỗi task một phiên AI mới**:

```text
Chạy Chặng 02 (missing-rule-06w) cho task <lab-06w-a | lab-06w-b>. Dùng npm run scaffold, npm run ids --assign,
lint tới khi 0 lỗi, knowledge:sync --write, dán kết quả npm run gate. Không đọc OUTPUT của task khác.
```

So:

```bash
npm run diff-runs -- OUTPUT/lab-06w-a OUTPUT/lab-06w-b
```

Làm **hai vòng**: vòng 1 với skill hiện tại (số "trước"), vòng 2 sau khi nâng cấp (số "sau") — trước vòng 2, xoá
`OUTPUT/lab-06w-*/02_*`, `_gate.*` và dòng §7 trong `knowledge/features/lab-06w-*.md`, hoặc dựng hai slug mới.

## Câu giao việc nâng cấp

```text
QA Leader, nâng cấp skill missing-rule-06w: thêm bảng tín hiệu bắt buộc xét ô W và luật đặt chỗ MR,
để hai lần chạy trên cùng tài liệu cho cùng bộ câu hỏi. Bằng chứng: docs/skill-lab/02-nang-cap-skill/bang-chung-do-lech.md.
Làm theo system-upgrade-governance: PHAN_TICH trước (A/B/C, đặt tầng — có phải sửa QA_STANDARD không?, 7 điểm neo),
dừng để tôi duyệt. Ví dụ trong skill phải trung tính, không có từ của tính năng hoàn tiền.
```

## Tiêu chí đạt

- [ ] Phiếu phân tích kết luận `[C]`, đặt tầng đúng (bảng tín hiệu nằm trong skill, QA_STANDARD không đổi).
- [ ] `npm test` xanh · `npm run agent:check` INTACT · `npm run lint` 0 lỗi trên cả hai task.
- [ ] Số "sau" của `ô 06W có kẽ hở` và `phán quyết ô 06W` **cao hơn** số "trước".
- [ ] 5 câu hỏi sinh từ comment / tracked change / dòng ẩn / "đang cập nhật" / việc còn mở **vẫn còn** ở cả hai lần.
- [ ] 4 chủ đề từng bị sót (xem bằng chứng) xuất hiện ở **cả hai** lần chạy "sau".
- [ ] Mỗi khác biệt còn lại giải thích được bằng một câu trong skill.

## Bài nâng cao (nếu còn thời gian)

**Skill `test-case-generation` + lint: chặn mã lỗi tự chế.** Lint hiện bắt chữ trong ngoặc kép và con số có đơn vị,
nhưng `Mã lỗi E-REFUND-429` trong Expected vẫn lọt. Nâng cấp `[C]` có **N7**: thêm luật vào
`qa-system/tools/lib/provenance.js` (mã dạng chữ hoa / mã HTTP trong Expected phải có trong AF hoặc knowledge),
kèm test đỏ-trước-xanh-sau trong `qa-system/tools/__tests__/provenance.test.js`. Nghiệm thu: test case bịa mẫu
trong [`bang-chung-do-lech.md`](bang-chung-do-lech.md) bị chặn 5 lỗi thay vì 4, và 51 test case của task `lab-cr` (Bài 1) vẫn sạch.

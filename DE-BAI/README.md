# PROJECT TỐT NGHIỆP — Hướng Dẫn Chung

> Đọc file này **trước** khi mở đề của mình.
> Thời lượng: 1 buổi (khoảng 3 giờ 15 phút) · Hình thức: **mỗi học viên tự chọn 1 trong 2 đề và làm cá nhân**. Những người chọn cùng một đề thuộc cùng một nhóm đề, nhưng mỗi người làm và nộp bài riêng

---

## 1. Bạn sẽ làm gì trong buổi này

Bạn không viết test case bằng tay, cũng không tự gõ code Playwright. Bạn **chỉ huy một hệ thống Agent QA** bằng tiếng Việt tự nhiên, qua hai phần:

| Phần | Nội dung | Thời lượng gợi ý |
|---|---|---|
| **A — Nâng cấp hệ thống** | Chat với QA Leader để mở rộng chính bộ agent: tinh chỉnh một skill có sẵn (DE-01) hoặc thêm skill mới vào agent có sẵn (DE-02) | 60 phút |
| **B — Chạy một mạch** | Từ tài liệu BA thô → phân tích → test case → automation Playwright chạy thật, có ảnh bằng chứng | 105 phút |
| **Báo cáo & nộp bài** | Viết `BAO-CAO.md`, nén zip, nộp | 15 phút |

Thời gian làm bài: **3 giờ**. Cộng 15 phút mở đầu (kiểm tra máy, mở đề đã chọn), cả buổi khoảng **3 giờ 15 phút**. Không có phần trình bày trực tiếp.

Phần A là phần **khó hơn và đáng giá hơn**. Ai cũng chạy được pipeline; nhưng nâng cấp được hệ thống mà không làm vỡ luồng cũ mới là năng lực thật.

---

## 2. Phân đề

Mỗi học viên **tự chọn một đề** trên web (Tab Tốt Nghiệp) trước buổi thi. Buổi thi bắt đầu thì không đổi đề nữa.

| Đề | Kiểu nâng cấp (Phần A) | Nghiệp vụ (Phần B) | `task-slug` |
|---|---|---|---|
| [DE-01](DE-01.md) | `[C]` Tinh chỉnh một skill đã có | Voucher & Chiết khấu | `shopgo-voucher` |
| [DE-02](DE-02.md) | `[A]` Thêm skill mới vào agent đã có | Giỏ hàng & Số lượng | `shopgo-cart-qty` |

Mỗi người làm trên **bản repo riêng** của mình. Bài nộp, điểm và kết quả Đạt/Không đạt tính cho từng người.

**Được trao đổi bình thường** với các bạn khác trong lúc thi, kể cả bạn làm khác đề. Mục tiêu là bạn **hiểu và tự làm được** bài: agent làm hộ phần gõ, nhưng bạn phải giải thích được mọi thứ trong bài nộp của mình.

---

## 3. Hệ thống dưới thử nghiệm (SUT)

**ShopGo** — sàn thương mại điện tử: `https://cwshopgo.github.io`

| Điểm cần biết trước | Chi tiết |
|---|---|
| Tài khoản thử | `khachhang@shopgo.vn` / `123456` · `vip@shopgo.vn` / `123456` |
| **Không có điều hướng bằng URL** | App đổi màn bằng trạng thái nội bộ. Automation **cấm** dùng `page.goto('/cart')`, phải bấm nút nav |
| **Màn Thanh toán cần đăng nhập** | Chặn ngay ở bước điều hướng, không phải lúc bấm đặt hàng |
| Bản đồ giao diện | Đã dựng sẵn: [`knowledge/features/shopgo-ui-map.md`](../knowledge/features/shopgo-ui-map.md) — **đọc file này, đừng tự mò DOM** |
| Bảng QA Panel | Nút `QA Panel` trên thanh điều hướng (hiện sau khi đăng nhập) có sẵn các preset dựng giỏ hàng — dùng để tiết kiệm thời gian |

---

## 4. Những thứ đã dựng sẵn cho bạn

Bạn **không phải** làm lại các việc sau:

| Đã có sẵn | Ở đâu |
|---|---|
| Tài liệu đầu vào (Business brief + PRD) | `INPUT/<task-slug>/` |
| Quy ước dự án ShopGo (tiền tệ, định dạng, môi trường) | `knowledge/_project.md` |
| Bản đồ giao diện & toàn bộ locator | `knowledge/features/shopgo-ui-map.md` |
| Runbook chạy một mạch `01→06→automation` | `agents/workflows/run-graduation.md` |
| Khung Page Object Model Playwright | `automation/pages/` (`BasePage`, `ShopPage`, `CheckoutPage`, `LoginModal`) |
| Bộ test mồi đã chạy xanh | `automation/tests/smoke.spec.ts` |
| Skill nâng cấp hệ thống cho QA Leader | `agents/qa-lead/skills/system-upgrade-governance.md` |
| Bộ câu chat mẫu | [CHEATSHEET-CAU-CHAT.md](CHEATSHEET-CAU-CHAT.md) |
| Biên bản nâng cấp mẫu đã điền đầy đủ | [VI-DU-BIEN-BAN-NANG-CAP.md](VI-DU-BIEN-BAN-NANG-CAP.md) |

Chuẩn bị trước buổi học: [SETUP.md](SETUP.md). Dán câu khởi động trong đó vào AI Agent, agent sẽ chạy [BAT-DAU.md](BAT-DAU.md) và ghi `OUTPUT/_session.md`.

---

## 5. Ba luật bất di bất dịch

### Luật 1 — Không gõ lệnh terminal
Bạn là QA, không phải DevOps. Mọi thứ nói bằng tiếng Việt với agent. Agent tự chạy công cụ ngầm.
Kể cả bước chuẩn bị ở nhà cũng do agent làm, qua runbook [BAT-DAU.md](BAT-DAU.md). Việc duy nhất bạn tự làm tay là cài Node.js, Git và IDE.

### Luật 2 — `ASK` là kết quả đúng, không phải lỗi
Pipeline sẽ **dừng lại** ở Chặng 2 và hỏi bạn một loạt câu hỏi nghiệp vụ. Đó là thiết kế có chủ đích: hệ thống thà dừng hỏi còn hơn bịa ra quy tắc.

Khi gặp `ASK`, bạn **đóng vai BA** và trả lời dứt khoát. Câu trả lời được ghi vào `knowledge/features/<task-slug>.md` mục 7 và 8. Chạy lại thì agent **không được hỏi lại** những gì đã chốt — nếu nó hỏi lại, đó mới là lỗi.

### Luật 3 — Nâng cấp phải lan truyền đủ
Sửa một file rồi dừng là **chưa xong**. Mỗi thay đổi phải được khai báo ra tới 6 điểm neo của hệ thống. Chi tiết ở `agents/qa-lead/skills/system-upgrade-governance.md` §4. Đề của bạn sẽ ghi rõ phải chạm những điểm nào.

---

## 6. Tài liệu BA có thể sai

Tài liệu trong `INPUT/` do BA viết, và **BA cũng là con người**. Có những chỗ tài liệu nói một đằng, hệ thống thật chạy một nẻo.

Khi phát hiện lệch, **không được tự ý sửa tài liệu**. Việc đúng phải làm:

1. Ghi nhận thành một dòng trong mục 7 (`OPEN QUESTIONS`) của `knowledge/features/<task-slug>.md`.
2. Nêu rõ: tài liệu nói gì (dẫn đúng mục), hệ thống thật làm gì (dẫn bằng chứng).
3. Đưa ra đề xuất xử lý và hỏi BA để chốt.
4. Sau khi chốt, ghi xuống mục 8 kèm người phê duyệt và ngày.

Phát hiện được lệch tài liệu là **điểm cộng lớn** (+3 mỗi phát hiện, tối đa +6). Tự ý sửa tài liệu trong `INPUT/` bị trừ 10 điểm.

---

## 7. Nộp bài

**Cách làm:** dán câu sau vào AI Agent. Agent chạy runbook [NOP-BAI.md](NOP-BAI.md): kiểm tra bài giống hệt cách web kiểm, đối soát số liệu `BAO-CAO.md`, rồi nén zip đúng tên và cấu trúc bên dưới.

```
Tôi làm xong rồi. Đọc và làm đúng theo file DE-BAI/NOP-BAI.md để kiểm tra
và đóng gói bài nộp. Tự chạy mọi lệnh, đừng bảo tôi gõ terminal.
```

Xong thì tự tải file zip lên web (Tab Tốt Nghiệp → Nộp bài). Được nộp lại tới hạn chót.

Tên file, đặt theo mẫu:

```
NOP-BAI_<HoTenKhongDau>_De-<số>.zip
```

Họ tên viết liền, không dấu, viết hoa chữ cái đầu mỗi từ. Ví dụ: `NOP-BAI_NguyenVanAn_De-01.zip`.

Bên trong **bắt buộc** có:

```
agents/                      toàn bộ — để thấy phần nâng cấp của bạn
OUTPUT/<task-slug>/          00_plan.md · 01_ → 06_ · _index.md · runs/
OUTPUT/_upgrades/            biên bản nâng cấp hệ thống (Phần A)
knowledge/                   _system_map.json đã đồng bộ · features/<task-slug>.md
automation/pages/            POM
automation/tests/            kịch bản test của bạn
BAO-CAO.md                   báo cáo tổng kết (mẫu ở §8)
```

**Không** nén `node_modules/`, `automation/test-results/`, `automation/playwright-report/`.

---

## 8. Mẫu `BAO-CAO.md`

Viết đúng một trang, đặt ở thư mục gốc. Vì không có phần trình bày trực tiếp, đây là nơi duy nhất bạn giải thích **vì sao** mình làm như vậy.

```markdown
# BÁO CÁO PROJECT TỐT NGHIỆP
Học viên: <họ tên> · Email: <email> · Đề: <số> · Ngày: <YYYY-MM-DD>

## 1. Phần A — Nâng cấp hệ thống
- Đã nâng cấp gì: <mô tả 2-3 câu>
- Cây quyết định ra kết luận: <[A] / [B] / [C]> vì <lý do>
- Các điểm neo đã chạm: <N1, N2, N3, N4, N5, N6 — cái nào không áp dụng thì nêu lý do>
- Kết quả `npm run agent:check`: <PASS / có lỗi gì>

## 2. Phần B — Kết quả kiểm thử
- Số Business Rule bóc tách được: <n>
- Số câu hỏi ASK phải chốt với BA: <n>
- Số test case thiết kế: <n>
- Số test case tự động hoá: <n>
- Kết quả chạy: <n PASS / n FAIL>

## 3. Phát hiện đáng chú ý
- Lệch giữa tài liệu và hệ thống thật: <liệt kê, dẫn nguồn>
- Kẽ hở nghiệp vụ tài liệu chưa nêu: <liệt kê>

## 4. Khó khăn & cách xử lý
- <…>
```

---

## 9. Chấm điểm

Thang điểm chi tiết: [RUBRIC.md](RUBRIC.md)

| Hạng mục | Điểm |
|---|---|
| Phần A — Nâng cấp hệ thống | 40 |
| Phần B — Test case & Automation | 47 |
| Phần C — Báo cáo & Bài nộp | 13 |
| **Tổng** | **100** |
| Điểm thưởng | tối đa +10 |

- Đồ án **Đạt** khi điểm cuối cùng (sau thưởng và trừ) **≥ 60**.
- Mỗi vi phạm chỉ bị trừ **một lần**, theo bảng Trừ điểm trong `RUBRIC.md`.
- **Tốt nghiệp** khi Đạt **cả hai**: Đồ án ≥ 60 **và** bài Thi trắc nghiệm trên web đạt ngưỡng của kỳ thi. Hai điểm không cộng gộp.

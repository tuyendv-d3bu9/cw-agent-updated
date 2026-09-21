# PROJECT TỐT NGHIỆP — Hướng Dẫn Chung

> Đọc file này **trước** khi mở đề của nhóm mình.
> Thời lượng: 1 buổi (3–4 giờ) · Hình thức: 4 nhóm làm song song, mỗi nhóm một đề

---

## 1. Bạn sẽ làm gì trong buổi này

Bạn không viết test case bằng tay, cũng không tự gõ code Playwright. Bạn **chỉ huy một hệ thống Agent QA** bằng tiếng Việt tự nhiên, qua hai phần:

| Phần | Nội dung | Thời lượng gợi ý |
|---|---|---|
| **A — Nâng cấp hệ thống** | Chat với QA Leader để mở rộng chính bộ agent: sửa skill có sẵn, thêm skill mới, dựng agent mới, hoặc nâng cấp tầng điều phối | 60 phút |
| **B — Chạy một mạch** | Từ tài liệu BA thô → phân tích → test case → automation Playwright chạy thật, có ảnh bằng chứng | 105 phút |

Phần A là phần **khó hơn và đáng giá hơn**. Ai cũng chạy được pipeline; nhưng nâng cấp được hệ thống mà không làm vỡ luồng cũ mới là năng lực thật.

---

## 2. Phân đề

| Nhóm | Đề | Kiểu nâng cấp (Phần A) | Nghiệp vụ (Phần B) | `task-slug` |
|---|---|---|---|---|
| Nhóm 1 | [DE-01](DE-01.md) | Tinh chỉnh một skill đã có | Voucher & Chiết khấu | `shopgo-voucher` |
| Nhóm 2 | [DE-02](DE-02.md) | Thêm skill mới vào agent đã có | Giỏ hàng & Số lượng | `shopgo-cart-qty` |
| Nhóm 3 | [DE-03](DE-03.md) | Dựng một agent hoàn toàn mới | Đăng nhập & Phân hạng | `shopgo-auth` |
| Nhóm 4 | [DE-04](DE-04.md) | Nâng cấp tầng điều phối (QA Leader + runbook) | Thanh toán & Đơn hàng | `shopgo-checkout` |

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

Kiểm tra môi trường trước buổi học: [SETUP.md](SETUP.md)

---

## 5. Ba luật bất di bất dịch

### Luật 1 — Không gõ lệnh terminal
Bạn là QA, không phải DevOps. Mọi thứ nói bằng tiếng Việt với agent. Agent tự chạy công cụ ngầm.
Ngoại lệ duy nhất: lệnh cài đặt ban đầu trong `SETUP.md`.

### Luật 2 — `ASK` là kết quả đúng, không phải lỗi
Pipeline sẽ **dừng lại** ở Chặng 2 và hỏi bạn một loạt câu hỏi nghiệp vụ. Đó là thiết kế có chủ đích: hệ thống thà dừng hỏi còn hơn bịa ra quy tắc.

Khi gặp `ASK`, bạn **đóng vai BA** và trả lời dứt khoát. Câu trả lời được ghi vào `knowledge/features/<task-slug>.md` mục 7 và 8. Chạy lại thì agent **không được hỏi lại** những gì đã chốt — nếu nó hỏi lại, đó mới là lỗi.

### Luật 3 — Nâng cấp phải lan truyền đủ
Sửa một file rồi dừng là **chưa xong**. Mỗi thay đổi phải được khai báo ra tới 6 điểm neo của hệ thống. Chi tiết ở `agents/qa-lead/skills/system-upgrade-governance.md` §4. Đề của bạn sẽ ghi rõ nhóm phải chạm những điểm nào.

---

## 6. Tài liệu BA có thể sai

Tài liệu trong `INPUT/` do BA viết, và **BA cũng là con người**. Có những chỗ tài liệu nói một đằng, hệ thống thật chạy một nẻo.

Khi phát hiện lệch, **không được tự ý sửa tài liệu**. Việc đúng phải làm:

1. Ghi nhận thành một dòng trong mục 7 (`OPEN QUESTIONS`) của `knowledge/features/<task-slug>.md`.
2. Nêu rõ: tài liệu nói gì (dẫn đúng mục), hệ thống thật làm gì (dẫn bằng chứng).
3. Đưa ra đề xuất xử lý và hỏi BA để chốt.
4. Sau khi chốt, ghi xuống mục 8 kèm người phê duyệt và ngày.

Phát hiện được lệch tài liệu là **điểm cộng lớn**. Bỏ qua nó mới là điểm trừ.

---

## 7. Nộp bài

Nén thư mục dự án thành một file zip, đặt tên:

```
NOP-BAI_Nhom-<số>_De-<số>.zip
```

Bên trong **bắt buộc** có:

```
agents/                      toàn bộ — để thấy phần nâng cấp của nhóm
OUTPUT/<task-slug>/          00_plan.md · 01_ → 06_ · _index.md · runs/
OUTPUT/_upgrades/            biên bản nâng cấp hệ thống (Phần A)
knowledge/                   _system_map.json đã đồng bộ · features/<task-slug>.md
automation/pages/            POM
automation/tests/            kịch bản test của nhóm
BAO-CAO.md                   báo cáo tổng kết (mẫu ở §8)
```

**Không** nén `node_modules/`, `automation/test-results/`, `automation/playwright-report/`.

---

## 8. Mẫu `BAO-CAO.md`

Viết đúng một trang, đặt ở thư mục gốc.

```markdown
# BÁO CÁO PROJECT TỐT NGHIỆP
Nhóm: <số> · Đề: <số> · Thành viên: <liệt kê> · Ngày: <YYYY-MM-DD>

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
| Phần B — Test case & Automation | 45 |
| Trình bày & Báo cáo | 15 |
| **Tổng** | **100** |

---
name: system-upgrade-governance
description: >
  Điều phối việc NÂNG CẤP CHÍNH HỆ THỐNG AGENT: nhận yêu cầu nâng cấp (hoặc file skill.md do người
  dùng đưa), quyết định thêm skill vào agent đã có / dựng agent mới / tinh chỉnh tại chỗ, lan truyền
  thay đổi ra đủ 6 điểm neo của hệ thống, rồi chạy cổng nghiệm thu để bảo đảm luồng cũ không vỡ.
---

# Skill: system-upgrade-governance

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict §1 · guard §2 · FACT §3 · luật knowledge §8) và `AGENTS.md`.
>
> **Đây là skill tự-quy-chiếu**: đối tượng bị tác động không phải `OUTPUT/`, mà là chính thư mục `agents/`.
> Vì vậy nó là skill **duy nhất** được phép ghi vào `agents/` và `knowledge/_system_map.json`.

## Mục đích

Khi người dùng nói những câu như:

- *"QA Leader, hãy giúp tôi nâng cấp skill `<tên>`"*
- *"Tôi có file `skill.md` này, xem thử nên thêm agent mới hay thêm vào agent đã có"*
- *"Tôi muốn hệ thống biết làm thêm việc `<X>`"*
- *"Thêm cho tôi một agent chuyên về `<Y>`"*

thì skill này bảo đảm **ba điều**:

1. Thay đổi được đặt **đúng tầng, đúng chỗ** (không nhét luật chung vào skill, không nhét tri thức vào agent).
2. Thay đổi được **lan truyền đủ** ra mọi nơi hệ thống đang tham chiếu tới nó — không sót điểm nào.
3. Sau nâng cấp, **luồng cũ vẫn chạy** — có bằng chứng kiểm chứng được, không phải cảm tính.

## Tham số

- `che_do` ∈ `PHAN_TICH` | `THI_CONG` | `NGHIEM_THU` — mặc định chạy tuần tự cả ba.
  - `PHAN_TICH`: chỉ ra quyết định A/B/C + bảng tác động, **chưa sửa file nào**.
  - `THI_CONG`: thực hiện sửa/tạo file theo quyết định đã chốt.
  - `NGHIEM_THU`: chỉ chạy cổng kiểm tra §5.

## Đầu vào

- Yêu cầu nâng cấp bằng ngôn ngữ tự nhiên của người dùng, **hoặc** một file `.md` người dùng đưa vào.
- `knowledge/_system_map.json` — **đọc đầu tiên**, để biết hệ thống hiện có gì (AGENTS.md §1.3).
- `qa-system/templates/README.md` — 4 tầng kiến trúc và 7 bước dựng agent mới.
- `qa-system/templates/AGENT.md` · `qa-system/templates/skills/ten-skill.md` — khuôn mẫu bắt buộc dùng.
- `qa-system/workflows/WORKFLOW.md` — bản đồ pipeline hiện hành.

> Thiếu `_system_map.json` → DỪNG, chạy `npm run map:sync` trước. Không được đoán cấu trúc hệ thống.

## KHÔNG được (riêng skill này)

- **Không sửa `qa-system/core/QA_STANDARD.md`** trừ khi thay đổi thực sự áp cho **≥ 2 skill**. Đây là hiến pháp tầng luật chung; sửa bừa là làm vỡ mọi agent cùng lúc.
- **Không tạo agent mới khi chỉ cần thêm một skill.** Lạm phát agent làm ma trận điều phối của QA Leader mất khả năng đọc.
- **Không sửa file rồi bỏ dở việc khai báo.** Sửa xong phần nội dung mà chưa lan truyền đủ 6 điểm neo §4 thì coi như **chưa hoàn thành**, verdict là `FIX`.
- **Không tự ý đánh số `NN` trùng** với số đã dùng. Trước khi cấp số phải liệt kê dãy đang dùng.
- **Không xoá skill/agent cũ** để "dọn cho gọn". Chỉ thêm và sửa. Việc gỡ bỏ là quyết định của con người (§6).
- Không chép lại bảng Verdict / FACT / 06W / chuỗi biên vào file mới — chỉ trỏ tới `qa-system/core/QA_STANDARD.md`.

---

## 1. Bước 1 — Phân loại yêu cầu (Cây quyết định A / B / C)

Trả lời lần lượt 3 câu hỏi, dừng ở câu đầu tiên có đáp án:

```
 (1) Yêu cầu chỉ thay đổi HÀNH VI của một skill đang tồn tại
     (thêm trường output, siết luật, đổi format, bổ sung bước)?
        │
        └─ ĐÚNG ──────────────────────────────────► [C] TINH CHỈNH TẠI CHỖ
        └─ SAI  ──► xuống (2)

 (2) Có agent nào đang sở hữu ĐÚNG miền chuyên môn của nhiệm vụ mới này không?
     (tra bảng `specialized_agents` trong _system_map.json)
        │
        ├─ KHÔNG ─────────────────────────────────► [B] DỰNG AGENT MỚI
        └─ CÓ   ──► xuống (3)

 (3) Nếu giao việc này cho agent đó, nó có bị vượt quá MỘT vai trò không?
     Kiểm 3 dấu hiệu vượt vai trò:
       · Phải đọc loại artifact hoàn toàn khác (ví dụ: ảnh, code, log runtime)
       · Phải ghi vào phân vùng khác với phân vùng nó đang ghi
       · Mô tả "Là ai" trong AGENT.md phải viết thêm một mệnh đề "và cũng..."
        │
        ├─ CÓ (≥1 dấu hiệu) ──────────────────────► [B] DỰNG AGENT MỚI
        └─ KHÔNG ─────────────────────────────────► [A] THÊM SKILL VÀO AGENT ĐÃ CÓ
```

**Xuất ra bảng quyết định** (bắt buộc, kể cả khi người dùng đã chỉ định sẵn muốn làm gì):

| Mục | Nội dung |
|---|---|
| Yêu cầu gốc | *nguyên văn câu người dùng nói* |
| Miền chuyên môn | *ví dụ: kiểm thử khả năng tiếp cận (accessibility)* |
| Agent ứng viên | *tên agent gần nhất, hoặc `KHÔNG CÓ`* |
| Câu (1) / (2) / (3) | *Đúng / Sai kèm lý do một dòng* |
| **Kết luận** | **`[A]` / `[B]` / `[C]`** |
| Lý do chốt | *1–2 câu* |

> Nếu người dùng yêu cầu `[B]` nhưng cây quyết định ra `[A]` (hoặc ngược lại): **nêu khuyến nghị và lý do, rồi làm theo ý người dùng**. Đây là quyết định thuộc về con người (§6).

## 2. Bước 2 — Đặt đúng tầng (Tự kiểm 3 câu)

Trước khi viết một dòng nào, trả lời 3 câu của `qa-system/templates/README.md`:

| Câu hỏi | Nếu ĐÚNG thì nội dung thuộc về |
|---|---|
| Ràng buộc này **mọi** skill đều phải tuân? | `qa-system/core/QA_STANDARD.md` — **không** viết vào skill |
| Bảng chuẩn này có **≥ 2 skill** dùng? | `qa-system/core/QA_STANDARD.md` rồi trỏ tới |
| Đây là **dữ kiện của một tính năng cụ thể**? | `knowledge/features/<slug>.md` — **không** nhét vào skill |
| Còn lại (quy trình, tham số, format output của riêng việc này) | `agents/<agent>/skills/<ten-skill>.md` |
| Danh tính, quyền hạn, ranh giới, bàn giao | `agents/<agent>/AGENT.md` |

> Sai tầng là lỗi hay gặp nhất khi nâng cấp hệ thống. Bước này không được bỏ qua.

## 3. Bước 3 — Cấp số thứ tự `NN` cho deliverable mới

Chỉ áp dụng khi skill mới **sinh ra một file deliverable mới** trong `OUTPUT/<task-slug>/`.

1. Liệt kê dãy `NN` đang dùng bằng cách đọc bảng §2 của `qa-system/workflows/WORKFLOW.md`.
2. Cấp số **kế tiếp chưa dùng**. Không chèn vào giữa, không tái sử dụng số cũ.
3. Nếu deliverable là biến thể của một bước đã có (ví dụ bản rút gọn của `06`), dùng hậu tố chữ: `06b_`.

> Dãy tại thời điểm viết file này: `01`–`14` đã dùng. Số mới bắt đầu từ `15`.
> **Luôn kiểm tra lại thực tế**, đừng tin con số này nếu hệ thống đã được nâng cấp nhiều lần.

## 4. Bước 4 — Lan truyền ra 6 điểm neo (phần dễ quên nhất)

Đây là khác biệt giữa "sửa được file" và "hệ thống vẫn chạy". Đánh dấu từng dòng sau khi làm xong.

| # | Điểm neo | Phải cập nhật gì | `[A]` | `[B]` | `[C]` |
|---|---|---|:---:|:---:|:---:|
| **N1** | `agents/<agent>/skills/<ten>.md` | Nội dung skill, theo khuôn `qa-system/templates/skills/ten-skill.md`. Có frontmatter `name` + `description`, có mục `Format output`, có `Chốt chặn nghiệm thu` | ✅ | ✅ | ✅ |
| **N2** | `agents/<agent>/AGENT.md` | Thêm dòng vào `## Skill sở hữu` **và** bảng kỹ năng nếu agent đó có. Tên phải **khớp chính xác** tên file trong `skills/` | ✅ | ✅ | — |
| **N3** | `qa-system/workflows/WORKFLOW.md` | Bảng §2 (`# · Agent · Skill · Vào · Ra`). Thêm §1 nếu mở nhánh mới. Thêm §6 nếu có runbook mới | ✅ | ✅ | ⚠️ nếu đổi Vào/Ra |
| **N4** | `knowledge/_system_map.json` | `routing_table` (đường dẫn tắt tới skill) **và** `specialized_agents` (chỉ khi `[B]`) | ✅ | ✅ | — |
| **N5** | `qa-system/qa-lead/AGENT.md` | Dòng mới trong **Ma trận Điều phối §2** + dòng mới trong **Bảng ánh xạ ngôn ngữ tự nhiên §5** (người dùng nói gì thì kích hoạt cái này) | ✅ | ✅ | ⚠️ nếu đổi đầu ra |
| **N6** | `qa-system/tools/system/agent-doctor.js` | Thêm node vào `PIPELINE_DEPENDENCIES`: `skill`, `produces`, `consumed_by` | ⚠️ nếu sinh deliverable mới | ✅ | — |

Riêng `[B]` — dựng agent mới — làm **đủ 7 bước** của `qa-system/templates/README.md`, và bổ sung:

| # | Việc thêm của `[B]` |
|---|---|
| B-a | Tạo `agents/qa-<tên>/` và `agents/qa-<tên>/skills/` |
| B-b | `AGENT.md` copy từ `qa-system/templates/AGENT.md`, **thay hết** placeholder `<…>` |
| B-c | `AGENT.md` **bắt buộc** có mục `Human-Final` — nêu rõ quyết định nào không giao cho agent |
| B-d | Mục `Knowledge` mặc định là **không ghi** (chỉ `qa-analyst` được ghi — `QA_STANDARD.md` §8) |
| B-e | Cập nhật `README.md` gốc: bản đồ thư mục mục 1 |
| B-f | Nếu agent mở nhánh mới → khai vào bảng §1 của `WORKFLOW.md` |

## 5. Bước 5 — Cổng nghiệm thu "hệ thống vẫn chạy mượt"

Chạy đủ 4 kiểm tra, ghi lại kết quả thật (không được ghi "OK" mà chưa chạy):

| # | Kiểm tra | Lệnh | Đạt khi |
|---|---|---|---|
| G1 | Toàn vẹn cấu trúc | `npm run agent:check` | Không có lỗi cấu trúc; mọi skill khai trong `AGENT.md` đều tồn tại file thật |
| G2 | Bán kính ảnh hưởng | `npm run agent:check -- --impact <agent>` | Liệt kê được đúng danh sách bước bị ảnh hưởng; mỗi bước đó đã được rà lại |
| G3 | Đồng bộ bản đồ | `npm run map:sync` | `_system_map.json` cập nhật, mở lại thấy có mục mới |
| G4 | Smoke luồng cũ | Chạy lại **một chặng cũ bất kỳ không liên quan** tới thay đổi | Ra đúng deliverable như trước, verdict không đổi |

**Kiểm tra thủ công bắt buộc** (công cụ không bắt được):

- [ ] Mở `AGENT.md` — danh sách `## Skill sở hữu` khớp **từng dòng** với tên file trong `skills/`
- [ ] Mọi đường dẫn viết đúng hoa/thường: `OUTPUT/` · `INPUT/` · `agents/qa-*/` · `qa-system/workflows/`
- [ ] Không còn placeholder `<…>` sót lại trong file mới
- [ ] Skill mới ghi **đúng một** file output, có dòng meta `Owner · Nguồn · Verdict`
- [ ] Người dùng gõ câu tự nhiên tương ứng thì QA Leader định tuyến đúng tới skill mới (thử 1 câu thật)

Lệnh rà đường dẫn sai nhanh:

```bash
grep -rn "output/\|_shared/\|workflow/[a-z]" --include=*.md agents knowledge | grep -v "workflows/"
```

Không in ra gì là sạch.

## 6. Human-Final — không tự quyết

Skill này **đề xuất**, người dùng **quyết**:

- Chọn `[A]` hay `[B]` khi ranh giới mập mờ — ranh giới vai trò agent là quyết định thiết kế của con người.
- **Gỡ bỏ** hoặc thay thế skill/agent đang có.
- Sửa `qa-system/core/QA_STANDARD.md` — đụng vào hiến pháp tầng luật chung.
- Đổi thứ tự các chặng trong pipeline chính.
- Chấp nhận nâng cấp khi cổng nghiệm thu §5 chưa xanh hết.

## Format output

Ghi ra `OUTPUT/_upgrades/<YYYY-MM-DD>_<ten-nang-cap>.md`:

````markdown
# BIÊN BẢN NÂNG CẤP HỆ THỐNG · <ten-nang-cap>
Owner: qa-system/qa-lead/skills/system-upgrade-governance.md · Ngày: <YYYY-MM-DD> · Verdict: <PASS/FIX/ASK>

## 1. Yêu cầu gốc
<nguyên văn câu người dùng nói / mô tả file người dùng đưa>

## 2. Bảng quyết định (cây A/B/C)
| Mục | Nội dung |
|---|---|
| Miền chuyên môn | <…> |
| Agent ứng viên | <…> |
| Câu (1) | <Đúng/Sai — lý do> |
| Câu (2) | <Đúng/Sai — lý do> |
| Câu (3) | <Đúng/Sai — lý do> |
| **Kết luận** | **[A] / [B] / [C]** |

## 3. Đặt tầng
| Nội dung | Đặt vào tầng | Lý do |
|---|---|---|
| <…> | <AGENT.md / skills/ / QA_STANDARD.md / knowledge/> | <…> |

## 4. Lan truyền 6 điểm neo
| # | Điểm neo | File đã sửa | Nội dung thay đổi | Trạng thái |
|---|---|---|---|---|
| N1 | skills/ | `agents/…/….md` | <…> | ĐÃ XONG |
| N2 | AGENT.md | `agents/…/AGENT.md` | <…> | ĐÃ XONG |
| N3 | WORKFLOW.md | §2 bảng điều phối | <…> | ĐÃ XONG |
| N4 | _system_map.json | routing_table | <…> | ĐÃ XONG |
| N5 | qa-lead/AGENT.md | §2 + §5 | <…> | ĐÃ XONG |
| N6 | agent-doctor.js | PIPELINE_DEPENDENCIES | <…> | KHÔNG ÁP DỤNG |

## 5. Cổng nghiệm thu
| # | Kiểm tra | Kết quả thật |
|---|---|---|
| G1 | `npm run agent:check` | <dán output rút gọn> |
| G2 | `--impact <agent>` | <danh sách bước bị ảnh hưởng> |
| G3 | `npm run map:sync` | <đã cập nhật mục nào> |
| G4 | Smoke luồng cũ | <chặng nào, kết quả> |

## 6. Rủi ro còn lại & việc cần người quyết
- <…>
````

## Chốt chặn nghiệm thu (Quality Gates)

- [ ] Có bảng quyết định A/B/C với lý do tường minh cho **cả 3 câu** của cây quyết định — không kết luận suông.
- [ ] Mọi điểm neo trong bảng §4 áp dụng cho nhánh đã chọn đều ở trạng thái `ĐÃ XONG` hoặc `KHÔNG ÁP DỤNG` **kèm lý do**; còn dòng nào trống → `Verdict: FIX`.
- [ ] 4 cổng `G1`–`G4` có **kết quả thật** đã chạy, không phải dự đoán; cổng nào đỏ → `Verdict: FIX`.
- [ ] Tên skill trong `## Skill sở hữu` khớp chính xác tên file trên đĩa.
- [ ] Biên bản xuất đúng đường dẫn `OUTPUT/_upgrades/<YYYY-MM-DD>_<ten-nang-cap>.md`.
- [ ] Không có nội dung nào đặt sai tầng theo bảng tự kiểm §2.

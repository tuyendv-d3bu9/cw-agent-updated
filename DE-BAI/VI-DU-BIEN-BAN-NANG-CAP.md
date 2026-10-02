# VÍ DỤ — Biên Bản Nâng Cấp Đã Điền Đầy Đủ

> Đây là **bản mẫu tham khảo**, không phải bài của học viên nào.
> Nội dung là lần nâng cấp có thật đã thực hiện trên chính repo này: thêm skill `system-upgrade-governance` cho QA Leader — tức là thêm cho hệ thống năng lực tự nâng cấp chính nó.
>
> Đọc file này để biết một biên bản đạt yêu cầu trông như thế nào. Biên bản của bạn đặt tại `OUTPUT/_upgrades/<ngày>_<tên>.md`.

---

# BIÊN BẢN NÂNG CẤP HỆ THỐNG · system-upgrade-governance
Owner: agents/qa-lead/skills/system-upgrade-governance.md · Ngày: 2026-09-21 · Verdict: **PASS**

## 1. Yêu cầu gốc

> *"Học viên sẽ chat với QA Leader để nâng cấp skill, hoặc đưa vào một file skill.md rồi hỏi nên thêm agent mới hay thêm vào agent đã có. Nếu thêm mới phải biết update luồng; nếu thêm vào cái đã có phải biết sắp xếp vào ra sao. Cứ mỗi lần nâng cấp thì hệ thống vẫn phải chạy mượt."*

## 2. Bảng quyết định (cây A/B/C)

| Mục | Nội dung |
|---|---|
| Miền chuyên môn | Quản trị và tiến hoá chính bộ agent (meta — không phải kiểm thử sản phẩm) |
| Agent ứng viên | `qa-lead` |
| **Câu (1)** — chỉ thay đổi hành vi của một skill đang có? | **Sai.** Hệ thống chưa có skill nào làm việc này. `agents/templates/README.md` có 7 bước nhưng đó là tài liệu cho **người đọc**, không phải quy trình cho **agent thực thi** |
| **Câu (2)** — có agent nào sở hữu đúng miền chuyên môn này? | **Có — `qa-lead`.** Nó đã giữ bản đồ toàn cục: đọc `_system_map.json`, nắm ma trận điều phối, biết ai làm gì. Không sub-agent nào có tầm nhìn đó |
| **Câu (3)** — giao việc này cho `qa-lead` có làm nó vượt quá một vai trò không? | **Không.** Rà ba dấu hiệu: *(a)* Artifact phải đọc — vẫn là file `.md` và `.json` của hệ thống, đúng loại nó vẫn đọc. *(b)* Phân vùng ghi — có mở rộng sang `agents/`, nhưng đây là hệ quả tất yếu của vai trò điều phối, không phải miền mới. *(c)* Mô tả "Là ai" — vẫn là "tổng chỉ huy điều phối và nghiệm thu", không phải thêm mệnh đề "và cũng…" |
| **Kết luận** | **`[A]` — Thêm skill mới vào agent đã có** |
| Lý do chốt | Dựng một agent riêng kiểu `qa-architect` sẽ tạo nghịch lý: agent đó cần bản đồ toàn cục để đánh giá bán kính ảnh hưởng, mà bản đồ toàn cục vốn đã là tài sản của `qa-lead`. Tách ra là nhân đôi trách nhiệm ở hai chỗ, dễ lệch nhau |

## 3. Đặt tầng

| Nội dung | Đặt vào tầng | Lý do |
|---|---|---|
| Cây quyết định A/B/C, bảng 6 điểm neo, 4 cổng nghiệm thu | `agents/qa-lead/skills/system-upgrade-governance.md` | Là **quy trình** — thuộc tầng "LÀM THẾ NÀO" |
| Tuyên bố "QA Leader tự làm việc này, không uỷ quyền" | `agents/qa-lead/AGENT.md` §2.1 | Là **danh tính và quyền hạn** — thuộc tầng "LÀ AI" |
| Ràng buộc kỹ thuật của ShopGo (không có router, cấm `page.goto`) | `knowledge/_project.md` §6 | Là **dữ kiện của hệ thống dưới thử nghiệm** — thuộc tầng "TRI THỨC" |
| Bản đồ locator ShopGo | `knowledge/features/shopgo-ui-map.md` | Dữ kiện chi tiết của một hệ thống cụ thể |
| **Không** sửa `agents/core/QA_STANDARD.md` | — | Thay đổi này chỉ áp cho **một** skill, chưa đạt ngưỡng "≥ 2 skill dùng chung". Đụng vào hiến pháp tầng luật chung là làm vỡ mọi agent cùng lúc |

## 4. Lan truyền 6 điểm neo

| # | Điểm neo | File đã sửa | Nội dung thay đổi | Trạng thái |
|---|---|---|---|---|
| **N1** | `skills/` | `agents/qa-lead/skills/system-upgrade-governance.md` | Tạo mới. Có frontmatter, cây quyết định, bảng 6 điểm neo, 4 cổng nghiệm thu, `Format output`, `Chốt chặn nghiệm thu` | **ĐÃ XONG** |
| **N2** | `AGENT.md` | `agents/qa-lead/AGENT.md` | Thêm mục §2.1 `Skill Sở Hữu Của Chính QA Leader`, kèm lý do vì sao không uỷ quyền cho sub-agent | **ĐÃ XONG** |
| **N3** | `WORKFLOW.md` | `agents/workflows/WORKFLOW.md` | Mở **nhánh E — Quản trị hệ thống** ở bảng §1; thêm bảng điều phối riêng cho nhánh E ở §2; khai runbook mới vào §6 | **ĐÃ XONG** |
| **N4** | `_system_map.json` | `knowledge/_system_map.json` | Thêm 8 lối tắt vào `routing_table`; bổ sung `skills_path` cho `qa_lead`; thêm khối `sut` mô tả ShopGo | **ĐÃ XONG** |
| **N5** | `qa-lead/AGENT.md` | `agents/qa-lead/AGENT.md` | Thêm 1 dòng vào Ma trận Điều phối §2; thêm **4 dòng** vào Bảng ánh xạ ngôn ngữ tự nhiên §5 (4 kiểu câu người dùng sẽ nói) | **ĐÃ XONG** |
| **N6** | `agent-doctor.js` | — | **KHÔNG ÁP DỤNG.** `PIPELINE_DEPENDENCIES` mô tả quan hệ giữa các deliverable **đánh số** của pipeline kiểm thử (`01`–`14`). Skill này không sinh deliverable đánh số — nó ghi vào `OUTPUT/_upgrades/` và tác động lên chính `agents/`. Không có bước nào tiêu thụ đầu ra của nó | **KHÔNG ÁP DỤNG** |

> **Chú ý cách viết N6.** Ghi "KHÔNG ÁP DỤNG" suông sẽ bị trừ điểm. Phải nêu được **lý do kỹ thuật** vì sao không áp dụng.

## 5. Cổng nghiệm thu

| # | Kiểm tra | Kết quả thật |
|---|---|---|
| **G1** | `npm run agent:check` | `🎉 100% SYSTEM INTEGRITY VERIFIED` — cả 9 agent đều `✅ OK`, kể cả `qa-lead` sau khi có thêm thư mục `skills/` |
| **G2** | Bán kính ảnh hưởng | Skill mới không nằm trong chuỗi phụ thuộc của pipeline `01`–`14`, nên không bước nào bị ảnh hưởng. Rủi ro thật nằm ở chỗ khác: `qa-lead/AGENT.md` bị sửa, mà file này chi phối **toàn bộ** định tuyến → đã xử lý ở G4 |
| **G3** | `npm run map:sync` | `✅ Successfully synchronized system map`. Kiểm lại JSON: `routing_table` có 26 khoá, `specialized_agents.qa_lead.skills_path` đã có |
| **G4** | Smoke luồng cũ | Chạy `npm run test:e2e` — **5/5 ca xanh** trong 15,2 giây. Ma trận điều phối cũ đọc lại vẫn đủ 14 dòng, không dòng nào bị đè |

**Kiểm tra thủ công:**

- [x] `## Skill sở hữu` khớp đúng tên file `system-upgrade-governance.md` trên đĩa
- [x] Đường dẫn viết đúng hoa/thường: `OUTPUT/` · `INPUT/` · `agents/qa-*/` · `agents/workflows/`
- [x] Không còn placeholder `<…>` ngoài khối `Format output` (đó là khuôn mẫu, cố ý giữ)
- [x] Skill ghi đúng một file output, có dòng meta `Owner · Ngày · Verdict`
- [x] Thử câu thật *"hãy giúp tôi nâng cấp skill test-case-generation"* → định tuyến đúng tới skill mới

## 6. Rủi ro còn lại & việc cần người quyết

| Rủi ro | Mức | Ghi chú |
|---|---|---|
| Skill này được phép ghi vào `agents/` — phân vùng mà mọi agent khác bị cấm ghi | **Cao** | Đây là ngoại lệ có chủ ý và **duy nhất**. Đã ghi rõ trong phần mở đầu của skill. Nếu sau này có skill thứ hai xin quyền tương tự thì phải xem lại thiết kế |
| Quyết định `[A]` hay `[B]` khi ranh giới mập mờ | Trung bình | Skill chỉ **đề xuất**. Người dùng quyết. Đã ghi vào mục `Human-Final` §6 |
| Dãy số `NN` ghi cứng trong skill (`01`–`14` đã dùng) sẽ lạc hậu sau vài lần nâng cấp | Thấp | Skill đã tự cảnh báo: *"Luôn kiểm tra lại thực tế, đừng tin con số này"* |
| Chưa có cách kiểm tự động việc "đã lan truyền đủ điểm neo chưa" | Trung bình | Hiện phụ thuộc vào kỷ luật của người thực hiện. Đây là **cơ hội cải tiến** cho học viên nào muốn lấy điểm thưởng: mở rộng `agent-doctor.js` để kiểm chéo giữa `AGENT.md`, `WORKFLOW.md` và `_system_map.json` |

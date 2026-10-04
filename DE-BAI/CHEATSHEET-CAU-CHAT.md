# BỘ CÂU CHAT MẪU — Ra Lệnh Cho Hệ Thống Agent QA

> Dùng được với **mọi** Agent Coding: Antigravity IDE · Claude Code · Cursor · GitHub Copilot.
> Bạn **không cần** nhớ đường dẫn file, không cần gõ lệnh terminal. Cứ nói tiếng Việt bình thường.

---

## 0. Lạc đường thì gõ gì

Không nhớ gì cả, chỉ cần một câu:

```
Tôi nên làm gì tiếp?
```

Agent chạy `npm start` và trả lời: đang ở đâu, làm gì tiếp, thư mục nào là của bạn.
Dùng được ở **mọi thời điểm**, kể cả khi bạn quên sạch mình đang làm dở cái gì.

---

## 0b. Câu mở đầu phiên làm việc

Gõ câu này **đầu tiên** mỗi khi mở IDE lên:

```
Chào QA Leader. Đọc AGENTS.md và knowledge/_system_map.json để nắm luật dự án.
Hôm nay tôi làm đề <số>, task-slug là <slug>. Cho tôi biết hệ thống hiện có gì
và ta bắt đầu từ đâu.
```

Nếu agent bắt đầu đọc lung tung hoặc quên luật giữa chừng, gõ lại câu này để kéo nó về.

---

## 1. PHẦN A — Nâng cấp hệ thống

### 1.1. Hỏi trước khi làm (luôn nên làm bước này)

```
QA Leader, tôi muốn <mô tả nhu cầu bằng lời thường>.
Phân tích giúp tôi: nên thêm skill vào agent đã có, hay phải dựng agent mới?
Chưa sửa gì vội, cho tôi xem bảng quyết định trước.
```

### 1.2. Chốt phương án và thi công

```
Chốt phương án đó. Thi công đi, nhớ lan truyền đủ 7 điểm neo.
Điểm nào không áp dụng thì ghi rõ lý do, đừng bỏ trống.
```

### 1.3. Kiểm tra sau khi nâng cấp

```
Nâng cấp xong rồi. Chạy cổng nghiệm thu và cho tôi xem kết quả thật,
đừng chỉ nói là OK.
```

```
Sửa cái này có ảnh hưởng tới bước nào khác không? Phân tích bán kính ảnh hưởng cho tôi.
```

### 1.4. Bắt agent tự rà lại khi nghi ngờ làm dối

```
Bạn đã khai skill mới vào AGENT.md chưa? Vào WORKFLOW.md chưa?
Vào _system_map.json chưa? Liệt kê bảng 7 điểm neo cho tôi xem.
```

```
Kiểm tra giúp tôi: nếu bây giờ tôi nói "<câu người dùng sẽ nói>"
thì QA Leader có định tuyến đúng tới skill mới không?
```

### 1.5. Khi bạn đã có sẵn file skill muốn đưa vào hệ thống

```
Tôi có file <đường dẫn file>.md này. Xem giúp tôi nội dung trong đó
nên đặt vào tầng nào, thuộc agent nào, và cần khai báo ở đâu.
```

---

## 2. PHẦN B — Chạy pipeline

### 2.1. Khởi động một mạch

```
Đọc qa-system/workflows/run-graduation.md và thực hiện với task-slug = <slug>.
```

### 2.2. Điều khiển tiến độ

| Bạn muốn | Gõ |
|---|---|
| Xem đang làm tới đâu | `Tiến độ thế nào rồi?` |
| Chạy tiếp chặng dang dở | `Làm tiếp đi` |
| Chạy lại một chặng | `Chạy lại Chặng <số>` |
| Dừng để xem kết quả | `Dừng lại, cho tôi xem kết quả Chặng <số>` |
| Ép chạy đúng quy trình | `Chạy đúng từng chặng một, sau mỗi chặng in verdict rồi mới sang bước sau` |

### 2.3. Khi gặp `Verdict: ASK` — bạn đóng vai BA

```
Tôi trả lời thay BA:
1. <câu hỏi 1> -> <quyết định của bạn>
2. <câu hỏi 2> -> <quyết định của bạn>
3. <câu hỏi 3> -> <quyết định của bạn>

Ghi vào knowledge/features/<slug>.md mục 7 và mục 8, người phê duyệt ghi tên tôi,
ngày hôm nay. Rồi chạy lại Chặng 2.
```

Kiểm tra agent có thật sự ghi nhớ không:

```
Chặng 2 lần này có hỏi lại câu nào tôi đã trả lời không? Nếu có thì bạn chưa đọc knowledge.
```

> ⚠️ **Cổng ASK là chặn cứng bằng máy, không phải lời hứa của agent.**
> Khi còn câu hỏi treo, hệ thống **từ chối ghi** file Chặng 3→6 — câu *"cứ làm tiếp đi"*
> không mở được. Muốn xem cổng đang mở hay đóng:
>
> ```
> Cho tôi xem các câu hỏi đang treo
> ```
>
> Agent chạy `npm run gate <slug>` và đọc kết quả thật. Cổng chỉ mở khi câu trả lời
> được ghi vào `knowledge/features/<slug>.md` — tức là có dấu vết, không phải nói miệng.

### 2.4. Khi phát hiện tài liệu BA sai so với hệ thống thật

```
Tài liệu §<mục> ghi là <X>, nhưng hệ thống thật chạy ra <Y>.
Đừng sửa tài liệu. Ghi thành một dòng Open Question trong knowledge, nêu rõ
tài liệu nói gì, thực tế thế nào, và đề xuất hướng xử lý để tôi chốt với BA.
```

---

## 3. Automation

### 3.1. Bắt đầu

```
Đã có 06_coverage_review rồi. Giờ chuyển sang automation trên
https://cwshopgo.github.io, ticket là <mã ticket>.
Đọc knowledge/features/shopgo-ui-map.md trước khi sinh Page Object.
```

### 3.2. Siết chất lượng code

```
Rà lại Page Object giúp tôi: còn dòng page.goto nào ngoài BasePage.open() không?
ShopGo không có router, chuyển màn phải bấm nút nav.
```

```
Tái sử dụng BasePage, ShopPage, CheckoutPage, LoginModal có sẵn.
Đừng viết lại lớp trùng lặp.
```

```
So sánh tiền phải dùng BasePage.parseMoney(), đừng so chuỗi thô.
```

### 3.3. Chạy và thu bằng chứng

```
Chạy bộ test và xuất kết quả vào OUTPUT/<slug>/runs/<ticket>/run_result.md,
ảnh bằng chứng vào evidence/.
```

### 3.4. Khi test đỏ

```
Ca <tên ca> đang đỏ. Phân tích giúp tôi: đây là lỗi của kịch bản test,
hay là hệ thống thật chạy khác tài liệu? Dẫn bằng chứng.
```

---

## 3b. Ba cổng chất lượng chạy bằng máy

Hệ thống có ba cổng tự kiểm. Biết gọi chúng thì không phải tin lời agent.

| Muốn biết | Nói với agent | Agent chạy ngầm |
|---|---|---|
| Còn câu hỏi nào chưa chốt không | *"Cho tôi xem các câu hỏi đang treo"* | `npm run gate <slug>` |
| Test case đã đạt chuẩn 8 trường chưa | *"Kiểm tra test case có đạt chuẩn không"* | `npm run lint -- <slug>` |
| Đã đủ chín để làm automation chưa | *"Kiểm tra độ sẵn sàng giúp tôi"* | `npm run readiness -- <slug>` |

Câu ép agent đưa bằng chứng thật:

```
Dán nguyên văn kết quả của cả ba cổng vào đây. Tôi không cần bạn tóm tắt.
```

Nếu BA đã trả lời mà agent quên ghi vào tri thức:

```
Các câu BA đã chốt ở Chặng 2 đã được ghi vào knowledge chưa? Nếu chưa thì đồng bộ ngay.
```

> Agent chạy `npm run knowledge:sync -- <slug> --write`. Việc này quan trọng vì
> `OUTPUT/` có thể xoá đi chạy lại — câu trả lời của BA chỉ sống nếu nằm trong `knowledge/`.

---

## 3c. Tạo workflow bằng lời, chạy bằng câu ngắn

Workflow là một quy trình bạn **mô tả một lần**, rồi từ đó chỉ cần **một câu** là chạy.
Bạn không viết file nào — agent dựng và máy kiểm.

**Bước 1 — Mô tả.** Nói thẳng quy trình bạn muốn, theo thứ tự, kèm chỗ phải dừng chờ BA:

```
Tôi muốn tạo workflow: mỗi khi BA gửi tài liệu mới thì phân tích rủi ro, quét kẽ hở,
nếu còn câu hỏi thì dừng lại hỏi BA, rồi mới chọn viewpoint, thiết kế test idea,
sinh test case và kiểm chuẩn trước khi báo xong.
```

Agent dựng file, kiểm hợp lệ bằng máy, rồi **trình bày bảng bước + câu để chạy** và chờ bạn.
Nó **không tự chạy ngay**. Muốn chỉnh thì nói tiếp, ví dụ: *"Thêm bước nghiệm thu trước khi báo xong"*.

**Bước 2 — Bắt agent chứng minh.**

```
Cho tôi xem kết quả kiểm hợp lệ thật của workflow vừa tạo, và nói tôi gõ câu nào để chạy.
```

**Bước 3 — Kích hoạt bằng câu ngắn.** Chỉ cần nói như người bình thường:

```
BA vừa gửi tài liệu mới
```

Agent tìm đúng workflow, ghi checklist vào `00_plan.md`, rồi làm từng bước và **dừng ở mọi cổng**.
Câu quá mơ hồ thì nó hỏi lại chứ không đoán. Muốn biết có những gì: *"Có những workflow nào?"*

> ⚠️ **Workflow không thể lách cổng.** Máy từ chối workflow có bước Chặng 3→6 mà thiếu cổng ASK,
> hay bước automation mà thiếu kiểm độ sẵn sàng và xác nhận của bạn. Nếu bạn bảo agent bỏ cổng,
> nó sẽ giải thích và từ chối — đó là thiết kế, không phải lỗi.

Với bài thi: câu *"chạy bài tốt nghiệp"* kích hoạt runbook `run-graduation`.

---

## 4. Câu dùng để ép agent làm đúng

Học viên hay quên: agent rất dễ "chạy tắt". Đây là các câu kéo nó về khuôn khổ.

| Triệu chứng | Câu chữa |
|---|---|
| Nhảy thẳng ra test case, bỏ các chặng giữa | `Quay lại. Chạy đúng thứ tự từng chặng, sau mỗi chặng dừng in verdict.` |
| Bịa quy tắc không có trong tài liệu | `Quy tắc này lấy từ đâu? Dẫn nguồn trong INPUT hoặc knowledge. Không có nguồn thì phải gắn nhãn [GIẢ ĐỊNH].` |
| Test data còn placeholder | `Test Data đang là placeholder. Thay bằng giá trị thật, đúng định dạng tiền của knowledge/_project.md.` |
| Báo xong nhưng chưa chạy kiểm tra | `Bạn đã chạy thật chưa hay chỉ đoán? Dán kết quả thật vào đây.` |
| Sửa file rồi dừng, quên khai báo | `Sửa xong chưa phải là xong. Liệt kê bảng 7 điểm neo cho tôi.` |
| Đọc dò lung tung tốn thời gian | `Đọc knowledge/_system_map.json trước, đừng quét mò cả thư mục.` |
| Tự ý làm automation khi chưa cho phép | `Tôi chưa yêu cầu automation. Dừng ở Chặng 6.` |
| Quên cập nhật bảng tiến độ | `Cập nhật _index.md và 00_plan.md cho tôi.` |

---

## 5. Câu kết thúc phiên — chuẩn bị nộp bài

```
Tổng kết giúp tôi:
- Đã nâng cấp gì ở Phần A, chạm những điểm neo nào
- Số Business Rule, số câu ASK đã chốt, số test case, số ca automation PASS/FAIL
- Những chỗ tài liệu lệch so với hệ thống thật
Viết vào BAO-CAO.md theo mẫu ở DE-BAI/README.md mục 8.
```

```
Tôi làm xong rồi. Đọc và làm đúng theo file DE-BAI/NOP-BAI.md để kiểm tra
và đóng gói bài nộp. Tự chạy mọi lệnh, đừng bảo tôi gõ terminal.
```

Câu này tự chạy lại kiểm tra toàn vẹn, đồng bộ bản đồ, đối soát số liệu báo cáo và nén zip đúng tên.

---

## 6. Ba nguyên tắc khi nói chuyện với Agent

**1. Nói mục tiêu, đừng nói đường dẫn.**
Thay vì *"mở file qa-system/qa-test-design/skills/test-case-generation.md"*, hãy nói *"tôi muốn nâng cấp skill sinh test case"*. Agent tự tra bản đồ.

**2. Yêu cầu bằng chứng, đừng tin lời khai.**
Agent rất hay nói "đã hoàn thành". Luôn hỏi lại *"cho tôi xem kết quả thật"*.

**3. Hỏi trước, sửa sau.**
Với mọi thay đổi hệ thống, luôn bắt agent phân tích bán kính ảnh hưởng **trước khi** sửa. Sửa xong mới phát hiện vỡ luồng thì mất gấp đôi thời gian.

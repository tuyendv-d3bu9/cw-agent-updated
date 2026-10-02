# NỘP BÀI — Runbook đóng gói bài thi

> **File này để AI Agent CHẠY, không phải để học viên đọc.**
> Dùng khi học viên đã làm xong bài. Học viên dán **câu nộp bài** dưới đây vào AI Agent.
>
> Mục tiêu: mọi bài nộp **cùng một chuẩn**: đúng tên file, đúng cấu trúc, số liệu trong `BAO-CAO.md` khớp file thật. Bộ kiểm tra ở Bước 2 bám theo **đúng bộ tiêu chí giảng viên dùng khi chấm** (`DE-BAI/RUBRIC.md`), nên học viên biết trước chỗ nào sẽ bị trừ điểm.

## Câu nộp bài (học viên dán nguyên văn)

```
Tôi làm xong rồi. Đọc và làm đúng theo file DE-BAI/NOP-BAI.md để kiểm tra
và đóng gói bài nộp. Tự chạy mọi lệnh, đừng bảo tôi gõ terminal.
```

---

## Luật khi chạy file này

| # | Luật |
|---|---|
| L1 | **Tự chạy mọi lệnh.** Không bảo học viên gõ terminal |
| L2 | **Không âm thầm sửa bài.** Kiểm tra thấy thiếu thì báo và hỏi học viên. Chỉ sửa khi học viên đồng ý, và sửa theo đúng runbook của phần đó (`run-graduation.md`, skill tương ứng) |
| L3 | **Không bịa số liệu.** Mọi con số trong `BAO-CAO.md` phải **đếm từ file thật** ở Bước 3 |
| L4 | **File zip đặt ngoài repo**, ở thư mục cha của repo, để zip không tự chứa chính nó và không sinh file rác trong repo |
| L5 | **Không nộp hộ.** Agent chỉ đóng gói. Học viên tự gửi file zip cho giảng viên |
| L6 | **Dán kết quả thật** của mọi lệnh. Không ghi "OK" khi chưa chạy |

---

## Bước 0 — Đọc phiên làm bài

Đọc `OUTPUT/_session.md`. Lấy ra: **Họ tên · Đề · `task-slug` · Tên file nộp bài**.

| Tình huống | Xử lý |
|---|---|
| Không có `OUTPUT/_session.md` | DỪNG. Bảo học viên chạy `DE-BAI/BAT-DAU.md` trước (câu khởi động trong `DE-BAI/SETUP.md` §2), rồi quay lại |
| Có file | In lại 4 thông tin trên và hỏi: *"Đúng thông tin của bạn chưa?"* Sai thì DỪNG. **Bước nộp bài không phải chỗ để đổi đề**: muốn đổi đề hoặc sửa họ tên, email thì chạy lại `DE-BAI/BAT-DAU.md` trước, rồi quay lại đây |

Bảng tra theo đề:

| | DE-01 | DE-02 |
|---|---|---|
| `task-slug` | `shopgo-voucher` | `shopgo-cart-qty` |
| Biên bản Phần A | `OUTPUT/_upgrades/*_boundary-profile.md` | `OUTPUT/_upgrades/*_regression-suite-selection.md` |
| File automation | `automation/tests/voucher.spec.ts` | `automation/tests/cart-quantity.spec.ts` |

## Bước 1 — Kiểm tra toàn vẹn & đồng bộ bản đồ lần cuối

| # | Lệnh | Đạt khi |
|---|---|---|
| 1 | `npm run agent:check` | Dòng cuối là `🎉 TOÀN VẸN: agent · skill · bản đồ · workflow · package · cổng ASK đều khớp.`, exit code `0` |
| 2 | `npm run map:sync` | Có dòng `✅ Successfully synchronized system map` |

`agent:check` báo lỗi thì thường là tên skill khai trong `AGENT.md` không khớp file thật (trừ 4 điểm, P5). Báo học viên và hỏi có muốn sửa trước khi nộp không.

## Bước 2 — Kiểm tra trước (theo tiêu chí chấm)

Kiểm **đủ** các dòng sau. Mỗi dòng ghi `ĐẠT` hoặc `CẢNH BÁO` kèm chi tiết:

| # | Kiểm tra | Đạt khi |
|---|---|---|
| K1 | Thư mục bắt buộc | Có `qa-system/` · `OUTPUT/<task-slug>/` · `OUTPUT/_upgrades/` · `knowledge/` · `automation/pages/` · `automation/tests/` |
| K2 | File pipeline | `OUTPUT/<task-slug>/` có `00_plan.md`, `_index.md`, và đủ 6 file bắt đầu bằng `01_` … `06_` |
| K3 | Knowledge của đề | Có `knowledge/features/<task-slug>.md`, mục 8 có **ít nhất 3** giả định đã chốt kèm người phê duyệt và ngày |
| K4 | Biên bản Phần A | Có đúng file biên bản của đề (bảng Bước 0) |
| K5 | File automation | Có đúng file `.spec.ts` của đề (bảng Bước 0) |
| K6 | Kết quả chạy | Có ít nhất một `OUTPUT/<task-slug>/runs/*/run_result.md` và thư mục `evidence/` có ảnh |
| K7 | Ca `FAIL` có giải trình | Nếu `run_result.md` có ca `FAIL` thì phải có `run_defects.md` cùng thư mục |
| K8 | Bắt buộc dùng thành quả A vào B | DE-01: `05_test_case_spec.md` có trường `Boundary Profile`. DE-02: có file đầu ra của skill `regression-suite-selection` trong `OUTPUT/shopgo-cart-qty/` |
| K9 | Dấu hiệu `page.goto` | Tìm `page.goto(` trong `automation/**/*.ts`, **bỏ qua** `automation/pages/BasePage.ts`. Có kết quả thì `CẢNH BÁO` (trừ 5 điểm, P6) |
| K10 | File rác | Không có file mới do bài làm sinh ra nằm ngoài `OUTPUT/`, `automation/`, `qa-system/`, `knowledge/` và `BAO-CAO.md`. Dùng `git status --short` để xem (trừ 3 điểm, P4) |
| K11 | `INPUT/` nguyên vẹn | `git status --short INPUT/` **không** có dòng nào. Có thì `CẢNH BÁO` nghiêm trọng (trừ 10 điểm, P1) |
| K12 | `BAO-CAO.md` | Có ở thư mục gốc, đủ 4 mục theo mẫu `DE-BAI/README.md` §8 (kiểm tiếp ở Bước 3) |

Có `CẢNH BÁO` thì in danh sách cho học viên và hỏi:

```
Còn <n> cảnh báo ở trên. Bạn muốn:
  (1) Sửa các mục này trước rồi nộp
  (2) Vẫn đóng gói như hiện tại
```

Chọn (1) → giúp học viên sửa từng mục (theo L2), rồi **chạy lại Bước 2**. Chọn (2) → ghi nhận và sang Bước 3.

## Bước 3 — Đối soát `BAO-CAO.md` với file thật

Đếm từ file thật:

| Số liệu | Đếm ở đâu |
|---|---|
| Số Business Rule | Số mã `BR-xx` khác nhau trong `01_requirement_risk_summary.md` |
| Số câu ASK đã chốt | Số dòng `Confirmed` ở mục 7 của `knowledge/features/<task-slug>.md` |
| Số test case thiết kế | Số `TC_ID` khác nhau trong `05_test_case_spec.md` |
| Số ca tự động hoá | Số lệnh `test(` trong file automation của đề |
| Kết quả chạy | Số `PASS` / `FAIL` trong `run_result.md` mới nhất |

| Tình huống | Xử lý |
|---|---|
| Chưa có `BAO-CAO.md` | Hỏi học viên có muốn lập ngay theo mẫu `DE-BAI/README.md` §8 không. Có → điền số liệu **đúng bảng vừa đếm**, và soạn mục 1, 3, 4 từ biên bản Phần A và knowledge. Xong thì cho học viên đọc lại và sửa trước khi đóng gói |
| Có, nhưng số liệu lệch | In bảng so sánh *"Báo cáo ghi · File thật"*, hỏi học viên có sửa theo file thật không (C1 chấm việc số liệu khớp) |
| Có và khớp | Ghi `ĐẠT` |

Dòng đầu `BAO-CAO.md` phải theo mẫu: `Học viên: <họ tên> · Email: <email> · Đề: <số> · Ngày: <YYYY-MM-DD>`, và khớp `OUTPUT/_session.md`.

## Bước 4 — Ghi nhận vào file phiên

Thêm vào **cuối** `OUTPUT/_session.md` (làm **trước** khi nén để zip chứa luôn mục này):

```markdown
## 4. Nộp bài
| Mục | Kết quả thật |
|---|---|
| Ngày giờ đóng gói | <YYYY-MM-DD HH:mm> |
| agent:check / map:sync | <trích dòng kết quả> |
| Kiểm tra trước K1–K12 | <n ĐẠT · n CẢNH BÁO: liệt kê mã> |
| Đối soát BAO-CAO.md | <ĐẠT / đã sửa / còn lệch: …> |
| File nộp | <tên file zip> |
```

Nộp lại lần sau thì **thay** mục 4 cũ, không thêm mục mới.

## Bước 5 — Đóng gói

Tên file lấy **nguyên văn** từ `OUTPUT/_session.md`, ví dụ `NOP-BAI_NguyenVanAn_De-01.zip`. Tạo ở **thư mục cha** của repo (L4). File cùng tên đã có thì hỏi học viên có ghi đè không.

**Loại trừ:** `node_modules/` · `.git/` · `automation/test-results/` · `automation/playwright-report/` · `playwright/.cache/`.

Chạy tại thư mục gốc của repo:

| Hệ điều hành | Lệnh |
|---|---|
| macOS / Linux | `zip -r ../<TEN_FILE>.zip . -x "node_modules/*" ".git/*" "automation/test-results/*" "automation/playwright-report/*" "playwright/.cache/*"` |
| Windows 10 trở lên | `tar -a -c -f ..\<TEN_FILE>.zip --exclude=node_modules --exclude=.git --exclude=automation/test-results --exclude=automation/playwright-report --exclude=playwright/.cache .` |

Máy không có lệnh `zip` (một số bản Linux) thì dùng lệnh `tar -a` như dòng Windows, hoặc xin học viên cho cài `zip`. **Không** dùng `git archive`, vì nó bỏ qua `OUTPUT/` (thư mục này nằm trong `.gitignore`).

## Bước 6 — Kiểm lại file zip vừa tạo

Liệt kê nội dung zip (`unzip -l` trên macOS/Linux, `tar -tf` trên Windows) và xác nhận:

| # | Kiểm tra | Đạt khi |
|---|---|---|
| Z1 | Tên file | Khớp `^NOP-BAI_[A-Za-z]+_De-0[12]\.zip$` và trùng tên trong `OUTPUT/_session.md` |
| Z2 | Có đủ | `qa-system/` · `OUTPUT/<task-slug>/` · `OUTPUT/_upgrades/` · `OUTPUT/_session.md` · `knowledge/` · `automation/pages/` · `automation/tests/` · `BAO-CAO.md` |
| Z3 | Không có | Không có đường dẫn nào chứa `node_modules/`, `.git/`, `test-results/`, `playwright-report/` |
| Z4 | Dung lượng | Ghi lại dung lượng. Trên 50 MB thì gần như chắc chắn đã lẫn thư mục cấm, quay lại Bước 5 |

Không đạt dòng nào thì xoá file zip vừa tạo, sửa lệnh, làm lại Bước 5.

## Bước 7 — Báo cáo cho học viên rồi DỪNG

In đúng khối sau và **dừng**:

```
📦 ĐÃ ĐÓNG GÓI — <Họ tên> · <DE-0x>

File: <đường dẫn đầy đủ tới file zip> (<dung lượng>)
Kiểm tra trước: <n>/12 ĐẠT · Cảnh báo: <danh sách mã, hoặc "không có">
BAO-CAO.md: <khớp file thật / còn lệch: …>

Việc còn lại của bạn:
  1. Gửi đúng file trên cho giảng viên, theo cách và hạn nộp giảng viên hướng dẫn
  2. Muốn sửa bài rồi gửi bản mới: sửa xong thì dán lại câu nộp bài để đóng gói lại
```

---

## Lỗi hay gặp

| Hiện tượng | Nguyên nhân | Xử lý |
|---|---|---|
| Zip hàng trăm MB | Lẫn `node_modules/` | Kiểm lại phần loại trừ ở Bước 5 |
| Zip thiếu `OUTPUT/` | Dùng `git archive` hoặc công cụ bỏ qua `.gitignore` | Dùng đúng lệnh ở Bước 5 |
| Tên file có dấu hoặc khoảng trắng | Tự gõ tên thay vì lấy từ `OUTPUT/_session.md` | Lấy nguyên văn tên trong file phiên |
| Agent tự viết lại cả báo cáo, số liệu không khớp | Vi phạm L3 | Đếm lại theo bảng Bước 3 |
| Agent sửa code cho test xanh rồi mới nộp | Vi phạm L2 | Hỏi học viên. Ca `FAIL` có giải trình không bị trừ điểm (`RUBRIC.md` B5) |

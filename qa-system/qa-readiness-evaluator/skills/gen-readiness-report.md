---
name: gen-readiness-report
description: >
  Đối soát chéo các deliverable thiết kế test của một task (01→06, 09→12, cổng ASK) để lập
  báo cáo độ sẵn sàng kiểm thử (Design-time QA Readiness Report) và khuyến nghị Go / No-Go
  trước khi kích hoạt nhánh Automation.
---

# Skill: gen-readiness-report

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT).
>
> **Skill = LÀM THẾ NÀO.** Quy trình + tham số + format output. Tái dùng được.
> KHÔNG chứa danh tính/quyền hạn (đó là `AGENT.md`), KHÔNG nhắc lại ràng buộc chung
> (đó là `qa-system/core/QA_STANDARD.md`).

## Mục đích
Đánh giá độ chín của test design trước khi kích hoạt nhánh Automation (Nhánh G trong
`WORKFLOW.md`). Sinh deliverable duy nhất tại `OUTPUT/<task-slug>/15_readiness_report.md`.

## Tham số
- `task_slug`: Bắt buộc. Task cần đánh giá. Báo cáo là **theo từng task**, không phải báo cáo chung —
  hai task khác nhau không được ghi đè báo cáo của nhau.

## Nguyên tắc cốt lõi: SỐ LIỆU DO CÔNG CỤ ĐO, SKILL CHỈ DIỄN GIẢI

> Trước đây skill này tự đếm test case và tự tính tỷ lệ trace bằng mắt — việc đếm thủ công
> trên hàng trăm test case là nguồn sai số, mà sai số ở cổng Go/No-Go thì dẫn tới cho phép
> automation trên nền thiết kế chưa chín.

**Bước 0 bắt buộc** — chạy công cụ đo trước khi viết bất cứ dòng nào:

```bash
npm run readiness -- <task-slug> --write
```

Lệnh này đọc deliverable thật, tính số liệu bằng máy, và ghi
`OUTPUT/<task-slug>/15_readiness_metrics.json`. Exit code: `0` = GO · `1` = CONDITIONAL GO · `2` = NO-GO.

Skill **lấy toàn bộ con số từ file JSON đó**, tuyệt đối không tự đếm lại.
Việc của skill là: diễn giải ý nghĩa, truy nguyên nguyên nhân, và viết điều kiện tiên quyết.

## Đầu vào

Công cụ đo đọc các deliverable sau. Skill đọc lại **chỉ khi cần trích dẫn nguyên văn**
(ví dụ lấy đúng câu mô tả một gap), không đọc để đếm:

| Nguồn | Dùng để làm gì |
|---|---|
| `OUTPUT/<slug>/15_readiness_metrics.json` | **Nguồn số liệu duy nhất.** Mọi con số trong báo cáo lấy từ đây. |
| `OUTPUT/<slug>/01_requirement_risk_summary.md` | Danh sách `BR-xx` và ma trận rủi ro — trích dẫn khi giải thích rule chưa phủ. |
| `OUTPUT/<slug>/02_missing_rule_report.md` | Kẽ hở `MR-xx`, Verdict Chặng 2 — trích nguyên văn câu hỏi còn treo. |
| `OUTPUT/<slug>/03_viewpoint_report.md` | Risk area và `VP-xx` — giải thích vì sao một viewpoint chưa có test case. |
| `OUTPUT/<slug>/05_test_case_spec.md` *(hoặc `testcases/batch_*.md`)* | Test case 8 trường — trích `TC_ID` cụ thể khi cần nêu ví dụ. |
| `OUTPUT/<slug>/06_coverage_review.md` | Verdict rà soát độ phủ 3 góc nhìn. |
| `OUTPUT/<slug>/12_data_validation_traceability.md` *(nếu có)* | Vấn đề dữ liệu tồn đọng — **giữ nguyên văn**, không tự sửa. |
| `knowledge/features/<slug>.md` | Trạng thái rule đã xác nhận (Mục 3), câu hỏi treo (Mục 7), giả định đã chốt (Mục 8). |

> Thiếu `05_test_case_spec.md` lẫn `testcases/batch_*.md` → công cụ đo trả `NO-GO` với lý do
> "chưa có test case nào". Skill ghi nhận đúng như vậy, không tự tưởng tượng nội dung.

## KHÔNG được (riêng skill này)
- **KHÔNG tự đếm, tự tính tỷ lệ.** Mọi con số phải khớp 100% với `15_readiness_metrics.json`.
  Nếu thấy số liệu có vẻ sai → báo cáo nghi vấn, không tự sửa số.
- **KHÔNG làm việc của bước sau**: tuyệt đối không đề cập dữ liệu execution (Pass/Fail rate,
  bug thực thi, thời lượng chạy). Đây là đánh giá *thiết kế*, chưa có lần chạy nào.
- **KHÔNG tự ý sửa artifact nguồn**: không sinh thêm test case, không sửa test data, không sửa spec.
- **KHÔNG tự duyệt assumption đang treo, không tự đóng gap.** Mọi điểm chưa rõ đẩy vào mục "CÂU HỎI MỞ".
- **KHÔNG tự quyết định quyền Go/No-Go chính thức.** Khuyến nghị chỉ là tham mưu kỹ thuật;
  quyết định cuối thuộc về QA Lead / người phụ trách.
- **KHÔNG tự chạy tiếp sang Automation** kể cả khi kết quả là `GO`. Cổng biên giới (`AGENTS.md` §1.5)
  còn đòi thêm hai điều kiện độc lập: người dùng yêu cầu rõ ràng **và** có URL môi trường cụ thể.

## Bảng logic Go / No-Go

Công cụ đo đã áp sẵn bảng này — skill **đối chiếu lại** để đảm bảo mình hiểu đúng, không tính lại.

| Khuyến nghị | Điều kiện |
|---|---|
| `NO-GO` | Cổng ASK đang ĐÓNG · HOẶC chưa có test case nào · HOẶC tỷ lệ Trace < 80% · HOẶC có test case gắn vào rule/gap chưa chốt · HOẶC còn vấn đề dữ liệu chưa giải quyết |
| `CONDITIONAL GO` | Trace đạt 80–99% · HOẶC còn viewpoint/rule chưa được phủ · HOẶC Chặng 6 chưa `PASS` · HOẶC chưa có `12_` · HOẶC tri thức có nguy cơ mất (câu trả lời BA chưa ghi vào `knowledge/`) |
| `GO` | Trace 100% · cổng ASK mở · phủ đủ viewpoint và rule · Chặng 6 `PASS` · không còn vấn đề dữ liệu · tri thức đã ghi vào `knowledge/` |

## Các bước

1. **Đo bằng máy**: chạy `npm run readiness -- <slug> --write`, đọc `15_readiness_metrics.json`.
2. **Diễn giải coverage**: với mỗi `VP-xx` và `BR-xx` nằm trong `coverage.viewpointsUncovered` /
   `coverage.rulesUncovered`, mở `03_` hoặc `01_` để nêu **cụ thể** rủi ro nào đang hở.
   Không chỉ liệt kê mã — phải nói hở cái gì.
3. **Truy nguyên trace thiếu**: với mỗi `TC_ID` trong `testCases.untraced`, nêu rõ nó thiếu
   `Rule#` hay `Viewpoint#`, và đề xuất mã cần gắn.
4. **Đối soát rule treo**: với mỗi `TC_ID` trong `riskyCases`, chỉ ra nó đang dựa vào `MR-xx` nào
   chưa chốt — đây là test case có nguy cơ ảo giác cao nhất.
5. **Dữ liệu kiểm thử**: trích **nguyên văn** từng issue trong `data.issues`. Không diễn đạt lại.
6. **Tri thức tích luỹ**: nếu `askGate.advisories` không rỗng, nêu rõ hệ quả — lần chạy sau sẽ
   phải hỏi lại BA đúng những câu đã được trả lời.
7. **Tự kiểm trước khi ghi**: mọi con số trong báo cáo đối chiếu ngược được về
   `15_readiness_metrics.json`. Không có con số nào do skill tự nghĩ ra.
8. **Xuất báo cáo** vào `OUTPUT/<task-slug>/15_readiness_report.md`.

## Format output

Ghi ra `OUTPUT/<task-slug>/15_readiness_report.md`:

````markdown
# Báo Cáo Độ Sẵn Sàng Kiểm Thử · <task-slug>
Owner: qa-readiness-evaluator/gen-readiness-report · Nguồn: 15_readiness_metrics.json · Verdict: <GO | CONDITIONAL GO | NO-GO>

## 1. Tổng quan
- **Phạm vi**: <tóm tắt tính năng đang đánh giá>
- **Mục tiêu**: Đánh giá độ chín của test design trước khi kích hoạt Nhánh G (Automation).
- **Nguồn dữ liệu đã nạp** *(lấy từ `sources` trong metrics)*:
  | Deliverable | Trạng thái |
  |---|---|
  | `01_requirement_risk_summary.md` | <Đã nạp / Không có> |
  | `02_missing_rule_report.md` | <Đã nạp / Không có> |
  | `03_viewpoint_report.md` | <Đã nạp / Không có> |
  | Test case | <nguồn: 05_test_case_spec.md hoặc N batch / Không có> |
  | `06_coverage_review.md` | <Đã nạp / Không có> |
  | `12_data_validation_traceability.md` | <Đã nạp / Không có> |
  | `knowledge/features/<slug>.md` | <Đã nạp / Không có> |

## 2. Độ phủ (Coverage)
| Chỉ số | Số liệu | Đánh giá |
|---|---|---|
| Tổng test case | <testCases.total> | |
| Viewpoint đã phủ | <đã phủ>/<kế hoạch> | <VP-xx còn hở + rủi ro tương ứng> |
| Business rule đã phủ | <đã phủ>/<tổng> | <BR-xx còn hở + hệ quả> |

*Rule bị trích dẫn nhưng không tồn tại ở Chặng 1*: <coverage.rulesReferencedButUndefined, hoặc "Không có">

## 3. Ma trận truy vết (Traceability)
- **Tỷ lệ Trace**: <tracePct>% (<traced>/<total>)
- **Test case chưa trace được**: <liệt kê TC_ID + thiếu Rule# hay Viewpoint# + mã đề xuất gắn>
- **Test case dựa trên rule/gap CHƯA CHỐT** *(nguy cơ ảo giác cao nhất)*: <riskyCases + MR-xx tương ứng>

## 4. Cổng ASK
- **Trạng thái**: <MỞ / ĐÓNG>
- **Câu hỏi còn treo**: <từ askGate.pending, nguyên văn>
- **Tri thức có nguy cơ mất**: <từ askGate.advisories, hoặc "Không">

## 5. Sẵn sàng về dữ liệu kiểm thử
- **Trạng thái `12_data_validation_traceability.md`**: <Đã có / Chưa có>
- **Vấn đề tồn đọng** *(trích nguyên văn, không diễn đạt lại)*:
  - <issue 1>

## 6. Kết quả rà soát thiết kế
- **Verdict Chặng 6**: <PASS / FIX / ASK / chưa chạy>
- **Điểm cần can thiệp**: <trích từ 06_coverage_review.md>

## 7. Khuyến nghị Go / No-Go
- **Khuyến nghị**: `<GO | CONDITIONAL GO | NO-GO>`
- **Căn cứ**: <dẫn số liệu cụ thể từ metrics>
- **Điểm chặn phải xử lý xong** *(nếu NO-GO)*:
  1. <từ recommendation.blockers>
- **Điều kiện kèm theo** *(nếu CONDITIONAL GO)*:
  1. <từ recommendation.conditions>

> ⚠️ Kể cả khi khuyến nghị là `GO`, Nhánh G vẫn **KHÔNG** được tự động kích hoạt.
> Cổng biên giới (`AGENTS.md` §1.5) đòi thêm: người dùng yêu cầu rõ ràng **và** URL môi trường cụ thể.
> Quyết định Go/No-Go cuối cùng thuộc về QA Lead / người phụ trách, không thuộc về Agent.

---
## ❓ CÂU HỎI MỞ (cần BA / PO / Tech Lead xác nhận)
- <toàn bộ ambiguity, gap chưa chốt, điểm ASK từ Chặng 6>
````

> Ô bảng thiếu dữ liệu phải điền nhãn tường minh (`CHƯA XÁC ĐỊNH`, `[GIẢ ĐỊNH]`, `N/A`), không để trống.

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Đã chạy `npm run readiness -- <slug> --write` **trước khi** viết báo cáo.
- [ ] File xuất đúng `OUTPUT/<task-slug>/15_readiness_report.md` (theo task, không ghi đè task khác).
- [ ] **Mọi con số** trong báo cáo đối chiếu ngược được 100% về `15_readiness_metrics.json`.
- [ ] Verdict ghi ở dòng meta khớp đúng `recommendation.verdict` trong metrics.
- [ ] Mỗi `VP-xx` / `BR-xx` chưa phủ đều được giải thích **hở rủi ro gì**, không chỉ liệt kê mã.
- [ ] Vấn đề dữ liệu giữ nguyên văn từ `12_`, không diễn đạt lại.
- [ ] Báo cáo tuyệt đối không chứa dữ liệu execution (Pass/Fail rate, bug, thời lượng chạy).
- [ ] Giữ nguyên disclaimer: cổng biên giới + quyết định cuối thuộc về con người.

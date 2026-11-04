---
name: viewpoint-selection
description: >
  Chọn viewpoint kiểm thử từ registry cố định VP-01…VP-08 dựa trên rủi ro kế thừa từ Chặng 1, mỗi
  viewpoint gắn mã nguồn BR/FD/AF/MR, phân ranh giới theo quy ước sở hữu cố định.
---

# Skill: viewpoint-selection

> Tuân thủ `qa-system/core/QA_STANDARD.md` (cổng ASK §1 · guard §2 · FACT §3 · risk §5 · chuỗi biên §6 ·
> knowledge §8 · registry viewpoint §9.2 · nguồn §10).

## Mục đích
Chọn các viewpoint **có căn cứ trong nguồn** và chỉ rõ mỗi viewpoint phủ những mã nào, để Chặng 4 sinh
test idea không sót và không chồng chéo.

## Đầu vào
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — `BR`, `FD`, `AF`, `RK`.
- `OUTPUT/<task-slug>/02_missing_rule_report.md` — `MR` và trạng thái.
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` — §7/§8 (MR đã chốt).

> Trước khi chạy: `npm run gate <task-slug>` phải exit `0` (QA_STANDARD §1). Exit `1` ⇒ dừng.
> Chỉ `MR` trạng thái `Confirmed` là nguồn; `Rejected` không sinh viewpoint.

## KHÔNG được (riêng skill này)
- Sinh test idea, step, test case.
- Chọn viewpoint không gắn được ít nhất một mã nguồn.
- Chọn `VP-04`…`VP-08` khi nguồn không nhắc tới (bảo mật, giao diện, hiệu năng, a11y, tích hợp).
  Loại sản phẩm ("B2C", "có API") không phải nguồn.
- Đánh lại mã `RK` của 01. Rủi ro mới chỉ sinh từ `MR` đã chốt, cấp số kế tiếp (`npm run ids -- <slug>`).
- Đổi tên viewpoint trong registry.

## Quy ước sở hữu (cố định — thay cho kiểm "zero-overlap")
Một tình huống thuộc **đúng một** viewpoint theo bảng này. Chặng 4 và 6 dùng cùng quy ước.

| VP | Tên | Sở hữu | Chọn khi |
|---|---|---|---|
| VP-01 | Happy Path | Luồng chính (01 §4), hành vi đúng của từng `BR` | Luôn chọn nếu 01 có luồng chính |
| VP-02 | Negative | Sai định dạng, sai kiểu, rỗng/thiếu field bắt buộc, ký tự đặc biệt, sai trạng thái, các `AF` lỗi | Có `FD` hoặc `AF` lỗi |
| VP-03 | Boundary | Mọi điểm của chuỗi biên QA_STANDARD §6, **kể cả** điểm ngoài biên (`min-1`, `max+1`, quá độ dài) | Có `FD` mang min/max/độ dài trong nguồn |
| VP-04 | Security | Phân quyền, xác thực, lộ dữ liệu | Nguồn nhắc quyền/bảo mật, hoặc MR đã chốt về W5 |
| VP-05 | UX/Usability | Chữ thông báo, nhãn, bố cục có trong `04_design/` | Có `04_design/` hoặc chữ hiển thị trong nguồn |
| VP-06 | Performance | Thời gian phản hồi, tải | Nguồn có ngưỡng NFR |
| VP-07 | Accessibility | Yêu cầu tiếp cận | Nguồn có yêu cầu a11y |
| VP-08 | Integration | Gọi hệ thống/API/module khác, side-effect chéo | Nguồn nhắc hệ thống ngoài |

Ngoài registry ⇒ `VP-9x` + `[GIẢ ĐỊNH]` + mã nguồn. Không có mã nguồn ⇒ không chọn.

## Các bước
1. **Rủi ro** — chép nguyên `RK` của 01 (giữ mã, Likelihood, Impact). Thêm `RK` mới cho rủi ro sinh từ `MR` `Confirmed`.
2. **Chọn viewpoint** — đi qua bảng quy ước, chọn VP có điều kiện "Chọn khi" đúng, ghi mã nguồn và lý do.
3. **Đặc tả** từng VP: mục tiêu, danh sách mã trong phạm vi, `RK` liên quan, phần giao thoa chuyển cho VP nào.
4. **Kiểm** — mọi `BR`/`FD`/`AF`/`MR Confirmed` nằm trong ít nhất một VP; mọi `RK` mức `CRITICAL`/`HIGH` có VP phủ.

## Format output
Ghi ra `OUTPUT/<task-slug>/03_viewpoint_report.md`:

````markdown
# Viewpoint Report · <task-slug>
Owner: qa-system/qa-analyst/skills/viewpoint-selection.md · Nguồn: 01_requirement_risk_summary.md, 02_missing_rule_report.md, knowledge/features/<feature-slug>.md · Verdict: PASS

## 1. RỦI RO
| ID | Rủi ro | Likelihood | Impact | Risk Level | Nguồn |
|---|---|---|---|---|---|
| RK-01 | <chép từ 01> | HIGH | MEDIUM | HIGH | BR-01 |

## 2. VIEWPOINT ĐƯỢC CHỌN
| VP | Tên | Nguồn (BR/FD/AF/MR) | Lý do |
|---|---|---|---|
| VP-01 | Happy Path | BR-01, BR-02 | <lý do bám nguồn> |

## 3. ĐẶC TẢ VIEWPOINT
### VP-01 — Happy Path
- Mục tiêu: <…>
- Trong phạm vi: BR-01, BR-02
- Rủi ro liên quan: RK-01
- Giao thoa: <tình huống> → VP-0x (theo quy ước sở hữu)
````

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] `npm run gate <slug>` exit `0` trước khi ghi file; dòng meta đúng QA_STANDARD §7.
- [ ] Mã `RK` của 01 giữ nguyên; `RK` mới có nguồn `MR`.
- [ ] Mỗi VP có ít nhất một mã nguồn; `VP-04`…`VP-08` chỉ có mặt khi nguồn nhắc tới.
- [ ] Mọi `BR`/`FD`/`AF`/`MR Confirmed` thuộc ít nhất một VP; rủi ro `CRITICAL`/`HIGH` không mồ côi.

# RUN RESULT — [RUN-ID] · [TÊN TÍNH NĂNG]
Thời gian bắt đầu: YYYY-MM-DD HH:mm · Thời gian hoàn thành: YYYY-MM-DD HH:mm
Thiết bị (Device): `<desktop-chrome / mobile-android / mobile-ios / tablet>` — list every project that ran, using the exact `QA_DEVICE` names
Tổng số cases: [X] · **PASS**: [A] · **FAIL**: [B] · **BLOCKED**: [C] · **Tỷ lệ Pass**: [%]

> `[TÊN TÍNH NĂNG]` = `[FEATURE NAME]` · `Thời gian bắt đầu` = start time · `Thời gian hoàn thành` = finish time ·
> `Thiết bị` = device · `Tổng số cases` = total cases · `Tỷ lệ Pass` = pass rate. The meta lines and the table header row are kept verbatim in
> Vietnamese because `jira:sync` and other tools read the table by column name (`Tiêu đề` = title, `Trạng thái` = status,
> `Bằng chứng` = evidence).

---

## 1. Bảng Chi Tiết Kết Quả Thực Thi (Detailed execution results)

| # | TC ID | Device | Tiêu đề | Trạng thái | Actual Result (Thực tế) | Bằng chứng (Evidence) | Defect ID (Nếu có) |
|---|---|---|---|:---:|---|---|:---:|
| 1 | <TC_ID> | <project name, e.g. mobile-ios> | <Title from 05> | **PASS / FAIL / BLOCKED** | <what was really observed, no inference> | [evidence/<device>/<TC_ID>_<result>.png](evidence/) (one device: `evidence/<TC_ID>/`) | <BUG-xx or —> |

---

## 2. Nhật Ký Lỗi Nhanh (Failed Issues Summary)

### BUG-01: <summary of the bug at TC_ID>
- **Severity**: `[ĐỀ XUẤT]` (PROPOSED) Critical / Major / Minor / Trivial (QA_STANDARD §11)
- **Description**: <Expected (copied from 05) versus Actual (really observed)>
- **Trace**: Violates `<BR-xx/FD-xx/AF-xx>` in `01_requirement_risk_summary.md`.
- **Evidence**: `evidence/<TC_ID>_fail.png`

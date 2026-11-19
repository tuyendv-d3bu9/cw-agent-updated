---
name: viewpoint-selection
description: >
  Chooses test viewpoints from the fixed registry VP-01…VP-08 based on the risks inherited from Stage 1; each
  viewpoint is tied to BR/FD/AF/MR source codes, with boundaries drawn by a fixed ownership convention.
---

# Skill: viewpoint-selection

> Complies with `qa-system/core/QA_STANDARD.md` (ASK gate §1 · guards §2 · FACT §3 · risk §5 · boundary chain §6 ·
> knowledge §8 · viewpoint registry §9.2 · sources §10).
>
> The output format block below stays in Vietnamese (headings, column headers): tools and later stages read it. Copy it verbatim.

## Purpose
Choose the viewpoints that **have a basis in the sources** and state exactly which codes each viewpoint covers, so that Stage 4 produces
test ideas with nothing missed and nothing overlapping.

## Inputs (Đầu vào)
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — `BR`, `FD`, `AF`, `RK`.
- `OUTPUT/<task-slug>/02_missing_rule_report.md` — `MR` and their statuses.
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` — §7/§8 (confirmed MRs).
- Only when `knowledge/_sut.json` has a `domain`: the `risks` files listed by `npm run domain` (QA_STANDARD §10.3).
  `_sut.json` has no `domain` ⇒ skip step 2b.

> Before running: `npm run gate <task-slug>` must exit `0` (QA_STANDARD §1). Exit `1` ⇒ stop.
> Only an `MR` with status `Confirmed` is a source; `Rejected` produces no viewpoint.

## MUST NOT (specific to this skill)
- Produce test ideas, steps or test cases.
- Choose a viewpoint that cannot be tied to at least one source code.
- Choose `VP-04`…`VP-08` when the sources do not mention them (security, UI, performance, a11y, integration).
  The product type ("B2C", "has an API") is not a source.
- Renumber the `RK` codes of 01. New risks arise only from confirmed `MR`s and take the next number (`npm run ids -- <slug>`).
- Rename a viewpoint in the registry.

## Ownership convention (fixed — replaces a "zero-overlap" check)
A situation belongs to **exactly one** viewpoint according to this table. Stages 4 and 6 use the same convention.

| VP | Name | Owns | Choose when |
|---|---|---|---|
| VP-01 | Happy Path | The main flow (01 §4), the correct behaviour of each `BR` | Always chosen if 01 has a main flow |
| VP-02 | Negative | Wrong format, wrong type, empty/missing required field, special characters, wrong state, the error `AF`s | There are `FD`s or error `AF`s |
| VP-03 | Boundary | Every point of the QA_STANDARD §6 boundary chain, **including** the out-of-bounds points (`min-1`, `max+1`, over length) | There are `FD`s with min/max/length in the sources |
| VP-04 | Security | Permissions, authentication, data exposure | The sources mention permissions/security, or a confirmed MR about W5 |
| VP-05 | UX/Usability | Message text, labels, layout present in `04_design/` | There is `04_design/` or displayed text in the sources |
| VP-06 | Performance | Response time, load | The sources have an NFR threshold |
| VP-07 | Accessibility | Accessibility requirements | The sources have a11y requirements |
| VP-08 | Integration | Calls to other systems/APIs/modules, cross side effects | The sources mention external systems |

Outside the registry ⇒ `VP-9x` + `[GIẢ ĐỊNH]` + a source code. No source code ⇒ do not choose it.

## Steps
1. **Risks** — copy the `RK`s of 01 as they are (keep code, Likelihood, Impact). Add new `RK`s for risks arising from `Confirmed` `MR`s.
2. **Choose viewpoints** — go through the convention table, choose the VPs whose "Choose when" condition holds, and record the source codes and reason.
2b. **Candidates from the domain pack** (only when a `domain` is set) — each `risks` item that 01/02 already cited (`[DOMAIN] …` in an `OQ`/`MR`)
   is a candidate; the item's ISO/IEC 25010:2023 characteristic column only suggests which VP of the convention table applies. Choose it only once there is
   a source code (`BR`/`FD`/`AF`/`MR Confirmed`) meeting the "Choose when" condition; the `Lý do` (reason) column additionally records `[DOMAIN] <pack-id>/risks.md#<section>`.
   No source code ⇒ do not choose it.
3. **Specify** each VP: goal, list of in-scope codes, related `RK`s, and which VP the overlapping parts are handed to.
4. **Check** — every `BR`/`FD`/`AF`/`MR Confirmed` sits in at least one VP; every `RK` of level `CRITICAL`/`HIGH` is covered by a VP.

## Output format
Write `OUTPUT/<task-slug>/03_viewpoint_report.md`:

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

(Sections: 1 risks · 2 chosen viewpoints · 3 viewpoint specification — goal, in scope, related risks, overlap.)

## Acceptance gates (Quality Gates)
- [ ] `npm run gate <slug>` exits `0` before the file is written; the meta line follows QA_STANDARD §7.
- [ ] The `RK` codes of 01 are unchanged; new `RK`s have an `MR` source.
- [ ] Each VP has at least one source code; `VP-04`…`VP-08` appear only when the sources mention them.
- [ ] Every `BR`/`FD`/`AF`/`MR Confirmed` belongs to at least one VP; no `CRITICAL`/`HIGH` risk is orphaned.

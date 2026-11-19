---
name: ui-screenshot-review
description: >
  Analyses UI screenshots with AI Vision to find and specify the visible
  UI Inconsistency, Accessibility and UX Problem issues.
---

# Skill: ui-screenshot-review

> Complies with `qa-system/core/QA_STANDARD.md` (verdict §1 · guards §2 · labels §2.1 · FACT §3 · Severity scale §11).
> **Attached images are required (Vision). No image → STOP and ask for images.**
>
> The output format block (headings, column headers, labels) stays in Vietnamese as written; copy it verbatim.

## Purpose
Scan screenshots, then find and specify the visible UI / Accessibility / UX problems.

## Inputs (Đầu vào)
- 1..n directly attached screenshots. **Mandatory** — no image, stop.
- `INPUT/<task-slug>/04_design/` — the UI/UX Designer's handover: design tokens
  (colours, typography, spacing), the states of each component, the message catalogue, the
  accessibility standard, and mockup images exported from Figma if any. **Read it before inspecting the images.**
- (Optional) a short description of each screen / the feature context.

> **Why the design is needed**: without a reference, comments on the UI are just taste; Dev
> can push back, and should. With the design, each finding points to a specific section code and can be
> verified again after the fix. An empty `04_design/` folder → the images can still be inspected, but the report
> must state clearly that it is judging **without a reference**, and lower the confidence of aesthetic findings.

## MUST NOT (specific to this skill)
- Speculate about dynamic behaviour: hover, animation, screen transitions, the response after a click — a static image does not contain
  that information.
- "Imagine" a screen when there is no image.
- Assert something that is not clearly visible when the image is blurred / low-resolution.

## The 3 problem groups to inspect
| Group | What to inspect |
|---|---|
| **UI Inconsistency** | Misaligned margins, uneven spacing, inconsistent button corner radius/size/colour, messy fonts |
| **Accessibility** | Low text/background contrast, font too small, touch targets too close together, missing visible labels |
| **UX Problem** | Confusing error messages/labels, missing state signals (e.g. no visible loading), a visual flow that misleads |

## Steps
1. **Check the precondition** — no image → STOP and ask for images.
2. **Scan & classify** — for each image, list the visible problems, each in exactly 1 of the 3 groups.
3. **Specify each problem** — **Location** (where on the screen) · **Description** (what is seen) ·
   **Reason** (why it is a problem) · **Severity** `[ĐỀ XUẤT]` (proposal) on the QA_STANDARD §11 scale (`Critical`/`Major`/`Minor`/`Trivial`) · **Suggested fix**.
3b. **Trace back to the design** — each finding points to the violated section code in `04_design/`
   (e.g. `vi phạm MSG-01` — violates MSG-01). Also record the items the product **gets right**, so that the next fix
   does not accidentally break them.
4. **Flag confidence** — a blurred or unclear image → tag `[GIẢ ĐỊNH]` (assumption) + ask the user to
   cross-check visually.

## Output format
Write `OUTPUT/<task-slug>/08_ui_screenshot_analysis.md`:

```markdown
# UI Screenshot Analysis · <task-slug>
Owner: qa-system/qa-ui-review/skills/ui-screenshot-review.md · Nguồn: <ảnh đính kèm>, INPUT/<task-slug>/04_design/ · Verdict: PASS

## Ảnh [n]: [mô tả ngắn màn hình]

### UI Inconsistency
| # | Vị trí | Mô tả (nhìn thấy) | Lý do | Vi phạm mục (04_design) | Severity | Đề xuất sửa |
|---|---|---|---|---|---|---|
| UI-01 | [vị trí] | [mô tả] | [lý do] | [mã mục, hoặc Không có chuẩn mực] | [ĐỀ XUẤT] Minor | [đề xuất] |

### Accessibility
| # | Vị trí | Mô tả | Lý do | Vi phạm mục (04_design) | Severity | Đề xuất sửa |
|---|---|---|---|---|---|---|
| AC-01 | … | … | … | … | … | … |

### UX Problem
| # | Vị trí | Mô tả | Lý do | Vi phạm mục (04_design) | Severity | Đề xuất sửa |
|---|---|---|---|---|---|---|
| UX-01 | … | … | … | … | … | … |

> **Ghi chú độ tin cậy**: [các nhận định gắn [GIẢ ĐỊNH] cần cross-check bằng mắt, nếu có]
```

(Columns: location · description (seen) · reason · violated section (04_design) · severity · suggested fix. `Không có chuẩn mực` = no reference.
The closing note lists the findings tagged `[GIẢ ĐỊNH]` that need a visual cross-check.)

## Acceptance gates (Quality Gates)
- [ ] An attached image is mandatory; with no image, stop immediately with Verdict `ASK`.
- [ ] All 3 groups (UI Inconsistency, Accessibility, UX Problem) are scanned for each image; no group skipped.
- [ ] Every finding based on a blurred image or a guess carries the `[GIẢ ĐỊNH]` label.
- [ ] Each suggested fix is concrete enough for Dev/Designer to verify after the fix.
- [ ] `INPUT/<task-slug>/04_design/` has been read; each finding points to the violated section code. If the folder
      is empty, the report must state clearly that it is judging without a reference.

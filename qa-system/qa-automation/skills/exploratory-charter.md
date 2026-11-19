---
name: exploratory-charter
description: >
  Turns Risk Areas into a set of 5-field Exploratory Charters (Mission, Area, Risk, Time-box, Notes)
  with clear goals and time limits for exploratory testing sessions carried out by humans.
---

# Skill: exploratory-charter

> Complies with `qa-system/core/QA_STANDARD.md` (verdict · guards · FACT · 3x3 risk matrix §5).
>
> The output format block and the Mission syntax `Khám phá … để phát hiện …` (Explore … to discover …) stay in
> Vietnamese as written; copy them verbatim.

## Purpose
Turn Risk Areas into Exploratory Charters with clear goals and time limits, steering
exploratory sessions carried out by humans.

## Inputs (Đầu vào)
- The list of Risk Areas + Likelihood/Impact levels (from `03_viewpoint_report.md` §1), and/or
- The Requirement Summary (`01_*.md`), and/or a feature description.
- `knowledge/_project.md` · `knowledge/features/<task-slug>.md` (always loaded, QA_STANDARD §7)

## MUST NOT (specific to this skill)
- Script it: write detailed Steps / Precondition / Expected like a Test Case.
- Combine several risks into one Charter — **one Charter, one risk**.
- Set an unrealistic time-box for a human session.

## Steps
1. **Choose the focal risk** — higher risks first; each Charter focuses on **one** distinct
   risk; cover all high risks according to their business nature.
2. **Write each Charter with all 05 fields**:

   | Field | Content |
   |---|---|
   | **Mission** | The exploration goal — "Khám phá … để phát hiện …" (Explore … to discover …) |
   | **Area** | The specific area / screen / data flow within the exploration scope |
   | **Risk** | The main risk the Charter targets — traced to the source Risk Area / Rule |
   | **Time-box** | A realistic time frame for one session (suggested 30–90 minutes) |
   | **Notes** | Points to watch, data/variants worth trying, open questions to answer |

3. **Self-check risk coverage** — no high-priority risk may be left without a Charter. An area that needs
   a perspective beyond the given data → tag it `[GIẢ ĐỊNH]` (assumption) + state the reason.

## Output format
Write `OUTPUT/<task-slug>/07_exploratory_charter.md`:

```markdown
# EXPLORATORY CHARTER SET — [TÊN TÍNH NĂNG]
Owner: qa-automation/exploratory-charter · Nguồn: OUTPUT/<task-slug>/03_viewpoint_report.md · Verdict: PASS

## 1. Bảng tổng hợp Charter theo rủi ro
| # | Charter (tóm tắt Mission) | Risk nhắm tới | Mức rủi ro | Time-box |
|:---|:---|:---|:---|:---|
| CH-01 | [tóm tắt] | [RK-xx] | [Risk Level theo QA_STANDARD §11] | [vd 60'] |

## 2. Chi tiết từng Charter
### CH-01
- **Mission**: [Khám phá … để phát hiện …]
- **Area**: [khu vực/màn hình/luồng cụ thể]
- **Risk**: [rủi ro chính — trace về Risk Area/Rule]
- **Time-box**: [vd 60 phút]
- **Notes**: [điểm chú ý, biến thể dữ liệu nên thử, câu hỏi mở]

*(Lặp lại — mỗi Charter một rủi ro khác nhau, ưu tiên rủi ro cao trước)*
```

(Sections: 1 charter summary by risk · 2 details of each charter. Repeat the block — one different risk per Charter, higher risks first.)

## Acceptance gates (Quality Gates)
- [ ] Each Charter focuses on exactly one focal risk, never several.
- [ ] The Mission starts with the standard syntax: `Khám phá [đối tượng] để phát hiện [vấn đề tiềm ẩn]` (Explore [target] to discover [potential problem]).
- [ ] The time-box is realistic, within 30–90 minutes.
- [ ] Absolutely no scripted steps like a test case.

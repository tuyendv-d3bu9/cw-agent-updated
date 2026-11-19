---
name: <skill-name>
description: >
  <A short 1-2 sentence description of the task, the inputs and the main deliverable this skill produces>
---

# Skill: <skill-name>

<!-- Person/AI writing the skill: read and follow `qa-system/templates/skills/LUAT-TAO-SKILL.md` first. Delete this line when done. -->

> Complies with `qa-system/core/QA_STANDARD.md` (verdict §1 · guards & labels §2 · FACT §3 · I/O §7 · IDs §9 · sources §10 · <add §4 / §5 / §6 / §11 if used>).
> Where a rule already exists in QA_STANDARD, **point to the section number**; do not copy it.
>
> **Skill = HOW.** Procedure + parameters + output format. Reusable.
> It does NOT hold identity/permissions (that is `AGENT.md`) and does NOT repeat the shared constraints
> (those are in `qa-system/core/QA_STANDARD.md`).

## Purpose
<What the skill is for and which deliverable it produces. 1–3 sentences.>

## Parameters
- `<param>` ∈ `<valid values>` — <meaning>

<No parameters? Delete this whole section.>

## Inputs (Đầu vào)
- `OUTPUT/<task-slug>/<NN>_*.md` — <which part of this file is used>
- `knowledge/_project.md` · `knowledge/features/<task-slug>.md` — <which sections are used> (always loaded, QA_STANDARD §7)

> A mandatory artifact is missing → STOP; never imagine the content.

## MUST NOT (specific to this skill)
> Record only the **specific** gates. The shared guards are in `qa-system/core/QA_STANDARD.md` §2 — do not repeat them.

- Do not do the next step's work: <the concrete boundary>.
- <Another specific gate — usually the kind of mistake this skill tends to make>

## <Registry / standard table of this skill>
> Put it here only if **this skill alone** uses it. If ≥2 skills use it → move it into
> `qa-system/core/QA_STANDARD.md` and point to it; do not copy. See `qa-system/core/QA_STANDARD.md` §8.

<The registry table, or delete this whole section.>

## Steps
1. <Step 1 — what to do, what comes out>
2. <Step 2>
3. <Step 3>

## Output format
Write `OUTPUT/<task-slug>/<NN>_<deliverable_name>.md`:

````markdown
# <TÊN DELIVERABLE> · <task-slug>
Owner: qa-system/qa-<agent>/skills/<ten-skill>.md · Nguồn: <file đã đọc> · Verdict: PASS

## 1. <Mục>
| ID | <cột nội dung> | Nguồn (file §mục / mã) |
|---|---|---|
| <MÃ-01> | <giá trị> | <nguồn> |
````

> Line 2 is the meta line exactly per QA_STANDARD §7 (one verdict, not bold; `Nguồn:` = sources read). Every table has a source column or a trace code (§9);
> keep the source column header `Nguồn (file §mục / mã)` (source: file §section / code) as written — the tools recognise it.
> New codes take their numbers from `npm run ids -- <slug>`; old codes stay unchanged (§9.1). A cell with missing data gets a §2.1 label.
> Examples in a skill use neutral placeholders — **never** values, messages or screen names from a real project.

## Writing knowledge
<Only if the QA_STANDARD §8 writing-rule table allows it. Point to that row; do not write a new rule. Otherwise delete this section.>

## Acceptance gates (Quality Gates)
- [ ] <An acceptance condition for this deliverable, stated so it can be verified (FACT — F/A/C/T)>
- [ ] The file is written exactly to `OUTPUT/<task-slug>/<NN>_<deliverable_name>.md`, with the meta line per §7.

## Skill acceptance (before putting it into use — `system-upgrade-governance` §5.1)
- [ ] (a) No QA_STANDARD rules copied · (b) All inputs declared, including knowledge · (c) Output has a meta line + a source column
- [ ] (d) Run it twice on the same sample input, then `npm run diff-runs -- <run 1 folder> <run 2 folder>`: the code sets, content and verdict are the same, or the differences are explained
- [ ] (e) No examples from a specific business domain
- [ ] Delete this section from the real skill once it passes

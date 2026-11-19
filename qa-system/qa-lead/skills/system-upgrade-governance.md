---
name: system-upgrade-governance
description: >
  Orchestrates UPGRADES OF THE AGENT SYSTEM ITSELF: takes an upgrade request (or a skill.md file the user
  provides), decides whether to add a skill to an existing agent / build a new agent / refine in place, propagates
  the change to all 7 anchor points of the system, then runs the acceptance gate to make sure existing flows do not break.
---

# Skill: system-upgrade-governance

> Complies with `qa-system/core/QA_STANDARD.md` (verdict §1 · guards §2 · FACT §3 · knowledge rules §8) and `AGENTS.md`.
> **Hard rules for creating/editing a skill** (MUST/FORBIDDEN, stop gates, R1–R13, the "done" checklist): `qa-system/templates/skills/LUAT-TAO-SKILL.md` — load it before this file.
>
> **This is a self-referential skill**: what it acts on is not `OUTPUT/` but the `qa-system/` folder itself.
> Together with `workflow-authoring`, it is the only skill allowed to write into `qa-system/` and `knowledge/_system_map.json`.

## Purpose

When the user says things like:

- *"QA Leader, help me upgrade skill `<name>`"*
- *"I have this `skill.md` file — should it become a new agent or go into an existing one?"*
- *"I want the system to also be able to do `<X>`"*
- *"Add an agent specialised in `<Y>` for me"*

this skill guarantees **three things**:

1. The change is placed **at the right layer, in the right place** (no shared rules stuffed into a skill, no knowledge stuffed into an agent).
2. The change is **fully propagated** to every place in the system that references it — no point missed.
3. After the upgrade, **the existing flows still run** — with verifiable evidence, not a feeling.

## Parameters

- `che_do` (mode) ∈ `PHAN_TICH` (analyse) | `THI_CONG` (build) | `NGHIEM_THU` (accept) — by default all three run in sequence.
  - `PHAN_TICH`: only produce the A/B/C decision + the impact table; **no file is modified yet**.
  - `THI_CONG`: modify/create the files according to the confirmed decision.
  - `NGHIEM_THU`: only run the §5 check gates.

## Inputs (Đầu vào)

- `qa-system/templates/skills/LUAT-TAO-SKILL.md` — the mandatory rules, read first.
- The user's upgrade request in natural language, **or** a `.md` file the user provides.
- `knowledge/_system_map.json` — **look it up first** with `npm run map -- <keyword>` / `npm run json -- knowledge/_system_map.json <path>`, to know what the system currently has (`AGENTS.md` §1.3).
- `qa-system/core/QA_STANDARD.md` — so that the new skill **points to** the right sections instead of copying rules.
- `qa-system/templates/README.md` — the 4 architecture layers and the 7 steps for building a new agent.
- `qa-system/templates/AGENT.md` · `qa-system/templates/skills/ten-skill.md` — the templates that must be used.
- `qa-system/workflows/WORKFLOW.md` — the current pipeline map.

> `_system_map.json` missing → STOP, run `npm run map:sync` first. Never guess the system's structure.

## MUST NOT (specific to this skill)

- **Do not modify `qa-system/core/QA_STANDARD.md`** unless the change really applies to **≥ 2 skills**. It is the constitution of the shared-rule layer; careless edits break every agent at once.
- **Do not create a new agent when adding a skill is enough.** Agent inflation makes the QA Leader's dispatch matrix unreadable.
- **Do not edit a file and then abandon the declarations.** Editing the content without propagating to all 7 anchor points of §4 counts as **not done**; the verdict is `FIX`.
- **Do not assign an `NN` number that is already used.** Before assigning a number, list the sequence in use.
- **Do not delete old skills/agents** "to tidy up". Only add and modify. Removal is a human decision (§6).
- Do not copy rules that already exist in `qa-system/core/QA_STANDARD.md` (verdict, ASK gate, labels, FACT, 06W, boundary chain, knowledge, IDs, scales) — only point to the section number.
- Do not put examples from a specific business domain (vouchers, login…) into a core skill: the model will copy the examples as facts. Examples must be neutral (`<field>`, `BR-01`).

---

## 1. Step 1 — Classify the request (A / B / C decision tree)

Answer the 3 questions in turn and stop at the first one that gives an answer:

```
 (1) Does the request only change the BEHAVIOUR of an existing skill
     (add an output field, tighten a rule, change a format, add a step)?
        │
        └─ YES ───────────────────────────────────► [C] REFINE IN PLACE
        └─ NO  ──► go to (2)

 (2) Is there an agent that owns EXACTLY the specialist domain of this new task?
     (look up the `specialized_agents` table in _system_map.json)
        │
        ├─ NO  ───────────────────────────────────► [B] BUILD A NEW AGENT
        └─ YES ──► go to (3)

 (3) If this task were given to that agent, would it exceed ONE role?
     Check the 3 signs of exceeding a role:
       · It would have to read a completely different type of artifact (e.g. images, code, runtime logs)
       · It would have to write into a different area from the one it writes now
       · The "Who it is" description in AGENT.md would need an extra "and also..." clause
        │
        ├─ YES (≥1 sign) ─────────────────────────► [B] BUILD A NEW AGENT
        └─ NO ────────────────────────────────────► [A] ADD A SKILL TO AN EXISTING AGENT
```

**Produce the decision table** (mandatory, even when the user has already said what they want):

| Item | Content |
|---|---|
| Original request | *the user's words, verbatim* |
| Specialist domain | *e.g. accessibility testing* |
| Candidate agent | *the closest agent name, or `KHÔNG CÓ` (none)* |
| Question (1) / (2) / (3) | *Yes / No with a one-line reason* |
| **Conclusion** | **`[A]` / `[B]` / `[C]`** |
| Final reason | *1–2 sentences* |

> If the user asks for `[B]` but the decision tree gives `[A]` (or vice versa): **state the recommendation and the reason, then do what the user wants**. This decision belongs to humans (§6).

## 2. Step 2 — Put it at the right layer (3-question self-check)

Before writing a single line, answer the questions of `qa-system/templates/README.md`:

| Question | If YES, the content belongs in |
|---|---|
| Must **every** skill obey this constraint? | `qa-system/core/QA_STANDARD.md` — **not** in the skill |
| Is this standard table used by **≥ 2 skills**? | `qa-system/core/QA_STANDARD.md`, then point to it |
| Is this a **fact about one specific feature**? | `knowledge/features/<slug>.md` — **not** stuffed into the skill |
| Everything else (procedure, parameters, output format specific to this task) | `qa-system/qa-<agent>/skills/<skill-name>.md` |
| Identity, permissions, boundaries, handover | `qa-system/qa-<agent>/AGENT.md` |

> The wrong layer is the most common mistake when upgrading the system. This step must not be skipped.

## 3. Step 3 — Assign the sequence number `NN` to a new deliverable

Applies only when the new skill **produces a new deliverable file** in `OUTPUT/<task-slug>/`.

1. List the prefixes in use from table §2 of `qa-system/workflows/WORKFLOW.md` (including `NN_` and `G<n>_`).
2. Assign the **next unused number** (after the highest one). Do not insert in between, do not reuse, never let two deliverables share a number.
3. A variant of an existing step (e.g. a shortened version of `06`) uses a letter suffix: `06b_`.
4. If a tool reads this file (gate, lint, readiness…), check the tool before naming/renaming it — renaming without updating the tool breaks the gate.

## 4. Step 4 — Propagate to the 7 anchor points (the part most easily forgotten)

This is the difference between "the file was edited" and "the system still runs". Tick each row once it is done.

| # | Anchor point | What must be updated | `[A]` | `[B]` | `[C]` |
|---|---|---|:---:|:---:|:---:|
| **N1** | `qa-system/qa-<agent>/skills/<name>.md` | The skill content, following the template `qa-system/templates/skills/ten-skill.md`. Frontmatter `name` + `description`, an output format section, and an acceptance gates section | ✅ | ✅ | ✅ |
| **N2** | `qa-system/qa-<agent>/AGENT.md` | Add a line under `## Skill sở hữu` (owned skills) **and** to the capability table if the agent has one. The name must **match exactly** the file name in `skills/` | ✅ | ✅ | — |
| **N3** | `qa-system/workflows/WORKFLOW.md` | Table §2 (`# · Agent · Skill · In · Out`). Add to §1 if a new branch opens. Add to the runbook table §5 if there is a new runbook | ✅ | ✅ | ⚠️ if In/Out changes |
| **N4** | `knowledge/_system_map.json` | `routing_table` (shortcut path to the skill) **and** `specialized_agents` (only for `[B]`) | ✅ | ✅ | — |
| **N5** | `qa-system/qa-lead/AGENT.md` | A new row in the **Dispatch matrix §2** + a new row in the **Intent mapping table §5** (what the user says to trigger this) | ✅ | ✅ | ⚠️ if the output changes |
| **N6** | `qa-system/tools/system/agent-doctor.js` | Add a node to `PIPELINE_DEPENDENCIES`: `skill`, `produces`, `consumed_by` | ⚠️ if a new deliverable is produced | ✅ | — |
| **N7** | `qa-system/tools/system/lint-deliverables.js` · `qa-system/tools/lib/schema.js` | Check rules and parser for the new format — only when a tool must read that deliverable; with test cases in `__tests__/` | ⚠️ | ⚠️ | ⚠️ if a tool-read format changes |

For `[B]` only — building a new agent — do **all 7 steps** of `qa-system/templates/README.md`, plus:

| # | Extra work for `[B]` |
|---|---|
| B-a | Create `qa-system/qa-<name>/` and `qa-system/qa-<name>/skills/` |
| B-b | `AGENT.md` copied from `qa-system/templates/AGENT.md`, with **every** `<…>` placeholder replaced |
| B-c | `AGENT.md` **must** have a `Human-Final` section — stating which decisions are never delegated to the agent |
| B-d | The `Knowledge` section defaults to **writes nothing** — who writes which section follows the QA_STANDARD §8 table |
| B-e | Update `qa-system/README.md` (the folder table) |
| B-f | If the agent opens a new branch → declare it in table §1 of `WORKFLOW.md` |

## 5. Step 5 — Acceptance gate "the system still runs smoothly"

Run every check and record the real results (never write "OK" without running it):

| # | Check | Command | Passes when |
|---|---|---|---|
| G1 | Structural integrity | `npm run agent:check` | No structural errors; every skill declared in `AGENT.md` has a real file |
| G2 | Blast radius | `npm run agent:check -- --impact <agent>` | The list of affected steps is correct; each of those steps has been reviewed again |
| G3 | Map sync | `npm run map:sync` | `_system_map.json` updated; reopening it shows the new entry |
| G3b | Internal tool tests | `npm test` | Every case green. If the upgrade touches `qa-system/tools/`, **add a test case that reproduces** the change |
| G4 | Smoke test of an old flow | Re-run **any old stage unrelated** to the change | Produces the same deliverable as before; the verdict is unchanged |
| G5 | Skill acceptance (mandatory for a new/edited skill) | See §5.1 | All 5 conditions met |

### 5.1. Acceptance of a new or edited skill

| # | Condition | How to check |
|---|---|---|
| a | **Points to, never copies** QA_STANDARD rules | No copied verdict / label / FACT / 06W / knowledge-writing table; only `QA_STANDARD §n` |
| b | **Declares all inputs**, including knowledge | The "Đầu vào" (inputs) section lists the deliverables to read + `knowledge/_project.md` + `knowledge/features/<slug>.md` (QA_STANDARD §7) |
| c | **Machine-readable output** | The line-2 meta line follows QA_STANDARD §7; every table has a source / trace-code column (§9); codes come from `npm run ids -- <slug>` |
| d | **Two runs give the same result** | Run the skill **twice** on the same sample input (a fresh session each time). Compare with `npm run diff-runs -- <OUTPUT run 1> <OUTPUT run 2>` (code sets, quotes, questions, numbers, verdict). Every difference must be explainable; an unexplainable one ⇒ the skill still leaves room for the model to invent ⇒ `FIX` |
| e | **No domain-specific examples** in a core skill | Examples use neutral placeholders, with no values/messages from a real project |

**Mandatory manual checks** (the tools cannot catch these):

- [ ] Open `AGENT.md` — the `## Skill sở hữu` list matches the file names in `skills/` **line by line**
- [ ] Every path uses the correct case: `OUTPUT/` · `INPUT/` · `qa-system/qa-*/` · `qa-system/workflows/`
- [ ] No `<…>` placeholder left in the new file
- [ ] The new skill writes **exactly one** output file, with the meta line `Owner · Nguồn · Verdict`
- [ ] When the user types the matching natural phrase, the QA Leader routes correctly to the new skill (try 1 real phrase)

Quick command to find wrong paths:

```bash
grep -rn "output/\|_shared/\|agents/qa-\|workflow/[a-z]" --include=*.md qa-system knowledge | grep -v "workflows/"
```

No output means clean.

## 6. Human-Final — not decided by the agent

This skill **proposes**, the user **decides**:

- Choosing `[A]` or `[B]` when the boundary is blurred — an agent's role boundary is a human design decision.
- **Removing** or replacing an existing skill/agent.
- Modifying `qa-system/core/QA_STANDARD.md` — it touches the constitution of the shared-rule layer.
- Changing the order of the stages in the main pipeline.
- Accepting an upgrade while the §5 acceptance gates are not all green.

## Output format

The upgrade record is **not** kept in the repo. Ask the user where to store it (default: a temporary folder / outside the repo,
not committed) and present it in the conversation using this template (headings and status words kept as written):

````markdown
# BIÊN BẢN NÂNG CẤP HỆ THỐNG · <ten-nang-cap>
Owner: qa-system/qa-lead/skills/system-upgrade-governance.md · Ngày: <YYYY-MM-DD> · Verdict: <PASS/FIX/ASK>

## 1. Yêu cầu gốc
<nguyên văn câu người dùng nói / mô tả file người dùng đưa>

## 2. Bảng quyết định (cây A/B/C)
| Mục | Nội dung |
|---|---|
| Miền chuyên môn | <…> |
| Agent ứng viên | <…> |
| Câu (1) | <Đúng/Sai — lý do> |
| Câu (2) | <Đúng/Sai — lý do> |
| Câu (3) | <Đúng/Sai — lý do> |
| **Kết luận** | **[A] / [B] / [C]** |

## 3. Đặt tầng
| Nội dung | Đặt vào tầng | Lý do |
|---|---|---|
| <…> | <AGENT.md / skills/ / QA_STANDARD.md / knowledge/> | <…> |

## 4. Lan truyền 7 điểm neo
| # | Điểm neo | File đã sửa | Nội dung thay đổi | Trạng thái |
|---|---|---|---|---|
| N1 | skills/ | `qa-system/qa-…/skills/….md` | <…> | ĐÃ XONG |
| N2 | AGENT.md | `qa-system/qa-…/AGENT.md` | <…> | ĐÃ XONG |
| N3 | WORKFLOW.md | §2 bảng điều phối | <…> | ĐÃ XONG |
| N4 | _system_map.json | routing_table | <…> | ĐÃ XONG |
| N5 | qa-lead/AGENT.md | §2 + §5 | <…> | ĐÃ XONG |
| N6 | agent-doctor.js | PIPELINE_DEPENDENCIES | <…> | KHÔNG ÁP DỤNG |
| N7 | lint-deliverables.js | luật kiểm deliverable | <…> | KHÔNG ÁP DỤNG |

## 5. Cổng nghiệm thu
| # | Kiểm tra | Kết quả thật |
|---|---|---|
| G1 | `npm run agent:check` | <dán output rút gọn> |
| G2 | `--impact <agent>` | <danh sách bước bị ảnh hưởng> |
| G3 | `npm run map:sync` | <đã cập nhật mục nào> |
| G4 | Smoke luồng cũ | <chặng nào, kết quả> |
| G5 | Nghiệm thu skill §5.1 | <a–e: đạt/không; d: hai tập mã + verdict, khác biệt và lý do> |

## 6. Rủi ro còn lại & việc cần người quyết
- <…>
````

(Sections: 1 original request · 2 decision table (A/B/C tree) · 3 layer placement · 4 propagation to the 7 anchor points ·
5 acceptance gates with real results · 6 remaining risks & decisions for humans. Status words: `ĐÃ XONG` = done, `KHÔNG ÁP DỤNG` = not applicable.)

## Acceptance gates (Quality Gates)

- [ ] There is an A/B/C decision table with an explicit reason for **all 3 questions** of the decision tree — no bare conclusion.
- [ ] Every anchor point in the §4 table that applies to the chosen branch is `ĐÃ XONG` or `KHÔNG ÁP DỤNG` **with a reason**; any empty row → `Verdict: FIX`.
- [ ] Gates `G1`–`G5` have **real results** from actual runs, not predictions; any red gate → `Verdict: FIX`.
- [ ] The skill names under `## Skill sở hữu` exactly match the file names on disk.
- [ ] The record has been presented to the user and stored where they chose — never written into the repo unless they ask.
- [ ] No content is placed at the wrong layer according to the §2 self-check table.

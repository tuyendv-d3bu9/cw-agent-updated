# RULES FOR CREATING / EDITING A SKILL — MANDATORY FOR EVERY AI AGENT

> **Scope:** every creation, edit, rename or removal of any file in `qa-system/` (skills, `AGENT.md`, workflows,
> templates, tools) and `knowledge/_system_map.json`. Applies to every AI tool (Claude Code, Antigravity, Codex,
> Cursor, Copilot, Gemini…).
>
> **Read this whole file before editing any file.** Every **MUST** / **FORBIDDEN** item is a hard rule with no implicit exceptions.
> A situation this file does not cover ⇒ **STOP and ask the user**; do not infer by yourself.
>
> Detailed procedure: `qa-system/qa-lead/skills/system-upgrade-governance.md`. This file is the **rules** part; when the two files
> seem to differ, follow the stricter one and tell the user where they differ.

---

## 0. Loading order

1. This file.
2. `qa-system/qa-lead/skills/system-upgrade-governance.md` — the PHAN_TICH → THI_CONG → NGHIEM_THU procedure (analyse → build → accept).
3. `qa-system/core/QA_STANDARD.md` — to **point to** the right section numbers, never copy.
4. `qa-system/templates/skills/ten-skill.md` (skill) or `qa-system/templates/AGENT.md` (agent) — the mandatory templates.
5. `npm run map -- <keyword>` to know what the system currently has. Opening a `.json` file directly is **FORBIDDEN**; use `npm run json`.

---

## 1. Stop gate — human approval required

You **MUST** run PHAN_TICH first and **STOP** until the user agrees explicitly ("agreed", "go ahead") before editing any file.
A question from the user (even "should we…?") is **not** an order to edit.

The PHAN_TICH output must contain:

| Item | Content |
|---|---|
| Original request | The user's words, verbatim |
| A/B/C tree | Answers to all 3 questions (§2), each with a reason naming the files looked up |
| Conclusion | `[A]` / `[B]` / `[C]` + the target agent |
| Layer placement | The §3 table for each piece of content to be written |
| Deliverable number | If a new output file is produced (§5.3) |
| 7 anchor points | The list of files to be edited (§6) |
| Blast radius | The real result of `npm run agent:check -- --impact <agent>` |

**Always ask the user, never decide yourself** (Human-Final):
- Editing `qa-system/core/QA_STANDARD.md`.
- Choosing `[B]` (a new agent), or a blurred A/B boundary.
- Removing / renaming / replacing an existing skill or agent.
- Changing the order of the main pipeline's stages, or loosening / dropping a gate (ASK, lint, readiness, hook, pre-commit).
- Accepting while the §7 acceptance is not all green.

---

## 2. Classification — stop at the first question that gives an answer

1. Does it only change the **behaviour** of an existing skill (add a field, tighten a rule, change a format, add a step)? ⇒ **`[C]` edit in place**.
2. Is there an agent that owns exactly this area of work (look up `specialized_agents`)? No ⇒ **`[B]`**.
3. Would giving it to that agent exceed one role — reading a completely different type of artifact, writing into a different area, or the
   "Who it is" description needing an "and also…"? Yes ⇒ **`[B]`**. No ⇒ **`[A]` add a skill to that agent**.

Building a new agent when `[A]` is enough is **FORBIDDEN**. Merging two tasks of different roles into one skill to save time is **FORBIDDEN**.

---

## 3. Layer placement — each piece of content in exactly one place

| Content | The only place | FORBIDDEN |
|---|---|---|
| Rules every skill must follow; standard tables used by ≥ 2 skills | `qa-system/core/QA_STANDARD.md` (Human-Final) | Copying them into a skill / `AGENT.md` / `AGENTS.md` |
| Facts about one feature: values, thresholds, message texts, error codes | `knowledge/features/<slug>.md` | Putting them into a skill, template or example |
| Project-wide conventions | `knowledge/_project.md` (declared by humans) | The agent filling it in itself |
| The method, parameters and output format specific to one task | `qa-system/qa-<agent>/skills/<skill-name>.md` | Stuffing identity / permissions into a skill |
| Identity, permissions, boundaries, handover, Human-Final | `qa-system/qa-<agent>/AGENT.md` | Stuffing a detailed procedure into `AGENT.md` |

---

## 4. Rules for writing a skill — against fabrication and drift

| # | MUST | FORBIDDEN |
|---|---|---|
| R1 | First line: `> Complies with qa-system/core/QA_STANDARD.md (§…)` (older skills: `> Tuân thủ …`) and **point to the section number** for every shared rule | Copying the verdict table, labels, FACT, 06W, the boundary chain, the knowledge-writing rule, the scales |
| R2 | Examples use neutral placeholders: `<field>`, `<threshold>`, `BR-01`, `<MODULE>-001` | Examples from a real project / domain (vouchers, login, refunds, money amounts, real message texts) — the model copies examples as facts |
| R3 | The "Đầu vào" (inputs) section lists every file to read **and** `knowledge/_project.md` + `knowledge/features/<slug>.md`; a mandatory input missing ⇒ STOP | "If missing, infer it / use a reasonable value / follow industry experience" |
| R4 | A value missing from the sources ⇒ the label `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` or a question for the BA (QA_STANDARD §2.1) | Filling the gap; using `[GIẢ ĐỊNH]` in a value cell |
| R5 | Quantity is a consequence of the sources; scan by a closed table / matrix, and stop once it is scanned | Targets like "at least N questions / test cases / records" |
| R6 | Whatever the machine can do, call the command: codes ⇒ `npm run ids -- <slug> --assign`; frames ⇒ `npm run scaffold`; boundary points ⇒ `npm run boundary`; data > 10 records ⇒ `npm run data:gen` | Telling the model to count numbers, draw fixed frames or compute boundary points itself |
| R7 | Write **exactly one** output file in `OUTPUT/<slug>/`; line 2 is the meta line `Owner: … · Nguồn: … · Verdict: PASS/FIX/ASK` (QA_STANDARD §7) | Several output files; a bold verdict or one outside the first 10 lines |
| R8 | Every table has a source column (`file §section`) or a trace code (§9); a row with a concrete value carries a verbatim quote when the skill extracts it from documents | Tables whose sources cannot be traced |
| R9 | Questions for the BA are **closed** questions (Yes/No, a number, a choice between options) | "How does the system handle it?" |
| R10 | The "MUST NOT (specific to this skill)" section states the boundary with the previous / next step | A skill doing another stage's work (scope creep) |
| R11 | The "Acceptance gates" section is a checklist **checkable by a command or by eye against a criterion** | Vague checklists ("ensure good quality") |
| R12 | Skill and tools **must not contradict each other**: whatever format / step the skill requires, lint, schema and gate must accept exactly that format / step | Changing the output format without updating `lint-deliverables.js` / `lib/schema.js` + tests in the same change |
| R13 | Each sentence in a skill has one meaning; verdict names, codes and section names are used exactly as in QA_STANDARD | Giving a new name to an existing concept |

> Parse-safety: headings, column headers, labels, status words and meta lines that tools read (or that the model copies
> into deliverables the tools read) stay **verbatim** — even when the surrounding prose is translated. Grep `qa-system/tools`
> and `qa-system/tools/__tests__` before renaming any of them; an English gloss may be added next to them in prose only.

---

## 5. Templates, names and numbers

1. A new skill **MUST** be copied from `qa-system/templates/skills/ten-skill.md`; a new agent from `qa-system/templates/AGENT.md`.
   Leaving any template `<…>` placeholder in a finished file is **FORBIDDEN**.
2. Skill file name = the frontmatter `name` = the name listed under `## Skill sở hữu` of `AGENT.md` — matching **character for character**.
   Paths use the correct case: `qa-system/qa-*/`, `OUTPUT/`, `INPUT/`, `qa-system/workflows/`.
3. A new deliverable takes the **next number after the highest one** in table §2 of `qa-system/workflows/WORKFLOW.md`.
   Inserting in between, reusing a number, or two deliverables sharing a number is **FORBIDDEN**. A variant of an existing step uses a letter suffix (`06b_`).
4. Renaming a deliverable file that a tool reads (gate, lint, readiness, merge, export) without updating the tool + tests is **FORBIDDEN**.

---

## 6. Propagation — only done once all 7 anchor points are covered

| # | File | Update | `[A]` | `[B]` | `[C]` |
|---|---|---|:-:|:-:|:-:|
| N1 | `qa-system/qa-<agent>/skills/<name>.md` | Content per §4–§5 | MUST | MUST | MUST |
| N2 | `qa-system/qa-<agent>/AGENT.md` | `## Skill sở hữu` (+ the capability table if any) | MUST | MUST | — |
| N3 | `qa-system/workflows/WORKFLOW.md` | Table §2 (agent · skill · in · out); §1 if a branch opens | MUST | MUST | if in/out changes |
| N4 | `knowledge/_system_map.json` | `npm run map:sync` (`routing_table`; `specialized_agents` for `[B]`) | MUST | MUST | — |
| N5 | `qa-system/qa-lead/AGENT.md` | §2 dispatch matrix + §5 the phrase the user says to trigger it | MUST | MUST | if the output changes |
| N6 | `qa-system/tools/system/agent-doctor.js` | `PIPELINE_DEPENDENCIES` (`skill`, `produces`, `consumed_by`) | if there is a new deliverable | MUST | — |
| N7 | `lint-deliverables.js` · `lib/schema.js` · `__tests__/` | Check rules + parser + tests for the new format | if a tool reads it | if a tool reads it | if a tool-read format changes |

`[B]` additionally: create `qa-system/qa-<name>/skills/`; `AGENT.md` has a `Human-Final` section; the `Knowledge` section defaults to **writes nothing**;
update the folder table in `qa-system/README.md`.

Each row must be `ĐÃ XONG` (done) or `KHÔNG ÁP DỤNG` (not applicable) **with a reason**. Any empty row ⇒ verdict `FIX`; it may not be reported as done.

---

## 7. Acceptance — "done" only with real evidence

You **MUST** run these and paste the **real results** (never write "OK" without running them):

```bash
npm test                              # all green; touching qa-system/tools/ ⇒ add a test reproducing the change (red before, green after)
npm run agent:check                   # INTACT
npm run agent:check -- --impact <agent>
npm run map:sync
npm run workflow -- validate
```

You **MUST** actually run the new / edited skill **twice, in a fresh session each time**, on the standard exercise set:

```bash
npm run intake -- docs/skill-lab/de-bai --slug <slug-run-1> --force
npm run intake -- docs/skill-lab/de-bai --slug <slug-run-2> --force
# … run up to the affected skill's stage for each slug …
npm run diff-runs -- OUTPUT/<slug-run-1> OUTPUT/<slug-run-2>
npm run lint -- <slug-run-1>          # 0 errors
```

- Every difference between the two runs **must be explainable by a sentence in the skill**. Not explainable ⇒ the skill still leaves room
  for the model to invent ⇒ go back to §4, verdict `FIX`.
- You **MUST** re-run an **unrelated** old stage to prove the existing flow still produces the same output.
- You **MUST** test routing: type a natural user phrase, and the QA Leader calls the right skill.
- When finished, you **MUST** clean up the test tasks (`INPUT/<slug>`, `OUTPUT/<slug>`, `knowledge/features/<slug>.md`).

Command to find wrong paths (no output means clean):

```bash
grep -rn "output/\|_shared/\|agents/qa-\|workflow/[a-z]" --include=*.md qa-system knowledge | grep -v "workflows/"
```

---

## 8. Git

1. You **MUST** work on a separate branch; editing `develop` / `main` directly is **FORBIDDEN**.
2. You **MUST** split commits: (a) changes to `qa-system/` + `knowledge/_system_map.json`; (b) test-run data
   (`INPUT/`, `OUTPUT/`, `knowledge/features/`). Only (a) may go to `develop`.
3. `git commit --no-verify` to bypass the pre-commit hook is **FORBIDDEN**. Committing / pushing before the user asks is **FORBIDDEN**.
4. The upgrade record stays **outside the repo** (the user chooses where to store it), never committed.

---

## 9. Final report — in the template

```markdown
# BIÊN BẢN NÂNG CẤP · <ten-nang-cap>
Owner: qa-system/qa-lead/skills/system-upgrade-governance.md · Ngày: <YYYY-MM-DD> · Verdict: <PASS/FIX/ASK>

1. Yêu cầu gốc: <nguyên văn>
2. Quyết định: [A]/[B]/[C] vào <agent> — lý do 3 câu
3. Đặt tầng: <bảng>
4. 7 điểm neo: <bảng N1–N7, trạng thái + lý do>
5. Nghiệm thu: <kết quả thật từng lệnh §7; tập mã + verdict hai lần chạy; giải thích từng khác biệt>
6. Việc cần người quyết: <…>
```

(Items: 1 original request, verbatim · 2 decision [A]/[B]/[C] into <agent> with the 3-question reasoning · 3 layer placement ·
4 the 7 anchor points N1–N7 with status + reason · 5 acceptance: real result of each §7 command, code sets + verdict of both runs,
an explanation for each difference · 6 decisions needed from humans.)

---

## 10. Self-check before reporting "done" — one unticked box means not done

- [ ] The user approved PHAN_TICH in explicit words.
- [ ] No edit to `QA_STANDARD.md` / no skill removed / no gate loosened without agreement.
- [ ] The skill points to QA_STANDARD and copies no rules (R1); no real-domain examples (R2).
- [ ] Inputs include knowledge; missing ⇒ STOP (R3). Missing value ⇒ a label, never filled (R4). No targets (R5).
- [ ] Codes / frames / boundary points generated by commands (R6). One output file, correct meta line (R7). Tables have a source column (R8).
- [ ] Skill and tools agree; a format change ⇒ lint/schema + tests updated (R12).
- [ ] No `<…>` placeholder left; file name = `name` = the `Skill sở hữu` line.
- [ ] 7 anchor points: each row ĐÃ XONG or KHÔNG ÁP DỤNG with a reason.
- [ ] `npm test` green · `agent:check` INTACT · `map:sync` · `workflow -- validate` — real results pasted.
- [ ] Two real runs + `diff-runs`, every difference explainable; an unrelated old stage still produces the same output.
- [ ] Routing tested with a natural phrase. Test tasks cleaned up.
- [ ] Separate branch, commits split per §8, no `--no-verify`.

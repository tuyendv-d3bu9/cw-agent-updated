# qa-system/templates/ — templates

| File | Use when |
|---|---|
| `AGENT.md` | Building a new agent |
| `skills/ten-skill.md` | Writing a new skill (`ten-skill` = "skill-name") |
| `workflows/workflow.md` | `npm run workflow -- new <name>` copies this template |
| `run/` | Test-run session per ticket (`OUTPUT/<slug>/runs/RUN-XX_<ticket>/`) |
| `automation/` | Playwright skeleton for `npm run init` |
| `knowledge/` | The `knowledge/` template for a new project (copied by `npm run init`) |

Full upgrade procedure (the `[A]/[B]/[C]` tree, 7 anchor points, acceptance):
`qa-system/qa-lead/skills/system-upgrade-governance.md`.

---

## 4 layers — put things in the right place

| Layer | File | Contains |
|---|---|---|
| **WHO** | `qa-system/qa-<agent>/AGENT.md` | Identity · owned skills · may/may not · Human-Final · handover |
| **HOW** | `qa-system/qa-<agent>/skills/<ten-skill>.md` | Parameters · inputs · steps · output format |
| **COMMON RULES** | `qa-system/core/QA_STANDARD.md` | Verdict · ASK gate · labels · FACT · 06W · risk · boundary strings · I/O · knowledge · ids · sources · scales |
| **KNOWLEDGE** | `knowledge/` | `_project.md` (whole project) · `features/<slug>.md` (one feature) |

Three self-check questions:
- Must **every** skill obey it? → QA_STANDARD, do not write it into a skill.
- A standard table used by **≥2 skills**? → QA_STANDARD. Only 1 skill → keep it in that skill.
- **Facts of one feature**? → `knowledge/features/<slug>.md`, do not stuff them into a skill.

---

## 7 steps to build a new agent

1. Create `qa-system/qa-<name>/` and `qa-system/qa-<name>/skills/`.
2. Copy `templates/AGENT.md` → `qa-system/qa-<name>/AGENT.md`, replace every `<…>`.
3. Copy `templates/skills/ten-skill.md` → `qa-system/qa-<name>/skills/<ten-skill>.md` for each skill.
4. Declare the skills in the `## Skill sở hữu` (owned skills) section of `AGENT.md` — **exactly matching** the file names in `skills/`.
5. Declare in `qa-system/workflows/WORKFLOW.md`: table §2, and §1 if opening a new branch. Deliverable file names
   must not collide with prefixes already in use (governance §3).
6. Dedicated runbook (if needed): `npm run workflow -- new run-<goal>`, `validate` green.
7. Update `qa-system/README.md`, `qa-system/qa-lead/AGENT.md` (§2 + §5), then `npm run map:sync`.

---

## Check before considering it done

- [ ] No `<…>` left over
- [ ] `## Skill sở hữu` matches the file names in `skills/`
- [ ] `AGENT.md` has a `Human-Final` section
- [ ] **Skill acceptance** (mandatory for a new or edited skill — details in governance §5.1):
  - [ ] (a) Points to QA_STANDARD, does not copy rules
  - [ ] (b) "Inputs" fully declared, including `knowledge/_project.md` + `knowledge/features/<slug>.md`
  - [ ] (c) Output is one file, QA_STANDARD §7 meta line, tables have a source / trace-id column
  - [ ] (d) Run **twice** on the same sample input then `npm run diff-runs -- <OUTPUT/slug-run-1> <OUTPUT/slug-run-2>`; differences must be explainable
  - [ ] (e) No domain-specific examples in the core skill
- [ ] `npm test` and `npm run agent:check` green, paste the real result

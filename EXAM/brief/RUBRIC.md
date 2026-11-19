# Rubric — `shopgo-refund-v1` (rubric version `grad-v1.0.0`)

Total **100** = **70 automated** (A1 8 + A2 12 + A3 14 + A4 14 + A5 14 + A6 8) + **30 instructor**
(I1 10 + I2 10 + I3 10).

Principles:

- Automated points come only from deterministic checks. Every check names its evidence (a file in your
  submission or an evidence file produced by the grader).
- Multiple valid QA solutions are accepted when evidenced. Checks test **consistency with your own
  declared decisions and with the sources**, not equality with one reference answer.
- The grader uses its own trusted copy of the tools, the lint and the INPUT from the exam starter. Your
  modified tools, reports, `_gate.log`, self-check output or any score written in your files are never
  trusted for grading.

## 1. Automated — 70

| Id | Area | Pts | Checks | Partial credit |
|---|---|---|---|---|
| **A1** | Framework compliance | 8 | a. `agent:check` INTACT with trusted tools (3) · b. starter's baseline test suite passes against your code, in a container (3) · c. no baseline test deleted, no protected framework file removed (2) | a 0/3 · b `3×passed/total`, floor to 0.5 · c −1 per violation, min 0 |
| **A2** | T1 customisation | 12 | a. changed files lie in the layers allowed for the **declared** class A/B/C (3) · b. anchors required by that class are `done` with matching changes; `n/a` only with reason (4) · c. skill structure: frontmatter, `Format output`, acceptance gate (2) · d. hidden fixtures: affected tools accept the valid and reject the invalid sample of the T1 requirement (3) | b `4×ok/required` · d 1.5 each direction |
| **A3** | T2 new agent | 14 | a. structure from template, no `<…>` placeholders (3) · b. `Human-Final` + `Knowledge` sections (2) · c. registered in 5 places (2 in system map, `WORKFLOW.md`, qa-lead, agent-doctor) (4) · d. `agent:check --impact` resolves it with ≥1 edge (2) · e. example output exists and has the sections/fields its skill declares (3) | c `4×ok/5`; others per item |
| **A4** | T3 pipeline | 14 | a. `01`…`06` present with official names, 0.5 each (3) · b. lint with **canonical INPUT** and trusted tools (4) · c. ASK discipline re-derived by the grader: no stage 03–06 file whose content depends on open ASK questions (3) · d. hidden benchmark: requirement gaps that exist in the INPUT are raised as OQ/MR (4) | b `4 − 0.5×errors`, min 0 · d `4×found/total` (borderline matches → human review) |
| **A5** | Traceability & anti-fabrication | 14 | a. BR/FD/AF quotes found verbatim in canonical INPUT (4) · b. TCs trace to existing BR/FD; no orphan ids (3) · c. numeric values have provenance (2) · d. no `[DOMAIN]` item as BR/FD source (2) · e. ambiguous-rule check: an ambiguous rule in the INPUT is raised as OQ/MR, with no invented value (3) | a, b proportional · e 3 asked / 1 noted as risk / 0 invented |
| **A6** | Tests & validation | 8 | a. changed tools have new passing tests (3) · b. hidden instructor tests for T1/T2 pass (3) · c. your tool changes are deterministic on two runs (2) | proportional; a = 0 if tools changed without tests |

Checks that need to run your code (A1b, A2d, A6) run only in an isolated container. If no container is
available, those checks are `PENDING_HUMAN_REVIEW` — never 0.

The hidden benchmark (A4d) and the ambiguous-rule check (A5e) are not published. They reward raising
precise questions about what the INPUT does not settle; they never reward a guessed value.

**Open book.** This is an open-book, AI-assisted assessment (README §8). Reading published solutions or BA
answers is allowed and is not penalised. Every point still requires artifacts that pass these checks against
this exam's `INPUT/shopgo-refund/`; a value taken from outside that INPUT and written into a business rule is
an invented value (A5e = 0). The live defense (I3) includes a small change request handled on the spot.

## 2. Instructor — 30

| Id | Area | Pts | Levels | Evidence |
|---|---|---|---|---|
| **I1** | QA reasoning & risk analysis | 10 | 9–10 prioritised with stated basis, each high risk → viewpoint/test idea · 6–8 correct, shallow · 3–5 generic · 0–2 missing | `01`, `03`, `DECISIONS.md` |
| **I2** | Test design & BR interpretation | 10 | 9–10 BR reading matches sources, boundaries complete, negative + state cases · 6–8 minor gaps · 3–5 happy-path · 0–2 not derivable | `02`, `05`, `06` |
| **I3** | Explanation & live defense | 10 | 5 items × 0/1/2: T1 decision, T2 anchors, trace one TC to its quote, ambiguous-rule handling, live change request | defense notes |

Alternative solutions: a level is awarded for any approach you justify with source evidence; the
instructor's form requires the cited file for each level.

## 3. Passing conditions

```
PASS ⇔ total.score ≥ 60
     ∧ pipeline_minimum
     ∧ I3.points ≥ 4
pipeline_minimum ⇔ files 01, 02, 05 (spec) and 06 present with official names
                 ∧ A4.points ≥ 7.0
                 ∧ A5.a quote check ≥ 50 % of quotes verified (A5.a ≥ 2.0)
```

Any condition `null` ⇒ status stays `PENDING` / `NEEDS_HUMAN_REVIEW`.

## 4. Result statuses

| Status | Meaning |
|---|---|
| `NO_SUBMISSION` | No branch `exams/<student-id>` was found at the deadline |
| `INVALID_SUBMISSION` | A blocking preflight error (B-01 … B-05, see [SELF-CHECK.md](SELF-CHECK.md)); automated grading did not run |
| `PENDING` | Some parts are not graded yet (for example the instructor review or the live defense) |
| `NEEDS_HUMAN_REVIEW` | A check could not be decided automatically (borderline match, no container, integrity flag) |
| `PASS` | All three passing conditions are `true` |
| `FAIL` | The total exists and at least one passing condition is `false` |

Each check has a state: `PASSED`, `PARTIAL`, `FAILED`, `NOT_SUBMITTED`, `PENDING_HUMAN_REVIEW` or
`NOT_GRADED`.

## 5. `null` means pending, never zero

A score that is `null` means **not decided yet**. It is shown as "pending" in the HTML and as an empty
cell in the CSV — never as 0. A criterion score is computed only when all its checks are decided; the
automated score only when A1–A6 are all decided; the total only when both automated and instructor
scores exist and no integrity flag is open. Points of checks that were already graded are kept.

## 6. What your feedback contains

Your result is one JSON file (`results/<student-id>.json`, the single source of truth) and an HTML page
rendered from it. It contains:

- the frozen commit SHA that was graded, the grader version and the rubric version;
- the preflight status with every blocking error or gradable gap and how to fix it;
- for every criterion and check: points, maximum, state, the evidence files and a short message;
- the instructor levels with the cited evidence and a comment;
- the pass conditions, open integrity flags, missing requirements and actionable feedback lines.

Feedback never contains hidden benchmark values or reference answers.

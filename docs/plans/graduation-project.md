# Implementation plan — Graduation Project v1 (branch-based, benchmark-graded)

Date: 2026-11-19 (rev. 3 — final draft for review) · Base: `develop` @ `c4238ab`
Status: **DRAFT — for owner review. Nothing is implemented: no exam branch, no grader, no framework change.**

Point totals (verified): A1 8 + A2 12 + A3 14 + A4 14 + A5 14 + A6 8 = **70** · I1 10 + I2 10 + I3 10 = **30** · total **100**.

| Rev | Change |
|---|---|
| 1 | Private repo per student, PR submission (superseded) |
| 2 | Shared repo + one branch per student, preflight, result schema |
| 3 | Hosting verified (§1.5), blocking vs gradable preflight (§4), resolved decisions Q1–Q10 (§12), schemas (§2–§3), samples (§9), folder structures (§10) |

---

## 0. Fixed decisions

| # | Decision |
|---|---|
| D1 | One shared repository, one branch per student. Old `exam` branch kept untouched for reference. |
| D2 | Tasks: **T1** customise an existing agent folder · **T2** create a new agent folder · **T3** run stages 01–06 on the exam feature. Same T1 objectives and criteria for all students (v1). |
| D3 | Answer keys, hidden benchmarks, instructor tests, grader secrets and roster live only in `$GRADER_PRIVATE`, outside the shared repository. |
| D4 | Students push to `exams/<student-id>`; unlimited pushes before the deadline; the instructor freezes one SHA per student at the deadline and grades it locally. Student work is never merged anywhere. |
| D5 | 70 automated + 30 instructor. Pass = total ≥ 60 **and** pipeline minimum (§5.3) **and** I3 ≥ 4. |
| D6 | ShopGo baseline, exam `shopgo-refund-v1` built from the existing refund (`hoan-tien`) material, in English. |
| D7 | English canonical for brief, rubric, schemas and QA artefacts. |
| D8 | `GRADING/results/<student-id>.json` is the single source of truth. HTML and CSV are generated from it, never edited. |
| D9 | AI assistance allowed and declared. No AI-content detection is used as a criterion. Understanding is assessed through reasoning, explanations and the live defense. |
| D10 | Student-controlled code runs only in Docker/Podman. If unavailable, affected checks are `PENDING_HUMAN_REVIEW`, never 0. |

Out of scope v1: automation stage beyond 06, multi-domain exams, Phase 2/3 domain packs.

---

## 1. Git branch model

### 1.1 Branches

| Branch | Lives on | Writers | Content |
|---|---|---|---|
| `develop` | shared remote | maintainers | QA Agent framework |
| `exams/shopgo-refund-v1` | shared remote | exam owners | Brief, schema, public self-check, `INPUT/shopgo-refund/`. Frozen by tag `exam/shopgo-refund-v1/starter` |
| `exams/<student-id>` | shared remote | the student (see §1.5 for what can actually be enforced) | Submission; created by the instructor from the starter tag |
| `grading/shopgo-refund-v1` | instructor's dedicated local grading clone only | instructor | `GRADING/` results, forms, freeze record; managed by the instructor |

```
develop ──●── c4238ab ─────────────────────────────►
            \
             ● exams/shopgo-refund-v1   ← tag exam/shopgo-refund-v1/starter (= S)
             ├──●──●──● exams/nguyen-van-a   (frozen at deadline: SHA a3)
             ├──●──● exams/dao-van-b         (frozen at deadline: SHA b2)
             └── (local only) grading/shopgo-refund-v1 → GRADING/
```

### 1.2 Discovery
- Submission branches = `exams/*` whose suffix is in the private roster (`$GRADER_PRIVATE/<exam>/roster.json`). Exam branches (`exams/<exam-id>`) are always excluded; the pattern alone is not trusted.
- Student ids: lowercase ASCII kebab-case, unique per exam; collisions get a numeric suffix in the roster.
- Every roster student gets a result. No branch ⇒ status `NO_SUBMISSION`.

### 1.3 Freeze and versioning
- Exam freeze: annotated tag on the exam branch before distribution; student branches created from that tag.
- Deadline freeze: the grading script fetches, records `{student_id, branch, sha, fetched_at}` in `GRADING/freeze.json`, and saves a `git bundle` of each frozen SHA to `$GRADER_PRIVATE/<exam>/bundles/` so later remote changes (force-push, deletion) cannot alter what is graded.
- Post-deadline changes: only with explicit instructor approval, recorded in `GRADING/overrides.json` (`student_id`, old SHA, new SHA, approver, reason, timestamp). The result links to the SHA actually graded.
- Material change to an active exam ⇒ new exam version (`shopgo-refund-v2`). Typo-only errata are recorded in `$GRADER_PRIVATE/<exam>/errata.md` and announced.

### 1.4 Keeping grading results off the remote (layered, not hook-only)

| Layer | Control |
|---|---|
| 1 Separate clone | Grading happens in a **dedicated local clone** used only for grading (not the instructor's working clone) |
| 2 Push disabled by config | `git remote set-url --push origin DISABLED` in that clone — every push fails, whatever the branch |
| 3 Pre-flight guard in the grader | Before each run: abort if `git ls-remote origin 'refs/heads/grading/*'` returns anything, or if push URL is not `DISABLED` |
| 4 Local hook | `pre-push` hook rejecting `refs/heads/grading/*` (defence in depth only) |
| 5 Server-side rule | Ruleset/branch rule blocking creation of `grading/**` on the remote — **only if the hosting supports it** (§1.5) |
| 6 Content minimisation | `GRADING/` holds results and evidence copies, never answer keys; a leak exposes scores, not the benchmark |

### 1.5 Hosting verification (performed 2026-11-19, read-only `gh api`)

| Fact | Value | Evidence |
|---|---|---|
| Repository | `tuyendv-d3bu9/cw-agent-updated` | `git remote -v` |
| Owner type | **User** (personal account), not an organization | `gh api repos/…` → `owner.type = "User"` |
| Visibility | **public** | `visibility = "public"` |
| Branch protection on `develop` | none (404) | `gh api …/branches/develop/protection` |
| Rulesets | 1 ruleset `Protectd`, **disabled** | `gh api …/rulesets` |
| Account plan | Unknown (API returned `plan: null` for this token) | `gh api users/tuyendv-d3bu9` |
| Collaborator list | Unknown — the token used has read-only access (403) | `gh api …/collaborators` |

What GitHub documents:
- "Restrict who can push to matching branches" is described for **organization-owned** repositories: "public repositories owned by a GitHub Free organization, and … all repositories owned by an organization using GitHub Team or GitHub Enterprise Cloud" — [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches). Personal-account repositories are not mentioned ⇒ treated as **not available**.
- Collaborators on a personal-account repository get write (push) access; finer control requires an organization — [Permission levels for a personal account repository](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository).
- Rulesets: "for customers on GitHub Team and GitHub Enterprise plans"; whether individual users can be bypass actors, and public-repo availability, are not stated — **Unknown** — [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets).

**Conclusion: on the current repository, per-student branch isolation cannot be enforced, and every pushed branch is world-readable. The plan does not claim branch isolation.**

### 1.6 Hosting options (decision H1, §12)

| Option | Per-student push restriction | Exam/student work visible to | Cost | Note |
|---|---|---|---|---|
| H-a Current personal public repo | No | Everyone on the internet | none | Not recommended for exams |
| H-b New **private** personal repo for exams | No | All collaborators (all students) | none | Privacy from the public, not from peers |
| H-c New **public** repo in a **GitHub Free organization** | Yes (documented) | Everyone on the internet | none | Isolation of writes, no privacy |
| H-d New **private** repo in an organization on **GitHub Team** | Yes (documented) | Members granted access | paid (price not verified — Unknown) | Strongest option within the branch model |

Recommendation: **H-d** if budget allows; otherwise **H-b** with the detection controls in §7 (freeze bundles, ancestry check, push-actor audit) and the residual risks stated to students. Never run exams on H-a.

---

## 2. Submission contract — `EXAM/submission.json`

### 2.1 Fixed paths (framework conventions, `WORKFLOW.md` §2, lint `NEEDS_META`)

Exam constants: `exam_id = shopgo-refund-v1`, `task_slug = shopgo-refund`.

| Item | Path |
|---|---|
| Inputs (read-only) | `INPUT/shopgo-refund/{01_business,02_ba,03_dev,04_design,05_communication}/` |
| Feature knowledge | `knowledge/features/shopgo-refund.md` |
| Plan | `OUTPUT/shopgo-refund/00_plan.md` |
| Stage 01–06 | `OUTPUT/shopgo-refund/01_requirement_risk_summary.md`, `02_missing_rule_report.md`, `03_viewpoint_report.md`, `04_test_idea_report.md`, `05_test_case_spec.md` (+ optional `05_test_blueprint.json`, `testcases/batch_NN.md`), `06_coverage_review.md` |
| Gate record (informational, not trusted) | `OUTPUT/shopgo-refund/_gate.log` |
| T1 agent | existing `qa-system/qa-<agent>/` |
| T2 agent | `qa-system/qa-<new-agent>/AGENT.md` + `skills/<skill>.md` |
| T2 example output | `OUTPUT/shopgo-refund/<NN>_<name>.md` (`NN` = next unused per governance §3) |
| Exam files (student) | `EXAM/submission.json`, `EXAM/DECISIONS.md`, `EXAM/AI_USE.md` |
| Exam files (read-only) | `EXAM/brief/**`, `EXAM/schema/**`, `EXAM/selfcheck/**` |

### 2.2 JSON Schema (`EXAM/schema/submission.schema.json`, schema version 1.0.0)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://cw-agent/exam/submission/1.0.0",
  "type": "object",
  "additionalProperties": false,
  "required": ["schema_version","exam_id","student_id","branch","starter_commit","task_slug","t1_customized_agent","t2_new_agent","t3_pipeline","evidence"],
  "$defs": {
    "relpath": { "type": "string", "pattern": "^(?!/)(?!.*(^|/)\\.\\.(/|$))[A-Za-z0-9._/-]+$", "maxLength": 300 },
    "sha":     { "type": "string", "pattern": "^[0-9a-f]{40}$" },
    "anchor":  { "enum": ["done", "n/a"] }
  },
  "properties": {
    "schema_version": { "const": "1.0.0" },
    "exam_id":        { "const": "shopgo-refund-v1" },
    "student_id":     { "type": "string", "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$" },
    "branch":         { "type": "string", "pattern": "^exams/[a-z0-9]+(-[a-z0-9]+)*$" },
    "starter_commit": { "$ref": "#/$defs/sha" },
    "task_slug":      { "const": "shopgo-refund" },
    "t1_customized_agent": {
      "type": "object", "additionalProperties": false,
      "required": ["agent_folder","decision_class","changed_files","anchors","anchor_reasons","tests_added","decision_record"],
      "properties": {
        "agent_folder":   { "$ref": "#/$defs/relpath" },
        "decision_class": { "enum": ["A","B","C"] },
        "changed_files":  { "type": "array", "items": { "$ref": "#/$defs/relpath" } },
        "anchors": { "type": "object", "additionalProperties": false,
          "required": ["N1","N2","N3","N4","N5","N6","N7"],
          "properties": { "N1": {"$ref":"#/$defs/anchor"}, "N2": {"$ref":"#/$defs/anchor"}, "N3": {"$ref":"#/$defs/anchor"},
                          "N4": {"$ref":"#/$defs/anchor"}, "N5": {"$ref":"#/$defs/anchor"}, "N6": {"$ref":"#/$defs/anchor"}, "N7": {"$ref":"#/$defs/anchor"} } },
        "anchor_reasons": { "type": "object", "additionalProperties": { "type": "string", "minLength": 10 } },
        "tests_added":    { "type": "array", "items": { "$ref": "#/$defs/relpath" } },
        "decision_record":{ "type": "string" }
      }
    },
    "t2_new_agent": {
      "type": "object", "additionalProperties": false,
      "required": ["agent_folder","agent_file","skills","deliverable_prefix","example_output","registrations","tests_added","decision_record"],
      "properties": {
        "agent_folder":       { "type": "string", "pattern": "^qa-system/qa-[a-z0-9-]+$" },
        "agent_file":         { "$ref": "#/$defs/relpath" },
        "skills":             { "type": "array", "items": { "$ref": "#/$defs/relpath" } },
        "deliverable_prefix": { "type": "string", "pattern": "^[0-9]{2}[a-z]?$" },
        "example_output":     { "$ref": "#/$defs/relpath" },
        "registrations":      { "type": "array", "items": { "$ref": "#/$defs/relpath" } },
        "tests_added":        { "type": "array", "items": { "$ref": "#/$defs/relpath" } },
        "decision_record":    { "type": "string" }
      }
    },
    "t3_pipeline": {
      "type": "object", "additionalProperties": false,
      "required": ["input_dir","feature_knowledge","artifacts","gate_log"],
      "properties": {
        "input_dir":         { "const": "INPUT/shopgo-refund" },
        "feature_knowledge": { "$ref": "#/$defs/relpath" },
        "artifacts": {
          "type": "object", "additionalProperties": false,
          "required": ["00","01","02","03","04","05","06"],
          "properties": {
            "00": { "type": ["string","null"] }, "01": { "type": ["string","null"] }, "02": { "type": ["string","null"] },
            "03": { "type": ["string","null"] }, "04": { "type": ["string","null"] }, "06": { "type": ["string","null"] },
            "05": { "type": "object", "additionalProperties": false, "required": ["spec","blueprint","batches"],
                    "properties": { "spec": { "type": ["string","null"] }, "blueprint": { "type": ["string","null"] },
                                    "batches": { "type": "array", "items": { "type": "string" } } } }
          }
        },
        "gate_log": { "type": ["string","null"] }
      }
    },
    "evidence": {
      "type": "object", "additionalProperties": false,
      "required": ["decisions","ai_use_declaration"],
      "properties": { "decisions": { "const": "EXAM/DECISIONS.md" }, "ai_use_declaration": { "const": "EXAM/AI_USE.md" } }
    }
  }
}
```

Notes: `null` for an artifact = the student declares it was not produced (gradable, §4.2), which is better than pointing to a missing file. The manifest cannot contain its own commit SHA; the grader records the frozen SHA. Future schema versions get a new `$id` and `schema_version`; the grader keeps one validator per supported version.

---

## 3. Result contract — `GRADING/results/<student-id>.json`

### 3.1 JSON Schema (`result.schema.json`, result schema version 1.0.0; kept with the grader, copied to `GRADING/schema/`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://cw-agent/exam/result/1.0.0",
  "type": "object", "additionalProperties": false,
  "required": ["result_schema_version","exam_id","student_id","branch","submission_sha","starter_commit","grader_version","rubric_version","graded_at","preflight","automated","instructor","total","status","pass_conditions","integrity_flags","missing_requirements","feedback","evidence_root"],
  "$defs": {
    "pts": { "type": ["number","null"], "minimum": 0 },
    "evidence": { "type": "array", "items": { "type": "string" } },
    "check": { "type": "object", "additionalProperties": false,
      "required": ["id","max","points","state","evidence","message"],
      "properties": { "id": {"type":"string"}, "max": {"type":"number"}, "points": {"$ref":"#/$defs/pts"},
        "state": { "enum": ["PASSED","PARTIAL","FAILED","NOT_SUBMITTED","PENDING_HUMAN_REVIEW","NOT_GRADED"] },
        "evidence": {"$ref":"#/$defs/evidence"}, "message": {"type":"string"} } },
    "criterion": { "type": "object", "additionalProperties": false,
      "required": ["max","points","checks"],
      "properties": { "max": {"type":"number"}, "points": {"$ref":"#/$defs/pts"}, "checks": { "type":"array", "items": {"$ref":"#/$defs/check"} } } },
    "manual": { "type": "object", "additionalProperties": false,
      "required": ["max","points","level","evidence","comment"],
      "properties": { "max": {"type":"number"}, "points": {"$ref":"#/$defs/pts"}, "level": {"type":["string","null"]},
        "evidence": {"$ref":"#/$defs/evidence"}, "comment": {"type":["string","null"]} } }
  },
  "properties": {
    "result_schema_version": { "const": "1.0.0" },
    "exam_id": { "type": "string" }, "student_id": { "type": "string" },
    "branch": { "type": ["string","null"] },
    "submission_sha": { "type": ["string","null"], "pattern": "^[0-9a-f]{40}$" },
    "starter_commit": { "type": "string" },
    "grader_version": { "type": "string" }, "rubric_version": { "type": "string" },
    "graded_at": { "type": "string", "format": "date-time" },
    "override": { "type": ["object","null"] },
    "preflight": { "type": "object", "additionalProperties": false, "required": ["status","blocking","gradable","warnings"],
      "properties": { "status": { "enum": ["VALID","VALID_WITH_GAPS","INVALID","NOT_RUN"] },
        "blocking": { "type":"array" }, "gradable": { "type":"array" }, "warnings": { "type":"array" } } },
    "automated": { "type": "object", "additionalProperties": false, "required": ["status","score","max","criteria"],
      "properties": { "status": { "enum": ["GRADED","PARTIAL","NOT_GRADED"] }, "score": {"$ref":"#/$defs/pts"}, "max": {"const":70},
        "criteria": { "type":"object", "additionalProperties": false, "required": ["A1","A2","A3","A4","A5","A6"],
          "properties": { "A1":{"$ref":"#/$defs/criterion"}, "A2":{"$ref":"#/$defs/criterion"}, "A3":{"$ref":"#/$defs/criterion"},
                          "A4":{"$ref":"#/$defs/criterion"}, "A5":{"$ref":"#/$defs/criterion"}, "A6":{"$ref":"#/$defs/criterion"} } } } },
    "instructor": { "type": "object", "additionalProperties": false, "required": ["status","score","max","reviewer","reviewed_at","criteria"],
      "properties": { "status": { "enum": ["PENDING","REVIEWED","NOT_APPLICABLE"] }, "score": {"$ref":"#/$defs/pts"}, "max": {"const":30},
        "reviewer": {"type":["string","null"]}, "reviewed_at": {"type":["string","null"]},
        "criteria": { "type":"object", "additionalProperties": false, "required": ["I1","I2","I3"],
          "properties": { "I1":{"$ref":"#/$defs/manual"}, "I2":{"$ref":"#/$defs/manual"}, "I3":{"$ref":"#/$defs/manual"} } } } },
    "total": { "type": "object", "additionalProperties": false, "required": ["score","max"], "properties": { "score": {"$ref":"#/$defs/pts"}, "max": {"const":100} } },
    "status": { "enum": ["NO_SUBMISSION","INVALID_SUBMISSION","PENDING","NEEDS_HUMAN_REVIEW","PASS","FAIL"] },
    "pass_conditions": { "type": "object", "additionalProperties": false, "required": ["total_ge_60","pipeline_minimum","defense_ge_4"],
      "properties": { "total_ge_60": {"type":["boolean","null"]}, "pipeline_minimum": {"type":["boolean","null"]}, "defense_ge_4": {"type":["boolean","null"]} } },
    "integrity_flags": { "type": "array" },
    "missing_requirements": { "type": "array", "items": { "type": "string" } },
    "feedback": { "type": "array", "items": { "type": "object" } },
    "evidence_root": { "type": ["string","null"] }
  }
}
```

### 3.2 Calculation rules

1. A criterion's `points` = sum of its checks; `null` if any check is `PENDING_HUMAN_REVIEW` or `NOT_GRADED` (the graded checks keep their points inside `checks[]`, so partial work is preserved).
2. `automated.score` only when A1–A6 are all non-null; `instructor.score` only when I1–I3 are all non-null; `total.score` only when both exist and no integrity flag is open.
3. `pass_conditions.*` are `null` while inputs are missing; `PASS` only when all three are `true`; `FAIL` when `total.score` exists and any is `false`.
4. `null` is never rendered as 0 (HTML shows "pending", CSV leaves the cell empty).
5. Every check carries `evidence` (file paths, relative to `evidence_root` or to the submission) and a `message`.

### 3.3 Generated views
- `GRADING/results/<student-id>.html` — rendered from the JSON only (template versioned with the grader), self-contained.
- `GRADING/summary.csv` — rebuilt from all JSON files, sorted by `student_id`: `student_id,branch,submission_sha,status,preflight,A1,A2,A3,A4,A5,A6,auto_score,I1,I2,I3,instructor_score,total,pipeline_minimum,defense_ge_4,integrity_flags,graded_at`.

---

## 4. Preflight — blocking vs gradable

Preflight is deterministic, read-only and never repairs or creates student files. The instructor always runs the validator from the starter commit.

### 4.1 Blocking errors ⇒ `INVALID_SUBMISSION` (no automated grading)

| Code | Check |
|---|---|
| B-01 | `EXAM/submission.json` missing, unreadable, not UTF-8 JSON, or schema-invalid |
| B-02 | `exam_id` / `student_id` / `branch` do not match the exam, the roster entry and the fetched branch |
| B-03 | Any declared path is absolute, contains `..`, resolves outside the workspace, or is (or passes through) a symlink |
| B-04 | Frozen SHA not resolvable, or starter tag commit is not its ancestor, or `starter_commit` ≠ tag SHA |
| B-05 | Integrity violation preventing trustworthy evaluation: read-only paths changed (`INPUT/shopgo-refund/**`, `EXAM/brief/**`, `EXAM/schema/**`, `EXAM/selfcheck/**`), or the tree exceeds hard size limits (archive bomb) |

A missing branch is not "invalid" but `NO_SUBMISSION`.

### 4.2 Gradable gaps ⇒ grading continues; affected checks get partial/zero with a message

| Code | Gap | Affects |
|---|---|---|
| G-01 | Stage artifact declared `null` or file missing | A4a for that stage; dependent checks in A4/A5 marked `NOT_SUBMITTED` (0) |
| G-02 | Wrong file name for a stage (e.g. `01_risk.md`) | Treated as missing for that stage (0) + message "rename to …"; never auto-renamed |
| G-03 | T1 incomplete (anchors `done` without matching change, `n/a` without reason) | A2b |
| G-04 | T2 incomplete (missing skill, example output, registrations) | A3 sub-checks |
| G-05 | No tests added for changed tools | A6a |
| G-06 | `EXAM/DECISIONS.md` or `EXAM/AI_USE.md` missing | Message to instructor; I1/I3 evidence weaker; no automated deduction |
| G-07 | `05` batch/spec inconsistent | A4b (lint error count) |
| G-08 | Feature knowledge file missing | A5 traceability checks that need it |

Preflight status: `VALID` (no gaps), `VALID_WITH_GAPS` (only G-xx), `INVALID` (any B-xx), `NOT_RUN` (no submission).

---

## 5. Rubric — 70 automated + 30 instructor

Principles: deterministic checks only for automated points; every check names its evidence; multiple valid QA solutions are accepted when evidenced (checks test **consistency with the student's own declared decision and with the sources**, not equality with one reference answer).

### 5.1 Automated — 70

| Id | Area | Pts | Checks | Partial credit |
|---|---|---|---|---|
| **A1** | Framework compliance | 8 | a. `agent:check` INTACT with trusted tools (3) · b. starter's baseline test suite passes against student code, in container (3) · c. no baseline test deleted, no protected framework file removed (2) | a 0/3 · b `3×passed/total`, floor to 0.5 · c −1 per violation, min 0 |
| **A2** | T1 customisation | 12 | a. changed files lie in the layers allowed for the **declared** class A/B/C (3) · b. anchors required by that class are `done` with matching changes; `n/a` only with reason (4) · c. skill structure: frontmatter, `Format output`, acceptance gate (2) · d. hidden fixtures: affected tools accept the valid and reject the invalid sample of the T1 requirement (3) | b `4×ok/required` · d 1.5 each direction |
| **A3** | T2 new agent | 14 | a. structure from template, no `<…>` placeholders (3) · b. `Human-Final` + `Knowledge` sections (2) · c. registered in 5 places (2 in system map, `WORKFLOW.md`, qa-lead, agent-doctor) (4) · d. `agent:check --impact` resolves it with ≥1 edge (2) · e. example output exists and has the sections/fields its skill declares (3) | c `4×ok/5`; others per item |
| **A4** | T3 pipeline | 14 | a. `01`…`06` present with official names, 0.5 each (3) · b. lint with **canonical INPUT** and trusted tools (4) · c. ASK discipline re-derived by the grader: no stage 03–06 file whose content depends on open ASK questions (3) · d. hidden benchmark: seeded gaps raised as OQ/MR (4) | b `4 − 0.5×errors`, min 0 · d `4×found/seeded` (borderline matches → human review) |
| **A5** | Traceability & anti-fabrication | 14 | a. BR/FD/AF quotes found verbatim in canonical INPUT (4) · b. TCs trace to existing BR/FD; no orphan ids (3) · c. numeric values have provenance (2) · d. no `[DOMAIN]` item as BR/FD source (2) · e. ambiguous-rule probe raised as OQ/MR, no invented value (3) | a, b proportional · e 3 asked / 1 noted as risk / 0 invented |
| **A6** | Tests & validation | 8 | a. changed tools have new passing tests (3) · b. hidden instructor tests for T1/T2 pass (3) · c. student tool changes deterministic on two runs (2) | proportional; a = 0 if tools changed without tests |

Checks needing student code (A1b, A2d, A6) run only in a container; without one they are `PENDING_HUMAN_REVIEW`.

### 5.2 Instructor — 30

| Id | Area | Pts | Levels | Evidence |
|---|---|---|---|---|
| I1 | QA reasoning & risk analysis | 10 | 9–10 prioritised with stated basis, each high risk → viewpoint/test idea · 6–8 correct, shallow · 3–5 generic · 0–2 missing | `01`, `03`, `DECISIONS.md` |
| I2 | Test design & BR interpretation | 10 | 9–10 BR reading matches sources, boundaries complete, negative + state cases · 6–8 minor gaps · 3–5 happy-path · 0–2 not derivable | `02`, `05`, `06` |
| I3 | Explanation & live defense | 10 | 5 items × 0/1/2: T1 decision, T2 anchors, trace one TC to its quote, ambiguous-rule handling, live change request | defense notes |

Alternative solutions: a level is awarded for any approach the student justifies with source evidence; the form requires the cited file for each level.

### 5.3 Passing conditions

```
PASS ⇔ total.score ≥ 60
     ∧ pipeline_minimum
     ∧ I3.points ≥ 4
pipeline_minimum ⇔ files 01, 02, 05 (spec) and 06 present with official names
                 ∧ A4.points ≥ 7.0
                 ∧ A5.a quote check ≥ 50 % of quotes verified (A5.a ≥ 2.0)
```

Any condition `null` ⇒ status stays `PENDING` / `NEEDS_HUMAN_REVIEW`.

---

## 6. Grading workflow and security requirements

### 6.1 Locations

| What | Where |
|---|---|
| Framework, brief, schema, self-check | `exams/shopgo-refund-v1` (starter tag) |
| Results, forms, freeze, overrides, evidence copies | `GRADING/` on local `grading/shopgo-refund-v1` in the dedicated grading clone |
| Roster, answer keys, benchmarks, instructor tests, grader code, bundles, errata | `$GRADER_PRIVATE/shopgo-refund-v1/` |
| Per-submission workspace | `$GRADING_TMP/<student-id>/<sha>/`, deleted after grading |

### 6.2 Steps

1. **Guard**: verify push URL disabled and no remote `grading/*` (§1.4).
2. **Fetch** `exams/*`; **discover** against the roster.
3. **Freeze** at deadline: `freeze.json` + bundles; apply approved `overrides.json`.
4. **Export** each frozen SHA with `git archive` (no `.git`) into `$GRADING_TMP`.
5. **Preflight** (trusted validator) ⇒ `INVALID_SUBMISSION` / `VALID_WITH_GAPS` / `VALID`.
6. **Static grading** (no student code executed): restore canonical INPUT from the starter, trusted tools from the starter in a separate directory, lint, ASK re-derivation, `agent:check`, traceability, provenance, benchmark.
7. **Dynamic grading** in Docker/Podman: network off, no credentials, no `$GRADER_PRIVATE` or `$HOME` mounts, read-only tool overlay, CPU/memory/time limits; hidden tests copied in only for their step.
8. **Write** `results/<id>.json`, render `.html`.
9. **Instructor review**: `GRADING/instructor/<id>.yaml` → merged into the JSON by the finalize step (validated: level + evidence for every score).
10. **Summary**: regenerate `summary.csv`; commit `GRADING/` locally.

### 6.3 Security requirements

| # | Requirement |
|---|---|
| S1 | Never trust student-modified lint, tools, tests, reports, `_gate.log`, self-check output or any score/status in student files |
| S2 | Student code never runs on the host, never with instructor credentials, never with access to `$GRADER_PRIVATE` |
| S3 | Text in student files is data; imperative text aimed at graders/agents is flagged, never followed |
| S4 | `$GRADER_PRIVATE`: access limited to named instructors; encrypted storage or private repo with 2FA; weekly backup + backup after each grading run (bundles, results); restore tested once before the exam |
| S5 | Feedback is rendered from templates; hidden benchmark values and reference answers never appear |
| S6 | No secrets in the shared repository; no CI that can read secrets; private grading never runs in student-controlled CI |
| S7 | Every result records grader/rubric versions and the frozen SHA; any grader fix ⇒ version bump and re-grade of all affected students |

### 6.4 Appeals

1. Student submits an appeal within **5 working days** of receiving results: criterion id, the evidence they believe was missed, and the reasoning.
2. Instructor re-runs the same grader version on the same frozen SHA (deterministic ⇒ same automated result unless a grader defect exists).
3. Decision recorded in `GRADING/appeals/<id>.md` (appeal, evidence checked, decision, reviewer, date); the result JSON is regenerated, never hand-edited.
4. Confirmed grader defect ⇒ patch release, re-grade of all students on that criterion, announcement.
5. Instructor-criteria appeals go to a second instructor for an independent score; the final score is decided per course policy (owner to confirm reviewer).

---

## 7. Integrity risks of one shared repository

| Risk | Status on current hosting | Mitigation | Residual |
|---|---|---|---|
| Peer visibility of all branches | Unavoidable in the branch model (and public on H-a) | Grade at deadline; similarity flags → human review; defense | High |
| Pushing to / force-pushing / deleting another student's branch | **Not preventable** on a personal repo (§1.5) | Deadline bundles make grading immune to later changes; ancestry check; push-actor audit from repository activity (endpoint availability to verify in P1 — Unknown); repeated fetch snapshots before deadline to detect tampering | Medium (detection only) |
| Same INPUT for everyone (one starter commit) | By design | Private answer key; probe; defense | Medium |
| Accidental push of grading results | — | Layered controls §1.4 | Low |
| Untrusted code on instructor machine | — | Export without `.git`, container only (§6.2) | Low |

---

## 8. Student-facing self-check (public)

| Requirement | Detail |
|---|---|
| Command | `npm run exam:check` (proposed), shipped in `EXAM/selfcheck/` on the exam branch |
| Runs | Schema validation, B-01…B-05, G-01…G-08, public parts of A1a, A3a–d, A4a–b, A5a–d |
| Output | Per-check PASS/FAIL with file and fix hint; JSON report to `.scratch/exam-check.json` (gitignored, never graded) |
| Does not | Compute a score, contact the network, read hidden data |
| Determinism | Same tree ⇒ same output |
| CI (optional) | Credential-free workflow running only `exam:check` may be added if the repository holds no secrets; private grading never in CI |

---

## 9. Sample results

### 9.1 Valid, fully graded — PASS (abridged: checks shown for one criterion)

```json
{
  "result_schema_version": "1.0.0", "exam_id": "shopgo-refund-v1", "student_id": "nguyen-van-a",
  "branch": "exams/nguyen-van-a", "submission_sha": "a3f1c2e4b5d6a7f8091a2b3c4d5e6f708192a3b4",
  "starter_commit": "5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7081", "grader_version": "1.0.0", "rubric_version": "grad-v1.0.0",
  "graded_at": "2026-12-01T10:00:00Z", "override": null,
  "preflight": { "status": "VALID", "blocking": [], "gradable": [], "warnings": [] },
  "automated": { "status": "GRADED", "score": 61.5, "max": 70, "criteria": {
    "A1": { "max": 8, "points": 8, "checks": [] }, "A2": { "max": 12, "points": 10, "checks": [] },
    "A3": { "max": 14, "points": 12, "checks": [] }, "A4": { "max": 14, "points": 12, "checks": [
      { "id": "A4a", "max": 3, "points": 3, "state": "PASSED", "evidence": ["OUTPUT/shopgo-refund/"], "message": "6/6 stage files present" },
      { "id": "A4b", "max": 4, "points": 3, "state": "PARTIAL", "evidence": ["evidence/lint.txt"], "message": "2 lint errors in 05_test_case_spec.md" },
      { "id": "A4c", "max": 3, "points": 3, "state": "PASSED", "evidence": ["evidence/gate.txt"], "message": "No stage produced while ASK open" },
      { "id": "A4d", "max": 4, "points": 3, "state": "PARTIAL", "evidence": ["evidence/benchmark.txt"], "message": "3 of 4 seeded gaps raised; missed category: state transition" } ] },
    "A5": { "max": 14, "points": 12.5, "checks": [] }, "A6": { "max": 8, "points": 7, "checks": [] } } },
  "instructor": { "status": "REVIEWED", "score": 24, "max": 30, "reviewer": "instructor-1", "reviewed_at": "2026-12-03T09:00:00Z", "criteria": {
    "I1": { "max": 10, "points": 8, "level": "6-8", "evidence": ["OUTPUT/shopgo-refund/01_requirement_risk_summary.md"], "comment": "Risks prioritised; two lack a stated basis" },
    "I2": { "max": 10, "points": 8, "level": "6-8", "evidence": ["OUTPUT/shopgo-refund/05_test_case_spec.md"], "comment": "Boundaries complete; few negative state cases" },
    "I3": { "max": 10, "points": 8, "level": "8/10", "evidence": ["GRADING/instructor/nguyen-van-a.yaml"], "comment": "Live change handled" } } },
  "total": { "score": 85.5, "max": 100 }, "status": "PASS",
  "pass_conditions": { "total_ge_60": true, "pipeline_minimum": true, "defense_ge_4": true },
  "integrity_flags": [], "missing_requirements": [],
  "feedback": [{ "criterion": "A4b", "text": "Fix the 2 lint errors listed in evidence/lint.txt" }],
  "evidence_root": "GRADING/evidence/nguyen-van-a/a3f1c2e4b5d6a7f8091a2b3c4d5e6f708192a3b4/"
}
```

### 9.2 Incomplete but gradable — PENDING (stage 06 missing, no container yet, instructor not reviewed)

```json
{
  "result_schema_version": "1.0.0", "exam_id": "shopgo-refund-v1", "student_id": "dao-van-b",
  "branch": "exams/dao-van-b", "submission_sha": "b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5",
  "starter_commit": "5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7081", "grader_version": "1.0.0", "rubric_version": "grad-v1.0.0",
  "graded_at": "2026-12-01T10:05:00Z", "override": null,
  "preflight": { "status": "VALID_WITH_GAPS", "blocking": [],
    "gradable": [{ "code": "G-01", "path": "OUTPUT/shopgo-refund/06_coverage_review.md", "message": "Declared null: stage 06 not produced" }], "warnings": [] },
  "automated": { "status": "PARTIAL", "score": null, "max": 70, "criteria": {
    "A1": { "max": 8, "points": null, "checks": [
      { "id": "A1a", "max": 3, "points": 3, "state": "PASSED", "evidence": ["evidence/agent-check.txt"], "message": "INTACT" },
      { "id": "A1b", "max": 3, "points": null, "state": "PENDING_HUMAN_REVIEW", "evidence": [], "message": "Container unavailable; student code not executed" },
      { "id": "A1c", "max": 2, "points": 2, "state": "PASSED", "evidence": ["evidence/protected.txt"], "message": "No protected file changed" } ] },
    "A2": { "max": 12, "points": null, "checks": [] }, "A3": { "max": 14, "points": 9, "checks": [] },
    "A4": { "max": 14, "points": 8.5, "checks": [
      { "id": "A4a", "max": 3, "points": 2.5, "state": "PARTIAL", "evidence": ["OUTPUT/shopgo-refund/"], "message": "5/6 stage files; 06_coverage_review.md not submitted" } ] },
    "A5": { "max": 14, "points": 10, "checks": [] }, "A6": { "max": 8, "points": null, "checks": [] } } },
  "instructor": { "status": "PENDING", "score": null, "max": 30, "reviewer": null, "reviewed_at": null, "criteria": {
    "I1": { "max": 10, "points": null, "level": null, "evidence": [], "comment": null },
    "I2": { "max": 10, "points": null, "level": null, "evidence": [], "comment": null },
    "I3": { "max": 10, "points": null, "level": null, "evidence": [], "comment": null } } },
  "total": { "score": null, "max": 100 }, "status": "PENDING",
  "pass_conditions": { "total_ge_60": null, "pipeline_minimum": false, "defense_ge_4": null },
  "integrity_flags": [], "missing_requirements": ["Stage 06 coverage review (OUTPUT/shopgo-refund/06_coverage_review.md)"],
  "feedback": [{ "criterion": "A4a", "text": "Stage 06 was not produced; run coverage-review after stage 05" }],
  "evidence_root": "GRADING/evidence/dao-van-b/b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5/"
}
```

Note: `pipeline_minimum` is already `false` (06 missing), so this student cannot pass this submission; the total is still computed once pending checks are resolved, so the student sees their real score.

### 9.3 Invalid — INVALID_SUBMISSION (abridged)

```json
{
  "result_schema_version": "1.0.0", "exam_id": "shopgo-refund-v1", "student_id": "le-thi-c",
  "branch": "exams/le-thi-c", "submission_sha": "c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7",
  "starter_commit": "5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7081", "grader_version": "1.0.0", "rubric_version": "grad-v1.0.0",
  "graded_at": "2026-12-01T10:07:00Z", "override": null,
  "preflight": { "status": "INVALID", "gradable": [], "warnings": [], "blocking": [
    { "code": "B-03", "path": "t3_pipeline.artifacts.01", "message": "Path '../../etc/passwd' escapes the workspace", "fix": "Use OUTPUT/shopgo-refund/01_requirement_risk_summary.md" },
    { "code": "B-05", "path": "INPUT/shopgo-refund/02_ba/", "message": "Read-only input changed (2 files)", "fix": "Restore INPUT/ from the starter tag" } ] },
  "automated": { "status": "NOT_GRADED", "score": null, "max": 70, "criteria": {
    "A1": { "max": 8, "points": null, "checks": [] }, "A2": { "max": 12, "points": null, "checks": [] },
    "A3": { "max": 14, "points": null, "checks": [] }, "A4": { "max": 14, "points": null, "checks": [] },
    "A5": { "max": 14, "points": null, "checks": [] }, "A6": { "max": 8, "points": null, "checks": [] } } },
  "instructor": { "status": "PENDING", "score": null, "max": 30, "reviewer": null, "reviewed_at": null, "criteria": {
    "I1": { "max": 10, "points": null, "level": null, "evidence": [], "comment": null },
    "I2": { "max": 10, "points": null, "level": null, "evidence": [], "comment": null },
    "I3": { "max": 10, "points": null, "level": null, "evidence": [], "comment": null } } },
  "total": { "score": null, "max": 100 }, "status": "INVALID_SUBMISSION",
  "pass_conditions": { "total_ge_60": null, "pipeline_minimum": null, "defense_ge_4": null },
  "integrity_flags": [{ "code": "B-05", "detail": "INPUT modified" }],
  "missing_requirements": [], "feedback": [{ "criterion": "preflight", "text": "Fix the blocking errors; grading did not run" }],
  "evidence_root": null
}
```

A roster student without a branch gets the same shape with `branch: null`, `submission_sha: null`, `preflight.status: "NOT_RUN"`, `status: "NO_SUBMISSION"`.

---

## 10. Folder structures

### 10.1 Exam branch `exams/shopgo-refund-v1` (public starter)

```
<repo>/
├── AGENTS.md, CLAUDE.md, package.json, …     # framework as of c4238ab (unchanged)
├── qa-system/                                 # framework (unchanged)
├── knowledge/
│   ├── _sut.json                              # ShopGo, "domain": "ecommerce-retail"
│   └── features/shopgo-ui-map.md              # ShopGo UI knowledge
├── INPUT/shopgo-refund/                       # READ-ONLY exam sources (English)
│   ├── 01_business/ 02_ba/ 03_dev/ 04_design/ 05_communication/
└── EXAM/
    ├── brief/  README.md  RUBRIC.md  T1.md  T2.md  T3.md  APPEALS.md
    ├── schema/ submission.schema.json  (+ result.schema.json, public copy)
    ├── selfcheck/                             # public self-check (exam:check)
    └── templates/ submission.json  DECISIONS.md  AI_USE.md   # empty skeletons
```

### 10.2 Student branch `exams/<student-id>` (adds, never edits read-only paths)

```
EXAM/submission.json   EXAM/DECISIONS.md   EXAM/AI_USE.md
knowledge/features/shopgo-refund.md
OUTPUT/shopgo-refund/
├── 00_plan.md   01_requirement_risk_summary.md   02_missing_rule_report.md
├── 03_viewpoint_report.md   04_test_idea_report.md   05_test_case_spec.md
├── [05_test_blueprint.json  testcases/batch_NN.md]   06_coverage_review.md
├── <NN>_<t2-output>.md   _gate.log
qa-system/qa-<t1-agent>/…            # T1 changes (+ declared tool/test changes)
qa-system/qa-<t2-agent>/AGENT.md  skills/<skill>.md
```

### 10.3 Instructor grading clone, branch `grading/shopgo-refund-v1` (local only)

```
GRADING/
├── schema/ result.schema.json  instructor.schema.json
├── freeze.json  overrides.json
├── results/ <student-id>.json  <student-id>.html
├── instructor/ <student-id>.yaml
├── evidence/<student-id>/<sha>/ lint.txt gate.txt agent-check.txt benchmark.txt …
├── appeals/ <student-id>.md
└── summary.csv
```

### 10.4 `$GRADER_PRIVATE/shopgo-refund-v1/` (outside any shared repository)

```
roster.json
rubric/grad-v1.0.0.yaml
benchmark/ answer-key.json  seeded-gaps.json  probe.json   # each item traced to a sentence in the hoan-tien source material
instructor-tests/
grader/ (version-pinned code)
bundles/<student-id>-<sha>.bundle
errata.md   ACCESS.md (who has access)   BACKUP.md (schedule, last restore test)
```

---

## 11. Implementation phases and acceptance tests

| Phase | Deliverable | Depends on |
|---|---|---|
| P0 | Hosting decision H1 (§1.6) and, if chosen, new repository + protection rules verified in the UI/API | owner |
| P1 | Schemas (submission, result, instructor), rubric YAML, roster format, validators + tests | P0 |
| P2 | Exam content: English `INPUT/shopgo-refund/` from `hoan-tien`; seeded gaps and one ambiguous rule, each recorded in the answer key with the original source sentence (no new business requirements invented) | P1 |
| P3 | Public self-check (`exam:check`) | P1 |
| P4 | Private grader: export, preflight, static checks, container runner, benchmark | P1, P2 |
| P5 | Result writer, HTML renderer, finalize, summary, freeze/bundles/overrides, push guards, appeals record | P4 |
| P6 | Fixture submissions: gold, average, AI-only with invented value, missing 06, invalid manifest, path escape, symlink, tampered INPUT, tampered lint, injection text, no branch | P3–P5 |
| P7 | Pilot: fixtures twice + volunteers; instructor calibration | P6 |

| # | Acceptance test |
|---|---|
| AT1 | Same frozen SHA + grader version ⇒ identical JSON except `graded_at` |
| AT2 | Every fixture (incl. no branch) yields a schema-valid result |
| AT3 | Blocking fixtures ⇒ `INVALID_SUBMISSION` with the expected B-codes; gap fixtures ⇒ graded with partial credit, never invalid |
| AT4 | No `null` shown as 0 in JSON, HTML or CSV; totals absent until components complete |
| AT5 | Tampered-lint and tampered-INPUT fixtures gain no points |
| AT6 | Exam branch and its history contain no token from `$GRADER_PRIVATE` |
| AT7 | Any push from the grading clone fails; the grader refuses to run if push is enabled |
| AT8 | Container off ⇒ affected checks `PENDING_HUMAN_REVIEW`, rest graded |
| AT9 | Gold fixture ≥ 66/70; pass/fail matches §5.3 on all fixtures |
| AT10 | HTML and CSV regenerated from JSON are byte-identical across runs |
| AT11 | A dummy second exam on `banking-payments` runs preflight + grader without code changes |

---

## 12. Decision log and remaining decisions

Numbering note: rev 1 listed 11 questions (Q1–Q11); rev 2 renumbered to 10 (old Q11 "record the defense?" was dropped, the rest re-ordered). The owner's answers below use rev 2 numbering.

| # | Question (rev 2) | Decision (2026-11-19) | Where applied |
|---|---|---|---|
| Q1 | Per-student push restriction | Verify hosting; do not claim isolation; document residual risk and alternatives | §1.5–§1.6, §7 |
| Q2 | Pass threshold | 60/100 + pipeline minimum + I3 ≥ 4 | §5.3 |
| Q3 | Resubmission / disputes | Unlimited pushes before deadline; freeze at deadline; post-deadline only with approval + audit; appeal process | §1.3, §6.4 |
| Q4 | Containers | Docker/Podman preferred; never run untrusted code on host; unavailable ⇒ pending human review | §6.2, D10 |
| Q5 | Exam content | Build from `hoan-tien`, English, seeded gaps + one ambiguous rule, all traceable; invent nothing | P2, §10.4 |
| Q6 | Feedback | Criterion-level scores, actionable text, references to student artifacts; no private data | §3.3, S5 |
| Q7 | Private assets | `$GRADER_PRIVATE`, authorised instructors only, backup + access control | S4, §10.4 |
| Q8 | AI use | Allowed, declared; no AI-detection criterion | D9 |
| Q9 | T1 | Same objectives for all students in v1 | D2 |
| Q10 | Self-check | Local public self-check; optional credential-free CI preflight; private grading never in student CI | §8 |

Remaining decisions (new):

| # | Decision needed | Recommendation |
|---|---|---|
| R1 | Hosting option H-a…H-d (§1.6) | H-d if budget allows, else H-b; never H-a |
| R2 | Second reviewer for instructor-criteria appeals | A second instructor named before the exam |
| R3 | Deadline time zone and exact freeze time | Asia/Ho_Chi_Minh, stated in the brief |
| R4 | Whether results HTML is shared with students as-is or only the feedback section | Share full HTML (it is rendered without hidden data) |

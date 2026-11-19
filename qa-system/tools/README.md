# qa-system/tools — Internal tools of the Agent system

> ⚠️ **Users do NOT type these commands** (Zero-CLI rule, `AGENTS.md` §7).
> These are the Agent's hands. The Agent runs them silently and reports the result in words.

Tools are grouped by **function**, one folder per group. When you need something, open exactly
that folder — do not scan the whole tree.

```
lib/          ← shared code, NOT called directly
intake/       ← bring documents from outside into INPUT/
knowledge/    ← initialize & audit knowledge in knowledge/
testcase/     ← merge and export test cases
testdata/     ← generate test data
jira/         ← all communication with Jira
system/       ← self-check, progress, map, ASK gate
exam/         ← graduation exam: student self-check and instructor grading
```

---

## Quick lookup: need what → run what

| What you need | Command | File |
|---|---|---|
| **Initialize a new project (run first)** | `npm run init` | `system/init.js` |
| **See where you are, what to do next** | `npm start` | `system/start.js` |
| Receive new documents, classify into the 5 compartments | `npm run intake -- <file\|folder> [--slug <slug>]` | `intake/intake.js` |
| **Process a large number of documents (>100 files, multi-threaded)** | `npm run intake:bulk [-- <folder>] [--dry-run]` | `intake/bulk-intake.js` |
| Only convert docx/pdf/xlsx to .md (no classification) | `npm run convert -- <file>` | `intake/convert.js` |
| Create the knowledge file for a new feature | `npm run knowledge:new <slug>` | `knowledge/new-knowledge.js` |
| Build `knowledge/` for a blank repo | `npm run knowledge:init` | `knowledge/bootstrap-knowledge.js` |
| Audit rule conflicts between features | `npm run knowledge:conflicts [slug]` | `knowledge/conflict-detector.js` |
| **Split documents into batches to distill knowledge** (only new/changed files) | `npm run knowledge:digest <slug> [--budget 60000]` | `knowledge/digest-plan.js` |
| **Move BA answers from OUTPUT to knowledge** | `npm run knowledge:sync -- <slug> --write` | `knowledge/sync-answers.js` |
| Merge `batch_*.md` into the overall spec | `npm run testcases:merge <slug>` | `testcase/merge-testcases.js` |
| Export Jira Xray / Redmine CSV | `npm run testcases:export <slug>` | `testcase/export-testcases.js` |
| Generate a dataset (0 LLM tokens) | `npm run data:gen -- --slug <slug> --schema <f.json> --count 50` | `testdata/generate-dataset.js` |
| Pull bugs/defects from Jira | `npm run jira:pull <slug>` | `jira/jira-client.js` |
| Push test cases to Jira (or export CSV) | `npm run jira:push <slug>` | `jira/jira-client.js` |
| Push run results + evidence screenshots to Jira | `npm run jira:sync <slug> <run-id>` | `jira/jira-client.js` |
| Start the MCP server for AI IDEs | `npm run jira:mcp` | `jira/mcp-server.js` |
| See the progress of every task | `npm run status` | `system/status.js` |
| Self-check the integrity of the agent system | `npm run agent:check` | `system/agent-doctor.js` |
| See the blast radius before editing | `npm run agent:check -- --impact <agent>` | `system/agent-doctor.js` |
| Sync the system map | `npm run map:sync` | `system/sync-system-map.js` |
| **Check the ASK gate before generating stages 3→6** | `npm run gate [slug]` | `system/gate.js` |
| **Next number for each id family** (BR/FD/AF/OQ/MR/RK/TI/TC) — ids stay stable across runs, QA_STANDARD §9.1 | `npm run ids -- <slug>` | see the `ids` script in `package.json` |
| **Fetch one branch of a JSON file** (system map, manifest, metrics…) — never load the whole file | `npm run json -- <file> <dot.path> [--keys]` | `qa-system/tools/system/json.js` |
| **Look up the system map by keyword** | `npm run map -- <keyword>` | `qa-system/tools/system/map.js` |
| **Which domain pack the project chose** (`knowledge/_sut.json` → `domain`) and which pack files a skill must read | `npm run domain [-- --json]` | `qa-system/tools/system/domain.js` |
| **Lint before every `git commit`** (every AI tool; keeps invented / wrongly formatted deliverables out of history) | `npm run hooks:install` (init installs it) | `qa-system/tools/system/precommit.js` |
| **Boundary points of each field** computed by machine from FD constraints (the agent copies, never computes) | `npm run boundary -- <slug> [FD-xx]` | `qa-system/tools/system/boundary.js` |
| **Build the 02 skeleton** (06W matrix with all rows, fixed cells pre-filled) | `npm run scaffold -- <slug> 02` | `qa-system/tools/system/scaffold.js` |
| **Number temporary ids** (`BR-?` → `BR-09`) | `npm run ids -- <slug> --assign <file>` | `qa-system/tools/system/ids.js` |
| **Compare two runs** (id overlap, quotes, questions, numbers, verdict) | `npm run diff-runs -- <folder A> <folder B> [--min N]` | `qa-system/tools/system/diff-runs.js` |
| *Value provenance* (a module used in lint): notification text / numbers in Expected & Test Data must exist in the source | — | `qa-system/tools/lib/provenance.js` |
| Audit traces of skipping the ASK gate | `npm run gate:audit [slug]` | `system/gate.js` |
| **Measure readiness before Automation** | `npm run readiness -- <slug> --write` | `system/readiness.js` |
| **Check the FACT standard of deliverables** | `npm run lint -- <slug>` | `system/lint-deliverables.js` |
| **Create / find / run a workflow** | `npm run workflow -- <list\|find\|show\|start\|new\|validate>` | `system/workflow.js` |
| **Run the tests for these tools themselves** | `npm test` | `__tests__/` |

---

## `lib/` — shared code

No entry point, no npm script. Every other tool `require`s from here.
Before writing a new utility function, check whether it already exists here.

| File | Holds | Why it exists |
|---|---|---|
| `paths.js` | `PATHS.ROOT/INPUT/OUTPUT/KNOWLEDGE/...`, `taskDir()`, `featureKnowledge()`, `listTaskSlugs()` | Previously 6 tools each computed `path.resolve(__dirname,'../..')`. Moving tools into subfolders changes the depth → everything broke. Now only one place knows where the repo root is. |
| `env.js` | `loadEnv()`, `jiraConfig()` | `loadEnv()` was once copied verbatim into 4 Jira files. |
| `jira-api.js` | `request()`, `jiraRequest()`, `jiraAttach()`, `adf()` | There used to be 4 `makeRequest` copies with different signatures, only 2 with a timeout. |
| `doc-converter.js` | Converts docx/xlsx/pdf/yaml/txt → clean markdown | A shared library of `intake/` — not a standalone tool. |
| `domain.js` | `loadDomain({ root })` → `{ ids, packs, conflictTopics, datagen, units, files, override }` · `validatePack()` | One loader for domain packs (`qa-system/domains/`). `conflict-detector`, `generate-dataset`, `lint` (units) and `agent:check` all read the same industry choice. No industry chosen ⇒ `ids` empty, `conflictTopics` null ⇒ every tool runs as before. An id that does not exist ⇒ an error with the list of ids, never a guess. |

---

## ASK gate — 3 layers (`system/gate.js` + `system/gate-hook.js`)

Gate rule: `qa-system/core/QA_STANDARD.md` §1 (the single definition). A written rule is only a *probability*,
so the three layers below turn it into a condition checked by machine:

| Layer | Mechanism | What it blocks | Where it applies |
|---|---|---|---|
| 1 | `npm run gate` → exit code `0` open / `1` closed, writes `OUTPUT/<slug>/_gate.lock` | Anyone willing to call it | Every IDE |
| 2 | `PreToolUse` hook in `.claude/settings.json` → `gate-hook.js` returns `permissionDecision: deny` | File writes to 03→06, **the harness blocks, the model cannot argue** | Claude Code only |
| 3 | `npm run gate:audit` → exit `2` if any 03→06 file was produced after the lock time | *After-the-fact* detection when someone got around layers 1 and 2 | Every IDE |

Unlock conditions: QA_STANDARD §1 rule 2 (status §9.3, decision table §9.5). There is no way to open it by words alone.

---

## Adding a new tool

1. Choose the right group. If none fits, think hard before creating a new group —
   adding a folder adds something to remember.
2. Take paths from `lib/paths.js`. **Do not** use `process.cwd()` (breaks when run from another
   folder) and **do not** compute `__dirname/../..` yourself (breaks when the file is moved).
3. Declare the script in `package.json` following the `<group>:<task>` convention.
4. Add a row to the quick-lookup table above.
5. If the tool produces a new deliverable: add it to `PIPELINE_DEPENDENCIES` in
   `system/agent-doctor.js` so the blast-radius analysis stays correct.
6. Run `npm test` then `npm run agent:check`, and paste the **real result** into the upgrade record (kept outside the repo).

---

## Go/No-Go gate before Automation (`system/readiness.js`)

Same philosophy as the ASK gate: **figures are measured by machine, the agent only interprets**. Previously the
`gen-readiness-report` skill counted by eye, and read 5 files of a different project
(`coverage-plan.json`, `voucher-spec.json`, `testcases/*.csv`…) — none produced by this
pipeline, so the gate always reported "not found" and still concluded.

`npm run readiness -- <slug> --write` reads the real deliverables (`01_` `02_` `03_` `05_` `06_` `12_`
and `knowledge/features/<slug>.md`), computes viewpoint/rule coverage, trace ratio, ASK gate status,
then writes `OUTPUT/<slug>/15_readiness_metrics.json`.

| Exit code | Recommendation |
|:---:|---|
| `0` | **GO** — trace 100%, viewpoints and rules fully covered, ASK gate open, Stage 6 PASS, knowledge written into `knowledge/` |
| `1` | **CONDITIONAL GO** — conditions still attached |
| `2` | **NO-GO** — there are blockers that must be resolved |

> ⚠️ `GO` is **not enough** to run Automation. The boundary gate (`AGENTS.md` §1.5) also requires
> an explicit user request **and** a concrete environment URL.

---

## Deliverable linter (`system/lint-deliverables.js`)

The FACT standard (QA_STANDARD §3) and the deliverable schema (§7, §9) used to be checked only by `coverage-review` —
that is, **an LLM grading an LLM's work**.

`npm run lint -- <slug>` turns the standard into a machine-checkable condition:

It checks the mechanical part: required fields and format of test cases, trace tags, the meta line (QA_STANDARD §7), table schema
and verbatim quotes (§9), the 06W matrix (§4), empty cells (§2). The exact list of rules is at the top of
`system/lint-deliverables.js` — the README does not copy it, to avoid drift.

Exit `0` = clean or warnings only · `1` = there are errors to fix.

> **Principle when extending the linter: better to miss than to cry wolf.**
> The first version mistook `<script>alert('XSS')</script>` (a valid XSS payload) and `SG-XXXXXX`
> (a description of an order-code format) for placeholders, and reported "missing Verdict" for a file that has
> `**Verdict Chặng 1**:` (Verdict Stage 1). A linter that cries wolf gets switched off — defeating its purpose.
> A new rule must be tried on real deliverables before it is enabled.

---

## `exam/` — graduation exam (spec: `docs/plans/graduation-project.md`, instructor guide: [`exam/INSTRUCTOR.md`](exam/INSTRUCTOR.md))

The engine is public; only `$GRADER_PRIVATE` (roster, benchmark, hidden tests, bundles) is secret.

| Who | Command | What it does |
|---|---|---|
| Student | `npm run exam:check` | Self-check on the working tree: schema, preflight B-01…B-05 / G-01…G-08, public checks; PASS/FAIL + fix hint; writes `.scratch/exam-check.json`; no score, no network |
| Instructor | `npm run exam:grading-setup -- --exam <id>` | Turns the current clone into the grading clone: `pushurl DISABLED`, `pre-push` hook blocking `grading/*`, branch `grading/<id>` from the starter tag |
| Instructor | `npm run exam:grade -- --exam <id> (--student <sid> \| --all) [--no-fetch] [--remote <r>]` | Fetch → roster → freeze + bundle → `git archive` → preflight → the starter's trusted tools → container (Docker) → `GRADING/results/<sid>.json\|.html` + `summary.csv` |
| Instructor | `npm run exam:score -- --exam <id> --student <sid> --criterion I1 --points 8 --level "6-8" --evidence <p> --comment "…" --reviewer <name>` | Writes `GRADING/instructor/<sid>.json` (level and evidence validated) and rebuilds the result. `--resolve-flag <id>` closes an integrity flag |
| Instructor | `npm run exam:report -- --exam <id> [--student <sid>]` | Recomputes results from the stored automated part + instructor file (no re-grading), rebuilds HTML + `summary.csv` |
| Instructor | `node qa-system/tools/exam/make-instructor-tests.js --exam <id>` | Generates the hidden T1/T2 fixtures and tests into `$GRADER_PRIVATE/<id>/instructor-tests/` |

Environment variables: `GRADER_PRIVATE` (default `~/cw-grader-private`), `GRADING_TMP` (default `~/.cache/cw-exam-grading`,
must be a folder the container runtime can mount), `EXAM_CONTAINER=off` (no container ⇒ checks that run student code become `PENDING_HUMAN_REVIEW`),
`EXAM_CONTAINER_IMAGE` (default `node:24-alpine`).

## `__tests__/` — tests for the tools themselves

```bash
npm test        # runs with the built-in node:test, no extra library
```

Every case here is **a bug that really happened**, not a test written for show.
In one working session these tools broke 9 times and **not once was it visible when
reading the code** — it only showed up when run on real data or on a blank project:

| Bug | Test case holding the place |
|---|---|
| `\Z` does not exist in JS regex → Section 8 at the end of a file could not be read, the ASK-gate unlock path silently broke | `gate.test.js` |
| The keyword `email` pushed every login PRD into `05_communication` → Gate 0 reported `02_ba` missing | `intake.test.js` |
| `slugify` swallowed Vietnamese vowels → `Giỏ Hàng` (Shopping Cart) became `gi-hng` | `intake.test.js` |
| `03_dev` demanded the exact words `database schema` so `DB schema` failed | `intake.test.js` |
| The linter treated an XSS payload and `SG-XXXXXX` as placeholders | `lint.test.js` |
| The linter reported duplicates between `batch_*.md` and the overall spec, although batches are the source merged into the spec | `lint.test.js` |
| The linter forced `Rule#BR-<number>` so it wrongly reported `Rule#GAP-H2` | `lint.test.js` |
| One missing field was reported as two errors (wrong regex stop point) | `lint.test.js` |
| `_comment` in the schema became a junk data column | `readiness.test.js` |

**When fixing a tool, write the test case first.** If you cannot reproduce the bug with a test,
you do not yet understand the bug.

Convention: `*.test.js` files, use `helpers.js` to build a fake project in a temp folder —
tests never touch the real `OUTPUT/` or `knowledge/`.

---

## HTML report (`report/`)

Renders the deliverables of one task into a single self-contained HTML file (inline CSS, no scripts, no external
resources, strict CSP, light/dark, print-friendly, sticky table of contents).

```bash
npm run report -- <feature-slug> [--out <file>] [--generated-at <text>]
```

- Default output: `OUTPUT/<slug>/report.html`. Reads `00_plan`, `01`…`06`, `05_test_blueprint.json`, `testcases/*.md`,
  `15_readiness_metrics.json`, `16`, `_gate.log`, `runs/*/run_result.md`; never modifies them.
- Missing stages are listed as "not produced"; counts (BR/MR ids, test cases) are computed from the files and cite their source.
- Deterministic: same inputs give byte-identical HTML. A timestamp appears only with `--generated-at`.
- Reusable library: `report/html-report.js` exports `renderMarkdown`, `renderReport`, `escapeHtml`, `safeUrl` (pure, no I/O).
- Tests: `__tests__/html-report.test.js`.

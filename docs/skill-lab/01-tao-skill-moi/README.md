# Exercise 1 — Create a new skill: "Which test cases does a Change Request affect?"

## Assignment (the QA lead's request, verbatim in meaning)

> Every time the BA sends a Change Request, the team spends half a day tracing which test cases must be edited and which must be re-run.
> I want the system to do this itself: read the new CR, point out which rule / field / message the CR changes,
> then list the affected test cases and what to do with each (edit values, rewrite, only re-run).
> Wherever the CR is unclear it must become a question for the BA — the new value must never be guessed.

You **do not yet know** which agent this skill belongs to. That is the job of step 1.

## Trial data

Build a task that has already run 01→06 (51 test cases, every BA question settled) from the data in `du-lieu/`:

```bash
S=lab-cr; D=docs/skill-lab
npm run intake -- $D/de-bai --slug $S --force
npm run intake -- $D/tra-loi-ba --into $S --force
for f in $D/01-tao-skill-moi/du-lieu/0*.md; do sed "1s/· hoan-tien$/· $S/" "$f" > OUTPUT/$S/$(basename "$f"); done
sed -e "s/\`hoan-tien\`/\`$S\`/g" -e "s#INPUT/hoan-tien/#INPUT/$S/#g" $D/01-tao-skill-moi/du-lieu/knowledge.md > knowledge/features/$S.md
npm run lint -- $S        # must be: Clean
npm run gate $S           # must be: OPEN
```

The new CR to try the skill on: [`CR-08_Thay_doi_nguong_hoan_tien_2026-11-05.md`](CR-08_Thay_doi_nguong_hoan_tien_2026-11-05.md) (Vietnamese scenario data: "CR-08 change of refund threshold"). At acceptance time, load it into the task:

```bash
npm run intake -- docs/skill-lab/01-tao-skill-moi/CR-08_Thay_doi_nguong_hoan_tien_2026-11-05.md --into lab-cr --force
```

## Work through 6 steps (fill in `phieu-phan-tich.md` gradually)

| Step | Task | Questions you must be able to answer yourself |
|---|---|---|
| 1 · Analyze | The A/B/C tree, `npm run agent:check -- --impact <agent>` | Which agent currently owns "test case"? Does giving it this extra work make that agent take on another role? |
| 2 · Place the layer | The 4-layer table | Where does the rule "a newer CR wins over the spec" already exist? (hint: QA_STANDARD §10.2 — point to it, do not copy) |
| 3 · Write the skill | The template `qa-system/templates/skills/ten-skill.md` | Which files are the inputs? What output number (`npm` does not assign this number — look it up in `WORKFLOW.md`)? |
| 4 · Propagate | The 7 anchor points | The skill produces a new deliverable ⇒ does N6 apply? Does a tool need to read this file (N7)? |
| 5 · Accept | 4 commands + two real runs | Do the two runs produce the same list of affected test cases? |
| 6 · Commit | Split the commits | Which commit goes over to develop? |

## Sentence to give the AI (copy verbatim, fill in the `<…>` parts)

```text
QA Leader, I want to add a new capability: <paste the assignment above>.
Follow qa-system/qa-lead/skills/system-upgrade-governance.md, ANALYSIS mode (PHAN_TICH) first:
the A/B/C decision table (answer all 3 questions), layer placement, deliverable sequence number, the list of 7 anchor points,
the result of `npm run agent:check -- --impact <agent>`. Stop for me to approve, do not edit any file yet.
```

After approval:

```text
Agreed on option <A/B> into <agent>. IMPLEMENT (THI_CONG) on the current branch, all 7 anchor points.
Then ACCEPT (NGHIEM_THU): npm test, npm run agent:check, npm run map:sync, npm run workflow -- validate.
Run the new skill 2 times (each in a fresh session) on the task lab-cr with CR-08, save the 2 results,
compare with npm run diff-runs, paste the real result and explain each difference.
```

## Pass criteria

- [ ] The A/B/C table has a reason for **all 3 questions**, and the conclusion matches the reasons.
- [ ] The skill points to QA_STANDARD (§1, §2, §7, §9, §10.2…), copying no rule table.
- [ ] The inputs include `knowledge/_project.md` and `knowledge/features/<slug>.md`; if an input is missing, STOP.
- [ ] Every output row has a source id: CR (file §section + verbatim quote) → `BR/FD/AF` → `TC_ID`.
- [ ] A new value the CR does not state clearly ⇒ the label `[CHƯA CÓ TRONG TÀI LIỆU]` (not in the document) / a question for the BA, never filled in by itself.
- [ ] No refund / voucher examples in the skill file (only `<field>`, `BR-01`, `<MODULE>-001`).
- [ ] `npm test` green, `agent:check` INTACT, the AI routes correctly when you say *"The BA just sent a CR, which test cases are affected?"*.
- [ ] Two runs on CR-08 produce the **same list** of affected test cases.

#!/usr/bin/env node
/**
 * merge-testcases.js — Assembles OUTPUT/<slug>/testcases/batch_NN.md into 05_test_case_spec.md.
 *
 *   merge(slug, {write})  Returns { ok, errors, warnings, verdict, batches, ids, diff, output }.
 *
 * - Refuses (exit 1) while the ASK gate is closed: the merged spec is a stage-5
 *   deliverable, and running this through Bash must not sidestep the gate.
 * - Batches are sorted by number (batch_2 before batch_10).
 * - Verdict = worst batch verdict read from each batch's meta line (an
 *   unreadable meta line counts as FIX). `Nguồn` lists the batch files.
 * - Refuses when a batch parses to 0 test cases or IDs repeat across batches.
 * - Reports per-batch IDs and the diff against the previous spec.
 *
 * Usage:
 *   npm run testcases:merge <task-slug>
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir } = require('../lib/paths');
const S = require('../lib/schema');
const { evaluate } = require('../system/gate');

const batchNum = (f) => {
  const m = f.match(/^batch_(\d+)\.md$/i);
  return m ? Number(m[1]) : Infinity;
};

function listBatches(batchDir) {
  return fs.readdirSync(batchDir)
    .filter((f) => /^batch_.*\.md$/i.test(f))
    .sort((a, b) => batchNum(a) - batchNum(b) || a.localeCompare(b));
}

/** Batch body without its own title and meta line, so the spec has exactly one meta line. */
function body(text) {
  const lines = text.split('\n');
  let i = 0;
  if (/^#\s/.test((lines[0] || '').trim())) i = 1;
  const meta = S.readMeta(text);
  const out = lines.filter((_, idx) => idx >= i && !(meta && idx === meta.line - 1));
  return out.join('\n').trim();
}

function merge(slug, { write = true } = {}) {
  const errors = [];
  const warnings = [];
  const dir = taskDir(slug);
  const batchDir = path.join(dir, 'testcases');
  const output = path.join(dir, '05_test_case_spec.md');
  const result = { ok: false, errors, warnings, verdict: null, batches: [], ids: [], diff: null, output };

  const gate = evaluate(slug);
  if (gate.blocked) {
    errors.push(`ASK gate is CLOSED for "${slug}" — refusing to write 05_test_case_spec.md:\n   - ${gate.reasons.join('\n   - ')}`);
    return result;
  }
  if (!fs.existsSync(batchDir)) { errors.push(`Batch directory not found: ${path.relative(PATHS.ROOT, batchDir)}`); return result; }
  const files = listBatches(batchDir);
  if (files.length === 0) { errors.push(`No batch_NN.md files in ${path.relative(PATHS.ROOT, batchDir)}`); return result; }

  const seen = new Map();
  const verdicts = [];
  for (const f of files) {
    if (batchNum(f) === Infinity) warnings.push(`${f}: name is not batch_NN.md — sorted last`);
    const text = fs.readFileSync(path.join(batchDir, f), 'utf8');
    const meta = S.readMeta(text);
    if (!meta) warnings.push(`${f}: no readable meta line — counted as FIX`);
    verdicts.push(meta ? meta.verdict : null);
    const { cases, unparsed } = S.parseTestCases(text);
    if (cases.length === 0) errors.push(`${f}: 0 test cases parsed — the merge would silently drop it`);
    unparsed.forEach((u) => warnings.push(`${f} line ${u.line}: TC-like line not parsed: "${u.text}"`));
    for (const c of cases) {
      if (seen.has(c.id)) errors.push(`${c.id} appears in both ${seen.get(c.id)} and ${f}`);
      else seen.set(c.id, f);
    }
    result.batches.push({ file: f, verdict: meta ? meta.verdict : null, ids: cases.map((c) => c.id), text });
  }
  result.ids = [...seen.keys()];
  result.verdict = S.worstVerdict(verdicts);

  if (fs.existsSync(output)) {
    const before = new Set(S.parseTestCases(fs.readFileSync(output, 'utf8')).cases.map((c) => c.id));
    const after = new Set(result.ids);
    result.diff = {
      added: [...after].filter((x) => !before.has(x)),
      removed: [...before].filter((x) => !after.has(x)),
    };
  }
  if (errors.length) return result;

  const sources = files.map((f) => `testcases/${f}`).join(', ');
  let out = `# Test Case Specification · ${slug}\n`;
  out += `Owner: qa-system/qa-test-design/skills/test-case-generation.md · Nguồn: ${sources} · Verdict: ${result.verdict}\n\n`;
  out += `> Ghép tự động từ ${files.length} lô bằng \`npm run testcases:merge\`. Verdict = verdict xấu nhất của các lô.\n\n---\n\n`;
  for (const b of result.batches) {
    out += `## Batch: ${b.file} · Verdict: ${b.verdict || 'không đọc được'}\n\n${body(b.text)}\n\n---\n\n`;
  }

  if (write) fs.writeFileSync(output, out, 'utf8');
  result.ok = true;
  result.content = out;
  return result;
}

function main() {
  const slug = process.argv[2];
  if (!slug || slug.startsWith('-')) {
    console.error('Please specify task-slug:\n  npm run testcases:merge <task-slug>');
    process.exit(1);
  }
  const r = merge(slug);
  for (const b of r.batches) console.log(`   ${b.file.padEnd(16)} ${String(b.ids.length).padStart(3)} case(s) · verdict ${b.verdict || 'unreadable'} · ${b.ids[0] || '-'}…${b.ids[b.ids.length - 1] || ''}`);
  if (r.diff) console.log(`   vs previous spec: +${r.diff.added.length} [${r.diff.added.join(', ')}] · -${r.diff.removed.length} [${r.diff.removed.join(', ')}]`);
  r.warnings.forEach((w) => console.log(`   WARN ${w}`));
  if (!r.ok) {
    r.errors.forEach((e) => console.error(`   ERROR ${e}`));
    console.error('\nNothing written.');
    process.exit(1);
  }
  console.log(`\nAssembled ${r.ids.length} test case(s) from ${r.batches.length} batch(es), Verdict: ${r.verdict}`);
  console.log(`  -> ${path.relative(PATHS.ROOT, r.output)}\n`);
}

if (require.main === module) main();

module.exports = { merge, listBatches };

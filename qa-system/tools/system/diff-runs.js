#!/usr/bin/env node
/**
 * diff-runs.js — Hai lần chạy cùng một đầu bài giống nhau bao nhiêu?
 *
 *   node qa-system/tools/system/diff-runs.js <thư-mục-task-A> <thư-mục-task-B> [--min <phần-trăm>] [--json]
 *
 * Mỗi thư mục là một OUTPUT/<slug>/ (của hai lần chạy, hoặc hai bản sao repo). So bằng SỐ, không bằng cảm nhận:
 *   • bộ mã (BR/FD/AF/OQ/RK/MR/TI/TC): số lượng và độ trùng (Jaccard)
 *   • nội dung: câu trích nguyên văn của 01, câu hỏi MR, con số và chuỗi trích ở Test Data/Expected
 *   • verdict từng chặng
 * `--min 80` ⇒ exit 1 khi có chỉ số nội dung dưới 80%. Dùng cho bước nghiệm thu skill: chạy hai lần, so, giải thích mọi khác biệt.
 */
const fs = require('fs');
const path = require('path');
const S = require('../lib/schema');
const P = require('../lib/provenance');

const read = (dir, name) => { const p = path.join(dir, name); return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null; };

function readTestCases(dir) {
  const spec = read(dir, '05_test_case_spec.md');
  if (spec) return S.parseTestCases(spec).cases;
  const bdir = path.join(dir, 'testcases');
  if (!fs.existsSync(bdir)) return [];
  return fs.readdirSync(bdir).filter((f) => /^batch_\d+\.md$/.test(f)).sort()
    .flatMap((f) => S.parseTestCases(fs.readFileSync(path.join(bdir, f), 'utf-8')).cases);
}

/** Hình dạng một lần chạy: các tập để so. */
function shape(dir) {
  const t01 = read(dir, '01_requirement_risk_summary.md');
  const d01 = S.read01(t01) || { BR: [], FD: [], AF: [], OQ: [], RK: [] };
  const quotes = new Set();
  if (t01) {
    for (const n of ['3', '3b', '5', '6']) {
      const sec = S.sectionAt(t01, n);
      if (!sec) continue;
      for (const t of S.parseTables(sec.body, sec.offset)) {
        const qi = S.col(t, 'quote');
        if (qi === -1) continue;
        for (const r of t.rows) { const q = S.normText(r.cells[qi] || ''); if (q && !S.isBlank(q)) quotes.add(q); }
      }
    }
  }
  const t02 = read(dir, '02_missing_rule_report.md');
  const mr = t02 ? S.read02Questions(t02) : [];
  const ideas = S.read04Ideas(read(dir, '04_test_idea_report.md'));
  const cases = readTestCases(dir);

  const numbers = new Set();
  const strings = new Set();
  let labels = 0;
  for (const tc of cases) {
    for (const f of ['Test Data', 'Expected Result']) {
      const v = S.tcField(tc, f);
      if (!v) continue;
      P.numbersIn(S.stripMd(v)).forEach((n) => numbers.add(String(n.value)));
      P.quotedStrings(S.stripMd(v)).forEach((q) => strings.add(S.normText(q)));
      if (S.hasLabel(v)) labels += 1;
    }
  }
  const verdict = (n) => { const t = read(dir, n); return t === null ? '—' : S.readVerdict(t) || '?'; };
  return {
    ids: { BR: d01.BR, FD: d01.FD, AF: d01.AF, OQ: d01.OQ, RK: d01.RK, MR: mr.map((q) => q.id), TI: ideas.map((i) => i.id), TC: cases.map((c) => c.id) },
    sets: {
      'câu trích 01': quotes,
      'câu hỏi MR': new Set(mr.map((q) => S.questionKey(q.question))),
      'con số trong TC': numbers,
      'chuỗi trích trong TC': strings,
    },
    labels,
    verdicts: Object.fromEntries(['01_requirement_risk_summary.md', '02_missing_rule_report.md', '03_viewpoint_report.md', '04_test_idea_report.md', '05_test_case_spec.md', '06_coverage_review.md'].map((n) => [n.slice(0, 2), verdict(n)])),
  };
}

function jaccard(a, b) {
  const A = new Set(a); const B = new Set(b);
  if (A.size === 0 && B.size === 0) return 100;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  return Math.round((inter / (A.size + B.size - inter)) * 100);
}

function compare(dirA, dirB) {
  const a = shape(dirA);
  const b = shape(dirB);
  const ids = Object.keys(a.ids).map((f) => ({ family: f, a: a.ids[f].length, b: b.ids[f].length, overlap: jaccard(a.ids[f], b.ids[f]) }));
  const content = Object.keys(a.sets).map((k) => ({ metric: k, a: a.sets[k].size, b: b.sets[k].size, overlap: jaccard(a.sets[k], b.sets[k]) }));
  const verdicts = Object.keys(a.verdicts).map((k) => ({ stage: k, a: a.verdicts[k], b: b.verdicts[k], same: a.verdicts[k] === b.verdicts[k] }));
  return { ids, content, labels: { a: a.labels, b: b.labels }, verdicts };
}

function main() {
  const args = process.argv.slice(2);
  const mi = args.indexOf('--min');
  const min = mi !== -1 ? Number(args[mi + 1]) : null;
  const dirs = args.filter((x, i) => !x.startsWith('--') && !(mi !== -1 && i === mi + 1));
  if (dirs.length !== 2) { console.error('Usage: diff-runs.js <thư-mục-task-A> <thư-mục-task-B> [--min N] [--json]'); process.exit(1); }
  for (const d of dirs) if (!fs.existsSync(d) || !fs.statSync(d).isDirectory()) { console.error(`Không có thư mục: ${d}`); process.exit(1); }

  const r = compare(dirs[0], dirs[1]);
  if (args.includes('--json')) console.log(JSON.stringify(r, null, 2));
  else {
    console.log(`\nSo hai lần chạy\n   A: ${dirs[0]}\n   B: ${dirs[1]}\n`);
    console.log('Bộ mã                A     B   trùng');
    r.ids.forEach((x) => console.log(`   ${x.family.padEnd(4)}            ${String(x.a).padStart(4)}  ${String(x.b).padStart(4)}   ${String(x.overlap).padStart(3)}%`));
    console.log('\nNội dung                         A     B   trùng');
    r.content.forEach((x) => console.log(`   ${x.metric.padEnd(24)} ${String(x.a).padStart(5)} ${String(x.b).padStart(5)}   ${String(x.overlap).padStart(3)}%`));
    console.log(`\nNhãn "chưa có trong tài liệu" ở TC: A=${r.labels.a} B=${r.labels.b}`);
    console.log('Verdict: ' + r.verdicts.map((v) => `${v.stage}:${v.a}${v.same ? '' : `≠${v.b}`}`).join('  '));
    console.log('\n(Khác biệt nào cũng phải giải thích được bằng một câu trong skill; không giải thích được ⇒ skill còn chỗ để model tự quyết.)\n');
  }
  if (min !== null) {
    const low = r.content.filter((x) => x.overlap < min);
    if (low.length) { console.error(`⛔ Dưới ${min}%: ${low.map((x) => `${x.metric} ${x.overlap}%`).join(', ')}`); process.exit(1); }
  }
}

if (require.main === module) main();

module.exports = { shape, compare, jaccard };

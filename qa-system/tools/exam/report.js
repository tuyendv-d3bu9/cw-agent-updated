#!/usr/bin/env node
/**
 * report.js — Recompute results from the stored automated part + instructor file (no re-grading),
 * re-render HTML and rebuild GRADING/summary.csv.
 *
 *   npm run exam:report -- --exam <id> [--student <id>]
 */

const fs = require('fs');
const C = require('./lib/common');
const store = require('./lib/store');

function main(argv) {
  let exam;
  let student;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--exam') exam = argv[++i];
    else if (argv[i] === '--student') student = argv[++i];
    else throw new Error(`Unknown argument ${argv[i]}`);
  }
  if (!exam) throw new Error('--exam <id> is required');
  const repo = store.repoRoot();
  const { cfg, roster } = C.loadExam(exam);
  const dir = store.gradingPath(repo, 'results');
  const ids = student ? [student] : (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort() : []);
  for (const id of ids) {
    if (!roster.students.some((s) => s.student_id === id)) throw new Error(`Student "${id}" is not in the roster`);
    const r = store.refresh(repo, cfg, id);
    console.log(`${id.padEnd(28)} ${r.status.padEnd(20)} total ${r.total.score === null ? 'pending' : r.total.score}`);
  }
  const n = store.rebuildSummary(repo);
  console.log(`GRADING/summary.csv rebuilt (${n} result(s)).`);
  return 0;
}

if (require.main === module) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(`exam:report failed: ${e.message}`); process.exitCode = 1; }
}

module.exports = { main };

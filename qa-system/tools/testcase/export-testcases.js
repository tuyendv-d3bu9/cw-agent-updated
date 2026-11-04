/**
 * export-testcases.js — Converts 05_test_case_spec.md to CSV for Jira Xray & Redmine
 * (UTF-8 BOM so Excel keeps Vietnamese text intact).
 *
 *   parseTestCasesFromMarkdown(text)  Fields by NAME via lib/schema (order-independent).
 *   runExport(slug)                   { ok, errors, warnings, count, files }.
 *   exportTestCases(slug)             CLI wrapper: prints, exits 1 on refusal.
 *
 * Refuses while the ASK gate is closed or `npm run lint` reports errors: an
 * export is what reaches the test management tool, so it must be the checked set.
 * A missing Priority stays EMPTY and is reported — never defaulted to Medium.
 *
 * Usage (internal tool):
 *   node qa-system/tools/testcase/export-testcases.js <task-slug>
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, listTaskSlugs } = require('../lib/paths');
const S = require('../lib/schema');

function escapeCSV(val) {
  if (val === undefined || val === null) return '""';
  const str = String(val).trim();
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/** Bullet markers inside multi-line values become "• " for CSV readability. */
const bullets = (v) => String(v || '').trim().replace(/^\s*[-*]\s+/gm, '• ');

function parseTestCasesFromMarkdown(content) {
  return S.parseTestCases(content).cases.map((c) => {
    const f = (name) => S.tcField(c, name);
    const tags = S.tcTags(c);
    const priority = S.stripMd(f('Priority') || '');
    return {
      id: c.id,
      title: S.stripMd(f('Title') || ''),
      precondition: bullets(f('Precondition')),
      steps: String(f('Test Steps') || '').trim(),
      data: bullets(f('Test Data')),
      expected: bullets(f('Expected Result')),
      priority: S.isBlank(priority) ? '' : priority,
      tags: S.stripMd(f('Tags') || ''),
      module: tags.module || (c.id.includes('-') ? c.id.split('-')[0] : ''),
    };
  });
}

function exportJiraXrayCSV(testCases, outputPath) {
  const headers = [
    'Issue Type',
    'Issue Key',
    'Summary',
    'Preconditions',
    'Action',
    'Data',
    'Expected Result',
    'Priority',
    'Labels',
    'Component'
  ];

  const rows = [headers.map(h => `"${h}"`).join(',')];

  for (const tc of testCases) {
    const cleanLabels = tc.tags
      ? tc.tags.split(',').map(t => t.trim().replace(/\s+/g, '_')).join(' ')
      : '';

    const row = [
      escapeCSV('Test'),
      escapeCSV(tc.id),
      escapeCSV(`[${tc.id}] ${tc.title}`),
      escapeCSV(tc.precondition),
      escapeCSV(tc.steps),
      escapeCSV(tc.data),
      escapeCSV(tc.expected),
      escapeCSV(tc.priority),
      escapeCSV(cleanLabels),
      escapeCSV(tc.module || 'General')
    ];
    rows.push(row.join(','));
  }

  const csvContent = '\uFEFF' + rows.join('\r\n');
  fs.writeFileSync(outputPath, csvContent, 'utf-8');
}

function exportRedmineCSV(testCases, outputPath) {
  const headers = [
    'Tracker',
    'Subject',
    'Description',
    'Priority',
    'Category',
    'Status'
  ];

  const rows = [headers.map(h => `"${h}"`).join(',')];

  for (const tc of testCases) {
    // Missing priority stays empty: Human-Final (QA_STANDARD §11), never guessed.
    const p = (tc.priority || '').toLowerCase();
    let redminePriority = '';
    if (/^high/.test(p)) redminePriority = 'High';
    else if (/^medium/.test(p)) redminePriority = 'Normal';
    else if (/^low/.test(p)) redminePriority = 'Low';

    const description = [
      `*Objective*: ${tc.title}`,
      '',
      `h4. Preconditions:`,
      tc.precondition,
      '',
      `h4. Test Steps:`,
      tc.steps,
      '',
      `h4. Test Data:`,
      tc.data,
      '',
      `h4. Expected Result:`,
      tc.expected,
      '',
      `*Tags*: ${tc.tags}`
    ].join('\n');

    const row = [
      escapeCSV('Test Case'),
      escapeCSV(`[${tc.id}] ${tc.title}`),
      escapeCSV(description),
      escapeCSV(redminePriority),
      escapeCSV(tc.module || 'QA'),
      escapeCSV('New')
    ];
    rows.push(row.join(','));
  }

  const csvContent = '\uFEFF' + rows.join('\r\n');
  fs.writeFileSync(outputPath, csvContent, 'utf-8');
}

function runExport(taskSlug) {
  const errors = [];
  const warnings = [];
  const out = { ok: false, errors, warnings, count: 0, files: [], slug: taskSlug };
  if (!taskSlug) taskSlug = out.slug = listTaskSlugs()[0];
  if (!taskSlug) { errors.push('No tasks in OUTPUT/ — specify a slug.'); return out; }

  const dir = taskDir(taskSlug);
  const specPath = path.join(dir, '05_test_case_spec.md');
  if (!fs.existsSync(specPath)) { errors.push(`${path.relative(PATHS.ROOT, specPath)} not found — run stage 5 / testcases:merge first.`); return out; }

  const gate = require('../system/gate').evaluate(taskSlug);
  if (gate.blocked) errors.push(`ASK gate is CLOSED: ${gate.reasons.join(' · ')}`);
  const lint = require('../system/lint-deliverables').lint(taskSlug);
  if (!lint.clean) {
    errors.push(`npm run lint -- ${taskSlug} reports ${lint.errors.length} error(s): ` +
      lint.errors.slice(0, 5).map((e) => `${e.file} [${e.where}] ${e.msg}`).join(' | '));
  }
  if (errors.length) return out;

  const testCases = parseTestCasesFromMarkdown(fs.readFileSync(specPath, 'utf-8'));
  if (testCases.length === 0) { errors.push('No test cases parsed from 05_test_case_spec.md.'); return out; }
  const noPriority = testCases.filter((t) => !t.priority).map((t) => t.id);
  if (noPriority.length) warnings.push(`Priority empty (left empty, not defaulted): ${noPriority.join(', ')}`);

  const jiraPath = path.join(dir, 'export_jira_xray.csv');
  const redminePath = path.join(dir, 'export_redmine.csv');
  exportJiraXrayCSV(testCases, jiraPath);
  exportRedmineCSV(testCases, redminePath);
  out.ok = true;
  out.count = testCases.length;
  out.files = [jiraPath, redminePath];
  return out;
}

function exportTestCases(taskSlug) {
  const r = runExport(taskSlug);
  r.warnings.forEach((w) => console.warn(`WARN ${w}`));
  if (!r.ok) {
    r.errors.forEach((e) => console.error(`ERROR ${e}`));
    console.error('Export refused — nothing written.');
    process.exit(1);
  }
  console.log(`Parsed ${r.count} test case(s) for [${r.slug}].`);
  r.files.forEach((f) => console.log(`  -> ${path.relative(PATHS.ROOT, f)}`));
  return r;
}

if (require.main === module) {
  exportTestCases(process.argv[2]);
}

module.exports = {
  runExport,
  exportTestCases,
  parseTestCasesFromMarkdown,
  exportJiraXrayCSV,
  exportRedmineCSV,
};


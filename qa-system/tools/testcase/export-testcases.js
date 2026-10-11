/**
 * export-testcases.js
 * Utility to convert 05_test_case_spec.md to standard CSV for Jira Xray & Redmine.
 * Includes UTF-8 BOM so Excel opens files correctly without font corruption.
 * 
 * Usage (Internal Agent Tool):
 *   node agents/tools/export-testcases.js [task-slug]
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');

const ROOT_DIR = PATHS.ROOT;
const OUTPUT_DIR = path.join(ROOT_DIR, 'OUTPUT');

function escapeCSV(val) {
  if (val === undefined || val === null) return '""';
  const str = String(val).trim();
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function parseTestCasesFromMarkdown(content) {
  const testCases = [];
  const rawSections = content.split(/\n(?=###\s+TC_ID:)/g);

  for (const sec of rawSections) {
    if (!sec.includes('### TC_ID:')) continue;

    const tc = {
      id: '',
      title: '',
      precondition: '',
      steps: '',
      data: '',
      expected: '',
      priority: 'Medium',
      tags: '',
      module: ''
    };

    const idMatch = sec.match(/###\s+TC_ID:\s*([A-Za-z0-9_-]+)/);
    if (idMatch) tc.id = idMatch[1].trim();

    const titleMatch = sec.match(/-\s+\*\*Title\*\*:\s*([^\n]+)/);
    if (titleMatch) tc.title = titleMatch[1].trim();

    const preMatch = sec.match(/-\s+\*\*Precondition\*\*:\s*([\s\S]*?)(?=-\s+\*\*Test Steps\*\*)/);
    if (preMatch) tc.precondition = preMatch[1].trim().replace(/^\s*-\s+/gm, '• ');

    const stepsMatch = sec.match(/-\s+\*\*Test Steps\*\*:\s*([\s\S]*?)(?=-\s+\*\*Test Data\*\*)/);
    if (stepsMatch) tc.steps = stepsMatch[1].trim();

    const dataMatch = sec.match(/-\s+\*\*Test Data\*\*:\s*([\s\S]*?)(?=-\s+\*\*Expected Result\*\*)/);
    if (dataMatch) tc.data = dataMatch[1].trim().replace(/^\s*-\s+/gm, '• ');

    const expMatch = sec.match(/-\s+\*\*Expected Result\*\*:\s*([\s\S]*?)(?=-\s+\*\*Priority\*\*)/);
    if (expMatch) tc.expected = expMatch[1].trim().replace(/^\s*-\s+/gm, '• ');

    const priMatch = sec.match(/-\s+\*\*Priority\*\*:\s*([^\n]+)/);
    if (priMatch) tc.priority = priMatch[1].trim();

    const tagsMatch = sec.match(/-\s+\*\*Tags\*\*:\s*([^\n]+)/);
    if (tagsMatch) {
      tc.tags = tagsMatch[1].trim();
      const modMatch = tc.tags.match(/Module#([A-Za-z0-9_-]+)/);
      if (modMatch) tc.module = modMatch[1];
    }

    if (!tc.module && tc.id) {
      const parts = tc.id.split('-');
      if (parts.length > 1) tc.module = parts[0];
    }

    if (tc.id) {
      testCases.push(tc);
    }
  }

  return testCases;
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
    let redminePriority = 'Normal';
    const p = tc.priority.toLowerCase();
    if (p.includes('critical') || p.includes('urgent')) redminePriority = 'Urgent';
    else if (p.includes('high')) redminePriority = 'High';
    else if (p.includes('low')) redminePriority = 'Low';

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

function exportTestCases(taskSlug) {
  if (!taskSlug) {
    if (fs.existsSync(OUTPUT_DIR)) {
      const dirs = fs.readdirSync(OUTPUT_DIR).filter(f => {
        return fs.statSync(path.join(OUTPUT_DIR, f)).isDirectory() && !f.startsWith('.') && !f.startsWith('_');
      });
      if (dirs.length > 0) {
        taskSlug = dirs[0];
      }
    }
  }

  if (!taskSlug) {
    console.error('❌ Error: No tasks found in OUTPUT/. Please specify slug: node export-testcases.js <task-slug>');
    process.exit(1);
  }

  const taskDir = path.join(OUTPUT_DIR, taskSlug);
  const specPath = path.join(taskDir, '05_test_case_spec.md');

  if (!fs.existsSync(specPath)) {
    console.error(`❌ Error: File not found: ${specPath}. Ensure test case generation step has run.`);
    process.exit(1);
  }

  console.log(`📦 Reading test cases from: ${specPath}`);
  const content = fs.readFileSync(specPath, 'utf-8');
  const testCases = parseTestCasesFromMarkdown(content);

  if (testCases.length === 0) {
    console.warn('⚠️ Warning: No valid test cases parsed matching standard format.');
    process.exit(1);
  }

  console.log(`✅ Successfully parsed: ${testCases.length} Test Cases.`);

  // 1. Export Jira Xray CSV
  const jiraPath = path.join(taskDir, 'export_jira_xray.csv');
  exportJiraXrayCSV(testCases, jiraPath);
  console.log(`🚀 [JIRA XRAY] Exported CSV: ${jiraPath}`);

  // 2. Export Redmine CSV
  const redminePath = path.join(taskDir, 'export_redmine.csv');
  exportRedmineCSV(testCases, redminePath);
  console.log(`🚀 [REDMINE] Exported CSV: ${redminePath}`);

  console.log(`\n🎉 Data export complete for task [${taskSlug}]!`);
}

if (require.main === module) {
  exportTestCases(process.argv[2]);
}

module.exports = {
  exportTestCases,
  parseTestCasesFromMarkdown,
  exportJiraXrayCSV,
  exportRedmineCSV,
};


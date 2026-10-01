/**
 * push-testcases-to-jira.js
 * Pushes test cases from 05_test_case_spec.md directly to Jira Cloud project.
 * Checks for existing issues to avoid duplicates.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '../..');
const ENV_PATH = path.join(ROOT_DIR, '.env');
const OUTPUT_DIR = path.join(ROOT_DIR, 'OUTPUT');

function loadEnv() {
  const env = {};
  if (fs.existsSync(ENV_PATH)) {
    const lines = fs.readFileSync(ENV_PATH, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
    }
  }
  return env;
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

function makeRequest(host, email, token, reqPath, method, postData) {
  return new Promise((resolve, reject) => {
    const url = new URL(host);
    const authHeader = 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64');
    let bodyStr = null;
    const headers = {
      'Authorization': authHeader,
      'Accept': 'application/json'
    };

    if (postData) {
      bodyStr = JSON.stringify(postData);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const options = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || 443,
      path: reqPath,
      method: method,
      headers: headers
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function run() {
  const taskSlug = process.argv[2] || 'function-d-voucher';
  const taskDir = path.join(OUTPUT_DIR, taskSlug);
  const specPath = path.join(taskDir, '05_test_case_spec.md');

  if (!fs.existsSync(specPath)) {
    console.error(`Spec file not found: ${specPath}`);
    process.exit(1);
  }

  const env = loadEnv();
  const host = env.JIRA_HOST;
  const email = env.JIRA_EMAIL;
  const token = env.JIRA_API_TOKEN;
  const projectKey = env.JIRA_PROJECT_KEY || 'SG';

  console.log(`📡 Connecting to Jira [${host}] Project [${projectKey}]...`);

  // 1. Fetch existing issues to avoid duplicating
  const jql = encodeURIComponent(`project = "${projectKey}" ORDER BY created ASC`);
  const existingRes = await makeRequest(host, email, token, `/rest/api/3/search/jql?jql=${jql}&maxResults=100&fields=key,summary`, 'GET');
  const existingMap = new Map(); // TC-ID -> Key

  if (existingRes.statusCode === 200 && existingRes.data && existingRes.data.issues) {
    for (const issue of existingRes.data.issues) {
      const match = issue.fields.summary.match(/\[([A-Za-z0-9_-]+)\]/);
      if (match) {
        existingMap.set(match[1], issue.key);
      }
    }
  }

  console.log(`ℹ️ Found ${existingMap.size} existing mapped test cases on Jira.`);

  // 2. Parse test cases
  const content = fs.readFileSync(specPath, 'utf-8');
  const testCases = parseTestCasesFromMarkdown(content);
  console.log(`📋 Total test cases in spec: ${testCases.length}`);

  const results = [];

  for (const tc of testCases) {
    if (existingMap.has(tc.id)) {
      const existingKey = existingMap.get(tc.id);
      console.log(`⏭️ [${tc.id}] Already exists as ${existingKey}`);
      results.push({
        id: tc.id,
        title: tc.title,
        key: existingKey,
        url: `${host}/browse/${existingKey}`,
        status: 'Existing'
      });
      continue;
    }

    // Map priority
    let prio = 'Medium';
    const p = tc.priority.toLowerCase();
    if (p.includes('critical') || p.includes('highest')) prio = 'Highest';
    else if (p.includes('high')) prio = 'High';
    else if (p.includes('low')) prio = 'Low';

    const desc = [
      `h3. Objective`,
      tc.title,
      ``,
      `h3. Preconditions`,
      tc.precondition,
      ``,
      `h3. Test Steps`,
      tc.steps,
      ``,
      `h3. Test Data`,
      tc.data,
      ``,
      `h3. Expected Result`,
      tc.expected,
      ``,
      `----`,
      `*Tags*: ${tc.tags}`
    ].join('\n');

    const cleanLabels = ['test-case', 'voucher', 'qa-auto'];
    if (tc.module) cleanLabels.push(tc.module.toLowerCase());

    const payload = {
      fields: {
        project: { key: projectKey },
        summary: `[${tc.id}] ${tc.title}`,
        description: desc,
        issuetype: { name: 'Task' },
        priority: { name: prio },
        labels: cleanLabels
      }
    };

    console.log(`🚀 Creating [${tc.id}] on Jira...`);
    const createRes = await makeRequest(host, email, token, '/rest/api/2/issue', 'POST', payload);

    if (createRes.statusCode === 201 && createRes.data) {
      const newKey = createRes.data.key;
      console.log(`   ✅ Created ${newKey}`);
      results.push({
        id: tc.id,
        title: tc.title,
        key: newKey,
        url: `${host}/browse/${newKey}`,
        status: 'Created'
      });
    } else {
      console.error(`   ❌ Failed to create ${tc.id}: HTTP ${createRes.statusCode}`, createRes.data || createRes.raw);
      results.push({
        id: tc.id,
        title: tc.title,
        key: 'ERROR',
        url: '',
        status: `Error ${createRes.statusCode}`
      });
    }

    // Small delay to prevent rate-limiting
    await new Promise(r => setTimeout(r, 200));
  }

  // 3. Write summary mapping markdown
  const mappingLines = [
    `# BẢNG ÁNH XẠ TEST CASE ↔ JIRA ISSUES · ${projectKey}`,
    `Đồng bộ lúc: ${new Date().toISOString()} · Jira Host: ${host}`,
    ``,
    `| TC ID | Tiêu đề Test Case | Jira Key | Liên kết Jira | Trạng thái |`,
    `|---|---|---|---|---|`,
    ...results.map(r => `| \`${r.id}\` | ${r.title} | [${r.key}](${r.url}) | [Xem Ticket](${r.url}) | ${r.status} |`),
    ``,
    `*Tổng số test cases*: ${results.length} | *Thành công*: ${results.filter(r => r.key !== 'ERROR').length}`
  ];

  const mapFilePath = path.join(taskDir, 'jira_testcase_mapping.md');
  fs.writeFileSync(mapFilePath, mappingLines.join('\n'), 'utf-8');
  console.log(`\n🎉 All test cases synced! Mapping saved to: ${mapFilePath}`);
}

run().catch(console.error);

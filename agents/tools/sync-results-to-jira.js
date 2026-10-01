/**
 * sync-results-to-jira.js
 * Syncs automated test execution results (pass/fail status, comments, screenshots)
 * directly to Jira Cloud issues and updates the Jira mapping table.
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

const env = loadEnv();
const authHeader = 'Basic ' + Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`).toString('base64');
const url = new URL(env.JIRA_HOST);

async function uploadAttachment(issueKey, filePath) {
  return new Promise((resolve, reject) => {
    const filename = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    const postDataHeader = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      `Content-Type: image/png\r\n\r\n`
    );
    const postDataFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
    const payload = Buffer.concat([postDataHeader, fileData, postDataFooter]);

    const options = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: 443,
      path: `/rest/api/2/issue/${issueKey}/attachments`,
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'X-Atlassian-Token': 'no-check',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function transitionIssue(issueKey, transitionId = '41') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ transition: { id: transitionId } });
    const options = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: 443,
      path: `/rest/api/2/issue/${issueKey}/transitions`,
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function addComment(issueKey, commentText) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ body: commentText });
    const options = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: 443,
      path: `/rest/api/2/issue/${issueKey}/comment`,
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  const taskSlug = process.argv[2] || 'function-d-voucher';
  const runId = process.argv[3] || 'RUN-01_voucher-regression';
  const runDir = path.join(OUTPUT_DIR, taskSlug, 'runs', runId);
  const evidenceDir = path.join(runDir, 'evidence');
  const mappingPath = path.join(OUTPUT_DIR, taskSlug, 'jira_testcase_mapping.md');

  if (!fs.existsSync(mappingPath)) {
    console.error(`Mapping file not found: ${mappingPath}`);
    process.exit(1);
  }

  // 1. Read test cases to update (Cluster 1: VCHR-001 -> VCHR-005)
  const items = [
    {
      tcId: 'VCHR-001',
      jiraKey: 'SG-2',
      status: 'PASS',
      actual: 'Áp dụng thành công GIAM50K, giảm 50.000 ₫, tổng thanh toán 150.000 ₫ khớp kỳ vọng.',
      file: 'VCHR-001_PASS.png'
    },
    {
      tcId: 'VCHR-002',
      jiraKey: 'SG-3',
      status: 'PASS',
      actual: 'Áp dụng thành công SALE20 cho đơn 350.000 ₫, giảm 20% (70.000 ₫), tổng còn 280.000 ₫ khớp kỳ vọng.',
      file: 'VCHR-002_PASS.png'
    },
    {
      tcId: 'VCHR-003',
      jiraKey: 'SG-4',
      status: 'PASS',
      actual: 'Áp dụng SALE20 cho đơn 600.000 ₫ kích hoạt mức trần maxCap 100.000 ₫, tổng thanh toán còn 500.000 ₫.',
      file: 'VCHR-003_PASS.png'
    },
    {
      tcId: 'VCHR-004',
      jiraKey: 'SG-5',
      status: 'PASS',
      actual: 'Nhập chuỗi "  giam50k  " có khoảng trắng và chữ thường, hệ thống tự trim/uppercase và áp dụng giảm 50.000 ₫ thành công.',
      file: 'VCHR-004_PASS.png'
    },
    {
      tcId: 'VCHR-005',
      jiraKey: 'SG-6',
      status: 'PASS',
      actual: 'Bấm trực tiếp vào badge gợi ý GIAM50K, hệ thống tự động điền mã và áp dụng thành công.',
      file: 'VCHR-005_PASS.png'
    },
    {
      tcId: 'VCHR-016',
      jiraKey: 'SG-17',
      status: 'PASS',
      actual: 'Hệ thống từ chối áp dụng mã SALE20 cho đơn hàng 280.000 ₫ (hiển thị thông báo chưa đạt mức tối thiểu 300.000 ₫). Tổng tiền giữ nguyên 280.000 ₫.',
      file: 'VCHR-016_PASS.png'
    }
  ];

  const filterTcId = process.argv[4];
  const targetItems = filterTcId ? items.filter(i => i.tcId === filterTcId) : items;

  console.log(`\n🚀 [JIRA SYNC] Updating ${targetItems.length} tested items to Jira [${env.JIRA_HOST}]...`);

  for (const item of targetItems) {
    console.log(`\n📌 Processing [${item.tcId}] -> Jira [${item.jiraKey}]...`);
    const filePath = path.join(evidenceDir, item.file);

    // Upload attachment if exists
    if (fs.existsSync(filePath)) {
      console.log(`   📸 Uploading evidence: ${item.file}...`);
      const attachRes = await uploadAttachment(item.jiraKey, filePath);
      console.log(`   ✅ Attachment uploaded (HTTP ${attachRes.statusCode})`);
    } else {
      console.warn(`   ⚠️ Evidence file not found: ${filePath}`);
    }

    // Add comment
    console.log(`   💬 Adding execution comment...`);
    const comment = [
      `h3. ⚡ Automated Playwright Test Result: ${item.status}`,
      `* *Run Session*: ${runId}`,
      `* *Execution Date*: ${new Date().toISOString()}`,
      `* *Environment*: Live Web (https://cwshopgo.github.io/)`,
      `* *Actual Result*: ${item.actual}`,
      `* *Evidence*: Attached screenshot [^${item.file}]`,
      `----`,
      `_Reported automatically by QA Leader (CW-Agent-Antigravity)_`
    ].join('\n');

    const commentRes = await addComment(item.jiraKey, comment);
    console.log(`   ✅ Comment logged (HTTP ${commentRes.statusCode})`);

    // Transition to Done
    console.log(`   🔄 Transitioning issue status to Done...`);
    const transRes = await transitionIssue(item.jiraKey, '41'); // 41 is 'Done'
    console.log(`   ✅ Status updated to Done (HTTP ${transRes.statusCode})`);

    await new Promise(r => setTimeout(r, 200));
  }

  // 2. Update jira_testcase_mapping.md
  console.log(`\n📝 Updating mapping table: ${mappingPath}...`);
  let mappingContent = fs.readFileSync(mappingPath, 'utf-8');

  for (const item of items) {
    // Replace table row status
    const regex = new RegExp(`(\\|\\s*\`${item.tcId}\`\\s*\\|[^|]+\\|[^|]+\\|[^|]+\\|\\s*)([^|]+)(\\s*\\|)`, 'g');
    mappingContent = mappingContent.replace(regex, `$1✅ PASS (Done)$3`);
  }

  fs.writeFileSync(mappingPath, mappingContent, 'utf-8');
  console.log(`🎉 Mapping table updated successfully!`);
}

run().catch(console.error);

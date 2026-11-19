/**
 * Tests for the Jira layer.
 *
 * These exist because of a specific complaint: every few uses, a Jira call
 * failed and somebody had to edit the code again. The causes were always the
 * same three — an API version that was mixed per call site, a field hardcoded
 * that varies per project, and an error body nobody surfaced. Each case below
 * pins one of those down so it cannot come back quietly.
 *
 * The HTTP layer is never exercised here; only the pure decisions around it.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const {
  API,
  adf,
  adfToText,
  describeError,
  rejectedFields,
  pickIssueType,
} = require('../lib/jira-api');
const { jiraConfig } = require('../lib/env');

/**
 * Source with comments removed. The comments explain which endpoint was
 * withdrawn and must keep saying so; only real call sites are of interest here.
 */
function code(rel) {
  return fs
    .readFileSync(path.join(__dirname, '..', rel), 'utf-8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

// ───────────────────────── one API version ─────────────────────────

test('every Jira path in the toolchain is built from the one API constant', () => {
  assert.strictEqual(API, '/rest/api/3');

  const files = ['jira/jira-client.js', 'jira/mcp-server.js', 'lib/jira-api.js'];
  for (const rel of files) {
    const src = code(rel);
    assert.ok(
      !/rest\/api\/2\//.test(src),
      `${rel} still calls API v2 — /rest/api/2/search was withdrawn by Atlassian`
    );
  }
});

test('no caller invents its own /rest/api/3 string in jira-client', () => {
  const src = code('jira/jira-client.js');
  assert.ok(
    !/['"`]\/rest\/api\//.test(src),
    'jira-client builds paths from the API constant, so one edit moves every call'
  );
});

// ───────────────────────── ADF round trip ─────────────────────────

test('text survives the trip into ADF and back', () => {
  const original = 'Kết quả: PASS\n[qa-agent-sync] RUN-01 · PASS';
  assert.strictEqual(adfToText(adf(original)).trim(), original);
});

test('adfToText reads a comment Jira returns, so a re-sync can recognise it', () => {
  // Shape Jira actually sends back on GET /issue?fields=comment
  const fromJira = {
    type: 'doc',
    version: 1,
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Kết quả chạy tự động: FAIL' }] },
      { type: 'paragraph', content: [{ type: 'text', text: '[qa-agent-sync] RUN-02 · FAIL' }] },
    ],
  };
  assert.match(adfToText(fromJira), /\[qa-agent-sync\] RUN-02 · FAIL/);
});

test('an empty paragraph does not crash the reader', () => {
  assert.strictEqual(adfToText(adf('a\n\nb')).trim(), 'a\n\nb');
});

// ───────────────────────── readable failures ─────────────────────────

test('a field-level 400 names the field, not just the status code', () => {
  const res = {
    statusCode: 400,
    data: { errors: { priority: 'Field cannot be set. It is not on the appropriate screen.' } },
  };
  const msg = describeError(res);
  assert.match(msg, /400/);
  assert.match(msg, /priority/);
  assert.match(msg, /not on the appropriate screen/);
});

test('errorMessages and errors are both reported', () => {
  const msg = describeError({
    statusCode: 400,
    data: { errorMessages: ['Issue type is a required field'], errors: { summary: 'too long' } },
  });
  assert.match(msg, /Issue type is a required field/);
  assert.match(msg, /summary: too long/);
});

test('a non-JSON body still yields something to read', () => {
  const msg = describeError({ statusCode: 503, data: null, raw: '<html>Gateway Timeout</html>' });
  assert.match(msg, /503/);
  assert.match(msg, /Gateway Timeout/);
});

test('rejectedFields lists exactly what push should drop and retry without', () => {
  const res = { statusCode: 400, data: { errors: { priority: 'nope', customfield_1: 'nope' } } };
  assert.deepStrictEqual(rejectedFields(res).sort(), ['customfield_1', 'priority']);
  assert.deepStrictEqual(rejectedFields({ statusCode: 201, data: {} }), []);
});

// ───────────────────────── issue type is configuration ─────────────────────────

const TYPES = [
  { id: '10001', name: 'Task', subtask: false, fields: ['summary', 'priority'], required: ['summary'] },
  { id: '10002', name: 'Bug', subtask: false, fields: ['summary'], required: ['summary'] },
];

/** Đúng những gì project SG trả về, theo đúng thứ tự Jira xếp. */
const SG_TYPES = [
  { id: '1', name: 'Epic', subtask: false, fields: [], required: [] },
  { id: '2', name: 'Subtask', subtask: true, fields: [], required: ['parent'] },
  { id: '3', name: 'Task', subtask: false, fields: [], required: [] },
  { id: '4', name: 'Story', subtask: false, fields: [], required: [] },
  { id: '5', name: 'Feature', subtask: false, fields: [], required: [] },
  { id: '6', name: 'Bug', subtask: false, fields: [], required: [] },
];

test('the configured issue type wins when the project offers it', () => {
  assert.strictEqual(pickIssueType(TYPES, 'Bug').name, 'Bug');
});

test('matching ignores case, because Jira names are typed by hand', () => {
  assert.strictEqual(pickIssueType(TYPES, 'bug').id, '10002');
});

test('an issue type the project does not have falls back instead of failing', () => {
  // The old code hardcoded 'Task' and died with an opaque 400 on projects without it.
  const onlyStory = [{ id: '3', name: 'Story', fields: [], required: [] }];
  assert.strictEqual(pickIssueType(onlyStory, 'Test').name, 'Story');
});

test('a project exposing no issue type returns null rather than guessing', () => {
  assert.strictEqual(pickIssueType([], 'Task'), null);
});

test('fallback NEVER lands on a subtask type', () => {
  // Chuyện thật trên project SG: JIRA_TEST_ISSUE_TYPE="Test" không có ở đó, fallback
  // cũ dùng /task|test/i nên khớp phải "Subtask" — vốn đứng trước "Task" trong danh
  // sách createmeta trả về. Subtask bắt buộc có `parent`, nên cả 36 issue sẽ lỗi.
  const picked = pickIssueType(SG_TYPES, 'Test');
  assert.strictEqual(picked.name, 'Task');
  assert.strictEqual(picked.subtask, false);
});

test('thứ tự ưu tiên không phụ thuộc thứ tự Jira trả về', () => {
  const shuffled = [...SG_TYPES].reverse();
  assert.strictEqual(pickIssueType(shuffled, 'Test').name, 'Task');
});

test('loại Test có thật thì được chọn, không rơi về Task', () => {
  const withTest = [...SG_TYPES, { id: '9', name: 'Test', subtask: false, fields: [], required: [] }];
  assert.strictEqual(pickIssueType(withTest, 'Test').name, 'Test');
});

test('gọi đích danh một loại subtask thì vẫn được tôn trọng', () => {
  // Người dùng cố ý khai thì nghe theo — họ tự lo trường `parent`.
  assert.strictEqual(pickIssueType(SG_TYPES, 'Subtask').name, 'Subtask');
});

test('project chỉ có subtask thì trả null, không đẩy vào thế chắc chắn lỗi', () => {
  assert.strictEqual(pickIssueType([{ name: 'Subtask', subtask: true }], 'Test'), null);
});

// ───────────────────────── .env carries the variation ─────────────────────────

test('JIRA_TEST_ISSUE_TYPE is read — it used to be declared and ignored', () => {
  assert.strictEqual(jiraConfig({ JIRA_TEST_ISSUE_TYPE: 'Test Case' }).issueType, 'Test Case');
});

test('issue type defaults to Task when .env says nothing', () => {
  assert.strictEqual(jiraConfig({}).issueType, 'Task');
});

test('done transitions come from .env, diacritics intact', () => {
  const cfg = jiraConfig({ JIRA_DONE_TRANSITIONS: 'Xong, Đã đóng ,Done' });
  assert.deepStrictEqual(cfg.doneTransitions, ['Xong', 'Đã đóng', 'Done']);
});

test('the default done list still covers an unconfigured board', () => {
  assert.ok(jiraConfig({}).doneTransitions.includes('Done'));
  assert.ok(jiraConfig({}).doneTransitions.includes('Hoàn thành'));
});

test('JIRA_SEND_PRIORITY=off is honoured whatever the casing', () => {
  assert.strictEqual(jiraConfig({ JIRA_SEND_PRIORITY: ' OFF ' }).sendPriority, 'off');
  assert.strictEqual(jiraConfig({}).sendPriority, 'auto');
});

test('missing credentials are reported by name, not as a bare false', () => {
  const cfg = jiraConfig({ JIRA_HOST: 'https://x.atlassian.net' });
  assert.strictEqual(cfg.ok, false);
  assert.deepStrictEqual(cfg.missing, ['JIRA_EMAIL', 'JIRA_API_TOKEN']);
});

// ───────────────────────── sync stays quiet on a repeat ─────────────────────────

/** Mirrors the marker jira-client writes into every sync comment. */
const marker = (runId, status) => `[qa-agent-sync] ${runId} · ${status}`;

test('the same run and verdict is recognised and skipped', () => {
  const existing = [marker('RUN-01_voucher-regression', 'PASS')];
  assert.ok(existing.includes(marker('RUN-01_voucher-regression', 'PASS')));
});

test('a verdict that flipped is NOT skipped — that is news worth posting', () => {
  const existing = [marker('RUN-01', 'PASS')];
  assert.ok(!existing.includes(marker('RUN-01', 'FAIL')));
});

test('a different run is never confused with an earlier one', () => {
  const existing = [marker('RUN-01', 'PASS')];
  assert.ok(!existing.includes(marker('RUN-02', 'PASS')));
});

test('the marker survives being written as ADF and read back from Jira', () => {
  const m = marker('RUN-03', 'FAIL');
  const body = adf(`Kết quả chạy tự động: FAIL\n${m}\nGhi tự động bởi QA Agent`);
  const lines = adfToText(body).split('\n').map((l) => l.trim());
  assert.ok(lines.includes(m), 'a marker that cannot be read back makes every sync a duplicate');
});

// ───────────────────────── no timestamp churn ─────────────────────────

test('the mapping file carries no run timestamp', () => {
  const src = code('jira/jira-client.js');
  const writeMapping = src.slice(src.indexOf('function writeMapping'));
  const header = writeMapping.slice(0, writeMapping.indexOf('...results.map'));
  assert.ok(
    !/new Date\(\)/.test(header),
    'stamping the header made the file differ in git even when no row changed'
  );
});

// ───────────── Đọc bảng kết quả theo TÊN CỘT, không theo vị trí ─────────────
//
// Bản cũ đếm cột cứng theo khuôn `templates/run/run_result.md`. File thật mà agent
// sinh ra lại có bảy cột, thêm "Jira Key" và "Dữ liệu Kiểm Thử" chen vào giữa. Kết
// quả: không khớp dòng nào, `jira:sync` in "No result rows to sync" rồi thoát êm —
// im lặng và sai, kiểu hỏng khó phát hiện nhất.

const { parseRunResult, resolveEvidence } = require('../jira/jira-client');
const { useTempProject, PATHS } = require('./helpers');

/** Khuôn trong templates/run/run_result.md — sáu cột, TC ID ở cột thứ hai. */
const BANG_KHUON_MAU = `
## 1. Bảng Chi Tiết

| # | TC ID | Tiêu đề | Trạng thái | Actual Result | Bằng chứng | Defect ID |
|---|---|---|:---:|---|---|:---:|
| 1 | TC-001 | Verify ap ma hop le | **PASS** | Giam dung 10% | [evidence/TC-001_pass.png](evidence/TC-001_pass.png) | — |
| 2 | TC-005 | Validate vuot muc toi da | **FAIL** | Tru qua so tien | [evidence/TC-005_fail.png](evidence/TC-005_fail.png) | BUG-01 |
`;

/** Khuôn file thật của RUN-01 — bảy cột, thứ tự khác hẳn. */
const BANG_THUC_TE = `
| TC ID | Jira Key | Tiêu đề Ca Kiểm Thử | Dữ liệu Kiểm Thử | Kết quả Thực tế (Actual Result) | Trạng thái | Bằng chứng (Evidence) |
|---|:---:|---|---|---|:---:|:---:|
| \`VCHR-001\` | [\`SG-2\`](https://x/browse/SG-2) | Ap dung GIAM50K | Ma GIAM50K | Tong 150.000 d | **PASS** | [VCHR-001_PASS.png](file:///c:/Users/ai/khac/OUTPUT/x/runs/r/evidence/VCHR-001_PASS.png) |
| \`VCHR-020\` | [\`SG-21\`](https://x/browse/SG-21) | Ma rong | (trong) | Khong bao loi | **FAIL** | [VCHR-020_FAIL.png](file:///c:/Users/ai/khac/OUTPUT/x/runs/r/evidence/VCHR-020_FAIL.png) |
`;

test('đọc được khuôn trong templates/run — TC ID ở cột thứ hai', () => {
  const rows = parseRunResult(BANG_KHUON_MAU);
  assert.strictEqual(rows.length, 2);
  assert.strictEqual(rows[0].tcId, 'TC-001');
  assert.strictEqual(rows[0].status, 'PASS');
  assert.strictEqual(rows[1].status, 'FAIL');
});

test('đọc được khuôn file thật — TC ID ở cột đầu, thêm cột Jira Key chen giữa', () => {
  const rows = parseRunResult(BANG_THUC_TE);
  assert.strictEqual(rows.length, 2, 'bảy cột mà không đọc được thì sync im lặng bỏ qua cả lượt chạy');
  assert.strictEqual(rows[0].tcId, 'VCHR-001');
  assert.strictEqual(rows[0].status, 'PASS');
  assert.strictEqual(rows[1].tcId, 'VCHR-020');
  assert.strictEqual(rows[1].status, 'FAIL');
});

test('lấy đúng Actual Result dù cột đó không nằm cố định một chỗ', () => {
  assert.match(parseRunResult(BANG_THUC_TE)[0].actual, /Tong 150\.000 d/);
  assert.match(parseRunResult(BANG_KHUON_MAU)[0].actual, /Giam dung 10%/);
});

test('dòng kẻ ngăn cách và dòng tiêu đề không bị nhận nhầm là kết quả', () => {
  assert.strictEqual(parseRunResult(BANG_KHUON_MAU).length, 2);
});

test('bảng không có cột trạng thái thì bỏ qua, không đoán bừa', () => {
  const khongCoTrangThai = `
| TC ID | Tiêu đề |
|---|---|
| VCHR-001 | Ap dung ma |
`;
  assert.deepStrictEqual(parseRunResult(khongCoTrangThai), []);
});

// ───────────── Tìm file bằng chứng dù đường dẫn trỏ sang máy khác ─────────────

test('đường dẫn file:/// tuyệt đối của máy khác vẫn tìm ra file nhờ dò theo tên', () => {
  const t = useTempProject();
  try {
    const runDir = path.join(PATHS.OUTPUT, 'x', 'runs', 'RUN-01');
    const evDir = path.join(runDir, 'evidence', 'VCHR-003');
    fs.mkdirSync(evDir, { recursive: true });
    fs.writeFileSync(path.join(evDir, '01_PASS_result.png'), 'png');

    // Đúng kiểu đường dẫn đang nằm trong run_result.md thật: máy khác, repo khác.
    const ref = 'file:///c:/Users/ai/Research/cw-agent-antigravity/OUTPUT/x/runs/RUN-01/evidence/VCHR-003/01_PASS_result.png';
    const found = resolveEvidence(runDir, ref);
    assert.ok(found, 'không dò được thì sync bỏ qua ảnh bằng chứng mà không ai biết');
    assert.strictEqual(path.basename(found), '01_PASS_result.png');
  } finally {
    t.cleanup();
  }
});

test('đường dẫn tương đối bình thường vẫn dùng thẳng', () => {
  const t = useTempProject();
  try {
    const runDir = path.join(PATHS.OUTPUT, 'x', 'runs', 'RUN-01');
    fs.mkdirSync(path.join(runDir, 'evidence'), { recursive: true });
    fs.writeFileSync(path.join(runDir, 'evidence', 'VCHR-001_PASS.png'), 'png');
    const found = resolveEvidence(runDir, 'evidence/VCHR-001_PASS.png');
    assert.strictEqual(path.basename(found), 'VCHR-001_PASS.png');
  } finally {
    t.cleanup();
  }
});

test('không có file thật thì trả null, không bịa đường dẫn', () => {
  const t = useTempProject();
  try {
    const runDir = path.join(PATHS.OUTPUT, 'x', 'runs', 'RUN-01');
    fs.mkdirSync(path.join(runDir, 'evidence'), { recursive: true });
    assert.strictEqual(resolveEvidence(runDir, 'evidence/khong-ton-tai.png'), null);
    assert.strictEqual(resolveEvidence(runDir, ''), null);
  } finally {
    t.cleanup();
  }
});

// ───────────── Cờ dòng lệnh không được hiểu là tên test case ─────────────

test('`--dry-run` ở vị trí đối số thứ 5 không bị hiểu là một mã test case', () => {
  // `sync <slug> <run-id> [TC_ID]` — cờ rơi đúng chỗ TC_ID, lọc sạch mọi dòng rồi
  // báo "No result rows to sync". Lỗi im lặng, mất cả lượt sync.
  const onlyTc = (a) => (a && !a.startsWith('--') ? a : null);
  assert.strictEqual(onlyTc('--dry-run'), null);
  assert.strictEqual(onlyTc('VCHR-003'), 'VCHR-003');
  assert.strictEqual(onlyTc(undefined), null);
});

test('dry-run không bao giờ ghi bảng ánh xạ', () => {
  const src = code('jira/jira-client.js');
  const soLanChan = (src.match(/if \(DRY_RUN\) \{[\s\S]{0,200}?return;/g) || []).length;
  assert.ok(soLanChan >= 2, 'cả push lẫn sync đều phải chặn ghi mapping khi dry-run');
});

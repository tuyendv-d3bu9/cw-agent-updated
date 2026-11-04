/**
 * Tests for conflict-detector (audit 2026-11-04 #16).
 */

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { execFileSync } = require('child_process');
const { useTempProject, write, PATHS } = require('./helpers');
const {
  phraseStance, detectConflicts, parseFeatureFile, numbersIn, DEFAULT_TOPICS, renderReport, loadTopics,
} = require('../knowledge/conflict-detector');

const feature = (slug, body) => parseFeatureFile(write(`knowledge/features/${slug}.md`, `# ${slug}\n${body}`));
const constants = (rows) => `## 9. HẰNG SỐ NGHIỆP VỤ\n| Hằng số | Kiểu dữ liệu | Giá trị | Phạm vi ảnh hưởng | Nguồn (file §mục) |\n|---|---|---|---|---|\n${rows.map((r) => `| ${r.join(' | ')} |`).join('\n')}\n`;

test('#16 — "không cộng dồn" là CẤM, không bị đếm thành "cộng dồn"', () => {
  assert.strictEqual(phraseStance('Voucher không cộng dồn với flash sale.', DEFAULT_TOPICS.stacking), 'deny');
  assert.strictEqual(phraseStance('Được cộng dồn với flash sale.', DEFAULT_TOPICS.stacking), 'allow');
});

test('#16 — hai tính năng cùng "không cộng dồn" không bị báo xung đột', (t) => {
  t.after(useTempProject().cleanup);
  const a = feature('a', 'BR-01: không cộng dồn mã.');
  const b = feature('b', 'BR-01: Voucher không cộng dồn.');
  assert.deepStrictEqual(detectConflicts([a, b]), []);
});

test('#16 — cho phép vs cấm → xung đột', (t) => {
  t.after(useTempProject().cleanup);
  const a = feature('a', 'Mã được cộng dồn với flash sale.');
  const b = feature('b', 'Voucher không cộng dồn.');
  assert.strictEqual(detectConflicts([a, b]).length, 1);
});

test('#16 — hằng số §9 cùng tên khác số (3 lần vs 5 lần) → xung đột', (t) => {
  t.after(useTempProject().cleanup);
  const a = feature('login', constants([['`MAX_FAIL`', 'int', '5 lần', 'Khoá TK', 'spec §2']]));
  const b = feature('otp', constants([['MAX_FAIL', 'int', '3 lần', 'Khoá TK', 'cr §1']]));
  const c = detectConflicts([a, b]);
  assert.strictEqual(c.length, 1);
  assert.match(c[0].type, /MAX_FAIL/);
});

test('#16 — cùng số khác cách viết (500.000 vs 500000) không phải xung đột', (t) => {
  t.after(useTempProject().cleanup);
  const a = feature('a', constants([['CAP', 'số', '500.000 ₫', '', '']]));
  const b = feature('b', constants([['CAP', 'số', '500000', '', '']]));
  assert.deepStrictEqual(detectConflicts([a, b]), []);
  assert.deepStrictEqual(numbersIn('1.000.000 và 2,5'), [1000000, 2.5]);
});

test('#16 — báo cáo không bao giờ tuyên bố PASS/nhất quán', () => {
  const r = renderReport([], []);
  assert.match(r, /Không phát hiện xung đột bằng heuristic/);
  assert.doesNotMatch(r, /PASS|logically consistent|nhất quán across/);
});

test('#16 — chủ đề cấu hình được qua knowledge/_conflict_topics.json', (t) => {
  t.after(useTempProject().cleanup);
  write('knowledge/_conflict_topics.json', JSON.stringify({ replaceDefaults: true, topics: { otp: { category: 'OTP', allow: ['gửi lại otp'], deny: ['không gửi lại otp'] } } }));
  const topics = loadTopics(path.join(PATHS.KNOWLEDGE, '_conflict_topics.json'));
  assert.deepStrictEqual(Object.keys(topics), ['otp']);
});

test('#16 — CLI exit 1 khi có xung đột; require không chạy main', () => {
  const tmp = require('fs').mkdtempSync(path.join(require('os').tmpdir(), 'qa-cd-'));
  // Chạy script thật trên một repo giả: chép paths.js để PATHS trỏ vào tmp.
  const fs = require('fs');
  const toolsDir = path.join(tmp, 'qa-system', 'tools');
  fs.mkdirSync(path.join(toolsDir, 'lib'), { recursive: true });
  fs.mkdirSync(path.join(toolsDir, 'knowledge'), { recursive: true });
  fs.copyFileSync(path.join(__dirname, '..', 'lib', 'paths.js'), path.join(toolsDir, 'lib', 'paths.js'));
  fs.copyFileSync(path.join(__dirname, '..', 'knowledge', 'conflict-detector.js'), path.join(toolsDir, 'knowledge', 'conflict-detector.js'));
  fs.mkdirSync(path.join(tmp, 'knowledge', 'features'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'knowledge', 'features', 'a.md'), '# a\nĐược cộng dồn.\n');
  fs.writeFileSync(path.join(tmp, 'knowledge', 'features', 'b.md'), '# b\nKhông cộng dồn.\n');
  let code = 0;
  try {
    execFileSync(process.execPath, [path.join(toolsDir, 'knowledge', 'conflict-detector.js')], { stdio: 'pipe' });
  } catch (e) {
    code = e.status;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  assert.strictEqual(code, 1);
});

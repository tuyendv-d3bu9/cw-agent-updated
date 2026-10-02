/**
 * Test cổng ASK — Bức Tường Thép.
 *
 * Cổng này là thứ duy nhất ngăn agent sinh test case trên nền nghiệp vụ chưa
 * chốt. Nó hỏng âm thầm thì cả hệ thống mất tác dụng mà không ai biết, nên
 * mỗi đường mở khoá phải có ca test riêng.
 */

const test = require('node:test');
const assert = require('node:assert');
const { useTempProject, write } = require('./helpers');
const { evaluate, audit, LOCKED_DELIVERABLES } = require('../system/gate');

/** Mục 7 + Mục 8 của file tri thức, với Mục 8 nằm CUỐI file (đúng như template). */
function knowledge({ pending = [], resolved = [], section8 = [] }) {
  const rows = [
    ...pending.map((q) => `| ${q} | Kẽ hở | W1 | HIGH | Mặc định | Câu hỏi? |  | New |`),
    ...resolved.map((q) => `| ${q} | Kẽ hở | W1 | HIGH | Mặc định | Câu hỏi? | Đã trả lời | Confirmed |`),
  ];
  return `# Tri thức · test

## 7. CÂU HỎI MỞ & KẼ HỞ 06W (OPEN QUESTIONS & MISSING RULES)

| ID | Mô tả kẽ hở | Nhóm 06W | Mức rủi ro | Đề xuất mặc định | Câu hỏi cho BA/PO | Phản hồi chính thức | Trạng thái |
|---|---|---|---|---|---|---|---|
${rows.join('\n')}

## 8. GIẢ ĐỊNH ĐÃ ĐƯỢC CHỐT (CONFIRMED ASSUMPTIONS LOG)

| # | Mã liên quan | Giả định ban đầu | Quyết định chính thức | Người phê duyệt | Ngày chốt |
|---|---|---|---|---|---|
${section8.map((q, i) => `| ${i + 1} | ${q} | Giả định | Quyết định chính thức | PO | 2026-10-02 |`).join('\n')}
`;
}

test('ĐÓNG khi Chặng 2 ra Verdict ASK', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', '# Báo cáo\nVerdict: ASK\n');
    const s = evaluate('t');
    assert.ok(s.blocked, 'cổng phải đóng');
    assert.match(s.reasons.join(' '), /Verdict: ASK/);
  } finally { t.cleanup(); }
});

test('ĐÓNG khi Mục 7 còn câu hỏi trạng thái New', () => {
  const t = useTempProject();
  try {
    write('knowledge/features/t.md', knowledge({ pending: ['MR-01', 'MR-02'] }));
    const s = evaluate('t');
    assert.ok(s.blocked);
    assert.deepStrictEqual(s.pending.map((q) => q.id), ['MR-01', 'MR-02']);
  } finally { t.cleanup(); }
});

test('MỞ khoá đường 1 — trả lời vào Mục 7, Trạng thái Confirmed', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', '# Báo cáo\nVerdict: PASS\n');
    write('knowledge/features/t.md', knowledge({ resolved: ['MR-01', 'MR-02'] }));
    const s = evaluate('t');
    assert.ok(!s.blocked, `cổng phải mở, nhưng: ${s.reasons.join(' · ')}`);
    assert.strictEqual(s.resolvedCount, 2);
  } finally { t.cleanup(); }
});

test('MỞ khoá đường 2 — chốt quyết định vào Mục 8 (mục CUỐI file)', () => {
  // Lỗi thật đã suýt lọt: hàm đọc mục dùng `\Z` — cú pháp KHÔNG tồn tại trong
  // regex JavaScript (JS hiểu thành chữ cái Z). Mục 8 thường nằm cuối file nên
  // không bao giờ khớp, khiến đường mở khoá này im lặng không hoạt động.
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', '# Báo cáo\nVerdict: PASS\n');
    write('knowledge/features/t.md', knowledge({ pending: ['MR-01'], section8: ['MR-01'] }));
    const s = evaluate('t');
    assert.ok(!s.blocked, `Mục 8 phải mở được khoá, nhưng: ${s.reasons.join(' · ')}`);
  } finally { t.cleanup(); }
});

test('MỞ khi chưa chạy Chặng 2 và chưa có tri thức — không chặn việc chưa bắt đầu', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/00_plan.md', '# Plan\n');
    assert.ok(!evaluate('t').blocked);
  } finally { t.cleanup(); }
});

test('CẢNH BÁO (không chặn) khi câu trả lời BA kẹt lại trong OUTPUT/', () => {
  // QA_STANDARD §8: OUTPUT/ là đồ bỏ đi, knowledge/ mới là thứ tích luỹ.
  // Chặng 2 PASS nhờ BA trả lời nhưng câu trả lời không vào knowledge thì
  // lần chạy sau phải đi hỏi lại BA đúng những câu đó.
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', '# Báo cáo\nVerdict: PASS\n| MR-01 | ... |\n| MR-02 | ... |\n');
    const s = evaluate('t');
    assert.ok(!s.blocked, 'cảnh báo không được chặn cổng');
    assert.strictEqual(s.advisories.length, 1);
    assert.match(s.advisories[0], /MR-01, MR-02/);
  } finally { t.cleanup(); }
});

test('KHÔNG cảnh báo khi mọi mã đã có trong knowledge', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', '# Báo cáo\nVerdict: PASS\n| MR-01 | ... |\n');
    write('knowledge/features/t.md', knowledge({ resolved: ['MR-01'] }));
    assert.strictEqual(evaluate('t').advisories.length, 0);
  } finally { t.cleanup(); }
});

test('audit — phát hiện deliverable 03→06 sinh ra sau mốc khoá', async () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/02_missing_rule_report.md', '# Báo cáo\nVerdict: ASK\n');
    write('OUTPUT/t/_gate.lock', JSON.stringify({ slug: 't', lockedAt: new Date(Date.now() - 60000).toISOString() }));
    write('OUTPUT/t/03_viewpoint_report.md', '# Sinh chui\n');
    const a = audit('t');
    assert.strictEqual(a.violations.length, 1);
    assert.strictEqual(a.violations[0].file, '03_viewpoint_report.md');
  } finally { t.cleanup(); }
});

test('audit — không báo vi phạm khi không có khoá', () => {
  const t = useTempProject();
  try {
    write('OUTPUT/t/03_viewpoint_report.md', '# Hợp lệ\n');
    assert.strictEqual(audit('t').violations.length, 0);
  } finally { t.cleanup(); }
});

test('danh sách deliverable bị khoá đúng phạm vi Chặng 3→6', () => {
  assert.ok(LOCKED_DELIVERABLES.includes('03_viewpoint_report.md'));
  assert.ok(LOCKED_DELIVERABLES.includes('06_coverage_review.md'));
  // Chặng 1 và 2 phải chạy được, nếu không thì không ai trả lời được câu hỏi.
  assert.ok(!LOCKED_DELIVERABLES.some((f) => f.startsWith('01_') || f.startsWith('02_')));
});

/**
 * Tests for the next-ID allocator (audit #37: never renumber from 01).
 */

const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('child_process');
const path = require('path');
const { useTempProject, write, knowledgeDoc } = require('./helpers');
const { nextIds } = require('../lib/schema');

test('next ID = max over knowledge + OUTPUT/<slug> + 1, per family', () => {
  const t = useTempProject();
  try {
    write('knowledge/features/t.md', knowledgeDoc({ br: ['BR-07'], q7: [{ id: 'MR-12', answer: 'a', status: 'Confirmed' }] }));
    write('OUTPUT/t/01_requirement_risk_summary.md', '| **BR-03** | x |\n| `FD-2` | y |\n| RK-04 | z |');
    write('OUTPUT/t/testcases/batch_01.md', '### TC_ID: AUTH-009\n### TC_ID: PAY-002\nViewpoint#VP-03 VP-92');
    write('OUTPUT/other/01.md', 'BR-99 MR-99');
    const r = nextIds('t');
    assert.strictEqual(r.next.BR, 'BR-08');
    assert.strictEqual(r.next.MR, 'MR-13');
    assert.strictEqual(r.next.FD, 'FD-03');
    assert.strictEqual(r.next.RK, 'RK-05');
    assert.strictEqual(r.next.AF, 'AF-01');
    assert.strictEqual(r.next.VP, 'VP-93');
    assert.deepStrictEqual(r.testCases, { AUTH: 'AUTH-010', PAY: 'PAY-003' });
  } finally { t.cleanup(); }
});

test('ids.js CLI prints JSON', () => {
  const out = execFileSync('node', [path.join(__dirname, '..', 'system', 'ids.js'), '__no_such_task__', '--json'], { encoding: 'utf-8' });
  const r = JSON.parse(out);
  assert.strictEqual(r.next.MR, 'MR-01');
  assert.strictEqual(r.next.VP, 'VP-91');
});

test('ids --assign — mã tạm được đánh số tiếp nối, theo thứ tự xuất hiện; nhãn giống nhau cùng một số', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  const { assign } = require('../system/ids');
  const fs = require('fs');
  write('knowledge/features/t.md', knowledgeDoc({ br: ['BR-07'] }));
  const f = write('OUTPUT/t/01_x.md', '| BR-? | a |\n| BR-? | b |\n| FD-?x | c | thấy lại FD-?x |\n| BR-08 | đã có |\n');
  const dry = assign('t', 'OUTPUT/t/01_x.md', { dryRun: true });
  assert.deepStrictEqual(dry.map.map((m) => m[1]), ['BR-09', 'BR-10', 'FD-01']);
  assert.match(fs.readFileSync(f, 'utf-8'), /BR-\?/, 'dry-run không ghi file');
  assign('t', 'OUTPUT/t/01_x.md');
  const out = fs.readFileSync(f, 'utf-8');
  assert.match(out, /\| BR-09 \| a \|\n\| BR-10 \| b \|\n\| FD-01 \| c \| thấy lại FD-01 \|/);
  assert.strictEqual(assign('t', 'OUTPUT/t/01_x.md').changed, false, 'chạy lại không đổi gì');
  assert.throws(() => assign('t', '../../etc/passwd'), /ngoài repo/);
});

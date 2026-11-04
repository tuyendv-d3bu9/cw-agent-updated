const test = require('node:test');
const assert = require('node:assert');
const { useTempProject, write, fullTask, testCase, spec, PATHS } = require('./helpers');
const D = require('../system/diff-runs');

test('jaccard — rỗng/rỗng là 100%, trùng một nửa là 33%', () => {
  assert.strictEqual(D.jaccard([], []), 100);
  assert.strictEqual(D.jaccard(['a', 'b'], ['b', 'c']), 33);
});

test('compare — cùng một bộ deliverable ⇒ 100%; thêm một TC và đổi một con số ⇒ lệch được đo', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  fullTask('a');
  fullTask('b');
  const same = D.compare(`${PATHS.OUTPUT}/a`, `${PATHS.OUTPUT}/b`);
  assert.ok(same.ids.every((x) => x.overlap === 100));
  assert.ok(same.content.every((x) => x.overlap === 100));
  assert.ok(same.verdicts.every((v) => v.same));

  write('OUTPUT/b/05_test_case_spec.md', spec([
    testCase('TST-001', { 'Test Data': '\n  - Khoá 15 phút', Tags: 'Rule#BR-01, Viewpoint#VP-01, TI#TI-01, Module#TST, Manual' }),
    testCase('TST-002', { Tags: 'Rule#BR-02, Viewpoint#VP-02, TI#TI-02, Module#TST, Manual' }),
    testCase('TST-003', { Tags: 'Rule#BR-02, Viewpoint#VP-02, TI#TI-02, Module#TST, Manual' }),
  ]));
  const diff = D.compare(`${PATHS.OUTPUT}/a`, `${PATHS.OUTPUT}/b`);
  const tc = diff.ids.find((x) => x.family === 'TC');
  assert.deepStrictEqual([tc.a, tc.b], [2, 3]);
  assert.ok(tc.overlap < 100);
  assert.ok(diff.content.find((x) => x.metric === 'con số trong TC').overlap < 100);
});

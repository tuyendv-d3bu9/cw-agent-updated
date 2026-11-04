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

test('diff-runs — so ma trận 06W theo ô: câu hỏi khác chữ nhưng cùng ô kẽ hở vẫn tính là trùng', () => {
  const fsx = require('fs'); const osx = require('os'); const px = require('path');
  const mk = (cell, q) => {
    const d = fsx.mkdtempSync(px.join(osx.tmpdir(), 'dr-'));
    fsx.writeFileSync(px.join(d, '02_missing_rule_report.md'), [
      '# Missing Rule Report · t', 'Owner: x · Nguồn: y · Verdict: ASK', '', '## 1. MA TRẬN 06W',
      '| Đối tượng | W1 | W2 | W3 | W4 | W5 | W6 |', '|---|---|---|---|---|---|---|',
      `| BR-01 | ${cell} | Nguồn: AF-01 | Không áp dụng | Không áp dụng | Không áp dụng | Không áp dụng |`, '',
      '## 3. BẢNG CÂU HỎI',
      '| ID | Kẽ hở | Nhóm 06W | Nguồn phát hiện | Phương án gợi ý (chưa phải rule) | Câu hỏi cho BA/PO | Phản hồi chính thức | Người trả lời | Ngày | Trạng thái |',
      '|---|---|---|---|---|---|---|---|---|---|', `| ${cell} | k | W1 | BR-01 × W1 | A | ${q} |  |  |  | New |`, ''].join('\n'));
    return d;
  };
  const r = D.compare(mk('MR-01', 'Độ dài tối đa là bao nhiêu?'), mk('MR-07', 'Giới hạn ký tự tối đa?'));
  const get = (m) => r.content.find((x) => x.metric === m).overlap;
  assert.strictEqual(get('câu hỏi MR (đúng chữ)'), 0);
  assert.strictEqual(get('ô 06W có kẽ hở'), 100);
  assert.strictEqual(get('phán quyết ô 06W'), 100);
});

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { useTempProject, write, testCase, spec, fullTask, PATHS } = require('./helpers');
const PC = require('../system/precommit');

test('slugsFromPaths — chỉ lấy task thật, bỏ reports/_runs, không phân biệt hoa thường', () => {
  const known = ['doi-mat-khau', 'gio-hang'];
  const files = ['OUTPUT/doi-mat-khau/05_test_case_spec.md', 'OUTPUT/reports/bug.md', 'INPUT/Gio-Hang/02_ba/x.md', 'knowledge/features/gio-hang.md', 'README.md', 'OUTPUT/_bulk_intake/a.md'];
  assert.deepStrictEqual(PC.slugsFromPaths(files, known).sort(), ['doi-mat-khau', 'gio-hang']);
});

test('check — task sạch qua; task có Expected tự chế bị chặn', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  fullTask();
  assert.strictEqual(PC.check(['OUTPUT/t/05_test_case_spec.md']).failed.length, 0);
  write('OUTPUT/t/05_test_case_spec.md', spec([
    testCase('TST-001', { 'Expected Result': '\n  - Hiển thị "Mã lỗi E-404: Voucher đã bị khoá"', Tags: 'Rule#BR-01, Viewpoint#VP-01, TI#TI-01, Module#TST, Manual' }),
    testCase('TST-002', { Tags: 'Rule#BR-02, Viewpoint#VP-02, TI#TI-02, Module#TST, Manual' }),
  ]));
  const r = PC.check(['OUTPUT/t/05_test_case_spec.md']);
  assert.strictEqual(r.failed.length, 1);
  assert.match(r.failed[0].errors.map((e) => e.msg).join(' '), /quotes "Mã lỗi E-404/);
});

test('install — cài hook, chạy lại không nhân đôi, không ghi đè hook của người khác', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  assert.strictEqual(PC.install().ok, false); // chưa phải git repo
  fs.mkdirSync(path.join(PATHS.ROOT, '.git', 'hooks'), { recursive: true });
  assert.strictEqual(PC.install().ok, true);
  const hook = path.join(PATHS.ROOT, '.git/hooks/pre-commit');
  assert.ok(fs.readFileSync(hook, 'utf-8').includes(PC.MARK));
  assert.strictEqual(PC.install().ok, true);
  assert.strictEqual(fs.readFileSync(hook, 'utf-8').split(PC.MARK).length, 2);
  fs.writeFileSync(hook, '#!/bin/sh\necho của người khác\n');
  assert.strictEqual(PC.install().ok, false);
  assert.match(fs.readFileSync(hook, 'utf-8'), /của người khác/);
});

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { useTempProject, write, fullTask, summary01, PATHS } = require('./helpers');
const { build } = require('../system/scaffold');
const { lint } = require('../system/lint-deliverables');

test('khung 02 — đủ dòng theo thứ tự cố định; ô không áp dụng đã điền sẵn', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  write('OUTPUT/t/01_requirement_risk_summary.md', summary01({ oq: ['OQ-01'] }) + `
## 3b. FIELD & RÀNG BUỘC

| ID | Field | Kiểu | Bắt buộc | Ràng buộc (min/max/định dạng) | Thông báo khi sai | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|---|---|---|
| FD-01 | f | text | Có | 8–64 ký tự | x | a §1 | q |
`);
  const text = build('t');
  const rows = text.split('\n').filter((l) => /^\| (BR|FD|AF)-/.test(l));
  assert.deepStrictEqual(rows.map((r) => r.split('|')[1].trim()), ['BR-01', 'BR-02', 'FD-01']);
  assert.strictEqual(rows[0], '| BR-01 | <điền> | <điền> | <điền> | <điền> | <điền> | <điền> |');
  assert.strictEqual(rows[2], '| FD-01 | <điền> | Không áp dụng | <điền> | Không áp dụng | Không áp dụng | Không áp dụng |');
  assert.match(text, /\| OQ-01 \| <điền> \|/);
  assert.strictEqual(build('t'), text, 'cùng 01 ⇒ cùng khung');
});

test('khung 02 chưa điền thì lint KHÔNG cho qua', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  fullTask();
  write('OUTPUT/t/02_missing_rule_report.md', build('t'));
  assert.ok(lint('t').errors.length > 0, 'ô <điền> còn nguyên phải bị lint chặn');
});

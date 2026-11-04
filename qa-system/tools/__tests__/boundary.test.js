const test = require('node:test');
const assert = require('node:assert');
const { useTempProject, write, head } = require('./helpers');
const B = require('../system/boundary');

test('parseConstraint — các cách viết khoảng giá trị', () => {
  assert.deepStrictEqual(B.parseConstraint('8–64 ký tự'), { min: 8, max: 64, kind: 'length' });
  assert.deepStrictEqual(B.parseConstraint('từ 8 đến 64 ký tự'), { min: 8, max: 64, kind: 'length' });
  assert.deepStrictEqual(B.parseConstraint('tối thiểu 8, tối đa 64 ký tự'), { min: 8, max: 64, kind: 'length' });
  assert.deepStrictEqual(B.parseConstraint('50.000–2.000.000 VNĐ', 'số'), { min: 50000, max: 2000000, kind: 'numeric' });
  assert.deepStrictEqual(B.parseConstraint('≥ 18', 'số nguyên'), { min: 18, max: null, kind: 'numeric' });
  assert.deepStrictEqual(B.parseConstraint('bắt buộc, không rỗng'), { min: null, max: null, kind: 'unknown' });
});

test('points — đủ chuỗi biên, giá trị giữa = floor((min+max)/2)', () => {
  const pts = B.points({ min: 8, max: 64, kind: 'length' });
  const by = Object.fromEntries(pts.map((p) => [p.name, p.value]));
  assert.deepStrictEqual([by['min-1'], by.min, by['min+1'], by['giữa'], by['max-1'], by.max, by['max+1']], [7, 8, 9, 36, 63, 64, 65]);
  assert.strictEqual(by['rỗng'], 0);
});

test('points — thiếu max trong nguồn ⇒ nhãn, KHÔNG tự đặt ngưỡng', () => {
  const pts = B.points({ min: 18, max: null, kind: 'numeric' });
  const by = Object.fromEntries(pts.map((p) => [p.name, p.value]));
  assert.deepStrictEqual([by['min-1'], by.min], [17, 18]);
  assert.strictEqual(by.max, null);
  assert.strictEqual(by['giữa'], null);
  const none = B.points({ min: null, max: null, kind: 'unknown' });
  assert.ok(none.every((p) => p.value === null));
});

test('points — min=0 theo độ dài không có min-1 âm; không có điểm trùng giá trị', () => {
  const pts = B.points({ min: 0, max: 1, kind: 'length' });
  assert.strictEqual(pts.find((p) => p.name === 'min-1').value, null);
  const values = pts.filter((p) => p.value !== null).map((p) => p.value);
  assert.strictEqual(new Set(values).size, values.length);
});

test('compute — đọc bảng FD của 01', (t) => {
  const p = useTempProject(); t.after(p.cleanup);
  write('OUTPUT/t/01_requirement_risk_summary.md', `${head('R')}
## 3b. FIELD & RÀNG BUỘC

| ID | Field | Kiểu | Bắt buộc | Ràng buộc (min/max/định dạng) | Thông báo khi sai | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|---|---|---|
| FD-01 | Mật khẩu | text | Có | 8–64 ký tự | x | a §1 | q |
| FD-02 | Ghi chú | text | Không | tuỳ ý | x | a §1 | q |
`);
  const r = B.compute('t');
  assert.deepStrictEqual(r.map((x) => x.id), ['FD-01', 'FD-02']);
  assert.strictEqual(r[0].points.find((x) => x.name === 'max+1').value, 65);
  const seven = ['min-1', 'min', 'min+1', 'giữa', 'max-1', 'max', 'max+1'];
  assert.ok(r[1].points.filter((x) => seven.includes(x.name)).every((x) => x.value === null), 'không nêu min/max ⇒ cả 7 điểm là nhãn');
  assert.strictEqual(B.compute('t', 'FD-02').length, 1);
});

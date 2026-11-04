#!/usr/bin/env node
/**
 * scaffold.js — Dựng khung deliverable để số dòng / thứ tự / ô cố định do MÁY quyết, không phải model.
 *
 *   node qa-system/tools/system/scaffold.js <slug> 02 [--stdout] [--force]
 *
 * 02 (ma trận 06W): mỗi BR/FD/AF của 01 một dòng, theo thứ tự cố định (BR, FD, AF; mã tăng dần). Ô nào
 * KHÔNG áp dụng cho loại đối tượng đó (QA_STANDARD §4, bảng áp dụng) đã điền sẵn `Không áp dụng`; ô cần
 * phán đoán để `<điền>` — lint báo lỗi cho tới khi agent điền (MR-xx / Nguồn: … / Không áp dụng).
 * Nhờ vậy cùng một bản 01 luôn cho cùng một khung: số câu hỏi không còn dao động theo việc model "nghĩ ra" bao nhiêu ô.
 */
const fs = require('fs');
const path = require('path');
const { taskDir } = require('../lib/paths');
const S = require('../lib/schema');

const FILL = '<điền>';
const NA = 'Không áp dụng';

/** W nào MỞ (cần phán đoán) với từng loại đối tượng; còn lại cố định là "Không áp dụng". QA_STANDARD §4. */
const APPLICABLE = {
  BR: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
  FD: ['W1', 'W3'],
  AF: ['W2', 'W6'],
};
const W = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];

function build(slug) {
  const dir = taskDir(slug);
  const p01 = path.join(dir, '01_requirement_risk_summary.md');
  if (!fs.existsSync(p01)) throw new Error(`Chưa có OUTPUT/${slug}/01_requirement_risk_summary.md`);
  const d01 = S.read01(fs.readFileSync(p01, 'utf-8'));
  if (!d01 || d01.BR.length + d01.FD.length + d01.AF.length === 0) throw new Error('01 không có BR/FD/AF nào để dựng ma trận');

  const row = (id) => {
    const fam = id.split('-')[0];
    return `| ${id} | ${W.map((w) => (APPLICABLE[fam].includes(w) ? FILL : NA)).join(' | ')} |`;
  };
  const objects = [...d01.BR, ...d01.FD, ...d01.AF];
  const oqRows = d01.OQ.map((o) => `| ${o} | ${FILL} |`);

  return [
    `# BÁO CÁO PHÂN TÍCH QUY TẮC NGHIỆP VỤ BỊ THIẾU · ${slug}`,
    'Owner: qa-system/qa-analyst/skills/missing-rule-06w.md · Nguồn: 01_requirement_risk_summary.md · Verdict: ASK',
    '',
    '## 1. MA TRẬN 06W',
    `> Khung do \`npm run scaffold\` dựng: ô \`${NA}\` là cố định (QA_STANDARD §4), KHÔNG sửa. Ô \`${FILL}\` điền đúng một trong: \`MR-xx\` · \`Nguồn: <mã hoặc file §mục>\` · \`${NA}\`.`,
    '',
    '| Đối tượng | W1 | W2 | W3 | W4 | W5 | W6 |',
    '|---|---|---|---|---|---|---|',
    ...objects.map(row),
    '',
    '## 2. CHI TIẾT MISSING RULES',
    `${FILL} — mỗi MR một mục \`### MR-xx — <tên ngắn>\`; không có MR thì thay dòng này bằng \`Không có\`.`,
    '',
    '## 3. BẢNG CÂU HỎI',
    `${FILL} — bảng QA_STANDARD §9.4; không có MR thì thay dòng này bằng \`Không có\`.`,
    '',
    '## 4. ĐỐI CHIẾU OQ',
    ...(oqRows.length
      ? ['| OQ | Xử lý |', '|---|---|', ...oqRows]
      : ['Không có']),
    '',
  ].join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const pos = args.filter((a) => !a.startsWith('-'));
  const [slug, stage] = pos;
  if (!slug || stage !== '02') { console.error('Usage: scaffold.js <slug> 02 [--stdout] [--force]   (hiện hỗ trợ chặng 02)'); process.exit(1); }
  let text;
  try { text = build(slug); } catch (e) { console.error(e.message); process.exit(1); }
  if (args.includes('--stdout')) { console.log(text); return; }
  const out = path.join(taskDir(slug), '02_missing_rule_report.md');
  if (fs.existsSync(out) && !args.includes('--force')) {
    console.error(`${path.relative(process.cwd(), out)} đã có — không ghi đè (dùng --force nếu chắc chắn, hoặc --stdout để xem khung).`);
    process.exit(1);
  }
  fs.writeFileSync(out, text, 'utf-8');
  const rows = (text.match(/^\| (?:BR|FD|AF)-/gm) || []).length;
  console.log(`Đã dựng ${path.relative(process.cwd(), out)} — ${rows} dòng ma trận. Điền các ô ${FILL}, rồi chạy: npm run lint -- ${slug}`);
}

if (require.main === module) main();

module.exports = { build, APPLICABLE };

#!/usr/bin/env node
/**
 * scaffold.js — Build the deliverable skeleton so row count / order / fixed cells are decided by the MACHINE, not the model.
 *
 *   node qa-system/tools/system/scaffold.js <slug> 02 [--stdout] [--force]
 *
 * 02 (06W matrix): one row per BR/FD/AF of 01, in a fixed order (BR, FD, AF; ids ascending). A cell that does
 * NOT apply to that object type (QA_STANDARD §4, applicability table) is pre-filled with `Không áp dụng`; a cell that needs
 * judgement is left as `<điền>` — lint reports errors until the agent fills it (MR-xx / Nguồn: … / Không áp dụng).
 * So the same 01 always yields the same skeleton: the number of questions no longer fluctuates with how many cells the model "comes up with".
 */
const fs = require('fs');
const path = require('path');
const { taskDir } = require('../lib/paths');
const S = require('../lib/schema');

const FILL = '<điền>';
const NA = 'Không áp dụng';

/** Which W is OPEN (needs judgement) for each object type; the rest are fixed as "Không áp dụng". QA_STANDARD §4. */
const APPLICABLE = {
  BR: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
  FD: ['W1', 'W3'],
  AF: ['W2', 'W6'],
};
const W = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];

function build(slug) {
  const dir = taskDir(slug);
  const p01 = path.join(dir, '01_requirement_risk_summary.md');
  if (!fs.existsSync(p01)) throw new Error(`OUTPUT/${slug}/01_requirement_risk_summary.md not found`);
  const d01 = S.read01(fs.readFileSync(p01, 'utf-8'));
  if (!d01 || d01.BR.length + d01.FD.length + d01.AF.length === 0) throw new Error('01 has no BR/FD/AF to build a matrix from');

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
  if (!slug || stage !== '02') { console.error('Usage: scaffold.js <slug> 02 [--stdout] [--force]   (only stage 02 is supported)'); process.exit(1); }
  let text;
  try { text = build(slug); } catch (e) { console.error(e.message); process.exit(1); }
  if (args.includes('--stdout')) { console.log(text); return; }
  const out = path.join(taskDir(slug), '02_missing_rule_report.md');
  if (fs.existsSync(out) && !args.includes('--force')) {
    console.error(`${path.relative(process.cwd(), out)} already exists — not overwritten (use --force if sure, or --stdout to preview the skeleton).`);
    process.exit(1);
  }
  fs.writeFileSync(out, text, 'utf-8');
  const rows = (text.match(/^\| (?:BR|FD|AF)-/gm) || []).length;
  console.log(`Built ${path.relative(process.cwd(), out)} — ${rows} matrix rows. Fill the ${FILL} cells, then run: npm run lint -- ${slug}`);
}

if (require.main === module) main();

module.exports = { build, APPLICABLE };

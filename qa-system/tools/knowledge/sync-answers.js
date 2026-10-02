#!/usr/bin/env node
/**
 * sync-answers.js — Chuyển câu trả lời của BA/PO từ `OUTPUT/` sang `knowledge/`.
 *
 * Lỗi phát hiện khi chạy trên bài voucher thật: 7 câu trả lời của BA (MR-01…MR-07)
 * chỉ nằm trong `02_missing_rule_report.md`. Theo `QA_STANDARD` §8 thì `OUTPUT/` là
 * kết quả một lần chạy, có thể bỏ đi — còn `knowledge/` mới là thứ tích luỹ được.
 * Để nguyên như vậy thì lần chạy sau sẽ phải đi hỏi lại BA đúng 7 câu đã được trả lời.
 *
 * Tool này bóc các dòng đã `Confirmed` trong bảng clarification của Chặng 2 và ghi
 * vào Mục 7 của `knowledge/features/<slug>.md`.
 *
 * Luật ghi (QA_STANDARD §8):
 *   - CHỈ thêm, không bao giờ sửa hay xoá dòng đã có trong knowledge.
 *   - Mã nào đã có trong knowledge thì bỏ qua, kể cả khi nội dung khác.
 *
 * Lệnh:
 *   node agents/tools/knowledge/sync-answers.js <slug>           Xem trước, không ghi
 *   node agents/tools/knowledge/sync-answers.js <slug> --write   Ghi thật
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, featureKnowledge } = require('../lib/paths');

const RESOLVED = /^(confirmed|rejected)$/i;

// ───────────────────── Bóc bảng ─────────────────────

/** Tách mọi bảng markdown trong văn bản thành { header[], rows[][] }. */
function tables(content) {
  const out = [];
  const lines = content.split('\n');
  let cur = null;

  const cells = (l) => l.trim().split('|').slice(1, -1).map((c) => c.trim());

  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith('|')) { if (cur) { out.push(cur); cur = null; } continue; }
    if (/^\|[\s:|-]+\|$/.test(t)) continue;          // dòng kẻ ---
    if (!cur) cur = { header: cells(line), rows: [] };
    else cur.rows.push(cells(line));
  }
  if (cur) out.push(cur);
  return out;
}

/** Bỏ markdown trang trí để so sánh và ghi lại cho sạch. */
const plain = (s) => (s || '').replace(/\*\*/g, '').replace(/`/g, '').trim();

/**
 * Tìm bảng clarification: bảng nào có cột chứa mã `MR-xx` và có cột trạng thái.
 * Nhận diện theo *nội dung* thay vì vị trí cột, vì tên cột giữa các lần chạy không đồng nhất.
 */
function extractAnswers(content) {
  const found = [];

  for (const tb of tables(content)) {
    const idCol = tb.header.findIndex((h) => /mã rule|rule id|^id$/i.test(plain(h)));
    const stateCol = tb.header.findIndex((h) => /trạng thái|status/i.test(plain(h)));
    if (idCol === -1 || stateCol === -1) continue;

    const qCol = tb.header.findIndex((h) => /câu hỏi/i.test(plain(h)));
    const aCol = tb.header.findIndex((h) => /phản hồi/i.test(plain(h)));
    const dCol = tb.header.findIndex((h) => /quyết định|đã chốt/i.test(plain(h)));
    const gCol = tb.header.findIndex((h) => /phân loại|nhóm/i.test(plain(h)));

    for (const r of tb.rows) {
      const id = plain(r[idCol]).toUpperCase();
      if (!/^MR-\d+$/.test(id)) continue;
      if (!RESOLVED.test(plain(r[stateCol]))) continue;

      found.push({
        id,
        group: gCol !== -1 ? plain(r[gCol]) : '',
        question: qCol !== -1 ? plain(r[qCol]) : '',
        answer: aCol !== -1 ? plain(r[aCol]) : '',
        decision: dCol !== -1 ? plain(r[dCol]) : '',
        state: plain(r[stateCol]),
      });
    }
  }

  // Một mã có thể xuất hiện ở nhiều bảng — giữ bản có nhiều thông tin nhất.
  const best = new Map();
  for (const a of found) {
    const score = (x) => [x.question, x.answer, x.decision].filter(Boolean).length;
    if (!best.has(a.id) || score(a) > score(best.get(a.id))) best.set(a.id, a);
  }
  return [...best.values()].sort((x, y) => x.id.localeCompare(y.id));
}

/**
 * Mô tả kẽ hở, lấy từ tiêu đề `### [MR-xx] <mô tả>` trong Chặng 2.
 * Chính xác hơn nhiều so với lấy lại nội dung quyết định.
 */
function gapDescriptions(content) {
  const m = new Map();
  for (const h of content.matchAll(/^###\s*\[(MR-\d+)\]\s*(.+)$/gm)) {
    m.set(h[1].toUpperCase(), plain(h[2]));
  }
  return m;
}

/**
 * Ánh xạ MR-xx → nhóm 06W, lấy từ bảng quét W1→W6 ở đầu Chặng 2.
 * Cột "Nhóm/Phân loại" của bảng clarification là phân loại kỹ thuật
 * (Authorization, Boundary & Edge…), KHÔNG phải mã W — không dùng thay được.
 */
function wGroups(content) {
  const m = new Map();
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    const w = t.match(/\bW([1-6])\b/);
    if (!w) continue;
    const name = t.match(/What if [^|*]+|Who else[^|*]+|What when[^|*]+|What happens[^|*]+/i);
    for (const id of t.matchAll(/\bMR-\d+\b/g)) {
      m.set(id[0].toUpperCase(), `W${w[1]}${name ? ` (${plain(name[0])})` : ''}`);
    }
  }
  return m;
}

/** Mã MR nào đã được ghi nhận trong file tri thức (bất kể Mục 7 hay Mục 8). */
function alreadyInKnowledge(content) {
  return new Set((content.match(/\bMR-\d+\b/g) || []).map((s) => s.toUpperCase()));
}

// ───────────────────── Ghi vào Mục 7 ─────────────────────

function buildRow(a) {
  // Không có dữ liệu cho một cột thì điền nhãn tường minh (QA_STANDARD §2.7),
  // tuyệt đối không nhồi nội dung của cột khác vào cho đầy.
  const cell = (v, fallback) => (v ? String(v).replace(/\|/g, '/') : fallback);
  return [
    '',
    a.id,
    cell(a.gap, cell(a.question, '—')),      // Mô tả kẽ hở — từ tiêu đề ### [MR-xx]
    cell(a.w, 'CHƯA XÁC ĐỊNH'),              // Nhóm 06W — từ bảng quét W1→W6
    'CHƯA XÁC ĐỊNH',                         // Mức rủi ro — Chặng 2 không ghi, không bịa
    cell(a.decision, '—'),                   // Đề xuất mặc định ← quyết định đã chốt
    cell(a.question, '—'),                   // Câu hỏi cho BA/PO
    cell(a.answer, '—'),                     // Phản hồi chính thức
    a.state,
    '',
  ].join(' | ').trim();
}

/** Chèn các dòng mới vào cuối bảng của Mục 7, giữ nguyên mọi thứ đã có. */
function insertIntoSection7(content, rows) {
  const lines = content.split('\n');
  const start = lines.findIndex((l) => /^##\s*7\./.test(l));
  if (start === -1) return null;

  let end = lines.slice(start + 1).findIndex((l) => /^##\s/.test(l));
  end = end === -1 ? lines.length : start + 1 + end;

  // Dòng bảng cuối cùng trong phạm vi Mục 7.
  let lastRow = -1;
  for (let i = start; i < end; i++) if (lines[i].trim().startsWith('|')) lastRow = i;
  if (lastRow === -1) return null;

  return [...lines.slice(0, lastRow + 1), ...rows, ...lines.slice(lastRow + 1)].join('\n');
}

// ───────────────────── Chạy ─────────────────────

function main() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const slug = args.find((a) => !a.startsWith('--'));

  if (!slug) {
    console.error('❌ Thiếu task-slug.\n   node agents/tools/knowledge/sync-answers.js <slug> [--write]');
    process.exit(1);
  }

  const reportPath = path.join(taskDir(slug), '02_missing_rule_report.md');
  if (!fs.existsSync(reportPath)) {
    console.error(`❌ Không có ${path.relative(PATHS.ROOT, reportPath)} — chưa chạy Chặng 2.`);
    process.exit(1);
  }

  const report = fs.readFileSync(reportPath, 'utf-8');
  const gaps = gapDescriptions(report);
  const ws = wGroups(report);
  const answers = extractAnswers(report).map((a) => ({ ...a, gap: gaps.get(a.id) || '', w: ws.get(a.id) || '' }));
  if (answers.length === 0) {
    console.log('ℹ️  Chặng 2 chưa có câu trả lời nào ở trạng thái Confirmed/Rejected — không có gì để đồng bộ.');
    process.exit(0);
  }

  const kPath = featureKnowledge(slug);
  let knowledge = fs.existsSync(kPath) ? fs.readFileSync(kPath, 'utf-8') : null;
  let created = false;

  if (knowledge === null) {
    const tpl = path.join(PATHS.KNOWLEDGE, '_template.md');
    if (!fs.existsSync(tpl)) { console.error(`❌ Không có ${path.relative(PATHS.ROOT, tpl)} để tạo file tri thức.`); process.exit(1); }
    // Bỏ MỌI dòng ví dụ của template (BR-xx, MR-xx ở bất kỳ mục nào).
    // Bản đầu chỉ lọc dòng `New` ở Mục 7, nên MR-03/MR-04 ví dụ ở Mục 8 lọt qua
    // và bị tính là "đã có trong knowledge" — khiến 2 câu trả lời thật bị bỏ sót.
    // File tri thức của một tính năng thật không được mang theo rule giả.
    knowledge = fs.readFileSync(tpl, 'utf-8')
      .split('\n')
      .filter((l) => {
        const t = l.trim();
        if (!t.startsWith('|')) return true;
        if (/^\|[\s:|-]+\|$/.test(t)) return true;        // dòng kẻ
        return !/\b(MR|BR)-\d+\b/.test(t) || /^\|\s*ID\s*\|/i.test(t); // giữ dòng tiêu đề
      })
      .join('\n');
    created = true;
  }

  const existing = alreadyInKnowledge(knowledge);
  const toAdd = answers.filter((a) => !existing.has(a.id));
  const skipped = answers.filter((a) => existing.has(a.id));

  console.log(`\n📋 Chặng 2 của [${slug}] có ${answers.length} câu đã chốt.`);
  if (skipped.length) console.log(`   ⏭️  ${skipped.length} mã đã có trong knowledge, bỏ qua: ${skipped.map((a) => a.id).join(', ')}`);

  if (toAdd.length === 0) {
    console.log('   ✅ Không có gì mới — tri thức đã đồng bộ.\n');
    process.exit(0);
  }

  console.log(`   ➕ ${toAdd.length} mã sẽ được thêm vào Mục 7:\n`);
  for (const a of toAdd) {
    console.log(`      ${a.id}  ${a.question.slice(0, 58)}`);
    console.log(`              ↳ ${a.decision.slice(0, 58)}`);
  }

  if (!write) {
    console.log(`\n   ℹ️  Đây là bản xem trước. Thêm \`--write\` để ghi thật vào ${path.relative(PATHS.ROOT, kPath)}\n`);
    process.exit(0);
  }

  const updated = insertIntoSection7(knowledge, toAdd.map(buildRow));
  if (updated === null) {
    console.error(`\n❌ Không tìm thấy bảng ở Mục 7 trong ${path.relative(PATHS.ROOT, kPath)} — không ghi gì cả.`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(kPath), { recursive: true });
  fs.writeFileSync(kPath, updated, 'utf-8');
  console.log(`\n   ✅ ${created ? 'Đã tạo' : 'Đã cập nhật'} ${path.relative(PATHS.ROOT, kPath)} — thêm ${toAdd.length} dòng, không sửa dòng nào có sẵn.\n`);
}

if (require.main === module) main();

module.exports = { extractAnswers };

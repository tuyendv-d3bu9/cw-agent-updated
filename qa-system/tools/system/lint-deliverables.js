#!/usr/bin/env node
/**
 * lint-deliverables.js — Kiểm chuẩn FACT của deliverable bằng máy.
 *
 * Vì sao cần: `AGENTS.md` §5 và `QA_STANDARD.md` đặt ra chuẩn rất chặt (8 trường,
 * Title bắt đầu bằng Verify/Validate/Confirm, Tags phải trích Rule# và Viewpoint#,
 * cấm placeholder, cấm ô bảng trống, quét đủ W1→W6). Nhưng thứ duy nhất kiểm tra
 * những chuẩn đó lại là `coverage-review` — tức LLM tự chấm bài của LLM.
 *
 * Tool này biến chuẩn thành điều kiện kiểm được: đọc deliverable, đối chiếu từng
 * luật, trả về lỗi có vị trí cụ thể. Chuẩn FACT từ chỗ "lời hứa" thành "ràng buộc".
 *
 * Lệnh:
 *   node agents/tools/system/lint-deliverables.js [slug]          Bảng lỗi
 *   node agents/tools/system/lint-deliverables.js [slug] --json   JSON cho CI
 *
 * Exit code: 0 = sạch (hoặc chỉ có cảnh báo) · 1 = có lỗi phải sửa
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, listTaskSlugs } = require('../lib/paths');

// ───────────────────── Luật ─────────────────────

/**
 * Các trường bắt buộc của một test case, KHÔNG kể `TC_ID` (nằm ở heading).
 *
 * Đọc trực tiếp từ bảng "Định dạng N trường bắt buộc" trong skill
 * `test-case-generation.md`, thay vì chép cứng ở đây. Lý do: khi ai đó nâng cấp
 * skill để thêm trường mới (ví dụ `Boundary Profile`), linter tự biết mà kiểm —
 * không im lặng bỏ qua trường vừa thêm. Skill là nguồn chân lý, linter chỉ thi hành.
 *
 * Không đọc được thì dùng danh sách dự phòng để linter vẫn chạy.
 */
const FALLBACK_FIELDS = ['Title', 'Precondition', 'Test Steps', 'Test Data', 'Expected Result', 'Priority', 'Tags'];

function loadFields() {
  const skill = path.join(PATHS.SYSTEM || PATHS.AGENTS, 'qa-test-design', 'skills', 'test-case-generation.md');
  if (!fs.existsSync(skill)) return FALLBACK_FIELDS;

  const text = fs.readFileSync(skill, 'utf-8');
  const section = text.split(/^##\s+Định dạng\s+\d+\s+trường bắt buộc/m)[1];
  if (!section) return FALLBACK_FIELDS;

  const fields = [];
  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const m = line.match(/^\|\s*`([^`]+)`\s*\|/);
    if (m && m[1] !== 'TC_ID') fields.push(m[1].trim());
    if (/^##\s/.test(line)) break;
  }
  return fields.length ? fields : FALLBACK_FIELDS;
}

// Cố tình KHÔNG tính ở đây. Đọc lúc nạp module nghĩa là linter không bao giờ
// thấy thay đổi của skill trong cùng tiến trình — vừa sai (nâng cấp skill xong
// chạy lint ngay thì vẫn dùng danh sách cũ) vừa không test được.
// `lint()` tự đọc lại mỗi lần chạy.
const TITLE_VERBS = /^(Verify|Validate|Confirm)\b/i;
const TC_ID_FORMAT = /^[A-Z][A-Z0-9]{1,5}-\d{3}$/;
const PRIORITIES = new Set(['high', 'medium', 'low', 'critical', 'blocker']);
const MAX_STEPS = 8;

/**
 * Dấu hiệu nội dung chưa điền.
 *
 * Phải giữ RẤT hẹp. Bản đầu bắt cả `<script>alert('XSS')</script>` (payload XSS
 * hợp lệ) và `SG-XXXXXX` (mô tả định dạng mã đơn) — linter kêu oan thì người ta
 * bỏ qua nó, đúng thứ làm hỏng mục đích của linter.
 *
 * Chỉ bắt đúng các cụm nguyên văn trong template của skill, và chỉ bắt ngoài
 * code span (dữ liệu test gần như luôn nằm trong backtick).
 */
const TEMPLATE_WORDS = 'hành động|giá trị|trạng thái|Tên trường|điều kiện|MODULE|Verify/Validate/Confirm';
const PLACEHOLDERS = [
  /\bTBD\b/i,
  /\bTODO\b/i,
  new RegExp(`\\[(?:${TEMPLATE_WORDS})[^\\]]*\\]`, 'i'),
  new RegExp(`<(?:${TEMPLATE_WORDS})[^>]*>`, 'i'),
];

/** Bỏ code span và code block trước khi soi placeholder. */
const stripCode = (t) => t.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');

/** Các deliverable phải có dòng meta `Owner: … · Verdict: …` (QA_STANDARD §7). */
const NEEDS_META = [
  '01_requirement_risk_summary.md',
  '02_missing_rule_report.md',
  '03_viewpoint_report.md',
  '04_test_idea_report.md',
  '05_test_case_spec.md',
  '06_coverage_review.md',
];

// ───────────────────── Hạ tầng báo lỗi ─────────────────────

function makeReporter() {
  const items = [];
  const add = (level) => (file, where, msg) => items.push({ level, file, where, msg });
  return { items, error: add('ERROR'), warn: add('WARN') };
}

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null);

// ───────────────────── A. Lint test case 8 trường ─────────────────────

function lintTestCases(dir, R, FIELDS) {
  // Lint cả spec tổng lẫn từng batch — lỗi có thể nằm ở batch chưa merge.
  const targets = [];
  const spec = path.join(dir, '05_test_case_spec.md');
  if (fs.existsSync(spec)) targets.push(spec);

  const batchDir = path.join(dir, 'testcases');
  if (fs.existsSync(batchDir)) {
    fs.readdirSync(batchDir)
      .filter((f) => /^batch_.*\.md$/.test(f))
      .sort()
      .forEach((f) => targets.push(path.join(batchDir, f)));
  }

  if (targets.length === 0) {
    R.warn('05_test_case_spec.md', '-', 'Chưa có test case nào (thiếu cả spec tổng lẫn testcases/batch_*.md)');
    return 0;
  }

  // Tách phạm vi: batch_*.md là NGUỒN được gộp VÀO 05_test_case_spec.md,
  // nên trùng ID giữa hai bên là đúng. Chỉ soi trùng trong cùng một phạm vi.
  const seenBy = { spec: new Map(), batch: new Map() };
  let specCount = 0;
  let batchCount = 0;

  for (const file of targets) {
    const rel = path.relative(dir, file);
    const content = read(file);
    const scope = rel.startsWith('testcases/') ? 'batch' : 'spec';
    const seen = seenBy[scope];

    for (const sec of content.split(/\n(?=###\s+TC_ID:)/g)) {
      const idm = sec.match(/###\s+TC_ID:\s*(\S+)/);
      if (!idm) continue;
      if (scope === 'spec') specCount++; else batchCount++;

      const id = idm[1].trim();

      if (!TC_ID_FORMAT.test(id)) {
        R.error(rel, id, `TC_ID sai định dạng — phải là [MODULE]-[001], ví dụ VCHR-001`);
      }
      if (seen.has(id)) {
        R.error(rel, id, `TC_ID trùng với ${seen.get(id)} (cùng phạm vi ${scope})`);
      } else {
        seen.set(id, rel);
      }

      // 7 trường còn lại (TC_ID là trường thứ 8, đã lấy ở heading)
      const values = {};
      // Điểm dừng là BẤT KỲ trường nào khác, không phải riêng trường kế tiếp.
      // Nếu chỉ chặn ở trường kế tiếp thì khi trường đó vắng mặt, trường đang xét
      // cũng bị báo thiếu theo — một lỗi dây chuyền báo oan.
      const anyField = FIELDS.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      for (const f of FIELDS) {
        const esc = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const stop = `(?=\\n-\\s+\\*\\*(?:${anyField})\\*\\*:|\\n###|$)`;
        const m = sec.match(new RegExp(`-\\s+\\*\\*${esc}\\*\\*:\\s*([\\s\\S]*?)${stop}`));
        const v = m ? m[1].trim() : null;
        values[f] = v;

        if (v === null) R.error(rel, id, `Thiếu trường \`${f}\``);
        else if (v === '') R.error(rel, id, `Trường \`${f}\` bỏ trống`);
      }

      // Title phải mở đầu bằng động từ quy chuẩn
      if (values.Title && !TITLE_VERBS.test(values.Title)) {
        R.error(rel, id, `Title phải bắt đầu bằng Verify / Validate / Confirm — đang là "${values.Title.slice(0, 40)}…"`);
      }

      // Test Steps: đánh số và không quá MAX_STEPS
      if (values['Test Steps']) {
        const steps = values['Test Steps'].split('\n').filter((l) => /^\s*\d+\./.test(l));
        if (steps.length === 0) {
          R.error(rel, id, 'Test Steps chưa đánh số 1. 2. 3.…');
        } else if (steps.length > MAX_STEPS) {
          R.warn(rel, id, `Test Steps có ${steps.length} bước, vượt mức khuyến nghị ${MAX_STEPS} — cân nhắc tách test case`);
        }
      }

      // Priority trong tập cho phép
      if (values.Priority && !PRIORITIES.has(values.Priority.toLowerCase().replace(/\*/g, '').trim())) {
        R.error(rel, id, `Priority "${values.Priority}" không thuộc High / Medium / Low`);
      }

      // Tags bắt buộc trích Rule# và Viewpoint# (QA_STANDARD: traceability)
      if (values.Tags) {
        // Chấp nhận mọi mã có cấu trúc `PREFIX-xxx`, không riêng `BR-<số>`.
        // QA_STANDARD §2.4 chỉ đòi trace được về "mã BR-xx / MR-xx / mục tài liệu";
        // thực tế có lượt chạy dùng `Rule#GAP-H2` cho kẽ hở đã chốt ở Mục 7/8 của
        // file tri thức — trace được đầy đủ. Ép đúng `BR-<số>` là báo oan.
        if (!/Rule#[A-Za-z]+-[A-Za-z0-9]+/.test(values.Tags)) {
          R.error(rel, id, 'Tags thiếu `Rule#<mã>` — không trace được về quy tắc hay kẽ hở nghiệp vụ nào');
        }
        if (!/Viewpoint#\S+/.test(values.Tags)) R.error(rel, id, 'Tags thiếu `Viewpoint#VP-xx` — không trace được về viewpoint');
        if (!/Module#\S+/.test(values.Tags)) R.warn(rel, id, 'Tags thiếu `Module#` — khó lọc khi import vào Test Management Tool');
      }

      // Placeholder còn sót ở các trường phải tường minh
      for (const f of ['Title', 'Test Data', 'Expected Result']) {
        const v = values[f];
        if (!v) continue;
        const hit = PLACEHOLDERS.find((re) => re.test(stripCode(v)));
        if (hit) R.error(rel, id, `Trường \`${f}\` còn nội dung chưa điền (khớp ${hit}) — chuẩn FACT cấm placeholder`);
      }
    }
  }

  // Spec tổng là nguồn chuẩn; chưa merge thì mới đếm theo batch.
  return specCount || batchCount;
}

// ───────────────────── B. Dòng meta Owner/Verdict ─────────────────────

function lintMeta(dir, R) {
  // Khớp rộng có chủ đích:
  //  - `**Verdict Chặng 1**:` và `**VERDICT CHẶNG 3**:` đều là Verdict hợp lệ
  //  - thực tế repo dùng `Chuyên gia thực hiện` thay cho `Owner`
  // Linter báo "thiếu" một thứ đang có sẽ khiến người ta đi tìm vô ích, rồi mất
  // lòng tin vào linter — hỏng đúng mục đích của nó.
  const HAS_VERDICT = /\*{0,2}\s*Verdict[^:\n*]{0,30}\*{0,2}\s*:/i;
  const HAS_OWNER = /\*{0,2}\s*(Owner|Chuyên gia thực hiện)\*{0,2}\s*:/i;
  const TOP_LINES = 10;

  for (const name of NEEDS_META) {
    const content = read(path.join(dir, name));
    if (content === null) continue; // chưa chạy chặng đó — không phải lỗi

    const lines = content.split('\n');
    const head = lines.slice(0, TOP_LINES).join('\n');

    // Ba trạng thái tách bạch: ở đầu file (đạt) · có nhưng ở xa (lệch chuẩn) · không có (lỗi)
    for (const [label, re] of [['Verdict', HAS_VERDICT], ['Owner', HAS_OWNER]]) {
      if (re.test(head)) continue;

      const at = lines.findIndex((l) => re.test(l));
      if (at === -1) {
        const level = label === 'Verdict' ? R.error : R.warn;
        level(name, 'dòng meta', `Không có \`${label}:\` ở bất kỳ đâu trong file (QA_STANDARD §7)`);
      } else {
        R.warn(name, `dòng ${at + 1}`, `\`${label}:\` nằm ở dòng ${at + 1} thay vì trong ${TOP_LINES} dòng đầu — agent phía sau đọc dòng meta ở đầu file sẽ không thấy`);
      }
    }
  }
}

// ───────────────────── C. Quét đủ 06W ─────────────────────

function lint06W(dir, R) {
  const name = '02_missing_rule_report.md';
  const content = read(path.join(dir, name));
  if (content === null) return;

  const missing = [];
  for (let i = 1; i <= 6; i++) {
    if (!new RegExp(`\\bW${i}\\b`).test(content)) missing.push(`W${i}`);
  }
  if (missing.length) {
    R.error(name, '06W', `Chưa quét ${missing.join(', ')} — QA_STANDARD §4 bắt buộc đủ W1→W6, câu nào không ra vấn đề vẫn phải ghi "Không phát hiện vấn đề qua câu hỏi #Wx"`);
  }
}

// ───────────────────── D. Ô bảng để trống ─────────────────────

function lintEmptyCells(dir, R) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter((f) => /^\d{2}[a-z]?_.*\.md$/.test(f));

  for (const name of files) {
    const lines = read(path.join(dir, name)).split('\n');
    let empties = 0;
    let firstLine = 0;

    lines.forEach((line, i) => {
      const t = line.trim();
      if (!t.startsWith('|') || /^\|[\s:|-]+\|$/.test(t)) return;
      const cells = t.split('|').slice(1, -1);
      if (cells.length < 2) return;
      if (cells.some((c) => c.trim() === '')) {
        empties++;
        if (!firstLine) firstLine = i + 1;
      }
    });

    if (empties) {
      R.warn(name, `dòng ${firstLine}`, `${empties} dòng bảng có ô để trống — QA_STANDARD §2.7 yêu cầu điền nhãn tường minh (CHƯA COVER / CHƯA CÓ DATA / [CONTEXT_MISSING])`);
    }
  }
}

// ───────────────────── Chạy ─────────────────────

function lint(slug) {
  const dir = taskDir(slug);
  if (!fs.existsSync(dir)) throw new Error(`Không có OUTPUT/${slug}/`);

  const R = makeReporter();
  const totalCases = lintTestCases(dir, R, loadFields());
  lintMeta(dir, R);
  lint06W(dir, R);
  lintEmptyCells(dir, R);

  const errors = R.items.filter((i) => i.level === 'ERROR');
  const warns = R.items.filter((i) => i.level === 'WARN');
  return { slug, totalCases, errors, warns, clean: errors.length === 0 };
}

function render(r) {
  const line = '─'.repeat(67);
  console.log(`\n${line}`);
  console.log(`  LINT DELIVERABLE · task [ ${r.slug} ]   ·   ${r.totalCases} test case`);
  console.log(line);

  if (r.clean && r.warns.length === 0) {
    console.log('  ✅ Sạch — đạt chuẩn 8 trường, meta, 06W, không ô bảng trống.');
    console.log(`${line}\n`);
    return;
  }

  const show = (items, icon, title) => {
    if (!items.length) return;
    console.log(`\n  ${icon} ${items.length} ${title}:`);
    // Gom theo file cho dễ đọc khi số lượng lớn.
    const byFile = items.reduce((m, i) => ((m[i.file] = m[i.file] || []).push(i), m), {});
    for (const [file, list] of Object.entries(byFile)) {
      console.log(`\n     ${file}`);
      list.slice(0, 15).forEach((i) => console.log(`       • [${i.where}] ${i.msg}`));
      if (list.length > 15) console.log(`       … và ${list.length - 15} mục nữa`);
    }
  };

  show(r.errors, '❌', 'LỖI phải sửa');
  show(r.warns, '⚠️ ', 'cảnh báo');
  console.log(`\n${line}\n`);
}

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  let slug = args.find((a) => !a.startsWith('--'));

  const slugs = slug ? [slug] : listTaskSlugs();
  if (slugs.length === 0) {
    console.log('ℹ️  OUTPUT/ chưa có task nào để kiểm.');
    process.exit(0);
  }

  const results = slugs.map(lint);
  if (asJson) console.log(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
  else results.forEach(render);

  process.exit(results.some((r) => !r.clean) ? 1 : 0);
}

if (require.main === module) main();

module.exports = { lint };

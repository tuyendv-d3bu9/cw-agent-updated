#!/usr/bin/env node
/**
 * gate.js — Cổng Bức Tường Thép: chặn cứng chặng 03→06 khi Verdict còn `ASK`.
 *
 * Vì sao cần tool này: AGENTS.md §1.6 và QA_STANDARD §1 đã viết luật rất gắt,
 * nhưng luật viết bằng văn bản chỉ là *xác suất* — model vẫn có thể bị thuyết phục
 * bởi câu "cứ làm tiếp đi". Tool này biến luật đó thành *điều kiện kiểm được bằng máy*.
 *
 * Ba lớp bảo vệ:
 *   Lớp 1 — tool này: trả exit code, ai gọi cũng biết cổng đang mở hay đóng.
 *   Lớp 2 — hook PreToolUse trong .claude/settings.json: chặn thẳng thao tác ghi file.
 *   Lớp 3 — `--audit`: phát hiện deliverable 03→06 đã bị sinh ra trong lúc cổng còn khoá.
 *
 * Lệnh:
 *   node agents/tools/system/gate.js check [slug]     Kiểm tra cổng (exit 0 mở / 1 đóng)
 *   node agents/tools/system/gate.js check --json     Trả JSON cho hook / CI
 *   node agents/tools/system/gate.js audit [slug]     Soát dấu vết nhảy cóc (exit 2 nếu có)
 *   node agents/tools/system/gate.js explain [slug]   In danh sách câu hỏi đang treo
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, featureKnowledge, listTaskSlugs } = require('../lib/paths');

/** Deliverable bị khoá khi cổng đóng — chặng 3 trở đi. */
const LOCKED_DELIVERABLES = [
  '03_viewpoint_report.md',
  '04_test_idea_report.md',
  '05_test_case_spec.md',
  '05_test_blueprint.json',
  '06_coverage_review.md',
];

/** Trạng thái coi là đã giải quyết trong Mục 7. Mọi giá trị khác đều chặn. */
const RESOLVED_STATES = new Set(['confirmed', 'rejected']);

const LOCK_FILE = '_gate.lock';

// ───────────────────── Bóc tách dữ liệu ─────────────────────

/** Tách các dòng bảng markdown thành mảng ô, bỏ dòng tiêu đề và dòng kẻ. */
function tableRows(section) {
  const rows = [];
  for (const line of section.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    if (/^\|[\s:|-]+\|$/.test(t)) continue; // dòng kẻ ---
    rows.push(t.split('|').slice(1, -1).map((c) => c.trim()));
  }
  return rows;
}

/**
 * Lấy nội dung một mục `## N. ...` trong file tri thức.
 *
 * Tách theo heading thay vì dùng một regex có lookahead: mục cuối file không có
 * heading nào đứng sau, nên cách lookahead sẽ âm thầm trả về rỗng — mà Mục 8
 * (giả định đã chốt) lại thường nằm cuối, chính là đường mở khoá.
 */
function section(content, num) {
  const lines = content.split('\n');
  const head = new RegExp(`^##\\s*${num}\\.`);
  const anyHead = /^##\s/;

  const start = lines.findIndex((l) => head.test(l));
  if (start === -1) return '';

  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => anyHead.test(l));
  return (end === -1 ? rest : rest.slice(0, end)).join('\n');
}

/**
 * Đọc Mục 7 (câu hỏi mở) và Mục 8 (giả định đã chốt) của `knowledge/features/<slug>.md`.
 * Trả về danh sách câu hỏi còn treo.
 */
function readOpenQuestions(slug) {
  const kPath = featureKnowledge(slug);
  if (!fs.existsSync(kPath)) {
    return { exists: false, path: kPath, pending: [], resolved: [] };
  }

  const content = fs.readFileSync(kPath, 'utf-8');

  // Mục 8: mọi mã đã có quyết định chính thức đều coi là đã mở khoá.
  const decided = new Set();
  for (const cells of tableRows(section(content, 8))) {
    const code = (cells[1] || '').replace(/`/g, '').trim();
    const decision = (cells[3] || '').trim();
    if (/^(MR|BR)-\w+/i.test(code) && decision && !/^[-–—]?$/.test(decision)) {
      decided.add(code.toUpperCase());
    }
  }

  const pending = [];
  const resolved = [];
  for (const cells of tableRows(section(content, 7))) {
    const id = (cells[0] || '').replace(/`/g, '').trim();
    if (!/^MR-\w+/i.test(id)) continue;

    const question = cells[5] || '(không ghi câu hỏi)';
    const answer = (cells[6] || '').trim();
    const state = (cells[7] || '').trim().toLowerCase();

    const isResolved =
      RESOLVED_STATES.has(state) ||
      decided.has(id.toUpperCase()) ||
      (answer && !/^[-–—]?$/.test(answer));

    (isResolved ? resolved : pending).push({
      id: id.toUpperCase(),
      question,
      risk: cells[3] || '',
      state: cells[7] || '(trống)',
    });
  }

  return { exists: true, path: kPath, pending, resolved };
}

/** Chặng 2 có ra Verdict ASK không. */
function verdictAsk(slug) {
  const p = path.join(taskDir(slug), '02_missing_rule_report.md');
  if (!fs.existsSync(p)) return { exists: false, ask: false, path: p };
  const c = fs.readFileSync(p, 'utf-8');
  return { exists: true, ask: /Verdict:\s*ASK/i.test(c) || /\|\s*ASK\s*\|/.test(c), path: p };
}

// ───────────────────── Đánh giá cổng ─────────────────────

function evaluate(slug) {
  const questions = readOpenQuestions(slug);
  const verdict = verdictAsk(slug);

  const reasons = [];
  if (verdict.ask) {
    reasons.push(`Chặng 2 ra \`Verdict: ASK\` tại ${path.relative(PATHS.ROOT, verdict.path)}`);
  }
  if (questions.pending.length > 0) {
    reasons.push(
      `${questions.pending.length} câu hỏi Mục 7 chưa có phản hồi chính thức ` +
        `(${questions.pending.map((q) => q.id).join(', ')})`
    );
  }
  if (verdict.ask && !questions.exists) {
    reasons.push(`Chưa có file tri thức ${path.relative(PATHS.ROOT, questions.path)} để ghi nhận câu trả lời`);
  }

  // ─── Cảnh báo (KHÔNG chặn): câu trả lời của BA bị kẹt trong OUTPUT/ ───
  //
  // `QA_STANDARD` §8: `OUTPUT/` là kết quả một lần chạy, có thể bỏ đi;
  // `knowledge/` mới là thứ tích luỹ được. Nếu Chặng 2 đã PASS nhờ BA trả lời
  // nhưng câu trả lời chỉ nằm trong `02_missing_rule_report.md`, thì lần chạy sau
  // sẽ hỏi lại BA đúng những câu đó — mất đúng thứ `knowledge/` sinh ra để giữ.
  const advisories = [];
  if (verdict.exists && !verdict.ask) {
    const text = fs.readFileSync(verdict.path, 'utf-8');
    const mrInReport = [...new Set(text.match(/\bMR-\d+\b/g) || [])].map((s) => s.toUpperCase());
    const recorded = new Set([...questions.pending, ...questions.resolved].map((q) => q.id));
    const unrecorded = mrInReport.filter((id) => !recorded.has(id));

    if (unrecorded.length) {
      advisories.push(
        `${unrecorded.length} kẽ hở (${unrecorded.join(', ')}) đã được chốt ở Chặng 2 nhưng ` +
          `CHƯA ghi vào ${path.relative(PATHS.ROOT, questions.path)}. ` +
          `OUTPUT/ là đồ bỏ đi — lần chạy sau sẽ phải hỏi lại BA đúng những câu này.`
      );
    }
  }

  return {
    slug,
    blocked: reasons.length > 0,
    reasons,
    advisories,
    pending: questions.pending,
    resolvedCount: questions.resolved.length,
    knowledgePath: path.relative(PATHS.ROOT, questions.path),
  };
}

/** Ghi hoặc gỡ `_gate.lock` cho khớp trạng thái thực tế. */
function writeLock(state) {
  const dir = taskDir(state.slug);
  if (!fs.existsSync(dir)) return null;
  const lockPath = path.join(dir, LOCK_FILE);

  if (!state.blocked) {
    if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
    return null;
  }

  // Giữ nguyên thời điểm khoá lần đầu để `audit` so sánh mốc thời gian được.
  let lockedAt = new Date().toISOString();
  if (fs.existsSync(lockPath)) {
    try {
      lockedAt = JSON.parse(fs.readFileSync(lockPath, 'utf-8')).lockedAt || lockedAt;
    } catch {
      /* file hỏng thì ghi đè bằng mốc mới */
    }
  }

  fs.writeFileSync(
    lockPath,
    JSON.stringify(
      {
        slug: state.slug,
        lockedAt,
        updatedAt: new Date().toISOString(),
        reasons: state.reasons,
        pending: state.pending,
        lockedDeliverables: LOCKED_DELIVERABLES,
        unlock:
          'Trả lời câu hỏi vào Mục 7 (cột "Phản hồi chính thức" + Trạng thái=Confirmed) ' +
          'HOẶC ghi quyết định nghiệp vụ vào Mục 8 của ' + state.knowledgePath,
      },
      null,
      2
    ),
    'utf-8'
  );
  return lockPath;
}

/** Lớp 3 — soát xem có deliverable nào bị sinh ra sau thời điểm khoá không. */
function audit(slug) {
  const dir = taskDir(slug);
  const lockPath = path.join(dir, LOCK_FILE);
  if (!fs.existsSync(lockPath)) return { violations: [], hadLock: false };

  let lockedAt;
  try {
    lockedAt = new Date(JSON.parse(fs.readFileSync(lockPath, 'utf-8')).lockedAt);
  } catch {
    return { violations: [], hadLock: true, corrupt: true };
  }

  const violations = [];
  for (const name of LOCKED_DELIVERABLES) {
    const p = path.join(dir, name);
    if (!fs.existsSync(p)) continue;
    const mtime = fs.statSync(p).mtime;
    if (mtime >= lockedAt) {
      violations.push({ file: name, createdAt: mtime.toISOString() });
    }
  }
  return { violations, hadLock: true, lockedAt: lockedAt.toISOString() };
}

// ───────────────────── In ra màn hình ─────────────────────

function printState(state, lockPath) {
  const line = '─'.repeat(63);
  console.log(`\n${line}`);
  console.log(`  CỔNG ASK · task [ ${state.slug} ]`);
  console.log(line);

  if (!state.blocked) {
    console.log(`  ✅ CỔNG MỞ — được phép chạy chặng 3 → 6.`);
    if (state.resolvedCount) console.log(`  ${state.resolvedCount} câu hỏi đã được chốt.`);
    state.advisories.forEach((a) => console.log(`\n  ⚠️  TRI THỨC CÓ NGUY CƠ MẤT: ${a}`));
    console.log(`${line}\n`);
    return;
  }

  console.log(`  ⛔ CỔNG ĐÓNG — CẤM sinh chặng 3 → 6.\n`);
  console.log(`  Lý do:`);
  state.reasons.forEach((r, i) => console.log(`    ${i + 1}. ${r}`));

  if (state.pending.length) {
    console.log(`\n  Câu hỏi đang treo:`);
    for (const q of state.pending) {
      console.log(`    • [${q.id}] (rủi ro ${q.risk || 'n/a'}) ${q.question}`);
    }
  }

  state.advisories.forEach((a) => console.log(`\n  ⚠️  TRI THỨC CÓ NGUY CƠ MẤT: ${a}`));

  console.log(`\n  Cách mở khoá — chọn MỘT:`);
  console.log(`    (1) BA/PO trả lời → ghi vào Mục 7 cột "Phản hồi chính thức",`);
  console.log(`        đổi Trạng thái sang Confirmed.`);
  console.log(`    (2) Chốt quyết định nghiệp vụ tường minh → ghi vào Mục 8.`);
  console.log(`    File: ${state.knowledgePath}`);
  console.log(`\n  ⚠️  Câu "cứ làm tiếp đi" KHÔNG mở được cổng này.`);
  console.log(`      Test case sinh trên nền nghiệp vụ hổng là ảo giác 100%.`);
  if (lockPath) console.log(`\n  Khoá: ${path.relative(PATHS.ROOT, lockPath)}`);
  console.log(`${line}\n`);
}

// ───────────────────── CLI ─────────────────────

function resolveSlugs(arg) {
  if (arg && !arg.startsWith('--')) return [arg];
  const all = listTaskSlugs();
  if (all.length === 0) {
    console.log('ℹ️  OUTPUT/ chưa có task nào — không có cổng để kiểm tra.');
    process.exit(0);
  }
  return all;
}

function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] && !args[0].startsWith('--') ? args[0] : 'check';
  const slugArg = args.find((a, i) => i > 0 && !a.startsWith('--'));
  const asJson = args.includes('--json');

  const slugs = resolveSlugs(slugArg);
  let worstExit = 0;
  const payload = [];

  for (const slug of slugs) {
    const state = evaluate(slug);
    const lockPath = writeLock(state);

    if (cmd === 'audit') {
      const a = audit(slug);
      const entry = { ...state, audit: a };
      payload.push(entry);
      if (!asJson) {
        if (a.violations.length) {
          console.log(`\n🚨 [${slug}] PHÁT HIỆN NHẢY CÓC — ${a.violations.length} file sinh ra khi cổng còn khoá:`);
          a.violations.forEach((v) => console.log(`   • ${v.file}  (ghi lúc ${v.createdAt}, khoá từ ${a.lockedAt})`));
          console.log(`   → Các file này dựa trên nghiệp vụ chưa chốt. Phải rà lại hoặc sinh lại sau khi mở cổng.`);
        } else if (a.hadLock) {
          console.log(`✅ [${slug}] Cổng đang khoá và chưa có deliverable nào bị sinh vượt rào.`);
        } else {
          console.log(`✅ [${slug}] Không có khoá nào đang hiệu lực.`);
        }
      }
      if (a.violations.length) worstExit = Math.max(worstExit, 2);
      continue;
    }

    payload.push(state);
    if (!asJson) printState(state, lockPath);
    if (state.blocked) worstExit = Math.max(worstExit, 1);
  }

  if (asJson) console.log(JSON.stringify(slugs.length === 1 ? payload[0] : payload, null, 2));
  process.exit(worstExit);
}

if (require.main === module) main();

module.exports = { evaluate, audit, LOCKED_DELIVERABLES };

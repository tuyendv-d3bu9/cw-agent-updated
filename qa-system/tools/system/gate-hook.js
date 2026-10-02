#!/usr/bin/env node
/**
 * gate-hook.js — Cầu nối giữa Claude Code PreToolUse hook và `gate.js`.
 *
 * Đây là **lớp 2** của Bức Tường Thép. Khác với luật viết trong AGENTS.md,
 * lớp này do harness thi hành: model không "nói chuyện" được với nó.
 *
 * Luồng: harness đẩy JSON vào stdin → script xác định file bị ghi có thuộc
 * chặng 3→6 không → nếu có thì hỏi gate.js → cổng đóng thì trả quyết định `deny`.
 *
 * Hành vi an toàn: mọi lỗi ngoài dự kiến đều **cho qua** (fail-open).
 * Hook này để chặn việc nhảy cóc, không phải để làm kẹt phiên làm việc.
 */

const path = require('path');
const { PATHS } = require('../lib/paths');
const { evaluate, LOCKED_DELIVERABLES } = require('./gate');

/** Cho qua, không nói gì thêm. */
function allow() {
  process.stdout.write('{}');
  process.exit(0);
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

/**
 * Nhận diện file thuộc chặng bị khoá.
 * Trả `{ slug, file }` hoặc null nếu không liên quan.
 */
function classify(filePath) {
  if (!filePath) return null;

  const abs = path.resolve(filePath);
  const rel = path.relative(PATHS.OUTPUT, abs);

  // Nằm ngoài OUTPUT/ thì không phải việc của cổng này.
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;

  const parts = rel.split(path.sep);
  if (parts.length < 2) return null;

  const [slug, ...rest] = parts;
  if (slug.startsWith('_')) return null; // OUTPUT/_template_run, OUTPUT/_upgrades...

  const fileName = rest[rest.length - 1];
  if (!LOCKED_DELIVERABLES.includes(fileName)) return null;

  // testcases/batch_*.md cũng thuộc chặng 5, nhưng tên file nằm trong thư mục con —
  // LOCKED_DELIVERABLES đã liệt kê tên file gốc nên nhánh này chỉ bắt file ở gốc task.
  return { slug, file: fileName };
}

function main() {
  let raw = '';
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', (c) => (raw += c));
  process.stdin.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(raw || '{}');
    } catch {
      return allow(); // không đọc được thì không chặn
    }

    const filePath = payload?.tool_input?.file_path;
    const target = classify(filePath);
    if (!target) return allow();

    let state;
    try {
      state = evaluate(target.slug);
    } catch {
      return allow(); // gate lỗi thì không làm kẹt người dùng
    }

    if (!state.blocked) return allow();

    const questions = state.pending
      .map((q) => `  • [${q.id}] ${q.question}`)
      .join('\n');

    deny(
      [
        `⛔ CỔNG ASK ĐANG ĐÓNG — không được ghi ${target.file} cho task "${target.slug}".`,
        ``,
        `Lý do:`,
        ...state.reasons.map((r) => `  - ${r}`),
        questions ? `\nCâu hỏi chưa được trả lời:\n${questions}` : '',
        ``,
        `Đây là chặn ở tầng harness, không phải model tự quyết. Nó KHÔNG mở được bằng`,
        `câu "cứ làm tiếp đi". Hãy trình bày các câu hỏi trên cho người dùng và chờ:`,
        `  (1) BA/PO trả lời → ghi vào Mục 7 của ${state.knowledgePath}, Trạng thái = Confirmed`,
        `  (2) HOẶC quyết định nghiệp vụ tường minh → ghi vào Mục 8 của file đó`,
        ``,
        `Sinh test case trên nền nghiệp vụ chưa chốt là ảo giác, không dùng nghiệm thu được.`,
      ]
        .filter((l) => l !== '')
        .join('\n')
    );
  });
}

main();

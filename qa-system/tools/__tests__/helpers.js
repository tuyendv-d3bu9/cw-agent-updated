/**
 * helpers.js — Tiện ích dựng dự án giả cho test.
 *
 * Phần lớn tool đọc/ghi theo `lib/paths.js`, vốn neo vào thư mục gốc repo.
 * Để test không đụng vào dữ liệu thật, mỗi ca dựng một thư mục tạm có đúng
 * hình dáng dự án (`OUTPUT/`, `knowledge/features/`) rồi trỏ `PATHS` vào đó.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { PATHS } = require('../lib/paths');

/** Giữ giá trị gốc để khôi phục sau mỗi ca. */
const ORIGINAL = { ...PATHS };

/**
 * Dựng dự án giả trong thư mục tạm và trỏ PATHS vào đó.
 * Trả về hàm dọn dẹp — ca test nào cũng phải gọi, kể cả khi fail.
 */
function useTempProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-agent-test-'));

  Object.assign(PATHS, {
    ROOT: root,
    INPUT: path.join(root, 'INPUT'),
    OUTPUT: path.join(root, 'OUTPUT'),
    KNOWLEDGE: path.join(root, 'knowledge'),
    FEATURES: path.join(root, 'knowledge', 'features'),
    SYSTEM: path.join(root, 'qa-system'),
    AGENTS: path.join(root, 'qa-system'),
    TOOLS: path.join(root, 'qa-system', 'tools'),
    TEMPLATES: path.join(root, 'qa-system', 'templates'),
    AUTOMATION: path.join(root, 'automation'),
    SYSTEM_MAP: path.join(root, 'knowledge', '_system_map.json'),
    ENV_FILE: path.join(root, '.env'),
  });

  for (const d of [PATHS.INPUT, PATHS.OUTPUT, PATHS.FEATURES]) {
    fs.mkdirSync(d, { recursive: true });
  }

  return {
    root,
    cleanup() {
      Object.assign(PATHS, ORIGINAL);
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

/** Ghi một file trong dự án giả, tự tạo thư mục cha. */
function write(relPath, content) {
  const full = path.join(PATHS.ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf-8');
  return full;
}

/** Dựng một test case 8 trường đúng chuẩn, cho phép ghi đè từng trường. */
function testCase(id, over = {}) {
  const f = {
    Title: `Verify ${id} chạy đúng`,
    Precondition: '\n  - Đã đăng nhập',
    'Test Steps': '\n  1. Bấm nút',
    'Test Data': '\n  - Mã: `ABC`',
    'Expected Result': '\n  - Hiển thị thành công',
    Priority: 'High',
    Tags: 'Rule#BR-01, Viewpoint#VP-01, Module#TST, Manual',
    ...over,
  };
  const body = Object.entries(f)
    .filter(([, v]) => v !== null)
    .map(([k, v]) => `- **${k}**:${String(v).startsWith('\n') ? '' : ' '}${v}`)
    .join('\n');
  return `### TC_ID: ${id}\n${body}\n`;
}

/** File spec hoàn chỉnh gồm dòng meta và các test case. */
function spec(cases, meta = 'Owner: qa-test-design · Verdict: PASS') {
  return `# Test Case Spec\n${meta}\n\n${cases.join('\n')}`;
}

module.exports = { useTempProject, write, testCase, spec, PATHS };

#!/usr/bin/env node
/**
 * init.js — Scaffolds a whole project in one command.
 *
 *   stepInput / stepOutput / stepKnowledge / stepAutomation  Create each area.
 *   stepInstall()  Install dependencies and the Playwright browser.
 *
 * Users are QA/BA/PO. Dropping this agent system into a new project, they do not
 * know to hand-create INPUT/ with its five bins, OUTPUT/, knowledge/ from the
 * templates, or automation/ with a Playwright config. Miss one and the system
 * half-runs, then fails with an opaque error.
 *
 * Materialises everything from `qa-system/templates/`, installs dependencies and
 * self-checks. Idempotent: it only ever adds what is missing and NEVER overwrites.
 *
 * Printed output stays in Vietnamese on purpose — this command is read by the user.
 *
 * Usage:
 *   init.js                Scaffold, install, self-check
 *   init.js --dry-run      List what would happen, touch nothing
 *   init.js --no-install   Skip dependency installation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PATHS } = require('../lib/paths');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const noInstall = args.includes('--no-install');

const W = 68;
const line = (c = '─') => c.repeat(W);

const created = [];
const skipped = [];

// ───────────────────── Filesystem helpers ─────────────────────

const rel = (p) => path.relative(PATHS.ROOT, p) || '.';

function ensureDir(p, note = '') {
  if (fs.existsSync(p)) { skipped.push(rel(p) + '/'); return false; }
  if (!dryRun) fs.mkdirSync(p, { recursive: true });
  created.push({ what: rel(p) + '/', note });
  return true;
}

/** Copies only when the destination is absent. Never overwrites. */
function ensureFile(src, dest, note = '') {
  if (fs.existsSync(dest)) { skipped.push(rel(dest)); return false; }
  if (!dryRun) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
  created.push({ what: rel(dest), note });
  return true;
}

function writeFile(dest, content, note = '') {
  if (fs.existsSync(dest)) { skipped.push(rel(dest)); return false; }
  if (!dryRun) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content, 'utf-8');
  }
  created.push({ what: rel(dest), note });
  return true;
}

// ───────────────────── Signpost content (user-facing) ─────────────────────

const INPUT_README = `# INPUT/ — Tài liệu nguồn · **CỦA BẠN**

Kéo thả tài liệu của BA vào đây (\`.docx\` \`.pdf\` \`.xlsx\` \`.md\`…), rồi nói với agent:

> *"Tôi vừa bỏ tài liệu vào INPUT, xử lý giúp"*

Agent tự chuyển sang Markdown sạch, phân vào 5 ngăn, và dựng sẵn khung làm việc.
**Bạn không cần tự tạo thư mục.**

| Ngăn | Chứa gì |
|---|---|
| \`01_business/\` | Định hướng, chính sách, bài toán kinh doanh |
| \`02_ba/\` | **Bắt buộc có.** PRD, SRS, User Story, Use Case |
| \`03_dev/\` | API Swagger/OpenAPI, DB schema, tech spec |
| \`04_design/\` | Figma, wireframe, ảnh màn hình |
| \`05_communication/\` | Q&A với BA, biên bản họp, Change Request |

> Agent **chỉ đọc** thư mục này, không bao giờ sửa tài liệu gốc của bạn.
`;

const OUTPUT_README = `# OUTPUT/ — Kết quả · **CỦA BẠN**

Mỗi tính năng một thư mục \`OUTPUT/<tên-task>/\`:

| File | Là gì |
|---|---|
| \`00_plan.md\` | Bản đồ tiến độ. Agent tick \`[x]\` vào đây sau mỗi chặng. |
| \`01_\` → \`06_\` | Sáu chặng thiết kế kiểm thử |
| \`09_\` → \`12_\` | Dữ liệu kiểm thử (khi cần) |
| \`15_readiness_*\` | Đánh giá sẵn sàng trước khi làm automation |
| \`runs/RUN-XX/\` | Kết quả chạy test + **ảnh bằng chứng** để nộp bài |

Muốn biết đang ở đâu, nói: *"Tiến độ thế nào rồi?"*

> ⚠️ \`OUTPUT/\` là **kết quả một lần chạy, có thể xoá và chạy lại**.
> Thứ cần giữ lâu dài (quy tắc BA đã chốt) nằm ở \`knowledge/\`.
`;

const KNOWLEDGE_README = `# knowledge/ — Bộ nhớ dự án · **DÙNG CHUNG**

Đây là thứ **duy nhất sống lâu hơn \`OUTPUT/\`**. Xoá \`OUTPUT/\` rồi chạy lại thì
agent vẫn nhớ; xoá \`knowledge/\` thì phải đi hỏi lại BA từ đầu.

| File | Ai điền |
|---|---|
| \`_project.md\` | Con người — quy ước dự án: tiền tệ, timezone, môi trường test |
| \`_glossary.md\` | Con người — từ điển thuật ngữ nghiệp vụ |
| \`_system_map.json\` | Agent tự đồng bộ — bản đồ định tuyến, đừng sửa tay |
| \`features/<task>.md\` | Agent ghi, **bạn duyệt** — quy tắc đã chốt, câu trả lời của BA |

Khi BA trả lời một câu hỏi treo, nói với agent:
*"BA đã chốt: [nội dung]"* — agent tự ghi vào đúng mục.
`;

const BIN_README = (bin, desc) => `# ${bin}

${desc}

> Đây là thư mục mẫu. Khi bạn thả tài liệu vào \`INPUT/\`, agent sẽ tạo
> \`INPUT/<tên-task>/${bin}/\` riêng cho từng tính năng.
`;

const BINS = [
  ['01_business', 'Định hướng, chính sách, bài toán kinh doanh cấp cao.'],
  ['02_ba', '**Bắt buộc có.** PRD, SRS, User Story, Use Case — tài liệu mô tả tính năng.'],
  ['03_dev', 'API Swagger/OpenAPI, DB schema, technical spec.'],
  ['04_design', 'Link Figma, wireframe, ảnh chụp màn hình.'],
  ['05_communication', 'Q&A với BA, biên bản họp, Change Request.'],
];

// ───────────────────── Scaffold steps ─────────────────────

function stepInput() {
  ensureDir(PATHS.INPUT, 'nơi bạn thả tài liệu của BA');
  writeFile(path.join(PATHS.INPUT, 'README.md'), INPUT_README, 'biển chỉ dẫn');
  const tpl = path.join(PATHS.INPUT, '_template');
  ensureDir(tpl, 'khuôn 5 ngăn cho task mới');
  for (const [bin, desc] of BINS) {
    ensureDir(path.join(tpl, bin));
    writeFile(path.join(tpl, bin, 'README.md'), BIN_README(bin, desc));
  }
}

function stepOutput() {
  ensureDir(PATHS.OUTPUT, 'nơi agent ghi kết quả');
  writeFile(path.join(PATHS.OUTPUT, 'README.md'), OUTPUT_README, 'biển chỉ dẫn');

  // `routing_table.template_run_dir` points here, so it must exist — otherwise
  // `agent:check` reports a broken routing path right after initialisation.
  const tplRun = path.join(PATHS.OUTPUT, '_template_run');
  if (ensureDir(tplRun, 'khuôn một lượt chạy test')) {
    for (const [f, title] of [
      ['run_plan.md', 'KẾ HOẠCH ĐỢT CHẠY'],
      ['run_result.md', 'KẾT QUẢ ĐỢT CHẠY'],
      ['run_defects.md', 'LỖI PHÁT HIỆN TRONG ĐỢT CHẠY'],
    ]) {
      writeFile(path.join(tplRun, f), `# ${title} — [RUN-ID]\n\n> Khuôn mẫu. Chép sang \`OUTPUT/<task>/runs/<RUN-ID>/\` khi chạy test.\n`);
    }
  }
}

function stepKnowledge() {
  ensureDir(PATHS.KNOWLEDGE, 'bộ nhớ dự án');
  ensureDir(PATHS.FEATURES, 'tri thức từng tính năng');
  writeFile(path.join(PATHS.KNOWLEDGE, 'README.md'), KNOWLEDGE_README, 'biển chỉ dẫn');

  const seed = path.join(PATHS.TEMPLATES, 'knowledge');
  if (!fs.existsSync(seed)) return;
  for (const f of fs.readdirSync(seed)) {
    ensureFile(path.join(seed, f), path.join(PATHS.KNOWLEDGE, f), 'từ template');
  }
}

function stepAutomation() {
  const src = path.join(PATHS.TEMPLATES, 'automation');
  if (!fs.existsSync(src)) return;

  ensureDir(PATHS.AUTOMATION, 'bộ nối với hệ thống đang kiểm thử');
  for (const f of fs.readdirSync(src)) {
    ensureFile(path.join(src, f), path.join(PATHS.AUTOMATION, f), 'từ template');
  }
  // The two directories the qa-automation agent writes code into.
  ensureDir(path.join(PATHS.AUTOMATION, 'pages'), 'Page Object Model — agent sinh ra');
  ensureDir(path.join(PATHS.AUTOMATION, 'tests'), 'kịch bản test — agent sinh ra');
}

// ───────────────────── Dependencies ─────────────────────

function run(cmd, label) {
  process.stdout.write(`  ${label}… `);
  if (dryRun) { console.log('(bỏ qua, đang --dry-run)'); return true; }
  try {
    execSync(cmd, { cwd: PATHS.ROOT, stdio: 'pipe' });
    console.log('✅');
    return true;
  } catch (e) {
    console.log('❌');
    console.log(`     ${String(e.stderr || e.message).split('\n')[0].slice(0, 100)}`);
    return false;
  }
}

function stepInstall() {
  if (noInstall) { console.log('  (bỏ qua cài đặt theo yêu cầu --no-install)'); return true; }

  let ok = true;
  if (!fs.existsSync(path.join(PATHS.ROOT, 'node_modules'))) {
    ok = run('npm install', 'Cài thư viện Node') && ok;
  } else {
    console.log('  Cài thư viện Node… ✅ (đã có sẵn)');
  }

  const cache =
    process.platform === 'darwin'
      ? path.join(process.env.HOME || '', 'Library', 'Caches', 'ms-playwright')
      : process.platform === 'win32'
      ? path.join(process.env.LOCALAPPDATA || '', 'ms-playwright')
      : path.join(process.env.HOME || '', '.cache', 'ms-playwright');

  const hasBrowser = fs.existsSync(cache) && fs.readdirSync(cache).some((d) => d.startsWith('chromium'));
  if (!hasBrowser) {
    ok = run('npx playwright install chromium', 'Tải trình duyệt Playwright (~150 MB)') && ok;
  } else {
    console.log('  Trình duyệt Playwright… ✅ (đã có sẵn)');
  }
  return ok;
}

// ───────────────────── Run ─────────────────────

function main() {
  console.log(`\n${line('━')}`);
  console.log(`  KHỞI TẠO HỆ THỐNG QA AGENT${dryRun ? '   (--dry-run: không ghi gì)' : ''}`);
  console.log(line('━'));

  console.log('\n  Bước 1/4 — Dựng khung thư mục');
  stepInput();
  stepOutput();
  stepKnowledge();
  stepAutomation();

  if (created.length) {
    created.forEach((c) => console.log(`     + ${c.what.padEnd(34)} ${c.note}`));
  } else {
    console.log('     ✅ Khung đã đầy đủ, không có gì phải tạo thêm.');
  }
  if (skipped.length) {
    console.log(`     (giữ nguyên ${skipped.length} mục đã có — lệnh này không bao giờ ghi đè)`);
  }

  console.log('\n  Bước 2/4 — Cài thư viện');
  const installOk = stepInstall();

  console.log('\n  Bước 3/4 — Tự kiểm hệ thống');
  const checkOk = dryRun ? true : run('npm run --silent agent:check', 'Kiểm toàn vẹn agent');

  console.log('\n  Bước 4/4 — Xong\n');
  console.log(line());
  if (dryRun) {
    console.log('  Đây là bản xem trước. Bỏ `--dry-run` để dựng thật.');
  } else if (installOk && checkOk) {
    console.log('  ✅ Hệ thống sẵn sàng.\n');
    console.log('  Bước tiếp theo:');
    console.log('    1. Kéo tài liệu của BA vào thư mục INPUT/');
    console.log('    2. Nói với agent: "Tôi vừa bỏ tài liệu vào INPUT, xử lý giúp"');
    console.log('\n  Quên mình đang làm gì thì gõ: npm start');
  } else {
    console.log('  ⚠️  Khung đã dựng xong nhưng có bước chưa thành công ở trên.');
    console.log('     Xem dòng ❌ và xử lý, rồi chạy lại `npm run init`.');
  }
  console.log(`${line()}\n`);

  process.exit(dryRun || (installOk && checkOk) ? 0 : 1);
}

if (require.main === module) main();

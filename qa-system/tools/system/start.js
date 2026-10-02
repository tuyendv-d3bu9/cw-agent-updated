#!/usr/bin/env node
/**
 * start.js — Một cửa duy nhất: "tôi đang ở đâu, chỗ nào là của tôi, làm gì tiếp".
 *
 * Vì sao cần: repo có hơn 100 file và 50 thư mục. Người dùng là QA/BA/PO, không
 * phải dev. Nhìn vào họ không biết thư mục nào được đụng, thư mục nào là máy móc,
 * và nên bắt đầu từ đâu. Thiếu hụt đó không sửa được bằng cách giấu bớt thư mục —
 * phải nói thẳng ra ai sở hữu cái gì.
 *
 * Lệnh: npm run start
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, listTaskSlugs } = require('../lib/paths');

const W = 68;
const line = (c = '─') => c.repeat(W);
const has = (p) => fs.existsSync(path.join(PATHS.ROOT, p));

// ───────────────────── Bản đồ quyền sở hữu ─────────────────────

const ZONES = [
  {
    title: 'CỦA BẠN — cứ thoải mái thêm, sửa, xoá',
    icon: '📥',
    rows: [
      ['INPUT/', 'Thả tài liệu BA/PRD/API/Figma vào đây. Kéo thả là đủ.'],
      ['OUTPUT/', 'Kết quả agent sinh ra. Đọc, sửa, nộp bài từ đây.'],
    ],
  },
  {
    title: 'DÙNG CHUNG — bạn và agent cùng ghi',
    icon: '🧠',
    rows: [
      ['knowledge/', 'Tri thức tích luỹ: quy tắc đã chốt, câu trả lời của BA.'],
      ['', 'Thứ duy nhất sống lâu hơn OUTPUT/. Mất là phải hỏi lại BA.'],
    ],
  },
  {
    title: 'MÁY MÓC — chỉ đụng khi cố ý nâng cấp hệ thống',
    icon: '⚙️',
    rows: [
      ['qa-system/', '9 agent QA + skill + công cụ. Sửa ở đây = nâng cấp hệ thống.'],
      ['automation/', 'Code Playwright dùng chung. Chỉ cần khi làm automation.'],
    ],
  },
  {
    title: 'ĐỌC THÔI — không cần sửa',
    icon: '📖',
    rows: [
      ['AGENTS.md', 'Hiến pháp cho mọi AI Agent. Agent tự đọc, bạn không cần.'],
      ['DE-BAI/', 'Đề bài và cách nộp (chỉ có ở nhánh exam).'],
    ],
  },
];

// ───────────────────── Kiểm tra môi trường ─────────────────────

function environment() {
  const checks = [];
  checks.push({
    ok: has('node_modules'),
    label: 'Thư viện đã cài',
    fix: 'Agent sẽ tự chạy `npm install`',
  });

  // Playwright tải trình duyệt vào cache ngoài repo — đây là bước lâu nhất khi setup.
  const cache =
    process.platform === 'darwin'
      ? path.join(process.env.HOME || '', 'Library', 'Caches', 'ms-playwright')
      : process.platform === 'win32'
      ? path.join(process.env.LOCALAPPDATA || '', 'ms-playwright')
      : path.join(process.env.HOME || '', '.cache', 'ms-playwright');

  const hasBrowser =
    fs.existsSync(cache) && fs.readdirSync(cache).some((d) => d.startsWith('chromium'));
  checks.push({
    ok: hasBrowser,
    label: 'Trình duyệt Playwright',
    fix: 'Agent sẽ tự chạy `npx playwright install chromium` (~150 MB)',
  });

  return checks;
}

// ───────────────────── Tình hình công việc ─────────────────────

function tasks() {
  return listTaskSlugs().map((slug) => {
    const dir = taskDir(slug);
    const planPath = path.join(dir, '00_plan.md');
    const plan = fs.existsSync(planPath) ? fs.readFileSync(planPath, 'utf-8') : '';
    const done = (plan.match(/- \[x\]/gi) || []).length;
    const todo = (plan.match(/- \[ \]/g) || []).length;

    let gateBlocked = false;
    try {
      gateBlocked = require('./gate').evaluate(slug).blocked;
    } catch {
      /* cổng lỗi thì coi như mở, không chặn người dùng xem tiến độ */
    }

    return { slug, done, total: done + todo, gateBlocked };
  });
}

/** Việc nên làm tiếp, diễn đạt bằng câu người dùng nói được với agent. */
function nextStep(list) {
  const loose = fs.existsSync(PATHS.INPUT)
    ? fs.readdirSync(PATHS.INPUT).filter((f) => !f.startsWith('.') && fs.statSync(path.join(PATHS.INPUT, f)).isFile())
    : [];

  if (loose.length) {
    return [
      `Có ${loose.length} tài liệu rời đang nằm trong INPUT/ chưa được tiếp nhận.`,
      `Nói với agent:  "Tôi vừa bỏ tài liệu vào INPUT, xử lý giúp"`,
    ];
  }

  if (list.length === 0) {
    return [
      'Chưa có task nào. Bắt đầu bằng cách kéo tài liệu của BA vào thư mục INPUT/.',
      `Rồi nói với agent:  "Tôi vừa bỏ tài liệu vào INPUT, xử lý giúp"`,
    ];
  }

  const blocked = list.find((t) => t.gateBlocked);
  if (blocked) {
    return [
      `Task "${blocked.slug}" đang bị CHẶN vì còn câu hỏi chưa được BA trả lời.`,
      `Nói với agent:  "Cho tôi xem các câu hỏi đang treo của ${blocked.slug}"`,
    ];
  }

  const doing = list.find((t) => t.total > 0 && t.done < t.total) || list[0];
  return [
    `Task "${doing.slug}" đang làm dở (${doing.done}/${doing.total} chặng).`,
    `Nói với agent:  "Tiếp tục"`,
  ];
}

// ───────────────────── In ─────────────────────

function main() {
  const list = tasks();

  console.log(`\n${line('━')}`);
  console.log('  HỆ THỐNG QA AGENT — BẮT ĐẦU TỪ ĐÂU');
  console.log(line('━'));

  console.log('\n  Bạn KHÔNG cần gõ lệnh terminal. Chỉ cần nói chuyện với agent');
  console.log('  bằng tiếng Việt bình thường. Agent tự chạy mọi thứ ở hậu trường.\n');

  // 1. Việc nên làm tiếp — đặt lên đầu vì đây là câu hỏi cấp bách nhất
  console.log(line());
  console.log('  👉 LÀM GÌ TIẾP');
  console.log(line());
  nextStep(list).forEach((l) => console.log(`  ${l}`));

  // 2. Tình hình công việc
  if (list.length) {
    console.log(`\n${line()}`);
    console.log('  📋 CÔNG VIỆC HIỆN CÓ');
    console.log(line());
    for (const t of list) {
      const bar = t.total ? `${t.done}/${t.total} chặng` : 'chưa có kế hoạch';
      const flag = t.gateBlocked ? '  ⛔ đang bị chặn (chờ BA trả lời)' : '';
      console.log(`  • ${t.slug.padEnd(30)} ${bar}${flag}`);
    }
  }

  // 3. Bản đồ quyền sở hữu — thứ chữa đúng bệnh "không biết đụng cái gì"
  console.log(`\n${line()}`);
  console.log('  🗺️  THƯ MỤC NÀO LÀ CỦA AI');
  console.log(line());
  for (const z of ZONES) {
    console.log(`\n  ${z.icon} ${z.title}`);
    for (const [name, desc] of z.rows) {
      console.log(`     ${name.padEnd(14)} ${desc}`);
    }
  }

  // 4. Môi trường — chỉ nói khi có vấn đề, không làm nhiễu lúc đã ổn
  const env = environment();
  const missing = env.filter((c) => !c.ok);
  if (missing.length) {
    console.log(`\n${line()}`);
    console.log('  ⚠️  MÔI TRƯỜNG CHƯA SẴN SÀNG');
    console.log(line());
    missing.forEach((c) => console.log(`  • ${c.label} — ${c.fix}`));
    console.log('\n  Nói với agent: "Chuẩn bị môi trường giúp tôi"');
  }

  console.log(`\n${line('━')}\n`);
}

if (require.main === module) main();

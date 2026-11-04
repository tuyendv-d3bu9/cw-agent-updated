/**
 * versioning.js — Một tính năng, nhiều bản tài liệu.
 *
 * Tên task theo TÍNH NĂNG (bỏ version/ngày), nên bản v2 rơi vào đúng task của v1. Hai việc phải làm
 * khi điều đó xảy ra, nếu không "gộp theo tính năng" gây hại nhiều hơn lợi:
 *
 *   1. Không gộp im lặng — tài liệu vào một task ĐÃ CÓ tài liệu thì dừng, chờ người dùng xác nhận
 *      (`--into <slug>`). Nhận diện nhầm thì hai tính năng khác nhau bị trộn.
 *   2. Bản cũ không nằm lẫn với bản mới — chuyển sang `<ngăn>/_superseded/`. Chặng 01, digest và
 *      lint không đọc thư mục đó, nên không lấy nhầm giá trị cũ và không tốn context gấp đôi.
 *
 * Không xác định được bản nào mới hơn ⇒ KHÔNG đoán: giữ cả hai, báo ra (QA_STANDARD §10.2 ⇒ hỏi).
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');
const { parseSourceMetadata } = require('../lib/doc-converter');

const SUPERSEDED_DIR = '_superseded';
const BINS = ['01_business', '02_ba', '03_dev', '04_design', '05_communication'];

/** Bỏ ngày và version khỏi tên — dùng chung cho tên task và khoá nhận diện "cùng một tài liệu". */
function stripVersionDate(name) {
  return String(name)
    .normalize('NFC')
    // ngày: 2026-10-28, 2026_10_28, 28-10-2026, 28.10.2026, 20261028
    .replace(/(?<!\d)\d{4}[-_.]\d{1,2}[-_.]\d{1,2}(?!\d)/g, ' ')
    .replace(/(?<!\d)\d{1,2}[-_.]\d{1,2}[-_.]\d{4}(?!\d)/g, ' ')
    .replace(/(?<!\d)(?:19|20)\d{6}(?!\d)/g, ' ')
    // version: v1, v1.2, ver2, version 3, rev3, r2, phiên bản 2
    .replace(/(?<![\p{L}\p{N}])(?:v|ver|version|rev|revision|r|phiên bản|phien ban)[\s._-]?\d+(?:[._]\d+)*(?![\p{L}\p{N}])/giu, ' ')
    .replace(/\(\s*\d+\s*\)/g, ' '); // "(1)" của bản sao
}

const deaccent = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd');

/** Khoá "cùng một tài liệu": tên file bỏ version/ngày, GIỮ loại tài liệu (srs ≠ cr). */
const STATE_TOKENS = new Set(['final', 'draft', 'copy', 'nhap', 'moi', 'new', 'old', 'cu']);

function docKey(stem) {
  return deaccent(stripVersionDate(stem))
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !STATE_TOKENS.has(t)) // "final", "draft", "bản nháp" là trạng thái bản, không phải tên tài liệu
    .join('-');
}

/** Version ghi trên tên file (v2, rev3, phiên bản 1.2) — tín hiệu do người đặt tên chủ ý ghi. */
function versionFromName(stem) {
  const m = deaccent(String(stem)).match(/(?<![a-z0-9])(?:v|ver|version|rev|revision|r|phien ban)[\s._-]?(\d+(?:[._-]\d{1,3})*)(?![a-z0-9])/i);
  // Tên file đã slugify biến "v1.2" thành "v1-2"; nhóm sau tối đa 3 chữ số để không nuốt ngày 20261028.
  return m ? m[1].replace(/[_-]/g, '.') : null;
}

const firstDate = (v) => {
  const m = String(v || '').match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : null;
};
const firstVersion = (v) => {
  const m = String(v || '').match(/\d+(?:\.\d+)*/);
  return m ? m[0] : null;
};

function cmpVersion(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return Math.sign(d);
  }
  return 0;
}

/** Thông tin bản của một file .md đã convert: ngày + version (metadata trước, tên file sau). */
function versionInfo(mdPath) {
  let meta = {};
  try {
    meta = parseSourceMetadata(fs.readFileSync(mdPath, 'utf-8')) || {};
  } catch {
    /* file không đọc được ⇒ coi như không có thông tin */
  }
  const stem = path.basename(mdPath, '.md');
  return {
    date: firstDate(meta.date),
    version: firstVersion(meta.version) || versionFromName(stem),
  };
}

/**
 * 1 nếu `a` mới hơn `b`, -1 nếu cũ hơn, 0 nếu không phân định được.
 * Version thắng ngày: version là thứ người soạn chủ ý ghi, còn ngày trong metadata thường là ngày LƯU file
 * (một bản v1 mở lại rồi lưu sẽ có ngày muộn hơn v2). Chỉ khi thiếu version ở một bên mới dùng ngày.
 */
function compareDocs(a, b) {
  if (a.version && b.version) {
    const c = cmpVersion(a.version, b.version);
    if (c !== 0) return c;
  }
  if (a.date && b.date && a.date !== b.date) return a.date > b.date ? 1 : -1;
  return 0;
}

/** Task đã có tài liệu nghiệp vụ nào chưa (bỏ README, _assets, _superseded). */
function taskHasDocs(slug) {
  const root = path.join(PATHS.INPUT, slug);
  if (!fs.existsSync(root)) return false;
  return BINS.some((bin) => {
    const dir = path.join(root, bin);
    if (!fs.existsSync(dir)) return false;
    return fs.readdirSync(dir).some((f) => f.endsWith('.md') && !/^readme\.md$/i.test(f) && f !== 'design-assets.md');
  });
}

/**
 * Task ĐÃ CÓ tài liệu mà tên gần với `slug` (bộ từ của tên này nằm trọn trong tên kia).
 * Tài liệu gửi bổ sung thường mang thêm chữ ("QA_BA_tra_loi_hoan_tien" → `qa-ba-tra-loi-hoan-tien`): so trùng khít
 * thì bỏ lọt và lặng lẽ tạo task mới, câu trả lời của BA không bao giờ tới task `hoan-tien`.
 */
function relatedTasks(slug) {
  if (!fs.existsSync(PATHS.INPUT)) return [];
  const mine = new Set(String(slug).split('-').filter(Boolean));
  if (mine.size === 0) return [];
  return fs.readdirSync(PATHS.INPUT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.') && e.name !== slug)
    .map((e) => e.name)
    .filter((name) => {
      const theirs = name.split('-').filter(Boolean);
      if (theirs.length === 0) return false;
      const contained = (a, b) => a.every((t) => b.has(t));
      return (contained(theirs, mine) || contained([...mine], new Set(theirs))) && taskHasDocs(name);
    })
    .sort();
}

/**
 * Tài liệu sắp vào đâu cần người dùng xác nhận: chính task `slug` đã có tài liệu, hoặc một task tên gần.
 * @returns {{slug: string, related: boolean} | null}
 */
function needsConfirmation(slug) {
  if (taskHasDocs(slug)) return { slug, related: false };
  const rel = relatedTasks(slug);
  return rel.length ? { slug: rel[0], related: true, proposed: slug, others: rel.slice(1) } : null;
}

/** Thông điệp dừng khi tài liệu sắp vào một task đã có. */
function confirmNotice(slug, files, { intakeCmd = 'npm run intake --', proposed = null } = {}) {
  const names = files.map((f) => path.basename(f));
  const quoted = names.length === 1 ? ` "${names[0]}"` : '';
  return [
    '',
    proposed
      ? `⏸️  CẦN XÁC NHẬN — tên tài liệu gần với task đã có [ ${slug} ] (tên đề xuất mới: ${proposed}). Chưa nhận, file vẫn nằm nguyên chỗ cũ.`
      : `⏸️  CẦN XÁC NHẬN — task [ ${slug} ] đã có tài liệu. Chưa nhận, file vẫn nằm nguyên chỗ cũ.`,
    '',
    '   Tài liệu đến:',
    ...names.map((n) => `     • ${n}`),
    '',
    `   Đây là bản mới / tài liệu bổ sung của CÙNG tính năng [ ${slug} ]?`,
    `     • Đúng   → ${intakeCmd}${quoted} --into ${slug}`,
    `     • Không  → ${intakeCmd}${quoted} --slug <tên-tính-năng-khác>`,
    '',
    '   (Agent: hỏi người dùng câu trên bằng lời, KHÔNG tự chọn.)',
    '',
  ].join('\n');
}

function moveToSuperseded(filePath, replacedBy, reason) {
  const dir = path.join(path.dirname(filePath), SUPERSEDED_DIR);
  fs.mkdirSync(dir, { recursive: true });
  let dest = path.join(dir, path.basename(filePath));
  for (let n = 2; fs.existsSync(dest); n++) {
    dest = path.join(dir, `${path.basename(filePath, '.md')}-${n}.md`);
  }
  fs.renameSync(filePath, dest);

  const index = path.join(dir, 'README.md');
  if (!fs.existsSync(index)) {
    fs.writeFileSync(
      index,
      [
        '# Bản tài liệu đã bị thay thế',
        '',
        '> Agent KHÔNG đọc thư mục này khi phân tích (Chặng 01, digest, lint bỏ qua). Chỉ mở khi cần đối chiếu',
        '> bản cũ. Muốn dùng lại một bản: chuyển nó ra ngăn cha và chuyển bản đang dùng vào đây.',
        '',
        '| File cũ | Bị thay bởi | Căn cứ | Ngày chuyển |',
        '|---|---|---|---|',
        '',
      ].join('\n'),
      'utf8'
    );
  }
  const today = new Date().toISOString().slice(0, 10);
  fs.appendFileSync(index, `| \`${path.basename(dest)}\` | \`${path.basename(replacedBy)}\` | ${reason} | ${today} |\n`, 'utf8');
  return dest;
}

const describe = (v) => [v.date && `ngày ${v.date}`, v.version && `v${v.version}`].filter(Boolean).join(', ') || 'không rõ';

/**
 * Với mỗi file vừa nhận, tìm bản khác của CÙNG tài liệu trong cùng ngăn và chuyển bản cũ hơn sang
 * `_superseded/`. Chạy tuần tự sau khi đã ghi xong mọi file của lượt (tránh tranh chấp khi bulk chạy song song).
 *
 * @param {string[]} newPaths  đường dẫn tuyệt đối các .md vừa ghi
 * @returns {{superseded: Array, unclear: Array}}
 */
function applySupersede(newPaths) {
  const superseded = [];
  const unclear = [];
  const done = new Set();

  for (const newPath of newPaths) {
    if (done.has(newPath) || !fs.existsSync(newPath)) continue;
    const dir = path.dirname(newPath);
    const key = docKey(path.basename(newPath, '.md'));
    if (!key) continue;

    const siblings = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.md') && !/^readme\.md$/i.test(f))
      .map((f) => path.join(dir, f))
      .filter((p) => p !== newPath && docKey(path.basename(p, '.md')) === key);

    for (const other of siblings) {
      if (!fs.existsSync(other) || !fs.existsSync(newPath)) continue;
      const a = versionInfo(newPath);
      const b = versionInfo(other);
      const cmp = compareDocs(a, b);
      if (cmp === 0) {
        unclear.push({ a: path.relative(PATHS.ROOT, newPath), b: path.relative(PATHS.ROOT, other) });
        continue;
      }
      const [older, newer, vo, vn] = cmp > 0 ? [other, newPath, b, a] : [newPath, other, a, b];
      const reason = `bản mới: ${describe(vn)} · bản cũ: ${describe(vo)}`;
      const dest = moveToSuperseded(older, newer, reason);
      superseded.push({ file: path.relative(PATHS.ROOT, dest), replacedBy: path.relative(PATHS.ROOT, newer), reason });
      done.add(older);
      if (older === newPath) break; // file vừa nhận là bản cũ — đã cất, dừng so tiếp
    }
  }
  return { superseded, unclear };
}

function printVersioning({ superseded, unclear }) {
  if (superseded.length) {
    console.log(`\n   🗂️  ${superseded.length} bản cũ chuyển sang _superseded/ (agent không đọc nữa):`);
    superseded.forEach((s) => console.log(`      - ${s.file}  ← thay bởi ${path.basename(s.replacedBy)} (${s.reason})`));
  }
  if (unclear.length) {
    console.log(`\n   ⚠️ ${unclear.length} cặp bản KHÔNG xác định được bản nào mới hơn — giữ cả hai, cần người dùng chỉ ra bản đang dùng:`);
    unclear.forEach((u) => console.log(`      - ${u.a}  vs  ${u.b}`));
  }
}

module.exports = {
  SUPERSEDED_DIR,
  stripVersionDate,
  docKey,
  versionFromName,
  versionInfo,
  compareDocs,
  taskHasDocs,
  relatedTasks,
  needsConfirmation,
  confirmNotice,
  applySupersede,
  printVersioning,
};

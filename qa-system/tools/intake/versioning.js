/**
 * versioning.js — One feature, many document versions.
 *
 * Tasks are named by FEATURE (version/date dropped), so v2 lands in the same task as v1. Two things must happen
 * when that happens, otherwise "grouping by feature" does more harm than good:
 *
 *   1. No silent merging — a document entering a task that ALREADY has documents stops and waits for user confirmation
 *      (`--into <slug>`). A misdetection would mix two different features.
 *   2. Old versions do not sit beside new ones — moved to `<bin>/_superseded/`. Stage 01, digest and
 *      lint do not read that folder, so old values are not picked up and context is not doubled.
 *
 * Cannot tell which version is newer ⇒ do NOT guess: keep both and report (QA_STANDARD §10.2 ⇒ ask).
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');
const { parseSourceMetadata } = require('../lib/doc-converter');

const SUPERSEDED_DIR = '_superseded';
const BINS = ['01_business', '02_ba', '03_dev', '04_design', '05_communication'];

/** Strip date and version from a name — shared by task names and the "same document" identity key. */
function stripVersionDate(name) {
  return String(name)
    .normalize('NFC')
    // date: 2026-10-28, 2026_10_28, 28-10-2026, 28.10.2026, 20261028
    .replace(/(?<!\d)\d{4}[-_.]\d{1,2}[-_.]\d{1,2}(?!\d)/g, ' ')
    .replace(/(?<!\d)\d{1,2}[-_.]\d{1,2}[-_.]\d{4}(?!\d)/g, ' ')
    .replace(/(?<!\d)(?:19|20)\d{6}(?!\d)/g, ' ')
    // version: v1, v1.2, ver2, version 3, rev3, r2, phiên bản 2
    .replace(/(?<![\p{L}\p{N}])(?:v|ver|version|rev|revision|r|phiên bản|phien ban)[\s._-]?\d+(?:[._]\d+)*(?![\p{L}\p{N}])/giu, ' ')
    .replace(/\(\s*\d+\s*\)/g, ' '); // "(1)" of a copy
}

const deaccent = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd');

/** "Same document" key: file name minus version/date, KEEPING the document type (srs ≠ cr). */
const STATE_TOKENS = new Set(['final', 'draft', 'copy', 'nhap', 'moi', 'new', 'old', 'cu']);

function docKey(stem) {
  return deaccent(stripVersionDate(stem))
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !STATE_TOKENS.has(t)) // "final", "draft", "bản nháp" are version states, not document names
    .join('-');
}

/** Version written in the file name (v2, rev3, phiên bản 1.2) — a signal the author deliberately wrote. */
function versionFromName(stem) {
  const m = deaccent(String(stem)).match(/(?<![a-z0-9])(?:v|ver|version|rev|revision|r|phien ban)[\s._-]?(\d+(?:[._-]\d{1,3})*)(?![a-z0-9])/i);
  // A slugified file name turns "v1.2" into "v1-2"; the trailing group is at most 3 digits so it does not swallow the date 20261028.
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

/** Version info of a converted .md file: date + version (metadata first, file name second). */
function versionInfo(mdPath) {
  let meta = {};
  try {
    meta = parseSourceMetadata(fs.readFileSync(mdPath, 'utf-8')) || {};
  } catch {
    /* unreadable file ⇒ treated as having no information */
  }
  const stem = path.basename(mdPath, '.md');
  return {
    date: firstDate(meta.date),
    version: firstVersion(meta.version) || versionFromName(stem),
  };
}

/**
 * 1 if `a` is newer than `b`, -1 if older, 0 if undecidable.
 * Version beats date: the version is deliberately written by the author, while the metadata date is usually the file SAVE date
 * (a v1 reopened and saved gets a later date than v2). Date is used only when one side lacks a version.
 */
function compareDocs(a, b) {
  if (a.version && b.version) {
    const c = cmpVersion(a.version, b.version);
    if (c !== 0) return c;
  }
  if (a.date && b.date && a.date !== b.date) return a.date > b.date ? 1 : -1;
  return 0;
}

/** Whether the task already has business documents (ignoring README, _assets, _superseded). */
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
 * A task that ALREADY has documents and whose name is close to `slug` (the word set of one name is contained in the other).
 * Supplementary documents often carry extra words ("QA_BA_tra_loi_hoan_tien" → `qa-ba-tra-loi-hoan-tien`): an exact match
 * would miss it and silently create a new task, so the BA reply would never reach the `hoan-tien` task.
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
 * Where a document is about to go needs user confirmation: the `slug` task already has documents, or a task with a close name does.
 * @returns {{slug: string, related: boolean} | null}
 */
function needsConfirmation(slug) {
  if (taskHasDocs(slug)) return { slug, related: false };
  const rel = relatedTasks(slug);
  return rel.length ? { slug: rel[0], related: true, proposed: slug, others: rel.slice(1) } : null;
}

/** Stop message when a document is about to enter an existing task. */
function confirmNotice(slug, files, { intakeCmd = 'npm run intake --', proposed = null } = {}) {
  const names = files.map((f) => path.basename(f));
  const quoted = names.length === 1 ? ` "${names[0]}"` : '';
  return [
    '',
    proposed
      ? `⏸️  CONFIRMATION NEEDED — the document name is close to the existing task [ ${slug} ] (new proposed name: ${proposed}). Not taken in, the file stays where it was.`
      : `⏸️  CONFIRMATION NEEDED — task [ ${slug} ] already has documents. Not taken in, the file stays where it was.`,
    '',
    '   Incoming document:',
    ...names.map((n) => `     • ${n}`),
    '',
    `   Is this a new version / supplementary document of the SAME feature [ ${slug} ]?`,
    `     • Yes    → ${intakeCmd}${quoted} --into ${slug}`,
    `     • No     → ${intakeCmd}${quoted} --slug <other-feature-name>`,
    '',
    '   (Agent: ask the user the question above in words, do NOT choose yourself.)',
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
    console.log(`\n   🗂️  ${superseded.length} old version(s) moved to _superseded/ (the agent no longer reads them):`);
    superseded.forEach((s) => console.log(`      - ${s.file}  ← replaced by ${path.basename(s.replacedBy)} (${s.reason})`));
  }
  if (unclear.length) {
    console.log(`\n   ⚠️ ${unclear.length} pair(s) where it is UNCLEAR which version is newer — both kept, the user must say which one is current:`);
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

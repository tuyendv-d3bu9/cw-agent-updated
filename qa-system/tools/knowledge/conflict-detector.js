#!/usr/bin/env node
/**
 * conflict-detector.js — Dò mâu thuẫn GIỮA các file tri thức tính năng (knowledge/features/*.md).
 *
 *   parseFeatureFile(path)          { slug, title, content, text, rules, constants }
 *   phraseStance(text, topic)       'allow' | 'deny' | 'both' | null
 *   detectConflicts(features, o)    Danh sách xung đột (chủ đề + hằng số §9)
 *   loadTopics()                    Chủ đề mặc định, hoặc knowledge/_conflict_topics.json nếu có
 *
 * Đây là HEURISTIC từ khoá — không chứng minh được hai tính năng "nhất quán". Không phát hiện
 * gì chỉ có nghĩa là heuristic không bắt được, KHÔNG phải PASS.
 *
 * Hai loại phát hiện:
 *   1. Chủ đề chính sách (cộng dồn, guest, hoàn huỷ, phí ship… — cấu hình được): cụm PHỦ ĐỊNH được
 *      khớp trước và xoá khỏi văn bản, rồi mới tìm cụm CHO PHÉP. "không cộng dồn" không còn bị
 *      đếm luôn là "cộng dồn".
 *   2. Hằng số §9 cùng tên ở hai tính năng mà con số khác nhau (3 lần vs 5 lần) → xung đột.
 *
 * Usage:
 *   conflict-detector.js [task-slug]   Có slug: chỉ so tính năng đó với các tính năng khác và ghi
 *                                      OUTPUT/<slug>/01_conflict_warning.md (nếu OUTPUT/<slug>/ có).
 * Exit: 0 = heuristic không thấy xung đột · 1 = có xung đột (hoặc lỗi).
 *
 * Tuỳ biến chủ đề cho dự án: tạo knowledge/_conflict_topics.json dạng
 *   { "replaceDefaults": false, "topics": { "<key>": { "category": "...", "allow": [...], "deny": [...] } } }
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');

// Chủ đề mặc định (thương mại điện tử). Dự án khác: thêm/thay qua knowledge/_conflict_topics.json.
const DEFAULT_TOPICS = {
  stacking: {
    category: 'Cộng dồn khuyến mãi / quyền lợi',
    allow: ['cộng dồn', 'kết hợp', 'áp dụng đồng thời', 'stackable', 'dùng chung', 'combine', 'stacking allowed'],
    deny: ['không cộng dồn', 'không được cộng dồn', 'không áp dụng đồng thời', 'không kết hợp', 'chỉ 1 mã', 'duy nhất 1', 'không dùng chung', 'non-stackable', 'cannot combine', 'not stackable'],
  },
  guestAccess: {
    category: 'Điều kiện tài khoản (Guest vs đăng nhập)',
    allow: ['không cần đăng nhập', 'khách vãng lai', 'guest', 'chưa đăng nhập', 'anonymous'],
    deny: ['bắt buộc đăng nhập', 'yêu cầu đăng nhập', 'phải đăng nhập', 'chỉ áp dụng thành viên', 'must login', 'authentication required', 'không hỗ trợ guest', 'không cho guest'],
  },
  cancellationRefund: {
    category: 'Huỷ / hoàn quyền lợi',
    allow: ['hoàn lại mã', 'hoàn voucher', 'phục hồi mã', 'restore voucher', 'hoàn về ví', 'refund', 'restore'],
    deny: ['không hoàn lại', 'không hoàn', 'hủy là mất', 'huỷ là mất', 'mất quyền sử dụng', 'không phục hồi', 'non-refundable', 'forfeited', 'no refund'],
  },
  shippingDiscount: {
    category: 'Phạm vi giảm giá (phí ship vs tiền hàng)',
    allow: ['giảm cả phí ship', 'áp dụng phí vận chuyển', 'freeship kết hợp', 'applies to shipping'],
    deny: ['chỉ áp dụng tiền hàng', 'không giảm phí vận chuyển', 'không bao gồm ship', 'subtotal only'],
  },
};

function loadTopics(file = path.join(PATHS.KNOWLEDGE, '_conflict_topics.json')) {
  if (!fs.existsSync(file)) return DEFAULT_TOPICS;
  const cfg = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const topics = cfg.topics || {};
  return cfg.replaceDefaults ? topics : { ...DEFAULT_TOPICS, ...topics };
}

const norm = (s) => String(s || '').normalize('NFC').toLowerCase();
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const phraseRe = (p) => new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(norm(p))}(?![\\p{L}\\p{N}])`, 'giu');

/**
 * Lập trường của một đoạn chữ về một chủ đề. Cụm phủ định khớp trước, được XOÁ khỏi chữ,
 * rồi mới tìm cụm cho phép trong phần còn lại.
 */
function phraseStance(text, topic) {
  let t = norm(text);
  const deny = [...topic.deny].sort((a, b) => b.length - a.length);
  let denies = false;
  for (const p of deny) {
    const re = phraseRe(p);
    if (re.test(t)) {
      denies = true;
      t = t.replace(phraseRe(p), ' ');
    }
  }
  const allows = topic.allow.some((p) => phraseRe(p).test(t));
  if (allows && denies) return 'both';
  if (allows) return 'allow';
  if (denies) return 'deny';
  return null;
}

/** Bảng dưới một heading "## <n>." → mảng object theo tên cột. */
function sectionTable(content, sectionNo) {
  const lines = String(content).split('\n');
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${sectionNo}\\b\\.?`).test(l));
  if (start === -1) return [];
  const out = [];
  let header = null;
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (/^##\s/.test(l)) break;
    if (!/^\s*\|/.test(l)) continue;
    const cells = l.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim());
    if (!header) { header = cells.map((c) => norm(c)); continue; }
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
    const row = {};
    header.forEach((h, k) => { row[h] = cells[k] || ''; });
    row._cells = cells;
    out.push(row);
  }
  return out;
}

/** Số trong một giá trị: "500.000 ₫" → 500000, "5 lần, khoá 15 phút" → [5, 15]. */
function numbersIn(value) {
  return (String(value).match(/\d[\d.,]*/g) || [])
    .map((n) => {
      const s = n.replace(/[.,]$/, '');
      if (/^\d{1,3}([.,]\d{3})+$/.test(s)) return Number(s.replace(/[.,]/g, ''));
      return Number(s.replace(',', '.'));
    })
    .filter((n) => Number.isFinite(n));
}

const constKey = (name) => norm(name).replace(/[`*_]/g, '').replace(/\s+/g, ' ').trim();

function parseConstants(content) {
  return sectionTable(content, 9)
    .map((r) => {
      const name = r['hằng số'] ?? r._cells[0];
      const value = r['giá trị'] ?? r._cells[2] ?? '';
      const source = Object.keys(r).find((k) => k.startsWith('nguồn')) ? r[Object.keys(r).find((k) => k.startsWith('nguồn'))] : '';
      return { key: constKey(name), name: String(name).replace(/`/g, '').trim(), value, numbers: numbersIn(value), source };
    })
    .filter((c) => c.key && !/^<.*>$/.test(c.key) && !/<điền>/.test(c.value));
}

/** Chữ dùng để dò chủ đề: bỏ blockquote hướng dẫn, comment HTML, dòng còn `<điền>`. */
function analysableText(content) {
  return String(content)
    .replace(/<!--[\s\S]*?-->/g, '')
    .split('\n')
    .filter((l) => !/^\s*>/.test(l) && !/<điền/.test(l))
    .join('\n');
}

function parseFeatureFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const slug = path.basename(filePath, '.md');
  const titleMatch = content.match(/^#\s+(?:Tính năng:\s*)?([^\n]+)/m);
  const title = titleMatch ? titleMatch[1].trim() : slug;
  const rules = [];
  for (const m of content.matchAll(/\|\s*(BR-[0-9]+)\s*\|\s*([^|]+)\s*\|/gi)) {
    rules.push({ id: m[1].toUpperCase(), body: m[2].trim() });
  }
  return { slug, title, content, text: analysableText(content), rules, constants: parseConstants(content) };
}

function detectConflicts(features, { topics = DEFAULT_TOPICS, target = null } = {}) {
  const conflicts = [];
  for (let i = 0; i < features.length; i++) {
    for (let j = i + 1; j < features.length; j++) {
      const A = features[i];
      const B = features[j];
      if (target && A.slug !== target && B.slug !== target) continue;

      for (const topic of Object.values(topics)) {
        const sa = phraseStance(A.text, topic);
        const sb = phraseStance(B.text, topic);
        if ((sa === 'allow' && sb === 'deny') || (sa === 'deny' && sb === 'allow')) {
          conflicts.push({
            type: topic.category,
            featureA: A.slug,
            featureB: B.slug,
            description: `[${A.slug}] ${sa === 'allow' ? 'cho phép' : 'cấm'} · [${B.slug}] ${sb === 'allow' ? 'cho phép' : 'cấm'}`,
          });
        }
      }

      const bByKey = new Map(B.constants.map((c) => [c.key, c]));
      for (const ca of A.constants) {
        const cb = bByKey.get(ca.key);
        if (!cb || !ca.numbers.length || !cb.numbers.length) continue;
        if (ca.numbers.join('|') !== cb.numbers.join('|')) {
          conflicts.push({
            type: `Hằng số §9: ${ca.name}`,
            featureA: A.slug,
            featureB: B.slug,
            description: `[${A.slug}] = "${ca.value}"${ca.source ? ` (${ca.source})` : ''} · [${B.slug}] = "${cb.value}"${cb.source ? ` (${cb.source})` : ''}`,
          });
        }
      }
    }
  }
  return conflicts;
}

function renderReport(features, conflicts) {
  const out = [
    '# CẢNH BÁO XUNG ĐỘT TRI THỨC CHÉO',
    `Owner: qa-system/tools/knowledge/conflict-detector.js · Thời điểm: ${new Date().toISOString()} · Phạm vi: ${features.length} tính năng`,
    '',
    '> Kết quả từ heuristic từ khoá + so hằng số §9. Không phải bằng chứng hai tính năng nhất quán.',
    '',
  ];
  if (!conflicts.length) {
    out.push('Không phát hiện xung đột bằng heuristic. (Không có nghĩa là không có mâu thuẫn — vẫn rà §10.2 khi đọc tài liệu.)');
  } else {
    out.push(`Phát hiện **${conflicts.length}** điểm có thể mâu thuẫn — đưa vào câu hỏi cho BA (MR), không tự chọn bên nào.`, '',
      '| # | Khía cạnh | Tính năng A | Tính năng B | Chi tiết |', '|---|---|---|---|---|');
    conflicts.forEach((c, k) => out.push(`| ${k + 1} | ${c.type} | ${c.featureA} | ${c.featureB} | ${c.description.replace(/\|/g, '\\|')} |`));
  }
  return out.join('\n') + '\n';
}

function main() {
  const targetSlug = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
  const featuresDir = PATHS.FEATURES;

  if (!fs.existsSync(featuresDir)) {
    console.error('❌ Không có thư mục knowledge/features/.');
    process.exit(1);
  }
  const files = fs.readdirSync(featuresDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
  if (files.length < 2) {
    console.log(`ℹ️ Chỉ có ${files.length} file tri thức tính năng — chưa có gì để so chéo.`);
    return;
  }

  const features = files.map((f) => parseFeatureFile(path.join(featuresDir, f)));
  const target = targetSlug && features.some((f) => f.slug === targetSlug) ? targetSlug : null;
  console.log(`🔍 So chéo ${features.length} tính năng${target ? ` (trọng tâm: ${target})` : ''}:`);
  features.forEach((f) => console.log(`  - [${f.slug}] ${f.title} · ${f.rules.length} BR · ${f.constants.length} hằng số §9`));

  const conflicts = detectConflicts(features, { topics: loadTopics(), target });
  if (!conflicts.length) {
    console.log('\nKhông phát hiện xung đột bằng heuristic.');
  } else {
    console.warn(`\n⚠️ ${conflicts.length} điểm có thể mâu thuẫn — cần BA xác nhận:`);
    conflicts.forEach((c, k) => console.warn(`  [${k + 1}] ${c.type}: ${c.description}`));
  }

  if (targetSlug && fs.existsSync(path.join(PATHS.OUTPUT, targetSlug))) {
    const reportPath = path.join(PATHS.OUTPUT, targetSlug, '01_conflict_warning.md');
    fs.writeFileSync(reportPath, renderReport(features, conflicts), 'utf-8');
    console.log(`\n📄 ${path.relative(PATHS.ROOT, reportPath)}`);
  }
  if (conflicts.length) process.exitCode = 1;
}

if (require.main === module) {
  try { main(); } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}

module.exports = {
  DEFAULT_TOPICS,
  loadTopics,
  phraseStance,
  numbersIn,
  parseConstants,
  parseFeatureFile,
  detectConflicts,
  renderReport,
};

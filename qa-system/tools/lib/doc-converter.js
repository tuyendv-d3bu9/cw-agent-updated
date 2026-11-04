/**
 * doc-converter.js — Đổi tài liệu nguồn sang Markdown sạch, KHÔNG làm mất thông tin.
 *
 *   fileKind(path)                    'convert' | 'asset' | 'reject' | 'unsupported' (+ lý do)
 *   convertDocumentToMarkdown(path)   Markdown = metadata nguồn + nội dung + Annotations
 *   htmlToMarkdown(html)              HTML → Markdown, giữ bảng (gộp ô được lặp/đánh dấu)
 *   stripMetadata(md)                 Bỏ khối metadata (để băm/so trùng không phụ thuộc tên file)
 *   parseSourceMetadata(md)           Đọc lại khối metadata
 *
 * Nguyên tắc (QA_STANDARD §10.2):
 *   - Comment, tracked changes, header/footer, ghi chú ô Excel, sheet ẩn... KHÔNG được trộn vào
 *     nội dung như sự thật. Chúng nằm ở mục cuối `## Annotations / Pending changes`.
 *   - Ảnh không bao giờ thành base64; thay bằng `[IMAGE: <alt hoặc tên file>]`.
 *   - Định dạng không đọc được → ném lỗi rõ ràng. Không đọc mò nhị phân ra "văn bản".
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const yaml = require('js-yaml');
const JSZip = require('jszip');

// ───────────────────────── Loại file ─────────────────────────

/** Đuôi được chuyển thành chữ. */
const SUPPORTED_EXTENSIONS = [
  '.docx', '.pdf', '.xlsx', '.xls', '.csv', '.md', '.txt', '.pptx', '.html', '.htm',
  // Tài liệu kỹ thuật dạng chữ (03_dev)
  '.json', '.yaml', '.yml', '.sql', '.log',
];

/** Ảnh / file thiết kế: giữ nguyên, chuyển vào 04_design/_assets/. */
const ASSET_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.tif', '.tiff',
  '.fig', '.sketch', '.xd',
];

/** Định dạng cũ: từ chối kèm hướng dẫn, không đoán. */
const REJECTED_EXTENSIONS = {
  '.ppt': 'PowerPoint cũ (.ppt) không đọc được. Mở bằng PowerPoint/Keynote, "Save As" .pptx rồi thả lại.',
  '.doc': 'Word cũ (.doc) không đọc được an toàn. Mở bằng Word, "Save As" .docx rồi thả lại.',
};

class UnsupportedDocumentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsupportedDocumentError';
  }
}

function fileKind(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (SUPPORTED_EXTENSIONS.includes(ext)) return { kind: 'convert', ext };
  if (ASSET_EXTENSIONS.includes(ext)) return { kind: 'asset', ext };
  if (REJECTED_EXTENSIONS[ext]) return { kind: 'reject', ext, reason: REJECTED_EXTENSIONS[ext] };
  return {
    kind: 'unsupported',
    ext,
    reason: `Định dạng "${ext || '(không đuôi)'}" không được hỗ trợ. Hỗ trợ: ${SUPPORTED_EXTENSIONS.join(' ')}; ảnh/thiết kế: ${ASSET_EXTENSIONS.join(' ')}.`,
  };
}

// ───────────────────────── Tiện ích chung ─────────────────────────

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/** Metadata file (cho bulk-intake: chống trùng theo nội dung). Không dùng mtime để băm. */
function getFileMetadata(filePath) {
  const stat = fs.statSync(filePath);
  const full = sha256File(filePath);
  return {
    filename: path.basename(filePath),
    sizeBytes: stat.size,
    sizeKb: (stat.size / 1024).toFixed(1) + ' KB',
    mtime: stat.mtime.toISOString().replace('T', ' ').slice(0, 19),
    hash: full.slice(0, 16),
    sha256: full,
  };
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decodeEntities(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

const cellEscape = (s) => String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>').trim();
const oneLine = (s, max = 160) => {
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
};

function renderMdTable(rows) {
  if (!rows.length) return '';
  const maxCols = Math.max(...rows.map((r) => r.length));
  const norm = rows.map((r) => {
    const c = r.map((x) => cellEscape(x));
    while (c.length < maxCols) c.push('');
    return c;
  });
  const out = ['| ' + norm[0].join(' | ') + ' |', '| ' + Array(maxCols).fill('---').join(' | ') + ' |'];
  for (const r of norm.slice(1)) out.push('| ' + r.join(' | ') + ' |');
  return out.join('\n');
}

/** Ảnh nhúng base64 trong Markdown/HTML → placeholder. */
function replaceDataUris(text) {
  return String(text)
    .replace(/!\[([^\]]*)\]\(data:[^)]*\)/gi, (m, alt) => `[IMAGE: ${alt.trim() || 'ảnh nhúng'}]`)
    .replace(/<img\b[^>]*src=["']data:[^"']*["'][^>]*>/gi, (m) => {
      const alt = (m.match(/\balt=["']([^"']*)["']/i) || [])[1];
      return `[IMAGE: ${(alt && alt.trim()) || 'ảnh nhúng'}]`;
    });
}

// ───────────────────────── HTML → Markdown ─────────────────────────

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? decodeEntities(m[2] ?? m[3] ?? m[4] ?? '') : null;
};

function imgPlaceholder(tag) {
  const alt = attr(tag, 'alt');
  const src = attr(tag, 'src') || '';
  const name = src && !src.startsWith('data:') ? path.basename(src.split(/[?#]/)[0]) : '';
  return `[IMAGE: ${(alt && alt.trim()) || name || 'không có mô tả'}]`;
}

/** Nội dung inline (dùng trong ô bảng và đoạn văn). */
function inlineToText(html) {
  return decodeEntities(
    String(html)
      .replace(/<img\b[^>]*>/gi, (t) => imgPlaceholder(t))
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
      .replace(/<li\b[^>]*>/gi, '• ')
      .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
      .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*')
      // Chữ gạch ngang = giá trị đã bị gạch/thay thế. Hiển thị {--…--} để KHÔNG bị đọc như giá trị đang hiệu lực.
      .replace(/<(s|del|strike)\b[^>]*>([\s\S]*?)<\/\1>/gi, '{--$2--}')
      // Chỉ số trên/dưới đổi nghĩa con số: 10^6 không được thành "106".
      .replace(/<sup\b[^>]*>([\s\S]*?)<\/sup>/gi, '^($1)')
      .replace(/<sub\b[^>]*>([\s\S]*?)<\/sub>/gi, '_($1)')
      .replace(/<[^>]+>/g, '')
  )
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * Dựng lưới thật của một bảng HTML, tính rowspan/colspan.
 * Gộp dọc (rowspan): LẶP giá trị ở các dòng dưới — mỗi dòng tự đủ nghĩa (field → ràng buộc → lỗi).
 * Gộp ngang (colspan): giá trị ở ô đầu, các ô còn lại ghi `(gộp ←)`.
 */
function tableHtmlToRows(tableHtml) {
  const grid = [];
  const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let rm;
  let r = 0;
  while ((rm = rowRe.exec(tableHtml)) !== null) {
    grid[r] = grid[r] || [];
    const cellRe = /<(td|th)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
    let cm;
    let c = 0;
    let any = false;
    while ((cm = cellRe.exec(rm[1])) !== null) {
      any = true;
      while (grid[r][c] !== undefined) c++;
      const open = `<td ${cm[2]}>`;
      const colspan = Math.max(1, parseInt(attr(open, 'colspan') || '1', 10) || 1);
      const rowspan = Math.max(1, parseInt(attr(open, 'rowspan') || '1', 10) || 1);
      const text = inlineToText(cm[3]);
      for (let dr = 0; dr < rowspan; dr++) {
        grid[r + dr] = grid[r + dr] || [];
        for (let dc = 0; dc < colspan; dc++) {
          grid[r + dr][c + dc] = dc === 0 ? text : '(gộp ←)';
        }
      }
      c += colspan;
    }
    if (!any) grid.pop();
    else r++;
  }
  return grid
    .filter(Boolean)
    .map((row) => Array.from({ length: row.length }, (_, i) => (row[i] === undefined ? '' : row[i])));
}

/** Thay mọi <table> (kể cả lồng nhau) bằng bảng Markdown; bảng lồng → chữ phẳng trong ô cha. */
function convertTables(html, tokens) {
  let s = String(html);
  for (let guard = 0; guard < 10000; guard++) {
    const re = /<table\b[^>]*>((?:(?!<table\b)[\s\S])*?)<\/table>/i; // bảng trong cùng
    const m = re.exec(s);
    if (!m) break;
    const before = s.slice(0, m.index);
    const depth = (before.match(/<table\b/gi) || []).length - (before.match(/<\/table>/gi) || []).length;
    const rows = tableHtmlToRows(m[0]);
    let rep;
    if (depth > 0) {
      rep = rows.map((row) => row.filter(Boolean).join(' / ')).join(' ; ');
    } else {
      tokens.push(rows.length ? renderMdTable(rows) : '');
      rep = `\u0000T${tokens.length - 1}\u0000`;
    }
    s = before + rep + s.slice(m.index + m[0].length);
  }
  return s;
}

function htmlToMarkdown(html) {
  const tokens = [];
  let s = String(html)
    .replace(/<(script|style|head)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const bodyM = s.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  if (bodyM) s = bodyM[1];
  s = convertTables(s, tokens);

  const parts = s.split(/(<[^>]+>)/);
  let out = '';
  const lists = [];
  let href = null;
  for (const part of parts) {
    if (!part) continue;
    if (part[0] !== '<') {
      out += decodeEntities(part.replace(/\s+/g, ' '));
      continue;
    }
    const m = part.match(/^<\s*(\/)?\s*([a-z0-9]+)/i);
    if (!m) continue;
    const close = !!m[1];
    const tag = m[2].toLowerCase();
    if (/^h[1-6]$/.test(tag)) {
      out += close ? '\n\n' : `\n\n${'#'.repeat(+tag[1])} `;
    } else if (tag === 'p' || tag === 'div' || tag === 'section' || tag === 'article') {
      out += lists.length ? (close ? '' : ' ') : '\n\n';
    } else if (tag === 'br') {
      out += lists.length ? ' ' : '  \n';
    } else if (tag === 'ul' || tag === 'ol') {
      if (close) lists.pop();
      else lists.push({ type: tag, n: 0 });
      out += '\n';
    } else if (tag === 'li' && !close) {
      const l = lists[lists.length - 1] || { type: 'ul', n: 0 };
      l.n++;
      out += `\n${'  '.repeat(Math.max(0, lists.length - 1))}${l.type === 'ol' ? l.n + '.' : '-'} `;
    } else if (tag === 's' || tag === 'del' || tag === 'strike') {
      out += close ? '--}' : '{--';
    } else if (tag === 'sup') {
      out += close ? ')' : '^(';
    } else if (tag === 'sub') {
      out += close ? ')' : '_(';
    } else if (tag === 'strong' || tag === 'b') {
      out += '**';
    } else if (tag === 'em' || tag === 'i') {
      out += '*';
    } else if (tag === 'a') {
      if (!close) {
        href = attr(part, 'href');
        if (href) out += '[';
      } else if (href) {
        out += `](${href})`;
        href = null;
      }
    } else if (tag === 'img') {
      out += imgPlaceholder(part);
    } else if (tag === 'hr') {
      out += '\n\n---\n\n';
    }
  }
  out = out
    .replace(/\s*\u0000T(\d+)\u0000\s*/g, (_, i) => `\n\n${tokens[+i]}\n\n`)
    .replace(/\*\*\s*\*\*/g, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/^[ \t]+(?![-\d])/gm, '')
    .replace(/\n{3,}/g, '\n\n');
  return out.trim();
}

/** Hậu xử lý Markdown của nguồn chữ (.md/.txt/...). */
function cleanMarkdown(raw) {
  if (!raw) return '';
  let md = replaceDataUris(raw);
  // Bảng HTML nhúng trong Markdown → bảng Markdown (giữ gộp ô)
  if (/<table\b/i.test(md)) {
    const tokens = [];
    md = convertTables(md, tokens).replace(/\u0000T(\d+)\u0000/g, (_, i) => `\n\n${tokens[+i]}\n\n`);
  }
  md = md.replace(/<a\s+(?:id|name)="[^"]*">\s*<\/a>/gi, '');
  md = md.replace(/[ \t]+$/gm, '');
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

// ───────────────────────── Metadata & Annotations ─────────────────────────

const META_KEYS = ['source_file', 'sha256', 'title', 'version', 'status', 'date', 'last_modified', 'last_modified_by'];

function renderMetadata(meta) {
  const lines = ['<!-- SOURCE_METADATA (intake ghi; dùng cho QA_STANDARD §10.2 — bản nào mới hơn)'];
  for (const k of META_KEYS) {
    if (meta[k] !== undefined && meta[k] !== null && String(meta[k]).trim() !== '') {
      lines.push(`${k}: ${String(meta[k]).replace(/-->/g, '—>').replace(/\s+/g, ' ').trim()}`);
    }
  }
  lines.push('-->');
  return lines.join('\n');
}

function parseSourceMetadata(md) {
  const m = String(md).match(/<!-- SOURCE_METADATA[^\n]*\n([\s\S]*?)-->/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z_0-9]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2];
  }
  return out;
}

/** Bỏ khối metadata (SOURCE_METADATA và TRACEABILITY_METADATA cũ). */
function stripMetadata(md) {
  return String(md)
    .replace(/<!-- (?:SOURCE_METADATA|TRACEABILITY_METADATA)[\s\S]*?-->\s*/g, '')
    .replace(/^\s+/, '');
}

const ANNOTATION_HEADING = '## Annotations / Pending changes';

function renderAnnotations(items, { always = false } = {}) {
  if (!items.length && !always) return '';
  const out = [
    ANNOTATION_HEADING,
    '> Trích tự động khi intake. **Chưa phải sự thật** (QA_STANDARD §10.2): mỗi dòng cần BA/PO xác nhận — sinh MR, không dùng làm rule.',
    '',
  ];
  if (!items.length) {
    out.push('Không phát hiện comment, tracked change, header/footer hay nội dung ẩn.');
  } else {
    out.push('| # | Loại | Vị trí / gần đoạn | Nội dung |', '|---|---|---|---|');
    items.forEach((it, i) => out.push(`| ${i + 1} | ${cellEscape(it.type)} | ${cellEscape(it.location || '')} | ${cellEscape(it.content || '')} |`));
  }
  return out.join('\n');
}

function renderWarnings(warnings) {
  if (!warnings.length) return '';
  return ['> [!WARNING]', '> Cảnh báo khi chuyển đổi — phần nội dung liên quan có thể bị thiếu/méo, đối chiếu file gốc:',
    ...warnings.map((w) => `> - ${oneLine(w, 300)}`)].join('\n');
}

function assemble({ meta, body, annotations = [], warnings = [], alwaysAnnotations = false }) {
  return [renderMetadata(meta), renderWarnings(warnings), body.trim(), renderAnnotations(annotations, { always: alwaysAnnotations })]
    .filter((x) => x && x.trim())
    .join('\n\n') + '\n';
}

/** Đoán version từ chữ (header, tiêu đề, đầu tài liệu). */
function guessVersion(text) {
  const t = String(text);
  const m = t.match(/(?:phiên bản|phien ban|version|ver\.?)\s*[:#]?\s*v?(\d+(?:\.\d+)*)/i)
    || t.match(/(?<![\p{L}\p{N}])v(\d+(?:\.\d+)+)(?![\p{L}\p{N}])/iu)
    || t.match(/(?<![\p{L}\p{N}])v(\d+)(?![\p{L}\p{N}.])/iu);
  return m ? m[1] : null;
}

const FROM_BODY = '(trích từ thân tài liệu)';

/** "28/10/2026", "2026-10-28", "28-10-2026", "28.10.2026" → "2026-10-28"; không nhận ra → null. */
function normalizeDate(s) {
  const t = String(s).trim();
  let m = t.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = t.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
}

/**
 * Metadata khai NGAY TRONG THÂN tài liệu (dòng "Version: 1.2", ô bảng "| Ngày | 28/10/2026 |"…).
 * Chỉ đọc phần đầu tài liệu; mỗi giá trị gắn nhãn `(trích từ thân tài liệu)`.
 */
function bodyMetadata(body) {
  const text = String(body).replace(/<!--[\s\S]*?-->/g, '');
  const head = text.split('\n').slice(0, 80).map((l) => l.replace(/[*_`]/g, '')).join('\n');
  const SEP = '\\s*(?:[:：]|\\|)\\s*';
  const field = (labels) => new RegExp(`(?:^|\\|\\s*|\\n)\\s*(?:${labels})${SEP}([^\\n|]+)`, 'imu');
  const out = {};
  const h1 = text.match(/^#\s+(.+?)\s*$/m);
  // H1 do chính converter tự đặt (Data Sheet:, Document:, Presentation:) không phải tiêu đề của tác giả.
  if (h1 && !/^(Data Sheet|Document|Presentation|Data Configuration):/.test(h1[1])) out.title = `${h1[1].replace(/[*_`]/g, '').trim()} ${FROM_BODY}`;
  const v = head.match(field('phiên bản|phien ban|version|ver\\.?'));
  if (v) {
    const val = v[1].trim().replace(/^v(?=\d)/i, '');
    if (val) out.version = `${val} ${FROM_BODY}`;
  }
  const d = head.match(field('ngày cập nhật|ngay cap nhat|ngày ban hành|ngày phát hành|ngày|ngay|last updated|updated|date'));
  if (d) {
    const nd = normalizeDate(d[1]);
    if (nd) out.date = `${nd} ${FROM_BODY}`;
  }
  const st = head.match(field('trạng thái|trang thai|status'));
  if (st && st[1].trim()) out.status = `${st[1].trim()} ${FROM_BODY}`;
  return out;
}

/** docProps/core.xml (docx/xlsx/pptx). */
async function readCoreProps(zip) {
  const f = zip.file('docProps/core.xml');
  if (!f) return {};
  const xml = await f.async('string');
  const get = (tag) => {
    const m = xml.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`));
    return m ? decodeEntities(m[1]).trim() : '';
  };
  return {
    title: get('dc:title'),
    version: get('cp:version'),
    revision: get('cp:revision'),
    status: get('cp:contentStatus'),
    created: get('dcterms:created'),
    modified: get('dcterms:modified'),
    lastModifiedBy: get('cp:lastModifiedBy'),
  };
}

// ───────────────────────── DOCX ─────────────────────────

/** Chữ của một đoạn XML Word. mode: 'before' (bỏ ins, giữ del), 'after' (bỏ del), 'all'. */
function wordText(xml, mode = 'after') {
  let s = String(xml).replace(/<w:(ins|del|moveFrom|moveTo)\b[^>]*\/>/g, '');
  if (mode === 'before') s = s.replace(/<w:(ins|moveTo)\b[^>]*>[\s\S]*?<\/w:\1>/g, '');
  if (mode === 'after') s = s.replace(/<w:(del|moveFrom)\b[^>]*>[\s\S]*?<\/w:\1>/g, '');
  let out = '';
  const re = /<w:(t|delText)\b[^>]*>([\s\S]*?)<\/w:\1>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    if (m[2] !== undefined) out += decodeEntities(m[2]);
    else out += ' ';
  }
  return out.replace(/\s+/g, ' ').trim();
}

const paragraphs = (xml) => String(xml).match(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g) || [];

function docxTrackedChanges(docXml) {
  const items = [];
  for (const p of paragraphs(docXml)) {
    const clean = p.replace(/<w:(ins|del|moveFrom|moveTo)\b[^>]*\/>/g, '');
    const ins = [...clean.matchAll(/<w:(ins|moveTo)\b[^>]*>([\s\S]*?)<\/w:\1>/g)];
    const del = [...clean.matchAll(/<w:(del|moveFrom)\b[^>]*>([\s\S]*?)<\/w:\1>/g)];
    if (!ins.length && !del.length) continue;
    const author = (clean.match(/<w:(?:ins|del)\b[^>]*w:author="([^"]*)"/) || [])[1];
    const date = (clean.match(/<w:(?:ins|del)\b[^>]*w:date="([^"]*)"/) || [])[1];
    const insT = ins.map((m) => wordText(m[2], 'all')).filter(Boolean);
    const delT = del.map((m) => wordText(m[2], 'all')).filter(Boolean);
    const kinds = [insT.length ? `chèn "${insT.join('", "')}"` : '', delT.length ? `xoá "${delT.join('", "')}"` : ''].filter(Boolean).join('; ');
    items.push({
      type: `Tracked change (chưa duyệt)${author ? ' · ' + author : ''}${date ? ' · ' + date.slice(0, 10) : ''}`,
      location: oneLine(wordText(clean, 'after') || wordText(clean, 'before')),
      content: `${kinds}. Bản TRƯỚC: "${oneLine(wordText(clean, 'before'), 200)}" → Bản SAU nếu chấp nhận: "${oneLine(wordText(clean, 'after'), 200)}"`,
    });
  }
  return items;
}

/**
 * Đánh dấu tracked change ngay trong thân bài bằng CriticMarkup: `{--cũ--}{++mới++}`.
 * Mammoth mặc định chấp nhận âm thầm phần chèn và bỏ phần xoá — mất dấu "chưa duyệt".
 */
function markTrackedChanges(docXml) {
  const run = (t) => `<w:r><w:t xml:space="preserve">${t.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</w:t></w:r>`;
  return String(docXml)
    .replace(/<w:(ins|del|moveFrom|moveTo)\b[^>]*\/>/g, '')
    .replace(/<w:(del|moveFrom)\b[^>]*>([\s\S]*?)<\/w:\1>/g, (m, tag, inner) => {
      const t = wordText(inner, 'all');
      return t ? run(`{--${t}--}`) : '';
    })
    .replace(/<w:(ins|moveTo)\b[^>]*>([\s\S]*?)<\/w:\1>/g, (m, tag, inner) => `${run('{++')}${inner}${run('++}')}`);
}

async function docxComments(zip, docXml) {
  const f = zip.file('word/comments.xml');
  if (!f) return [];
  const xml = await f.async('string');
  const items = [];
  const anchors = {};
  for (const p of paragraphs(docXml)) {
    for (const m of p.matchAll(/<w:comment(?:RangeStart|Reference)\b[^>]*w:id="(\d+)"/g)) {
      if (!anchors[m[1]]) anchors[m[1]] = wordText(p, 'after');
    }
  }
  // Đoạn văn bị comment trỏ đúng vào (giữa RangeStart và RangeEnd)
  const exact = {};
  for (const m of String(docXml).matchAll(/<w:commentRangeStart\b[^>]*w:id="(\d+)"[^>]*\/>([\s\S]*?)<w:commentRangeEnd\b[^>]*w:id="\1"/g)) {
    exact[m[1]] = wordText(m[2], 'after');
  }
  for (const m of xml.matchAll(/<w:comment\b([^>]*)>([\s\S]*?)<\/w:comment>/g)) {
    const id = (m[1].match(/w:id="(\d+)"/) || [])[1];
    const author = (m[1].match(/w:author="([^"]*)"/) || [])[1];
    const date = (m[1].match(/w:date="([^"]*)"/) || [])[1];
    const text = paragraphs(m[2]).map((p) => wordText(p, 'after')).filter(Boolean).join(' / ');
    const near = exact[id] ? `"${oneLine(exact[id], 80)}" trong đoạn: ${oneLine(anchors[id] || '')}` : oneLine(anchors[id] || '(không xác định)');
    items.push({
      type: `Comment${author ? ' · ' + decodeEntities(author) : ''}${date ? ' · ' + date.slice(0, 10) : ''}`,
      location: near,
      content: text,
    });
  }
  return items;
}

async function docxHeadersFooters(zip) {
  const items = [];
  const files = Object.keys(zip.files).filter((k) => /^word\/(header|footer)\d*\.xml$/.test(k)).sort();
  const seen = new Set();
  for (const k of files) {
    const xml = await zip.file(k).async('string');
    const text = paragraphs(xml).map((p) => wordText(p, 'after')).filter(Boolean).join(' / ');
    if (!text || seen.has(text)) continue;
    seen.add(text);
    const isHeader = k.includes('header');
    const draft = /\b(draft|nháp|bản nháp|chưa duyệt|wip)\b/i.test(text) ? ' — có dấu DRAFT/nháp' : '';
    items.push({ type: isHeader ? 'Header' : 'Footer', location: path.basename(k), content: text + draft });
  }
  return items;
}

/** Danh sách ảnh theo thứ tự xuất hiện: alt (descr/title) và tên file media. */
async function docxImageInfo(zip, docXml) {
  const relsF = zip.file('word/_rels/document.xml.rels');
  const rels = {};
  if (relsF) {
    const x = await relsF.async('string');
    for (const m of x.matchAll(/<Relationship\b([^>]*)\/?>/g)) {
      const id = (m[1].match(/\bId="([^"]*)"/) || [])[1];
      const target = (m[1].match(/\bTarget="([^"]*)"/) || [])[1];
      if (id && target) rels[id] = target;
    }
  }
  const infos = [];
  for (const m of String(docXml).matchAll(/<w:(drawing|pict)\b[\s\S]*?<\/w:\1>/g)) {
    const d = m[0];
    const descr = [...d.matchAll(/\b(?:descr|title)="([^"]+)"/g)].map((x) => decodeEntities(x[1]).trim()).find(Boolean);
    const embed = (d.match(/r:(?:embed|id)="([^"]+)"/) || [])[1];
    const name = (d.match(/<(?:wp:docPr|pic:cNvPr)\b[^>]*\bname="([^"]+)"/) || [])[1];
    infos.push({ alt: descr || '', file: embed && rels[embed] ? path.basename(rels[embed]) : (name || '') });
  }
  return infos;
}

/** Chữ ẩn trong docx (w:vanish): mammoth vẫn xuất như chữ thường, nên phải báo ra để người dùng xác nhận. */
function docxHiddenText(docXml) {
  const out = [];
  for (const m of String(docXml).matchAll(/<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g)) {
    const run = m[1];
    const v = run.match(/<w:vanish\b([^>]*)\/?>/);
    if (!v || /w:val="(?:0|false|off)"/i.test(v[1])) continue;
    const text = [...run.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g)].map((t) => decodeEntities(t[1])).join('').trim();
    if (text) out.push(text);
  }
  return out;
}

async function docxParts(filePath) {
  const buffer = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(buffer);
  const docFile = zip.file('word/document.xml');
  if (!docFile) throw new Error('File .docx hỏng: không có word/document.xml');
  const docXml = await docFile.async('string');

  const tracked = docxTrackedChanges(docXml);
  const comments = await docxComments(zip, docXml);
  const hf = await docxHeadersFooters(zip);
  const core = await readCoreProps(zip);
  const images = await docxImageInfo(zip, docXml);

  zip.file('word/document.xml', markTrackedChanges(docXml));
  const marked = await zip.generateAsync({ type: 'nodebuffer' });

  let imgIdx = 0;
  const result = await mammoth.convertToHtml({ buffer: marked }, {
    convertImage: mammoth.images.imgElement((image) => {
      const info = images[imgIdx] || {};
      imgIdx++;
      const label = (image.altText && image.altText.trim()) || info.alt || info.file || `image-${imgIdx}`;
      return Promise.resolve({ src: `qa-image:${imgIdx}`, alt: label });
    }),
  });

  const body = htmlToMarkdown(result.value);
  const warnings = (result.messages || []).map((m) => `${m.type}: ${m.message}`);
  if (/<(s|del|strike)\b/i.test(result.value)) {
    warnings.push('Có chữ GẠCH NGANG, hiển thị dạng {--…--}: đó là giá trị đã bị gạch/thay thế — không dùng làm rule hiện hành.');
  }
  const hiddenRuns = docxHiddenText(docXml);
  for (const text of hiddenRuns.slice(0, 20)) {
    tracked.push({ type: 'Chữ ẩn (w:vanish)', location: 'trong thân tài liệu', content: `"${oneLine(text, 200)}" — chữ này bị ẨN trong file gốc nhưng vẫn nằm trong nội dung ở trên; cần xác nhận còn hiệu lực không.` });
  }
  const hfText = hf.map((h) => h.content).join(' ');
  let version = core.version || null;
  if (!version) {
    const g = guessVersion(hfText) || guessVersion(core.title);
    if (g) version = `${g} (suy từ header/tiêu đề, chưa chắc)`;
  }
  const meta = {
    title: core.title,
    version,
    status: core.status || (/\b(draft|nháp)\b/i.test(hfText) ? 'DRAFT (theo header/footer)' : ''),
    date: core.created,
    last_modified: core.modified,
    last_modified_by: core.lastModifiedBy,
  };
  return { meta, body, annotations: [...tracked, ...comments, ...hf], warnings, alwaysAnnotations: true };
}

// ───────────────────────── Excel / CSV ─────────────────────────

const nonEmpty = (row) => row.filter((c) => String(c).trim() !== '').length;

function sheetToParts(sheet, name, { hidden = 0, raw = false } = {}) {
  const ref = sheet['!ref'];
  if (!ref) return { md: '', annotations: [] };
  const merges = Array.isArray(sheet['!merges']) ? sheet['!merges'] : [];

  const rows0 = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw, rawNumbers: false, dateNF: 'yyyy-mm-dd', blankrows: true });
  // Dòng header thật = dòng đầu tiên có ≥ 2 ô có chữ (bỏ dòng tiêu đề gộp ô ở trên).
  let headerIdx = rows0.findIndex((r) => nonEmpty(r) >= 2);
  if (headerIdx === -1) headerIdx = rows0.findIndex((r) => nonEmpty(r) >= 1);
  if (headerIdx === -1) return { md: '', annotations: [] };

  // Lặp giá trị ô gộp — chỉ trong vùng bảng (bỏ gộp của dòng tiêu đề).
  const range = XLSX.utils.decode_range(ref);
  for (const mg of merges) {
    if (mg.s.r - range.s.r < headerIdx) continue;
    const start = sheet[XLSX.utils.encode_cell(mg.s)];
    if (!start) continue;
    for (let R = mg.s.r; R <= mg.e.r; R++) {
      for (let C = mg.s.c; C <= mg.e.c; C++) {
        if (R === mg.s.r && C === mg.s.c) continue;
        const k = XLSX.utils.encode_cell({ r: R, c: C });
        const cur = sheet[k];
        if (!cur || cur.v === undefined || String(cur.v).trim() === '') sheet[k] = { ...start, c: undefined };
      }
    }
  }
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw, rawNumbers: false, dateNF: 'yyyy-mm-dd', blankrows: true });

  const title = rows.slice(0, headerIdx).filter((r) => nonEmpty(r)).map((r) => r.filter((c) => String(c).trim()).join(' '));
  const table = rows.slice(headerIdx).filter((r) => nonEmpty(r)).map((r) => r.map((c) => (c instanceof Date ? c.toISOString().slice(0, 10) : String(c))));

  const hiddenTag = hidden === 2 ? ' (HIDDEN SHEET — very hidden)' : hidden ? ' (HIDDEN SHEET)' : '';
  let md = `## Sheet: ${name}${hiddenTag}\n\n`;
  if (hidden) md += `> Sheet này bị ẨN trong file gốc — có thể là dữ liệu cũ/đã bỏ. Không dùng làm rule nếu chưa xác nhận.\n\n`;
  if (title.length) md += title.map((t) => `**${t}**`).join('  \n') + '\n\n';
  md += renderMdTable(table);

  const annotations = [];
  if (hidden) annotations.push({ type: hidden === 2 ? 'Sheet ẩn (very hidden)' : 'Sheet ẩn', location: `Sheet "${name}"`, content: 'Nội dung sheet ẩn đã xuất kèm nhãn (HIDDEN SHEET); cần xác nhận còn hiệu lực không.' });
  const hiddenRows = (sheet['!rows'] || []).map((r, i) => (r && r.hidden ? i + 1 : null)).filter(Boolean);
  const hiddenCols = (sheet['!cols'] || []).map((cl, i) => (cl && cl.hidden ? XLSX.utils.encode_col(i) : null)).filter(Boolean);
  if (hiddenRows.length || hiddenCols.length) {
    annotations.push({
      type: 'Dòng/cột ẩn',
      location: `Sheet "${name}"${hiddenRows.length ? ` — dòng ${hiddenRows.slice(0, 20).join(', ')}` : ''}${hiddenCols.length ? ` — cột ${hiddenCols.join(', ')}` : ''}`,
      content: 'Nội dung này VẪN nằm trong bảng ở trên nhưng bị ẩn trong file gốc; cần xác nhận còn hiệu lực không.',
    });
  }
  for (const k of Object.keys(sheet)) {
    if (k[0] === '!') continue;
    const cell = sheet[k];
    if (cell && Array.isArray(cell.c) && cell.c.length) {
      for (const cm of cell.c) {
        const value = cell.w !== undefined ? cell.w : cell.v;
        annotations.push({ type: `Cell comment${cm.a ? ' · ' + cm.a : ''}`, location: `${name}!${k} (giá trị: ${oneLine(value ?? '', 60)})`, content: oneLine(cm.t || '', 300) });
      }
    }
  }
  return { md, annotations };
}

function workbookParts(workbook, filePath, { raw = false } = {}) {
  const sheetsMeta = (workbook.Workbook && workbook.Workbook.Sheets) || [];
  const sections = [];
  const annotations = [];
  workbook.SheetNames.forEach((name, i) => {
    const sheet = workbook.Sheets[name];
    if (!sheet) return;
    const hidden = (sheetsMeta[i] && sheetsMeta[i].Hidden) || 0;
    const r = sheetToParts(sheet, name, { hidden, raw });
    if (r.md) sections.push(r.md);
    annotations.push(...r.annotations);
  });
  const baseTitle = path.basename(filePath, path.extname(filePath));
  const body = `# Data Sheet: ${baseTitle}\n\n` + (sections.length ? sections.join('\n\n---\n\n') : '*[Workbook rỗng]*');
  const p = workbook.Props || {};
  const meta = {
    title: p.Title,
    version: guessVersion(`${p.Title || ''} ${baseTitle}`) ? `${guessVersion(`${p.Title || ''} ${baseTitle}`)} (suy từ tiêu đề/tên file, chưa chắc)` : '',
    date: p.CreatedDate instanceof Date ? p.CreatedDate.toISOString() : p.CreatedDate,
    last_modified: p.ModifiedDate instanceof Date ? p.ModifiedDate.toISOString() : p.ModifiedDate,
    last_modified_by: p.LastAuthor,
  };
  return { meta, body, annotations };
}

function excelParts(filePath) {
  const workbook = XLSX.readFile(filePath, { cellDates: true, cellNF: true, cellText: true, cellStyles: true });
  return { ...workbookParts(workbook, filePath), alwaysAnnotations: true };
}

/**
 * Đọc file văn bản: UTF-8 (có/không BOM) và UTF-16 có BOM. Byte không hợp lệ ⇒ NÉM LỖI (không đọc bừa):
 * file UTF-16 không BOM hay Windows-1258 từng bị giải mã thành chữ rác, vẫn được nhận vào INPUT/, bản gốc bị xoá.
 */
function readText(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) return new TextDecoder('utf-16le').decode(buf.subarray(2));
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) return new TextDecoder('utf-16be').decode(buf.subarray(2));
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(buf);
    return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  } catch {
    throw new Error(`${path.basename(filePath)} không đọc được bằng UTF-8 (có thể UTF-16 không BOM hoặc Windows-1258) — lưu lại dạng UTF-8 rồi nhận lại`);
  }
}

/** CSV luôn đọc như UTF-8 (bỏ BOM). Giữ giá trị nguyên văn (không đổi "001" → 1). */
function csvParts(filePath) {
  const text = readText(filePath);
  const workbook = XLSX.read(text, { type: 'string', raw: true });
  return { ...workbookParts(workbook, filePath, { raw: true }), warnings: [] };
}

// ───────────────────────── PDF ─────────────────────────

const LOW_TEXT_PER_PAGE = 30;

const pdfDate = (s) => {
  const m = String(s || '').match(/D:(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?/);
  return m ? `${m[1]}-${m[2] || '01'}-${m[3] || '01'}${m[4] ? `T${m[4]}:${m[5] || '00'}` : ''}` : (s || '');
};

async function pdfParts(filePath) {
  const data = fs.readFileSync(filePath);
  let pages = [];
  let info = {};
  if (pdfParse.PDFParse) {
    const parser = new pdfParse.PDFParse({ data });
    try {
      const r = await parser.getText();
      pages = (r.pages || []).map((p) => p.text || '');
      try {
        const i = await parser.getInfo();
        info = (i && i.info) || {};
      } catch { /* metadata không bắt buộc */ }
    } finally {
      if (parser.destroy) await parser.destroy();
    }
  } else if (typeof pdfParse === 'function') {
    const r = await pdfParse(data, {
      pagerender: (pd) => pd.getTextContent().then((tc) => {
        const t = tc.items.map((x) => x.str).join(' ');
        pages.push(t);
        return t;
      }),
    });
    info = r.info || {};
  }

  const warnings = [];
  const body = [];
  pages.forEach((t, i) => {
    const clean = String(t).replace(/\r\n/g, '\n').trim();
    if (clean.replace(/\s/g, '').length < LOW_TEXT_PER_PAGE) {
      warnings.push(`page ${i + 1} có thể là ảnh scan (chỉ ${clean.replace(/\s/g, '').length} ký tự trích được) — kiểm tra trực quan.`);
    }
    body.push(`<!-- page ${i + 1} -->\n${clean}`);
  });
  if (!pages.length) warnings.push('Không trích được trang nào — có thể là PDF scan/ảnh hoặc bị mã hoá.');
  warnings.push('PDF: bảng bị làm phẳng thành dòng chữ — đối chiếu bảng với file gốc.');

  const baseTitle = path.basename(filePath, path.extname(filePath));
  const md = `# Document: ${baseTitle}\n\n> Tổng số trang: ${pages.length}\n\n` + body.join('\n\n---\n\n');
  const meta = {
    title: info.Title,
    version: guessVersion(`${info.Title || ''} ${baseTitle}`) ? `${guessVersion(`${info.Title || ''} ${baseTitle}`)} (suy từ tiêu đề/tên file, chưa chắc)` : '',
    date: pdfDate(info.CreationDate),
    last_modified: pdfDate(info.ModDate),
  };
  return { meta, body: md, warnings };
}

// ───────────────────────── API spec (JSON/YAML) ─────────────────────────

function convertApiSpec(filePath, parsedData, rawContent) {
  const baseTitle = path.basename(filePath, path.extname(filePath));
  const METHODS = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
  const safe = (s) => String(s || '').replace(/\r?\n/g, ' ').replace(/\|/g, '-');

  if (parsedData && (parsedData.openapi || parsedData.swagger) && parsedData.paths) {
    const info = parsedData.info || {};
    let md = `# API Specification: ${info.title || baseTitle}\n`;
    md += `Version: ${info.version || '(không ghi)'} · Format: ${parsedData.openapi ? 'OpenAPI ' + parsedData.openapi : 'Swagger ' + parsedData.swagger}\n\n`;
    if (info.description) md += `${String(info.description).trim()}\n\n`;
    md += `---\n\n## Endpoints Overview\n\n`;
    const rows = [];
    for (const [route, methods] of Object.entries(parsedData.paths)) {
      if (!methods || typeof methods !== 'object') continue;
      for (const [method, d] of Object.entries(methods)) {
        if (METHODS.includes(method.toLowerCase())) rows.push(`| \`${method.toUpperCase()}\` | \`${route}\` | ${safe(d.summary || d.description)} |`);
      }
    }
    if (rows.length) md += `| Method | Endpoint | Summary |\n|---|---|---|\n${rows.join('\n')}\n\n---\n\n`;
    md += `## Endpoint Specifications\n\n`;
    for (const [route, methods] of Object.entries(parsedData.paths)) {
      if (!methods || typeof methods !== 'object') continue;
      for (const [method, d] of Object.entries(methods)) {
        if (!METHODS.includes(method.toLowerCase())) continue;
        md += `### \`${method.toUpperCase()} ${route}\`\n\n`;
        if (d.summary) md += `**Summary**: ${d.summary}\n\n`;
        if (d.description && d.description !== d.summary) md += `**Description**: ${String(d.description).trim()}\n\n`;
        if (Array.isArray(d.parameters) && d.parameters.length) {
          md += `#### Parameters:\n| Name | In | Required | Type / Schema | Description |\n|---|---|---|---|---|\n`;
          for (const p of d.parameters) {
            md += `| \`${p.name}\` | \`${p.in || 'query'}\` | ${p.required ? 'Yes' : 'No'} | \`${p.type || (p.schema ? p.schema.type : '') || '(không ghi)'}\` | ${safe(p.description)} |\n`;
          }
          md += '\n';
        }
        if (d.responses && typeof d.responses === 'object') {
          md += `#### Responses:\n| Status Code | Description |\n|---|---|\n`;
          for (const [code, resp] of Object.entries(d.responses)) md += `| \`${code}\` | ${safe(resp && resp.description)} |\n`;
          md += '\n';
        }
        md += `---\n\n`;
      }
    }
    return cleanMarkdown(md);
  }

  if (parsedData && (parsedData.info?._postman_id || (Array.isArray(parsedData.item) && parsedData.info))) {
    const info = parsedData.info || {};
    let md = `# Postman Collection: ${info.name || baseTitle}\n\n`;
    if (info.description) md += `${String(info.description).trim()}\n\n`;
    md += `---\n\n## Requests List\n\n| Method | URL / Path | Name |\n|---|---|---|\n`;
    (function walk(items) {
      for (const it of items) {
        if (it.request) {
          const u = typeof it.request.url === 'string' ? it.request.url : (it.request.url?.raw || '');
          md += `| \`${it.request.method || 'GET'}\` | \`${u}\` | ${it.name || ''} |\n`;
        }
        if (Array.isArray(it.item)) walk(it.item);
      }
    })(Array.isArray(parsedData.item) ? parsedData.item : []);
    return cleanMarkdown(md);
  }

  const isYaml = /\.ya?ml$/i.test(filePath);
  return `# Data Configuration: ${baseTitle}\n\n\`\`\`${isYaml ? 'yaml' : 'json'}\n${String(rawContent).trim()}\n\`\`\`\n`;
}

// ───────────────────────── PPTX ─────────────────────────

async function pptxParts(filePath) {
  const zip = await JSZip.loadAsync(fs.readFileSync(filePath));
  const slideFiles = Object.keys(zip.files)
    .filter((k) => /^ppt\/slides\/slide\d+\.xml$/.test(k))
    .sort((a, b) => parseInt(a.match(/(\d+)\.xml/)[1], 10) - parseInt(b.match(/(\d+)\.xml/)[1], 10));

  const txt = (xml) => [...String(xml).matchAll(/<a:t\b[^>]*>([\s\S]*?)<\/a:t>/g)].map((m) => decodeEntities(m[1])).join('').trim();
  const slidesMd = [];
  const annotations = [];
  for (let i = 0; i < slideFiles.length; i++) {
    const slideXml = await zip.files[slideFiles[i]].async('string');
    const noTables = slideXml.replace(/<a:tbl\b[\s\S]*?<\/a:tbl>/g, '');
    const lines = [];
    for (const m of noTables.matchAll(/<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g)) {
      const t = txt(m[1]);
      if (t && !lines.includes(t)) lines.push(t);
    }
    const tables = [];
    for (const tm of slideXml.matchAll(/<a:tbl\b[^>]*>([\s\S]*?)<\/a:tbl>/g)) {
      const rows = [...tm[1].matchAll(/<a:tr\b[^>]*>([\s\S]*?)<\/a:tr>/g)].map((r) =>
        [...r[1].matchAll(/<a:tc\b[^>]*>([\s\S]*?)<\/a:tc>/g)].map((c) => [...c[1].matchAll(/<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g)].map((p) => txt(p[1])).filter(Boolean).join(' ')));
      if (rows.length) tables.push(renderMdTable(rows));
    }
    const pics = [...slideXml.matchAll(/<p:cNvPr\b[^>]*>/g)].filter((m) => /descr=/.test(m[0])).map((m) => `[IMAGE: ${attr(m[0], 'descr')}]`);
    let md = `## Slide ${i + 1}\n\n`;
    md += lines.length ? lines.map((l) => `- ${l}`).join('\n') + '\n\n' : '*[Slide không có chữ hoặc chỉ chứa ảnh]*\n\n';
    if (pics.length) md += pics.join('\n') + '\n\n';
    if (tables.length) md += tables.join('\n\n') + '\n\n';
    slidesMd.push(md);

    const notesF = zip.file(`ppt/notesSlides/notesSlide${slideFiles[i].match(/(\d+)\.xml/)[1]}.xml`);
    if (notesF) {
      const n = [...(await notesF.async('string')).matchAll(/<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g)].map((m) => txt(m[1])).filter((t) => t && !/^\d+$/.test(t)).join(' / ');
      if (n) annotations.push({ type: 'Speaker notes', location: `Slide ${i + 1}`, content: n });
    }
  }
  const core = await readCoreProps(zip);
  const baseTitle = path.basename(filePath, path.extname(filePath));
  const body = `# Presentation: ${baseTitle}\n\n> Tổng số slide: ${slideFiles.length}\n\n---\n\n` + slidesMd.join('\n---\n\n');
  return {
    meta: { title: core.title, version: core.version, status: core.status, date: core.created, last_modified: core.modified, last_modified_by: core.lastModifiedBy },
    body,
    annotations,
  };
}

// ───────────────────────── DOC (macOS textutil, chỉ khi ra UTF-8 sạch) ─────────────────────────

function docParts(filePath) {
  if (process.platform !== 'darwin') throw new UnsupportedDocumentError(REJECTED_EXTENSIONS['.doc']);
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'qa-doc-')), 'out.txt');
  try {
    execFileSync('textutil', ['-convert', 'txt', '-encoding', 'UTF-8', filePath, '-output', tmp], { stdio: 'pipe' });
    const buf = fs.readFileSync(tmp);
    let text;
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(buf);
    } catch {
      throw new UnsupportedDocumentError(REJECTED_EXTENSIONS['.doc']);
    }
    if (!text.trim() || text.includes('\uFFFD')) throw new UnsupportedDocumentError(REJECTED_EXTENSIONS['.doc']);
    const baseTitle = path.basename(filePath, path.extname(filePath));
    return {
      meta: {},
      body: `# Document: ${baseTitle}\n\n${cleanMarkdown(text)}`,
      warnings: ['Chuyển từ .doc cũ bằng textutil: bảng, comment, tracked changes, header/footer KHÔNG được giữ. Nên lưu lại dạng .docx.'],
    };
  } catch (e) {
    if (e instanceof UnsupportedDocumentError) throw e;
    throw new UnsupportedDocumentError(REJECTED_EXTENSIONS['.doc']);
  } finally {
    fs.rmSync(path.dirname(tmp), { recursive: true, force: true });
  }
}

// ───────────────────────── Điểm vào ─────────────────────────

async function convertParts(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.doc') return docParts(filePath);
  const kind = fileKind(filePath);
  if (kind.kind !== 'convert') throw new UnsupportedDocumentError(kind.reason || `Không chuyển được file ${kind.kind}: ${path.basename(filePath)}`);

  switch (ext) {
    case '.docx': return docxParts(filePath);
    case '.pptx': return pptxParts(filePath);
    case '.xlsx':
    case '.xls': return excelParts(filePath);
    case '.csv': return csvParts(filePath);
    case '.pdf': return pdfParts(filePath);
    case '.html':
    case '.htm': {
      const raw = readText(filePath);
      const title = (raw.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
      return { meta: { title: title && decodeEntities(title).trim() }, body: htmlToMarkdown(replaceDataUris(raw)) };
    }
    case '.json':
    case '.yaml':
    case '.yml': {
      const raw = readText(filePath);
      try {
        const parsed = ext === '.json' ? JSON.parse(raw) : yaml.load(raw);
        return { meta: {}, body: convertApiSpec(filePath, parsed, raw) };
      } catch {
        return { meta: {}, body: cleanMarkdown(raw), warnings: [`Không parse được ${ext} — giữ nguyên văn.`] };
      }
    }
    default: {
      const raw = readText(filePath);
      return { meta: {}, body: cleanMarkdown(raw) };
    }
  }
}

/**
 * Tài liệu → Markdown. Kết quả luôn mở đầu bằng khối SOURCE_METADATA (tên file, sha256 bản gốc,
 * và title/version/ngày nếu file có), để §10.2 xác định được bản nào mới hơn.
 * `options.withStamp` giữ cho tương thích — metadata giờ luôn có.
 */
async function convertDocumentToMarkdown(filePath, options = {}) { // eslint-disable-line no-unused-vars
  if (!fs.existsSync(filePath)) throw new Error(`File does not exist: ${filePath}`);
  const parts = await convertParts(filePath);
  const meta = { ...parts.meta };
  // Trường nào file không khai (core.xml, thuộc tính PDF/Excel…) thì lấy từ thân tài liệu nếu có.
  const fromBody = bodyMetadata(parts.body);
  for (const k of ['title', 'version', 'date', 'status']) {
    if ((meta[k] === undefined || meta[k] === null || String(meta[k]).trim() === '') && fromBody[k]) meta[k] = fromBody[k];
  }
  parts.meta = { source_file: path.basename(filePath), sha256: sha256File(filePath), ...meta };
  return assemble(parts);
}

const convertDocx = async (p) => {
  const parts = await docxParts(p);
  return assemble({ ...parts, meta: { source_file: path.basename(p), ...parts.meta } });
};
const convertExcel = (p) => assemble({ ...(path.extname(p).toLowerCase() === '.csv' ? csvParts(p) : excelParts(p)), meta: { source_file: path.basename(p) } });
const convertPdf = async (p) => assemble({ ...(await pdfParts(p)), meta: { source_file: path.basename(p) } });
const convertPptx = async (p) => assemble({ ...(await pptxParts(p)), meta: { source_file: path.basename(p) } });
const convertDoc = async (p) => assemble({ ...docParts(p), meta: { source_file: path.basename(p) } });

module.exports = {
  SUPPORTED_EXTENSIONS,
  docxHiddenText,
  readText,
  ASSET_EXTENSIONS,
  REJECTED_EXTENSIONS,
  UnsupportedDocumentError,
  fileKind,
  cleanMarkdown,
  htmlToMarkdown,
  stripMetadata,
  parseSourceMetadata,
  bodyMetadata,
  normalizeDate,
  replaceDataUris,
  ANNOTATION_HEADING,
  convertDocx,
  convertDoc,
  convertPptx,
  convertExcel,
  convertPdf,
  convertApiSpec,
  convertDocumentToMarkdown,
  getFileMetadata,
};

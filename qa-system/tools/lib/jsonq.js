/**
 * jsonq.js — Truy vấn một nhánh của JSON mà không cần nạp cả file.
 *
 * Cú pháp đường dẫn (cách nhau bằng dấu chấm):
 *   a.b.c            khoá lồng nhau
 *   items[0]         phần tử thứ n của mảng (âm = đếm từ cuối)
 *   items[status=FAILED]   mọi phần tử có trường status bằng FAILED (so khớp chuỗi, không phân biệt hoa thường)
 *   items[*]         mọi phần tử
 *   a.b[*].name      lấy trường name của từng phần tử
 */

function parsePath(path) {
  const out = [];
  const re = /([^.[\]]+)|\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(path || '')) !== null) {
    if (m[1] !== undefined) out.push({ key: m[1] });
    else {
      const inner = m[2].trim();
      if (inner === '*') out.push({ all: true });
      else if (/^-?\d+$/.test(inner)) out.push({ index: Number(inner) });
      else if (inner.includes('=')) {
        const i = inner.indexOf('=');
        out.push({ where: [inner.slice(0, i).trim(), inner.slice(i + 1).trim()] });
      } else out.push({ key: inner });
    }
  }
  return out;
}

const isObj = (v) => v !== null && typeof v === 'object';

function step(values, seg) {
  const next = [];
  for (const v of values) {
    if (seg.key !== undefined) {
      if (isObj(v) && !Array.isArray(v) && Object.prototype.hasOwnProperty.call(v, seg.key)) next.push(v[seg.key]);
    } else if (seg.index !== undefined) {
      if (Array.isArray(v)) {
        const i = seg.index < 0 ? v.length + seg.index : seg.index;
        if (i >= 0 && i < v.length) next.push(v[i]);
      }
    } else if (seg.all) {
      if (Array.isArray(v)) next.push(...v);
      else if (isObj(v)) next.push(...Object.values(v));
    } else if (seg.where) {
      const [k, want] = seg.where;
      if (Array.isArray(v)) {
        for (const item of v) {
          if (isObj(item) && item[k] !== undefined && String(item[k]).toLowerCase() === want.toLowerCase()) next.push(item);
        }
      }
    }
  }
  return next;
}

/** @returns {{found: boolean, value: any}}  value là mảng khi đường dẫn có [*] / [k=v], ngược lại là giá trị đơn. */
function query(root, path) {
  const segs = parsePath(path);
  if (segs.length === 0) return { found: true, value: root };
  const multi = segs.some((s) => s.all || s.where);
  let cur = [root];
  for (const s of segs) {
    cur = step(cur, s);
    if (cur.length === 0) return { found: false, value: undefined };
  }
  return { found: true, value: multi ? cur : cur[0] };
}

/** Mô tả ngắn một giá trị: các khoá (object) hoặc số phần tử + khoá của phần tử đầu (mảng). */
function describe(value) {
  if (Array.isArray(value)) {
    const first = value.find(isObj);
    return {
      type: 'array',
      length: value.length,
      itemKeys: first && !Array.isArray(first) ? Object.keys(first) : undefined,
    };
  }
  if (isObj(value)) return { type: 'object', keys: Object.keys(value) };
  return { type: typeof value };
}

function render(value, { max = 1500 } = {}) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, Array.isArray(value) || isObj(value) ? 1 : 0);
  if (text.length <= max) return { text, truncated: false };
  return { text: text.slice(0, max), truncated: true, total: text.length };
}

module.exports = { parsePath, query, describe, render };

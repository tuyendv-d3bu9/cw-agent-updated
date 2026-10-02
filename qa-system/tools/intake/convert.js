#!/usr/bin/env node
/**
 * convert.js — Universal Document to Clean Markdown Converter for INPUT/
 *
 * Supported Formats:
 *   - Word (.docx) with aggressive artifact cleanup
 *   - Excel (.xlsx, .xls, .csv) with table conversion
 *   - PDF (.pdf)
 *   - OpenAPI / Swagger / Postman / Config (.json, .yaml, .yml)
 *   - Plain text (.txt, .log)
 *
 * Lệnh:
 *   npm run convert -- <file>                 Một tài liệu -> INPUT/
 *   npm run convert -- <src_dir> <out_dir>    Cả thư mục -> thư mục đích
 *
 * KHÔNG có chế độ "không tham số thì tự quét một thư mục mặc định".
 * Bản cũ mặc định quét `./docs` (hoặc `./docx`) — mà `docs/` là tên thư mục tài liệu
 * tự nhiên nhất của mọi repo. Hệ quả thật: khi dự án có thư mục `docs/`, lệnh này
 * đổ cả cẩm nang 32 trang vào `INPUT/` như thể đó là tài liệu nghiệp vụ cần kiểm thử.
 *
 * Muốn tiếp nhận tài liệu thì dùng `npm run intake` — nó quét `INPUT/`, phân loại
 * vào 5 ngăn và dựng khung task. `convert` chỉ là bộ chuyển đổi thuần.
 */

const fs = require("fs");
const path = require("path");
const { convertDocumentToMarkdown } = require("../lib/doc-converter");

const SUPPORTED_EXTENSIONS = ['.docx', '.xlsx', '.xls', '.csv', '.pdf', '.json', '.yaml', '.yml', '.txt'];
const DEFAULT_OUT = "INPUT";

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));

if (positional.length === 0) {
  console.log(`
Cách dùng:
  npm run convert -- <file>                 Chuyển một tài liệu sang Markdown
  npm run convert -- <thư-mục> [đích]       Chuyển cả thư mục

👉 Nếu bạn muốn ĐƯA TÀI LIỆU VÀO DỰ ÁN, dùng lệnh khác:
     npm run intake
   Lệnh đó quét INPUT/, phân loại vào 5 ngăn, và dựng sẵn khung task.
`);
  process.exit(0);
}

const src = positional[0];
const outDir = positional[1] || DEFAULT_OUT;

function listSupportedFiles(target) {
  if (!fs.existsSync(target)) return null;
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    const ext = path.extname(target).toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext) ? [target] : [];
  }
  return fs
    .readdirSync(target)
    .filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return SUPPORTED_EXTENSIONS.includes(ext) && !f.startsWith("~$") && !f.startsWith(".");
    })
    .map((f) => path.join(target, f));
}

async function convertOne(file) {
  const outFile = path.join(outDir, path.basename(file, path.extname(file)) + ".md");

  if (fs.existsSync(outFile)) {
    console.error(`  SKIPPED  ${outFile} — already exists. Delete or rename first to overwrite.`);
    return { skipped: true };
  }

  const cleanMd = await convertDocumentToMarkdown(file);
  fs.writeFileSync(outFile, cleanMd, "utf8");
  console.log(`  OK       ${file}  ->  ${outFile}`);
  return { skipped: false };
}

(async () => {
  const files = listSupportedFiles(src);

  if (files === null) {
    console.error(`Source not found: ${src}`);
    console.error(`Create directory ./${DEFAULT_SRC}/ and add documents, or pass a file path:`);
    console.error(`  npm run convert -- path/to/document.docx`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`No supported documents found in: ${src}`);
    console.error(`Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}`);
    process.exit(1);
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log(`Converting ${files.length} document(s) -> ${outDir}/`);

  let ok = 0;
  let skipped = 0;
  for (const f of files) {
    try {
      const r = await convertOne(f);
      r.skipped ? skipped++ : ok++;
    } catch (err) {
      console.error(`  ERROR    ${f} — ${err.message}`);
    }
  }

  console.log(`\nFinished: ${ok} converted, ${skipped} skipped.`);
  if (ok > 0) {
    console.log(`Next step: Verify markdown in ${outDir}/ and run QA test design pipelines.`);
  }
})();

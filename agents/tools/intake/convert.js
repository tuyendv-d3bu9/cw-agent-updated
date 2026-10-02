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
 * Usage:
 *   npm run convert                          # Converts all docs in ./docs or ./docx -> INPUT/
 *   npm run convert -- <file>                # Single document -> INPUT/
 *   npm run convert -- <src_dir> <out_dir>   # Custom directory -> Custom output
 */

const fs = require("fs");
const path = require("path");
const { convertDocumentToMarkdown } = require("../lib/doc-converter");

const SUPPORTED_EXTENSIONS = ['.docx', '.xlsx', '.xls', '.csv', '.pdf', '.json', '.yaml', '.yml', '.txt'];
const DEFAULT_SRC = fs.existsSync("docs") ? "docs" : "docx";
const DEFAULT_OUT = "INPUT";

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const src = positional[0] || DEFAULT_SRC;
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

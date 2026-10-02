/**
 * doc-converter.js — Universal Document to Clean Markdown Converter
 * 
 * Supported Formats:
 * - DOCX (.docx) via mammoth with aggressive artifact cleanup
 * - Excel (.xlsx, .xls, .csv) via xlsx (SheetJS) to Markdown tables
 * - PDF (.pdf) via pdf-parse
 * - OpenAPI / Swagger / Postman / Config (.json, .yaml, .yml) via js-yaml
 * - Plain Text (.txt, .log)
 */

const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const yaml = require('js-yaml');

/**
 * Clean up HTML tables and convert them to Markdown tables
 */
function convertHtmlTableToMarkdown(html) {
  return html.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, tableContent) => {
    const rows = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;

    while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
      const cells = [];
      const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
      let cellMatch;

      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        // Strip nested HTML tags and clean up whitespace
        let cellText = cellMatch[1]
          .replace(/<[^>]+>/g, '')
          .replace(/\r?\n/g, ' ')
          .replace(/\|/g, '\\|')
          .trim();
        cells.push(cellText);
      }
      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    if (rows.length === 0) return '';

    // Normalize column counts
    const maxCols = Math.max(...rows.map(r => r.length));
    const normalizedRows = rows.map(r => {
      while (r.length < maxCols) r.push('');
      return r;
    });

    const header = normalizedRows[0];
    const separator = Array(maxCols).fill('---');
    const dataRows = normalizedRows.slice(1);

    let mdTable = '\n\n| ' + header.join(' | ') + ' |\n';
    mdTable += '| ' + separator.join(' | ') + ' |\n';
    for (const r of dataRows) {
      mdTable += '| ' + r.join(' | ') + ' |\n';
    }
    return mdTable + '\n';
  });
}

/**
 * Advanced Post-Processor to clean up Markdown from Mammoth & other converters
 */
function cleanMarkdown(raw) {
  if (!raw) return '';

  let md = raw;

  // 1. Convert any embedded HTML tables to Markdown tables
  md = convertHtmlTableToMarkdown(md);

  // 2. Remove Mammoth HTML anchor tags (e.g. <a id="_xxx"></a>)
  md = md.replace(/<a\s+(?:id|name)="[^"]*">\s*<\/a>/gi, '');
  md = md.replace(/<a\s+(?:id|name)="[^"]*">([\s\S]*?)<\/a>/gi, '$1');

  // 3. Remove stray HTML tags that might leak
  md = md.replace(/<\/?(?:span|div|p|b|i|strong|em|font|section|article)[^>]*>/gi, '');

  // 4. Clean up over-aggressive backslash escaping from Mammoth
  // Mammoth aggressively escapes: \( \) \[ \] \. \- \! \# \_ \*
  md = md.replace(/\\([()[\]*.\-#!_])/g, '$1');

  // 5. Normalize bold syntax: convert __text__ to **text**
  md = md.replace(/__([^\s_][^_]*[^\s_])__/g, '**$1**');

  // 6. Clean up excessive whitespace and trailing spaces on lines
  md = md.replace(/[ \t]+$/gm, '');

  // 7. Collapse 3+ consecutive line breaks into 2
  md = md.replace(/\n{3,}/g, '\n\n');

  return md.trim();
}

/**
 * Convert DOCX to clean Markdown
 */
async function convertDocx(filePath) {
  const result = await mammoth.convertToMarkdown({ path: filePath });
  return cleanMarkdown(result.value);
}

/**
 * Convert Excel workbook (.xlsx, .xls, .csv) to clean Markdown tables
 */
function convertExcel(filePath) {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheetNames = workbook.SheetNames;
  const sections = [];

  for (const name of sheetNames) {
    const sheet = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    // Filter out completely empty rows
    const rows = data.filter(row => row.some(cell => String(cell).trim() !== ''));
    if (rows.length === 0) continue;

    const maxCols = Math.max(...rows.map(r => r.length));
    if (maxCols === 0) continue;

    const normalizedRows = rows.map(r => {
      const cells = r.map(c => {
        if (c instanceof Date) {
          return c.toISOString().split('T')[0];
        }
        return String(c).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>').trim();
      });
      while (cells.length < maxCols) cells.push('');
      return cells;
    });

    const header = normalizedRows[0];
    const separator = Array(maxCols).fill('---');
    const dataRows = normalizedRows.slice(1);

    let sheetMd = `## Sheet: ${name}\n\n`;
    sheetMd += '| ' + header.join(' | ') + ' |\n';
    sheetMd += '| ' + separator.join(' | ') + ' |\n';
    for (const r of dataRows) {
      sheetMd += '| ' + r.join(' | ') + ' |\n';
    }

    sections.push(sheetMd);
  }

  if (sections.length === 0) {
    return `*[Empty Workbook]*`;
  }

  const baseTitle = path.basename(filePath, path.extname(filePath));
  return `# Data Sheet: ${baseTitle}\n\n` + sections.join('\n\n---\n\n');
}

/**
 * Convert PDF to clean Markdown
 */
async function convertPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  let text = '';
  let numpages = 1;

  if (typeof pdfParse === 'function') {
    const data = await pdfParse(dataBuffer);
    text = data.text || '';
    numpages = data.numpages || 1;
  } else if (pdfParse.PDFParse) {
    const parser = new pdfParse.PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    text = data.text || '';
    numpages = data.total || (data.pages ? data.pages.length : 1);
  }

  // Clean up form feeds and carriage returns
  text = text.replace(/\f/g, '\n\n---\n\n');
  text = text.replace(/\r\n/g, '\n');
  text = cleanMarkdown(text);

  const baseTitle = path.basename(filePath, path.extname(filePath));
  return `# Document: ${baseTitle}\n\n` +
         `> Total Pages: ${numpages} · Source: ${path.basename(filePath)}\n\n---\n\n` +
         text;
}

/**
 * Convert OpenAPI / Swagger / Postman JSON or YAML to Markdown API docs
 */
function convertApiSpec(filePath, parsedData, rawContent) {
  const baseTitle = path.basename(filePath, path.extname(filePath));

  // 1. OpenAPI / Swagger Specification
  if (parsedData && (parsedData.openapi || parsedData.swagger) && parsedData.paths) {
    const info = parsedData.info || {};
    let md = `# API Specification: ${info.title || baseTitle}\n`;
    md += `Version: ${info.version || '1.0.0'} · Format: ${parsedData.openapi ? 'OpenAPI ' + parsedData.openapi : 'Swagger ' + parsedData.swagger}\n\n`;
    if (info.description) {
      md += `${info.description.trim()}\n\n`;
    }
    md += `---\n\n## Endpoints Overview\n\n`;

    const paths = parsedData.paths;
    const tableRows = [];

    for (const [route, methods] of Object.entries(paths)) {
      if (typeof methods !== 'object') continue;
      for (const [method, details] of Object.entries(methods)) {
        if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method.toLowerCase())) {
          const summary = (details.summary || details.description || '').replace(/\r?\n/g, ' ').replace(/\|/g, '-');
          tableRows.push(`| \`${method.toUpperCase()}\` | \`${route}\` | ${summary} |`);
        }
      }
    }

    if (tableRows.length > 0) {
      md += `| Method | Endpoint | Summary |\n`;
      md += `|---|---|---|\n`;
      md += tableRows.join('\n') + '\n\n---\n\n';
    }

    // Detail section for each endpoint
    md += `## Endpoint Specifications\n\n`;
    for (const [route, methods] of Object.entries(paths)) {
      if (typeof methods !== 'object') continue;
      for (const [method, details] of Object.entries(methods)) {
        if (!['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method.toLowerCase())) continue;

        md += `### \`${method.toUpperCase()} ${route}\`\n\n`;
        if (details.summary) md += `**Summary**: ${details.summary}\n\n`;
        if (details.description && details.description !== details.summary) {
          md += `**Description**: ${details.description.trim()}\n\n`;
        }

        // Parameters
        if (Array.isArray(details.parameters) && details.parameters.length > 0) {
          md += `#### Parameters:\n`;
          md += `| Name | In | Required | Type / Schema | Description |\n`;
          md += `|---|---|---|---|---|\n`;
          for (const p of details.parameters) {
            const req = p.required ? 'Yes' : 'No';
            const pType = p.type || (p.schema ? p.schema.type : '') || 'string';
            const pDesc = (p.description || '').replace(/\r?\n/g, ' ').replace(/\|/g, '-');
            md += `| \`${p.name}\` | \`${p.in || 'query'}\` | ${req} | \`${pType}\` | ${pDesc} |\n`;
          }
          md += '\n';
        }

        // Responses
        if (details.responses && typeof details.responses === 'object') {
          md += `#### Responses:\n`;
          md += `| Status Code | Description |\n`;
          md += `|---|---|\n`;
          for (const [code, resp] of Object.entries(details.responses)) {
            const respDesc = (resp.description || '').replace(/\r?\n/g, ' ').replace(/\|/g, '-');
            md += `| \`${code}\` | ${respDesc} |\n`;
          }
          md += '\n';
        }
        md += `---\n\n`;
      }
    }
    return cleanMarkdown(md);
  }

  // 2. Postman Collection
  if (parsedData && (parsedData.info?._postman_id || (Array.isArray(parsedData.item) && parsedData.info))) {
    const info = parsedData.info || {};
    let md = `# Postman Collection: ${info.name || baseTitle}\n\n`;
    if (info.description) md += `${info.description.trim()}\n\n`;
    md += `---\n\n## Requests List\n\n`;
    md += `| Method | URL / Path | Name |\n`;
    md += `|---|---|---|\n`;

    function extractItems(items) {
      for (const it of items) {
        if (it.request) {
          const m = it.request.method || 'GET';
          const u = typeof it.request.url === 'string' ? it.request.url : (it.request.url?.raw || '');
          md += `| \`${m}\` | \`${u}\` | ${it.name || ''} |\n`;
        }
        if (Array.isArray(it.item)) {
          extractItems(it.item);
        }
      }
    }

    if (Array.isArray(parsedData.item)) {
      extractItems(parsedData.item);
    }
    return cleanMarkdown(md);
  }

  // 3. General Config / JSON / YAML
  const isYaml = filePath.endsWith('.yaml') || filePath.endsWith('.yml');
  return `# Data Configuration: ${baseTitle}\n\n` +
         '```' + (isYaml ? 'yaml' : 'json') + '\n' +
         rawContent.trim() + '\n' +
         '```\n';
}

/**
 * Universal document converter entry point
 * Accepts any supported format and outputs clean, token-efficient Markdown
 */
async function convertDocumentToMarkdown(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }

  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.docx':
      return await convertDocx(filePath);

    case '.xlsx':
    case '.xls':
    case '.csv':
      return convertExcel(filePath);

    case '.pdf':
      return await convertPdf(filePath);

    case '.json': {
      const raw = fs.readFileSync(filePath, 'utf8');
      try {
        const parsed = JSON.parse(raw);
        return convertApiSpec(filePath, parsed, raw);
      } catch (e) {
        return cleanMarkdown(raw);
      }
    }

    case '.yaml':
    case '.yml': {
      const raw = fs.readFileSync(filePath, 'utf8');
      try {
        const parsed = yaml.load(raw);
        return convertApiSpec(filePath, parsed, raw);
      } catch (e) {
        return cleanMarkdown(raw);
      }
    }

    case '.md':
    case '.txt':
    case '.log':
    case '.sql':
    default: {
      const raw = fs.readFileSync(filePath, 'utf8');
      return cleanMarkdown(raw);
    }
  }
}

module.exports = {
  cleanMarkdown,
  convertDocx,
  convertExcel,
  convertPdf,
  convertApiSpec,
  convertDocumentToMarkdown
};

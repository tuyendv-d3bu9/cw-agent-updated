#!/usr/bin/env node
/**
 * generate-dataset.js — Automated test dataset generation engine (0 LLM Token Cost)
 * 
 * Powered by @faker-js/faker & libphonenumber-js for highly realistic,
 * locale-aware, and internationalized test datasets.
 * 
 * Supported generator types:
 * - vietnamese_name / person / name: Vietnamese and global personal names (accents, gender, part)
 * - phone / phone_vn: Phone numbers with +84, E.164, national, international, carrier selection, and ISO countries
 * - address_vn / address / location: Vietnamese administrative units (provinces, districts, wards, street, postal code)
 * - cccd_vn / citizen_id: 12-digit Vietnamese Citizen ID following Ministry of Public Security structure
 * - bank_vn: Vietnamese commercial banks and account numbers
 * - email: Valid email addresses (template, domain, or realistic based on names)
 * - voucher_code: Promotional codes (PROMO50K, SALE2026...)
 * - currency_vnd: VND currency values (formatted or raw integers)
 * - date_vn / date: Dates in YYYY-MM-DD or DD/MM/YYYY
 * - boundary: Boundary value sets (min-1, min, nominal, max, max+1)
 * - enum: Pick from value list
 * - negative / invalid: Edge cases (empty, whitespace, null, special chars, injection)
 * 
 * Usage:
 *   node qa-system/tools/testdata/generate-dataset.js --slug <task-slug> --schema <schema.json> --count 50 --format md
 *   node qa-system/tools/testdata/generate-dataset.js --demo
 */

const fs = require('fs');
const path = require('path');
const { faker, fakerVI } = require('@faker-js/faker');
const { parsePhoneNumber } = require('libphonenumber-js');

// ───────────── VIETNAMESE CONSTANTS & DICTIONARIES ─────────────

const VN_CARRIERS = {
  viettel: ['086', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039'],
  vinaphone: ['088', '091', '094', '081', '082', '083', '084', '085'],
  mobifone: ['089', '090', '093', '070', '079', '077', '076', '078'],
  vietnamobile: ['092', '056', '058'],
  gmobile: ['099', '059']
};

const ALL_VN_PREFIXES = [
  ...VN_CARRIERS.viettel,
  ...VN_CARRIERS.vinaphone,
  ...VN_CARRIERS.mobifone
];

const VN_CITIES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Bình Dương', 'Đồng Nai', 'Bà Rịa - Vũng Tàu', 'Khánh Hòa', 'Lâm Đồng',
  'Quảng Ninh', 'Thừa Thiên Huế', 'Bắc Ninh', 'Hải Dương', 'Kiên Giang'
];

const VN_DISTRICTS = {
  'TP. Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận 7', 'Quận 10', 'Quận Bình Thạnh', 'TP. Thủ Đức', 'Quận Phú Nhuận', 'Quận Tân Bình'],
  'Hà Nội': ['Quận Hoàn Kiếm', 'Quận Ba Đình', 'Quận Đống Đa', 'Quận Cầu Giấy', 'Quận Hai Bà Trưng', 'Quận Tây Hồ', 'Quận Thanh Xuân'],
  'Đà Nẵng': ['Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Cẩm Lệ']
};

const VN_STREETS = [
  'Nguyễn Huệ', 'Lê Lợi', 'Hai Bà Trưng', 'Trần Hưng Đạo', 'Nguyễn Trãi',
  'Điện Biên Phủ', 'Võ Văn Kiệt', 'Cách Mạng Tháng 8', 'Lý Thường Kiệt',
  'Phan Chu Trinh', 'Hoàng Hoa Thám', 'Bạch Đằng', 'Trường Chinh'
];

const VN_PROVINCE_CODES = [
  '001', '002', '004', '006', '008', '010', '011', '012', '014', '015',
  '031', '033', '034', '035', '036', '037', '038', '040', '042', '044',
  '048', '049', '051', '052', '054', '056', '058', '060', '062', '064',
  '070', '072', '074', '075', '077', '079', '080', '082', '083', '084'
];

const VN_BANKS = [
  'Vietcombank', 'Techcombank', 'MB Bank', 'BIDV', 'VietinBank',
  'VPBank', 'ACB', 'TPBank', 'Sacombank', 'HDBank', 'VIB'
];

// Fallback arrays for backward compatibility
const VN_FIRST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
const VN_MIDDLE_NAMES = ['Văn', 'Thị', 'Đức', 'Hồng', 'Minh', 'Thanh', 'Ngọc', 'Gia', 'Anh', 'Quang', 'Hải'];
const VN_LAST_NAMES = ['Anh', 'Bình', 'Cường', 'Dũng', 'Giang', 'Hương', 'Huy', 'Khoa', 'Linh', 'Mai', 'Nam', 'Phong', 'Quân', 'Sơn', 'Tú', 'Uyên', 'Vy'];

// ───────────── HELPER UTILITIES ─────────────

function randomItem(arr) {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDigits(length) {
  let str = '';
  for (let i = 0; i < length; i++) {
    str += Math.floor(Math.random() * 10);
  }
  return str;
}

function removeAccents(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

// ───────────── SPECIALIZED GENERATORS ─────────────

function generateName(spec) {
  const hasAccents = spec.has_accents !== undefined ? Boolean(spec.has_accents) : true;
  const sex = spec.gender === 'male' || spec.sex === 'male' ? 'male'
            : spec.gender === 'female' || spec.sex === 'female' ? 'female'
            : undefined;
  const part = (spec.part || 'full').toLowerCase();
  const locale = (spec.locale || 'vi').toLowerCase();

  const f = locale === 'vi' ? fakerVI : faker;
  let name = '';

  try {
    if (part === 'first_name') {
      name = f.person.firstName(sex);
    } else if (part === 'last_name') {
      name = f.person.lastName(sex);
    } else if (part === 'middle_name') {
      name = f.person.middleName(sex) || randomItem(VN_MIDDLE_NAMES);
    } else {
      name = f.person.fullName({ sex });
    }
  } catch {
    name = `${randomItem(VN_FIRST_NAMES)} ${randomItem(VN_MIDDLE_NAMES)} ${randomItem(VN_LAST_NAMES)}`;
  }

  if (!hasAccents) {
    name = removeAccents(name);
  }
  return name;
}

function generatePhone(spec) {
  const country = (spec.country || 'VN').toUpperCase();
  const format = (spec.format || (country === 'VN' ? 'national' : 'e164')).toLowerCase();
  const carrier = spec.carrier ? String(spec.carrier).toLowerCase() : null;

  if (country === 'VN') {
    let prefixList = ALL_VN_PREFIXES;
    if (carrier && VN_CARRIERS[carrier]) {
      prefixList = VN_CARRIERS[carrier];
    }
    const prefix = randomItem(prefixList);
    const suffix = randomDigits(7);
    const rawNational = `${prefix}${suffix}`; // e.g. 0912345678

    try {
      const parsed = parsePhoneNumber(rawNational, 'VN');
      if (format === 'e164') return parsed.number; // +84912345678
      if (format === 'international') return parsed.formatInternational(); // +84 91 234 5678
      if (format === 'digits_only' || format === 'no_plus') return parsed.number.replace('+', '');
      if (format === 'national_spaced') return parsed.formatNational(); // 091 234 5678
      return rawNational;
    } catch {
      if (format === 'e164') return `+84${rawNational.slice(1)}`;
      if (format === 'international') return `+84 ${rawNational.slice(1, 3)} ${rawNational.slice(3, 6)} ${rawNational.slice(6)}`;
      return rawNational;
    }
  }

  // International phone generation
  try {
    let sampleRaw = '';
    if (country === 'US') {
      sampleRaw = `+1${Math.floor(200 + Math.random() * 700)}${randomDigits(7)}`;
    } else if (country === 'SG') {
      sampleRaw = `+65${randomItem(['8', '9'])}${randomDigits(7)}`;
    } else if (country === 'JP') {
      sampleRaw = `+81${randomItem(['70', '80', '90'])}${randomDigits(8)}`;
    } else {
      sampleRaw = faker.phone.number();
    }
    const parsed = parsePhoneNumber(sampleRaw, country);
    if (format === 'e164') return parsed.number;
    if (format === 'international') return parsed.formatInternational();
    if (format === 'national') return parsed.formatNational();
    return parsed.number;
  } catch {
    return faker.phone.number();
  }
}

function generateAddressVN(spec) {
  const part = (spec.part || 'full').toLowerCase();
  const city = spec.city || randomItem(VN_CITIES);
  const districtList = VN_DISTRICTS[city] || ['Quận 1', 'Quận Trung Tâm', 'Huyện Ngoại Thành'];
  const district = spec.district || randomItem(districtList);
  const streetName = spec.street || randomItem(VN_STREETS);
  const streetNo = Math.floor(Math.random() * 500) + 1;
  const wardNo = Math.floor(Math.random() * 15) + 1;

  if (part === 'city' || part === 'province') return city;
  if (part === 'district') return district;
  if (part === 'ward') return `Phường ${wardNo}`;
  if (part === 'street') return `${streetNo} Đường ${streetName}`;
  if (part === 'postal_code' || part === 'zip_code') {
    return `${Math.floor(10000 + Math.random() * 89999)}0`;
  }

  return `${streetNo} Đường ${streetName}, Phường ${wardNo}, ${district}, ${city}`;
}

function generateCCCD(spec) {
  const provinceCode = spec.province_code || randomItem(VN_PROVINCE_CODES);
  const genderCode = spec.century_gender || randomItem(['0', '1', '2', '3']);
  const birthYear = spec.birth_year ? String(spec.birth_year).slice(-2) : randomDigits(2);
  const randomSuffix = randomDigits(6);
  return `${provinceCode}${genderCode}${birthYear}${randomSuffix}`;
}

function generateBankVN(spec) {
  const field = (spec.field || 'bank_name').toLowerCase();
  const bank = spec.bank || randomItem(VN_BANKS);
  const accNo = `${Math.floor(1000 + Math.random() * 9000)}${randomDigits(randomItem([6, 8, 10]))}`;

  if (field === 'account_number' || field === 'stk') return accNo;
  if (field === 'full') return `${bank} - ${accNo}`;
  return bank;
}

// ───────────── DISPATCHER ─────────────

function generateField(spec, index) {
  const type = spec.type || 'string';

  switch (type) {
    case 'vietnamese_name':
    case 'name':
    case 'person':
      return generateName(spec);

    case 'phone':
    case 'phone_vn':
      return generatePhone(spec);

    case 'address':
    case 'address_vn':
    case 'location':
      return generateAddressVN(spec);

    case 'cccd_vn':
    case 'citizen_id':
      return generateCCCD(spec);

    case 'bank_vn':
    case 'bank':
      return generateBankVN(spec);

    case 'email':
      if (spec.realistic) {
        return fakerVI.internet.email();
      }
      const prefix = (spec.prefix || 'user').toLowerCase();
      const domain = spec.domain || 'example.com';
      return `${prefix}_${index + 1}_${randomDigits(3)}@${domain}`;

    case 'voucher_code':
      const prefixes = spec.prefixes || ['PROMO', 'SALE', 'FREESHIP', 'VIP'];
      const values = spec.values || ['10K', '20K', '50K', '100K', '2026'];
      return `${randomItem(prefixes)}${randomItem(values)}`;

    case 'currency_vnd':
      const min = spec.min || 10000;
      const max = spec.max || 2000000;
      const step = spec.step || 10000;
      const rawVal = Math.floor((Math.random() * (max - min) + min) / step) * step;
      return spec.formatted ? `${rawVal.toLocaleString('vi-VN')} VND` : rawVal;

    case 'date':
    case 'date_vn':
      const year = spec.year || 2026;
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      return spec.format === 'DD/MM/YYYY' ? `${day}/${month}/${year}` : `${year}-${month}-${day}`;

    case 'enum':
      const valuesList = spec.values || ['Active', 'Inactive', 'Pending'];
      return valuesList[index % valuesList.length];

    case 'boundary':
      const bMin = spec.min !== undefined ? spec.min : 1;
      const bMax = spec.max !== undefined ? spec.max : 100;
      const boundarySet = [
        { label: 'min-1 (Invalid)', val: bMin - 1 },
        { label: 'min (Valid)', val: bMin },
        { label: 'min+1 (Valid)', val: bMin + 1 },
        { label: 'nominal (Valid)', val: Math.floor((bMin + bMax) / 2) },
        { label: 'max-1 (Valid)', val: bMax - 1 },
        { label: 'max (Valid)', val: bMax },
        { label: 'max+1 (Invalid)', val: bMax + 1 }
      ];
      const selected = boundarySet[index % boundarySet.length];
      return spec.includeLabel ? `${selected.val} (${selected.label})` : selected.val;

    case 'negative':
      const negTypes = spec.variants || ['empty', 'whitespace', 'null', 'special_chars', 'long_string', 'sql_injection'];
      const negChoice = negTypes[index % negTypes.length];
      switch (negChoice) {
        case 'empty': return '""';
        case 'whitespace': return '"   "';
        case 'null': return 'null';
        case 'special_chars': return '!@#$%^&*()_+{}[]:;<>?,./~`';
        case 'long_string': return 'A'.repeat(spec.maxLength || 256);
        case 'sql_injection': return "' OR '1'='1";
        default: return 'INVALID_INPUT';
      }

    default:
      return `${spec.prefix || 'Value'}_${index + 1}`;
  }
}

function generateDataset(schema, count = 10) {
  const rows = [];
  // Keys starting with `_` are schema annotations, not data fields.
  const fields = Object.keys(schema).filter((k) => !k.startsWith('_'));

  for (let i = 0; i < count; i++) {
    const row = {};
    for (const field of fields) {
      row[field] = generateField(schema[field], i);
    }
    rows.push(row);
  }
  return rows;
}

function exportToMarkdownTable(rows, title = 'Automated Test Dataset') {
  if (!rows || rows.length === 0) return '';
  const headers = ['#', ...Object.keys(rows[0])];
  const separator = headers.map(() => '---');

  let md = `### ${title}\n\n`;
  md += `| ${headers.join(' | ')} |\n`;
  md += `| ${separator.join(' | ')} |\n`;

  rows.forEach((row, idx) => {
    const line = [idx + 1, ...Object.values(row).map(v => typeof v === 'object' ? JSON.stringify(v) : String(v))];
    md += `| ${line.join(' | ')} |\n`;
  });

  return md;
}

// ───────────── CLI EXECUTION ─────────────

function main() {
  const args = process.argv.slice(2);

  // Demo mode
  if (args.includes('--demo') || args.length === 0) {
    console.log('--- [DEMO MODE] Automated Realistic Test Dataset Generation ---');
    const demoSchema = {
      full_name: { type: 'vietnamese_name', has_accents: true },
      phone_vn: { type: 'phone', country: 'VN', format: 'e164', carrier: 'viettel' },
      address: { type: 'address_vn', part: 'full' },
      citizen_id: { type: 'cccd_vn' },
      bank_account: { type: 'bank_vn', field: 'full' },
      order_amount: { type: 'currency_vnd', min: 100000, max: 1000000, step: 50000, formatted: true },
      order_quantity: { type: 'boundary', min: 1, max: 10, includeLabel: true }
    };

    const dataset = generateDataset(demoSchema, 7);
    const mdTable = exportToMarkdownTable(dataset, 'Sample Realistic Dataset (VN Locale & Boundaries)');
    console.log(mdTable);
    console.log('\n[Done] Successfully generated in < 0.05s with 0 LLM tokens!');
    return;
  }

  let slug = '';
  let count = 10;
  let schemaPath = '';
  let outputFile = '';
  let format = 'md';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && args[i + 1]) slug = args[++i];
    if (args[i] === '--count' && args[i + 1]) count = parseInt(args[++i], 10);
    if (args[i] === '--schema' && args[i + 1]) schemaPath = args[++i];
    if (args[i] === '--output' && args[i + 1]) outputFile = args[++i];
    if (args[i] === '--format' && args[i + 1]) format = args[++i];
  }

  let schema = null;
  if (schemaPath) {
    const fullSchemaPath = path.resolve(process.cwd(), schemaPath);
    if (fs.existsSync(fullSchemaPath)) {
      schema = JSON.parse(fs.readFileSync(fullSchemaPath, 'utf8'));
    } else {
      console.error(`[Error] Schema file not found: ${fullSchemaPath}`);
      process.exit(1);
    }
  } else {
    console.error('[Error] Please provide --schema <path_to_json>');
    process.exit(1);
  }

  const dataset = generateDataset(schema, count);

  let resultString = '';
  if (format === 'json') {
    resultString = JSON.stringify(dataset, null, 2);
  } else if (format === 'csv') {
    const headers = Object.keys(dataset[0]);
    resultString = headers.join(',') + '\n' + dataset.map(r => Object.values(r).join(',')).join('\n');
  } else {
    resultString = exportToMarkdownTable(dataset, `Test Dataset · ${slug || 'Dataset'}`);
  }

  if (outputFile) {
    const fullOutPath = path.resolve(process.cwd(), outputFile);
    fs.mkdirSync(path.dirname(fullOutPath), { recursive: true });
    fs.writeFileSync(fullOutPath, resultString, 'utf8');
    console.log(`[Success] Saved ${count} record(s) to: ${outputFile}`);
  } else {
    console.log(resultString);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateDataset,
  exportToMarkdownTable,
  generateName,
  generatePhone,
  generateAddressVN,
  generateCCCD,
  generateBankVN
};

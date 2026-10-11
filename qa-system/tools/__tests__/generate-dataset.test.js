const test = require('node:test');
const assert = require('node:assert');
const { generateDataset } = require('../testdata/generate-dataset');
const { parsePhoneNumber } = require('libphonenumber-js');

test('generate-dataset — generates realistic Vietnamese names with diacritics', () => {
  const rows = generateDataset({
    ten: { type: 'vietnamese_name', has_accents: true }
  }, 10);

  assert.strictEqual(rows.length, 10);
  rows.forEach(r => {
    assert.ok(typeof r.ten === 'string' && r.ten.length > 2);
    // At least some generated names should have Vietnamese diacritics
  });
  const hasDiacritics = rows.some(r => /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(r.ten));
  assert.ok(hasDiacritics, 'Expected generated names to include Vietnamese accented characters');
});

test('generate-dataset — supports Vietnamese names without diacritics when has_accents is false', () => {
  const rows = generateDataset({
    ten_khong_dau: { type: 'vietnamese_name', has_accents: false }
  }, 10);

  rows.forEach(r => {
    assert.strictEqual(
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(r.ten_khong_dau),
      false,
      `Expected no diacritics, but got: ${r.ten_khong_dau}`
    );
  });
});

test('generate-dataset — generates phone number with +84 / e164 / national formats', () => {
  const rows = generateDataset({
    phone_e164: { type: 'phone', country: 'VN', format: 'e164' },
    phone_national: { type: 'phone', country: 'VN', format: 'national' },
    phone_international: { type: 'phone', country: 'VN', format: 'international' }
  }, 5);

  rows.forEach(r => {
    // E.164: starts with +84, total 12 chars (+84912345678)
    assert.match(r.phone_e164, /^\+84\d{9}$/);

    // National format: starts with 0
    assert.match(r.phone_national.replace(/\s+/g, ''), /^0\d{9}$/);

    // International format: starts with +84
    assert.match(r.phone_international, /^\+84/);

    // Libphonenumber validation
    const parsed = parsePhoneNumber(r.phone_e164, 'VN');
    assert.ok(parsed.isValid(), `Expected valid phone number: ${r.phone_e164}`);
  });
});

test('generate-dataset — supports carrier selection for Vietnam phone numbers', () => {
  const rows = generateDataset({
    viettel: { type: 'phone', country: 'VN', carrier: 'viettel', format: 'e164' },
    vinaphone: { type: 'phone', country: 'VN', carrier: 'vinaphone', format: 'e164' },
    mobifone: { type: 'phone', country: 'VN', carrier: 'mobifone', format: 'e164' }
  }, 5);

  rows.forEach(r => {
    assert.match(r.viettel, /^\+84(86|96|97|98|32|33|34|35|36|37|38|39)\d{7}$/);
    assert.match(r.vinaphone, /^\+84(88|91|94|81|82|83|84|85)\d{7}$/);
    assert.match(r.mobifone, /^\+84(89|90|93|70|79|77|76|78)\d{7}$/);
  });
});

test('generate-dataset — supports international phone numbers by country (US, SG)', () => {
  const rows = generateDataset({
    phone_us: { type: 'phone', country: 'US', format: 'e164' },
    phone_sg: { type: 'phone', country: 'SG', format: 'e164' }
  }, 5);

  rows.forEach(r => {
    assert.match(r.phone_us, /^\+1\d{10}$/);
    assert.match(r.phone_sg, /^\+65\d{8}$/);
  });
});

test('generate-dataset — generates realistic Vietnamese addresses and administrative units', () => {
  const rows = generateDataset({
    dia_chi: { type: 'address_vn', part: 'full' },
    tinh_thanh: { type: 'address_vn', part: 'city' }
  }, 5);

  rows.forEach(r => {
    assert.ok(typeof r.dia_chi === 'string' && r.dia_chi.length > 5);
    assert.ok(typeof r.tinh_thanh === 'string' && r.tinh_thanh.length > 2);
  });
});

test('generate-dataset — generates 12-digit Vietnamese CCCD following official structure', () => {
  const rows = generateDataset({
    cccd: { type: 'cccd_vn' }
  }, 10);

  rows.forEach(r => {
    assert.match(r.cccd, /^\d{12}$/, `CCCD must be exactly 12 digits, got: ${r.cccd}`);
  });
});

test('generate-dataset — generates Vietnamese bank names and account numbers', () => {
  const rows = generateDataset({
    ngan_hang: { type: 'bank_vn', field: 'bank_name' },
    stk: { type: 'bank_vn', field: 'account_number' }
  }, 5);

  rows.forEach(r => {
    assert.ok(typeof r.ngan_hang === 'string' && r.ngan_hang.length > 2);
    assert.match(r.stk, /^\d{8,16}$/);
  });
});

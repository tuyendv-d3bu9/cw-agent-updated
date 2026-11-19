/**
 * json-schema.js — Minimal JSON Schema (2020-12) validator, no dependencies.
 *
 *   validate(schema, data) → [{ path, message }]   (empty array = valid)
 *
 * Supports exactly the keywords the exam schemas use: type (string or array of
 * types, `integer` included), const, enum, required, properties,
 * additionalProperties (false or a schema), pattern, items, $ref to `#/$defs/…`,
 * minLength, maxLength, minimum. Annotation keywords ($schema, $id, $defs,
 * format, description, title) are accepted and ignored. Any other keyword is a
 * schema error, so a schema never silently relies on an unsupported rule.
 * Error paths are JSON pointers (RFC 6901): "" is the root, "/a/0/b" a child.
 */

const SUPPORTED = new Set([
  'type', 'const', 'enum', 'required', 'properties', 'additionalProperties', 'pattern', 'items',
  '$ref', 'minLength', 'maxLength', 'minimum',
  '$schema', '$id', '$defs', 'format', 'description', 'title', '$comment',
]);

const escapePointer = (s) => String(s).replace(/~/g, '~0').replace(/\//g, '~1');

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number';
  return typeof v; // string | boolean | object
}

function typeMatches(v, t) {
  const actual = typeOf(v);
  if (t === 'number') return actual === 'number' || actual === 'integer';
  return actual === t;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeOf(a) !== typeOf(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]));
  if (a && typeof a === 'object') {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    return deepEqual(ka, kb) && ka.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

function resolveRef(root, ref) {
  if (!ref.startsWith('#/')) throw new Error(`Unsupported $ref "${ref}" (only #/… is supported)`);
  let node = root;
  for (const raw of ref.slice(2).split('/')) {
    const key = raw.replace(/~1/g, '/').replace(/~0/g, '~');
    if (!node || typeof node !== 'object' || !(key in node)) throw new Error(`Unresolvable $ref "${ref}"`);
    node = node[key];
  }
  return node;
}

const patternCache = new Map();
function regex(p) {
  if (!patternCache.has(p)) patternCache.set(p, new RegExp(p, 'u'));
  return patternCache.get(p);
}

function check(root, schema, data, ptr, errors) {
  if (schema === true) return;
  if (schema === false) { errors.push({ path: ptr, message: 'no value is allowed here' }); return; }
  if (!schema || typeof schema !== 'object') throw new Error(`Invalid schema at ${ptr || '/'}`);

  for (const k of Object.keys(schema)) {
    if (!SUPPORTED.has(k)) throw new Error(`Unsupported schema keyword "${k}" at ${ptr || '/'}`);
  }

  if (schema.$ref) {
    check(root, resolveRef(root, schema.$ref), data, ptr, errors);
  }

  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => typeMatches(data, t))) {
      errors.push({ path: ptr, message: `expected type ${types.join(' | ')}, got ${typeOf(data)}` });
      return; // further keywords would only repeat the type error
    }
  }

  if ('const' in schema && !deepEqual(schema.const, data)) {
    errors.push({ path: ptr, message: `must equal ${JSON.stringify(schema.const)}` });
  }
  if (schema.enum && !schema.enum.some((e) => deepEqual(e, data))) {
    errors.push({ path: ptr, message: `must be one of ${schema.enum.map((e) => JSON.stringify(e)).join(', ')}` });
  }

  if (typeof data === 'string') {
    const len = [...data].length;
    if (schema.minLength !== undefined && len < schema.minLength) errors.push({ path: ptr, message: `shorter than ${schema.minLength} characters` });
    if (schema.maxLength !== undefined && len > schema.maxLength) errors.push({ path: ptr, message: `longer than ${schema.maxLength} characters` });
    if (schema.pattern !== undefined && !regex(schema.pattern).test(data)) errors.push({ path: ptr, message: `does not match pattern ${schema.pattern}` });
  }

  if (typeof data === 'number' && schema.minimum !== undefined && data < schema.minimum) {
    errors.push({ path: ptr, message: `must be >= ${schema.minimum}` });
  }

  if (Array.isArray(data) && schema.items !== undefined) {
    data.forEach((item, i) => check(root, schema.items, item, `${ptr}/${i}`, errors));
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const r of schema.required || []) {
      if (!Object.prototype.hasOwnProperty.call(data, r)) errors.push({ path: `${ptr}/${escapePointer(r)}`, message: 'is required' });
    }
    const props = schema.properties || {};
    for (const [k, v] of Object.entries(data)) {
      const child = `${ptr}/${escapePointer(k)}`;
      if (Object.prototype.hasOwnProperty.call(props, k)) check(root, props[k], v, child, errors);
      else if (schema.additionalProperties === false) errors.push({ path: child, message: 'is not an allowed property' });
      else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') check(root, schema.additionalProperties, v, child, errors);
    }
  }
}

/** Returns a list of { path, message }; empty when `data` is valid. Throws on an unsupported schema. */
function validate(schema, data) {
  const errors = [];
  check(schema, schema, data, '', errors);
  return errors;
}

module.exports = { validate, typeOf, deepEqual };

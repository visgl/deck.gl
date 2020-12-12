const ALLOWED_ATTR_TYPES = Object.freeze(['function', 'string']);

export function getAttrValue(attr, d) {
  assert(typeof d === 'object', 'Expected "data" to be an object');
  assert(ALLOWED_ATTR_TYPES.includes(typeof attr), 'Expected "attr" to be a function or string');

  // Is function
  if (typeof attr === ALLOWED_ATTR_TYPES[0]) {
    return attr(d);
  }

  // Is string
  if (typeof attr === ALLOWED_ATTR_TYPES[1]) {
    return d.properties[attr];
  }

  return {};
}

export function assert(condition, message = '') {
  if (!condition) {
    throw new Error(`CARTO style error: ${message}`);
  }
}

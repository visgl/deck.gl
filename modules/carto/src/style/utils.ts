const ALLOWED_ATTR_TYPES = Object.freeze(['function', 'string']);

type Row = {properties: Record<string, unknown>};
export type AttributeSelector = string | ((d: Row) => unknown);

export function getAttrValue(attr: AttributeSelector, d: Row): unknown {
  assert(typeof d === 'object', 'Expected "data" to be an object');
  assert(ALLOWED_ATTR_TYPES.includes(typeof attr), 'Expected "attr" to be a function or string');

  // Is function
  if (typeof attr === 'function') {
    return attr(d);
  }
  return d.properties[attr];
}

export function assert(condition, message = ''): asserts condition {
  if (!condition) {
    throw new Error(`CARTO style error: ${message}`);
  }
}

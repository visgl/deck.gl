import {Feature} from 'geojson';

const ALLOWED_ATTR_TYPES = Object.freeze(['function', 'string']);

export type AttributeSelector<DataT = Feature, OutT = any> = string | ((d: DataT) => OutT);

export function getAttrValue<DataT = Feature, OutT = any>(
  attr: string | AttributeSelector<DataT, OutT>,
  d: DataT
): OutT {
  assert(typeof d === 'object', 'Expected "data" to be an object');
  assert(ALLOWED_ATTR_TYPES.includes(typeof attr), 'Expected "attr" to be a function or string');

  // Is function
  if (typeof attr === 'function') {
    return attr(d);
  }
  return (d as unknown as Feature)?.properties?.[attr] as OutT;
}

export function assert(condition, message = ''): asserts condition {
  if (!condition) {
    throw new Error(`CARTO style error: ${message}`);
  }
}

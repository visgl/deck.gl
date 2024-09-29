// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Feature} from 'geojson';
import {assert} from '../utils';

const ALLOWED_ATTR_TYPES = Object.freeze(['function', 'string']);

export type AttributeSelector<DataT = Feature, OutT = any> =
  | string
  | ((d: DataT, info: any) => OutT);

export function getAttrValue<DataT = Feature, OutT = any>(
  attr: string | AttributeSelector<DataT, OutT>,
  d: DataT,
  info: any
): OutT {
  assert(typeof d === 'object', 'Expected "data" to be an object');
  assert(ALLOWED_ATTR_TYPES.includes(typeof attr), 'Expected "attr" to be a function or string');

  // Is function
  if (typeof attr === 'function') {
    return attr(d, info);
  }
  return (d as unknown as Feature)?.properties?.[attr] as OutT;
}

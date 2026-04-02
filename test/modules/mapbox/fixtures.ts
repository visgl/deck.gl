// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {equals} from '@math.gl/core';
import {GL} from '@luma.gl/webgl/constants';

export const DEFAULT_PARAMETERS = {
  depthWriteEnabled: true,
  depthCompare: 'less-equal',
  depthBias: 0,
  blend: true,
  blendColorSrcFactor: 'src-alpha',
  blendColorDstFactor: 'one-minus-src-alpha',
  blendAlphaSrcFactor: 'one',
  blendAlphaDstFactor: 'one-minus-src-alpha',
  blendColorOperation: 'add',
  blendAlphaOperation: 'add'
};

/** Deep equal using math.gl's tolerance-based float comparison for numeric leaf values */
export function approxDeepEqual(actual, expected) {
  if (equals(actual, expected)) {
    return true;
  }
  if (typeof actual !== 'object' || typeof expected !== 'object') {
    return false;
  }

  const keys0 = Object.keys(actual);
  const keys1 = Object.keys(expected);
  if (keys0.length !== keys1.length) {
    return false;
  }
  for (const key of keys1) {
    if (!approxDeepEqual(actual[key], expected[key])) {
      return false;
    }
  }
  return true;
}

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// deck.gl, MIT license

import {NumericArray} from '../types/types';

/** Parse array or string color */
function parseColor(
  color: NumericArray,
  target: NumericArray = [],
  index: number = 0
): NumericArray {
  if (Array.isArray(color) || ArrayBuffer.isView(color)) {
    if (!target && color.length === 4) {
      return color;
    }

    target[index + 0] = color[0];
    target[index + 1] = color[1];
    target[index + 2] = color[2];
    target[index + 3] = color.length === 4 ? color[3] : 255;
    return target;
  }

  if (typeof color === 'string') {
    target = target || [];
    parseHexColor(color, target, index);
    return target;
  }

  return [0, 0, 0, 255];
}

/** Parse a hex color */
function parseHexColor(color: string, target: NumericArray, index: number): number {
  if (color.length === 7) {
    const value = parseInt(color.substring(1), 16);
    target[index + 0] = Math.floor(value / 65536);
    target[index + 1] = Math.floor((value / 256) % 256);
    target[index + 2] = value % 256;
    target[index + 3] = 255;
  } else if (color.length === 9) {
    const value = parseInt(color.substring(1), 16);
    target[index + 0] = Math.floor(value / 16777216);
    target[index + 1] = Math.floor((value / 65536) % 256);
    target[index + 2] = Math.floor((value / 256) % 256);
    target[index + 3] = value % 256;
  }
  return index + 4;
}

function applyOpacity(color: NumericArray, opacity: number = 127): NumericArray {
  return [color[0], color[1], color[2], opacity];
}

// Named exports have a small perf hit in webpack, normally OK
// but for utils that will be called in tight inner loops, export as object
// TODO - this perf hit is mainly an issue for dev builds?
export default {parseColor, applyOpacity};

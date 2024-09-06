// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import type {Color} from '@deck.gl/core';
import type {Device, Texture} from '@luma.gl/core';
import type {NumericArray, TypedArray, TypedArrayConstructor} from '@math.gl/types';
import type {ScaleType} from '../types';

export const defaultColorRange: Color[] = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [240, 59, 32],
  [189, 0, 38]
];

// Converts a colorRange array to a flat array with 4 components per color
export function colorRangeToFlatArray(
  colorRange: Color[] | NumericArray,
  normalize = false,
  ArrayType: TypedArrayConstructor = Float32Array
): TypedArray {
  let flatArray: TypedArray;

  if (Number.isFinite(colorRange[0])) {
    // its already a flat array.
    flatArray = new ArrayType(colorRange as NumericArray);
  } else {
    // flatten it
    flatArray = new ArrayType(colorRange.length * 4);
    let index = 0;

    for (let i = 0; i < colorRange.length; i++) {
      const color = colorRange[i];
      flatArray[index++] = color[0];
      flatArray[index++] = color[1];
      flatArray[index++] = color[2];
      flatArray[index++] = Number.isFinite(color[3]) ? color[3] : 255;
    }
  }

  if (normalize) {
    for (let i = 0; i < flatArray.length; i++) {
      flatArray[i] /= 255;
    }
  }
  return flatArray;
}

export const COLOR_RANGE_FILTER: Record<ScaleType, 'linear' | 'nearest'> = {
  linear: 'linear',
  quantile: 'nearest',
  quantize: 'nearest',
  ordinal: 'nearest'
} as const;

export function updateColorRangeTexture(texture: Texture, type: ScaleType) {
  texture.setSampler({
    minFilter: COLOR_RANGE_FILTER[type],
    magFilter: COLOR_RANGE_FILTER[type]
  });
}

export function createColorRangeTexture(
  device: Device,
  colorRange: Color[] | NumericArray,
  type: ScaleType = 'linear'
): Texture {
  const colors = colorRangeToFlatArray(colorRange, false, Uint8Array);

  return device.createTexture({
    format: 'rgba8unorm',
    mipmaps: false,
    sampler: {
      minFilter: COLOR_RANGE_FILTER[type],
      magFilter: COLOR_RANGE_FILTER[type],
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge'
    },
    data: colors,
    width: colors.length / 4,
    height: 1
  });
}

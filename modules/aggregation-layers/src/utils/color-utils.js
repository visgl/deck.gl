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

export const defaultColorRange = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [240, 59, 32],
  [189, 0, 38]
];

// Converts a colorRange array to a flat array with 4 components per color
export function colorRangeToFlatArray(colorRange, ArrayType, defaultValue, normalize = false) {
  if (Number.isFinite(colorRange[0])) {
    // its already a flat array.
    return colorRange;
  }
  const flatArray = new ArrayType(colorRange.length * 4);
  colorRange.forEach((color, index) => {
    const flatArrayIdnex = index * 4;
    flatArray[flatArrayIdnex] = normalize ? color[0] / 255 : color[0];
    flatArray[flatArrayIdnex + 1] = normalize ? color[1] / 255 : color[1];
    flatArray[flatArrayIdnex + 2] = normalize ? color[2] / 255 : color[2];
    const alpha = Number.isFinite(color[3]) ? color[3] : defaultValue;
    flatArray[flatArrayIdnex + 3] = normalize ? alpha / 255 : alpha;
  });
  return flatArray;
}

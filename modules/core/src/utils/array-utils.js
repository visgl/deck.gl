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

/*
 * Helper function for padArray
 */
function padArrayChunk({source, target, start = 0, end, getData}) {
  end = end || target.length;

  const sourceLength = source.length;
  const targetLength = end - start;

  if (sourceLength > targetLength) {
    target.set(source.subarray(0, targetLength), start);
    return;
  }

  target.set(source, start);

  if (!getData) {
    return;
  }

  // source is not large enough to fill target space, call `getData` to get filler data
  let i = sourceLength;
  while (i < targetLength) {
    const datum = getData(i, source);
    for (let j = 0; j < datum.length; j++) {
      target[start + i] = datum[j];
      i++;
    }
  }
}

/*
 * The padArray function stretches a source array to the size of a target array.
   The arrays can have internal structures (like the attributes of PathLayer and
   SolidPolygonLayer), defined by the optional sourceVertexStarts and targetVertexStarts parameters.
   If the target array is larger, the getData callback is used to fill in the blanks.
 * @params {TypedArray} source - original data
 * @params {TypedArray} target - output data
 * @params {Number} size - length per datum
 * @params {Function} getData - callback to get new data when source is short
 * @params {Array<Number>} [sourceVertexStarts] - subdivision of the original data in [object0StartIndex, object1StartIndex, ...]
 * @params {Array<Number>} [targetVertexStarts] - subdivision of the output data in [object0StartIndex, object1StartIndex, ...]
 */
export function padArray({
  source,
  target,
  size,
  offset = 0,
  getData,
  sourceVertexStarts,
  targetVertexStarts
}) {
  if (!Array.isArray(targetVertexStarts)) {
    // Flat arrays
    padArrayChunk({
      source,
      target,
      getData
    });
    return target;
  }

  // Arrays have internal structure
  let sourceIndex = offset;
  let targetIndex = offset;
  const getChunkData = getData && ((i, chunk) => getData(i + targetIndex, chunk));

  const n = Math.min(sourceVertexStarts.length, targetVertexStarts.length);

  for (let i = 1; i < n; i++) {
    const nextSourceIndex = sourceVertexStarts[i] * size + offset;
    const nextTargetIndex = targetVertexStarts[i] * size + offset;

    padArrayChunk({
      source: source.subarray(sourceIndex, nextSourceIndex),
      target,
      start: targetIndex,
      end: nextTargetIndex,
      getData: getChunkData
    });

    sourceIndex = nextSourceIndex;
    targetIndex = nextTargetIndex;
  }

  if (targetIndex < target.length) {
    padArrayChunk({
      source: [],
      target,
      start: targetIndex,
      getData: getChunkData
    });
  }

  return target;
}

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {NumericArray, TypedArray} from '../types/types';

/*
 * Helper function for padArray
 */
function padArrayChunk(options: {
  /** original data */
  source: TypedArray;
  /** output data */
  target: TypedArray;
  /** length per datum */
  size: number;
  /** callback to get new data when source is short */
  getData: (index: number, context: NumericArray) => NumericArray;
  /** start index */
  start?: number;
  /** end index */
  end?: number;
}): void {
  const {source, target, start = 0, size, getData} = options;
  const end = options.end || target.length;

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
    for (let j = 0; j < size; j++) {
      target[start + i] = datum[j] || 0;
      i++;
    }
  }
}

/*
 * The padArray function stretches a source array to the size of a target array.
   The arrays can have internal structures (like the attributes of PathLayer and
   SolidPolygonLayer), defined by the optional sourceStartIndices and targetStartIndices parameters.
   If the target array is larger, the getData callback is used to fill in the blanks.
 */
export function padArray({
  source,
  target,
  size,
  getData,
  sourceStartIndices,
  targetStartIndices
}: {
  /** original data */
  source: TypedArray;
  /** output data */
  target: TypedArray;
  /** length per datum */
  size: number;
  /** callback to get new data when source is short */
  getData: (index: number, context: NumericArray) => NumericArray;
  /** subdivision of the original data in [object0StartIndex, object1StartIndex, ...] */
  sourceStartIndices?: NumericArray | null;
  /** subdivision of the output data in [object0StartIndex, object1StartIndex, ...] */
  targetStartIndices?: NumericArray | null;
}): TypedArray {
  if (!sourceStartIndices || !targetStartIndices) {
    // Flat arrays
    padArrayChunk({
      source,
      target,
      size,
      getData
    });
    return target;
  }

  // Arrays have internal structure
  let sourceIndex = 0;
  let targetIndex = 0;
  const getChunkData = getData && ((i, chunk) => getData(i + targetIndex, chunk));

  const n = Math.min(sourceStartIndices.length, targetStartIndices.length);

  for (let i = 1; i < n; i++) {
    const nextSourceIndex = sourceStartIndices[i] * size;
    const nextTargetIndex = targetStartIndices[i] * size;

    padArrayChunk({
      source: source.subarray(sourceIndex, nextSourceIndex),
      target,
      start: targetIndex,
      end: nextTargetIndex,
      size,
      getData: getChunkData
    });

    sourceIndex = nextSourceIndex;
    targetIndex = nextTargetIndex;
  }

  if (targetIndex < target.length) {
    padArrayChunk({
      // @ts-ignore
      source: [],
      target,
      start: targetIndex,
      size,
      getData: getChunkData
    });
  }

  return target;
}

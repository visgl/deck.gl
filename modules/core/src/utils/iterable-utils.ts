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
import type {NumericArray} from '../types/types';
import type {AccessorFunction} from '../types/layer-props';

const EMPTY_ARRAY = [];
const placeholderArray = [];

/*
 * Create an Iterable
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
 * and a "context" tracker from the given data
 */
export function createIterable(
  data,
  startRow = 0,
  endRow = Infinity
): {
  iterable: Iterable<any>;
  objectInfo: {
    index: number;
    data: any;
    target: any[];
  };
} {
  let iterable: Iterable<any> = EMPTY_ARRAY;

  const objectInfo = {
    index: -1,
    data,
    // visitor can optionally utilize this to avoid constructing a new array for every object
    target: []
  };

  if (!data) {
    iterable = EMPTY_ARRAY;
  } else if (typeof data[Symbol.iterator] === 'function') {
    // data is already an iterable
    iterable = data;
  } else if (data.length > 0) {
    placeholderArray.length = data.length;
    iterable = placeholderArray;
  }

  if (startRow > 0 || Number.isFinite(endRow)) {
    iterable = (Array.isArray(iterable) ? iterable : Array.from(iterable)).slice(startRow, endRow);
    objectInfo.index = startRow - 1;
  }

  return {iterable, objectInfo};
}

/*
 * Returns true if data is an async iterable object
 */
export function isAsyncIterable(data): boolean {
  return data && data[Symbol.asyncIterator];
}

/*
 * Create an accessor function from a flat buffer that yields the value at each object index
 */
export function getAccessorFromBuffer(
  typedArray,
  options: {
    size: number;
    stride?: number;
    offset?: number;
    startIndices?: NumericArray;
    nested?: boolean;
  }
): AccessorFunction<any, NumericArray> {
  const {size, stride, offset, startIndices, nested} = options;
  const bytesPerElement = typedArray.BYTES_PER_ELEMENT;
  const elementStride = stride ? stride / bytesPerElement : size;
  const elementOffset = offset ? offset / bytesPerElement : 0;
  const vertexCount = Math.floor((typedArray.length - elementOffset) / elementStride);

  return (_, {index, target}) => {
    if (!startIndices) {
      const sourceIndex = index * elementStride + elementOffset;
      for (let j = 0; j < size; j++) {
        target[j] = typedArray[sourceIndex + j];
      }
      return target;
    }
    const startIndex = startIndices[index];
    const endIndex = startIndices[index + 1] || vertexCount;
    let result;

    if (nested) {
      result = new Array(endIndex - startIndex);
      for (let i = startIndex; i < endIndex; i++) {
        const sourceIndex = i * elementStride + elementOffset;
        target = new Array(size);
        for (let j = 0; j < size; j++) {
          target[j] = typedArray[sourceIndex + j];
        }
        result[i - startIndex] = target;
      }
    } else if (elementStride === size) {
      result = typedArray.subarray(
        startIndex * size + elementOffset,
        endIndex * size + elementOffset
      );
    } else {
      result = new typedArray.constructor((endIndex - startIndex) * size);
      let targetIndex = 0;
      for (let i = startIndex; i < endIndex; i++) {
        const sourceIndex = i * elementStride + elementOffset;
        for (let j = 0; j < size; j++) {
          result[targetIndex++] = typedArray[sourceIndex + j];
        }
      }
    }

    return result;
  };
}

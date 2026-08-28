// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const EMPTY_ARRAY = [];
const placeholderArray = [];
/*
 * Create an Iterable
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
 * and a "context" tracker from the given data
 */
export function createIterable(data, startRow = 0, endRow = Infinity) {
    let iterable = EMPTY_ARRAY;
    const objectInfo = {
        index: -1,
        data,
        // visitor can optionally utilize this to avoid constructing a new array for every object
        target: []
    };
    if (!data) {
        iterable = EMPTY_ARRAY;
    }
    else if (typeof data[Symbol.iterator] === 'function') {
        // data is already an iterable
        iterable = data;
    }
    else if (data.length > 0) {
        placeholderArray.length = data.length;
        iterable = placeholderArray;
    }
    if (startRow > 0 || Number.isFinite(endRow)) {
        iterable = (Array.isArray(iterable) ? iterable : Array.from(iterable)).slice(startRow, endRow);
        objectInfo.index = startRow - 1;
    }
    return { iterable, objectInfo };
}
/*
 * Returns true if data is an async iterable object
 */
export function isAsyncIterable(data) {
    return data && data[Symbol.asyncIterator];
}
/*
 * Create an accessor function from a flat buffer that yields the value at each object index
 */
export function getAccessorFromBuffer(typedArray, options) {
    const { size, stride, offset, startIndices, nested } = options;
    const bytesPerElement = typedArray.BYTES_PER_ELEMENT;
    const elementStride = stride ? stride / bytesPerElement : size;
    const elementOffset = offset ? offset / bytesPerElement : 0;
    const vertexCount = Math.floor((typedArray.length - elementOffset) / elementStride);
    return (_, { index, target }) => {
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
        }
        else if (elementStride === size) {
            result = typedArray.subarray(startIndex * size + elementOffset, endIndex * size + elementOffset);
        }
        else {
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
//# sourceMappingURL=iterable-utils.js.map
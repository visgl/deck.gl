// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// Assume data array is sorted by <accessor>
// Replaces the specified range with a new subarray
// Mutates the data array
// Returns {startRow, endRow} of the inserted items
export function replaceInRange({ data, getIndex, dataRange, replace }) {
    const { startRow = 0, endRow = Infinity } = dataRange;
    const count = data.length;
    let replaceStart = count;
    let replaceEnd = count;
    for (let i = 0; i < count; i++) {
        const row = getIndex(data[i]);
        if (replaceStart > i && row >= startRow) {
            replaceStart = i;
        }
        if (row >= endRow) {
            replaceEnd = i;
            break;
        }
    }
    let index = replaceStart;
    const dataLengthChanged = replaceEnd - replaceStart !== replace.length;
    // Save the items after replaceEnd before we overwrite data
    const endChunk = dataLengthChanged ? data.slice(replaceEnd) : undefined;
    // Insert new items
    for (let i = 0; i < replace.length; i++) {
        data[index++] = replace[i];
    }
    if (endChunk) {
        // Append items after replaceEnd
        for (let i = 0; i < endChunk.length; i++) {
            data[index++] = endChunk[i];
        }
        // Trim additional items
        data.length = index;
    }
    return {
        startRow: replaceStart,
        endRow: replaceStart + replace.length
    };
}
//# sourceMappingURL=utils.js.map
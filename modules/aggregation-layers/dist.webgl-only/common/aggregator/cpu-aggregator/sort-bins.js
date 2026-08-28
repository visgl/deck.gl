// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/** Group data points into bins */
export function sortBins({ pointCount, getBinId }) {
    const binsById = new Map();
    for (let i = 0; i < pointCount; i++) {
        const id = getBinId(i);
        if (id === null) {
            continue;
        }
        let bin = binsById.get(String(id));
        if (bin) {
            bin.points.push(i);
        }
        else {
            bin = {
                id,
                index: binsById.size,
                points: [i]
            };
            binsById.set(String(id), bin);
        }
    }
    return Array.from(binsById.values());
}
/** Pack bin ids into a typed array */
export function packBinIds({ bins, dimensions, target }) {
    const targetLength = bins.length * dimensions;
    if (!target || target.length < targetLength) {
        target = new Float32Array(targetLength);
    }
    for (let i = 0; i < bins.length; i++) {
        const { id } = bins[i];
        if (Array.isArray(id)) {
            target.set(id, i * dimensions);
        }
        else {
            target[i] = id;
        }
    }
    return target;
}
//# sourceMappingURL=sort-bins.js.map
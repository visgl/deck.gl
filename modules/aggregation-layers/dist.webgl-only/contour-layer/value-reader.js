// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { CPUAggregator, WebGLAggregator } from "../common/aggregator/index.js";
/** Returns an accessor to the aggregated values from bin id */
export function getAggregatorValueReader(opts) {
    const { aggregator, binIdRange, channel } = opts;
    if (aggregator instanceof WebGLAggregator) {
        const buffer = aggregator.getResult(channel)?.buffer;
        if (buffer) {
            const values = new Float32Array(buffer.readSyncWebGL().buffer);
            return getWebGLAggregatorValueReader(values, binIdRange);
        }
    }
    if (aggregator instanceof CPUAggregator) {
        const values = aggregator.getResult(channel)?.value;
        const ids = aggregator.getBins()?.value;
        if (ids && values) {
            return getCPUAggregatorValueReader(values, ids, aggregator.binCount);
        }
    }
    return null;
}
function getWebGLAggregatorValueReader(values, binIdRange) {
    const [[minX, maxX], [minY, maxY]] = binIdRange;
    const width = maxX - minX;
    const height = maxY - minY;
    return (x, y) => {
        x -= minX;
        y -= minY;
        if (x < 0 || x >= width || y < 0 || y >= height) {
            return NaN;
        }
        return values[y * width + x];
    };
}
function getCPUAggregatorValueReader(values, ids, count) {
    const idMap = {};
    for (let i = 0; i < count; i++) {
        const x = ids[i * 2];
        const y = ids[i * 2 + 1];
        idMap[x] = idMap[x] || {};
        idMap[x][y] = values[i];
    }
    return (x, y) => idMap[x]?.[y] ?? NaN;
}
//# sourceMappingURL=value-reader.js.map
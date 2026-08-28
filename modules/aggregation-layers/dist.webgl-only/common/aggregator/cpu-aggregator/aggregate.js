// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const count = pointIndices => {
    return pointIndices.length;
};
const sum = (pointIndices, getValue) => {
    let result = 0;
    for (const i of pointIndices) {
        result += getValue(i);
    }
    return result;
};
const mean = (pointIndices, getValue) => {
    if (pointIndices.length === 0) {
        return NaN;
    }
    return sum(pointIndices, getValue) / pointIndices.length;
};
const min = (pointIndices, getValue) => {
    let result = Infinity;
    for (const i of pointIndices) {
        const value = getValue(i);
        if (value < result) {
            result = value;
        }
    }
    return result;
};
const max = (pointIndices, getValue) => {
    let result = -Infinity;
    for (const i of pointIndices) {
        const value = getValue(i);
        if (value > result) {
            result = value;
        }
    }
    return result;
};
export const BUILT_IN_OPERATIONS = {
    COUNT: count,
    SUM: sum,
    MEAN: mean,
    MIN: min,
    MAX: max
};
/**
 * Performs the aggregation step. See interface Aggregator comments.
 * @returns Floa32Array of aggregated values, one for each bin, and the [min,max] of the values
 */
export function aggregate({ bins, getValue, operation, target }) {
    if (!target || target.length < bins.length) {
        target = new Float32Array(bins.length);
    }
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let min = Infinity;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let max = -Infinity;
    for (let j = 0; j < bins.length; j++) {
        const { points } = bins[j];
        target[j] = operation(points, getValue);
        if (target[j] < min)
            min = target[j];
        if (target[j] > max)
            max = target[j];
    }
    return { value: target, domain: [min, max] };
}
//# sourceMappingURL=aggregate.js.map
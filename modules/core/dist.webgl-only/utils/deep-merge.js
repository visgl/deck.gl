// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/** Merge two viewstates, except `id`
 * For position arrays such as `target`, only override the components that are defined.
 */
export function deepMergeViewState(a, b) {
    const result = { ...a };
    for (const key in b) {
        if (key === 'id')
            continue;
        if (Array.isArray(result[key]) && Array.isArray(b[key])) {
            result[key] = mergeNumericArray(result[key], b[key]);
        }
        else {
            result[key] = b[key];
        }
    }
    return result;
}
function mergeNumericArray(target, source) {
    target = target.slice();
    for (let i = 0; i < source.length; i++) {
        const v = source[i];
        if (Number.isFinite(v)) {
            target[i] = v;
        }
    }
    return target;
}
//# sourceMappingURL=deep-merge.js.map
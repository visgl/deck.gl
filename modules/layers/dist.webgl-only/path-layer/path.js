// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { cutPolylineByGrid, cutPolylineByMercatorBounds } from '@math.gl/polygon';
/**
 * Flattens a nested path object
 * Cut the feature if needed (globe projection, wrap longitude, etc.)
 * Returns a flat array of path positions, or a list of flat arrays representing multiple paths
 */
export function normalizePath(path, size, gridResolution, wrapLongitude) {
    let flatPath;
    if (Array.isArray(path[0])) {
        const length = path.length * size;
        flatPath = new Array(length);
        for (let i = 0; i < path.length; i++) {
            for (let j = 0; j < size; j++) {
                flatPath[i * size + j] = path[i][j] || 0;
            }
        }
    }
    else {
        flatPath = path;
    }
    if (gridResolution) {
        return cutPolylineByGrid(flatPath, { size, gridResolution });
    }
    if (wrapLongitude) {
        return cutPolylineByMercatorBounds(flatPath, { size });
    }
    return flatPath;
}
//# sourceMappingURL=path.js.map
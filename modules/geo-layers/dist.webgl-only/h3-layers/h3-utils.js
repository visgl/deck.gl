// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { cellToBoundary, cellToLatLng } from 'h3-js';
import { lerp } from '@math.gl/core';
// normalize longitudes w.r.t center (refLng), when not provided first vertex
export function normalizeLongitudes(vertices, refLng) {
    refLng = refLng === undefined ? vertices[0][0] : refLng;
    for (const pt of vertices) {
        const deltaLng = pt[0] - refLng;
        if (deltaLng > 180) {
            pt[0] -= 360;
        }
        else if (deltaLng < -180) {
            pt[0] += 360;
        }
    }
}
// scale polygon vertices w.r.t center (hexId)
export function scalePolygon(hexId, vertices, factor) {
    const [lat, lng] = cellToLatLng(hexId);
    const actualCount = vertices.length;
    // normalize with respect to center
    normalizeLongitudes(vertices, lng);
    // `cellToBoundary` returns same array object for first and last vertex (closed polygon),
    // if so skip scaling the last vertex
    const vertexCount = vertices[0] === vertices[actualCount - 1] ? actualCount - 1 : actualCount;
    for (let i = 0; i < vertexCount; i++) {
        vertices[i][0] = lerp(lng, vertices[i][0], factor);
        vertices[i][1] = lerp(lat, vertices[i][1], factor);
    }
}
// gets hexagon centroid
export function getHexagonCentroid(getHexagon, object, objectInfo) {
    const hexagonId = getHexagon(object, objectInfo);
    const [lat, lng] = cellToLatLng(hexagonId);
    return [lng, lat];
}
export function h3ToPolygon(hexId, coverage = 1) {
    const vertices = cellToBoundary(hexId, true);
    if (coverage !== 1) {
        // scale and normalize vertices w.r.t to center
        scalePolygon(hexId, vertices, coverage);
    }
    else {
        // normalize w.r.t to start vertex
        normalizeLongitudes(vertices);
    }
    return vertices;
}
export function flattenPolygon(vertices) {
    const positions = new Float64Array(vertices.length * 2);
    let i = 0;
    for (const pt of vertices) {
        positions[i++] = pt[0];
        positions[i++] = pt[1];
    }
    return positions;
}
//# sourceMappingURL=h3-utils.js.map
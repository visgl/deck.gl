// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// All utility methods needed to implement Marching Squares algorithm
// Ref: https://en.wikipedia.org/wiki/Marching_squares
import { ISOLINES_CODE_OFFSET_MAP, ISOBANDS_CODE_OFFSET_MAP } from "./marching-squares-codes.js";
// Utility methods
function getVertexCode(weight, threshold) {
    // threshold must be a single value or a range (array of size 2)
    if (Number.isNaN(weight)) {
        return 0;
    }
    // Iso-bands
    if (Array.isArray(threshold)) {
        if (weight < threshold[0]) {
            return 0;
        }
        return weight < threshold[1] ? 1 : 2;
    }
    // Iso-lines
    return weight >= threshold ? 1 : 0;
}
// Returns marching square code for given cell
/* eslint-disable complexity, max-statements*/
export function getCode(opts) {
    // Assumptions
    // Origin is on bottom-left , and X increase to right, Y to top
    // When processing one cell, we process 4 cells, by extending row to top and on column to right
    // to create a 2X2 cell grid
    const { x, y, xRange, yRange, getValue, threshold } = opts;
    const isLeftBoundary = x < xRange[0];
    const isRightBoundary = x >= xRange[1] - 1;
    const isBottomBoundary = y < yRange[0];
    const isTopBoundary = y >= yRange[1] - 1;
    const isBoundary = isLeftBoundary || isRightBoundary || isBottomBoundary || isTopBoundary;
    let weights = 0;
    let current;
    let right;
    let top;
    let topRight;
    // TOP
    if (isLeftBoundary || isTopBoundary) {
        top = 0;
    }
    else {
        const w = getValue(x, y + 1);
        top = getVertexCode(w, threshold);
        weights += w;
    }
    // TOP-RIGHT
    if (isRightBoundary || isTopBoundary) {
        topRight = 0;
    }
    else {
        const w = getValue(x + 1, y + 1);
        topRight = getVertexCode(w, threshold);
        weights += w;
    }
    // RIGHT
    if (isRightBoundary || isBottomBoundary) {
        right = 0;
    }
    else {
        const w = getValue(x + 1, y);
        right = getVertexCode(w, threshold);
        weights += w;
    }
    // CURRENT
    if (isLeftBoundary || isBottomBoundary) {
        current = 0;
    }
    else {
        const w = getValue(x, y);
        current = getVertexCode(w, threshold);
        weights += w;
    }
    let code = -1;
    if (Number.isFinite(threshold)) {
        code = (top << 3) | (topRight << 2) | (right << 1) | current;
    }
    if (Array.isArray(threshold)) {
        code = (top << 6) | (topRight << 4) | (right << 2) | current;
    }
    let meanCode = 0;
    // meanCode is only needed for saddle cases, and they should
    // only occur when we are not processing a cell on boundary
    // because when on a boundary either, bottom-row, top-row, left-column or right-column will have both 0 codes
    if (!isBoundary) {
        meanCode = getVertexCode(weights / 4, threshold);
    }
    return { code, meanCode };
}
/* eslint-enable complexity, max-statements*/
// Returns intersection vertices for given cellindex
// [x, y] refers current marching cell, reference vertex is always top-right corner
export function getPolygons(opts) {
    const { x, y, z, code, meanCode } = opts;
    let offsets = ISOBANDS_CODE_OFFSET_MAP[code];
    // handle saddle cases
    if (!Array.isArray(offsets)) {
        offsets = offsets[meanCode];
    }
    // Reference vertex is at top-right move to top-right corner
    const rX = x + 1;
    const rY = y + 1;
    // offsets format
    // [[1A, 1B, 1C, ...], [2A, 2B, 2C, ...]],
    // vertices format
    // [
    //   [[x1A, y1A], [x1B, y1B], [x1C, y1C] ... ],
    //        ...
    // ]
    const polygons = [];
    offsets.forEach(polygonOffsets => {
        const polygon = [];
        polygonOffsets.forEach(xyOffset => {
            const vX = rX + xyOffset[0];
            const vY = rY + xyOffset[1];
            polygon.push([vX, vY, z]);
        });
        polygons.push(polygon);
    });
    return polygons;
}
// Returns intersection vertices for given cellindex
// [x, y] refers current marching cell, reference vertex is always top-right corner
export function getLines(opts) {
    const { x, y, z, code, meanCode } = opts;
    let offsets = ISOLINES_CODE_OFFSET_MAP[code];
    // handle saddle cases
    if (!Array.isArray(offsets)) {
        offsets = offsets[meanCode];
    }
    // Reference vertex is at top-right move to top-right corner
    const rX = x + 1;
    const rY = y + 1;
    // offsets format
    // [[1A, 1B], [2A, 2B]],
    // vertices format
    // [[x1A, y1A], [x1B, y1B], [x2A, x2B], ...],
    const lines = [];
    offsets.forEach(xyOffsets => {
        xyOffsets.forEach(offset => {
            const vX = rX + offset[0];
            const vY = rY + offset[1];
            lines.push([vX, vY, z]);
        });
    });
    return lines;
}
//# sourceMappingURL=marching-squares.js.map
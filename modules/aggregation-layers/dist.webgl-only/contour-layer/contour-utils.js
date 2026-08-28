// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { getCode, getLines, getPolygons } from "./marching-squares.js";
// Given all the cell weights, generates contours for each threshold.
/* eslint-disable max-depth */
export function generateContours({ contours, getValue, xRange, yRange }) {
    const contourLines = [];
    const contourPolygons = [];
    let segmentIndex = 0;
    let polygonIndex = 0;
    for (let i = 0; i < contours.length; i++) {
        const contour = contours[i];
        const z = contour.zIndex ?? i;
        const { threshold } = contour;
        for (let x = xRange[0] - 1; x < xRange[1]; x++) {
            for (let y = yRange[0] - 1; y < yRange[1]; y++) {
                // Get the MarchingSquares code based on neighbor cell weights.
                const { code, meanCode } = getCode({
                    getValue,
                    threshold,
                    x,
                    y,
                    xRange,
                    yRange
                });
                const opts = {
                    x,
                    y,
                    z,
                    code,
                    meanCode
                };
                if (Array.isArray(threshold)) {
                    // ISO bands
                    const polygons = getPolygons(opts);
                    for (const polygon of polygons) {
                        contourPolygons[polygonIndex++] = {
                            vertices: polygon,
                            contour
                        };
                    }
                }
                else {
                    // ISO lines
                    const path = getLines(opts);
                    if (path.length > 0) {
                        contourLines[segmentIndex++] = {
                            vertices: path,
                            contour
                        };
                    }
                }
            }
        }
    }
    return { lines: contourLines, polygons: contourPolygons };
}
/* eslint-enable max-depth */
//# sourceMappingURL=contour-utils.js.map
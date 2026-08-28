// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
export function getBounds(points) {
    // Now build bounding box in world space (aligned to world coordiante system)
    const x = points.map(p => p[0]);
    const y = points.map(p => p[1]);
    const xMin = Math.min.apply(null, x);
    const xMax = Math.max.apply(null, x);
    const yMin = Math.min.apply(null, y);
    const yMax = Math.max.apply(null, y);
    return [xMin, yMin, xMax, yMax];
}
// true if currentBounds contains targetBounds, false otherwise
export function boundsContain(currentBounds, targetBounds) {
    if (targetBounds[0] >= currentBounds[0] &&
        targetBounds[2] <= currentBounds[2] &&
        targetBounds[1] >= currentBounds[1] &&
        targetBounds[3] <= currentBounds[3]) {
        return true;
    }
    return false;
}
const scratchArray = new Float32Array(12);
// For given rectangle bounds generates two triangles vertices that coverit completely
export function packVertices(points, dimensions = 2) {
    let index = 0;
    for (const point of points) {
        for (let i = 0; i < dimensions; i++) {
            scratchArray[index++] = point[i] || 0;
        }
    }
    return scratchArray;
}
// Expands boundingBox:[xMin, yMin, xMax, yMax] to match aspect ratio of given width and height
export function scaleToAspectRatio(boundingBox, width, height) {
    const [xMin, yMin, xMax, yMax] = boundingBox;
    const currentWidth = xMax - xMin;
    const currentHeight = yMax - yMin;
    let newWidth = currentWidth;
    let newHeight = currentHeight;
    if (currentWidth / currentHeight < width / height) {
        // expand bounding box width
        newWidth = (width / height) * currentHeight;
    }
    else {
        newHeight = (height / width) * currentWidth;
    }
    if (newWidth < width) {
        newWidth = width;
        newHeight = height;
    }
    const xCenter = (xMax + xMin) / 2;
    const yCenter = (yMax + yMin) / 2;
    return [
        xCenter - newWidth / 2,
        yCenter - newHeight / 2,
        xCenter + newWidth / 2,
        yCenter + newHeight / 2
    ];
}
// Get texture coordiante of point inside a bounding box
export function getTextureCoordinates(point, bounds) {
    const [xMin, yMin, xMax, yMax] = bounds;
    return [(point[0] - xMin) / (xMax - xMin), (point[1] - yMin) / (yMax - yMin)];
}
//# sourceMappingURL=heatmap-layer-utils.js.map
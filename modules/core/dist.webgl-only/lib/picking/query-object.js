// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import log from "../../utils/log.js";
const NO_PICKED_OBJECT = {
    pickedColor: null,
    pickedObjectIndex: -1
};
/* eslint-disable max-depth, max-statements */
/**
 * Pick at a specified pixel with a tolerance radius
 * Returns the closest object to the pixel in shape `{pickedColor, pickedLayer, pickedObjectIndex}`
 */
export function getClosestObject({ pickedColors, decodePickingColor, deviceX, deviceY, deviceRadius, deviceRect }) {
    // Traverse all pixels in picking results and find the one closest to the supplied
    // [deviceX, deviceY]
    const { x, y, width, height } = deviceRect;
    let minSquareDistanceToCenter = deviceRadius * deviceRadius;
    let closestPixelIndex = -1;
    let i = 0;
    for (let row = 0; row < height; row++) {
        const dy = row + y - deviceY;
        const dy2 = dy * dy;
        if (dy2 > minSquareDistanceToCenter) {
            // skip this row
            i += 4 * width;
        }
        else {
            for (let col = 0; col < width; col++) {
                // Decode picked layer from color
                const pickedLayerIndex = pickedColors[i + 3] - 1;
                if (pickedLayerIndex >= 0) {
                    const dx = col + x - deviceX;
                    const d2 = dx * dx + dy2;
                    if (d2 <= minSquareDistanceToCenter) {
                        minSquareDistanceToCenter = d2;
                        closestPixelIndex = i;
                    }
                }
                i += 4;
            }
        }
    }
    if (closestPixelIndex >= 0) {
        // Decode picked object index from color
        const pickedColor = pickedColors.slice(closestPixelIndex, closestPixelIndex + 4);
        const pickedObject = decodePickingColor(pickedColor);
        if (pickedObject) {
            const dy = Math.floor(closestPixelIndex / 4 / width);
            const dx = closestPixelIndex / 4 - dy * width;
            return {
                ...pickedObject,
                pickedColor,
                pickedX: x + dx,
                pickedY: y + dy
            };
        }
        log.error('Picked non-existent layer. Is picking buffer corrupt?')();
    }
    return NO_PICKED_OBJECT;
}
/**
 * Examines a picking buffer for unique colors
 * Returns array of unique objects in shape `{x, y, pickedColor, pickedLayer, pickedObjectIndex}`
 */
export function getUniqueObjects({ pickedColors, decodePickingColor }) {
    const uniqueColors = new Map();
    // Traverse all pixels in picking results and get unique colors
    if (pickedColors) {
        for (let i = 0; i < pickedColors.length; i += 4) {
            // Decode picked layer from color
            const pickedLayerIndex = pickedColors[i + 3] - 1;
            if (pickedLayerIndex >= 0) {
                const pickedColor = pickedColors.slice(i, i + 4);
                const colorKey = pickedColor.join(',');
                // eslint-disable-next-line
                if (!uniqueColors.has(colorKey)) {
                    const pickedObject = decodePickingColor(pickedColor);
                    // eslint-disable-next-line
                    if (pickedObject) {
                        uniqueColors.set(colorKey, {
                            ...pickedObject,
                            color: pickedColor
                        });
                    }
                    else {
                        log.error('Picked non-existent layer. Is picking buffer corrupt?')();
                    }
                }
            }
        }
    }
    return Array.from(uniqueColors.values());
}
//# sourceMappingURL=query-object.js.map
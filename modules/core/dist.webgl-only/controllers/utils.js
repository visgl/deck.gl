// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { getPosition, parsePosition } from "../utils/positions.js";
/** Returns the on-screen rectangle available for fitting max bounds. */
export function getMaxBoundsRect(width, height, padding) {
    const left = getPosition(parsePosition(padding?.left ?? 0), width);
    const right = getPosition(parsePosition(padding?.right ?? 0), width);
    const top = getPosition(parsePosition(padding?.top ?? 0), height);
    const bottom = getPosition(parsePosition(padding?.bottom ?? 0), height);
    return {
        x: left,
        y: top,
        width: width - left - right,
        height: height - top - bottom
    };
}
/** Measures the available screen space on each side of the projected semantic target. */
export function getMaxBoundsExtents(viewport, target, rect) {
    let [x, y] = viewport.project(target);
    // Custom controller states may provide a viewport that cannot project their
    // semantic target. Preserve the historical centered behavior in that case.
    x = Number.isFinite(x) ? x : viewport.width / 2;
    y = Number.isFinite(y) ? y : viewport.height / 2;
    return {
        left: x - rect.x,
        right: rect.x + rect.width - x,
        top: y - rect.y,
        bottom: rect.y + rect.height - y
    };
}
//# sourceMappingURL=utils.js.map
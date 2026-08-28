// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import Viewport from "../viewports/viewport.js";
import { Matrix4, clamp, vec2 } from '@math.gl/core';
import { pixelsToWorld } from '@math.gl/web-mercator';
const viewMatrix = new Matrix4().lookAt({ eye: [0, 0, 1] });
function getProjectionMatrix({ width, height, near, far, padding }) {
    let left = -width / 2;
    let right = width / 2;
    let bottom = -height / 2;
    let top = height / 2;
    if (padding) {
        const { left: l = 0, right: r = 0, top: t = 0, bottom: b = 0 } = padding;
        const offsetX = clamp((l + width - r) / 2, 0, width) - width / 2;
        const offsetY = clamp((t + height - b) / 2, 0, height) - height / 2;
        left -= offsetX;
        right -= offsetX;
        bottom += offsetY;
        top += offsetY;
    }
    return new Matrix4().ortho({
        left,
        right,
        bottom,
        top,
        near,
        far
    });
}
class OrthographicViewport extends Viewport {
    constructor(props) {
        const { width, height, near = 0.1, far = 1000, zoom = 0, target = [0, 0, 0], padding = null, flipY = true } = props;
        const zoomX = props.zoomX ?? (Array.isArray(zoom) ? zoom[0] : zoom);
        const zoomY = props.zoomY ?? (Array.isArray(zoom) ? zoom[1] : zoom);
        const zoom_ = Number.isFinite(props.zoom) ? props.zoom : Math.min(zoomX, zoomY);
        const scale = Math.pow(2, zoom_);
        let distanceScales;
        // Axis-specific zoom overrides the scalar base zoom independently on each axis.
        if (zoomX !== zoom_ || zoomY !== zoom_) {
            const scaleX = Math.pow(2, zoomX);
            const scaleY = Math.pow(2, zoomY);
            distanceScales = {
                unitsPerMeter: [scaleX / scale, scaleY / scale, 1],
                metersPerUnit: [scale / scaleX, scale / scaleY, 1]
            };
        }
        super({
            ...props,
            // in case viewState contains longitude/latitude values,
            // make sure that the base Viewport class does not treat this as a geospatial viewport
            longitude: undefined,
            position: target,
            viewMatrix: viewMatrix.clone().scale([scale, scale * (flipY ? -1 : 1), scale]),
            projectionMatrix: getProjectionMatrix({
                width: width || 1,
                height: height || 1,
                padding,
                near,
                far
            }),
            zoom: zoom_,
            distanceScales
        });
        this.target = target;
        this.zoomX = zoomX;
        this.zoomY = zoomY;
        this.flipY = flipY;
    }
    projectFlat([X, Y]) {
        const { unitsPerMeter } = this.distanceScales;
        return [X * unitsPerMeter[0], Y * unitsPerMeter[1]];
    }
    unprojectFlat([x, y]) {
        const { metersPerUnit } = this.distanceScales;
        return [x * metersPerUnit[0], y * metersPerUnit[1]];
    }
    /* Needed by LinearInterpolator */
    panByPosition(coords, pixel, startPixel) {
        const fromLocation = pixelsToWorld(pixel, this.pixelUnprojectionMatrix);
        const toLocation = this.projectFlat(coords);
        const translate = vec2.add([], toLocation, vec2.negate([], fromLocation));
        const newCenter = vec2.add([], this.center, translate);
        return { target: this.unprojectFlat(newCenter) };
    }
}
OrthographicViewport.displayName = 'OrthographicViewport';
export default OrthographicViewport;
//# sourceMappingURL=orthographic-viewport.js.map
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import Viewport from "../viewports/viewport.js";
import { getMeterZoom } from '@math.gl/web-mercator';
import { Matrix4, _SphericalCoordinates as SphericalCoordinates } from '@math.gl/core';
class FirstPersonViewport extends Viewport {
    constructor(props) {
        // TODO - push direction handling into Matrix4.lookAt
        const { longitude, latitude, modelMatrix, bearing = 0, pitch = 0, up = [0, 0, 1] } = props;
        // Always calculate direction from bearing and pitch
        const spherical = new SphericalCoordinates({
            bearing,
            // Avoid "pixel project matrix not invertible" error
            pitch: pitch === -90 ? 0.0001 : 90 + pitch
        });
        const dir = spherical.toVector3().normalize();
        // Direction is relative to model coordinates, of course
        const center = modelMatrix ? new Matrix4(modelMatrix).transformAsVector(dir) : dir;
        // Just the direction. All the positioning is done in viewport.js
        const zoom = Number.isFinite(latitude) ? getMeterZoom({ latitude: latitude }) : 0;
        const scale = Math.pow(2, zoom);
        const viewMatrix = new Matrix4().lookAt({ eye: [0, 0, 0], center, up }).scale(scale);
        super({
            ...props,
            zoom,
            viewMatrix
        });
        this.latitude = latitude;
        this.longitude = longitude;
        this.pitch = pitch;
        this.bearing = bearing;
        this.up = up;
    }
}
FirstPersonViewport.displayName = 'FirstPersonViewport';
export default FirstPersonViewport;
//# sourceMappingURL=first-person-viewport.js.map
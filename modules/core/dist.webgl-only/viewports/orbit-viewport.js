// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import Viewport from "../viewports/viewport.js";
import { Matrix4 } from '@math.gl/core';
import { pixelsToWorld, fovyToAltitude } from '@math.gl/web-mercator';
import { getProjectionParameters } from "../utils/math-utils.js";
const DEGREES_TO_RADIANS = Math.PI / 180;
function getViewMatrix({ height, focalDistance, orbitAxis, rotationX, rotationOrbit, zoom }) {
    // We position the camera so that one common space unit (world space unit scaled by zoom)
    // at the target maps to one screen pixel.
    // This is a similar technique to that used in web mercator projection
    // By doing so we are able to convert between common space and screen space sizes efficiently
    // in the vertex shader.
    const up = orbitAxis === 'Z' ? [0, 0, 1] : [0, 1, 0];
    const eye = orbitAxis === 'Z' ? [0, -focalDistance, 0] : [0, 0, focalDistance];
    const viewMatrix = new Matrix4().lookAt({ eye, up });
    viewMatrix.rotateX(rotationX * DEGREES_TO_RADIANS);
    if (orbitAxis === 'Z') {
        viewMatrix.rotateZ(rotationOrbit * DEGREES_TO_RADIANS);
    }
    else {
        viewMatrix.rotateY(rotationOrbit * DEGREES_TO_RADIANS);
    }
    // When height increases, we need to increase the distance from the camera to the target to
    // keep the 1:1 mapping. However, this also changes the projected depth of each position by
    // moving them further away between the near/far plane.
    // Without modifying the default near/far planes, we instead scale down the common space to
    // remove the distortion to the depth field.
    const projectionScale = Math.pow(2, zoom) / height;
    viewMatrix.scale(projectionScale);
    return viewMatrix;
}
class OrbitViewport extends Viewport {
    constructor(props) {
        const { height, projectionMatrix, fovy = 50, // For setting camera position
        orbitAxis = 'Z', // Orbit axis with 360 degrees rotating freedom, can only be 'Y' or 'Z'
        target = [0, 0, 0], // Which point is camera looking at, default origin
        rotationX = 0, // Rotating angle around X axis
        rotationOrbit = 0, // Rotating angle around orbit axis
        zoom = 0 } = props;
        const focalDistance = projectionMatrix ? projectionMatrix[5] / 2 : fovyToAltitude(fovy);
        super({
            ...props,
            // in case viewState contains longitude/latitude values,
            // make sure that the base Viewport class does not treat this as a geospatial viewport
            longitude: undefined,
            viewMatrix: getViewMatrix({
                height: height || 1,
                focalDistance,
                orbitAxis,
                rotationX,
                rotationOrbit,
                zoom
            }),
            fovy,
            focalDistance,
            position: target,
            zoom
        });
        this.target = target;
        this.orbitAxis = orbitAxis;
        this.rotationX = rotationX;
        this.rotationOrbit = rotationOrbit;
        this.fovy = fovy;
        this.projectedCenter = this.project(this.center);
    }
    unproject(xyz, { topLeft = true } = {}) {
        const [x, y, z = this.projectedCenter[2]] = xyz;
        const y2 = topLeft ? y : this.height - y;
        const [X, Y, Z] = pixelsToWorld([x, y2, z], this.pixelUnprojectionMatrix);
        return [X, Y, Z];
    }
    panByPosition(coords, pixel, startPixel) {
        const p0 = this.project(coords);
        const { near, far } = getProjectionParameters(this.projectionMatrix);
        const pz = (near * far) / (far - p0[2] * (far - near));
        const centerZ = (near * far) / (far - this.projectedCenter[2] * (far - near));
        const shiftScale = pz / centerZ;
        const nextCenter = [
            this.width / 2 + (p0[0] - pixel[0]) * shiftScale,
            this.height / 2 + (p0[1] - pixel[1]) * shiftScale,
            this.projectedCenter[2]
        ];
        return {
            target: this.unproject(nextCenter)
        };
    }
}
OrbitViewport.displayName = 'OrbitViewport';
export default OrbitViewport;
//# sourceMappingURL=orbit-viewport.js.map
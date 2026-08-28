// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/**
 * Projection utils
 * TODO: move to Viewport class?
 */
import { getOffsetOrigin } from "./viewport-uniforms.js";
import WebMercatorViewport from "../../viewports/web-mercator-viewport.js";
import { vec3, vec4 } from '@math.gl/core';
import { addMetersToLngLat } from '@math.gl/web-mercator';
const DEFAULT_COORDINATE_ORIGIN = [0, 0, 0];
// In project.glsl, offset modes calculate z differently from LNG_LAT mode.
// offset modes apply the y adjustment (unitsPerMeter2) when projecting z
// LNG_LAT mode only use the linear scale.
function lngLatZToWorldPosition(lngLatZ, viewport, offsetMode = false) {
    const p = viewport.projectPosition(lngLatZ);
    // TODO - avoid using instanceof
    if (offsetMode && viewport instanceof WebMercatorViewport) {
        const [longitude, latitude, z = 0] = lngLatZ;
        const distanceScales = viewport.getDistanceScales([longitude, latitude]);
        p[2] = z * distanceScales.unitsPerMeter[2];
    }
    return p;
}
function normalizeParameters(opts) {
    const { viewport, modelMatrix, coordinateOrigin } = opts;
    let { coordinateSystem, fromCoordinateSystem, fromCoordinateOrigin } = opts;
    if (coordinateSystem === 'default') {
        coordinateSystem = viewport.isGeospatial ? 'lnglat' : 'cartesian';
    }
    if (fromCoordinateSystem === undefined) {
        fromCoordinateSystem = coordinateSystem;
    }
    else if (fromCoordinateSystem === 'default') {
        fromCoordinateSystem = viewport.isGeospatial ? 'lnglat' : 'cartesian';
    }
    if (fromCoordinateOrigin === undefined) {
        fromCoordinateOrigin = coordinateOrigin;
    }
    return {
        viewport,
        coordinateSystem,
        coordinateOrigin,
        modelMatrix,
        fromCoordinateSystem,
        fromCoordinateOrigin
    };
}
/** Get the common space position from world coordinates in the given coordinate system */
export function getWorldPosition(position, { viewport, modelMatrix, coordinateSystem, coordinateOrigin, offsetMode }) {
    let [x, y, z = 0] = position;
    if (modelMatrix) {
        [x, y, z] = vec4.transformMat4([], [x, y, z, 1.0], modelMatrix);
    }
    switch (coordinateSystem) {
        case 'default':
            return getWorldPosition(position, {
                viewport,
                modelMatrix,
                coordinateSystem: viewport.isGeospatial ? 'lnglat' : 'cartesian',
                coordinateOrigin,
                offsetMode
            });
        case 'lnglat':
            return lngLatZToWorldPosition([x, y, z], viewport, offsetMode);
        case 'lnglat-offsets':
            return lngLatZToWorldPosition([x + coordinateOrigin[0], y + coordinateOrigin[1], z + (coordinateOrigin[2] || 0)], viewport, offsetMode);
        case 'meter-offsets':
            return lngLatZToWorldPosition(addMetersToLngLat(coordinateOrigin, [x, y, z]), viewport, offsetMode);
        case 'cartesian':
            return viewport.isGeospatial
                ? [x + coordinateOrigin[0], y + coordinateOrigin[1], z + coordinateOrigin[2]]
                : viewport.projectPosition([x, y, z]);
        default:
            throw new Error(`Invalid coordinateSystem: ${coordinateSystem}`);
    }
}
/**
 * Equivalent to project_position in project.glsl
 * projects a user supplied position to world position directly with or without
 * a reference coordinate system
 */
export function projectPosition(position, params) {
    const { viewport, coordinateSystem, coordinateOrigin, modelMatrix, fromCoordinateSystem, fromCoordinateOrigin } = normalizeParameters(params);
    const { autoOffset = true } = params;
    const { geospatialOrigin = DEFAULT_COORDINATE_ORIGIN, shaderCoordinateOrigin = DEFAULT_COORDINATE_ORIGIN, offsetMode = false } = autoOffset ? getOffsetOrigin(viewport, coordinateSystem, coordinateOrigin) : {};
    const worldPosition = getWorldPosition(position, {
        viewport,
        modelMatrix,
        coordinateSystem: fromCoordinateSystem,
        coordinateOrigin: fromCoordinateOrigin,
        offsetMode
    });
    if (offsetMode) {
        const positionCommonSpace = viewport.projectPosition(geospatialOrigin || shaderCoordinateOrigin);
        vec3.sub(worldPosition, worldPosition, positionCommonSpace);
    }
    return worldPosition;
}
//# sourceMappingURL=project-functions.js.map
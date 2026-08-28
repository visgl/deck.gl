// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { clamp, vec3, Quaternion } from '@math.gl/core';
import TransitionInterpolator from "../transitions/transition-interpolator.js";
import { zoomAdjust } from "./globe-viewport.js";
const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;
/**
 * Static utility methods for sphere geometry on the unit globe.
 * Used by GlobeState and the globe inertia interpolators.
 */
export class Globe {
    /** Convert (lng, lat) in degrees to a unit-sphere position */
    static toPosition(lng, lat) {
        const phi = lat * DEGREES_TO_RADIANS;
        const lam = lng * DEGREES_TO_RADIANS;
        const cp = Math.cos(phi);
        return [cp * Math.cos(lam), cp * Math.sin(lam), Math.sin(phi)];
    }
    /** Convert a unit-sphere position to [lng, lat] in degrees */
    static toLngLat(v) {
        return [
            Math.atan2(v[1], v[0]) * RADIANS_TO_DEGREES,
            Math.asin(clamp(v[2], -1, 1)) * RADIANS_TO_DEGREES
        ];
    }
    /** North and East tangent vectors at a given (lng, lat) */
    static tangentBasis(lng, lat) {
        const phi = lat * DEGREES_TO_RADIANS;
        const lam = lng * DEGREES_TO_RADIANS;
        const sp = Math.sin(phi);
        const cp = Math.cos(phi);
        const sl = Math.sin(lam);
        const cl = Math.cos(lam);
        return {
            N: [-sp * cl, -sp * sl, cp],
            E: [-sl, cl, 0]
        };
    }
    /** Camera "up" direction on the unit sphere for a given bearing */
    static upVector(lng, lat, bearing) {
        const { N, E } = Globe.tangentBasis(lng, lat);
        const b = bearing * DEGREES_TO_RADIANS;
        const cb = Math.cos(b);
        const sb = Math.sin(b);
        return [N[0] * cb + E[0] * sb, N[1] * cb + E[1] * sb, N[2] * cb + E[2] * sb];
    }
    /** Bearing (degrees) from a camera up vector at a given lng/lat */
    static bearing(upVector, lng, lat) {
        const { N, E } = Globe.tangentBasis(lng, lat);
        return Math.atan2(vec3.dot(upVector, E), vec3.dot(upVector, N)) * RADIANS_TO_DEGREES;
    }
    /** Camera frame for panning at a given position/bearing */
    static cameraFrame(lng, lat, bearing) {
        const position = Globe.toPosition(lng, lat);
        const up = Globe.upVector(lng, lat, bearing);
        const { N, E } = Globe.tangentBasis(lng, lat);
        const b = bearing * DEGREES_TO_RADIANS;
        const cb = Math.cos(b);
        const sb = Math.sin(b);
        const right = [E[0] * cb - N[0] * sb, E[1] * cb - N[1] * sb, E[2] * cb - N[2] * sb];
        return {
            position,
            up,
            axisHorizontal: vec3.cross([], position, right),
            axisVertical: vec3.cross([], position, up),
            longitude: lng,
            latitude: lat,
            bearing
        };
    }
    /** Angular distance in radians between two lng/lat points (great circle arc) */
    static angularDistance(a, b) {
        const pa = Globe.toPosition(a.longitude, a.latitude);
        const pb = Globe.toPosition(b.longitude, b.latitude);
        return Math.acos(clamp(vec3.dot(pa, pb), -1, 1));
    }
    /** Normalized rotation axis of the great circle between two lng/lat points */
    static greatCircleAxis(a, b) {
        const pa = Globe.toPosition(a.longitude, a.latitude);
        const pb = Globe.toPosition(b.longitude, b.latitude);
        return vec3.normalize([], vec3.cross([], pa, pb));
    }
    /** Rotate a vector around a unit axis by an angle (radians) using quaternions */
    static rotate(v, axis, angle) {
        const q = new Quaternion().fromAxisRotation(axis, angle);
        return vec3.transformQuat([], v, q);
    }
    /**
     * Rotate a camera frame by horizontal/vertical angles (radians).
     * Returns a new frame with updated position, up, longitude, latitude,
     * and bearing. If lockBearing is true, bearing is forced to 0.
     */
    static rotateFrame(frame, horizontalAngle, verticalAngle, lockBearing) {
        let position = Globe.rotate(frame.position, frame.axisHorizontal, horizontalAngle);
        position = Globe.rotate(position, frame.axisVertical, verticalAngle);
        let up = Globe.rotate(frame.up, frame.axisHorizontal, horizontalAngle);
        up = Globe.rotate(up, frame.axisVertical, verticalAngle);
        const [longitude, latitude] = Globe.toLngLat(position);
        const b = lockBearing ? 0 : Globe.bearing(up, longitude, latitude);
        return {
            ...frame, // preserve axes
            position,
            up,
            longitude,
            latitude,
            bearing: b
        };
    }
}
// Exponential decay easing — models viscous friction on a spinning sphere.
const INERTIA_DECAY = 5;
const INERTIA_NORM = 1 / (1 - Math.exp(-INERTIA_DECAY));
export const GLOBE_INERTIA_EASING = (t) => (1 - Math.exp(-INERTIA_DECAY * t)) * INERTIA_NORM;
/**
 * Inertia interpolator for the globe. Two modes:
 * - Linear (bearing locked): lerps lng/lat, preserves raw target longitude
 *   to avoid antimeridian reversal.
 * - Rotation (free bearing): rigid body spin around a fixed axis with
 *   bearing tracked via the up vector.
 */
export class GlobeInertiaInterpolator extends TransitionInterpolator {
    constructor(opts) {
        const isRotation = 'axis' in opts;
        super({
            compare: ['longitude', 'latitude'],
            extract: isRotation
                ? ['longitude', 'latitude', 'zoom', 'bearing']
                : ['longitude', 'latitude', 'zoom'],
            required: ['longitude', 'latitude']
        });
        if (isRotation) {
            this._mode = 'rotation';
            this._axis = opts.axis;
            this._totalAngle = opts.totalAngle;
        }
        else {
            this._mode = 'linear';
            this._targetLongitude = opts.targetLongitude;
        }
    }
    initializeProps(startProps, endProps) {
        const result = super.initializeProps(startProps, endProps);
        this._startZoom = startProps.zoom;
        if (this._mode === 'rotation') {
            this._startFrame = {
                ...Globe.cameraFrame(startProps.longitude, startProps.latitude, startProps.bearing || 0),
                axisHorizontal: this._axis
            };
        }
        else {
            result.end.longitude = this._targetLongitude;
        }
        return result;
    }
    interpolateProps(startProps, endProps, t) {
        if (this._mode === 'rotation') {
            const { longitude, latitude, bearing } = Globe.rotateFrame(this._startFrame, this._totalAngle * t, 0);
            const zoom = this._startZoom + zoomAdjust(latitude, true) - zoomAdjust(this._startFrame.latitude, true);
            return { bearing, longitude, latitude, zoom };
        }
        const longitude = startProps.longitude + (endProps.longitude - startProps.longitude) * t;
        const latitude = startProps.latitude + (endProps.latitude - startProps.latitude) * t;
        const zoom = this._startZoom + zoomAdjust(latitude, true) - zoomAdjust(startProps.latitude, true);
        return { longitude, latitude, zoom };
    }
}
//# sourceMappingURL=globe-utils.js.map
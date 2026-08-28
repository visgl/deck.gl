// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { clamp } from '@math.gl/core';
import Controller from "./controller.js";
import { getMaxBoundsExtents, getMaxBoundsRect } from "./utils.js";
import { MapState } from "./map-controller.js";
import { mod } from "../utils/math-utils.js";
import LinearInterpolator from "../transitions/linear-interpolator.js";
import { zoomAdjust, GLOBE_RADIUS } from "../viewports/globe-viewport.js";
import { Globe, GLOBE_INERTIA_EASING, GlobeInertiaInterpolator } from "../viewports/globe-utils.js";
import { MAX_LATITUDE } from '@math.gl/web-mercator';
const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;
function degreesToPixels(angle, zoom = 0) {
    const radians = Math.min(180, angle) * DEGREES_TO_RADIANS;
    const size = GLOBE_RADIUS * 2 * Math.sin(radians / 2);
    return size * Math.pow(2, zoom);
}
function pixelsToDegrees(pixels, zoom = 0) {
    const size = pixels / Math.pow(2, zoom);
    const radians = Math.asin(Math.min(1, size / GLOBE_RADIUS / 2)) * 2;
    return radians * RADIANS_TO_DEGREES;
}
class GlobeState extends MapState {
    constructor(options) {
        const { startPanPos, startPanCameraFrame, startPanAngularRate, startPanLockBearing, ...mapStateOptions } = options;
        mapStateOptions.normalize = false;
        super(mapStateOptions);
        const s = this._state;
        if (startPanPos !== undefined)
            s.startPanPos = startPanPos;
        if (startPanCameraFrame !== undefined)
            s.startPanCameraFrame = startPanCameraFrame;
        if (startPanAngularRate !== undefined)
            s.startPanAngularRate = startPanAngularRate;
        if (startPanLockBearing !== undefined)
            s.startPanLockBearing = startPanLockBearing;
    }
    panStart({ pos }) {
        const { latitude, longitude, zoom, bearing = 0 } = this.getViewportProps();
        const cameraFrame = Globe.cameraFrame(longitude, latitude, bearing);
        const lockBearing = Math.abs(bearing) < 1;
        if (lockBearing) {
            // Override horizontal axis to polar so north stays up.
            // Boost rate by 1/cos(lat) to compensate for smaller longitude
            // circles near the poles, capped at 4x.
            cameraFrame.axisHorizontal = [0, 0, 1];
        }
        // Radians of arc per pixel, derived from zoom scale
        const scale = Math.pow(2, zoom - zoomAdjust(latitude, true));
        const angularRate = (0.25 / scale) * DEGREES_TO_RADIANS;
        return this._getUpdatedState({
            startPanPos: pos,
            startPanCameraFrame: cameraFrame,
            startPanAngularRate: angularRate,
            startPanLockBearing: lockBearing,
            startZoom: zoom
        });
    }
    pan({ pos, startPos }) {
        const state = this.getState();
        const startPanPos = state.startPanPos || startPos;
        if (!startPanPos)
            return this;
        const frame = state.startPanCameraFrame;
        const rate = state.startPanAngularRate;
        const startZoom = state.startZoom ?? this.getViewportProps().zoom;
        if (!frame || !rate) {
            return this;
        }
        const dx = startPanPos[0] - pos[0];
        const dy = startPanPos[1] - pos[1];
        let hAngle = dx * rate;
        let vAngle = -dy * rate;
        const locked = state.startPanLockBearing;
        if (locked) {
            // Boost horizontal rate by 1/cos(lat) for the polar axis, capped at 4x
            const cosLat = Math.cos(frame.latitude * DEGREES_TO_RADIANS);
            hAngle = (dx * rate) / Math.max(cosLat, 0.25);
            // Clamp vertical angle to prevent crossing the poles
            const maxUp = (MAX_LATITUDE - frame.latitude) * DEGREES_TO_RADIANS;
            const maxDown = -(MAX_LATITUDE + frame.latitude) * DEGREES_TO_RADIANS;
            vAngle = clamp(vAngle, maxDown, maxUp);
        }
        const rotated = Globe.rotateFrame(frame, hAngle, vAngle, locked);
        const zoom = startZoom + zoomAdjust(rotated.latitude, true) - zoomAdjust(frame.latitude, true);
        return this._getUpdatedState({
            longitude: rotated.longitude,
            latitude: rotated.latitude,
            bearing: rotated.bearing,
            zoom
        });
    }
    panEnd() {
        return this._getUpdatedState({
            startPanPos: null,
            startPanCameraFrame: null,
            startPanAngularRate: null,
            startPanLockBearing: null,
            startZoom: null
        });
    }
    zoom({ scale }) {
        const startZoom = this.getState().startZoom || this.getViewportProps().zoom;
        const zoom = startZoom + Math.log2(scale);
        return this._getUpdatedState({ zoom });
    }
    _panFromCenter(offset) {
        const { width, height } = this.getViewportProps();
        const center = [width / 2, height / 2];
        return this.panStart({ pos: center })
            .pan({ pos: [center[0] + offset[0], center[1] + offset[1]] })
            .panEnd();
    }
    applyConstraints(props) {
        const { longitude, latitude, maxBounds } = props;
        props.zoom = this._constrainZoom(props.zoom, props);
        if (longitude < -180 || longitude > 180) {
            props.longitude = mod(longitude + 180, 360) - 180;
        }
        props.latitude = clamp(latitude, -90, 90);
        if (props.bearing < -180 || props.bearing > 180) {
            props.bearing = mod(props.bearing + 180, 360) - 180;
        }
        props.pitch = clamp(props.pitch, props.minPitch, props.maxPitch);
        const maxBoundsRect = maxBounds
            ? getMaxBoundsRect(props.width, props.height, props.maxBoundsPadding)
            : null;
        if (maxBounds && maxBoundsRect) {
            // A negative target dimension is inverted and therefore has no legal interval.
            if (maxBoundsRect.width >= 0) {
                props.longitude = clamp(props.longitude, maxBounds[0][0], maxBounds[1][0]);
            }
            if (maxBoundsRect.height >= 0) {
                props.latitude = clamp(props.latitude, maxBounds[0][1], maxBounds[1][1]);
            }
        }
        if (maxBounds && maxBoundsRect) {
            const viewport = this.makeViewport({ ...props, bearing: 0, pitch: 0 });
            const screenExtents = getMaxBoundsExtents(viewport, [props.longitude, props.latitude], maxBoundsRect);
            const effectiveZoom = props.zoom - zoomAdjust(latitude);
            const lngSpan = maxBounds[1][0] - maxBounds[0][0];
            const latSpan = maxBounds[1][1] - maxBounds[0][1];
            if (maxBoundsRect.height >= 0 && latSpan > 0 && latSpan < 180) {
                const heightDegrees = Math.min(pixelsToDegrees(maxBoundsRect.height, effectiveZoom), latSpan);
                const bottomDegrees = maxBoundsRect.height
                    ? (heightDegrees * screenExtents.bottom) / maxBoundsRect.height
                    : pixelsToDegrees(screenExtents.bottom, effectiveZoom);
                const topDegrees = maxBoundsRect.height
                    ? (heightDegrees * screenExtents.top) / maxBoundsRect.height
                    : pixelsToDegrees(screenExtents.top, effectiveZoom);
                props.latitude = clamp(props.latitude, maxBounds[0][1] + bottomDegrees, maxBounds[1][1] - topDegrees);
            }
            if (maxBoundsRect.width >= 0 && lngSpan > 0 && lngSpan < 360) {
                const widthDegrees = Math.min(pixelsToDegrees(maxBoundsRect.width / Math.cos(props.latitude * DEGREES_TO_RADIANS), effectiveZoom), lngSpan);
                const leftDegrees = maxBoundsRect.width
                    ? (widthDegrees * screenExtents.left) / maxBoundsRect.width
                    : pixelsToDegrees(screenExtents.left / Math.cos(props.latitude * DEGREES_TO_RADIANS), effectiveZoom);
                const rightDegrees = maxBoundsRect.width
                    ? (widthDegrees * screenExtents.right) / maxBoundsRect.width
                    : pixelsToDegrees(screenExtents.right / Math.cos(props.latitude * DEGREES_TO_RADIANS), effectiveZoom);
                props.longitude = clamp(props.longitude, maxBounds[0][0] + leftDegrees, maxBounds[1][0] - rightDegrees);
            }
        }
        if (props.latitude !== latitude) {
            props.zoom += zoomAdjust(props.latitude, true) - zoomAdjust(latitude, true);
        }
        return props;
    }
    _constrainZoom(zoom, props) {
        props || (props = this.getViewportProps());
        const { maxZoom, maxBounds } = props;
        let { minZoom } = props;
        const shouldApplyMaxBounds = maxBounds !== null && props.width > 0 && props.height > 0;
        if (shouldApplyMaxBounds) {
            const maxBoundsRect = getMaxBoundsRect(props.width, props.height, props.maxBoundsPadding);
            const minLatitude = maxBounds[0][1];
            const maxLatitude = maxBounds[1][1];
            const fitLatitude = Math.sign(minLatitude) === Math.sign(maxLatitude)
                ? Math.min(Math.abs(minLatitude), Math.abs(maxLatitude))
                : 0;
            const ZOOM0 = zoomAdjust(0);
            const w = degreesToPixels(maxBounds[1][0] - maxBounds[0][0]) *
                Math.cos(fitLatitude * DEGREES_TO_RADIANS);
            const h = degreesToPixels(maxBounds[1][1] - maxBounds[0][1]);
            if (maxBoundsRect.width > 0 && w > 0) {
                minZoom = Math.max(minZoom, Math.log2(maxBoundsRect.width / w) + ZOOM0);
            }
            if (maxBoundsRect.height > 0 && h > 0) {
                minZoom = Math.max(minZoom, Math.log2(maxBoundsRect.height / h) + ZOOM0);
            }
            if (minZoom > maxZoom)
                minZoom = maxZoom;
        }
        const zoomAdjustment = zoomAdjust(props.latitude, true) - zoomAdjust(0, true);
        return clamp(zoom, minZoom + zoomAdjustment, maxZoom + zoomAdjustment);
    }
}
export default class GlobeController extends Controller {
    constructor() {
        super(...arguments);
        this.ControllerState = GlobeState;
        this.transition = {
            transitionDuration: 300,
            transitionInterpolator: new LinearInterpolator({
                transitionProps: {
                    compare: ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'],
                    required: ['longitude', 'latitude', 'zoom']
                }
            })
        };
        this.dragMode = 'pan';
        // Ring buffer tracking globe position during pan for inertia velocity
        this._panHistory = [];
    }
    _onPanStart(event) {
        this._panHistory = [];
        return super._onPanStart(event);
    }
    _onMultiPanStart(event) {
        this._panHistory = [];
        return super._onMultiPanStart(event);
    }
    _onPanMove(event) {
        if (!this.dragPan) {
            return false;
        }
        const pos = this.getCenter(event);
        const newControllerState = this.controllerState.pan({ pos });
        this.updateViewport(newControllerState, { transitionDuration: 0 }, {
            isDragging: true,
            isPanning: true
        });
        const { longitude, latitude } = newControllerState.getViewportProps();
        this._panHistory.push({ longitude, latitude, timestamp: Date.now() });
        if (this._panHistory.length > 5) {
            this._panHistory.shift();
        }
        return true;
    }
    _onPanMoveEnd(event) {
        const { inertia } = this;
        if (this.dragPan && inertia && this._panHistory.length >= 2) {
            const first = this._panHistory[0];
            const last = this._panHistory[this._panHistory.length - 1];
            const dt = last.timestamp - first.timestamp;
            if (dt > 0) {
                const viewportProps = this.controllerState.getViewportProps();
                const state = this.controllerState.getState();
                // Compute velocity from the actual positions the globe was at
                const angularDistance = Globe.angularDistance(first, last);
                const angularVelocity = angularDistance / dt;
                if (angularVelocity > 1e-6) {
                    const totalAngle = (angularVelocity * inertia) / 2;
                    let interpolator;
                    let endLng;
                    let endLat;
                    if (state.startPanLockBearing) {
                        // Decompose into lng/lat velocity and extrapolate linearly
                        let dLng = last.longitude - first.longitude;
                        if (dLng > 180)
                            dLng -= 360;
                        else if (dLng < -180)
                            dLng += 360;
                        const dLat = last.latitude - first.latitude;
                        const vLng = dLng / dt;
                        const vLat = dLat / dt;
                        endLng = viewportProps.longitude + (vLng * inertia) / 2;
                        endLat = clamp(viewportProps.latitude + (vLat * inertia) / 2, -90, 90);
                        interpolator = new GlobeInertiaInterpolator({ targetLongitude: endLng });
                    }
                    else {
                        // Free bearing — use single-axis rotation to maintain
                        // constant spin direction with up vector tracking.
                        const axis = Globe.greatCircleAxis(first, last);
                        const currentFrame = Globe.cameraFrame(viewportProps.longitude, viewportProps.latitude, viewportProps.bearing || 0);
                        const endFrame = Globe.rotateFrame({ ...currentFrame, axisHorizontal: axis }, totalAngle, 0);
                        endLng = endFrame.longitude;
                        endLat = clamp(endFrame.latitude, -90, 90);
                        interpolator = new GlobeInertiaInterpolator({ axis, totalAngle });
                    }
                    const newControllerState = this.controllerState.panEnd();
                    this.updateViewport(newControllerState, {
                        transitionInterpolator: interpolator,
                        transitionDuration: inertia,
                        transitionEasing: GLOBE_INERTIA_EASING,
                        longitude: endLng,
                        latitude: endLat
                    }, {
                        isDragging: false,
                        isPanning: true
                    });
                    this._panHistory = [];
                    return true;
                }
            }
        }
        this._panHistory = [];
        const newControllerState = this.controllerState.panEnd();
        this.updateViewport(newControllerState, null, {
            isDragging: false,
            isPanning: false
        });
        return true;
    }
}
//# sourceMappingURL=globe-controller.js.map
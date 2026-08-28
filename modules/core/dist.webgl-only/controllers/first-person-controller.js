// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import Controller from "./controller.js";
import ViewState from "./view-state.js";
import { getMaxBoundsRect } from "./utils.js";
import { mod } from "../utils/math-utils.js";
import LinearInterpolator from "../transitions/linear-interpolator.js";
import { Vector3, _SphericalCoordinates as SphericalCoordinates, clamp } from '@math.gl/core';
const MOVEMENT_SPEED = 20;
const PAN_SPEED = 500;
class FirstPersonState extends ViewState {
    constructor(options) {
        const { 
        /* Viewport arguments */
        width, // Width of viewport
        height, // Height of viewport
        // Position and orientation
        position = [0, 0, 0], // typically in meters from anchor point
        bearing = 0, // Rotation around y axis
        pitch = 0, // Rotation around x axis
        // Geospatial anchor
        longitude = null, latitude = null, maxPitch = 90, minPitch = -90, maxBounds = null, maxBoundsPadding = null, 
        // Model state when the rotate operation first started
        startRotatePos, startBearing, startPitch, startZoomPosition, startPanPos, startPanPosition } = options;
        super({
            width,
            height,
            position,
            bearing,
            pitch,
            longitude,
            latitude,
            maxPitch,
            minPitch,
            maxBounds,
            maxBoundsPadding
        }, {
            startRotatePos,
            startBearing,
            startPitch,
            startZoomPosition,
            startPanPos,
            startPanPosition
        }, options.makeViewport);
    }
    /* Public API */
    /**
     * Start panning
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */
    panStart({ pos }) {
        const { position } = this.getViewportProps();
        return this._getUpdatedState({
            startPanPos: pos,
            startPanPosition: position
        });
    }
    /**
     * Pan
     * @param {[Number, Number]} pos - position on screen where the pointer is
     */
    pan({ pos }) {
        if (!pos) {
            return this;
        }
        const { startPanPos = [0, 0], startPanPosition = [0, 0] } = this.getState();
        const { width, height, bearing, pitch } = this.getViewportProps();
        const deltaScaleX = (PAN_SPEED * (pos[0] - startPanPos[0])) / width;
        const deltaScaleY = (PAN_SPEED * (pos[1] - startPanPos[1])) / height;
        const up = new SphericalCoordinates({ bearing, pitch });
        const forward = new SphericalCoordinates({ bearing, pitch: -90 });
        const yDirection = up.toVector3().normalize();
        const xDirection = forward.toVector3().cross(yDirection).normalize();
        return this._getUpdatedState({
            position: new Vector3(startPanPosition)
                .add(xDirection.scale(deltaScaleX))
                .add(yDirection.scale(deltaScaleY))
        });
    }
    /**
     * End panning
     * Must call if `panStart()` was called
     */
    panEnd() {
        return this._getUpdatedState({
            startPanPos: null,
            startPanPosition: null
        });
    }
    /**
     * Start rotating
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */
    rotateStart({ pos }) {
        return this._getUpdatedState({
            startRotatePos: pos,
            startBearing: this.getViewportProps().bearing,
            startPitch: this.getViewportProps().pitch
        });
    }
    /**
     * Rotate
     * @param {[Number, Number]} pos - position on screen where the pointer is
     */
    rotate({ pos, deltaAngleX = 0, deltaAngleY = 0 }) {
        const { startRotatePos, startBearing, startPitch } = this.getState();
        const { width, height } = this.getViewportProps();
        if (!startRotatePos || startBearing === undefined || startPitch === undefined) {
            return this;
        }
        let newRotation;
        if (pos) {
            const deltaScaleX = (pos[0] - startRotatePos[0]) / width;
            const deltaScaleY = (pos[1] - startRotatePos[1]) / height;
            newRotation = {
                bearing: startBearing - deltaScaleX * 180,
                pitch: startPitch - deltaScaleY * 90
            };
        }
        else {
            newRotation = {
                bearing: startBearing - deltaAngleX,
                pitch: startPitch - deltaAngleY
            };
        }
        return this._getUpdatedState(newRotation);
    }
    /**
     * End rotating
     * Must call if `rotateStart()` was called
     */
    rotateEnd() {
        return this._getUpdatedState({
            startRotatePos: null,
            startBearing: null,
            startPitch: null
        });
    }
    /**
     * Start zooming
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */
    zoomStart() {
        return this._getUpdatedState({
            startZoomPosition: this.getViewportProps().position
        });
    }
    /**
     * Zoom
     * @param {[Number, Number]} pos - position on screen where the current center is
     * @param {[Number, Number]} startPos - the center position at
     *   the start of the operation. Must be supplied of `zoomStart()` was not called
     * @param {Number} scale - a number between [0, 1] specifying the accumulated
     *   relative scale.
     */
    zoom({ pos, scale }) {
        const viewportProps = this.getViewportProps();
        const startZoomPosition = this.getState().startZoomPosition || viewportProps.position;
        const viewport = this.makeViewport(viewportProps);
        const { projectionMatrix, width } = viewport;
        const fovxRadians = 2.0 * Math.atan(1.0 / projectionMatrix[0]);
        const angle = fovxRadians * (pos[0] / width - 0.5);
        const direction = this.getDirection(true);
        return this._move(direction.rotateZ({ radians: -angle }), Math.log2(scale) * MOVEMENT_SPEED, startZoomPosition);
    }
    /**
     * End zooming
     * Must call if `zoomStart()` was called
     */
    zoomEnd() {
        return this._getUpdatedState({
            startZoomPosition: null
        });
    }
    moveLeft(speed = MOVEMENT_SPEED) {
        const direction = this.getDirection(true);
        return this._move(direction.rotateZ({ radians: Math.PI / 2 }), speed);
    }
    moveRight(speed = MOVEMENT_SPEED) {
        const direction = this.getDirection(true);
        return this._move(direction.rotateZ({ radians: -Math.PI / 2 }), speed);
    }
    // forward
    moveUp(speed = MOVEMENT_SPEED) {
        const direction = this.getDirection(true);
        return this._move(direction, speed);
    }
    // backward
    moveDown(speed = MOVEMENT_SPEED) {
        const direction = this.getDirection(true);
        return this._move(direction.negate(), speed);
    }
    rotateLeft(speed = 15) {
        return this._getUpdatedState({
            bearing: this.getViewportProps().bearing - speed
        });
    }
    rotateRight(speed = 15) {
        return this._getUpdatedState({
            bearing: this.getViewportProps().bearing + speed
        });
    }
    rotateUp(speed = 10) {
        return this._getUpdatedState({
            pitch: this.getViewportProps().pitch + speed
        });
    }
    rotateDown(speed = 10) {
        return this._getUpdatedState({
            pitch: this.getViewportProps().pitch - speed
        });
    }
    zoomIn(speed = MOVEMENT_SPEED) {
        return this._move(new Vector3(0, 0, 1), speed);
    }
    zoomOut(speed = MOVEMENT_SPEED) {
        return this._move(new Vector3(0, 0, -1), speed);
    }
    // shortest path between two view states
    shortestPathFrom(viewState) {
        const fromProps = viewState.getViewportProps();
        const props = { ...this.getViewportProps() };
        const { bearing, longitude } = props;
        if (Math.abs(bearing - fromProps.bearing) > 180) {
            props.bearing = bearing < 0 ? bearing + 360 : bearing - 360;
        }
        if (longitude !== null &&
            fromProps.longitude !== null &&
            Math.abs(longitude - fromProps.longitude) > 180) {
            props.longitude = longitude < 0 ? longitude + 360 : longitude - 360;
        }
        return props;
    }
    /* Private methods */
    _move(direction, speed, fromPosition = this.getViewportProps().position) {
        const delta = direction.scale(speed);
        return this._getUpdatedState({
            position: new Vector3(fromPosition).add(delta)
        });
    }
    getDirection(use2D = false) {
        const spherical = new SphericalCoordinates({
            bearing: this.getViewportProps().bearing,
            pitch: use2D ? 90 : 90 + this.getViewportProps().pitch
        });
        const direction = spherical.toVector3().normalize();
        return direction;
    }
    _getUpdatedState(newProps) {
        // Update _viewportProps
        return new FirstPersonState({
            makeViewport: this.makeViewport,
            ...this.getViewportProps(),
            ...this.getState(),
            ...newProps
        });
    }
    // Apply any constraints (mathematical or defined by _viewportProps) to map state
    applyConstraints(props) {
        // Ensure pitch and zoom are within specified range
        const { pitch, maxPitch, minPitch, longitude, position, bearing, maxBounds } = props;
        props.pitch = clamp(pitch, minPitch, maxPitch);
        // Normalize degrees
        if (longitude !== null && (longitude < -180 || longitude > 180)) {
            props.longitude = mod(longitude + 180, 360) - 180;
        }
        if (bearing < -180 || bearing > 180) {
            props.bearing = mod(bearing + 180, 360) - 180;
        }
        if (maxBounds) {
            const maxBoundsRect = getMaxBoundsRect(props.width, props.height, props.maxBoundsPadding);
            if (maxBoundsRect.width >= 0 && maxBoundsRect.height >= 0) {
                const x = clamp(position[0], maxBounds[0][0], maxBounds[1][0]);
                const y = clamp(position[1], maxBounds[0][1], maxBounds[1][1]);
                const z = clamp(position[2] ?? 0, maxBounds[0][2] ?? 0, maxBounds[1][2] ?? 0);
                if (x !== position[0] || y !== position[1] || z !== position[2]) {
                    props.position = [x, y, z];
                }
            }
        }
        return props;
    }
}
export default class FirstPersonController extends Controller {
    constructor() {
        super(...arguments);
        this.ControllerState = FirstPersonState;
        this.transition = {
            transitionDuration: 300,
            transitionInterpolator: new LinearInterpolator(['position', 'pitch', 'bearing'])
        };
    }
}
//# sourceMappingURL=first-person-controller.js.map
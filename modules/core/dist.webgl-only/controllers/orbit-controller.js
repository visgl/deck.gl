// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { clamp } from '@math.gl/core';
import Controller from "./controller.js";
import ViewState from "./view-state.js";
import { getMaxBoundsExtents, getMaxBoundsRect } from "./utils.js";
import { mod } from "../utils/math-utils.js";
import LinearInterpolator from "../transitions/linear-interpolator.js";
export class OrbitState extends ViewState {
    constructor(options) {
        const { 
        /* Viewport arguments */
        width, // Width of viewport
        height, // Height of viewport
        rotationX = 0, // Rotation around x axis
        rotationOrbit = 0, // Rotation around orbit axis
        target = [0, 0, 0], zoom = 0, 
        /* Viewport constraints */
        minRotationX = -90, maxRotationX = 90, minZoom = -Infinity, maxZoom = Infinity, maxBounds = null, maxBoundsPadding = null, 
        /** Interaction states, required to calculate change during transform */
        // Model state when the pan operation first started
        startPanPosition, 
        // Model state when the rotate operation first started
        startRotatePos, startRotationX, startRotationOrbit, 
        // Model state when the zoom operation first started
        startZoomPosition, startZoom } = options;
        super({
            width,
            height,
            rotationX,
            rotationOrbit,
            target,
            zoom,
            minRotationX,
            maxRotationX,
            minZoom,
            maxZoom,
            maxBounds,
            maxBoundsPadding
        }, {
            startPanPosition,
            startRotatePos,
            startRotationX,
            startRotationOrbit,
            startZoomPosition,
            startZoom
        }, options.makeViewport);
        this.unproject3D = options.unproject3D;
    }
    /**
     * Start panning
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */
    panStart({ pos }) {
        return this._getUpdatedState({
            startPanPosition: this._unproject(pos)
        });
    }
    /**
     * Pan
     * @param {[Number, Number]} pos - position on screen where the pointer is
     */
    pan({ pos, startPosition }) {
        const startPanPosition = this.getState().startPanPosition || startPosition;
        if (!startPanPosition) {
            return this;
        }
        const viewport = this.makeViewport(this.getViewportProps());
        const newProps = viewport.panByPosition(startPanPosition, pos);
        return this._getUpdatedState(newProps);
    }
    /**
     * End panning
     * Must call if `panStart()` was called
     */
    panEnd() {
        return this._getUpdatedState({
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
            startRotationX: this.getViewportProps().rotationX,
            startRotationOrbit: this.getViewportProps().rotationOrbit
        });
    }
    /**
     * Rotate
     * @param {[Number, Number]} pos - position on screen where the pointer is
     */
    rotate({ pos, deltaAngleX = 0, deltaAngleY = 0 }) {
        const { startRotatePos, startRotationX, startRotationOrbit } = this.getState();
        const { width, height } = this.getViewportProps();
        if (!startRotatePos || startRotationX === undefined || startRotationOrbit === undefined) {
            return this;
        }
        let newRotation;
        if (pos) {
            let deltaScaleX = (pos[0] - startRotatePos[0]) / width;
            const deltaScaleY = (pos[1] - startRotatePos[1]) / height;
            if (startRotationX < -90 || startRotationX > 90) {
                // When looking at the "back" side of the scene, invert horizontal drag
                // so that the camera movement follows user input
                deltaScaleX *= -1;
            }
            newRotation = {
                rotationX: startRotationX + deltaScaleY * 180,
                rotationOrbit: startRotationOrbit + deltaScaleX * 180
            };
        }
        else {
            newRotation = {
                rotationX: startRotationX + deltaAngleY,
                rotationOrbit: startRotationOrbit + deltaAngleX
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
            startRotationX: null,
            startRotationOrbit: null
        });
    }
    // shortest path between two view states
    shortestPathFrom(viewState) {
        const fromProps = viewState.getViewportProps();
        const props = { ...this.getViewportProps() };
        const { rotationOrbit } = props;
        if (Math.abs(rotationOrbit - fromProps.rotationOrbit) > 180) {
            props.rotationOrbit = rotationOrbit < 0 ? rotationOrbit + 360 : rotationOrbit - 360;
        }
        return props;
    }
    /**
     * Start zooming
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */
    zoomStart({ pos }) {
        return this._getUpdatedState({
            startZoomPosition: this._unproject(pos),
            startZoom: this.getViewportProps().zoom
        });
    }
    /**
     * Zoom
     * @param {[Number, Number]} pos - position on screen where the current target is
     * @param {[Number, Number]} startPos - the target position at
     *   the start of the operation. Must be supplied of `zoomStart()` was not called
     * @param {Number} scale - a number between [0, 1] specifying the accumulated
     *   relative scale.
     */
    zoom({ pos, startPos, scale }) {
        let { startZoom, startZoomPosition } = this.getState();
        if (!startZoomPosition) {
            // We have two modes of zoom:
            // scroll zoom that are discrete events (transform from the current zoom level),
            // and pinch zoom that are continuous events (transform from the zoom level when
            // pinch started).
            // If startZoom state is defined, then use the startZoom state;
            // otherwise assume discrete zooming
            startZoom = this.getViewportProps().zoom;
            startZoomPosition = this._unproject(startPos || pos);
        }
        if (!startZoomPosition) {
            return this;
        }
        const newZoom = this._calculateNewZoom({ scale, startZoom });
        const zoomedViewport = this.makeViewport({ ...this.getViewportProps(), zoom: newZoom });
        return this._getUpdatedState({
            zoom: newZoom,
            ...zoomedViewport.panByPosition(startZoomPosition, pos)
        });
    }
    /**
     * End zooming
     * Must call if `zoomStart()` was called
     */
    zoomEnd() {
        return this._getUpdatedState({
            startZoomPosition: null,
            startZoom: null
        });
    }
    zoomIn(speed = 2) {
        return this._getUpdatedState({
            zoom: this._calculateNewZoom({ scale: speed })
        });
    }
    zoomOut(speed = 2) {
        return this._getUpdatedState({
            zoom: this._calculateNewZoom({ scale: 1 / speed })
        });
    }
    moveLeft(speed = 50) {
        return this._panFromCenter([-speed, 0]);
    }
    moveRight(speed = 50) {
        return this._panFromCenter([speed, 0]);
    }
    moveUp(speed = 50) {
        return this._panFromCenter([0, -speed]);
    }
    moveDown(speed = 50) {
        return this._panFromCenter([0, speed]);
    }
    rotateLeft(speed = 15) {
        return this._getUpdatedState({
            rotationOrbit: this.getViewportProps().rotationOrbit - speed
        });
    }
    rotateRight(speed = 15) {
        return this._getUpdatedState({
            rotationOrbit: this.getViewportProps().rotationOrbit + speed
        });
    }
    rotateUp(speed = 10) {
        return this._getUpdatedState({
            rotationX: this.getViewportProps().rotationX - speed
        });
    }
    rotateDown(speed = 10) {
        return this._getUpdatedState({
            rotationX: this.getViewportProps().rotationX + speed
        });
    }
    /* Private methods */
    _project(pos) {
        const viewport = this.makeViewport(this.getViewportProps());
        return viewport.project(pos);
    }
    _unproject(pos) {
        const p = this.unproject3D?.(pos);
        if (p)
            return p;
        const viewport = this.makeViewport(this.getViewportProps());
        return viewport.unproject(pos);
    }
    // Calculates new zoom
    _calculateNewZoom({ scale, startZoom }) {
        if (startZoom === undefined) {
            startZoom = this.getViewportProps().zoom;
        }
        const zoom = startZoom + Math.log2(scale);
        return this._constrainZoom(zoom);
    }
    _panFromCenter(offset) {
        const { target } = this.getViewportProps();
        const center = this._project(target);
        return this.pan({
            startPosition: target,
            pos: [center[0] + offset[0], center[1] + offset[1]]
        });
    }
    _getUpdatedState(newProps) {
        // @ts-ignore
        return new this.constructor({
            makeViewport: this.makeViewport,
            ...this.getViewportProps(),
            ...this.getState(),
            ...newProps
        });
    }
    // Apply any constraints (mathematical or defined by _viewportProps) to map state
    applyConstraints(props) {
        // Ensure zoom is within specified range
        const { maxRotationX, minRotationX, rotationOrbit } = props;
        props.zoom = this._constrainZoom(props.zoom, props);
        props.rotationX = clamp(props.rotationX, minRotationX, maxRotationX);
        if (rotationOrbit < -180 || rotationOrbit > 180) {
            props.rotationOrbit = mod(rotationOrbit + 180, 360) - 180;
        }
        props.target = this._constrainTarget(props);
        return props;
    }
    _constrainZoom(zoom, props) {
        props || (props = this.getViewportProps());
        const { maxZoom, maxBounds } = props;
        let { minZoom } = props;
        if (maxBounds && props.width > 0 && props.height > 0) {
            const maxBoundsRect = getMaxBoundsRect(props.width, props.height, props.maxBoundsPadding);
            const availableSides = [];
            if (maxBoundsRect.width > 0 || maxBoundsRect.height > 0) {
                const viewport = this.makeViewport({ ...props, zoom });
                const screenExtents = getMaxBoundsExtents(viewport, props.target, maxBoundsRect);
                if (maxBoundsRect.width > 0) {
                    availableSides.push(screenExtents.left, screenExtents.right);
                }
                if (maxBoundsRect.height > 0) {
                    availableSides.push(screenExtents.top, screenExtents.bottom);
                }
                // Orbit bounds are represented by a sphere around target, so fitting needs
                // equal room on every side that has a positive target dimension.
                const availableDiameter = Math.min(...availableSides) * 2;
                const dx = maxBounds[1][0] - maxBounds[0][0];
                const dy = maxBounds[1][1] - maxBounds[0][1];
                const dz = (maxBounds[1][2] ?? 0) - (maxBounds[0][2] ?? 0);
                const maxDiameter = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (availableDiameter > 0 && maxDiameter > 0) {
                    minZoom = Math.max(minZoom, Math.log2(availableDiameter / maxDiameter));
                    if (minZoom > maxZoom)
                        minZoom = maxZoom;
                }
            }
        }
        return clamp(zoom, minZoom, maxZoom);
    }
    _constrainTarget(props) {
        const { target, maxBounds } = props;
        if (!maxBounds)
            return target;
        const maxBoundsRect = getMaxBoundsRect(props.width, props.height, props.maxBoundsPadding);
        if (maxBoundsRect.width < 0 || maxBoundsRect.height < 0)
            return target;
        const [[minX, minY, minZ = 0], [maxX, maxY, maxZ = 0]] = maxBounds;
        if (target[0] >= minX &&
            target[0] <= maxX &&
            target[1] >= minY &&
            target[1] <= maxY &&
            target[2] >= minZ &&
            target[2] <= maxZ) {
            return target;
        }
        const vp = this.makeViewport?.(props);
        if (vp) {
            // Given the bounding box and the target plane (defined by target position and distance to near plane)
            // Move target to the closest point on the plane that is also inside the bounding box
            const { cameraPosition } = vp;
            const nx = cameraPosition[0] - target[0];
            const ny = cameraPosition[1] - target[1];
            const nz = cameraPosition[2] - target[2];
            const c = nx * target[0] + ny * target[1] + nz * target[2];
            const minDot = nx * (nx >= 0 ? minX : maxX) + ny * (ny >= 0 ? minY : maxY) + nz * (nz >= 0 ? minZ : maxZ);
            const maxDot = nx * (nx >= 0 ? maxX : minX) + ny * (ny >= 0 ? maxY : minY) + nz * (nz >= 0 ? maxZ : minZ);
            if ((nx || ny || nz) && c >= minDot && c <= maxDot) {
                // Target plane intersects the bounding box
                const clampX = (value) => clamp(value, minX, maxX);
                const clampY = (value) => clamp(value, minY, maxY);
                const clampZ = (value) => clamp(value, minZ, maxZ);
                const f = (lambda) => nx * clampX(target[0] - lambda * nx) +
                    ny * clampY(target[1] - lambda * ny) +
                    nz * clampZ(target[2] - lambda * nz) -
                    c;
                let lo = -1;
                let hi = 1;
                let flo = f(lo);
                let fhi = f(hi);
                while (flo < 0) {
                    hi = lo;
                    fhi = flo;
                    lo *= 2;
                    flo = f(lo);
                }
                while (fhi > 0) {
                    lo = hi;
                    flo = fhi;
                    hi *= 2;
                    fhi = f(hi);
                }
                for (let i = 0; i < 30; i++) {
                    const mid = (lo + hi) / 2;
                    const fm = f(mid);
                    if (fm > 0) {
                        lo = mid;
                    }
                    else {
                        hi = mid;
                    }
                }
                const lambda = (lo + hi) / 2;
                return [
                    clampX(target[0] - lambda * nx),
                    clampY(target[1] - lambda * ny),
                    clampZ(target[2] - lambda * nz)
                ];
            }
        }
        // Fallback if the camera vector degenerates or the plane misses the box.
        return [
            clamp(target[0], minX, maxX),
            clamp(target[1], minY, maxY),
            clamp(target[2], minZ, maxZ)
        ];
    }
}
export default class OrbitController extends Controller {
    constructor() {
        super(...arguments);
        this.ControllerState = OrbitState;
        this.transition = {
            transitionDuration: 300,
            transitionInterpolator: new LinearInterpolator({
                transitionProps: {
                    compare: ['target', 'zoom', 'rotationX', 'rotationOrbit'],
                    required: ['target', 'zoom']
                }
            })
        };
        this._unproject3D = (pos) => {
            if (this.pickPosition) {
                const { x, y } = this.props;
                const pickResult = this.pickPosition(x + pos[0], y + pos[1]);
                if (pickResult && pickResult.coordinate) {
                    return pickResult.coordinate;
                }
            }
            return null;
        };
    }
    setProps(props) {
        // this will be passed to OrbitState constructor
        props.unproject3D = this._unproject3D;
        super.setProps(props);
    }
}
//# sourceMappingURL=orbit-controller.js.map
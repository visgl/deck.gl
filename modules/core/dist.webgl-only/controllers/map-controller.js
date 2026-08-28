// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { clamp } from '@math.gl/core';
import Controller from "./controller.js";
import ViewState from "./view-state.js";
import { getMaxBoundsExtents, getMaxBoundsRect } from "./utils.js";
import { worldToLngLat, lngLatToWorld as _lngLatToWorld } from '@math.gl/web-mercator';
import assert from "../utils/assert.js";
import { mod } from "../utils/math-utils.js";
import LinearInterpolator from "../transitions/linear-interpolator.js";
const PITCH_MOUSE_THRESHOLD = 5;
const PITCH_ACCEL = 1.2;
const WEB_MERCATOR_TILE_SIZE = 512;
const WEB_MERCATOR_MAX_BOUNDS = [
    [-Infinity, -90],
    [Infinity, 90]
];
/** The web mercator utility `lngLatToWorld` throws if invalid coordinates are provided.
 * This wrapper clamps user input to calculate common positions safely. */
function lngLatToWorld([lng, lat]) {
    if (Math.abs(lat) > 90) {
        lat = Math.sign(lat) * 90;
    }
    if (Number.isFinite(lng)) {
        const [x, y] = _lngLatToWorld([lng, lat]);
        return [x, clamp(y, 0, WEB_MERCATOR_TILE_SIZE)];
    }
    const [, y] = _lngLatToWorld([0, lat]);
    return [lng, clamp(y, 0, WEB_MERCATOR_TILE_SIZE)];
}
/* Utils */
export class MapState extends ViewState {
    constructor(options) {
        const { 
        /** Mapbox viewport properties */
        /** The width of the viewport */
        width, 
        /** The height of the viewport */
        height, 
        /** The latitude at the center of the viewport */
        latitude, 
        /** The longitude at the center of the viewport */
        longitude, 
        /** The tile zoom level of the map. */
        zoom, 
        /** The bearing of the viewport in degrees */
        bearing = 0, 
        /** The pitch of the viewport in degrees */
        pitch = 0, 
        /**
         * Specify the altitude of the viewport camera
         * Unit: map heights, default 1.5
         * Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
         */
        altitude = 1.5, 
        /** Viewport position */
        position = [0, 0, 0], 
        /** Viewport constraints */
        maxZoom = 20, minZoom = 0, maxPitch = 60, minPitch = 0, 
        /** Interaction states, required to calculate change during transform */
        /* The point on map being grabbed when the operation first started */
        startPanLngLat, 
        /* Center of the zoom when the operation first started */
        startZoomLngLat, 
        /* Pointer position when rotation started */
        startRotatePos, 
        /* The lng/lat point at the rotation pivot (where rotation started) */
        startRotateLngLat, 
        /** Bearing when current perspective rotate operation started */
        startBearing, 
        /** Pitch when current perspective rotate operation started */
        startPitch, 
        /** Zoom when current zoom operation started */
        startZoom, 
        /** Normalize viewport props to fit map height into viewport */
        normalize = true } = options;
        assert(Number.isFinite(longitude)); // `longitude` must be supplied
        assert(Number.isFinite(latitude)); // `latitude` must be supplied
        assert(Number.isFinite(zoom)); // `zoom` must be supplied
        const maxBounds = options.maxBounds || (normalize ? WEB_MERCATOR_MAX_BOUNDS : null);
        const maxBoundsPadding = options.maxBoundsPadding || null;
        super({
            width,
            height,
            latitude,
            longitude,
            zoom,
            bearing,
            pitch,
            altitude,
            maxZoom,
            minZoom,
            maxPitch,
            minPitch,
            normalize,
            position,
            maxBounds,
            maxBoundsPadding
        }, {
            startPanLngLat,
            startZoomLngLat,
            startRotatePos,
            startRotateLngLat,
            startBearing,
            startPitch,
            startZoom
        }, options.makeViewport);
        this.getAltitude = options.getAltitude;
    }
    /**
     * Start panning
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */
    panStart({ pos }) {
        return this._getUpdatedState({
            startPanLngLat: this._unproject(pos)
        });
    }
    /**
     * Pan
     * @param {[Number, Number]} pos - position on screen where the pointer is
     * @param {[Number, Number], optional} startPos - where the pointer grabbed at
     *   the start of the operation. Must be supplied of `panStart()` was not called
     */
    pan({ pos, startPos }) {
        const startPanLngLat = this.getState().startPanLngLat || this._unproject(startPos);
        if (!startPanLngLat) {
            return this;
        }
        const viewport = this.makeViewport(this.getViewportProps());
        const newProps = viewport.panByPosition(startPanLngLat, pos);
        return this._getUpdatedState(newProps);
    }
    /**
     * End panning
     * Must call if `panStart()` was called
     */
    panEnd() {
        return this._getUpdatedState({
            startPanLngLat: null
        });
    }
    /**
     * Start rotating
     * @param {[Number, Number]} pos - position on screen where the center is
     */
    rotateStart({ pos }) {
        const altitude = this.getAltitude?.(pos);
        return this._getUpdatedState({
            startRotatePos: pos,
            startRotateLngLat: altitude !== undefined ? this._unproject3D(pos, altitude) : undefined,
            startBearing: this.getViewportProps().bearing,
            startPitch: this.getViewportProps().pitch
        });
    }
    /**
     * Rotate
     * @param {[Number, Number]} pos - position on screen where the center is
     */
    rotate({ pos, deltaAngleX = 0, deltaAngleY = 0 }) {
        const { startRotatePos, startRotateLngLat, startBearing, startPitch } = this.getState();
        if (!startRotatePos || startBearing === undefined || startPitch === undefined) {
            return this;
        }
        let newRotation;
        if (pos) {
            newRotation = this._getNewRotation(pos, startRotatePos, startPitch, startBearing);
        }
        else {
            newRotation = {
                bearing: startBearing + deltaAngleX,
                pitch: startPitch + deltaAngleY
            };
        }
        // If we have a pivot point, adjust the camera position to keep the pivot point fixed
        if (startRotateLngLat) {
            const rotatedViewport = this.makeViewport({
                ...this.getViewportProps(),
                ...newRotation
            });
            // Use panByPosition3D if available (WebMercatorViewport), otherwise fall back to panByPosition
            const panMethod = 'panByPosition3D' in rotatedViewport ? 'panByPosition3D' : 'panByPosition';
            return this._getUpdatedState({
                ...newRotation,
                ...rotatedViewport[panMethod](startRotateLngLat, startRotatePos)
            });
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
            startRotateLngLat: null,
            startBearing: null,
            startPitch: null
        });
    }
    /**
     * Start zooming
     * @param {[Number, Number]} pos - position on screen where the center is
     */
    zoomStart({ pos }) {
        return this._getUpdatedState({
            startZoomLngLat: this._unproject(pos),
            startZoom: this.getViewportProps().zoom
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
    zoom({ pos, startPos, scale }) {
        // Make sure we zoom around the current mouse position rather than map center
        let { startZoom, startZoomLngLat } = this.getState();
        if (!startZoomLngLat) {
            // We have two modes of zoom:
            // scroll zoom that are discrete events (transform from the current zoom level),
            // and pinch zoom that are continuous events (transform from the zoom level when
            // pinch started).
            // If startZoom state is defined, then use the startZoom state;
            // otherwise assume discrete zooming
            startZoom = this.getViewportProps().zoom;
            startZoomLngLat = this._unproject(startPos) || this._unproject(pos);
        }
        if (!startZoomLngLat) {
            return this;
        }
        const zoom = this._constrainZoom(startZoom + Math.log2(scale));
        const zoomedViewport = this.makeViewport({ ...this.getViewportProps(), zoom });
        return this._getUpdatedState({
            zoom,
            ...zoomedViewport.panByPosition(startZoomLngLat, pos)
        });
    }
    /**
     * End zooming
     * Must call if `zoomStart()` was called
     */
    zoomEnd() {
        return this._getUpdatedState({
            startZoomLngLat: null,
            startZoom: null
        });
    }
    zoomIn(speed = 2) {
        return this._zoomFromCenter(speed);
    }
    zoomOut(speed = 2) {
        return this._zoomFromCenter(1 / speed);
    }
    moveLeft(speed = 100) {
        return this._panFromCenter([speed, 0]);
    }
    moveRight(speed = 100) {
        return this._panFromCenter([-speed, 0]);
    }
    moveUp(speed = 100) {
        return this._panFromCenter([0, speed]);
    }
    moveDown(speed = 100) {
        return this._panFromCenter([0, -speed]);
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
    shortestPathFrom(viewState) {
        // const endViewStateProps = new this.ControllerState(endProps).shortestPathFrom(startViewstate);
        const fromProps = viewState.getViewportProps();
        const props = { ...this.getViewportProps() };
        const { bearing, longitude } = props;
        if (Math.abs(bearing - fromProps.bearing) > 180) {
            props.bearing = bearing < 0 ? bearing + 360 : bearing - 360;
        }
        if (Math.abs(longitude - fromProps.longitude) > 180) {
            props.longitude = longitude < 0 ? longitude + 360 : longitude - 360;
        }
        return props;
    }
    // Apply any constraints (mathematical or defined by _viewportProps) to map state
    applyConstraints(props) {
        // Ensure pitch is within specified range
        const { maxPitch, minPitch, pitch, longitude, bearing, normalize, maxBounds } = props;
        if (normalize) {
            if (longitude < -180 || longitude > 180) {
                props.longitude = mod(longitude + 180, 360) - 180;
            }
            if (bearing < -180 || bearing > 180) {
                props.bearing = mod(bearing + 180, 360) - 180;
            }
        }
        props.pitch = clamp(pitch, minPitch, maxPitch);
        props.zoom = this._constrainZoom(props.zoom, props);
        if (maxBounds) {
            const maxBoundsRect = getMaxBoundsRect(props.width, props.height, props.maxBoundsPadding);
            // Resolve the semantic center through the viewport because view padding can
            // place it away from the canvas' geometric center.
            const viewport = this.makeViewport({ ...props, bearing: 0, pitch: 0 });
            const screenExtents = getMaxBoundsExtents(viewport, [props.longitude, props.latitude], maxBoundsRect);
            const bl = lngLatToWorld(maxBounds[0]);
            const tr = lngLatToWorld(maxBounds[1]);
            // calculate center and zoom ranges at pitch=0 and bearing=0
            // to maintain visual stability when rotating
            const scale = 2 ** props.zoom;
            const [minLng, minLat] = worldToLngLat([
                bl[0] + screenExtents.left / scale,
                bl[1] + screenExtents.bottom / scale
            ]);
            const [maxLng, maxLat] = worldToLngLat([
                tr[0] - screenExtents.right / scale,
                tr[1] - screenExtents.top / scale
            ]);
            // A negative target dimension is inverted and therefore has no legal interval.
            if (maxBoundsRect.width >= 0) {
                props.longitude = clamp(props.longitude, minLng, maxLng);
            }
            if (maxBoundsRect.height >= 0) {
                props.latitude = clamp(props.latitude, minLat, maxLat);
            }
        }
        return props;
    }
    /* Private methods */
    _constrainZoom(zoom, props) {
        props || (props = this.getViewportProps());
        const { maxZoom, maxBounds } = props;
        const shouldApplyMaxBounds = maxBounds !== null && props.width > 0 && props.height > 0;
        let { minZoom } = props;
        if (shouldApplyMaxBounds) {
            const maxBoundsRect = getMaxBoundsRect(props.width, props.height, props.maxBoundsPadding);
            const bl = lngLatToWorld(maxBounds[0]);
            const tr = lngLatToWorld(maxBounds[1]);
            const w = tr[0] - bl[0];
            const h = tr[1] - bl[1];
            // ignore bound size of 0 or Infinity
            if (maxBoundsRect.width > 0 && Number.isFinite(w) && w > 0) {
                minZoom = Math.max(minZoom, Math.log2(maxBoundsRect.width / w));
            }
            if (maxBoundsRect.height > 0 && Number.isFinite(h) && h > 0) {
                minZoom = Math.max(minZoom, Math.log2(maxBoundsRect.height / h));
            }
            if (minZoom > maxZoom)
                minZoom = maxZoom;
        }
        return clamp(zoom, minZoom, maxZoom);
    }
    _zoomFromCenter(scale) {
        const { width, height } = this.getViewportProps();
        return this.zoom({
            pos: [width / 2, height / 2],
            scale
        });
    }
    _panFromCenter(offset) {
        const { width, height } = this.getViewportProps();
        return this.pan({
            startPos: [width / 2, height / 2],
            pos: [width / 2 + offset[0], height / 2 + offset[1]]
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
    _unproject(pos) {
        const viewport = this.makeViewport(this.getViewportProps());
        // @ts-ignore
        return pos && viewport.unproject(pos);
    }
    _unproject3D(pos, altitude) {
        const viewport = this.makeViewport(this.getViewportProps());
        return viewport.unproject(pos, { targetZ: altitude });
    }
    _getNewRotation(pos, startPos, startPitch, startBearing) {
        const deltaX = pos[0] - startPos[0];
        const deltaY = pos[1] - startPos[1];
        const centerY = pos[1];
        const startY = startPos[1];
        const { width, height } = this.getViewportProps();
        const deltaScaleX = deltaX / width;
        let deltaScaleY = 0;
        if (deltaY > 0) {
            if (Math.abs(height - startY) > PITCH_MOUSE_THRESHOLD) {
                // Move from 0 to -1 as we drag upwards
                deltaScaleY = (deltaY / (startY - height)) * PITCH_ACCEL;
            }
        }
        else if (deltaY < 0) {
            if (startY > PITCH_MOUSE_THRESHOLD) {
                // Move from 0 to 1 as we drag upwards
                deltaScaleY = 1 - centerY / startY;
            }
        }
        // clamp deltaScaleY to [-1, 1] so that rotation is constrained between minPitch and maxPitch.
        // deltaScaleX does not need to be clamped as bearing does not have constraints.
        deltaScaleY = clamp(deltaScaleY, -1, 1);
        const { minPitch, maxPitch } = this.getViewportProps();
        const bearing = startBearing + 180 * deltaScaleX;
        let pitch = startPitch;
        if (deltaScaleY > 0) {
            // Gradually increase pitch
            pitch = startPitch + deltaScaleY * (maxPitch - startPitch);
        }
        else if (deltaScaleY < 0) {
            // Gradually decrease pitch
            pitch = startPitch - deltaScaleY * (minPitch - startPitch);
        }
        return {
            pitch,
            bearing
        };
    }
}
export default class MapController extends Controller {
    constructor() {
        super(...arguments);
        this.ControllerState = MapState;
        this.transition = {
            transitionDuration: 300,
            transitionInterpolator: new LinearInterpolator({
                transitionProps: {
                    compare: ['longitude', 'latitude', 'zoom', 'bearing', 'pitch', 'position'],
                    required: ['longitude', 'latitude', 'zoom']
                }
            })
        };
        this.dragMode = 'pan';
        /**
         * Rotation pivot behavior:
         * - 'center': Rotate around viewport center (default)
         * - '2d': Rotate around pointer position at ground level (z=0)
         * - '3d': Rotate around 3D picked point (requires pickPosition callback)
         */
        this.rotationPivot = 'center';
        /** Add altitude to rotateStart params based on rotationPivot mode */
        this._getAltitude = (pos) => {
            if (this.rotationPivot === '2d') {
                return 0;
            }
            else if (this.rotationPivot === '3d') {
                if (this.pickPosition) {
                    const { x, y } = this.props;
                    const pickResult = this.pickPosition(x + pos[0], y + pos[1]);
                    if (pickResult && pickResult.coordinate && pickResult.coordinate.length >= 3) {
                        return pickResult.coordinate[2];
                    }
                }
            }
            return undefined;
        };
    }
    setProps(props) {
        if ('rotationPivot' in props) {
            this.rotationPivot = props.rotationPivot || 'center';
        }
        // this will be passed to MapState constructor
        props.getAltitude = this._getAltitude;
        props.position = props.position || [0, 0, 0];
        props.maxBounds =
            props.maxBounds || (props.normalize === false ? null : WEB_MERCATOR_MAX_BOUNDS);
        super.setProps(props);
    }
    updateViewport(newControllerState, extraProps = null, interactionState = {}) {
        // Inject rotation pivot position during rotation for visual feedback
        const state = newControllerState.getState();
        if (interactionState.isDragging && state.startRotateLngLat) {
            interactionState = {
                ...interactionState,
                rotationPivotPosition: state.startRotateLngLat
            };
        }
        else if (interactionState.isDragging === false) {
            // Clear pivot when drag ends
            interactionState = { ...interactionState, rotationPivotPosition: undefined };
        }
        super.updateViewport(newControllerState, extraProps, interactionState);
    }
}
//# sourceMappingURL=map-controller.js.map
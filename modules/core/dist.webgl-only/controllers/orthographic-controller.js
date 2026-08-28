// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { clamp } from '@math.gl/core';
import Controller from "./controller.js";
import ViewState from "./view-state.js";
import { getMaxBoundsExtents, getMaxBoundsRect } from "./utils.js";
import LinearInterpolator from "../transitions/linear-interpolator.js";
/** Carries action-specific zoom intent without coupling it to constraint policy. */
const CONSTRAINT_AROUND = Symbol('constraintAround');
const ZOOM_RUBBER_BAND_RANGE = 1;
function normalizeZoom({ zoom = 0, zoomX, zoomY }) {
    zoomX = zoomX ?? (Array.isArray(zoom) ? zoom[0] : zoom);
    zoomY = zoomY ?? (Array.isArray(zoom) ? zoom[1] : zoom);
    return { zoomX, zoomY };
}
function getAxisBounds(maxBounds, index, negativeExtent, positiveExtent, target) {
    const minimum = maxBounds[0][index] + negativeExtent;
    const maximum = maxBounds[1][index] - positiveExtent;
    // An inverted interval has one stable resting target, including when asymmetric
    // viewport padding means that target is not the geometric center of maxBounds.
    const midpoint = (minimum + maximum) / 2;
    return {
        minimum,
        maximum,
        midpoint,
        settledTarget: Number.isFinite(negativeExtent) && Number.isFinite(positiveExtent) && minimum <= maximum
            ? clamp(target, minimum, maximum)
            : midpoint
    };
}
function applyRubberBand(value, constrainedValue, range) {
    const overshoot = value - constrainedValue;
    return overshoot && Number.isFinite(overshoot)
        ? constrainedValue + (overshoot * range) / (range + Math.abs(overshoot))
        : constrainedValue;
}
export class OrthographicState extends ViewState {
    constructor(options) {
        const { 
        /* Viewport arguments */
        width, // Width of viewport
        height, // Height of viewport
        target = [0, 0, 0], zoom = 0, zoomAxis = 'all', 
        /* Viewport constraints */
        minZoom = -Infinity, maxZoom = Infinity, minZoomX = minZoom, maxZoomX = maxZoom, minZoomY = minZoom, maxZoomY = maxZoom, maxBounds = null, maxBoundsPadding = null, rubberBand = false, 
        /** Interaction states, required to calculate change during transform */
        // Model state when the pan operation first started
        startPanPosition, 
        // Model state when the zoom operation first started
        startZoomPosition, startZoom } = options;
        const { [CONSTRAINT_AROUND]: constraintAround } = options;
        const { zoomX, zoomY } = normalizeZoom(options);
        super({
            width,
            height,
            target,
            zoom,
            zoomX,
            zoomY,
            zoomAxis,
            minZoomX,
            maxZoomX,
            minZoomY,
            maxZoomY,
            maxBounds,
            maxBoundsPadding,
            rubberBand,
            ...{ [CONSTRAINT_AROUND]: constraintAround }
        }, {
            startPanPosition,
            startZoomPosition,
            startZoom
        }, options.makeViewport, options.constraintContext);
    }
    /**
     * Start panning
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */
    panStart({ pos }, constraintContext) {
        return this._getUpdatedState({ startPanPosition: this._unproject(pos) }, constraintContext);
    }
    /**
     * Pan
     * @param {[Number, Number]} pos - position on screen where the pointer is
     */
    pan({ pos, startPosition }, constraintContext) {
        const startPanPosition = this.getState().startPanPosition || startPosition;
        if (!startPanPosition) {
            return this;
        }
        const viewport = this.makeViewport(this.getViewportProps());
        const newProps = viewport.panByPosition(startPanPosition, pos);
        return this._getUpdatedState(newProps, constraintContext);
    }
    /**
     * End panning
     * Must call if `panStart()` was called
     */
    panEnd(constraintContext) {
        return this._getUpdatedState({ startPanPosition: null }, constraintContext);
    }
    /**
     * Start rotating
     */
    rotateStart() {
        return this;
    }
    /**
     * Rotate
     */
    rotate() {
        return this;
    }
    /**
     * End rotating
     */
    rotateEnd() {
        return this;
    }
    // shortest path between two view states
    shortestPathFrom(viewState) {
        const fromProps = viewState.getViewportProps();
        const props = { ...this.getViewportProps() };
        return props;
    }
    /**
     * Start zooming
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */
    zoomStart({ pos }, constraintContext) {
        const { zoomX, zoomY } = this.getViewportProps();
        return this._getUpdatedState({
            startZoomPosition: this._unproject(pos),
            startZoom: [zoomX, zoomY]
        }, constraintContext);
    }
    /**
     * Zoom
     * @param {[Number, Number]} pos - position on screen where the current target is
     * @param {[Number, Number]} startPos - the target position at
     *   the start of the operation. Must be supplied of `zoomStart()` was not called
     * @param {Number} scale - a number between [0, 1] specifying the accumulated
     *   relative scale.
     */
    zoom({ pos, startPos, scale }, constraintContext) {
        let { startZoom, startZoomPosition } = this.getState();
        if (!startZoomPosition) {
            // We have two modes of zoom:
            // scroll zoom that are discrete events (transform from the current zoom level),
            // and pinch zoom that are continuous events (transform from the zoom level when
            // pinch started).
            // If startZoom state is defined, then use the startZoom state;
            // otherwise assume discrete zooming
            const { zoomX, zoomY } = this.getViewportProps();
            startZoom = [zoomX, zoomY];
            startZoomPosition = this._unproject(startPos || pos);
        }
        if (!startZoomPosition) {
            return this;
        }
        const newZoomProps = this._calculateNewZoom({ scale, startZoom });
        return this._getUpdatedState({
            ...newZoomProps,
            [CONSTRAINT_AROUND]: { position: startZoomPosition, screenPosition: pos }
        }, constraintContext);
    }
    /**
     * End zooming
     * Must call if `zoomStart()` was called
     */
    zoomEnd(constraintContext) {
        return this._getUpdatedState({
            startZoomPosition: null,
            startZoom: null
        }, constraintContext);
    }
    zoomIn(speed = 2, constraintContext) {
        return this._getUpdatedState(this._calculateNewZoom({ scale: speed }), constraintContext);
    }
    zoomOut(speed = 2, constraintContext) {
        return this._getUpdatedState(this._calculateNewZoom({ scale: 1 / speed }), constraintContext);
    }
    moveLeft(speed = 50, constraintContext) {
        return this._panFromCenter([-speed, 0], constraintContext);
    }
    moveRight(speed = 50, constraintContext) {
        return this._panFromCenter([speed, 0], constraintContext);
    }
    moveUp(speed = 50, constraintContext) {
        return this._panFromCenter([0, -speed], constraintContext);
    }
    moveDown(speed = 50, constraintContext) {
        return this._panFromCenter([0, speed], constraintContext);
    }
    rotateLeft(speed = 15) {
        return this;
    }
    rotateRight(speed = 15) {
        return this;
    }
    rotateUp(speed = 10) {
        return this;
    }
    rotateDown(speed = 10) {
        return this;
    }
    /* Private methods */
    _project(pos) {
        const viewport = this.makeViewport(this.getViewportProps());
        return viewport.project(pos);
    }
    _unproject(pos) {
        const viewport = this.makeViewport(this.getViewportProps());
        return viewport.unproject(pos);
    }
    // Calculates new zoom
    _calculateNewZoom({ scale, startZoom }) {
        const { zoomX, zoomY, zoomAxis } = this.getViewportProps();
        if (startZoom === undefined) {
            startZoom = [zoomX, zoomY];
        }
        const deltaZoom = Math.log2(scale);
        let [newZoomX, newZoomY] = startZoom;
        switch (zoomAxis) {
            case 'X':
                // Scale x only
                newZoomX += deltaZoom;
                break;
            case 'Y':
                // Scale y only
                newZoomY += deltaZoom;
                break;
            default:
                // Lock aspect ratio
                newZoomX += deltaZoom;
                newZoomY += deltaZoom;
        }
        return {
            zoomX: newZoomX,
            zoomY: newZoomY
        };
    }
    _panFromCenter(offset, constraintContext) {
        const { target } = this.getViewportProps();
        const center = this._project(target);
        return this.pan({
            startPosition: target,
            pos: [center[0] + offset[0], center[1] + offset[1]]
        }, constraintContext);
    }
    _getUpdatedState(newProps, constraintContext) {
        // @ts-ignore
        return new this.constructor({
            makeViewport: this.makeViewport,
            ...this.getViewportProps(),
            ...this.getState(),
            ...newProps,
            constraintContext
        });
    }
    // Apply any constraints (mathematical or defined by _viewportProps) to map state
    applyConstraints(props, constraintContext) {
        const internalProps = props;
        const constraintAround = internalProps[CONSTRAINT_AROUND];
        delete internalProps[CONSTRAINT_AROUND];
        // Reconciliation frames already describe the intended visual path. Applying
        // hard limits here would collapse that path to its settled endpoint. Rebound
        // intentionally follows the hard path; the controller animates to that result.
        const normalizedZoom = normalizeZoom(props);
        const constrainedZoom = this._constrainZoom(normalizedZoom, props);
        const shouldRubberBand = props.rubberBand && constraintContext?.mode === 'elastic';
        const { zoomX, zoomY } = constraintContext?.mode === 'preserve'
            ? normalizedZoom
            : shouldRubberBand
                ? {
                    zoomX: applyRubberBand(normalizedZoom.zoomX, constrainedZoom.zoomX, ZOOM_RUBBER_BAND_RANGE),
                    zoomY: applyRubberBand(normalizedZoom.zoomY, constrainedZoom.zoomY, ZOOM_RUBBER_BAND_RANGE)
                }
                : constrainedZoom;
        props.zoomX = zoomX;
        props.zoomY = zoomY;
        // Resolve the semantic zoom anchor only after zoom constraints have selected
        // the displayed scale, otherwise the anchor would be calculated from raw intent.
        if (constraintAround) {
            const viewport = this.makeViewport({ ...props, zoomX, zoomY });
            Object.assign(props, viewport.panByPosition(constraintAround.position, constraintAround.screenPosition));
        }
        // Backward compatibility: update zoom to reflect new view state
        // zoom will always be ignored when zoomX and zoomY are specified, but legacy apps may still read zoom in `onViewStateChange`
        props.zoom =
            Array.isArray(props.zoom) || props.zoomX !== props.zoomY
                ? [props.zoomX, props.zoomY]
                : props.zoomX;
        const { maxBounds, rubberBand, target } = props;
        if (maxBounds) {
            const maxBoundsRect = getMaxBoundsRect(props.width, props.height, props.maxBoundsPadding);
            const viewport = this.makeViewport(props);
            const screenExtents = getMaxBoundsExtents(viewport, target, maxBoundsRect);
            const projectedTarget = viewport.project(target);
            const pixelsPerUnit = [0, 1].map(index => {
                const sampleTarget = target.slice();
                sampleTarget[index] += 1;
                const projectedDelta = viewport.project(sampleTarget)[index] - projectedTarget[index];
                return Number.isFinite(projectedDelta)
                    ? projectedDelta
                    : 2 ** (index === 0 ? zoomX : zoomY) * (index === 0 ? 1 : -1);
            });
            const worldExtents = pixelsPerUnit.map((projectedDelta, index) => {
                const negativeScreenExtent = index === 0 ? screenExtents.left : screenExtents.top;
                const positiveScreenExtent = index === 0 ? screenExtents.right : screenExtents.bottom;
                const scale = Math.abs(projectedDelta);
                return projectedDelta >= 0
                    ? [negativeScreenExtent / scale, positiveScreenExtent / scale]
                    : [positiveScreenExtent / scale, negativeScreenExtent / scale];
            });
            const constrainedTarget = target.slice();
            const targetDimensions = [maxBoundsRect.width, maxBoundsRect.height];
            for (const [index, [negativeExtent, positiveExtent]] of worldExtents.entries()) {
                if (targetDimensions[index] < 0) {
                    continue;
                }
                const { minimum, maximum, midpoint, settledTarget } = getAxisBounds(maxBounds, index, negativeExtent, positiveExtent, target[index]);
                if (constraintContext?.mode !== 'preserve' &&
                    rubberBand &&
                    (!Number.isFinite(negativeExtent) || !Number.isFinite(positiveExtent))) {
                    constrainedTarget[index] = midpoint;
                    continue;
                }
                const constrained = rubberBand ? settledTarget : clamp(target[index], minimum, maximum);
                constrainedTarget[index] =
                    constraintContext?.mode === 'preserve'
                        ? target[index]
                        : shouldRubberBand
                            ? applyRubberBand(target[index], constrained, (index === 0 ? maxBoundsRect.width : maxBoundsRect.height) /
                                2 /
                                Math.abs(pixelsPerUnit[index]))
                            : constrained;
            }
            if (constrainedTarget[0] !== target[0] || constrainedTarget[1] !== target[1]) {
                props.target = constrainedTarget;
            }
        }
        return props;
    }
    _constrainZoom({ zoomX, zoomY }, props) {
        props || (props = this.getViewportProps());
        const { zoomAxis, maxZoomX, maxZoomY, maxBounds } = props;
        let { minZoomX, minZoomY } = props;
        const shouldApplyMaxBounds = maxBounds !== null && props.width > 0 && props.height > 0;
        if (shouldApplyMaxBounds) {
            const maxBoundsRect = getMaxBoundsRect(props.width, props.height, props.maxBoundsPadding);
            const bl = maxBounds[0];
            const tr = maxBounds[1];
            const w = tr[0] - bl[0];
            const h = tr[1] - bl[1];
            // ignore bound size of 0 or Infinity
            if (maxBoundsRect.width > 0 && Number.isFinite(w) && w > 0) {
                minZoomX = Math.max(minZoomX, Math.log2(maxBoundsRect.width / w));
                if (minZoomX > maxZoomX)
                    minZoomX = maxZoomX;
            }
            if (maxBoundsRect.height > 0 && Number.isFinite(h) && h > 0) {
                minZoomY = Math.max(minZoomY, Math.log2(maxBoundsRect.height / h));
                if (minZoomY > maxZoomY)
                    minZoomY = maxZoomY;
            }
        }
        switch (zoomAxis) {
            case 'X':
                zoomX = clamp(zoomX, minZoomX, maxZoomX);
                break;
            case 'Y':
                zoomY = clamp(zoomY, minZoomY, maxZoomY);
                break;
            default:
                // Lock aspect ratio
                let delta = Math.min(maxZoomX - zoomX, maxZoomY - zoomY, 0);
                if (delta === 0) {
                    delta = Math.max(minZoomX - zoomX, minZoomY - zoomY, 0);
                }
                if (delta !== 0) {
                    zoomX += delta;
                    zoomY += delta;
                }
        }
        return { zoomX, zoomY };
    }
}
export default class OrthographicController extends Controller {
    constructor() {
        super(...arguments);
        this.ControllerState = OrthographicState;
        this.transition = {
            transitionDuration: 300,
            transitionInterpolator: new LinearInterpolator(['target', 'zoomX', 'zoomY'])
        };
        this.dragMode = 'pan';
    }
    setProps(props) {
        Object.assign(props, normalizeZoom(props));
        super.setProps(props);
    }
    _onMultiPanStart(event) {
        return this.multiTouchDrag === 'pan' && super._onMultiPanStart(event);
    }
    _onPanRotate() {
        // No rotation in orthographic view
        return false;
    }
}
//# sourceMappingURL=orthographic-controller.js.map
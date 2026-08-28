// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import LayerManager from "./layer-manager.js";
import ViewManager, { DEFAULT_CANVAS_ID } from "./view-manager.js";
import MapView from "../views/map-view.js";
import EffectManager from "./effect-manager.js";
import DeckRenderer from "./deck-renderer.js";
import DeckPicker from "./deck-picker.js";
import { WidgetManager } from "./widget-manager.js";
import { TooltipWidget } from "./tooltip-widget.js";
import log from "../utils/log.js";
import { deepEqual } from "../utils/deep-equal.js";
import typedArrayManager from "../utils/typed-array-manager.js";
import { VERSION } from "./init.js";
import { luma } from '@luma.gl/core';
import { webgl2Adapter } from '@luma.gl/webgl';
import { GL } from '@luma.gl/webgl/constants';
import { Timeline } from '@luma.gl/engine';
import { AnimationLoop } from '@luma.gl/engine';
import { Stats } from '@probe.gl/stats';
import { EventManager } from 'mjolnir.js';
import assert from "../utils/assert.js";
import { EVENT_HANDLERS, RECOGNIZERS } from "./constants.js";
/* global document */
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }
const getCursor = ({ isDragging }) => (isDragging ? 'grabbing' : 'grab');
const defaultProps = {
    id: '',
    width: '100%',
    height: '100%',
    style: null,
    viewState: null,
    initialViewState: null,
    pickingRadius: 0,
    pickAsync: 'auto',
    layerFilter: null,
    parameters: {},
    parent: null,
    device: null,
    deviceProps: {},
    gl: null,
    canvas: null,
    layers: [],
    effects: [],
    views: null,
    controller: null, // Rely on external controller, e.g. react-map-gl
    useDevicePixels: true,
    touchAction: 'none',
    eventRecognizerOptions: {},
    _framebuffer: null,
    _animate: false,
    _pickable: true,
    _typedArrayManagerProps: {},
    _customRender: null,
    widgets: [],
    onDeviceInitialized: noop,
    onWebGLInitialized: noop,
    onResize: noop,
    onViewStateChange: noop,
    onInteractionStateChange: noop,
    onBeforeRender: noop,
    onAfterRender: noop,
    onLoad: noop,
    onError: (error) => log.error(error.message, error.cause)(),
    onHover: null,
    onClick: null,
    onDragStart: null,
    onDrag: null,
    onDragEnd: null,
    _onMetrics: null,
    getCursor,
    getTooltip: null,
    debug: false,
    drawPickingColors: false
};
/* eslint-disable max-statements */
class Deck {
    constructor(props) {
        this.width = 0;
        this.height = 0;
        // Allows attaching arbitrary data to the instance
        this.userData = {};
        this.device = null;
        this.canvas = null;
        this.viewManager = null;
        this.layerManager = null;
        this.effectManager = null;
        this.deckRenderer = null;
        this.deckPicker = null;
        this.eventManager = null;
        this.eventManagers = {};
        this.widgetManager = null;
        this.tooltip = null;
        this.animationLoop = null;
        this._canvasContext = null;
        this._deviceResizeHandler = null;
        this.cursorState = {
            isHovering: false,
            isDragging: false
        };
        this.stats = new Stats({ id: 'deck.gl' });
        this.metrics = {
            fps: 0,
            setPropsTime: 0,
            layersCount: 0,
            drawLayersCount: 0,
            updateLayersCount: 0,
            updateAttributesCount: 0,
            updateAttributesTime: 0,
            framesRedrawn: 0,
            pickTime: 0,
            pickCount: 0,
            pickLayersCount: 0,
            gpuTime: 0,
            gpuTimePerFrame: 0,
            cpuTime: 0,
            cpuTimePerFrame: 0,
            bufferMemory: 0,
            textureMemory: 0,
            renderbufferMemory: 0,
            gpuMemory: 0
        };
        this._metricsCounter = 0;
        this._hoverPickSequence = 0;
        this._pointerDownPickSequence = 0;
        this._needsRedraw = 'Initial render';
        this._pickRequest = {
            mode: 'hover',
            x: -1,
            y: -1,
            radius: 0,
            event: null,
            unproject3D: false
        };
        /**
         * Pick and store the object under the pointer on `pointerdown`.
         * This object is reused for subsequent `onClick` and `onDrag*` callbacks.
         */
        this._lastPointerDownInfo = null;
        this._lastPointerDownInfoPromise = null;
        // The `pointermove` event may fire multiple times in between two animation frames,
        // it's a waste of time to run picking without rerender. Instead we save the last pick
        // request and only do it once on the next animation frame.
        /** Internal use only: event handler for pointerdown */
        this._onPointerMove = (event) => {
            const { _pickRequest } = this;
            if (event.type === 'pointerleave') {
                _pickRequest.x = -1;
                _pickRequest.y = -1;
                _pickRequest.radius = 0;
            }
            else if (event.leftButton || event.rightButton) {
                // Do not trigger onHover callbacks if mouse button is down.
                return;
            }
            else {
                const pos = event.offsetCenter;
                // Do not trigger callbacks when click/hover position is invalid. Doing so will cause a
                // assertion error when attempting to unproject the position.
                if (!pos) {
                    return;
                }
                _pickRequest.x = pos.x;
                _pickRequest.y = pos.y;
                _pickRequest.radius = this.props.pickingRadius;
            }
            if (this.layerManager) {
                this.layerManager.context.mousePosition = { x: _pickRequest.x, y: _pickRequest.y };
            }
            _pickRequest.event = event;
        };
        /** Internal use only: event handler for click & drag */
        this._onEvent = (event) => {
            const eventHandlerProp = EVENT_HANDLERS[event.type];
            const pos = event.offsetCenter;
            if (!eventHandlerProp || !pos || !this.layerManager) {
                return;
            }
            const layers = this.layerManager.getLayers();
            const internalPickingMode = this._getInternalPickingMode();
            if (!internalPickingMode) {
                return;
            }
            if (internalPickingMode === 'sync') {
                const info = event.type === 'click' && this._shouldUnproject3D(layers)
                    ? this._getFirstPickedInfo(this._pickPointSync(this._getPointPickOptions(pos.x, pos.y, { unproject3D: true }, layers)))
                    : this._getLastPointerDownPickingInfo(pos.x, pos.y, layers);
                this._dispatchPickingEvent(info, event);
                return;
            }
            const pointerDownInfoPromise = this._lastPointerDownInfoPromise ||
                Promise.resolve(this._getLastPointerDownPickingInfo(pos.x, pos.y, layers));
            pointerDownInfoPromise
                .then(info => {
                this._dispatchPickingEvent(info, event);
            })
                .catch(error => this.props.onError?.(error));
        };
        /** Internal use only: evnet handler for pointerdown */
        this._onPointerDown = (event) => {
            const pos = event.offsetCenter;
            if (!pos) {
                return;
            }
            const internalPickingMode = this._getInternalPickingMode();
            if (!internalPickingMode) {
                return;
            }
            const layers = this.layerManager?.getLayers() || [];
            const pointerDownPickSequence = ++this._pointerDownPickSequence;
            if (internalPickingMode === 'sync') {
                const pickedInfo = this._pickPointSync({
                    x: pos.x,
                    y: pos.y,
                    radius: this.props.pickingRadius
                });
                const info = this._getFirstPickedInfo(pickedInfo);
                this._lastPointerDownInfo = info;
                this._lastPointerDownInfoPromise = Promise.resolve(info);
                return;
            }
            const pickPromise = this._pickPointAsync(this._getPointPickOptions(pos.x, pos.y, {}, layers))
                .then(pickResult => this._getFirstPickedInfo(pickResult))
                .then(info => {
                if (pointerDownPickSequence === this._pointerDownPickSequence) {
                    this._lastPointerDownInfo = info;
                }
                return info;
            })
                .catch(error => {
                this.props.onError?.(error);
                const fallbackInfo = this.deckPicker && this.viewManager
                    ? this._getLastPointerDownPickingInfo(pos.x, pos.y, layers)
                    : {};
                if (pointerDownPickSequence === this._pointerDownPickSequence) {
                    this._lastPointerDownInfo = fallbackInfo;
                }
                return fallbackInfo;
            });
            this._lastPointerDownInfo = null;
            this._lastPointerDownInfoPromise = pickPromise;
        };
        const initialProps = props;
        // @ts-ignore views
        this.props = { ...defaultProps, ...props };
        props = this.props;
        if (props.viewState && props.initialViewState) {
            log.warn('View state tracking is disabled. Use either `initialViewState` for auto update or `viewState` for manual update.')();
        }
        this.viewState = this.props.initialViewState;
        // See if we already have a device
        if (props.device) {
            this.device = props.device;
            this._setDeviceCanvasContext(props.device);
        }
        let deviceOrPromise = this.device;
        // Attach a new luma.gl device to a WebGL2 context if supplied
        if (!deviceOrPromise && props.gl) {
            if (props.gl instanceof WebGLRenderingContext) {
                log.error('WebGL1 context not supported.')();
            }
            deviceOrPromise = webgl2Adapter.attach(props.gl, {
                // Enable shader and pipeline caching for attached devices (matches _createDevice defaults)
                // Without this, interleaved mode (e.g., MapboxOverlay) creates new pipelines every frame
                _cacheShaders: true,
                _cachePipelines: true,
                ...this.props.deviceProps
            });
        }
        // Create a new device
        if (!deviceOrPromise) {
            deviceOrPromise = this._createDevice(props);
        }
        this.animationLoop = this._createAnimationLoop(deviceOrPromise, props);
        this.setProps(initialProps);
        // UNSAFE/experimental prop: only set at initialization to avoid performance hit
        if (props._typedArrayManagerProps) {
            typedArrayManager.setOptions(props._typedArrayManagerProps);
        }
        this.animationLoop.start();
    }
    /** Stop rendering and dispose all resources */
    finalize() {
        this._restoreDeviceResizeHandler();
        this.animationLoop?.stop();
        this.animationLoop?.destroy();
        this.animationLoop = null;
        this._hoverPickSequence++;
        this._pointerDownPickSequence++;
        this._lastPointerDownInfo = null;
        this._lastPointerDownInfoPromise = null;
        this.layerManager?.finalize();
        this.layerManager = null;
        this.viewManager?.finalize();
        this.viewManager = null;
        this.effectManager?.finalize();
        this.effectManager = null;
        this.deckRenderer?.finalize();
        this.deckRenderer = null;
        this.deckPicker?.finalize();
        this.deckPicker = null;
        this.eventManager?.destroy();
        this.eventManager = null;
        this.eventManagers = {};
        this.widgetManager?.finalize();
        this.widgetManager = null;
        if (!this.props.canvas && !this.props.device && !this.props.gl && this.canvas) {
            // remove internally created canvas
            this.canvas.parentElement?.removeChild(this.canvas);
            this.canvas = null;
        }
        this._canvasContext = null;
    }
    /** Partially update props */
    setProps(props) {
        this.stats.get('setProps Time').timeStart();
        if ('onLayerHover' in props) {
            log.removed('onLayerHover', 'onHover')();
        }
        if ('onLayerClick' in props) {
            log.removed('onLayerClick', 'onClick')();
        }
        if (props.initialViewState &&
            // depth = 3 when comparing viewStates: viewId.position.0
            !deepEqual(this.props.initialViewState, props.initialViewState, 3)) {
            // Overwrite internal view state
            this.viewState = props.initialViewState;
        }
        // Merge with existing props
        Object.assign(this.props, props);
        this._validateInternalPickingMode();
        // Update CSS size of canvas
        this._setCanvasSize(this.props);
        // We need to overwrite CSS style width and height with actual, numeric values
        const resolvedProps = Object.create(this.props);
        Object.assign(resolvedProps, {
            views: this._getViews(),
            width: this.width,
            height: this.height,
            viewState: this._getViewState(),
            eventManagers: this.eventManagers
        });
        if (props.device && props.device.id !== this.device?.id) {
            const canvasContext = props.device.getDefaultCanvasContext();
            this.animationLoop?.stop();
            if (this.canvas !== canvasContext.canvas) {
                // remove old canvas if new one being used and de-register events
                // TODO (ck): We might not own this canvas depending it's source, so removing it from the
                // DOM here might be a bit unexpected but it should be ok for most users.
                this.canvas?.remove();
                this.eventManager?.destroy();
                this.eventManager = null;
                this.eventManagers = {};
                // ensure we will re-attach ourselves after createDevice callbacks
                this.canvas = null;
            }
            this._setDeviceCanvasContext(props.device);
            log.log(`recreating animation loop for new device! id=${props.device.id}`)();
            this.animationLoop = this._createAnimationLoop(props.device, props);
            this.animationLoop.start();
        }
        // Update the animation loop
        this.animationLoop?.setProps(resolvedProps);
        if (props.useDevicePixels !== undefined && this._canvasContext?.setProps) {
            this._canvasContext.setProps({ useDevicePixels: props.useDevicePixels });
        }
        // If initialized, update sub manager props
        if (this.layerManager) {
            this.viewManager.setProps(resolvedProps);
            // Make sure that any new layer gets initialized with the current viewport
            this.layerManager.activateViewport(this.getViewports()[0]);
            this.layerManager.setProps(resolvedProps);
            this.effectManager.setProps(resolvedProps);
            this.deckRenderer.setProps(resolvedProps);
            this.deckPicker.setProps(resolvedProps);
            this.widgetManager.setProps(resolvedProps);
        }
        this.stats.get('setProps Time').timeEnd();
    }
    // Public API
    /**
     * Check if a redraw is needed
     * @returns `false` or a string summarizing the redraw reason
     */
    needsRedraw(opts = { clearRedrawFlags: false }) {
        if (!this.layerManager) {
            // Not initialized or already finalized
            return false;
        }
        if (this.props._animate) {
            return 'Deck._animate';
        }
        let redraw = this._needsRedraw;
        if (opts.clearRedrawFlags) {
            this._needsRedraw = false;
        }
        const viewManagerNeedsRedraw = this.viewManager.needsRedraw(opts);
        const layerManagerNeedsRedraw = this.layerManager.needsRedraw(opts);
        const effectManagerNeedsRedraw = this.effectManager.needsRedraw(opts);
        const deckRendererNeedsRedraw = this.deckRenderer.needsRedraw(opts);
        redraw =
            redraw ||
                viewManagerNeedsRedraw ||
                layerManagerNeedsRedraw ||
                effectManagerNeedsRedraw ||
                deckRendererNeedsRedraw;
        return redraw;
    }
    /**
     * Redraw the GL context
     * @param reason If not provided, only redraw if deemed necessary. Otherwise redraw regardless of internal states.
     * @returns
     */
    redraw(reason) {
        if (!this.layerManager) {
            // Not yet initialized
            return;
        }
        // Check if we need to redraw
        let redrawReason = this.needsRedraw({ clearRedrawFlags: true });
        // User-supplied should take precedent, however the redraw flags get cleared regardless
        redrawReason = reason || redrawReason;
        if (!redrawReason) {
            return;
        }
        this.stats.get('Redraw Count').incrementCount();
        if (this.props._customRender) {
            this.props._customRender(redrawReason);
        }
        else {
            this._drawLayers(redrawReason);
        }
    }
    /** Flag indicating that the Deck instance has initialized its resources and it's safe to call public methods. */
    get isInitialized() {
        return this.viewManager !== null;
    }
    /** Get a list of views that are currently rendered */
    getViews() {
        assert(this.viewManager);
        return this.viewManager.views;
    }
    /** Get a view by id */
    getView(viewId) {
        assert(this.viewManager);
        return this.viewManager.getView(viewId);
    }
    /** Get a list of viewports that are currently rendered.
     * @param rect If provided, only returns viewports within the given bounding box.
     */
    getViewports(rect) {
        assert(this.viewManager);
        return this.viewManager.getViewports(rect);
    }
    /** Get the current canvas element. */
    getCanvas() {
        return this.canvas;
    }
    /**
     * Get the event manager associated with a view or the default Deck canvas.
     */
    getEventManager(viewId) {
        if (!viewId || !this.viewManager) {
            return this.eventManager;
        }
        const canvasId = this.viewManager.getCanvasId(viewId) || DEFAULT_CANVAS_ID;
        return this.eventManagers[canvasId] || this.eventManager;
    }
    /** Query the object rendered on top at a given point */
    async pickObjectAsync(opts) {
        const infos = (await this._pickAsync('pickObjectAsync', 'pickObject Time', opts)).result;
        return infos.length ? infos[0] : null;
    }
    /**
     * Query all objects rendered on top within a bounding box
     * @note Caveat: this method performs multiple async GPU queries, so state could potentially change between calls.
     */
    async pickObjectsAsync(opts) {
        return await this._pickAsync('pickObjectsAsync', 'pickObjects Time', opts);
    }
    /**
     * Query the object rendered on top at a given point
     * @deprecated WebGL only. Use `pickObjectsAsync` instead
     */
    pickObject(opts) {
        const infos = this._pick('pickObject', 'pickObject Time', opts).result;
        return infos.length ? infos[0] : null;
    }
    /**
     * Query all rendered objects at a given point
     * @deprecated WebGL only. Use `pickObjectsAsync` instead
     */
    pickMultipleObjects(opts) {
        opts.depth = opts.depth || 10;
        return this._pick('pickObject', 'pickMultipleObjects Time', opts).result;
    }
    /**
     * Query all objects rendered on top within a bounding box
     * @deprecated WebGL only. Use `pickObjectsAsync` instead
     */
    pickObjects(opts) {
        return this._pick('pickObjects', 'pickObjects Time', opts);
    }
    /**
     * Internal method used by controllers to pick 3D position at a screen coordinate
     * @private
     */
    _pickPositionForController(x, y) {
        const internalPickingMode = this._getInternalPickingMode();
        if (internalPickingMode !== 'sync') {
            return null;
        }
        return this.pickObject({ x, y, radius: 0, unproject3D: true });
    }
    /** Experimental
     * Add a global resource for sharing among layers
     */
    _addResources(resources, forceUpdate = false) {
        for (const id in resources) {
            this.layerManager.resourceManager.add({ resourceId: id, data: resources[id], forceUpdate });
        }
    }
    /** Experimental
     * Remove a global resource
     */
    _removeResources(resourceIds) {
        for (const id of resourceIds) {
            this.layerManager.resourceManager.remove(id);
        }
    }
    /** Experimental
     * Register a default effect. Effects will be sorted by order, those with a low order will be rendered first
     */
    _addDefaultEffect(effect) {
        this.effectManager.addDefaultEffect(effect);
    }
    _addDefaultShaderModule(module) {
        this.layerManager.addDefaultShaderModule(module);
    }
    _removeDefaultShaderModule(module) {
        this.layerManager?.removeDefaultShaderModule(module);
    }
    // Private Methods
    _resolveInternalPickingMode() {
        const { pickAsync } = this.props;
        const deviceType = this.device?.type || this.props.deviceProps?.type;
        if (pickAsync === 'auto') {
            return deviceType === 'webgpu' ? 'async' : 'sync';
        }
        if (pickAsync === 'sync' && deviceType === 'webgpu') {
            throw new Error('`pickAsync: "sync"` is not supported when Deck is using a WebGPU device.');
        }
        return pickAsync;
    }
    _getInternalPickingMode() {
        try {
            return this._resolveInternalPickingMode();
        }
        catch (error) {
            this.props.onError?.(error);
            return null;
        }
    }
    _validateInternalPickingMode() {
        this._getInternalPickingMode();
    }
    _getFirstPickedInfo({ result, emptyInfo }) {
        return result[0] || emptyInfo;
    }
    _shouldUnproject3D(layers = this.layerManager?.getLayers() || []) {
        return layers.some(layer => layer.props.pickable === '3d');
    }
    _getPointPickOptions(x, y, opts = {}, layers = this.layerManager?.getLayers() || []) {
        return {
            x,
            y,
            radius: this.props.pickingRadius,
            unproject3D: this._shouldUnproject3D(layers),
            ...opts
        };
    }
    _pickPointSync(opts) {
        return this._pick('pickObject', 'pickObject Time', opts);
    }
    _pickPointAsync(opts) {
        return this._pickAsync('pickObjectAsync', 'pickObject Time', opts);
    }
    _getLastPointerDownPickingInfo(x, y, layers = this.layerManager?.getLayers() || []) {
        return this.deckPicker.getLastPickedObject({
            x,
            y,
            layers,
            viewports: this.getViewports({ x, y })
        }, this._lastPointerDownInfo);
    }
    _applyHoverCallbacks({ result, emptyInfo }, event) {
        if (!this.widgetManager) {
            return;
        }
        this.cursorState.isHovering = result.length > 0;
        let pickedInfo = emptyInfo;
        let handled = false;
        for (const info of result) {
            pickedInfo = info;
            handled = info.layer?.onHover(info, event) || handled;
        }
        if (!handled) {
            this.props.onHover?.(pickedInfo, event);
            this.widgetManager.onHover(pickedInfo, event);
        }
    }
    _dispatchPickingEvent(info, event) {
        if (!this.layerManager || !this.widgetManager) {
            return;
        }
        const eventHandlerProp = EVENT_HANDLERS[event.type];
        if (!eventHandlerProp) {
            return;
        }
        const { layer } = info;
        const layerHandler = layer && (layer[eventHandlerProp] || layer.props[eventHandlerProp]);
        const rootHandler = this.props[eventHandlerProp];
        let handled = false;
        if (layerHandler) {
            handled = layerHandler.call(layer, info, event);
        }
        if (!handled) {
            rootHandler?.(info, event);
            this.widgetManager.onEvent(info, event);
        }
    }
    _pickAsync(method, statKey, opts) {
        assert(this.deckPicker);
        const { stats } = this;
        stats.get('Pick Count').incrementCount();
        stats.get(statKey).timeStart();
        const infos = this.deckPicker[method]({
            // layerManager, viewManager and effectManager are always defined if deckPicker is
            layers: this.layerManager.getLayers(opts),
            views: this.viewManager.getViews(),
            viewports: this.getViewports(opts),
            onViewportActive: this.layerManager.activateViewport,
            effects: this.effectManager.getEffects(),
            ...opts,
            canvasContext: this._canvasContext || undefined
        });
        stats.get(statKey).timeEnd();
        return infos;
    }
    _pick(method, statKey, opts) {
        assert(this.deckPicker);
        const { stats } = this;
        stats.get('Pick Count').incrementCount();
        stats.get(statKey).timeStart();
        const infos = this.deckPicker[method]({
            // layerManager, viewManager and effectManager are always defined if deckPicker is
            layers: this.layerManager.getLayers(opts),
            views: this.viewManager.getViews(),
            viewports: this.getViewports(opts),
            onViewportActive: this.layerManager.activateViewport,
            effects: this.effectManager.getEffects(),
            ...opts,
            canvasContext: this._canvasContext || undefined
        });
        stats.get(statKey).timeEnd();
        return infos;
    }
    /** Resolve props.canvas to element */
    _createCanvas(props) {
        let canvas = props.canvas;
        // TODO EventManager should accept element id
        if (typeof canvas === 'string') {
            canvas = document.getElementById(canvas);
            assert(canvas);
        }
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = props.id || 'deckgl-overlay';
            // TODO this is a hack, investigate why these are not set for the picking
            // tests
            if (props.width && typeof props.width === 'number') {
                canvas.width = props.width;
            }
            if (props.height && typeof props.height === 'number') {
                canvas.height = props.height;
            }
            const parent = props.parent || document.body;
            parent.appendChild(canvas);
        }
        Object.assign(canvas.style, props.style);
        return canvas;
    }
    _createEventManager(root) {
        const eventManager = new EventManager(root, {
            touchAction: this.props.touchAction,
            recognizers: Object.keys(RECOGNIZERS).map((eventName) => {
                // Resolve recognizer settings
                const [RecognizerConstructor, defaultOptions, recognizeWith, requireFailure] = RECOGNIZERS[eventName];
                const optionsOverride = this.props.eventRecognizerOptions?.[eventName];
                const options = { ...defaultOptions, ...optionsOverride, event: eventName };
                return {
                    recognizer: new RecognizerConstructor(options),
                    recognizeWith,
                    requireFailure
                };
            }),
            events: {
                pointerdown: this._onPointerDown,
                pointermove: this._onPointerMove,
                pointerleave: this._onPointerMove
            }
        });
        for (const eventType in EVENT_HANDLERS) {
            if (eventType === 'dblclick') {
                // Use watch (passive) so the dblclick recognizer is only enabled by the
                // controller's doubleClickZoom option — not by the picking system.
                eventManager.watch(eventType, this._onEvent);
            }
            else {
                eventManager.on(eventType, this._onEvent);
            }
        }
        return eventManager;
    }
    _setCanvasContext(canvasContext) {
        this._canvasContext = canvasContext;
        if ('style' in canvasContext.canvas) {
            this.canvas = canvasContext.canvas;
        }
    }
    _setDeviceCanvasContext(device, opts = {}) {
        const canvasContext = device.getDefaultCanvasContext();
        this._setCanvasContext(canvasContext);
        this._setDeviceResizeHandler(device, opts);
    }
    _setDeviceResizeHandler(device, opts = {}) {
        const syncDrawingBuffer = Boolean(opts.syncDrawingBuffer);
        if (this._deviceResizeHandler?.device === device) {
            this._deviceResizeHandler.syncDrawingBuffer = syncDrawingBuffer;
            return;
        }
        this._restoreDeviceResizeHandler();
        const onResize = canvasContext => {
            if (canvasContext === this._canvasContext && this._canvasContext) {
                // Deck owns resize handling for the active render CanvasContext. Applications should use
                // DeckProps.onResize instead of the lower-level luma device callback while Deck is active.
                this._onCanvasContextResize(this._canvasContext, {
                    syncDrawingBuffer: this._deviceResizeHandler?.syncDrawingBuffer
                });
            }
        };
        device.props.onResize = onResize;
        this._deviceResizeHandler = { device, onResize, syncDrawingBuffer };
    }
    _restoreDeviceResizeHandler() {
        const resizeHandler = this._deviceResizeHandler;
        if (resizeHandler && resizeHandler.device.props?.onResize === resizeHandler.onResize) {
            resizeHandler.device.props.onResize = noop;
        }
        this._deviceResizeHandler = null;
    }
    /** Updates canvas width and/or height, if provided as props */
    _setCanvasSize(props) {
        if (!this.canvas) {
            return;
        }
        const { width, height } = props;
        // Set size ONLY if props are being provided, otherwise let canvas be layouted freely
        if (width || width === 0) {
            const cssWidth = Number.isFinite(width) ? `${width}px` : width;
            this.canvas.style.width = cssWidth;
        }
        if (height || height === 0) {
            const cssHeight = Number.isFinite(height) ? `${height}px` : height;
            // Note: position==='absolute' required for height 100% to work
            this.canvas.style.position = props.style?.position || 'absolute';
            this.canvas.style.height = cssHeight;
        }
    }
    /**
     * Sync Deck viewport dimensions from the active canvas context.
     * luma.gl owns resize observation, DPR tracking and drawing buffer sizing for Deck-created
     * canvases. Attached WebGL contexts still need Deck to mirror external drawing-buffer changes.
     */
    _updateCanvasSize(canvasContext = this._canvasContext) {
        const { canvas } = this;
        const [newWidth, newHeight] = canvasContext
            ? // The canvas context owns the authoritative CSS size after resize/DPR observation.
                canvasContext.getCSSSize()
            : // Fallback to width/height when there is no default canvas context available yet.
                [canvas?.clientWidth ?? canvas?.width ?? 0, canvas?.clientHeight ?? canvas?.height ?? 0];
        if (newWidth !== this.width || newHeight !== this.height) {
            // @ts-expect-error private assign to read-only property
            this.width = newWidth;
            // @ts-expect-error private assign to read-only property
            this.height = newHeight;
            this.viewManager?.setProps({ width: newWidth, height: newHeight });
            // Make sure that any new layer gets initialized with the current viewport
            this.layerManager?.activateViewport(this.getViewports()[0]);
            this.props.onResize({ width: newWidth, height: newHeight }, canvasContext || undefined);
        }
    }
    _onCanvasContextResize(canvasContext, opts = {}) {
        if (opts.syncDrawingBuffer) {
            const { width, height } = canvasContext.canvas;
            canvasContext.setDrawingBufferSize(width, height);
        }
        // luma owns resize detection; Deck reacts by invalidating redraw and updating view state.
        this._needsRedraw = 'Canvas resized';
        this._updateCanvasSize(canvasContext);
    }
    _createAnimationLoop(deviceOrPromise, props) {
        const { 
        // width,
        // height,
        gl, 
        // debug,
        onError
        // onBeforeRender,
        // onAfterRender,
         } = props;
        return new AnimationLoop({
            device: deviceOrPromise,
            // TODO v9
            autoResizeDrawingBuffer: !gl, // do not auto resize external context
            autoResizeViewport: false,
            // @ts-expect-error luma.gl needs to accept Promise<void> return value
            onInitialize: context => this._setDevice(context.device),
            onRender: this._onRenderFrame.bind(this),
            // @ts-expect-error typing mismatch: AnimationLoop does not accept onError:null
            onError
            // onBeforeRender,
            // onAfterRender,
        });
    }
    // Create a device from the deviceProps, assigning required defaults
    _createDevice(props) {
        const canvasContextUserProps = this.props.deviceProps?.createCanvasContext;
        const canvasContextProps = typeof canvasContextUserProps === 'object' ? canvasContextUserProps : undefined;
        // In deck.gl v9, Deck always bundles and adds a webgl2Adapter.
        // This behavior is expected to change in deck.gl v10 to support WebGPU only builds.
        const deviceProps = {
            adapters: [],
            _cacheShaders: true,
            _cachePipelines: true,
            ...props.deviceProps
        };
        if (!deviceProps.adapters.includes(webgl2Adapter)) {
            deviceProps.adapters.push(webgl2Adapter);
        }
        const defaultCanvasProps = {
            // we must use 'premultiplied' canvas for webgpu to enable transparency and match shaders
            alphaMode: this.props.deviceProps?.type === 'webgpu' ? 'premultiplied' : undefined
        };
        // Create the "best" device supported from the registered adapters
        return luma.createDevice({
            // luma by default throws if a device is already attached
            // asynchronous device creation could happen after finalize() is called
            // TODO - createDevice should support AbortController?
            _reuseDevices: true,
            // tests can't handle WebGPU devices yet so we force WebGL2 unless overridden
            type: 'webgl',
            ...deviceProps,
            // In deck.gl v10 we may emphasize multi canvas support and unwind this prop wrapping
            createCanvasContext: {
                ...defaultCanvasProps,
                ...canvasContextProps,
                canvas: this._createCanvas(props),
                useDevicePixels: this.props.useDevicePixels,
                autoResize: true
            }
        });
    }
    // Get the most relevant view state: props.viewState, if supplied, shadows internal viewState
    // TODO: For backwards compatibility ensure numeric width and height is added to the viewState
    _getViewState() {
        return this.props.viewState || this.viewState;
    }
    // Get the view descriptor list
    _getViews() {
        const { views } = this.props;
        const normalizedViews = Array.isArray(views)
            ? views
            : // If null, default to a full screen map view port
                views
                    ? [views]
                    : [new MapView({ id: 'default-view' })];
        if (normalizedViews.length && this.props.controller) {
            // Backward compatibility: support controller prop
            // Clone the view so that ViewManager._diffViews detects the change
            normalizedViews[0] = normalizedViews[0].clone({ controller: this.props.controller });
        }
        return normalizedViews;
    }
    _onContextLost() {
        const { onError } = this.props;
        if (this.animationLoop && onError) {
            onError(new Error('WebGL context is lost'));
        }
    }
    /** Actually run picking */
    _pickAndCallback() {
        const { _pickRequest } = this;
        if (_pickRequest.event) {
            const event = _pickRequest.event;
            const layers = this.layerManager?.getLayers() || [];
            const pickOptions = this._getPointPickOptions(_pickRequest.x, _pickRequest.y, {
                radius: _pickRequest.radius,
                mode: _pickRequest.mode
            }, layers);
            const internalPickingMode = this._getInternalPickingMode();
            const hoverPickSequence = ++this._hoverPickSequence;
            _pickRequest.event = null;
            if (!internalPickingMode) {
                return;
            }
            if (internalPickingMode === 'sync') {
                this._applyHoverCallbacks(this._pickPointSync(pickOptions), event);
                return;
            }
            this._pickPointAsync(pickOptions)
                .then(({ result, emptyInfo }) => {
                if (hoverPickSequence === this._hoverPickSequence) {
                    this._applyHoverCallbacks({ result, emptyInfo }, event);
                }
            })
                .catch(error => this.props.onError?.(error));
        }
    }
    _updateCursor() {
        const container = this.props.parent || this.canvas;
        if (container) {
            container.style.cursor = this.props.getCursor(this.cursorState);
        }
    }
    _setDevice(device) {
        this.device = device;
        this._validateInternalPickingMode();
        if (!this.animationLoop) {
            // finalize() has been called
            return;
        }
        this._setDeviceCanvasContext(device, {
            syncDrawingBuffer: Boolean(this.props.gl && this.props.device !== device)
        });
        // external canvas may not be in DOM
        if (this.canvas && !this.canvas.isConnected && this.props.parent) {
            this.props.parent.insertBefore(this.canvas, this.props.parent.firstChild);
        }
        // TODO v9
        // ts-expect-error - Currently luma.gl v9 does not expose these options
        // All WebGLDevice contexts are instrumented, but it seems the device
        // should have a method to start state tracking even if not enabled?
        // instrumentGLContext(this.device.gl, {enable: true, copyState: true});
        if (this.device.type === 'webgl') {
            this.device.setParametersWebGL({
                blend: true,
                blendFunc: [770, 771, 1, 771],
                polygonOffsetFill: true,
                depthTest: true,
                depthFunc: 515
            });
        }
        this.props.onDeviceInitialized(this.device);
        if (this.device.type === 'webgl') {
            // Legacy callback - warn?
            // @ts-expect-error gl is not visible on Device base class
            this.props.onWebGLInitialized(this.device.gl);
        }
        // timeline for transitions
        const timeline = new Timeline();
        timeline.play();
        this.animationLoop.attachTimeline(timeline);
        const eventRoot = this.props.parent?.querySelector('.deck-events-root') || this.canvas;
        assert(eventRoot);
        this.eventManager = this._createEventManager(eventRoot);
        this.eventManagers = { [DEFAULT_CANVAS_ID]: this.eventManager };
        this.viewManager = new ViewManager({
            timeline,
            eventManager: this.eventManager,
            eventManagers: this.eventManagers,
            onViewStateChange: this._onViewStateChange.bind(this),
            onInteractionStateChange: this._onInteractionStateChange.bind(this),
            pickPosition: this._pickPositionForController.bind(this),
            views: this._getViews(),
            viewState: this._getViewState(),
            width: this.width,
            height: this.height
        });
        // viewManager must be initialized before layerManager
        // layerManager depends on viewport created by viewManager.
        const viewport = this.viewManager.getViewports()[0];
        // Note: avoid React setState due GL animation loop / setState timing issue
        this.layerManager = new LayerManager(this.device, {
            deck: this,
            stats: this.stats,
            viewport,
            timeline
        });
        this.effectManager = new EffectManager({
            deck: this,
            device: this.device
        });
        this.deckRenderer = new DeckRenderer(this.device, { stats: this.stats });
        this.deckPicker = new DeckPicker(this.device, { stats: this.stats });
        const widgetParent = this.props.parent?.querySelector('.deck-widgets-root') ||
            this.canvas?.parentElement;
        this.widgetManager = new WidgetManager({
            deck: this,
            parentElement: widgetParent
        });
        this.widgetManager.addDefault(new TooltipWidget());
        this.setProps({});
        // Seed the initial Deck width/height from the current canvas context before onLoad fires.
        this._updateCanvasSize(this._canvasContext);
        this.props.onLoad();
    }
    /** Internal only: default render function (redraw all layers and views) */
    _drawLayers(redrawReason, renderOptions) {
        const { device, gl } = this.layerManager.context;
        this.props.onBeforeRender({ device, gl });
        const opts = {
            target: this.props._framebuffer,
            layers: this.layerManager.getLayers(),
            viewports: this.viewManager.getViewports(),
            onViewportActive: this.layerManager.activateViewport,
            views: this.viewManager.getViews(),
            pass: 'screen',
            effects: this.effectManager.getEffects(),
            ...renderOptions
        };
        this.deckRenderer?.renderLayers(opts);
        if (opts.pass === 'screen') {
            // This method could be called when drawing to picking buffer, texture etc.
            // Only when drawing to screen, update all widgets (UI components)
            this.widgetManager.onRedraw({
                viewports: opts.viewports,
                layers: opts.layers
            });
        }
        this.props.onAfterRender({ device, gl });
    }
    // Callbacks
    _onRenderFrame() {
        this._getFrameStats();
        // Log perf stats every second
        if (this._metricsCounter++ % 60 === 0) {
            this._getMetrics();
            this.stats.reset();
            log.table(4, this.metrics)();
            // Experimental: report metrics
            if (this.props._onMetrics) {
                this.props._onMetrics(this.metrics);
            }
        }
        this._updateCursor();
        // Update layers if needed (e.g. some async prop has loaded)
        // Note: This can trigger a redraw
        this.layerManager.updateLayers();
        // Perform picking request if any
        this._pickAndCallback();
        // Redraw if necessary
        this.redraw();
        // Update viewport transition if needed
        // Note: this can trigger `onViewStateChange`, and affect layers
        // We want to defer these changes to the next frame
        if (this.viewManager) {
            this.viewManager.updateViewStates();
        }
    }
    // Callbacks
    _onViewStateChange(params) {
        // Let app know that view state is changing, and give it a chance to change it
        const viewState = this.props.onViewStateChange(params) || params.viewState;
        // If initialViewState was set on creation, auto track position
        if (this.viewState) {
            this.viewState = { ...this.viewState, [params.viewId]: viewState };
            if (!this.props.viewState) {
                // Apply internal view state
                if (this.viewManager) {
                    this.viewManager.setProps({ viewState: this.viewState });
                }
            }
        }
    }
    _onInteractionStateChange(interactionState) {
        this.cursorState.isDragging = interactionState.isDragging || false;
        this.props.onInteractionStateChange(interactionState);
    }
    _getFrameStats() {
        const { stats } = this;
        stats.get('frameRate').timeEnd();
        stats.get('frameRate').timeStart();
        // Get individual stats from luma.gl so reset works
        const animationLoopStats = this.animationLoop.stats;
        stats.get('GPU Time').addTime(animationLoopStats.get('GPU Time').lastTiming);
        stats.get('CPU Time').addTime(animationLoopStats.get('CPU Time').lastTiming);
    }
    _getMetrics() {
        const { metrics, stats } = this;
        metrics.fps = stats.get('frameRate').getHz();
        metrics.setPropsTime = stats.get('setProps Time').time;
        metrics.updateAttributesTime = stats.get('Update Attributes').time;
        metrics.framesRedrawn = stats.get('Redraw Count').count;
        metrics.pickTime =
            stats.get('pickObject Time').time +
                stats.get('pickMultipleObjects Time').time +
                stats.get('pickObjects Time').time;
        metrics.pickCount = stats.get('Pick Count').count;
        metrics.layersCount = this.layerManager?.layers.length ?? 0;
        metrics.drawLayersCount = stats.get('Layers rendered').lastSampleCount;
        metrics.pickLayersCount = stats.get('Layers picked').lastSampleCount;
        metrics.updateLayersCount = stats.get('Layer updates').count;
        metrics.updateAttributesCount = stats.get('Attributes updated').count;
        // Luma stats
        metrics.gpuTime = stats.get('GPU Time').time;
        metrics.cpuTime = stats.get('CPU Time').time;
        metrics.gpuTimePerFrame = stats.get('GPU Time').getAverageTime();
        metrics.cpuTimePerFrame = stats.get('CPU Time').getAverageTime();
        const memoryStats = luma.stats.get('GPU Time and Memory');
        metrics.bufferMemory = memoryStats.get('Buffer Memory').count;
        metrics.textureMemory = memoryStats.get('Texture Memory').count;
        metrics.renderbufferMemory = memoryStats.get('Renderbuffer Memory').count;
        metrics.gpuMemory = memoryStats.get('GPU Memory').count;
    }
}
Deck.defaultProps = defaultProps;
// This is used to defeat tree shaking of init.js
// https://github.com/visgl/deck.gl/issues/3213
Deck.VERSION = VERSION;
export default Deck;
//# sourceMappingURL=deck.js.map
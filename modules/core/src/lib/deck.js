// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import LayerManager from './layer-manager';
import ViewManager from './view-manager';
import MapView from '../views/map-view';
import EffectManager from './effect-manager';
import Effect from './effect';
import DeckRenderer from './deck-renderer';
import DeckPicker from './deck-picker';
import Tooltip from './tooltip';
import log from '../utils/log';
import {deepEqual} from '../utils/deep-equal';
import deckGlobal from './init';

import {getBrowser} from 'probe.gl/env';
import GL from '@luma.gl/constants';
import {
  AnimationLoop,
  createGLContext,
  instrumentGLContext,
  setParameters,
  Timeline,
  lumaStats
} from '@luma.gl/core';
import {Stats} from 'probe.gl';
import {EventManager} from 'mjolnir.js';

import assert from '../utils/assert';
import {EVENTS} from './constants';
/* global document */

function noop() {}

const getCursor = ({isDragging}) => (isDragging ? 'grabbing' : 'grab');

function getPropTypes(PropTypes) {
  // Note: Arrays (layers, views, ) can contain falsy values
  return {
    id: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    // layer/view/controller settings
    layers: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    layerFilter: PropTypes.func,
    views: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    viewState: PropTypes.object,
    effects: PropTypes.arrayOf(PropTypes.instanceOf(Effect)),
    controller: PropTypes.oneOfType([PropTypes.func, PropTypes.bool, PropTypes.object]),

    // GL settings
    gl: PropTypes.object,
    glOptions: PropTypes.object,
    parameters: PropTypes.object,
    pickingRadius: PropTypes.number,
    useDevicePixels: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    touchAction: PropTypes.string,

    // Callbacks
    onWebGLInitialized: PropTypes.func,
    onResize: PropTypes.func,
    onViewStateChange: PropTypes.func,
    onBeforeRender: PropTypes.func,
    onAfterRender: PropTypes.func,
    onLoad: PropTypes.func,
    onError: PropTypes.func,

    // Debug settings
    debug: PropTypes.bool,
    drawPickingColors: PropTypes.bool,

    // Experimental props
    _framebuffer: PropTypes.object,
    // Forces a redraw every animation frame
    _animate: PropTypes.bool
  };
}

const defaultProps = {
  id: 'deckgl-overlay',
  width: '100%',
  height: '100%',

  pickingRadius: 0,
  layerFilter: null,
  glOptions: {},
  gl: null,
  layers: [],
  effects: [],
  views: null,
  controller: null, // Rely on external controller, e.g. react-map-gl
  useDevicePixels: true,
  touchAction: 'none',
  _framebuffer: null,
  _animate: false,

  onWebGLInitialized: noop,
  onResize: noop,
  onViewStateChange: noop,
  onBeforeRender: noop,
  onAfterRender: noop,
  onLoad: noop,
  onError: null,
  _onMetrics: null,

  getCursor,

  debug: false,
  drawPickingColors: false
};

/* eslint-disable max-statements */
export default class Deck {
  constructor(props) {
    props = Object.assign({}, defaultProps, props);
    this.props = {};

    this.width = 0; // "read-only", auto-updated from canvas
    this.height = 0; // "read-only", auto-updated from canvas

    // Maps view descriptors to vieports, rebuilds when width/height/viewState/views change
    this.viewManager = null;
    this.layerManager = null;
    this.effectManager = null;
    this.deckRenderer = null;
    this.deckPicker = null;

    this._needsRedraw = true;
    this._pickRequest = {};
    // Pick and store the object under the pointer on `pointerdown`.
    // This object is reused for subsequent `onClick` and `onDrag*` callbacks.
    this._lastPointerDownInfo = null;

    this.viewState = null; // Internal view state if no callback is supplied
    this.interactiveState = {
      isDragging: false // Whether the cursor is down
    };

    // Bind methods
    this._onEvent = this._onEvent.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._pickAndCallback = this._pickAndCallback.bind(this);
    this._onRendererInitialized = this._onRendererInitialized.bind(this);
    this._onRenderFrame = this._onRenderFrame.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);
    this._onInteractiveStateChange = this._onInteractiveStateChange.bind(this);

    if (props.viewState && props.initialViewState) {
      log.warn(
        'View state tracking is disabled. Use either `initialViewState` for auto update or `viewState` for manual update.'
      )();
    }
    if (getBrowser() === 'IE') {
      log.warn('IE 11 support will be deprecated in v8.0')();
    }

    if (!props.gl) {
      // Note: LayerManager creation deferred until gl context available
      if (typeof document !== 'undefined') {
        this.canvas = this._createCanvas(props);
      }
    }
    this.animationLoop = this._createAnimationLoop(props);

    this.stats = new Stats({id: 'deck.gl'});
    this.metrics = {
      fps: 0,
      setPropsTime: 0,
      updateAttributesTime: 0,
      framesRedrawn: 0,
      pickTime: 0,
      pickCount: 0,
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

    this.setProps(props);

    this.animationLoop.start();
  }

  finalize() {
    this.animationLoop.stop();
    this.animationLoop = null;
    this._lastPointerDownInfo = null;

    if (this.layerManager) {
      this.layerManager.finalize();
      this.layerManager = null;

      this.viewManager.finalize();
      this.viewManager = null;

      this.effectManager.finalize();
      this.effectManager = null;

      this.deckRenderer.finalize();
      this.deckRenderer = null;

      this.deckPicker.finalize();
      this.deckPicker = null;

      this.eventManager.destroy();
      this.eventManager = null;

      this.tooltip.remove();
      this.tooltip = null;
    }

    if (!this.props.canvas && !this.props.gl && this.canvas) {
      // remove internally created canvas
      this.canvas.parentElement.removeChild(this.canvas);
      this.canvas = null;
    }
  }

  setProps(props) {
    this.stats.get('setProps Time').timeStart();

    if ('onLayerHover' in props) {
      log.removed('onLayerHover', 'onHover')();
    }
    if ('onLayerClick' in props) {
      log.removed('onLayerClick', 'onClick')();
    }
    if (props.initialViewState && !deepEqual(this.props.initialViewState, props.initialViewState)) {
      // Overwrite internal view state
      this.viewState = props.initialViewState;
    }

    // Merge with existing props
    Object.assign(this.props, props);

    // Update CSS size of canvas
    this._setCanvasSize(this.props);

    // We need to overwrite CSS style width and height with actual, numeric values
    const resolvedProps = Object.create(this.props);
    Object.assign(resolvedProps, {
      views: this._getViews(),
      width: this.width,
      height: this.height,
      viewState: this._getViewState()
    });

    // Update the animation loop
    this.animationLoop.setProps(resolvedProps);

    // If initialized, update sub manager props
    if (this.layerManager) {
      this.viewManager.setProps(resolvedProps);
      // Make sure that any new layer gets initialized with the current viewport
      this.layerManager.activateViewport(this.getViewports()[0]);
      this.layerManager.setProps(resolvedProps);
      this.effectManager.setProps(resolvedProps);
      this.deckRenderer.setProps(resolvedProps);
      this.deckPicker.setProps(resolvedProps);
    }

    this.stats.get('setProps Time').timeEnd();
  }

  // Public API
  // Check if a redraw is needed
  // Returns `false` or a string summarizing the redraw reason
  // opts.clearRedrawFlags (Boolean) - clear the redraw flag. Default `true`
  needsRedraw(opts = {clearRedrawFlags: false}) {
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

  redraw(force) {
    if (!this.layerManager) {
      // Not yet initialized
      return;
    }
    // If force is falsy, check if we need to redraw
    const redrawReason = force || this.needsRedraw({clearRedrawFlags: true});

    if (!redrawReason) {
      return;
    }

    this.stats.get('Redraw Count').incrementCount();
    if (this.props._customRender) {
      this.props._customRender(redrawReason);
    } else {
      this._drawLayers(redrawReason);
    }
  }

  getViews() {
    return this.viewManager.views;
  }

  // Get a set of viewports for a given width and height
  getViewports(rect) {
    return this.viewManager.getViewports(rect);
  }

  /* {x, y, radius = 0, layerIds = null, unproject3D} */
  pickObject(opts) {
    const infos = this._pick('pickObject', 'pickObject Time', opts).result;
    return infos.length ? infos[0] : null;
  }

  /* {x, y, radius = 0, layerIds = null, unproject3D, depth = 10} */
  pickMultipleObjects(opts) {
    opts.depth = opts.depth || 10;
    return this._pick('pickObject', 'pickMultipleObjects Time', opts).result;
  }

  /* {x, y, width = 1, height = 1, layerIds = null} */
  pickObjects(opts) {
    return this._pick('pickObjects', 'pickObjects Time', opts);
  }

  // Experimental

  _addResources(resources, forceUpdate = false) {
    for (const id in resources) {
      this.layerManager.resourceManager.add({resourceId: id, data: resources[id], forceUpdate});
    }
  }

  _removeResources(resourceIds) {
    for (const id of resourceIds) {
      this.layerManager.resourceManager.remove(id);
    }
  }

  // Private Methods

  _pick(method, statKey, opts) {
    const {stats} = this;

    stats.get('Pick Count').incrementCount();
    stats.get(statKey).timeStart();

    const infos = this.deckPicker[method](
      Object.assign(
        {
          layers: this.layerManager.getLayers(opts),
          viewports: this.getViewports(opts),
          onViewportActive: this.layerManager.activateViewport
        },
        opts
      )
    );

    stats.get(statKey).timeEnd();

    return infos;
  }

  // canvas, either string, canvas or `null`
  _createCanvas(props) {
    let canvas = props.canvas;

    // TODO EventManager should accept element id
    if (typeof canvas === 'string') {
      canvas = document.getElementById(canvas);
      assert(canvas);
    }

    if (!canvas) {
      canvas = document.createElement('canvas');
      const parent = props.parent || document.body;
      parent.appendChild(canvas);
    }

    const {id, style} = props;
    canvas.id = id;
    Object.assign(canvas.style, style);

    return canvas;
  }

  // Updates canvas width and/or height, if provided as props
  _setCanvasSize(props) {
    if (!this.canvas) {
      return;
    }

    let {width, height} = props;
    // Set size ONLY if props are being provided, otherwise let canvas be layouted freely
    if (width || width === 0) {
      width = Number.isFinite(width) ? `${width}px` : width;
      this.canvas.style.width = width;
    }
    if (height || height === 0) {
      height = Number.isFinite(height) ? `${height}px` : height;
      // Note: position==='absolute' required for height 100% to work
      this.canvas.style.position = 'absolute';
      this.canvas.style.height = height;
    }
  }

  // If canvas size has changed, updates
  _updateCanvasSize() {
    if (this._checkForCanvasSizeChange()) {
      const {width, height} = this;
      this.viewManager.setProps({width, height});
      this.props.onResize({width: this.width, height: this.height});
    }
  }

  // If canvas size has changed, reads out the new size and returns true
  _checkForCanvasSizeChange() {
    const {canvas} = this;
    if (!canvas) {
      return false;
    }
    // Fallback to width/height when clientWidth/clientHeight are 0 or undefined.
    const newWidth = canvas.clientWidth || canvas.width;
    const newHeight = canvas.clientHeight || canvas.height;
    if (newWidth !== this.width || newHeight !== this.height) {
      this.width = newWidth;
      this.height = newHeight;
      return true;
    }
    return false;
  }

  _createAnimationLoop(props) {
    const {width, height, gl, glOptions, debug, useDevicePixels, autoResizeDrawingBuffer} = props;

    return new AnimationLoop({
      width,
      height,
      useDevicePixels,
      autoResizeDrawingBuffer,
      autoResizeViewport: false,
      gl,
      onCreateContext: opts =>
        createGLContext(Object.assign({}, glOptions, opts, {canvas: this.canvas, debug})),
      onInitialize: this._onRendererInitialized,
      onRender: this._onRenderFrame,
      onBeforeRender: props.onBeforeRender,
      onAfterRender: props.onAfterRender
    });
  }

  // Get the most relevant view state: props.viewState, if supplied, shadows internal viewState
  // TODO: For backwards compatibility ensure numeric width and height is added to the viewState
  _getViewState() {
    return this.props.viewState || this.viewState;
  }

  // Get the view descriptor list
  _getViews() {
    // Default to a full screen map view port
    let views = this.props.views || [new MapView({id: 'default-view'})];
    views = Array.isArray(views) ? views : [views];
    if (views.length && this.props.controller) {
      // Backward compatibility: support controller prop
      views[0].props.controller = this.props.controller;
    }
    return views;
  }

  // The `pointermove` event may fire multiple times in between two animation frames,
  // it's a waste of time to run picking without rerender. Instead we save the last pick
  // request and only do it once on the next animation frame.
  _onPointerMove(event) {
    const {_pickRequest} = this;
    if (event.type === 'pointerleave') {
      _pickRequest.x = -1;
      _pickRequest.y = -1;
      _pickRequest.radius = 0;
    } else if (event.leftButton || event.rightButton) {
      // Do not trigger onHover callbacks if mouse button is down.
      return;
    } else {
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
      this.layerManager.context.mousePosition = {x: _pickRequest.x, y: _pickRequest.y};
    }

    _pickRequest.event = event;
    _pickRequest.mode = 'hover';
  }

  // Actually run picking
  _pickAndCallback() {
    const {_pickRequest} = this;

    if (_pickRequest.event) {
      // Perform picking
      const {result, emptyInfo} = this._pick('pickObject', 'pickObject Time', _pickRequest);

      // There are 4 possible scenarios:
      // result is [outInfo, pickedInfo] (moved from one pickable layer to another)
      // result is [outInfo] (moved outside of a pickable layer)
      // result is [pickedInfo] (moved into or over a pickable layer)
      // result is [] (nothing is or was picked)
      //
      // `layer.props.onHover` should be called on all affected layers (out/over)
      // `deck.props.onHover` should be called with the picked info if any, or empty info otherwise
      // `deck.props.getTooltip` should be called with the picked info if any, or empty info otherwise

      // Execute callbacks
      let pickedInfo = emptyInfo;
      let handled = false;
      for (const info of result) {
        pickedInfo = info;
        handled = info.layer.onHover(info, _pickRequest.event);
      }
      if (!handled && this.props.onHover) {
        this.props.onHover(pickedInfo, _pickRequest.event);
      }

      // Update tooltip
      if (this.props.getTooltip) {
        const displayInfo = this.props.getTooltip(pickedInfo);
        this.tooltip.setTooltip(displayInfo, pickedInfo.x, pickedInfo.y);
      }

      // Clear pending pickRequest
      _pickRequest.event = null;
    }
  }

  _updateCursor() {
    const container = this.props.parent || this.canvas;
    if (container) {
      container.style.cursor = this.props.getCursor(this.interactiveState);
    }
  }

  _setGLContext(gl) {
    if (this.layerManager) {
      return;
    }

    // if external context...
    if (!this.canvas) {
      this.canvas = gl.canvas;
      instrumentGLContext(gl, {enable: true, copyState: true});
    }

    this.tooltip = new Tooltip(this.canvas);

    setParameters(gl, {
      blend: true,
      blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA],
      polygonOffsetFill: true,
      depthTest: true,
      depthFunc: GL.LEQUAL
    });

    this.props.onWebGLInitialized(gl);

    // timeline for transitions
    const timeline = new Timeline();
    timeline.play();
    this.animationLoop.attachTimeline(timeline);

    this.eventManager = new EventManager(this.props.parent || gl.canvas, {
      touchAction: this.props.touchAction,
      events: {
        pointerdown: this._onPointerDown,
        pointermove: this._onPointerMove,
        pointerleave: this._onPointerMove
      }
    });
    for (const eventType in EVENTS) {
      this.eventManager.on(eventType, this._onEvent);
    }

    this.viewManager = new ViewManager({
      timeline,
      eventManager: this.eventManager,
      onViewStateChange: this._onViewStateChange,
      onInteractiveStateChange: this._onInteractiveStateChange,
      views: this._getViews(),
      viewState: this._getViewState(),
      width: this.width,
      height: this.height
    });

    // viewManager must be initialized before layerManager
    // layerManager depends on viewport created by viewManager.
    const viewport = this.viewManager.getViewports()[0];

    // Note: avoid React setState due GL animation loop / setState timing issue
    this.layerManager = new LayerManager(gl, {
      deck: this,
      stats: this.stats,
      viewport,
      timeline
    });

    this.effectManager = new EffectManager();

    this.deckRenderer = new DeckRenderer(gl);

    this.deckPicker = new DeckPicker(gl);

    this.setProps(this.props);

    this._updateCanvasSize();
    this.props.onLoad();
  }

  _drawLayers(redrawReason, renderOptions) {
    const {gl} = this.layerManager.context;

    setParameters(gl, this.props.parameters);

    this.props.onBeforeRender({gl});

    this.deckRenderer.renderLayers(
      Object.assign(
        {
          target: this.props._framebuffer,
          layers: this.layerManager.getLayers(),
          viewports: this.viewManager.getViewports(),
          onViewportActive: this.layerManager.activateViewport,
          views: this.viewManager.getViews(),
          pass: 'screen',
          redrawReason,
          effects: this.effectManager.getEffects()
        },
        renderOptions
      )
    );

    this.props.onAfterRender({gl});
  }

  // Callbacks

  _onRendererInitialized({gl}) {
    this._setGLContext(gl);
  }

  _onRenderFrame(animationProps) {
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

    this._updateCanvasSize();

    this._updateCursor();

    // Update layers if needed (e.g. some async prop has loaded)
    // Note: This can trigger a redraw
    this.layerManager.updateLayers();

    // Perform picking request if any
    this._pickAndCallback();

    // Redraw if necessary
    this.redraw(false);

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
      this.viewState = {...this.viewState, [params.viewId]: viewState};
      if (!this.props.viewState) {
        // Apply internal view state
        this.viewManager.setProps({viewState: this.viewState});
      }
    }
  }

  _onInteractiveStateChange({isDragging = false}) {
    if (isDragging !== this.interactiveState.isDragging) {
      this.interactiveState.isDragging = isDragging;
    }
  }

  _onEvent(event) {
    const eventOptions = EVENTS[event.type];
    const pos = event.offsetCenter;

    if (!eventOptions || !pos) {
      return;
    }

    // Reuse last picked object
    const layers = this.layerManager.getLayers();
    const info = this.deckPicker.getLastPickedObject(
      {
        x: pos.x,
        y: pos.y,
        layers,
        viewports: this.getViewports(pos)
      },
      this._lastPointerDownInfo
    );

    const {layer} = info;
    const layerHandler =
      layer && (layer[eventOptions.handler] || layer.props[eventOptions.handler]);
    const rootHandler = this.props[eventOptions.handler];
    let handled = false;

    if (layerHandler) {
      handled = layerHandler.call(layer, info, event);
    }
    if (!handled && rootHandler) {
      rootHandler(info, event);
    }
  }

  _onPointerDown(event) {
    const pos = event.offsetCenter;
    this._lastPointerDownInfo = this.pickObject({
      x: pos.x,
      y: pos.y,
      radius: this.props.pickingRadius
    });
  }

  _getFrameStats() {
    const {stats} = this;
    stats.get('frameRate').timeEnd();
    stats.get('frameRate').timeStart();

    // Get individual stats from luma.gl so reset works
    const animationLoopStats = this.animationLoop.stats;
    stats.get('GPU Time').addTime(animationLoopStats.get('GPU Time').lastTiming);
    stats.get('CPU Time').addTime(animationLoopStats.get('CPU Time').lastTiming);
  }

  _getMetrics() {
    const {metrics, stats} = this;
    metrics.fps = stats.get('frameRate').getHz();
    metrics.setPropsTime = stats.get('setProps Time').time;
    metrics.updateAttributesTime = stats.get('Update Attributes').time;
    metrics.framesRedrawn = stats.get('Redraw Count').count;
    metrics.pickTime =
      stats.get('pickObject Time').time +
      stats.get('pickMultipleObjects Time').time +
      stats.get('pickObjects Time').time;
    metrics.pickCount = stats.get('Pick Count').count;

    // Luma stats
    metrics.gpuTime = stats.get('GPU Time').time;
    metrics.cpuTime = stats.get('CPU Time').time;
    metrics.gpuTimePerFrame = stats.get('GPU Time').getAverageTime();
    metrics.cpuTimePerFrame = stats.get('CPU Time').getAverageTime();

    const memoryStats = lumaStats.get('Memory Usage');
    metrics.bufferMemory = memoryStats.get('Buffer Memory').count;
    metrics.textureMemory = memoryStats.get('Texture Memory').count;
    metrics.renderbufferMemory = memoryStats.get('Renderbuffer Memory').count;
    metrics.gpuMemory = memoryStats.get('GPU Memory').count;
  }
}

Deck.getPropTypes = getPropTypes;
Deck.defaultProps = defaultProps;

// This is used to defeat tree shaking of init.js
// https://github.com/visgl/deck.gl/issues/3213
Deck.VERSION = deckGlobal.VERSION;

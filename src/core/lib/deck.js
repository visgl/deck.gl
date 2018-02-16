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

import LayerManager from '../lib/layer-manager';
import EffectManager from '../experimental/lib/effect-manager';
import Effect from '../experimental/lib/effect';
import TransitionManager from '../lib/transition-manager';
import MapController from '../controllers/map-controller';

import {EventManager} from 'mjolnir.js';
import {GL, AnimationLoop, createGLContext, setParameters} from 'luma.gl';

import PropTypes from 'prop-types';
import assert from 'assert';

const PREFIX = '-webkit-';
const CURSOR = {
  GRABBING: `${PREFIX}grabbing`,
  GRAB: `${PREFIX}grab`,
  POINTER: 'pointer'
};

/* global document */

function noop() {}

const propTypes = {
  id: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  layers: PropTypes.array, // Array can contain falsy values
  views: PropTypes.array, // Array can contain falsy values
  viewState: PropTypes.object,
  effects: PropTypes.arrayOf(PropTypes.instanceOf(Effect)),
  layerFilter: PropTypes.func,
  glOptions: PropTypes.object,
  gl: PropTypes.object,
  pickingRadius: PropTypes.number,
  onWebGLInitialized: PropTypes.func,
  onBeforeRender: PropTypes.func,
  onAfterRender: PropTypes.func,
  onLayerClick: PropTypes.func,
  onLayerHover: PropTypes.func,
  useDevicePixels: PropTypes.bool,

  // Controller props
  controller: PropTypes.func, // A controller class (will be instanced)
  onViewportChange: PropTypes.func, // callback, fires when user interacts with the view

  // Accessor that returns a cursor style to show interactive state
  getCursor: PropTypes.func,

  // Debug props
  debug: PropTypes.bool,
  drawPickingColors: PropTypes.bool
};

const defaultProps = Object.assign({}, TransitionManager.defaultProps, {
  id: 'deckgl-overlay',
  pickingRadius: 0,
  layerFilter: null,
  glOptions: {},
  gl: null,
  layers: [],
  effects: [],
  onWebGLInitialized: noop,
  onBeforeRender: noop,
  onAfterRender: noop,
  onLayerClick: null,
  onLayerHover: null,
  useDevicePixels: true,

  // Controller props
  controller: MapController,
  onViewportChange: null,
  onViewStateChange: null,

  getCursor: ({isDragging}) => (isDragging ? CURSOR.GRABBING : CURSOR.GRAB),

  // Debug props
  debug: false,
  drawPickingColors: false
});

// TODO - should this class be joined with `LayerManager`?
export default class Deck {
  constructor(props) {
    props = Object.assign({}, defaultProps, props);

    this.state = {};
    this.needsRedraw = true;
    this.layerManager = null;
    this.eventManager = null;
    this.effectManager = null;
    this.transitionManager = new TransitionManager(this.props);

    // Bind methods
    this._onRendererInitialized = this._onRendererInitialized.bind(this);
    this._onRenderFrame = this._onRenderFrame.bind(this);

    this.canvas = this._createCanvas(props);
    this.controller = this._createController(props);
    this.animationLoop = this._createAnimationLoop(props);

    this.setProps(props);

    this.animationLoop.start();
  }

  setProps(props) {
    props = Object.assign({}, this.props, props);
    this.props = props;

    // TODO - unify setParameters/setOptions/setProps etc naming.
    this._setLayerManagerProps(props);
    this._setControlProps(props);
    const {useDevicePixels, autoResizeDrawingBuffer} = props;
    this.animationLoop.setViewParameters({useDevicePixels, autoResizeDrawingBuffer});
  }

  finalize() {
    this.animationLoop.stop();
    this.animationLoop = null;

    if (this.layerManager) {
      this.layerManager.finalize();
      this.layerManager = null;
    }
  }

  // Public API

  pickObject({x, y, radius = 0, layerIds = null}) {
    const selectedInfos = this.layerManager.pickObject({x, y, radius, layerIds, mode: 'query'});
    return selectedInfos.length ? selectedInfos[0] : null;
  }

  pickObjects({x, y, width = 1, height = 1, layerIds = null}) {
    return this.layerManager.pickObjects({x, y, width, height, layerIds});
  }

  getViewports() {
    return this.layerManager ? this.layerManager.getViewports() : [];
  }

  // Private Methods

  // canvas, either string, canvas or `null`
  _createCanvas(props) {
    let canvas = props.canvas;

    // TODO EventManager should accept element id
    if (typeof canvas === 'string') {
      /* global document */
      canvas = document.getElementById(canvas);
      assert(canvas);
    }

    if (!canvas) {
      const {id, width, height, style} = props;
      canvas = document.createElement('canvas');
      canvas.id = id;
      canvas.width = width;
      canvas.height = height;
      canvas.style = style;

      const parent = props.parent || document.body;
      parent.appendChild(canvas);
    }

    return canvas;
  }

  _createController(props) {
    this.eventManager = new EventManager(this.canvas);

    // Supports both constructor name and instance
    // If props.controller is not provided, fallback to default MapControls instance
    // Cannot use defaultProps here because it needs to be per map instance
    let controller;
    if (typeof props.controller === 'function') {
      const ControllerClass = props.controller;
      controller = new ControllerClass(props);
    } else {
      controller = props.controller;
    }

    const viewState = this._getViewState(props);
    controller.setOptions(
      Object.assign({}, props, {
        eventManager: this.eventManager,
        onStateChange: this._onInteractiveStateChange.bind(this),
        viewState
      })
    );

    // Add a default event handler in case none was provided by app
    if (!props.onViewStateChange && !props.onViewportChange) {
      controller.setOptions({
        onViewStateChange: this._onViewStateChange.bind(this)
      });
    }

    return controller;
  }

  _createAnimationLoop(props) {
    const {width, height, gl, glOptions, debug, useDevicePixels} = props;

    return new AnimationLoop({
      width,
      height,
      useDevicePixels,
      autoResizeDrawingBuffer: false,
      onCreateContext: opts =>
        gl || createGLContext(Object.assign({}, glOptions, {canvas: this.canvas, debug})),
      onInitialize: this._onRendererInitialized,
      onRender: this._onRenderFrame,
      onBeforeRender: props.onBeforeRender,
      onAfterRender: props.onAfterRender
    });
  }

  _setLayerManagerProps(props) {
    if (!this.layerManager) {
      return;
    }

    const {
      width,
      height,
      views,
      viewState,
      layers,
      pickingRadius,
      onLayerClick,
      onLayerHover,
      useDevicePixels,
      drawPickingColors,
      layerFilter
    } = props;

    // If more parameters need to be updated on layerManager add them to this method.
    this.layerManager.setParameters({
      width,
      height,
      views,
      viewState,
      layers,
      useDevicePixels,
      drawPickingColors,
      layerFilter,
      pickingRadius,
      onLayerClick,
      onLayerHover
    });
  }

  _setControlProps(props) {
    if (this.controller) {
      this.controller.setOptions(props);
    }
  }

  // Helper, needed until we finalize on structure of viewStates
  _getViewState(props) {
    return props.viewState ? props.viewState.props || props.viewState : props;
  }

  // Handles Deck autosizing. Still fragile, use special prop to activate
  _updateSize(gl) {
    if (this.props.updateSize) {
      // Get canvas from debug context (TODO move to luma.gl)
      gl = (gl && gl.state && gl.state.gl) || gl;
      const canvas = gl && gl.canvas;
      // Check if size changed
      if (canvas && (canvas.clientWidth !== this.width || canvas.clientHeight !== this.height)) {
        this.setProps({
          width: canvas.clientWidth,
          height: canvas.clientHeight
        });
      }
    }
  }

  // Callbacks

  _onRendererInitialized({gl, canvas}) {
    setParameters(gl, {
      blend: true,
      blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA],
      polygonOffsetFill: true,
      depthTest: true,
      depthFunc: GL.LEQUAL
    });

    this.props.onWebGLInitialized(gl);

    // Note: avoid React setState due GL animation loop / setState timing issue
    this.layerManager = new LayerManager(gl, {eventManager: this.eventManager});

    this.effectManager = new EffectManager({gl, layerManager: this.layerManager});

    for (const effect of this.props.effects) {
      this.effectManager.addEffect(effect);
    }

    this.setProps(this.props);
  }

  _onRenderFrame({gl}) {
    this._updateSize(gl);

    // Update layers if needed (e.g. some async prop has loaded)
    this.layerManager.updateLayers();

    const redrawReason = this.layerManager.needsRedraw({clearRedrawFlags: true});
    if (!redrawReason) {
      return;
    }

    this.props.onBeforeRender({gl}); // TODO - should be called by AnimationLoop
    this.layerManager.drawLayers({
      pass: 'screen',
      redrawReason,
      // Helps debug layer picking, especially in framebuffer powered layers
      drawPickingColors: this.props.drawPickingColors
    });
    this.props.onAfterRender({gl}); // TODO - should be called by AnimationLoop
  }

  // Track controller state changes and update cursor
  _onInteractiveStateChange({isDragging = false}) {
    if (isDragging !== this.state.isDragging) {
      this.state.isDragging = isDragging;
      this.canvas.style.cursor = this.props.getCursor({isDragging});
    }
  }

  // Default view state handler, makes Deck interactive without callbacks
  _onViewStateChange({viewState}) {
    viewState = viewState.props || viewState;
    this.setProps({viewState});
  }
}

Deck.propTypes = propTypes;
Deck.defaultProps = defaultProps;

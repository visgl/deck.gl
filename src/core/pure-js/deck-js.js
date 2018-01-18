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
import WebMercatorViewport from '../viewports/web-mercator-viewport';
import ViewportControls from '../controllers/viewport-controls';
import TransitionManager from '../lib/transition-manager';

import {EventManager} from 'mjolnir.js';
import {GL, AnimationLoop, createGLContext, setParameters} from 'luma.gl';

import PropTypes from 'prop-types';

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
  layers: PropTypes.array.isRequired, // Array can contain falsy values
  viewports: PropTypes.array, // Array can contain falsy values
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
  controls: PropTypes.object,
  viewportState: PropTypes.func,
  state: PropTypes.object,

  // Viewport props (TODO - should only support these on the react component)
  width: PropTypes.number.isRequired, // The width of the map.
  height: PropTypes.number.isRequired, // The height of the map.
  longitude: PropTypes.number.isRequired, // The longitude of the center of the map.
  latitude: PropTypes.number.isRequired, // The latitude of the center of the map.
  zoom: PropTypes.number.isRequired, // The tile zoom level of the map.
  bearing: PropTypes.number, // Specify the bearing of the viewport
  pitch: PropTypes.number, // Specify the pitch of the viewport
  altitude: PropTypes.number, // Altitude of camera. Default 1.5 "screen heights"
  position: PropTypes.array, // Camera position for FirstPersonViewport

  // Viewport constraints
  maxZoom: PropTypes.number, // Max zoom level
  minZoom: PropTypes.number, // Min zoom level
  maxPitch: PropTypes.number, // Max pitch in degrees
  minPitch: PropTypes.number, // Min pitch in degrees

  onViewportChange: PropTypes.func, // callback, fires when user interacts with the view

  // Viewport transition
  transitionDuration: PropTypes.number, // transition duration for viewport change
  transitionInterpolator: PropTypes.object, // ViewportTransitionInterpolator for custom transitions
  transitionInterruption: PropTypes.number, // type of interruption of current transition on update
  transitionEasing: PropTypes.func, // easing function
  onTransitionStart: PropTypes.func, // transition status update functions
  onTransitionInterrupt: PropTypes.func,
  onTransitionEnd: PropTypes.func,

  // Enables control event handling
  scrollZoom: PropTypes.bool, // Scroll to zoom
  dragPan: PropTypes.bool, // Drag to pan
  dragRotate: PropTypes.bool, // Drag to rotate
  doubleClickZoom: PropTypes.bool, // Double click to zoom
  touchZoomRotate: PropTypes.bool, // Pinch to zoom / rotate

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
  effects: [],
  onWebGLInitialized: noop,
  onBeforeRender: noop,
  onAfterRender: noop,
  onLayerClick: null,
  onLayerHover: null,
  useDevicePixels: true,

  // Controller props
  onViewportChange: null,

  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchZoomRotate: true,
  getCursor: ({isDragging}) => (isDragging ? CURSOR.GRABBING : CURSOR.GRAB),

  // Debug props
  debug: false,
  drawPickingColors: false
});

// TODO - should this class be joined with `LayerManager`?
export default class DeckGLJS {
  constructor(props) {
    props = Object.assign({}, defaultProps, props);

    this.state = {};
    this.needsRedraw = true;
    this.layerManager = null;
    this.eventManager = null;
    this.effectManager = null;
    this.transitionManager = new TransitionManager(this.props);
    this.viewports = [];

    // Bind methods
    this._onRendererInitialized = this._onRendererInitialized.bind(this);
    this._onRenderFrame = this._onRenderFrame.bind(this);

    this.canvas = this._createCanvas(props);
    this.controls = this._createControls(props);
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
    const {useDevicePixels} = props;
    this.animationLoop.setViewParameters({useDevicePixels});
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

  _createCanvas(props) {
    if (props.canvas) {
      return props.canvas;
    }

    const {id, width, height, style} = props;
    const canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.width = width;
    canvas.height = height;
    canvas.style = style;

    const parent = props.parent || document.body;
    parent.appendChild(canvas);

    return canvas;
  }

  _createControls(props) {
    this.eventManager = new EventManager(this.canvas);

    // If props.controls is not provided, fallback to default MapControls instance
    // Cannot use defaultProps here because it needs to be per map instance
    const controls = props.controls || new ViewportControls(props.viewportState);
    controls.setOptions(
      Object.assign({}, props, {
        onStateChange: this._onInteractiveStateChange.bind(this),
        eventManager: this.eventManager
      })
    );
    return controls;
  }

  _createAnimationLoop(props) {
    const {width, height, gl, glOptions, debug, useDevicePixels} = props;

    return new AnimationLoop({
      width,
      height,
      useDevicePixels,
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
      layers,
      pickingRadius,
      onLayerClick,
      onLayerHover,
      useDevicePixels,
      drawPickingColors,
      layerFilter
    } = props;

    // Update viewports (creating one if not supplied)
    let viewports = props.viewports || props.viewport;
    if (!viewports) {
      const {width, height, latitude, longitude, zoom, pitch, bearing} = props;
      viewports = [
        new WebMercatorViewport({width, height, latitude, longitude, zoom, pitch, bearing})
      ];
    }

    // If more parameters need to be updated on layerManager add them to this method.
    this.layerManager.setParameters({
      layers,
      viewports,
      useDevicePixels,
      drawPickingColors,
      layerFilter,
      pickingRadius,
      onLayerClick,
      onLayerHover
    });
  }

  _setControlProps(props) {
    if (this.controls) {
      this.controls.setOptions(props);
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

  _onInteractiveStateChange({isDragging = false}) {
    if (isDragging !== this.state.isDragging) {
      this.state.isDragging = isDragging;
      this.canvas.style.cursor = this.props.getCursor({isDragging});
    }
  }
}

DeckGLJS.propTypes = propTypes;
DeckGLJS.defaultProps = defaultProps;

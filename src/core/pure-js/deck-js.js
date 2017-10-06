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

import {EventManager} from 'mjolnir.js';
import {GL, AnimationLoop, createGLContext, setParameters} from 'luma.gl';

import PropTypes from 'prop-types';

/* global document */

function noop() {}

const propTypes = {
  id: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  layers: PropTypes.array.isRequired, // Array can contain falsy values
  viewports: PropTypes.array, // Array can contain falsy values
  effects: PropTypes.arrayOf(PropTypes.instanceOf(Effect)),
  glOptions: PropTypes.object,
  gl: PropTypes.object,
  pickingRadius: PropTypes.number,
  initWebGLParameters: PropTypes.bool,
  onWebGLInitialized: PropTypes.func,
  onBeforeRender: PropTypes.func,
  onAfterRender: PropTypes.func,
  onLayerClick: PropTypes.func,
  onLayerHover: PropTypes.func,
  useDevicePixelRatio: PropTypes.bool,

  // Debug settings
  debug: PropTypes.bool,
  drawPickingColors: PropTypes.bool
};

const defaultProps = {
  id: 'deckgl-overlay',
  pickingRadius: 0,
  glOptions: {},
  gl: null,
  effects: [],
  initWebGLParameters: false, // Will be set to true in next major release
  onWebGLInitialized: noop,
  onBeforeRender: noop,
  onAfterRender: noop,
  onLayerClick: null,
  onLayerHover: null,
  useDevicePixelRatio: false,

  debug: false,
  drawPickingColors: false
};

// TODO - should this class be joined with `LayerManager`?
export default class DeckGLJS {

  constructor(props) {
    props = Object.assign({}, defaultProps, props);

    this.state = {};
    this.needsRedraw = true;
    this.layerManager = null;
    this.effectManager = null;
    this.viewports = [];

    // Bind methods
    this._onRendererInitialized = this._onRendererInitialized.bind(this);
    this._onRenderFrame = this._onRenderFrame.bind(this);

    this.canvas = this._createCanvas(props);

    const {width, height, gl, glOptions, debug} = props;

    this.animationLoop = new AnimationLoop({
      width,
      height,
      useDevicePixelRatio: false,
      onCreateContext: opts =>
        gl || createGLContext(Object.assign({}, glOptions, {canvas: this.canvas, debug})),
      onInitialize: this._onRendererInitialized,
      onRender: this._onRenderFrame,
      onBeforeRender: props.onBeforeRender,
      onAfterRender: props.onAfterRender
    });

    this.animationLoop.start();

    this.setProps(props);
  }

  setProps(props) {
    props = Object.assign({}, this.props, props);
    this.props = props;

    if (!this.layerManager) {
      return;
    }

    const {
      pickingRadius,
      onLayerClick,
      onLayerHover,
      useDevicePixelRatio,
      drawPickingColors
    } = props;

    // If more parameters need to be updated on layerManager add them to this method.
    this.layerManager.setParameters({
      useDevicePixelRatio,
      drawPickingColors
    });

    this.layerManager.setEventHandlingParameters({
      pickingRadius,
      onLayerClick,
      onLayerHover
    });

    // Update viewports (creating one if not supplied)
    let viewports = props.viewports || props.viewport;
    if (!viewports) {
      const {width, height, latitude, longitude, zoom, pitch, bearing} = props;
      viewports = [
        new WebMercatorViewport({width, height, latitude, longitude, zoom, pitch, bearing})
      ];
    }
    this.layerManager.setViewports(viewports);

    // TODO - this is a HACK: UpdateLayers needs one viewport prop set each time
    if (props.layers) {
      this.layerManager.updateLayers({newLayers: props.layers});
    }
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

  queryObject({x, y, radius = 0, layerIds = null}) {
    const selectedInfos = this.layerManager.pickObject({x, y, radius, layerIds, mode: 'query'});
    return selectedInfos.length ? selectedInfos[0] : null;
  }

  queryVisibleObjects({x, y, width = 1, height = 1, layerIds = null}) {
    return this.layerManager.pickVisibleObjects({x, y, width, height, layerIds});
  }

  getViewports() {
    return this.layerManager ? this.layerManager.getViewports() : [];
  }

  // Experimental

  // Gets actual viewport from a viewport "descriptor" object: viewport || {viewport: ..., ...}
  _getViewportFromDescriptor(viewportOrDescriptor) {
    return this.layerManager._getViewportFromDescriptor(viewportOrDescriptor);
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

  // Callbacks

  _onRendererInitialized({gl, canvas}) {
    setParameters(gl, {
      blend: true,
      blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA],
      polygonOffsetFill: true
    });

    // TODO - these should be set by default starting from next major release
    if (this.props.initWebGLParameters) {
      setParameters(gl, {
        depthTest: true,
        depthFunc: GL.LEQUAL
      });
    }

    this.props.onWebGLInitialized(gl);

    // Note: avoid React setState due GL animation loop / setState timing issue
    this.layerManager = new LayerManager({gl});
    this.layerManager.initEventHandling(new EventManager(canvas));
    this.effectManager = new EffectManager({gl, layerManager: this.layerManager});

    for (const effect of this.props.effects) {
      this.effectManager.addEffect(effect);
    }

    this.setProps(this.props);
  }

  _onRenderFrame({gl}) {
    const redraw = this.layerManager.needsRedraw({clearRedrawFlags: true});
    if (!redraw) {
      return;
    }

    this.props.onBeforeRender({gl}); // TODO - should be called by AnimationLoop
    this.layerManager.drawLayers({
      pass: 'render to screen',
      // Helps debug layer picking, especially in framebuffer powered layers
      drawPickingColors: this.props.drawPickingColors
    });
    this.props.onAfterRender({gl}); // TODO - should be called by AnimationLoop
  }
}

DeckGLJS.propTypes = propTypes;
DeckGLJS.defaultProps = defaultProps;

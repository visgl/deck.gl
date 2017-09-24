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
import {flatten} from '../lib/utils/flatten';
import WebMercatorViewport from '../viewports/web-mercator-viewport';

import Layer from '../lib/layer';
import Effect from '../experimental/lib/effect';
import Viewport from '../viewports/viewport';

import {EventManager} from 'mjolnir.js';
import {GL, AnimationLoop, createGLContext, setParameters} from 'luma.gl';

import PropTypes from 'prop-types';

/* global document */

function noop() {}

const propTypes = {
  id: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  layers: PropTypes.arrayOf(PropTypes.instanceOf(Layer)).isRequired,
  effects: PropTypes.arrayOf(PropTypes.instanceOf(Effect)),
  glOptions: PropTypes.object,
  gl: PropTypes.object,
  debug: PropTypes.bool,
  pickingRadius: PropTypes.number,
  viewport: PropTypes.instanceOf(Viewport),
  onWebGLInitialized: PropTypes.func,
  onBeforeRender: PropTypes.func,
  onAfterRender: PropTypes.func,
  onLayerClick: PropTypes.func,
  onLayerHover: PropTypes.func,
  useDevicePixelRatio: PropTypes.bool
};

const defaultProps = {
  id: 'deckgl-overlay',
  debug: false,
  pickingRadius: 0,
  glOptions: {},
  gl: null,
  effects: [],
  onWebGLInitialized: noop,
  onBeforeRender: noop,
  onAfterRender: noop,
  onLayerClick: null,
  onLayerHover: null,
  useDevicePixelRatio: false
};

// TODO - should this class be joined with `LayerManager`?
export default class DeckGLJS {

  constructor(props) {
    props = Object.assign({}, defaultProps, props);

    this.state = {};
    this.needsRedraw = true;
    this.layerManager = null;
    this.effectManager = null;

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

    const {
      pickingRadius,
      onLayerClick,
      onLayerHover,
      useDevicePixelRatio
    } = props;

    if (!this.layerManager) {
      return;
    }

    this.layerManager.setEventHandlingParameters({
      pickingRadius,
      onLayerClick,
      onLayerHover
    });

    // If more parameters need to be udpated on layerManager add them to this method.
    this.layerManager.setParameters({
      useDevicePixelRatio
    });

    // TODO - this is a HACK: UpdateLayers need the viewport prop set
    this.viewports = this._getViewports(props);
    this.layerManager.setViewport(this.viewports[0]);

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
    const selectedInfos = this.layerManager.pickLayer({x, y, radius, layerIds, mode: 'query'});
    return selectedInfos.length ? selectedInfos[0] : null;
  }

  queryVisibleObjects({x, y, width = 1, height = 1, layerIds = null}) {
    return this.layerManager.queryLayer({x, y, width, height, layerIds});
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

  // Extracts a list of viewports from the supplied props
  _getViewports(props) {
    const {viewports, viewport} = props;
    if (viewports) {
      return flatten(viewports, {filter: Boolean});
    }
    if (viewport) {
      return [viewport];
    }

    const {width, height, latitude, longitude, zoom, pitch, bearing, altitude} = props;
    return [
      new WebMercatorViewport({width, height, latitude, longitude, zoom, pitch, bearing, altitude})
    ];
  }

  // Gets actual viewport from a viewport "descriptor" object: viewport || {viewport: ..., ...}
  _getViewportFromDescriptor(viewportOrDescriptor) {
    return viewportOrDescriptor.viewport ?
      viewportOrDescriptor.viewport :
      viewportOrDescriptor;
  }

  // Callbacks

  _onRendererInitialized({gl, canvas}) {
    setParameters(gl, {
      blend: true,
      blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA],
      polygonOffsetFill: true
    });

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
    this.props.onBeforeRender({gl}); // TODO - should be called by AnimationLoop
    const {viewports} = this;
    this.layerManager.setViewport(viewports[0]);
    this.layerManager.drawLayers({pass: 'render to screen'});
    this.props.onAfterRender({gl}); // TODO - should be called by AnimationLoop
  }
}

DeckGLJS.propTypes = propTypes;
DeckGLJS.defaultProps = defaultProps;

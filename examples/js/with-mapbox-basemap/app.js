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

/* eslint-disable */
import PropTypes from 'prop-types';
import autobind from './autobind';

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
  onAfterRender: noop,
  onLayerClick: null,
  onLayerHover: null,
  useDevicePixelRatio: true
};

export default class DeckGL {

  constructor(props) {
    props = Object.assign({}, defaultProps, props);

    this.props = props;
    this.state = {};
    this.needsRedraw = true;
    this.layerManager = null;
    this.effectManager = null;
    autobind(this);

    const {width, height, useDevicePixelRatio, gl, glOptions, debug} = this.props;

    const {id, style} = this.props;
    const canvas = props.canvas || document.createElement('canvas');
    canvas.id = id;
    canvas.width = width;
    canvas.height = height;
    canvas.style = style;

    this.canvas = canvas;

    this.animationLoop = new AnimationLoop({
      width,
      height,
      useDevicePixelRatio,
      onCreateContext: (opts) =>
        gl || createGLContext(Object.assign({}, glOptions, {canvas: this.canvas, debug})),
      onInitialize: this._onRendererInitialized,
      onRender: this._onRenderFrame
    });
    this.animationLoop.start();

  }

  updateProps(props) {
    props = Object.assign({}, defaultProps, props);

    const {
      zoom,
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
    const viewports = this._getViewports();
    this.layerManager
      .setViewport(this._getViewportFromDescriptor(viewports[0]), zoom)
      .updateLayers({newLayers: props.layers});
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

  // Extracts a list of viewports from the supplied props
  _getViewports() {
    const {viewports, viewport} = this.props;
    if (viewports) {
      return flatten(viewports, {filter: Boolean});
    }
    if (viewport) {
      return [viewport];
    }

    const {width, height, latitude, longitude, zoom, pitch, bearing, altitude} = this.props;
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

  _onRendererInitialized({gl, canvas}) {
    setParameters(gl, {
      blend: true,
      blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA],
      polygonOffsetFill: true
    });

    const {props} = this;
    props.onWebGLInitialized(gl);

    // Note: avoid React setState due GL animation loop / setState timing issue
    this.layerManager = new LayerManager({gl});
    this.layerManager.initEventHandling(new EventManager(canvas));
    this.effectManager = new EffectManager({gl, layerManager: this.layerManager});

    for (const effect of props.effects) {
      this.effectManager.addEffect(effect);
    }

    this._updateLayers(props);
  }

  _onRenderFrame({gl}) {
    const viewports = this._getViewports();
    this.layerManager.setViewports(viewports);
    this.layerManager.drawLayers({pass: 'render to screen'});
  }
}

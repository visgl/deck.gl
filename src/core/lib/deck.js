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
import log from '../utils/log';

import {EventManager} from 'mjolnir.js';
import {GL, AnimationLoop, createGLContext, setParameters} from 'luma.gl';
import {Stats} from 'probe.gl';

import assert from '../utils/assert';
/* global document */

function noop() {}

function getPropTypes(PropTypes) {
  return {
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

    // Debug settings
    debug: PropTypes.bool,
    drawPickingColors: PropTypes.bool
  };
}

const defaultProps = {
  id: 'deckgl-overlay',
  pickingRadius: 0,
  layerFilter: null,
  glOptions: {},
  gl: null,
  layers: [],
  effects: [],
  views: null,

  onWebGLInitialized: noop,
  onBeforeRender: noop,
  onAfterRender: noop,
  onLayerClick: null,
  onLayerHover: null,
  useDevicePixels: true,

  debug: false,
  drawPickingColors: false
};

export default class Deck {
  constructor(props) {
    props = Object.assign({}, defaultProps, props);

    this.state = {};
    this.needsRedraw = true;
    this.layerManager = null;
    this.effectManager = null;
    this.stats = new Stats({id: 'deck.gl'});

    // Bind methods
    this._onRendererInitialized = this._onRendererInitialized.bind(this);
    this._onRenderFrame = this._onRenderFrame.bind(this);

    this.canvas = this._createCanvas(props);
    this.animationLoop = this._createAnimationLoop(props);

    this.setProps(props);

    this.animationLoop.start();
  }

  setProps(props) {
    this.stats.timeStart('deck.setProps');
    props = Object.assign({}, this.props, props);
    this.props = props;

    this._setLayerManagerProps(props);

    // TODO - unify setParameters/setOptions/setProps etc naming.
    const {useDevicePixels, autoResizeDrawingBuffer} = props;
    this.animationLoop.setViewParameters({useDevicePixels, autoResizeDrawingBuffer});
    this.stats.timeEnd('deck.setProps');
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
    this.stats.timeStart('deck.pickObject');
    const selectedInfos = this.layerManager.pickObject({x, y, radius, layerIds, mode: 'query'});
    this.stats.timeEnd('deck.pickObject');
    return selectedInfos.length ? selectedInfos[0] : null;
  }

  pickObjects({x, y, width = 1, height = 1, layerIds = null}) {
    this.stats.timeStart('deck.pickObjects');
    const infos = this.layerManager.pickObjects({x, y, width, height, layerIds});
    this.stats.timeEnd('deck.pickObjects');
    return infos;
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
      Object.assign(canvas.style, style);

      const parent = props.parent || document.body;
      parent.appendChild(canvas);
    }

    return canvas;
  }

  _createAnimationLoop(props) {
    const {width, height, gl, glOptions, debug, useDevicePixels, autoResizeDrawingBuffer} = props;

    return new AnimationLoop({
      width,
      height,
      useDevicePixels,
      autoResizeDrawingBuffer,
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
    this.layerManager = new LayerManager(gl, {
      eventManager: new EventManager(canvas),
      stats: this.stats
    });

    this.effectManager = new EffectManager({gl, layerManager: this.layerManager});

    for (const effect of this.props.effects) {
      this.effectManager.addEffect(effect);
    }

    this.setProps(this.props);
  }

  _onRenderFrame({gl}) {
    if (this.stats.oneSecondPassed()) {
      const table = this.stats.getStatsTable();
      this.stats.reset();
      log.table(1, table)();
    }

    // Update layers if needed (e.g. some async prop has loaded)
    this.layerManager.updateLayers();

    this.stats.bump('fps');

    const redrawReason = this.layerManager.needsRedraw({clearRedrawFlags: true});
    if (!redrawReason) {
      return;
    }

    this.stats.bump('render-fps');

    if (this.props.onBeforeRender) {
      this.props.onBeforeRender({gl}); // TODO - should be called by AnimationLoop
    }
    this.layerManager.drawLayers({
      pass: 'screen',
      redrawReason,
      // Helps debug layer picking, especially in framebuffer powered layers
      drawPickingColors: this.props.drawPickingColors
    });
    if (this.props.onAfterRender) {
      this.props.onAfterRender({gl}); // TODO - should be called by AnimationLoop
    }
  }
}

Deck.displayName = 'Deck';
Deck.getPropTypes = getPropTypes;
Deck.defaultProps = defaultProps;

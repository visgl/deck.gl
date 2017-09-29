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

import React, {createElement} from 'react';
import PropTypes from 'prop-types';
import autobind from './autobind';
import WebGLRenderer from './webgl-renderer';
import {LayerManager, Layer} from '../lib';
import {EffectManager, Effect} from '../experimental';
import {GL, setParameters} from 'luma.gl';
import {Viewport, WebMercatorViewport} from '../lib/viewports';
import EventManager from '../utils/events/event-manager';

function noop() {}

const propTypes = {
  id: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  layers: PropTypes.arrayOf(PropTypes.instanceOf(Layer)).isRequired,
  effects: PropTypes.arrayOf(PropTypes.instanceOf(Effect)),
  gl: PropTypes.object,
  debug: PropTypes.bool,
  pickingRadius: PropTypes.number,
  viewport: PropTypes.instanceOf(Viewport),
  onWebGLInitialized: PropTypes.func,
  initWebGLParameters: PropTypes.bool,
  onAfterRender: PropTypes.func,
  onLayerClick: PropTypes.func,
  onLayerHover: PropTypes.func
};

const defaultProps = {
  id: 'deckgl-overlay',
  debug: false,
  pickingRadius: 0,
  gl: null,
  effects: [],
  onWebGLInitialized: noop,
  initWebGLParameters: false,
  onAfterRender: noop,
  onLayerClick: null,
  onLayerHover: null
};

export default class DeckGL extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.needsRedraw = true;
    this.layerManager = null;
    this.effectManager = null;
    autobind(this);
  }

  componentWillReceiveProps(nextProps) {
    this._updateLayers(nextProps);
  }

  componentWillUnmount() {
    if (this.layerManager) {
      this.layerManager.finalize();
    }
  }

  /* Public API */
  queryObject({x, y, radius = 0, layerIds = null}) {
    const selectedInfos = this.layerManager.pickLayer({x, y, radius, layerIds, mode: 'query'});
    return selectedInfos.length ? selectedInfos[0] : null;
  }

  queryVisibleObjects({x, y, width = 1, height = 1, layerIds = null}) {
    return this.layerManager.queryLayer({x, y, width, height, layerIds});
  }

  _updateLayers(nextProps) {
    const {
      width,
      height,
      latitude,
      longitude,
      zoom,
      pitch,
      bearing,
      altitude,
      pickingRadius,
      onLayerClick,
      onLayerHover
    } = nextProps;

    this.layerManager.setEventHandlingParameters({
      pickingRadius,
      onLayerClick,
      onLayerHover
    });

    // If Viewport is not supplied, create one from mercator props
    let {viewport} = nextProps;
    viewport = viewport || new WebMercatorViewport({
      width, height, latitude, longitude, zoom, pitch, bearing, altitude
    });

    if (this.layerManager) {
      this.layerManager
        .setViewport(viewport)
        .updateLayers({newLayers: nextProps.layers});
    }
  }

  _onRendererInitialized({gl, canvas}) {
    setParameters(gl, {
      blend: true,
      blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA],
      polygonOffsetFill: true
    });

    // TODO - these will be set by default starting from next major release
    if (this.props.initWebGLParameters) {
      setParameters(gl, {
        depthTest: true,
        depthFunc: GL.LEQUAL
      });
    }

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
    const redraw = this.layerManager.needsRedraw({clearRedrawFlags: true});
    if (!redraw) {
      return;
    }

    // clear depth and color buffers
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    this.effectManager.preDraw();
    this.layerManager.drawLayers({pass: 'to screen'});
    this.effectManager.draw();
  }

  render() {
    const {width, height, gl, debug} = this.props;

    return createElement(WebGLRenderer, Object.assign({}, this.props, {
      width,
      height,
      // NOTE: Add 'useDevicePixelRatio' to 'this.props' and also pass it down to
      // to modules where window.devicePixelRatio is used.
      useDevicePixelRatio: true,
      gl,
      debug,
      onRendererInitialized: this._onRendererInitialized,
      onNeedRedraw: this._onNeedRedraw,
      onRenderFrame: this._onRenderFrame
    }));
  }
}

DeckGL.propTypes = propTypes;
DeckGL.defaultProps = defaultProps;

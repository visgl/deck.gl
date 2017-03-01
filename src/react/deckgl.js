// Copyright (c) 2015 Uber Technologies, Inc.
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
import React, {PropTypes, createElement} from 'react';
import autobind from './autobind';
import WebGLRenderer from './webgl-renderer';
import {LayerManager, Layer} from '../lib';
import {EffectManager, Effect} from '../experimental';
import {GL, addEvents} from 'luma.gl';
// import {Viewport, WebMercatorViewport} from 'viewport-mercator-project';
import {Viewport, WebMercatorViewport} from '../lib/viewports';
import {log} from '../lib/utils';

function noop() {}

const propTypes = {
  id: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  layers: PropTypes.arrayOf(PropTypes.instanceOf(Layer)).isRequired,
  effects: PropTypes.arrayOf(PropTypes.instanceOf(Effect)),
  gl: PropTypes.object,
  debug: PropTypes.bool,
  viewport: PropTypes.instanceOf(Viewport),
  onWebGLInitialized: PropTypes.func,
  onLayerClick: PropTypes.func,
  onLayerHover: PropTypes.func,
  onAfterRender: PropTypes.func
};

const defaultProps = {
  id: 'deckgl-overlay',
  debug: false,
  gl: null,
  effects: [],
  onWebGLInitialized: noop,
  onLayerClick: noop,
  onLayerHover: noop,
  onAfterRender: noop
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

  _updateLayers(nextProps) {
    const {width, height, latitude, longitude, zoom, pitch, bearing, altitude} = nextProps;
    let {viewport} = nextProps;

    // If Viewport is not supplied, create one from mercator props
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
    gl.enable(GL.BLEND);
    gl.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

    this.props.onWebGLInitialized(gl);

    // Note: avoid React setState due GL animation loop / setState timing issue
    this.layerManager = new LayerManager({gl});
    this.effectManager = new EffectManager({gl, layerManager: this.layerManager});
    for (const effect of this.props.effects) {
      this.effectManager.addEffect(effect);
    }
    this._updateLayers(this.props);

    // Check if a mouse event has been specified and that at least one of the layers is pickable
    const hasEvent = this.props.onLayerClick !== noop || this.props.onLayerHover !== noop;
    const hasPickableLayer = this.layerManager.layers.map(l => l.props.pickable).includes(true);
    if (hasEvent && !hasPickableLayer) {
      log.once(
        0,
        'You have supplied a mouse event handler but none of your layers got the `pickable` flag.'
      );
    }

    this.events = addEvents(canvas, {
      cacheSize: false,
      cachePosition: false,
      centerOrigin: false,
      onClick: this._onClick,
      onMouseMove: this._onMouseMove
    });
  }

  // Route events to layers
  _onClick(event) {
    const {x, y} = event;
    const selectedInfos = this.layerManager.pickLayer({x, y, mode: 'click'});
    if (selectedInfos.length) {
      const firstInfo = selectedInfos.find(info => info.index >= 0);
      // Event.event holds the original MouseEvent object
      this.props.onLayerClick(firstInfo, selectedInfos, event.event);
    }
  }

  // Route events to layers
  _onMouseMove(event) {
    const {x, y} = event;
    const selectedInfos = this.layerManager.pickLayer({x, y, mode: 'hover'});
    if (selectedInfos.length) {
      const firstInfo = selectedInfos.find(info => info.index >= 0);
      // Event.event holds the original MouseEvent object
      this.props.onLayerHover(firstInfo, selectedInfos, event.event);
    }
  }

  _onRenderFrame({gl}) {
    const redraw = this.layerManager.needsRedraw({clearRedrawFlags: true});
    if (!redraw) {
      return;
    }

    // clear depth and color buffers
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    this.effectManager.preDraw();
    this.layerManager.drawLayers({pass: 'primary'});
    this.effectManager.draw();
  }

  render() {
    const {width, height, gl, debug} = this.props;

    return createElement(WebGLRenderer, Object.assign({}, this.props, {
      width,
      height,
      gl,
      debug,
      viewport: {x: 0, y: 0, width, height},
      onRendererInitialized: this._onRendererInitialized,
      onNeedRedraw: this._onNeedRedraw,
      onRenderFrame: this._onRenderFrame,
      onMouseMove: this._onMouseMove,
      onClick: this._onClick
    }));
  }
}

DeckGL.propTypes = propTypes;
DeckGL.defaultProps = defaultProps;

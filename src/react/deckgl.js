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
import {log} from '../lib/utils';
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
  onAfterRender: PropTypes.func,
  onLayerClick: PropTypes.func,
  onLayerHover: PropTypes.func,
  onLayerDragStart: PropTypes.func,
  onLayerDragMove: PropTypes.func,
  onLayerDragEnd: PropTypes.func,
  onLayerDragCancel: PropTypes.func
};

const defaultProps = {
  id: 'deckgl-overlay',
  debug: false,
  pickingRadius: 0,
  gl: null,
  effects: [],
  onWebGLInitialized: noop,
  onLayerClick: noop,
  onLayerHover: noop,
  onAfterRender: noop,
  onLayerDragStart: noop,
  onLayerDragMove: noop,
  onLayerDragEnd: noop,
  onLayerDragCancel: noop
};

export default class DeckGL extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.needsRedraw = true;
    this.eventManager = null;
    this.layerManager = null;
    this.effectManager = null;
    autobind(this);
  }

  componentWillReceiveProps(nextProps) {
    this._updateLayers(nextProps);
  }

  /* Public API */
  queryObject({x, y, radius = 0, layerIds = null}) {
    const selectedInfos = this.layerManager.pickLayer({x, y, radius, layerIds, mode: 'query'});
    return selectedInfos.length ? selectedInfos[0] : null;
  }

  queryObjects({x, y, width = 1, height = 1, layerIds = null}) {
    return this.layerManager.queryLayer({x, y, width, height, layerIds});
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
    setParameters(gl, {
      blend: true,
      blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA],
      polygonOffsetFill: true
    });

    this.props.onWebGLInitialized(gl);

    // Note: avoid React setState due GL animation loop / setState timing issue
    this.layerManager = new LayerManager({gl});
    this.effectManager = new EffectManager({gl, layerManager: this.layerManager});

    for (const effect of this.props.effects) {
      this.effectManager.addEffect(effect);
    }

    this._updateLayers(this.props);

    // Check if a mouse event has been specified and that at least one of the layers is pickable
    const hasEvent =
      this.props.onLayerClick !== noop ||
      this.props.onLayerHover !== noop ||
      this.props.onLayerDragStart !== noop ||
      this.props.onLayerDragMove !== noop ||
      this.props.onLayerDragEnd !== noop ||
      this.props.onLayerDragCancel !== noop;
    const hasPickableLayer = this.layerManager.layers.map(l => l.props.pickable).includes(true);
    if (this.layerManager.layers.length && hasEvent && !hasPickableLayer) {
      log.once(
        1,
        'You have supplied a mouse event handler but none of your layers set the `pickable` flag.'
      );
    }

    // TODO: add handlers on demand at runtime, not all at once on init
    this.eventManager = new EventManager(canvas, {
      events: {
        click: this._onClick,
        mousemove: this._onMouseMove,
        panstart: this._onDragEvent,
        panmove: this._onDragEvent,
        panend: this._onDragEvent,
        pancancel: this._onDragEvent
      }
    });
  }

  // Route events to layers
  _onClick(event) {
    const pos = event.offsetCenter;
    if (!pos) {
      return;
    }
    const radius = this.props.pickingRadius;
    const selectedInfos = this.layerManager.pickLayer({x: pos.x, y: pos.y, radius, mode: 'click'});
    if (selectedInfos.length) {
      const firstInfo = selectedInfos.find(info => info.index >= 0);
      // Event.event holds the original MouseEvent object
      this.props.onLayerClick(firstInfo, selectedInfos, event.srcEvent);
    }
  }

  // Route events to layers
  _onMouseMove(event) {
    const pos = event.offsetCenter;
    if (!pos || pos.x < 0 || pos.y < 0 || pos.x > this.props.width || pos.y > this.props.height) {
      // Check if pointer is inside the canvas
      return;
    }
    const radius = this.props.pickingRadius;
    const selectedInfos = this.layerManager.pickLayer({x: pos.x, y: pos.y, radius, mode: 'hover'});
    if (selectedInfos.length) {
      const firstInfo = selectedInfos.find(info => info.index >= 0);
      // Event.event holds the original MouseEvent object
      this.props.onLayerHover(firstInfo, selectedInfos, event.srcEvent);
    }
  }

  _onDragEvent(event) {
    const pos = event.offsetCenter;
    if (!pos) {
      return;
    }
    let mode;
    let layerEventHandler;
    switch (event.type) {
    case 'panstart':
      mode = 'dragstart';
      layerEventHandler = this.props.onLayerDragStart;
      break;
    case 'panmove':
      mode = 'dragmove';
      layerEventHandler = this.props.onLayerDragMove;
      break;
    case 'pancancel':
      mode = 'dragcancel';
      layerEventHandler = this.props.onLayerDragCancel;
      break;
    case 'panend':
      mode = 'dragend';
      layerEventHandler = this.props.onLayerDragEnd;
      break;
    default:
      mode = null;
      layerEventHandler = null;
    }

    if (mode) {
      const radius = this.props.pickingRadius;
      const selectedInfos = this.layerManager.pickLayer({x: pos.x, y: pos.y, radius, mode});
      if (selectedInfos.length) {
        const firstInfo = selectedInfos.find(info => info.index >= 0);
        // srcEvent holds the original MouseEvent object
        layerEventHandler(firstInfo, selectedInfos, event.srcEvent);
      }
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
    this.layerManager.drawLayers({pass: 'to screen'});
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

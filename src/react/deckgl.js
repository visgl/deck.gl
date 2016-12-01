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
import React, {PropTypes} from 'react';
import autobind from 'autobind-decorator';
import WebGLRenderer from './webgl-renderer';
import {LayerManager, Layer} from '../lib';
import {EffectManager, Effect} from '../experimental';
import {GL, addEvents} from 'luma.gl';

function noop() {}

export default class DeckGL extends React.Component {

  static propTypes = {
    id: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    layers: PropTypes.arrayOf(PropTypes.instanceOf(Layer)).isRequired,
    effects: PropTypes.arrayOf(PropTypes.instanceOf(Effect)),
    gl: PropTypes.object,
    debug: PropTypes.bool,
    onWebGLInitialized: noop,
    onLayerClick: noop,
    onLayerHover: noop
  };

  static defaultProps = {
    id: 'deckgl-overlay',
    debug: false,
    gl: null,
    effects: [],
    onWebGLInitialized: noop,
    onLayerClick: noop,
    onLayerHover: noop
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.needsRedraw = true;
    this.layerManager = null;
    this.effectManager = null;
  }

  componentWillReceiveProps(nextProps) {
    this._updateLayers(nextProps);
  }

  _updateLayers(nextProps) {
    const {
      width, height, latitude, longitude, zoom, pitch, bearing, altitude
    } = nextProps;

    if (this.layerManager) {
      this.layerManager
        .setContext({
          width, height, latitude, longitude, zoom, pitch, bearing, altitude
        })
        .updateLayers({newLayers: nextProps.layers});
    }
  }

  @autobind _onRendererInitialized({gl, canvas}) {
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

    this.events = addEvents(canvas, {
      cacheSize: false,
      cachePosition: false,
      centerOrigin: false,
      onClick: this._onClick,
      onMouseMove: this._onMouseMove
    });
  }

  // Route events to layers
  @autobind _onClick(event) {
    const {x, y} = event;
    const selectedInfos = this.layerManager.pickLayer({x, y, mode: 'click'});
    const firstInfo = selectedInfos.length > 0 ? selectedInfos[0] : null;
    // Event.event holds the original MouseEvent object
    this.props.onLayerClick(firstInfo, selectedInfos, event.event);
  }

  // Route events to layers
  @autobind _onMouseMove(event) {
    const {x, y} = event;
    const selectedInfos = this.layerManager.pickLayer({x, y, mode: 'hover'});
    const firstInfo = selectedInfos.length > 0 ? selectedInfos[0] : null;
    // Event.event holds the original MouseEvent object
    this.props.onLayerHover(firstInfo, selectedInfos, event.event);
  }

  @autobind _onRenderFrame({gl}) {
    if (!this.layerManager.needsRedraw({clearRedrawFlags: true})) {
      return;
    }
    // clear depth and color buffers
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    this.effectManager.preDraw();

    this.layerManager.drawLayers();

    this.effectManager.draw();

  }

  render() {
    const {width, height, gl, debug, ...otherProps} = this.props;

    return (
      <WebGLRenderer
        {...otherProps}

        width={width}
        height={height}

        gl={gl}
        debug={debug}
        viewport={{x: 0, y: 0, width, height}}

        onRendererInitialized={this._onRendererInitialized}
        onNeedRedraw={this._onNeedRedraw}
        onRenderFrame={this._onRenderFrame}
        onMouseMove={this._onMouseMove}
        onClick={this._onClick}/>
    );
  }
}

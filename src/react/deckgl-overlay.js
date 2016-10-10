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

/* global window */
import React, {PropTypes} from 'react';
import autobind from 'autobind-decorator';

import WebGLRenderer from './webgl-renderer';
import {Group} from 'luma.gl';
// import {pickModels} from 'luma.gl';
import {pickModels} from '../lib/pick-models';
import {DEFAULT_BLENDING} from './config';
import Viewport from '../viewport';
import {updateLayers, drawLayers, layersNeedRedraw, getLayerPickingModels}
  from '../lib';

// TODO - move default to WebGL renderer
const DEFAULT_PIXEL_RATIO =
  typeof window !== 'undefined' ? window.devicePixelRatio : 1;

const PROP_TYPES = {
  id: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  layers: PropTypes.array.isRequired,
  blending: PropTypes.object,
  gl: PropTypes.object,
  debug: PropTypes.bool,
  style: PropTypes.object,
  pixelRatio: PropTypes.number,
  onWebGLInitialized: PropTypes.func
};

const DEFAULT_PROPS = {
  id: 'deckgl-overlay',
  blending: DEFAULT_BLENDING,
  debug: false,
  gl: null,
  pixelRatio: DEFAULT_PIXEL_RATIO,
  style: {},
  onWebGLInitialized: () => {}
};

export default class DeckGLOverlay extends React.Component {

  static get propTypes() {
    return PROP_TYPES;
  }

  static get defaultProps() {
    return DEFAULT_PROPS;
  }

  constructor(props) {
    super(props);
    this.state = {};
    this.needsRedraw = true;
  }

  componentWillReceiveProps(nextProps) {
    const {gl} = this.state;
    updateLayers({
      oldLayers: this.props.layers,
      newLayers: nextProps.layers,
      gl
    });
  }

  @autobind _onRendererInitialized({gl}) {
    this.props.onWebGLInitialized(gl);
    // Note: Triggers React component update, rerending updated layers
    this.setState({gl});
    // Note: throws on error, don't adjust state after this call
    updateLayers({
      oldLayers: [],
      newLayers: this.props.layers,
      gl
    });
  }

  // Route events to layers
  @autobind _onClick(event) {
    const picked = this._pick(event.x, event.y);
    const info = {picked, ...event};
    for (const item of picked) {
      if (item.model.userData.layer.onClick({color: item.color, ...info})) {
        return;
      }
    }
  }

  // Route events to layers
  @autobind _onMouseMove(event) {
    const picked = this._pick(event.x, event.y);
    const info = {picked, ...event};
    for (const item of picked) {
      if (item.model.userData.layer.onHover({color: item.color, ...info})) {
        return;
      }
    }
  }

  @autobind _onNeedRedraw() {
    const {layers} = this.props;
    return layersNeedRedraw(layers, {clearRedrawFlags: true});
  }

  @autobind _onRenderFrame() {
    const {layers} = this.props;
    return drawLayers({layers, uniforms: this._getUniforms()});
  }

  _pick(x, y) {
    const {gl} = this.state;
    const {layers, pixelRatio} = this.props;

    const pickedModels = pickModels(gl, {
      x: x * pixelRatio,
      y: y * pixelRatio,
      group: new Group({children: getLayerPickingModels(layers)}),
      uniforms: this._getUniforms()
    });

    return pickedModels;
  }

  _getUniforms() {
    const {
      width, height, latitude, longitude, zoom, pitch, bearing, altitude
    } = this.props;

    const viewport = new Viewport({
      width, height, latitude, longitude, zoom, pitch, bearing, altitude
    });

    return viewport.getUniforms();
  }

  render() {
    const {
      width, height, blending, pixelRatio, gl, debug, ...otherProps
    } = this.props;

    return (
      <WebGLRenderer
        {...otherProps}

        width={width}
        height={height}

        gl={gl}
        debug={debug}
        viewport={{x: 0, y: 0, width, height}}
        blending={blending}
        pixelRatio={pixelRatio}

        onRendererInitialized={this._onRendererInitialized}
        onNeedRedraw={this._onNeedRedraw}
        onRenderFrame={this._onRenderFrame}
        onMouseMove={this._onMouseMove}
        onClick={this._onClick}/>
    );
  }

}

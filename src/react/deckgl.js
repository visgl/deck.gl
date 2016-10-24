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
import {GL} from 'luma.gl';
import {DEFAULT_BLENDING} from './config';
import {LayerManager} from '../lib';

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

export default class DeckGL extends React.Component {

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
    this._updateLayers(nextProps);
  }

  _updateLayers(nextProps) {
    const {
      width, height, latitude, longitude, zoom, pitch, bearing, altitude
    } = nextProps;
    const {layerManager} = this.state;

    if (layerManager) {
      layerManager
        .updateLayers({newLayers: nextProps.layers})
        .setContext({
          width, height, latitude, longitude, zoom, pitch, bearing, altitude
        });
    }
  }

  @autobind _onRendererInitialized({gl}) {
    this.props.onWebGLInitialized(gl);

    // Note: set state now in case updateLayers throws on error
    // Note: setState triggers React component update, rerending updated layers
    // TODO - is the second comment relevant?
    const layerManager = new LayerManager({gl});
    this.setState({layerManager, gl}, () => {
      this._updateLayers(this.props);
    });
  }

  // Route events to layers
  @autobind _onClick(event) {
    const {x, y} = event;
    const {pixelRatio} = this.props;
    this.state.layerManager.pickLayer({x, y, pixelRatio, type: 'click'});
  }

  // Route events to layers
  @autobind _onMouseMove(event) {
    const {x, y} = event;
    const {pixelRatio} = this.props;
    this.state.layerManager.pickLayer({x, y, pixelRatio, type: 'hover'});
  }

  @autobind _onRenderFrame({gl}) {
    const {layerManager} = this.state;
    // Note: Do this after gl check, in case onNeedRedraw clears flags

    if (!layerManager.needsRedraw({clearRedrawFlags: true})) {
      return;
    }

    // clear depth and color buffers
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    layerManager.drawLayers();
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

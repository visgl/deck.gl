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
import {Scene, Camera, PerspectiveCamera, Mat4} from 'luma.gl';
import {DEFAULT_LIGHTING, DEFAULT_BLENDING, DEFAULT_BACKGROUND_COLOR}
  from './config';
import {updateLayers, layersNeedRedraw} from './layer-manager';
// TODO move this to react-map-gl utility
import Viewport from './viewport';

// TODO - move default to WebGL renderer
const DEFAULT_PIXEL_RATIO =
  typeof window !== 'undefined' ? window.devicePixelRatio : 1;

const PROP_TYPES = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  layers: PropTypes.array.isRequired,
  blending: PropTypes.object,
  gl: PropTypes.object,
  debug: PropTypes.bool,
  camera: PropTypes.instanceOf(Camera),
  pixelRatio: PropTypes.number,
  onWebGLInitialized: PropTypes.func
};

const DEFAULT_PROPS = {
  blending: DEFAULT_BLENDING,
  camera: null,
  pixelRatio: DEFAULT_PIXEL_RATIO,
  gl: null,
  debug: false,
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
    const {gl, scene} = this.state;
    updateLayers({
      oldLayers: this.props.layers,
      newLayers: nextProps.layers,
      gl,
      scene
    });
  }

  @autobind _onRendererInitialized({gl}) {
    this.props.onWebGLInitialized(gl);
    const scene = new Scene(gl, {
      lights: DEFAULT_LIGHTING,
      backgroundColor: DEFAULT_BACKGROUND_COLOR
    });
    // Note: Triggers React component update, rerending updated layers
    this.setState({
      gl,
      scene
    });
    // Note: throws on error, don't adjust state after this call
    updateLayers({
      oldLayers: [],
      newLayers: this.props.layers,
      gl,
      scene
    });
  }

  // Route events to layers
  @autobind _onClick(info) {
    const {picked} = info;
    for (const item of picked) {
      if (item.model.userData.layer.onClick({color: item.color, ...info})) {
        return;
      }
    }
  }

    // Route events to layers
  @autobind _onMouseMove(info) {
    const {picked} = info;
    for (const item of picked) {
      if (item.model.userData.layer.onHover({color: item.color, ...info})) {
        return;
      }
    }
  }

  @autobind _checkIfNeedRedraw() {
    const {layers} = this.props;
    return layersNeedRedraw(layers, {clearRedrawFlags: true});
  }

  render() {
    const {
      width, height, layers, blending, pixelRatio,
      latitude, longitude, zoom, pitch, bearing, altitude,
      gl, debug,
      ...otherProps
    } = this.props;
    let {camera} = this.props;
    const {scene} = this.state;

    function convertToMat4(toMatrix, fromMatrix) {
      for (let i = 0; i < fromMatrix.length; ++i) {
        toMatrix[i] = fromMatrix[i];
      }
    }

    // Create a "disposable" camera and overwrite matrices
    if (!camera) {
      const viewport = new Viewport({
        width, height, latitude, longitude, zoom, pitch, bearing, altitude
      });

      camera = new PerspectiveCamera();
      camera.view = new Mat4().id();
      convertToMat4(camera.projection, viewport.getProjectionMatrix());
    }

    return (
      <WebGLRenderer
        { ...otherProps }

        width={ width }
        height={ height }

        gl={ gl }
        debug={ debug }
        viewport={ {x: 0, y: 0, width, height} }
        camera={ camera }
        scene={ scene }
        blending={ blending }
        pixelRatio={ pixelRatio }

        onRendererInitialized={ this._onRendererInitialized }
        onNeedRedraw={ this._checkIfNeedRedraw }
        onMouseMove={ this._onMouseMove }
        onClick={ this._onClick }/>
    );
  }

}

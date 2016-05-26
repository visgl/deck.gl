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
import {
  matchLayers, finalizeOldLayers, updateMatchedLayers,
  initializeNewLayers, layersNeedRedraw
} from './layer-manager';

const PROP_TYPES = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  layers: PropTypes.array.isRequired,
  blending: PropTypes.object,
  camera: PropTypes.instanceOf(Camera),
  // TODO - replace with actual map view state props, build matrix from those
  projectionMatrix: PropTypes.any,
  pixelRatio: PropTypes.number
};

const DEFAULT_PROPS = {
  blending: DEFAULT_BLENDING,
  camera: null,
  projectionMatrix: null,
  pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1
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
    matchLayers(this.props.layers, nextProps.layers);
    finalizeOldLayers(this.props.layers);
    updateMatchedLayers(nextProps.layers);
    this.initializeLayers(nextProps.layers);
  }

  initializeLayers(layers) {
    const {gl} = this.state;
    if (!gl) {
      return;
    }
    initializeNewLayers(layers, {gl});
    this.addLayersToScene(layers);
  }

  addLayersToScene(layers) {
    const {scene} = this.state;
    if (!scene) {
      return;
    }
    // clear scene and repopulate based on new layers
    scene.removeAll();
    for (const layer of layers) {
      // Save layer on model for picking purposes
      // TODO - store on model.userData rather than directly on model
      layer.state.model.userData.layer = layer;
      // Add model to scene
      scene.add(layer.state.model);
    }
  }

  @autobind
  _onRendererInitialized({gl}) {
    this.setState({
      gl,
      scene: new Scene(gl, {
        lights: DEFAULT_LIGHTING,
        backgroundColor: DEFAULT_BACKGROUND_COLOR
      })
    });
    initializeNewLayers(this.props.layers, {gl});
  }

  // Route events to layers
  @autobind
  _onClick(info) {
    const {picked} = info;
    for (const item of picked) {
      if (item.model.userData.layer.onClick({color: item.color, ...info})) {
        return;
      }
    }
  }

    // Route events to layers
  @autobind
  _onMouseMove(info) {
    const {picked} = info;
    for (const item of picked) {
      if (item.model.userData.layer.onHover({color: item.color, ...info})) {
        return;
      }
    }
  }

  @autobind
  _checkIfNeedRedraw() {
    const {layers} = this.props;
    return layersNeedRedraw(layers, {clearFlag: true});
  }

  render() {
    const {
      width, height, layers, blending, projectionMatrix, pixelRatio, ...otherProps
    } = this.props;
    let {camera} = this.props;
    const {scene} = this.state;

    this.initializeLayers(layers);

    // creating camera from projectionMatrix
    // TODO move this to react-map-gl utility
    // TODO should be able to build matrix from
    // standard mabox props: lat/lon/zoom/pitch/bearing/altitude
    if (!camera) {
      camera = new PerspectiveCamera();
      if (!projectionMatrix) {
        /* eslint-disable no-console */
        /* global console */
        console.warn('DeckGLOverlay needs either camera or projectionMatrix');
        /* eslint-enable no-console */
      } else {
        camera.view = new Mat4().id();
        for (let i = 0; i < projectionMatrix.length; ++i) {
          camera.projection[i] = projectionMatrix[i];
        }
      }
    }

    const viewport = {
      x: 0,
      y: 0,
      width, height
    };

    return (
      <WebGLRenderer
        { ...otherProps }

        width={ width }
        height={ height }

        viewport={ viewport }
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

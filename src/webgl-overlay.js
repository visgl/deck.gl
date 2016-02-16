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
import WebGLRenderer from './webgl-renderer';
import flatWorld from './flat-world';
import where from 'lodash.where';

const PROP_TYPES = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  layers: PropTypes.array.isRequired,
  onAfterRender: PropTypes.func
};

export default class WebGLOverlay extends React.Component {

  static get propTypes() {
    return PROP_TYPES;
  }

  constructor(props) {
    super(props);
    this.state = {};
    this.needsRedraw = true;

    // function bindings
    this._handleObjectHovered = this._handleObjectHovered.bind(this);
    this._handleObjectClicked = this._handleObjectClicked.bind(this);
    this._checkIfNeedRedraw = this._checkIfNeedRedraw.bind(this);
    this._onRendererInitialized = this._onRendererInitialized.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {gl, scene} = this.state;
    if (!scene) {
      return;
    }

    // clear scene and repopulate based on new layers
    scene.removeAll();

    for (const layer of nextProps.layers) {
      // 1. given a new coming layer, find its matching layer
      const matchingLayer = this._findMatchingLayer(layer);
      if (matchingLayer && matchingLayer.state) {
        // 2. copy over state to new layer
        layer.state = matchingLayer.state;
        // 3. update layer
        layer.updateState(matchingLayer.props, layer.props, layer.state);
      } else {
        // New layer, it needs to initialize it's state
        layer.state = {gl};
        layer.initializeState();
        // Create a model for the layer
        layer.createModel({gl});
      }
      // Add model to scene
      scene.add(layer.state.model);
    }
  }

  _findMatchingLayer(layer) {
    const candidates = where(this.props.layers, {id: layer.id});
    if (candidates.length > 1) {
      throw new Error(layer + ' has more than one matching layers');
    }
    return candidates[0];
  }

  _onRendererInitialized({gl, scene}) {
    this.setState({gl, scene});
  }

  _handleObjectHovered(...args) {
    const {layers} = this.props;

    for (let i = layers.length - 1; i >= 0; --i) {
      const layer = layers[i];
      if (layer.onObjectHovered && layer.onObjectHovered(...args)) {
        break;
      }
    }
  }

  _handleObjectClicked(...args) {
    const {layers} = this.props;

    for (let i = layers.length - 1; i >= 0; --i) {
      const layer = layers[i];
      if (layer.onObjectClicked && layer.onObjectClicked(...args)) {
        break;
      }
    }
  }

  _checkIfNeedRedraw() {
    return this.state.needsRedraw;
  }

  render() {
    const {
      width, height, layers, onBeforeRenderFrame, onAfterRenderFrame
    } = this.props;

    if (!Array.isArray(layers) || layers.length === 0) {
      return null;
    }

    return (
      <WebGLRenderer
        width={ width }
        height={ height }

        viewport={ flatWorld.getViewport(width, height) }
        camera={ flatWorld.getCamera() }
        lights={ flatWorld.getLighting() }
        blending={ flatWorld.getBlending() }
        pixelRatio={ flatWorld.getPixelRatio(window.devicePixelRatio) }

        events={ {
          onObjectHovered: this._handleObjectHovered,
          onObjectClicked: this._handleObjectClicked
        } }

        onBeforeRenderFrame={ onBeforeRenderFrame }
        onAfterRenderFrame={ onAfterRenderFrame }
        needRedraw={ this._checkIfNeedRedraw }
        onRendererInitialized={ this._onRendererInitialized }/>
    );
  }

}

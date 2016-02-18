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
import assert from 'assert';

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
    for (const newLayer of nextProps.layers) {
      // 1. given a new coming layer, find its matching layer
      const oldLayer = this._findMatchingLayer(newLayer);
      if (oldLayer) {
        assert(oldLayer.state);
        // 2. update state in old layer
        oldLayer.preUpdateState(newLayer.props);
        oldLayer.updateState(newLayer.props);
        // 3. copy over state to new layer
        newLayer.state = oldLayer.state;
        oldLayer.state = null;
      }
    }

    this.initializeLayers(nextProps.layers);
  }

  initializeLayers(layers) {
    const {gl} = this.state;
    if (!gl) {
      return;
    }
    for (const newLayer of layers) {
      if (!newLayer.state) {
        // New layer, it needs to initialize it's state
        newLayer.state = {gl};
        newLayer.initializeState();
        newLayer.initializeAttributes();
        // Create a model for the layer
        newLayer.createModel({gl});
        // 2. update state in old layer
        newLayer.preUpdateState(newLayer.props);
        newLayer.updateState(newLayer.props);
      }
    }
    this.addLayersToScene(layers);
  }

  addLayersToScene(layers) {
    const {scene} = this.state;
    if (!scene) {
      return;
    }
    // clear scene and repopulate based on new layers
    scene.removeAll();
    for (const newLayer of layers) {
      // Add model to scene
      scene.add(newLayer.state.model);
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

    if (layers.length === 0) {
      return null;
    }

    this.initializeLayers(layers);

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

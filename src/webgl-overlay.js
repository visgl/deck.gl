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
import WebGLRenderer from './webgl-renderer';
import flatWorld from './flat-world';
import where from 'lodash.where';

const DISPLAY_NAME = 'WebGLOverlay';
const PROP_TYPES = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  layers: PropTypes.array.isRequired,
  onAfterRender: PropTypes.func
};

export default class WebGLOverlay extends React.Component {
  static get displayName() {
    return DISPLAY_NAME;
  }

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
    const {renderer} = this.state;
    if (!renderer) {
      return;
    }

    // clear scene and repopulate based on new layers
    renderer.scene.models = [];

    nextProps.layers.forEach(layer => {
      // 1. given a new coming layer, find its matching layer
      const matchingLayer = this._findMatchingLayer(layer);
      // 2. copy over props and state from cache to new layer
      if (matchingLayer.cache) {
        layer.cache = matchingLayer.cache;
      }
      // 3. setup update flags, used to prevent unnecessary calculations
      // TODO non-instanced layer cannot use .data.length for equal check
      layer.dataChanged = matchingLayer.data.length !== layer.data.length;
      layer.viewportChanged =
        matchingLayer.width !== layer.width ||
        matchingLayer.height !== layer.height ||
        matchingLayer.latitude !== layer.latitude ||
        matchingLayer.longitude !== layer.longitude ||
        matchingLayer.zoom !== layer.zoom;
      // 4. update new layer
      layer.updateLayer();
      // 5. add updated model to scene
      renderer.scene.add(layer.getLayerModel(renderer));
      // 6. update redraw flag
      this.needsRedraw = this.needsRedraw ||
        layer.dataChanged || layer.viewportChanged;
    });
  }

  _findMatchingLayer(layer) {
    const candidates = where(this.props.layers, {id: layer.id});
    if (candidates.length !== 1) {
      throw new Error(layer + ' has other than one matching layers');
    }
    return candidates[0];
  }

  _getInitialPrograms() {
    return this.props.layers.map(layer => layer.program);
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
    return this.needsRedraw;
  }

  _onRendererInitialized(renderer) {
    this.props.layers.forEach(layer => {
      layer.updateLayer();
      renderer.scene.add(layer.getLayerModel(renderer));
    });

    this.setState({renderer});
  }

  render() {
    const {
      width, height, layers, onBeforeRenderFrame, onAfterRenderFrame
    } = this.props;

    if (!layers || layers.length === 0) {
      return null;
    }

    const props = {
      width,
      height,

      viewport: flatWorld.getViewport(width, height),
      camera: flatWorld.getCamera(),
      lights: flatWorld.getLighting(),
      blending: flatWorld.getBlending(),
      pixelRatio: flatWorld.getPixelRatio(window.devicePixelRatio),

      events: {
        onObjectHovered: this._handleObjectHovered,
        onObjectClicked: this._handleObjectClicked
      },

      initialShaders: layers.map(layer => layer.getLayerShader()),

      onBeforeRenderFrame,
      onAfterRenderFrame,
      needRedraw: this._checkIfNeedRedraw,
      onRendererInitialized: this._onRendererInitialized
    };

    return <WebGLRenderer {...props} />;
  }

}

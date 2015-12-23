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

import React from 'react';
import PhiloGLOverlay from './philogl-renderer';
import flatWorld from './flat-world';

const displayName = 'WebGLOverlay';

const propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  layers: React.PropTypes.array.isRequired,
  mapState: React.PropTypes.object,
  onAfterRender: React.PropTypes.func
};

export default class WebGLOverlay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this._handleObjectHovered = this._handleObjectHovered.bind(this);
    this._handleObjectClicked = this._handleObjectClicked.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.mapState) {
      return;
    }

    if (nextProps.mapState.latitude !== this.props.latitude ||
        nextProps.mapState.longitude !== this.props.longitude ||
        nextProps.mapState.zoom !== this.props.zoom) {
      this._needUpdate = true;
    }
  }

  _handleObjectHovered(...args) {
    const layers = this.props.layers;

    for (let i = layers.length - 1; i >= 0; --i) {
      const layer = layers[i];
      if (layer.onObjectHovered && layer.onObjectHovered(...args)) {
        break;
      }
    }
  }

  _handleObjectClicked(...args) {
    const layers = this.props.layers;

    for (let i = layers.length - 1; i >= 0; --i) {
      const layer = layers[i];
      if (layer.onObjectClicked && layer.onObjectClicked(...args)) {
        break;
      }
    }
  }

  _updateLayers(deep) {
    return this.props.layers.map(layer => {
      layer.update(deep);

      return layer.getLayerProps();
    });
  }

  render() {
    if (!this.props.layers || this.props.layers.length === 0) {
      return null;
    }

    const globalProps = {
      width: this.props.width,
      height: this.props.height,

      viewport: flatWorld.getViewport(this.props.width, this.props.height),
      camera: flatWorld.getCamera(),
      lights: flatWorld.getLighting(),
      blending: flatWorld.getBlending(),
      pixelRatio: flatWorld.getPixelRatio(),

      events: {
        onObjectHovered: this._handleObjectHovered,
        onObjectClicked: this._handleObjectClicked,
        onAfterRender: this.props.onAfterRender
      }
    };

    const layerSpecificProps = {
      layers: this._updateLayers(this._needUpdate)
    };

    this._needUpdate = false;
    // allow layerSpecificProps to overwrite globalProps
    const props = {...globalProps, ...layerSpecificProps};
    return <PhiloGLOverlay {...props} />;
  }

}

WebGLOverlay.displayName = displayName;
WebGLOverlay.propTypes = propTypes;

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

import GL from '@luma.gl/constants';
import {log} from '@deck.gl/core';
import IconLayer from '../../icon-layer/icon-layer';

import fs from './multi-icon-layer-fragment.glsl';

// TODO expose as layer properties
const DEFAULT_BUFFER = 192.0 / 256;
const EMPTY_ARRAY = [];

const defaultProps = {
  getIconOffsets: {type: 'accessor', value: x => x.offsets},
  alphaCutoff: 0.001,
  smoothing: 0.1,
  outlineWidth: 0,
  outlineColor: {type: 'color', value: [0, 0, 0, 255]}
};

export default class MultiIconLayer extends IconLayer {
  getShaders() {
    return {...super.getShaders(), fs};
  }

  initializeState() {
    super.initializeState();

    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instanceOffsets: {
        size: 2,
        accessor: 'getIconOffsets'
      },
      instancePickingColors: {
        type: GL.UNSIGNED_BYTE,
        size: 3,
        accessor: (object, {index, target: value}) => this.encodePickingColor(index, value)
      }
    });
  }

  updateState(params) {
    super.updateState(params);
    const {props, oldProps} = params;
    let {outlineColor} = props;

    if (outlineColor !== oldProps.outlineColor) {
      outlineColor = outlineColor.map(x => x / 255);
      outlineColor[3] = Number.isFinite(outlineColor[3]) ? outlineColor[3] : 1;

      this.setState({
        outlineColor
      });
    }
    if (!props.sdf && props.outlineWidth) {
      log.warn(`${this.id}: fontSettings.sdf is required to render outline`)();
    }
  }

  draw({uniforms}) {
    const {sdf, smoothing, outlineWidth} = this.props;
    const {outlineColor} = this.state;

    super.draw({
      uniforms: Object.assign({}, uniforms, {
        // Refer the following doc about gamma and buffer
        // https://blog.mapbox.com/drawing-text-with-signed-distance-fields-in-mapbox-gl-b0933af6f817
        buffer: DEFAULT_BUFFER,
        outlineBuffer: outlineWidth ? Math.max(smoothing, DEFAULT_BUFFER * (1 - outlineWidth)) : -1,
        gamma: smoothing,
        sdf: Boolean(sdf),
        outlineColor
      })
    });
  }

  getInstanceOffset(icons) {
    return icons ? Array.from(icons).map(icon => super.getInstanceOffset(icon)) : EMPTY_ARRAY;
  }

  getInstanceColorMode(icons) {
    return 1; // mask
  }

  getInstanceIconFrame(icons) {
    return icons ? Array.from(icons).map(icon => super.getInstanceIconFrame(icon)) : EMPTY_ARRAY;
  }
}

MultiIconLayer.layerName = 'MultiIconLayer';
MultiIconLayer.defaultProps = defaultProps;

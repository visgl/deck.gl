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
import IconLayer from '../../icon-layer/icon-layer';

import fs from './multi-icon-layer-fragment.glsl';

// TODO expose as layer properties
const DEFAULT_GAMMA = 0.2;
const DEFAULT_BUFFER = 192.0 / 256;
const EMPTY_ARRAY = [];

const defaultProps = {
  backgroundColor: {type: 'color', value: null, optional: true},
  getIconOffsets: {type: 'accessor', value: x => x.offsets}
};

export default class MultiIconLayer extends IconLayer {
  getShaders() {
    return Object.assign({}, super.getShaders(), {
      inject: {
        'vs:#decl': `
  uniform float gamma;
  varying float vGamma;
`,
        'vs:#main-end': `
  vGamma = gamma / (sizeScale * iconSize.y);
`
      },
      fs
    });
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

  updateState(updateParams) {
    super.updateState(updateParams);
    const {oldProps, props} = updateParams;

    if (props.backgroundColor !== oldProps.backgroundColor) {
      const backgroundColor = Array.isArray(props.backgroundColor)
        ? props.backgroundColor.map(c => c / 255.0).slice(0, 3)
        : null;
      this.setState({backgroundColor});
    }
  }

  draw({uniforms}) {
    const {sdf} = this.props;
    const {backgroundColor} = this.state;
    const shouldDrawBackground = Array.isArray(backgroundColor);

    super.draw({
      uniforms: Object.assign({}, uniforms, {
        // Refer the following doc about gamma and buffer
        // https://blog.mapbox.com/drawing-text-with-signed-distance-fields-in-mapbox-gl-b0933af6f817
        buffer: DEFAULT_BUFFER,
        gamma: DEFAULT_GAMMA,
        sdf: Boolean(sdf),
        backgroundColor: backgroundColor || [0, 0, 0],
        shouldDrawBackground
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

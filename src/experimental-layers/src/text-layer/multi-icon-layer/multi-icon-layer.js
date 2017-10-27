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

import {IconLayer, experimental} from 'deck.gl';
const {enable64bitSupport} = experimental;

import vs from './multi-icon-layer-vertex.glsl';
import vs64 from './multi-icon-layer-vertex-64.glsl';

const defaultProps = {
  getIndexOfIcon: x => x.index || 0,
  getNumOfIcon: x => x.len || 1,
  // 1: left, 0: middle, -1: right
  getAnchorX: x => x.anchorX || 0,
  // 1: top, 0: center, -1: bottom
  getAnchorY: x => x.anchorY || 0,
  getPixelOffset: x => x.pixelOffset || [0, 0]
};

export default class MultiIconLayer extends IconLayer {
  getShaders() {
    const multiIconVs = enable64bitSupport(this.props) ? vs64 : vs;
    return Object.assign({}, super.getShaders(), {
      vs: multiIconVs
    });
  }

  initializeState() {
    super.initializeState();

    const {attributeManager} = this.state;
    attributeManager.addInstanced({
      instanceIndexOfIcon: {
        size: 1,
        accessor: 'getIndexOfIcon',
        update: this.calculateInstanceIndexOfIcon
      },
      instanceNumOfIcon: {
        size: 1,
        accessor: 'getNumOfIcon',
        update: this.calculateInstanceNumOfIcon
      },
      instancePixelOffset: {
        size: 2,
        accessor: 'getPixelOffset',
        update: this.calculatePixelOffset
      }
    });
  }

  calculateInstanceIndexOfIcon(attribute) {
    const {data, getIndexOfIcon} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      value[i++] = getIndexOfIcon(object);
    }
  }

  calculateInstanceNumOfIcon(attribute) {
    const {data, getNumOfIcon} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      value[i++] = getNumOfIcon(object);
    }
  }

  calculateInstanceOffsets(attribute) {
    const {data, iconMapping, getIcon, getAnchorX, getAnchorY, getNumOfIcon} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      const icon = getIcon(object);
      const rect = iconMapping[icon] || {};
      value[i++] = rect.width / 2 * getAnchorX(object) * getNumOfIcon(object) || 0;
      value[i++] = rect.height / 2 * getAnchorY(object) || 0;
    }
  }

  calculatePixelOffset(attribute) {
    const {data, getPixelOffset} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      const pixelOffset = getPixelOffset(object);
      value[i++] = pixelOffset[0] || 0;
      value[i++] = pixelOffset[1] || 0;
    }
  }
}

MultiIconLayer.layerName = 'MultiIconLayer';
MultiIconLayer.defaultProps = defaultProps;

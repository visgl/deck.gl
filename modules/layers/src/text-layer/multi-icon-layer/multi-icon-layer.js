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

import {createIterable} from '@deck.gl/core';
import IconLayer from '../../icon-layer/icon-layer';

import vs from './multi-icon-layer-vertex.glsl';
import fs from './multi-icon-layer-fragment.glsl';

// TODO expose as layer properties
const DEFAULT_GAMMA = 0.2;
const DEFAULT_BUFFER = 192.0 / 256;

const defaultProps = {
  // each queue can have one or multiple line(s)
  // each line can have one or multiple object(s)
  // length of the line where the given object is
  getLineLength: {type: 'accessor', value: x => x.lineLength || 0},
  // offset from the left, top position of the queue
  getOffsets: {type: 'accessor', value: x => x.shift || 0},
  // length of the queue
  getLengthOfQueue: {type: 'accessor', value: x => x.len || 1},
  // height of the queue
  getHeightOfQueue: {type: 'accessor', value: x => x.height || 1},
  // 1: left, 0: middle, -1: right
  getAnchorX: {type: 'accessor', value: x => x.anchorX || 0},
  // 1: top, 0: center, -1: bottom
  getAnchorY: {type: 'accessor', value: x => x.anchorY || 0},
  getPixelOffset: {type: 'accessor', value: [0, 0]},

  // object with the same pickingIndex will be picked when any one of them is being picked
  getPickingIndex: {type: 'accessor', value: x => x.objectIndex}
};

export default class MultiIconLayer extends IconLayer {
  getShaders() {
    return Object.assign({}, super.getShaders(), {
      vs,
      fs
    });
  }

  initializeState() {
    super.initializeState();

    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instancePixelOffset: {
        size: 2,
        transition: true,
        accessor: 'getPixelOffset'
      }
    });
  }

  updateState(updateParams) {
    super.updateState(updateParams);
    const {changeFlags} = updateParams;

    if (
      changeFlags.updateTriggersChanged &&
      (changeFlags.updateTriggersChanged.getAnchorX || changeFlags.updateTriggersChanged.getAnchorY)
    ) {
      this.getAttributeManager().invalidate('instanceOffsets');
    }
  }

  draw({uniforms}) {
    const {sdf} = this.props;
    super.draw({
      uniforms: Object.assign({}, uniforms, {
        // Refer the following doc about gamma and buffer
        // https://blog.mapbox.com/drawing-text-with-signed-distance-fields-in-mapbox-gl-b0933af6f817
        buffer: DEFAULT_BUFFER,
        gamma: DEFAULT_GAMMA,
        sdf: Boolean(sdf)
      })
    });
  }

  calculateInstanceOffsets(attribute, {startRow, endRow}) {
    const {
      data,
      iconMapping,
      getIcon,
      getAnchorX,
      getAnchorY,
      getLengthOfQueue,
      getHeightOfQueue,
      getLineLength,
      getOffsets
    } = this.props;
    const {value, size} = attribute;
    let i = startRow * size;
    const {iterable} = createIterable(data, startRow, endRow);

    for (const object of iterable) {
      const icon = getIcon(object);
      const rect = iconMapping[icon] || {};
      const len = getLengthOfQueue(object);
      const height = getHeightOfQueue(object);
      const [offsetX, offsetY] = getOffsets(object);
      const anchorX = getAnchorX(object);

      // For a multi-line object, shift in direction needs consider the line shift and the object shift in its line
      const lineOffset = ((1 - anchorX) * (getLengthOfQueue(object) - getLineLength(object))) / 2;

      value[i++] = ((anchorX - 1) * len) / 2 + lineOffset + rect.width / 2 + offsetX || 0;
      value[i++] = ((getAnchorY(object) - 1) * height) / 2 + rect.height / 2 + offsetY || 0;
    }
  }

  calculateInstancePickingColors(attribute, {startRow, endRow}) {
    const {data, getPickingIndex} = this.props;
    const {value, size} = attribute;
    let i = startRow * size;
    const pickingColor = [];
    const {iterable} = createIterable(data, startRow, endRow);

    for (const point of iterable) {
      const index = getPickingIndex(point);
      this.encodePickingColor(index, pickingColor);

      value[i++] = pickingColor[0];
      value[i++] = pickingColor[1];
      value[i++] = pickingColor[2];
    }
  }
}

MultiIconLayer.layerName = 'MultiIconLayer';
MultiIconLayer.defaultProps = defaultProps;

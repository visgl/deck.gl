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

import {CompositeLayer} from '@deck.gl/core';
import {PolygonLayer} from '@deck.gl/layers';

import {getS2Polygon} from './s2-utils';

const defaultStrokeColor = [0x33, 0x33, 0x33, 0xff];
const defaultFillColor = [0xbd, 0xe2, 0x7a, 0xff];

const defaultProps = {
  drawCells: true,
  filled: true,

  extruded: false,
  wireframe: false,

  // Cell geometry
  getS2Token: x => x.token,
  getHeight: x => 0,

  // Cell outline accessors
  getStrokeColor: f => f.strokeColor || defaultStrokeColor,
  getStrokeWidth: f => f.strokeWidth || 1,

  // Cell fill accessors
  getFillColor: f => f.fillColor || defaultFillColor
};

export default class S2Layer extends CompositeLayer {
  renderLayers() {
    const {data, getS2Token, getFillColor, getHeight} = this.props;
    const {extruded, wireframe, filled} = this.props;

    // Filled Polygon Layer
    // TODO - use a composite polygon layer that renders outlines etc
    return new PolygonLayer(
      this.getSubLayerProps({
        id: 'polygon',
        // updateTriggers: Object.assign({}, this.props.updateTriggers, {}),
        data,
        getPolygon: x => getS2Polygon(getS2Token(x)),
        getHeight,
        getFillColor,
        extruded,
        wireframe,
        filled
      })
    );
  }
}

S2Layer.layerName = 'S2Layer';
S2Layer.defaultProps = defaultProps;

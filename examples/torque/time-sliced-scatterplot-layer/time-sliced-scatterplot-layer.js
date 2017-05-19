// Copyright (c) 2015-2017 Uber Technologies, Inc.
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

import {ScatterplotLayer, experimental} from 'deck.gl';

export default class TimeSlicedScatterplotLayer extends ScatterplotLayer {
  isCurrentTime(time) {
    return time === this.props.currentTime;
  }

  calculateInstancePositions(attribute) {
    const {data, getPosition} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      if (this.isCurrentTime(point.time)) {
        const position = getPosition(point);
        value[i++] = experimental.get(position, 0);
        value[i++] = experimental.get(position, 1);
        value[i++] = experimental.get(position, 2) || 0;
      }
    }
  }

  calculateInstancePositions64xyLow(attribute) {
    // const {data, getPosition} = this.props;
    // const {value} = attribute;
    // let i = 0;
    // for (const point of data) {
    //   const position = getPosition(point);
    //   value[i++] = fp64ify(experimental.get(position, 0))[1];
    //   value[i++] = fp64ify(experimental.get(position, 1))[1];
    // }
  }

  calculateInstanceRadius(attribute) {
    const {data, getRadius} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      if (this.isCurrentTime(point.time)) {
        const radius = getRadius(point);
        value[i++] = isNaN(radius) ? 1 : radius;
      }
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      if (this.isCurrentTime(point.time)) {
        const color = getColor(point);
        value[i++] = experimental.get(color, 0);
        value[i++] = experimental.get(color, 1);
        value[i++] = experimental.get(color, 2);
        value[i++] = isNaN(experimental.get(color, 3)) ? 255 : experimental.get(color, 3);
      }
    }
  }
}

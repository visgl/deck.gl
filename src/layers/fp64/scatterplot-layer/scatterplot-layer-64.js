// Copyright (c) 2016 Uber Technologies, Inc.
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

import ScatterplotLayer from '../../core/scatterplot-layer/scatterplot-layer';
import {fp64ify} from '../../../lib/utils/fp64';
import {readFileSync} from 'fs';
import {join} from 'path';

export default class ScatterplotLayer64 extends ScatterplotLayer {

  // Override the super class vertex shader
  getShaders(id) {
    return {
      vs: readFileSync(join(__dirname, './scatterplot-layer-64-vertex.glsl'), 'utf8'),
      fs: super.getShaders().fs,
      fp64: true,
      project64: true
    };
  }

  initializeState() {
    // We use the model and all attributes except "instancePositions" of the base layer
    super.initializeState();

    // Add the 64 bit positions
    const {attributeManager} = this.state;
    attributeManager.addInstanced({
      instancePositions64xy: {size: 4, update: this.calculateInstancePositions64xy},
      instancePositions64z: {size: 2, update: this.calculateInstancePositions64z}
    });
  }

  calculateInstancePositions64xy(attribute) {
    const {data, getPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      [value[i + 0], value[i + 1]] = fp64ify(position[0]);
      [value[i + 2], value[i + 3]] = fp64ify(position[1]);
      i += size;
    }
  }

  calculateInstancePositions64z(attribute) {
    const {data, getPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      [value[i + 0], value[i + 1]] = fp64ify(position[2] || 0);
      i += size;
    }
  }
}

ScatterplotLayer64.layerName = 'ScatterplotLayer64';

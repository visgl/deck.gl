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

import ChoroplethLayer from '../choropleth-layer/choropleth-layer';
import {fp64ify, log} from '../../../lib/utils';
import flattenDeep from 'lodash.flattendeep';

import choroplethVertex64 from './choropleth-layer-vertex-64.glsl';

export default class ChoroplethLayer64 extends ChoroplethLayer {

  constructor(props) {
    super(props);
    log.once('ChoroplethLayer64 is deprecated. Consider using GeoJsonLayer instead');
  }

  getShaders() {
    return {
      vs: choroplethVertex64,
      fs: super.getShaders().fs,
      modules: ['project64']
    };
  }

  initializeState() {
    super.initializeState();

    this.state.attributeManager.add({
      positions64: {size: 4, update: this.calculatePositions64},
      heights64: {size: 2, update: this.calculateHeights64}
    });
  }

  calculatePositions64(attribute) {
    const vertices = flattenDeep(this.state.choropleths);
    attribute.value = new Float32Array(vertices.length / 3 * 4);
    for (let index = 0; index < vertices.length / 3; index++) {
      [
        attribute.value[index * 4],
        attribute.value[index * 4 + 1]
      ] = fp64ify(vertices[index * 3]);
      [
        attribute.value[index * 4 + 2],
        attribute.value[index * 4 + 3]
      ] = fp64ify(vertices[index * 3 + 1]);
    }
  }

  calculateHeights64(attribute) {
    const vertices = flattenDeep(this.state.choropleths);
    attribute.value = new Float32Array(vertices.length / 3 * 2);
    for (let index = 0; index < vertices.length / 3; index++) {
      [
        attribute.value[index * 2],
        attribute.value[index * 2 + 1]
      ] = fp64ify(vertices[index * 3 + 2]);
    }
  }
}

ChoroplethLayer64.layerName = 'ChoroplethLayer64';

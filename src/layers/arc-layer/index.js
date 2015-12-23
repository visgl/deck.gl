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

import BaseMapLayer from '../base-map-layer';
// Note: Shaders are inlined by the glslify browserify transform
const glslify = require('glslify');

export default class ArcLayer extends BaseMapLayer {
  /**
   * @classdesc
   * ArcLayer
   *
   * @class
   * @param {object} opts
   */
  constructor(opts) {
    super(opts);
  }

  update(deep) {
    if (deep || this._positionNeedUpdate) {
      this._allocateGlBuffers();
      this._calculatePositions();
    }
  }

  _getPrograms() {
    return {
      id: this.id,
      from: 'sources',
      vs: glslify('./vertex.glsl'),
      fs: glslify('./fragment.glsl')
    };
  }

  _getPrimitive() {
    let vertices = [];
    const NUM_SEGMENTS = 50;
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      vertices = [...vertices, i, i, i];
    }

    return {
      id: this.id,
      drawType: 'LINE_STRIP',
      vertices: new Float32Array(vertices),
      instanced: true
    };
  }

  _getUniforms() {
    if (!this.data || this.data.length === 0) {
      return {};
    }

    return {
      color0: this.data[0].colors.c0,
      color1: this.data[0].colors.c1,
      opacity: this.opacity
    };
  }

  _getAttributes() {
    return {
      positions: {
        value: this.glBuffers.positions,
        instanced: 1,
        size: 4
      }
    };
  }

  _getOptions() {
    return {
      numInstances: this.numInstances,
      isPickable: this.isPickable
    };
  }

  _allocateGlBuffers() {
    this.glBuffers = {};
    this.glBuffers.positions = new Float32Array(this.numInstances * 4);
  }

  _calculatePositions() {
    this.data.forEach((trip, i) => {
      const position = trip.position;
      // -> screen coords
      const pixel0 = this.project([position.x0, position.y0]);
      const pixel1 = this.project([position.x1, position.y1]);
      // -> world coordinates
      const space0 = this.screenToSpace(pixel0.x, pixel0.y);
      const space1 = this.screenToSpace(pixel1.x, pixel1.y);

      this.glBuffers.positions[i * 4 + 0] = space0.x;
      this.glBuffers.positions[i * 4 + 1] = space0.y;
      this.glBuffers.positions[i * 4 + 2] = space1.x;
      this.glBuffers.positions[i * 4 + 3] = space1.y;
    });

    this._positionNeedUpdate = false;
  }

}

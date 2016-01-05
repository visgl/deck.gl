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

  updateLayer() {
    if (this.dataChanged) {
      this._allocateGLBuffers();
      this._calculatePositions();
    }

    this.setLayerUniforms();
    this.setLayerAttributes();

    this.dataChanged = false;
    this.viewportChanged = false;
  }

  getLayerShader() {
    return {
      id: this.id,
      from: 'sources',
      vs: glslify('./vertex.glsl'),
      fs: glslify('./fragment.glsl')
    };
  }

  getLayerPrimitive() {
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

  setLayerUniforms() {
    if (!this.data || this.data.length === 0) {
      return;
    }

    this._uniforms = {
      ...this._uniforms,
      color0: this.data[0].colors.c0,
      color1: this.data[0].colors.c1
    };
  }

  setLayerAttributes() {
    this._attributes = {
      ...this._attributes,
      positions: {
        value: this.cache.positions,
        instanced: 1,
        size: 4
      }
    };
  }

  _allocateGLBuffers() {
    const N = this._numInstances;
    this.cache.positions = new Float32Array(N * 4);
  }

  _calculatePositions() {
    this.data.forEach((arc, i) => {
      this.cache.positions[i * 4 + 0] = arc.position.x0;
      this.cache.positions[i * 4 + 1] = arc.position.y0;
      this.cache.positions[i * 4 + 2] = arc.position.x1;
      this.cache.positions[i * 4 + 3] = arc.position.y1;
    });
  }

}

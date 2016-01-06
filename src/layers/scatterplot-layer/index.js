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

export default class ScatterplotLayer extends BaseMapLayer {
  /**
   * @classdesc
   * ScatterplotLayer
   *
   * @class
   * @param {object} opts
   * @param {number} opts.radius - point radius
   */
  constructor(opts) {
    super(opts);
    this.radius = opts.radius;
  }

  updateLayer() {
    if (this.dataChanged) {
      this._allocateGLBuffers();
      this._calculatePositions();
      this._calculateColors();
      this._calculatePickingColors();
    }

    if (this.viewportChanged || this.dataChanged) {
      this._calculateRadius();
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
    const NUM_SEGMENTS = 16;
    const PI2 = Math.PI * 2;

    let vertices = [];
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      vertices = [
        ...vertices,
        Math.cos(PI2 * i / NUM_SEGMENTS),
        Math.sin(PI2 * i / NUM_SEGMENTS),
        0
      ];
    }

    return {
      id: this.id,
      drawType: 'TRIANGLE_FAN',
      vertices: new Float32Array(vertices),
      instanced: true
    };
  }

  setLayerUniforms() {
    this._uniforms = {
      ...this._uniforms,
      radius: this.cache.radius
    };
  }

  setLayerAttributes() {
    this._attributes = {
      ...this._attributes,
      positions: {
        value: this.cache.positions,
        instanced: 1,
        size: 3
      },
      colors: {
        value: this.cache.colors,
        instanced: 1,
        size: 3
      }
    };

    if (!this.isPickable) {
      return;
    }

    this._attributes.pickingColors = {
      value: this.cache.pickingColors,
      instanced: 1,
      size: 3
    };
  }

  _allocateGLBuffers() {
    const N = this._numInstances;

    this.cache.positions = new Float32Array(N * 3);
    this.cache.colors = new Float32Array(N * 3);

    if (!this.isPickable) {
      return;
    }

    this.cache.pickingColors = new Float32Array(N * 3);
  }

  _calculatePositions() {
    this.data.forEach((point, i) => {
      this.cache.positions[i * 3 + 0] = point.position.x;
      this.cache.positions[i * 3 + 1] = point.position.y;
      this.cache.positions[i * 3 + 2] = point.position.z;
    });
  }

  _calculateColors() {
    this.data.forEach((point, i) => {
      this.cache.colors[i * 3 + 0] = point.color[0];
      this.cache.colors[i * 3 + 1] = point.color[1];
      this.cache.colors[i * 3 + 2] = point.color[2];
    });
  }

  _calculatePickingColors() {
    if (!this.isPickable) {
      return;
    }

    this.data.forEach((point, i) => {
      this.cache.pickingColors[i * 3 + 0] = (i + 1) % 256;
      this.cache.pickingColors[i * 3 + 1] = Math.floor((i + 1) / 256) % 256;
      this.cache.pickingColors[i * 3 + 2] = this.layerIndex;
    });
  }

  _calculateRadius() {
    // use radius if specified
    if (this.radius && this.radius !== 0) {
      this.cache.radius = this.radius;
      return;
    }

    const pixel0 = this.project([37.5, -122]);
    const pixel1 = this.project([37.5002, -122]);

    const space0 = this.screenToSpace(pixel0.x, pixel0.y);
    const space1 = this.screenToSpace(pixel1.x, pixel1.y);

    const dx = space0.x - space1.x;
    const dy = space0.y - space1.y;

    this.cache.radius = Math.max(Math.sqrt(dx * dx + dy * dy), 2.0);
  }

}

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

export default class GridLayer extends BaseMapLayer {
  /**
   * @classdesc
   * GridLayer
   *
   * @class
   * @param {object} opts
   * @param {number} opts.unitWidth - width of the unit rectangle
   * @param {number} opts.unitHeight - height of the unit rectangle
   */
  constructor(opts) {
    super(opts);
    this.unitWidth = opts.unitWidth || 100;
    this.unitHeight = opts.unitHeight || 100;
  }

  updateLayer() {
    // dataChanged does not affect the generation of grid layout
    if (this.dataChanged || true) {
      this._allocateGLBuffers();
      this._calculatePositions();
      this._calculateColors();
      this._calculatePickingColors();
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
    return {
      id: this.id,
      drawType: 'TRIANGLE_FAN',
      vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0]),
      instanced: true
    };
  }

  setLayerUniforms() {
    const margin = 2;

    this._uniforms = {
      ...this._uniforms,
      scale: new Float32Array([
        this.unitWidth - margin * 2, this.unitHeight - margin * 2, 1]),
      maxCount: this.cache.maxCount
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
    this.numCol = Math.ceil(this.width * 2 / this.unitWidth);
    this.numRow = Math.ceil(this.height * 2 / this.unitHeight);

    const N = this._numInstances = this.numCol * this.numRow;

    this.cache.positions = new Float32Array(N * 3);
    this.cache.colors = new Float32Array(N * 3);
    this.cache.colors.fill(0.0);

    if (!this.isPickable) {
      return;
    }

    this.cache.pickingColors = new Float32Array(N * 3);
  }

  _calculatePositions() {
    for (let i = 0; i < this._numInstances; i++) {
      const x = i % this.numCol;
      const y = Math.floor(i / this.numCol);
      this.cache.positions[i * 3 + 0] = x * this.unitWidth - this.width;
      this.cache.positions[i * 3 + 1] = y * this.unitHeight - this.height;
      this.cache.positions[i * 3 + 2] = 0;
    }
  }

  _calculateColors() {
    this.data.forEach(point => {
      const pixel = this.project([point.position.x, point.position.y]);
      const space = this.screenToSpace(pixel.x, pixel.y);

      const colId = Math.floor((space.x + this.width) / this.unitWidth);
      const rowId = Math.floor((space.y + this.height) / this.unitHeight);

      const i3 = (colId + rowId * this.numCol) * 3;
      this.cache.colors[i3 + 0] += 1;
      this.cache.colors[i3 + 1] += 5;
      this.cache.colors[i3 + 2] += 1;
    });

    this.cache.maxCount = Math.max(...this.cache.colors);
  }

  _calculatePickingColors() {
    if (!this.isPickable) {
      return;
    }

    for (let i = 0; i < this._numInstances; i++) {
      this.cache.pickingColors[i * 3 + 0] = (i + 1) % 256;
      this.cache.pickingColors[i * 3 + 1] = Math.floor((i + 1) / 256) % 256;
      this.cache.pickingColors[i * 3 + 2] = this.layerIndex;
    }
  }

}

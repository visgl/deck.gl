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

const glslify = require('glslify');

export default class HexagonLayer extends BaseMapLayer {
  /**
   * @classdesc
   * HexagonLayer
   *
   * @class
   * @param {object} opts
   *
   * @param {number} opts.dotRadius - hexagon radius
   * @param {number} opts.elevation - hexagon height
   * @param {bool} opts.lightingEnabled - whether use lighting or not
   *
   * @param {function} opts.onHexagonHovered(index, e) - popup selected index
   * @param {function} opts.onHexagonClicked(index, e) - popup selected index
   */
  constructor(opts) {
    super(opts);

    this.radius = opts.dotRadius || 10;
    this.elevation = opts.elevation || 101;
    this.lightingEnabled = opts.lightingEnabled ? 1.0 : 0.0;

    this.onObjectHovered = opts.onHexagonHovered;
    this.onObjectClicked = opts.onHexagonClicked;
  }

  updateLayer() {
    if (this.dataChanged) {
      this._allocateGLBuffers();
      this._calculateTileCoordinates();
      this._calculatePickingColors();
    }

    if (this.viewportChanged || this.dataChanged) {
      this._calculateScreenCoordinates();
      this._calculateRadiusAndAngle();
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
    const NUM_SEGMENTS = 6;
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
      radius: this.cache.radius,
      angle: this.cache.angle
    };
  }

  setLayerAttributes() {
    this._attributes = {
      ...this._attributes,
      positions: {
        value: this.cache.glBuffers.positions,
        instanced: 1,
        size: 3
      },
      colors: {
        value: this.cache.glBuffers.colors,
        instanced: 1,
        size: 3
      }
    };

    if (!this.isPickable) {
      return;
    }

    this._attributes.pickingColors = {
      value: this.cache.glBuffers.pickingColors,
      instanced: 1,
      size: 3
    };
  }

  _allocateGLBuffers() {
    const N = this._numInstances;

    this.cache.glBuffers.positions = new Float32Array(N * 3);
    this.cache.glBuffers.colors = new Float32Array(N * 3);

    if (!this.isPickable) {
      return;
    }

    this.cache.glBuffers.pickingColors = new Float32Array(N * 3);
  }

  _calculateTileCoordinates() {
    this.cache.tileCoordinates = this.data.map(
      hexagon => this.project([hexagon.centroid.x, hexagon.centroid.y])
    );
  }

  _calculateScreenCoordinates() {
    if (!this.cache.tileCoordinates) {
      this._calculateTileCoordinates();
    }

    this.cache.tileCoordinates.forEach((tileCoord, i) => {
      const screenCoord = this.tileToScreen(tileCoord.x, tileCoord.y);
      this.cache.glBuffers.positions[i * 3 + 0] = screenCoord.x;
      this.cache.glBuffers.positions[i * 3 + 1] = screenCoord.y;
      this.cache.glBuffers.positions[i * 3 + 2] = this.elevation;
    });
  }

  _calculateColors() {
    this.data.forEach((hexagon, i) => {
      this.cache.glBuffers.colors[i * 3 + 0] = hexagon.color.r;
      this.cache.glBuffers.colors[i * 3 + 1] = hexagon.color.g;
      this.cache.glBuffers.colors[i * 3 + 2] = hexagon.color.b;
    });
  }

  _calculatePickingColors() {
    if (!this.isPickable) {
      return;
    }

    this.data.forEach((hexagon, i) => {
      this.cache.glBuffers.pickingColors[i * 3 + 0] = (i + 1) % 256;
      this.cache.glBuffers.pickingColors[i * 3 + 1] =
        Math.floor((i + 1) / 256) % 256;
      this.cache.glBuffers.pickingColors[i * 3 + 2] = hexagon.color.b;
    });
  }

  _calculateRadiusAndAngle() {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const vertices = this.data[0].vertices;
    const vertex0 = vertices[0];
    const vertex3 = vertices[3];

    // transform to tile coordinates
    const tileCoord0 = this.project([vertex0[0], vertex0[1]]);
    const tileCoord3 = this.project([vertex3[0], vertex3[1]]);

    // map from tile coordinates to screen coordinates
    const screenCoord0 = this.tileToScreen(tileCoord0.x, tileCoord0.y);
    const screenCoord3 = this.tileToScreen(tileCoord3.x, tileCoord3.y);

    // distance between two close centroids
    const dx = screenCoord0.x - screenCoord3.x;
    const dy = screenCoord0.y - screenCoord3.y;
    const dxy = Math.sqrt(dx * dx + dy * dy);

    // Calculate angle that the perpendicular hexagon vertex axis is tilted
    this.cache.angle = Math.acos(dx / dxy) * -Math.sign(dy);

    // Allow user to fine tune radius
    this.cache.radius = dxy / 2 * Math.min(1, this.radius);
  }

}

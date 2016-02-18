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
import {Program} from 'luma.gl';
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

    this.onObjectHovered = opts.onObjectHovered;
    this.onObjectClicked = opts.onObjectClicked;
  }

  initializeState() {
    super.initializeState();

    const {gl} = this.state;

    const program = new Program(
      gl,
      glslify('./vertex.glsl'),
      glslify('./fragment.glsl'),
      'scatterplot'
    );

    Object.assign(this.state, {
      program,
      primitive: this.getPrimitive()
    });
  }

  updateLayer(newProps, oldProps) {
    this.state.radiusChanged = newProps.radius !== oldProps.radius;

    const {dataChanged, viewportChanged, radiusChanged} = this.state;
    if (dataChanged) {
      this._allocateGLBuffers();
      this._calculatePositions();
      this._calculateColors();
      this._calculatePickingColors();
    }

    if (viewportChanged || dataChanged || radiusChanged) {
      this._calculateRadius();
    }

    this.updateUniforms();
    this.updateAttributes();

    this.state.dataChanged = false;
    this.state.viewportChanged = false;
    this.state.radiusChanged = false;
  }

  updateUniforms() {
    const {uniforms} = this.state;
    uniforms.radius = this.state.radius;
  }

  updateAttributes() {
    const {attributes} = this.state;
    attributes.positions = {value: this.state.positions, instanced: 1, size: 3};
    attributes.colors = {value: this.state.colors, instanced: 1, size: 3};

    if (!this.isPickable) {
      return;
    }

    attributes.pickingColors = {
      value: this.state.pickingColors,
      instanced: 1,
      size: 3
    };
  }

  getPrimitive() {
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

  _allocateGLBuffers() {
    const N = this._numInstances;

    this.state.positions = new Float32Array(N * 3);
    this.state.colors = new Float32Array(N * 3);

    if (!this.isPickable) {
      return;
    }

    this.state.pickingColors = new Float32Array(N * 3);
  }

  _calculatePositions() {
    this.props.data.forEach((point, i) => {
      this.state.positions[i * 3 + 0] = point.position.x;
      this.state.positions[i * 3 + 1] = point.position.y;
      this.state.positions[i * 3 + 2] = point.position.z;
    });
  }

  _calculateColors() {
    this.props.data.forEach((point, i) => {
      this.state.colors[i * 3 + 0] = point.color[0];
      this.state.colors[i * 3 + 1] = point.color[1];
      this.state.colors[i * 3 + 2] = point.color[2];
    });
  }

  _calculateRadius() {
    // use radius if specified
    if (this.radius && this.radius !== 0) {
      this.state.radius = this.radius;
      return;
    }

    const pixel0 = this.project([-122, 37.5]);
    const pixel1 = this.project([-122, 37.5002]);

    const space0 = this.screenToSpace(pixel0.x, pixel0.y);
    const space1 = this.screenToSpace(pixel1.x, pixel1.y);

    const dx = space0.x - space1.x;
    const dy = space0.y - space1.y;

    this.state.radius = Math.max(Math.sqrt(dx * dx + dy * dy), 2.0);
  }

}

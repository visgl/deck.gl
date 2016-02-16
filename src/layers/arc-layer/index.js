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

  initializeState() {
    super.initializeState();
    const {gl} = this.state;

    const program = new Program(
      gl,
      glslify('./vertex.glsl'),
      glslify('./fragment.glsl'),
      'arc'
    );

    Object.assign(this.state, {
      program,
      primitive: this.getLayerPrimitive()
    });
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

  updateLayer() {
    const {dataChanged} = this.state;
    if (dataChanged) {
      this._allocateGLBuffers();
      this._calculatePositions();
    }

    this.updateUniforms();
    this.updateAttributes();

    this.state.dataChanged = false;
    this.state.viewportChanged = false;
  }

  updateUniforms() {
    if (!this.props.data || this.props.data.length === 0) {
      return;
    }
    const {uniforms} = this.state;
    uniforms.color0 = this.props.data[0].colors.c0;
    uniforms.color1 = this.props.data[0].colors.c1;
  }

  updateAttributes() {
    const {attributes} = this.state;
    attributes.positions = {value: this.state.positions, instanced: 1, size: 4};
  }

  _allocateGLBuffers() {
    const N = this._numInstances;
    this.state.positions = new Float32Array(N * 4);
  }

  _calculatePositions() {
    this.props.data.forEach((arc, i) => {
      this.state.positions[i * 4 + 0] = arc.position.x0;
      this.state.positions[i * 4 + 1] = arc.position.y0;
      this.state.positions[i * 4 + 2] = arc.position.x1;
      this.state.positions[i * 4 + 3] = arc.position.y1;
    });
  }

}

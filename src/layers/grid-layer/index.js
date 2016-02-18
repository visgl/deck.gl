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
    super({
      unitWidth: 100,
      unitHeight: 100,
      numCol: 100,
      ...opts
    });
  }

  initializeState() {
    super.initializeState();

    const {gl} = this.state;

    const program = new Program(
      gl,
      glslify('./vertex.glsl'),
      glslify('./fragment.glsl'),
      'grid'
    );

    const primitive = {
      id: this.props.id,
      drawType: 'TRIANGLE_FAN',
      vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0]),
      instanced: true
    };

    Object.assign(this.state, {
      program,
      primitive
    });

    this.addInstancedAttributes(
      {name: 'positions', size: 3},
      {name: 'colors', size: 3}
    );
  }

  updateLayer() {
    const {dataChanged} = this.state;

    // dataChanged does not affect the generation of grid layout
    if (dataChanged || true) {
      this._allocateGLBuffers();
      this._calculatePositions();
      this._calculateColors();
      this._calculatePickingColors();
    }

    this.updateUniforms();
    this.updateAttributes();

    this.state.dataChanged = false;
  }

  updateUniforms() {
    const {uniforms} = this.state;
    const MARGIN = 2;
    uniforms.scale = new Float32Array([
      this.unitWidth - MARGIN * 2,
      this.unitHeight - MARGIN * 2,
      1
    ]);
    uniforms.maxCount = this.state.maxCount;
  }

  updateAttributes() {
    this._calculatePositions();
    this._calculateColors();
  }

  _calculatePositions() {
    const {numCol} = this.props;
    const {numInstances} = this.state;
    for (let i = 0; i < numInstances; i++) {
      const x = i % numCol;
      const y = Math.floor(i / numCol);
      this.state.positions[i * 3 + 0] = x * this.unitWidth - this.width;
      this.state.positions[i * 3 + 1] = y * this.unitHeight - this.height;
      this.state.positions[i * 3 + 2] = 0;
    }
  }

  _calculateColors() {
    const {numCol} = this.props;
    this.props.data.forEach(point => {
      const pixel = this.project([point.position.x, point.position.y]);
      const space = this.screenToSpace(pixel.x, pixel.y);

      const colId = Math.floor((space.x + this.width) / this.unitWidth);
      const rowId = Math.floor((space.y + this.height) / this.unitHeight);

      const i3 = (colId + rowId * numCol) * 3;
      this.state.colors[i3 + 0] += 1;
      this.state.colors[i3 + 1] += 5;
      this.state.colors[i3 + 2] += 1;
    });

    this.state.maxCount = Math.max(...this.state.colors);
  }

}

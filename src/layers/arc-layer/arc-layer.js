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

import Layer from '../../layer';
import {Model, Program, Geometry} from 'luma.gl';
const glslify = require('glslify');

const ATTRIBUTES = {
  instancePositions: {size: 4, '0': 'x0', '1': 'y0', '2': 'x1', '3': 'y1'},
  instanceColors: {size: 3, '0': 'red', '1': 'green', '2': 'blue'}
};

const RED = [255, 0, 0];
const BLUE = [0, 0, 255];

export default class ArcLayer extends Layer {
  /**
   * @classdesc
   * ArcLayer
   *
   * @class
   * @param {object} opts
   */
  constructor({
    strokeWidth = 1,
    color0 = RED,
    color1 = BLUE,
    ...opts
  } = {}) {
    super({
      strokeWidth,
      color0,
      color1,
      ...opts
    });
  }

  initializeState() {
    const {gl, attributeManager} = this.state;

    const model = this.createModel(gl);
    model.userData.strokeWidth = this.props.strokeWidth;
    this.setState({model});

    attributeManager.addInstanced(ATTRIBUTES, {
      instancePositions: {update: this.calculateInstancePositions},
      instanceColors: {update: this.calculateInstanceColors}
    });

    this.updateColors();
  }

  willReceiveProps(oldProps, nextProps) {
    super.willReceiveProps(oldProps, nextProps);
    this.state.model.userData.strokeWidth = nextProps.strokeWidth;
    this.updateColors();
  }

  createModel(gl) {
    let positions = [];
    const NUM_SEGMENTS = 50;
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      positions = [...positions, i, i, i];
    }

    return new Model({
      program: new Program(gl, {
        vs: glslify('./arc-layer-vertex.glsl'),
        fs: glslify('./arc-layer-fragment.glsl'),
        id: 'arc'
      }),
      geometry: new Geometry({
        id: 'arc',
        drawMode: 'LINE_STRIP',
        positions: new Float32Array(positions)
      }),
      isInstanced: true,
      onBeforeRender() {
        this.userData.oldStrokeWidth = gl.getParameter(gl.LINE_WIDTH);
        this.program.gl.lineWidth(this.userData.strokeWidth || 1);
      },
      onAfterRender() {
        this.program.gl.lineWidth(this.userData.oldStrokeWidth || 1);
      }
    });
  }

  updateColors() {
    this.setUniforms({
      color0: this.props.color0,
      color1: this.props.color1
    });
  }

  calculateInstancePositions(attribute) {
    const {data} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const arc of data) {
      value[i + 0] = arc.position.x0;
      value[i + 1] = arc.position.y0;
      value[i + 2] = arc.position.x1;
      value[i + 3] = arc.position.y1;
      i += size;
    }
  }

  calculateInstanceColors(attribute) {
    const {data} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      value[i + 0] = point.color[0];
      value[i + 1] = point.color[1];
      value[i + 2] = point.color[2];
      i += size;
    }
  }

}

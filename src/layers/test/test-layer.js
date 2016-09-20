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

import Layer from '../layer';
import {Model, Program, Geometry} from 'luma.gl';
const glslify = require('glslify');

const ATTRIBUTES = {
  instancePositions: {size: 3, 0: 'x', 1: 'y', 2: 'unused'},
  instanceColors: {size: 3, 0: 'red', 1: 'green', 2: 'blue'}
};

export default class TestLayer extends Layer {

  static get attributes() {
    return ATTRIBUTES;
  }

  /*
   * @classdesc
   * TestLayer
   *
   * @class
   * @param {object} props
   * @param {number} props.radius - point radius
   */
  constructor({
    getPosition = x => x.position,
    getElevation = x => x.elevation || 0,
    getColor = x => x.color || [255, 0, 0],
    ...props
  }) {
    super({
      getPosition,
      getElevation,
      getColor,
      ...props
    });
  }

  initializeState() {
    const {gl} = this.state;
    const {attributeManager} = this.state;

    this.setState({
      model: this.getModel(gl)
    });

    attributeManager.addInstanced(ATTRIBUTES, {
      instancePositions: {update: this.calculateInstancePositions},
      instanceColors: {update: this.calculateInstanceColors}
    });
  }

  didMount() {
    this.updateUniforms();
  }

  willReceiveProps(oldProps, newProps) {
    super.willReceiveProps(oldProps, newProps);
    this.updateUniforms();
  }

  getModel(gl) {
    const NUM_SEGMENTS = 16;
    const PI2 = Math.PI * 2;

    let positions = [];
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      positions = [
        ...positions,
        Math.cos(PI2 * i / NUM_SEGMENTS),
        Math.sin(PI2 * i / NUM_SEGMENTS),
        0
      ];
    }

    return new Model({
      program: new Program(gl, {
        vs: glslify('./test-layer-vertex.glsl'),
        fs: glslify('./test-layer-fragment.glsl'),
        id: 'test'
      }),
      geometry: new Geometry({
        drawMode: 'TRIANGLE_FAN',
        positions: new Float32Array(positions)
      })
      // isInstanced: true
    });
  }

  updateUniforms() {
    this.calculateRadius();
    const {radius} = this.state;
    this.setUniforms({
      radius
    });
  }

  calculateInstancePositions(attribute) {
    const {data, getPosition, getElevation} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      const elevation = getElevation(point);
      value[i + 0] = position[0] || 0;
      value[i + 1] = position[1] || 0;
      value[i + 2] = elevation || 0;
      i += size;
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const color = getColor(point);
      value[i + 0] = color[0] || 255;
      value[i + 1] = color[1] || 0;
      value[i + 2] = color[2] || 0;
      i += size;
    }
  }

  calculateRadius() {
    // use radius if specified
    if (this.props.radius) {
      this.state.radius = this.props.radius;
      return;
    }

    const pixel0 = this.project([-122, 37.5]);
    const pixel1 = this.project([-122, 37.5002]);

    const dx = pixel0.x - pixel1.x;
    const dy = pixel0.y - pixel1.y;

    this.state.radius = Math.max(Math.sqrt(dx * dx + dy * dy), 2.0);
  }

}

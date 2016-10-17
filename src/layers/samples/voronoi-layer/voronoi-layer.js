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

import {Layer, assembleShader} from '../../../lib';
import {Model, Program, Geometry} from 'luma.gl';
const glslify = require('glslify');

const DEFAULT_COLOR = [255, 0, 255];

const defaultGetPosition = x => x.position;
const defaultGetRadius = x => x.radius;
const defaultGetColor = x => x.color || DEFAULT_COLOR;

export default class VoronoiLayer extends Layer {
  /*
   * @classdesc
   * VoronoiLayer
   *
   * @class
   * @param {object} props
   * @param {number} props.radius - point radius in meters
   */
  constructor({
    getPosition = defaultGetPosition,
    getRadius = defaultGetRadius,
    getColor = defaultGetColor,
    radius = 1000,
    ...props
  }) {
    super({
      getPosition,
      getRadius,
      getColor,
      radius,
      ...props
    });
  }

  initializeState() {
    const {gl} = this.state;
    const {attributeManager} = this.state;

    this.setState({
      model: this.getModel(gl)
    });

    attributeManager.addInstanced({
      instancePositions: {size: 4, update: this.calculateInstancePositions},
      instanceColors: {size: 3, update: this.calculateInstanceColors}
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
    const NUM_SEGMENTS = 32;
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

    // turn circle into a cone
    positions = [0, 0, 1, ...positions, 1, 0, 0];

    return new Model({
      program: new Program(gl, {
        id: 'voronoi',
        vs: assembleShader(gl, {vs: glslify('./voronoi-layer-vertex.glsl')}),
        fs: glslify('./voronoi-layer-fragment.glsl')
      }),
      geometry: new Geometry({
        drawMode: 'TRIANGLE_FAN',
        positions: new Float32Array(positions)
      }),
      isInstanced: true
    });
  }

  updateUniforms() {
    this.setUniforms({
      radius: this.props.radius
    });
  }

  calculateInstancePositions(attribute) {
    const {data, getPosition, getRadius} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      const radius = getRadius(point) || 1;
      value[i + 0] = position[0] || 0;
      value[i + 1] = position[1] || 0;
      value[i + 2] = position[2] || 0;
      value[i + 3] = radius || 1;
      i += size;
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const color = getColor(point);
      // use random colors for demostration
      value[i + 0] = Math.random() * 255 || color[0];
      value[i + 1] = Math.random() * 255 || color[1];
      value[i + 2] = Math.random() * 255 || color[2];
      i += size;
    }
  }

}

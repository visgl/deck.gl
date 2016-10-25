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
import {Layer} from '../../../lib';
import {assembleShaders} from '../../../shader-utils';
import {GL, Model, Program, Geometry} from 'luma.gl';

const glslify = require('glslify');

const DEFAULT_COLOR = [255, 0, 255];

const defaultGetPosition = x => x.position;
const defaultGetRadius = x => x.radius;
const defaultGetColor = x => x.color || DEFAULT_COLOR;

export default class ScatterplotLayer extends Layer {
  /*
   * @classdesc
   * ScatterplotLayer
   *
   * @class
   * @param {object} props
   * @param {number} props.radius - point radius in meters
   */
  constructor({
    getPosition = defaultGetPosition,
    getRadius = defaultGetRadius,
    getColor = defaultGetColor,
    radius = 30,
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
    const {gl} = this.context;
    const drawMode = this.props.drawOutline ? GL.LINE_LOOP : GL.TRIANGLE_FAN;
    const model = this._getModel(gl, drawMode);
    this.setState({model});

    const {attributeManager} = this.state;
    attributeManager.addInstanced({
      instancePositions: {size: 4, update: this.calculateInstancePositions},
      instanceColors: {size: 3, update: this.calculateInstanceColors}
    });
  }

  willReceiveProps(oldProps, newProps) {
    if (oldProps.drawOutline !== newProps.drawOutline) {
      const {gl} = this.state;
      const drawMode = newProps.drawOutline ? GL.LINE_LOOP : GL.TRIANGLE_FAN;
      const model = this._getModel(gl, drawMode);

      this.state.model = model;
    }
    super.willReceiveProps(oldProps, newProps);
  }

  draw({uniforms}) {
    const {gl} = this.context;
    const oldStrokeWidth = gl.getParameter(GL.LINE_WIDTH);
    gl.lineWidth(this.props.strokeWidth || 1);
    this.state.model.render({
      ...uniforms,
      radius: this.props.radius
    });
    gl.lineWidth(oldStrokeWidth || 1);
  }

  _getModel(gl, drawMode) {
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
      id: 'scatterplot',
      program: new Program(gl,
        assembleShaders(gl, {
          vs: glslify('./scatterplot-layer-vertex.glsl'),
          fs: glslify('./scatterplot-layer-fragment.glsl')
        })
      ),
      geometry: new Geometry({
        drawMode: drawMode || GL.TRIANGLE_FAN,
        positions: new Float32Array(positions)
      }),
      isInstanced: true
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
      value[i + 0] = color[0] || 0;
      value[i + 1] = color[1] || 0;
      value[i + 2] = color[2] || 0;
      i += size;
    }
  }
}

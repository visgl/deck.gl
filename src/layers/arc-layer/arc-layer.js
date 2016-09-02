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

import BaseLayer from '../base-layer';
import {Model, Program, Geometry} from 'luma.gl';
const glslify = require('glslify');

const RED = [255, 0, 0];
const BLUE = [0, 0, 255];

const defaultGetPosition0 = x => x.position0;
const defaultGetPosition1 = x => x.position1;
const defaultGetColor = x => x.color;

export default class ArcLayer extends BaseLayer {
  /**
   * @classdesc
   * ArcLayer
   *
   * @class
   * @param {object} props
   */
  constructor({
    strokeWidth = 1,
    color0 = RED,
    color1 = BLUE,
    getPosition0 = defaultGetPosition0,
    getPosition1 = defaultGetPosition1,
    getColor = defaultGetColor,
    ...props
  } = {}) {
    super({
      strokeWidth,
      color0,
      color1,
      getPosition0,
      getPosition1,
      getColor,
      ...props
    });
  }

  initializeState() {
    const {gl, attributeManager} = this.state;

    const model = this.createModel(gl);
    model.userData.strokeWidth = this.props.strokeWidth;
    this.setState({model});

    attributeManager.addInstanced({
      instancePositions: {size: 4, update: this.calculateInstancePositions},
      instanceColors: {size: 3, update: this.calculateInstanceColors}
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
    const {data, getPosition0, getPosition1} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const position0 = getPosition0(object);
      const position1 = getPosition1(object);
      value[i + 0] = position0[0];
      value[i + 1] = position0[1];
      value[i + 2] = position1[0];
      value[i + 3] = position1[1];
      i += size;
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const color = getColor(object);
      value[i + 0] = color[0];
      value[i + 1] = color[1];
      value[i + 2] = color[2];
      i += size;
    }
  }

}

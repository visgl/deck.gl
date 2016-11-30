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

import {Layer, assembleShaders} from '../../..';
import {fp64ify} from '../../../lib/utils/fp64';
import {GL, Model, Geometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

const DEFAULT_COLOR = [0, 0, 255, 255];

const defaultGetSourcePosition = x => x.sourcePosition;
const defaultGetTargetPosition = x => x.targetPosition;
const defaultGetColor = x => x.color;

export default class ArcLayer64 extends Layer {

  static layerName = 'ArcLayer64';

  /**
   * @classdesc
   * ArcLayer
   *
   * @class
   * @param {object} props
   */
  constructor({
    getSourcePosition = defaultGetSourcePosition,
    getTargetPosition = defaultGetTargetPosition,
    getSourceColor = defaultGetColor,
    getTargetColor = defaultGetColor,
    strokeWidth = 1,
    ...props
  } = {}) {
    super({
      getSourcePosition,
      getTargetPosition,
      getSourceColor,
      getTargetColor,
      strokeWidth,
      ...props
    });
  }

  initializeState() {
    const {gl} = this.context;
    const {attributeManager} = this.state;

    attributeManager.addInstanced({
      instanceSourcePositionsFP64: {
        size: 4,
        update: this.calculateInstanceSourcePositions
      },
      instanceTargetPositionsFP64: {
        size: 4,
        update: this.calculateInstanceTargetPositions
      },
      instanceSourceColors: {
        size: 4,
        type: GL.UNSIGNED_BYTE,
        update: this.calculateInstanceSourceColors
      },
      instanceTargetColors: {
        size: 4,
        type: GL.UNSIGNED_BYTE,
        update: this.calculateInstanceTargetColors
      }
    });

    this.setState({model: this.createModel(gl)});
  }

  draw({uniforms}) {
    const {gl} = this.context;
    const lineWidth = this.screenToDevicePixels(this.props.strokeWidth);
    gl.lineWidth(lineWidth);
    this.state.model.render(uniforms);
    // Setting line width back to 1 is here to workaround a Google Chrome bug
    // gl.clear() and gl.isEnabled() will return GL_INVALID_VALUE even with
    // correct parameter
    // This is not happening on Safari and Firefox
    gl.lineWidth(1.0);
  }

  getShaders() {
    return {
      vs: readFileSync(join(__dirname, './arc-layer-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './arc-layer-fragment.glsl'), 'utf8'),
      fp64: true,
      project64: true
    };
  }

  createModel(gl) {
    let positions = [];
    const NUM_SEGMENTS = 50;
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      positions = [...positions, i, i, i];
    }
    return new Model({
      gl,
      id: this.props.id,
      ...assembleShaders(gl, this.getShaders()),
      geometry: new Geometry({
        drawMode: GL.LINE_STRIP,
        positions: new Float32Array(positions)
      }),
      isInstanced: true
    });
  }

  calculateInstanceSourcePositions(attribute) {
    const {data, getSourcePosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const sourcePosition = getSourcePosition(object);
      [value[i + 0], value[i + 1]] = fp64ify(sourcePosition[0]);
      [value[i + 2], value[i + 3]] = fp64ify(sourcePosition[1]);
      i += size;
    }
  }

  calculateInstanceTargetPositions(attribute) {
    const {data, getTargetPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const targetPosition = getTargetPosition(object);
      [value[i + 0], value[i + 1]] = fp64ify(targetPosition[0]);
      [value[i + 2], value[i + 3]] = fp64ify(targetPosition[1]);
      i += size;
    }
  }

  calculateInstanceSourceColors(attribute) {
    const {data, getSourceColor} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const color = getSourceColor(object) || DEFAULT_COLOR;
      value[i + 0] = color[0];
      value[i + 1] = color[1];
      value[i + 2] = color[2];
      value[i + 3] = isNaN(color[3]) ? DEFAULT_COLOR[3] : color[3];
      i += size;
    }
  }

  calculateInstanceTargetColors(attribute) {
    const {data, getTargetColor} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const color = getTargetColor(object) || DEFAULT_COLOR;
      value[i + 0] = color[0];
      value[i + 1] = color[1];
      value[i + 2] = color[2];
      value[i + 3] = isNaN(color[3]) ? DEFAULT_COLOR[3] : color[3];
      i += size;
    }
  }

}

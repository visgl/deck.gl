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
import {GL, Model, Geometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

const DEFAULT_COLOR = [255, 0, 255, 255];

const defaultGetPosition = x => x.position;
const defaultGetRadius = x => x.radius;
const defaultGetColor = x => x.color || DEFAULT_COLOR;

export default class ScatterplotLayer extends Layer {

  static layerName = 'ScatterplotLayer';

  /*
   * @classdesc
   * ScatterplotLayer
   *
   * @class
   * @param {object} props
   * @param {number} props.radius - point radius in meters
   * @param {number} props.radiusMinPixels - min point radius in pixels
   * @param {number} props.radiusMinPixels - max point radius in pixels
   */
  constructor({
    getPosition = defaultGetPosition,
    getRadius = defaultGetRadius,
    getColor = defaultGetColor,
    radius = 30,
    radiusMinPixels = 0,
    radiusMaxPixels = Number.MAX_SAFE_INTEGER,
    drawOutline = false,
    strokeWidth = 1,
    ...props
  }) {
    super({
      getPosition,
      getRadius,
      getColor,
      drawOutline,
      strokeWidth,
      radius,
      radiusMinPixels,
      radiusMaxPixels,
      ...props
    });
  }

  initializeState() {
    /* eslint-disable */
    const {gl} = this.context;
    const model = this._getModel(gl);
    this.setState({model});

    const {attributeManager} = this.state;
    attributeManager.addInstanced({
      instancePositions: {size: 3, update: this.calculateInstancePositions},
      instanceRadius: {size: 1, update: this.calculateInstanceRadius},
      instanceColors: {
        type: GL.UNSIGNED_BYTE,
        size: 4,
        update: this.calculateInstanceColors
      }
    });
  }

  updateState(evt) {
    super.updateState(evt);
    const {props, oldProps} = evt;
    if (props.drawOutline !== oldProps.drawOutline) {
      this.state.model.geometry.drawMode =
        props.drawOutline ? GL.LINE_LOOP : GL.TRIANGLE_FAN;
    }
  }

  draw({uniforms}) {
    const {gl} = this.context;
    const lineWidth = this.screenToDevicePixels(this.props.strokeWidth);
    gl.lineWidth(lineWidth);
    this.state.model.render({
      ...uniforms,
      radius: this.props.radius,
      radiusMinPixels: this.props.radiusMinPixels,
      radiusMaxPixels: this.props.radiusMaxPixels
    });
    // Setting line width back to 1 is here to workaround a Google Chrome bug
    // gl.clear() and gl.isEnabled() will return GL_INVALID_VALUE even with
    // correct parameter
    // This is not happening on Safari and Firefox
    gl.lineWidth(1.0);
  }

  getShaders(id) {
    return {
      vs: readFileSync(join(__dirname, './scatterplot-layer-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './scatterplot-layer-fragment.glsl'), 'utf8')
    };
  }

  _getModel(gl) {
    const NUM_SEGMENTS = 16;
    const positions = [];
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      positions.push(
        Math.cos(Math.PI * 2 * i / NUM_SEGMENTS),
        Math.sin(Math.PI * 2 * i / NUM_SEGMENTS),
        0
      );
    }
    /* eslint-disable */


    const shaders = assembleShaders(gl, this.getShaders())
    const model = new Model({
      gl,
      id: 'scatterplot',
      ...shaders,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        positions: new Float32Array(positions)
      }),
      isInstanced: true
    });
    return model;
  }

  calculateInstancePositions(attribute) {
    const {data, getPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i + 0] = position[0] || 0;
      value[i + 1] = position[1] || 0;
      value[i + 2] = position[2] || 0;
      i += size;
    }
  }

  calculateInstanceRadius(attribute) {
    const {data, getRadius} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const radius = getRadius(point);
      value[i + 0] = isNaN(radius) ? 0 : radius;
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
      value[i + 3] = isNaN(color[3]) ? DEFAULT_COLOR[3] : color[3];
      i += size;
    }
  }
}

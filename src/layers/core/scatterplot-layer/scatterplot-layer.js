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
import {GL, Model, Geometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

const DEFAULT_COLOR = [255, 0, 255, 255];

const defaultProps = {
  getPosition: x => x.position,
  getRadius: x => x.radius || 30,
  getColor: x => x.color || DEFAULT_COLOR,
  radius: 30,  //  point radius in meters
  radiusMinPixels: 0, //  min point radius in pixels
  radiusMaxPixels: Number.MAX_SAFE_INTEGER, // max point radius in pixels
  drawOutline: false,
  strokeWidth: 1
};

export default class ScatterplotLayer extends Layer {
  getShaders(id) {
    return {
      vs: readFileSync(join(__dirname, './scatterplot-layer-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './scatterplot-layer-fragment.glsl'), 'utf8')
    };
  }

  initializeState() {
    const {gl} = this.context;
    this.setState({model: this._getModel(gl)});

    /* eslint-disable max-len */
    this.state.attributeManager.addInstanced({
      instancePositions: {size: 3, accessor: 'getPosition', update: this.calculateInstancePositions},
      instanceRadius: {size: 1, accessor: 'getRadius', defaultValue: 1, update: this.calculateInstanceRadius},
      instanceColors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateInstanceColors}
    });
    /* eslint-enable max-len */
  }

  updateState(info) {
    const {props, oldProps} = info;
    if (props.drawOutline !== oldProps.drawOutline) {
      this.setUniforms({drawOutline: props.drawOutline ? 1 : 0});
    }
    super.updateState(info);
  }

  draw({uniforms}) {
    const {radius, radiusMinPixels, radiusMaxPixels, strokeWidth} = this.props;
    this.state.model.render(Object.assign({}, uniforms, {
      strokeWidth,
      radius,
      radiusMinPixels,
      radiusMaxPixels
    }));
  }

  _getModel(gl) {
    const positions = [-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0];
    const shaders = assembleShaders(gl, this.getShaders());

    return new Model({
      gl,
      id: this.props.id,
      vs: shaders.vs,
      fs: shaders.fs,
      // timerQueryEnabled: true,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        positions: new Float32Array(positions)
      }),
      isInstanced: true
    });
  }

  calculateInstancePositions(attribute) {
    const {data, getPosition} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i++] = position[0];
      value[i++] = position[1];
      value[i++] = position[2] || 0;
    }
  }

  calculateInstanceRadius(attribute) {
    const {data, getRadius} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const radius = getRadius(point);
      value[i++] = isNaN(radius) ? 1 : radius;
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const color = getColor(point) || DEFAULT_COLOR;
      value[i++] = color[0];
      value[i++] = color[1];
      value[i++] = color[2];
      value[i++] = isNaN(color[3]) ? DEFAULT_COLOR[3] : color[3];
    }
  }
}

ScatterplotLayer.layerName = 'ScatterplotLayer';
ScatterplotLayer.defaultProps = defaultProps;

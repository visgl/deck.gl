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

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  getPosition: x => x.position,
  getNormal: x => x.normal,
  getColor: x => x.color || DEFAULT_COLOR,
  radius: 10,  //  point radius in pixels
  lightSettings: {
    lightsPosition: [0, 0, 5000, -1000, 1000, 8000, 5000, -5000, 1000],
    ambientRatio: 0.2,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [1.0, 0.0, 0.8, 0.0, 0.4, 0.0],
    numberOfLights: 3
  }
};

export default class ScatterplotLayer extends Layer {
  getShaders(id) {
    return {
      vs: readFileSync(join(__dirname, './point-cloud-layer-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './point-cloud-layer-fragment.glsl'), 'utf8'),
      modules: ['lighting']
    };
  }

  initializeState() {
    const {gl} = this.context;
    this.setState({model: this._getModel(gl)});

    /* eslint-disable max-len */
    this.state.attributeManager.addInstanced({
      instancePositions: {size: 3, accessor: 'getPosition', update: this.calculateInstancePositions},
      instanceNormals: {size: 3, accessor: 'getNormal', defaultValue: 1, update: this.calculateInstanceNormals},
      instanceColors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateInstanceColors}
    });
    /* eslint-enable max-len */
  }

  draw({uniforms}) {
    const {radius, lightSettings} = this.props;
    const {viewport: {width, height}} = this.context;
    this.state.model.render(Object.assign({}, uniforms, {
      radius,
      screenSize: [width, height]
    }, lightSettings));
  }

  _getModel(gl) {
    // a triangle that minimally cover the unit circle
    const positions = [];
    for (let i = 0; i < 3; i++) {
      const angle = i / 3 * Math.PI * 2;
      positions.push(
        Math.cos(angle) * 2,
        Math.sin(angle) * 2,
        0
      );
    }
    const shaders = assembleShaders(gl, this.getShaders());

    return new Model({
      gl,
      id: this.props.id,
      vs: shaders.vs,
      fs: shaders.fs,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES,
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
      value[i++] = position[2];
    }
  }

  calculateInstanceNormals(attribute) {
    const {data, getNormal} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const normal = getNormal(point);
      value[i++] = normal[0];
      value[i++] = normal[1];
      value[i++] = normal[2];
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const color = getColor(point);
      value[i++] = color[0];
      value[i++] = color[1];
      value[i++] = color[2];
      value[i++] = isNaN(color[3]) ? 255 : color[3];
    }
  }
}

ScatterplotLayer.layerName = 'PointCloudLayer';
ScatterplotLayer.defaultProps = defaultProps;

// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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
import {GL, Model, Geometry} from 'luma.gl';
import {fp64ify, enable64bitSupport} from '../../../lib/utils/fp64';
import {COORDINATE_SYSTEM} from '../../../lib';

import vs from './point-cloud-layer-vertex.glsl';
import vs64 from './point-cloud-layer-vertex-64.glsl';
import fs from './point-cloud-layer-fragment.glsl';

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  radiusPixels: 10,  //  point radius in pixels
  fp64: false,

  getPosition: x => x.position,
  getNormal: x => x.normal,
  getColor: x => x.color || DEFAULT_COLOR,

  lightSettings: {
    lightsPosition: [0, 0, 5000, -1000, 1000, 8000, 5000, -5000, 1000],
    ambientRatio: 0.2,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [1.0, 0.0, 0.8, 0.0, 0.4, 0.0],
    numberOfLights: 3
  }
};

export default class PointCloudLayer extends Layer {
  getShaders(id) {
    const {shaderCache} = this.context;
    return enable64bitSupport(this.props) ?
      {vs: vs64, fs, modules: ['project64', 'lighting'], shaderCache} :
      {vs, fs, modules: ['lighting'], shaderCache}; // 'project' module added by default.
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

  updateAttribute({props, oldProps, changeFlags}) {
    if (props.fp64 !== oldProps.fp64) {
      const {attributeManager} = this.state;
      attributeManager.invalidateAll();

      if (props.fp64 && props.projectionMode === COORDINATE_SYSTEM.LNGLAT) {
        attributeManager.addInstanced({
          instancePositions64xyLow: {
            size: 2,
            accessor: 'getPosition',
            update: this.calculateInstancePositions64xyLow
          }
        });
      } else {
        attributeManager.remove([
          'instancePositions64xyLow'
        ]);
      }

    }
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});
    if (props.fp64 !== oldProps.fp64) {
      const {gl} = this.context;
      this.setState({model: this._getModel(gl)});
    }
    this.updateAttribute({props, oldProps, changeFlags});
  }

  draw({uniforms}) {
    const {radiusPixels, lightSettings} = this.props;
    this.state.model.render(Object.assign({}, uniforms, {
      radiusPixels
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

    return new Model(gl, Object.assign({}, this.getShaders(), {
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES,
        positions: new Float32Array(positions)
      }),
      isInstanced: true,
      shaderCache: this.context.shaderCache
    }));
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

  calculateInstancePositions64xyLow(attribute) {
    const {data, getPosition} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i++] = fp64ify(position[0])[1];
      value[i++] = fp64ify(position[1])[1];
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

PointCloudLayer.layerName = 'PointCloudLayer';
PointCloudLayer.defaultProps = defaultProps;

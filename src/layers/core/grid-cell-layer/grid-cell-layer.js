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
import {GL, Model, CubeGeometry} from 'luma.gl';
import {fp64ify, enable64bitSupport} from '../../../lib/utils/fp64';
import {COORDINATE_SYSTEM} from '../../../lib';

import vs from './grid-cell-layer-vertex.glsl';
import vs64 from './grid-cell-layer-vertex-64.glsl';
import fs from './grid-cell-layer-fragment.glsl';

const DEFAULT_COLOR = [255, 0, 255, 255];

const defaultProps = {
  cellSize: 1000,
  coverage: 1,
  elevationScale: 1,
  extruded: true,
  fp64: false,

  getPosition: x => x.position,
  getElevation: x => x.elevation,
  getColor: x => x.color,

  lightSettings: {
    lightsPosition: [-122.45, 37.65, 8000, -122.45, 37.20, 1000],
    ambientRatio: 0.4,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [1.0, 0.0, 0.8, 0.0],
    numberOfLights: 2
  }
};

export default class GridCellLayer extends Layer {
  /**
   * A generic GridLayer that takes latitude longitude delta of cells as a uniform
   * and the min lat lng of cells. grid can be 3d when pass in a height
   * and set enable3d to true
   *
   * @param {array} props.data -
   * @param {boolean} props.extruded - enable grid elevation
   * @param {number} props.cellSize - grid cell size in meters
   * @param {function} props.getPosition - position accessor, returned as [minLng, minLat]
   * @param {function} props.getElevation - elevation accessor
   * @param {function} props.getColor - color accessor, returned as [r, g, b, a]
   */

  getShaders() {
    const {shaderCache} = this.context;
    return enable64bitSupport(this.props) ?
      {vs: vs64, fs, modules: ['project64', 'lighting'], shaderCache} :
      {vs, fs, modules: ['lighting'], shaderCache};  // 'project' module added by default.
  }

  initializeState() {
    const {gl} = this.context;
    this.setState({model: this._getModel(gl)});

    const {attributeManager} = this.state;
    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {size: 4, accessor: ['getPosition', 'getElevation'], update: this.calculateInstancePositions},
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
    // Re-generate model if geometry changed
    if (props.fp64 !== oldProps.fp64) {
      const {gl} = this.context;
      this.setState({model: this._getModel(gl)});
    }
    this.updateAttribute({props, oldProps, changeFlags});
    this.updateUniforms();
  }

  _getModel(gl) {
    return new Model(gl, Object.assign({}, this.getShaders(), {
      id: this.props.id,
      geometry: new CubeGeometry(),
      isInstanced: true,
      shaderCache: this.context.shaderCache
    }));
  }

  updateUniforms() {
    const {opacity, extruded, elevationScale, coverage, lightSettings} = this.props;

    this.setUniforms(Object.assign({}, {
      extruded,
      elevationScale,
      opacity,
      coverage
    },
    lightSettings));
  }

  draw({uniforms}) {
    const {viewport} = this.context;
    // TODO - this should be a standard uniform in project package
    const {pixelsPerMeter} = viewport.getDistanceScales();

    // cellSize needs to be updated on every draw call
    // because it is based on viewport
    super.draw({uniforms: Object.assign({
      cellSize: this.props.cellSize * pixelsPerMeter[0]
    }, uniforms)});
  }

  calculateInstancePositions(attribute) {
    const {data, getPosition, getElevation} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const position = getPosition(object);
      const elevation = getElevation(object) || 0;
      value[i + 0] = position[0];
      value[i + 1] = position[1];
      value[i + 2] = 0;
      value[i + 3] = elevation;
      i += size;
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

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const color = getColor(object) || DEFAULT_COLOR;
      value[i + 0] = color[0];
      value[i + 1] = color[1];
      value[i + 2] = color[2];
      value[i + 3] = Number.isFinite(color[3]) ? color[3] : DEFAULT_COLOR[3];
      i += size;
    }
  }
}

GridCellLayer.layerName = 'GridCellLayer';
GridCellLayer.defaultProps = defaultProps;

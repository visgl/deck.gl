// Copyright (c) 2016 Uber Technologies, Inc.
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
import {GL, Model, CubeGeometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

const DEFAULT_COLOR = [255, 0, 255, 255];

const defaultProps = {
  extruded: true,
  latOffset: 0.0089,
  lonOffset: 0.0113,
  elevationScale: 1,
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

export default class GridLayer extends Layer {
  /**
   * A generic GridLayer that takes latitude longitude delta of cells as a uniform
   * and the min lat lng of cells. grid can be 3d when pass in a height
   * and set enable3d to true
   *
   * @param {array} props.data -
   * @param {boolean} props.extruded - enable grid elevation
   * @param {number} props.latOffset - grid cell size in lat delta
   * @param {number} props.lonOffset - grid cell size in lng delta
   * @param {function} props.getPosition - position accessor, returned as [minLng, minLat]
   * @param {function} props.getElevation - elevation accessor
   * @param {function} props.getColor - color accessor, returned as [r, g, b, a]
   */

  getShaders() {
    const vertex = readFileSync(join(__dirname, './grid-layer-vertex.glsl'), 'utf8');
    const picking = readFileSync(join(__dirname, './picking.glsl'), 'utf8');
    const vs = picking.concat(vertex);

    return {
      vs,
      fs: readFileSync(join(__dirname, './grid-layer-fragment.glsl'), 'utf8'),
      modules: ['lighting']
    };
  }

  initializeState() {
    const {gl} = this.context;
    this.setState({model: this._createModel(gl)});

    const {attributeManager} = this.state;
    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {size: 4, accessor: ['getPosition', 'getElevation'], update: this.calculateInstancePositions},
      instanceColors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateInstanceColors}
    });
    /* eslint-enable max-len */
  }

  updateState(opt) {
    super.updateState(opt);
    this.updateUniforms();
  }

  _createModel(gl) {
    const geometry = new CubeGeometry({});
    const shaders = assembleShaders(gl, this.getShaders());

    return new Model({
      gl,
      id: this.props.id,
      vs: shaders.vs,
      fs: shaders.fs,
      geometry,
      isInstanced: true
    });
  }

  updateUniforms() {
    const {opacity, extruded, elevationScale, latOffset, lonOffset, lightSettings} = this.props;

    this.setUniforms(Object.assign({}, {
      extruded,
      elevationScale,
      opacity,
      latOffset,
      lonOffset
    },
    lightSettings));
  }

  draw({uniforms}) {
    super.draw({uniforms: Object.assign({}, uniforms)});
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

GridLayer.layerName = 'GridLayer';
GridLayer.defaultProps = defaultProps;

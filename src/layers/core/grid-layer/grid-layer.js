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
import {GL, Model, CubeGeometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';
import {mat4} from 'gl-matrix';

const defaultGetPosition = x => x.position;
const defaultGetElevation = x => x.height;
const defaultGetColor = x => x.color;
const DEFAULT_COLOR = [255, 255, 255, 0];

const defaultProps = {
  id: 'grid-layer',
  data: [],
  latDelta: 0.0089,
  lngDelta: 0.0113,
  enable3d: true,
  opacity: 0.6,
  getPosition: defaultGetPosition,
  getElevation: defaultGetElevation,
  getColor: defaultGetColor
};

// viewMatrix added as Uniform for lighting calculation
const viewMatrixCompat = mat4.create();
mat4.lookAt(viewMatrixCompat, [0, 0, 0], [0, 0, -1], [0, 1, 0]);
const viewMatrix = new Float32Array(viewMatrixCompat);

export default class GridLayer extends Layer {

  /**
   * @classdesc
   * GridLayer
   * A generic GridLayer that takes latitude longitude delta of cells as a uniform
   * and the min lat lng of cells. grid can be 3d when pass in a height
   * and set enable3d to true
   *
   * @class
   * @param {object} props
   * @param {array} props.data -
   * @param {boolean} props.enable3d - enable grid height
   * @param {number} props.latDelta - grid cell size in lat delta
   * @param {number} props.lngDelta - grid cell size in lng delta
   * @param {number} props.opacity - opacity
   * @param {function} props.getPosition - position accessor, returned as [minLng, minLat]
   * @param {function} props.getElevation - elevation accessor
   * @param {function} props.getColor - color accessor, returned as [r, g, b]
   */
  constructor(props) {
    super(Object.assign({}, defaultProps, props));
  }

  getShaders() {
    const vertex = readFileSync(join(__dirname, './grid-layer-vertex.glsl'), 'utf8');
    const lighting = readFileSync(join(__dirname, './lighting.glsl'), 'utf8');
    const picking = readFileSync(join(__dirname, './picking.glsl'), 'utf8');
    const vs = picking.concat(lighting).concat(vertex);

    return {
      vs,
      fs: readFileSync(join(__dirname, './grid-layer-fragment.glsl'), 'utf8')
    };
  }

  initializeState() {
    const {gl} = this.context;
    this.setState({model: this._createModel(gl)});

    const {attributeManager} = this.state;
    attributeManager.addInstanced({
      instancePositions: {size: 4, update: this.calculateInstancePositions},
      instanceColors: {
        type: GL.UNSIGNED_BYTE,
        size: 4,
        update: this.calculateInstanceColors
      }
    });
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

  draw({uniforms}) {
    super.draw({uniforms: Object.assign({
      enable3d: this.props.enable3d ? 1 : 0,
      latDelta: this.props.latDelta,
      lngDelta: this.props.lngDelta,
      opacity: this.props.opacity,
      viewMatrix,
      testScale: 80
    }, uniforms)});
  }

  calculateInstancePositions(attribute) {
    const {data, getPosition, getElevation} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const position = getPosition(object);
      const height = getElevation(object) || 0;
      value[i + 0] = position[0];
      value[i + 1] = position[1];
      value[i + 2] = 0;
      value[i + 3] = height;
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
      value[i + 3] = isNaN(color[3]) ? DEFAULT_COLOR[3] : color[3];
      i += size;
    }
  }
}

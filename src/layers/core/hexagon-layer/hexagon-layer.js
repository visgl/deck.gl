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
import {Model, CylinderGeometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';
import assert from 'assert';
import {mat4} from 'gl-matrix';

function positionsAreEqual(v1, v2) {
  // Hex positions are expected to change entirely, not to maintain some
  // positions and change others. Right now we only check a single vertex,
  // because H3 guarantees order, but even if that wasn't true, this would only
  // return a false positive for adjacent hexagons, which is close enough for
  // our purposes.
  return v1 === v2 || (
    v1 && v2 && v1[0][0] === v2[0][0] && v1[0][1] === v2[0][1]
  );
}

const defaultProps = {
  id: 'hexagon-layer',
  data: [],
  dotRadius: 1,
  enable3d: true,
  hexagonVertices: null,
  invisibleColor: [0, 0, 0],
  getCentroid: x => x.centroid,
  getColor: x => x.color,
  getAlpha: x => 255,
  getElevation: x => x.elevation
};

// viewMatrix added as Uniform for lighting calculation
const viewMatrixCompat = mat4.create();
mat4.lookAt(viewMatrixCompat, [0, 0, 0], [0, 0, -1], [0, 1, 0]);
const viewMatrix = new Float32Array(viewMatrixCompat);

export default class HexagonLayer extends Layer {

  /**
   * @classdesc
   * HexagonLayer is a variation of grid layer, it is intended to render
   * hexagon tessellations. It supports elevation, lighting as well
   *
   * @class
   * @param {object} props
   * @param {number} props.data - all hexagons
   * @param {number} props.dotRadius - hexagon radius multiplier
   * @param {boolean} props.enable3d - if set to false, all hexagons will be flat
   * @param {array} props.hexagonVertices - primitive hexagon vertices as [[lon, lat]]
   * @param {object} props.invisibleColor - hexagon invisible color
   * @param {function} props.getCentroid - hexagon centroid should be formatted as [lon, lat]
   * @param {function} props.getColor -  hexagon color should be formatted as [255, 255, 255]
   * @param {function} props.alpha -  hexagon opacity should be from 0 - 255
   * @param {function} props.getElevation - hexagon elevation 1 unit approximate to 100 meters
   *
   */
  constructor(props) {
    assert(props.hexagonVertices, 'hexagonVertices must be supplied');
    assert(props.hexagonVertices.length === 6,
        'hexagonVertices should be an array of 6 [lon, lat] paris');
    super(props);
  }

  /**
   * DeckGL calls initializeState when GL context is available
   * Essentially a deferred constructor
   */
  initializeState() {
    const {gl} = this.context;
    this.setState({model: this.getModel(gl)});

    const {attributeManager} = this.state;
    attributeManager.addInstanced({
      instancePositions: {size: 3, update: this.calculateInstancePositions},
      instanceColors: {size: 4, update: this.calculateInstanceColors}
    });

    this.updateRadiusAngle();
  }

  updateState({props, oldProps, changeFlags: {dataChanged, viewportChanged}} = {}) {
    const {model, attributeManager} = this.state;

    if (dataChanged) {
      attributeManager.invalidateAll();
    }

    // Update the positions in the model if they've changes
    const verticesChanged =
      !positionsAreEqual(oldProps.hexagonVertices, props.hexagonVertices);

    if (model && (verticesChanged || viewportChanged)) {
      this.updateRadiusAngle();
    }

    this.updateUniforms();
  }

  updateRadiusAngle() {
    const {hexagonVertices: vertices, dotRadius} = this.props;

    const vertex0 = vertices[0];
    const vertex3 = vertices[3];

    // transform to space coordinates
    const spaceCoord0 = this.projectFlat(vertex0);
    const spaceCoord3 = this.projectFlat(vertex3);

    // distance between two close centroids
    const dx = spaceCoord0[0] - spaceCoord3[0];
    const dy = spaceCoord0[1] - spaceCoord3[1];
    const dxy = Math.sqrt(dx * dx + dy * dy);

    this.setUniforms({
      // Calculate angle that the perpendicular hexagon vertex axis is tilted
      angle: Math.acos(dx / dxy) * -Math.sign(dy) + Math.PI / 2,
      // Allow user to fine tune radius
      radius: dxy / 2 * Math.max(0, Math.min(1, dotRadius))
    });
  }

  getCylinderGeometry(radius) {
    return new CylinderGeometry({
      radius,
      topRadius: radius,
      bottomRadius: radius,
      topCap: true,
      bottomCap: true,
      height: 1,
      nradial: 6,
      nvertical: 1
    });
  }

  updateUniforms() {
    const {opacity, enable3d, invisibleColor} = this.props;
    this.setUniforms({
      enable3d: enable3d ? 1 : 0,
      invisibleColor,
      opacity
    });
  }

  getShaders() {
    const vertex = readFileSync(join(__dirname, './hexagon-layer-vertex.glsl'), 'utf8');
    const lighting = readFileSync(join(__dirname, './lighting.glsl'), 'utf8');
    const picking = readFileSync(join(__dirname, './picking.glsl'), 'utf8');
    const vs = picking.concat(lighting).concat(vertex);

    return {
      vs,
      fs: readFileSync(join(__dirname, './hexagon-layer-fragment.glsl'), 'utf8')
    };
  }

  getModel(gl) {
    const shaders = assembleShaders(gl, this.getShaders());

    return new Model({
      gl,
      id: this.props.id,
      vs: shaders.vs,
      fs: shaders.fs,
      geometry: this.getCylinderGeometry(1),
      isInstanced: true
    });
  }

  draw({uniforms}) {
    super.draw({uniforms: Object.assign({}, {viewMatrix}, uniforms)});
  }

  calculateInstancePositions(attribute) {
    const {data, getCentroid, getElevation} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const [lon, lat] = getCentroid(object);
      const elevation = getElevation(object);
      value[i + 0] = lon;
      value[i + 1] = lat;
      value[i + 2] = elevation || this.props.elevation;
      i += size;
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor, getAlpha} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const color = getColor(object);
      value[i + 0] = color[0];
      value[i + 1] = color[1];
      value[i + 2] = color[2];
      value[i + 3] = getAlpha(object);
      i += size;
    }
  }
}

HexagonLayer.layerName = 'HexagonLayer';
HexagonLayer.defaultProps = defaultProps;

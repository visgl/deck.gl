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
import {log} from '../../../lib/utils';

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

const DEFAULT_COLOR = [255, 0, 255, 255];

const defaultProps = {
  extruded: true,
  hexagonVertices: null,
  opacity: 0.8,
  radiusScale: 1,
  getCentroid: x => x.centroid,
  getColor: x => x.color,
  getElevation: x => x.elevation,
  lightSettings: {
    lightsPosition: [-122.45, 37.75, 8000, -122.0, 38.00, 5000],
    ambientRatio: 0.05,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [2.0, 0.0, 0.0, 0.0],
    numberOfLights: 2
  }
};

// // viewMatrix added as Uniform for lighting calculation
// const viewMatrixCompat = mat4.create();
// mat4.lookAt(viewMatrixCompat, [0, 0, 0], [0, 0, -1], [0, 1, 0]);
// const viewMatrix = new Float32Array(viewMatrixCompat);

export default class HexagonLayer extends Layer {

  /**
   * @classdesc
   * HexagonLayer is a variation of grid layer, it is intended to render
   * hexagon tessellations. It supports elevation, lighting as well
   *
   * @class
   * @param {object} props
   * @param {number} props.data - all hexagons
   * @param {number} props.radiusScale - hexagon radius multiplier
   * @param {boolean} props.extruded - if set to false, all hexagons will be flat
   * @param {array} props.hexagonVertices - primitive hexagon vertices as [[lon, lat]]
   * @param {function} props.getCentroid - hexagon centroid should be formatted as [lon, lat]
   * @param {function} props.getColor -  hexagon color should be formatted as [r, g, b, a]
   * @param {function} props.getElevation - hexagon elevation 1 unit approximate to 100 meters
   *
   */
  constructor(props) {
    if (!props.hexagonVertices) {
      log.once(0, 'hexagonVertices is missing, use default vertices of a 1 km radius hexagon');
    }

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
    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {size: 3, accessor: ['getCentroid', 'getElevation'], update: this.calculateInstancePositions},
      instanceColors: {size: 4, type: gl.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateInstanceColors}
    });
    /* eslint-enable max-len */

    this.updateRadiusAngle();
  }

  updateState(opt) {
    super.updateState(opt);

    const viewportChanged = opt.changeFlags.viewportChanged;
    const {model} = this.state;

    // Update the positions in the model if they've changes
    const verticesChanged =
      !positionsAreEqual(opt.oldProps.hexagonVertices, opt.props.hexagonVertices);

    if (model && (verticesChanged || viewportChanged)) {
      this.updateRadiusAngle();
    }

    this.updateUniforms();
  }

  updateRadiusAngle() {
    let vertices = this.props.hexagonVertices;
    let angle;
    let radius;

    if (!Array.isArray(vertices) || vertices.length !== 6) {
      vertices = _calculateDefaultVertices(this.props.data, this.props.getCentroid);
    }

    if (!vertices) {
      angle = 0;
      radius = 10;
    } else {

      const vertex0 = vertices[0];
      const vertex3 = vertices[3];

      // transform to space coordinates
      const spaceCoord0 = this.projectFlat(vertex0);
      const spaceCoord3 = this.projectFlat(vertex3);

      // distance between two close centroids
      const dx = spaceCoord0[0] - spaceCoord3[0];
      const dy = spaceCoord0[1] - spaceCoord3[1];
      const dxy = Math.sqrt(dx * dx + dy * dy);

      // Calculate angle that the perpendicular hexagon vertex axis is tilted
      angle = Math.acos(dx / dxy) * -Math.sign(dy) + Math.PI / 2;
      radius = dxy / 2;
    }

    this.setUniforms({
      angle,
      radius
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
    const {opacity, extruded, radiusScale, lightSettings} = this.props;

    this.setUniforms(Object.assign({}, {
      extruded,
      opacity,
      radiusScale
    },
    lightSettings));
  }

  getShaders() {
    const vertex = readFileSync(join(__dirname, './hexagon-layer-vertex.glsl'), 'utf8');
    const picking = readFileSync(join(__dirname, './picking.glsl'), 'utf8');
    const vs = picking.concat(vertex);
    return {
      vs,
      fs: readFileSync(join(__dirname, './hexagon-layer-fragment.glsl'), 'utf8'),
      modules: ['lighting']
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
    super.draw({uniforms: Object.assign({}, uniforms)});
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

// if hexagon vertices not provided, calculate a 1km radius hexagon
// at the first object's centroid location
function _calculateDefaultVertices(data, getCentroid) {

  const firstObject = Array.isArray(data) && data.length && data[0];

  if (!firstObject) {
    return null;
  }
  const R_EARTH = 6378;
  // get center [lon, lat] of first obejct
  const [cLon, cLat] = getCentroid(data[0]);

  // lat lon delta of 1 km at centerLat
  const latDelta = (1 / R_EARTH) * (180 / Math.PI);
  const lonDelta = (1 / R_EARTH) * (180 / Math.PI) / Math.cos(cLat * Math.PI / 180);

  const cos30 = Math.cos(30 / 180 * Math.PI);

  return [
    [cLon + lonDelta / 2, cLat + cos30 * latDelta],
    [cLon + lonDelta, cLat],
    [cLon + lonDelta / 2, cLat - cos30 * latDelta],
    [cLon - lonDelta / 2, cLat - cos30 * latDelta],
    [cLon - lonDelta, cLat],
    [cLon - lonDelta / 2, cLat + cos30 * latDelta]
  ];
}

HexagonLayer.layerName = 'HexagonLayer';
HexagonLayer.defaultProps = defaultProps;

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
import {GL, Model, CylinderGeometry} from 'luma.gl';
import {log} from '../../../lib/utils';
import {fp64ify, enable64bitSupport} from '../../../lib/utils/fp64';
import {COORDINATE_SYSTEM} from '../../../lib';

import vs from './hexagon-cell-layer-vertex.glsl';
import vs64 from './hexagon-cell-layer-vertex-64.glsl';
import fs from './hexagon-cell-layer-fragment.glsl';

const DEFAULT_COLOR = [255, 0, 255, 255];

const defaultProps = {
  hexagonVertices: null,
  radius: null,
  angle: null,
  coverage: 1,
  elevationScale: 1,
  extruded: true,
  fp64: false,

  getCentroid: x => x.centroid,
  getColor: x => x.color,
  getElevation: x => x.elevation,

  lightSettings: {
    lightsPosition: [-122.45, 37.75, 8000, -122.0, 38.00, 5000],
    ambientRatio: 0.4,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [1.2, 0.0, 0.8, 0.0],
    numberOfLights: 2
  }
};

export default class HexagonCellLayer extends Layer {

  constructor(props) {
    let missingProps = false;
    if (!props.hexagonVertices && (!props.radius || !Number.isFinite(props.angle))) {
      log.once(0, 'HexagonCellLayer: Either hexagonVertices or radius and angle are ' +
        'needed to calculate primitive hexagon.');
      missingProps = true;

    } else if (props.hexagonVertices && (!Array.isArray(props.hexagonVertices) ||
      props.hexagonVertices.length < 6)) {
      log.once(0, 'HexagonCellLayer: hexagonVertices needs to be an array of 6 points');

      missingProps = true;
    }

    if (missingProps) {
      log.once(0, 'Now using 1000 meter as default radius, 0 as default angle');
      props.radius = 1000;
      props.angle = 0;
    }

    super(props);
  }

  getShaders() {
    return enable64bitSupport(this.props) ?
      {vs: vs64, fs, modules: ['project64', 'lighting']} :
      {vs, fs, modules: ['lighting']}; // 'project' module added by default.
  }

  /**
   * DeckGL calls initializeState when GL context is available
   * Essentially a deferred constructor
   */
  initializeState() {
    const {gl} = this.context;
    this.setState({model: this._getModel(gl)});
    const {attributeManager} = this.state;
    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {size: 3, accessor: ['getCentroid', 'getElevation'],
        update: this.calculateInstancePositions},
      instanceColors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor',
        update: this.calculateInstanceColors}
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
            accessor: 'getCentroid',
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

    this.updateUniforms();
  }

  updateRadiusAngle() {
    let angle;
    let radius;
    const {hexagonVertices} = this.props;

    if (Array.isArray(hexagonVertices) && hexagonVertices.length >= 6) {

      // calculate angle and vertices from hexagonVertices if provided
      const vertices = this.props.hexagonVertices;

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

    } else if (this.props.radius && Number.isFinite(this.props.angle)) {

      // if no hexagonVertices provided, try use radius & angle
      const {viewport} = this.context;
      // TODO - this should be a standard uniform in project package
      const {pixelsPerMeter} = viewport.getDistanceScales();

      angle = this.props.angle;
      radius = this.props.radius * pixelsPerMeter[0];
    }

    return {angle, radius};
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
    const {opacity, elevationScale, extruded, coverage, lightSettings} = this.props;

    this.setUniforms(Object.assign({}, {
      extruded,
      opacity,
      coverage,
      elevationScale
    },
    lightSettings));
  }

  _getModel(gl) {
    return new Model(gl, Object.assign({}, this.getShaders(), {
      id: this.props.id,
      geometry: this.getCylinderGeometry(1),
      isInstanced: true,
      shaderCache: this.context.shaderCache
    }));
  }

  draw({uniforms}) {
    super.draw({uniforms: Object.assign(this.updateRadiusAngle(), uniforms)});
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
      value[i + 2] = elevation || 0;
      i += size;
    }
  }

  calculateInstancePositions64xyLow(attribute) {
    const {data, getCentroid} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      const position = getCentroid(object);
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

HexagonCellLayer.layerName = 'HexagonCellLayer';
HexagonCellLayer.defaultProps = defaultProps;

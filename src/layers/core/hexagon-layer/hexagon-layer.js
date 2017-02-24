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
  coverage: 1,
  elevationScale: 1,
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

export default class HexagonLayer extends Layer {

  constructor(props) {
    let missingProps = false;
    if (!props.hexagonVertices && (!props.radius || !Number.isFinite(props.angle))) {
      log.once(0, 'HexagonLayer: Either hexagonVertices or radius and angel are ' +
        'needed to calculate primitive hexagon.');
      missingProps = true;

    } else if (props.hexagonVertices && (!Array.isArray(props.hexagonVertices) ||
      props.hexagonVertices.length < 6)) {
      log.once(0, 'HexagonLayer: HexagonVertices needs to be an array of 6 points');

      missingProps = true;
    }

    if (missingProps) {
      log.once(0, 'Now using 1000 meter as default radius, 0 as default angel');
      props.radius = 1000;
      props.angle = 0;
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
      const {pixelsPerMeter} = viewport.getDistanceScales();

      angle = this.props.angle;
      radius = this.props.radius * pixelsPerMeter[0];

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
    const {opacity, elevationScale, extruded, coverage, lightSettings} = this.props;

    this.setUniforms(Object.assign({}, {
      extruded,
      opacity,
      coverage,
      elevationScale
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

HexagonLayer.layerName = 'HexagonLayer';
HexagonLayer.defaultProps = defaultProps;

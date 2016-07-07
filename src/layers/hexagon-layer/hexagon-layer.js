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
/* eslint-disable func-style */

import Layer from '../../layer';
import {Model, Program, CylinderGeometry} from 'luma.gl';
const glslify = require('glslify');

const ATTRIBUTES = {
  instancePositions: {size: 2, '0': 'x', '1': 'y'},
  instanceElevations: {size: 1, '0': 'z'},
  instanceColors: {size: 3, '0': 'red', '1': 'green', '2': 'blue'}
};

const _getCentroid = x => x.centroid;
const _getElevation = x => x.elevation || 0;
const _getColor = x => x.color || [255, 0, 0];
const _getVertices = x => x.vertices;

export default class HexagonLayer extends Layer {
  /**
   * @classdesc
   * HexagonLayer
   *
   * @class
   * @param {object} opts
   *
   * @param {number} opts.dotRadius - hexagon radius
   * @param {number} opts.elevation - hexagon height
   *
   * @param {function} opts.onHexagonHovered(index, e) - popup selected index
   * @param {function} opts.onHexagonClicked(index, e) - popup selected index
   */
  constructor({
    id = 'hexagon-layer',
    dotRadius = 10,
    elevation = 100,
    vertices,
    getCentroid = _getCentroid,
    getElevation = _getElevation,
    getColor = _getColor,
    getVertices = _getVertices,
    ...opts
  } = {}) {
    super({
      id,
      dotRadius,
      elevation,
      vertices,
      getCentroid,
      getElevation,
      getColor,
      getVertices,
      ...opts
    });
  }

  initializeState() {
    const {gl, attributeManager} = this.state;

    this.setState({
      model: this.getModel(gl)
    });

    attributeManager.addInstanced(ATTRIBUTES, {
      instancePositions: {update: this.calculateInstancePositions},
      instanceElevations: {update: this.calculateInstanceElevations},
      instanceColors: {update: this.calculateInstanceColors}
    });

    this.calculateRadiusAndAngle();

    this.setUniforms({
      elevation: this.props.elevation
    });
  }

  willReceiveProps(oldProps, newProps) {
    super.willReceiveProps(oldProps, newProps);

    const {dataChanged, viewportChanged, attributeManager} = this.state;

    if (dataChanged || viewportChanged) {
      this.calculateRadiusAndAngle();
    }
    if (dataChanged) {
      attributeManager.invalidateAll();
    }

    this.setUniforms({
      elevation: this.props.elevation
    });
  }

  getModel(gl) {
    const geometry = new CylinderGeometry({
      radius: 1,
      topRadius: 1,
      bottomRadius: 1,
      topCap: true,
      bottomCap: true,
      height: 1,
      nradial: 6,
      nvertical: 1
    });

    // const NUM_SEGMENTS = 6;
    // const PI2 = Math.PI * 2;

    // let vertices = [];
    // for (let i = 0; i < NUM_SEGMENTS; i++) {
    //   vertices = [
    //     ...vertices,
    //     Math.cos(PI2 * i / NUM_SEGMENTS),
    //     Math.sin(PI2 * i / NUM_SEGMENTS),
    //     0
    //   ];
    // }

    // const geometry = new Geometry({
    //   id: this.props.id,
    //   drawMode: 'TRIANGLE_FAN',
    //   vertices: new Float32Array(vertices)
    // });

    return new Model({
      id: this.props.id,
      program: new Program(gl, {
        vs: glslify('./hexagon-layer-vertex.glsl'),
        fs: glslify('./hexagon-layer-fragment.glsl'),
        id: 'hexagon'
      }),
      geometry,
      isInstanced: true
    });
  }

  calculateInstancePositions(attribute) {
    const {data, getCentroid} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const hexagon of data) {
      const centroid = getCentroid(hexagon);
      value[i + 0] = centroid[0];
      value[i + 1] = centroid[1];
      i += size;
    }
  }

  calculateInstanceElevations(attribute) {
    const {data, getElevation} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const hexagon of data) {
      const elevation = getElevation(hexagon) || 0;
      value[i + 0] = elevation;
      i += size;
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const hexagon of data) {
      const color = getColor(hexagon);
      value[i + 0] = color[0];
      value[i + 1] = color[1];
      value[i + 2] = color[2];
      i += 3;
    }
  }

  // TODO this is the only place that uses hexagon vertices
  // consider move radius and angle calculation to the shader
  calculateRadiusAndAngle() {
    const {data, getVertices} = this.props;
    if (!data || data.length === 0) {
      return;
    }

    // Either get vertices from prop, or from first hexagon
    let {vertices} = this.props;
    if (!vertices) {
      const firstHexagon = this.getFirstObject();
      vertices = getVertices(firstHexagon);
    }
    const vertex0 = vertices[0];
    const vertex3 = vertices[3];

    // transform to space coordinates
    const spaceCoord0 = this.project({lat: vertex0[1], lon: vertex0[0]});
    const spaceCoord3 = this.project({lat: vertex3[1], lon: vertex3[0]});

    // distance between two close centroids
    const dx = spaceCoord0.x - spaceCoord3.x;
    const dy = spaceCoord0.y - spaceCoord3.y;
    const dxy = Math.sqrt(dx * dx + dy * dy);

    this.setUniforms({
      // Calculate angle that the perpendicular hexagon vertex axis is tilted
      angle: Math.acos(dx / dxy) * -Math.sign(dy) + Math.PI / 2,
      // Allow user to fine tune radius
      radius: dxy / 2 * Math.min(1, this.props.dotRadius)
    });
  }
}

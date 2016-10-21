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

import {Layer, assembleShaders} from '../../../lib';
import {GL, Model, Program, Geometry} from 'luma.gl';
import {fp64ify} from '../../../lib/utils/fp64';

const glslify = require('glslify');

import {vec3} from 'gl-matrix';

import earcut from 'earcut';
import flattenDeep from 'lodash.flattendeep';

const ATTRIBUTES = {
  indices: {size: 1, 0: 'index', isIndexed: true},
  positions: {size: 4, 0: 'x', 2: 'y'},
  heights: {size: 2, 0: 'height'},
  normals: {size: 3, 0: 'x', 1: 'y', 2: 'z'},
  colors: {size: 3, 0: 'red', 1: 'green', 2: 'blue'}
};

export default class ExtrudedChoroplethLayer extends Layer {
  /**
   * @classdesc
   * BuildingLayer
   *
   * @class
   * @param {object} props
   * @param {bool} props.opacity=1 - default opacity is 1
   * @param {bool} props.elevation=1 - Elevation scale
   * @param {function} props.onHover - provides properties of the
   *    selected building, together with the mouse event when mouse hovered
   * @param {function} props.onClick - provide properties of the
   *    selected building, together with the mouse event when mouse clicked
   */
  constructor({
    opacity = 1,
    elevation = 1,
    ...props
  }) {
    super({
      opacity,
      elevation,
      ...props
    });
  }

  initializeState() {
    const {gl} = this.context;
    const {attributeManager} = this.state;
    const {
      elevation, color, ambientColor, pointLightColor,
      pointLightLocation, pointLightAmbientCoefficient,
      pointLightAttenuation, materialSpecularColor, materialShininess
    } = this.props;

    attributeManager.addDynamic(ATTRIBUTES, {
      // Primtive attributes
      indices: {update: this.calculateIndices},
      positions: {update: this.calculatePositions},
      heights: {update: this.calculateHeights},
      colors: {update: this.calculateColors},
      normals: {update: this.calculateNormals}
    });

    this.setState({
      numInstances: 0,
      model: this.getModel(gl)
    });

    this.setUniforms({
      elevation: Number.isFinite(elevation) ? elevation : 1,
      colors: color || [128, 128, 128],
      uAmbientColor: ambientColor || [255, 255, 255],
      uPointLightAmbientCoefficient: pointLightAmbientCoefficient || 0.1,
      uPointLightLocation: pointLightLocation || [40.4406, -79.9959, 100],
      uPointLightColor: pointLightColor || [255, 255, 255],
      uPointLightAttenuation: pointLightAttenuation || 1.0,
      uMaterialSpecularColor: materialSpecularColor || [255, 255, 255],
      uMaterialShininess: materialShininess || 1
    });

    this.extractExtrudedChoropleth();
  }

  willReceiveProps(oldProps, newProps) {
    super.willReceiveProps(oldProps, newProps);

    const {dataChanged, attributeManager} = this.state;
    if (dataChanged) {
      this.extractExtrudedChoropleth();
      attributeManager.invalidateAll();
    }
  }

  getModel(gl) {
    // Make sure we have 32 bit support
    // TODO - this could be done automatically by luma in "draw"
    // when it detects 32 bit indices
    if (!gl.getExtension('OES_element_index_uint')) {
      throw new Error('Extruded choropleth layer needs 32 bit indices');
    }
    // Buildings are 3d so depth test should be enabled
    // TODO - it is a little heavy handed to have a layer set this
    // Alternatively, check depth test and warn if not set, or add a prop
    // setDepthTest that is on by default.
    gl.enable(GL.DEPTH_TEST);
    gl.depthFunc(GL.LEQUAL);

    return new Model({
      id: this.props.id,
      program: new Program(gl, assembleShaders(gl, {
        vs: glslify('./extruded-choropleth-layer-vertex.glsl'),
        fs: glslify('./extruded-choropleth-layer-fragment.glsl'),
        fp64: true,
        project64: true
      })),
      geometry: new Geometry({
        id: this.props.id,
        drawMode: this.props.drawWireframe ? GL.LINES : GL.TRIANGLES
      }),
      vertexCount: 0,
      isIndexed: true
    });
  }

  draw({uniforms}) {
    this.state.model.render({
      ...uniforms
    });
  }

  // each top vertex is on 3 surfaces
  // each bottom vertex is on 2 surfaces
  calculatePositions(attribute) {

    let {positions} = this.state;
    if (!positions) {
      positions = flattenDeep(this.state.groupedVertices.map(
        vertices => {
          const topVertices = Array.prototype.concat.apply([], vertices);
          const baseVertices = topVertices.map(v => [v[0], v[1], 0]);
          return this.props.drawWireframe ? [topVertices, baseVertices] :
            [topVertices, topVertices, topVertices, baseVertices, baseVertices];
        }
      ));
    }

    attribute.value = new Float32Array(positions.length / 3 * 4);

    for (let i = 0; i < positions.length / 3; i++) {
      [attribute.value[i * 4 + 0], attribute.value[i * 4 + 1]] = fp64ify(positions[i * 3 + 0]);
      [attribute.value[i * 4 + 2], attribute.value[i * 4 + 3]] = fp64ify(positions[i * 3 + 1]);
    }
  }

  calculateHeights(attribute) {
    let {positions} = this.state;
    if (!positions) {
      positions = flattenDeep(this.state.groupedVertices.map(
        vertices => {
          const topVertices = Array.prototype.concat.apply([], vertices);
          const baseVertices = topVertices.map(v => [v[0], v[1], 0]);
          return this.props.drawWireframe ? [topVertices, baseVertices] :
            [topVertices, topVertices, topVertices, baseVertices, baseVertices];
        }
      ));
    }

    attribute.value = new Float32Array(positions.length / 3 * 2);
    for (let i = 0; i < positions.length / 3; i++) {
      [attribute.value[i * 2 + 0], attribute.value[i * 2 + 1]] =
       fp64ify(positions[i * 3 + 2] + 0.1);
    }
  }

  calculateNormals(attribute) {
    const up = [0, 1, 0];

    const normals = this.state.groupedVertices.map(
      (vertices, buildingIndex) => {
        const topNormals = new Array(countVertices(vertices)).fill(up);
        const sideNormals = vertices.map(polygon =>
          this.calculateSideNormals(polygon));
        const sideNormalsForward = sideNormals.map(n => n[0]);
        const sideNormalsBackward = sideNormals.map(n => n[1]);

        return this.props.drawWireframe ? [topNormals, topNormals] :
          [topNormals, sideNormalsForward, sideNormalsBackward,
            sideNormalsForward, sideNormalsBackward];
      }
    );

    attribute.value = new Float32Array(flattenDeep(normals));
  }

  calculateSideNormals(vertices) {
    const numVertices = vertices.length;
    const normals = [];

    for (let i = 0; i < numVertices - 1; i++) {
      const n = getNormal(vertices[i], vertices[i + 1]);
      normals.push(n);
    }

    return [
      [...normals, normals[0]],
      [normals[0], ...normals]
    ];
  }

  calculateIndices(attribute) {
    // adjust index offset for multiple buildings
    const multiplier = this.props.drawWireframe ? 2 : 5;
    const offsets = this.state.groupedVertices.reduce(
      (acc, vertices) =>
        [...acc, acc[acc.length - 1] + countVertices(vertices) * multiplier],
      [0]
    );

    const indices = this.state.groupedVertices.map(
      (vertices, buildingIndex) => this.props.drawWireframe ?
        // 1. get sequentially ordered indices of each building wireframe
        // 2. offset them by the number of indices in previous buildings
        this.calculateContourIndices(vertices, offsets[buildingIndex]) :
        // 1. get triangulated indices for the internal areas
        // 2. offset them by the number of indices in previous buildings
        this.calculateSurfaceIndices(vertices, offsets[buildingIndex])
    );

    attribute.value = new Uint32Array(flattenDeep(indices));
    attribute.target = GL.ELEMENT_ARRAY_BUFFER;
    this.state.model.setVertexCount(attribute.value.length / attribute.size);
  }

  calculateColors(attribute) {
    const colors = this.state.groupedVertices.map(
      (vertices, buildingIndex) => {
        const {color} = this.props;
        const baseColor = Array.isArray(color) ? color[0] : color;
        const topColor = Array.isArray(color) ?
          color[color.length - 1] : color;
        const numVertices = countVertices(vertices);

        const topColors = new Array(numVertices).fill(topColor);
        const baseColors = new Array(numVertices).fill(baseColor);
        return this.props.drawWireframe ? [topColors, baseColors] :
          [topColors, topColors, topColors, baseColors, baseColors];
      }
    );

    attribute.value = new Float32Array(flattenDeep(colors));
  }

  extractBuildingsOld() {
    const {data} = this.props;

    this.state.buildings = [];

    data.features.map(building => {
      const {properties, geometry} = building;
      const {coordinates, type} = geometry;
      if (type === 'MultiPolygon') {
        const buildings = coordinates.map(coords => ({
          coordinates: coords,
          properties
        }));
        this.state.buildings.push(...buildings);
      } else if (type === 'Polygon') {
        this.state.buildings.push({coordinates, properties});
      }
      // TODO - ignoring points
    });
    try {
      this.state.groupedVertices = this.state.buildings.map(
        building => {
          const height = building.properties.height || 5;
          return building.coordinates.map(
            polygon => polygon.map(
              coordinate => [coordinate[0], coordinate[1], height]
            )
          );
        }
      );
    } catch (err) {
      // console.log(err);
    }
  }

  extractExtrudedChoropleth() {
    const {data} = this.props;
    // Generate a flat list of buildings
    this.state.buildings = [];
    for (const building of data.features) {
      const {properties, geometry: {coordinates, type}} = building;
      switch (type) {
      case 'MultiPolygon':
        // Maps to multiple buildings
        const buildings = coordinates.map(
          coords => ({coordinates: coords, properties})
        );
        this.state.buildings.push(...buildings);
        break;
      case 'Polygon':
        // Maps to a single building
        this.state.buildings.push({coordinates, properties});
        break;
      default:
        // We are ignoring Points for now
      }
    }

    // Generate vertices for the building list
    this.state.groupedVertices = this.state.buildings.map(
      building => building.coordinates.map(
        polygon => polygon.map(
          coordinate => [
            coordinate[0],
            coordinate[1],
            building.properties.height || 10
          ]
        )
      )
    );
  }

  calculateContourIndices(vertices, offset) {
    const stride = countVertices(vertices);

    return vertices.map(polygon => {
      const indices = [offset];
      const numVertices = polygon.length;

      // building top
      // use vertex pairs for GL.LINES => [0, 1, 1, 2, 2, ..., n-1, n-1, 0]
      for (let i = 1; i < numVertices - 1; i++) {
        indices.push(i + offset, i + offset);
      }
      indices.push(offset);

      // building sides
      for (let i = 0; i < numVertices - 1; i++) {
        indices.push(i + offset, i + stride + offset);
      }

      offset += numVertices;
      return indices;
    });
  }

  calculateSurfaceIndices(vertices, offset) {
    const stride = countVertices(vertices);
    let holes = null;
    const quad = [
      [0, 1], [0, 3], [1, 2],
      [1, 2], [0, 3], [1, 4]
    ];

    if (vertices.length > 1) {
      holes = vertices.reduce(
        (acc, polygon) => [...acc, acc[acc.length - 1] + polygon.length],
        [0]
      ).slice(1, vertices.length);
    }

    const topIndices = earcut(flattenDeep(vertices), holes, 3)
      .map(index => index + offset);

    const sideIndices = vertices.map(polygon => {
      const numVertices = polygon.length;
      // building top
      const indices = [];

      // building sides
      for (let i = 0; i < numVertices - 1; i++) {
        indices.push(...drawRectangle(i));
      }

      offset += numVertices;
      return indices;
    });

    return [topIndices, sideIndices];

    function drawRectangle(i) {
      return quad.map(v => i + v[0] + stride * v[1] + offset);
    }
  }

  onHover(info) {
    const {index} = info;
    const {data} = this.props;
    const feature = data.features[index];
    this.props.onHover({...info, feature});
  }

  onClick(info) {
    const {index} = info;
    const {data} = this.props;
    const feature = data.features[index];
    this.props.onClick({...info, feature});
  }
}

/*
 * helpers
 */
// get normal vector of line segment
function getNormal(p1, p2) {
  if (p1[0] === p2[0] && p1[1] === p2[1]) {
    return [1, 0, 0];
  }

  const degrees2radians = Math.PI / 180;

  const lon1 = degrees2radians * p1[0];
  const lon2 = degrees2radians * p2[0];
  const lat1 = degrees2radians * p1[1];
  const lat2 = degrees2radians * p2[1];

  const a = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const b = Math.cos(lat1) * Math.sin(lat2) -
     Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

  return vec3.normalize([], [b, 0, -a]);
}

// count number of vertices in geojson polygon
function countVertices(vertices) {
  return vertices.reduce((count, polygon) => count + polygon.length, 0);
}

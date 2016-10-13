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

import {BaseLayer} from '../../../lib';
import earcut from 'earcut';
import flattenDeep from 'lodash.flattendeep';
import normalize from 'geojson-normalize';
import {Model, Program, Geometry, glGetDebugInfo} from 'luma.gl';
import {checkRendererVendor} from '../../../lib/utils/check-renderer-vendor';

const glslify = require('glslify');

const DEFAULT_COLOR = [0, 0, 255];

const defaultGetColor = feature => feature.properties.color;

export default class ChoroplethLayer extends BaseLayer {
  /**
   * @classdesc
   * ChoroplethLayer
   *
   * @class
   * @param {object} props
   * @param {bool} props.drawContour - ? drawContour : drawArea
   * @param {function} props.onChoroplethHovered - provide proerties of the
   * selected choropleth, together with the mouse event when mouse hovered
   * @param {function} props.onChoroplethClicked - provide proerties of the
   * selected choropleth, together with the mouse event when mouse clicked
   */
  constructor(props) {
    super({
      strokeWidth: 1,
      opacity: 1,
      getColor: defaultGetColor,
      ...props
    });
  }

  initializeState() {
    const {gl, attributeManager} = this.state;

    const model = this.getModel(gl);
    model.userData.strokeWidth = this.props.strokeWidth;

    attributeManager.addDynamic({
      // Primtive attributes
      indices: {size: 1, update: this.calculateIndices, isIndexed: true},
      positions: {size: 3, update: this.calculatePositions},
      colors: {size: 3, update: this.calculateColors},
      // Instanced attributes
      pickingColors:
        {size: 3, update: this.calculatePickingColors, noAlloc: true}
    });

    const IndexType = gl.getExtension('OES_element_index_uint') ?
      Uint32Array : Uint16Array;

    this.setUniforms({opacity: this.props.opacity});
    this.setState({
      numInstances: 0,
      IndexType,
      model
    });

    this.state.choropleths = extractChoropleths(this.props.data);
  }

  willReceiveProps(oldProps, newProps) {
    super.willReceiveProps(oldProps, newProps);

    const {dataChanged, attributeManager} = this.state;
    if (dataChanged) {
      this.state.choropleths = extractChoropleths(newProps.data);

      attributeManager.invalidateAll();
    }

    if (oldProps.opacity !== newProps.opacity) {
      this.setUniforms({opacity: newProps.opacity});
    }
    this.state.model.userData.strokeWidth = newProps.strokeWidth || 1;
  }

  getModel(gl) {
    let intelDef = '';
    const debugInfo = glGetDebugInfo(gl);

    if (checkRendererVendor(debugInfo, 'intel')) {
      intelDef += '#define INTEL_WORKAROUND 1\n';
    }

    return new Model({
      program: new Program(gl, {
        vs: intelDef + glslify('./choropleth-layer-vertex.glsl'),
        fs: glslify('./choropleth-layer-fragment.glsl'),
        id: 'choropleth'
      }),
      geometry: new Geometry({
        id: this.props.id,
        drawMode: this.props.drawContour ? 'LINES' : 'TRIANGLES'
      }),
      vertexCount: 0,
      isIndexed: true,
      onBeforeRender() {
        this.userData.oldStrokeWidth = gl.getParameter(gl.LINE_WIDTH);
        this.program.gl.lineWidth(this.userData.strokeWidth);
      },
      onAfterRender() {
        this.program.gl.lineWidth(this.userData.oldStrokeWidth);
      }
    });
  }

  calculateIndices(attribute) {
    // adjust index offset for multiple choropleths
    const offsets = this.state.choropleths.reduce(
      (acc, choropleth) => [...acc, acc[acc.length - 1] +
        choropleth.reduce((count, polygon) => count + polygon.length, 0)],
      [0]
    );
    const {IndexType} = this.state;
    if (IndexType === Uint16Array && offsets[offsets.length - 1] > 65535) {
      throw new Error('Vertex count exceeds browser\'s limit');
    }

    const indices = this.state.choropleths.map(
      (choropleth, choroplethIndex) => this.props.drawContour ?
        // 1. get sequentially ordered indices of each choropleth contour
        // 2. offset them by the number of indices in previous choropleths
        calculateContourIndices(choropleth).map(
          index => index + offsets[choroplethIndex]
        ) :
        // 1. get triangulated indices for the internal areas
        // 2. offset them by the number of indices in previous choropleths
        calculateSurfaceIndices(choropleth).map(
          index => index + offsets[choroplethIndex]
        )
    );

    attribute.value = new IndexType(flattenDeep(indices));
    attribute.target = this.state.gl.ELEMENT_ARRAY_BUFFER;
    this.state.model.setVertexCount(attribute.value.length / attribute.size);
  }

  calculatePositions(attribute) {
    const vertices = flattenDeep(this.state.choropleths);
    attribute.value = new Float32Array(vertices);
  }

  calculateColors(attribute) {
    const {data: {features}, getColor} = this.props;

    const colors = this.state.choropleths.map(
      (choropleth, choroplethIndex) => {
        const feature = features[choropleth.featureIndex];
        const color = getColor(feature) || DEFAULT_COLOR;
        return choropleth.map(polygon =>
          polygon.map(vertex => color)
        );
      }
    );

    attribute.value = new Float32Array(flattenDeep(colors));
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {

    const colors = this.state.choropleths.map(
      (choropleth, choroplethIndex) => {
        const {featureIndex} = choropleth;
        const color = this.props.drawContour ? [-1, -1, -1] : [
          (featureIndex + 1) % 256,
          Math.floor((featureIndex + 1) / 256) % 256,
          Math.floor((featureIndex + 1) / 256 / 256) % 256];
        return choropleth.map(polygon =>
          polygon.map(vertex => color)
        );
      }
    );

    attribute.value = new Float32Array(flattenDeep(colors));
  }

  onHover(info) {
    const {color} = info;
    const index = color[0] + color[1] * 256 + color[2] * 256 * 256 - 1;
    const {data} = this.props;
    const feature = data.features[index];
    this.props.onHover({...info, feature});
  }

  onClick(info) {
    const {color} = info;
    const index = color[0] + color[1] * 256 + color[2] * 256 * 256 - 1;
    const {data} = this.props;
    const feature = data.features[index];
    this.props.onClick({...info, feature});
  }

}

/*
 * converts list of features from a GeoJSON object to a list of GeoJSON
 * polygon-style coordinates
 * @param {Object} data - geojson object
 * @returns {[Number,Number,Number][][][]} array of choropleths
 */
function extractChoropleths(data) {
  const normalizedGeojson = normalize(data);
  const result = [];

  normalizedGeojson.features.map((feature, featureIndex) => {
    const choropleths = featureToChoropleths(feature);
    choropleths.forEach(choropleth => {
      choropleth.featureIndex = featureIndex;
    });
    result.push(...choropleths);
  });
  return result;
}

/*
 * converts one GeoJSON features from object to a list of GeoJSON polygon-style
 * coordinates
 * @param {Object} data - geojson object
 * @returns {[Number,Number,Number][][][]} array of choropleths
 */
function featureToChoropleths(feature) {
  const {coordinates, type} = feature.geometry;
  let choropleths;

  switch (type) {
  case 'MultiPolygon':
    choropleths = coordinates;
    break;
  case 'Polygon':
    choropleths = [coordinates];
    break;
  case 'LineString':
    // create a LineStringLayer for LineString and MultiLineString?
    choropleths = [[coordinates]];
    break;
  case 'MultiLineString':
    choropleths = coordinates.map(coords => [coords]);
    break;
  default:
    choropleths = [];
  }
  return choropleths.map(
    choropleth => choropleth.map(
      polygon => polygon.map(
        coordinate => [coordinate[0], coordinate[1], coordinate[2] || 0]
      )
    )
  );
}

/*
 * get vertex indices for drawing choropleth contour
 * @param {[Number,Number,Number][][]} choropleth
 * @returns {[Number]} indices
 */
function calculateContourIndices(choropleth) {
  let offset = 0;

  return choropleth.reduce((acc, polygon) => {
    const numVertices = polygon.length;

    // use vertex pairs for gl.LINES => [0, 1, 1, 2, 2, ..., n-2, n-2, n-1]
    const indices = [...acc, offset];
    for (let i = 1; i < numVertices - 1; i++) {
      indices.push(i + offset, i + offset);
    }
    indices.push(offset + numVertices - 1);

    offset += numVertices;
    return indices;
  }, []);
}

/*
 * get vertex indices for drawing choropleth mesh
 * @param {[Number,Number,Number][][]} choropleth
 * @returns {[Number]} indices
 */
function calculateSurfaceIndices(choropleth) {
  let holes = null;

  if (choropleth.length > 1) {
    holes = choropleth.reduce(
      (acc, polygon) => [...acc, acc[acc.length - 1] + polygon.length],
      [0]
    ).slice(1, choropleth.length);
  }

  return earcut(flattenDeep(choropleth), holes, 3);
}

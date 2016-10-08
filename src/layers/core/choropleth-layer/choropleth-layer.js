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
const glslify = require('glslify');

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
      opacity: 1,
      ...props
    });
  }

  initializeState() {
    const {gl, attributeManager} = this.state;

    attributeManager.addDynamic({
      // Primtive attributes
      indices: {size: 1, update: this.calculateIndices, isIndexed: true},
      positions: {size: 3, update: this.calculatePositions},
      colors: {size: 3, update: this.calculateColors},
      // Instanced attributes
      pickingColors:
        {size: 3, update: this.calculatePickingColors, noAlloc: true}
    });

    this.setUniforms({opacity: this.props.opacity});
    this.setState({
      numInstances: 0,
      model: this.getModel(gl)
    });

    this.extractChoropleths();
  }

  willReceiveProps(oldProps, newProps) {
    super.willReceiveProps(oldProps, newProps);

    const {dataChanged, attributeManager} = this.state;
    if (dataChanged) {
      this.extractChoropleths();

      attributeManager.invalidateAll();
    }

    if (oldProps.opacity !== newProps.opacity) {
      this.setUniforms({opacity: newProps.opacity});
    }
  }

  getModel(gl) {
    let intel_ifdef = '';

    if (glGetDebugInfo(gl).vendor.match(/Intel/)) {
      intel_ifdef += '#define INTEL_WORKAROUND 1\n';
    }

    return new Model({
      program: new Program(gl, {
        vs: intel_ifdef + glslify('./choropleth-layer-vertex.glsl'),
        fs: glslify('./choropleth-layer-fragment.glsl'),
        id: 'choropleth'
      }),
      geometry: new Geometry({
        id: this.props.id,
        drawMode: this.props.drawContour ? 'LINES' : 'TRIANGLES'
      }),
      vertexCount: 0,
      isIndexed: true
    });
  }

  extractChoropleths() {
    const {data} = this.props;
    const normalizedGeojson = normalize(data);

    this.state.choropleths = normalizedGeojson.features.map(choropleth => {
      let coordinates = choropleth.geometry.coordinates[0];
      // flatten nested polygons
      if (coordinates.length === 1 && coordinates[0].length > 2) {
        coordinates = coordinates[0];
      }
      return {
        properties: choropleth.properties,
        coordinates
      };
    });

    this.state.groupedVertices = this.state.choropleths.map(
      choropleth => choropleth.coordinates.map(
        coordinate => [coordinate[0], coordinate[1], 0]
      )
    );
    this.state.groupedVerticesColors = this.state.choropleths.map(
      choropleth => choropleth.coordinates.map(
        coordinate => choropleth.properties.color || [128, 128, 128]
      )
    );
  }

  calculateContourIndices(numVertices) {
    // use vertex pairs for gl.LINES => [0, 1, 1, 2, 2, ..., n-1, n-1, 0]
    let indices = [];
    for (let i = 1; i < numVertices - 1; i++) {
      indices = [...indices, i, i];
    }
    return [0, ...indices, 0];

  }

  calculateIndices(attribute) {
    // adjust index offset for multiple choropleths
    const offsets = this.state.groupedVertices.reduce(
      (acc, vertices) => [...acc, acc[acc.length - 1] + vertices.length],
      [0]
    );

    const indices = this.state.groupedVertices.map(
      (vertices, choroplethIndex) => this.props.drawContour ?
        // 1. get sequentially ordered indices of each choropleth contour
        // 2. offset them by the number of indices in previous choropleths
        this.calculateContourIndices(vertices.length).map(
          index => index + offsets[choroplethIndex]
        ) :
        // 1. get triangulated indices for the internal areas
        // 2. offset them by the number of indices in previous choropleths
        earcut(flattenDeep(vertices), null, 3).map(
          index => index + offsets[choroplethIndex]
        )
    );

    attribute.value = new Uint16Array(flattenDeep(indices));
    attribute.target = this.state.gl.ELEMENT_ARRAY_BUFFER;
    this.state.model.setVertexCount(attribute.value.length / attribute.size);
  }

  calculatePositions(attribute) {
    const vertices = flattenDeep(this.state.groupedVertices);
    attribute.value = new Float32Array(vertices);
  }

  calculateColors(attribute) {
    const colors = this.state.groupedVerticesColors.map(
      colors => colors.map(
        color => this.props.drawContour ?
          // TODO - why destructure and rebuild array?
          [0, 0, 0] : [color[0], color[1], color[2]]
      )
    );

    attribute.value = new Float32Array(flattenDeep(colors));
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {
    const colors = this.state.groupedVertices.map(
      (vertices, choroplethIndex) => vertices.map(
        vertex => this.props.drawContour ? [-1, -1, -1] : [
          (choroplethIndex + 1) % 256,
          Math.floor((choroplethIndex + 1) / 256) % 256,
          Math.floor((choroplethIndex + 1) / 256 / 256) % 256]
      )
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

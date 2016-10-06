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
import {Model, Program, Geometry} from 'luma.gl';
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

    const indexType = gl.getExtension('OES_element_index_uint') ?
      Uint32Array : Uint16Array;

    this.setUniforms({opacity: this.props.opacity});
    this.setState({
      numInstances: 0,
      indexType,
      model
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
    this.state.model.userData.strokeWidth = newProps.strokeWidth;
  }

  getModel(gl) {
    return new Model({
      program: new Program(gl, {
        vs: glslify('./choropleth-layer-vertex.glsl'),
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
        this.program.gl.lineWidth(this.userData.strokeWidth || 1);
      },
      onAfterRender() {
        this.program.gl.lineWidth(this.userData.oldStrokeWidth || 1);
      }
    });
  }

  extractChoropleths() {
    const {data} = this.props;
    const normalizedGeojson = normalize(data);

    this.state.choropleths = [];

    normalizedGeojson.features.map((feature, featureIndex) => {
      const {properties, geometry} = feature;
      const {coordinates, type} = geometry;
      if (type === 'MultiPolygon') {
        const choropleths = coordinates.map(coords => ({
          coordinates: coords,
          featureIndex
        }));
        this.state.choropleths.push(...choropleths);
      } else if (type === 'Polygon') {
        this.state.choropleths.push({coordinates, featureIndex});
      }
    });

    this.state.groupedVertices = this.state.choropleths.map(
      choropleth => {
        return choropleth.coordinates.map(
          polygon => polygon.map(
            coordinate => [coordinate[0], coordinate[1], 0]
          )
        );
      }
    );

  }

  calculateContourIndices(vertices) {
    let offset = 0;

    return vertices.reduce((acc, polygon) => {
      const numVertices = polygon.length;

      // use vertex pairs for gl.LINES => [0, 1, 1, 2, 2, ..., n-1, n-1, 0]
      let indices = [...acc, offset];
      for (let i = 1; i < numVertices - 1; i++) {
        indices.push(i + offset, i + offset);
      }
      indices.push(offset);

      offset += numVertices;
      return indices;
    }, []);
  }

  calculateSurfaceIndices(vertices) {
    let holes = null;

    if (vertices.length > 1) {
      holes = vertices.reduce(
        (acc, polygon) => [...acc, acc[acc.length - 1] + polygon.length],
        [0]
      ).slice(1, vertices.length);
    }

    return earcut(flattenDeep(vertices), holes, 3);
  }

  calculateIndices(attribute) {
    // adjust index offset for multiple choropleths
    const offsets = this.state.groupedVertices.reduce(
      (acc, vertices) => [...acc, acc[acc.length - 1] +
        vertices.reduce((count, polygon) => count + polygon.length, 0)],
      [0]
    );
    const {indexType} = this.state;
    if(indexType === Uint16Array && offsets[offsets.length - 1] > 65535) {
      throw new Error('Vertex count exceeds browser\'s limit');
    }

    const indices = this.state.groupedVertices.map(
      (vertices, choroplethIndex) => this.props.drawContour ?
        // 1. get sequentially ordered indices of each choropleth contour
        // 2. offset them by the number of indices in previous choropleths
        this.calculateContourIndices(vertices).map(
          index => index + offsets[choroplethIndex]
        ) :
        // 1. get triangulated indices for the internal areas
        // 2. offset them by the number of indices in previous choropleths
        this.calculateSurfaceIndices(vertices).map(
          index => index + offsets[choroplethIndex]
        )
    );

    attribute.value = new indexType(flattenDeep(indices));
    attribute.target = this.state.gl.ELEMENT_ARRAY_BUFFER;
    this.state.model.setVertexCount(attribute.value.length / attribute.size);
  }

  calculatePositions(attribute) {
    const vertices = flattenDeep(this.state.groupedVertices);
    attribute.value = new Float32Array(vertices);
  }

  calculateColors(attribute) {
    const {data: {features}, getColor} = this.props;

    const colors = this.state.groupedVertices.map(
      (vertices, choroplethIndex) => {
        const choropleth = this.state.choropleths[choroplethIndex];
        const feature = features[choropleth.featureIndex];
        const color = getColor(feature) || DEFAULT_COLOR;
        return vertices.map(polygon => polygon.map(vertex => color));
      }
    );

    attribute.value = new Float32Array(flattenDeep(colors));
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {

    const colors = this.state.groupedVertices.map(
      (vertices, choroplethIndex) => {
        const choropleth = this.state.choropleths[choroplethIndex];
        const {featureIndex} = choropleth;
        const color = this.props.drawContour ? [-1, -1, -1] : [
          (featureIndex + 1) % 256,
          Math.floor((featureIndex + 1) / 256) % 256,
          Math.floor((featureIndex + 1) / 256 / 256) % 256];
        return vertices.map(polygon => polygon.map(vertex => color));
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

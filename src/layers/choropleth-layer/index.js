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

import BaseMapLayer from '../base-map-layer';
import earcut from 'earcut';
import flattenDeep from 'lodash.flattendeep';
import normalize from 'geojson-normalize';

const glslify = require('glslify');

export default class ChoroplethLayer extends BaseMapLayer {
  /**
   * @classdesc
   * ChoroplethLayer
   *
   * @class
   * @param {object} opts
   * @param {bool} opts.drawContour - ? drawContour : drawArea
   * @param {function} opts.onChoroplethHovered - provide proerties of the
   * selected choropleth, together with the mouse event when mouse hovered
   * @param {function} opts.onChoroplethClicked - provide proerties of the
   * selected choropleth, together with the mouse event when mouse clicked
   */
  constructor(opts) {
    super(opts);

    this.drawContour = opts.drawContour;

    this.onObjectHovered = this._onChoroplethHovered;
    this.onObjectClicked = this._onChoroplethClicked;
  }

  updateLayer() {
    if (this.dataChanged) {
      this._allocateGLBuffers();
      this._extractChoropleths();
      this._calculateVertices();
      this._calculateIndices();
      this._calculateColors();
      this._calculatePickingColors();
    }

    // TODO change getters to setters
    this._primitive = this.getLayerPrimitive();
    this.setLayerUniforms();
    this.setLayerAttributes();
  }

  getLayerShader() {
    return {
      id: this.id,
      from: 'sources',
      vs: glslify('./vertex.glsl'),
      fs: glslify('./fragment.glsl')
    };
  }

  getLayerPrimitive() {
    if (!this.cache || !this.cache.indices) {
      return {};
    }

    return {
      id: this.id,
      drawType: this.drawContour ? 'LINES' : 'TRIANGLES',
      indices: this.cache.indices,
      instanced: false
    };
  }

  setLayerUniforms() {
    this._uniforms = {
      ...this._uniforms,
      opacity: this.opacity
    };
  }

  setLayerAttributes() {
    this._attributes = {
      ...this.attribute,
      vertices: {
        value: this.cache.vertices,
        size: 3
      },
      colors: {
        value: this.cache.colors,
        size: 3
      }
    };

    if (!this.isPickable) {
      return;
    }

    this._attributes.pickingColors = {
      value: this.cache.pickingColors,
      instanced: 1,
      size: 3
    };
  }

  _allocateGLBuffers() {
    const N = this._numInstances;

    this.cache.positions = new Float32Array(N * 3);
    this.cache.colors = new Float32Array(N * 3);

    if (!this.isPickable) {
      return;
    }

    this.cache.pickingColors = new Float32Array(N * 3);
  }

  _extractChoropleths() {
    if (this.cache.choropleths) {
      return;
    }

    const normalizedGeojson = normalize(this.data);

    this.cache.choropleths = normalizedGeojson.features.map(choropleth => {
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
  }

  _calculateVertices() {
    this.cache.groupedVertices = this.cache.choropleths.map(
      choropleth => choropleth.coordinates.map(
        coordinate => [coordinate[0], coordinate[1], 100]
      )
    );

    const vertices = flattenDeep(this.cache.groupedVertices);
    this.cache.vertices = new Float32Array(vertices);
  }

  _calculateIndices() {
    // adjust index offset for multiple choropleths
    const offsets = this.cache.groupedVertices.reduce(
      (acc, vertices) => [...acc, acc[acc.length - 1] + vertices.length],
      [0]
    );

    const indices = this.cache.groupedVertices.map(
      (vertices, choroplethIndex) => this.drawContour ?
        // 1. get sequentially ordered indices of each choropleth contour
        // 2. offset them by the number of indices in previous choropleths
        this._calculateContourIndices(vertices.length).map(
          index => index + offsets[choroplethIndex]
        ) :
        // 1. get triangulated indices for the internal areas
        // 2. offset them by the number of indices in previous choropleths
        earcut(flattenDeep(vertices), null, 3).map(
          index => index + offsets[choroplethIndex]
        )
    );

    this.cache.indices = new Uint16Array(flattenDeep(indices));
  }

  _calculateColors() {
    const colors = this.cache.groupedVertices.map(
      vertices => vertices.map(
        vertex => this.drawContour ? [0, 0, 0] : [128, 128, 128]
      )
    );

    this.cache.colors = new Float32Array(flattenDeep(colors));
  }

  _calculatePickingColors() {
    if (!this.isPickable) {
      return;
    }

    const pickingColors = this.cache.vertices.map(
      (vertices, choroplethIndex) => vertices.map(
        vertex => this.drawContour ? [-1, -1, -1] : [
          (choroplethIndex + 1) % 256,
          Math.floor((choroplethIndex + 1) / 256) % 256,
          this.layerIndex
        ]
      )
    );

    this.cache.pickingColors = new Float32Array(flattenDeep(pickingColors));
  }

  _calculateContourIndices(numVertices) {
    // use vertex pairs for gl.LINES => [0, 1, 1, 2, 2, ..., n-1, n-1, 0]
    let indices = [];
    for (let i = 1; i < numVertices - 1; i++) {
      indices = [...indices, i, i];
    }
    return [0, ...indices, 0];
  }

  _onChoroplethHovered(index, layerIndex, e) {
    if (layerIndex !== this.layerIndex) {
      return;
    }
    const choroplethProps = this.data.features[index].properties;
    this.opts.onChoroplethHovered(choroplethProps, e);
  }

  _onChoroplethClicked(index, layerIndex, e) {
    if (layerIndex !== this.layerIndex) {
      return;
    }
    const choroplethProps = this.data.features[index].properties;
    this.opts.onChoroplethClicked(choroplethProps, e);
  }

}

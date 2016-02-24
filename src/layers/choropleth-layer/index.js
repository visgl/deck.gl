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

import MapLayer from '../map-layer';
import autobind from 'autobind-decorator';
import earcut from 'earcut';
import flattenDeep from 'lodash.flattendeep';
import normalize from 'geojson-normalize';
import {Program} from 'luma.gl';
const glslify = require('glslify');

export default class ChoroplethLayer extends MapLayer {
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
    super({
      onChoroplethHover: () => {},
      onChoroplethClick: () => {},
      ...opts
    });
  }

  initializeState() {
    const {gl} = this.state;

    const program = new Program(
      gl,
      glslify('./vertex.glsl'),
      glslify('./fragment.glsl'),
      'choropleth'
    );

    const primitive = {
      id: this.props.id,
      drawType: this.props.drawContour ? 'LINES' : 'TRIANGLES',
      indices: this.state.indices,
      instanced: false
    };

    this.setState({
      program,
      primitive
    });

    this.addInstancedAttributes(
      {name: 'positions', size: 3},
      {name: 'colors', size: 3}
    );
  }

  updateLayer() {
    const {dataChanged} = this.state;
    if (dataChanged) {
      this._allocateGLBuffers();
      this._extractChoropleths();
      this._calculateVertices();
      this._calculateIndices();
      this._calculateColors();
      this._calculatePickingColors();
    }

    // TODO change getters to setters
    this.state.primitive = this.getPrimitive();
    this.updateUniforms();
    this.updateAttributes();

    this.state.dataChanged = false;
  }

  updateUniforms() {
    const {opacity} = this.state;
    this.setUniforms({
      opacity
    });
  }

  updateAttributes() {
    this._extractChoropleths();
    this._calculateVertices();
    this._calculateIndices();
    this._calculateColors();
    this._calculatePickingColors();
    this._calculateContourIndices();
  }

  _extractChoropleths() {
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
  }

  _calculateVertices() {
    this.state.groupedVertices = this.state.choropleths.map(
      choropleth => choropleth.coordinates.map(
        coordinate => [coordinate[0], coordinate[1], 100]
      )
    );

    const vertices = flattenDeep(this.state.groupedVertices);
    this.state.vertices = new Float32Array(vertices);
  }

  _calculateIndices() {
    // adjust index offset for multiple choropleths
    const offsets = this.state.groupedVertices.reduce(
      (acc, vertices) => [...acc, acc[acc.length - 1] + vertices.length],
      [0]
    );

    const indices = this.state.groupedVertices.map(
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

    this.state.indices = new Uint16Array(flattenDeep(indices));
  }

  @autobind
  _calculateColors() {
    const colors = this.state.groupedVertices.map(
      vertices => vertices.map(
        vertex => this.drawContour ? [0, 0, 0] : [128, 128, 128]
      )
    );

    this.state.colors = new Float32Array(flattenDeep(colors));
  }

  // Override the default picking colors calculation
  @autobind
  _calculatePickingColors() {
    if (!this.isPickable) {
      return;
    }

    const pickingColors = this.state.vertices.map(
      (vertices, choroplethIndex) => vertices.map(
        vertex => this.drawContour ? [-1, -1, -1] : [
          (choroplethIndex + 1) % 256,
          Math.floor((choroplethIndex + 1) / 256) % 256,
          this.layerIndex
        ]
      )
    );

    this.state.pickingColors = new Float32Array(flattenDeep(pickingColors));
  }

  @autobind
  _calculateContourIndices(numVertices) {
    // use vertex pairs for gl.LINES => [0, 1, 1, 2, 2, ..., n-1, n-1, 0]
    let indices = [];
    for (let i = 1; i < numVertices - 1; i++) {
      indices = [...indices, i, i];
    }
    return [0, ...indices, 0];
  }

  @autobind
  _onHover(index, layerIndex, e) {
    const {data} = this.props;
    if (layerIndex !== this.layerIndex) {
      return;
    }
    const choroplethProps = data.features[index].properties;
    this.props.onChoroplethHovered(choroplethProps, e);
  }

  @autobind
  _onClick(index, layerIndex, e) {
    const {data} = this.props;
    if (layerIndex !== this.layerIndex) {
      return;
    }
    const choroplethProps = data.features[index].properties;
    this.props.onChoroplethClicked(choroplethProps, e);
  }

}

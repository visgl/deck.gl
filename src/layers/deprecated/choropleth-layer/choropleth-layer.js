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
import {get, flatten, log} from '../../../lib/utils';
import {extractPolygons} from './geojson';
import {GL, Model, Geometry} from 'luma.gl';
import earcut from 'earcut';

import choroplethVertex from './choropleth-layer-vertex.glsl';
import choroplethFragment from './choropleth-layer-fragment.glsl';

const DEFAULT_COLOR = [0, 0, 255, 255];

const defaultProps = {
  getColor: feature => get(feature, 'properties.color'),
  drawContour: false,
  strokeWidth: 1
};

export default class ChoroplethLayer extends Layer {

  constructor(props) {
    super(props);
    log.once('ChoroplethLayer is deprecated. Consider using GeoJsonLayer instead');
  }

  getShaders() {
    return {
      vs: choroplethVertex,
      fs: choroplethFragment
    };
  }

  initializeState() {
    const {gl} = this.context;

    const {attributeManager} = this.state;
    attributeManager.add({
      // Primtive attributes
      indices: {size: 1, update: this.calculateIndices, isIndexed: true},
      positions: {size: 3, update: this.calculatePositions},
      colors: {size: 4, type: GL.UNSIGNED_BYTE, update: this.calculateColors},
      // Instanced attributes
      pickingColors: {
        size: 3,
        type: GL.UNSIGNED_BYTE,
        update: this.calculatePickingColors,
        noAlloc: true
      }
    });

    const IndexType = gl.getExtension('OES_element_index_uint') ? Uint32Array : Uint16Array;

    this.setState({
      model: this.getModel(gl),
      numInstances: 0,
      IndexType
    });
  }

  updateState({oldProps, props, changeFlags}) {
    const {attributeManager} = this.state;
    if (changeFlags.dataChanged) {
      this.state.choropleths = extractPolygons(props.data);
      attributeManager.invalidateAll();
    }

    if (props.drawContour !== oldProps.drawContour) {
      this.state.model.geometry.drawMode = props.drawContour ? GL.LINES : GL.TRIANGLES;
      attributeManager.invalidateAll();
    }

  }

  draw({uniforms}) {
    const {gl} = this.context;
    const lineWidth = this.screenToDevicePixels(this.props.strokeWidth);
    gl.lineWidth(lineWidth);
    this.state.model.render(uniforms);
    // Setting line width back to 1 is here to workaround a Google Chrome bug
    // gl.clear() and gl.isEnabled() will return GL_INVALID_VALUE even with
    // correct parameter
    // This is not happening on Safari and Firefox
    gl.lineWidth(1.0);
  }

  getPickingInfo(opts) {
    const info = super.getPickingInfo(opts);
    const index = this.decodePickingColor(info.color);
    const feature = index >= 0 ? get(this.props.data, ['features', index]) : null;
    info.feature = feature;
    info.object = feature;
    return info;
  }

  getModel(gl) {
    return new Model(gl, Object.assign({}, this.getShaders(), {
      id: this.props.id,
      geometry: new Geometry({
        drawMode: this.props.drawContour ? GL.LINES : GL.TRIANGLES
      }),
      vertexCount: 0,
      isIndexed: true,
      shaderCache: this.context.shaderCache
    }));
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
        calculateContourIndices(choropleth).map(index => index + offsets[choroplethIndex]) :
        // 1. get triangulated indices for the internal areas
        // 2. offset them by the number of indices in previous choropleths
        calculateSurfaceIndices(choropleth).map(index => index + offsets[choroplethIndex])
    );

    attribute.value = new IndexType(flatten(indices));
    attribute.target = GL.ELEMENT_ARRAY_BUFFER;
    this.state.model.setVertexCount(attribute.value.length / attribute.size);
  }

  calculatePositions(attribute) {
    const vertices = flatten(this.state.choropleths);
    attribute.value = new Float32Array(vertices);
  }

  calculateColors(attribute) {
    const {data, getColor} = this.props;
    const features = get(data, 'features');
    const colors = this.state.choropleths.map(
      (choropleth, choroplethIndex) => {
        const feature = get(features, choropleth.featureIndex);
        const color = getColor(feature) || DEFAULT_COLOR;
        // Ensure alpha is set
        if (isNaN(color[3])) {
          color[3] = DEFAULT_COLOR[3];
        }
        return choropleth.map(polygon => polygon.map(vertex => color));
      }
    );

    attribute.value = new Uint8Array(flatten(colors));
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {
    const colors = this.state.choropleths.map(
      (choropleth, choroplethIndex) => {
        const {featureIndex} = choropleth;
        const color = this.props.drawContour ? [0, 0, 0] : [
          (featureIndex + 1) % 256,
          Math.floor((featureIndex + 1) / 256) % 256,
          Math.floor((featureIndex + 1) / 256 / 256) % 256
        ];
        return choropleth.map(polygon => polygon.map(vertex => color));
      }
    );

    attribute.value = new Uint8Array(flatten(colors));
  }
}

ChoroplethLayer.layerName = 'ChoroplethLayer';
ChoroplethLayer.defaultProps = defaultProps;

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

  return earcut(flatten(choropleth), holes, 3);
}

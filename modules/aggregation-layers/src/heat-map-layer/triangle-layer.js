// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
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

import GL from '@luma.gl/constants';
import {Model, Geometry, Buffer} from '@luma.gl/core';
import {Layer} from '@deck.gl/core';
import {defaultColorRange, colorRangeToFlatArray} from '../utils/color-utils';
import {tesselateRectangle} from '../utils/rectangle-tesselation';
import vs from './triangle-layer-vertex.glsl';
import fs from './triangle-layer-fragment.glsl';
const LNG_LENGTH = 40;
const LAT_LENGTH = 15;

const defaultProps = {
  colorRange: defaultColorRange,

  // data {positions(Buffer), texCoords(Buffer)}
  // core lib assumes data is an array of objects (how data prop is diffed , picking etc)
  // so is it better to ignore data prop and just move all buffers into seperate props.

  // TODO support multiple triangle meshes ([ {vertices, textureCoordiantes, texture, color}, ..])
  // triangle count
  count: 0,
  texture: null,

  // debug props
  wireframe: false
};

const BOUNDING_BOX = {
  xMin: -122.38, // -90,
  xMax: -122.0,
  yMin: 37.73, // -90,
  yMax: 37.78,
  addZ: true
};


// const BOUNDING_BOX = {
//   xMin: -122.11, // -90,
//   xMax: -122.07,
//   yMin: 37.71, // -90,
//   yMax: 37.80,
//   addZ: true
// };

export default class TriangleLayer extends Layer {
  getShaders() {
    return {vs, fs, modules: ['project32']};
  }
  initializeState() {
    const {gl} = this.context;
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {size:3, update: this.calculatePositions, noAlloc: true},
      texCoords: {size:2, update: this.calculateTexCoords, noAlloc: true}
    });
    const {xMin, xMax, yMin, yMax} = BOUNDING_BOX;
    const texCoords = tesselateRectangle({xMin:0, yMin:0, xMax:1, yMax:1}, {xLength: LNG_LENGTH/(xMax - xMin), yLength: LAT_LENGTH/(yMax - yMin)});
    const positions = tesselateRectangle(BOUNDING_BOX, {xLength: LNG_LENGTH/(xMax - xMin), yLength: LAT_LENGTH/(yMax - yMin), addZ: true});
    this.setState({
      model: this._getModel(gl),
      texCoords: new Buffer(gl, {id: 'defaultTexCoords', data: new Float32Array(texCoords)}),
      positions: new Buffer(gl, {id: 'defaultPositions', data: new Float32Array(positions)})
    });
  }

  updateState(opts) {
    super.updateState(opts);

    if (opts.changeFlags.dataChanged) {
      const attributeManager = this.getAttributeManager();
      attributeManager.invalidateAll();
    }
  }

  _getModel(gl) {
    const {wireframe, count} = this.props;

    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: !wireframe ? GL.TRIANGLES : GL.LINE_STRIP, // GL.POINTS, // GL.TRIANGLE_FAN,
          vertexCount: count,
        //   attributes: {
        //     positions: {size: 2, value: new Float32Array([
        //       0, 0,  1, 0,  1, 1,
        //       0, 0,  1, 1,  0, 1
        //     ])},
        //     // texCoords: {size: 2, value: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1])}
        //     texCoords: {size: 2, value: new Float32Array(tesselateRectangle())}
        //   }
        }),
        shaderCache: this.context.shaderCache
      })
    );
  }

  calculatePositions(attribute) {
    const {positions} = this.props.data;
    attribute.update({
      buffer: positions || this.state.positions
    });
  }

  calculateTexCoords(attribute) {
    const {texCoords} = this.props.data;
    attribute.update({
      buffer: texCoords || this.state.texCoords
    });
  }

  draw({uniforms}) {
    const {model} = this.state;
    const {texture, maxValues, count, wireframe} = this.props;
    const hasTexture = texture ? true : false;
    const colorRange = colorRangeToFlatArray(this.props.colorRange, Float32Array, 255);
    model.setVertexCount(count);
    model.setDrawMode(!wireframe ? GL.TRIANGLES : GL.LINE_STRIP);

    // this.context.gl.lineWidth(5);
    // model.setUniforms({heatTexture: this.state.aggregationTexture, colorRange}).draw();
    model.setUniforms({texture, hasTexture: !wireframe && hasTexture, colorRange, maxValues}).draw();
  }
}

TriangleLayer.layerName = 'TriangleLayer';
TriangleLayer.defaultProps = defaultProps;

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

import Layer from '../../layer';
import d3 from 'd3';
import {Model, Program, Geometry} from 'luma.gl';
const glslify = require('glslify');

import request from 'd3-request';
import parseOBJ from 'parse-obj';
import OBJ from 'webgl-obj-loader';
import Car from './car';
const carMesh = new OBJ.Mesh(Car);

console.log(carMesh);
const ATTRIBUTES = {
  positions: {size: 3, '0': 'x', '1': 'y', '2': 'unused'},
  colors: {size: 3, '0': 'red', '1': 'green', '2': 'blue'}
};

export default class CarLayer extends Layer {

  static get attributes() {
    return ATTRIBUTES;
  }

  /*
   * @classdesc
   * Car Layer
   *
   * @class
   * @param {object} props
   * @param {number} props.radius - point radius
   */
  constructor(props) {
    super(props);
  }

  initializeState() {
    const {gl, attributeManager} = this.state;

    this.setState({
      model: this.getModel(gl)
    });

    attributeManager.addInstanced(ATTRIBUTES, {
      positions: {update: this.calculatePositions},
      colors: {update: this.calculateColors}
    });
  }

  didMount() {
    this.updateUniforms();
  }

  willReceiveProps(oldProps, newProps) {
    super.willReceiveProps(oldProps, newProps);
    this.updateUniforms();
  }

  getModel(gl) {
    return new Model({
      program: new Program(gl, {
        vs: glslify('./car-layer-vertex.glsl'),
        fs: glslify('./car-layer-fragment.glsl'),
        id: 'car'
      }),
      geometry: new Geometry({
        drawMode: 'TRIANGLES',
        vertices: new Float32Array(carMesh.vertices),
        indices:new Uint16Array(carMesh.indices)
      }),
      instanced: true,
      isIndexed: true
    });
  }

  updateUniforms() {
    this.calculateScale();
    const {scale} = this.state;
    this.setUniforms({
      scale
    });
  }

  calculatePositions(attribute) {
    const {data} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      value[i + 0] = point.position.x;
      value[i + 1] = point.position.y;
      value[i + 2] = point.position.z;
      i += size;
    }
  }

  calculateColors(attribute) {
    const {data} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      value[i + 0] = point.color[0];
      value[i + 1] = point.color[1];
      value[i + 2] = point.color[2];
      i += size;
    }
  }

  calculateScale() {
    // use radius if specified
    //if (this.props.radius) {
    //  this.state.radius = this.props.radius;
    //  return;
    //}

    const pixel0 = this.project({lon: -122, lat: 37.5});
    const pixel1 = this.project({lon: -122, lat: 37.50001});

    const dx = pixel0.x - pixel1.x;
    const dy = pixel0.y - pixel1.y;

    this.state.scale = Math.max(Math.sqrt(dx * dx + dy * dy), 2.0);
  }

}

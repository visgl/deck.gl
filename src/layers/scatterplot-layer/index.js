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
import {Program} from 'luma.gl';
const glslify = require('glslify');

const ATTRIBUTES = {
  positions: {size: 3, '0': 'x', '1': 'y', '2': 'unused'},
  colors: {size: 3, '0': 'red', '1': 'green', '2': 'blue'}
};

export default class ScatterplotLayer extends MapLayer {

  static get attributes() {
    return ATTRIBUTES;
  }

  /**
   * @classdesc
   * ScatterplotLayer
   *
   * @class
   * @param {object} props
   * @param {number} props.radius - point radius
   */
  constructor(props) {
    super(props);

    this.onObjectHovered = props.onScatterplotHovered;
    this.onObjectClicked = props.onScatterplotClicked;
  }

  initializeState() {
    super.initializeState();

    const {gl} = this.state;
    const {attributes} = this.state;

    const program = new Program(
      gl,
      glslify('./vertex.glsl'),
      glslify('./fragment.glsl'),
      'scatterplot'
    );

    const primitive = {
      id: this.id,
      instanced: true,
      ...this.getGeometry()
    };

    this.setState({
      program,
      primitive
    });

    attributes.addInstanced(ATTRIBUTES, {
      positions: {update: this.calculatePositions},
      colors: {update: this.calculateColors}
    });
  }

  updateUniforms() {
    super.updateUniforms();

    this._calculateRadius();
    const {radius} = this.state;
    this.setUniforms({
      radius
    });
  }

  getGeometry() {
    const NUM_SEGMENTS = 16;
    const PI2 = Math.PI * 2;

    let vertices = [];
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      vertices = [
        ...vertices,
        Math.cos(PI2 * i / NUM_SEGMENTS),
        Math.sin(PI2 * i / NUM_SEGMENTS),
        0
      ];
    }

    return {
      drawType: 'TRIANGLE_FAN',
      vertices: new Float32Array(vertices)
    };
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

  _calculateRadius() {
    // use radius if specified
    if (this.props.radius) {
      this.state.radius = this.props.radius;
      return;
    }

    const pixel0 = this.project([-122, 37.5]);
    const pixel1 = this.project([-122, 37.5002]);

    const space0 = this.screenToSpace(pixel0.x, pixel0.y);
    const space1 = this.screenToSpace(pixel1.x, pixel1.y);

    const dx = space0.x - space1.x;
    const dy = space0.y - space1.y;

    this.state.radius = Math.max(Math.sqrt(dx * dx + dy * dy), 2.0);
  }

}

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
import {Program} from 'luma.gl';
const glslify = require('glslify');

const ATTRIBUTES = {
  positions: {size: 4, '0': 'x0', '1': 'y0', '2': 'x1', '3': 'y1'}
};

export default class ArcLayer extends MapLayer {
  /**
   * @classdesc
   * ArcLayer
   *
   * @class
   * @param {object} opts
   */
  constructor(opts) {
    super(opts);
  }

  initializeState() {
    super.initializeState();
    const {gl, attributes} = this.state;

    const program = new Program(
      gl,
      glslify(__dirname + '/vertex.glsl'),
      glslify(__dirname + '/fragment.glsl'),
      'arc'
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
      positions: {update: this.calculatePositions}
    });

    this.updateColors();
  }

  willReceiveProps(oldProps, nextProps) {
    super.willReceiveProps(oldProps, nextProps);
    this.updateColors();
  }

  updateColors() {
    // Get colors from first object
    const object = this.getFirstObject();
    if (object) {
      this.setUniforms({
        color0: object.colors.c0,
        color1: object.colors.c1
      });
    }
  }

  calculatePositions(attribute) {
    const {data} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const arc of data) {
      value[i + 0] = arc.position.x0;
      value[i + 1] = arc.position.y0;
      value[i + 2] = arc.position.x1;
      value[i + 3] = arc.position.y1;
      i += size;
    }
  }

  getGeometry() {
    let vertices = [];
    const NUM_SEGMENTS = 50;
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      vertices = [...vertices, i, i, i];
    }
    return {
      drawType: 'LINE_STRIP',
      vertices: new Float32Array(vertices)
    };
  }

}

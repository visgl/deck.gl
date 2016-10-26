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

import {Layer, assembleShaders} from '../../../lib';
import {Model, Program, Geometry} from 'luma.gl';

const glslify = require('glslify');

export default class ScreenGridLayer extends Layer {
  /**
   * @classdesc
   * ScreenGridLayer
   *
   * @class
   * @param {object} opts
   * @param {number} opts.unitWidth - width of the unit rectangle
   * @param {number} opts.unitHeight - height of the unit rectangle
   */
  constructor(opts) {
    super({
      unitWidth: 100,
      unitHeight: 100,
      minColor: [0, 0, 0, 255],
      maxColor: [0, 255, 0, 255],
      getPosition: d => d.position,
      getWeight: d => 1,
      ...opts
    });
  }

  initializeState() {
    const {attributeManager} = this.state;
    attributeManager.addInstanced({
      instancePositions: {size: 3, update: this.calculateInstancePositions},
      instanceCount: {size: 1, update: this.calculateInstanceCount}
    });

    const {gl} = this.context;
    this.setState({model: this.getModel(gl)});

    this.updateCell();
  }

  willReceiveProps(oldProps, newProps) {
    super.willReceiveProps(oldProps, newProps);

    const cellSizeChanged =
      newProps.unitWidth !== oldProps.unitWidth ||
      newProps.unitHeight !== oldProps.unitHeight;

    if (cellSizeChanged || this.state.viewportChanged) {
      this.updateCell();
    }
  }

  draw(uniforms) {
    const {minColor, maxColor} = this.props;
    const {model, cellScale, maxCount} = this.state;
    model.render({...uniforms, minColor, maxColor, cellScale, maxCount});
  }

  getModel(gl) {
    return new Model({
      id: this.props.id,
      program: new Program(gl, assembleShaders(gl, {
        vs: glslify('./screen-grid-layer-vertex.glsl'),
        fs: glslify('./screen-grid-layer-fragment.glsl')
      })),
      geometry: new Geometry({
        drawMode: 'TRIANGLE_FAN',
        vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
      }),
      isInstanced: true
    });
  }

  updateCell() {
    const {width, height} = this.context.viewport;
    const {unitWidth, unitHeight} = this.props;

    const MARGIN = 2;
    const cellScale = new Float32Array([
      (unitWidth - MARGIN) / width * 2,
      -(unitHeight - MARGIN) / height * 2,
      1
    ]);
    const numCol = Math.ceil(width / unitWidth);
    const numRow = Math.ceil(height / unitHeight);

    this.setState({
      cellScale,
      numCol,
      numRow,
      numInstances: numCol * numRow
    });

    const {attributeManager} = this.state;
    attributeManager.invalidateAll();
  }

  calculateInstancePositions(attribute, {numInstances}) {
    const {width, height} = this.context.viewport;
    const {unitWidth, unitHeight} = this.props;
    const {numCol} = this.state;
    const {value, size} = attribute;

    for (let i = 0; i < numInstances; i++) {
      const x = i % numCol;
      const y = Math.floor(i / numCol);
      value[i * size + 0] = x * unitWidth / width * 2 - 1;
      value[i * size + 1] = 1 - y * unitHeight / height * 2;
      value[i * size + 2] = 0;
    }
  }

  calculateInstanceCount(attribute) {
    const {data, unitWidth, unitHeight, getPosition, getWeight} = this.props;
    const {numCol, numRow} = this.state;
    const {value} = attribute;
    let maxCount = 0;

    value.fill(0.0);

    for (const point of data) {
      const pixel = this.project(getPosition(point));
      const colId = Math.floor(pixel[0] / unitWidth);
      const rowId = Math.floor(pixel[1] / unitHeight);
      if (colId >= 0 && colId < numCol && rowId >= 0 && rowId < numRow) {
        const i = colId + rowId * numCol;
        value[i] += getWeight(point);
        if (value[i] > maxCount) {
          maxCount = value[i];
        }
      }
    }

    this.setState({maxCount});
  }
}

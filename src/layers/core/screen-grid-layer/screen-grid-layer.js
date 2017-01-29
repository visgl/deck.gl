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

import {Layer} from '../../../lib';
import {assembleShaders} from '../../../shader-utils';
import {GL, Model, Geometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

const defaultProps = {
  // @type {number} opts.unitWidth - width of the unit rectangle
  unitWidth: 100,
  // @type {number} opts.unitHeight - height of the unit rectangle
  unitHeight: 100,
  minColor: [0, 0, 0, 255],
  maxColor: [0, 255, 0, 255],
  getPosition: d => d.position,
  getWeight: d => 1
};

export default class ScreenGridLayer extends Layer {
  getShaders() {
    return {
      vs: readFileSync(join(__dirname, './screen-grid-layer-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './screen-grid-layer-fragment.glsl'), 'utf8')
    };
  }

  initializeState() {
    const {attributeManager} = this.state;
    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {size: 3, update: this.calculateInstancePositions},
      instanceCount: {size: 1, accessor: ['getPosition', 'getWeight'], update: this.calculateInstanceCount}
    });
    /* eslint-disable max-len */

    const {gl} = this.context;
    this.setState({model: this.getModel(gl)});
  }

  updateState({oldProps, props, changeFlags}) {
    const cellSizeChanged =
      props.unitWidth !== oldProps.unitWidth ||
      props.unitHeight !== oldProps.unitHeight;

    if (cellSizeChanged || changeFlags.viewportChanged) {
      this.updateCell();
    }
  }

  draw({uniforms}) {
    const {minColor, maxColor} = this.props;
    const {model, cellScale, maxCount} = this.state;
    const {gl} = this.context;
    gl.depthMask(true);
    uniforms = Object.assign({}, uniforms, {minColor, maxColor, cellScale, maxCount});
    model.render(uniforms);
  }

  getModel(gl) {
    const shaders = assembleShaders(gl, this.getShaders());

    return new Model({
      gl,
      id: this.props.id,
      vs: shaders.vs,
      fs: shaders.fs,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
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

ScreenGridLayer.layerName = 'ScreenGridLayer';
ScreenGridLayer.defaultProps = defaultProps;

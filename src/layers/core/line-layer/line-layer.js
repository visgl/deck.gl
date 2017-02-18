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

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  getSourcePosition: x => x.sourcePosition,
  getTargetPosition: x => x.targetPosition,
  getColor: x => x.color || DEFAULT_COLOR,
  strokeWidth: 1
};

export default class LineLayer extends Layer {
  initializeState() {

    const {gl} = this.context;
    this.setState({model: this.createModel(gl)});

    const {attributeManager} = this.state;

    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instanceSourcePositions: {size: 3, accessor: 'getSourcePosition', update: this.calculateInstanceSourcePositions},
      instanceTargetPositions: {size: 3, accessor: 'getTargetPosition', update: this.calculateInstanceTargetPositions},
      instanceColors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateInstanceColors}
    });
    /* eslint-enable max-len */
  }

  draw({uniforms}) {
    const {strokeWidth} = this.props;
    const {viewport: {width, height}} = this.context;

    this.state.model.render(Object.assign({}, uniforms, {
      screenSize: [width, height],
      strokeWidth
    }));
  }

  getShaders() {
    return {
      vs: readFileSync(join(__dirname, './line-layer-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './line-layer-fragment.glsl'), 'utf8')
    };
  }

  createModel(gl) {
    /*
     *  (0, -1)-------------_(1, -1)
     *       |          _,-"  |
     *       o      _,-"      o
     *       |  _,-"          |
     *   (0, 1)"-------------(1, 1)
     */
    const positions = [0, -1, 0, 0, 1, 0, 1, -1, 0, 1, 1, 0];

    const shaders = assembleShaders(gl, this.getShaders());

    return new Model({
      gl,
      id: this.props.id,
      vs: shaders.vs,
      fs: shaders.fs,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_STRIP,
        positions: new Float32Array(positions)
      }),
      isInstanced: true
    });
  }

  calculateInstanceSourcePositions(attribute) {
    const {data, getSourcePosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const sourcePosition = getSourcePosition(object);
      value[i + 0] = sourcePosition[0];
      value[i + 1] = sourcePosition[1];
      value[i + 2] = isNaN(sourcePosition[2]) ? 0 : sourcePosition[2];
      i += size;
    }
  }

  calculateInstanceTargetPositions(attribute) {
    const {data, getTargetPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const targetPosition = getTargetPosition(object);
      value[i + 0] = targetPosition[0];
      value[i + 1] = targetPosition[1];
      value[i + 2] = isNaN(targetPosition[2]) ? 0 : targetPosition[2];
      i += size;
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const color = getColor(object);
      value[i + 0] = color[0];
      value[i + 1] = color[1];
      value[i + 2] = color[2];
      value[i + 3] = isNaN(color[3]) ? 255 : color[3];
      i += size;
    }
  }
}

LineLayer.layerName = 'LineLayer';
LineLayer.defaultProps = defaultProps;

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

import {Layer, experimental} from '../../../core';
const {defaultColorRange, quantizeScale, GPUGridAggregator} = experimental;

import {GL, Model, Geometry, Buffer} from 'luma.gl';
import {lerp} from './../../../core/utils/math-utils';

import vs from './screen-grid-layer-vertex.glsl';
import fs from './screen-grid-layer-fragment.glsl';
const DEFAULT_MINCOLOR = [0, 0, 0, 255];
const DEFAULT_MAXCOLOR = [0, 255, 0, 255];
const defaultProps = {
  cellSizePixels: 100,

  colorDomain: null,
  colorRange: defaultColorRange,

  getPosition: d => d.position,
  getWeight: d => 1
};

export default class ScreenGridLayer extends Layer {
  getShaders() {
    return {vs, fs, modules: ['picking']}; // 'project' module added by default.
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();
    const {gl} = this.context;

    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {size: 3, update: this.calculateInstancePositions},
      // TODO: Needed, since attributeManger.update() only updates existing attributes.
      instanceCounts: {
        size: 4,
        transition: true,
        accessor: ['getPosition', 'getWeight'],
        update: this.calculateInstanceCounts
      }
    });
    /* eslint-disable max-len */

    const options = {
      id: `${this.id}-aggregator`,
      shaderCache: this.context.shaderCache
    };
    this.setState({
      model: this._getModel(gl),
      gpuGridAggregator: new GPUGridAggregator(gl, options)
    });
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({oldProps, props, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});

    if (changeFlags.dataChanged) {
      this._processData();
    }

    const cellSizeChanged = props.cellSizePixels !== oldProps.cellSizePixels;
    if (cellSizeChanged || changeFlags.viewportChanged) {
      this.updateAggregation();
    }
  }

  draw({uniforms}) {
    const {minColor, maxColor, parameters = {}} = this.props;
    const {model, maxCount, cellScale} = this.state;
    uniforms = Object.assign({}, uniforms, {minColor, maxColor, maxCount, cellScale});
    model.draw({
      uniforms,
      parameters: Object.assign(
        {
          depthTest: false,
          depthMask: false
        },
        parameters
      )
    });
  }

  _getModel(gl) {
    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_FAN,
          attributes: {
            vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
          }
        }),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      })
    );
  }

  updateAggregation() {
    const {width, height} = this.context.viewport;
    const {cellSizePixels, data} = this.props;
    const {gl} = this.context;

    const MARGIN = 2;
    const cellScale = new Float32Array([
      (cellSizePixels - MARGIN) / width * 2,
      -(cellSizePixels - MARGIN) / height * 2,
      1
    ]);
    const numCol = Math.ceil(width / cellSizePixels);
    const numRow = Math.ceil(height / cellSizePixels);
    const numInstances = numCol * numRow;
    const dataBytes = numInstances * 4 * 4;
    const {positions, weights} = this.state;

    const countsBuffer = new Buffer(gl, {
      size: 4,
      bytes: dataBytes,
      type: GL.FLOAT,
      instanced: 1
    });

    const aggregateData = this.state.gpuGridAggregator.run({
      positions,
      weights,
      cellSize: [cellSizePixels, cellSizePixels],
      viewport: this.context.viewport,
      countsBuffer,
      useGPU: false // TODO: this shouldn't be an option, remove
    });

    const {maxCount} = aggregateData;

    this.setState({
      cellScale,
      numCol,
      numRow,
      numInstances,
      maxCount
    });

    const attributeManager = this.getAttributeManager();

    // TODO: AttributeManager should be able to just take new buffer for one or more attributes.
    // data and numInstances shouldn't be needed.
    attributeManager.update({
      data,
      numInstances,
      buffers: {
        instanceCounts: countsBuffer
      },
      context: this,
      ignoreUnknownAttributes: true
    });
    attributeManager.invalidateAll();
  }

  calculateInstancePositions(attribute, {numInstances}) {
    const {width, height} = this.context.viewport;
    const {cellSizePixels} = this.props;
    const {numCol} = this.state;
    const {value, size} = attribute;

    for (let i = 0; i < numInstances; i++) {
      const x = i % numCol;
      const y = Math.floor(i / numCol);
      value[i * size + 0] = x * cellSizePixels / width * 2 - 1;
      value[i * size + 1] = 1 - y * cellSizePixels / height * 2;
      value[i * size + 2] = 0;
    }
  }

  calculateInstanceCounts(attribute, {numInstances}) {
    // Empty method: Attribute manager requires an update method for each added attribute
    // TODO: remove this when proper external buffer support is added to Attribute Manager.
  }

  // HELPER Methods

  _processData() {
    const {data, getPosition, getWeight} = this.props;
    const positions = [];
    const weights = [];

    for (const point of data) {
      const position = getPosition(point);
      positions.push(position[0]);
      positions.push(position[1]);
      weights.push(getWeight(point));
    }

    this.setState({positions, weights});
  }

  _getColor(weight, maxCount) {
    let color;
    const {minColor, maxColor, colorRange} = this.props;
    if (this._shouldUseMinMax()) {
      const step = weight / maxCount;
      // We are supporting optional props as deprecated, set default value if not provided
      color = lerp(minColor || DEFAULT_MINCOLOR, maxColor || DEFAULT_MAXCOLOR, step);
      return color;
    }
    // if colorDomain not set , use default domain [1, maxCount]
    const colorDomain = this.props.colorDomain || [1, maxCount];
    if (weight < colorDomain[0] || weight > colorDomain[1]) {
      // wight outside the domain, set color alpha to 0.
      return [0, 0, 0, 0];
    }
    color = quantizeScale(colorDomain, colorRange, weight);
    // add alpha to color if not defined in colorRange
    color[3] = Number.isFinite(color[3]) ? color[3] : 255;
    return color;
  }

  _shouldUseMinMax() {
    const {minColor, maxColor, colorDomain, colorRange} = this.props;
    if (minColor || maxColor) {
      return true;
    }
    // minColor and maxColor not supplied, check if colorRange or colorDomain supplied.
    // NOTE: colorDomain and colorRange are experimental features, use them only when supplied.
    if (colorDomain || colorRange) {
      return false;
    }
    // None specified, use default minColor and maxColor
    return true;
  }
}

ScreenGridLayer.layerName = 'ScreenGridLayer';
ScreenGridLayer.defaultProps = defaultProps;

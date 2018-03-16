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

import {Layer, experimental} from '../../core';
const {defaultColorRange, quantizeScale} = experimental;
const {ScreenGridAggregator} = experimental;
import {GL, Model, Geometry} from 'luma.gl';
import {lerp} from './../../core/utils/math-utils';
import log from './../../core/utils/log';

import vsCpu from './screen-grid-layer-vertex.glsl';
import vsGpu from './screen-grid-layer-vertex-gpu.glsl';
import fs from './screen-grid-layer-fragment.glsl';

const LOG_LEVEL = 0;

const defaultProps = {
  cellSizePixels: 100,
  gpuAggregation: true,

  colorDomain: null,
  colorRange: defaultColorRange,

  getPosition: d => d.position,
  getWeight: d => 1,

  // deprecated
  minColor: [0, 0, 0, 0], //TODO: use min/max until gpu aggregation supports range/domain
  maxColor: [0, 255, 0, 255]
};

export default class ScreenGridLayer extends Layer {
  getShaders() {
    const {usingGPUAggregation} = this.state;
    if (LOG_LEVEL > 0) {
      console.log(`Using ${usingGPUAggregation ? 'GPU' : 'CPU'} shaders`);
    }
    const vs = usingGPUAggregation ? vsGpu : vsCpu;
    return {vs, fs, modules: ['picking']}; // 'project' module added by default.
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();
    const {gl} = this.context;

    if (this.props.minColor || this.props.maxColor) {
      log.deprecated('minColor and maxColor', 'colorRange, colorDomain')();
    }
    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {size: 3, update: this.calculateInstancePositions}
    });
    /* eslint-disable max-len */

    const options = {
      id: `${this.id}-aggregator`,
      shaderCache: this.context.shaderCache
    };
    this.setState({
      model: this._getModel(gl),
      screenGridAggregator: new ScreenGridAggregator(gl, options)
    });
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateAttribute({props, oldProps, changeFlags}) {
    const {gl} = this.context;
    if (LOG_LEVEL > 0) {
      console.log(
        `Switching from ${oldProps.gpuAggregation ? 'GPU' : 'CPU'} to ${
          props.gpuAggregation ? 'GPU' : 'CPU'
        }`
      );
    }
    const attributeManager = this.getAttributeManager();

    if (props.gpuAggregation) {
      if (LOG_LEVEL > 0) {
        console.log(`remove instanceColors atatribute`);
      }
      attributeManager.remove(['instanceColors']);
    } else {
      if (LOG_LEVEL > 0) {
        console.log(`add instanceColors atatribute`);
      }
      attributeManager.addInstanced({
        instanceColors: {
          size: 4,
          type: GL.UNSIGNED_BYTE,
          transition: true,
          accessor: ['getPosition', 'getWeight'],
          update: this.calculateInstanceColors
        }
      });
    }
    this.setState({model: this._getModel(gl)});
    attributeManager.invalidateAll();
  }

  updateState({oldProps, props, changeFlags}) {
    const {gl} = this.context;
    super.updateState({props, oldProps, changeFlags});
    const cellSizeChanged = props.cellSizePixels !== oldProps.cellSizePixels;
    const aggregationChanged =
      ScreenGridAggregator.hasGPUSupport(gl) && props.gpuAggregation !== oldProps.gpuAggregation;

    if (changeFlags.dataChanged) {
      this._processData();
    }
    if (cellSizeChanged || changeFlags.viewportChanged) {
      this.updateCell();
    }
    const usingGPUAggregation = ScreenGridAggregator.hasGPUSupport(gl) && props.gpuAggregation;
    this.setState({usingGPUAggregation});
    if (aggregationChanged) {
      this.updateAttribute({props, oldProps, changeFlags});
    }
    if (usingGPUAggregation) {
      if (
        cellSizeChanged ||
        changeFlags.viewportChanged ||
        changeFlags.dataChanged ||
        aggregationChanged
      ) {
        this.runGPUAggregation(changeFlags);
      }
    }
  }

  draw({uniforms}) {
    if (LOG_LEVEL > 3) {
      console.log(`draw called \n`);
    }
    const {parameters = {}} = this.props;
    const {model, cellScale, usingGPUAggregation} = this.state;
    const {uSamplerCount, uSamplerMaxCount} = this.state;
    const samplerUniforms = usingGPUAggregation
      ? {
          uSamplerCount,
          uSamplerMaxCount,
          minColor: [0, 0, 0, 0],
          maxColor: [0, 255, 0, 255]
        }
      : {};
    uniforms = Object.assign({}, uniforms, samplerUniforms, {cellScale});
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

  updateCell() {
    const {width, height} = this.context.viewport;
    const {cellSizePixels} = this.props;

    const MARGIN = 2;
    const cellScale = new Float32Array([
      (cellSizePixels - MARGIN) / width * 2,
      -(cellSizePixels - MARGIN) / height * 2,
      1
    ]);
    const numCol = Math.ceil(width / cellSizePixels);
    const numRow = Math.ceil(height / cellSizePixels);

    this.setState({
      cellScale,
      numCol,
      numRow,
      numInstances: numCol * numRow
    });

    const attributeManager = this.getAttributeManager();
    attributeManager.invalidateAll();
    if (LOG_LEVEL > 1) {
      console.log(`updateCell called`);
    }
  }

  calculateInstancePositions(attribute, {numInstances}) {
    if (LOG_LEVEL > 2) {
      console.log(`calculateInstancePositions called`);
    }
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

  calculateInstanceColors(attribute) {
    if (LOG_LEVEL > 2) {
      console.log(`calculateInstanceColors called`);
    }
    const {cellSizePixels} = this.props;
    const {numCol, numRow, numInstances, positions, weights} = this.state;
    const {value, size} = attribute;

    const {width, height} = this.context.viewport;

    const aggregateData = this.state.screenGridAggregator.run({
      positions,
      weights,
      windowSize: [width, height], // TODO: make this optional can be obtained from vewiport
      cellSize: [cellSizePixels, cellSizePixels],
      gridSize: [numCol, numRow], // TODO: remove this, based on cellSIze and viewport this can be deduced.
      viewport: this.context.viewport,
      useGPU: false
    });

    const {counts, maxCount} = aggregateData;
    this.setState({maxCount});

    // Convert weights to colors.
    for (let i = 0; i < numInstances; i++) {
      const color = this._getColor(counts[i], maxCount);
      const index = i * size;
      value[index + 0] = color[0];
      value[index + 1] = color[1];
      value[index + 2] = color[2];
      value[index + 3] = color[3];
    }
  }

  runGPUAggregation(changeFlags) {
    const {cellSizePixels} = this.props;
    const {numCol, numRow, positions, weights} = this.state;
    const {width, height} = this.context.viewport;

    const aggregateData = this.state.screenGridAggregator.run({
      positions,
      weights,
      windowSize: [width, height], // TODO: make this optional can be obtained from vewiport
      cellSize: [cellSizePixels, cellSizePixels],
      gridSize: [numCol, numRow], // TODO: remove this, based on cellSIze and viewport this can be deduced.
      viewport: this.context.viewport,
      useGPU: true,
      changeFlags
    });
    if (LOG_LEVEL > 1) {
      console.log(`Running GPU Aggregation`);
    }
    this.setState(aggregateData);
  }

  _getColor(weight, maxCount) {
    let color;
    const {minColor, maxColor, colorRange} = this.props;
    if (minColor || maxColor) {
      const step = weight / maxCount;
      // We are supporting optional props as deprecated, set default value if not provided
      color = lerp(minColor || [0, 0, 0, 255], maxColor || [0, 255, 0, 255], step);
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

  _processData() {
    const {data, getPosition, getWeight} = this.props;
    const positions = [];
    const weights = [];
    if (LOG_LEVEL > 1) {
      console.log(`Processing data`);
    }

    for (const point of data) {
      const position = getPosition(point);
      positions.push(position[0]);
      positions.push(position[1]);
      weights.push(getWeight(point));
    }

    this.setState({positions, weights});
  }
}

ScreenGridLayer.layerName = 'ScreenGridLayer';
ScreenGridLayer.defaultProps = defaultProps;

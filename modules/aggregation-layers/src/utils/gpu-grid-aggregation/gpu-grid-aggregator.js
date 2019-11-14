// Copyright (c) 2015 - 2018 Uber Technologies, Inc.
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
import {
  Buffer,
  Model,
  Transform,
  FEATURES,
  hasFeatures,
  isWebGL2,
  readPixelsToBuffer,
  fp64 as fp64ShaderModule,
  withParameters
} from '@luma.gl/core';
import {log, project32, project64, mergeShaders} from '@deck.gl/core';
import {worldToPixels} from '@math.gl/web-mercator';
const {fp64ifyMatrix4} = fp64ShaderModule;

import {
  DEFAULT_CHANGE_FLAGS,
  DEFAULT_RUN_PARAMS,
  MAX_32_BIT_FLOAT,
  MIN_BLEND_EQUATION,
  MAX_BLEND_EQUATION,
  MAX_MIN_BLEND_EQUATION,
  EQUATION_MAP,
  ELEMENTCOUNT,
  DEFAULT_WEIGHT_PARAMS,
  IDENTITY_MATRIX,
  PIXEL_SIZE,
  WEIGHT_SIZE
} from './gpu-grid-aggregator-constants';
import {AGGREGATION_OPERATION} from '../aggregation-operation-utils';

import AGGREGATE_TO_GRID_VS from './aggregate-to-grid-vs.glsl';
import AGGREGATE_TO_GRID_VS_FP64 from './aggregate-to-grid-vs-64.glsl';
import AGGREGATE_TO_GRID_FS from './aggregate-to-grid-fs.glsl';
import AGGREGATE_ALL_VS_FP64 from './aggregate-all-vs-64.glsl';
import AGGREGATE_ALL_FS from './aggregate-all-fs.glsl';
import TRANSFORM_MEAN_VS from './transform-mean-vs.glsl';
import {getFloatTexture, getFramebuffer, getFloatArray} from './../resource-utils.js';

const BUFFER_NAMES = ['aggregationBuffer', 'maxMinBuffer', 'minBuffer', 'maxBuffer'];
const ARRAY_BUFFER_MAP = {
  maxData: 'maxBuffer',
  minData: 'minBuffer',
  maxMinData: 'maxMinBuffer'
};

const REQUIRED_FEATURES = [
  FEATURES.WEBGL2, // TODO: Remove after trannsform refactor
  FEATURES.COLOR_ATTACHMENT_RGBA32F,
  FEATURES.BLEND_EQUATION_MINMAX,
  FEATURES.FLOAT_BLEND,
  FEATURES.TEXTURE_FLOAT
];

export default class GPUGridAggregator {
  // Decode and return aggregation data of given pixel.
  static getAggregationData({aggregationData, maxData, minData, maxMinData, pixelIndex}) {
    const index = pixelIndex * PIXEL_SIZE;
    const results = {};
    if (aggregationData) {
      results.cellCount = aggregationData[index + 3];
      results.cellWeight = aggregationData[index];
    }
    if (maxMinData) {
      results.maxCellWieght = maxMinData[0];
      results.minCellWeight = maxMinData[3];
    } else {
      if (maxData) {
        results.maxCellWieght = maxData[0];
        results.totalCount = maxData[3];
      }
      if (minData) {
        results.minCellWeight = minData[0];
        results.totalCount = maxData[3];
      }
    }
    return results;
  }

  // Decodes and retuns counts and weights of all cells
  static getCellData({countsData, size = 1}) {
    const numCells = countsData.length / 4;
    const cellWeights = new Float32Array(numCells * size);
    const cellCounts = new Uint32Array(numCells);
    for (let i = 0; i < numCells; i++) {
      // weights in RGB channels
      for (let sizeIndex = 0; sizeIndex < size; sizeIndex++) {
        cellWeights[i * size + sizeIndex] = countsData[i * 4 + sizeIndex];
      }
      // count in Alpha channel
      cellCounts[i] = countsData[i * 4 + 3];
    }
    return {cellCounts, cellWeights};
  }

  static isSupported(gl) {
    return hasFeatures(gl, REQUIRED_FEATURES);
  }

  // DEBUG ONLY
  // static logData({aggregationBuffer, minBuffer, maxBuffer, maxMinBuffer, limit = 10}) {
  //   if (aggregationBuffer) {
  //     console.log('Aggregation Data:');
  //     const agrData = aggregationBuffer.getData();
  //     for (let index = 0; index < agrData.length && limit > 0; index += 4) {
  //       if (agrData[index + 3] > 0) {
  //         console.log(
  //           `index: ${index} weights: ${agrData[index]} ${agrData[index + 1]} ${
  //             agrData[index + 2]
  //           } count: ${agrData[index + 3]}`
  //         );
  //         limit--;
  //       }
  //     }
  //   }
  //   const obj = {minBuffer, maxBuffer, maxMinBuffer};
  //   for (const key in obj) {
  //     if (obj[key]) {
  //       const data = obj[key].getData();
  //       console.log(`${key} data : R: ${data[0]} G: ${data[1]} B: ${data[2]} A: ${data[3]}`);
  //     }
  //   }
  // }

  constructor(gl, opts = {}) {
    this.id = opts.id || 'gpu-grid-aggregator';
    this.gl = gl;
    this.state = {
      // cache weights and position data to process when data is not changed
      weights: null,
      gridPositions: null,
      vertexCount: 0,

      // flags/variables that affect the aggregation
      fp64: null,
      useGPU: null,
      numCol: 0,
      numRow: 0,
      windowSize: null,
      cellSize: null,

      // per weight GPU resources
      weightAttributes: {},
      textures: {},
      meanTextures: {},
      buffers: {},
      framebuffers: {},
      maxMinFramebuffers: {},
      minFramebuffers: {},
      maxFramebuffers: {},
      equations: {},

      // common resources to be deleted
      resources: {},

      // results
      results: {}
    };
    this._hasGPUSupport =
      isWebGL2(gl) && // gl_InstanceID usage in min/max calculation shaders
      hasFeatures(
        this.gl,
        FEATURES.BLEND_EQUATION_MINMAX, // set min/max blend modes
        FEATURES.COLOR_ATTACHMENT_RGBA32F, // render to float texture
        FEATURES.TEXTURE_FLOAT // sample from a float texture
      );
    if (this._hasGPUSupport) {
      this.setupModels();
    }
  }

  // Delete owned resources.
  /* eslint no-unused-expressions: ["error", { "allowShortCircuit": true }] */
  delete() {
    const {gridAggregationModel, allAggregationModel, meanTransform} = this;
    const {
      textures,
      framebuffers,
      maxMinFramebuffers,
      minFramebuffers,
      maxFramebuffers,
      meanTextures,
      resources
    } = this.state;

    gridAggregationModel && gridAggregationModel.delete();
    allAggregationModel && allAggregationModel.delete();
    meanTransform && meanTransform.delete();

    deleteResources([
      framebuffers,
      textures,
      maxMinFramebuffers,
      minFramebuffers,
      maxFramebuffers,
      meanTextures,
      resources
    ]);
  }

  // Perform aggregation and retun the results
  run(opts = {}) {
    // reset results
    this.setState({results: {}});
    const aggregationParams = this.getAggregationParams(opts);
    this.updateGridSize(aggregationParams);
    const {useGPU} = aggregationParams;
    if (this._hasGPUSupport && useGPU) {
      return this.runAggregationOnGPU(aggregationParams);
    }
    if (useGPU) {
      log.warn('GPUGridAggregator: GPU Aggregation not supported, falling back to CPU')();
    }
    return this.runAggregationOnCPU(aggregationParams);
  }

  // Reads aggregation data into JS Array object
  // For WebGL1, data is available in JS Array objects already.
  // For WebGL2, data is read from Buffer objects and cached for subsequent queries.
  getData(weightId) {
    const data = {};
    const results = this.state.results;
    if (!results[weightId].aggregationData) {
      // cache the results if reading from the buffer (WebGL2 path)
      results[weightId].aggregationData = results[weightId].aggregationBuffer.getData();
    }
    data.aggregationData = results[weightId].aggregationData;

    // Check for optional results
    for (const arrayName in ARRAY_BUFFER_MAP) {
      const bufferName = ARRAY_BUFFER_MAP[arrayName];

      if (results[weightId][arrayName] || results[weightId][bufferName]) {
        // cache the result
        results[weightId][arrayName] =
          results[weightId][arrayName] || results[weightId][bufferName].getData();
        data[arrayName] = results[weightId][arrayName];
      }
    }
    return data;
  }

  // PRIVATE

  getAggregationParams(opts) {
    const aggregationParams = Object.assign({}, DEFAULT_RUN_PARAMS, opts);
    const {
      useGPU,
      gridTransformMatrix,
      moduleSettings,
      weights,
      projectPoints,
      cellSize
    } = aggregationParams;
    const {viewport} = moduleSettings;
    if (this.state.useGPU !== useGPU) {
      // CPU/GPU resources need to reinitialized, force set the change flags.
      aggregationParams.changeFlags = Object.assign(
        {},
        aggregationParams.changeFlags,
        DEFAULT_CHANGE_FLAGS
      );
    }
    if (
      cellSize &&
      (!this.state.cellSize ||
        this.state.cellSize[0] !== cellSize[0] ||
        this.state.cellSize[1] !== cellSize[1])
    ) {
      aggregationParams.changeFlags.cellSizeChanged = true;
      // For GridLayer aggregation, cellSize is calculated by parsing all input data as it depends
      // on bounding box, cache cellSize
      this.setState({cellSize});
    }

    // validateProps(aggregationParams, opts);

    this.setState({useGPU});
    aggregationParams.gridTransformMatrix =
      (projectPoints ? viewport.viewportMatrix : gridTransformMatrix) || IDENTITY_MATRIX;

    if (weights) {
      aggregationParams.weights = normalizeWeightParams(weights);

      // cache weights to process when only cellSize or viewport is changed.
      // position data is cached in Buffers for GPU case and in 'gridPositions' for CPU case.
      this.setState({weights: aggregationParams.weights});
    }
    return aggregationParams;
  }

  // Update priveate state
  setState(updateObject) {
    Object.assign(this.state, updateObject);
  }

  updateGridSize(opts) {
    const {moduleSettings, cellSize} = opts;
    const {viewport} = moduleSettings;
    const width = opts.width || viewport.width;
    const height = opts.height || viewport.height;
    const numCol = Math.ceil(width / cellSize[0]);
    const numRow = Math.ceil(height / cellSize[1]);
    this.setState({numCol, numRow, windowSize: [width, height]});
  }

  // CPU Aggregation methods

  // aggregated weight value to a cell
  /* eslint-disable max-depth */
  calculateAggregationData(opts) {
    const {weights, results, cellIndex, posIndex, attributes} = opts;
    for (const id in weights) {
      const {size, operation} = weights[id];
      // TODO - value might not exist (e.g. attribute transition)
      const values = attributes[id].value;
      const {aggregationData} = results[id];
      for (let sizeIndex = 0; sizeIndex < size; sizeIndex++) {
        const cellElementIndex = cellIndex + sizeIndex;
        const weightComponent = values[posIndex * WEIGHT_SIZE + sizeIndex];

        if (aggregationData[cellIndex + 3] === 0) {
          // if the cell is getting update the first time, set the value directly.
          aggregationData[cellElementIndex] = weightComponent;
        } else {
          switch (operation) {
            case AGGREGATION_OPERATION.SUM:
            case AGGREGATION_OPERATION.MEAN:
              aggregationData[cellElementIndex] += weightComponent;
              // MEAN value is calculated during 'calculateMeanMaxMinData'
              break;
            case AGGREGATION_OPERATION.MIN:
              aggregationData[cellElementIndex] = Math.min(
                aggregationData[cellElementIndex],
                weightComponent
              );
              break;
            case AGGREGATION_OPERATION.MAX:
              aggregationData[cellElementIndex] = Math.max(
                aggregationData[cellElementIndex],
                weightComponent
              );
              break;
            default:
              // Not a valid operation enum.
              log.assert(false);
              break;
          }
        }
      }

      // Track the count per grid-cell
      aggregationData[cellIndex + 3]++;
    }
  }

  /* eslint-disable max-depth, complexity */
  calculateMeanMaxMinData(opts) {
    const {validCellIndices, results, weights} = opts;

    // collect max/min values
    validCellIndices.forEach(cellIndex => {
      for (const id in results) {
        const {size, needMin, needMax, operation} = weights[id];
        const {aggregationData, minData, maxData, maxMinData} = results[id];
        const calculateMinMax = needMin || needMax;
        const calculateMean = operation === AGGREGATION_OPERATION.MEAN;
        const combineMaxMin = needMin && needMax && weights[id].combineMaxMin;
        const count = aggregationData[cellIndex + ELEMENTCOUNT - 1];
        for (
          let sizeIndex = 0;
          sizeIndex < size && (calculateMinMax || calculateMean);
          sizeIndex++
        ) {
          const cellElementIndex = cellIndex + sizeIndex;
          let weight = aggregationData[cellElementIndex];
          if (calculateMean) {
            aggregationData[cellElementIndex] /= count;
            weight = aggregationData[cellElementIndex];
          }
          if (combineMaxMin) {
            // use RGB for max values for 3 weights.
            maxMinData[sizeIndex] = Math.max(maxMinData[sizeIndex], weight);
          } else {
            if (needMin) {
              minData[sizeIndex] = Math.min(minData[sizeIndex], weight);
            }
            if (needMax) {
              maxData[sizeIndex] = Math.max(maxData[sizeIndex], weight);
            }
          }
        }
        // update total aggregation values.
        if (combineMaxMin) {
          // Use Alpha channel to store total min value for weight#0
          maxMinData[ELEMENTCOUNT - 1] = Math.min(
            maxMinData[ELEMENTCOUNT - 1],
            aggregationData[cellIndex + 0]
          );
        } else {
          // Use Alpha channel to store total counts.
          if (needMin) {
            minData[ELEMENTCOUNT - 1] += count;
          }
          if (needMax) {
            maxData[ELEMENTCOUNT - 1] += count;
          }
        }
      }
    });
  }
  /* eslint-enable max-depth */

  initCPUResults(opts) {
    const weights = opts.weights || this.state.weights;
    const {numCol, numRow} = this.state;
    const results = {};
    // setup results object
    for (const id in weights) {
      let {aggregationData, minData, maxData, maxMinData} = weights[id];
      const {needMin, needMax} = weights[id];
      const combineMaxMin = needMin && needMax && weights[id].combineMaxMin;

      const aggregationSize = numCol * numRow * ELEMENTCOUNT;
      aggregationData = getFloatArray(aggregationData, aggregationSize);
      if (combineMaxMin) {
        maxMinData = getFloatArray(maxMinData, ELEMENTCOUNT);
        // RGB for max value
        maxMinData.fill(-Infinity, 0, ELEMENTCOUNT - 1);
        // Alpha for min value
        maxMinData[ELEMENTCOUNT - 1] = Infinity;
      } else {
        // RGB for min/max values
        // Alpha for total count
        if (needMin) {
          minData = getFloatArray(minData, ELEMENTCOUNT, Infinity);
          minData[ELEMENTCOUNT - 1] = 0;
        }
        if (needMax) {
          maxData = getFloatArray(maxData, ELEMENTCOUNT, -Infinity);
          maxData[ELEMENTCOUNT - 1] = 0;
        }
      }
      results[id] = Object.assign({}, weights[id], {
        aggregationData,
        minData,
        maxData,
        maxMinData
      });
    }
    return results;
  }

  /* eslint-disable max-statements */
  runAggregationOnCPU(opts) {
    const {
      attributes,
      vertexCount,
      cellSize,
      gridTransformMatrix,
      moduleSettings,
      projectPoints
    } = opts;
    let {weights} = opts;
    const {numCol, numRow} = this.state;
    let {gridPositions} = this.state;
    const {viewport} = moduleSettings;
    const results = this.initCPUResults(opts);
    // screen space or world space projection required
    const gridTransformRequired = !gridPositions || shouldTransformToGrid(opts);
    const pos = [0, 0, 0];

    log.assert(gridTransformRequired || opts.changeFlags.cellSizeChanged);

    if (gridTransformRequired) {
      gridPositions = new Float64Array(vertexCount * 2);
      this.setState({gridPositions});
    } else {
      gridPositions = this.state.gridPositions;
      weights = this.state.weights;
    }

    const validCellIndices = new Set();
    const positions = attributes.positions.value;
    const posSize = 3;
    for (let posIndex = 0; posIndex < vertexCount; posIndex++) {
      let x;
      let y;
      if (gridTransformRequired) {
        pos[0] = positions[posIndex * posSize];
        pos[1] = positions[posIndex * posSize + 1];
        if (projectPoints) {
          [x, y] = viewport.project(pos);
        } else {
          [x, y] = worldToPixels(pos, gridTransformMatrix);
        }
        gridPositions[posIndex * 2] = x;
        gridPositions[posIndex * 2 + 1] = y;
      } else {
        x = gridPositions[posIndex * 2];
        y = gridPositions[posIndex * 2 + 1];
      }

      const colId = Math.floor(x / cellSize[0]);
      const rowId = Math.floor(y / cellSize[1]);
      if (colId >= 0 && colId < numCol && rowId >= 0 && rowId < numRow) {
        const cellIndex = (colId + rowId * numCol) * ELEMENTCOUNT;
        validCellIndices.add(cellIndex);
        this.calculateAggregationData({weights, results, cellIndex, posIndex, attributes});
      }
    }

    this.calculateMeanMaxMinData({validCellIndices, results, weights});

    // Update buffer objects.
    this.updateAggregationBuffers(opts, results);

    this.setState({results});
    return results;
  }
  /* eslint-disable max-statements */

  _uploadResultsToGPU({gl, bufferName, textureName, id, data, result}) {
    const {resources} = this.state;
    const resourceName = `cpu-result-${id}-${bufferName}`;
    result[bufferName] = result[bufferName] || resources[resourceName];
    if (result[bufferName]) {
      result[bufferName].setData({data});
    } else {
      // save resource for garbage collection
      resources[resourceName] = new Buffer(gl, data);
      result[bufferName] = resources[resourceName];
    }

    // Upload result to a texture
    if (textureName) {
      const texture = this._getMinMaxTexture(`${id}-textureName`);
      texture.setImageData({data});
      result[textureName] = texture;
    }
  }

  updateAggregationBuffers(opts, results) {
    if (!opts.createBufferObjects) {
      return;
    }
    const weights = opts.weights || this.state.weights;
    for (const id in results) {
      const {aggregationData, minData, maxData, maxMinData} = results[id];
      const {needMin, needMax} = weights[id];
      const combineMaxMin = needMin && needMax && weights[id].combineMaxMin;
      this._uploadResultsToGPU({
        gl: this.gl,
        bufferName: 'aggregationBuffer',
        id,
        data: aggregationData,
        result: results[id]
      });
      if (combineMaxMin) {
        this._uploadResultsToGPU({
          gl: this.gl,
          bufferName: 'maxMinBuffer',
          textureName: 'maxMinTexture',
          id,
          data: maxMinData,
          result: results[id]
        });
      } else {
        if (needMin) {
          this._uploadResultsToGPU({
            gl: this.gl,
            bufferName: 'minBuffer',
            textureName: 'minTexture',
            id,
            data: minData,
            result: results[id]
          });
        }
        if (needMax) {
          this._uploadResultsToGPU({
            gl: this.gl,
            bufferName: 'maxBuffer',
            textureName: 'maxTexture',
            id,
            data: maxData,
            result: results[id]
          });
        }
      }
    }
  }

  // GPU Aggregation methods

  getAggregateData(opts) {
    const results = {};
    const {
      textures,
      framebuffers,
      maxMinFramebuffers,
      minFramebuffers,
      maxFramebuffers,
      weights,
      resources
    } = this.state;

    for (const id in weights) {
      results[id] = {};
      const {needMin, needMax, combineMaxMin} = weights[id];
      results[id].aggregationTexture = textures[id];
      results[id].aggregationBuffer = readPixelsToBuffer(framebuffers[id], {
        target: weights[id].aggregationBuffer, // update if a buffer is provided
        sourceType: GL.FLOAT
      });
      if (needMin && needMax && combineMaxMin) {
        results[id].maxMinBuffer = readPixelsToBuffer(maxMinFramebuffers[id], {
          target: weights[id].maxMinBuffer, // update if a buffer is provided
          sourceType: GL.FLOAT
        });
        results[id].maxMinTexture = resources[`${id}-maxMinTexture`];
      } else {
        if (needMin) {
          results[id].minBuffer = readPixelsToBuffer(minFramebuffers[id], {
            target: weights[id].minBuffer, // update if a buffer is provided
            sourceType: GL.FLOAT
          });
          results[id].minTexture = resources[`${id}-minTexture`];
        }
        if (needMax) {
          results[id].maxBuffer = readPixelsToBuffer(maxFramebuffers[id], {
            target: weights[id].maxBuffer, // update if a buffer is provided
            sourceType: GL.FLOAT
          });
          results[id].maxTexture = resources[`${id}-maxTexture`];
        }
      }
    }
    this.trackGPUResultBuffers(results, weights);
    return results;
  }

  renderAggregateData(opts) {
    const {cellSize, gridTransformMatrix, projectPoints, attributes, moduleSettings} = opts;
    const {
      numCol,
      numRow,
      windowSize,
      maxMinFramebuffers,
      minFramebuffers,
      maxFramebuffers,
      weights
    } = this.state;

    const uProjectionMatrixFP64 = fp64ifyMatrix4(gridTransformMatrix);
    const gridSize = [numCol, numRow];
    const parameters = {
      blend: true,
      depthTest: false,
      blendFunc: [GL.ONE, GL.ONE]
    };
    const uniforms = {
      windowSize,
      cellSize,
      gridSize,
      uProjectionMatrix: gridTransformMatrix,
      uProjectionMatrixFP64,
      projectPoints
    };

    for (const id in weights) {
      const {needMin, needMax} = weights[id];
      const combineMaxMin = needMin && needMax && weights[id].combineMaxMin;
      this.renderToWeightsTexture({id, parameters, moduleSettings, uniforms, gridSize, attributes});
      if (combineMaxMin) {
        this.renderToMaxMinTexture({
          id,
          parameters: Object.assign({}, parameters, {blendEquation: MAX_MIN_BLEND_EQUATION}),
          gridSize,
          minOrMaxFb: maxMinFramebuffers[id],
          clearParams: {clearColor: [0, 0, 0, MAX_32_BIT_FLOAT]},
          combineMaxMin
        });
      } else {
        if (needMin) {
          this.renderToMaxMinTexture({
            id,
            parameters: Object.assign({}, parameters, {blendEquation: MIN_BLEND_EQUATION}),
            gridSize,
            minOrMaxFb: minFramebuffers[id],
            clearParams: {clearColor: [MAX_32_BIT_FLOAT, MAX_32_BIT_FLOAT, MAX_32_BIT_FLOAT, 0]},
            combineMaxMin
          });
        }
        if (needMax) {
          this.renderToMaxMinTexture({
            id,
            parameters: Object.assign({}, parameters, {blendEquation: MAX_BLEND_EQUATION}),
            gridSize,
            minOrMaxFb: maxFramebuffers[id],
            combineMaxMin
          });
        }
      }
    }
  }

  // render all aggregated grid-cells to generate Min, Max or MaxMin data texture
  renderToMaxMinTexture(opts) {
    const {id, parameters, gridSize, minOrMaxFb, combineMaxMin, clearParams = {}} = opts;
    const {framebuffers} = this.state;
    const {gl, allAggregationModel} = this;

    minOrMaxFb.bind();
    gl.viewport(0, 0, gridSize[0], gridSize[1]);
    withParameters(gl, clearParams, () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
    });
    allAggregationModel.draw({
      parameters,
      uniforms: {
        uSampler: framebuffers[id].texture,
        gridSize,
        combineMaxMin
      }
    });
    minOrMaxFb.unbind();
  }

  // render all data points to aggregate weights
  renderToWeightsTexture(opts) {
    const {id, parameters, moduleSettings, uniforms, gridSize} = opts;
    const {framebuffers, equations, weightAttributes, weights} = this.state;
    const {gl, gridAggregationModel} = this;
    const {operation} = weights[id];

    framebuffers[id].bind();
    gl.viewport(0, 0, gridSize[0], gridSize[1]);
    const clearColor =
      operation === AGGREGATION_OPERATION.MIN
        ? [MAX_32_BIT_FLOAT, MAX_32_BIT_FLOAT, MAX_32_BIT_FLOAT, 0]
        : [0, 0, 0, 0];
    withParameters(gl, {clearColor}, () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
    });

    const attributes = {weights: weightAttributes[id]};
    gridAggregationModel.draw({
      parameters: Object.assign({}, parameters, {blendEquation: equations[id]}),
      moduleSettings,
      uniforms,
      attributes
    });
    framebuffers[id].unbind();

    if (operation === AGGREGATION_OPERATION.MEAN) {
      const {meanTextures, textures} = this.state;
      const transformOptions = {
        _sourceTextures: {aggregationValues: meanTextures[id]}, // contains aggregated data
        _targetTexture: textures[id], // store mean values,
        elementCount: textures[id].width * textures[id].height
      };
      if (this.meanTransform) {
        this.meanTransform.update(transformOptions);
      } else {
        this.meanTransform = getMeanTransform(gl, transformOptions);
      }
      this.meanTransform.run({
        parameters: {
          blend: false,
          depthTest: false
        }
      });

      // update framebuffer with mean results so readPixelsToBuffer returns mean values
      framebuffers[id].attach({[GL.COLOR_ATTACHMENT0]: textures[id]});
    }
  }

  runAggregationOnGPU(opts) {
    this.updateModels(opts);
    this.setupFramebuffers(opts);
    this.renderAggregateData(opts);
    const results = this.getAggregateData(opts);
    this.setState({results});
    return results;
  }

  // set up framebuffer for each weight
  /* eslint-disable complexity, max-depth */
  setupFramebuffers(opts) {
    const {
      numCol,
      numRow,
      textures,
      framebuffers,
      maxMinFramebuffers,
      minFramebuffers,
      maxFramebuffers,
      meanTextures,
      equations,
      weights
    } = this.state;
    const framebufferSize = {width: numCol, height: numRow};
    for (const id in weights) {
      const {needMin, needMax, combineMaxMin, operation} = weights[id];
      textures[id] =
        weights[id].aggregationTexture ||
        textures[id] ||
        getFloatTexture(this.gl, {id: `${id}-texture`, width: numCol, height: numRow});
      textures[id].resize(framebufferSize);
      let texture = textures[id];
      if (operation === AGGREGATION_OPERATION.MEAN) {
        // For MEAN, we first aggregatet into a temp texture
        meanTextures[id] =
          meanTextures[id] ||
          getFloatTexture(this.gl, {id: `${id}-mean-texture`, width: numCol, height: numRow});
        meanTextures[id].resize(framebufferSize);
        texture = meanTextures[id];
      }
      if (framebuffers[id]) {
        framebuffers[id].attach({[GL.COLOR_ATTACHMENT0]: texture});
      } else {
        framebuffers[id] = getFramebuffer(this.gl, {
          id: `${id}-fb`,
          width: numCol,
          height: numRow,
          texture
        });
      }
      framebuffers[id].resize(framebufferSize);
      equations[id] = EQUATION_MAP[operation];
      // For min/max framebuffers will use default size 1X1
      if (needMin || needMax) {
        if (needMin && needMax && combineMaxMin) {
          if (!maxMinFramebuffers[id]) {
            texture = this._getMinMaxTexture(`${id}-maxMinTexture`);
            maxMinFramebuffers[id] = getFramebuffer(this.gl, {id: `${id}-maxMinFb`, texture});
          }
        } else {
          if (needMin) {
            if (!minFramebuffers[id]) {
              texture = this._getMinMaxTexture(`${id}-minTexture`);
              minFramebuffers[id] = getFramebuffer(this.gl, {
                id: `${id}-minFb`,
                texture
              });
            }
          }
          if (needMax) {
            if (!maxFramebuffers[id]) {
              texture = this._getMinMaxTexture(`${id}-maxTexture`);
              maxFramebuffers[id] = getFramebuffer(this.gl, {
                id: `${id}-maxFb`,
                texture
              });
            }
          }
        }
      }
    }
  }
  /* eslint-enable complexity, max-depth */

  _getMinMaxTexture(name) {
    const {resources} = this.state;
    if (!resources[name]) {
      resources[name] = getFloatTexture(this.gl, {id: `resourceName`});
    }
    return resources[name];
  }

  setupModels(fp64 = false) {
    this.setupAggregationModel(fp64);
    if (!this.allAggregationModel) {
      const {gl} = this;
      const {numCol, numRow} = this.state;
      const instanceCount = numCol * numRow;
      // Model doesn't have to change when fp64 flag changes
      this.allAggregationModel = getAllAggregationModel(gl, instanceCount);
    }
  }

  setupAggregationModel(fp64 = false) {
    const {gl} = this;
    const {shaderOptions} = this.state;
    if (this.gridAggregationModel) {
      this.gridAggregationModel.delete();
    }
    this.gridAggregationModel = getAggregationModel(gl, shaderOptions, fp64);
  }

  // set up buffers for all weights
  setupWeightAttributes(opts) {
    const {weightAttributes, weights} = this.state;
    for (const id in weights) {
      weightAttributes[id] = opts.attributes[id];
    }
  }

  // GPU Aggregation results are provided in Buffers, if new Buffer objects are created track them for later deletion.
  /* eslint-disable max-depth */
  trackGPUResultBuffers(results, weights) {
    const {resources} = this.state;
    for (const id in results) {
      if (results[id]) {
        for (const bufferName of BUFFER_NAMES) {
          if (results[id][bufferName] && weights[id][bufferName] !== results[id][bufferName]) {
            // No result buffer is provided in weights object, `readPixelsToBuffer` has created a new Buffer object
            // collect the new buffer for garabge collection
            const name = `gpu-result-${id}-${bufferName}`;
            if (resources[name]) {
              resources[name].delete();
            }
            resources[name] = results[id][bufferName];
          }
        }
      }
    }
  }
  /* eslint-enable max-depth */

  /* eslint-disable max-statements */
  updateModels(opts) {
    const {changeFlags, vertexCount, attributes} = opts;
    const {numCol, numRow, modelDirty} = this.state;

    if (opts.fp64 !== this.state.fp64 || modelDirty) {
      this.setupModels(opts.fp64);
      this.setState({fp64: opts.fp64, modelDirty: false});
    }

    // this maps color/elevation to weight name.
    this.setupWeightAttributes(opts);

    this.gridAggregationModel.setVertexCount(vertexCount);
    this.gridAggregationModel.setAttributes(attributes);

    if (changeFlags.cellSizeChanged || changeFlags.viewportChanged) {
      this.allAggregationModel.setInstanceCount(numCol * numRow);
    }
  }
  /* eslint-enable max-statements */

  updateShaders(shaderOptions = {}) {
    this.setState({shaderOptions, modelDirty: true});
  }
}

// HELPER METHODS

function normalizeWeightParams(weights) {
  const result = {};
  for (const id in weights) {
    result[id] = Object.assign({}, DEFAULT_WEIGHT_PARAMS, weights[id]);
  }
  return result;
}

function deleteResources(resources) {
  resources = Array.isArray(resources) ? resources : [resources];
  resources.forEach(obj => {
    for (const name in obj) {
      obj[name].delete();
    }
  });
}

function shouldTransformToGrid(opts) {
  const {projectPoints, changeFlags} = opts;
  if (
    changeFlags.dataChanged ||
    (projectPoints && changeFlags.viewportChanged) // world space aggregation (GridLayer) doesn't change when viewport is changed.
  ) {
    return true;
  }
  return false;
}

function getAggregationModel(gl, shaderOptions, fp64 = false) {
  const shaders = mergeShaders(
    {
      vs: fp64 ? AGGREGATE_TO_GRID_VS_FP64 : AGGREGATE_TO_GRID_VS,
      fs: AGGREGATE_TO_GRID_FS,
      modules: fp64 ? [project64] : [project32]
    },
    shaderOptions
  );

  return new Model(gl, {
    id: 'Gird-Aggregation-Model',
    vertexCount: 0,
    drawMode: GL.POINTS,
    ...shaders
  });
}

function getAllAggregationModel(gl, instanceCount) {
  return new Model(gl, {
    id: 'All-Aggregation-Model',
    vs: AGGREGATE_ALL_VS_FP64,
    fs: AGGREGATE_ALL_FS,
    modules: [fp64ShaderModule],
    vertexCount: 1,
    drawMode: GL.POINTS,
    isInstanced: true,
    instanceCount,
    attributes: {
      position: [0, 0]
    }
  });
}

function getMeanTransform(gl, opts) {
  return new Transform(
    gl,
    Object.assign(
      {},
      {
        vs: TRANSFORM_MEAN_VS,
        _targetTextureVarying: 'meanValues'
      },
      opts
    )
  );
}

/* eslint-disable complexity */
// DEBUG ONLY
// validateProps(aggregationParams, opts) {
//   const {changeFlags, projectPoints, gridTransformMatrix} = aggregationParams;
//   log.assert(
//     changeFlags.dataChanged || changeFlags.viewportChanged || changeFlags.cellSizeChanged
//   );
//
//   // log.assert for required options
//   log.assert(
//     !changeFlags.dataChanged ||
//       (opts.attributes &&
//         opts.weights &&
//         (!opts.projectPositions || opts.moduleSettings.viewport) &&
//         opts.cellSize)
//   );
//   log.assert(!changeFlags.cellSizeChanged || opts.cellSize);
//
//   // viewport is needed only when performing screen space aggregation (projectPoints is true)
//   log.assert(!(changeFlags.viewportChanged && projectPoints) || opts.moduleSettings.viewport);
//
//   if (projectPoints && gridTransformMatrix) {
//     log.warn('projectPoints is true, gridTransformMatrix is ignored')();
//   }
// }
/* eslint-enable complexity */

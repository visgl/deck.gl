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

import type {Device, DeviceFeature} from '@luma.gl/core';
import {Model, TextureTransform} from '@luma.gl/engine';
import {fp64arithmetic} from '@luma.gl/shadertools';
import {GL} from '@luma.gl/constants';
import {project32, _mergeShaders as mergeShaders, getShaderAssembler} from '@deck.gl/core';

import {
  DEFAULT_RUN_PARAMS,
  MAX_32_BIT_FLOAT,
  MIN_BLEND_EQUATION,
  MAX_BLEND_EQUATION,
  MAX_MIN_BLEND_EQUATION,
  EQUATION_MAP,
  DEFAULT_WEIGHT_PARAMS,
  PIXEL_SIZE
} from './gpu-grid-aggregator-constants';
import {AGGREGATION_OPERATION} from '../aggregation-operation-utils';

import AGGREGATE_TO_GRID_VS from './aggregate-to-grid-vs.glsl';
import AGGREGATE_TO_GRID_FS from './aggregate-to-grid-fs.glsl';
import AGGREGATE_ALL_VS from './aggregate-all-vs.glsl';
import AGGREGATE_ALL_FS from './aggregate-all-fs.glsl';
import TRANSFORM_MEAN_VS from './transform-mean-vs.glsl';
import {getFloatTexture, getFramebuffer} from './../resource-utils';

const BUFFER_NAMES = ['aggregationBuffer', 'maxMinBuffer', 'minBuffer', 'maxBuffer'];
const ARRAY_BUFFER_MAP = {
  maxData: 'maxBuffer',
  minData: 'minBuffer',
  maxMinData: 'maxMinBuffer'
};

const REQUIRED_FEATURES: DeviceFeature[] = [
  'float32-renderable-webgl',
  'texture-blend-float-webgl'
];

export type GPUGridAggregatorProps = {
  id?: string;
};

export default class GPUGridAggregator {
  // Decode and return aggregation data of given pixel.
  static getAggregationData({
    aggregationData,
    maxData,
    minData,
    maxMinData,
    pixelIndex
  }: {
    aggregationData?: Float32Array;
    maxData?: Float32Array;
    minData?: Float32Array;
    maxMinData?: Float32Array;
    pixelIndex: number;
  }) {
    const index = pixelIndex * PIXEL_SIZE;
    const results: {cellCount?; cellWeight?; maxCellWieght?; minCellWeight?; totalCount?} = {};
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
        results.totalCount = minData[3];
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

  static isSupported(device: Device) {
    return REQUIRED_FEATURES.every(feature => device.features.has(feature));
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

  state = {
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

    shaderOptions: {},
    modelDirty: false,

    // common resources to be deleted
    resources: {},

    // results
    results: {}
  };

  id: string;
  device: Device;
  _hasGPUSupport: boolean;

  gridAggregationModel;
  allAggregationModel;
  meanTransform;

  constructor(device: Device, props: GPUGridAggregatorProps = {}) {
    this.id = props.id || 'gpu-grid-aggregator';
    this.device = device;

    const REQUIRED_FEATURES: DeviceFeature[] = [
      'float32-renderable-webgl' // render to float texture
    ];

    this._hasGPUSupport = REQUIRED_FEATURES.every(feature => device.features.has(feature));
    if (this._hasGPUSupport) {
      this._setupModels();
    }
  }

  // Delete owned resources.
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

    gridAggregationModel?.destroy();
    allAggregationModel?.destroy();
    meanTransform?.destroy();

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
    const aggregationParams = this._normalizeAggregationParams(opts);
    return this._runAggregation(aggregationParams);
  }

  // Reads aggregation data into JS Array object
  // For WebGL1, data is available in JS Array objects already.
  // For WebGL2, data is read from Buffer objects and cached for subsequent queries.
  getData(weightId) {
    const data: {
      aggregationData?: Float32Array;
      maxData?: Float32Array;
      minData?: Float32Array;
      maxMinData?: Float32Array;
    } = {};
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

  updateShaders(shaderOptions = {}) {
    this.setState({shaderOptions, modelDirty: true});
  }

  // PRIVATE

  _normalizeAggregationParams(opts) {
    const aggregationParams = {...DEFAULT_RUN_PARAMS, ...opts};
    const {weights} = aggregationParams;
    if (weights) {
      aggregationParams.weights = normalizeWeightParams(weights);
    }
    return aggregationParams;
  }

  // Update priveate state
  setState(updateObject) {
    Object.assign(this.state, updateObject);
  }

  // GPU Aggregation methods

  _getAggregateData(opts) {
    const results = {};
    const {
      textures,
      framebuffers,
      maxMinFramebuffers,
      minFramebuffers,
      maxFramebuffers,
      resources
    } = this.state;
    const {weights} = opts;

    for (const id in weights) {
      results[id] = {};
      const {needMin, needMax, combineMaxMin} = weights[id];
      results[id].aggregationTexture = textures[id];
      results[id].aggregationBuffer = this.device.readPixelsToBufferWebGL(framebuffers[id], {
        target: weights[id].aggregationBuffer, // update if a buffer is provided
        sourceType: GL.FLOAT
      });
      if (needMin && needMax && combineMaxMin) {
        results[id].maxMinBuffer = this.device.readPixelsToBufferWebGL(maxMinFramebuffers[id], {
          target: weights[id].maxMinBuffer, // update if a buffer is provided
          sourceType: GL.FLOAT
        });
        results[id].maxMinTexture = resources[`${id}-maxMinTexture`];
      } else {
        if (needMin) {
          results[id].minBuffer = this.device.readPixelsToBufferWebGL(minFramebuffers[id], {
            target: weights[id].minBuffer, // update if a buffer is provided
            sourceType: GL.FLOAT
          });
          results[id].minTexture = resources[`${id}-minTexture`];
        }
        if (needMax) {
          results[id].maxBuffer = this.device.readPixelsToBufferWebGL(maxFramebuffers[id], {
            target: weights[id].maxBuffer, // update if a buffer is provided
            sourceType: GL.FLOAT
          });
          results[id].maxTexture = resources[`${id}-maxTexture`];
        }
      }
    }
    this._trackGPUResultBuffers(results, weights);
    return results;
  }

  _renderAggregateData(opts) {
    const {
      cellSize,
      projectPoints,
      attributes,
      moduleSettings,
      numCol,
      numRow,
      weights,
      translation,
      scaling
    } = opts;
    const {maxMinFramebuffers, minFramebuffers, maxFramebuffers} = this.state;

    const gridSize = [numCol, numRow];
    const parameters = {
      blend: true,
      depthTest: false,
      blendFunc: [GL.ONE, GL.ONE]
    };
    const uniforms = {
      cellSize,
      gridSize,
      projectPoints,
      translation,
      scaling
    };

    for (const id in weights) {
      const {needMin, needMax} = weights[id];
      const combineMaxMin = needMin && needMax && weights[id].combineMaxMin;
      this._renderToWeightsTexture({
        id,
        parameters,
        moduleSettings,
        uniforms,
        gridSize,
        attributes,
        weights
      });
      if (combineMaxMin) {
        this._renderToMaxMinTexture({
          id,
          parameters: {...parameters, blendEquation: MAX_MIN_BLEND_EQUATION},
          gridSize,
          minOrMaxFb: maxMinFramebuffers[id],
          clearParams: {clearColor: [0, 0, 0, MAX_32_BIT_FLOAT]},
          combineMaxMin
        });
      } else {
        if (needMin) {
          this._renderToMaxMinTexture({
            id,
            parameters: {...parameters, blendEquation: MIN_BLEND_EQUATION},
            gridSize,
            minOrMaxFb: minFramebuffers[id],
            clearParams: {clearColor: [MAX_32_BIT_FLOAT, MAX_32_BIT_FLOAT, MAX_32_BIT_FLOAT, 0]},
            combineMaxMin
          });
        }
        if (needMax) {
          this._renderToMaxMinTexture({
            id,
            parameters: {...parameters, blendEquation: MAX_BLEND_EQUATION},
            gridSize,
            minOrMaxFb: maxFramebuffers[id],
            clearParams: {clearColor: [0, 0, 0, 0]},
            combineMaxMin
          });
        }
      }
    }
  }

  // render all aggregated grid-cells to generate Min, Max or MaxMin data texture
  _renderToMaxMinTexture(opts) {
    const {id, gridSize, minOrMaxFb, combineMaxMin, clearParams = {}} = opts;
    const {framebuffers} = this.state;
    const {allAggregationModel} = this;

    this.device.withParametersWebGL(
      {
        ...clearParams,
        framebuffer: minOrMaxFb,
        viewport: [0, 0, gridSize[0], gridSize[1]]
      },
      () => {
        this.device.clearWebGL({color: true});

        // allAggregationModel.setParameters(parameters);
        allAggregationModel.setUniforms({gridSize, combineMaxMin});
        allAggregationModel.setBindings({uSampler: framebuffers[id].texture});
        allAggregationModel.draw();
        // TODO - we need to create a render pass for the aggregation
        // allAggregationModel.draw(renderPass);
      }
    );
  }

  // render all data points to aggregate weights
  _renderToWeightsTexture(opts) {
    const {id, parameters, moduleSettings, uniforms, gridSize, weights} = opts;
    const {framebuffers, equations, weightAttributes} = this.state;
    const {gridAggregationModel} = this;
    const {operation} = weights[id];

    const clearColor =
      operation === AGGREGATION_OPERATION.MIN
        ? [MAX_32_BIT_FLOAT, MAX_32_BIT_FLOAT, MAX_32_BIT_FLOAT, 0]
        : [0, 0, 0, 0];
    this.device.withParametersWebGL(
      {
        framebuffer: framebuffers[id],
        viewport: [0, 0, gridSize[0], gridSize[1]],
        clearColor
      },
      () => {
        this.device.clearWebGL({color: true});

        const attributes = {weights: weightAttributes[id]};
        gridAggregationModel.draw({
          parameters: {...parameters, blendEquation: equations[id]},
          moduleSettings,
          uniforms,
          attributes
        });
      }
    );

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
        this.meanTransform = getMeanTransform(this.device, transformOptions);
      }
      this.meanTransform.run({
        parameters: {
          blend: false,
          depthTest: false
        }
      });

      // update framebuffer with mean results so device.readPixelsToBufferWebGL returns mean values
      framebuffers[id].attach({[GL.COLOR_ATTACHMENT0]: textures[id]});
    }
  }

  _runAggregation(opts) {
    this._updateModels(opts);
    this._setupFramebuffers(opts);
    this._renderAggregateData(opts);
    const results = this._getAggregateData(opts);
    this.setState({results});
    return results;
  }

  // set up framebuffer for each weight
  /* eslint-disable complexity, max-depth, max-statements*/
  _setupFramebuffers(opts) {
    const {
      textures,
      framebuffers,
      maxMinFramebuffers,
      minFramebuffers,
      maxFramebuffers,
      meanTextures,
      equations
    } = this.state;
    const {weights} = opts;
    const {numCol, numRow} = opts;
    const framebufferSize = {width: numCol, height: numRow};
    for (const id in weights) {
      const {needMin, needMax, combineMaxMin, operation} = weights[id];
      textures[id] =
        weights[id].aggregationTexture ||
        textures[id] ||
        getFloatTexture(this.device, {id: `${id}-texture`, width: numCol, height: numRow});
      textures[id].resize(framebufferSize);
      let texture = textures[id];
      if (operation === AGGREGATION_OPERATION.MEAN) {
        // For MEAN, we first aggregatet into a temp texture
        meanTextures[id] =
          meanTextures[id] ||
          getFloatTexture(this.device, {id: `${id}-mean-texture`, width: numCol, height: numRow});
        meanTextures[id].resize(framebufferSize);
        texture = meanTextures[id];
      }
      if (framebuffers[id]) {
        framebuffers[id].attach({[GL.COLOR_ATTACHMENT0]: texture});
      } else {
        framebuffers[id] = getFramebuffer(this.device, {
          id: `${id}-fb`,
          width: numCol,
          height: numRow,
          texture
        });
      }
      framebuffers[id].resize(framebufferSize);
      equations[id] = EQUATION_MAP[operation] || EQUATION_MAP[AGGREGATION_OPERATION.SUM];
      // For min/max framebuffers will use default size 1X1
      if (needMin || needMax) {
        if (needMin && needMax && combineMaxMin) {
          if (!maxMinFramebuffers[id]) {
            texture = weights[id].maxMinTexture || this._getMinMaxTexture(`${id}-maxMinTexture`);
            maxMinFramebuffers[id] = getFramebuffer(this.device, {id: `${id}-maxMinFb`, texture});
          }
        } else {
          if (needMin) {
            if (!minFramebuffers[id]) {
              texture = weights[id].minTexture || this._getMinMaxTexture(`${id}-minTexture`);
              minFramebuffers[id] = getFramebuffer(this.device, {
                id: `${id}-minFb`,
                texture
              });
            }
          }
          if (needMax) {
            if (!maxFramebuffers[id]) {
              texture = weights[id].maxTexture || this._getMinMaxTexture(`${id}-maxTexture`);
              maxFramebuffers[id] = getFramebuffer(this.device, {
                id: `${id}-maxFb`,
                texture
              });
            }
          }
        }
      }
    }
  }
  /* eslint-enable complexity, max-depth, max-statements */

  _getMinMaxTexture(name) {
    const {resources} = this.state;
    if (!resources[name]) {
      resources[name] = getFloatTexture(this.device, {id: 'resourceName'});
    }
    return resources[name];
  }

  _setupModels({numCol = 0, numRow = 0} = {}) {
    const {shaderOptions} = this.state;
    this.gridAggregationModel?.destroy();
    this.gridAggregationModel = getAggregationModel(this.device, shaderOptions);
    if (!this.allAggregationModel) {
      const instanceCount = numCol * numRow;
      this.allAggregationModel = getAllAggregationModel(this.device, instanceCount);
    }
  }

  // set up buffers for all weights
  _setupWeightAttributes(opts) {
    const {weightAttributes} = this.state;
    const {weights} = opts;
    for (const id in weights) {
      weightAttributes[id] = opts.attributes[id];
    }
  }

  /** GPU Aggregation results are provided in Buffers, if new Buffer objects are created track them for later deletion. */
  /* eslint-disable max-depth */
  _trackGPUResultBuffers(results, weights) {
    const {resources} = this.state;
    for (const id in results) {
      if (results[id]) {
        for (const bufferName of BUFFER_NAMES) {
          if (results[id][bufferName] && weights[id][bufferName] !== results[id][bufferName]) {
            // No result buffer is provided in weights object, `device.readPixelsToBufferWebGL` has created a new Buffer object
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

  _updateModels(opts) {
    const {vertexCount, attributes, numCol, numRow} = opts;
    const {modelDirty} = this.state;

    if (modelDirty) {
      this._setupModels(opts);
      this.setState({modelDirty: false});
    }

    // this maps color/elevation to weight name.
    this._setupWeightAttributes(opts);

    this.gridAggregationModel.setVertexCount(vertexCount);
    this.gridAggregationModel.setAttributes(attributes);

    this.allAggregationModel.setInstanceCount(numCol * numRow);
  }
}

// HELPER METHODS

function normalizeWeightParams(weights) {
  const result = {};
  for (const id in weights) {
    result[id] = {...DEFAULT_WEIGHT_PARAMS, ...weights[id]};
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

function getAggregationModel(device: Device, shaderOptions) {
  const shaders = mergeShaders(
    {
      vs: AGGREGATE_TO_GRID_VS,
      fs: AGGREGATE_TO_GRID_FS,
      modules: [fp64arithmetic, project32]
    },
    shaderOptions
  );

  return new Model(device, {
    id: 'Grid-Aggregation-Model',
    vertexCount: 1,
    drawMode: GL.POINTS,
    shaderAssembler: getShaderAssembler(),
    ...shaders
  });
}

function getAllAggregationModel(device: Device, instanceCount: number): Model {
  return new Model(device, {
    id: 'All-Aggregation-Model',
    vs: AGGREGATE_ALL_VS,
    fs: AGGREGATE_ALL_FS,
    modules: [fp64arithmetic],
    vertexCount: 1,
    topology: 'point-list',
    isInstanced: true,
    instanceCount,
    attributes: {
      // @ts-expect-error
      position: [0, 0]
    }
  });
}

function getMeanTransform(device: Device, opts) {
  return new TextureTransform(device, {
    vs: TRANSFORM_MEAN_VS,
    _targetTextureVarying: 'meanValues',
    ...opts
  });
}

import GL from 'luma.gl/constants';
import {Buffer, Model, FEATURES, hasFeatures, isWebGL2} from 'luma.gl';
import {log} from '@deck.gl/core';
import assert from 'assert';
import {fp64 as fp64Utils, withParameters} from 'luma.gl';
import {worldToPixels} from 'viewport-mercator-project';
const {fp64ifyMatrix4} = fp64Utils;

import {
  AGGREGATION_OPERATION,
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

import AGGREGATE_TO_GRID_VS from './aggregate-to-grid-vs.glsl';
import AGGREGATE_TO_GRID_VS_FP64 from './aggregate-to-grid-vs-64.glsl';
import AGGREGATE_TO_GRID_FS from './aggregate-to-grid-fs.glsl';
import AGGREGATE_ALL_VS_FP64 from './aggregate-all-vs-64.glsl';
import AGGREGATE_ALL_FS from './aggregate-all-fs.glsl';
import {
  getFloatTexture,
  getFramebuffer,
  getFloatArray,
  updateBuffer
} from './gpu-grid-aggregator-utils.js';

export default class GPUGridAggregator {
  // Decode and return aggregation data of given pixel.
  static getAggregationData({countsData, maxCountData, pixelIndex}) {
    assert(countsData.length >= (pixelIndex + 1) * PIXEL_SIZE);
    assert(maxCountData.length === PIXEL_SIZE);
    const index = pixelIndex * PIXEL_SIZE;
    const cellCount = countsData[index];
    const cellWeight = countsData[index + 1];
    const totalCount = maxCountData[0];
    const totalWeight = maxCountData[1];
    const maxCellWieght = maxCountData[3];
    return {
      cellCount,
      cellWeight,
      totalCount,
      totalWeight,
      maxCellWieght
    };
  }

  // Decodes and retuns counts and weights of all cells
  static getCellData({countsData, size = 1}) {
    const cellWeights = [];
    const cellCounts = [];
    for (let index = 0; index < countsData.length; index += 4) {
      // weights in RGB channels
      for (let sizeIndex = 0; sizeIndex < size; sizeIndex++) {
        cellWeights.push(countsData[index + sizeIndex]);
      }
      // count in Alpha channel
      cellCounts.push(countsData[index + 3]);
    }
    return {cellCounts, cellWeights};
  }

  // DEBUG ONLY
  // static logData({aggregationBuffer, minBuffer, maxBuffer, maxMinBuffer}) {
  //   const agrData = aggregationBuffer.getData();
  //   for (let index = 0; index < agrData.length; index += 4) {
  //     if (agrData[index + 3] > 0) {
  //       console.log(
  //         `index: ${index} weights: ${agrData[index]} ${agrData[index + 1]} ${
  //           agrData[index + 2]
  //         } count: ${agrData[index + 3]}`
  //       );
  //     }
  //   }
  // }

  constructor(gl, opts = {}) {
    this.id = opts.id || 'gpu-grid-aggregator';
    this.shaderCache = opts.shaderCache || null;
    this.gl = gl;
    this.state = {
      // per weight GPU resources
      weightAttributes: {},
      textures: {},
      buffers: {},
      framebuffers: {},
      maxMinFramebuffers: {},
      minFramebuffers: {},
      maxFramebuffers: {},
      equations: {}
    };
    this._hasGPUSupport =
      isWebGL2(gl) &&
      hasFeatures(
        this.gl,
        FEATURES.BLEND_EQUATION_MINMAX,
        FEATURES.COLOR_ATTACHMENT_RGBA32F,
        FEATURES.TEXTURE_FILTER_LINEAR_FLOAT
      );
  }

  // Delete owned resources.
  delete() {
    const {
      positionsBuffer,
      position64Buffer,
      framebuffers,
      maxMinFramebuffers,
      minFramebuffers,
      maxFramebuffers
    } = this.state;
    if (positionsBuffer) {
      positionsBuffer.delete();
    }
    if (position64Buffer) {
      position64Buffer.delete();
    }
    this._deleteResources(framebuffers);
    this._deleteResources(maxMinFramebuffers);
    this._deleteResources(minFramebuffers);
    this._deleteResources(maxFramebuffers);
  }

  // Perform aggregation and retun the results
  run(opts = {}) {
    const aggregationParams = this._getAggregationParams(opts);
    assert(aggregationParams);
    this._updateGridSize(aggregationParams);
    const {useGPU} = aggregationParams;
    if (this._hasGPUSupport && useGPU) {
      return this._runAggregationOnGPU(aggregationParams);
    }
    if (useGPU) {
      log.warn('ScreenGridAggregator: GPU Aggregation not supported, falling back to CPU')();
    }
    return this._runAggregationOnCPU(aggregationParams);
  }

  // PRIVATE

  _deleteResources(obj) {
    for (const name in obj) {
      obj[name].delete();
    }
  }
  /* eslint-disable max-depth */
  _getAggregateData(opts) {
    const results = {};
    const {
      textures,
      framebuffers,
      maxMinFramebuffers,
      minFramebuffers,
      maxFramebuffers,
      weights
    } = this.state;

    for (const id in weights) {
      results[id] = {};
      const {needMin, needMax, combineMaxMin} = weights[id];
      results[id].aggregationTexture = textures[id];
      results[id].aggregationBuffer = framebuffers[id].readPixelsToBuffer({
        buffer: weights[id].aggregationBuffer, // update if a buffer is provided
        type: GL.FLOAT
      });
      if (needMin || needMax) {
        if (needMin && needMax && combineMaxMin) {
          results[id].maxMinBuffer = maxMinFramebuffers[id].readPixelsToBuffer({
            buffer: weights[id].maxMinBuffer, // update if a buffer is provided
            type: GL.FLOAT
          });
        } else {
          if (needMin) {
            results[id].minBuffer = minFramebuffers[id].readPixelsToBuffer({
              buffer: weights[id].minBuffer, // update if a buffer is provided
              type: GL.FLOAT
            });
          }
          if (needMax) {
            results[id].maxBuffer = maxFramebuffers[id].readPixelsToBuffer({
              buffer: weights[id].maxBuffer, // update if a buffer is provided
              type: GL.FLOAT
            });
          }
        }
      }
    }
    return results;
  }
  /* eslint-disable min-depth */

  _getAggregationModel(fp64 = false) {
    const {gl, shaderCache} = this;
    return new Model(gl, {
      id: 'Gird-Aggregation-Model',
      vs: fp64 ? AGGREGATE_TO_GRID_VS_FP64 : AGGREGATE_TO_GRID_VS,
      fs: AGGREGATE_TO_GRID_FS,
      modules: fp64 ? ['fp64', 'project64'] : ['project32'],
      shaderCache,
      vertexCount: 0,
      drawMode: GL.POINTS
    });
  }

  _getAllAggregationModel(fp64 = false) {
    const {gl, shaderCache} = this;
    return new Model(gl, {
      id: 'All-Aggregation-Model',
      vs: AGGREGATE_ALL_VS_FP64,
      fs: AGGREGATE_ALL_FS,
      modules: ['fp64'],
      shaderCache,
      vertexCount: 1,
      drawMode: GL.POINTS,
      isInstanced: true,
      instanceCount: 0,
      attributes: {position: new Buffer(gl, {size: 2, data: new Float32Array([0, 0])})}
    });
  }

  /* eslint-disable complexity */
  _getAggregationParams(opts) {
    const aggregationParams = Object.assign({}, DEFAULT_RUN_PARAMS, opts);
    const {
      useGPU,
      gridTransformMatrix,
      viewport,
      weights,
      projectPoints,
      cellSize
    } = aggregationParams;
    if (this.state.useGPU !== useGPU) {
      aggregationParams.changeFlags = DEFAULT_CHANGE_FLAGS;
    }
    if (cellSize && this.state.cellSize !== cellSize) {
      aggregationParams.changeFlags.cellSizeChanged = true;
      // For GridLayer aggregation, cellSize is calculated by parsing all input data as it depends
      // on bounding box, cache cellSize
      this._setState({cellSize});
    }
    const changeFlags = aggregationParams.changeFlags;
    assert(changeFlags.dataChanged || changeFlags.viewportChanged || changeFlags.cellSizeChanged);

    // assert for required options
    assert(
      !changeFlags.dataChanged ||
        (opts.positions &&
          opts.weights &&
          (!opts.projectPositions || opts.viewport) &&
          opts.cellSize)
    );
    assert(!changeFlags.cellSizeChanged || opts.cellSize);

    // viewport need only when performing screen space aggregation (projectPoints is true)
    assert(!(changeFlags.viewportChanged && projectPoints) || opts.viewport);

    this._setState({useGPU});

    if (projectPoints && gridTransformMatrix) {
      log.warn('projectPoints is true, gridTransformMatrix is ignored');
    }
    aggregationParams.gridTransformMatrix =
      (projectPoints ? viewport.viewportMatrix : gridTransformMatrix) || IDENTITY_MATRIX;

    if (weights) {
      aggregationParams.weights = this._normalizeWeightParams(weights);

      // cache weights to process when only cellSize or viewport is changed.
      // position data is cached in Buffers for GPU case and in 'gridPositions' for CPU case.
      this._setState({weights: aggregationParams.weights});
    }
    return aggregationParams;
  }
  /* eslint-enable complexity */

  // converts old style number array to new style array of objects with matching fields
  _normalizeWeightParams(weights) {
    const result = {};
    for (const id in weights) {
      result[id] = Object.assign({}, DEFAULT_WEIGHT_PARAMS, weights[id]);
    }
    return result;
  }

  /* eslint-disable complexity */
  _initCPUResults(opts) {
    const weights = opts.weights || this.state.weights;
    const {numCol, numRow} = this.state;
    const results = {};
    // setup results object
    for (const id in weights) {
      let {aggregationData, minData, maxData, maxMinData} = weights[id];
      const {operation, needMin, needMax} = weights[id];
      const calculateMinMax = needMin || needMax;
      const combineMaxMin = needMin && needMax && weights[id].combineMaxMin;
      let fillValue = 0;
      switch (operation) {
        case AGGREGATION_OPERATION.SUM:
        case AGGREGATION_OPERATION.MEAN:
          fillValue = 0;
          break;
        case AGGREGATION_OPERATION.MIN:
          fillValue = Infinity;
          break;
        case AGGREGATION_OPERATION.MAX:
          fillValue = -Infinity;
          break;
        default:
          // Not a valid operation enum.
          assert(false);
          break;
      }

      const aggregationSize = numCol * numRow * ELEMENTCOUNT;
      aggregationData = getFloatArray(aggregationData, aggregationSize, fillValue);
      if (calculateMinMax) {
        if (combineMaxMin) {
          // TODO switch to maxMinBuffer and maxMinData
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
  /* eslint-enable complexity */

  _shouldTransformToGrid(opts) {
    const {projectPoints, changeFlags} = opts;
    if (
      !this.state.gridPositions ||
      changeFlags.dataChanged ||
      (projectPoints && changeFlags.viewportChanged) // world space aggregation (GridLayer) doesn't change when viewport is changed.
    ) {
      return true;
    }
    return false;
  }

  /* eslint-disable max-statements, max-depth */
  _renderAggregateData(opts) {
    const {cellSize, viewport, gridTransformMatrix, projectPoints} = opts;
    const {
      numCol,
      numRow,
      windowSize,
      framebuffers,
      maxMinFramebuffers,
      minFramebuffers,
      maxFramebuffers,
      equations,
      weightAttributes,
      weights
    } = this.state;
    const {gl, gridAggregationModel, allAggregationModel} = this;

    const uProjectionMatrixFP64 = fp64ifyMatrix4(gridTransformMatrix);
    const gridSize = [numCol, numRow];
    const parameters = {
      blend: true,
      depthTest: false,
      blendFunc: [GL.ONE, GL.ONE]
    };
    const moduleSettings = {viewport};
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
      framebuffers[id].bind();
      gl.viewport(0, 0, gridSize[0], gridSize[1]);
      gl.clear(gl.COLOR_BUFFER_BIT);
      parameters.blendEquation = equations[id];
      const attributes = {weights: weightAttributes[id]};
      gridAggregationModel.draw({
        parameters,
        moduleSettings,
        uniforms,
        attributes
      });
      framebuffers[id].unbind();
      if (needMin || needMax) {
        if (combineMaxMin) {
          maxMinFramebuffers[id].bind();
          gl.viewport(0, 0, gridSize[0], gridSize[1]);
          const maxMinParameters = {
            clearColor: [0, 0, 0, MAX_32_BIT_FLOAT]
          };
          withParameters(gl, maxMinParameters, () => {
            // this.draw({moduleParameters, uniforms, parameters, context: this.context});
            gl.clear(gl.COLOR_BUFFER_BIT);
          });
          // gl.clear(gl.COLOR_BUFFER_BIT);
          parameters.blendEquation = MAX_MIN_BLEND_EQUATION;
          allAggregationModel.draw({
            parameters,
            uniforms: {
              uSampler: framebuffers[id].texture,
              gridSize,
              combineMaxMin
            }
          });
          maxMinFramebuffers[id].unbind();
        } else {
          if (needMin) {
            minFramebuffers[id].bind();
            gl.viewport(0, 0, gridSize[0], gridSize[1]);
            const minParameters = {
              clearColor: [MAX_32_BIT_FLOAT, MAX_32_BIT_FLOAT, MAX_32_BIT_FLOAT, 0]
            };
            withParameters(gl, minParameters, () => {
              // this.draw({moduleParameters, uniforms, parameters, context: this.context});
              gl.clear(gl.COLOR_BUFFER_BIT);
            });
            parameters.blendEquation = MIN_BLEND_EQUATION;
            allAggregationModel.draw({
              parameters,
              uniforms: {
                uSampler: framebuffers[id].texture,
                gridSize,
                combineMaxMin
              }
            });
            minFramebuffers[id].unbind();
          }
          if (needMax) {
            maxFramebuffers[id].bind();
            gl.viewport(0, 0, gridSize[0], gridSize[1]);
            gl.clear(gl.COLOR_BUFFER_BIT);
            parameters.blendEquation = MAX_BLEND_EQUATION;
            allAggregationModel.draw({
              parameters,
              uniforms: {
                uSampler: framebuffers[id].texture,
                gridSize,
                combineMaxMin
              }
            });
            maxFramebuffers[id].unbind();
          }
        }
      }
    }
  }
  /* eslint-disable max-statements, max-depth */

  /* eslint-disable max-statements, complexity, max-depth */
  _runAggregationOnCPU(opts) {
    const {positions, cellSize, gridTransformMatrix, viewport, projectPoints} = opts;
    let {weights} = opts;
    const {numCol, numRow} = this.state;
    const results = this._initCPUResults(opts);
    // screen space or world space projection required
    const gridTransformRequired = this._shouldTransformToGrid(opts);
    let gridPositions = [];

    assert(gridTransformRequired || opts.changeFlags.cellSizeChanged);

    let posCount;
    if (gridTransformRequired) {
      this._setState({gridPositions});
      posCount = positions.length / 2;
    } else {
      gridPositions = this.state.gridPositions;
      weights = this.state.weights;
      posCount = gridPositions.length / 2;
    }

    const validCellIndices = new Set();
    for (let index = 0; index < posCount; index++) {
      let gridPos;
      if (gridTransformRequired) {
        const pos = [positions[index * 2], positions[index * 2 + 1]];
        if (projectPoints) {
          gridPos = viewport.project([pos[0], pos[1]]);
        } else {
          gridPos = worldToPixels([pos[0], pos[1], 0], gridTransformMatrix).slice(0, 2);
        }
        gridPositions.push(...gridPos);
      } else {
        gridPos = [gridPositions[index * 2], gridPositions[index * 2 + 1]];
      }

      const x = gridPos[0];
      const y = gridPos[1];
      const colId = Math.floor(x / cellSize[0]);
      const rowId = Math.floor(y / cellSize[1]);
      if (colId >= 0 && colId < numCol && rowId >= 0 && rowId < numRow) {
        const cellIndex = (colId + rowId * numCol) * ELEMENTCOUNT;
        validCellIndices.add(cellIndex);
        for (const id in weights) {
          const {values, size, operation} = weights[id];
          const {aggregationData} = results[id];
          assert(size >= 1 && size <= 3);

          // Fill RGB with weights
          for (let sizeIndex = 0; sizeIndex < size; sizeIndex++) {
            const cellElementIndex = cellIndex + sizeIndex;
            const weightComponent = values[index * WEIGHT_SIZE + sizeIndex];
            assert(Number.isFinite(weightComponent));
            switch (operation) {
              case AGGREGATION_OPERATION.SUM:
              case AGGREGATION_OPERATION.MEAN:
                aggregationData[cellElementIndex] += weightComponent;
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
                assert(false);
                break;
            }
          }

          // Track the count per grid-cell
          aggregationData[cellIndex + 3]++;
        }
      }
    }

    // collect max/min values
    validCellIndices.forEach(cellIndex => {
      for (const id in results) {
        const {size, needMin, needMax} = weights[id];
        const {aggregationData, minData, maxData, maxMinData} = results[id];
        const calculateMinMax = needMin || needMax;
        const combineMaxMin = needMin && needMax && weights[id].combineMaxMin;
        if (calculateMinMax) {
          for (let sizeIndex = 0; sizeIndex < size; sizeIndex++) {
            const cellElementIndex = cellIndex + sizeIndex;
            if (combineMaxMin) {
              // use RGB for max values for 3 weights.
              maxMinData[sizeIndex] = Math.max(
                maxMinData[sizeIndex],
                aggregationData[cellElementIndex]
              );
            } else {
              if (needMin) {
                minData[sizeIndex] = Math.min(
                  minData[sizeIndex],
                  aggregationData[cellElementIndex]
                );
              }
              if (needMax) {
                maxData[sizeIndex] = Math.max(
                  maxData[sizeIndex],
                  aggregationData[cellElementIndex]
                );
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
              minData[ELEMENTCOUNT - 1] += aggregationData[cellIndex + ELEMENTCOUNT - 1];
            }
            if (needMax) {
              maxData[ELEMENTCOUNT - 1] += aggregationData[cellIndex + ELEMENTCOUNT - 1];
            }
          }
        }
      }
    });

    // Update buffer objects.
    this._updateAggregationBuffers(opts, results);
    return results;
  }

  /* eslint-enable max-statements */

  _runAggregationOnGPU(opts) {
    this._updateModels(opts);
    this._setupFramebuffers(opts);
    this._renderAggregateData(opts);
    return this._getAggregateData(opts);
  }

  // Update priveate state
  _setState(updateObject) {
    Object.assign(this.state, updateObject);
  }

  // set up framebuffer for each weight
  _setupFramebuffers(opts) {
    const {
      numCol,
      numRow,
      textures,
      framebuffers,
      maxMinFramebuffers,
      minFramebuffers,
      maxFramebuffers,
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
      framebuffers[id] =
        framebuffers[id] ||
        getFramebuffer(this.gl, {
          id: `${id}-fb`,
          width: numCol,
          height: numRow,
          texture: textures[id]
        });
      framebuffers[id].resize(framebufferSize);
      equations[id] = EQUATION_MAP[operation];
      // For min/max framebuffers will use default size 1X1
      if (needMin || needMax) {
        if (needMin && needMax && combineMaxMin) {
          maxMinFramebuffers[id] =
            maxMinFramebuffers[id] || getFramebuffer(this.gl, {id: `${id}-maxMinFb`});
        } else {
          if (needMin) {
            minFramebuffers[id] =
              minFramebuffers[id] || getFramebuffer(this.gl, {id: `${id}-minFb`});
          }
          if (needMax) {
            maxFramebuffers[id] =
              maxFramebuffers[id] || getFramebuffer(this.gl, {id: `${id}-maxFb`});
          }
        }
      }
    }
  }

  _setupModels(fp64 = false) {
    if (this.gridAggregationModel) {
      this.gridAggregationModel.delete();
    }
    this.gridAggregationModel = this._getAggregationModel(fp64);
    if (this.allAggregationModel) {
      this.allAggregationModel.delete();
    }
    this.allAggregationModel = this._getAllAggregationModel(fp64);
  }

  _updateAggregationBuffers(opts, results) {
    if (!opts.createBufferObjects) {
      return;
    }
    const weights = opts.weights || this.state.weights;
    for (const id in results) {
      const {aggregationData, minData, maxData, maxMinData} = results[id];
      const {needMin, needMax} = weights[id];
      const calculateMinMax = needMin || needMax;
      const combineMaxMin = needMin && needMax && weights[id].combineMaxMin;
      updateBuffer({
        gl: this.gl,
        bufferName: 'aggregationBuffer',
        data: aggregationData,
        result: results[id]
      });
      if (calculateMinMax) {
        if (combineMaxMin) {
          updateBuffer({
            gl: this.gl,
            bufferName: 'maxMinBuffer',
            data: maxMinData,
            result: results[id]
          });
        } else {
          if (needMin) {
            updateBuffer({
              gl: this.gl,
              bufferName: 'minBuffer',
              data: minData,
              result: results[id]
            });
          }
          if (needMax) {
            updateBuffer({
              gl: this.gl,
              bufferName: 'maxBuffer',
              data: maxData,
              result: results[id]
            });
          }
        }
      }
    }
  }

  // set up buffers for all weights
  _setupWeightAttributes(opts) {
    const {weightAttributes, vertexCount, weights} = this.state;
    for (const id in weights) {
      const {values} = weights[id];
      // values can be Array, Float32Array or Buffer
      if (Array.isArray(values) || values.constructor === Float32Array) {
        assert(values.length / 3 === vertexCount);
        const typedArray = Array.isArray(values) ? new Float32Array(values) : values;
        if (weightAttributes[id] instanceof Buffer) {
          weightAttributes[id].setData(typedArray);
        } else {
          weightAttributes[id] = new Buffer(this.gl, typedArray);
        }
      } else {
        // assert((values instanceof Attribute) || (values instanceof Buffer));
        assert(values instanceof Buffer);
        weightAttributes[id] = values;
      }
    }
  }

  /* eslint-disable max-statements */
  _updateModels(opts) {
    const {gl} = this;
    const {positions, positions64xyLow, changeFlags} = opts;
    const {numCol, numRow} = this.state;

    let {positionsBuffer, positions64xyLowBuffer} = this.state;

    const aggregationModelAttributes = {};

    let createPos64xyLow = false;
    if (opts.fp64 !== this.state.fp64) {
      this._setupModels(opts.fp64);
      this._setState({fp64: opts.fp64});
      if (opts.fp64) {
        createPos64xyLow = true;
      }
    }

    if (changeFlags.dataChanged || !positionsBuffer) {
      if (positionsBuffer) {
        positionsBuffer.delete();
      }
      const vertexCount = positions.length / 2;
      // positionsBuffer = new Buffer(gl, {size: 2, data: new Float32Array(positions)});
      positionsBuffer = new Buffer(gl, new Float32Array(positions));
      createPos64xyLow = opts.fp64;
      Object.assign(aggregationModelAttributes, {
        positions: positionsBuffer
      });
      this._setState({positionsBuffer, vertexCount});

      this._setupWeightAttributes(opts);
      this.gridAggregationModel.setVertexCount(vertexCount);
    }

    if (createPos64xyLow) {
      assert(positions64xyLow);
      if (positions64xyLowBuffer) {
        positions64xyLowBuffer.delete();
      }
      positions64xyLowBuffer = new Buffer(gl, {size: 2, data: new Float32Array(positions64xyLow)});
      Object.assign(aggregationModelAttributes, {
        positions64xyLow: positions64xyLowBuffer
      });
      this._setState({positions64xyLowBuffer});
    }

    this.gridAggregationModel.setAttributes(aggregationModelAttributes);

    if (changeFlags.cellSizeChanged || changeFlags.viewportChanged) {
      this.allAggregationModel.setInstanceCount(numCol * numRow);
    }
  }
  /* eslint-enable max-statements */

  _updateGridSize(opts) {
    const {viewport, cellSize} = opts;
    const width = opts.width || viewport.width;
    const height = opts.height || viewport.height;
    const numCol = Math.ceil(width / cellSize[0]);
    const numRow = Math.ceil(height / cellSize[1]);
    this._setState({numCol, numRow, windowSize: [width, height]});
  }
}

import GL from 'luma.gl/constants';
import {Buffer, Model, Framebuffer, Texture2D, FEATURES, hasFeatures, isWebGL2} from 'luma.gl';
import {log} from '@deck.gl/core';
import assert from 'assert';
import {fp64 as fp64Utils} from 'luma.gl';
import {worldToPixels} from 'viewport-mercator-project';
const {fp64ifyMatrix4} = fp64Utils;
const IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const PIXEL_SIZE = 4; // RGBA32F

import AGGREGATE_TO_GRID_VS from './aggregate-to-grid-vs.glsl';
import AGGREGATE_TO_GRID_VS_FP64 from './aggregate-to-grid-vs-64.glsl';
import AGGREGATE_TO_GRID_FS from './aggregate-to-grid-fs.glsl';
import AGGREGATE_ALL_VS_FP64 from './aggregate-all-vs-64.glsl';
import AGGREGATE_ALL_FS from './aggregate-all-fs.glsl';

const DEFAULT_CHANGE_FLAGS = {
  dataChanged: true,
  viewportChanged: true,
  cellSizeChanged: true
};

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
  static getCellData({countsData}) {
    const cellWeights = [];
    const cellCounts = [];
    for (let index = 0; index < countsData.length; index += 4) {
      cellCounts.push(countsData[index]);
      cellWeights.push(countsData[index + 1]);
    }
    return {cellCounts, cellWeights};
  }

  // DEBUG ONLY
  // static logData({countsBuffer, maxCountBuffer}) {
  //   const countsData = countsBuffer.getData();
  //   for (let index = 0; index < countsData.length; index += 4) {
  //     if (countsData[index] > 0) {
  //       console.log(`index: ${index} count: ${countsData[index]}`);
  //     }
  //   }
  //   const maxCountData = maxCountBuffer.getData();
  //   console.log(`totalCount: ${maxCountData[0]} totalWeight: ${maxCountData[1]} maxCellWieght: ${maxCountData[3]}`);
  // }

  constructor(gl, opts = {}) {
    this.id = opts.id || 'gpu-grid-aggregator';
    this.shaderCache = opts.shaderCache || null;
    this.gl = gl;
    this.state = {};
    this._hasGPUSupport =
      isWebGL2(gl) &&
      hasFeatures(
        this.gl,
        FEATURES.BLEND_EQUATION_MINMAX,
        FEATURES.COLOR_ATTACHMENT_RGBA32F,
        FEATURES.TEXTURE_FILTER_LINEAR_FLOAT
      );
    if (this._hasGPUSupport) {
      this._setupGPUResources();
    }
  }

  // Perform aggregation and retun the results
  run({
    positions,
    positions64xyLow,
    weights,
    changeFlags = DEFAULT_CHANGE_FLAGS,
    cellSize,
    viewport,
    width,
    height,
    countsBuffer = null,
    maxCountBuffer = null,
    gridTransformMatrix = null,
    projectPoints = false,
    useGPU = true,
    fp64 = false
  } = {}) {
    if (this.state.useGPU !== useGPU) {
      changeFlags = DEFAULT_CHANGE_FLAGS;
    }
    this._setState({useGPU});
    // when projectPoints is true, shader projects to NDC, use `viewportMatrix` to
    // transform points to viewport (screen) space for aggregation.
    const transformMatrix =
      (projectPoints ? viewport.viewportMatrix : gridTransformMatrix) || IDENTITY_MATRIX;
    const aggregationParams = {
      positions,
      positions64xyLow,
      weights,
      changeFlags,
      cellSize,
      viewport,
      gridTransformMatrix: transformMatrix,
      countsBuffer,
      maxCountBuffer,
      projectPoints,
      fp64
    };

    this._updateGridSize({viewport, cellSize, width, height});
    if (this._hasGPUSupport && useGPU) {
      return this._runAggregationOnGPU(aggregationParams);
    }
    if (useGPU) {
      log.warn('ScreenGridAggregator: GPU Aggregation not supported, falling back to CPU');
    }
    return this._runAggregationOnCPU(aggregationParams);
  }

  // PRIVATE

  _getAggregateData(opts) {
    let {countsBuffer, maxCountBuffer} = opts;
    countsBuffer = this.gridAggregationFramebuffer.readPixelsToBuffer({
      buffer: countsBuffer,
      type: GL.FLOAT
    });
    maxCountBuffer = this.allAggregrationFramebuffer.readPixelsToBuffer({
      width: 1,
      height: 1,
      type: GL.FLOAT,
      buffer: maxCountBuffer
    });
    return {
      countsBuffer,
      countsTexture: this.gridAggregationFramebuffer.texture,
      maxCountBuffer,
      maxCountTexture: this.allAggregrationFramebuffer.texture
    };
  }

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

  _projectPositions(opts) {
    let {projectedPositions} = this.state;
    if (!projectedPositions || opts.changeFlags.dataChanged || opts.changeFlags.viewportChanged) {
      const {positions, viewport} = opts;
      projectedPositions = [];
      for (let index = 0; index < positions.length; index += 2) {
        const [x, y] = viewport.projectFlat([positions[index], positions[index + 1]]);
        projectedPositions.push(x, y);
      }
      this._setState({projectedPositions});
    }
  }

  _renderAggregateData(opts) {
    const {cellSize, viewport, gridTransformMatrix, projectPoints} = opts;
    const {numCol, numRow, windowSize} = this.state;
    const {
      gl,
      gridAggregationFramebuffer,
      gridAggregationModel,
      allAggregrationFramebuffer,
      allAggregationModel
    } = this;

    const uProjectionMatrixFP64 = fp64ifyMatrix4(gridTransformMatrix);
    const gridSize = [numCol, numRow];

    gridAggregationFramebuffer.bind();
    gl.viewport(0, 0, gridSize[0], gridSize[1]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gridAggregationModel.draw({
      parameters: {
        clearColor: [0, 0, 0, 0],
        clearDepth: 0,
        blend: true,
        depthTest: false,
        blendEquation: GL.FUNC_ADD,
        blendFunc: [GL.ONE, GL.ONE]
      },
      moduleSettings: {
        viewport
      },
      uniforms: {
        windowSize,
        cellSize,
        gridSize,
        uProjectionMatrix: gridTransformMatrix,
        uProjectionMatrixFP64,
        projectPoints
      }
    });
    gridAggregationFramebuffer.unbind();

    allAggregrationFramebuffer.bind();
    gl.viewport(0, 0, gridSize[0], gridSize[1]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    allAggregationModel.draw({
      parameters: {
        clearColor: [0, 0, 0, 0],
        clearDepth: 0,
        blend: true,
        depthTest: false,
        blendEquation: [GL.FUNC_ADD, GL.MAX],
        blendFunc: [GL.ONE, GL.ONE]
      },
      uniforms: {
        uSampler: gridAggregationFramebuffer.texture,
        gridSize
      }
    });
    allAggregrationFramebuffer.unbind();
  }

  /* eslint-disable max-statements */
  _runAggregationOnCPU(opts) {
    const ELEMENTCOUNT = 4;
    const {positions, weights, cellSize, projectPoints, gridTransformMatrix, viewport} = opts;
    let {countsBuffer, maxCountBuffer} = opts;
    const {numCol, numRow} = this.state;
    // Each element contains 4 floats to match with GPU ouput
    const counts = new Float32Array(numCol * numRow * ELEMENTCOUNT);
    let transformMatrix = gridTransformMatrix;
    let pos = positions;
    if (projectPoints) {
      this._projectPositions(opts);
      pos = this.state.projectedPositions;
      // project from world space to viewport (screen) space.
      transformMatrix = viewport.pixelProjectionMatrix;
    }

    counts.fill(0);
    let maxWeight = 0;
    let totalCount = 0;
    let totalWeight = 0;
    for (let index = 0; index < pos.length; index += 2) {
      const gridPos = worldToPixels([pos[index], pos[index + 1], 0], transformMatrix);
      const x = gridPos[0];
      const y = gridPos[1];
      const weight = weights ? weights[index / 2] : 1;
      assert(Number.isFinite(weight));
      const colId = Math.floor(x / cellSize[0]);
      const rowId = Math.floor(y / cellSize[1]);
      if (colId >= 0 && colId < numCol && rowId >= 0 && rowId < numRow) {
        const i = (colId + rowId * numCol) * ELEMENTCOUNT;
        counts[i]++;
        counts[i + 1] += weight;
        totalCount += 1;
        totalWeight += weight;
        if (counts[i + 1] > maxWeight) {
          maxWeight = counts[i + 1];
        }
      }
    }
    const maxCountBufferData = new Float32Array(ELEMENTCOUNT);
    // Store total count value in Red/X channel
    maxCountBufferData[0] = totalCount;
    // Store total weight value in Green/Y channel
    maxCountBufferData[1] = totalWeight;
    // Store max weight value in alpha/W channel.
    maxCountBufferData[3] = maxWeight;

    // Load data to WebGL buffer.
    if (countsBuffer) {
      countsBuffer.subData({data: counts});
    } else {
      countsBuffer = new Buffer(this.gl, {data: counts});
    }
    if (maxCountBuffer) {
      maxCountBuffer.subData({data: maxCountBufferData});
    } else {
      maxCountBuffer = new Buffer(this.gl, {data: maxCountBufferData});
    }
    return {
      // Buffer objects
      countsBuffer,
      maxCountBuffer,
      // ArrayView objects
      countsData: counts,
      maxCountData: maxCountBufferData,
      // Return total aggregaton values to avoid UBO setup for WebGL1 cases
      totalCount,
      totalWeight,
      maxWeight
    };
  }
  /* eslint-enable max-statements */

  _runAggregationOnGPU(opts) {
    this._updateModels(opts);
    this._renderAggregateData(opts);
    return this._getAggregateData(opts);
  }

  // Update priveate state
  _setState(updateObject) {
    Object.assign(this.state, updateObject);
  }

  _setupGPUResources() {
    const {gl} = this;

    this.gridAggregationFramebuffer = setupFramebuffer(gl, {id: 'GridAggregation'});
    this.allAggregrationFramebuffer = setupFramebuffer(gl, {id: 'AllAggregation'});
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

  /* eslint-disable max-statements */
  _updateModels(opts) {
    const {gl} = this;
    const {positions, positions64xyLow, weights, changeFlags} = opts;
    const {numCol, numRow} = this.state;

    let {positionsBuffer, positions64xyLowBuffer, weightsBuffer} = this.state;

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
      if (weightsBuffer) {
        weightsBuffer.delete();
      }
      positionsBuffer = new Buffer(gl, {size: 2, data: new Float32Array(positions)});
      weightsBuffer = new Buffer(gl, {size: 1, data: new Float32Array(weights)});
      createPos64xyLow = opts.fp64;
      Object.assign(aggregationModelAttributes, {
        positions: positionsBuffer,
        weights: weightsBuffer
      });
      this.gridAggregationModel.setVertexCount(positions.length / 2);
      this._setState({positionsBuffer, weightsBuffer});
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

      const framebufferSize = {width: numCol, height: numRow};
      this.gridAggregationFramebuffer.resize(framebufferSize);
      this.allAggregrationFramebuffer.resize(framebufferSize);
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

// Helper methods.

function setupFramebuffer(gl, opts) {
  const {id} = opts;
  const texture = new Texture2D(gl, {
    data: null,
    format: GL.RGBA32F,
    type: GL.FLOAT,
    border: 0,
    mipmaps: false,
    parameters: {
      [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
      [GL.TEXTURE_MIN_FILTER]: GL.NEAREST
    },
    dataFormat: GL.RGBA
  });

  const fb = new Framebuffer(gl, {
    id,
    attachments: {
      [GL.COLOR_ATTACHMENT0]: texture
    }
  });

  return fb;
}

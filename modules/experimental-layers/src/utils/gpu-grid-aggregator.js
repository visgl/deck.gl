import {Buffer, Model, GL, Framebuffer, Texture2D, FEATURES, hasFeatures, isWebGL2} from 'luma.gl';
import {log} from '@deck.gl/core';
import assert from 'assert';
import {fp64 as fp64Utils} from 'luma.gl';
import {worldToPixels} from 'viewport-mercator-project';
const {fp64ifyMatrix4} = fp64Utils;
const IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const AGGREGATE_TO_GRID_VS = `\
attribute vec2 positions;
attribute vec2 positions64xyLow;
attribute float weights;
uniform vec2 windowSize;
uniform vec2 cellSize;
uniform vec2 gridSize;
uniform mat4 uProjectionMatrix;
uniform bool projectPoints;

varying float vWeights;

vec2 project_to_pixel(vec2 pos) {
  vec4 position = vec4(pos, 0., 1.);
  vec4 result =  uProjectionMatrix * position;
  return result.xy/result.w;
}

void main(void) {

  vWeights = weights;

  vec2 windowPos = positions;
  vec2 windowPos64xyLow = positions64xyLow;
  if (projectPoints) {
    windowPos = project_position(windowPos);
  }

  windowPos = project_to_pixel(windowPos);

  // Transform (0,0):windowSize -> (0, 0): gridSize
  vec2 pos = floor(windowPos / cellSize);

  // Transform (0,0):gridSize -> (-1, -1):(1,1)
  pos = (pos * (2., 2.) / (gridSize)) - (1., 1.);

  // Move to pixel center, pixel-size in screen sapce (2/gridSize) * 0.5 => 1/gridSize
  vec2 offset = 1.0 / gridSize;
  pos = pos + offset;

  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

const AGGREGATE_TO_GRID_VS_FP64 = `\
attribute vec2 positions;
attribute vec2 positions64xyLow;
attribute float weights;
uniform vec2 windowSize;
uniform vec2 cellSize;
uniform vec2 gridSize;
uniform vec2 uProjectionMatrixFP64[16];
uniform bool projectPoints;

varying float vWeights;

void project_to_pixel(vec2 pos, vec2 pos64xyLow, out vec2 pixelXY64[2]) {

  vec2 result64[4];
  vec2 position64[4];
  position64[0] = vec2(pos.x, pos64xyLow.x);
  position64[1] = vec2(pos.y, pos64xyLow.y);
  position64[2] = vec2(0., 0.);
  position64[3] = vec2(1., 0.);
  mat4_vec4_mul_fp64(uProjectionMatrixFP64, position64,
  result64);

  pixelXY64[0] = div_fp64(result64[0], result64[3]);
  pixelXY64[1] = div_fp64(result64[1], result64[3]);
}

void main(void) {

  vWeights = weights;

  vec2 windowPos = positions;
  vec2 windowPos64xyLow = positions64xyLow;
  if (projectPoints) {
    vec2 projectedXY[2];
    project_position_fp64(windowPos, windowPos64xyLow, projectedXY);
    windowPos.x = projectedXY[0].x;
    windowPos.y = projectedXY[1].x;
    windowPos64xyLow.x = projectedXY[0].y;
    windowPos64xyLow.y = projectedXY[1].y;
  }

  vec2 pixelXY64[2];
  project_to_pixel(windowPos, windowPos64xyLow, pixelXY64);

  // Transform (0,0):windowSize -> (0, 0): gridSize
  vec2 gridXY64[2];
  gridXY64[0] = div_fp64(pixelXY64[0], vec2(cellSize.x, 0));
  gridXY64[1] = div_fp64(pixelXY64[1], vec2(cellSize.y, 0));
  float x = floor(gridXY64[0].x);
  float y = floor(gridXY64[1].x);
  vec2 pos = vec2(x, y);

  // Transform (0,0):gridSize -> (-1, -1):(1,1)
  pos = (pos * (2., 2.) / (gridSize)) - (1., 1.);

  // Move to pixel center, pixel-size in screen sapce (2/gridSize) * 0.5 => 1/gridSize
  vec2 offset = 1.0 / gridSize;
  pos = pos + offset;

  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

const AGGREGATE_TO_GRID_FS = `\
precision highp float;

varying float vWeights;

void main(void) {
  gl_FragColor = vec4(1., vWeights, 0, 0.0);
}
`;

const AGGREGATE_ALL_VS = `\
#version 300 es

in vec2 position;
uniform vec2 gridSize;

out vec2 vTextureCoord;
void main(void) {
  // Map each position to single pixel
  vec2 pos = vec2(-1.0, -1.0);

  // Move to pixel center, pixel-size in screen sapce (2/gridSize) * 0.5 => 1/gridSize
  vec2 offset = 1.0 / gridSize;
  pos = pos + offset;

  gl_Position = vec4(pos, 0.0, 1.0);

  float yIndex = floor(float(gl_InstanceID) / gridSize[0]);
  float xIndex = float(gl_InstanceID) - (yIndex * gridSize[0]);

  vTextureCoord = vec2(yIndex/gridSize[1], xIndex/gridSize[0]);
  // vTextureCoord = vec2(0.5, 0.5);
}
`;

const AGGREGATE_ALL_VS_FP64 = `\
#version 300 es

in vec2 position;
uniform vec2 gridSize;

out vec2 vTextureCoord;
void main(void) {
  // Map each position to single pixel
  vec2 pos = vec2(-1.0, -1.0);

  // Move to pixel center, pixel-size in screen sapce (2/gridSize) * 0.5 => 1/gridSize
  vec2 offset = 1.0 / gridSize;
  pos = pos + offset;

  gl_Position = vec4(pos, 0.0, 1.0);

  float yIndex = floor(float(gl_InstanceID) / gridSize[0]);
  float xIndex = float(gl_InstanceID) - (yIndex * gridSize[0]);

  vec2 yIndexFP64 = vec2(yIndex, 0.);
  vec2 xIndexFP64 = vec2(xIndex, 0.);
  vec2 gridSizeYFP64 = vec2(gridSize[1], 0.);
  vec2 gridSizeXFP64 = vec2(gridSize[0], 0.);

  vec2 texCoordXFP64 = div_fp64(yIndexFP64, gridSizeYFP64);
  vec2 texCoordYFP64 = div_fp64(xIndexFP64, gridSizeXFP64);

  vTextureCoord = vec2(texCoordYFP64.x, texCoordXFP64.x);
}
`;

const AGGREGATE_ALL_FS = `\
#version 300 es
precision highp float;

in vec2 vTextureCoord;
uniform sampler2D uSampler;
out vec4 fragColor;
void main(void) {
  vec4 textureColor = texture(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  // Red: total count, Green: total weight, Alpha: maximum wieght
  fragColor = vec4(textureColor.r, textureColor.g, 0., textureColor.g);
}
`;

const DEFAULT_CHANGE_FLAGS = {
  dataChanged: true,
  viewportChanged: true,
  cellSizeChanged: true
};

export default class GPUGridAggregator {
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
    const transformMatrix =
      gridTransformMatrix || (viewport && viewport.pixelProjectionMatrix) || IDENTITY_MATRIX;
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
      modules: fp64 ? ['fp64', 'project64'] : [],
      shaderCache,
      vertexCount: 0,
      drawMode: GL.POINTS
    });
  }

  _getAllAggregationModel(fp64 = false) {
    const {gl, shaderCache} = this;
    return new Model(gl, {
      id: 'All-Aggregation-Model',
      vs: fp64 ? AGGREGATE_ALL_VS_FP64 : AGGREGATE_ALL_VS,
      fs: AGGREGATE_ALL_FS,
      modules: fp64 ? ['fp64'] : [],
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
    const {positions, weights, cellSize, projectPoints, gridTransformMatrix} = opts;
    let {countsBuffer, maxCountBuffer} = opts;
    const {numCol, numRow} = this.state;
    // Each element contains 4 floats to match with GPU ouput
    const counts = new Float32Array(numCol * numRow * ELEMENTCOUNT);

    let pos = positions;
    if (projectPoints) {
      this._projectPositions(opts);
      pos = this.state.projectedPositions;
    }

    counts.fill(0);
    let maxWeight = 0;
    let totalCount = 0;
    let totalWeight = 0;
    for (let index = 0; index < pos.length; index += 2) {
      const gridPos = worldToPixels([pos[index], pos[index + 1], 0], gridTransformMatrix);
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
    return {countsBuffer, maxCountBuffer};
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

    if (changeFlags.cellSizeChanged) {
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

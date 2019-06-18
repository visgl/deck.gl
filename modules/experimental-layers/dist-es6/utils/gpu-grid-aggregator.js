function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

import GL from 'luma.gl/constants';
import { Buffer, Model, Framebuffer, Texture2D, FEATURES, hasFeatures, isWebGL2 } from 'luma.gl';
import { log } from '@deck.gl/core';
import assert from 'assert';
import { fp64 as fp64Utils } from 'luma.gl';
import { worldToPixels } from 'viewport-mercator-project';
const fp64ifyMatrix4 = fp64Utils.fp64ifyMatrix4;
const IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const PIXEL_SIZE = 4; // RGBA32F

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
  // Decode and return aggregation data of given pixel.
  static getAggregationData({
    countsData,
    maxCountData,
    pixelIndex
  }) {
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
  } // Decodes and retuns counts and weights of all cells


  static getCellData({
    countsData
  }) {
    const cellWeights = [];
    const cellCounts = [];

    for (let index = 0; index < countsData.length; index += 4) {
      cellCounts.push(countsData[index]);
      cellWeights.push(countsData[index + 1]);
    }

    return {
      cellCounts,
      cellWeights
    };
  }

  constructor(gl, opts = {}) {
    this.id = opts.id || 'gpu-grid-aggregator';
    this.shaderCache = opts.shaderCache || null;
    this.gl = gl;
    this.state = {};
    this._hasGPUSupport = isWebGL2(gl) && hasFeatures(this.gl, FEATURES.BLEND_EQUATION_MINMAX, FEATURES.COLOR_ATTACHMENT_RGBA32F, FEATURES.TEXTURE_FILTER_LINEAR_FLOAT);

    if (this._hasGPUSupport) {
      this._setupGPUResources();
    }
  } // Perform aggregation and retun the results


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

    this._setState({
      useGPU
    });

    const transformMatrix = gridTransformMatrix || viewport && viewport.pixelProjectionMatrix || IDENTITY_MATRIX;
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

    this._updateGridSize({
      viewport,
      cellSize,
      width,
      height
    });

    if (this._hasGPUSupport && useGPU) {
      return this._runAggregationOnGPU(aggregationParams);
    }

    if (useGPU) {
      log.warn('ScreenGridAggregator: GPU Aggregation not supported, falling back to CPU');
    }

    return this._runAggregationOnCPU(aggregationParams);
  } // PRIVATE


  _getAggregateData(opts) {
    let countsBuffer = opts.countsBuffer,
        maxCountBuffer = opts.maxCountBuffer;
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
    const gl = this.gl,
          shaderCache = this.shaderCache;
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
    const gl = this.gl,
          shaderCache = this.shaderCache;
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
      attributes: {
        position: new Buffer(gl, {
          size: 2,
          data: new Float32Array([0, 0])
        })
      }
    });
  }

  _projectPositions(opts) {
    let projectedPositions = this.state.projectedPositions;

    if (!projectedPositions || opts.changeFlags.dataChanged || opts.changeFlags.viewportChanged) {
      const positions = opts.positions,
            viewport = opts.viewport;
      projectedPositions = [];

      for (let index = 0; index < positions.length; index += 2) {
        const _viewport$projectFlat = viewport.projectFlat([positions[index], positions[index + 1]]),
              _viewport$projectFlat2 = _slicedToArray(_viewport$projectFlat, 2),
              x = _viewport$projectFlat2[0],
              y = _viewport$projectFlat2[1];

        projectedPositions.push(x, y);
      }

      this._setState({
        projectedPositions
      });
    }
  }

  _renderAggregateData(opts) {
    const cellSize = opts.cellSize,
          viewport = opts.viewport,
          gridTransformMatrix = opts.gridTransformMatrix,
          projectPoints = opts.projectPoints;
    const _this$state = this.state,
          numCol = _this$state.numCol,
          numRow = _this$state.numRow,
          windowSize = _this$state.windowSize;
    const gl = this.gl,
          gridAggregationFramebuffer = this.gridAggregationFramebuffer,
          gridAggregationModel = this.gridAggregationModel,
          allAggregrationFramebuffer = this.allAggregrationFramebuffer,
          allAggregationModel = this.allAggregationModel;
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
    const positions = opts.positions,
          weights = opts.weights,
          cellSize = opts.cellSize,
          projectPoints = opts.projectPoints,
          gridTransformMatrix = opts.gridTransformMatrix;
    let countsBuffer = opts.countsBuffer,
        maxCountBuffer = opts.maxCountBuffer;
    const _this$state2 = this.state,
          numCol = _this$state2.numCol,
          numRow = _this$state2.numRow; // Each element contains 4 floats to match with GPU ouput

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

    const maxCountBufferData = new Float32Array(ELEMENTCOUNT); // Store total count value in Red/X channel

    maxCountBufferData[0] = totalCount; // Store total weight value in Green/Y channel

    maxCountBufferData[1] = totalWeight; // Store max weight value in alpha/W channel.

    maxCountBufferData[3] = maxWeight; // Load data to WebGL buffer.

    if (countsBuffer) {
      countsBuffer.subData({
        data: counts
      });
    } else {
      countsBuffer = new Buffer(this.gl, {
        data: counts
      });
    }

    if (maxCountBuffer) {
      maxCountBuffer.subData({
        data: maxCountBufferData
      });
    } else {
      maxCountBuffer = new Buffer(this.gl, {
        data: maxCountBufferData
      });
    }

    return {
      countsBuffer,
      maxCountBuffer
    };
  }
  /* eslint-enable max-statements */


  _runAggregationOnGPU(opts) {
    this._updateModels(opts);

    this._renderAggregateData(opts);

    return this._getAggregateData(opts);
  } // Update priveate state


  _setState(updateObject) {
    Object.assign(this.state, updateObject);
  }

  _setupGPUResources() {
    const gl = this.gl;
    this.gridAggregationFramebuffer = setupFramebuffer(gl, {
      id: 'GridAggregation'
    });
    this.allAggregrationFramebuffer = setupFramebuffer(gl, {
      id: 'AllAggregation'
    });
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
    const gl = this.gl;
    const positions = opts.positions,
          positions64xyLow = opts.positions64xyLow,
          weights = opts.weights,
          changeFlags = opts.changeFlags;
    const _this$state3 = this.state,
          numCol = _this$state3.numCol,
          numRow = _this$state3.numRow;
    let _this$state4 = this.state,
        positionsBuffer = _this$state4.positionsBuffer,
        positions64xyLowBuffer = _this$state4.positions64xyLowBuffer,
        weightsBuffer = _this$state4.weightsBuffer;
    const aggregationModelAttributes = {};
    let createPos64xyLow = false;

    if (opts.fp64 !== this.state.fp64) {
      this._setupModels(opts.fp64);

      this._setState({
        fp64: opts.fp64
      });

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

      positionsBuffer = new Buffer(gl, {
        size: 2,
        data: new Float32Array(positions)
      });
      weightsBuffer = new Buffer(gl, {
        size: 1,
        data: new Float32Array(weights)
      });
      createPos64xyLow = opts.fp64;
      Object.assign(aggregationModelAttributes, {
        positions: positionsBuffer,
        weights: weightsBuffer
      });
      this.gridAggregationModel.setVertexCount(positions.length / 2);

      this._setState({
        positionsBuffer,
        weightsBuffer
      });
    }

    if (createPos64xyLow) {
      assert(positions64xyLow);

      if (positions64xyLowBuffer) {
        positions64xyLowBuffer.delete();
      }

      positions64xyLowBuffer = new Buffer(gl, {
        size: 2,
        data: new Float32Array(positions64xyLow)
      });
      Object.assign(aggregationModelAttributes, {
        positions64xyLow: positions64xyLowBuffer
      });

      this._setState({
        positions64xyLowBuffer
      });
    }

    this.gridAggregationModel.setAttributes(aggregationModelAttributes);

    if (changeFlags.cellSizeChanged || changeFlags.viewportChanged) {
      this.allAggregationModel.setInstanceCount(numCol * numRow);
      const framebufferSize = {
        width: numCol,
        height: numRow
      };
      this.gridAggregationFramebuffer.resize(framebufferSize);
      this.allAggregrationFramebuffer.resize(framebufferSize);
    }
  }
  /* eslint-enable max-statements */


  _updateGridSize(opts) {
    const viewport = opts.viewport,
          cellSize = opts.cellSize;
    const width = opts.width || viewport.width;
    const height = opts.height || viewport.height;
    const numCol = Math.ceil(width / cellSize[0]);
    const numRow = Math.ceil(height / cellSize[1]);

    this._setState({
      numCol,
      numRow,
      windowSize: [width, height]
    });
  }

} // Helper methods.

function setupFramebuffer(gl, opts) {
  const id = opts.id;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9ncHUtZ3JpZC1hZ2dyZWdhdG9yLmpzIl0sIm5hbWVzIjpbIkdMIiwiQnVmZmVyIiwiTW9kZWwiLCJGcmFtZWJ1ZmZlciIsIlRleHR1cmUyRCIsIkZFQVRVUkVTIiwiaGFzRmVhdHVyZXMiLCJpc1dlYkdMMiIsImxvZyIsImFzc2VydCIsImZwNjQiLCJmcDY0VXRpbHMiLCJ3b3JsZFRvUGl4ZWxzIiwiZnA2NGlmeU1hdHJpeDQiLCJJREVOVElUWV9NQVRSSVgiLCJQSVhFTF9TSVpFIiwiQUdHUkVHQVRFX1RPX0dSSURfVlMiLCJBR0dSRUdBVEVfVE9fR1JJRF9WU19GUDY0IiwiQUdHUkVHQVRFX1RPX0dSSURfRlMiLCJBR0dSRUdBVEVfQUxMX1ZTIiwiQUdHUkVHQVRFX0FMTF9WU19GUDY0IiwiQUdHUkVHQVRFX0FMTF9GUyIsIkRFRkFVTFRfQ0hBTkdFX0ZMQUdTIiwiZGF0YUNoYW5nZWQiLCJ2aWV3cG9ydENoYW5nZWQiLCJjZWxsU2l6ZUNoYW5nZWQiLCJHUFVHcmlkQWdncmVnYXRvciIsImdldEFnZ3JlZ2F0aW9uRGF0YSIsImNvdW50c0RhdGEiLCJtYXhDb3VudERhdGEiLCJwaXhlbEluZGV4IiwibGVuZ3RoIiwiaW5kZXgiLCJjZWxsQ291bnQiLCJjZWxsV2VpZ2h0IiwidG90YWxDb3VudCIsInRvdGFsV2VpZ2h0IiwibWF4Q2VsbFdpZWdodCIsImdldENlbGxEYXRhIiwiY2VsbFdlaWdodHMiLCJjZWxsQ291bnRzIiwicHVzaCIsImNvbnN0cnVjdG9yIiwiZ2wiLCJvcHRzIiwiaWQiLCJzaGFkZXJDYWNoZSIsInN0YXRlIiwiX2hhc0dQVVN1cHBvcnQiLCJCTEVORF9FUVVBVElPTl9NSU5NQVgiLCJDT0xPUl9BVFRBQ0hNRU5UX1JHQkEzMkYiLCJURVhUVVJFX0ZJTFRFUl9MSU5FQVJfRkxPQVQiLCJfc2V0dXBHUFVSZXNvdXJjZXMiLCJydW4iLCJwb3NpdGlvbnMiLCJwb3NpdGlvbnM2NHh5TG93Iiwid2VpZ2h0cyIsImNoYW5nZUZsYWdzIiwiY2VsbFNpemUiLCJ2aWV3cG9ydCIsIndpZHRoIiwiaGVpZ2h0IiwiY291bnRzQnVmZmVyIiwibWF4Q291bnRCdWZmZXIiLCJncmlkVHJhbnNmb3JtTWF0cml4IiwicHJvamVjdFBvaW50cyIsInVzZUdQVSIsIl9zZXRTdGF0ZSIsInRyYW5zZm9ybU1hdHJpeCIsInBpeGVsUHJvamVjdGlvbk1hdHJpeCIsImFnZ3JlZ2F0aW9uUGFyYW1zIiwiX3VwZGF0ZUdyaWRTaXplIiwiX3J1bkFnZ3JlZ2F0aW9uT25HUFUiLCJ3YXJuIiwiX3J1bkFnZ3JlZ2F0aW9uT25DUFUiLCJfZ2V0QWdncmVnYXRlRGF0YSIsImdyaWRBZ2dyZWdhdGlvbkZyYW1lYnVmZmVyIiwicmVhZFBpeGVsc1RvQnVmZmVyIiwiYnVmZmVyIiwidHlwZSIsIkZMT0FUIiwiYWxsQWdncmVncmF0aW9uRnJhbWVidWZmZXIiLCJjb3VudHNUZXh0dXJlIiwidGV4dHVyZSIsIm1heENvdW50VGV4dHVyZSIsIl9nZXRBZ2dyZWdhdGlvbk1vZGVsIiwidnMiLCJmcyIsIm1vZHVsZXMiLCJ2ZXJ0ZXhDb3VudCIsImRyYXdNb2RlIiwiUE9JTlRTIiwiX2dldEFsbEFnZ3JlZ2F0aW9uTW9kZWwiLCJpc0luc3RhbmNlZCIsImluc3RhbmNlQ291bnQiLCJhdHRyaWJ1dGVzIiwicG9zaXRpb24iLCJzaXplIiwiZGF0YSIsIkZsb2F0MzJBcnJheSIsIl9wcm9qZWN0UG9zaXRpb25zIiwicHJvamVjdGVkUG9zaXRpb25zIiwicHJvamVjdEZsYXQiLCJ4IiwieSIsIl9yZW5kZXJBZ2dyZWdhdGVEYXRhIiwibnVtQ29sIiwibnVtUm93Iiwid2luZG93U2l6ZSIsImdyaWRBZ2dyZWdhdGlvbk1vZGVsIiwiYWxsQWdncmVnYXRpb25Nb2RlbCIsInVQcm9qZWN0aW9uTWF0cml4RlA2NCIsImdyaWRTaXplIiwiYmluZCIsImNsZWFyIiwiQ09MT1JfQlVGRkVSX0JJVCIsImRyYXciLCJwYXJhbWV0ZXJzIiwiY2xlYXJDb2xvciIsImNsZWFyRGVwdGgiLCJibGVuZCIsImRlcHRoVGVzdCIsImJsZW5kRXF1YXRpb24iLCJGVU5DX0FERCIsImJsZW5kRnVuYyIsIk9ORSIsIm1vZHVsZVNldHRpbmdzIiwidW5pZm9ybXMiLCJ1UHJvamVjdGlvbk1hdHJpeCIsInVuYmluZCIsIk1BWCIsInVTYW1wbGVyIiwiRUxFTUVOVENPVU5UIiwiY291bnRzIiwicG9zIiwiZmlsbCIsIm1heFdlaWdodCIsImdyaWRQb3MiLCJ3ZWlnaHQiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsImNvbElkIiwiTWF0aCIsImZsb29yIiwicm93SWQiLCJpIiwibWF4Q291bnRCdWZmZXJEYXRhIiwic3ViRGF0YSIsIl91cGRhdGVNb2RlbHMiLCJ1cGRhdGVPYmplY3QiLCJPYmplY3QiLCJhc3NpZ24iLCJzZXR1cEZyYW1lYnVmZmVyIiwiX3NldHVwTW9kZWxzIiwiZGVsZXRlIiwicG9zaXRpb25zQnVmZmVyIiwicG9zaXRpb25zNjR4eUxvd0J1ZmZlciIsIndlaWdodHNCdWZmZXIiLCJhZ2dyZWdhdGlvbk1vZGVsQXR0cmlidXRlcyIsImNyZWF0ZVBvczY0eHlMb3ciLCJzZXRWZXJ0ZXhDb3VudCIsInNldEF0dHJpYnV0ZXMiLCJzZXRJbnN0YW5jZUNvdW50IiwiZnJhbWVidWZmZXJTaXplIiwicmVzaXplIiwiY2VpbCIsImZvcm1hdCIsIlJHQkEzMkYiLCJib3JkZXIiLCJtaXBtYXBzIiwiVEVYVFVSRV9NQUdfRklMVEVSIiwiTkVBUkVTVCIsIlRFWFRVUkVfTUlOX0ZJTFRFUiIsImRhdGFGb3JtYXQiLCJSR0JBIiwiZmIiLCJhdHRhY2htZW50cyIsIkNPTE9SX0FUVEFDSE1FTlQwIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLE9BQU9BLEVBQVAsTUFBZSxtQkFBZjtBQUNBLFNBQVFDLE1BQVIsRUFBZ0JDLEtBQWhCLEVBQXVCQyxXQUF2QixFQUFvQ0MsU0FBcEMsRUFBK0NDLFFBQS9DLEVBQXlEQyxXQUF6RCxFQUFzRUMsUUFBdEUsUUFBcUYsU0FBckY7QUFDQSxTQUFRQyxH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QixDQUFmOztBQUNBLFNBQUtTLFNBQUwsQ0FBZTtBQUFDdUMsWUFBRDtBQUFTQyxZQUFUO0FBQWlCQyxrQkFBWSxDQUFDaEQsS0FBRCxFQUFRQyxNQUFSO0FBQTdCLEtBQWY7QUFDRDs7QUExWG9DLEMsQ0E2WHZDOztBQUVBLFNBQVMyRixnQkFBVCxDQUEwQjdHLEVBQTFCLEVBQThCQyxJQUE5QixFQUFvQztBQUFBLFFBQzNCQyxFQUQyQixHQUNyQkQsSUFEcUIsQ0FDM0JDLEVBRDJCO0FBRWxDLFFBQU1zQyxVQUFVLElBQUkvRSxTQUFKLENBQWN1QyxFQUFkLEVBQWtCO0FBQ2hDdUQsVUFBTSxJQUQwQjtBQUVoQ29FLFlBQVF0SyxHQUFHdUssT0FGcUI7QUFHaEN4RixVQUFNL0UsR0FBR2dGLEtBSHVCO0FBSWhDd0YsWUFBUSxDQUp3QjtBQUtoQ0MsYUFBUyxLQUx1QjtBQU1oQ3BELGdCQUFZO0FBQ1YsT0FBQ3JILEdBQUcwSyxrQkFBSixHQUF5QjFLLEdBQUcySyxPQURsQjtBQUVWLE9BQUMzSyxHQUFHNEssa0JBQUosR0FBeUI1SyxHQUFHMks7QUFGbEIsS0FOb0I7QUFVaENFLGdCQUFZN0ssR0FBRzhLO0FBVmlCLEdBQWxCLENBQWhCO0FBYUEsUUFBTUMsS0FBSyxJQUFJNUssV0FBSixDQUFnQndDLEVBQWhCLEVBQW9CO0FBQzdCRSxNQUQ2QjtBQUU3Qm1JLGlCQUFhO0FBQ1gsT0FBQ2hMLEdBQUdpTCxpQkFBSixHQUF3QjlGO0FBRGI7QUFGZ0IsR0FBcEIsQ0FBWDtBQU9BLFNBQU80RixFQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgR0wgZnJvbSAnbHVtYS5nbC9jb25zdGFudHMnO1xuaW1wb3J0IHtCdWZmZXIsIE1vZGVsLCBGcmFtZWJ1ZmZlciwgVGV4dHVyZTJELCBGRUFUVVJFUywgaGFzRmVhdHVyZXMsIGlzV2ViR0wyfSBmcm9tICdsdW1hLmdsJztcbmltcG9ydCB7bG9nfSBmcm9tICdAZGVjay5nbC9jb3JlJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7ZnA2NCBhcyBmcDY0VXRpbHN9IGZyb20gJ2x1bWEuZ2wnO1xuaW1wb3J0IHt3b3JsZFRvUGl4ZWxzfSBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcbmNvbnN0IHtmcDY0aWZ5TWF0cml4NH0gPSBmcDY0VXRpbHM7XG5jb25zdCBJREVOVElUWV9NQVRSSVggPSBbMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMV07XG5jb25zdCBQSVhFTF9TSVpFID0gNDsgLy8gUkdCQTMyRlxuY29uc3QgQUdHUkVHQVRFX1RPX0dSSURfVlMgPSBgXFxcbmF0dHJpYnV0ZSB2ZWMyIHBvc2l0aW9ucztcbmF0dHJpYnV0ZSB2ZWMyIHBvc2l0aW9uczY0eHlMb3c7XG5hdHRyaWJ1dGUgZmxvYXQgd2VpZ2h0cztcbnVuaWZvcm0gdmVjMiB3aW5kb3dTaXplO1xudW5pZm9ybSB2ZWMyIGNlbGxTaXplO1xudW5pZm9ybSB2ZWMyIGdyaWRTaXplO1xudW5pZm9ybSBtYXQ0IHVQcm9qZWN0aW9uTWF0cml4O1xudW5pZm9ybSBib29sIHByb2plY3RQb2ludHM7XG5cbnZhcnlpbmcgZmxvYXQgdldlaWdodHM7XG5cbnZlYzIgcHJvamVjdF90b19waXhlbCh2ZWMyIHBvcykge1xuICB2ZWM0IHBvc2l0aW9uID0gdmVjNChwb3MsIDAuLCAxLik7XG4gIHZlYzQgcmVzdWx0ID0gIHVQcm9qZWN0aW9uTWF0cml4ICogcG9zaXRpb247XG4gIHJldHVybiByZXN1bHQueHkvcmVzdWx0Lnc7XG59XG5cbnZvaWQgbWFpbih2b2lkKSB7XG5cbiAgdldlaWdodHMgPSB3ZWlnaHRzO1xuXG4gIHZlYzIgd2luZG93UG9zID0gcG9zaXRpb25zO1xuICB2ZWMyIHdpbmRvd1BvczY0eHlMb3cgPSBwb3NpdGlvbnM2NHh5TG93O1xuICBpZiAocHJvamVjdFBvaW50cykge1xuICAgIHdpbmRvd1BvcyA9IHByb2plY3RfcG9zaXRpb24od2luZG93UG9zKTtcbiAgfVxuXG4gIHdpbmRvd1BvcyA9IHByb2plY3RfdG9fcGl4ZWwod2luZG93UG9zKTtcblxuICAvLyBUcmFuc2Zvcm0gKDAsMCk6d2luZG93U2l6ZSAtPiAoMCwgMCk6IGdyaWRTaXplXG4gIHZlYzIgcG9zID0gZmxvb3Iod2luZG93UG9zIC8gY2VsbFNpemUpO1xuXG4gIC8vIFRyYW5zZm9ybSAoMCwwKTpncmlkU2l6ZSAtPiAoLTEsIC0xKTooMSwxKVxuICBwb3MgPSAocG9zICogKDIuLCAyLikgLyAoZ3JpZFNpemUpKSAtICgxLiwgMS4pO1xuXG4gIC8vIE1vdmUgdG8gcGl4ZWwgY2VudGVyLCBwaXhlbC1zaXplIGluIHNjcmVlbiBzYXBjZSAoMi9ncmlkU2l6ZSkgKiAwLjUgPT4gMS9ncmlkU2l6ZVxuICB2ZWMyIG9mZnNldCA9IDEuMCAvIGdyaWRTaXplO1xuICBwb3MgPSBwb3MgKyBvZmZzZXQ7XG5cbiAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvcywgMC4wLCAxLjApO1xufVxuYDtcblxuY29uc3QgQUdHUkVHQVRFX1RPX0dSSURfVlNfRlA2NCA9IGBcXFxuYXR0cmlidXRlIHZlYzIgcG9zaXRpb25zO1xuYXR0cmlidXRlIHZlYzIgcG9zaXRpb25zNjR4eUxvdztcbmF0dHJpYnV0ZSBmbG9hdCB3ZWlnaHRzO1xudW5pZm9ybSB2ZWMyIHdpbmRvd1NpemU7XG51bmlmb3JtIHZlYzIgY2VsbFNpemU7XG51bmlmb3JtIHZlYzIgZ3JpZFNpemU7XG51bmlmb3JtIHZlYzIgdVByb2plY3Rpb25NYXRyaXhGUDY0WzE2XTtcbnVuaWZvcm0gYm9vbCBwcm9qZWN0UG9pbnRzO1xuXG52YXJ5aW5nIGZsb2F0IHZXZWlnaHRzO1xuXG52b2lkIHByb2plY3RfdG9fcGl4ZWwodmVjMiBwb3MsIHZlYzIgcG9zNjR4eUxvdywgb3V0IHZlYzIgcGl4ZWxYWTY0WzJdKSB7XG5cbiAgdmVjMiByZXN1bHQ2NFs0XTtcbiAgdmVjMiBwb3NpdGlvbjY0WzRdO1xuICBwb3NpdGlvbjY0WzBdID0gdmVjMihwb3MueCwgcG9zNjR4eUxvdy54KTtcbiAgcG9zaXRpb242NFsxXSA9IHZlYzIocG9zLnksIHBvczY0eHlMb3cueSk7XG4gIHBvc2l0aW9uNjRbMl0gPSB2ZWMyKDAuLCAwLik7XG4gIHBvc2l0aW9uNjRbM10gPSB2ZWMyKDEuLCAwLik7XG4gIG1hdDRfdmVjNF9tdWxfZnA2NCh1UHJvamVjdGlvbk1hdHJpeEZQNjQsIHBvc2l0aW9uNjQsXG4gIHJlc3VsdDY0KTtcblxuICBwaXhlbFhZNjRbMF0gPSBkaXZfZnA2NChyZXN1bHQ2NFswXSwgcmVzdWx0NjRbM10pO1xuICBwaXhlbFhZNjRbMV0gPSBkaXZfZnA2NChyZXN1bHQ2NFsxXSwgcmVzdWx0NjRbM10pO1xufVxuXG52b2lkIG1haW4odm9pZCkge1xuXG4gIHZXZWlnaHRzID0gd2VpZ2h0cztcblxuICB2ZWMyIHdpbmRvd1BvcyA9IHBvc2l0aW9ucztcbiAgdmVjMiB3aW5kb3dQb3M2NHh5TG93ID0gcG9zaXRpb25zNjR4eUxvdztcbiAgaWYgKHByb2plY3RQb2ludHMpIHtcbiAgICB2ZWMyIHByb2plY3RlZFhZWzJdO1xuICAgIHByb2plY3RfcG9zaXRpb25fZnA2NCh3aW5kb3dQb3MsIHdpbmRvd1BvczY0eHlMb3csIHByb2plY3RlZFhZKTtcbiAgICB3aW5kb3dQb3MueCA9IHByb2plY3RlZFhZWzBdLng7XG4gICAgd2luZG93UG9zLnkgPSBwcm9qZWN0ZWRYWVsxXS54O1xuICAgIHdpbmRvd1BvczY0eHlMb3cueCA9IHByb2plY3RlZFhZWzBdLnk7XG4gICAgd2luZG93UG9zNjR4eUxvdy55ID0gcHJvamVjdGVkWFlbMV0ueTtcbiAgfVxuXG4gIHZlYzIgcGl4ZWxYWTY0WzJdO1xuICBwcm9qZWN0X3RvX3BpeGVsKHdpbmRvd1Bvcywgd2luZG93UG9zNjR4eUxvdywgcGl4ZWxYWTY0KTtcblxuICAvLyBUcmFuc2Zvcm0gKDAsMCk6d2luZG93U2l6ZSAtPiAoMCwgMCk6IGdyaWRTaXplXG4gIHZlYzIgZ3JpZFhZNjRbMl07XG4gIGdyaWRYWTY0WzBdID0gZGl2X2ZwNjQocGl4ZWxYWTY0WzBdLCB2ZWMyKGNlbGxTaXplLngsIDApKTtcbiAgZ3JpZFhZNjRbMV0gPSBkaXZfZnA2NChwaXhlbFhZNjRbMV0sIHZlYzIoY2VsbFNpemUueSwgMCkpO1xuICBmbG9hdCB4ID0gZmxvb3IoZ3JpZFhZNjRbMF0ueCk7XG4gIGZsb2F0IHkgPSBmbG9vcihncmlkWFk2NFsxXS54KTtcbiAgdmVjMiBwb3MgPSB2ZWMyKHgsIHkpO1xuXG4gIC8vIFRyYW5zZm9ybSAoMCwwKTpncmlkU2l6ZSAtPiAoLTEsIC0xKTooMSwxKVxuICBwb3MgPSAocG9zICogKDIuLCAyLikgLyAoZ3JpZFNpemUpKSAtICgxLiwgMS4pO1xuXG4gIC8vIE1vdmUgdG8gcGl4ZWwgY2VudGVyLCBwaXhlbC1zaXplIGluIHNjcmVlbiBzYXBjZSAoMi9ncmlkU2l6ZSkgKiAwLjUgPT4gMS9ncmlkU2l6ZVxuICB2ZWMyIG9mZnNldCA9IDEuMCAvIGdyaWRTaXplO1xuICBwb3MgPSBwb3MgKyBvZmZzZXQ7XG5cbiAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvcywgMC4wLCAxLjApO1xufVxuYDtcblxuY29uc3QgQUdHUkVHQVRFX1RPX0dSSURfRlMgPSBgXFxcbnByZWNpc2lvbiBoaWdocCBmbG9hdDtcblxudmFyeWluZyBmbG9hdCB2V2VpZ2h0cztcblxudm9pZCBtYWluKHZvaWQpIHtcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNCgxLiwgdldlaWdodHMsIDAsIDAuMCk7XG59XG5gO1xuXG5jb25zdCBBR0dSRUdBVEVfQUxMX1ZTID0gYFxcXG4jdmVyc2lvbiAzMDAgZXNcblxuaW4gdmVjMiBwb3NpdGlvbjtcbnVuaWZvcm0gdmVjMiBncmlkU2l6ZTtcblxub3V0IHZlYzIgdlRleHR1cmVDb29yZDtcbnZvaWQgbWFpbih2b2lkKSB7XG4gIC8vIE1hcCBlYWNoIHBvc2l0aW9uIHRvIHNpbmdsZSBwaXhlbFxuICB2ZWMyIHBvcyA9IHZlYzIoLTEuMCwgLTEuMCk7XG5cbiAgLy8gTW92ZSB0byBwaXhlbCBjZW50ZXIsIHBpeGVsLXNpemUgaW4gc2NyZWVuIHNhcGNlICgyL2dyaWRTaXplKSAqIDAuNSA9PiAxL2dyaWRTaXplXG4gIHZlYzIgb2Zmc2V0ID0gMS4wIC8gZ3JpZFNpemU7XG4gIHBvcyA9IHBvcyArIG9mZnNldDtcblxuICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zLCAwLjAsIDEuMCk7XG5cbiAgZmxvYXQgeUluZGV4ID0gZmxvb3IoZmxvYXQoZ2xfSW5zdGFuY2VJRCkgLyBncmlkU2l6ZVswXSk7XG4gIGZsb2F0IHhJbmRleCA9IGZsb2F0KGdsX0luc3RhbmNlSUQpIC0gKHlJbmRleCAqIGdyaWRTaXplWzBdKTtcblxuICB2VGV4dHVyZUNvb3JkID0gdmVjMih5SW5kZXgvZ3JpZFNpemVbMV0sIHhJbmRleC9ncmlkU2l6ZVswXSk7XG4gIC8vIHZUZXh0dXJlQ29vcmQgPSB2ZWMyKDAuNSwgMC41KTtcbn1cbmA7XG5cbmNvbnN0IEFHR1JFR0FURV9BTExfVlNfRlA2NCA9IGBcXFxuI3ZlcnNpb24gMzAwIGVzXG5cbmluIHZlYzIgcG9zaXRpb247XG51bmlmb3JtIHZlYzIgZ3JpZFNpemU7XG5cbm91dCB2ZWMyIHZUZXh0dXJlQ29vcmQ7XG52b2lkIG1haW4odm9pZCkge1xuICAvLyBNYXAgZWFjaCBwb3NpdGlvbiB0byBzaW5nbGUgcGl4ZWxcbiAgdmVjMiBwb3MgPSB2ZWMyKC0xLjAsIC0xLjApO1xuXG4gIC8vIE1vdmUgdG8gcGl4ZWwgY2VudGVyLCBwaXhlbC1zaXplIGluIHNjcmVlbiBzYXBjZSAoMi9ncmlkU2l6ZSkgKiAwLjUgPT4gMS9ncmlkU2l6ZVxuICB2ZWMyIG9mZnNldCA9IDEuMCAvIGdyaWRTaXplO1xuICBwb3MgPSBwb3MgKyBvZmZzZXQ7XG5cbiAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvcywgMC4wLCAxLjApO1xuXG4gIGZsb2F0IHlJbmRleCA9IGZsb29yKGZsb2F0KGdsX0luc3RhbmNlSUQpIC8gZ3JpZFNpemVbMF0pO1xuICBmbG9hdCB4SW5kZXggPSBmbG9hdChnbF9JbnN0YW5jZUlEKSAtICh5SW5kZXggKiBncmlkU2l6ZVswXSk7XG5cbiAgdmVjMiB5SW5kZXhGUDY0ID0gdmVjMih5SW5kZXgsIDAuKTtcbiAgdmVjMiB4SW5kZXhGUDY0ID0gdmVjMih4SW5kZXgsIDAuKTtcbiAgdmVjMiBncmlkU2l6ZVlGUDY0ID0gdmVjMihncmlkU2l6ZVsxXSwgMC4pO1xuICB2ZWMyIGdyaWRTaXplWEZQNjQgPSB2ZWMyKGdyaWRTaXplWzBdLCAwLik7XG5cbiAgdmVjMiB0ZXhDb29yZFhGUDY0ID0gZGl2X2ZwNjQoeUluZGV4RlA2NCwgZ3JpZFNpemVZRlA2NCk7XG4gIHZlYzIgdGV4Q29vcmRZRlA2NCA9IGRpdl9mcDY0KHhJbmRleEZQNjQsIGdyaWRTaXplWEZQNjQpO1xuXG4gIHZUZXh0dXJlQ29vcmQgPSB2ZWMyKHRleENvb3JkWUZQNjQueCwgdGV4Q29vcmRYRlA2NC54KTtcbn1cbmA7XG5cbmNvbnN0IEFHR1JFR0FURV9BTExfRlMgPSBgXFxcbiN2ZXJzaW9uIDMwMCBlc1xucHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG5pbiB2ZWMyIHZUZXh0dXJlQ29vcmQ7XG51bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcbm91dCB2ZWM0IGZyYWdDb2xvcjtcbnZvaWQgbWFpbih2b2lkKSB7XG4gIHZlYzQgdGV4dHVyZUNvbG9yID0gdGV4dHVyZSh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLnMsIHZUZXh0dXJlQ29vcmQudCkpO1xuICAvLyBSZWQ6IHRvdGFsIGNvdW50LCBHcmVlbjogdG90YWwgd2VpZ2h0LCBBbHBoYTogbWF4aW11bSB3aWVnaHRcbiAgZnJhZ0NvbG9yID0gdmVjNCh0ZXh0dXJlQ29sb3IuciwgdGV4dHVyZUNvbG9yLmcsIDAuLCB0ZXh0dXJlQ29sb3IuZyk7XG59XG5gO1xuXG5jb25zdCBERUZBVUxUX0NIQU5HRV9GTEFHUyA9IHtcbiAgZGF0YUNoYW5nZWQ6IHRydWUsXG4gIHZpZXdwb3J0Q2hhbmdlZDogdHJ1ZSxcbiAgY2VsbFNpemVDaGFuZ2VkOiB0cnVlXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHUFVHcmlkQWdncmVnYXRvciB7XG4gIC8vIERlY29kZSBhbmQgcmV0dXJuIGFnZ3JlZ2F0aW9uIGRhdGEgb2YgZ2l2ZW4gcGl4ZWwuXG4gIHN0YXRpYyBnZXRBZ2dyZWdhdGlvbkRhdGEoe2NvdW50c0RhdGEsIG1heENvdW50RGF0YSwgcGl4ZWxJbmRleH0pIHtcbiAgICBhc3NlcnQoY291bnRzRGF0YS5sZW5ndGggPj0gKHBpeGVsSW5kZXggKyAxKSAqIFBJWEVMX1NJWkUpO1xuICAgIGFzc2VydChtYXhDb3VudERhdGEubGVuZ3RoID09PSBQSVhFTF9TSVpFKTtcbiAgICBjb25zdCBpbmRleCA9IHBpeGVsSW5kZXggKiBQSVhFTF9TSVpFO1xuICAgIGNvbnN0IGNlbGxDb3VudCA9IGNvdW50c0RhdGFbaW5kZXhdO1xuICAgIGNvbnN0IGNlbGxXZWlnaHQgPSBjb3VudHNEYXRhW2luZGV4ICsgMV07XG4gICAgY29uc3QgdG90YWxDb3VudCA9IG1heENvdW50RGF0YVswXTtcbiAgICBjb25zdCB0b3RhbFdlaWdodCA9IG1heENvdW50RGF0YVsxXTtcbiAgICBjb25zdCBtYXhDZWxsV2llZ2h0ID0gbWF4Q291bnREYXRhWzNdO1xuICAgIHJldHVybiB7XG4gICAgICBjZWxsQ291bnQsXG4gICAgICBjZWxsV2VpZ2h0LFxuICAgICAgdG90YWxDb3VudCxcbiAgICAgIHRvdGFsV2VpZ2h0LFxuICAgICAgbWF4Q2VsbFdpZWdodFxuICAgIH07XG4gIH1cblxuICAvLyBEZWNvZGVzIGFuZCByZXR1bnMgY291bnRzIGFuZCB3ZWlnaHRzIG9mIGFsbCBjZWxsc1xuICBzdGF0aWMgZ2V0Q2VsbERhdGEoe2NvdW50c0RhdGF9KSB7XG4gICAgY29uc3QgY2VsbFdlaWdodHMgPSBbXTtcbiAgICBjb25zdCBjZWxsQ291bnRzID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGNvdW50c0RhdGEubGVuZ3RoOyBpbmRleCArPSA0KSB7XG4gICAgICBjZWxsQ291bnRzLnB1c2goY291bnRzRGF0YVtpbmRleF0pO1xuICAgICAgY2VsbFdlaWdodHMucHVzaChjb3VudHNEYXRhW2luZGV4ICsgMV0pO1xuICAgIH1cbiAgICByZXR1cm4ge2NlbGxDb3VudHMsIGNlbGxXZWlnaHRzfTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGdsLCBvcHRzID0ge30pIHtcbiAgICB0aGlzLmlkID0gb3B0cy5pZCB8fCAnZ3B1LWdyaWQtYWdncmVnYXRvcic7XG4gICAgdGhpcy5zaGFkZXJDYWNoZSA9IG9wdHMuc2hhZGVyQ2FjaGUgfHwgbnVsbDtcbiAgICB0aGlzLmdsID0gZ2w7XG4gICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgIHRoaXMuX2hhc0dQVVN1cHBvcnQgPVxuICAgICAgaXNXZWJHTDIoZ2wpICYmXG4gICAgICBoYXNGZWF0dXJlcyhcbiAgICAgICAgdGhpcy5nbCxcbiAgICAgICAgRkVBVFVSRVMuQkxFTkRfRVFVQVRJT05fTUlOTUFYLFxuICAgICAgICBGRUFUVVJFUy5DT0xPUl9BVFRBQ0hNRU5UX1JHQkEzMkYsXG4gICAgICAgIEZFQVRVUkVTLlRFWFRVUkVfRklMVEVSX0xJTkVBUl9GTE9BVFxuICAgICAgKTtcbiAgICBpZiAodGhpcy5faGFzR1BVU3VwcG9ydCkge1xuICAgICAgdGhpcy5fc2V0dXBHUFVSZXNvdXJjZXMoKTtcbiAgICB9XG4gIH1cblxuICAvLyBQZXJmb3JtIGFnZ3JlZ2F0aW9uIGFuZCByZXR1biB0aGUgcmVzdWx0c1xuICBydW4oe1xuICAgIHBvc2l0aW9ucyxcbiAgICBwb3NpdGlvbnM2NHh5TG93LFxuICAgIHdlaWdodHMsXG4gICAgY2hhbmdlRmxhZ3MgPSBERUZBVUxUX0NIQU5HRV9GTEFHUyxcbiAgICBjZWxsU2l6ZSxcbiAgICB2aWV3cG9ydCxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgY291bnRzQnVmZmVyID0gbnVsbCxcbiAgICBtYXhDb3VudEJ1ZmZlciA9IG51bGwsXG4gICAgZ3JpZFRyYW5zZm9ybU1hdHJpeCA9IG51bGwsXG4gICAgcHJvamVjdFBvaW50cyA9IGZhbHNlLFxuICAgIHVzZUdQVSA9IHRydWUsXG4gICAgZnA2NCA9IGZhbHNlXG4gIH0gPSB7fSkge1xuICAgIGlmICh0aGlzLnN0YXRlLnVzZUdQVSAhPT0gdXNlR1BVKSB7XG4gICAgICBjaGFuZ2VGbGFncyA9IERFRkFVTFRfQ0hBTkdFX0ZMQUdTO1xuICAgIH1cbiAgICB0aGlzLl9zZXRTdGF0ZSh7dXNlR1BVfSk7XG4gICAgY29uc3QgdHJhbnNmb3JtTWF0cml4ID1cbiAgICAgIGdyaWRUcmFuc2Zvcm1NYXRyaXggfHwgKHZpZXdwb3J0ICYmIHZpZXdwb3J0LnBpeGVsUHJvamVjdGlvbk1hdHJpeCkgfHwgSURFTlRJVFlfTUFUUklYO1xuICAgIGNvbnN0IGFnZ3JlZ2F0aW9uUGFyYW1zID0ge1xuICAgICAgcG9zaXRpb25zLFxuICAgICAgcG9zaXRpb25zNjR4eUxvdyxcbiAgICAgIHdlaWdodHMsXG4gICAgICBjaGFuZ2VGbGFncyxcbiAgICAgIGNlbGxTaXplLFxuICAgICAgdmlld3BvcnQsXG4gICAgICBncmlkVHJhbnNmb3JtTWF0cml4OiB0cmFuc2Zvcm1NYXRyaXgsXG4gICAgICBjb3VudHNCdWZmZXIsXG4gICAgICBtYXhDb3VudEJ1ZmZlcixcbiAgICAgIHByb2plY3RQb2ludHMsXG4gICAgICBmcDY0XG4gICAgfTtcblxuICAgIHRoaXMuX3VwZGF0ZUdyaWRTaXplKHt2aWV3cG9ydCwgY2VsbFNpemUsIHdpZHRoLCBoZWlnaHR9KTtcbiAgICBpZiAodGhpcy5faGFzR1BVU3VwcG9ydCAmJiB1c2VHUFUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9ydW5BZ2dyZWdhdGlvbk9uR1BVKGFnZ3JlZ2F0aW9uUGFyYW1zKTtcbiAgICB9XG4gICAgaWYgKHVzZUdQVSkge1xuICAgICAgbG9nLndhcm4oJ1NjcmVlbkdyaWRBZ2dyZWdhdG9yOiBHUFUgQWdncmVnYXRpb24gbm90IHN1cHBvcnRlZCwgZmFsbGluZyBiYWNrIHRvIENQVScpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcnVuQWdncmVnYXRpb25PbkNQVShhZ2dyZWdhdGlvblBhcmFtcyk7XG4gIH1cblxuICAvLyBQUklWQVRFXG5cbiAgX2dldEFnZ3JlZ2F0ZURhdGEob3B0cykge1xuICAgIGxldCB7Y291bnRzQnVmZmVyLCBtYXhDb3VudEJ1ZmZlcn0gPSBvcHRzO1xuICAgIGNvdW50c0J1ZmZlciA9IHRoaXMuZ3JpZEFnZ3JlZ2F0aW9uRnJhbWVidWZmZXIucmVhZFBpeGVsc1RvQnVmZmVyKHtcbiAgICAgIGJ1ZmZlcjogY291bnRzQnVmZmVyLFxuICAgICAgdHlwZTogR0wuRkxPQVRcbiAgICB9KTtcbiAgICBtYXhDb3VudEJ1ZmZlciA9IHRoaXMuYWxsQWdncmVncmF0aW9uRnJhbWVidWZmZXIucmVhZFBpeGVsc1RvQnVmZmVyKHtcbiAgICAgIHdpZHRoOiAxLFxuICAgICAgaGVpZ2h0OiAxLFxuICAgICAgdHlwZTogR0wuRkxPQVQsXG4gICAgICBidWZmZXI6IG1heENvdW50QnVmZmVyXG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvdW50c0J1ZmZlcixcbiAgICAgIGNvdW50c1RleHR1cmU6IHRoaXMuZ3JpZEFnZ3JlZ2F0aW9uRnJhbWVidWZmZXIudGV4dHVyZSxcbiAgICAgIG1heENvdW50QnVmZmVyLFxuICAgICAgbWF4Q291bnRUZXh0dXJlOiB0aGlzLmFsbEFnZ3JlZ3JhdGlvbkZyYW1lYnVmZmVyLnRleHR1cmVcbiAgICB9O1xuICB9XG5cbiAgX2dldEFnZ3JlZ2F0aW9uTW9kZWwoZnA2NCA9IGZhbHNlKSB7XG4gICAgY29uc3Qge2dsLCBzaGFkZXJDYWNoZX0gPSB0aGlzO1xuICAgIHJldHVybiBuZXcgTW9kZWwoZ2wsIHtcbiAgICAgIGlkOiAnR2lyZC1BZ2dyZWdhdGlvbi1Nb2RlbCcsXG4gICAgICB2czogZnA2NCA/IEFHR1JFR0FURV9UT19HUklEX1ZTX0ZQNjQgOiBBR0dSRUdBVEVfVE9fR1JJRF9WUyxcbiAgICAgIGZzOiBBR0dSRUdBVEVfVE9fR1JJRF9GUyxcbiAgICAgIG1vZHVsZXM6IGZwNjQgPyBbJ2ZwNjQnLCAncHJvamVjdDY0J10gOiBbJ3Byb2plY3QzMiddLFxuICAgICAgc2hhZGVyQ2FjaGUsXG4gICAgICB2ZXJ0ZXhDb3VudDogMCxcbiAgICAgIGRyYXdNb2RlOiBHTC5QT0lOVFNcbiAgICB9KTtcbiAgfVxuXG4gIF9nZXRBbGxBZ2dyZWdhdGlvbk1vZGVsKGZwNjQgPSBmYWxzZSkge1xuICAgIGNvbnN0IHtnbCwgc2hhZGVyQ2FjaGV9ID0gdGhpcztcbiAgICByZXR1cm4gbmV3IE1vZGVsKGdsLCB7XG4gICAgICBpZDogJ0FsbC1BZ2dyZWdhdGlvbi1Nb2RlbCcsXG4gICAgICB2czogZnA2NCA/IEFHR1JFR0FURV9BTExfVlNfRlA2NCA6IEFHR1JFR0FURV9BTExfVlMsXG4gICAgICBmczogQUdHUkVHQVRFX0FMTF9GUyxcbiAgICAgIG1vZHVsZXM6IGZwNjQgPyBbJ2ZwNjQnXSA6IFtdLFxuICAgICAgc2hhZGVyQ2FjaGUsXG4gICAgICB2ZXJ0ZXhDb3VudDogMSxcbiAgICAgIGRyYXdNb2RlOiBHTC5QT0lOVFMsXG4gICAgICBpc0luc3RhbmNlZDogdHJ1ZSxcbiAgICAgIGluc3RhbmNlQ291bnQ6IDAsXG4gICAgICBhdHRyaWJ1dGVzOiB7cG9zaXRpb246IG5ldyBCdWZmZXIoZ2wsIHtzaXplOiAyLCBkYXRhOiBuZXcgRmxvYXQzMkFycmF5KFswLCAwXSl9KX1cbiAgICB9KTtcbiAgfVxuXG4gIF9wcm9qZWN0UG9zaXRpb25zKG9wdHMpIHtcbiAgICBsZXQge3Byb2plY3RlZFBvc2l0aW9uc30gPSB0aGlzLnN0YXRlO1xuICAgIGlmICghcHJvamVjdGVkUG9zaXRpb25zIHx8IG9wdHMuY2hhbmdlRmxhZ3MuZGF0YUNoYW5nZWQgfHwgb3B0cy5jaGFuZ2VGbGFncy52aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgIGNvbnN0IHtwb3NpdGlvbnMsIHZpZXdwb3J0fSA9IG9wdHM7XG4gICAgICBwcm9qZWN0ZWRQb3NpdGlvbnMgPSBbXTtcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NpdGlvbnMubGVuZ3RoOyBpbmRleCArPSAyKSB7XG4gICAgICAgIGNvbnN0IFt4LCB5XSA9IHZpZXdwb3J0LnByb2plY3RGbGF0KFtwb3NpdGlvbnNbaW5kZXhdLCBwb3NpdGlvbnNbaW5kZXggKyAxXV0pO1xuICAgICAgICBwcm9qZWN0ZWRQb3NpdGlvbnMucHVzaCh4LCB5KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3NldFN0YXRlKHtwcm9qZWN0ZWRQb3NpdGlvbnN9KTtcbiAgICB9XG4gIH1cblxuICBfcmVuZGVyQWdncmVnYXRlRGF0YShvcHRzKSB7XG4gICAgY29uc3Qge2NlbGxTaXplLCB2aWV3cG9ydCwgZ3JpZFRyYW5zZm9ybU1hdHJpeCwgcHJvamVjdFBvaW50c30gPSBvcHRzO1xuICAgIGNvbnN0IHtudW1Db2wsIG51bVJvdywgd2luZG93U2l6ZX0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHtcbiAgICAgIGdsLFxuICAgICAgZ3JpZEFnZ3JlZ2F0aW9uRnJhbWVidWZmZXIsXG4gICAgICBncmlkQWdncmVnYXRpb25Nb2RlbCxcbiAgICAgIGFsbEFnZ3JlZ3JhdGlvbkZyYW1lYnVmZmVyLFxuICAgICAgYWxsQWdncmVnYXRpb25Nb2RlbFxuICAgIH0gPSB0aGlzO1xuXG4gICAgY29uc3QgdVByb2plY3Rpb25NYXRyaXhGUDY0ID0gZnA2NGlmeU1hdHJpeDQoZ3JpZFRyYW5zZm9ybU1hdHJpeCk7XG4gICAgY29uc3QgZ3JpZFNpemUgPSBbbnVtQ29sLCBudW1Sb3ddO1xuXG4gICAgZ3JpZEFnZ3JlZ2F0aW9uRnJhbWVidWZmZXIuYmluZCgpO1xuICAgIGdsLnZpZXdwb3J0KDAsIDAsIGdyaWRTaXplWzBdLCBncmlkU2l6ZVsxXSk7XG4gICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCk7XG4gICAgZ3JpZEFnZ3JlZ2F0aW9uTW9kZWwuZHJhdyh7XG4gICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgIGNsZWFyQ29sb3I6IFswLCAwLCAwLCAwXSxcbiAgICAgICAgY2xlYXJEZXB0aDogMCxcbiAgICAgICAgYmxlbmQ6IHRydWUsXG4gICAgICAgIGRlcHRoVGVzdDogZmFsc2UsXG4gICAgICAgIGJsZW5kRXF1YXRpb246IEdMLkZVTkNfQURELFxuICAgICAgICBibGVuZEZ1bmM6IFtHTC5PTkUsIEdMLk9ORV1cbiAgICAgIH0sXG4gICAgICBtb2R1bGVTZXR0aW5nczoge1xuICAgICAgICB2aWV3cG9ydFxuICAgICAgfSxcbiAgICAgIHVuaWZvcm1zOiB7XG4gICAgICAgIHdpbmRvd1NpemUsXG4gICAgICAgIGNlbGxTaXplLFxuICAgICAgICBncmlkU2l6ZSxcbiAgICAgICAgdVByb2plY3Rpb25NYXRyaXg6IGdyaWRUcmFuc2Zvcm1NYXRyaXgsXG4gICAgICAgIHVQcm9qZWN0aW9uTWF0cml4RlA2NCxcbiAgICAgICAgcHJvamVjdFBvaW50c1xuICAgICAgfVxuICAgIH0pO1xuICAgIGdyaWRBZ2dyZWdhdGlvbkZyYW1lYnVmZmVyLnVuYmluZCgpO1xuXG4gICAgYWxsQWdncmVncmF0aW9uRnJhbWVidWZmZXIuYmluZCgpO1xuICAgIGdsLnZpZXdwb3J0KDAsIDAsIGdyaWRTaXplWzBdLCBncmlkU2l6ZVsxXSk7XG4gICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCk7XG4gICAgYWxsQWdncmVnYXRpb25Nb2RlbC5kcmF3KHtcbiAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgY2xlYXJDb2xvcjogWzAsIDAsIDAsIDBdLFxuICAgICAgICBjbGVhckRlcHRoOiAwLFxuICAgICAgICBibGVuZDogdHJ1ZSxcbiAgICAgICAgZGVwdGhUZXN0OiBmYWxzZSxcbiAgICAgICAgYmxlbmRFcXVhdGlvbjogW0dMLkZVTkNfQURELCBHTC5NQVhdLFxuICAgICAgICBibGVuZEZ1bmM6IFtHTC5PTkUsIEdMLk9ORV1cbiAgICAgIH0sXG4gICAgICB1bmlmb3Jtczoge1xuICAgICAgICB1U2FtcGxlcjogZ3JpZEFnZ3JlZ2F0aW9uRnJhbWVidWZmZXIudGV4dHVyZSxcbiAgICAgICAgZ3JpZFNpemVcbiAgICAgIH1cbiAgICB9KTtcbiAgICBhbGxBZ2dyZWdyYXRpb25GcmFtZWJ1ZmZlci51bmJpbmQoKTtcbiAgfVxuXG4gIC8qIGVzbGludC1kaXNhYmxlIG1heC1zdGF0ZW1lbnRzICovXG4gIF9ydW5BZ2dyZWdhdGlvbk9uQ1BVKG9wdHMpIHtcbiAgICBjb25zdCBFTEVNRU5UQ09VTlQgPSA0O1xuICAgIGNvbnN0IHtwb3NpdGlvbnMsIHdlaWdodHMsIGNlbGxTaXplLCBwcm9qZWN0UG9pbnRzLCBncmlkVHJhbnNmb3JtTWF0cml4fSA9IG9wdHM7XG4gICAgbGV0IHtjb3VudHNCdWZmZXIsIG1heENvdW50QnVmZmVyfSA9IG9wdHM7XG4gICAgY29uc3Qge251bUNvbCwgbnVtUm93fSA9IHRoaXMuc3RhdGU7XG4gICAgLy8gRWFjaCBlbGVtZW50IGNvbnRhaW5zIDQgZmxvYXRzIHRvIG1hdGNoIHdpdGggR1BVIG91cHV0XG4gICAgY29uc3QgY291bnRzID0gbmV3IEZsb2F0MzJBcnJheShudW1Db2wgKiBudW1Sb3cgKiBFTEVNRU5UQ09VTlQpO1xuXG4gICAgbGV0IHBvcyA9IHBvc2l0aW9ucztcbiAgICBpZiAocHJvamVjdFBvaW50cykge1xuICAgICAgdGhpcy5fcHJvamVjdFBvc2l0aW9ucyhvcHRzKTtcbiAgICAgIHBvcyA9IHRoaXMuc3RhdGUucHJvamVjdGVkUG9zaXRpb25zO1xuICAgIH1cblxuICAgIGNvdW50cy5maWxsKDApO1xuICAgIGxldCBtYXhXZWlnaHQgPSAwO1xuICAgIGxldCB0b3RhbENvdW50ID0gMDtcbiAgICBsZXQgdG90YWxXZWlnaHQgPSAwO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3MubGVuZ3RoOyBpbmRleCArPSAyKSB7XG4gICAgICBjb25zdCBncmlkUG9zID0gd29ybGRUb1BpeGVscyhbcG9zW2luZGV4XSwgcG9zW2luZGV4ICsgMV0sIDBdLCBncmlkVHJhbnNmb3JtTWF0cml4KTtcbiAgICAgIGNvbnN0IHggPSBncmlkUG9zWzBdO1xuICAgICAgY29uc3QgeSA9IGdyaWRQb3NbMV07XG4gICAgICBjb25zdCB3ZWlnaHQgPSB3ZWlnaHRzID8gd2VpZ2h0c1tpbmRleCAvIDJdIDogMTtcbiAgICAgIGFzc2VydChOdW1iZXIuaXNGaW5pdGUod2VpZ2h0KSk7XG4gICAgICBjb25zdCBjb2xJZCA9IE1hdGguZmxvb3IoeCAvIGNlbGxTaXplWzBdKTtcbiAgICAgIGNvbnN0IHJvd0lkID0gTWF0aC5mbG9vcih5IC8gY2VsbFNpemVbMV0pO1xuICAgICAgaWYgKGNvbElkID49IDAgJiYgY29sSWQgPCBudW1Db2wgJiYgcm93SWQgPj0gMCAmJiByb3dJZCA8IG51bVJvdykge1xuICAgICAgICBjb25zdCBpID0gKGNvbElkICsgcm93SWQgKiBudW1Db2wpICogRUxFTUVOVENPVU5UO1xuICAgICAgICBjb3VudHNbaV0rKztcbiAgICAgICAgY291bnRzW2kgKyAxXSArPSB3ZWlnaHQ7XG4gICAgICAgIHRvdGFsQ291bnQgKz0gMTtcbiAgICAgICAgdG90YWxXZWlnaHQgKz0gd2VpZ2h0O1xuICAgICAgICBpZiAoY291bnRzW2kgKyAxXSA+IG1heFdlaWdodCkge1xuICAgICAgICAgIG1heFdlaWdodCA9IGNvdW50c1tpICsgMV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgbWF4Q291bnRCdWZmZXJEYXRhID0gbmV3IEZsb2F0MzJBcnJheShFTEVNRU5UQ09VTlQpO1xuICAgIC8vIFN0b3JlIHRvdGFsIGNvdW50IHZhbHVlIGluIFJlZC9YIGNoYW5uZWxcbiAgICBtYXhDb3VudEJ1ZmZlckRhdGFbMF0gPSB0b3RhbENvdW50O1xuICAgIC8vIFN0b3JlIHRvdGFsIHdlaWdodCB2YWx1ZSBpbiBHcmVlbi9ZIGNoYW5uZWxcbiAgICBtYXhDb3VudEJ1ZmZlckRhdGFbMV0gPSB0b3RhbFdlaWdodDtcbiAgICAvLyBTdG9yZSBtYXggd2VpZ2h0IHZhbHVlIGluIGFscGhhL1cgY2hhbm5lbC5cbiAgICBtYXhDb3VudEJ1ZmZlckRhdGFbM10gPSBtYXhXZWlnaHQ7XG5cbiAgICAvLyBMb2FkIGRhdGEgdG8gV2ViR0wgYnVmZmVyLlxuICAgIGlmIChjb3VudHNCdWZmZXIpIHtcbiAgICAgIGNvdW50c0J1ZmZlci5zdWJEYXRhKHtkYXRhOiBjb3VudHN9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY291bnRzQnVmZmVyID0gbmV3IEJ1ZmZlcih0aGlzLmdsLCB7ZGF0YTogY291bnRzfSk7XG4gICAgfVxuICAgIGlmIChtYXhDb3VudEJ1ZmZlcikge1xuICAgICAgbWF4Q291bnRCdWZmZXIuc3ViRGF0YSh7ZGF0YTogbWF4Q291bnRCdWZmZXJEYXRhfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1heENvdW50QnVmZmVyID0gbmV3IEJ1ZmZlcih0aGlzLmdsLCB7ZGF0YTogbWF4Q291bnRCdWZmZXJEYXRhfSk7XG4gICAgfVxuICAgIHJldHVybiB7Y291bnRzQnVmZmVyLCBtYXhDb3VudEJ1ZmZlcn07XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuXG4gIF9ydW5BZ2dyZWdhdGlvbk9uR1BVKG9wdHMpIHtcbiAgICB0aGlzLl91cGRhdGVNb2RlbHMob3B0cyk7XG4gICAgdGhpcy5fcmVuZGVyQWdncmVnYXRlRGF0YShvcHRzKTtcbiAgICByZXR1cm4gdGhpcy5fZ2V0QWdncmVnYXRlRGF0YShvcHRzKTtcbiAgfVxuXG4gIC8vIFVwZGF0ZSBwcml2ZWF0ZSBzdGF0ZVxuICBfc2V0U3RhdGUodXBkYXRlT2JqZWN0KSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLCB1cGRhdGVPYmplY3QpO1xuICB9XG5cbiAgX3NldHVwR1BVUmVzb3VyY2VzKCkge1xuICAgIGNvbnN0IHtnbH0gPSB0aGlzO1xuXG4gICAgdGhpcy5ncmlkQWdncmVnYXRpb25GcmFtZWJ1ZmZlciA9IHNldHVwRnJhbWVidWZmZXIoZ2wsIHtpZDogJ0dyaWRBZ2dyZWdhdGlvbid9KTtcbiAgICB0aGlzLmFsbEFnZ3JlZ3JhdGlvbkZyYW1lYnVmZmVyID0gc2V0dXBGcmFtZWJ1ZmZlcihnbCwge2lkOiAnQWxsQWdncmVnYXRpb24nfSk7XG4gIH1cblxuICBfc2V0dXBNb2RlbHMoZnA2NCA9IGZhbHNlKSB7XG4gICAgaWYgKHRoaXMuZ3JpZEFnZ3JlZ2F0aW9uTW9kZWwpIHtcbiAgICAgIHRoaXMuZ3JpZEFnZ3JlZ2F0aW9uTW9kZWwuZGVsZXRlKCk7XG4gICAgfVxuICAgIHRoaXMuZ3JpZEFnZ3JlZ2F0aW9uTW9kZWwgPSB0aGlzLl9nZXRBZ2dyZWdhdGlvbk1vZGVsKGZwNjQpO1xuICAgIGlmICh0aGlzLmFsbEFnZ3JlZ2F0aW9uTW9kZWwpIHtcbiAgICAgIHRoaXMuYWxsQWdncmVnYXRpb25Nb2RlbC5kZWxldGUoKTtcbiAgICB9XG4gICAgdGhpcy5hbGxBZ2dyZWdhdGlvbk1vZGVsID0gdGhpcy5fZ2V0QWxsQWdncmVnYXRpb25Nb2RlbChmcDY0KTtcbiAgfVxuXG4gIC8qIGVzbGludC1kaXNhYmxlIG1heC1zdGF0ZW1lbnRzICovXG4gIF91cGRhdGVNb2RlbHMob3B0cykge1xuICAgIGNvbnN0IHtnbH0gPSB0aGlzO1xuICAgIGNvbnN0IHtwb3NpdGlvbnMsIHBvc2l0aW9uczY0eHlMb3csIHdlaWdodHMsIGNoYW5nZUZsYWdzfSA9IG9wdHM7XG4gICAgY29uc3Qge251bUNvbCwgbnVtUm93fSA9IHRoaXMuc3RhdGU7XG5cbiAgICBsZXQge3Bvc2l0aW9uc0J1ZmZlciwgcG9zaXRpb25zNjR4eUxvd0J1ZmZlciwgd2VpZ2h0c0J1ZmZlcn0gPSB0aGlzLnN0YXRlO1xuXG4gICAgY29uc3QgYWdncmVnYXRpb25Nb2RlbEF0dHJpYnV0ZXMgPSB7fTtcblxuICAgIGxldCBjcmVhdGVQb3M2NHh5TG93ID0gZmFsc2U7XG4gICAgaWYgKG9wdHMuZnA2NCAhPT0gdGhpcy5zdGF0ZS5mcDY0KSB7XG4gICAgICB0aGlzLl9zZXR1cE1vZGVscyhvcHRzLmZwNjQpO1xuICAgICAgdGhpcy5fc2V0U3RhdGUoe2ZwNjQ6IG9wdHMuZnA2NH0pO1xuICAgICAgaWYgKG9wdHMuZnA2NCkge1xuICAgICAgICBjcmVhdGVQb3M2NHh5TG93ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlRmxhZ3MuZGF0YUNoYW5nZWQgfHwgIXBvc2l0aW9uc0J1ZmZlcikge1xuICAgICAgaWYgKHBvc2l0aW9uc0J1ZmZlcikge1xuICAgICAgICBwb3NpdGlvbnNCdWZmZXIuZGVsZXRlKCk7XG4gICAgICB9XG4gICAgICBpZiAod2VpZ2h0c0J1ZmZlcikge1xuICAgICAgICB3ZWlnaHRzQnVmZmVyLmRlbGV0ZSgpO1xuICAgICAgfVxuICAgICAgcG9zaXRpb25zQnVmZmVyID0gbmV3IEJ1ZmZlcihnbCwge3NpemU6IDIsIGRhdGE6IG5ldyBGbG9hdDMyQXJyYXkocG9zaXRpb25zKX0pO1xuICAgICAgd2VpZ2h0c0J1ZmZlciA9IG5ldyBCdWZmZXIoZ2wsIHtzaXplOiAxLCBkYXRhOiBuZXcgRmxvYXQzMkFycmF5KHdlaWdodHMpfSk7XG4gICAgICBjcmVhdGVQb3M2NHh5TG93ID0gb3B0cy5mcDY0O1xuICAgICAgT2JqZWN0LmFzc2lnbihhZ2dyZWdhdGlvbk1vZGVsQXR0cmlidXRlcywge1xuICAgICAgICBwb3NpdGlvbnM6IHBvc2l0aW9uc0J1ZmZlcixcbiAgICAgICAgd2VpZ2h0czogd2VpZ2h0c0J1ZmZlclxuICAgICAgfSk7XG4gICAgICB0aGlzLmdyaWRBZ2dyZWdhdGlvbk1vZGVsLnNldFZlcnRleENvdW50KHBvc2l0aW9ucy5sZW5ndGggLyAyKTtcbiAgICAgIHRoaXMuX3NldFN0YXRlKHtwb3NpdGlvbnNCdWZmZXIsIHdlaWdodHNCdWZmZXJ9KTtcbiAgICB9XG5cbiAgICBpZiAoY3JlYXRlUG9zNjR4eUxvdykge1xuICAgICAgYXNzZXJ0KHBvc2l0aW9uczY0eHlMb3cpO1xuICAgICAgaWYgKHBvc2l0aW9uczY0eHlMb3dCdWZmZXIpIHtcbiAgICAgICAgcG9zaXRpb25zNjR4eUxvd0J1ZmZlci5kZWxldGUoKTtcbiAgICAgIH1cbiAgICAgIHBvc2l0aW9uczY0eHlMb3dCdWZmZXIgPSBuZXcgQnVmZmVyKGdsLCB7c2l6ZTogMiwgZGF0YTogbmV3IEZsb2F0MzJBcnJheShwb3NpdGlvbnM2NHh5TG93KX0pO1xuICAgICAgT2JqZWN0LmFzc2lnbihhZ2dyZWdhdGlvbk1vZGVsQXR0cmlidXRlcywge1xuICAgICAgICBwb3NpdGlvbnM2NHh5TG93OiBwb3NpdGlvbnM2NHh5TG93QnVmZmVyXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3NldFN0YXRlKHtwb3NpdGlvbnM2NHh5TG93QnVmZmVyfSk7XG4gICAgfVxuXG4gICAgdGhpcy5ncmlkQWdncmVnYXRpb25Nb2RlbC5zZXRBdHRyaWJ1dGVzKGFnZ3JlZ2F0aW9uTW9kZWxBdHRyaWJ1dGVzKTtcblxuICAgIGlmIChjaGFuZ2VGbGFncy5jZWxsU2l6ZUNoYW5nZWQgfHwgY2hhbmdlRmxhZ3Mudmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICB0aGlzLmFsbEFnZ3JlZ2F0aW9uTW9kZWwuc2V0SW5zdGFuY2VDb3VudChudW1Db2wgKiBudW1Sb3cpO1xuXG4gICAgICBjb25zdCBmcmFtZWJ1ZmZlclNpemUgPSB7d2lkdGg6IG51bUNvbCwgaGVpZ2h0OiBudW1Sb3d9O1xuICAgICAgdGhpcy5ncmlkQWdncmVnYXRpb25GcmFtZWJ1ZmZlci5yZXNpemUoZnJhbWVidWZmZXJTaXplKTtcbiAgICAgIHRoaXMuYWxsQWdncmVncmF0aW9uRnJhbWVidWZmZXIucmVzaXplKGZyYW1lYnVmZmVyU2l6ZSk7XG4gICAgfVxuICB9XG4gIC8qIGVzbGludC1lbmFibGUgbWF4LXN0YXRlbWVudHMgKi9cblxuICBfdXBkYXRlR3JpZFNpemUob3B0cykge1xuICAgIGNvbnN0IHt2aWV3cG9ydCwgY2VsbFNpemV9ID0gb3B0cztcbiAgICBjb25zdCB3aWR0aCA9IG9wdHMud2lkdGggfHwgdmlld3BvcnQud2lkdGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gb3B0cy5oZWlnaHQgfHwgdmlld3BvcnQuaGVpZ2h0O1xuICAgIGNvbnN0IG51bUNvbCA9IE1hdGguY2VpbCh3aWR0aCAvIGNlbGxTaXplWzBdKTtcbiAgICBjb25zdCBudW1Sb3cgPSBNYXRoLmNlaWwoaGVpZ2h0IC8gY2VsbFNpemVbMV0pO1xuICAgIHRoaXMuX3NldFN0YXRlKHtudW1Db2wsIG51bVJvdywgd2luZG93U2l6ZTogW3dpZHRoLCBoZWlnaHRdfSk7XG4gIH1cbn1cblxuLy8gSGVscGVyIG1ldGhvZHMuXG5cbmZ1bmN0aW9uIHNldHVwRnJhbWVidWZmZXIoZ2wsIG9wdHMpIHtcbiAgY29uc3Qge2lkfSA9IG9wdHM7XG4gIGNvbnN0IHRleHR1cmUgPSBuZXcgVGV4dHVyZTJEKGdsLCB7XG4gICAgZGF0YTogbnVsbCxcbiAgICBmb3JtYXQ6IEdMLlJHQkEzMkYsXG4gICAgdHlwZTogR0wuRkxPQVQsXG4gICAgYm9yZGVyOiAwLFxuICAgIG1pcG1hcHM6IGZhbHNlLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIFtHTC5URVhUVVJFX01BR19GSUxURVJdOiBHTC5ORUFSRVNULFxuICAgICAgW0dMLlRFWFRVUkVfTUlOX0ZJTFRFUl06IEdMLk5FQVJFU1RcbiAgICB9LFxuICAgIGRhdGFGb3JtYXQ6IEdMLlJHQkFcbiAgfSk7XG5cbiAgY29uc3QgZmIgPSBuZXcgRnJhbWVidWZmZXIoZ2wsIHtcbiAgICBpZCxcbiAgICBhdHRhY2htZW50czoge1xuICAgICAgW0dMLkNPTE9SX0FUVEFDSE1FTlQwXTogdGV4dHVyZVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGZiO1xufVxuIl19
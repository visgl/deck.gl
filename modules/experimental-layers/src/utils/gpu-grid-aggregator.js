import {Buffer, Model, GL, Framebuffer, Texture2D, FEATURES, hasFeatures, isWebGL2} from 'luma.gl';
import {log} from '@deck.gl/core';
import assert from 'assert';
const AGGREGATE_TO_GRID_VS = `\
attribute vec2 positions;
attribute float weights;
uniform vec2 windowSize;
uniform vec2 cellSize;
uniform vec2 gridSize;
uniform mat4 uProjectionMatrix;

varying float vWeights;

vec2 project_to_pixel(vec2 pixels) {
  vec4 pixPosition = vec4(pixels, 0., 1.);
  vec4 result =  uProjectionMatrix * pixPosition;
  return result.xy/result.w;
}

void main(void) {

  vWeights = weights;
  vec2 windowPos = project_position(positions);
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

const AGGREGATE_TO_GRID_FS = `\
precision highp float;

varying float vWeights;

void main(void) {
  gl_FragColor = vec4(1., vWeights, 0, 0.0);
}
`;

const AGGREGATE_ALL_VS = `\
attribute vec2 positions;
attribute vec2 texCoords;

uniform vec2 gridSize;

varying vec2 vTextureCoord;
void main(void) {
  // Map each position to single pixel
  vec2 pos = vec2(-1.0, -1.0);

  // Move to pixel center, pixel-size in screen sapce (2/gridSize) * 0.5 => 1/gridSize
  vec2 offset = 1.0 / gridSize;
  pos = pos + offset;

  gl_Position = vec4(pos, 0.0, 1.0);

  vTextureCoord = texCoords;
}
`;

const AGGREGATE_ALL_FS = `\
precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {
  vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  // Red: total count, Green: total weight, Alpha: maximum wieght
  gl_FragColor = vec4(textureColor.r, textureColor.g, 0., textureColor.g);
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
      this._setupModels();
    }
  }

  // Perform aggregation and retun the results
  run({
    positions,
    weights,
    changeFlags = DEFAULT_CHANGE_FLAGS,
    cellSize,
    viewport,
    countsBuffer = null,
    maxCountBuffer = null,
    width,
    height,
    useGPU = true
  } = {}) {
    if (this.state.useGPU !== useGPU) {
      changeFlags = DEFAULT_CHANGE_FLAGS;
    }
    this._setState({useGPU});
    const aggregationParams = {
      positions,
      weights,
      changeFlags,
      cellSize,
      viewport,
      countsBuffer,
      maxCountBuffer
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
    return {countsBuffer, maxCountBuffer};
  }

  _projectPositions(opts) {
    let {projectedPositions} = this.state;
    if (!projectedPositions || opts.changeFlags.dataChanged || opts.changeFlags.viewportChanged) {
      const {positions, viewport} = opts;
      projectedPositions = [];
      for (let index = 0; index < positions.length; index += 2) {
        const [x, y] = viewport.project([positions[index], positions[index + 1]]);
        projectedPositions.push({x, y});
      }
      this._setState({projectedPositions});
    }
  }

  /* eslint-disable max-statements */
  _runAggregationOnCPU(opts) {
    const ELEMENTCOUNT = 4;
    const {weights, cellSize} = opts;
    let {countsBuffer, maxCountBuffer} = opts;
    const {numCol, numRow} = this.state;
    // Each element contains 4 floats to match with GPU ouput
    const counts = new Float32Array(numCol * numRow * ELEMENTCOUNT);

    this._projectPositions(opts);

    counts.fill(0);
    let maxWeight = 0;
    let totalCount = 0;
    let totalWeight = 0;
    const {projectedPositions} = this.state;
    for (let index = 0; index < projectedPositions.length; index++) {
      const {x, y} = projectedPositions[index];
      const weight = weights ? weights[index] : 1;
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

  _runAggregationOnGPU(opts) {
    this._updateModels(opts);
    this._runGridAggregation(opts);
    return this._getAggregateData(opts);
  }

  // Update priveate state
  _setState(updateObject) {
    Object.assign(this.state, updateObject);
  }

  /* eslint-enable max-statements */
  _setupModels() {
    const {gl, shaderCache} = this;

    this.gridAggregationModel = new Model(gl, {
      id: 'Gird-Aggregation-Model',
      vs: AGGREGATE_TO_GRID_VS,
      fs: AGGREGATE_TO_GRID_FS,
      shaderCache,
      vertexCount: 0,
      drawMode: GL.POINTS
    });
    this.allAggregationModel = new Model(gl, {
      id: 'All-Aggregation-Model',
      vs: AGGREGATE_ALL_VS,
      fs: AGGREGATE_ALL_FS,
      shaderCache,
      vertexCount: 0,
      drawMode: GL.POINTS
    });

    this.gridAggregationFramebuffer = setupFramebuffer(gl, {id: 'GridAggregation'});
    this.allAggregrationFramebuffer = setupFramebuffer(gl, {id: 'AllAggregation'});
  }

  /* eslint-disable max-statements */
  _updateModels(opts) {
    const {gl} = this;
    const {positions, weights, changeFlags} = opts;
    const {numCol, numRow} = this.state;

    let {positionsBuffer, weightsBuffer, gridPixelBuffer, gridTexCoordsBuffer} = this.state;

    if (changeFlags.dataChanged || !positionsBuffer) {
      // TODO: add support for weights
      if (positionsBuffer) {
        positionsBuffer.delete();
      }
      if (weightsBuffer) {
        weightsBuffer.delete();
      }
      positionsBuffer = new Buffer(gl, {size: 2, data: new Float32Array(positions)});
      weightsBuffer = new Buffer(gl, {size: 1, data: new Float32Array(weights)});
      this.gridAggregationModel.setAttributes({
        positions: positionsBuffer,
        weights: weightsBuffer
      });
      this.gridAggregationModel.setVertexCount(positions.length / 2);
      this._setState({positionsBuffer, weightsBuffer});
    }

    if (changeFlags.cellSizeChanged || !gridPixelBuffer) {
      if (gridPixelBuffer) {
        gridPixelBuffer.delete();
      }
      if (gridTexCoordsBuffer) {
        gridTexCoordsBuffer.delete();
      }
      const gridPixels = new Float32Array(numCol * numRow * 2);
      const gridTexCoords = new Float32Array(getTexCoordPerPixel([numCol, numRow]));
      gridPixelBuffer = new Buffer(gl, {
        size: 2,
        data: gridPixels
      });
      gridTexCoordsBuffer = new Buffer(gl, {
        size: 2,
        data: gridTexCoords
      });

      this.allAggregationModel.setAttributes({
        positions: gridPixelBuffer,
        texCoords: gridTexCoordsBuffer
      });
      this.allAggregationModel.setVertexCount(gridPixels.length / 2);

      const framebufferSize = {width: numCol, height: numRow};
      this.gridAggregationFramebuffer.resize(framebufferSize);
      this.allAggregrationFramebuffer.resize(framebufferSize);
      this._setState({gridPixelBuffer, gridTexCoordsBuffer});
    }
  }
  /* eslint-enable max-statements */

  _runGridAggregation(opts) {
    const {cellSize, viewport} = opts;
    const {numCol, numRow, windowSize} = this.state;
    const {
      gl,
      gridAggregationFramebuffer,
      gridAggregationModel,
      allAggregrationFramebuffer,
      allAggregationModel
    } = this;

    const {pixelProjectionMatrix} = viewport;
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
        uProjectionMatrix: pixelProjectionMatrix
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

// Generates (s, t) tex coordinates for each point in the rect
// s, t are in [0, 1] range
function getTexCoordPerPixel(rectSize) {
  assert(Number.isFinite(rectSize[0]) && Number.isFinite(rectSize[1]));
  const points = [];
  for (let i = 0; i < rectSize[0]; i++) {
    for (let j = 0; j < rectSize[1]; j++) {
      const s = i / rectSize[0];
      const t = j / rectSize[1];
      points.push(s);
      points.push(t);
    }
  }
  return points;
}

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

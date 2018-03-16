import {Buffer, Model, GL, Framebuffer, Texture2D, FEATURES, hasFeatures} from 'luma.gl';
import log from '../../utils/log';
import assert from 'assert';

const LOG_LEVEL = 0;

const AGGREGATE_TO_GRID_VS = `\
attribute vec2 positions;
uniform vec2 windowSize;
uniform vec2 cellSize;
uniform vec2 gridSize;
void main(void) {

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
#ifdef GL_ES
precision highp float;
#endif

void main(void) {
  gl_FragColor = vec4(1., 0, 0, 1.0);
}
`;

const AGGREGATE_ALL_VS = `\
attribute vec2 positions;
attribute vec2 texCoords;
varying vec2 vTextureCoord;
void main(void) {
  // Map each position to single pixel
   gl_Position = vec4(-1.0, -1.0, 0.0, 1.0);

  vTextureCoord = texCoords;
}
`;

const AGGREGATE_ALL_FS = `\
#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {
  vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  gl_FragColor = vec4(textureColor.r, 0., 0., textureColor.r);
}
`;

export default class ScreenGridAggregator {
  static hasGPUSupport(gl) {
    return hasFeatures(
      gl,
      FEATURES.BLEND_EQUATION_MINMAX,
      FEATURES.COLOR_ATTACHMENT_RGBA32F,
      FEATURES.TEXTURE_FILTER_LINEAR_FLOAT
    );
  }

  constructor(gl, opts = {}) {
    this.id = opts.id || 'screen-grid-aggregator';
    this.shaderCache = opts.shaderCache || null;
    this.gl = gl;
    this._hasGPUSupport = hasFeatures(
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
  run(opts) {
    if (this._hasGPUSupport && opts.useGPU) {
      return this._runAggregationOnGPU(opts);
    }
    if (opts.useGPU) {
      log.warn('ScreenGridAggregator: WebGL2 not supported, falling back to CPU');
    }
    return this._runAggregationOnCPU(opts);
  }

  // PRIVATE

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

  _runAggregationOnGPU(opts) {
    this._updateModels(opts);
    this._runGridAggregation(opts);
    return this._getAggregateData(opts);
  }

  _runAggregationOnCPU(opts) {
    if (LOG_LEVEL > 0) {
      console.log(`Aggregator: _runAggregationOnCPU`);
    }

    const {positions, weights, viewport, cellSize, gridSize} = opts;
    const cellSizePixels = cellSize;
    const [numCol, numRow] = gridSize;
    const counts = new Array(numCol * numRow);

    counts.fill(0);
    let maxCount = 0;
    let totalCount = 0;
    for (let index = 0; index < weights.length; index++) {
      const [x, y] = viewport.project([positions[index * 2], positions[index * 2 + 1]]);
      const weight = weights ? weights[index] : 1;
      assert(Number.isFinite(weight));
      const colId = Math.floor(x / cellSizePixels[0]);
      const rowId = Math.floor(y / cellSizePixels[1]);
      if (colId >= 0 && colId < numCol && rowId >= 0 && rowId < numRow) {
        const i = colId + rowId * numCol;
        counts[i] += weight;
        totalCount += weight;
        if (counts[i] > maxCount) {
          maxCount = counts[i];
        }
      }
    }

    return {counts, totalCount, maxCount};
  }

  _updateModels(opts) {
    const {gl} = this;
    const {positions, gridSize} = opts;

    const gridPixels = new Float32Array(gridSize[0] * gridSize[1] * 2);
    const gridTexCoords = new Float32Array(getTexCoordPerPixel(gridSize));
    const gridPixelBuffer = new Buffer(gl, {
      size: 2,
      data: gridPixels
    });
    const gridTexCoordsBuffer = new Buffer(gl, {
      size: 2,
      data: gridTexCoords
    });

    if (opts.changeFlags.dataChanged || !this.positionsBuffer) {
      // TODO: add support for weights
      if (this.positionsBuffer) {
        this.positionsBuffer.delete();
      }
      this.positionsBuffer = new Buffer(gl, {size: 2, data: new Float32Array(positions)});
      this.gridAggregationModel.setAttributes({
        positions: this.positionsBuffer
      });
      this.gridAggregationModel.setVertexCount(positions.length / 2);
    }

    this.allAggregationModel.setAttributes({
      positions: gridPixelBuffer,
      texCoords: gridTexCoordsBuffer
    });
    this.allAggregationModel.setVertexCount(gridPixels.length / 2);

    const framebufferSize = {width: gridSize[0], height: gridSize[1]};
    this.gridAggregationFramebuffer.resize(framebufferSize);
    this.allAggregrationFramebuffer.resize(framebufferSize);
  }

  _runGridAggregation(opts) {
    if (LOG_LEVEL > 0) {
      console.log(`Aggregator: _runAggregationOnGPU`);
    }
    const {gridSize, windowSize, cellSize, viewport} = opts;
    const {
      gl,
      gridAggregationFramebuffer,
      gridAggregationModel,
      allAggregrationFramebuffer,
      allAggregationModel
    } = this;

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
        gridSize
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
        blendFunc: [GL.ONE, GL.ONE],
        viewport: [0, 0, 1, 1]
      },
      uniforms: {
        uSampler: gridAggregationFramebuffer.texture
      }
    });
    allAggregrationFramebuffer.unbind();
  }

  _getAggregateData(opts) {
    const {gridSize, readData} = opts;

    if (!readData) {
      return {
        uSamplerCount: this.gridAggregationFramebuffer.texture,
        uSamplerMaxCount: this.allAggregrationFramebuffer.texture
      };
    }
    if (LOG_LEVEL > 0) {
      console.log(`Aggregator: readPixels on FB`);
    }

    const pixels = this.gridAggregationFramebuffer.readPixels({
      width: gridSize[0],
      height: gridSize[1],
      format: GL.RGBA,
      type: GL.FLOAT
    });
    const totalMaxCounts = this.allAggregrationFramebuffer.readPixels({
      width: 1,
      height: 1,
      format: GL.RGBA,
      type: GL.FLOAT
    });

    // TODO: use R32F & GL.RED for 'gridAggregationFramebuffer' texture to avoid this conversion.
    // It needs some addtional support from luma.gl : https://github.com/uber/luma.gl/issues/429
    const counts = [];
    for (let index = 0; index < pixels.length; index += 4) {
      counts.push(pixels[index]);
    }
    return {
      counts,
      totalCount: totalMaxCounts[0],
      maxCount: totalMaxCounts[3]
    };
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

// View and Projection Matrix calculations for mapbox-js style
// map view properties
//
// ATTRIBUTION:
// Projection matrix creation are intentionally kept compatible with
// mapbox-gl's implementation to ensure that seamless interoperation
// with mapbox and react-map-gl.
// See: transform.js in https://github.com/mapbox/mapbox-gl-js
import {COORDINATE_SYSTEM} from 'viewport-mercator-project';
import autobind from 'autobind-decorator';
import {mat4, vec4} from 'gl-matrix';
import assert from 'assert';

function fp64ify(a) {
  const hiPart = Math.fround(a);
  const loPart = a - Math.fround(a);
  return [hiPart, loPart];
}

export default class WebGLViewport {

  constructor({viewport}) {
    this.viewport = viewport;

    // calculateWebGLMatrices
    const {viewProjectionMatrix} = this.viewport;
    assert(viewProjectionMatrix, 'Viewport props missing');

    this.glProjectionMatrix = new Float32Array(viewProjectionMatrix);

    // dy64ifyProjectionMatrix
    this.glProjectionMatrixFP64 = new Float32Array(32);
    // Transpose the projection matrix to column major for GLSL.
    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        [
          this.glProjectionMatrixFP64[(i * 4 + j) * 2],
          this.glProjectionMatrixFP64[(i * 4 + j) * 2 + 1]
        ] = fp64ify(viewProjectionMatrix[j * 4 + i]);
      }
    }
  }

  /**
   * Returns a projection matrix suitable for shaders
   * @return {Float32Array} - 4x4 projection matrix that can be used in shaders
   */
  @autobind
  getProjectionMatrix() {
    return this.glProjectionMatrix;
  }

  @autobind
  getProjectionMatrixFP64() {
    return this.glProjectionMatrixFP64;
  }

  @autobind
  getProjectionMatrixUncentered() {
    return this.glProjectionMatrixUncentered;
  }

  getWebGLMatrices() {
    return {
      projectionMatrix: this.glProjectionMatrix,
      projectionFP64: this.glProjectionMatrixFP64
    };
  }

  getUniforms({
    modelMatrix = null,
    projectionMode = COORDINATE_SYSTEM.LNGLAT,
    positionOrigin = [0, 0]
  } = {}) {
    // TODO: move the following line to initialization so that it's done only once
    const positionOriginPixels = this.viewport.projectFlat(positionOrigin);

    const projectedPositionOrigin =
      [positionOriginPixels[0], positionOriginPixels[1], 0.0, 1.0];

    const projections = this.viewport.getMatrices();

    const {viewProjectionMatrix} = projections;
    assert(viewProjectionMatrix, 'Viewport props missing');

    const projectionCenter =
      vec4.transformMat4([], projectedPositionOrigin, viewProjectionMatrix);

    // If necessary add modelMatrix to clipSpace projection
    if (modelMatrix) {
      mat4.multiply(viewProjectionMatrix, viewProjectionMatrix, modelMatrix);
    }

    const {zoom, scale, center, pixelsPerMeter} = this.viewport;
    assert(Number.isFinie(zoom) && scale && center && pixelsPerMeter, 'Viewport props missing');

    return {
      // Projection mode values
      projectionMode,
      projectionCenter,

      // Main projection matrices
      projectionMatrix: this.glProjectionMatrix,
      projectionFP64: this.glProjectionMatrixFP64,
      projectionPixelsPerUnit: pixelsPerMeter,
      projectionScale: scale,
      projectionScaleFP64: fp64ify(scale),

      // TODO - deprecated, remove
      mercatorScale: Math.pow(2, zoom),
      mercatorCenter: center
      // projectionMatrixCentered: this.glProjectionMatrix,
      // projectionMatrixUncentered: this.glProjectionMatrixUncentered
      // _ONE uniform is hack: make tan_fp64() callable in existing 32bit layers
    };
  }
}

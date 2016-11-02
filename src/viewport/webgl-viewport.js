// View and Projection Matrix calculations for mapbox-js style
// map view properties
//
// ATTRIBUTION:
// Projection matrix creation are intentionally kept compatible with
// mapbox-gl's implementation to ensure that seamless interoperation
// with mapbox and react-map-gl.
// See: transform.js in https://github.com/mapbox/mapbox-gl-js

import Viewport, {COORDINATE_SYSTEM} from './viewport';
import autobind from 'autobind-decorator';
import {mat4, vec2} from 'gl-matrix';

function fp64ify(a) {
  const hiPart = Math.fround(a);
  const loPart = a - Math.fround(a);
  return [hiPart, loPart];
}

export default class WebGLViewport extends Viewport {

  constructor(options) {
    super(options);
    this._calculateWebGLMatrices();
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

  @autobind
  getUniforms({
    projectionMode = COORDINATE_SYSTEM.LNGLAT,
    projectionCenter = [0, 0],
    modelMatrix = null
  } = {}) {
    projectionCenter = vec2.subtract([],
      this.projectFlat(projectionCenter),
      this.center
    );

    const projections = this.getProjections();

    const projectionMatrix = projections._viewProjectionMatrix;
    // If necessary add modelMatrix to clipSpace projection
    if (modelMatrix) {
      mat4.multiply(projectionMatrix, projectionMatrix, modelMatrix);
    }

    // this._dy64ifyProjectionMatrix();

    // TODO - clean up, not all of these are used
    // _ONE uniform is a hack to make tan_fp64() callable in existing 32-bit layers
    return {
      projectionMode,
      projectionMatrix: this.glProjectionMatrix,
      projectionFP64: this.glProjectionMatrixFP64,
      projectionScale: this.scale,
      projectionScaleFP64: fp64ify(this.scale),
      projectionCenter,
      projectionPixelsPerUnit: this.pixelsPerMeter
      // projectionMatrixCentered: this.glProjectionMatrix,
      // projectionMatrixUncentered: this.glProjectionMatrixUncentered
    };
  }

  _calculateWebGLMatrices() {
    this.glProjectionMatrix =
      new Float32Array(this.viewProjectionMatrix);
    this.glProjectionMatrixFP64 = new Float32Array(32);
    this._dy64ifyProjectionMatrix();
  }

  _dy64ifyProjectionMatrix() {
    // Transpose the projection matrix to column major for GLSL.
    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        [
          this.glProjectionMatrixFP64[(i * 4 + j) * 2],
          this.glProjectionMatrixFP64[(i * 4 + j) * 2 + 1]
        ] = fp64ify(this.viewProjectionMatrix[j * 4 + i]);
      }
    }
  }
}

// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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

/* global window */
import mat4_multiply from 'gl-mat4/multiply';
import vec4_transformMat4 from 'gl-vec4/transformMat4';

import log from '../../utils/log';
import assert from 'assert';
import { COORDINATE_SYSTEM } from '../../lib/constants';

import { projectFlat } from 'viewport-mercator-project';

// To quickly set a vector to zero
var ZERO_VECTOR = [0, 0, 0, 0];
// 4x4 matrix that drops 4th component of vector
var VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
var IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

// TODO - import these utils from fp64 package
function fp64ify(a) {
  var array = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var startIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var hiPart = Math.fround(a);
  var loPart = a - hiPart;
  array[startIndex] = hiPart;
  array[startIndex + 1] = loPart;
  return array;
}

// calculate WebGL 64 bit matrix (transposed "Float64Array")
function fp64ifyMatrix4(matrix) {
  // Transpose the projection matrix to column major for GLSL.
  var matrixFP64 = new Float32Array(32);
  for (var i = 0; i < 4; ++i) {
    for (var j = 0; j < 4; ++j) {
      var index = i * 4 + j;
      fp64ify(matrix[j * 4 + i], matrixFP64, index * 2);
    }
  }
  return matrixFP64;
}

// Calculate transformed projectionCenter (using 64 bit precision JS)
// This is the key to offset mode precision
// (avoids doing this addition in 32 bit precision in GLSL)
function calculateProjectionCenter(_ref) {
  var coordinateOrigin = _ref.coordinateOrigin,
      coordinateZoom = _ref.coordinateZoom,
      viewProjectionMatrix = _ref.viewProjectionMatrix;

  var positionPixels = projectFlat(coordinateOrigin, Math.pow(2, coordinateZoom));
  // projectionCenter = new Matrix4(viewProjectionMatrix)
  //   .transformVector([positionPixels[0], positionPixels[1], 0.0, 1.0]);
  return vec4_transformMat4([], [positionPixels[0], positionPixels[1], 0.0, 1.0], viewProjectionMatrix);
}

// The code that utilizes Matrix4 does the same calculation as their mat4 counterparts,
// has lower performance but provides error checking.
// Uncomment when debugging
function calculateMatrixAndOffset(_ref2) {
  var viewport = _ref2.viewport,
      modelMatrix = _ref2.modelMatrix,
      coordinateSystem = _ref2.coordinateSystem,
      coordinateOrigin = _ref2.coordinateOrigin,
      coordinateZoom = _ref2.coordinateZoom;
  var viewMatrixUncentered = viewport.viewMatrixUncentered;
  var viewMatrix = viewport.viewMatrix;
  var projectionMatrix = viewport.projectionMatrix;
  var viewProjectionMatrix = viewport.viewProjectionMatrix;


  var projectionCenter = void 0;

  switch (coordinateSystem) {

    case COORDINATE_SYSTEM.IDENTITY:
    case COORDINATE_SYSTEM.LNGLAT:
      projectionCenter = ZERO_VECTOR;
      break;

    // TODO: make lighitng work for meter offset mode
    case COORDINATE_SYSTEM.METER_OFFSETS:
      projectionCenter = calculateProjectionCenter({
        coordinateOrigin: coordinateOrigin, coordinateZoom: coordinateZoom, viewProjectionMatrix: viewProjectionMatrix
      });

      // Always apply uncentered projection matrix if available (shader adds center)
      viewMatrix = viewMatrixUncentered || viewMatrix;

      // Zero out 4th coordinate ("after" model matrix) - avoids further translations
      // viewMatrix = new Matrix4(viewMatrixUncentered || viewMatrix)
      //   .multiplyRight(VECTOR_TO_POINT_MATRIX);
      viewProjectionMatrix = mat4_multiply([], projectionMatrix, viewMatrix);
      viewProjectionMatrix = mat4_multiply([], viewProjectionMatrix, VECTOR_TO_POINT_MATRIX);
      break;

    default:
      throw new Error('Unknown projection mode');
  }

  return {
    viewMatrix: viewMatrix,
    viewProjectionMatrix: viewProjectionMatrix,
    projectionCenter: projectionCenter,
    cameraPos: viewport.cameraPosition
  };
}

/**
 * Returns uniforms for shaders based on current projection
 * includes: projection matrix suitable for shaders
 *
 * TODO - Ensure this works with any viewport, not just WebMercatorViewports
 *
 * @param {WebMercatorViewport} viewport -
 * @return {Float32Array} - 4x4 projection matrix that can be used in shaders
 */
export function getUniformsFromViewport() {
  var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      viewport = _ref3.viewport,
      _ref3$modelMatrix = _ref3.modelMatrix,
      modelMatrix = _ref3$modelMatrix === undefined ? null : _ref3$modelMatrix,
      _ref3$coordinateSyste = _ref3.coordinateSystem,
      coordinateSystem = _ref3$coordinateSyste === undefined ? COORDINATE_SYSTEM.LNGLAT : _ref3$coordinateSyste,
      _ref3$coordinateOrigi = _ref3.coordinateOrigin,
      coordinateOrigin = _ref3$coordinateOrigi === undefined ? [0, 0] : _ref3$coordinateOrigi,
      _ref3$fp = _ref3.fp64,
      fp64 = _ref3$fp === undefined ? false : _ref3$fp,
      projectionMode = _ref3.projectionMode,
      positionOrigin = _ref3.positionOrigin;

  assert(viewport);

  if (projectionMode !== undefined) {
    coordinateSystem = projectionMode;
    log.deprecated('projectionMode', 'coordinateSystem');
  }
  if (positionOrigin !== undefined) {
    coordinateOrigin = positionOrigin;
    log.deprecated('positionOrigin', 'coordinateOrigin');
  }

  var coordinateZoom = viewport.zoom;
  assert(coordinateZoom >= 0);

  var _calculateMatrixAndOf = calculateMatrixAndOffset({
    coordinateSystem: coordinateSystem, coordinateOrigin: coordinateOrigin, coordinateZoom: coordinateZoom, modelMatrix: modelMatrix, viewport: viewport
  }),
      projectionCenter = _calculateMatrixAndOf.projectionCenter,
      viewProjectionMatrix = _calculateMatrixAndOf.viewProjectionMatrix,
      cameraPos = _calculateMatrixAndOf.cameraPos;

  assert(viewProjectionMatrix, 'Viewport missing modelViewProjectionMatrix');

  // Calculate projection pixels per unit
  var distanceScales = viewport.getDistanceScales();

  // TODO - does this depend on useDevicePixels?
  var devicePixelRatio = window && window.devicePixelRatio || 1;
  var viewportSize = [viewport.width * devicePixelRatio, viewport.height * devicePixelRatio];

  var glModelMatrix = modelMatrix || IDENTITY_MATRIX;

  var uniforms = {
    // Projection mode values
    project_uCoordinateSystem: coordinateSystem,
    project_uCenter: projectionCenter,

    // Screen size
    project_uViewportSize: viewportSize,
    project_uDevicePixelRatio: devicePixelRatio,

    // Distance at which screen pixels are projected
    project_uFocalDistance: viewport.focalDistance || 1,
    project_uPixelsPerUnit: distanceScales.pixelsPerMeter,
    project_uScale: viewport.scale, // This is the mercator scale (2 ** zoom)

    project_uModelMatrix: glModelMatrix,
    project_uViewProjectionMatrix: viewProjectionMatrix,

    // This is for lighting calculations
    project_uCameraPosition: cameraPos,

    //
    // DEPRECATED UNIFORMS - For backwards compatibility with old custom layers
    //
    projectionMode: coordinateSystem,
    projectionCenter: projectionCenter,

    projectionOrigin: coordinateOrigin,
    modelMatrix: glModelMatrix,
    viewMatrix: viewport.viewMatrix,
    projectionMatrix: viewProjectionMatrix,
    projectionPixelsPerUnit: distanceScales.pixelsPerMeter,
    projectionScale: viewport.scale, // This is the mercator scale (2 ** zoom)
    viewportSize: viewportSize,
    devicePixelRatio: devicePixelRatio,
    cameraPos: cameraPos
  };

  // TODO - fp64 flag should be from shader module, not layer props
  return fp64 ? addFP64Uniforms(uniforms) : uniforms;
}

// 64 bit projection support
function addFP64Uniforms(uniforms) {
  var glViewProjectionMatrixFP64 = fp64ifyMatrix4(uniforms.project_uViewProjectionMatrix);
  var scaleFP64 = fp64ify(uniforms.project_uScale);

  uniforms.project_uViewProjectionMatrixFP64 = glViewProjectionMatrixFP64;
  uniforms.project64_uViewProjectionMatrix = glViewProjectionMatrixFP64;
  uniforms.project64_uScale = scaleFP64;

  // DEPRECATED UNIFORMS - For backwards compatibility with old custom layers
  uniforms.projectionFP64 = glViewProjectionMatrixFP64;
  uniforms.projectionScaleFP64 = scaleFP64;

  return uniforms;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlL3NoYWRlcmxpYi9wcm9qZWN0L3ZpZXdwb3J0LXVuaWZvcm1zLmpzIl0sIm5hbWVzIjpbIm1hdDRfbXVsdGlwbHkiLCJ2ZWM0X3RyYW5zZm9ybU1hdDQiLCJsb2ciLCJhc3NlcnQiLCJDT09SRElOQVRFX1NZU1RFTSIsInByb2plY3RGbGF0IiwiWkVST19WRUNUT1IiLCJWRUNUT1JfVE9fUE9JTlRfTUFUUklYIiwiSURFTlRJVFlfTUFUUklYIiwiZnA2NGlmeSIsImEiLCJhcnJheSIsInN0YXJ0SW5kZXgiLCJoaVBhcnQiLCJNYXRoIiwiZnJvdW5kIiwibG9QYXJ0IiwiZnA2NGlmeU1hdHJpeDQiLCJtYXRyaXgiLCJtYXRyaXhGUDY0IiwiRmxvYXQzMkFycmF5IiwiaSIsImoiLCJpbmRleCIsImNhbGN1bGF0ZVByb2plY3Rpb25DZW50ZXIiLCJjb29yZGluYXRlT3JpZ2luIiwiY29vcmRpbmF0ZVpvb20iLCJ2aWV3UHJvamVjdGlvbk1hdHJpeCIsInBvc2l0aW9uUGl4ZWxzIiwicG93IiwiY2FsY3VsYXRlTWF0cml4QW5kT2Zmc2V0Iiwidmlld3BvcnQiLCJtb2RlbE1hdHJpeCIsImNvb3JkaW5hdGVTeXN0ZW0iLCJ2aWV3TWF0cml4VW5jZW50ZXJlZCIsInZpZXdNYXRyaXgiLCJwcm9qZWN0aW9uTWF0cml4IiwicHJvamVjdGlvbkNlbnRlciIsIklERU5USVRZIiwiTE5HTEFUIiwiTUVURVJfT0ZGU0VUUyIsIkVycm9yIiwiY2FtZXJhUG9zIiwiY2FtZXJhUG9zaXRpb24iLCJnZXRVbmlmb3Jtc0Zyb21WaWV3cG9ydCIsImZwNjQiLCJwcm9qZWN0aW9uTW9kZSIsInBvc2l0aW9uT3JpZ2luIiwidW5kZWZpbmVkIiwiZGVwcmVjYXRlZCIsInpvb20iLCJkaXN0YW5jZVNjYWxlcyIsImdldERpc3RhbmNlU2NhbGVzIiwiZGV2aWNlUGl4ZWxSYXRpbyIsIndpbmRvdyIsInZpZXdwb3J0U2l6ZSIsIndpZHRoIiwiaGVpZ2h0IiwiZ2xNb2RlbE1hdHJpeCIsInVuaWZvcm1zIiwicHJvamVjdF91Q29vcmRpbmF0ZVN5c3RlbSIsInByb2plY3RfdUNlbnRlciIsInByb2plY3RfdVZpZXdwb3J0U2l6ZSIsInByb2plY3RfdURldmljZVBpeGVsUmF0aW8iLCJwcm9qZWN0X3VGb2NhbERpc3RhbmNlIiwiZm9jYWxEaXN0YW5jZSIsInByb2plY3RfdVBpeGVsc1BlclVuaXQiLCJwaXhlbHNQZXJNZXRlciIsInByb2plY3RfdVNjYWxlIiwic2NhbGUiLCJwcm9qZWN0X3VNb2RlbE1hdHJpeCIsInByb2plY3RfdVZpZXdQcm9qZWN0aW9uTWF0cml4IiwicHJvamVjdF91Q2FtZXJhUG9zaXRpb24iLCJwcm9qZWN0aW9uT3JpZ2luIiwicHJvamVjdGlvblBpeGVsc1BlclVuaXQiLCJwcm9qZWN0aW9uU2NhbGUiLCJhZGRGUDY0VW5pZm9ybXMiLCJnbFZpZXdQcm9qZWN0aW9uTWF0cml4RlA2NCIsInNjYWxlRlA2NCIsInByb2plY3RfdVZpZXdQcm9qZWN0aW9uTWF0cml4RlA2NCIsInByb2plY3Q2NF91Vmlld1Byb2plY3Rpb25NYXRyaXgiLCJwcm9qZWN0NjRfdVNjYWxlIiwicHJvamVjdGlvbkZQNjQiLCJwcm9qZWN0aW9uU2NhbGVGUDY0Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE9BQU9BLGFBQVAsTUFBMEIsa0JBQTFCO0FBQ0EsT0FBT0Msa0JBQVAsTUFBK0IsdUJBQS9COztBQUVBLE9BQU9DLEdBQVAsTUFBZ0IsaUJBQWhCO0FBQ0EsT0FBT0MsTUFBUCxNQUFtQixRQUFuQjtBQUNBLFNBQVFDLGlCQUFSLFFBQWdDLHFCQUFoQzs7QUFFQSxTQUFRQyxXQUFSLFFBQTBCLDJCQUExQjs7QUFFQTtBQUNBLElBQU1DLGNBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixF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c0MsS0FaVixFQVlpQjs7QUFFaENDLDBCQUFzQlosYUFkUDtBQWVmYSxtQ0FBK0I1QyxvQkFmaEI7O0FBaUJmO0FBQ0E2Qyw2QkFBeUI5QixTQWxCVjs7QUFvQmY7QUFDQTtBQUNBO0FBQ0FJLG9CQUFnQmIsZ0JBdkJEO0FBd0JmSSxzQ0F4QmU7O0FBMEJmb0Msc0JBQWtCaEQsZ0JBMUJIO0FBMkJmTyxpQkFBYTBCLGFBM0JFO0FBNEJmdkIsZ0JBQVlKLFNBQVNJLFVBNUJOO0FBNkJmQyxzQkFBa0JULG9CQTdCSDtBQThCZitDLDZCQUF5QnZCLGVBQWVnQixjQTlCekI7QUErQmZRLHFCQUFpQjVDLFNBQVNzQyxLQS9CWCxFQStCa0I7QUFDakNkLDhCQWhDZTtBQWlDZkYsc0NBakNlO0FBa0NmWDtBQWxDZSxHQUFqQjs7QUFxQ0E7QUFDQSxTQUFPRyxPQUFPK0IsZ0JBQWdCakIsUUFBaEIsQ0FBUCxHQUFtQ0EsUUFBMUM7QUFDRDs7QUFFRDtBQUNBLFNBQVNpQixlQUFULENBQXlCakIsUUFBekIsRUFBbUM7QUFDakMsTUFBTWtCLDZCQUE2QjVELGVBQWUwQyxTQUFTWSw2QkFBeEIsQ0FBbkM7QUFDQSxNQUFNTyxZQUFZckUsUUFBUWtELFNBQVNTLGNBQWpCLENBQWxCOztBQUVBVCxXQUFTb0IsaUNBQVQsR0FBNkNGLDBCQUE3QztBQUNBbEIsV0FBU3FCLCtCQUFULEdBQTJDSCwwQkFBM0M7QUFDQWxCLFdBQVNzQixnQkFBVCxHQUE0QkgsU0FBNUI7O0FBRUE7QUFDQW5CLFdBQVN1QixjQUFULEdBQTBCTCwwQkFBMUI7QUFDQWxCLFdBQVN3QixtQkFBVCxHQUErQkwsU0FBL0I7O0FBRUEsU0FBT25CLFFBQVA7QUFDRCIsImZpbGUiOiJ2aWV3cG9ydC11bmlmb3Jtcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vKiBnbG9iYWwgd2luZG93ICovXG5pbXBvcnQgbWF0NF9tdWx0aXBseSBmcm9tICdnbC1tYXQ0L211bHRpcGx5JztcbmltcG9ydCB2ZWM0X3RyYW5zZm9ybU1hdDQgZnJvbSAnZ2wtdmVjNC90cmFuc2Zvcm1NYXQ0JztcblxuaW1wb3J0IGxvZyBmcm9tICcuLi8uLi91dGlscy9sb2cnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDT09SRElOQVRFX1NZU1RFTX0gZnJvbSAnLi4vLi4vbGliL2NvbnN0YW50cyc7XG5cbmltcG9ydCB7cHJvamVjdEZsYXR9IGZyb20gJ3ZpZXdwb3J0LW1lcmNhdG9yLXByb2plY3QnO1xuXG4vLyBUbyBxdWlja2x5IHNldCBhIHZlY3RvciB0byB6ZXJvXG5jb25zdCBaRVJPX1ZFQ1RPUiA9IFswLCAwLCAwLCAwXTtcbi8vIDR4NCBtYXRyaXggdGhhdCBkcm9wcyA0dGggY29tcG9uZW50IG9mIHZlY3RvclxuY29uc3QgVkVDVE9SX1RPX1BPSU5UX01BVFJJWCA9IFsxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAwXTtcbmNvbnN0IElERU5USVRZX01BVFJJWCA9IFsxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxXTtcblxuLy8gVE9ETyAtIGltcG9ydCB0aGVzZSB1dGlscyBmcm9tIGZwNjQgcGFja2FnZVxuZnVuY3Rpb24gZnA2NGlmeShhLCBhcnJheSA9IFtdLCBzdGFydEluZGV4ID0gMCkge1xuICBjb25zdCBoaVBhcnQgPSBNYXRoLmZyb3VuZChhKTtcbiAgY29uc3QgbG9QYXJ0ID0gYSAtIGhpUGFydDtcbiAgYXJyYXlbc3RhcnRJbmRleF0gPSBoaVBhcnQ7XG4gIGFycmF5W3N0YXJ0SW5kZXggKyAxXSA9IGxvUGFydDtcbiAgcmV0dXJuIGFycmF5O1xufVxuXG4vLyBjYWxjdWxhdGUgV2ViR0wgNjQgYml0IG1hdHJpeCAodHJhbnNwb3NlZCBcIkZsb2F0NjRBcnJheVwiKVxuZnVuY3Rpb24gZnA2NGlmeU1hdHJpeDQobWF0cml4KSB7XG4gIC8vIFRyYW5zcG9zZSB0aGUgcHJvamVjdGlvbiBtYXRyaXggdG8gY29sdW1uIG1ham9yIGZvciBHTFNMLlxuICBjb25zdCBtYXRyaXhGUDY0ID0gbmV3IEZsb2F0MzJBcnJheSgzMik7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgKytpKSB7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCA0OyArK2opIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gaSAqIDQgKyBqO1xuICAgICAgZnA2NGlmeShtYXRyaXhbaiAqIDQgKyBpXSwgbWF0cml4RlA2NCwgaW5kZXggKiAyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1hdHJpeEZQNjQ7XG59XG5cbi8vIENhbGN1bGF0ZSB0cmFuc2Zvcm1lZCBwcm9qZWN0aW9uQ2VudGVyICh1c2luZyA2NCBiaXQgcHJlY2lzaW9uIEpTKVxuLy8gVGhpcyBpcyB0aGUga2V5IHRvIG9mZnNldCBtb2RlIHByZWNpc2lvblxuLy8gKGF2b2lkcyBkb2luZyB0aGlzIGFkZGl0aW9uIGluIDMyIGJpdCBwcmVjaXNpb24gaW4gR0xTTClcbmZ1bmN0aW9uIGNhbGN1bGF0ZVByb2plY3Rpb25DZW50ZXIoe2Nvb3JkaW5hdGVPcmlnaW4sIGNvb3JkaW5hdGVab29tLCB2aWV3UHJvamVjdGlvbk1hdHJpeH0pIHtcbiAgY29uc3QgcG9zaXRpb25QaXhlbHMgPSBwcm9qZWN0RmxhdChjb29yZGluYXRlT3JpZ2luLCBNYXRoLnBvdygyLCBjb29yZGluYXRlWm9vbSkpO1xuICAvLyBwcm9qZWN0aW9uQ2VudGVyID0gbmV3IE1hdHJpeDQodmlld1Byb2plY3Rpb25NYXRyaXgpXG4gIC8vICAgLnRyYW5zZm9ybVZlY3RvcihbcG9zaXRpb25QaXhlbHNbMF0sIHBvc2l0aW9uUGl4ZWxzWzFdLCAwLjAsIDEuMF0pO1xuICByZXR1cm4gdmVjNF90cmFuc2Zvcm1NYXQ0KFtdLFxuICAgIFtwb3NpdGlvblBpeGVsc1swXSwgcG9zaXRpb25QaXhlbHNbMV0sIDAuMCwgMS4wXSxcbiAgICB2aWV3UHJvamVjdGlvbk1hdHJpeCk7XG59XG5cbi8vIFRoZSBjb2RlIHRoYXQgdXRpbGl6ZXMgTWF0cml4NCBkb2VzIHRoZSBzYW1lIGNhbGN1bGF0aW9uIGFzIHRoZWlyIG1hdDQgY291bnRlcnBhcnRzLFxuLy8gaGFzIGxvd2VyIHBlcmZvcm1hbmNlIGJ1dCBwcm92aWRlcyBlcnJvciBjaGVja2luZy5cbi8vIFVuY29tbWVudCB3aGVuIGRlYnVnZ2luZ1xuZnVuY3Rpb24gY2FsY3VsYXRlTWF0cml4QW5kT2Zmc2V0KHtcbiAgLy8gVU5DSEFOR0VEXG4gIHZpZXdwb3J0LFxuICBtb2RlbE1hdHJpeCxcbiAgLy8gTkVXIFBBUkFNU1xuICBjb29yZGluYXRlU3lzdGVtLFxuICBjb29yZGluYXRlT3JpZ2luLFxuICBjb29yZGluYXRlWm9vbVxufSkge1xuICBjb25zdCB7dmlld01hdHJpeFVuY2VudGVyZWR9ID0gdmlld3BvcnQ7XG4gIGxldCB7dmlld01hdHJpeH0gPSB2aWV3cG9ydDtcbiAgY29uc3Qge3Byb2plY3Rpb25NYXRyaXh9ID0gdmlld3BvcnQ7XG4gIGxldCB7dmlld1Byb2plY3Rpb25NYXRyaXh9ID0gdmlld3BvcnQ7XG5cbiAgbGV0IHByb2plY3Rpb25DZW50ZXI7XG5cbiAgc3dpdGNoIChjb29yZGluYXRlU3lzdGVtKSB7XG5cbiAgY2FzZSBDT09SRElOQVRFX1NZU1RFTS5JREVOVElUWTpcbiAgY2FzZSBDT09SRElOQVRFX1NZU1RFTS5MTkdMQVQ6XG4gICAgcHJvamVjdGlvbkNlbnRlciA9IFpFUk9fVkVDVE9SO1xuICAgIGJyZWFrO1xuXG4gIC8vIFRPRE86IG1ha2UgbGlnaGl0bmcgd29yayBmb3IgbWV0ZXIgb2Zmc2V0IG1vZGVcbiAgY2FzZSBDT09SRElOQVRFX1NZU1RFTS5NRVRFUl9PRkZTRVRTOlxuICAgIHByb2plY3Rpb25DZW50ZXIgPSBjYWxjdWxhdGVQcm9qZWN0aW9uQ2VudGVyKHtcbiAgICAgIGNvb3JkaW5hdGVPcmlnaW4sIGNvb3JkaW5hdGVab29tLCB2aWV3UHJvamVjdGlvbk1hdHJpeFxuICAgIH0pO1xuXG4gICAgLy8gQWx3YXlzIGFwcGx5IHVuY2VudGVyZWQgcHJvamVjdGlvbiBtYXRyaXggaWYgYXZhaWxhYmxlIChzaGFkZXIgYWRkcyBjZW50ZXIpXG4gICAgdmlld01hdHJpeCA9IHZpZXdNYXRyaXhVbmNlbnRlcmVkIHx8IHZpZXdNYXRyaXg7XG5cbiAgICAvLyBaZXJvIG91dCA0dGggY29vcmRpbmF0ZSAoXCJhZnRlclwiIG1vZGVsIG1hdHJpeCkgLSBhdm9pZHMgZnVydGhlciB0cmFuc2xhdGlvbnNcbiAgICAvLyB2aWV3TWF0cml4ID0gbmV3IE1hdHJpeDQodmlld01hdHJpeFVuY2VudGVyZWQgfHwgdmlld01hdHJpeClcbiAgICAvLyAgIC5tdWx0aXBseVJpZ2h0KFZFQ1RPUl9UT19QT0lOVF9NQVRSSVgpO1xuICAgIHZpZXdQcm9qZWN0aW9uTWF0cml4ID0gbWF0NF9tdWx0aXBseShbXSwgcHJvamVjdGlvbk1hdHJpeCwgdmlld01hdHJpeCk7XG4gICAgdmlld1Byb2plY3Rpb25NYXRyaXggPSBtYXQ0X211bHRpcGx5KFtdLCB2aWV3UHJvamVjdGlvbk1hdHJpeCwgVkVDVE9SX1RPX1BPSU5UX01BVFJJWCk7XG4gICAgYnJlYWs7XG5cbiAgZGVmYXVsdDpcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcHJvamVjdGlvbiBtb2RlJyk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHZpZXdNYXRyaXgsXG4gICAgdmlld1Byb2plY3Rpb25NYXRyaXgsXG4gICAgcHJvamVjdGlvbkNlbnRlcixcbiAgICBjYW1lcmFQb3M6IHZpZXdwb3J0LmNhbWVyYVBvc2l0aW9uXG4gIH07XG59XG5cbi8qKlxuICogUmV0dXJucyB1bmlmb3JtcyBmb3Igc2hhZGVycyBiYXNlZCBvbiBjdXJyZW50IHByb2plY3Rpb25cbiAqIGluY2x1ZGVzOiBwcm9qZWN0aW9uIG1hdHJpeCBzdWl0YWJsZSBmb3Igc2hhZGVyc1xuICpcbiAqIFRPRE8gLSBFbnN1cmUgdGhpcyB3b3JrcyB3aXRoIGFueSB2aWV3cG9ydCwgbm90IGp1c3QgV2ViTWVyY2F0b3JWaWV3cG9ydHNcbiAqXG4gKiBAcGFyYW0ge1dlYk1lcmNhdG9yVmlld3BvcnR9IHZpZXdwb3J0IC1cbiAqIEByZXR1cm4ge0Zsb2F0MzJBcnJheX0gLSA0eDQgcHJvamVjdGlvbiBtYXRyaXggdGhhdCBjYW4gYmUgdXNlZCBpbiBzaGFkZXJzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRVbmlmb3Jtc0Zyb21WaWV3cG9ydCh7XG4gIHZpZXdwb3J0LFxuICBtb2RlbE1hdHJpeCA9IG51bGwsXG4gIGNvb3JkaW5hdGVTeXN0ZW0gPSBDT09SRElOQVRFX1NZU1RFTS5MTkdMQVQsXG4gIGNvb3JkaW5hdGVPcmlnaW4gPSBbMCwgMF0sXG4gIGZwNjQgPSBmYWxzZSxcbiAgLy8gRGVwcmVjYXRlZFxuICBwcm9qZWN0aW9uTW9kZSxcbiAgcG9zaXRpb25PcmlnaW5cbn0gPSB7fSkge1xuICBhc3NlcnQodmlld3BvcnQpO1xuXG4gIGlmIChwcm9qZWN0aW9uTW9kZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29vcmRpbmF0ZVN5c3RlbSA9IHByb2plY3Rpb25Nb2RlO1xuICAgIGxvZy5kZXByZWNhdGVkKCdwcm9qZWN0aW9uTW9kZScsICdjb29yZGluYXRlU3lzdGVtJyk7XG4gIH1cbiAgaWYgKHBvc2l0aW9uT3JpZ2luICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb29yZGluYXRlT3JpZ2luID0gcG9zaXRpb25PcmlnaW47XG4gICAgbG9nLmRlcHJlY2F0ZWQoJ3Bvc2l0aW9uT3JpZ2luJywgJ2Nvb3JkaW5hdGVPcmlnaW4nKTtcbiAgfVxuXG4gIGNvbnN0IGNvb3JkaW5hdGVab29tID0gdmlld3BvcnQuem9vbTtcbiAgYXNzZXJ0KGNvb3JkaW5hdGVab29tID49IDApO1xuXG4gIGNvbnN0IHtwcm9qZWN0aW9uQ2VudGVyLCB2aWV3UHJvamVjdGlvbk1hdHJpeCwgY2FtZXJhUG9zfSA9XG4gICAgY2FsY3VsYXRlTWF0cml4QW5kT2Zmc2V0KHtcbiAgICAgIGNvb3JkaW5hdGVTeXN0ZW0sIGNvb3JkaW5hdGVPcmlnaW4sIGNvb3JkaW5hdGVab29tLCBtb2RlbE1hdHJpeCwgdmlld3BvcnRcbiAgICB9KTtcblxuICBhc3NlcnQodmlld1Byb2plY3Rpb25NYXRyaXgsICdWaWV3cG9ydCBtaXNzaW5nIG1vZGVsVmlld1Byb2plY3Rpb25NYXRyaXgnKTtcblxuICAvLyBDYWxjdWxhdGUgcHJvamVjdGlvbiBwaXhlbHMgcGVyIHVuaXRcbiAgY29uc3QgZGlzdGFuY2VTY2FsZXMgPSB2aWV3cG9ydC5nZXREaXN0YW5jZVNjYWxlcygpO1xuXG4gIC8vIFRPRE8gLSBkb2VzIHRoaXMgZGVwZW5kIG9uIHVzZURldmljZVBpeGVscz9cbiAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9ICh3aW5kb3cgJiYgd2luZG93LmRldmljZVBpeGVsUmF0aW8pIHx8IDE7XG4gIGNvbnN0IHZpZXdwb3J0U2l6ZSA9IFt2aWV3cG9ydC53aWR0aCAqIGRldmljZVBpeGVsUmF0aW8sIHZpZXdwb3J0LmhlaWdodCAqIGRldmljZVBpeGVsUmF0aW9dO1xuXG4gIGNvbnN0IGdsTW9kZWxNYXRyaXggPSBtb2RlbE1hdHJpeCB8fCBJREVOVElUWV9NQVRSSVg7XG5cbiAgY29uc3QgdW5pZm9ybXMgPSB7XG4gICAgLy8gUHJvamVjdGlvbiBtb2RlIHZhbHVlc1xuICAgIHByb2plY3RfdUNvb3JkaW5hdGVTeXN0ZW06IGNvb3JkaW5hdGVTeXN0ZW0sXG4gICAgcHJvamVjdF91Q2VudGVyOiBwcm9qZWN0aW9uQ2VudGVyLFxuXG4gICAgLy8gU2NyZWVuIHNpemVcbiAgICBwcm9qZWN0X3VWaWV3cG9ydFNpemU6IHZpZXdwb3J0U2l6ZSxcbiAgICBwcm9qZWN0X3VEZXZpY2VQaXhlbFJhdGlvOiBkZXZpY2VQaXhlbFJhdGlvLFxuXG4gICAgLy8gRGlzdGFuY2UgYXQgd2hpY2ggc2NyZWVuIHBpeGVscyBhcmUgcHJvamVjdGVkXG4gICAgcHJvamVjdF91Rm9jYWxEaXN0YW5jZTogdmlld3BvcnQuZm9jYWxEaXN0YW5jZSB8fCAxLFxuICAgIHByb2plY3RfdVBpeGVsc1BlclVuaXQ6IGRpc3RhbmNlU2NhbGVzLnBpeGVsc1Blck1ldGVyLFxuICAgIHByb2plY3RfdVNjYWxlOiB2aWV3cG9ydC5zY2FsZSwgLy8gVGhpcyBpcyB0aGUgbWVyY2F0b3Igc2NhbGUgKDIgKiogem9vbSlcblxuICAgIHByb2plY3RfdU1vZGVsTWF0cml4OiBnbE1vZGVsTWF0cml4LFxuICAgIHByb2plY3RfdVZpZXdQcm9qZWN0aW9uTWF0cml4OiB2aWV3UHJvamVjdGlvbk1hdHJpeCxcblxuICAgIC8vIFRoaXMgaXMgZm9yIGxpZ2h0aW5nIGNhbGN1bGF0aW9uc1xuICAgIHByb2plY3RfdUNhbWVyYVBvc2l0aW9uOiBjYW1lcmFQb3MsXG5cbiAgICAvL1xuICAgIC8vIERFUFJFQ0FURUQgVU5JRk9STVMgLSBGb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgd2l0aCBvbGQgY3VzdG9tIGxheWVyc1xuICAgIC8vXG4gICAgcHJvamVjdGlvbk1vZGU6IGNvb3JkaW5hdGVTeXN0ZW0sXG4gICAgcHJvamVjdGlvbkNlbnRlcixcblxuICAgIHByb2plY3Rpb25PcmlnaW46IGNvb3JkaW5hdGVPcmlnaW4sXG4gICAgbW9kZWxNYXRyaXg6IGdsTW9kZWxNYXRyaXgsXG4gICAgdmlld01hdHJpeDogdmlld3BvcnQudmlld01hdHJpeCxcbiAgICBwcm9qZWN0aW9uTWF0cml4OiB2aWV3UHJvamVjdGlvbk1hdHJpeCxcbiAgICBwcm9qZWN0aW9uUGl4ZWxzUGVyVW5pdDogZGlzdGFuY2VTY2FsZXMucGl4ZWxzUGVyTWV0ZXIsXG4gICAgcHJvamVjdGlvblNjYWxlOiB2aWV3cG9ydC5zY2FsZSwgLy8gVGhpcyBpcyB0aGUgbWVyY2F0b3Igc2NhbGUgKDIgKiogem9vbSlcbiAgICB2aWV3cG9ydFNpemUsXG4gICAgZGV2aWNlUGl4ZWxSYXRpbyxcbiAgICBjYW1lcmFQb3NcbiAgfTtcblxuICAvLyBUT0RPIC0gZnA2NCBmbGFnIHNob3VsZCBiZSBmcm9tIHNoYWRlciBtb2R1bGUsIG5vdCBsYXllciBwcm9wc1xuICByZXR1cm4gZnA2NCA/IGFkZEZQNjRVbmlmb3Jtcyh1bmlmb3JtcykgOiB1bmlmb3Jtcztcbn1cblxuLy8gNjQgYml0IHByb2plY3Rpb24gc3VwcG9ydFxuZnVuY3Rpb24gYWRkRlA2NFVuaWZvcm1zKHVuaWZvcm1zKSB7XG4gIGNvbnN0IGdsVmlld1Byb2plY3Rpb25NYXRyaXhGUDY0ID0gZnA2NGlmeU1hdHJpeDQodW5pZm9ybXMucHJvamVjdF91Vmlld1Byb2plY3Rpb25NYXRyaXgpO1xuICBjb25zdCBzY2FsZUZQNjQgPSBmcDY0aWZ5KHVuaWZvcm1zLnByb2plY3RfdVNjYWxlKTtcblxuICB1bmlmb3Jtcy5wcm9qZWN0X3VWaWV3UHJvamVjdGlvbk1hdHJpeEZQNjQgPSBnbFZpZXdQcm9qZWN0aW9uTWF0cml4RlA2NDtcbiAgdW5pZm9ybXMucHJvamVjdDY0X3VWaWV3UHJvamVjdGlvbk1hdHJpeCA9IGdsVmlld1Byb2plY3Rpb25NYXRyaXhGUDY0O1xuICB1bmlmb3Jtcy5wcm9qZWN0NjRfdVNjYWxlID0gc2NhbGVGUDY0O1xuXG4gIC8vIERFUFJFQ0FURUQgVU5JRk9STVMgLSBGb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgd2l0aCBvbGQgY3VzdG9tIGxheWVyc1xuICB1bmlmb3Jtcy5wcm9qZWN0aW9uRlA2NCA9IGdsVmlld1Byb2plY3Rpb25NYXRyaXhGUDY0O1xuICB1bmlmb3Jtcy5wcm9qZWN0aW9uU2NhbGVGUDY0ID0gc2NhbGVGUDY0O1xuXG4gIHJldHVybiB1bmlmb3Jtcztcbn1cbiJdfQ==
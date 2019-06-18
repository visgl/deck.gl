var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

import log from '../utils/log';
import { transformVector, createMat4, extractCameraVectors } from '../utils/math-utils';

import { Matrix4, Vector3, equals as _equals } from 'math.gl';
import mat4_scale from 'gl-mat4/scale';
import mat4_translate from 'gl-mat4/translate';
import mat4_multiply from 'gl-mat4/multiply';
import mat4_invert from 'gl-mat4/invert';
import mat4_perspective from 'gl-mat4/perspective';

import vec2_lerp from 'gl-vec2/lerp';

var ZERO_VECTOR = [0, 0, 0];

import { getDistanceScales, getWorldPosition, getMeterZoom } from 'viewport-mercator-project';

import assert from 'assert';

var IDENTITY = createMat4();

var DEFAULT_DISTANCE_SCALES = {
  pixelsPerMeter: [1, 1, 1],
  metersPerPixel: [1, 1, 1],
  pixelsPerDegree: [1, 1, 1],
  degreesPerPixel: [1, 1, 1]
};

var DEFAULT_ZOOM = 0;

var ERR_ARGUMENT = 'Illegal argument to Viewport';

var Viewport = function () {
  /**
   * @classdesc
   * Manages coordinate system transformations for deck.gl.
   *
   * Note: The Viewport is immutable in the sense that it only has accessors.
   * A new viewport instance should be created if any parameters have changed.
   */
  /* eslint-disable complexity, max-statements */
  function Viewport() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Viewport);

    var _opts$id = opts.id,
        id = _opts$id === undefined ? null : _opts$id,
        _opts$x = opts.x,
        x = _opts$x === undefined ? 0 : _opts$x,
        _opts$y = opts.y,
        y = _opts$y === undefined ? 0 : _opts$y,
        _opts$width = opts.width,
        width = _opts$width === undefined ? 1 : _opts$width,
        _opts$height = opts.height,
        height = _opts$height === undefined ? 1 : _opts$height,
        _opts$viewMatrix = opts.viewMatrix,
        viewMatrix = _opts$viewMatrix === undefined ? IDENTITY : _opts$viewMatrix,
        _opts$projectionMatri = opts.projectionMatrix,
        projectionMatrix = _opts$projectionMatri === undefined ? null : _opts$projectionMatri,
        _opts$fovy = opts.fovy,
        fovy = _opts$fovy === undefined ? 75 : _opts$fovy,
        _opts$near = opts.near,
        near = _opts$near === undefined ? 0.1 : _opts$near,
        _opts$far = opts.far,
        far = _opts$far === undefined ? 1000 : _opts$far,
        _opts$longitude = opts.longitude,
        longitude = _opts$longitude === undefined ? null : _opts$longitude,
        _opts$latitude = opts.latitude,
        latitude = _opts$latitude === undefined ? null : _opts$latitude,
        _opts$zoom = opts.zoom,
        zoom = _opts$zoom === undefined ? null : _opts$zoom,
        _opts$position = opts.position,
        position = _opts$position === undefined ? null : _opts$position,
        _opts$modelMatrix = opts.modelMatrix,
        modelMatrix = _opts$modelMatrix === undefined ? null : _opts$modelMatrix,
        _opts$distanceScales = opts.distanceScales,
        distanceScales = _opts$distanceScales === undefined ? null : _opts$distanceScales;


    this.id = id || this.constructor.displayName || 'viewport';

    // Check if we have a geospatial anchor
    this.isGeospatial = Number.isFinite(latitude) && Number.isFinite(longitude);

    // Silently allow apps to send in w,h = 0,0
    this.x = x;
    this.y = y;
    this.width = width || 1;
    this.height = height || 1;

    this.zoom = zoom;
    if (!Number.isFinite(this.zoom)) {
      this.zoom = this.isGeospatial ? getMeterZoom({ latitude: latitude }) : DEFAULT_ZOOM;
    }
    this.scale = Math.pow(2, this.zoom);

    // Calculate distance scales if lng/lat/zoom are provided
    this.distanceScales = this.isGeospatial ? getDistanceScales({ latitude: latitude, longitude: longitude, scale: this.scale }) : distanceScales || DEFAULT_DISTANCE_SCALES;

    this.focalDistance = opts.focalDistance || 1;

    this.distanceScales.metersPerPixel = new Vector3(this.distanceScales.metersPerPixel);
    this.distanceScales.pixelsPerMeter = new Vector3(this.distanceScales.pixelsPerMeter);

    this.position = ZERO_VECTOR;
    this.meterOffset = ZERO_VECTOR;
    if (position) {
      // Apply model matrix if supplied
      this.position = position;
      this.modelMatrix = modelMatrix;
      this.meterOffset = modelMatrix ? modelMatrix.transformVector(position) : position;
    }

    this.viewMatrixUncentered = viewMatrix;

    if (this.isGeospatial) {
      // Determine camera center
      this.center = getWorldPosition({
        longitude: longitude, latitude: latitude, zoom: this.zoom, meterOffset: this.meterOffset
      });

      // Make a centered version of the matrix for projection modes without an offset
      this.viewMatrix = new Matrix4()
      // Apply the uncentered view matrix
      .multiplyRight(this.viewMatrixUncentered)
      // The Mercator world coordinate system is upper left,
      // but GL expects lower left, so we flip it around the center after all transforms are done
      .scale([1, -1, 1])
      // And center it
      .translate(new Vector3(this.center || ZERO_VECTOR).negate());
    } else {
      this.center = position;
      this.viewMatrix = viewMatrix;
    }

    // Create a projection matrix if not supplied
    if (projectionMatrix) {
      this.projectionMatrix = projectionMatrix;
    } else {
      assert(Number.isFinite(fovy));
      var DEGREES_TO_RADIANS = Math.PI / 180;
      var fovyRadians = fovy * DEGREES_TO_RADIANS;
      var aspect = this.width / this.height;
      this.projectionMatrix = mat4_perspective([], fovyRadians, aspect, near, far);
    }

    // Init pixel matrices
    this._initMatrices();

    // Bind methods for easy access
    this.equals = this.equals.bind(this);
    this.project = this.project.bind(this);
    this.unproject = this.unproject.bind(this);
    this.projectFlat = this.projectFlat.bind(this);
    this.unprojectFlat = this.unprojectFlat.bind(this);
    this.getMatrices = this.getMatrices.bind(this);
  }
  /* eslint-enable complexity, max-statements */

  // Two viewports are equal if width and height are identical, and if
  // their view and projection matrices are (approximately) equal.


  _createClass(Viewport, [{
    key: 'equals',
    value: function equals(viewport) {
      if (!(viewport instanceof Viewport)) {
        return false;
      }

      return viewport.width === this.width && viewport.height === this.height && _equals(viewport.projectionMatrix, this.projectionMatrix) && _equals(viewport.viewMatrix, this.viewMatrix);
      // TODO - check distance scales?
    }

    /**
     * Projects xyz (possibly latitude and longitude) to pixel coordinates in window
     * using viewport projection parameters
     * - [longitude, latitude] to [x, y]
     * - [longitude, latitude, Z] => [x, y, z]
     * Note: By default, returns top-left coordinates for canvas/SVG type render
     *
     * @param {Array} lngLatZ - [lng, lat] or [lng, lat, Z]
     * @param {Object} opts - options
     * @param {Object} opts.topLeft=true - Whether projected coords are top left
     * @return {Array} - [x, y] or [x, y, z] in top left coords
     */

  }, {
    key: 'project',
    value: function project(xyz) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$topLeft = _ref.topLeft,
          topLeft = _ref$topLeft === undefined ? true : _ref$topLeft;

      var _xyz = _slicedToArray(xyz, 3),
          x0 = _xyz[0],
          y0 = _xyz[1],
          _xyz$ = _xyz[2],
          z0 = _xyz$ === undefined ? 0 : _xyz$;

      assert(Number.isFinite(x0) && Number.isFinite(y0) && Number.isFinite(z0), ERR_ARGUMENT);

      var _projectFlat2 = this.projectFlat([x0, y0]),
          _projectFlat3 = _slicedToArray(_projectFlat2, 2),
          X = _projectFlat3[0],
          Y = _projectFlat3[1];

      var v = transformVector(this.pixelProjectionMatrix, [X, Y, z0, 1]);

      var _v = _slicedToArray(v, 2),
          x = _v[0],
          y = _v[1];

      var y2 = topLeft ? y : this.height - y;
      return xyz.length === 2 ? [x, y2] : [x, y2, 0];
    }

    /**
     * Unproject pixel coordinates on screen onto world coordinates,
     * (possibly [lon, lat]) on map.
     * - [x, y] => [lng, lat]
     * - [x, y, z] => [lng, lat, Z]
     * @param {Array} xyz -
     * @param {Object} opts - options
     * @param {Object} opts.topLeft=true - Whether origin is top left
     * @return {Array|null} - [lng, lat, Z] or [X, Y, Z]
     */

  }, {
    key: 'unproject',
    value: function unproject(xyz) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$topLeft = _ref2.topLeft,
          topLeft = _ref2$topLeft === undefined ? true : _ref2$topLeft;

      var _xyz2 = _slicedToArray(xyz, 3),
          x = _xyz2[0],
          y = _xyz2[1],
          _xyz2$ = _xyz2[2],
          targetZ = _xyz2$ === undefined ? 0 : _xyz2$;

      var y2 = topLeft ? y : this.height - y;

      // since we don't know the correct projected z value for the point,
      // unproject two points to get a line and then find the point on that line with z=0
      var coord0 = transformVector(this.pixelUnprojectionMatrix, [x, y2, 0, 1]);
      var coord1 = transformVector(this.pixelUnprojectionMatrix, [x, y2, 1, 1]);

      if (!coord0 || !coord1) {
        return null;
      }

      var z0 = coord0[2];
      var z1 = coord1[2];

      var t = z0 === z1 ? 0 : (targetZ - z0) / (z1 - z0);
      var v = vec2_lerp([], coord0, coord1, t);

      var vUnprojected = this.unprojectFlat(v);
      return xyz.length === 2 ? vUnprojected : [vUnprojected[0], vUnprojected[1], 0];
    }

    // NON_LINEAR PROJECTION HOOKS
    // Used for web meractor projection

    /**
     * Project [lng,lat] on sphere onto [x,y] on 512*512 Mercator Zoom 0 tile.
     * Performs the nonlinear part of the web mercator projection.
     * Remaining projection is done with 4x4 matrices which also handles
     * perspective.
     * @param {Array} lngLat - [lng, lat] coordinates
     *   Specifies a point on the sphere to project onto the map.
     * @return {Array} [x,y] coordinates.
     */

  }, {
    key: 'projectFlat',
    value: function projectFlat(_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          x = _ref4[0],
          y = _ref4[1];

      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;

      return this._projectFlat.apply(this, arguments);
    }

    /**
     * Unproject world point [x,y] on map onto {lat, lon} on sphere
     * @param {object|Vector} xy - object with {x,y} members
     *  representing point on projected map plane
     * @return {GeoCoordinates} - object with {lat,lon} of point on sphere.
     *   Has toArray method if you need a GeoJSON Array.
     *   Per cartographic tradition, lat and lon are specified as degrees.
     */

  }, {
    key: 'unprojectFlat',
    value: function unprojectFlat(xyz) {
      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;

      return this._unprojectFlat.apply(this, arguments);
    }

    // TODO - why do we need these?

  }, {
    key: '_projectFlat',
    value: function _projectFlat(xyz) {
      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;

      return xyz;
    }
  }, {
    key: '_unprojectFlat',
    value: function _unprojectFlat(xyz) {
      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;

      return xyz;
    }
  }, {
    key: 'getMercatorParams',
    value: function getMercatorParams() {
      var lngLat = this._addMetersToLngLat([this.longitude || 0, this.latitude || 0], this.meterOffset);
      return {
        longitude: lngLat[0],
        latitude: lngLat[1]
      };
    }
  }, {
    key: 'isMapSynched',
    value: function isMapSynched() {
      return false;
    }
  }, {
    key: 'getDistanceScales',
    value: function getDistanceScales() {
      return this.distanceScales;
    }
  }, {
    key: 'getMatrices',
    value: function getMatrices() {
      var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref5$modelMatrix = _ref5.modelMatrix,
          modelMatrix = _ref5$modelMatrix === undefined ? null : _ref5$modelMatrix;

      var modelViewProjectionMatrix = this.viewProjectionMatrix;
      var pixelProjectionMatrix = this.pixelProjectionMatrix;
      var pixelUnprojectionMatrix = this.pixelUnprojectionMatrix;

      if (modelMatrix) {
        modelViewProjectionMatrix = mat4_multiply([], this.viewProjectionMatrix, modelMatrix);
        pixelProjectionMatrix = mat4_multiply([], this.pixelProjectionMatrix, modelMatrix);
        pixelUnprojectionMatrix = mat4_invert([], pixelProjectionMatrix);
      }

      var matrices = Object.assign({
        modelViewProjectionMatrix: modelViewProjectionMatrix,
        viewProjectionMatrix: this.viewProjectionMatrix,
        viewMatrix: this.viewMatrix,
        projectionMatrix: this.projectionMatrix,

        // project/unproject between pixels and world
        pixelProjectionMatrix: pixelProjectionMatrix,
        pixelUnprojectionMatrix: pixelUnprojectionMatrix,

        width: this.width,
        height: this.height,
        scale: this.scale
      });

      return matrices;
    }

    // EXPERIMENTAL METHODS

  }, {
    key: 'getCameraPosition',
    value: function getCameraPosition() {
      return this.cameraPosition;
    }
  }, {
    key: 'getCameraDirection',
    value: function getCameraDirection() {
      return this.cameraDirection;
    }
  }, {
    key: 'getCameraUp',
    value: function getCameraUp() {
      return this.cameraUp;
    }

    // TODO - these are duplicating WebMercator methods

  }, {
    key: '_addMetersToLngLat',
    value: function _addMetersToLngLat(lngLatZ, xyz) {
      var _lngLatZ = _slicedToArray(lngLatZ, 3),
          lng = _lngLatZ[0],
          lat = _lngLatZ[1],
          _lngLatZ$ = _lngLatZ[2],
          Z = _lngLatZ$ === undefined ? 0 : _lngLatZ$;

      var _metersToLngLatDelta2 = this._metersToLngLatDelta(xyz),
          _metersToLngLatDelta3 = _slicedToArray(_metersToLngLatDelta2, 3),
          deltaLng = _metersToLngLatDelta3[0],
          deltaLat = _metersToLngLatDelta3[1],
          _metersToLngLatDelta4 = _metersToLngLatDelta3[2],
          deltaZ = _metersToLngLatDelta4 === undefined ? 0 : _metersToLngLatDelta4;

      return lngLatZ.length === 2 ? [lng + deltaLng, lat + deltaLat] : [lng + deltaLng, lat + deltaLat, Z + deltaZ];
    }
  }, {
    key: '_metersToLngLatDelta',
    value: function _metersToLngLatDelta(xyz) {
      var _xyz3 = _slicedToArray(xyz, 3),
          x = _xyz3[0],
          y = _xyz3[1],
          _xyz3$ = _xyz3[2],
          z = _xyz3$ === undefined ? 0 : _xyz3$;

      assert(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z), ERR_ARGUMENT);
      var _distanceScales = this.distanceScales,
          pixelsPerMeter = _distanceScales.pixelsPerMeter,
          degreesPerPixel = _distanceScales.degreesPerPixel;

      var deltaLng = x * pixelsPerMeter[0] * degreesPerPixel[0];
      var deltaLat = y * pixelsPerMeter[1] * degreesPerPixel[1];
      return xyz.length === 2 ? [deltaLng, deltaLat] : [deltaLng, deltaLat, z];
    }

    // INTERNAL METHODS

  }, {
    key: '_initMatrices',
    value: function _initMatrices() {
      // Note: As usual, matrix operations should be applied in "reverse" order
      // since vectors will be multiplied in from the right during transformation
      var vpm = createMat4();
      mat4_multiply(vpm, vpm, this.projectionMatrix);
      mat4_multiply(vpm, vpm, this.viewMatrix);
      this.viewProjectionMatrix = vpm;

      // console.log('VPM', this.viewMatrix, this.projectionMatrix, this.viewProjectionMatrix);

      // Calculate inverse view matrix
      this.viewMatrixInverse = mat4_invert([], this.viewMatrix) || this.viewMatrix;

      // Decompose camera directions

      var _extractCameraVectors = extractCameraVectors({
        viewMatrix: this.viewMatrix,
        viewMatrixInverse: this.viewMatrixInverse
      }),
          eye = _extractCameraVectors.eye,
          direction = _extractCameraVectors.direction,
          up = _extractCameraVectors.up;

      this.cameraPosition = eye;
      this.cameraDirection = direction;
      this.cameraUp = up;

      // console.log(this.cameraPosition, this.cameraDirection, this.cameraUp);

      /*
       * Builds matrices that converts preprojected lngLats to screen pixels
       * and vice versa.
       * Note: Currently returns bottom-left coordinates!
       * Note: Starts with the GL projection matrix and adds steps to the
       *       scale and translate that matrix onto the window.
       * Note: WebGL controls clip space to screen projection with gl.viewport
       *       and does not need this step.
       */

      // matrix for conversion from world location to screen (pixel) coordinates
      var m = createMat4();
      mat4_scale(m, m, [this.width / 2, -this.height / 2, 1]);
      mat4_translate(m, m, [1, -1, 0]);
      mat4_multiply(m, m, this.viewProjectionMatrix);
      this.pixelProjectionMatrix = m;

      this.pixelUnprojectionMatrix = mat4_invert(createMat4(), this.pixelProjectionMatrix);
      if (!this.pixelUnprojectionMatrix) {
        log.warn('Pixel project matrix not invertible');
        // throw new Error('Pixel project matrix not invertible');
      }
    }
  }]);

  return Viewport;
}();

export default Viewport;


Viewport.displayName = 'Viewport';
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3ZpZXdwb3J0cy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJsb2ciLCJ0cmFuc2Zvcm1WZWN0b3IiLCJjcmVhdGVNYXQ0IiwiZXh0cmFjdENhbWVyYVZlY3RvcnMiLCJNYXRyaXg0IiwiVmVjdG9yMyIsImVxdWFscyIsIm1hdDRfc2NhbGUiLCJtYXQ0X3RyYW5zbGF0ZSIsIm1hdDRfbXVsdGlwbHkiLCJtYXQ0X2ludmVydCIsIm1hdDRfcGVyc3BlY3RpdmUiLCJ2ZWMyX2xlcnAiLCJaRVJPX1ZFQ1RPUiIsImdldERpc3RhbmNlU2NhbGVzIiwiZ2V0V29ybGRQb3NpdGlvbiIsImdldE1ldGVyWm9vbSIsImFzc2VydCIsIklERU5USVRZIiwiREVGQVVMVF9ESVNUQU5DRV9TQ0FMRVMiLCJwaXhlbHNQZXJNZXRlciIsIm1ldGVyc1BlclBpeGVsIiwicGl4ZWxzUGVyRGVncmVlIiwiZGVncmVlc1BlclBpeGVsIiwiREVGQVVMVF9aT09NIiwiRVJSX0FSR1VNRU5UIiwiVmlld3BvcnQiLCJvcHRzIiwiaWQiLCJ4IiwieSIsIndpZHRoIiwiaGVpZ2h0Iiwidmlld01hdHJpeCIsInByb2plY3Rpb25NYXRyaXgiLCJmb3Z5IiwibmVhciIsImZhciIsImxvbmdpdHVkZSIsImxhdGl0dWRlIiwiem9vbSIsInBvc2l0aW9uIiwibW9kZWxNYXRyaXgiLCJkaXN0YW5jZVNjYWxlcyIsImNvbnN0cnVjdG9yIiwiZGlzcGxheU5hbWUiLCJpc0dlb3NwYXRpYWwiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsInNjYWxlIiwiTWF0aCIsInBvdyIsImZvY2FsRGlzdGFuY2UiLCJtZXRlck9mZnNldCIsInZpZXdNYXRyaXhVbmNlbnRlcmVkIiwiY2VudGVyIiwibXVsdGlwbHlSaWdodCIsInRyYW5zbGF0ZSIsIm5lZ2F0ZSIsIkRFR1JFRVNfVE9fUkFESUFOUyIsIlBJIiwiZm92eVJhZGlhbnMiLCJhc3BlY3QiLCJfaW5pdE1hdHJpY2VzIiwiYmluZCIsInByb2plY3QiLCJ1bnByb2plY3QiLCJwcm9qZWN0RmxhdCIsInVucHJvamVjdEZsYXQiLCJnZXRNYXRyaWNlcyIsInZpZXdwb3J0IiwieHl6IiwidG9wTGVmdCIsIngwIiwieTAiLCJ6MCIsIlgiLCJZIiwidiIsInBpeGVsUHJvamVjdGlvbk1hdHJpeCIsInkyIiwibGVuZ3RoIiwidGFyZ2V0WiIsImNvb3JkMCIsInBpeGVsVW5wcm9qZWN0aW9uTWF0cml4IiwiY29vcmQxIiwiejEiLCJ0IiwidlVucHJvamVjdGVkIiwiX3Byb2plY3RGbGF0IiwiYXJndW1lbnRzIiwiX3VucHJvamVjdEZsYXQiLCJsbmdMYXQiLCJfYWRkTWV0ZXJzVG9MbmdMYXQiLCJtb2RlbFZpZXdQcm9qZWN0aW9uTWF0cml4Iiwidmlld1Byb2plY3Rpb25NYXRyaXgiLCJtYXRyaWNlcyIsIk9iamVjdCIsImFzc2lnbiIsImNhbWVyYVBvc2l0aW9uIiwiY2FtZXJhRGlyZWN0aW9uIiwiY2FtZXJhVXAiLCJsbmdMYXRaIiwibG5nIiwibGF0IiwiWiIsIl9tZXRlcnNUb0xuZ0xhdERlbHRhIiwiZGVsdGFMbmciLCJkZWx0YUxhdCIsImRlbHRhWiIsInoiLCJ2cG0iLCJ2aWV3TWF0cml4SW52ZXJzZSIsImV5ZSIsImRpcmVjdGlvbiIsInVwIiwibSIsIndhcm4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEdBQVAsTUFBZ0IsY0FBaEI7QUFDQSxTQUFRQyxlQUFSLEVBQXlCQyxVQUF6QixFQUFxQ0Msb0JBQXJDLFFBQWdFLHFCQUFoRTs7QUFFQSxTQUFRQyxPQUFSLEVBQWlCQyxPQUFqQixFQUEwQkMsaUJBQTFCLFFBQXVDLFNBQXZDO0FBQ0EsT0FBT0MsVUFBUCxNQUF1QixlQUF2QjtBQUNBLE9BQU9DLGNBQVAsTUFBMkIsbUJBQTNCO0FBQ0EsT0FBT0Ms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QVVBO0FBQ0EsVUFBTUMsSUFBSWxILFlBQVY7QUFDQUssaUJBQVc2RyxDQUFYLEVBQWNBLENBQWQsRUFBaUIsQ0FBQyxLQUFLckYsS0FBTCxHQUFhLENBQWQsRUFBaUIsQ0FBQyxLQUFLQyxNQUFOLEdBQWUsQ0FBaEMsRUFBbUMsQ0FBbkMsQ0FBakI7QUFDQXhCLHFCQUFlNEcsQ0FBZixFQUFrQkEsQ0FBbEIsRUFBcUIsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLEVBQVEsQ0FBUixDQUFyQjtBQUNBM0csb0JBQWMyRyxDQUFkLEVBQWlCQSxDQUFqQixFQUFvQixLQUFLckIsb0JBQXpCO0FBQ0EsV0FBS2hCLHFCQUFMLEdBQTZCcUMsQ0FBN0I7O0FBRUEsV0FBS2hDLHVCQUFMLEdBQStCMUUsWUFBWVIsWUFBWixFQUEwQixLQUFLNkUscUJBQS9CLENBQS9CO0FBQ0EsVUFBSSxDQUFDLEtBQUtLLHVCQUFWLEVBQW1DO0FBQ2pDcEYsWUFBSXFILElBQUosQ0FBUyxxQ0FBVDtBQUNBO0FBQ0Q7QUFDRjs7Ozs7O2VBMVdrQjNGLFE7OztBQTZXckJBLFNBQVNtQixXQUFULEdBQXVCLFVBQXZCIiwiZmlsZSI6InZpZXdwb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBsb2cgZnJvbSAnLi4vdXRpbHMvbG9nJztcbmltcG9ydCB7dHJhbnNmb3JtVmVjdG9yLCBjcmVhdGVNYXQ0LCBleHRyYWN0Q2FtZXJhVmVjdG9yc30gZnJvbSAnLi4vdXRpbHMvbWF0aC11dGlscyc7XG5cbmltcG9ydCB7TWF0cml4NCwgVmVjdG9yMywgZXF1YWxzfSBmcm9tICdtYXRoLmdsJztcbmltcG9ydCBtYXQ0X3NjYWxlIGZyb20gJ2dsLW1hdDQvc2NhbGUnO1xuaW1wb3J0IG1hdDRfdHJhbnNsYXRlIGZyb20gJ2dsLW1hdDQvdHJhbnNsYXRlJztcbmltcG9ydCBtYXQ0X211bHRpcGx5IGZyb20gJ2dsLW1hdDQvbXVsdGlwbHknO1xuaW1wb3J0IG1hdDRfaW52ZXJ0IGZyb20gJ2dsLW1hdDQvaW52ZXJ0JztcbmltcG9ydCBtYXQ0X3BlcnNwZWN0aXZlIGZyb20gJ2dsLW1hdDQvcGVyc3BlY3RpdmUnO1xuXG5pbXBvcnQgdmVjMl9sZXJwIGZyb20gJ2dsLXZlYzIvbGVycCc7XG5cbmNvbnN0IFpFUk9fVkVDVE9SID0gWzAsIDAsIDBdO1xuXG5pbXBvcnQge1xuICBnZXREaXN0YW5jZVNjYWxlcyxcbiAgZ2V0V29ybGRQb3NpdGlvbixcbiAgZ2V0TWV0ZXJab29tXG59IGZyb20gJ3ZpZXdwb3J0LW1lcmNhdG9yLXByb2plY3QnO1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IElERU5USVRZID0gY3JlYXRlTWF0NCgpO1xuXG5jb25zdCBERUZBVUxUX0RJU1RBTkNFX1NDQUxFUyA9IHtcbiAgcGl4ZWxzUGVyTWV0ZXI6IFsxLCAxLCAxXSxcbiAgbWV0ZXJzUGVyUGl4ZWw6IFsxLCAxLCAxXSxcbiAgcGl4ZWxzUGVyRGVncmVlOiBbMSwgMSwgMV0sXG4gIGRlZ3JlZXNQZXJQaXhlbDogWzEsIDEsIDFdXG59O1xuXG5jb25zdCBERUZBVUxUX1pPT00gPSAwO1xuXG5jb25zdCBFUlJfQVJHVU1FTlQgPSAnSWxsZWdhbCBhcmd1bWVudCB0byBWaWV3cG9ydCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZpZXdwb3J0IHtcbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogTWFuYWdlcyBjb29yZGluYXRlIHN5c3RlbSB0cmFuc2Zvcm1hdGlvbnMgZm9yIGRlY2suZ2wuXG4gICAqXG4gICAqIE5vdGU6IFRoZSBWaWV3cG9ydCBpcyBpbW11dGFibGUgaW4gdGhlIHNlbnNlIHRoYXQgaXQgb25seSBoYXMgYWNjZXNzb3JzLlxuICAgKiBBIG5ldyB2aWV3cG9ydCBpbnN0YW5jZSBzaG91bGQgYmUgY3JlYXRlZCBpZiBhbnkgcGFyYW1ldGVycyBoYXZlIGNoYW5nZWQuXG4gICAqL1xuICAvKiBlc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5LCBtYXgtc3RhdGVtZW50cyAqL1xuICBjb25zdHJ1Y3RvcihvcHRzID0ge30pIHtcbiAgICBjb25zdCB7XG4gICAgICBpZCA9IG51bGwsXG5cbiAgICAgIC8vIFdpbmRvdyB3aWR0aC9oZWlnaHQgaW4gcGl4ZWxzIChmb3IgcGl4ZWwgcHJvamVjdGlvbilcbiAgICAgIHggPSAwLFxuICAgICAgeSA9IDAsXG4gICAgICB3aWR0aCA9IDEsXG4gICAgICBoZWlnaHQgPSAxLFxuXG4gICAgICAvLyB2aWV3IG1hdHJpeFxuICAgICAgdmlld01hdHJpeCA9IElERU5USVRZLFxuXG4gICAgICAvLyBQcm9qZWN0aW9uIG1hdHJpeFxuICAgICAgcHJvamVjdGlvbk1hdHJpeCA9IG51bGwsXG5cbiAgICAgIC8vIFBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHBhcmFtZXRlcnMsIHVzZWQgaWYgcHJvamVjdGlvbk1hdHJpeCBub3Qgc3VwcGxpZWRcbiAgICAgIGZvdnkgPSA3NSxcbiAgICAgIG5lYXIgPSAwLjEsICAvLyBEaXN0YW5jZSBvZiBuZWFyIGNsaXBwaW5nIHBsYW5lXG4gICAgICBmYXIgPSAxMDAwLCAvLyBEaXN0YW5jZSBvZiBmYXIgY2xpcHBpbmcgcGxhbmVcblxuICAgICAgLy8gQW5jaG9yOiBsbmcgbGF0IHpvb20gd2lsbCBtYWtlIHRoaXMgdmlld3BvcnQgd29yayB3aXRoIGdlb3NwYXRpYWwgY29vcmRpbmF0ZSBzeXN0ZW1zXG4gICAgICBsb25naXR1ZGUgPSBudWxsLFxuICAgICAgbGF0aXR1ZGUgPSBudWxsLFxuICAgICAgem9vbSA9IG51bGwsXG5cbiAgICAgIC8vIEFuY2hvciBwb3NpdGlvbiBvZmZzZXQgKGluIG1ldGVycyBmb3IgZ2Vvc3BhdGlhbCB2aWV3cG9ydHMpXG4gICAgICBwb3NpdGlvbiA9IG51bGwsXG4gICAgICAvLyBBIG1vZGVsIG1hdHJpeCB0byBiZSBhcHBsaWVkIHRvIHBvc2l0aW9uLCB0byBtYXRjaCB0aGUgbGF5ZXIgcHJvcHMgQVBJXG4gICAgICBtb2RlbE1hdHJpeCA9IG51bGwsXG5cbiAgICAgIGRpc3RhbmNlU2NhbGVzID0gbnVsbFxuICAgIH0gPSBvcHRzO1xuXG4gICAgdGhpcy5pZCA9IGlkIHx8IHRoaXMuY29uc3RydWN0b3IuZGlzcGxheU5hbWUgfHwgJ3ZpZXdwb3J0JztcblxuICAgIC8vIENoZWNrIGlmIHdlIGhhdmUgYSBnZW9zcGF0aWFsIGFuY2hvclxuICAgIHRoaXMuaXNHZW9zcGF0aWFsID0gTnVtYmVyLmlzRmluaXRlKGxhdGl0dWRlKSAmJiBOdW1iZXIuaXNGaW5pdGUobG9uZ2l0dWRlKTtcblxuICAgIC8vIFNpbGVudGx5IGFsbG93IGFwcHMgdG8gc2VuZCBpbiB3LGggPSAwLDBcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoIHx8IDE7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgMTtcblxuICAgIHRoaXMuem9vbSA9IHpvb207XG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUodGhpcy56b29tKSkge1xuICAgICAgdGhpcy56b29tID0gdGhpcy5pc0dlb3NwYXRpYWwgPyBnZXRNZXRlclpvb20oe2xhdGl0dWRlfSkgOiBERUZBVUxUX1pPT007XG4gICAgfVxuICAgIHRoaXMuc2NhbGUgPSBNYXRoLnBvdygyLCB0aGlzLnpvb20pO1xuXG4gICAgLy8gQ2FsY3VsYXRlIGRpc3RhbmNlIHNjYWxlcyBpZiBsbmcvbGF0L3pvb20gYXJlIHByb3ZpZGVkXG4gICAgdGhpcy5kaXN0YW5jZVNjYWxlcyA9IHRoaXMuaXNHZW9zcGF0aWFsID9cbiAgICAgIGdldERpc3RhbmNlU2NhbGVzKHtsYXRpdHVkZSwgbG9uZ2l0dWRlLCBzY2FsZTogdGhpcy5zY2FsZX0pIDpcbiAgICAgIGRpc3RhbmNlU2NhbGVzIHx8IERFRkFVTFRfRElTVEFOQ0VfU0NBTEVTO1xuXG4gICAgdGhpcy5mb2NhbERpc3RhbmNlID0gb3B0cy5mb2NhbERpc3RhbmNlIHx8IDE7XG5cbiAgICB0aGlzLmRpc3RhbmNlU2NhbGVzLm1ldGVyc1BlclBpeGVsID0gbmV3IFZlY3RvcjModGhpcy5kaXN0YW5jZVNjYWxlcy5tZXRlcnNQZXJQaXhlbCk7XG4gICAgdGhpcy5kaXN0YW5jZVNjYWxlcy5waXhlbHNQZXJNZXRlciA9IG5ldyBWZWN0b3IzKHRoaXMuZGlzdGFuY2VTY2FsZXMucGl4ZWxzUGVyTWV0ZXIpO1xuXG4gICAgdGhpcy5wb3NpdGlvbiA9IFpFUk9fVkVDVE9SO1xuICAgIHRoaXMubWV0ZXJPZmZzZXQgPSBaRVJPX1ZFQ1RPUjtcbiAgICBpZiAocG9zaXRpb24pIHtcbiAgICAgIC8vIEFwcGx5IG1vZGVsIG1hdHJpeCBpZiBzdXBwbGllZFxuICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5tb2RlbE1hdHJpeCA9IG1vZGVsTWF0cml4O1xuICAgICAgdGhpcy5tZXRlck9mZnNldCA9IG1vZGVsTWF0cml4ID8gbW9kZWxNYXRyaXgudHJhbnNmb3JtVmVjdG9yKHBvc2l0aW9uKSA6IHBvc2l0aW9uO1xuICAgIH1cblxuICAgIHRoaXMudmlld01hdHJpeFVuY2VudGVyZWQgPSB2aWV3TWF0cml4O1xuXG4gICAgaWYgKHRoaXMuaXNHZW9zcGF0aWFsKSB7XG4gICAgICAvLyBEZXRlcm1pbmUgY2FtZXJhIGNlbnRlclxuICAgICAgdGhpcy5jZW50ZXIgPSBnZXRXb3JsZFBvc2l0aW9uKHtcbiAgICAgICAgbG9uZ2l0dWRlLCBsYXRpdHVkZSwgem9vbTogdGhpcy56b29tLCBtZXRlck9mZnNldDogdGhpcy5tZXRlck9mZnNldFxuICAgICAgfSk7XG5cbiAgICAgIC8vIE1ha2UgYSBjZW50ZXJlZCB2ZXJzaW9uIG9mIHRoZSBtYXRyaXggZm9yIHByb2plY3Rpb24gbW9kZXMgd2l0aG91dCBhbiBvZmZzZXRcbiAgICAgIHRoaXMudmlld01hdHJpeCA9IG5ldyBNYXRyaXg0KClcbiAgICAgIC8vIEFwcGx5IHRoZSB1bmNlbnRlcmVkIHZpZXcgbWF0cml4XG4gICAgICAgIC5tdWx0aXBseVJpZ2h0KHRoaXMudmlld01hdHJpeFVuY2VudGVyZWQpXG4gICAgICAgIC8vIFRoZSBNZXJjYXRvciB3b3JsZCBjb29yZGluYXRlIHN5c3RlbSBpcyB1cHBlciBsZWZ0LFxuICAgICAgICAvLyBidXQgR0wgZXhwZWN0cyBsb3dlciBsZWZ0LCBzbyB3ZSBmbGlwIGl0IGFyb3VuZCB0aGUgY2VudGVyIGFmdGVyIGFsbCB0cmFuc2Zvcm1zIGFyZSBkb25lXG4gICAgICAgIC5zY2FsZShbMSwgLTEsIDFdKVxuICAgICAgICAvLyBBbmQgY2VudGVyIGl0XG4gICAgICAgIC50cmFuc2xhdGUobmV3IFZlY3RvcjModGhpcy5jZW50ZXIgfHwgWkVST19WRUNUT1IpLm5lZ2F0ZSgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jZW50ZXIgPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMudmlld01hdHJpeCA9IHZpZXdNYXRyaXg7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGEgcHJvamVjdGlvbiBtYXRyaXggaWYgbm90IHN1cHBsaWVkXG4gICAgaWYgKHByb2plY3Rpb25NYXRyaXgpIHtcbiAgICAgIHRoaXMucHJvamVjdGlvbk1hdHJpeCA9IHByb2plY3Rpb25NYXRyaXg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFzc2VydChOdW1iZXIuaXNGaW5pdGUoZm92eSkpO1xuICAgICAgY29uc3QgREVHUkVFU19UT19SQURJQU5TID0gTWF0aC5QSSAvIDE4MDtcbiAgICAgIGNvbnN0IGZvdnlSYWRpYW5zID0gZm92eSAqIERFR1JFRVNfVE9fUkFESUFOUztcbiAgICAgIGNvbnN0IGFzcGVjdCA9IHRoaXMud2lkdGggLyB0aGlzLmhlaWdodDtcbiAgICAgIHRoaXMucHJvamVjdGlvbk1hdHJpeCA9IG1hdDRfcGVyc3BlY3RpdmUoW10sIGZvdnlSYWRpYW5zLCBhc3BlY3QsIG5lYXIsIGZhcik7XG4gICAgfVxuXG4gICAgLy8gSW5pdCBwaXhlbCBtYXRyaWNlc1xuICAgIHRoaXMuX2luaXRNYXRyaWNlcygpO1xuXG4gICAgLy8gQmluZCBtZXRob2RzIGZvciBlYXN5IGFjY2Vzc1xuICAgIHRoaXMuZXF1YWxzID0gdGhpcy5lcXVhbHMuYmluZCh0aGlzKTtcbiAgICB0aGlzLnByb2plY3QgPSB0aGlzLnByb2plY3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLnVucHJvamVjdCA9IHRoaXMudW5wcm9qZWN0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5wcm9qZWN0RmxhdCA9IHRoaXMucHJvamVjdEZsYXQuYmluZCh0aGlzKTtcbiAgICB0aGlzLnVucHJvamVjdEZsYXQgPSB0aGlzLnVucHJvamVjdEZsYXQuYmluZCh0aGlzKTtcbiAgICB0aGlzLmdldE1hdHJpY2VzID0gdGhpcy5nZXRNYXRyaWNlcy5iaW5kKHRoaXMpO1xuICB9XG4gIC8qIGVzbGludC1lbmFibGUgY29tcGxleGl0eSwgbWF4LXN0YXRlbWVudHMgKi9cblxuICAvLyBUd28gdmlld3BvcnRzIGFyZSBlcXVhbCBpZiB3aWR0aCBhbmQgaGVpZ2h0IGFyZSBpZGVudGljYWwsIGFuZCBpZlxuICAvLyB0aGVpciB2aWV3IGFuZCBwcm9qZWN0aW9uIG1hdHJpY2VzIGFyZSAoYXBwcm94aW1hdGVseSkgZXF1YWwuXG4gIGVxdWFscyh2aWV3cG9ydCkge1xuICAgIGlmICghKHZpZXdwb3J0IGluc3RhbmNlb2YgVmlld3BvcnQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZpZXdwb3J0LndpZHRoID09PSB0aGlzLndpZHRoICYmXG4gICAgICB2aWV3cG9ydC5oZWlnaHQgPT09IHRoaXMuaGVpZ2h0ICYmXG4gICAgICBlcXVhbHModmlld3BvcnQucHJvamVjdGlvbk1hdHJpeCwgdGhpcy5wcm9qZWN0aW9uTWF0cml4KSAmJlxuICAgICAgZXF1YWxzKHZpZXdwb3J0LnZpZXdNYXRyaXgsIHRoaXMudmlld01hdHJpeCk7XG4gICAgICAvLyBUT0RPIC0gY2hlY2sgZGlzdGFuY2Ugc2NhbGVzP1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2plY3RzIHh5eiAocG9zc2libHkgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSkgdG8gcGl4ZWwgY29vcmRpbmF0ZXMgaW4gd2luZG93XG4gICAqIHVzaW5nIHZpZXdwb3J0IHByb2plY3Rpb24gcGFyYW1ldGVyc1xuICAgKiAtIFtsb25naXR1ZGUsIGxhdGl0dWRlXSB0byBbeCwgeV1cbiAgICogLSBbbG9uZ2l0dWRlLCBsYXRpdHVkZSwgWl0gPT4gW3gsIHksIHpdXG4gICAqIE5vdGU6IEJ5IGRlZmF1bHQsIHJldHVybnMgdG9wLWxlZnQgY29vcmRpbmF0ZXMgZm9yIGNhbnZhcy9TVkcgdHlwZSByZW5kZXJcbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gbG5nTGF0WiAtIFtsbmcsIGxhdF0gb3IgW2xuZywgbGF0LCBaXVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cyAtIG9wdGlvbnNcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMudG9wTGVmdD10cnVlIC0gV2hldGhlciBwcm9qZWN0ZWQgY29vcmRzIGFyZSB0b3AgbGVmdFxuICAgKiBAcmV0dXJuIHtBcnJheX0gLSBbeCwgeV0gb3IgW3gsIHksIHpdIGluIHRvcCBsZWZ0IGNvb3Jkc1xuICAgKi9cbiAgcHJvamVjdCh4eXosIHt0b3BMZWZ0ID0gdHJ1ZX0gPSB7fSkge1xuICAgIGNvbnN0IFt4MCwgeTAsIHowID0gMF0gPSB4eXo7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZSh4MCkgJiYgTnVtYmVyLmlzRmluaXRlKHkwKSAmJiBOdW1iZXIuaXNGaW5pdGUoejApLCBFUlJfQVJHVU1FTlQpO1xuXG4gICAgY29uc3QgW1gsIFldID0gdGhpcy5wcm9qZWN0RmxhdChbeDAsIHkwXSk7XG4gICAgY29uc3QgdiA9IHRyYW5zZm9ybVZlY3Rvcih0aGlzLnBpeGVsUHJvamVjdGlvbk1hdHJpeCwgW1gsIFksIHowLCAxXSk7XG5cbiAgICBjb25zdCBbeCwgeV0gPSB2O1xuICAgIGNvbnN0IHkyID0gdG9wTGVmdCA/IHkgOiB0aGlzLmhlaWdodCAtIHk7XG4gICAgcmV0dXJuIHh5ei5sZW5ndGggPT09IDIgPyBbeCwgeTJdIDogW3gsIHkyLCAwXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnByb2plY3QgcGl4ZWwgY29vcmRpbmF0ZXMgb24gc2NyZWVuIG9udG8gd29ybGQgY29vcmRpbmF0ZXMsXG4gICAqIChwb3NzaWJseSBbbG9uLCBsYXRdKSBvbiBtYXAuXG4gICAqIC0gW3gsIHldID0+IFtsbmcsIGxhdF1cbiAgICogLSBbeCwgeSwgel0gPT4gW2xuZywgbGF0LCBaXVxuICAgKiBAcGFyYW0ge0FycmF5fSB4eXogLVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cyAtIG9wdGlvbnNcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMudG9wTGVmdD10cnVlIC0gV2hldGhlciBvcmlnaW4gaXMgdG9wIGxlZnRcbiAgICogQHJldHVybiB7QXJyYXl8bnVsbH0gLSBbbG5nLCBsYXQsIFpdIG9yIFtYLCBZLCBaXVxuICAgKi9cbiAgdW5wcm9qZWN0KHh5eiwge3RvcExlZnQgPSB0cnVlfSA9IHt9KSB7XG4gICAgY29uc3QgW3gsIHksIHRhcmdldFogPSAwXSA9IHh5ejtcblxuICAgIGNvbnN0IHkyID0gdG9wTGVmdCA/IHkgOiB0aGlzLmhlaWdodCAtIHk7XG5cbiAgICAvLyBzaW5jZSB3ZSBkb24ndCBrbm93IHRoZSBjb3JyZWN0IHByb2plY3RlZCB6IHZhbHVlIGZvciB0aGUgcG9pbnQsXG4gICAgLy8gdW5wcm9qZWN0IHR3byBwb2ludHMgdG8gZ2V0IGEgbGluZSBhbmQgdGhlbiBmaW5kIHRoZSBwb2ludCBvbiB0aGF0IGxpbmUgd2l0aCB6PTBcbiAgICBjb25zdCBjb29yZDAgPSB0cmFuc2Zvcm1WZWN0b3IodGhpcy5waXhlbFVucHJvamVjdGlvbk1hdHJpeCwgW3gsIHkyLCAwLCAxXSk7XG4gICAgY29uc3QgY29vcmQxID0gdHJhbnNmb3JtVmVjdG9yKHRoaXMucGl4ZWxVbnByb2plY3Rpb25NYXRyaXgsIFt4LCB5MiwgMSwgMV0pO1xuXG4gICAgaWYgKCFjb29yZDAgfHwgIWNvb3JkMSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgejAgPSBjb29yZDBbMl07XG4gICAgY29uc3QgejEgPSBjb29yZDFbMl07XG5cbiAgICBjb25zdCB0ID0gejAgPT09IHoxID8gMCA6ICh0YXJnZXRaIC0gejApIC8gKHoxIC0gejApO1xuICAgIGNvbnN0IHYgPSB2ZWMyX2xlcnAoW10sIGNvb3JkMCwgY29vcmQxLCB0KTtcblxuICAgIGNvbnN0IHZVbnByb2plY3RlZCA9IHRoaXMudW5wcm9qZWN0RmxhdCh2KTtcbiAgICByZXR1cm4geHl6Lmxlbmd0aCA9PT0gMiA/IHZVbnByb2plY3RlZCA6IFt2VW5wcm9qZWN0ZWRbMF0sIHZVbnByb2plY3RlZFsxXSwgMF07XG4gIH1cblxuICAvLyBOT05fTElORUFSIFBST0pFQ1RJT04gSE9PS1NcbiAgLy8gVXNlZCBmb3Igd2ViIG1lcmFjdG9yIHByb2plY3Rpb25cblxuICAvKipcbiAgICogUHJvamVjdCBbbG5nLGxhdF0gb24gc3BoZXJlIG9udG8gW3gseV0gb24gNTEyKjUxMiBNZXJjYXRvciBab29tIDAgdGlsZS5cbiAgICogUGVyZm9ybXMgdGhlIG5vbmxpbmVhciBwYXJ0IG9mIHRoZSB3ZWIgbWVyY2F0b3IgcHJvamVjdGlvbi5cbiAgICogUmVtYWluaW5nIHByb2plY3Rpb24gaXMgZG9uZSB3aXRoIDR4NCBtYXRyaWNlcyB3aGljaCBhbHNvIGhhbmRsZXNcbiAgICogcGVyc3BlY3RpdmUuXG4gICAqIEBwYXJhbSB7QXJyYXl9IGxuZ0xhdCAtIFtsbmcsIGxhdF0gY29vcmRpbmF0ZXNcbiAgICogICBTcGVjaWZpZXMgYSBwb2ludCBvbiB0aGUgc3BoZXJlIHRvIHByb2plY3Qgb250byB0aGUgbWFwLlxuICAgKiBAcmV0dXJuIHtBcnJheX0gW3gseV0gY29vcmRpbmF0ZXMuXG4gICAqL1xuICBwcm9qZWN0RmxhdChbeCwgeV0sIHNjYWxlID0gdGhpcy5zY2FsZSkge1xuICAgIHJldHVybiB0aGlzLl9wcm9qZWN0RmxhdCguLi5hcmd1bWVudHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVucHJvamVjdCB3b3JsZCBwb2ludCBbeCx5XSBvbiBtYXAgb250byB7bGF0LCBsb259IG9uIHNwaGVyZVxuICAgKiBAcGFyYW0ge29iamVjdHxWZWN0b3J9IHh5IC0gb2JqZWN0IHdpdGgge3gseX0gbWVtYmVyc1xuICAgKiAgcmVwcmVzZW50aW5nIHBvaW50IG9uIHByb2plY3RlZCBtYXAgcGxhbmVcbiAgICogQHJldHVybiB7R2VvQ29vcmRpbmF0ZXN9IC0gb2JqZWN0IHdpdGgge2xhdCxsb259IG9mIHBvaW50IG9uIHNwaGVyZS5cbiAgICogICBIYXMgdG9BcnJheSBtZXRob2QgaWYgeW91IG5lZWQgYSBHZW9KU09OIEFycmF5LlxuICAgKiAgIFBlciBjYXJ0b2dyYXBoaWMgdHJhZGl0aW9uLCBsYXQgYW5kIGxvbiBhcmUgc3BlY2lmaWVkIGFzIGRlZ3JlZXMuXG4gICAqL1xuICB1bnByb2plY3RGbGF0KHh5eiwgc2NhbGUgPSB0aGlzLnNjYWxlKSB7XG4gICAgcmV0dXJuIHRoaXMuX3VucHJvamVjdEZsYXQoLi4uYXJndW1lbnRzKTtcbiAgfVxuXG4gIC8vIFRPRE8gLSB3aHkgZG8gd2UgbmVlZCB0aGVzZT9cbiAgX3Byb2plY3RGbGF0KHh5eiwgc2NhbGUgPSB0aGlzLnNjYWxlKSB7XG4gICAgcmV0dXJuIHh5ejtcbiAgfVxuXG4gIF91bnByb2plY3RGbGF0KHh5eiwgc2NhbGUgPSB0aGlzLnNjYWxlKSB7XG4gICAgcmV0dXJuIHh5ejtcbiAgfVxuXG4gIGdldE1lcmNhdG9yUGFyYW1zKCkge1xuICAgIGNvbnN0IGxuZ0xhdCA9IHRoaXMuX2FkZE1ldGVyc1RvTG5nTGF0KFxuICAgICAgW3RoaXMubG9uZ2l0dWRlIHx8IDAsIHRoaXMubGF0aXR1ZGUgfHwgMF0sXG4gICAgICB0aGlzLm1ldGVyT2Zmc2V0XG4gICAgKTtcbiAgICByZXR1cm4ge1xuICAgICAgbG9uZ2l0dWRlOiBsbmdMYXRbMF0sXG4gICAgICBsYXRpdHVkZTogbG5nTGF0WzFdXG4gICAgfTtcbiAgfVxuXG4gIGlzTWFwU3luY2hlZCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBnZXREaXN0YW5jZVNjYWxlcygpIHtcbiAgICByZXR1cm4gdGhpcy5kaXN0YW5jZVNjYWxlcztcbiAgfVxuXG4gIGdldE1hdHJpY2VzKHttb2RlbE1hdHJpeCA9IG51bGx9ID0ge30pIHtcbiAgICBsZXQgbW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCA9IHRoaXMudmlld1Byb2plY3Rpb25NYXRyaXg7XG4gICAgbGV0IHBpeGVsUHJvamVjdGlvbk1hdHJpeCA9IHRoaXMucGl4ZWxQcm9qZWN0aW9uTWF0cml4O1xuICAgIGxldCBwaXhlbFVucHJvamVjdGlvbk1hdHJpeCA9IHRoaXMucGl4ZWxVbnByb2plY3Rpb25NYXRyaXg7XG5cbiAgICBpZiAobW9kZWxNYXRyaXgpIHtcbiAgICAgIG1vZGVsVmlld1Byb2plY3Rpb25NYXRyaXggPSBtYXQ0X211bHRpcGx5KFtdLCB0aGlzLnZpZXdQcm9qZWN0aW9uTWF0cml4LCBtb2RlbE1hdHJpeCk7XG4gICAgICBwaXhlbFByb2plY3Rpb25NYXRyaXggPSBtYXQ0X211bHRpcGx5KFtdLCB0aGlzLnBpeGVsUHJvamVjdGlvbk1hdHJpeCwgbW9kZWxNYXRyaXgpO1xuICAgICAgcGl4ZWxVbnByb2plY3Rpb25NYXRyaXggPSBtYXQ0X2ludmVydChbXSwgcGl4ZWxQcm9qZWN0aW9uTWF0cml4KTtcbiAgICB9XG5cbiAgICBjb25zdCBtYXRyaWNlcyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgbW9kZWxWaWV3UHJvamVjdGlvbk1hdHJpeCxcbiAgICAgIHZpZXdQcm9qZWN0aW9uTWF0cml4OiB0aGlzLnZpZXdQcm9qZWN0aW9uTWF0cml4LFxuICAgICAgdmlld01hdHJpeDogdGhpcy52aWV3TWF0cml4LFxuICAgICAgcHJvamVjdGlvbk1hdHJpeDogdGhpcy5wcm9qZWN0aW9uTWF0cml4LFxuXG4gICAgICAvLyBwcm9qZWN0L3VucHJvamVjdCBiZXR3ZWVuIHBpeGVscyBhbmQgd29ybGRcbiAgICAgIHBpeGVsUHJvamVjdGlvbk1hdHJpeCxcbiAgICAgIHBpeGVsVW5wcm9qZWN0aW9uTWF0cml4LFxuXG4gICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICBzY2FsZTogdGhpcy5zY2FsZVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG1hdHJpY2VzO1xuICB9XG5cbiAgLy8gRVhQRVJJTUVOVEFMIE1FVEhPRFNcblxuICBnZXRDYW1lcmFQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5jYW1lcmFQb3NpdGlvbjtcbiAgfVxuXG4gIGdldENhbWVyYURpcmVjdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5jYW1lcmFEaXJlY3Rpb247XG4gIH1cblxuICBnZXRDYW1lcmFVcCgpIHtcbiAgICByZXR1cm4gdGhpcy5jYW1lcmFVcDtcbiAgfVxuXG4gIC8vIFRPRE8gLSB0aGVzZSBhcmUgZHVwbGljYXRpbmcgV2ViTWVyY2F0b3IgbWV0aG9kc1xuICBfYWRkTWV0ZXJzVG9MbmdMYXQobG5nTGF0WiwgeHl6KSB7XG4gICAgY29uc3QgW2xuZywgbGF0LCBaID0gMF0gPSBsbmdMYXRaO1xuICAgIGNvbnN0IFtkZWx0YUxuZywgZGVsdGFMYXQsIGRlbHRhWiA9IDBdID0gdGhpcy5fbWV0ZXJzVG9MbmdMYXREZWx0YSh4eXopO1xuICAgIHJldHVybiBsbmdMYXRaLmxlbmd0aCA9PT0gMiA/XG4gICAgICBbbG5nICsgZGVsdGFMbmcsIGxhdCArIGRlbHRhTGF0XSA6XG4gICAgICBbbG5nICsgZGVsdGFMbmcsIGxhdCArIGRlbHRhTGF0LCBaICsgZGVsdGFaXTtcbiAgfVxuXG4gIF9tZXRlcnNUb0xuZ0xhdERlbHRhKHh5eikge1xuICAgIGNvbnN0IFt4LCB5LCB6ID0gMF0gPSB4eXo7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZSh4KSAmJiBOdW1iZXIuaXNGaW5pdGUoeSkgJiYgTnVtYmVyLmlzRmluaXRlKHopLCBFUlJfQVJHVU1FTlQpO1xuICAgIGNvbnN0IHtwaXhlbHNQZXJNZXRlciwgZGVncmVlc1BlclBpeGVsfSA9IHRoaXMuZGlzdGFuY2VTY2FsZXM7XG4gICAgY29uc3QgZGVsdGFMbmcgPSB4ICogcGl4ZWxzUGVyTWV0ZXJbMF0gKiBkZWdyZWVzUGVyUGl4ZWxbMF07XG4gICAgY29uc3QgZGVsdGFMYXQgPSB5ICogcGl4ZWxzUGVyTWV0ZXJbMV0gKiBkZWdyZWVzUGVyUGl4ZWxbMV07XG4gICAgcmV0dXJuIHh5ei5sZW5ndGggPT09IDIgPyBbZGVsdGFMbmcsIGRlbHRhTGF0XSA6IFtkZWx0YUxuZywgZGVsdGFMYXQsIHpdO1xuICB9XG5cbiAgLy8gSU5URVJOQUwgTUVUSE9EU1xuXG4gIF9pbml0TWF0cmljZXMoKSB7XG4gICAgLy8gTm90ZTogQXMgdXN1YWwsIG1hdHJpeCBvcGVyYXRpb25zIHNob3VsZCBiZSBhcHBsaWVkIGluIFwicmV2ZXJzZVwiIG9yZGVyXG4gICAgLy8gc2luY2UgdmVjdG9ycyB3aWxsIGJlIG11bHRpcGxpZWQgaW4gZnJvbSB0aGUgcmlnaHQgZHVyaW5nIHRyYW5zZm9ybWF0aW9uXG4gICAgY29uc3QgdnBtID0gY3JlYXRlTWF0NCgpO1xuICAgIG1hdDRfbXVsdGlwbHkodnBtLCB2cG0sIHRoaXMucHJvamVjdGlvbk1hdHJpeCk7XG4gICAgbWF0NF9tdWx0aXBseSh2cG0sIHZwbSwgdGhpcy52aWV3TWF0cml4KTtcbiAgICB0aGlzLnZpZXdQcm9qZWN0aW9uTWF0cml4ID0gdnBtO1xuXG4gICAgLy8gY29uc29sZS5sb2coJ1ZQTScsIHRoaXMudmlld01hdHJpeCwgdGhpcy5wcm9qZWN0aW9uTWF0cml4LCB0aGlzLnZpZXdQcm9qZWN0aW9uTWF0cml4KTtcblxuICAgIC8vIENhbGN1bGF0ZSBpbnZlcnNlIHZpZXcgbWF0cml4XG4gICAgdGhpcy52aWV3TWF0cml4SW52ZXJzZSA9IG1hdDRfaW52ZXJ0KFtdLCB0aGlzLnZpZXdNYXRyaXgpIHx8IHRoaXMudmlld01hdHJpeDtcblxuICAgIC8vIERlY29tcG9zZSBjYW1lcmEgZGlyZWN0aW9uc1xuICAgIGNvbnN0IHtleWUsIGRpcmVjdGlvbiwgdXB9ID0gZXh0cmFjdENhbWVyYVZlY3RvcnMoe1xuICAgICAgdmlld01hdHJpeDogdGhpcy52aWV3TWF0cml4LFxuICAgICAgdmlld01hdHJpeEludmVyc2U6IHRoaXMudmlld01hdHJpeEludmVyc2VcbiAgICB9KTtcbiAgICB0aGlzLmNhbWVyYVBvc2l0aW9uID0gZXllO1xuICAgIHRoaXMuY2FtZXJhRGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIHRoaXMuY2FtZXJhVXAgPSB1cDtcblxuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuY2FtZXJhUG9zaXRpb24sIHRoaXMuY2FtZXJhRGlyZWN0aW9uLCB0aGlzLmNhbWVyYVVwKTtcblxuICAgIC8qXG4gICAgICogQnVpbGRzIG1hdHJpY2VzIHRoYXQgY29udmVydHMgcHJlcHJvamVjdGVkIGxuZ0xhdHMgdG8gc2NyZWVuIHBpeGVsc1xuICAgICAqIGFuZCB2aWNlIHZlcnNhLlxuICAgICAqIE5vdGU6IEN1cnJlbnRseSByZXR1cm5zIGJvdHRvbS1sZWZ0IGNvb3JkaW5hdGVzIVxuICAgICAqIE5vdGU6IFN0YXJ0cyB3aXRoIHRoZSBHTCBwcm9qZWN0aW9uIG1hdHJpeCBhbmQgYWRkcyBzdGVwcyB0byB0aGVcbiAgICAgKiAgICAgICBzY2FsZSBhbmQgdHJhbnNsYXRlIHRoYXQgbWF0cml4IG9udG8gdGhlIHdpbmRvdy5cbiAgICAgKiBOb3RlOiBXZWJHTCBjb250cm9scyBjbGlwIHNwYWNlIHRvIHNjcmVlbiBwcm9qZWN0aW9uIHdpdGggZ2wudmlld3BvcnRcbiAgICAgKiAgICAgICBhbmQgZG9lcyBub3QgbmVlZCB0aGlzIHN0ZXAuXG4gICAgICovXG5cbiAgICAvLyBtYXRyaXggZm9yIGNvbnZlcnNpb24gZnJvbSB3b3JsZCBsb2NhdGlvbiB0byBzY3JlZW4gKHBpeGVsKSBjb29yZGluYXRlc1xuICAgIGNvbnN0IG0gPSBjcmVhdGVNYXQ0KCk7XG4gICAgbWF0NF9zY2FsZShtLCBtLCBbdGhpcy53aWR0aCAvIDIsIC10aGlzLmhlaWdodCAvIDIsIDFdKTtcbiAgICBtYXQ0X3RyYW5zbGF0ZShtLCBtLCBbMSwgLTEsIDBdKTtcbiAgICBtYXQ0X211bHRpcGx5KG0sIG0sIHRoaXMudmlld1Byb2plY3Rpb25NYXRyaXgpO1xuICAgIHRoaXMucGl4ZWxQcm9qZWN0aW9uTWF0cml4ID0gbTtcblxuICAgIHRoaXMucGl4ZWxVbnByb2plY3Rpb25NYXRyaXggPSBtYXQ0X2ludmVydChjcmVhdGVNYXQ0KCksIHRoaXMucGl4ZWxQcm9qZWN0aW9uTWF0cml4KTtcbiAgICBpZiAoIXRoaXMucGl4ZWxVbnByb2plY3Rpb25NYXRyaXgpIHtcbiAgICAgIGxvZy53YXJuKCdQaXhlbCBwcm9qZWN0IG1hdHJpeCBub3QgaW52ZXJ0aWJsZScpO1xuICAgICAgLy8gdGhyb3cgbmV3IEVycm9yKCdQaXhlbCBwcm9qZWN0IG1hdHJpeCBub3QgaW52ZXJ0aWJsZScpO1xuICAgIH1cbiAgfVxufVxuXG5WaWV3cG9ydC5kaXNwbGF5TmFtZSA9ICdWaWV3cG9ydCc7XG4iXX0=
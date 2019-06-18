var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

// View and Projection Matrix calculations for mapbox-js style
// map view properties
import Viewport from './viewport';

import { projectFlat, unprojectFlat, getProjectionMatrix, getUncenteredViewMatrix, fitBounds as _fitBounds } from 'viewport-mercator-project';

// TODO - import from viewport-mercator-project
// import {fitBounds} from '../viewport-mercator-project/fit-bounds';

// TODO - import from math.gl
/* eslint-disable camelcase */
import vec2_add from 'gl-vec2/add';
import vec2_negate from 'gl-vec2/negate';

import assert from 'assert';

var ERR_ARGUMENT = 'Illegal argument to WebMercatorViewport';

var WebMercatorViewport = function (_Viewport) {
  _inherits(WebMercatorViewport, _Viewport);

  /**
   * @classdesc
   * Creates view/projection matrices from mercator params
   * Note: The Viewport is immutable in the sense that it only has accessors.
   * A new viewport instance should be created if any parameters have changed.
   */
  /* eslint-disable complexity, max-statements */
  function WebMercatorViewport() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, WebMercatorViewport);

    var _opts$latitude = opts.latitude,
        latitude = _opts$latitude === undefined ? 0 : _opts$latitude,
        _opts$longitude = opts.longitude,
        longitude = _opts$longitude === undefined ? 0 : _opts$longitude,
        _opts$zoom = opts.zoom,
        zoom = _opts$zoom === undefined ? 11 : _opts$zoom,
        _opts$pitch = opts.pitch,
        pitch = _opts$pitch === undefined ? 0 : _opts$pitch,
        _opts$bearing = opts.bearing,
        bearing = _opts$bearing === undefined ? 0 : _opts$bearing,
        _opts$farZMultiplier = opts.farZMultiplier,
        farZMultiplier = _opts$farZMultiplier === undefined ? 10 : _opts$farZMultiplier;
    var width = opts.width,
        height = opts.height,
        _opts$altitude = opts.altitude,
        altitude = _opts$altitude === undefined ? 1.5 : _opts$altitude;

    // Silently allow apps to send in 0,0 to facilitate isomorphic render etc

    width = width || 1;
    height = height || 1;

    // Altitude - prevent division by 0
    // TODO - just throw an Error instead?
    altitude = Math.max(0.75, altitude);

    var projectionMatrix = getProjectionMatrix({
      width: width,
      height: height,
      pitch: pitch,
      altitude: altitude,
      farZMultiplier: farZMultiplier
    });

    // The uncentered matrix allows us two move the center addition to the
    // shader (cheap) which gives a coordinate system that has its center in
    // the layer's center position. This makes rotations and other modelMatrx
    // transforms much more useful.
    var viewMatrixUncentered = getUncenteredViewMatrix({
      height: height,
      pitch: pitch,
      bearing: bearing,
      altitude: altitude
    });

    // Save parameters
    var _this = _possibleConstructorReturn(this, (WebMercatorViewport.__proto__ || Object.getPrototypeOf(WebMercatorViewport)).call(this, Object.assign({}, opts, {
      // x, y, position, ...
      // TODO / hack - prevent vertical offsets if not FirstPersonViewport
      position: opts.position && [opts.position[0], opts.position[1], 0],
      width: width, height: height,
      viewMatrix: viewMatrixUncentered,
      longitude: longitude,
      latitude: latitude,
      zoom: zoom,
      projectionMatrix: projectionMatrix,
      focalDistance: 1 // Viewport is already carefully set up to "focus" on ground
    })));

    _this.latitude = latitude;
    _this.longitude = longitude;
    _this.zoom = zoom;
    _this.pitch = pitch;
    _this.bearing = bearing;
    _this.altitude = altitude;

    // Bind methods
    _this.metersToLngLatDelta = _this.metersToLngLatDelta.bind(_this);
    _this.lngLatDeltaToMeters = _this.lngLatDeltaToMeters.bind(_this);
    _this.addMetersToLngLat = _this.addMetersToLngLat.bind(_this);

    Object.freeze(_this);
    return _this;
  }
  /* eslint-enable complexity, max-statements */

  /**
   * Project [lng,lat] on sphere onto [x,y] on 512*512 Mercator Zoom 0 tile.
   * Performs the nonlinear part of the web mercator projection.
   * Remaining projection is done with 4x4 matrices which also handles
   * perspective.
   *
   * @param {Array} lngLat - [lng, lat] coordinates
   *   Specifies a point on the sphere to project onto the map.
   * @return {Array} [x,y] coordinates.
   */


  _createClass(WebMercatorViewport, [{
    key: '_projectFlat',
    value: function _projectFlat(lngLat) {
      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;

      return projectFlat(lngLat, scale);
    }

    /**
     * Unproject world point [x,y] on map onto {lat, lon} on sphere
     *
     * @param {object|Vector} xy - object with {x,y} members
     *  representing point on projected map plane
     * @return {GeoCoordinates} - object with {lat,lon} of point on sphere.
     *   Has toArray method if you need a GeoJSON Array.
     *   Per cartographic tradition, lat and lon are specified as degrees.
     */

  }, {
    key: '_unprojectFlat',
    value: function _unprojectFlat(xy) {
      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;

      return unprojectFlat(xy, scale);
    }

    /**
     * Converts a meter offset to a lnglat offset
     *
     * Note: Uses simple linear approximation around the viewport center
     * Error increases with size of offset (roughly 1% per 100km)
     *
     * @param {[Number,Number]|[Number,Number,Number]) xyz - array of meter deltas
     * @return {[Number,Number]|[Number,Number,Number]) - array of [lng,lat,z] deltas
     */

  }, {
    key: 'metersToLngLatDelta',
    value: function metersToLngLatDelta(xyz) {
      var _xyz = _slicedToArray(xyz, 3),
          x = _xyz[0],
          y = _xyz[1],
          _xyz$ = _xyz[2],
          z = _xyz$ === undefined ? 0 : _xyz$;

      assert(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z), ERR_ARGUMENT);
      var _distanceScales = this.distanceScales,
          pixelsPerMeter = _distanceScales.pixelsPerMeter,
          degreesPerPixel = _distanceScales.degreesPerPixel;

      var deltaLng = x * pixelsPerMeter[0] * degreesPerPixel[0];
      var deltaLat = y * pixelsPerMeter[1] * degreesPerPixel[1];
      return xyz.length === 2 ? [deltaLng, deltaLat] : [deltaLng, deltaLat, z];
    }

    /**
     * Converts a lnglat offset to a meter offset
     *
     * Note: Uses simple linear approximation around the viewport center
     * Error increases with size of offset (roughly 1% per 100km)
     *
     * @param {[Number,Number]|[Number,Number,Number]) deltaLngLatZ - array of [lng,lat,z] deltas
     * @return {[Number,Number]|[Number,Number,Number]) - array of meter deltas
     */

  }, {
    key: 'lngLatDeltaToMeters',
    value: function lngLatDeltaToMeters(deltaLngLatZ) {
      var _deltaLngLatZ = _slicedToArray(deltaLngLatZ, 3),
          deltaLng = _deltaLngLatZ[0],
          deltaLat = _deltaLngLatZ[1],
          _deltaLngLatZ$ = _deltaLngLatZ[2],
          deltaZ = _deltaLngLatZ$ === undefined ? 0 : _deltaLngLatZ$;

      assert(Number.isFinite(deltaLng) && Number.isFinite(deltaLat) && Number.isFinite(deltaZ), ERR_ARGUMENT);
      var _distanceScales2 = this.distanceScales,
          pixelsPerDegree = _distanceScales2.pixelsPerDegree,
          metersPerPixel = _distanceScales2.metersPerPixel;

      var deltaX = deltaLng * pixelsPerDegree[0] * metersPerPixel[0];
      var deltaY = deltaLat * pixelsPerDegree[1] * metersPerPixel[1];
      return deltaLngLatZ.length === 2 ? [deltaX, deltaY] : [deltaX, deltaY, deltaZ];
    }

    /**
     * Add a meter delta to a base lnglat coordinate, returning a new lnglat array
     *
     * Note: Uses simple linear approximation around the viewport center
     * Error increases with size of offset (roughly 1% per 100km)
     *
     * @param {[Number,Number]|[Number,Number,Number]) lngLatZ - base coordinate
     * @param {[Number,Number]|[Number,Number,Number]) xyz - array of meter deltas
     * @return {[Number,Number]|[Number,Number,Number]) array of [lng,lat,z] deltas
     */

  }, {
    key: 'addMetersToLngLat',
    value: function addMetersToLngLat(lngLatZ, xyz) {
      var _lngLatZ = _slicedToArray(lngLatZ, 3),
          lng = _lngLatZ[0],
          lat = _lngLatZ[1],
          _lngLatZ$ = _lngLatZ[2],
          Z = _lngLatZ$ === undefined ? 0 : _lngLatZ$;

      var _metersToLngLatDelta = this.metersToLngLatDelta(xyz),
          _metersToLngLatDelta2 = _slicedToArray(_metersToLngLatDelta, 3),
          deltaLng = _metersToLngLatDelta2[0],
          deltaLat = _metersToLngLatDelta2[1],
          _metersToLngLatDelta3 = _metersToLngLatDelta2[2],
          deltaZ = _metersToLngLatDelta3 === undefined ? 0 : _metersToLngLatDelta3;

      return lngLatZ.length === 2 ? [lng + deltaLng, lat + deltaLat] : [lng + deltaLng, lat + deltaLat, Z + deltaZ];
    }

    /**
     * Get the map center that place a given [lng, lat] coordinate at screen
     * point [x, y]
     *
     * @param {Array} lngLat - [lng,lat] coordinates
     *   Specifies a point on the sphere.
     * @param {Array} pos - [x,y] coordinates
     *   Specifies a point on the screen.
     * @return {Array} [lng,lat] new map center.
     */

  }, {
    key: 'getLocationAtPoint',
    value: function getLocationAtPoint(_ref) {
      var lngLat = _ref.lngLat,
          pos = _ref.pos;

      var fromLocation = this.projectFlat(this.unproject(pos));
      var toLocation = this.projectFlat(lngLat);

      var center = this.projectFlat([this.longitude, this.latitude]);

      var translate = vec2_add([], toLocation, vec2_negate([], fromLocation));
      var newCenter = vec2_add([], center, translate);
      return this.unprojectFlat(newCenter);
    }

    /**
     * Returns a new viewport that fit around the given rectangle.
     * Only supports non-perspective mode.
     * @param {Array} bounds - [[lon, lat], [lon, lat]]
     * @param {Number} [options.padding] - The amount of padding in pixels to add to the given bounds.
     * @param {Array} [options.offset] - The center of the given bounds relative to the map's center,
     *    [x, y] measured in pixels.
     * @returns {WebMercatorViewport}
     */

  }, {
    key: 'fitBounds',
    value: function fitBounds(bounds) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var width = this.width,
          height = this.height;

      var _fitBounds2 = _fitBounds(Object.assign({ width: width, height: height, bounds: bounds }, options)),
          longitude = _fitBounds2.longitude,
          latitude = _fitBounds2.latitude,
          zoom = _fitBounds2.zoom;

      return new WebMercatorViewport({ width: width, height: height, longitude: longitude, latitude: latitude, zoom: zoom });
    }

    // TODO - should support user supplied constraints

  }, {
    key: 'isMapSynched',
    value: function isMapSynched() {
      var EPSILON = 0.000001;
      var MAPBOX_LIMITS = {
        pitch: 60,
        zoom: 40
      };

      var pitch = this.pitch,
          zoom = this.zoom;


      return pitch <= MAPBOX_LIMITS.pitch + EPSILON && zoom <= MAPBOX_LIMITS.zoom + EPSILON;
    }
  }]);

  return WebMercatorViewport;
}(Viewport);

export default WebMercatorViewport;


WebMercatorViewport.displayName = 'WebMercatorViewport';
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3ZpZXdwb3J0cy93ZWItbWVyY2F0b3Itdmlld3BvcnQuanMiXSwibmFtZXMiOlsiVmlld3BvcnQiLCJwcm9qZWN0RmxhdCIsInVucHJvamVjdEZsYXQiLCJnZXRQcm9qZWN0aW9uTWF0cml4IiwiZ2V0VW5jZW50ZXJlZFZpZXdNYXRyaXgiLCJmaXRCb3VuZHMiLCJ2ZWMyX2FkZCIsInZlYzJfbmVnYXRlIiwiYXNzZXJ0IiwiRVJSX0FSR1VNRU5UIiwiV2ViTWVyY2F0b3JWaWV3cG9ydCIsIm9wdHMiLCJsYXRpdHVkZSIsImxvbmdpdHVkZSIsInpvb20iLCJwaXRjaCIsImJlYXJpbmciLCJmYXJaTXVsdGlwbGllciIsIndpZHRoIiwiaGVpZ2h0IiwiYWx0aXR1ZGUiLCJNYXRoIiwibWF4IiwicHJvamVjdGlvbk1hdHJpeCIsInZpZXdNYXRyaXhVbmNlbnRlcmVkIiwiT2JqZWN0IiwiYXNzaWduIiwicG9zaXRpb24iLCJ2aWV3TWF0cml4IiwiZm9jYWxEaXN0YW5jZSIsIm1ldGVyc1RvTG5nTGF0RGVsdGEiLCJiaW5kIiwibG5nTGF0RGVsdGFUb01ldGVycyIsImFkZE1ldGVyc1RvTG5nTGF0IiwiZnJlZXplIiwibG5nTGF0Iiwic2NhbGUiLCJ4eSIsInh5eiIsIngiLCJ5IiwieiIsIk51bWJlciIsImlzRmluaXRlIiwiZGlzdGFuY2VTY2FsZXMiLCJwaXhlbHNQZXJNZXRlciIsImRlZ3JlZXNQZXJQaXhlbCIsImRlbHRhTG5nIiwiZGVsdGFMYXQiLCJsZW5ndGgiLCJkZWx0YUxuZ0xhdFoiLCJkZWx0YVoiLCJwaXhlbHNQZXJEZWdyZWUiLCJtZXRlcnNQZXJQaXhlbCIsImRlbHRhWCIsImRlbHRhWSIsImxuZ0xhdFoiLCJsbmciLCJsYXQiLCJaIiwicG9zIiwiZnJvbUxvY2F0aW9uIiwidW5wcm9qZWN0IiwidG9Mb2NhdGlvbiIsImNlbnRlciIsInRyYW5zbGF0ZSIsIm5ld0NlbnRlciIsImJvdW5kcyIsIm9wdGlvbnMiLCJF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Z0JnRCxjQUFoQixFQUFkLEVBQXVDQyxPQUF2QyxDQUFWLENBRk47QUFBQSxVQUV2QnZELFNBRnVCLGVBRXZCQSxTQUZ1QjtBQUFBLFVBRVpELFFBRlksZUFFWkEsUUFGWTtBQUFBLFVBRUZFLElBRkUsZUFFRkEsSUFGRTs7QUFHOUIsYUFBTyxJQUFJSixtQkFBSixDQUF3QixFQUFDUSxZQUFELEVBQVFDLGNBQVIsRUFBZ0JOLG9CQUFoQixFQUEyQkQsa0JBQTNCLEVBQXFDRSxVQUFyQyxFQUF4QixDQUFQO0FBQ0Q7O0FBRUQ7Ozs7bUNBQ2U7QUFDYixVQUFNdUQsVUFBVSxRQUFoQjtBQUNBLFVBQU1DLGdCQUFnQjtBQUNwQnZELGVBQU8sRUFEYTtBQUVwQkQsY0FBTTtBQUZjLE9BQXRCOztBQUZhLFVBT05DLEtBUE0sR0FPUyxJQVBULENBT05BLEtBUE07QUFBQSxVQU9DRCxJQVBELEdBT1MsSUFQVCxDQU9DQSxJQVBEOzs7QUFTYixhQUFPQyxTQUFVdUQsY0FBY3ZELEtBQWQsR0FBc0JzRCxPQUFoQyxJQUNMdkQsUUFBU3dELGNBQWN4RCxJQUFkLEdBQXFCdUQsT0FEaEM7QUFFRDs7OztFQW5OOENyRSxROztlQUE1QlUsbUI7OztBQXNOckJBLG9CQUFvQjZELFdBQXBCLEdBQWtDLHFCQUFsQyIsImZpbGUiOiJ3ZWItbWVyY2F0b3Itdmlld3BvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLy8gVmlldyBhbmQgUHJvamVjdGlvbiBNYXRyaXggY2FsY3VsYXRpb25zIGZvciBtYXBib3gtanMgc3R5bGVcbi8vIG1hcCB2aWV3IHByb3BlcnRpZXNcbmltcG9ydCBWaWV3cG9ydCBmcm9tICcuL3ZpZXdwb3J0JztcblxuaW1wb3J0IHtcbiAgcHJvamVjdEZsYXQsXG4gIHVucHJvamVjdEZsYXQsXG4gIGdldFByb2plY3Rpb25NYXRyaXgsXG4gIGdldFVuY2VudGVyZWRWaWV3TWF0cml4LFxuICBmaXRCb3VuZHNcbn0gZnJvbSAndmlld3BvcnQtbWVyY2F0b3ItcHJvamVjdCc7XG5cbi8vIFRPRE8gLSBpbXBvcnQgZnJvbSB2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0XG4vLyBpbXBvcnQge2ZpdEJvdW5kc30gZnJvbSAnLi4vdmlld3BvcnQtbWVyY2F0b3ItcHJvamVjdC9maXQtYm91bmRzJztcblxuLy8gVE9ETyAtIGltcG9ydCBmcm9tIG1hdGguZ2xcbi8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSAqL1xuaW1wb3J0IHZlYzJfYWRkIGZyb20gJ2dsLXZlYzIvYWRkJztcbmltcG9ydCB2ZWMyX25lZ2F0ZSBmcm9tICdnbC12ZWMyL25lZ2F0ZSc7XG5cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgRVJSX0FSR1VNRU5UID0gJ0lsbGVnYWwgYXJndW1lbnQgdG8gV2ViTWVyY2F0b3JWaWV3cG9ydCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdlYk1lcmNhdG9yVmlld3BvcnQgZXh0ZW5kcyBWaWV3cG9ydCB7XG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIENyZWF0ZXMgdmlldy9wcm9qZWN0aW9uIG1hdHJpY2VzIGZyb20gbWVyY2F0b3IgcGFyYW1zXG4gICAqIE5vdGU6IFRoZSBWaWV3cG9ydCBpcyBpbW11dGFibGUgaW4gdGhlIHNlbnNlIHRoYXQgaXQgb25seSBoYXMgYWNjZXNzb3JzLlxuICAgKiBBIG5ldyB2aWV3cG9ydCBpbnN0YW5jZSBzaG91bGQgYmUgY3JlYXRlZCBpZiBhbnkgcGFyYW1ldGVycyBoYXZlIGNoYW5nZWQuXG4gICAqL1xuICAvKiBlc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5LCBtYXgtc3RhdGVtZW50cyAqL1xuICBjb25zdHJ1Y3RvcihvcHRzID0ge30pIHtcbiAgICBjb25zdCB7XG4gICAgICBsYXRpdHVkZSA9IDAsXG4gICAgICBsb25naXR1ZGUgPSAwLFxuICAgICAgem9vbSA9IDExLFxuICAgICAgcGl0Y2ggPSAwLFxuICAgICAgYmVhcmluZyA9IDAsXG4gICAgICBmYXJaTXVsdGlwbGllciA9IDEwXG4gICAgfSA9IG9wdHM7XG5cbiAgICBsZXQge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBhbHRpdHVkZSA9IDEuNVxuICAgIH0gPSBvcHRzO1xuXG4gICAgLy8gU2lsZW50bHkgYWxsb3cgYXBwcyB0byBzZW5kIGluIDAsMCB0byBmYWNpbGl0YXRlIGlzb21vcnBoaWMgcmVuZGVyIGV0Y1xuICAgIHdpZHRoID0gd2lkdGggfHwgMTtcbiAgICBoZWlnaHQgPSBoZWlnaHQgfHwgMTtcblxuICAgIC8vIEFsdGl0dWRlIC0gcHJldmVudCBkaXZpc2lvbiBieSAwXG4gICAgLy8gVE9ETyAtIGp1c3QgdGhyb3cgYW4gRXJyb3IgaW5zdGVhZD9cbiAgICBhbHRpdHVkZSA9IE1hdGgubWF4KDAuNzUsIGFsdGl0dWRlKTtcblxuICAgIGNvbnN0IHByb2plY3Rpb25NYXRyaXggPSBnZXRQcm9qZWN0aW9uTWF0cml4KHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcGl0Y2gsXG4gICAgICBhbHRpdHVkZSxcbiAgICAgIGZhclpNdWx0aXBsaWVyXG4gICAgfSk7XG5cbiAgICAvLyBUaGUgdW5jZW50ZXJlZCBtYXRyaXggYWxsb3dzIHVzIHR3byBtb3ZlIHRoZSBjZW50ZXIgYWRkaXRpb24gdG8gdGhlXG4gICAgLy8gc2hhZGVyIChjaGVhcCkgd2hpY2ggZ2l2ZXMgYSBjb29yZGluYXRlIHN5c3RlbSB0aGF0IGhhcyBpdHMgY2VudGVyIGluXG4gICAgLy8gdGhlIGxheWVyJ3MgY2VudGVyIHBvc2l0aW9uLiBUaGlzIG1ha2VzIHJvdGF0aW9ucyBhbmQgb3RoZXIgbW9kZWxNYXRyeFxuICAgIC8vIHRyYW5zZm9ybXMgbXVjaCBtb3JlIHVzZWZ1bC5cbiAgICBjb25zdCB2aWV3TWF0cml4VW5jZW50ZXJlZCA9IGdldFVuY2VudGVyZWRWaWV3TWF0cml4KHtcbiAgICAgIGhlaWdodCxcbiAgICAgIHBpdGNoLFxuICAgICAgYmVhcmluZyxcbiAgICAgIGFsdGl0dWRlXG4gICAgfSk7XG5cbiAgICBzdXBlcihPYmplY3QuYXNzaWduKHt9LCBvcHRzLCB7XG4gICAgICAvLyB4LCB5LCBwb3NpdGlvbiwgLi4uXG4gICAgICAvLyBUT0RPIC8gaGFjayAtIHByZXZlbnQgdmVydGljYWwgb2Zmc2V0cyBpZiBub3QgRmlyc3RQZXJzb25WaWV3cG9ydFxuICAgICAgcG9zaXRpb246IG9wdHMucG9zaXRpb24gJiYgW29wdHMucG9zaXRpb25bMF0sIG9wdHMucG9zaXRpb25bMV0sIDBdLFxuICAgICAgd2lkdGgsIGhlaWdodCxcbiAgICAgIHZpZXdNYXRyaXg6IHZpZXdNYXRyaXhVbmNlbnRlcmVkLFxuICAgICAgbG9uZ2l0dWRlLFxuICAgICAgbGF0aXR1ZGUsXG4gICAgICB6b29tLFxuICAgICAgcHJvamVjdGlvbk1hdHJpeCxcbiAgICAgIGZvY2FsRGlzdGFuY2U6IDEgLy8gVmlld3BvcnQgaXMgYWxyZWFkeSBjYXJlZnVsbHkgc2V0IHVwIHRvIFwiZm9jdXNcIiBvbiBncm91bmRcbiAgICB9KSk7XG5cbiAgICAvLyBTYXZlIHBhcmFtZXRlcnNcbiAgICB0aGlzLmxhdGl0dWRlID0gbGF0aXR1ZGU7XG4gICAgdGhpcy5sb25naXR1ZGUgPSBsb25naXR1ZGU7XG4gICAgdGhpcy56b29tID0gem9vbTtcbiAgICB0aGlzLnBpdGNoID0gcGl0Y2g7XG4gICAgdGhpcy5iZWFyaW5nID0gYmVhcmluZztcbiAgICB0aGlzLmFsdGl0dWRlID0gYWx0aXR1ZGU7XG5cbiAgICAvLyBCaW5kIG1ldGhvZHNcbiAgICB0aGlzLm1ldGVyc1RvTG5nTGF0RGVsdGEgPSB0aGlzLm1ldGVyc1RvTG5nTGF0RGVsdGEuYmluZCh0aGlzKTtcbiAgICB0aGlzLmxuZ0xhdERlbHRhVG9NZXRlcnMgPSB0aGlzLmxuZ0xhdERlbHRhVG9NZXRlcnMuYmluZCh0aGlzKTtcbiAgICB0aGlzLmFkZE1ldGVyc1RvTG5nTGF0ID0gdGhpcy5hZGRNZXRlcnNUb0xuZ0xhdC5iaW5kKHRoaXMpO1xuXG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHksIG1heC1zdGF0ZW1lbnRzICovXG5cbiAgLyoqXG4gICAqIFByb2plY3QgW2xuZyxsYXRdIG9uIHNwaGVyZSBvbnRvIFt4LHldIG9uIDUxMio1MTIgTWVyY2F0b3IgWm9vbSAwIHRpbGUuXG4gICAqIFBlcmZvcm1zIHRoZSBub25saW5lYXIgcGFydCBvZiB0aGUgd2ViIG1lcmNhdG9yIHByb2plY3Rpb24uXG4gICAqIFJlbWFpbmluZyBwcm9qZWN0aW9uIGlzIGRvbmUgd2l0aCA0eDQgbWF0cmljZXMgd2hpY2ggYWxzbyBoYW5kbGVzXG4gICAqIHBlcnNwZWN0aXZlLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fSBsbmdMYXQgLSBbbG5nLCBsYXRdIGNvb3JkaW5hdGVzXG4gICAqICAgU3BlY2lmaWVzIGEgcG9pbnQgb24gdGhlIHNwaGVyZSB0byBwcm9qZWN0IG9udG8gdGhlIG1hcC5cbiAgICogQHJldHVybiB7QXJyYXl9IFt4LHldIGNvb3JkaW5hdGVzLlxuICAgKi9cbiAgX3Byb2plY3RGbGF0KGxuZ0xhdCwgc2NhbGUgPSB0aGlzLnNjYWxlKSB7XG4gICAgcmV0dXJuIHByb2plY3RGbGF0KGxuZ0xhdCwgc2NhbGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVucHJvamVjdCB3b3JsZCBwb2ludCBbeCx5XSBvbiBtYXAgb250byB7bGF0LCBsb259IG9uIHNwaGVyZVxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdHxWZWN0b3J9IHh5IC0gb2JqZWN0IHdpdGgge3gseX0gbWVtYmVyc1xuICAgKiAgcmVwcmVzZW50aW5nIHBvaW50IG9uIHByb2plY3RlZCBtYXAgcGxhbmVcbiAgICogQHJldHVybiB7R2VvQ29vcmRpbmF0ZXN9IC0gb2JqZWN0IHdpdGgge2xhdCxsb259IG9mIHBvaW50IG9uIHNwaGVyZS5cbiAgICogICBIYXMgdG9BcnJheSBtZXRob2QgaWYgeW91IG5lZWQgYSBHZW9KU09OIEFycmF5LlxuICAgKiAgIFBlciBjYXJ0b2dyYXBoaWMgdHJhZGl0aW9uLCBsYXQgYW5kIGxvbiBhcmUgc3BlY2lmaWVkIGFzIGRlZ3JlZXMuXG4gICAqL1xuICBfdW5wcm9qZWN0RmxhdCh4eSwgc2NhbGUgPSB0aGlzLnNjYWxlKSB7XG4gICAgcmV0dXJuIHVucHJvamVjdEZsYXQoeHksIHNjYWxlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIG1ldGVyIG9mZnNldCB0byBhIGxuZ2xhdCBvZmZzZXRcbiAgICpcbiAgICogTm90ZTogVXNlcyBzaW1wbGUgbGluZWFyIGFwcHJveGltYXRpb24gYXJvdW5kIHRoZSB2aWV3cG9ydCBjZW50ZXJcbiAgICogRXJyb3IgaW5jcmVhc2VzIHdpdGggc2l6ZSBvZiBvZmZzZXQgKHJvdWdobHkgMSUgcGVyIDEwMGttKVxuICAgKlxuICAgKiBAcGFyYW0ge1tOdW1iZXIsTnVtYmVyXXxbTnVtYmVyLE51bWJlcixOdW1iZXJdKSB4eXogLSBhcnJheSBvZiBtZXRlciBkZWx0YXNcbiAgICogQHJldHVybiB7W051bWJlcixOdW1iZXJdfFtOdW1iZXIsTnVtYmVyLE51bWJlcl0pIC0gYXJyYXkgb2YgW2xuZyxsYXQsel0gZGVsdGFzXG4gICAqL1xuICBtZXRlcnNUb0xuZ0xhdERlbHRhKHh5eikge1xuICAgIGNvbnN0IFt4LCB5LCB6ID0gMF0gPSB4eXo7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZSh4KSAmJiBOdW1iZXIuaXNGaW5pdGUoeSkgJiYgTnVtYmVyLmlzRmluaXRlKHopLCBFUlJfQVJHVU1FTlQpO1xuICAgIGNvbnN0IHtwaXhlbHNQZXJNZXRlciwgZGVncmVlc1BlclBpeGVsfSA9IHRoaXMuZGlzdGFuY2VTY2FsZXM7XG4gICAgY29uc3QgZGVsdGFMbmcgPSB4ICogcGl4ZWxzUGVyTWV0ZXJbMF0gKiBkZWdyZWVzUGVyUGl4ZWxbMF07XG4gICAgY29uc3QgZGVsdGFMYXQgPSB5ICogcGl4ZWxzUGVyTWV0ZXJbMV0gKiBkZWdyZWVzUGVyUGl4ZWxbMV07XG4gICAgcmV0dXJuIHh5ei5sZW5ndGggPT09IDIgPyBbZGVsdGFMbmcsIGRlbHRhTGF0XSA6IFtkZWx0YUxuZywgZGVsdGFMYXQsIHpdO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgbG5nbGF0IG9mZnNldCB0byBhIG1ldGVyIG9mZnNldFxuICAgKlxuICAgKiBOb3RlOiBVc2VzIHNpbXBsZSBsaW5lYXIgYXBwcm94aW1hdGlvbiBhcm91bmQgdGhlIHZpZXdwb3J0IGNlbnRlclxuICAgKiBFcnJvciBpbmNyZWFzZXMgd2l0aCBzaXplIG9mIG9mZnNldCAocm91Z2hseSAxJSBwZXIgMTAwa20pXG4gICAqXG4gICAqIEBwYXJhbSB7W051bWJlcixOdW1iZXJdfFtOdW1iZXIsTnVtYmVyLE51bWJlcl0pIGRlbHRhTG5nTGF0WiAtIGFycmF5IG9mIFtsbmcsbGF0LHpdIGRlbHRhc1xuICAgKiBAcmV0dXJuIHtbTnVtYmVyLE51bWJlcl18W051bWJlcixOdW1iZXIsTnVtYmVyXSkgLSBhcnJheSBvZiBtZXRlciBkZWx0YXNcbiAgICovXG4gIGxuZ0xhdERlbHRhVG9NZXRlcnMoZGVsdGFMbmdMYXRaKSB7XG4gICAgY29uc3QgW2RlbHRhTG5nLCBkZWx0YUxhdCwgZGVsdGFaID0gMF0gPSBkZWx0YUxuZ0xhdFo7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZShkZWx0YUxuZykgJiYgTnVtYmVyLmlzRmluaXRlKGRlbHRhTGF0KSAmJiBOdW1iZXIuaXNGaW5pdGUoZGVsdGFaKSxcbiAgICAgIEVSUl9BUkdVTUVOVCk7XG4gICAgY29uc3Qge3BpeGVsc1BlckRlZ3JlZSwgbWV0ZXJzUGVyUGl4ZWx9ID0gdGhpcy5kaXN0YW5jZVNjYWxlcztcbiAgICBjb25zdCBkZWx0YVggPSBkZWx0YUxuZyAqIHBpeGVsc1BlckRlZ3JlZVswXSAqIG1ldGVyc1BlclBpeGVsWzBdO1xuICAgIGNvbnN0IGRlbHRhWSA9IGRlbHRhTGF0ICogcGl4ZWxzUGVyRGVncmVlWzFdICogbWV0ZXJzUGVyUGl4ZWxbMV07XG4gICAgcmV0dXJuIGRlbHRhTG5nTGF0Wi5sZW5ndGggPT09IDIgPyBbZGVsdGFYLCBkZWx0YVldIDogW2RlbHRhWCwgZGVsdGFZLCBkZWx0YVpdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIG1ldGVyIGRlbHRhIHRvIGEgYmFzZSBsbmdsYXQgY29vcmRpbmF0ZSwgcmV0dXJuaW5nIGEgbmV3IGxuZ2xhdCBhcnJheVxuICAgKlxuICAgKiBOb3RlOiBVc2VzIHNpbXBsZSBsaW5lYXIgYXBwcm94aW1hdGlvbiBhcm91bmQgdGhlIHZpZXdwb3J0IGNlbnRlclxuICAgKiBFcnJvciBpbmNyZWFzZXMgd2l0aCBzaXplIG9mIG9mZnNldCAocm91Z2hseSAxJSBwZXIgMTAwa20pXG4gICAqXG4gICAqIEBwYXJhbSB7W051bWJlcixOdW1iZXJdfFtOdW1iZXIsTnVtYmVyLE51bWJlcl0pIGxuZ0xhdFogLSBiYXNlIGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIHtbTnVtYmVyLE51bWJlcl18W051bWJlcixOdW1iZXIsTnVtYmVyXSkgeHl6IC0gYXJyYXkgb2YgbWV0ZXIgZGVsdGFzXG4gICAqIEByZXR1cm4ge1tOdW1iZXIsTnVtYmVyXXxbTnVtYmVyLE51bWJlcixOdW1iZXJdKSBhcnJheSBvZiBbbG5nLGxhdCx6XSBkZWx0YXNcbiAgICovXG4gIGFkZE1ldGVyc1RvTG5nTGF0KGxuZ0xhdFosIHh5eikge1xuICAgIGNvbnN0IFtsbmcsIGxhdCwgWiA9IDBdID0gbG5nTGF0WjtcbiAgICBjb25zdCBbZGVsdGFMbmcsIGRlbHRhTGF0LCBkZWx0YVogPSAwXSA9IHRoaXMubWV0ZXJzVG9MbmdMYXREZWx0YSh4eXopO1xuICAgIHJldHVybiBsbmdMYXRaLmxlbmd0aCA9PT0gMiA/XG4gICAgICBbbG5nICsgZGVsdGFMbmcsIGxhdCArIGRlbHRhTGF0XSA6XG4gICAgICBbbG5nICsgZGVsdGFMbmcsIGxhdCArIGRlbHRhTGF0LCBaICsgZGVsdGFaXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG1hcCBjZW50ZXIgdGhhdCBwbGFjZSBhIGdpdmVuIFtsbmcsIGxhdF0gY29vcmRpbmF0ZSBhdCBzY3JlZW5cbiAgICogcG9pbnQgW3gsIHldXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IGxuZ0xhdCAtIFtsbmcsbGF0XSBjb29yZGluYXRlc1xuICAgKiAgIFNwZWNpZmllcyBhIHBvaW50IG9uIHRoZSBzcGhlcmUuXG4gICAqIEBwYXJhbSB7QXJyYXl9IHBvcyAtIFt4LHldIGNvb3JkaW5hdGVzXG4gICAqICAgU3BlY2lmaWVzIGEgcG9pbnQgb24gdGhlIHNjcmVlbi5cbiAgICogQHJldHVybiB7QXJyYXl9IFtsbmcsbGF0XSBuZXcgbWFwIGNlbnRlci5cbiAgICovXG4gIGdldExvY2F0aW9uQXRQb2ludCh7bG5nTGF0LCBwb3N9KSB7XG4gICAgY29uc3QgZnJvbUxvY2F0aW9uID0gdGhpcy5wcm9qZWN0RmxhdCh0aGlzLnVucHJvamVjdChwb3MpKTtcbiAgICBjb25zdCB0b0xvY2F0aW9uID0gdGhpcy5wcm9qZWN0RmxhdChsbmdMYXQpO1xuXG4gICAgY29uc3QgY2VudGVyID0gdGhpcy5wcm9qZWN0RmxhdChbdGhpcy5sb25naXR1ZGUsIHRoaXMubGF0aXR1ZGVdKTtcblxuICAgIGNvbnN0IHRyYW5zbGF0ZSA9IHZlYzJfYWRkKFtdLCB0b0xvY2F0aW9uLCB2ZWMyX25lZ2F0ZShbXSwgZnJvbUxvY2F0aW9uKSk7XG4gICAgY29uc3QgbmV3Q2VudGVyID0gdmVjMl9hZGQoW10sIGNlbnRlciwgdHJhbnNsYXRlKTtcbiAgICByZXR1cm4gdGhpcy51bnByb2plY3RGbGF0KG5ld0NlbnRlcik7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyB2aWV3cG9ydCB0aGF0IGZpdCBhcm91bmQgdGhlIGdpdmVuIHJlY3RhbmdsZS5cbiAgICogT25seSBzdXBwb3J0cyBub24tcGVyc3BlY3RpdmUgbW9kZS5cbiAgICogQHBhcmFtIHtBcnJheX0gYm91bmRzIC0gW1tsb24sIGxhdF0sIFtsb24sIGxhdF1dXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wYWRkaW5nXSAtIFRoZSBhbW91bnQgb2YgcGFkZGluZyBpbiBwaXhlbHMgdG8gYWRkIHRvIHRoZSBnaXZlbiBib3VuZHMuXG4gICAqIEBwYXJhbSB7QXJyYXl9IFtvcHRpb25zLm9mZnNldF0gLSBUaGUgY2VudGVyIG9mIHRoZSBnaXZlbiBib3VuZHMgcmVsYXRpdmUgdG8gdGhlIG1hcCdzIGNlbnRlcixcbiAgICogICAgW3gsIHldIG1lYXN1cmVkIGluIHBpeGVscy5cbiAgICogQHJldHVybnMge1dlYk1lcmNhdG9yVmlld3BvcnR9XG4gICAqL1xuICBmaXRCb3VuZHMoYm91bmRzLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSB0aGlzO1xuICAgIGNvbnN0IHtsb25naXR1ZGUsIGxhdGl0dWRlLCB6b29tfSA9IGZpdEJvdW5kcyhPYmplY3QuYXNzaWduKHt3aWR0aCwgaGVpZ2h0LCBib3VuZHN9LCBvcHRpb25zKSk7XG4gICAgcmV0dXJuIG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KHt3aWR0aCwgaGVpZ2h0LCBsb25naXR1ZGUsIGxhdGl0dWRlLCB6b29tfSk7XG4gIH1cblxuICAvLyBUT0RPIC0gc2hvdWxkIHN1cHBvcnQgdXNlciBzdXBwbGllZCBjb25zdHJhaW50c1xuICBpc01hcFN5bmNoZWQoKSB7XG4gICAgY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAxO1xuICAgIGNvbnN0IE1BUEJPWF9MSU1JVFMgPSB7XG4gICAgICBwaXRjaDogNjAsXG4gICAgICB6b29tOiA0MFxuICAgIH07XG5cbiAgICBjb25zdCB7cGl0Y2gsIHpvb219ID0gdGhpcztcblxuICAgIHJldHVybiBwaXRjaCA8PSAoTUFQQk9YX0xJTUlUUy5waXRjaCArIEVQU0lMT04pICYmXG4gICAgICB6b29tIDw9IChNQVBCT1hfTElNSVRTLnpvb20gKyBFUFNJTE9OKTtcbiAgfVxufVxuXG5XZWJNZXJjYXRvclZpZXdwb3J0LmRpc3BsYXlOYW1lID0gJ1dlYk1lcmNhdG9yVmlld3BvcnQnO1xuIl19
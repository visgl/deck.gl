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

import {
  pixelsToWorld,
  getViewMatrix,
  fitBounds
} from 'viewport-mercator-project';

// TODO - import from math.gl
/* eslint-disable camelcase */
import vec2_add from 'gl-vec2/add';
import vec2_negate from 'gl-vec2/negate';

import assert from '../utils/assert';

const ERR_ARGUMENT = 'Illegal argument to WebMercatorViewport';

export default class WebMercatorViewport extends Viewport {
  /**
   * @classdesc
   * Creates view/projection matrices from mercator params
   * Note: The Viewport is immutable in the sense that it only has accessors.
   * A new viewport instance should be created if any parameters have changed.
   */
  /* eslint-disable complexity, max-statements */
  constructor(opts = {}) {
    const {
      latitude = 0,
      longitude = 0,
      zoom = 11,
      pitch = 0,
      bearing = 0,
      farZMultiplier = 10,
      orthographic = false
    } = opts;

    let {width, height, altitude = 1.5} = opts;

    // Silently allow apps to send in 0,0 to facilitate isomorphic render etc
    width = width || 1;
    height = height || 1;

    // Altitude - prevent division by 0
    // TODO - just throw an Error instead?
    altitude = Math.max(0.75, altitude);

    const {fov, aspect, focalDistance, near, far} = getProjectionParameters({
      width,
      height,
      latitude,
      pitch,
      altitude,
      farZMultiplier
    });

    // The uncentered matrix allows us two move the center addition to the
    // shader (cheap) which gives a coordinate system that has its center in
    // the layer's center position. This makes rotations and other modelMatrx
    // transforms much more useful.
    const viewMatrixUncentered = getViewMatrix({
      height,
      pitch,
      bearing,
      altitude
    });

    // TODO / hack - prevent vertical offsets if not FirstPersonViewport
    const position = opts.position && [opts.position[0], opts.position[1], 0];

    const viewportOpts = Object.assign({}, opts, {
      // x, y,
      width,
      height,

      // view matrix
      viewMatrix: viewMatrixUncentered,
      longitude,
      latitude,
      zoom,
      position,

      // projection matrix parameters
      orthographic,
      fovyRadians: fov,
      aspect,
      // TODO Viewport is already carefully set up to "focus" on ground, so can't use focal distance
      orthographicFocalDistance: focalDistance,
      near,
      far
    });

    super(viewportOpts);

    // Save parameters
    this.latitude = latitude;
    this.longitude = longitude;
    this.zoom = zoom;
    this.pitch = pitch;
    this.bearing = bearing;
    this.altitude = altitude;

    this.orthographic = orthographic;

    // Bind methods
    this.metersToLngLatDelta = this.metersToLngLatDelta.bind(this);
    this.lngLatDeltaToMeters = this.lngLatDeltaToMeters.bind(this);
    this.addMetersToLngLat = this.addMetersToLngLat.bind(this);

    Object.freeze(this);
  }
  /* eslint-enable complexity, max-statements */

  /**
   * Converts a meter offset to a lnglat offset
   *
   * Note: Uses simple linear approximation around the viewport center
   * Error increases with size of offset (roughly 1% per 100km)
   *
   * @param {[Number,Number]|[Number,Number,Number]) xyz - array of meter deltas
   * @return {[Number,Number]|[Number,Number,Number]) - array of [lng,lat,z] deltas
   */
  metersToLngLatDelta(xyz) {
    const [x, y, z = 0] = xyz;
    assert(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z), ERR_ARGUMENT);
    const {pixelsPerMeter, degreesPerPixel} = this.distanceScales;
    const deltaLng = x * pixelsPerMeter[0] * degreesPerPixel[0];
    const deltaLat = y * pixelsPerMeter[1] * degreesPerPixel[1];
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
  lngLatDeltaToMeters(deltaLngLatZ) {
    const [deltaLng, deltaLat, deltaZ = 0] = deltaLngLatZ;
    assert(
      Number.isFinite(deltaLng) && Number.isFinite(deltaLat) && Number.isFinite(deltaZ),
      ERR_ARGUMENT
    );
    const {pixelsPerDegree, metersPerPixel} = this.distanceScales;
    const deltaX = deltaLng * pixelsPerDegree[0] * metersPerPixel[0];
    const deltaY = deltaLat * pixelsPerDegree[1] * metersPerPixel[1];
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
  addMetersToLngLat(lngLatZ, xyz) {
    const [lng, lat, Z = 0] = lngLatZ;
    const [deltaLng, deltaLat, deltaZ = 0] = this.metersToLngLatDelta(xyz);
    return lngLatZ.length === 2
      ? [lng + deltaLng, lat + deltaLat]
      : [lng + deltaLng, lat + deltaLat, Z + deltaZ];
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
  getMapCenterByLngLatPosition({lngLat, pos}) {
    const fromLocation = pixelsToWorld(pos, this.pixelUnprojectionMatrix);
    const toLocation = this.projectFlat(lngLat);

    const translate = vec2_add([], toLocation, vec2_negate([], fromLocation));
    const newCenter = vec2_add([], this.center, translate);

    return this.unprojectFlat(newCenter);
  }

  // Legacy method name
  getLocationAtPoint({lngLat, pos}) {
    return this.getMapCenterByLngLatPosition({lngLat, pos});
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
  fitBounds(bounds, options = {}) {
    const {width, height} = this;
    const {longitude, latitude, zoom} = fitBounds(Object.assign({width, height, bounds}, options));
    return new WebMercatorViewport({width, height, longitude, latitude, zoom});
  }
}

WebMercatorViewport.displayName = 'WebMercatorViewport';

// PROJECTION MATRIX PARAMETERS
// This is a "Mapbox" projection matrix - matches mapbox exactly if farZMultiplier === 1
// Variable fov (in radians)
export function getProjectionParameters({
  width,
  height,
  latitude,
  pitch = 0,
  altitude = 1.5,
  farZMultiplier = 1
}) {
  // Find the distance from the center point to the center top
  // in altitude units using law of sines.
  const pitchRadians = pitch * Math.PI / 180;


  const halfFov = Math.atan(0.5 / altitude);
  const cameraToCenterDistance = 0.5 / Math.tan(halfFov) * height;

  // Find the distance from the center point [width/2, height/2] to the
  // center top point [width/2, 0] in Z units, using the law of sines.
  // 1 Z unit is equivalent to 1 horizontal px at the center of the map
  // (the distance between[width/2, height/2] and [width/2 + 1, height/2])
  // const halfFov = _fov / 2;

  const groundAngle = Math.PI / 2 + pitchRadians;
  const topHalfSurfaceDistance = Math.sin(halfFov) *
    cameraToCenterDistance /
    Math.sin(Math.PI - groundAngle - halfFov);

  // Calculate z distance of the farthest fragment that should be rendered.
  const furthestDistance = Math.cos(Math.PI / 2 - pitchRadians) * topHalfSurfaceDistance +
    cameraToCenterDistance;
  // Add a bit extra to avoid precision problems when a fragment's distance is exactly `furthestDistance`

  const scaleFactor = 1 / (2 * Math.PI * 180 *
    Math.abs(Math.cos(latitude * (Math.PI / 180))));
  const nearZ = 1 * scaleFactor;
  const farZ = furthestDistance * 1.01 * scaleFactor;



  // const topHalfSurfaceDistance =
  //   Math.sin(halfFov) * altitude / Math.sin(Math.PI / 2 - pitchRadians - halfFov);

  // const cameraToCenterDistance = 0.5 / Math.tan(halfFov) * height;


  // Calculate z value of the farthest fragment that should be rendered.
  // const farZ = Math.cos(Math.PI / 2 - pitchRadians) * topHalfSurfaceDistance + altitude;

  // Calculate z distance of the farthest fragment that should be rendered.
  // const furthestDistance = Math.cos(Math.PI / 2 - pitchRadians) * topHalfSurfaceDistance +
  //   cameraToCenterDistance;
  // // Add a bit extra to avoid precision problems when a fragment's distance is exactly `furthestDistance`
  // const farZ = furthestDistance * 1.01;


  return {
    fov: 2 * Math.atan((height / 2) / altitude),
    aspect: width / height,
    focalDistance: altitude,
    near: nearZ,
    far: farZ // * farZMultiplier
  };
}

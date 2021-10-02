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
  addMetersToLngLat,
  getProjectionParameters,
  altitudeToFovy,
  fovyToAltitude,
  fitBounds,
  getBounds
} from '@math.gl/web-mercator';

// TODO - import from math.gl
import * as vec2 from 'gl-matrix/vec2';
import {Matrix4} from 'math.gl';

const TILE_SIZE = 512;
const EARTH_CIRCUMFERENCE = 40.03e6;
const DEGREES_TO_RADIANS = Math.PI / 180;

function unitsPerMeter(latitude) {
  const latCosine = Math.cos(latitude * DEGREES_TO_RADIANS);
  return TILE_SIZE / EARTH_CIRCUMFERENCE / latCosine;
}

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
      nearZMultiplier = 0.1,
      farZMultiplier = 1.01,
      orthographic = false,
      projectionMatrix,

      repeat = false,
      worldOffset = 0,

      // backward compatibility
      // TODO: remove in v9
      legacyMeterSizes = false
    } = opts;

    let {width, height, altitude = 1.5} = opts;
    const scale = Math.pow(2, zoom);

    // Silently allow apps to send in 0,0 to facilitate isomorphic render etc
    width = width || 1;
    height = height || 1;

    let fovy;
    let projectionParameters = null;
    if (projectionMatrix) {
      altitude = projectionMatrix[5] / 2;
      fovy = altitudeToFovy(altitude);
    } else {
      if (opts.fovy) {
        fovy = opts.fovy;
        altitude = fovyToAltitude(fovy);
      } else {
        fovy = altitudeToFovy(altitude);
      }
      projectionParameters = getProjectionParameters({
        width,
        height,
        pitch,
        fovy,
        nearZMultiplier,
        farZMultiplier
      });
    }

    // The uncentered matrix allows us two move the center addition to the
    // shader (cheap) which gives a coordinate system that has its center in
    // the layer's center position. This makes rotations and other modelMatrx
    // transforms much more useful.
    let viewMatrixUncentered = getViewMatrix({
      height,
      pitch,
      bearing,
      scale,
      altitude
    });

    if (worldOffset) {
      const viewOffset = new Matrix4().translate([512 * worldOffset, 0, 0]);
      viewMatrixUncentered = viewOffset.multiplyLeft(viewMatrixUncentered);
    }

    super({
      ...opts,
      // x, y,
      width,
      height,

      // view matrix
      viewMatrix: viewMatrixUncentered,
      longitude,
      latitude,
      zoom,

      // projection matrix parameters
      ...projectionParameters,
      fovy,
      focalDistance: altitude
    });

    // Save parameters
    this.latitude = latitude;
    this.longitude = longitude;
    this.zoom = zoom;
    this.pitch = pitch;
    this.bearing = bearing;
    this.altitude = altitude;
    this.fovy = fovy;

    this.orthographic = orthographic;

    this._subViewports = repeat ? [] : null;
    this._pseudoMeters = legacyMeterSizes;

    Object.freeze(this);
  }
  /* eslint-enable complexity, max-statements */

  get subViewports() {
    if (this._subViewports && !this._subViewports.length) {
      // Cache sub viewports so that we only calculate them once
      const bounds = this.getBounds();

      const minOffset = Math.floor((bounds[0] + 180) / 360);
      const maxOffset = Math.ceil((bounds[2] - 180) / 360);

      for (let x = minOffset; x <= maxOffset; x++) {
        const offsetViewport = x
          ? new WebMercatorViewport({
              ...this,
              worldOffset: x
            })
          : this;
        this._subViewports.push(offsetViewport);
      }
    }
    return this._subViewports;
  }

  projectPosition(xyz) {
    if (this._pseudoMeters) {
      // Backward compatibility
      return super.projectPosition(xyz);
    }
    const [X, Y] = this.projectFlat(xyz);
    const Z = (xyz[2] || 0) * unitsPerMeter(xyz[1]);
    return [X, Y, Z];
  }

  unprojectPosition(xyz) {
    if (this._pseudoMeters) {
      // Backward compatibility
      return super.unprojectPosition(xyz);
    }
    const [X, Y] = this.unprojectFlat(xyz);
    const Z = (xyz[2] || 0) / unitsPerMeter(Y);
    return [X, Y, Z];
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
    return addMetersToLngLat(lngLatZ, xyz);
  }

  panByPosition(coords, pixel) {
    const fromLocation = pixelsToWorld(pixel, this.pixelUnprojectionMatrix);
    const toLocation = this.projectFlat(coords);

    const translate = vec2.add([], toLocation, vec2.negate([], fromLocation));
    const newCenter = vec2.add([], this.center, translate);

    const [longitude, latitude] = this.unprojectFlat(newCenter);
    return {longitude, latitude};
  }

  getBounds(options = {}) {
    const corners = getBounds(this, options.z || 0);

    return [
      Math.min(corners[0][0], corners[1][0], corners[2][0], corners[3][0]),
      Math.min(corners[0][1], corners[1][1], corners[2][1], corners[3][1]),
      Math.max(corners[0][0], corners[1][0], corners[2][0], corners[3][0]),
      Math.max(corners[0][1], corners[1][1], corners[2][1], corners[3][1])
    ];
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
    const {longitude, latitude, zoom} = fitBounds({width, height, bounds, ...options});
    return new WebMercatorViewport({width, height, longitude, latitude, zoom});
  }
}

WebMercatorViewport.displayName = 'WebMercatorViewport';

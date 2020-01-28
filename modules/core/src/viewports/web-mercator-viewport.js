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
  fitBounds
} from '@math.gl/web-mercator';

// TODO - import from math.gl
import * as vec2 from 'gl-matrix/vec2';
import {Matrix4} from 'math.gl';

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

      repeat = false,
      worldOffset = 0
    } = opts;

    let {width, height, altitude = 1.5} = opts;
    const scale = Math.pow(2, zoom);

    // Silently allow apps to send in 0,0 to facilitate isomorphic render etc
    width = width || 1;
    height = height || 1;

    // Altitude - prevent division by 0
    // TODO - just throw an Error instead?
    altitude = Math.max(0.75, altitude);

    const {fov, aspect, focalDistance, near, far} = getProjectionParameters({
      width,
      height,
      pitch,
      altitude,
      nearZMultiplier,
      farZMultiplier
    });

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

    const viewportOpts = Object.assign({}, opts, {
      // x, y,
      width,
      height,

      // view matrix
      viewMatrix: viewMatrixUncentered,
      longitude,
      latitude,
      zoom,

      // projection matrix parameters
      orthographic,
      fovyRadians: fov,
      aspect,
      // TODO Viewport is already carefully set up to "focus" on ground, so can't use focal distance
      focalDistance: orthographic ? focalDistance : 1,
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

    this._subViewports = repeat ? [] : null;

    Object.freeze(this);
  }
  /* eslint-enable complexity, max-statements */

  get subViewports() {
    if (this._subViewports && !this._subViewports.length) {
      // Cache sub viewports so that we only calculate them once
      const topLeft = this.unproject([0, 0]);
      const topRight = this.unproject([this.width, 0]);
      const bottomLeft = this.unproject([0, this.height]);
      const bottomRight = this.unproject([this.width, this.height]);

      const minLon = Math.min(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]);
      const maxLon = Math.max(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]);

      const minOffset = Math.floor((minLon + 180) / 360);
      const maxOffset = Math.ceil((maxLon - 180) / 360);

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

    const translate = vec2.add([], toLocation, vec2.negate([], fromLocation));
    const newCenter = vec2.add([], this.center, translate);

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
  fitBounds(bounds, options = {}) {
    const {width, height} = this;
    const {longitude, latitude, zoom} = fitBounds(Object.assign({width, height, bounds}, options));
    return new WebMercatorViewport({width, height, longitude, latitude, zoom});
  }
}

WebMercatorViewport.displayName = 'WebMercatorViewport';

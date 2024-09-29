// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// View and Projection Matrix calculations for mapbox-js style
// map view properties
import Viewport from './viewport';

import {
  pixelsToWorld,
  getViewMatrix,
  addMetersToLngLat,
  unitsPerMeter,
  getProjectionParameters,
  altitudeToFovy,
  fovyToAltitude,
  fitBounds,
  getBounds
} from '@math.gl/web-mercator';
import {Padding} from './viewport';

import {Matrix4, clamp, vec2} from '@math.gl/core';

export type WebMercatorViewportOptions = {
  /** Name of the viewport */
  id?: string;
  /** Left offset from the canvas edge, in pixels */
  x?: number;
  /** Top offset from the canvas edge, in pixels */
  y?: number;
  /** Viewport width in pixels */
  width?: number;
  /** Viewport height in pixels */
  height?: number;
  /** Longitude in degrees */
  longitude?: number;
  /** Latitude in degrees */
  latitude?: number;
  /** Tilt of the camera in degrees */
  pitch?: number;
  /** Heading of the camera in degrees */
  bearing?: number;
  /** Camera altitude relative to the viewport height, legacy property used to control the FOV. Default `1.5` */
  altitude?: number;
  /** Camera fovy in degrees. If provided, overrides `altitude` */
  fovy?: number;
  /** Viewport center in world space. If geospatial, refers to meter offsets from lng, lat */
  position?: number[];
  /** Zoom level */
  zoom?: number;
  /** Padding around the viewport, in pixels. */
  padding?: Padding | null;
  /** Model matrix of viewport center */
  modelMatrix?: number[] | null;
  /** Custom projection matrix */
  projectionMatrix?: number[];
  /** Use orthographic projection */
  orthographic?: boolean;
  /** Scaler for the near plane, 1 unit equals to the height of the viewport. Default `0.1` */
  nearZMultiplier?: number;
  /** Scaler for the far plane, 1 unit equals to the distance from the camera to the edge of the screen. Default `1.01` */
  farZMultiplier?: number;
  /** Optionally override the near plane position. `nearZMultiplier` is ignored if `nearZ` is supplied. */
  nearZ?: number;
  /** Optionally override the far plane position. `farZMultiplier` is ignored if `farZ` is supplied. */
  farZ?: number;
  /** Render multiple copies of the world */
  repeat?: boolean;
  /** Internal use */
  worldOffset?: number;
  /** @deprecated Revert to approximated meter size calculation prior to v8.5 */
  legacyMeterSizes?: boolean;
};

/**
 * Manages transformations to/from WGS84 coordinates using the Web Mercator Projection.
 */
export default class WebMercatorViewport extends Viewport {
  static displayName = 'WebMercatorViewport';

  longitude: number;
  latitude: number;
  pitch: number;
  bearing: number;
  altitude: number;
  fovy: number;
  orthographic: boolean;

  /** Each sub viewport renders one copy of the world if repeat:true. The list is generated and cached on first request. */
  private _subViewports: WebMercatorViewport[] | null;
  /** @deprecated Revert to approximated meter size calculation prior to v8.5 */
  private _pseudoMeters: boolean;

  /* eslint-disable complexity, max-statements */
  constructor(opts: WebMercatorViewportOptions = {}) {
    const {
      latitude = 0,
      longitude = 0,
      zoom = 0,
      pitch = 0,
      bearing = 0,
      nearZMultiplier = 0.1,
      farZMultiplier = 1.01,
      nearZ,
      farZ,
      orthographic = false,
      projectionMatrix,

      repeat = false,
      worldOffset = 0,
      position,
      padding,

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
    let projectionParameters: any = null;
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

      let offset: [number, number] | undefined;
      if (padding) {
        const {top = 0, bottom = 0} = padding;
        offset = [0, clamp((top + height - bottom) / 2, 0, height) - height / 2];
      }

      projectionParameters = getProjectionParameters({
        width,
        height,
        scale,
        center: position && [0, 0, position[2] * unitsPerMeter(latitude)],
        offset,
        pitch,
        fovy,
        nearZMultiplier,
        farZMultiplier
      });

      if (Number.isFinite(nearZ)) {
        projectionParameters.near = nearZ;
      }
      if (Number.isFinite(farZ)) {
        projectionParameters.far = farZ;
      }
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

  get subViewports(): WebMercatorViewport[] | null {
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

  projectPosition(xyz: number[]): [number, number, number] {
    if (this._pseudoMeters) {
      // Backward compatibility
      return super.projectPosition(xyz);
    }
    const [X, Y] = this.projectFlat(xyz);
    const Z = (xyz[2] || 0) * unitsPerMeter(xyz[1]);
    return [X, Y, Z];
  }

  unprojectPosition(xyz: number[]): [number, number, number] {
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
  addMetersToLngLat(lngLatZ: number[], xyz: number[]): number[] {
    return addMetersToLngLat(lngLatZ, xyz);
  }

  panByPosition(coords: number[], pixel: number[]): WebMercatorViewportOptions {
    const fromLocation = pixelsToWorld(pixel, this.pixelUnprojectionMatrix);
    const toLocation = this.projectFlat(coords);

    const translate = vec2.add([], toLocation, vec2.negate([], fromLocation));
    const newCenter = vec2.add([], this.center, translate);

    const [longitude, latitude] = this.unprojectFlat(newCenter);
    return {longitude, latitude};
  }

  getBounds(options: {z?: number} = {}): [number, number, number, number] {
    // @ts-ignore
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
   */
  fitBounds(
    /** [[lon, lat], [lon, lat]] */
    bounds: [[number, number], [number, number]],
    options: {
      /** If not supplied, will use the current width of the viewport (default `1`) */
      width?: number;
      /** If not supplied, will use the current height of the viewport (default `1`) */
      height?: number;
      /** In degrees, 0.01 would be about 1000 meters */
      minExtent?: number;
      /** Max zoom level */
      maxZoom?: number;
      /** Extra padding in pixels */
      padding?: number | Required<Padding>;
      /** Center shift in pixels */
      offset?: number[];
    } = {}
  ) {
    const {width, height} = this;
    const {longitude, latitude, zoom} = fitBounds({width, height, bounds, ...options});
    return new WebMercatorViewport({width, height, longitude, latitude, zoom});
  }
}

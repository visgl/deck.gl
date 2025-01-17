// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Matrix4} from '@math.gl/core';
import Viewport from './viewport';
import {PROJECTION_MODE} from '../lib/constants';
import {altitudeToFovy, fovyToAltitude} from '@math.gl/web-mercator';
import {MAX_LATITUDE} from '@math.gl/web-mercator';

import {vec3, vec4} from '@math.gl/core';

const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;
const EARTH_RADIUS = 6370972;
const GLOBE_RADIUS = 256;

function getDistanceScales() {
  const unitsPerMeter = GLOBE_RADIUS / EARTH_RADIUS;
  const unitsPerDegree = (Math.PI / 180) * GLOBE_RADIUS;

  return {
    unitsPerMeter: [unitsPerMeter, unitsPerMeter, unitsPerMeter],
    unitsPerMeter2: [0, 0, 0],
    metersPerUnit: [1 / unitsPerMeter, 1 / unitsPerMeter, 1 / unitsPerMeter],
    unitsPerDegree: [unitsPerDegree, unitsPerDegree, unitsPerMeter],
    unitsPerDegree2: [0, 0, 0],
    degreesPerUnit: [1 / unitsPerDegree, 1 / unitsPerDegree, 1 / unitsPerMeter]
  };
}

export type GlobeViewportOptions = {
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
  /** Camera altitude relative to the viewport height, used to control the FOV. Default `1.5` */
  altitude?: number;
  /* Meter offsets of the viewport center from lng, lat */
  position?: number[];
  /** Zoom level */
  zoom?: number;
  /** Use orthographic projection */
  orthographic?: boolean;
  /** Camera fovy in degrees. If provided, overrides `altitude` */
  fovy?: number;
  /** Scaler for the near plane, 1 unit equals to the height of the viewport. Default `0.5` */
  nearZMultiplier?: number;
  /** Scaler for the far plane, 1 unit equals to the distance from the camera to the edge of the screen. Default `1` */
  farZMultiplier?: number;
  /** Optionally override the near plane position. `nearZMultiplier` is ignored if `nearZ` is supplied. */
  nearZ?: number;
  /** Optionally override the far plane position. `farZMultiplier` is ignored if `farZ` is supplied. */
  farZ?: number;
  /** The resolution at which to turn flat features into 3D meshes, in degrees. Smaller numbers will generate more detailed mesh. Default `10` */
  resolution?: number;
};

export default class GlobeViewport extends Viewport {
  longitude!: number;
  latitude!: number;
  resolution!: number;

  constructor(opts: GlobeViewportOptions = {}) {
    const {
      longitude = 0,
      zoom = 0,
      // Matches Maplibre defaults
      // https://github.com/maplibre/maplibre-gl-js/blob/f8ab4b48d59ab8fe7b068b102538793bbdd4c848/src/geo/projection/globe_transform.ts#L632-L633
      nearZMultiplier = 0.5,
      farZMultiplier = 1,
      resolution = 10
    } = opts;

    let {latitude = 0, height, altitude = 1.5, fovy} = opts;

    // Clamp to web mercator limit to prevent bad inputs
    latitude = Math.max(Math.min(latitude, MAX_LATITUDE), -MAX_LATITUDE);

    height = height || 1;
    if (fovy) {
      altitude = fovyToAltitude(fovy);
    } else {
      fovy = altitudeToFovy(altitude);
    }
    // Exagerate distance by latitude to match the Web Mercator distortion
    // The goal is that globe and web mercator projection results converge at high zoom
    // https://github.com/maplibre/maplibre-gl-js/blob/f8ab4b48d59ab8fe7b068b102538793bbdd4c848/src/geo/projection/globe_transform.ts#L575-L577
    const scaleAdjust = 1 / Math.PI / Math.cos((latitude * Math.PI) / 180);
    const scale = Math.pow(2, zoom) * scaleAdjust;
    const nearZ = opts.nearZ ?? nearZMultiplier;
    const farZ = opts.farZ ?? (altitude + (GLOBE_RADIUS * 2 * scale) / height) * farZMultiplier;

    // Calculate view matrix
    const viewMatrix = new Matrix4().lookAt({eye: [0, -altitude, 0], up: [0, 0, 1]});
    viewMatrix.rotateX(latitude * DEGREES_TO_RADIANS);
    viewMatrix.rotateZ(-longitude * DEGREES_TO_RADIANS);
    viewMatrix.scale(scale / height);

    super({
      ...opts,
      // x, y, width,
      height,

      // view matrix
      viewMatrix,
      longitude,
      latitude,
      zoom,

      // projection matrix parameters
      distanceScales: getDistanceScales(),
      fovy,
      focalDistance: altitude,
      near: nearZ,
      far: farZ
    });

    this.scale = scale;
    this.latitude = latitude;
    this.longitude = longitude;
    this.resolution = resolution;
  }

  get projectionMode() {
    return PROJECTION_MODE.GLOBE;
  }

  getDistanceScales() {
    return this.distanceScales;
  }

  getBounds(options: {z?: number} = {}): [number, number, number, number] {
    const unprojectOption = {targetZ: options.z || 0};

    const left = this.unproject([0, this.height / 2], unprojectOption);
    const top = this.unproject([this.width / 2, 0], unprojectOption);
    const right = this.unproject([this.width, this.height / 2], unprojectOption);
    const bottom = this.unproject([this.width / 2, this.height], unprojectOption);

    if (right[0] < this.longitude) right[0] += 360;
    if (left[0] > this.longitude) left[0] -= 360;

    return [
      Math.min(left[0], right[0], top[0], bottom[0]),
      Math.min(left[1], right[1], top[1], bottom[1]),
      Math.max(left[0], right[0], top[0], bottom[0]),
      Math.max(left[1], right[1], top[1], bottom[1])
    ];
  }

  unproject(
    xyz: number[],
    {topLeft = true, targetZ}: {topLeft?: boolean; targetZ?: number} = {}
  ): number[] {
    const [x, y, z] = xyz;

    const y2 = topLeft ? y : this.height - y;
    const {pixelUnprojectionMatrix} = this;

    let coord;
    if (Number.isFinite(z)) {
      // Has depth component
      coord = transformVector(pixelUnprojectionMatrix, [x, y2, z, 1]);
    } else {
      // since we don't know the correct projected z value for the point,
      // unproject two points to get a line and then find the point on that line that intersects with the sphere
      const coord0 = transformVector(pixelUnprojectionMatrix, [x, y2, -1, 1]);
      const coord1 = transformVector(pixelUnprojectionMatrix, [x, y2, 1, 1]);

      const lt = ((targetZ || 0) / EARTH_RADIUS + 1) * GLOBE_RADIUS;
      const lSqr = vec3.sqrLen(vec3.sub([], coord0, coord1));
      const l0Sqr = vec3.sqrLen(coord0);
      const l1Sqr = vec3.sqrLen(coord1);
      const sSqr = (4 * l0Sqr * l1Sqr - (lSqr - l0Sqr - l1Sqr) ** 2) / 16;
      const dSqr = (4 * sSqr) / lSqr;
      const r0 = Math.sqrt(l0Sqr - dSqr);
      const dr = Math.sqrt(Math.max(0, lt * lt - dSqr));
      const t = (r0 - dr) / Math.sqrt(lSqr);

      coord = vec3.lerp([], coord0, coord1, t);
    }
    const [X, Y, Z] = this.unprojectPosition(coord);

    if (Number.isFinite(z)) {
      return [X, Y, Z];
    }
    return Number.isFinite(targetZ) ? [X, Y, targetZ as number] : [X, Y];
  }

  projectPosition(xyz: number[]): [number, number, number] {
    const [lng, lat, Z = 0] = xyz;
    const lambda = lng * DEGREES_TO_RADIANS;
    const phi = lat * DEGREES_TO_RADIANS;
    const cosPhi = Math.cos(phi);
    const D = (Z / EARTH_RADIUS + 1) * GLOBE_RADIUS;

    return [Math.sin(lambda) * cosPhi * D, -Math.cos(lambda) * cosPhi * D, Math.sin(phi) * D];
  }

  unprojectPosition(xyz: number[]): [number, number, number] {
    const [x, y, z] = xyz;
    const D = vec3.len(xyz);
    const phi = Math.asin(z / D);
    const lambda = Math.atan2(x, -y);

    const lng = lambda * RADIANS_TO_DEGREES;
    const lat = phi * RADIANS_TO_DEGREES;
    const Z = (D / GLOBE_RADIUS - 1) * EARTH_RADIUS;
    return [lng, lat, Z];
  }

  projectFlat(xyz: number[]): [number, number] {
    return xyz as [number, number];
  }

  unprojectFlat(xyz: number[]): [number, number] {
    return xyz as [number, number];
  }

  panByPosition(coords: number[], pixel: number[]): GlobeViewportOptions {
    const fromPosition = this.unproject(pixel);
    return {
      longitude: coords[0] - fromPosition[0] + this.longitude,
      latitude: coords[1] - fromPosition[1] + this.latitude
    };
  }
}

function transformVector(matrix: number[], vector: number[]): number[] {
  const result = vec4.transformMat4([], vector, matrix);
  vec4.scale(result, result, 1 / result[3]);
  return result;
}

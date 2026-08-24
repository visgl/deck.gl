// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Matrix4, vec3, vec4} from '@math.gl/core';
import {altitudeToFovy, fovyToAltitude, MAX_LATITUDE} from '@math.gl/web-mercator';
import Viewport from './viewport';
import {PROJECTION_MODE} from '../lib/constants';
import {mod} from '../utils/math-utils';

const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;
const EARTH_RADIUS = 6370972;
export const GLOBE_RADIUS = 256;
// Where along the screen-pixel-to-globe-center distance ratio the anchored
// zoom starts losing strength. Below this ratio the anchor uses full correction; from
// here to the limb (ratio = 1) the anchor blends toward MIN_STRENGTH so a
// near-edge pixel doesn't snap the camera across the globe.
const GLOBE_ZOOM_ANCHOR_DAMPING_START_RATIO = 0.75;
const GLOBE_ZOOM_ANCHOR_MIN_STRENGTH = 0.35;
const GLOBE_ZOOM_ANCHOR_MAX_DISTANCE_RATIO = 1.15;

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
  /** Bearing in degrees. Default `0` */
  bearing?: number;
  /** Pitch in degrees. Default `0` */
  pitch?: number;
  /** Camera altitude relative to the viewport height, used to control the FOV. Default `1.5` */
  altitude?: number;
  /* Meter offsets of the viewport center from lng, lat, elevation */
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
  static displayName = 'GlobeViewport';

  longitude: number;
  latitude: number;
  bearing: number;
  pitch: number;
  fovy: number;
  resolution: number;

  constructor(opts: GlobeViewportOptions = {}) {
    const {
      longitude = 0,
      bearing = 0,
      pitch = 0,
      zoom = 0,
      // Matches Maplibre defaults
      // https://github.com/maplibre/maplibre-gl-js/blob/f8ab4b48d59ab8fe7b068b102538793bbdd4c848/src/geo/projection/globe_transform.ts#L632-L633
      nearZMultiplier = 0.5,
      farZMultiplier = 1,
      resolution = 10
    } = opts;

    let {latitude = 0, height, altitude = 1.5, fovy} = opts;

    // Clamp to valid range
    latitude = Math.max(Math.min(latitude, 90), -90);

    height = height || 1;
    if (fovy) {
      altitude = fovyToAltitude(fovy);
    } else {
      fovy = altitudeToFovy(altitude);
    }
    // Exagerate distance by latitude to match the Web Mercator distortion
    // The goal is that globe and web mercator projection results converge at high zoom
    // https://github.com/maplibre/maplibre-gl-js/blob/f8ab4b48d59ab8fe7b068b102538793bbdd4c848/src/geo/projection/globe_transform.ts#L575-L577
    // Cap latitude for scale calculation to avoid the singularity at the poles
    // where cos(90°)=0 → scale→∞. GlobeController applies the same cap when
    // compensating zoom during pan (MAX_LATITUDE).
    const scaleLatitude = Math.max(Math.min(latitude, MAX_LATITUDE), -MAX_LATITUDE);
    const scale = Math.pow(2, zoom - zoomAdjust(scaleLatitude));
    // Adjust far plane for pitch — tilted camera can see further across the globe
    const pitchRadians = pitch * DEGREES_TO_RADIANS;
    const nearZ = opts.nearZ ?? nearZMultiplier;
    const farZ =
      opts.farZ ??
      (altitude + (GLOBE_RADIUS * 2 * scale) / height / Math.max(Math.cos(pitchRadians), 0.1)) *
        farZMultiplier;

    // Calculate view matrix
    // The lookAt places the camera along -Y looking toward origin.
    // After the globe rotation (Rx(lat) * Rz(-lng)), the surface normal at the target
    // aligns with -Y, East with +X, and North with +Z.
    const viewMatrix = new Matrix4()
      .lookAt({eye: [0, -altitude, 0], up: [0, 0, 1]})
      // Pitch: tilt the camera away from straight-down
      .rotateX(-pitchRadians)
      // Bearing: rotate around the surface normal.
      // Negative sign matches the WebMercator convention (bearing > 0 = clockwise from North).
      .rotateY(-bearing * DEGREES_TO_RADIANS)
      // Globe orientation: position the target's surface at the top
      .rotateX(latitude * DEGREES_TO_RADIANS)
      .rotateZ(-longitude * DEGREES_TO_RADIANS)
      .scale(scale / height);

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
    this.bearing = bearing;
    this.pitch = pitch;
    this.fovy = fovy;
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

  /**
   * Builds the screen-pixel → globe-center ray and the intermediate ray/sphere
   * math reused by `unproject` and anchored zoom. One function so the same
   * pixelUnprojectionMatrix work isn't duplicated.
   */
  private _getRayToGlobe(
    screenPosition: number[],
    {topLeft = true, targetZ}: {topLeft?: boolean; targetZ?: number} = {}
  ): {
    rayStartPosition: number[];
    rayEndPosition: number[];
    radius: number;
    rayLengthSquared: number;
    rayStartDistanceSquared: number;
    distanceToCenterSquared: number;
  } {
    const [screenX, screenY] = screenPosition;
    const adjustedScreenY = topLeft ? screenY : this.height - screenY;
    const {pixelUnprojectionMatrix} = this;

    const rayStartPosition = transformVector(pixelUnprojectionMatrix, [
      screenX,
      adjustedScreenY,
      -1,
      1
    ]);
    const rayEndPosition = transformVector(pixelUnprojectionMatrix, [
      screenX,
      adjustedScreenY,
      1,
      1
    ]);

    const radius = ((targetZ || 0) / EARTH_RADIUS + 1) * GLOBE_RADIUS;
    const rayLengthSquared = vec3.sqrLen(vec3.sub([], rayStartPosition, rayEndPosition));
    const rayStartDistanceSquared = vec3.sqrLen(rayStartPosition);
    const rayEndDistanceSquared = vec3.sqrLen(rayEndPosition);
    const triangleAreaSquared =
      (4 * rayStartDistanceSquared * rayEndDistanceSquared -
        (rayLengthSquared - rayStartDistanceSquared - rayEndDistanceSquared) ** 2) /
      16;
    const distanceToCenterSquared = (4 * triangleAreaSquared) / rayLengthSquared;

    return {
      rayStartPosition,
      rayEndPosition,
      radius,
      rayLengthSquared,
      rayStartDistanceSquared,
      distanceToCenterSquared
    };
  }

  private _getRayDistanceToGlobeCenterRatio(
    screenPosition: number[],
    options?: {topLeft?: boolean; targetZ?: number}
  ): number {
    const {distanceToCenterSquared, radius} = this._getRayToGlobe(screenPosition, options);

    return Math.sqrt(Math.max(0, distanceToCenterSquared)) / radius;
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
      const {
        rayStartPosition,
        rayEndPosition,
        radius,
        rayLengthSquared,
        rayStartDistanceSquared,
        distanceToCenterSquared
      } = this._getRayToGlobe(xyz, {topLeft, targetZ});
      const rayStartToClosestApproach = Math.sqrt(
        rayStartDistanceSquared - distanceToCenterSquared
      );
      const closestApproachToIntersection = Math.sqrt(
        Math.max(0, radius * radius - distanceToCenterSquared)
      );
      const intersectionRatio =
        (rayStartToClosestApproach - closestApproachToIntersection) / Math.sqrt(rayLengthSquared);

      coord = vec3.lerp([], rayStartPosition, rayEndPosition, intersectionRatio);
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

  /**
   * Pan the globe to place geographic coordinates at a screen pixel.
   * When `dragStartPosition` is supplied, applies the delta-based movement used by globe dragging.
   * @param coordinates - Geographic anchor, or the starting longitude, latitude and zoom.
   * @param screenPosition - Current screen position.
   * @param dragStartPosition - Screen position where a drag started.
   * @returns Updated viewport options.
   */
  panByPosition(
    coordinates: number[],
    screenPosition: number[],
    dragStartPosition?: number[]
  ): GlobeViewportOptions {
    if (!dragStartPosition) {
      const distanceRatio = this._getRayDistanceToGlobeCenterRatio(screenPosition);
      if (distanceRatio > GLOBE_ZOOM_ANCHOR_MAX_DISTANCE_RATIO) {
        return {longitude: this.longitude, latitude: this.latitude};
      }

      const currentCoordinates = this.unproject(screenPosition);
      const edgeProgress = Math.max(
        0,
        Math.min(
          1,
          (distanceRatio - GLOBE_ZOOM_ANCHOR_DAMPING_START_RATIO) /
            (1 - GLOBE_ZOOM_ANCHOR_DAMPING_START_RATIO)
        )
      );
      const anchorStrength = 1 - edgeProgress * (1 - GLOBE_ZOOM_ANCHOR_MIN_STRENGTH);
      const longitudeDelta = mod(coordinates[0] - currentCoordinates[0] + 180, 360) - 180;
      const longitude = this.longitude + longitudeDelta * anchorStrength;
      const latitude = Math.max(
        Math.min(this.latitude + (coordinates[1] - currentCoordinates[1]) * anchorStrength, 90),
        -90
      );

      return {longitude, latitude};
    }

    const [startLongitude, startLatitude, startZoom] = coordinates;
    // Scale rotation speed inversely with zoom, to approximate constant panning speed
    const scale = Math.pow(2, this.zoom - zoomAdjust(this.latitude));
    const rotationSpeed = 0.25 / scale;

    const longitude = startLongitude + rotationSpeed * (dragStartPosition[0] - screenPosition[0]);
    let latitude = startLatitude - rotationSpeed * (dragStartPosition[1] - screenPosition[1]);
    latitude = Math.max(Math.min(latitude, 90), -90);
    const nextViewState = {longitude, latitude, zoom: startZoom - zoomAdjust(startLatitude)};
    nextViewState.zoom += zoomAdjust(nextViewState.latitude);
    return nextViewState;
  }
}

export function zoomAdjust(latitude: number, clampToPoles?: boolean): number {
  if (clampToPoles) {
    latitude = Math.max(Math.min(latitude, MAX_LATITUDE), -MAX_LATITUDE);
  }
  const scaleAdjust = Math.PI * Math.cos((latitude * Math.PI) / 180);
  return Math.log2(scaleAdjust);
}

function transformVector(matrix: number[], vector: number[]): number[] {
  const result = vec4.transformMat4([], vector, matrix);
  vec4.scale(result, result, 1 / result[3]);
  return result;
}

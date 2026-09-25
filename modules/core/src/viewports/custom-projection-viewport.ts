// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Viewport from './viewport';
import type {ViewportOptions, DistanceScales} from './viewport';
import {
  getViewMatrix,
  getProjectionParameters,
  altitudeToFovy,
  pixelsToWorld
} from '@math.gl/web-mercator';
import {PROJECTION_MODE} from '../lib/constants';

/** A planar map converter, compatible with proj4js converters targeting a meter-based CRS. */
export type ProjectionConverter = {
  /** Converts world XYZ to map meters: planar X/Y and altitude Z in meters. */
  forward: (position: number[]) => number[];
  /** Converts map-meter XYZ back to world coordinates, or returns null outside its domain. */
  inverse: (position: number[]) => number[] | null;
};

export type CustomProjectionViewportOptions = Omit<ViewportOptions, 'position'> & {
  /** Converts world XYZ in fromCrs to planar map-meter XYZ in toCrs, and back. */
  projection: ProjectionConverter;
  /** World-coordinate CRS name or PROJ string. Defaults to WGS84. */
  fromCrs?: string;
  /** Planar, meter-based map CRS name or PROJ string. Changing either CRS refreshes projected positions. */
  toCrs?: string;
  /** Optional [minX, minY, maxX, maxY] in fromCrs world coordinates. Clamps XY before
   * forward projection and after valid inverse projection; Z is unchanged.
   */
  fromBounds?: [number, number, number, number];
  /** Extent in toCrs mapped into a 512-unit box, preserving aspect ratio.
   * Defaults to [-EC/2, -EC/2, EC/2, EC/2], where EC = 40075016.6855.
   * Override to customize common-space scale and origin.
   */
  toBounds?: [number, number, number, number];
  /** Camera center in fromCrs world coordinates. Defaults to [0, 0, 0]; Z is locked to zero. */
  center?: [number, number, number];
  /** Map pitch in degrees. */
  pitch?: number;
  /** Map bearing in degrees. */
  bearing?: number;
  /** Maximum tessellation cell size in fromCrs world-coordinate units. Default 0 disables subdivision. */
  resolution?: number;
  /** Ground meters per map meter along the X/Y axes, evaluated at [x, y] in toCrs.
   * Describes horizontal projection distortion; converted altitude is always in meters.
   * Without this callback, estimates distance from fromCrs: spherical for degrees, planar
   * for recognized linear units, or no distortion correction for an unknown CRS.
   */
  getDistanceScale?: (position: [number, number]) => [number, number];
};

const EC = 40075016.6855; // Earth circumference in meters.
const DEFAULT_TO_BOUNDS: [number, number, number, number] = [-EC / 2, -EC / 2, EC / 2, EC / 2];

/** A planar camera over CPU-preprojected coordinates. Projection libraries stay outside core.
 * @experimental Exported as `_CustomProjectionViewport`; this API may change.
 */
export default class CustomProjectionViewport extends Viewport {
  static displayName = 'CustomProjectionViewport';
  /** Map pitch in degrees. */
  pitch: number;
  /** Map bearing in degrees. */
  bearing: number;
  private signature: string;

  constructor(opts: CustomProjectionViewportOptions) {
    const {
      projection,
      toBounds = DEFAULT_TO_BOUNDS,
      fromBounds,
      fromCrs = 'WGS84',
      toCrs,
      resolution = 0,
      center = [0, 0, 0],
      pitch = 0,
      bearing = 0,
      zoom = 0
    } = opts;
    const [minX, minY, maxX, maxY] = toBounds;
    if (
      !toBounds.every(Number.isFinite) ||
      maxX <= minX ||
      maxY <= minY ||
      !Number.isFinite(resolution) ||
      resolution < 0
    ) {
      throw new Error(
        'CustomProjectionViewport requires finite bounds and non-negative resolution'
      );
    }
    if (
      fromBounds &&
      (!fromBounds.every(Number.isFinite) ||
        fromBounds[2] <= fromBounds[0] ||
        fromBounds[3] <= fromBounds[1])
    ) {
      throw new Error('CustomProjectionViewport requires finite, increasing fromBounds');
    }
    const normalizationScale = 512 / Math.max(maxX - minX, maxY - minY);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const height = opts.height || 1;
    const width = opts.width || 1;
    const altitude = 1.5;
    const fovy = altitudeToFovy(altitude);
    const {top = 0, bottom = 0} = opts.padding || {};
    // Match WebMercatorViewport's clipping planes when padding shifts the camera center.
    const offset: [number, number] = [
      0,
      Math.max(0, Math.min(height, (top + height - bottom) / 2)) - height / 2
    ];
    const preproject = (position: number[]): [number, number, number] => {
      const projected = projection.forward(clampInput(position, fromBounds));
      return [
        (projected[0] - centerX) * normalizationScale + 256,
        (projected[1] - centerY) * normalizationScale + 256,
        projected[2] ?? position[2] ?? 0
      ];
    };
    const postUnproject = (position: number[]): [number, number, number] | null => {
      const projected = [
        (position[0] - 256) / normalizationScale + centerX,
        (position[1] - 256) / normalizationScale + centerY,
        position[2] || 0
      ];
      try {
        const input = projection.inverse(projected.slice());
        if (!input || input.length < 2 || !input.every(Number.isFinite)) return null;
        // Some converters return finite extrapolations outside their inverse domain.
        const roundTrip = projection.forward(input.slice());
        if (
          !Number.isFinite(roundTrip[0]) ||
          !Number.isFinite(roundTrip[1]) ||
          Math.hypot(roundTrip[0] - projected[0], roundTrip[1] - projected[1]) *
            normalizationScale >
            1e-5
        )
          return null;
        // Validate the inverse before clamping: bounded picking deliberately returns
        // the boundary coordinate, which need not round-trip to the original pixel.
        const bounded = clampInput(input, fromBounds);
        return [bounded[0], bounded[1], bounded[2] ?? projected[2]];
      } catch {
        return null;
      }
    };
    const position = [center[0], center[1], 0];
    const worldCenter = clampInput(position, fromBounds);
    let localScale: number[];
    if (opts.getDistanceScale) {
      const [x, y] = projection.forward(worldCenter);
      const scale = opts.getDistanceScale([x, y]);
      if (scale.length !== 2 || !scale.every(value => Number.isFinite(value) && value > 0)) {
        throw new Error('getDistanceScale must return two finite, positive scales');
      }
      localScale = [1 / scale[0], 1 / scale[1], 1 / Math.sqrt(scale[0] * scale[1])];
    } else {
      const spherical = isSphericalCrs(fromCrs);
      localScale =
        spherical === undefined
          ? [1, 1, 1]
          : estimateUnitsPerMeter(projection, worldCenter, spherical, fromBounds);
    }
    const unitsPerMeter = localScale.map(
      value => (Number.isFinite(value) && value > 0 ? value : 1) * normalizationScale
    );
    super({
      ...opts,
      width,
      height,
      longitude: undefined,
      latitude: undefined,
      modelMatrix: null,
      position,
      distanceScales: {unitsPerMeter, metersPerUnit: unitsPerMeter.map(value => 1 / value)},
      preproject,
      postUnproject,
      zoom,
      fovy,
      viewMatrix: getViewMatrix({height, pitch, bearing, scale: 2 ** zoom, altitude}),
      ...getProjectionParameters({
        width,
        height,
        pitch,
        scale: 2 ** zoom,
        fovy,
        offset,
        nearZMultiplier: 0.1,
        farZMultiplier: 1.01
      })
    });
    this.pitch = pitch;
    this.bearing = bearing;
    this.resolution = resolution;
    this.signature = JSON.stringify([fromCrs, toCrs, resolution]);
  }

  get projectionSignature(): string {
    return this.signature;
  }
  get projectionMode(): number {
    return PROJECTION_MODE.EXTERNAL;
  }

  /** Converts world coordinates to common-space XY. */
  projectFlat(position: number[]): [number, number] {
    const projected = this.preproject!(position);
    return [projected[0], projected[1]];
  }
  /** Converts common-space XY to world coordinates; invalid inverses return NaN. */
  unprojectFlat(position: number[]): [number, number] {
    const world = this.postUnproject!([position[0], position[1], 0]);
    return world ? [world[0], world[1]] : [NaN, NaN];
  }

  /** Converts world XYZ to common XYZ, including the converter's altitude conversion. */
  projectPosition(position: number[]): [number, number, number] {
    const projected = this.preproject!(position);
    return [projected[0], projected[1], (projected[2] || 0) * this.distanceScales.unitsPerMeter[2]];
  }

  /** Converts common XYZ to world XYZ; invalid inverses return NaN. */
  unprojectPosition(position: number[]): [number, number, number] {
    return (
      this.postUnproject!([
        position[0],
        position[1],
        (position[2] || 0) * this.distanceScales.metersPerUnit[2]
      ]) || [NaN, NaN, NaN]
    );
  }

  getDistanceScales(): DistanceScales {
    return this.distanceScales;
  }

  panByPosition(position: number[], pixel: number[]): {center: [number, number, number]} {
    const underPointer = pixelsToWorld(pixel, this.pixelUnprojectionMatrix, 0);
    const common = this.projectPosition(position);
    const nextCenter =
      this.postUnproject!([
        this.center[0] + common[0] - underPointer[0],
        this.center[1] + common[1] - underPointer[1],
        0
      ]) || this.position;
    return {center: [nextCenter[0], nextCenter[1], 0]};
  }
}

/** Classify world coordinates without resolving or interpreting the full CRS definition. */
function isSphericalCrs(crs: string): boolean | undefined {
  const s = crs.trim().toLowerCase();
  // Explicit unit declarations take precedence over the projection name.
  if (/\+units=(?:degree|degrees|deg)\b/.test(s)) return true;
  if (/\+units=(?:m|meter|metre|ft|us-ft)\b/.test(s)) return false;
  if (/\+proj=(?:longlat|latlong|lonlat)\b/.test(s)) return true;
  if (/^(?:epsg:)?4326$/.test(s)) return true;
  if (/^wgs\s*84$/.test(s)) return true;
  return undefined;
}

/** Estimate local distortion relative to spherical or planar world-coordinate distances. */
function estimateUnitsPerMeter(
  projection: ProjectionConverter,
  center: number[],
  spherical: boolean,
  fromBounds?: CustomProjectionViewportOptions['fromBounds']
): [number, number, number] {
  const metersPerDegree = EC / 360;
  const metersPerUnit = spherical
    ? [
        metersPerDegree * Math.max(1e-6, Math.abs(Math.cos((center[1] * Math.PI) / 180))),
        metersPerDegree,
        1
      ]
    : [1, 1, 1];
  // Sample a one-meter displacement in each input direction.
  const stepX = 1 / metersPerUnit[0];
  const stepY = 1 / metersPerUnit[1];
  // Sample toward the interior at longitude/latitude limits to avoid crossing a seam or pole.
  const midX = fromBounds ? (fromBounds[0] + fromBounds[2]) / 2 : 0;
  const midY = fromBounds ? (fromBounds[1] + fromBounds[3]) / 2 : 0;
  const dx = center[0] > midX ? -stepX : stepX;
  const dy = center[1] > midY ? -stepY : stepY;
  try {
    const origin = projection.forward(clampInput(center, fromBounds));
    const inputX = clampInput([center[0] + dx, center[1], center[2] ?? 0], fromBounds);
    const inputY = clampInput([center[0], center[1] + dy, center[2] ?? 0], fromBounds);
    const x = projection.forward(inputX.slice());
    const y = projection.forward(inputY.slice());
    const metersX = Math.abs(inputX[0] - center[0]) * metersPerUnit[0];
    const metersY = Math.abs(inputY[1] - center[1]) * metersPerUnit[1];
    const scaleX = Math.hypot(x[0] - origin[0], x[1] - origin[1]) / metersX;
    const scaleY = Math.hypot(y[0] - origin[0], y[1] - origin[1]) / metersY;
    const areaScale = Math.abs(
      (x[0] - origin[0]) * (y[1] - origin[1]) - (x[1] - origin[1]) * (y[0] - origin[0])
    );
    return [scaleX, scaleY, Math.sqrt(areaScale / (metersX * metersY))];
  } catch {
    // Converters may reject samples outside their domain; retain a finite fallback scale.
    return [1, 1, 1];
  }
}

function clampInput(
  position: number[],
  bounds?: CustomProjectionViewportOptions['fromBounds']
): number[] {
  const result = position.slice();
  if (bounds) {
    result[0] = Math.max(bounds[0], Math.min(bounds[2], result[0]));
    result[1] = Math.max(bounds[1], Math.min(bounds[3], result[1]));
  }
  return result;
}

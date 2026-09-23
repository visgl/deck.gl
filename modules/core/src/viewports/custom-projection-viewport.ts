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
  /** Map-meter extent in toCrs covered by local meter sizing. Defaults to the Web Mercator extent.
   * Does not change position normalization or constrain navigation.
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
const NORMALIZATION_SCALE = 512 / EC;

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
  private scaleOptions: CustomProjectionViewportOptions;
  readonly sizeScaleSignature: string;
  /** Map-meter XY to sampler XY: scale followed by translation. */
  readonly sizeScaleTransform: [number, number, number, number];
  private localUnitsPerMeter?: (mapPosition: number[], worldPosition?: number[]) => [number, number, number];

  constructor(opts: CustomProjectionViewportOptions) {
    const {
      projection,
      fromBounds,
      toBounds = [-EC / 2, -EC / 2, EC / 2, EC / 2],
      fromCrs = 'WGS84',
      toCrs,
      resolution = 0,
      center = [0, 0, 0],
      pitch = 0,
      bearing = 0,
      zoom = 0
    } = opts;
    if (!Number.isFinite(resolution) || resolution < 0) {
      throw new Error('CustomProjectionViewport requires finite, non-negative resolution');
    }
    if (
      fromBounds &&
      (!fromBounds.every(Number.isFinite) ||
        fromBounds[2] <= fromBounds[0] ||
        fromBounds[3] <= fromBounds[1])
    ) {
      throw new Error('CustomProjectionViewport requires finite, increasing fromBounds');
    }
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
      return [projected[0], projected[1], projected[2] ?? position[2] ?? 0];
    };
    const postUnproject = (position: number[]): [number, number, number] | null => {
      const projected = [position[0], position[1], position[2] || 0];
      try {
        const input = projection.inverse(projected.slice());
        if (!input || input.length < 2 || !input.every(Number.isFinite)) return null;
        // Some converters return finite extrapolations outside their inverse domain.
        const roundTrip = projection.forward(input.slice());
        if (
          !Number.isFinite(roundTrip[0]) ||
          !Number.isFinite(roundTrip[1]) ||
          Math.hypot(roundTrip[0] - projected[0], roundTrip[1] - projected[1]) *
            NORMALIZATION_SCALE >
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
    if (!toBounds.every(Number.isFinite) || toBounds[2] <= toBounds[0] || toBounds[3] <= toBounds[1]) {
      throw new Error('CustomProjectionViewport requires finite, increasing toBounds');
    }
    const spherical = isSphericalCrs(fromCrs);
    const localUnitsPerMeter = (mapPosition: number[], worldPosition?: number[]): [number, number, number] => {
      if (opts.getDistanceScale) {
        const scale = opts.getDistanceScale([mapPosition[0], mapPosition[1]]);
        if (scale.length !== 2 || !scale.every(value => Number.isFinite(value) && value > 0)) {
          throw new Error('getDistanceScale must return two finite, positive scales');
        }
        return [1 / scale[0], 1 / scale[1], 1 / Math.sqrt(scale[0] * scale[1])];
      }
      if (spherical === undefined) return [1, 1, 1];
      const world = worldPosition || projection.inverse([mapPosition[0], mapPosition[1], 0]);
      return world ? estimateUnitsPerMeter(projection, world, spherical, fromBounds) : [1, 1, 1];
    };
    const localScale = localUnitsPerMeter(projection.forward(worldCenter), worldCenter);
    const unitsPerMeter = localScale.map(
      value => (Number.isFinite(value) && value > 0 ? value : 1) * NORMALIZATION_SCALE
    ) as [number, number, number];
    super({
      ...opts,
      width,
      height,
      longitude: undefined,
      latitude: undefined,
      modelMatrix: null,
      position,
      distanceScales: {
        unitsPerWorldUnit: [NORMALIZATION_SCALE, NORMALIZATION_SCALE, NORMALIZATION_SCALE],
        unitsPerMeter
      },
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
    this.scaleOptions = {...opts, toBounds};
    this.localUnitsPerMeter = localUnitsPerMeter;
    this.sizeScaleSignature = JSON.stringify([fromCrs, toCrs, fromBounds, toBounds]);
    const scaleX = 512 / (toBounds[2] - toBounds[0]);
    const scaleY = 512 / (toBounds[3] - toBounds[1]);
    this.sizeScaleTransform = [scaleX, scaleY, -toBounds[0] * scaleX, -toBounds[1] * scaleY];
    this.pitch = pitch;
    this.isGeospatial = true;
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

  /** Generate four-float records containing scalar XY scale, its X/Y slopes, and Z scale.
   * Slopes are per sampler-space unit; a zero scalar marks an invalid record.
   * Internal: generated on demand by the device resource owner, not on camera updates.
   */
  getSizeScaleData(size = 64): Float32Array {
    const {projection, fromBounds} = this.scaleOptions;
    const toBounds = this.scaleOptions.toBounds!;
    const [minX, minY, maxX, maxY] = toBounds;
    const normalization = NORMALIZATION_SCALE;
    const data = new Float32Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const common = [((x + 0.5) * 512) / size, ((y + 0.5) * 512) / size];
        const output = [
          minX + (common[0] / 512) * (maxX - minX),
          minY + (common[1] / 512) * (maxY - minY),
          0
        ];
        try {
          if (output[0] < minX || output[0] > maxX || output[1] < minY || output[1] > maxY)
            continue;
          const input = projection.inverse(output);
          if (!input || input.length < 2 || !input.every(Number.isFinite)) continue;
          if (
            fromBounds &&
            (input[0] < fromBounds[0] ||
              input[0] > fromBounds[2] ||
              input[1] < fromBounds[1] ||
              input[1] > fromBounds[3])
          )
            continue;
          const roundTrip = projection.forward(input.slice());
          if (
            !roundTrip.every(Number.isFinite) ||
            Math.hypot(roundTrip[0] - output[0], roundTrip[1] - output[1]) * normalization > 1e-5
          )
            continue;
          const scale = this.localUnitsPerMeter!(output, input);
          const commonScale = scale.map(value => Math.fround(value));
          if (!commonScale.every(value => Number.isFinite(value) && value > 0)) continue;
          const offset = (y * size + x) * 4;
          data.set([commonScale[2], 0, 0, commonScale[2]], offset);
        } catch {
          // A failed inverse or derivative sample leaves an invalid, zero texel.
        }
      }
    }
    // Derive slopes from the sampled scalar field without more projection calls.
    // Do not difference across invalid texels. Prefer centered differences, then
    // second-order one-sided differences at boundaries, then a first-order fallback.
    const spacing = 512 / size;
    const sample = (x: number, y: number) =>
      x >= 0 && x < size && y >= 0 && y < size ? data[(y * size + x) * 4] : 0;
    const slope = (x: number, y: number, dx: number, dy: number) => {
      const center = sample(x, y);
      const before = sample(x - dx, y - dy);
      const after = sample(x + dx, y + dy);
      if (before > 0 && after > 0) return (after - before) / (2 * spacing);
      if (after > 0) {
        const next = sample(x + 2 * dx, y + 2 * dy);
        return next > 0
          ? (-3 * center + 4 * after - next) / (2 * spacing)
          : (after - center) / spacing;
      }
      if (before > 0) {
        const previous = sample(x - 2 * dx, y - 2 * dy);
        return previous > 0
          ? (3 * center - 4 * before + previous) / (2 * spacing)
          : (center - before) / spacing;
      }
      return 0;
    };
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const offset = (y * size + x) * 4;
        if (data[offset] > 0) {
          data[offset + 1] = slope(x, y, 1, 0);
          data[offset + 2] = slope(x, y, 0, 1);
        }
      }
    }
    // Bleed one texel (including diagonals) into unsampled space. Instance positions
    // are already preprojected: an invalid sample center need not mean an invalid
    // instance position. Read only the original field so padding cannot cascade.
    const padded = data.slice();
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const offset = (y * size + x) * 4;
        if (data[offset] > 0) continue;
        let nearestDistance = Infinity;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const distance = dx * dx + dy * dy;
            if (distance >= nearestDistance || sample(x + dx, y + dy) <= 0) continue;
            const source = ((y + dy) * size + x + dx) * 4;
            // Recenter the source's Taylor approximation, rather than copying its
            // scale. Preserve its slopes and the ratio between Z and XY scales.
            const scale = Math.fround(
              data[source] - spacing * (dx * data[source + 1] + dy * data[source + 2])
            );
            if (!(scale > 0 && Number.isFinite(scale))) continue;
            nearestDistance = distance;
            padded.set(
              [
                scale,
                data[source + 1],
                data[source + 2],
                (data[source + 3] * scale) / data[source]
              ],
              offset
            );
          }
        }
      }
    }
    return padded;
  }

  /** Converts XY in map meters (toCrs) to common-space XY by applying the fixed scale.
   * Does not accept world coordinates in fromCrs or call projection.forward.
   * Ignores Z; use projectPosition to convert a world-coordinate XYZ position.
   */
  projectFlat(position: number[]): [number, number] {
    return [position[0] * NORMALIZATION_SCALE, position[1] * NORMALIZATION_SCALE];
  }
  /** Converts common-space XY to XY in map meters (toCrs) by reversing the fixed scale.
   * Does not return world coordinates in fromCrs or call projection.inverse.
   * Ignores Z; use unprojectPosition to convert common XYZ to world coordinates.
   */
  unprojectFlat(position: number[]): [number, number] {
    return [position[0] / NORMALIZATION_SCALE, position[1] / NORMALIZATION_SCALE];
  }

  /** Converts world XYZ to common XYZ, including the converter's altitude conversion. */
  projectPosition(position: number[]): [number, number, number] {
    const projected = this.preproject!(position);
    return [
      projected[0] * NORMALIZATION_SCALE,
      projected[1] * NORMALIZATION_SCALE,
      projected[2] * this.getDistanceScales(projected).unitsPerMeter[2]
    ];
  }

  /** Converts common XYZ to world XYZ; invalid inverses return NaN. */
  unprojectPosition(position: number[]): [number, number, number] {
    return (
      this.postUnproject!([
        position[0] / NORMALIZATION_SCALE,
        position[1] / NORMALIZATION_SCALE,
        (position[2] || 0) / this.getDistanceScales([position[0] / NORMALIZATION_SCALE, position[1] / NORMALIZATION_SCALE]).unitsPerMeter[2]
      ]) || [NaN, NaN, NaN]
    );
  }

  /** Returns local scales at XY in map meters (toCrs), or viewport-center scales when omitted. */
  getDistanceScales(mapPosition?: number[]): DistanceScales {
    // The base constructor projects the center before this instance's callback is assigned.
    if (!mapPosition || !this.localUnitsPerMeter) return this.distanceScales;
    const unitsPerMeter = this.localUnitsPerMeter(mapPosition).map(value => value * NORMALIZATION_SCALE) as [number, number, number];
    return {...this.distanceScales, unitsPerMeter, metersPerUnit: unitsPerMeter.map(value => 1 / value) as [number, number, number]};
  }

  /** Intersects the viewing ray with the locally scaled world-altitude surface. */
  unproject(position: number[], options: {topLeft?: boolean; targetZ?: number} = {}): number[] {
    if (Number.isFinite(position[2]) || !options.targetZ) return super.unproject(position, options);
    const {topLeft = true, targetZ} = options;
    const pixel = [position[0], topLeft ? position[1] : this.height - position[1]];
    let common = pixelsToWorld(pixel, this.pixelUnprojectionMatrix, 0);
    for (let i = 0; i < 16; i++) {
      const world = this.unprojectPosition(common);
      world[2] = targetZ;
      const next = pixelsToWorld(pixel, this.pixelUnprojectionMatrix, this.projectPosition(world)[2]);
      const delta = Math.hypot(next[0] - common[0], next[1] - common[1]);
      common = next;
      if (delta < 1e-8) break;
    }
    return this.unprojectPosition(common);
  }

  panByPosition(position: number[], pixel: number[]): {center: [number, number, number]} {
    const underPointer = pixelsToWorld(pixel, this.pixelUnprojectionMatrix, 0);
    const common = this.projectPosition(position);
    const nextCenter = this.unprojectPosition([
      this.center[0] + common[0] - underPointer[0],
      this.center[1] + common[1] - underPointer[1],
      0
    ]);
    const center = nextCenter.every(Number.isFinite) ? nextCenter : this.position;
    return {center: [center[0], center[1], 0]};
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

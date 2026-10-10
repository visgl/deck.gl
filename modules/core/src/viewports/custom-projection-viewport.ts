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

const EC = 40075016.6855;
const NORMALIZATION_SCALE = 512 / EC;
// WGS84 axes in meters. The polar axis is derived from NGA's a and inverse flattening:
// b = a * (1 - 1 / 298.257223563).
// https://earth-info.nga.mil/index.php?action=wgs84&dir=wgs84
const WGS84_SEMI_MAJOR_AXIS = 6378137;
const WGS84_SEMI_MINOR_AXIS = 6356752.314245179;
const WGS84_ECCENTRICITY_SQUARED = 1 - (WGS84_SEMI_MINOR_AXIS / WGS84_SEMI_MAJOR_AXIS) ** 2;

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
   * Without this callback, estimates distance from fromCrs: WGS84 ellipsoidal for degrees, planar
   * for recognized linear units, or no distortion correction for an unknown CRS.
   */
  getDistanceScale?: (position: [number, number]) => [number, number];
};

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
  /** Identity of the local scale field, independent of camera and tessellation. */
  readonly sizeScaleSignature: string;
  /** Map-meter XY to sampler XY: scale followed by translation. */
  readonly sizeScaleTransform: [number, number, number, number];
  private projectionOptions: CustomProjectionViewportOptions;

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
    if (
      !toBounds.every(Number.isFinite) ||
      toBounds[2] <= toBounds[0] ||
      toBounds[3] <= toBounds[1]
    ) {
      throw new Error('CustomProjectionViewport requires finite, increasing toBounds');
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
    const unitsPerMeter = getCustomProjectionUnitsPerMeter(opts, undefined, position) || [
      NORMALIZATION_SCALE,
      NORMALIZATION_SCALE,
      NORMALIZATION_SCALE
    ];
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
    this.projectionOptions = {...opts, toBounds};
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
    return PROJECTION_MODE.CUSTOM_GEOSPATIAL;
  }

  /** Generate four-float records containing scalar XY scale, its X/Y slopes, and Z scale.
   * Slopes are per sampler-space unit; a zero scalar marks an invalid record.
   * Internal: generated on demand by the device resource owner, not on camera updates.
   */
  getSizeScaleData(size = 64): Float32Array {
    const {projection, fromBounds} = this.projectionOptions;
    const toBounds = this.projectionOptions.toBounds!;
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
          const unitsPerMeter = getCustomProjectionUnitsPerMeter(
            this.projectionOptions,
            output,
            input
          );
          if (!unitsPerMeter) continue;
          const scale = unitsPerMeter.map(value => value / NORMALIZATION_SCALE);
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
      projected[2] * NORMALIZATION_SCALE
    ];
  }

  /** Converts common XYZ to world XYZ; invalid inverses return NaN. */
  unprojectPosition(position: number[]): [number, number, number] {
    return (
      this.postUnproject!([
        position[0] / NORMALIZATION_SCALE,
        position[1] / NORMALIZATION_SCALE,
        (position[2] || 0) / NORMALIZATION_SCALE
      ]) || [NaN, NaN, NaN]
    );
  }

  /** Returns ground-meter scales at a map-meter anchor in toCrs, or the camera center.
   * The fixed map-meter-to-common scale is independent of the anchor.
   * Falls back to camera-center scales when the anchor or its local scale cannot be evaluated.
   */
  getDistanceScales(coordinateOrigin?: number[]): DistanceScales {
    if (!coordinateOrigin) return this.distanceScales;
    try {
      let worldPosition: number[] | undefined;
      if (!this.projectionOptions.getDistanceScale) {
        const position = this.projectionOptions.projection.inverse(coordinateOrigin);
        if (!position || position.length < 2 || !position.every(Number.isFinite))
          return this.distanceScales;
        worldPosition = position;
      }
      const unitsPerMeter = getCustomProjectionUnitsPerMeter(
        this.projectionOptions,
        coordinateOrigin,
        worldPosition
      );
      // Fallback belongs to a sizing request, never to the sampled distortion field.
      if (!unitsPerMeter) return this.distanceScales;
      return {
        ...this.distanceScales,
        unitsPerMeter,
        metersPerUnit: unitsPerMeter.map(value => 1 / value) as [number, number, number]
      };
    } catch {
      return this.distanceScales;
    }
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

/** Evaluate ground-meter sizing at a map-meter anchor, independently of the camera. */
function getCustomProjectionUnitsPerMeter(
  options: CustomProjectionViewportOptions,
  mapPosition?: number[],
  worldPosition?: number[]
): [number, number, number] | null {
  const {projection, getDistanceScale, fromBounds, fromCrs = 'WGS84'} = options;
  let localScale: number[] | null;
  if (getDistanceScale) {
    const [x, y] = mapPosition || projection.forward(clampInput(worldPosition!, fromBounds));
    const scale = getDistanceScale([x, y]);
    if (scale.length !== 2 || !scale.every(value => Number.isFinite(value) && value > 0)) {
      throw new Error('getDistanceScale must return two finite, positive scales');
    }
    localScale = [1 / scale[0], 1 / scale[1], 1 / Math.sqrt(scale[0] * scale[1])];
  } else {
    const position = worldPosition || projection.inverse(mapPosition!);
    const geographic = isGeographicCrs(fromCrs);
    localScale =
      geographic === undefined
        ? [1, 1, 1]
        : position &&
          estimateUnitsPerMeter(
            projection,
            clampInput(position, fromBounds),
            geographic,
            fromBounds
          );
  }
  if (!localScale?.every(value => Number.isFinite(value) && value > 0)) return null;
  return localScale.map(value => value * NORMALIZATION_SCALE) as [number, number, number];
}

/** Classify world coordinates without resolving or interpreting the full CRS definition. */
function isGeographicCrs(crs: string): boolean | undefined {
  const s = crs.trim().toLowerCase();
  // Explicit unit declarations take precedence over the projection name.
  if (/\+units=(?:degree|degrees|deg)\b/.test(s)) return true;
  if (/\+units=(?:m|meter|metre|ft|us-ft)\b/.test(s)) return false;
  if (/\+proj=(?:longlat|latlong|lonlat)\b/.test(s)) return true;
  if (/^(?:epsg:)?4326$/.test(s)) return true;
  if (/^wgs\s*84$/.test(s)) return true;
  return undefined;
}

/** Estimate local distortion relative to WGS84 ellipsoidal or planar input distances. */
function estimateUnitsPerMeter(
  projection: ProjectionConverter,
  center: number[],
  geographic: boolean,
  fromBounds?: CustomProjectionViewportOptions['fromBounds']
): [number, number, number] | null {
  const metersPerUnit = [1, 1, 1];
  if (geographic) {
    // Ground distance belongs to the input locations, independently of the
    // target projection's spherical or ellipsoidal coordinate formulas.
    const latitude = (center[1] * Math.PI) / 180;
    const w = 1 - WGS84_ECCENTRICITY_SQUARED * Math.sin(latitude) ** 2;
    const primeVerticalRadius = WGS84_SEMI_MAJOR_AXIS / Math.sqrt(w);
    const meridionalRadius = (primeVerticalRadius * (1 - WGS84_ECCENTRICITY_SQUARED)) / w;
    metersPerUnit[0] =
      primeVerticalRadius * Math.max(1e-6, Math.abs(Math.cos(latitude))) * (Math.PI / 180);
    metersPerUnit[1] = meridionalRadius * (Math.PI / 180);
  }
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
    return null;
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

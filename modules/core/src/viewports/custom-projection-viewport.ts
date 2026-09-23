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

/** Forward/inverse functions can be supplied by a proj4js converter. */
export type ProjectionConverter = {
  forward: (position: number[]) => number[];
  inverse: (position: number[]) => number[] | null;
};

export type CustomProjectionViewportOptions = Omit<ViewportOptions, 'position'> & {
  /** Conversion from input coordinates into output projection units, and its inverse. */
  projection: ProjectionConverter;
  /** Input CRS name or PROJ string. +units=m defaults to meters; otherwise assumes lnglat degrees. */
  fromCrs?: string;
  /** Output CRS name or PROJ string. Changing either CRS refreshes projected positions. */
  toCrs?: string;
  /** Optional [minX, minY, maxX, maxY] in fromCrs world coordinates. Clamps XY before
   * forward projection and after valid inverse projection; Z is unchanged.
   */
  fromBounds?: [number, number, number, number];
  /** Projection extent in toCrs, used for stable, aspect-preserving normalization into a 512-unit box. */
  toBounds: [number, number, number, number];
  /** Camera center in normalized common coordinates. Z is locked to zero. */
  center?: [number, number, number];
  /** Map pitch in degrees. */
  pitch?: number;
  /** Map bearing in degrees. */
  bearing?: number;
  /** Maximum tessellation cell size in input-coordinate units. Default 5. */
  resolution?: number;
  /** Physical meters per input world-coordinate unit along X, Y and Z.
   * Overrides the default inferred from fromCrs. Supply this for other input units.
   */
  getMetersPerUnit?: (position: number[]) => [number, number, number];
};

const METERS_PER_METER = (): [number, number, number] => [1, 1, 1];

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
  private metersPerUnitCallback?: CustomProjectionViewportOptions['getMetersPerUnit'];
  readonly sizeScaleSignature: string;

  constructor(opts: CustomProjectionViewportOptions) {
    const {
      projection,
      toBounds,
      fromBounds,
      fromCrs,
      toCrs,
      resolution = 5,
      center = [256, 256, 0],
      pitch = 0,
      bearing = 0,
      zoom = 0
    } = opts;
    const metersPerUnitCallback =
      opts.getMetersPerUnit ??
      (/(?:^|\s)\+units=m(?:\s|$)/.test(fromCrs || '') ? METERS_PER_METER : undefined);
    const [minX, minY, maxX, maxY] = toBounds;
    if (
      !toBounds.every(Number.isFinite) ||
      maxX <= minX ||
      maxY <= minY ||
      !Number.isFinite(resolution) ||
      resolution <= 0
    ) {
      throw new Error('CustomProjectionViewport requires finite bounds and positive resolution');
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
    super({
      ...opts,
      width,
      height,
      longitude: undefined,
      latitude: undefined,
      modelMatrix: null,
      position: [center[0], center[1], 0],
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
    this.scaleOptions = opts;
    this.metersPerUnitCallback = metersPerUnitCallback;
    this.sizeScaleSignature = JSON.stringify([fromCrs, toCrs]);
    this.preproject = position => {
      const projected = projection.forward(clampInput(position, fromBounds));
      return [
        (projected[0] - centerX) * normalizationScale + 256,
        (projected[1] - centerY) * normalizationScale + 256,
        (projected[2] ?? position[2] ?? 0) * getMetersPerUnit(position, metersPerUnitCallback)[2]
      ];
    };
    this.postUnproject = position => {
      const projected = [
        (position[0] - 256) / normalizationScale + centerX,
        (position[1] - 256) / normalizationScale + centerY,
        position[2] || 0
      ];
      try {
        let input = projection.inverse(projected.slice());
        if (!input || input.length < 2 || !input.every(Number.isFinite)) return null;
        const metersPerZUnit = getMetersPerUnit(input, metersPerUnitCallback)[2];
        if (metersPerZUnit !== 1) {
          projected[2] /= metersPerZUnit;
          input = projection.inverse(projected.slice());
          if (!input || input.length < 2 || !input.every(Number.isFinite)) return null;
        }
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
    const inputCenter = this.postUnproject(this.center);
    const localScale =
      inputCenter &&
      estimateUnitsPerMeter(projection, inputCenter, fromBounds, metersPerUnitCallback);
    const unitsPerMeter = (localScale || [1, 1, 1]).map(
      value => (Number.isFinite(value) && value > 0 ? value : 1) * normalizationScale
    );
    this.distanceScales = {unitsPerMeter, metersPerUnit: unitsPerMeter.map(value => 1 / value)};
  }

  get projectionSignature(): string {
    return this.signature;
  }
  get projectionMode(): number {
    return PROJECTION_MODE.EXTERNAL;
  }

  /** Generate four-float records containing scalar XY scale, its X/Y slopes, and Z scale.
   * Slopes are per common-space unit; a zero scalar marks an invalid record.
   * Internal: generated on demand by the device resource owner, not on camera updates.
   */
  getSizeScaleData(size = 64): Float32Array {
    const {projection, toBounds, fromBounds} = this.scaleOptions;
    const [minX, minY, maxX, maxY] = toBounds;
    const normalization = 512 / Math.max(maxX - minX, maxY - minY);
    const data = new Float32Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const common = [((x + 0.5) * 512) / size, ((y + 0.5) * 512) / size];
        const output = [
          (common[0] - 256) / normalization + (minX + maxX) / 2,
          (common[1] - 256) / normalization + (minY + maxY) / 2,
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
          const scale = estimateUnitsPerMeter(
            projection,
            input,
            fromBounds,
            this.metersPerUnitCallback
          );
          const commonScale = scale.map(value => Math.fround(value * normalization));
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

  projectPosition(position: number[]): [number, number, number] {
    return [position[0], position[1], (position[2] || 0) * this.getAltitudeScale(position)];
  }

  unprojectPosition(position: number[]): [number, number, number] {
    return [position[0], position[1], (position[2] || 0) / this.getAltitudeScale(position)];
  }

  /** Meter altitude follows the projection's local area-equivalent scale. */
  private getAltitudeScale(position: number[]): number {
    if (!this.scaleOptions) return this.distanceScales.unitsPerMeter[2];
    const {projection, toBounds, fromBounds} = this.scaleOptions;
    const normalization = 512 / Math.max(toBounds[2] - toBounds[0], toBounds[3] - toBounds[1]);
    const input = this.postUnproject!([position[0], position[1], 0]);
    return input
      ? estimateUnitsPerMeter(projection, input, fromBounds, this.metersPerUnitCallback)[2] *
          normalization
      : this.distanceScales.unitsPerMeter[2];
  }

  projectFlat(position: number[]): [number, number] {
    return [position[0], position[1]];
  }
  unprojectFlat(position: number[]): [number, number] {
    return [position[0], position[1]];
  }

  /** Unprojects with altitude and targetZ expressed in meters. */
  unproject(
    position: number[],
    {topLeft = true, targetZ}: {topLeft?: boolean; targetZ?: number} = {}
  ): number[] {
    if (Number.isFinite(position[2]) || !targetZ) {
      return super.unproject(position, {topLeft, targetZ});
    }
    const pixel = [position[0], topLeft ? position[1] : this.height - position[1]];
    let common = pixelsToWorld(pixel, this.pixelUnprojectionMatrix, 0);
    // Intersect the viewing ray with the locally scaled altitude surface.
    for (let i = 0; i < 16; i++) {
      const next = pixelsToWorld(
        pixel,
        this.pixelUnprojectionMatrix,
        targetZ * this.getAltitudeScale(common)
      );
      const delta = Math.hypot(next[0] - common[0], next[1] - common[1]);
      common = next;
      if (delta < 1e-8) break;
    }
    return [common[0], common[1], targetZ];
  }

  getDistanceScales(): DistanceScales {
    return this.distanceScales;
  }

  panByPosition(position: number[], pixel: number[]): {center: [number, number, number]} {
    const underPointer = this.unproject(pixel, {targetZ: 0});
    return {
      center: [
        this.center[0] + position[0] - underPointer[0],
        this.center[1] + position[1] - underPointer[1],
        0
      ]
    };
  }
}

/** Physical scale of world coordinates; altitude defaults to meters. */
function getMetersPerUnit(
  position: number[],
  callback?: CustomProjectionViewportOptions['getMetersPerUnit']
): [number, number, number] {
  const metersPerDegree = (Math.PI * 6371008.8) / 180;
  const scale = callback
    ? callback(position.slice())
    : [
        metersPerDegree * Math.max(1e-6, Math.abs(Math.cos((position[1] * Math.PI) / 180))),
        metersPerDegree,
        1
      ];
  if (scale.length !== 3 || !scale.every(value => Number.isFinite(value) && value > 0)) {
    throw new Error('getMetersPerUnit must return three finite, positive scales');
  }
  return scale as [number, number, number];
}

/** Combine the converter's local derivative with the physical scale of its input. */
function estimateUnitsPerMeter(
  projection: ProjectionConverter,
  center: number[],
  fromBounds?: CustomProjectionViewportOptions['fromBounds'],
  callback?: CustomProjectionViewportOptions['getMetersPerUnit']
): [number, number, number] {
  const metersPerUnit = getMetersPerUnit(center, callback);
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

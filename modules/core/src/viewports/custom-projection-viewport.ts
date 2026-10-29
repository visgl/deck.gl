// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Viewport from './viewport';
import type {ViewportOptions, DistanceScales, ProjectPositionOptions} from './viewport';
import type {CRSDescriptor} from '@math.gl/projection/core';
import {
  getViewMatrix,
  getProjectionParameters,
  altitudeToFovy,
  pixelsToWorld
} from '@math.gl/web-mercator';
import {PROJECTION_MODE} from '../shaderlib/project/constants';

const NORMALIZATION_SCALE = 512 / 40075016.6855;

export type CustomProjectionViewportOptions = Omit<ViewportOptions, 'position'> & {
  /** Prepared descriptor for the target projected CRS. */
  crs: CRSDescriptor;
  /** Camera center in WGS84 longitude/latitude; navigation fixes altitude at zero. */
  center?: [number, number, number];
  /** Map pitch in degrees. */
  pitch?: number;
  /** Map bearing in degrees. */
  bearing?: number;
};

/** A planar camera over WGS84 positions converted to a resolved target CRS.
 * @experimental Exported as `_CustomProjectionViewport`; this API may change.
 */
export default class CustomProjectionViewport extends Viewport {
  static displayName = 'CustomProjectionViewport';
  pitch: number;
  bearing: number;
  private signature: string;
  declare crs: CRSDescriptor;
  readonly sizeScaleSignature: string;
  /** Target-coordinate XY to sampler XY: scale followed by translation. */
  readonly sizeScaleTransform: [number, number, number, number];

  constructor(opts: CustomProjectionViewportOptions) {
    const {crs, center = [0, 0, 0], pitch = 0, bearing = 0, zoom = 0} = opts;
    const factors = [crs.xUnit, crs.yUnit, crs.zUnit].map(unit => unit.metersPerUnit);
    if (!factors.every(value => typeof value === 'number' && Number.isFinite(value) && value > 0)) {
      throw new Error('CustomProjectionViewport requires linear CRS axes');
    }
    const unitsPerWorldUnit = factors.map(value => value! * NORMALIZATION_SCALE) as [
      number,
      number,
      number
    ];
    const converter = crs.converter.WGS84;
    const preproject = (position: number[]): [number, number, number] => {
      const projected = converter.from(converter.normalize(position));
      return [projected[0], projected[1], projected[2] ?? 0];
    };
    const position = [center[0], center[1], 0];
    const unitsPerMeter = getUnitsPerMeter(crs, preproject(position), unitsPerWorldUnit) || [
      NORMALIZATION_SCALE,
      NORMALIZATION_SCALE,
      NORMALIZATION_SCALE
    ];
    const height = opts.height || 1,
      width = opts.width || 1;
    const altitude = 1.5,
      fovy = altitudeToFovy(altitude);
    const {top = 0, bottom = 0} = opts.padding || {};
    const offset: [number, number] = [
      0,
      Math.max(0, Math.min(height, (top + height - bottom) / 2)) - height / 2
    ];
    super({
      ...opts,
      crs,
      width,
      height,
      modelMatrix: null,
      position,
      distanceScales: {unitsPerWorldUnit, unitsPerMeter},
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
    this.crs = crs;
    this.pitch = pitch;
    this.bearing = bearing;
    this.isGeospatial = true;
    this.signature = JSON.stringify([crs.signature, this.resolution]);
    this.sizeScaleSignature = JSON.stringify([crs.signature, crs.renderingBounds]);
    const [[minX, minY], [maxX, maxY]] = crs.renderingBounds;
    const finiteBounds =
      [minX, minY, maxX, maxY].every(Number.isFinite) && maxX > minX && maxY > minY;
    const scaleX = 512 / (maxX - minX),
      scaleY = 512 / (maxY - minY);
    // Unbounded projections have no global texture domain; shader sizing uses the camera scale.
    this.sizeScaleTransform = finiteBounds
      ? [scaleX, scaleY, -minX * scaleX, -minY * scaleY]
      : [0, 0, -1, -1];
  }
  get projectionSignature(): string {
    return this.signature;
  }
  get projectionMode(): number {
    return PROJECTION_MODE.CUSTOM_GEOSPATIAL;
  }

  /** Sample the Jacobian scalar, XY slopes, and Z-unit encoding over the CRS bounds. */
  getSizeScaleData(size = 64): Float32Array {
    const [[minX, minY], [maxX, maxY]] = this.crs.renderingBounds;
    const data = new Float32Array(size * size * 4);
    if (![minX, minY, maxX, maxY].every(Number.isFinite)) return data;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const position = [
          minX + ((x + 0.5) / size) * (maxX - minX),
          minY + ((y + 0.5) / size) * (maxY - minY),
          0
        ];
        const unitsPerMeter = getUnitsPerMeter(
          this.crs,
          position,
          this.distanceScales.unitsPerWorldUnit
        );
        // Only math.gl's explicit unavailable result leaves a sample empty.
        if (!unitsPerMeter) continue;
        const scalar = Math.fround(unitsPerMeter[2] / this.distanceScales.unitsPerWorldUnit[0]);
        const scaleZ = unitsPerMeter[2] / this.distanceScales.unitsPerWorldUnit[2];
        data.set([scalar, 0, 0, scaleZ], (y * size + x) * 4);
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
            // scale. Preserve its slopes and the scalar encoded in Z units.
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

  /** Convert target-CRS XY to common space. */
  projectFlat(position: number[]): [number, number] {
    return [
      position[0] * this.distanceScales.unitsPerWorldUnit[0],
      position[1] * this.distanceScales.unitsPerWorldUnit[1]
    ];
  }
  /** Convert common-space XY to target coordinates. */
  unprojectFlat(position: number[]): [number, number] {
    return [
      position[0] / this.distanceScales.unitsPerWorldUnit[0],
      position[1] / this.distanceScales.unitsPerWorldUnit[1]
    ];
  }
  /** Unproject pixels to WGS84, with targetZ expressed in WGS84 altitude meters. */
  unproject(pixels: number[], options: {topLeft?: boolean; targetZ?: number} = {}): number[] {
    const {targetZ} = options;
    // Viewport's plane intersection consumes target-coordinate altitude units.
    const result = super.unproject(pixels, {
      ...options,
      targetZ: targetZ === undefined ? undefined : targetZ / this.crs.zUnit.metersPerUnit!
    });
    if (!Number.isFinite(pixels[2]) && Number.isFinite(targetZ)) result[2] = targetZ!;
    return result;
  }
  /** Convert WGS84 XYZ to common space. */
  projectPosition(
    position: number[],
    options: ProjectPositionOptions = {}
  ): [number, number, number] {
    if (options.sourceCrs) return this._projectPositionFromCRS(position, options.sourceCrs);
    const converter = this.crs.converter.WGS84;
    const projected = converter.from(converter.normalize(position));
    const scale = this.distanceScales.unitsPerWorldUnit;
    return [projected[0] * scale[0], projected[1] * scale[1], (projected[2] ?? 0) * scale[2]];
  }
  /** Convert common XYZ to WGS84; invalid inverses return NaN. */
  unprojectPosition(position: number[]): [number, number, number] {
    try {
      const result = this.crs.converter.WGS84.to(
        position
          .slice(0, 3)
          .map((value, axis) => value / this.distanceScales.unitsPerWorldUnit[axis])
      );
      return [result[0], result[1], result[2] ?? 0];
    } catch {
      return [NaN, NaN, NaN];
    }
  }
  /** Ground-meter scales at a target-coordinate anchor; failed samples use camera scales. */
  getDistanceScales(coordinateOrigin?: number[]): DistanceScales {
    if (!coordinateOrigin) return this.distanceScales;
    const unitsPerMeter = getUnitsPerMeter(
      this.crs,
      coordinateOrigin,
      this.distanceScales.unitsPerWorldUnit
    );
    return unitsPerMeter
      ? {
          ...this.distanceScales,
          unitsPerMeter,
          metersPerUnit: unitsPerMeter.map(value => 1 / value) as [number, number, number]
        }
      : this.distanceScales;
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

function getUnitsPerMeter(
  crs: CRSDescriptor,
  position: number[],
  unitsPerWorldUnit: number[]
): [number, number, number] | null {
  const scale = crs.getRenderingScale(position);
  return scale
    ? (scale.map((value, axis) => unitsPerWorldUnit[axis] / value) as [number, number, number])
    : null;
}

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Viewport from './viewport';
import type {ViewportOptions, DistanceScales} from './viewport';
import {getViewMatrix, getProjectionParameters, altitudeToFovy} from '@math.gl/web-mercator';
import {PROJECTION_MODE} from '../lib/constants';

/** Forward/inverse functions can be supplied by a proj4js converter. */
export type CustomProjection = {
  forward: (position: number[]) => number[];
  inverse: (position: number[]) => number[] | null;
};

export type CustomProjectionViewportOptions = Omit<ViewportOptions, 'position'> & {
  /** Conversion from input coordinates into output projection units, and its inverse. */
  projection: CustomProjection;
  /** Optional [minX, minY, maxX, maxY] in input coordinates. Clamps XY before
   * forward projection and after valid inverse projection; Z is unchanged.
   */
  inputBounds?: [number, number, number, number];
  /** Output extent used for stable, aspect-preserving normalization into a 512-unit box. */
  outputBounds: [number, number, number, number];
  /** Change this when a converter changes internally without changing object identity. */
  projectionId?: string | number;
  /** Camera center in normalized common coordinates. Z is locked to zero. */
  center?: [number, number, number];
  /** Map pitch in degrees. */
  pitch?: number;
  /** Map bearing in degrees. */
  bearing?: number;
  /** Maximum tessellation cell size in input-coordinate units. Default 5. */
  resolution?: number;
  /** Input XY units for local meter-scale estimation. Degrees means longitude/latitude
   * on a sphere; meters assumes locally metric Cartesian coordinates. If omitted,
   * output XY units are assumed to be meters unless getUnitsPerMeter is supplied.
   */
  inputUnits?: 'degrees' | 'meters';
  /** Overrides the local scale estimate, in output units per meter, at an input coordinate. */
  getUnitsPerMeter?: (position: number[]) => [number, number, number];
};

const converterIds = new WeakMap<CustomProjection, number>();
let nextConverterId = 0;

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
      outputBounds,
      inputBounds,
      resolution = 5,
      center = [256, 256, 0],
      pitch = 0,
      bearing = 0,
      zoom = 0
    } = opts;
    const [minX, minY, maxX, maxY] = outputBounds;
    if (
      !outputBounds.every(Number.isFinite) ||
      maxX <= minX ||
      maxY <= minY ||
      !Number.isFinite(resolution) ||
      resolution <= 0
    ) {
      throw new Error('CustomProjectionViewport requires finite bounds and positive resolution');
    }
    if (
      inputBounds &&
      (!inputBounds.every(Number.isFinite) ||
        inputBounds[2] <= inputBounds[0] ||
        inputBounds[3] <= inputBounds[1])
    ) {
      throw new Error('CustomProjectionViewport requires finite, increasing inputBounds');
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
    if (!converterIds.has(projection)) converterIds.set(projection, ++nextConverterId);
    this.signature = JSON.stringify([
      converterIds.get(projection),
      opts.projectionId,
      ...outputBounds,
      inputBounds,
      resolution
    ]);
    this.preproject = position => {
      const projected = projection.forward(clampInput(position, inputBounds));
      return [
        (projected[0] - centerX) * normalizationScale + 256,
        (projected[1] - centerY) * normalizationScale + 256,
        projected[2] ?? position[2] ?? 0
      ];
    };
    this.postUnproject = position => {
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
        const bounded = clampInput(input, inputBounds);
        return [bounded[0], bounded[1], bounded[2] ?? projected[2]];
      } catch {
        return null;
      }
    };
    const inputCenter = this.postUnproject(this.center);
    const localScale =
      inputCenter &&
      (opts.getUnitsPerMeter
        ? opts.getUnitsPerMeter(inputCenter)
        : estimateUnitsPerMeter(projection, inputCenter, opts.inputUnits, inputBounds));
    const unitsPerMeter = (localScale || [1, 1, 1]).map(
      value => (Number.isFinite(value) && value > 0 ? value : 1) * normalizationScale
    );
    this.distanceScales = {unitsPerMeter, metersPerUnit: unitsPerMeter.map(value => 1 / value)};
  }

  get projectionSignature(): string {
    return this.signature;
  }
  get projectionMode(): number {
    return PROJECTION_MODE.IDENTITY;
  }

  projectPosition(position: number[]): [number, number, number] {
    return super.projectPosition(position);
  }

  unprojectPosition(position: number[]): [number, number, number] {
    return super.unprojectPosition(position);
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
    return super.unproject(position, {topLeft, targetZ});
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

/** Estimate local axis scales without assuming the converter's input is geographic. */
function estimateUnitsPerMeter(
  projection: CustomProjection,
  center: number[],
  inputUnits: CustomProjectionViewportOptions['inputUnits'],
  inputBounds?: CustomProjectionViewportOptions['inputBounds']
): [number, number, number] {
  if (!inputUnits) return [1, 1, 1];
  const geographic = inputUnits === 'degrees';
  const step = geographic ? 0.0001 : 1;
  // Sample toward the interior at longitude/latitude limits to avoid crossing a seam or pole.
  const midX = inputBounds ? (inputBounds[0] + inputBounds[2]) / 2 : 0;
  const midY = inputBounds ? (inputBounds[1] + inputBounds[3]) / 2 : 0;
  const dx = (geographic || inputBounds) && center[0] > midX ? -step : step;
  const dy = (geographic || inputBounds) && center[1] > midY ? -step : step;
  const metersPerDegree = (Math.PI * 6371008.8) / 180;
  const metersX = geographic
    ? step * metersPerDegree * Math.max(1e-6, Math.abs(Math.cos((center[1] * Math.PI) / 180)))
    : step;
  const metersY = geographic ? step * metersPerDegree : step;
  try {
    const origin = projection.forward(clampInput(center, inputBounds));
    const x = projection.forward(
      clampInput([center[0] + dx, center[1], center[2] ?? 0], inputBounds)
    );
    const y = projection.forward(
      clampInput([center[0], center[1] + dy, center[2] ?? 0], inputBounds)
    );
    return [
      Math.hypot(x[0] - origin[0], x[1] - origin[1]) / metersX,
      Math.hypot(y[0] - origin[0], y[1] - origin[1]) / metersY,
      1
    ];
  } catch {
    // Converters may reject samples outside their domain; retain a finite fallback scale.
    return [1, 1, 1];
  }
}

function clampInput(
  position: number[],
  bounds?: CustomProjectionViewportOptions['inputBounds']
): number[] {
  const result = position.slice();
  if (bounds) {
    result[0] = Math.max(bounds[0], Math.min(bounds[2], result[0]));
    result[1] = Math.max(bounds[1], Math.min(bounds[3], result[1]));
  }
  return result;
}

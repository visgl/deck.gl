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
  /** Input world-coordinate units. Defaults to 'lnglat'; 'other' requires getMetersPerUnit. */
  coordinateSystem?: 'lnglat' | 'meter-offsets' | 'other';
  /** Physical meters per input world-coordinate unit along X, Y and Z.
   * Required and used when coordinateSystem is 'other'.
   */
  getMetersPerUnit?: (position: number[]) => [number, number, number];
};

const converterIds = new WeakMap<object, number>();
const METERS_PER_METER = (): [number, number, number] => [1, 1, 1];
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
      coordinateSystem = 'lnglat',
      resolution = 5,
      center = [256, 256, 0],
      pitch = 0,
      bearing = 0,
      zoom = 0
    } = opts;
    if (!['lnglat', 'meter-offsets', 'other'].includes(coordinateSystem)) {
      throw new Error('CustomProjectionViewport requires a supported coordinateSystem');
    }
    if (coordinateSystem === 'other' && typeof opts.getMetersPerUnit !== 'function') {
      throw new Error(
        "CustomProjectionViewport requires getMetersPerUnit for coordinateSystem: 'other'"
      );
    }
    const metersPerUnitCallback =
      coordinateSystem === 'other'
        ? opts.getMetersPerUnit
        : coordinateSystem === 'meter-offsets'
          ? METERS_PER_METER
          : undefined;
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
    if (metersPerUnitCallback && !converterIds.has(metersPerUnitCallback)) {
      converterIds.set(metersPerUnitCallback, ++nextConverterId);
    }
    this.signature = JSON.stringify([
      converterIds.get(projection),
      opts.projectionId,
      ...outputBounds,
      inputBounds,
      coordinateSystem,
      metersPerUnitCallback && converterIds.get(metersPerUnitCallback),
      resolution
    ]);
    this.preproject = position => {
      const projected = projection.forward(clampInput(position, inputBounds));
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
        const bounded = clampInput(input, inputBounds);
        return [bounded[0], bounded[1], bounded[2] ?? projected[2]];
      } catch {
        return null;
      }
    };
    const inputCenter = this.postUnproject(this.center);
    const localScale =
      inputCenter &&
      estimateUnitsPerMeter(projection, inputCenter, inputBounds, metersPerUnitCallback);
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
  projection: CustomProjection,
  center: number[],
  inputBounds?: CustomProjectionViewportOptions['inputBounds'],
  callback?: CustomProjectionViewportOptions['getMetersPerUnit']
): [number, number, number] {
  const metersPerUnit = getMetersPerUnit(center, callback);
  // Sample a one-meter displacement in each input direction.
  const stepX = 1 / metersPerUnit[0];
  const stepY = 1 / metersPerUnit[1];
  // Sample toward the interior at longitude/latitude limits to avoid crossing a seam or pole.
  const midX = inputBounds ? (inputBounds[0] + inputBounds[2]) / 2 : 0;
  const midY = inputBounds ? (inputBounds[1] + inputBounds[3]) / 2 : 0;
  const dx = center[0] > midX ? -stepX : stepX;
  const dy = center[1] > midY ? -stepY : stepY;
  try {
    const origin = projection.forward(clampInput(center, inputBounds));
    const inputX = clampInput([center[0] + dx, center[1], center[2] ?? 0], inputBounds);
    const inputY = clampInput([center[0], center[1] + dy, center[2] ?? 0], inputBounds);
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
  bounds?: CustomProjectionViewportOptions['inputBounds']
): number[] {
  const result = position.slice();
  if (bounds) {
    result[0] = Math.max(bounds[0], Math.min(bounds[2], result[0]));
    result[1] = Math.max(bounds[1], Math.min(bounds[3], result[1]));
  }
  return result;
}

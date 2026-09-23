// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_CustomProjectionViewport as CustomProjectionViewport} from '@deck.gl/core';
import type {CustomProjectionViewportOptions} from '@deck.gl/core';

type ProjectionOptions = Required<
  Pick<CustomProjectionViewportOptions, 'projection' | 'fromBounds' | 'toBounds'>
>;

type RegionEstimate = {
  /** Percent relative to the directly evaluated scalar XY scale. */
  maxima: [maxError: number, maxDiscontinuity: number];
  positions: number;
  boundaries: number;
  /** Valid positions whose nearest scale record is invalid. */
  dropouts: number;
};

/** Estimate (not prove) nearest-record sizing error over geographic input bounds.
 * Samples both input and common-space grids, plus both one-sided limits at every
 * internal texel boundary. Invalid scale records are included, not filtered out.
 * The reference is sqrt(abs(det(J))), not anisotropic projection error.
 */
export function estimateProjectionScaleError(
  options: ProjectionOptions,
  {
    divisions = 256,
    // Optional analytic reference in output units per meter, including pole limits.
    getReferenceScale
  }: {divisions?: number; getReferenceScale?: (input: number[]) => number} = {}
): {center: RegionEstimate; whole: RegionEstimate; singularPositions: number} {
  const {projection, fromBounds, toBounds} = options;
  const viewport = new CustomProjectionViewport(options);
  const data = viewport.getSizeScaleData();
  const size = Math.sqrt(data.length / 4);
  const spacing = 512 / size;
  const normalization =
    512 / Math.max(toBounds[2] - toBounds[0], toBounds[3] - toBounds[1]);
  const outputCenter = [
    (toBounds[0] + toBounds[2]) / 2,
    (toBounds[1] + toBounds[3]) / 2
  ];
  const region = (): RegionEstimate => ({maxima: [0, 0], positions: 0, boundaries: 0, dropouts: 0});
  const center = region();
  const whole = region();
  let singularPositions = 0;

  function toCommon(input: number[]): number[] {
    const output = projection.forward(input.slice());
    return output.map((value, axis) => (value - outputCenter[axis]) * normalization + 256);
  }

  function inputAt(x: number, y: number): number[] | null {
    try {
      const output = [
        (x - 256) / normalization + outputCenter[0],
        (y - 256) / normalization + outputCenter[1]
      ];
      const input = projection.inverse(output);
      if (
        !input ||
        !input.every(Number.isFinite) ||
        input[0] < fromBounds[0] - 1e-8 ||
        input[0] > fromBounds[2] + 1e-8 ||
        input[1] < fromBounds[1] - 1e-8 ||
        input[1] > fromBounds[3] + 1e-8
      )
        return null;
      const common = toCommon(input);
      return Math.hypot(common[0] - x, common[1] - y) < 1e-5 ? input : null;
    } catch {
      return null;
    }
  }

  function referenceScale(input: number[]): number {
    if (getReferenceScale) return getReferenceScale(input) * normalization;
    // Longitude is singular at a geographic pole. Callers can supply an analytic
    // limit where one exists; otherwise report these samples separately.
    if (Math.abs(input[1]) >= 90) return NaN;
    const step = 0.00001;
    const dx = input[0] > (fromBounds[0] + fromBounds[2]) / 2 ? -step : step;
    const dy = input[1] > (fromBounds[1] + fromBounds[3]) / 2 ? -step : step;
    const origin = projection.forward(input.slice());
    const east = projection.forward([input[0] + dx, input[1]]);
    const north = projection.forward([input[0], input[1] + dy]);
    const meters = (step * Math.PI * 6371008.8) / 180;
    return (
      normalization *
      Math.sqrt(
        Math.abs(
          (east[0] - origin[0]) * (north[1] - origin[1]) -
            (east[1] - origin[1]) * (north[0] - origin[0])
        ) /
          (meters * meters * Math.abs(Math.cos((input[1] * Math.PI) / 180)))
      )
    );
  }

  function sample(x: number, y: number, column: number, row: number): number {
    const offset = (row * size + column) * 4;
    return data[offset] > 0
      ? Math.max(
          0,
          data[offset] +
            data[offset + 1] * (x - (column + 0.5) * spacing) +
            data[offset + 2] * (y - (row + 0.5) * spacing)
        )
      : 0;
  }

  function measure(x: number, y: number, input: number[], boundaryAxis?: number): void {
    if (![x, y].every(Number.isFinite) || x < 0 || x > 512 || y < 0 || y > 512) return;
    const reference = referenceScale(input);
    const validReference = reference > 0 && Number.isFinite(reference);
    if (!validReference) singularPositions++;
    const column = Math.min(size - 1, Math.floor(x / spacing));
    const row = Math.min(size - 1, Math.floor(y / spacing));
    const value = sample(x, y, column, row);
    const other =
      boundaryAxis === undefined
        ? value
        : sample(x, y, column - (boundaryAxis === 0 ? 1 : 0), row - (boundaryAxis === 1 ? 1 : 0));
    const error = 100 * Math.max(Math.abs(value / reference - 1), Math.abs(other / reference - 1));
    const discontinuity = (100 * Math.abs(value - other)) / reference;
    for (const result of Math.abs(x - 256) <= 64 && Math.abs(y - 256) <= 64
      ? [whole, center]
      : [whole]) {
      result.positions++;
      // Even a singular reference must map to a positive, finite sampler value.
      result.dropouts +=
        value > 0 && other > 0 && Number.isFinite(value) && Number.isFinite(other) ? 0 : 1;
      result.boundaries += boundaryAxis === undefined ? 0 : 1;
      if (!validReference) continue;
      result.maxima[0] = Math.max(result.maxima[0], error);
      result.maxima[1] = Math.max(result.maxima[1], discontinuity);
    }
  }

  for (let y = 0; y <= divisions; y++) {
    for (let x = 0; x <= divisions; x++) {
      // Input-space sampling includes curved domain edges that output grids miss.
      const input = [
        fromBounds[0] + ((fromBounds[2] - fromBounds[0]) * x) / divisions,
        fromBounds[1] + ((fromBounds[3] - fromBounds[1]) * y) / divisions
      ];
      const common = toCommon(input);
      measure(common[0], common[1], input);
      const commonX = (512 * x) / divisions;
      const commonY = (512 * y) / divisions;
      const inverse = inputAt(commonX, commonY);
      if (inverse) measure(commonX, commonY, inverse);
    }
  }
  for (let axis = 0; axis < 2; axis++) {
    for (let edge = 1; edge < size; edge++) {
      for (let step = 0; step <= divisions * 4; step++) {
        const along = (512 * step) / (divisions * 4);
        const x = axis === 0 ? edge * spacing : along;
        const y = axis === 1 ? edge * spacing : along;
        const input = inputAt(x, y);
        // Both sides must be valid positions, independent of scale record validity.
        if (
          input &&
          inputAt(x - (axis === 0 ? 1e-6 : 0), y - (axis === 1 ? 1e-6 : 0)) &&
          inputAt(x + (axis === 0 ? 1e-6 : 0), y + (axis === 1 ? 1e-6 : 0))
        ) {
          measure(x, y, input, axis);
        }
      }
    }
  }
  return {center, whole, singularPositions};
}

// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {makeSyntheticTaxiPositions, PAUL_TAYLOR_POINT_COUNT} from './spatial-atlas-data';
import {assertLongitudeLatitudeTaxiMetadata, getTaxiLocalXY} from './taxi-coordinate-space';
import type {TaxiPointResidentWindow} from './taxi-resident-window';
import type {TaxiPointSourceTelemetry} from './taxi-source';

/** Source-neutral taxi rows ready for upload by the Spatial Atlas. */
export type SpatialAtlasTaxiData = {
  pointCount: number;
  /** Interleaved local X/Y/Z values. */
  positions: Float32Array;
  /** Original source row for each resident row, when backed by a streamed source. */
  sourceRowIndices?: Float64Array;
  corpusPointCount: number;
  sourceKind: 'synthetic' | 'packed';
  sourceLabel: string;
  sourceTelemetry?: TaxiPointSourceTelemetry;
};

/** Builds the deterministic generated fallback used when no packed source is configured. */
export function makeSyntheticSpatialAtlasTaxiData(pointCount: number): SpatialAtlasTaxiData {
  return {
    pointCount,
    positions: makeSyntheticTaxiPositions(pointCount),
    corpusPointCount: PAUL_TAYLOR_POINT_COUNT,
    sourceKind: 'synthetic',
    sourceLabel: 'Synthetic public-sample expansion'
  };
}

/** Converts one explicitly geographic resident window into local Spatial Atlas coordinates. */
export function makeSpatialAtlasTaxiDataFromResidentWindow(
  window: TaxiPointResidentWindow
): SpatialAtlasTaxiData {
  assertLongitudeLatitudeTaxiResidentWindow(window);

  const positions = new Float32Array(window.rowCount * 3);
  let finiteRowCount = 0;
  for (let rowIndex = 0; rowIndex < window.rowCount; rowIndex++) {
    const longitude = window.positions[rowIndex * 2];
    const latitude = window.positions[rowIndex * 2 + 1];
    const localOffset = rowIndex * 3;
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      positions[localOffset] = Number.NaN;
      positions[localOffset + 1] = Number.NaN;
      positions[localOffset + 2] = 0;
      continue;
    }
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      throw new Error(
        `Taxi source row ${window.sourceRowIndices[rowIndex]} is outside longitude/latitude bounds`
      );
    }
    const [localX, localY] = getTaxiLocalXY([longitude, latitude]);
    positions[localOffset] = localX;
    positions[localOffset + 1] = localY;
    positions[localOffset + 2] = 0;
    finiteRowCount++;
  }
  if (finiteRowCount === 0) {
    throw new Error('Taxi resident window does not contain a finite longitude/latitude row');
  }

  return {
    pointCount: window.rowCount,
    positions,
    sourceRowIndices: window.sourceRowIndices,
    corpusPointCount: window.sourceRowCount,
    sourceKind: 'packed',
    sourceLabel: 'Packed row-group source',
    sourceTelemetry: window.telemetry
  };
}

/** Validates the shared metadata and row-alignment contract without allocating converted rows. */
export function assertLongitudeLatitudeTaxiResidentWindow(window: TaxiPointResidentWindow): void {
  assertLongitudeLatitudeTaxiMetadata(window.metadata);
  if (window.positions.length !== window.rowCount * 2) {
    throw new Error('Taxi resident window positions must contain two values per row');
  }
  if (window.sourceRowIndices.length !== window.rowCount) {
    throw new Error('Taxi resident window sourceRowIndices must align with positions');
  }
}

/** Returns the original corpus row represented by one resident Atlas row. */
export function getSpatialAtlasTaxiSourceRow(
  data: Pick<SpatialAtlasTaxiData, 'pointCount' | 'sourceRowIndices'>,
  pointIndex: number
): number | null {
  if (!Number.isSafeInteger(pointIndex) || pointIndex < 0 || pointIndex >= data.pointCount) {
    return null;
  }
  return data.sourceRowIndices?.[pointIndex] ?? pointIndex;
}

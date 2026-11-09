// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {
  TaxiPointSource,
  TaxiPointSourceMetadata,
  TaxiPointSourceTelemetry
} from './taxi-source';

/** Progress emitted after one source batch has been retained. */
export type TaxiPointResidentWindowProgress = {
  residentRowCount: number;
  targetRowCount: number;
  sourceRowCount: number;
  rowGroupIndex: number;
  telemetry: TaxiPointSourceTelemetry;
};

/** Options for one bounded, source-ordered resident window. */
export type TaxiPointResidentWindowOptions = {
  /** Maximum number of rows retained by the returned window. */
  capacity: number;
  signal?: AbortSignal;
  onProgress?: (progress: TaxiPointResidentWindowProgress) => void;
};

/** Source-neutral rows retained for one GPU upload. */
export type TaxiPointResidentWindow = {
  /** Interleaved source X/Y values in original source order. */
  positions: Float32Array;
  /** Original source row for each retained resident row. */
  sourceRowIndices: Float64Array;
  rowCount: number;
  sourceRowCount: number;
  metadata: TaxiPointSourceMetadata;
  telemetry: TaxiPointSourceTelemetry;
};

/**
 * Streams the leading row groups needed to fill one capacity-bounded resident window.
 *
 * The returned arrays never exceed `capacity`. A source may still yield a final row group larger
 * than the remaining capacity; that temporary decoded batch is released after its retained prefix
 * is copied into the window.
 */
export async function loadTaxiPointResidentWindow(
  source: TaxiPointSource,
  options: TaxiPointResidentWindowOptions
): Promise<TaxiPointResidentWindow> {
  const {capacity, signal, onProgress} = options;
  if (!Number.isSafeInteger(capacity) || capacity <= 0) {
    throw new Error('Taxi resident window capacity must be a positive safe integer');
  }
  signal?.throwIfAborted();

  const metadata = await source.getMetadata(signal);
  const targetRowCount = Math.min(capacity, metadata.rowCount);
  if (targetRowCount === 0) {
    return {
      positions: new Float32Array(0),
      sourceRowIndices: new Float64Array(0),
      rowCount: 0,
      sourceRowCount: metadata.rowCount,
      metadata,
      telemetry: source.getTelemetry()
    };
  }

  const selectedRowGroups: number[] = [];
  const selectedRowGroupMetadata: TaxiPointSourceMetadata['rowGroups'][number][] = [];
  let selectedRowCount = 0;
  for (const rowGroup of metadata.rowGroups) {
    if (selectedRowCount >= targetRowCount) break;
    selectedRowGroups.push(rowGroup.index);
    selectedRowGroupMetadata.push(rowGroup);
    selectedRowCount += rowGroup.rowCount;
  }

  const positions = new Float32Array(targetRowCount * 2);
  const sourceRowIndices = new Float64Array(targetRowCount);
  let residentRowCount = 0;
  let selectedRowGroupPosition = 0;
  let expectedOriginalRowOffset = selectedRowGroupMetadata[0]?.originalRowOffset;
  for await (const batch of source.read({
    rowGroups: selectedRowGroups,
    columns: metadata.coordinateColumns,
    signal
  })) {
    signal?.throwIfAborted();
    const selectedRowGroup = selectedRowGroupMetadata[selectedRowGroupPosition];
    if (!selectedRowGroup) {
      throw new Error(
        `Taxi point source yielded unexpected row group ${batch.provenance.rowGroupIndex}`
      );
    }
    if (batch.provenance.rowGroupIndex !== selectedRowGroup.index) {
      throw new Error(
        `Taxi point source yielded row group ${batch.provenance.rowGroupIndex}; expected ${selectedRowGroup.index}`
      );
    }
    if (batch.provenance.originalRowOffset !== expectedOriginalRowOffset) {
      throw new Error(
        `Taxi point row group ${selectedRowGroup.index} starts batch at source row ${batch.provenance.originalRowOffset}; expected ${expectedOriginalRowOffset}`
      );
    }
    if (!Number.isSafeInteger(batch.rowCount) || batch.rowCount <= 0) {
      throw new Error(
        `Taxi point batch ${selectedRowGroup.index} rowCount must be a positive safe integer`
      );
    }
    const batchEndRow = batch.provenance.originalRowOffset + batch.rowCount;
    const rowGroupEndRow = selectedRowGroup.originalRowOffset + selectedRowGroup.rowCount;
    if (!Number.isSafeInteger(batchEndRow) || batchEndRow > rowGroupEndRow) {
      throw new Error(`Taxi point batch ${selectedRowGroup.index} extends beyond its row group`);
    }
    if (batch.positions.length !== batch.rowCount * 2) {
      throw new Error(
        `Taxi point batch ${batch.provenance.rowGroupIndex} contains ${batch.positions.length} coordinate values for ${batch.rowCount} rows`
      );
    }
    const retainedRowCount = Math.min(batch.rowCount, targetRowCount - residentRowCount);
    positions.set(batch.positions.subarray(0, retainedRowCount * 2), residentRowCount * 2);
    for (let localRowIndex = 0; localRowIndex < retainedRowCount; localRowIndex++) {
      const sourceRowIndex = batch.provenance.originalRowOffset + localRowIndex;
      if (!Number.isSafeInteger(sourceRowIndex) || sourceRowIndex < 0) {
        throw new Error('Taxi point source row index must be a non-negative safe integer');
      }
      sourceRowIndices[residentRowCount + localRowIndex] = sourceRowIndex;
    }
    residentRowCount += retainedRowCount;
    onProgress?.({
      residentRowCount,
      targetRowCount,
      sourceRowCount: metadata.rowCount,
      rowGroupIndex: batch.provenance.rowGroupIndex,
      telemetry: source.getTelemetry()
    });
    if (residentRowCount === targetRowCount) break;
    expectedOriginalRowOffset = batchEndRow;
    if (batchEndRow === rowGroupEndRow) {
      selectedRowGroupPosition++;
      expectedOriginalRowOffset =
        selectedRowGroupMetadata[selectedRowGroupPosition]?.originalRowOffset;
    }
  }

  if (residentRowCount !== targetRowCount) {
    throw new Error(
      `Taxi point source yielded ${residentRowCount} resident rows; expected ${targetRowCount}`
    );
  }
  return {
    positions,
    sourceRowIndices,
    rowCount: residentRowCount,
    sourceRowCount: metadata.rowCount,
    metadata,
    telemetry: source.getTelemetry()
  };
}

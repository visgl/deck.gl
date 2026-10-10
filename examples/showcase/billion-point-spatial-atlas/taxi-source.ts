// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

/** Selective read options shared by packed-shard and future columnar taxi sources. */
export type TaxiPointSourceReadOptions = {
  /** Zero-based row-group indexes. Omit to read every row group in manifest order. */
  rowGroups?: readonly number[];
  /** Logical source columns required by the consumer. Packed shards decode both coordinates. */
  columns?: readonly string[];
  /** Cancels metadata or row-group requests owned by this read. */
  signal?: AbortSignal;
};

/** Identifies where a streamed batch appeared in the original source. */
export type TaxiPointSourceBatchProvenance = {
  rowGroupIndex: number;
  originalRowOffset: number;
};

/** Cumulative point-source activity. */
export type TaxiPointSourceTelemetry = {
  downloadedByteCount: number;
  requestCount: number;
  networkTimeMilliseconds: number;
  decodeTimeMilliseconds: number;
  decodedRowCount: number;
};

/** HTTP validators retained for one fetched source object. */
export type TaxiSourceObjectVersion = {
  /** Strong ETag, when supplied by the server. */
  etag?: string;
  /** Last-Modified fallback, when supplied by the server. */
  lastModified?: string;
};

/** Coordinate semantics declared by a taxi source manifest. */
export type TaxiPointCoordinateSpace = {
  /** Values are the original two-dimensional X/Y coordinates stored by the source. */
  kind: 'source-xy';
  /** Coordinate reference system identifier, or `null` when the source does not declare one. */
  crs: string | null;
};

/** Public metadata for one independently addressable row group. */
export type TaxiPointRowGroupMetadata = {
  index: number;
  rowCount: number;
  originalRowOffset: number;
  byteLength: number;
  url: string;
  bounds: readonly [number, number, number, number] | null;
};

/** Cached manifest metadata exposed by a {@link TaxiPointSource}. */
export type TaxiPointSourceMetadata = {
  manifestVersion: number;
  rowCount: number;
  rowGroups: readonly TaxiPointRowGroupMetadata[];
  coordinateColumns: readonly [string, string];
  coordinateSpace: TaxiPointCoordinateSpace;
  /** Bounds across every row group, or `null` when any group has no finite bounds. */
  bounds: readonly [number, number, number, number] | null;
  /** Original dataset URL recorded by the offline preprocessor. */
  source: string;
  /** HTTP validators for the cached manifest object. */
  objectVersion: TaxiSourceObjectVersion;
};

/** One fixed-width point batch in original source coordinate space. */
export type TaxiPointBatch = {
  /** Interleaved source X/Y values in original row order. */
  positions: Float32Array;
  rowCount: number;
  provenance: TaxiPointSourceBatchProvenance;
};

/**
 * Structural source contract shared by packed-shard and future columnar implementations.
 *
 * Sources retain metadata and object-version state across reads. Consumers own the returned batch
 * arrays and decide how much decoded or GPU-resident data to retain.
 */
export interface TaxiPointSource {
  getMetadata(signal?: AbortSignal): Promise<TaxiPointSourceMetadata>;
  read(options?: TaxiPointSourceReadOptions): AsyncIterable<TaxiPointBatch>;
  getTelemetry(): TaxiPointSourceTelemetry;
  close(): void | Promise<void>;
}

export type PackedTaxiShardSourceOptions = {
  fetch?: typeof globalThis.fetch;
};

type PackedTaxiManifest = {
  version: 1 | 2;
  source: string;
  pointCount: number;
  coordinateColumns: readonly [string, string];
  coordinateSpace: TaxiPointCoordinateSpace;
  shards: readonly PackedTaxiManifestShard[];
};

type PackedTaxiManifestShard = {
  file: string;
  firstRow: number;
  pointCount: number;
  bounds: readonly [number, number, number, number] | null;
};

type FetchResult = {
  arrayBuffer: ArrayBuffer;
  objectVersion: TaxiSourceObjectVersion;
};

const PACKED_TAXI_FORMAT = 'float32x2-little-endian';
const BYTES_PER_TAXI_ROW = 2 * Float32Array.BYTES_PER_ELEMENT;
const PLATFORM_IS_LITTLE_ENDIAN = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;

/**
 * Reads the independently addressable `.f32` row groups emitted by `preprocess-paul-taxi.mjs`.
 *
 * The manifest is fetched and decoded at most once. Shard buffers remain uncached so callers can
 * bound resident memory themselves. Repeated reads of a shard carry its retained HTTP validator
 * and fail if the server returns a different strong ETag, or a different Last-Modified value when
 * no strong ETag is available.
 */
export class PackedTaxiShardSource implements TaxiPointSource {
  private readonly manifestUrl: URL;
  private readonly fetchImplementation: typeof globalThis.fetch;
  private readonly closeController = new AbortController();
  private readonly objectVersions = new Map<string, TaxiSourceObjectVersion>();
  private readonly telemetry: TaxiPointSourceTelemetry = {
    downloadedByteCount: 0,
    requestCount: 0,
    networkTimeMilliseconds: 0,
    decodeTimeMilliseconds: 0,
    decodedRowCount: 0
  };

  private metadataPromise?: Promise<TaxiPointSourceMetadata>;
  private closed = false;

  constructor(
    manifestUrl: string | URL = './taxi-atlas/manifest.json',
    options: PackedTaxiShardSourceOptions = {}
  ) {
    const documentBaseUrl =
      typeof document === 'undefined' ? 'http://localhost/' : document.baseURI;
    this.manifestUrl = new URL(manifestUrl, documentBaseUrl);
    this.fetchImplementation = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  /** Returns validated manifest metadata, fetching and decoding it at most once. */
  async getMetadata(signal?: AbortSignal): Promise<TaxiPointSourceMetadata> {
    this.assertOpen();
    signal?.throwIfAborted();
    if (!this.metadataPromise) {
      // The cached request belongs to the source, not whichever caller happens to start it.
      const pendingMetadata = this.loadMetadata();
      this.metadataPromise = pendingMetadata;
      pendingMetadata.catch(() => {
        if (this.metadataPromise === pendingMetadata) {
          this.metadataPromise = undefined;
        }
      });
    }
    return await waitForPromise(this.metadataPromise, signal);
  }

  /** Streams selected packed row groups in the requested order. */
  async *read(options: TaxiPointSourceReadOptions = {}): AsyncGenerator<TaxiPointBatch> {
    this.assertOpen();
    options.signal?.throwIfAborted();
    const metadata = await this.getMetadata(options.signal);
    validateRequestedColumns(options.columns, metadata.coordinateColumns);
    const rowGroupIndexes = getRowGroupIndexes(options.rowGroups, metadata.rowGroups.length);

    for (const rowGroupIndex of rowGroupIndexes) {
      this.assertOpen();
      options.signal?.throwIfAborted();
      const rowGroup = metadata.rowGroups[rowGroupIndex];
      // getRowGroupIndexes verifies every index against metadata.rowGroups.length.
      if (!rowGroup) {
        throw new Error(`Taxi point row group ${rowGroupIndex} is unavailable`);
      }
      const result = await this.fetchArrayBuffer(rowGroup.url, options.signal);
      this.assertOpen();
      options.signal?.throwIfAborted();
      const decodeStartTime = getTimestamp();
      if (result.arrayBuffer.byteLength !== rowGroup.byteLength) {
        this.telemetry.decodeTimeMilliseconds += getTimestamp() - decodeStartTime;
        throw new Error(
          `Taxi point row group ${rowGroupIndex} has ${result.arrayBuffer.byteLength} bytes; expected ${rowGroup.byteLength}`
        );
      }
      const positions = makeLittleEndianFloat32Array(result.arrayBuffer);
      this.telemetry.decodeTimeMilliseconds += getTimestamp() - decodeStartTime;
      this.telemetry.decodedRowCount += rowGroup.rowCount;
      yield {
        positions,
        rowCount: rowGroup.rowCount,
        provenance: {
          rowGroupIndex,
          originalRowOffset: rowGroup.originalRowOffset
        }
      };
    }
  }

  /** Returns a detached snapshot so callers cannot mutate the source's counters. */
  getTelemetry(): TaxiPointSourceTelemetry {
    return {...this.telemetry};
  }

  /** Prevents new reads and aborts requests currently owned by this source. */
  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.closeController.abort(new Error('Packed taxi point source closed'));
  }

  private async loadMetadata(): Promise<TaxiPointSourceMetadata> {
    const result = await this.fetchArrayBuffer(this.manifestUrl.href);
    this.assertOpen();
    const decodeStartTime = getTimestamp();
    try {
      const manifestText = new TextDecoder().decode(result.arrayBuffer);
      const manifest = parsePackedTaxiManifest(JSON.parse(manifestText));
      const manifestDirectory = new URL('.', this.manifestUrl);
      const rowGroupUrls = new Set<string>();
      const rowGroups = Object.freeze(
        manifest.shards.map((shard, index): TaxiPointRowGroupMetadata => {
          const rowGroupUrl = new URL(shard.file, manifestDirectory);
          rowGroupUrl.hash = '';
          if (rowGroupUrls.has(rowGroupUrl.href)) {
            throw new Error(
              `Taxi point manifest shard ${index} repeats resolved URL ${rowGroupUrl.href}`
            );
          }
          rowGroupUrls.add(rowGroupUrl.href);
          const bounds = shard.bounds
            ? Object.freeze([
                shard.bounds[0],
                shard.bounds[1],
                shard.bounds[2],
                shard.bounds[3]
              ] as const)
            : null;
          return Object.freeze({
            index,
            rowCount: shard.pointCount,
            originalRowOffset: shard.firstRow,
            byteLength: getTaxiRowGroupByteLength(shard.pointCount, index),
            url: rowGroupUrl.href,
            bounds
          });
        })
      );
      return Object.freeze({
        manifestVersion: manifest.version,
        rowCount: manifest.pointCount,
        rowGroups,
        coordinateColumns: Object.freeze([
          manifest.coordinateColumns[0],
          manifest.coordinateColumns[1]
        ] as const),
        coordinateSpace: Object.freeze({...manifest.coordinateSpace}),
        bounds: getCombinedBounds(rowGroups),
        source: manifest.source,
        objectVersion: Object.freeze({...result.objectVersion})
      });
    } finally {
      this.telemetry.decodeTimeMilliseconds += getTimestamp() - decodeStartTime;
    }
  }

  private async fetchArrayBuffer(url: string, signal?: AbortSignal): Promise<FetchResult> {
    const requestSignal = makeCombinedAbortSignal(signal, this.closeController.signal);
    const knownVersion = this.objectVersions.get(url);
    const headers: Record<string, string> = {};
    if (knownVersion?.etag) {
      headers['If-Match'] = knownVersion.etag;
    } else if (knownVersion?.lastModified) {
      headers['If-Unmodified-Since'] = knownVersion.lastModified;
    }

    this.telemetry.requestCount++;
    const networkStartTime = getTimestamp();
    try {
      const response = await this.fetchImplementation(url, {
        headers,
        signal: requestSignal.signal
      });
      if (!response.ok) {
        throw new Error(`Taxi point source request failed (${response.status}) for ${url}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      requestSignal.signal.throwIfAborted();
      this.telemetry.downloadedByteCount += arrayBuffer.byteLength;
      const objectVersion = getResponseObjectVersion(response);
      this.validateObjectVersion(url, objectVersion);
      return {arrayBuffer, objectVersion};
    } finally {
      this.telemetry.networkTimeMilliseconds += getTimestamp() - networkStartTime;
      requestSignal.release();
    }
  }

  private validateObjectVersion(url: string, receivedVersion: TaxiSourceObjectVersion): void {
    const knownVersion = this.objectVersions.get(url);
    if (!knownVersion) {
      this.objectVersions.set(url, receivedVersion);
      return;
    }
    if (knownVersion.etag && receivedVersion.etag !== knownVersion.etag) {
      throw new Error(`Taxi point source ETag changed while reading ${url}`);
    }
    if (
      !knownVersion.etag &&
      knownVersion.lastModified &&
      receivedVersion.lastModified !== knownVersion.lastModified
    ) {
      throw new Error(`Taxi point source Last-Modified changed while reading ${url}`);
    }
    this.objectVersions.set(url, {
      etag: knownVersion.etag ?? receivedVersion.etag,
      lastModified: knownVersion.lastModified ?? receivedVersion.lastModified
    });
  }

  private assertOpen(): void {
    if (this.closed) {
      throw new Error('Packed taxi point source is closed');
    }
  }
}

function parsePackedTaxiManifest(value: unknown): PackedTaxiManifest {
  const manifest = getObject(value, 'Taxi point manifest');
  const version = getManifestVersion(manifest.version);
  if (manifest.format !== PACKED_TAXI_FORMAT) {
    throw new Error(`Taxi point manifest format must be ${PACKED_TAXI_FORMAT}`);
  }
  const source = getNonEmptyString(manifest.source, 'Taxi point manifest source');
  const pointCount = getNonNegativeSafeInteger(
    manifest.pointCount,
    'Taxi point manifest pointCount'
  );
  const shardPointCount = getPositiveSafeInteger(
    manifest.shardPointCount,
    'Taxi point manifest shardPointCount'
  );
  const coordinateColumns = parseCoordinateColumns(manifest.coordinateColumns);
  const coordinateSpace = parseCoordinateSpace(manifest.coordinateSpace, version);
  if (!Array.isArray(manifest.shards)) {
    throw new Error('Taxi point manifest shards must be an array');
  }

  const shards: PackedTaxiManifestShard[] = [];
  let expectedFirstRow = 0;
  for (let index = 0; index < manifest.shards.length; index++) {
    const shardValue = getObject(manifest.shards[index], `Taxi point manifest shard ${index}`);
    const file = getNonEmptyString(shardValue.file, `Taxi point manifest shard ${index} file`);
    if (!new URL(file, 'http://localhost/').pathname.toLowerCase().endsWith('.f32')) {
      throw new Error(`Taxi point manifest shard ${index} must reference a .f32 file`);
    }
    const firstRow = getNonNegativeSafeInteger(
      shardValue.firstRow,
      `Taxi point manifest shard ${index} firstRow`
    );
    const shardRowCount = getPositiveSafeInteger(
      shardValue.pointCount,
      `Taxi point manifest shard ${index} pointCount`
    );
    if (firstRow !== expectedFirstRow) {
      throw new Error(
        `Taxi point manifest shard ${index} starts at row ${firstRow}; expected ${expectedFirstRow}`
      );
    }
    if (shardRowCount > shardPointCount) {
      throw new Error(`Taxi point manifest shard ${index} exceeds shardPointCount`);
    }
    getTaxiRowGroupByteLength(shardRowCount, index);
    const bounds = parseBounds(shardValue.bounds, index);
    shards.push({file, firstRow, pointCount: shardRowCount, bounds});
    expectedFirstRow += shardRowCount;
    if (!Number.isSafeInteger(expectedFirstRow)) {
      throw new Error('Taxi point manifest row offsets exceed the safe integer range');
    }
  }
  if (expectedFirstRow !== pointCount) {
    throw new Error(
      `Taxi point manifest row groups contain ${expectedFirstRow} rows; expected ${pointCount}`
    );
  }
  if (pointCount > 0 && shards.length === 0) {
    throw new Error('Taxi point manifest with rows must include at least one shard');
  }

  return {
    version,
    source,
    pointCount,
    coordinateColumns,
    coordinateSpace,
    shards
  };
}

function getManifestVersion(value: unknown): 1 | 2 {
  if (value !== 1 && value !== 2) {
    throw new Error('Taxi point manifest version must be 1 or 2');
  }
  return value;
}

function parseCoordinateColumns(value: unknown): [string, string] {
  if (!Array.isArray(value) || value.length !== 2) {
    throw new Error('Taxi point manifest coordinateColumns must contain two source columns');
  }
  const firstColumn = getNonEmptyString(value[0], 'Taxi point first coordinate column');
  const secondColumn = getNonEmptyString(value[1], 'Taxi point second coordinate column');
  if (firstColumn === secondColumn) {
    throw new Error('Taxi point manifest coordinate columns must be distinct');
  }
  return [firstColumn, secondColumn];
}

function parseCoordinateSpace(value: unknown, version: 1 | 2): TaxiPointCoordinateSpace {
  if (value === undefined && version === 1) {
    return {kind: 'source-xy', crs: null};
  }
  if (value === undefined) {
    throw new Error('Taxi point manifest coordinateSpace is required in version 2');
  }
  const coordinateSpace = getObject(value, 'Taxi point manifest coordinateSpace');
  if (coordinateSpace.kind !== 'source-xy') {
    throw new Error('Taxi point manifest coordinateSpace kind must be source-xy');
  }
  const crs = coordinateSpace.crs;
  if (crs === null) {
    return {kind: 'source-xy', crs: null};
  }
  if (typeof crs !== 'string' || crs.length === 0) {
    throw new Error('Taxi point manifest coordinateSpace crs must be a non-empty string or null');
  }
  return {kind: 'source-xy', crs};
}

function parseBounds(value: unknown, shardIndex: number): [number, number, number, number] | null {
  if (value === null) return null;
  if (!Array.isArray(value) || value.length !== 4 || !value.every(Number.isFinite)) {
    throw new Error(
      `Taxi point manifest shard ${shardIndex} bounds must be four finite numbers or null`
    );
  }
  const bounds: [number, number, number, number] = [value[0], value[1], value[2], value[3]];
  if (bounds[0] > bounds[2] || bounds[1] > bounds[3]) {
    throw new Error(`Taxi point manifest shard ${shardIndex} bounds are inverted`);
  }
  return bounds;
}

function validateRequestedColumns(
  requestedColumns: readonly string[] | undefined,
  coordinateColumns: readonly [string, string]
): void {
  if (requestedColumns === undefined) return;
  if (requestedColumns.length === 0) {
    throw new Error('Taxi point source read columns must not be empty');
  }
  const seenColumns = new Set<string>();
  for (const column of requestedColumns) {
    if (!coordinateColumns.includes(column)) {
      throw new Error(`Taxi point source does not provide requested column ${column}`);
    }
    if (seenColumns.has(column)) {
      throw new Error(`Taxi point source read repeats column ${column}`);
    }
    seenColumns.add(column);
  }
}

function getRowGroupIndexes(
  requestedRowGroups: readonly number[] | undefined,
  rowGroupCount: number
): number[] {
  if (requestedRowGroups === undefined) {
    return Array.from({length: rowGroupCount}, (_, rowGroupIndex) => rowGroupIndex);
  }
  const rowGroupIndexes: number[] = [];
  const seenRowGroups = new Set<number>();
  for (const rowGroupIndex of requestedRowGroups) {
    if (
      !Number.isSafeInteger(rowGroupIndex) ||
      rowGroupIndex < 0 ||
      rowGroupIndex >= rowGroupCount
    ) {
      throw new Error(`Taxi point row group index ${rowGroupIndex} is out of range`);
    }
    if (seenRowGroups.has(rowGroupIndex)) {
      throw new Error(`Taxi point source read repeats row group ${rowGroupIndex}`);
    }
    seenRowGroups.add(rowGroupIndex);
    rowGroupIndexes.push(rowGroupIndex);
  }
  return rowGroupIndexes;
}

function getTaxiRowGroupByteLength(rowCount: number, rowGroupIndex: number): number {
  const byteLength = rowCount * BYTES_PER_TAXI_ROW;
  if (!Number.isSafeInteger(byteLength)) {
    throw new Error(`Taxi point manifest shard ${rowGroupIndex} byte length is not a safe integer`);
  }
  return byteLength;
}

function getCombinedBounds(
  rowGroups: readonly TaxiPointRowGroupMetadata[]
): readonly [number, number, number, number] | null {
  if (rowGroups.length === 0 || rowGroups.some(rowGroup => rowGroup.bounds === null)) {
    return null;
  }
  const bounds: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const rowGroup of rowGroups) {
    const rowGroupBounds = rowGroup.bounds!;
    bounds[0] = Math.min(bounds[0], rowGroupBounds[0]);
    bounds[1] = Math.min(bounds[1], rowGroupBounds[1]);
    bounds[2] = Math.max(bounds[2], rowGroupBounds[2]);
    bounds[3] = Math.max(bounds[3], rowGroupBounds[3]);
  }
  return Object.freeze(bounds);
}

function makeLittleEndianFloat32Array(arrayBuffer: ArrayBuffer): Float32Array {
  if (PLATFORM_IS_LITTLE_ENDIAN) {
    return new Float32Array(arrayBuffer);
  }
  const values = new Float32Array(arrayBuffer.byteLength / Float32Array.BYTES_PER_ELEMENT);
  const dataView = new DataView(arrayBuffer);
  for (let index = 0; index < values.length; index++) {
    values[index] = dataView.getFloat32(index * Float32Array.BYTES_PER_ELEMENT, true);
  }
  return values;
}

function getResponseObjectVersion(response: Response): TaxiSourceObjectVersion {
  const etagHeader = response.headers.get('etag')?.trim();
  const etag = etagHeader && !etagHeader.toLowerCase().startsWith('w/') ? etagHeader : undefined;
  const lastModified = response.headers.get('last-modified')?.trim() || undefined;
  return {etag, lastModified};
}

function makeCombinedAbortSignal(
  callerSignal: AbortSignal | undefined,
  closeSignal: AbortSignal
): {signal: AbortSignal; release: () => void} {
  if (!callerSignal) {
    return {signal: closeSignal, release: () => {}};
  }
  const controller = new AbortController();
  const forwardCallerAbort = () => controller.abort(callerSignal.reason);
  const forwardCloseAbort = () => controller.abort(closeSignal.reason);
  if (callerSignal.aborted) {
    forwardCallerAbort();
  } else if (closeSignal.aborted) {
    forwardCloseAbort();
  } else {
    callerSignal.addEventListener('abort', forwardCallerAbort, {once: true});
    closeSignal.addEventListener('abort', forwardCloseAbort, {once: true});
  }
  return {
    signal: controller.signal,
    release: () => {
      callerSignal.removeEventListener('abort', forwardCallerAbort);
      closeSignal.removeEventListener('abort', forwardCloseAbort);
    }
  };
}

function waitForPromise<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  signal.throwIfAborted();
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const removeAbortListener = () => signal.removeEventListener('abort', rejectOnAbort);
    const rejectOnAbort = () => {
      if (settled) return;
      settled = true;
      removeAbortListener();
      reject(signal.reason);
    };
    signal.addEventListener('abort', rejectOnAbort, {once: true});
    promise.then(
      value => {
        if (settled) return;
        settled = true;
        removeAbortListener();
        resolve(value);
      },
      error => {
        if (settled) return;
        settled = true;
        removeAbortListener();
        reject(error);
      }
    );
    if (signal.aborted) rejectOnAbort();
  });
}

function getObject(value: unknown, name: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

function getNonEmptyString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${name} must be a non-empty string`);
  }
  return value;
}

function getNonNegativeSafeInteger(value: unknown, name: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative safe integer`);
  }
  return value;
}

function getPositiveSafeInteger(value: unknown, name: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive safe integer`);
  }
  return value;
}

function getTimestamp(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

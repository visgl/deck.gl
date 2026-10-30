// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import type {GPUVectorFormat} from '@luma.gl/gpgpu/gpu-data';
import {DataType, type RecordBatch, type Vector} from 'apache-arrow';
import {uploadArrowVector, type PreparedArrowGPUVector} from './arrow-to-gpu-vector';

/** Structural Arrow input contract, without loading Arrow in accessor-only layers. */
export type ColumnSource = Pick<Vector, 'length' | 'type' | 'data'>;

/** Layer-oriented semantics, for numeric, position, scalar, and color conversion. */
export type ArrowConverterSemantic = 'auto' | 'numeric' | 'position' | 'scalar' | 'color';

/** Conversion options. Null rows are rejected unless validity preservation is requested. */
export type ArrowConverterOptions = {
  name?: string;
  format?: GPUVectorFormat;
  /** Preserve high/low components after numeric conversion. */
  fp64?: boolean;
  /** Transform numeric rows before packing, e.g. source-coordinate conversion. */
  transform?: (value: number[]) => readonly number[];
  /** Selects conversion rules; positions preserve XY/XYZ width, colors default to RGBA8. */
  semantic?: ArrowConverterSemantic;
  /** Preserve validity for consumers that understand nulls, or reject them (default). */
  nullPolicy?: 'reject' | 'preserve';
};

/** One Arrow batch column and its requested GPU representation. */
export type ArrowConverterColumn = ArrowConverterOptions & {
  /** Column name or nested field path within each record batch. */
  source: string;
};

/** Output column names mapped to source selectors and conversion requirements. */
export type ArrowConverterSchema = Readonly<Record<string, ArrowConverterColumn>>;

/** A caller-owned converted vector with its cumulative source row offset. */
export type ArrowConvertedChunk = PreparedArrowGPUVector & {
  /** First source row represented by this chunk. */
  rowOffset: number;
};

/** Aligned converted columns from one record batch. Destroy releases every owned column. */
export type ArrowConvertedBatch = {
  /** Converted columns keyed by the requested output names. */
  columns: Record<string, PreparedArrowGPUVector>;
  /** First source row represented by this batch. */
  rowOffset: number;
  /** Number of rows shared by all columns. */
  length: number;
  /** Releases the batch's owned GPU allocations; safe to call repeatedly. */
  destroy(): void;
};

/** A lazy source, including bare async iterators returned by Arrow readers. */
export type ArrowConverterSource<T> = AsyncIterable<T> | AsyncIterator<T> | Iterable<T>;

/** Options controlling stream cancellation. Yielded results remain caller-owned. */
export type ArrowConverterIteratorOptions = {
  /** Cancels pending input reads and prevents further conversions. */
  signal?: AbortSignal;
};

/**
 * Experimental Arrow-to-GPU conversion boundary, intended for eventual luma.gl upstreaming.
 * Uploads preserve Arrow chunks. Results own their allocations and must be destroyed by callers;
 * the converter retains no output buffers. Streaming pulls one input per requested output.
 */
export class ArrowConverter {
  /** Uses the supplied device for conversion and uploads without taking ownership of it. */
  constructor(private readonly device: Device) {}

  /** Converts one Arrow vector; destroy the returned handle after its last GPU use. */
  async convert(
    vector: Vector,
    options: ArrowConverterOptions = {}
  ): Promise<PreparedArrowGPUVector> {
    const {semantic = 'auto', nullPolicy = 'reject', ...conversion} = options;
    if (
      semantic === 'position' &&
      (!DataType.isFixedSizeList(vector.type) || ![2, 3].includes(vector.type.listSize))
    ) {
      throw new Error('Arrow positions must be FixedSizeList[2] or FixedSizeList[3]');
    }
    if (semantic === 'scalar' && !DataType.isInt(vector.type) && !DataType.isFloat(vector.type)) {
      throw new Error('Arrow scalar input must be numeric');
    }
    let format = conversion.format;
    if (!format) {
      if (semantic === 'color') format = 'unorm8x4';
      if (semantic === 'scalar') format = 'float32';
      if (semantic === 'position') {
        if (!DataType.isFixedSizeList(vector.type) || ![2, 3].includes(vector.type.listSize)) {
          throw new Error('Arrow positions must be FixedSizeList[2] or FixedSizeList[3]');
        }
        format = vector.type.listSize === 2 ? 'float32x2' : 'float32x3';
      }
    }
    if (!format) {
      const width = DataType.isFixedSizeList(vector.type) ? vector.type.listSize : 1;
      format = (width === 1 ? 'float32' : `float32x${width}`) as GPUVectorFormat;
    }
    return uploadArrowVector(this.device, vector, {
      name: conversion.name,
      format,
      color: semantic === 'color',
      preserveNulls: nullPolicy === 'preserve',
      fp64: conversion.fp64,
      transform: conversion.transform
    });
  }

  /** Converts aligned columns atomically, rolling back earlier uploads on failure. */
  async convertBatch(
    batch: RecordBatch,
    schema: ArrowConverterSchema
  ): Promise<ArrowConvertedBatch> {
    const columns: Record<string, PreparedArrowGPUVector> = Object.create(null);
    try {
      for (const [name, {source, ...options}] of Object.entries(schema)) {
        // The resolver supports nested paths and also validates missing columns.
        const vector = resolveColumn(batch, source);
        columns[name] = await this.convert(vector, {name, ...options});
        if (columns[name].vector.length !== batch.numRows) {
          throw new Error(`Arrow column "${source}" rows do not match the batch`);
        }
      }
      return {
        columns,
        rowOffset: 0,
        length: batch.numRows,
        destroy: () => {
          for (const column of Object.values(columns)) column.destroy();
        }
      };
    } catch (error) {
      for (const column of Object.values(columns)) column.destroy();
      throw error;
    }
  }

  /** Converts streamed vectors without concatenation, preserving backpressure and row offsets. */
  async *convertVectors(
    source: ArrowConverterSource<Vector>,
    options: ArrowConverterOptions = {},
    {signal}: ArrowConverterIteratorOptions = {}
  ): AsyncGenerator<ArrowConvertedChunk> {
    let rowOffset = 0;
    let format: string | undefined;
    for await (const vector of iterate(source, signal)) {
      const result = await this.convert(vector, options);
      try {
        signal?.throwIfAborted();
        if (format && result.vector.format !== format)
          throw new Error('Arrow stream format changed');
        format = result.vector.format;
      } catch (error) {
        result.destroy();
        throw error;
      }
      const chunk = Object.assign(result, {rowOffset});
      rowOffset += vector.length;
      yield chunk;
    }
  }

  /** Converts record batches together so every column shares row ranges and output formats. */
  async *convertBatches(
    source: ArrowConverterSource<RecordBatch>,
    schema: ArrowConverterSchema,
    {signal}: ArrowConverterIteratorOptions = {}
  ): AsyncGenerator<ArrowConvertedBatch> {
    let rowOffset = 0;
    const formats = new Map<string, string | undefined>();
    for await (const batch of iterate(source, signal)) {
      const result = await this.convertBatch(batch, schema);
      try {
        signal?.throwIfAborted();
        for (const [name, column] of Object.entries(result.columns)) {
          if (formats.has(name) && formats.get(name) !== column.vector.format) {
            throw new Error(`Arrow stream format changed for "${name}"`);
          }
          formats.set(name, column.vector.format);
        }
      } catch (error) {
        result.destroy();
        throw error;
      }
      result.rowOffset = rowOffset;
      rowOffset += result.length;
      yield result;
    }
  }
}

function resolveColumn(batch: RecordBatch, source: string): Vector {
  const [name, ...path] = source.split('.');
  let vector: Vector | null = batch.getChild(name);
  for (const field of path) vector = vector?.getChild(field) ?? null;
  if (!vector) throw new Error(`Arrow column "${source}" is missing`);
  return vector;
}

async function* iterate<T>(
  source: ArrowConverterSource<T>,
  signal?: AbortSignal
): AsyncGenerator<T> {
  signal?.throwIfAborted();
  const iterator =
    Symbol.asyncIterator in source
      ? source[Symbol.asyncIterator]()
      : Symbol.iterator in source
        ? source[Symbol.iterator]()
        : source;
  try {
    for (;;) {
      const result = await readNext(iterator, signal);
      if (result.done) return;
      yield result.value;
      signal?.throwIfAborted();
    }
  } finally {
    // A stalled async generator may queue return() behind its pending next(). Do not delay abort.
    if (signal?.aborted) void Promise.resolve(iterator.return?.()).catch(() => {});
    else await iterator.return?.();
  }
}

function readNext<T>(
  iterator: Iterator<T> | AsyncIterator<T>,
  signal?: AbortSignal
): Promise<IteratorResult<T>> {
  signal?.throwIfAborted();
  if (!signal) return Promise.resolve(iterator.next());
  return new Promise((resolve, reject) => {
    const abort = () => {
      signal.removeEventListener('abort', abort);
      reject(signal.reason);
    };
    signal.addEventListener('abort', abort, {once: true});
    Promise.resolve()
      .then(() => {
        signal.throwIfAborted();
        return iterator.next();
      })
      .then(
        result => {
          signal.removeEventListener('abort', abort);
          resolve(result);
        },
        error => {
          signal.removeEventListener('abort', abort);
          reject(error);
        }
      );
  });
}

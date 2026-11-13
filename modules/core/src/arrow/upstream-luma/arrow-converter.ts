// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import type {GPUVector} from '@luma.gl/graph/gpu-data';
import {type RecordBatch, type Vector} from 'apache-arrow';
import {
  convertArrowColumnToGPUVector,
  type ArrowColumnGPUVectorOptions,
  type PreparedArrowColumnGPUVector
} from '@luma.gl/graph/arrow';
import {getArrowConversionFormat} from './arrow-schema';

/** Resolved Arrow accessor columns or borrowed GPU vectors used during preparation. */
export type ColumnSource = Pick<Vector, 'length' | 'type' | 'data'> | GPUVector;

/** Layer-oriented semantics, for numeric, position, scalar, and color conversion. */
export type ArrowConverterSemantic = 'auto' | 'numeric' | 'position' | 'scalar' | 'color';

/** Conversion options. Null rows are rejected unless validity preservation is requested. */
export type ArrowConverterOptions = Partial<
  Pick<ArrowColumnGPUVectorOptions, 'name' | 'format' | 'fp64' | 'transform'>
> & {
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
export type ArrowConvertedChunk = PreparedArrowColumnGPUVector & {
  /** First source row represented by this chunk. */
  rowOffset: number;
};

/** Aligned converted columns from one record batch. Destroy releases every owned column. */
export type ArrowConvertedBatch = {
  /** Converted columns keyed by the requested output names. */
  columns: Record<string, PreparedArrowColumnGPUVector>;
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
 * Layer-oriented semantics and streaming around luma.gl Arrow-to-GPU conversion.
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
  ): Promise<PreparedArrowColumnGPUVector> {
    const {semantic = 'auto', nullPolicy = 'reject', ...conversion} = options;
    const format = getArrowConversionFormat(vector.type, options);
    return convertArrowColumnToGPUVector(this.device, vector, {
      name: conversion.name,
      format,
      color: semantic === 'color' || format === 'unorm8x4',
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
    const columns: Record<string, PreparedArrowColumnGPUVector> = Object.create(null);
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

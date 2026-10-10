// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {getArrowVectorByPath, makeGPUVectorFromArrow} from '@luma.gl/arrow';
import type {Device} from '@luma.gl/core';
import type {GPUVector, GPUVectorFormat} from '@luma.gl/gpgpu/gpu-data';
import {DataType, Float32, RecordBatch, Table, Uint8, Vector} from 'apache-arrow';

/** Materialized Arrow sources accepted by synchronous GPUVector adapters. */
export type ArrowGPUVectorLayerData = Table | RecordBatch;
/** Named or direct Arrow vector selected for one semantic GPUVector input. */
export type ArrowGPUVectorColumnSelector<TypeT extends DataType = DataType> =
  | string
  | Vector<TypeT>;

/** Resolves a column and uploads it as an adapter-owned GPUVector. */
export function makeLayerGPUVectorFromArrow<FormatT extends GPUVectorFormat>(
  device: Device,
  data: ArrowGPUVectorLayerData,
  selector: ArrowGPUVectorColumnSelector,
  options: {name: string; id: string; format: FormatT}
): GPUVector<FormatT> {
  const vector =
    selector instanceof Vector
      ? selector
      : getArrowVectorByPath(data instanceof Table ? data : new Table([data]), selector);
  if (!vector) throw new Error(`Arrow GPU layer column "${String(selector)}" is missing`);
  if (vector.data.some(chunk => chunk.nullCount > 0)) {
    throw new Error(`Arrow GPU layer column "${options.name}" contains null rows`);
  }
  assertLayerArrowVectorFormat(vector, options.format, options.name);
  return makeGPUVectorFromArrow(device, vector, {
    name: options.name,
    id: options.id,
    format: options.format,
    preserveDataChunks: true
  });
}

/** Rejects Arrow storage that cannot be borrowed under the requested GPU byte format. */
export function assertLayerArrowVectorFormat(
  vector: Vector,
  format: GPUVectorFormat,
  name: string
): void {
  const floatListSize = getFloat32ListSize(format);
  if (floatListSize !== null) {
    if (
      !DataType.isFixedSizeList(vector.type) ||
      vector.type.listSize !== floatListSize ||
      !(vector.type.children[0]?.type instanceof Float32)
    ) {
      throw new Error(
        `Arrow GPU layer column "${name}" must be FixedSizeList<Float32>[${floatListSize}] for ${format}`
      );
    }
    return;
  }
  if (format === 'float32' && !(vector.type instanceof Float32)) {
    throw new Error(`Arrow GPU layer column "${name}" must be Float32 for ${format}`);
  }
  if (
    format === 'unorm8x4' &&
    (!DataType.isFixedSizeList(vector.type) ||
      vector.type.listSize !== 4 ||
      !(vector.type.children[0]?.type instanceof Uint8))
  ) {
    throw new Error(
      `Arrow GPU layer column "${name}" must be FixedSizeList<Uint8>[4] for ${format}`
    );
  }
}

function getFloat32ListSize(format: GPUVectorFormat): 2 | 3 | 4 | null {
  switch (format) {
    case 'float32x2':
      return 2;
    case 'float32x3':
      return 3;
    case 'float32x4':
      return 4;
    default:
      return null;
  }
}

/** Destroys only vectors created and owned by an Arrow adapter. */
export function destroyLayerGPUVectors(vectors: Array<GPUVector | undefined>): void {
  for (const vector of vectors) vector?.destroy();
}

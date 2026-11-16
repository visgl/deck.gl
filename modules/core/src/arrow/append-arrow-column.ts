// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Vector} from 'apache-arrow';
import {GPUVector} from '@luma.gl/graph/gpu-data';
import type {PreparedArrowColumnGPUVector} from '@luma.gl/graph/arrow';
import type {ArrowConverter, ArrowConverterOptions} from './upstream-luma/arrow-converter';

/** A column's source chunks and the conversion handles that own its GPU allocations. */
export type PreparedArrowColumn = {
  source: Vector;
  vector: GPUVector;
  residualVector?: GPUVector;
  resources: PreparedArrowColumnGPUVector[];
  bounds?: [number[], number[]];
};

/**
 * Converts only new chunks when the source retains an unchanged prefix. Returned vectors
 * borrow their chunks; the caller transfers resource ownership after committing the update.
 */
export async function appendArrowColumn(
  converter: ArrowConverter,
  source: Vector,
  options: ArrowConverterOptions,
  own: (resource: PreparedArrowColumnGPUVector) => void,
  previous?: PreparedArrowColumn
): Promise<PreparedArrowColumn> {
  const reuse =
    previous &&
    previous.source.data.length <= source.data.length &&
    previous.source.data.every((chunk, index) => source.data[index] === chunk);
  if (reuse && previous.source.data.length === source.data.length) {
    return previous;
  }
  const input = reuse ? new Vector(source.data.slice(previous.source.data.length)) : source;
  let bounds: [number[], number[]] | undefined =
    reuse && previous.bounds ? [[...previous.bounds[0]], [...previous.bounds[1]]] : undefined;
  const result = await converter.convert(input, {
    ...options,
    ...(options.semantic === 'position' && {
      transform: value => {
        bounds ??= [
          [Infinity, Infinity, Infinity],
          [-Infinity, -Infinity, -Infinity]
        ];
        for (let index = 0; index < 3; index++) {
          const coordinate = value[index] ?? 0;
          bounds[0][index] = Math.min(bounds[0][index], coordinate);
          bounds[1][index] = Math.max(bounds[1][index], coordinate);
        }
        return options.transform ? options.transform(value) : value;
      }
    })
  });
  own(result);
  if (!reuse) {
    return {source, ...result, bounds, resources: [result]};
  }
  return {
    source,
    bounds,
    vector: joinVectors(previous.vector, result.vector),
    residualVector:
      previous.residualVector && result.residualVector
        ? joinVectors(previous.residualVector, result.residualVector)
        : result.residualVector,
    resources: [...previous.resources, result]
  };
}

/** Groups existing allocations without copying them or acquiring buffer ownership. */
function joinVectors(previous: GPUVector, next: GPUVector): GPUVector {
  return new GPUVector({
    type: 'data',
    name: next.name,
    format: next.format,
    data: [...previous.data, ...next.data],
    byteStride: next.byteStride,
    rowByteLength: next.rowByteLength,
    ownsData: false
  });
}

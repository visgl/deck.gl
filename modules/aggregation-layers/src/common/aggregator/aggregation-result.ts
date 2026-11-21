// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {BinaryAttribute} from '@deck.gl/core';
import {Buffer} from '@luma.gl/core';
import {GPUVector, getGPUVectorData} from '@luma.gl/graph/gpu-data';
import type {AggregationResult} from './aggregator';

/** Bridges borrowed vectors to the existing AttributeManager/GPUVectorModel rendering path. */
export function getAggregationAttribute(result: AggregationResult | null): BinaryAttribute | null {
  if (!(result instanceof GPUVector)) {
    return result;
  }
  if (result.format !== 'float32' && result.format !== 'float32x2') {
    throw new Error('Aggregation results require float32 values or float32x2 bin IDs');
  }
  const chunk = getGPUVectorData(result);
  if (!(chunk.buffer instanceof Buffer)) {
    throw new Error('Aggregation results require a concrete Buffer');
  }
  return {
    buffer: chunk.buffer,
    type: 'float32',
    size: result.format === 'float32' ? 1 : 2,
    offset: chunk.byteOffset,
    stride: chunk.byteStride
  };
}

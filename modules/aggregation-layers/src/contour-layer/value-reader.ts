// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Aggregator, CPUAggregator, WebGLAggregator} from '../common/aggregator/index';
import type {TypedArray} from '@luma.gl/core';

type ValueReader = (x: number, y: number) => number;

/** Returns an accessor to the aggregated values from bin id */
export function getAggregatorValueReader(opts: {
  aggregator: Aggregator;
  binIdRange: [number, number][];
  channel: 0 | 1 | 2;
}): ValueReader | null {
  const {aggregator, binIdRange, channel} = opts;

  if (aggregator instanceof WebGLAggregator) {
    const buffer = aggregator.getResult(channel)?.buffer;
    if (buffer) {
      const values = new Float32Array(buffer.readSyncWebGL().buffer);
      return getWebGLAggregatorValueReader(values, binIdRange);
    }
  }
  if (aggregator instanceof CPUAggregator) {
    const values = aggregator.getResult(channel)?.value;
    const ids = aggregator.getBins()?.value;
    if (ids && values) {
      return getCPUAggregatorValueReader(values, ids, aggregator.binCount);
    }
  }
  // Custom aggregators may expose CPU snapshots without requiring a WebGL implementation.
  const values = aggregator.getResult(channel);
  const ids = aggregator.getBins();
  if (values && ids && 'value' in values && 'value' in ids && values.value && ids.value) {
    return getCPUAggregatorValueReader(values.value, ids.value, aggregator.binCount, {
      valueOffset: (values.offset || 0) / values.value.BYTES_PER_ELEMENT,
      valueStride: values.stride ? values.stride / values.value.BYTES_PER_ELEMENT : 1,
      idOffset: (ids.offset || 0) / ids.value.BYTES_PER_ELEMENT,
      idStride: ids.stride ? ids.stride / ids.value.BYTES_PER_ELEMENT : 2
    });
  }
  if (values && ids) {
    throw new Error('ContourLayer requires CPU aggregation results for contour generation');
  }
  return null;
}

function getWebGLAggregatorValueReader(
  values: Float32Array,
  binIdRange: [number, number][]
): ValueReader {
  const [[minX, maxX], [minY, maxY]] = binIdRange;
  const width = maxX - minX;
  const height = maxY - minY;
  return (x: number, y: number) => {
    x -= minX;
    y -= minY;
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return NaN;
    }
    return values[y * width + x];
  };
}

function getCPUAggregatorValueReader(
  values: TypedArray,
  ids: TypedArray,
  count: number,
  layout = {valueOffset: 0, valueStride: 1, idOffset: 0, idStride: 2}
): ValueReader {
  const idMap: Record<string, Record<string, number>> = {};
  for (let i = 0; i < count; i++) {
    const offset = layout.idOffset + i * layout.idStride;
    const x = ids[offset];
    const y = ids[offset + 1];
    idMap[x] = idMap[x] || {};
    idMap[x][y] = values[layout.valueOffset + i * layout.valueStride];
  }
  return (x: number, y: number) => idMap[x]?.[y] ?? NaN;
}

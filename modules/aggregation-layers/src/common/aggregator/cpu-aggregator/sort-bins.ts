// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Bin} from './cpu-aggregator';

/** Group data points into bins */
export function sortBins({
  pointCount,
  getBinId
}: {
  pointCount: number;
  getBinId: (index: number) => number[] | null;
}): Bin[] {
  const binsById: Map<string, Bin> = new Map();

  for (let i = 0; i < pointCount; i++) {
    const id = getBinId(i);
    if (id === null) {
      continue;
    }
    let bin = binsById.get(String(id));
    if (bin) {
      bin.points.push(i);
    } else {
      bin = {
        id,
        index: binsById.size,
        points: [i]
      };
      binsById.set(String(id), bin);
    }
  }
  return Array.from(binsById.values());
}

/** Pack bin ids into a typed array */
export function packBinIds({
  bins,
  dimensions,
  target
}: {
  bins: Bin[];
  /** Size of bin IDs */
  dimensions: number;
  /** Array to write output into */
  target?: Float32Array | null;
}): Float32Array {
  const targetLength = bins.length * dimensions;
  if (!target || target.length < targetLength) {
    target = new Float32Array(targetLength);
  }

  for (let i = 0; i < bins.length; i++) {
    const {id} = bins[i];
    if (Array.isArray(id)) {
      target.set(id, i * dimensions);
    } else {
      target[i] = id;
    }
  }
  return target;
}

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
  dimensions
}: {
  bins: Bin[];
  /** Size of bin IDs */
  dimensions: number;
}): Float32Array {
  const target = new Float32Array(bins.length * dimensions);

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

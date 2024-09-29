// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/** Type assigned to e.g. getColorValue/getElevationValue props in aggregation layers (e.g. CPUGridLayer, HexagonLayer)*/
export type AggregateAccessor<DataT = any> = (
  /** a list of objects whose positions fall inside this cell. */
  objects: DataT[],
  objectInfo: {
    /** the indices of `objects` in the original data. */
    indices: number[];
    /** the value of the `data` prop */
    data: any;
  }
) => number;

export type ScaleType = 'linear' | 'quantize' | 'quantile' | 'ordinal';

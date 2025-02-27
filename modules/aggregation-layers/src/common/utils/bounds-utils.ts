// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/** Utility to estimate binIdRange as expected by AggregatorProps */
export function getBinIdRange({
  dataBounds,
  getBinId,
  padding = 0
}: {
  /** Bounds of the input data */
  dataBounds: [min: number[], max: number[]];
  /** Given a data point, returns the bin id that it belongs to */
  getBinId: (p: number[]) => number[];
  /** Add a border around the result to avoid clipping */
  padding?: number;
}): [number, number][] {
  const corners = [
    dataBounds[0],
    dataBounds[1],
    [dataBounds[0][0], dataBounds[1][1]],
    [dataBounds[1][0], dataBounds[0][1]]
  ].map(p => getBinId(p));

  const minX = Math.min(...corners.map(p => p[0])) - padding;
  const minY = Math.min(...corners.map(p => p[1])) - padding;
  const maxX = Math.max(...corners.map(p => p[0])) + padding + 1;
  const maxY = Math.max(...corners.map(p => p[1])) + padding + 1;

  return [
    [minX, maxX],
    [minY, maxY]
  ];
}

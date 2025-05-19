// math.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {IJToST, STToUV, FaceUVToXYZ, XYZToLngLat, getS2Cell} from './s2-geometry';

const MAX_RESOLUTION = 100;

export function getS2GeoBounds(s2Index: bigint): Float64Array {
  const s2Cell = getS2Cell(s2Index);
  return getS2GeoBoundsFromCell(s2Cell);
}

/**
 * The S2 cell edge is curved: http://s2geometry.io/
 * This is more prominent at lower levels
 * resolution is the number of segments to generate per edge.
 * We exponentially reduce resolution as level increases so it doesn't affect perf
 * when there are a large number of cells
 */
// eslint-disable-next-line max-statements
export function getS2GeoBoundsFromCell({
  face,
  ij,
  level
}: {
  face: number;
  ij: [number, number];
  level: number;
}): Float64Array {
  const offsets = [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
    [0, 0]
  ];

  const resolution = Math.max(1, Math.ceil(MAX_RESOLUTION * Math.pow(2, -level)));
  const result = new Float64Array(4 * resolution * 2 + 2);
  let ptIndex = 0;
  let prevLng = 0;

  for (let i = 0; i < 4; i++) {
    const offset = offsets[i].slice(0) as [number, number];
    const nextOffset = offsets[i + 1];
    const stepI = (nextOffset[0] - offset[0]) / resolution;
    const stepJ = (nextOffset[1] - offset[1]) / resolution;

    for (let j = 0; j < resolution; j++) {
      offset[0] += stepI;
      offset[1] += stepJ;
      // Cell can be represented by coordinates IJ, ST, UV, XYZ
      // http://s2geometry.io/devguide/s2cell_hierarchy#coordinate-systems
      const st = IJToST(ij, level, offset);
      const uv = STToUV(st);
      const xyz = FaceUVToXYZ(face, uv);
      const lngLat = XYZToLngLat(xyz);

      // Adjust longitude for Web Mercator projection
      if (Math.abs(lngLat[1]) > 89.999) {
        lngLat[0] = prevLng;
      }
      const deltaLng = lngLat[0] - prevLng;
      lngLat[0] += deltaLng > 180 ? -360 : deltaLng < -180 ? 360 : 0;

      result[ptIndex++] = lngLat[0];
      result[ptIndex++] = lngLat[1];
      prevLng = lngLat[0];
    }
  }
  // close the loop
  result[ptIndex++] = result[0];
  result[ptIndex++] = result[1];
  return result;
}

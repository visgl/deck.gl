// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {lerp} from '@math.gl/core';
import {
  type CoordPair,
  type H3IndexInput, // Either string or SplitLong
  cellToBoundary,
  cellToLatLng
} from '../h3-js-bigint/h3-js-bigint';
import {normalizeLongitudes} from './geometry-utils';

// UTILITIES - TODO can these be generalized using the decoder?

// scale polygon vertices w.r.t center (hexId)
export function scalePolygon(hexId: H3IndexInput, vertices: CoordPair[], factor: number): void {
  const [lat, lng] = cellToLatLng(hexId);
  const actualCount = vertices.length;

  // normalize with respect to center
  normalizeLongitudes(vertices, lng);

  // `cellToBoundary` returns same array object for first and last vertex (closed polygon),
  // if so skip scaling the last vertex
  const vertexCount = vertices[0] === vertices[actualCount - 1] ? actualCount - 1 : actualCount;
  for (let i = 0; i < vertexCount; i++) {
    vertices[i][0] = lerp(lng, vertices[i][0], factor);
    vertices[i][1] = lerp(lat, vertices[i][1], factor);
  }
}

// gets hexagon centroid
export function getHexagonCentroid(getHexagon, object, objectInfo) {
  const hexagonId = getHexagon(object, objectInfo);
  const [lat, lng] = cellToLatLng(hexagonId);
  return [lng, lat];
}

export function h3ToPolygon(hexId: H3IndexInput, coverage: number = 1): number[][] {
  const vertices = cellToBoundary(hexId, true);

  if (coverage !== 1) {
    // scale and normalize vertices w.r.t to center
    scalePolygon(hexId, vertices, coverage);
  } else {
    // normalize w.r.t to start vertex
    normalizeLongitudes(vertices);
  }

  return vertices;
}

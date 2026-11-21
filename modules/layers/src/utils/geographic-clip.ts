// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {clipGeographicPolygon, clipGeographicPolyline} from '@math.gl/geospatial';
import type {NumericArray} from '@math.gl/core';
import type {GeographicClipOptions, GeographicPolygonRing} from '@math.gl/geospatial';
import type {FlatComplexPolygonGeometry} from '../solid-polygon-layer/polygon';

/** Source-space clipping for CPU-preprojected WGS84 geometry. */
export type GeographicClip = {
  /** Right edge of the longitude chart in degrees. @default 180 */
  seamLongitude?: number;
  /** Inclusive latitude band in degrees. @default [-90, 90] */
  latitudeRange?: [number, number];
  /** Pole enclosed by a once-winding polygon ring. */
  enclosedPole?: 'north' | 'south';
};

/** A packed polygon with a visibility flag for each outgoing edge. */
export type CutPolygon = FlatComplexPolygonGeometry & {edgeTypes: number[]};

/** Shared options for linearly interpolated source positions. */
function getClipOptions(clip: GeographicClip, size: number): GeographicClipOptions {
  return {
    size,
    edgeModel: 'linear',
    linearLongitude: 'shortest',
    seamLongitude: clip.seamLongitude,
    latitudeRange: clip.latitudeRange ?? [-90, 90]
  };
}

/** Check whether the last position repeats the first. */
export function isClosedRing(positions: NumericArray, size: number): boolean {
  const last = positions.length - size;
  for (let i = 0; i < size; i++) {
    if (positions[i] !== positions[last + i]) return false;
  }
  return true;
}

/** Supply explicit pole metadata only for a ring with one full longitude turn. */
function getClipRing(
  positions: NumericArray,
  size: number,
  clip: GeographicClip
): GeographicPolygonRing {
  let longitudeSum = 0;
  let previousLongitude = positions[positions.length - size];
  for (let i = 0; i < positions.length; i += size) {
    const longitude = positions[i];
    const delta = (longitude - previousLongitude) % 360;
    longitudeSum += delta > 180 ? delta - 360 : delta < -180 ? delta + 360 : delta;
    previousLongitude = longitude;
  }
  if (Math.abs(Math.round(longitudeSum / 360)) !== 1) return {positions};
  if (!clip.enclosedPole) {
    throw new Error('_geographicClip requires enclosedPole for a ring that encloses a pole');
  }

  // Use each scalar's ring mean at the synthetic pole, independent of the starting vertex.
  const end = positions.length - (isClosedRing(positions, size) ? size : 0);
  const poleAttributes = new Array<number>(size - 2).fill(0);
  for (let i = 0; i < end; i += size) {
    for (let j = 2; j < size; j++) {
      poleAttributes[j - 2] += (positions[i + j] - poleAttributes[j - 2]) / (i / size + 1);
    }
  }
  return {positions, pole: clip.enclosedPole, poleAttributes};
}

/** Clip packed rings, subdivide their edges, and retain visibility only for source edges. */
export function clipPolygon(
  positions: NumericArray,
  holeIndices: NumericArray | null,
  size: number,
  {clip, resolution}: {clip: GeographicClip; resolution?: number}
): CutPolygon[] {
  if (!positions.length) return [];
  const rings: GeographicPolygonRing[] = [];
  let start = 0;
  for (const end of [...(holeIndices || []), positions.length]) {
    rings.push(getClipRing(positions.slice(start, end), size, clip));
    start = end;
  }

  return clipGeographicPolygon(rings, getClipOptions(clip, size)).map(component => {
    const packedPositions: number[] = [];
    const packedHoles: number[] = [];
    const edgeTypes: number[] = [];
    for (const ring of component.rings) {
      if (packedPositions.length) packedHoles.push(packedPositions.length);
      const {positions: source, edges} = ring;
      for (const [edgeIndex, edge] of edges.entries()) {
        const offset = edgeIndex * size;
        const nextOffset = offset + size;
        const edgeType = edge.kind === 'source' ? 1 : 0;
        packedPositions.push(...source.subarray(offset, nextOffset));
        edgeTypes.push(edgeType);

        const latitude = source[offset + 1];
        const nextLatitude = source[nextOffset + 1];
        if (resolution && !(Math.abs(latitude) === 90 && Math.abs(nextLatitude) === 90)) {
          const span = Math.max(
            Math.abs(source[nextOffset] - source[offset]),
            Math.abs(nextLatitude - latitude)
          );
          const segmentCount = Math.ceil(span / resolution);
          for (let segment = 1; segment < segmentCount; segment++) {
            const fraction = segment / segmentCount;
            for (let axis = 0; axis < size; axis++) {
              const a = source[offset + axis];
              const b = source[nextOffset + axis];
              packedPositions.push(a + (b - a) * fraction);
            }
            edgeTypes.push(edgeType);
          }
        }
      }
      packedPositions.push(...source.subarray(edges.length * size));
      edgeTypes.push(0); // Repeated closing vertex has no outgoing edge.
    }
    return {positions: packedPositions, holeIndices: packedHoles, edgeTypes};
  });
}

/** Clip a packed path, keeping the closing source edge of a loop. */
export function clipPath(
  path: NumericArray,
  size: number,
  clip: GeographicClip,
  loop: boolean
): number[][] {
  const closed = isClosedRing(path, size);
  const positions = loop && !closed ? [...path, ...path.slice(0, size)] : path;
  const parts = clipGeographicPolyline(positions, getClipOptions(clip, size)).map(part =>
    Array.from(part.positions)
  );

  // If the loop was cut, rejoin the pieces incident to its original start vertex.
  if ((closed || loop) && parts.length > 1) {
    const first = parts[0];
    const last = parts[parts.length - 1];
    if (first.slice(0, size).every((value, i) => value === last[last.length - size + i])) {
      parts[0] = last.concat(first.slice(size));
      parts.pop();
    }
  }
  return parts;
}

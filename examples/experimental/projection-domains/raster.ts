// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {GeoProjection} from 'd3-geo';
import type {BinaryPolygonData} from '@ateliercartographie/geoarrow-deck-stream';

export type Vertex = [number, number, number, number]; // target x/y, source u/v
export type RasterKind = 'world' | 'rotated' | 'polar';

/** Clip a triangle to the image footprint, interpolating all vertex attributes. */
export function clipToImage(vertices: Vertex[]): Vertex[] {
  let polygon = vertices;
  for (const [axis, boundary, sign] of [
    [2, 0, 1],
    [2, 1, -1],
    [3, 0, 1],
    [3, 1, -1]
  ]) {
    const output: Vertex[] = [];
    for (let i = 0; i < polygon.length; i++) {
      const a = polygon[i];
      const b = polygon[(i + 1) % polygon.length];
      const da = (a[axis] - boundary) * sign;
      const db = (b[axis] - boundary) * sign;
      if (da >= 0) output.push(a);
      if (da < 0 !== db < 0) {
        const t = da / (da - db);
        output.push(a.map((value, j) => value + t * (b[j] - value)) as Vertex);
      }
    }
    polygon = output;
  }
  return polygon;
}

/** Synthetic source grids; polar uses a spherical south-polar stereographic plane. */
export function sourceUV(kind: RasterKind, longitude: number, latitude: number): [number, number] {
  if (kind === 'polar') {
    const radius = Math.tan(((90 + latitude) * Math.PI) / 360);
    const angle = (longitude * Math.PI) / 180;
    return [0.5 + radius * Math.sin(angle), 0.5 + radius * Math.cos(angle)];
  }
  if (kind === 'rotated') {
    const x = ((longitude - 170 + 540) % 360) - 180;
    const y = latitude - 15;
    const angle = Math.PI / 6;
    return [
      0.5 + (x * Math.cos(angle) + y * Math.sin(angle)) / 70,
      0.5 + (-x * Math.sin(angle) + y * Math.cos(angle)) / 40
    ];
  }
  return [(longitude + 180) / 360, (90 - latitude) / 180];
}

/**
 * Mesh an explicit target domain, then invert its vertices into source texture space.
 * This example uses bounded uniform refinement, not a general adaptive warp mesher.
 */
export function createRasterMesh(
  domain: BinaryPolygonData,
  projection: GeoProjection,
  kind: RasterKind,
  maxEdge = 8
) {
  const positions: number[] = [];
  const texCoords: number[] = [];
  const indices: number[] = [];
  let unresolvedTriangles = 0;
  const domainIndices = domain.indices || [];
  type Point = [number, number];
  const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const midpoint = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  function emit(points: Point[], depth: number) {
    const [a, b, c] = points;
    const lengths = [distance(a, b), distance(b, c), distance(c, a)];
    if (depth < 24 && Math.max(...lengths) > maxEdge) {
      const edge = lengths.indexOf(Math.max(...lengths));
      const first = points[edge],
        second = points[(edge + 1) % 3],
        opposite = points[(edge + 2) % 3];
      const middle = midpoint(first, second);
      emit([first, middle, opposite], depth + 1);
      emit([middle, second, opposite], depth + 1);
      return;
    }
    // Nudge boundary samples inward to choose the same inverse branch as this face.
    const center: Point = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3];
    const vertices: Vertex[] = [];
    for (const p of points) {
      const sample: Point = [p[0] + (center[0] - p[0]) * 1e-6, p[1] + (center[1] - p[1]) * 1e-6];
      const lngLat = projection.invert?.(sample);
      if (!lngLat || !lngLat.every(Number.isFinite)) return;
      const roundTrip = projection(lngLat);
      if (!roundTrip || distance(sample, roundTrip) > 0.01) return;
      vertices.push([p[0], p[1], ...sourceUV(kind, ...lngLat)]);
    }
    // A full-world texture is periodic. Split the local unwrapped triangle at u=0/1
    // and duplicate only the intersecting copy; never interpolate across a texture seam.
    if (kind === 'world') {
      const anchor = vertices[0][2];
      for (const v of vertices) v[2] += Math.round(anchor - v[2]);
    }
    const span = (axis: number) =>
      Math.max(...vertices.map(v => v[axis])) - Math.min(...vertices.map(v => v[axis]));
    // This fixture's opposite longitude cut is far outside its 70° source footprint.
    if (kind === 'rotated' && Math.max(span(2), span(3)) > 2) return;
    if (kind === 'world' && span(2) > 0.5) {
      if (depth < 28) {
        const ab = midpoint(a, b),
          bc = midpoint(b, c),
          ca = midpoint(c, a);
        for (const triangle of [
          [a, ab, ca],
          [ab, b, bc],
          [ca, bc, c],
          [ab, bc, ca]
        ])
          emit(triangle, depth + 1);
      } else {
        // A bounded example cannot interpolate through a singularity. Report the omission.
        unresolvedTriangles++;
      }
      return;
    }
    for (const shift of kind === 'world' ? [-1, 0, 1] : [0]) {
      const clipped = clipToImage(vertices.map(v => [v[0], v[1], v[2] + shift, v[3]]));
      const start = positions.length / 3;
      for (const v of clipped) {
        positions.push(v[0], v[1], 0);
        texCoords.push(v[2], v[3]);
      }
      for (let i = 1; i + 1 < clipped.length; i++) indices.push(start, start + i, start + i + 1);
    }
  }
  for (let i = 0; i < domainIndices.length; i += 3) {
    const triangle = Array.from(
      domainIndices.slice(i, i + 3),
      index => [domain.positions[index * 2], domain.positions[index * 2 + 1]] as Point
    );
    emit(triangle, 0);
  }
  return {
    unresolvedTriangles,
    attributes: {
      positions: {value: new Float32Array(positions), size: 3},
      texCoords: {value: new Float32Array(texCoords), size: 2}
    },
    indices: {value: new Uint32Array(indices), size: 1}
  };
}

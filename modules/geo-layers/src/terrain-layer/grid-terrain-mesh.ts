// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Fixed-resolution grid tesselator for terrain-RGB tiles.
//
// This is a local copy of @loaders.gl/terrain's `makeGridTerrainMesh`, kept
// here while that export ships in a loaders.gl release. Once available, swap
// to `import {makeGridTerrainMesh} from '@loaders.gl/terrain'` and delete this
// file.
//
// Why a grid:
//   - Skips Martini's error-driven CPU refinement (~60× cheaper per tile).
//   - Vertices are emitted in lng/lat/elev, so the same mesh renders on both
//     MapView and GlobeView — switching projection does not invalidate the
//     cache.
//   - Grid rows are uniform in Mercator-y (matches the heightmap pixel layout
//     at any latitude), which eliminates the polar sampling warp seen with
//     lat-uniform tesselation.

import type {MeshAttributes} from '@loaders.gl/schema';

export type ElevationDecoder = {
  rScaler: number;
  gScaler: number;
  bScaler: number;
  offset: number;
};

export type GridMeshOptions = {
  // [west, south, east, north] in degrees (lng/lat). For OSM tiles fed through
  // TerrainLayer on GlobeView, these are tile bounds in degrees.
  bounds: [number, number, number, number];
  elevationDecoder: ElevationDecoder;
  // Vertices per side. 33 → 1089 verts, 2048 tris per tile; a good default.
  gridSize?: number;
  // Meters to drop edge vertices to hide seams between adjacent tiles.
  skirtHeight?: number;
};

export type TerrainImage = {
  data: Uint8Array | Uint8ClampedArray;
  width: number;
  height: number;
};

type BoundingBox = [[number, number, number], [number, number, number]];

const MAX_LATITUDE = 85.051129;
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function latToMercatorY(lat: number): number {
  const clamped = Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, lat));
  const s = Math.sin(clamped * DEG2RAD);
  return 0.5 * Math.log((1 + s) / (1 - s));
}

function mercatorYToLat(y: number): number {
  return (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * RAD2DEG;
}

function sampleElevationBilinear(
  image: TerrainImage,
  u: number,
  v: number,
  decoder: ElevationDecoder
): number {
  const {data, width, height} = image;
  const fx = u * (width - 1);
  const fy = v * (height - 1);
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(x0 + 1, width - 1);
  const y1 = Math.min(y0 + 1, height - 1);
  const dx = fx - x0;
  const dy = fy - y0;

  const decode = (x: number, y: number): number => {
    const i = (y * width + x) * 4;
    return (
      decoder.rScaler * data[i] +
      decoder.gScaler * data[i + 1] +
      decoder.bScaler * data[i + 2] +
      decoder.offset
    );
  };

  const z00 = decode(x0, y0);
  const z10 = decode(x1, y0);
  const z01 = decode(x0, y1);
  const z11 = decode(x1, y1);

  const z0 = z00 * (1 - dx) + z10 * dx;
  const z1 = z01 * (1 - dx) + z11 * dx;
  return z0 * (1 - dy) + z1 * dy;
}

// Output mesh shape mirrors @loaders.gl/terrain's parse-terrain output so the
// same TerrainLayer render path consumes either tesselator's result.
export function makeGridTerrainMesh(
  image: TerrainImage,
  options: GridMeshOptions
): {
  loaderData: {header: Record<string, unknown>};
  header: {vertexCount: number; boundingBox: BoundingBox};
  mode: number;
  indices: {value: Uint32Array; size: 1};
  attributes: MeshAttributes;
} {
  const {bounds, elevationDecoder, gridSize = 33, skirtHeight = 0} = options;
  const [west, south, east, north] = bounds;
  const N = gridSize;

  const mercYNorth = latToMercatorY(north);
  const mercYSouth = latToMercatorY(south);

  // Skirt geometry: drop edge vertices vertically to hide minor elevation
  // disagreement between adjacent tiles. The skirt angle is set by the skirt
  // height divided by the in-tile grid step — a fixed meter-skirt (e.g. 8m)
  // over a 0.6m grid step at z=21 is a near-vertical wall that catches
  // specular light and reads as a visible cliff.
  //
  // Clamp skirt drop to 1% of the grid step so the seam slope is ≤~0.6° at
  // any zoom — imperceptible under lighting while still providing a tiny
  // downstep that hides neighbor-tile seams.
  const metersPerDegree = 111_000;
  const midLatRad = ((north + south) * 0.5) * DEG2RAD;
  const tileMetersX = (east - west) * metersPerDegree * Math.cos(midLatRad);
  const gridStepMeters = tileMetersX / (N - 1);
  const effectiveSkirtHeight = Math.min(skirtHeight, gridStepMeters * 0.01);

  const vertexCount = N * N;
  const positions = new Float32Array(vertexCount * 3);
  const texCoords = new Float32Array(vertexCount * 2);

  let minElev = Infinity;
  let maxElev = -Infinity;

  for (let j = 0; j < N; j++) {
    const v = j / (N - 1);
    // Uniform in Mercator-y so each grid row lines up with heightmap rows.
    // v=0 is top (north), v=1 is bottom (south).
    const mercY = mercYNorth + v * (mercYSouth - mercYNorth);
    const lat = mercatorYToLat(mercY);

    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const lng = west + u * (east - west);

      let elev = sampleElevationBilinear(image, u, v, elevationDecoder);

      // Clamp to Earth's physical elevation range. Terrain-RGB encodes
      // elevation into 24 bits across three 8-bit channels, so one corrupt
      // pixel (PNG decode artifact, overzoom noise, partial load) can decode
      // to millions of meters. One such pixel on a 33×33 grid becomes a
      // vertical spike that glints as a specular star against the directional
      // light. Clamping to [-500, 9000]m covers the full range of real
      // terrain (Dead Sea shore to Everest with headroom) and suppresses
      // these spikes without affecting valid samples.
      if (elev < -500 || elev > 9000 || !Number.isFinite(elev)) {
        elev = Math.max(-500, Math.min(9000, elev || 0));
      }

      const onEdge = i === 0 || j === 0 || i === N - 1 || j === N - 1;
      if (onEdge) {
        elev -= effectiveSkirtHeight;
      }

      const vi = (j * N + i) * 3;
      positions[vi] = lng;
      positions[vi + 1] = lat;
      positions[vi + 2] = elev;

      const ti = (j * N + i) * 2;
      texCoords[ti] = u;
      texCoords[ti + 1] = v;

      if (elev < minElev) minElev = elev;
      if (elev > maxElev) maxElev = elev;
    }
  }

  // Two triangles per quad, (N-1)² quads.
  const quadCount = (N - 1) * (N - 1);
  const indices = new Uint32Array(quadCount * 6);
  let idx = 0;
  for (let j = 0; j < N - 1; j++) {
    for (let i = 0; i < N - 1; i++) {
      const a = j * N + i;
      const b = j * N + (i + 1);
      const c = (j + 1) * N + i;
      const d = (j + 1) * N + (i + 1);
      // Two CCW triangles — winding matches parse-terrain output so
      // SimpleMeshLayer's default front-face culling behaves consistently.
      indices[idx++] = a;
      indices[idx++] = c;
      indices[idx++] = b;
      indices[idx++] = b;
      indices[idx++] = c;
      indices[idx++] = d;
    }
  }

  const boundingBox: BoundingBox = [
    [west, south, minElev],
    [east, north, maxElev]
  ];

  return {
    loaderData: {header: {}},
    header: {vertexCount, boundingBox},
    mode: 4, // TRIANGLES
    indices: {value: indices, size: 1},
    attributes: {
      POSITION: {value: positions, size: 3},
      TEXCOORD_0: {value: texCoords, size: 2}
    }
  };
}

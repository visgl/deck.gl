// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {lerp} from '@math.gl/core';
import {subdivideTriangleMesh} from '@math.gl/polygon';

const DEFAULT_INDICES = new Uint32Array([0, 2, 1, 0, 3, 2]);
const DEFAULT_TEX_COORDS = new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]);

/*
  1 ---- 2
  |      |
  |      |
  0 ---- 3
*/
/* eslint-disable max-statements */
export default function createMesh(
  bounds,
  resolution,
  projection?: {transform: (position: number[]) => number[]; tolerance: number}
) {
  if (projection) return createProjectedMesh(bounds, resolution, projection);
  if (!resolution) {
    return createQuad(bounds);
  }
  const maxXSpan = Math.max(
    Math.abs(bounds[0][0] - bounds[3][0]),
    Math.abs(bounds[1][0] - bounds[2][0])
  );
  const maxYSpan = Math.max(
    Math.abs(bounds[1][1] - bounds[0][1]),
    Math.abs(bounds[2][1] - bounds[3][1])
  );
  const uCount = Math.ceil(maxXSpan / resolution) + 1;
  const vCount = Math.ceil(maxYSpan / resolution) + 1;

  const vertexCount = (uCount - 1) * (vCount - 1) * 6;
  const indices = new Uint32Array(vertexCount);
  const texCoords = new Float32Array(uCount * vCount * 2);
  const positions = new Float64Array(uCount * vCount * 3);

  // Tesselate
  let vertex = 0;
  let index = 0;
  for (let u = 0; u < uCount; u++) {
    const ut = u / (uCount - 1);
    for (let v = 0; v < vCount; v++) {
      const vt = v / (vCount - 1);
      const p = interpolateQuad(bounds, ut, vt);

      positions[vertex * 3 + 0] = p[0];
      positions[vertex * 3 + 1] = p[1];
      positions[vertex * 3 + 2] = p[2] || 0;

      texCoords[vertex * 2 + 0] = ut;
      texCoords[vertex * 2 + 1] = 1 - vt;

      if (u > 0 && v > 0) {
        indices[index++] = vertex - vCount;
        indices[index++] = vertex - vCount - 1;
        indices[index++] = vertex - 1;
        indices[index++] = vertex - vCount;
        indices[index++] = vertex - 1;
        indices[index++] = vertex;
      }

      vertex++;
    }
  }
  return {
    vertexCount,
    positions,
    indices,
    texCoords
  };
}

function createQuad(bounds) {
  const positions = new Float64Array(12);
  // [[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY]]
  for (let i = 0; i < bounds.length; i++) {
    positions[i * 3 + 0] = bounds[i][0];
    positions[i * 3 + 1] = bounds[i][1];
    positions[i * 3 + 2] = bounds[i][2] || 0;
  }

  return {
    vertexCount: 6,
    positions,
    indices: DEFAULT_INDICES,
    texCoords: DEFAULT_TEX_COORDS
  };
}

function interpolateQuad(quad, ut, vt) {
  return lerp(lerp(quad[0], quad[1], vt), lerp(quad[3], quad[2], vt), ut);
}

/** Refine in UV space so arbitrary quads retain their bilinear position mapping. */
function createProjectedMesh(
  bounds,
  resolution,
  {transform, tolerance}: {transform: (position: number[]) => number[]; tolerance: number}
) {
  const seed = createMesh(bounds, resolution);
  const uv = Float64Array.from(seed.texCoords);
  for (let i = 1; i < uv.length; i += 2) uv[i] = 1 - uv[i];
  const refined = subdivideTriangleMesh(
    {positions: uv, indices: seed.indices},
    {
      size: 2,
      targetSize: 3,
      tolerance,
      transform: position => {
        const point = interpolateQuad(bounds, position[0], position[1]);
        return transform([point[0], point[1], point[2] ?? 0]);
      }
    }
  );
  const vertexCount = refined.sourcePositions.length / 2;
  const positions = new Float64Array(vertexCount * 3);
  const texCoords = new Float32Array(vertexCount * 2);
  for (let i = 0; i < vertexCount; i++) {
    const u = refined.sourcePositions[i * 2];
    const v = refined.sourcePositions[i * 2 + 1];
    const point = interpolateQuad(bounds, u, v);
    positions.set([point[0], point[1], point[2] ?? 0], i * 3);
    texCoords.set([u, 1 - v], i * 2);
  }
  return {
    vertexCount: refined.indices.length,
    positions,
    projectedPositions: refined.positions,
    indices: refined.indices,
    texCoords
  };
}

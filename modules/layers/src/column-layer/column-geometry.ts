// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {log, BinaryAttribute} from '@deck.gl/core';
import {Geometry} from '@luma.gl/engine';

import {modifyPolygonWindingDirection, WINDING} from '@math.gl/polygon';

type ColumnGeometryProps = {
  id?: string;
  radius: number;
  height?: number;
  nradial?: number;
  vertices?: number[];
  cap?: 'flat' | 'dome' | 'cone';
};

export default class ColumnGeometry extends Geometry {
  constructor(props: ColumnGeometryProps) {
    const {indices, attributes} = tesselateColumn(props);
    super({
      ...props,
      indices,
      // @ts-expect-error
      attributes
    });
  }
}

/* eslint-disable max-statements, complexity */
function tesselateColumn(props: ColumnGeometryProps): {
  indices: Uint16Array;
  attributes: Record<string, BinaryAttribute>;
} {
  const {radius, height = 1, nradial = 10, cap = 'flat'} = props;
  let {vertices} = props;

  if (vertices) {
    log.assert(vertices.length >= nradial); // `vertices` must contain at least `diskResolution` points
    vertices = vertices.flatMap(v => [v[0], v[1]]);
    modifyPolygonWindingDirection(vertices, WINDING.COUNTER_CLOCKWISE);
  }

  const isExtruded = height > 0;
  const vertsAroundEdge = nradial + 1; // loop
  const useCap = isExtruded && cap !== 'flat';
  // dome uses diskResolution/4 rings (min 2); cone uses 1 ring
  const capSegs = useCap ? (cap === 'cone' ? 1 : Math.max(2, Math.round(nradial / 4))) : 0;

  const numVertices = isExtruded
    ? useCap
      ? // sides (vertsAroundEdge*2 + 1 degenerate) + bridge (1) + capSegs ring strips (2*vertsAroundEdge each) + (capSegs-1) degenerates
        vertsAroundEdge * 2 * (1 + capSegs) + capSegs + 1
      : vertsAroundEdge * 3 + 1 // top, side top edge, side bottom edge, one additional degenerate vertex
    : nradial; // top only (flat, not extruded)

  const stepAngle = (Math.PI * 2) / nradial;

  // Used for wireframe
  const indices = new Uint16Array(isExtruded ? nradial * 3 * 2 : 0); // top loop, side vertical, bottom loop

  const positions = new Float32Array(numVertices * 3);
  const normals = new Float32Array(numVertices * 3);

  let i = 0;

  // side tesselation: 0, 1, 2, 3, 4, 5, ...
  //
  // 0 - 2 - 4  ... top
  // | / | / |
  // 1 - 3 - 5  ... bottom
  //
  if (isExtruded) {
    for (let j = 0; j < vertsAroundEdge; j++) {
      const a = j * stepAngle;
      const vertexIndex = j % nradial;
      const sin = Math.sin(a);
      const cos = Math.cos(a);

      for (let k = 0; k < 2; k++) {
        positions[i + 0] = vertices ? vertices[vertexIndex * 2] : cos * radius;
        positions[i + 1] = vertices ? vertices[vertexIndex * 2 + 1] : sin * radius;
        positions[i + 2] = (1 / 2 - k) * height;

        normals[i + 0] = vertices ? vertices[vertexIndex * 2] : cos;
        normals[i + 1] = vertices ? vertices[vertexIndex * 2 + 1] : sin;

        i += 3;
      }
    }

    // duplicate the last vertex to create proper degenerate triangle.
    positions[i + 0] = positions[i - 3];
    positions[i + 1] = positions[i - 2];
    positions[i + 2] = positions[i - 1];
    i += 3;
  }

  if (useCap) {
    // Cap ring strips: rings sweep from the column's top edge (theta=0) up to the apex (theta=PI/2).
    // Each ring pair (s, s+1) is interleaved as a triangle strip: ring_s[0], ring_{s+1}[0], ring_s[1], ...
    // At the apex (s=capSegs), all ring vertices share the same point, producing valid cone-like triangles
    // with degenerate fillers between them.

    // Bridge vertex: one extra copy of ring0[0] to create a clean degenerate transition from the side strip.
    const vx0 = vertices ? vertices[0] : radius;
    const vy0 = vertices ? vertices[1] : 0;
    const vLen0 = vertices ? Math.sqrt(vx0 * vx0 + vy0 * vy0) : radius;
    positions[i + 0] = vx0;
    positions[i + 1] = vy0;
    positions[i + 2] = height / 2;
    normals[i + 0] = vLen0 > 0 ? vx0 / vLen0 : 0;
    normals[i + 1] = vLen0 > 0 ? vy0 / vLen0 : 0;
    // normals[i + 2] = 0 (Float32Array default)
    i += 3;

    for (let s = 0; s < capSegs; s++) {
      const theta0 = (s / capSegs) * (Math.PI / 2);
      const theta1 = ((s + 1) / capSegs) * (Math.PI / 2);
      const r0 = radius * Math.cos(theta0);
      const z0 = height / 2 + radius * Math.sin(theta0);
      const r1 = radius * Math.cos(theta1);
      const z1 = height / 2 + radius * Math.sin(theta1);
      const nz0 = Math.sin(theta0);
      const nScale0 = Math.cos(theta0);
      const nz1 = Math.sin(theta1);
      const nScale1 = Math.cos(theta1);

      for (let j = 0; j <= nradial; j++) {
        const a = j * stepAngle;
        const vertexIndex = j % nradial;
        const sinA = Math.sin(a);
        const cosA = Math.cos(a);

        const vx = vertices ? vertices[vertexIndex * 2] : cosA * radius;
        const vy = vertices ? vertices[vertexIndex * 2 + 1] : sinA * radius;
        const vLen = vertices ? Math.sqrt(vx * vx + vy * vy) : radius;
        const invLen = vLen > 0 ? 1 / vLen : 0;

        // ring_s vertex
        positions[i + 0] = vx * (r0 / radius);
        positions[i + 1] = vy * (r0 / radius);
        positions[i + 2] = z0;
        normals[i + 0] = vx * invLen * nScale0;
        normals[i + 1] = vy * invLen * nScale0;
        normals[i + 2] = nz0;
        i += 3;

        // ring_{s+1} vertex
        positions[i + 0] = vx * (r1 / radius);
        positions[i + 1] = vy * (r1 / radius);
        positions[i + 2] = z1;
        normals[i + 0] = vx * invLen * nScale1;
        normals[i + 1] = vy * invLen * nScale1;
        normals[i + 2] = nz1;
        i += 3;
      }

      // Degenerate between ring strips (duplicate last vertex of this strip to bridge to next)
      if (s < capSegs - 1) {
        positions[i + 0] = positions[i - 3];
        positions[i + 1] = positions[i - 2];
        positions[i + 2] = positions[i - 1];
        normals[i + 0] = normals[i - 3];
        normals[i + 1] = normals[i - 2];
        normals[i + 2] = normals[i - 1];
        i += 3;
      }
    }
  } else {
    // The column geometry is rendered as a triangle strip, so
    // in order to render sides and top in one go we need to use degenerate triangles.
    // Duplicate last vertex of side triangles and first vertex of the top cap to preserve winding order.

    // top tesselation: 0, -1, 1, -2, 2, -3, 3, ...
    //
    //    0 -- 1
    //   /      \
    // -1        2
    //  |        |
    // -2        3
    //   \      /
    //   -3 -- 4
    //
    for (let j = isExtruded ? 0 : 1; j < vertsAroundEdge; j++) {
      const v = Math.floor(j / 2) * Math.sign(0.5 - (j % 2));
      const a = v * stepAngle;
      const vertexIndex = (v + nradial) % nradial;
      const sin = Math.sin(a);
      const cos = Math.cos(a);

      positions[i + 0] = vertices ? vertices[vertexIndex * 2] : cos * radius;
      positions[i + 1] = vertices ? vertices[vertexIndex * 2 + 1] : sin * radius;
      positions[i + 2] = height / 2;

      normals[i + 2] = 1;

      i += 3;
    }
  }

  if (isExtruded) {
    let index = 0;
    for (let j = 0; j < nradial; j++) {
      // top loop
      indices[index++] = j * 2 + 0;
      indices[index++] = j * 2 + 2;
      // side vertical
      indices[index++] = j * 2 + 0;
      indices[index++] = j * 2 + 1;
      // bottom loop
      indices[index++] = j * 2 + 1;
      indices[index++] = j * 2 + 3;
    }
  }

  return {
    indices,
    attributes: {
      POSITION: {size: 3, value: positions},
      NORMAL: {size: 3, value: normals}
    }
  };
}

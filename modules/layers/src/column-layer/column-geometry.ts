// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {log} from '@deck.gl/core';
import {Geometry, type GeometryAttribute} from '@luma.gl/engine';

import {modifyPolygonWindingDirection} from '@math.gl/geometry/polygon';

type ColumnGeometryProps = {
  id?: string;
  radius: number;
  height?: number;
  nradial?: number;
  vertices?: number[];
  cap?: 'flat' | 'dome' | 'cone';
};

type ColumnGeometryAttributes = {
  POSITION: GeometryAttribute;
  NORMAL: GeometryAttribute;
};

export default class ColumnGeometry extends Geometry {
  readonly attributes!: ColumnGeometryAttributes;

  constructor(props: ColumnGeometryProps) {
    const {indices, attributes} = tesselateColumn(props);
    super({
      ...props,
      topology: 'line-list',
      indices,
      attributes
    });
  }
}

/* eslint-disable max-statements, complexity */
function tesselateColumn(props: ColumnGeometryProps): {
  indices: Uint16Array;
  attributes: ColumnGeometryAttributes;
} {
  const {radius, height = 1, nradial = 10, cap = 'flat'} = props;
  let {vertices} = props;

  if (vertices) {
    log.assert(vertices.length >= nradial); // `vertices` must contain at least `diskResolution` points
    vertices = vertices.flatMap(v => [v[0], v[1]]);
    modifyPolygonWindingDirection(vertices, 'counter-clockwise');
  }

  const isExtruded = height > 0;
  const vertsAroundEdge = nradial + 1; // loop
  const useCap = isExtruded && cap !== 'flat';
  // dome uses diskResolution/4 rings (min 2); cone uses 1 ring
  const capSegs = useCap ? (cap === 'cone' ? 1 : Math.max(2, Math.round(nradial / 4))) : 0;

  const numVertices = isExtruded
    ? useCap
      ? // sides (vertsAroundEdge*2 + 1 degenerate) + bridge (1) + capSegs ring strips (2*vertsAroundEdge each) + 2 degenerates per strip join
        vertsAroundEdge * 2 * (1 + capSegs) + capSegs * 2
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
    // cap profile: ring s is at theta = (s / capSegs) * PI / 2, from the top edge of the
    // sides (theta = 0) to the apex (theta = PI / 2). It has radius `radius * cos(theta)`
    // and sits `radius * sin(theta)` above the sides.
    //
    //   dome (capSegs = 2)              cone (capSegs = 1)
    //
    //           2 *                           * 1
    //       1 *-'   '-* 1                   /   \
    //        /         \                  /       \
    //     0 *           * 0           0 *           * 0
    //       |   side    |               |   side    |
    //
    // cap tesselation: like the sides, each pair of rings (s + 1, s) is a strip 0, 1, 2, 3, 4, 5, ...
    //
    // 0 - 2 - 4  ... ring s + 1
    // | / | / |
    // 1 - 3 - 5  ... ring s
    //
    // The apex ring has radius 0, so the last strip collapses into a fan around the apex.
    // A bridge vertex joins the cap to the sides, and copies of the last and first vertices
    // join consecutive strips, all through degenerate triangles. Every strip then starts on
    // an even vertex, so its triangles keep the outward winding of the sides.
    const setCapVertex = (ring: number, j: number) => {
      const theta = (ring / capSegs) * (Math.PI / 2);
      const a = j * stepAngle;
      const vertexIndex = j % nradial;
      const vx = vertices ? vertices[vertexIndex * 2] : Math.cos(a) * radius;
      const vy = vertices ? vertices[vertexIndex * 2 + 1] : Math.sin(a) * radius;
      const vLen = vertices ? Math.sqrt(vx * vx + vy * vy) : radius;
      const invLen = vLen > 0 ? 1 / vLen : 0;
      // Dome normals follow the sphere; a cone's are constant along its straight sides.
      const normalAngle = cap === 'cone' ? Math.atan2(vLen, radius) : theta;

      positions[i + 0] = vx * Math.cos(theta);
      positions[i + 1] = vy * Math.cos(theta);
      positions[i + 2] = height / 2 + radius * Math.sin(theta);
      normals[i + 0] = vx * invLen * Math.cos(normalAngle);
      normals[i + 1] = vy * invLen * Math.cos(normalAngle);
      normals[i + 2] = Math.sin(normalAngle);
      i += 3;
    };

    // Bridge vertex: a copy of the first cap vertex
    setCapVertex(1, 0);
    for (let s = 0; s < capSegs; s++) {
      if (s > 0) {
        // Degenerate join: copies of the last vertex of the previous strip and the first of this one
        setCapVertex(s - 1, nradial);
        setCapVertex(s + 1, 0);
      }
      for (let j = 0; j <= nradial; j++) {
        setCapVertex(s + 1, j);
        setCapVertex(s, j);
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

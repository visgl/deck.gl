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
  capShape?: 'flat' | 'rounded' | 'pointy';
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
  const {radius, height = 1, nradial = 10, capShape = 'flat'} = props;
  let {vertices} = props;

  if (vertices) {
    log.assert(vertices.length >= nradial); // `vertices` must contain at least `diskResolution` points
    vertices = vertices.flatMap(v => [v[0], v[1]]);
    modifyPolygonWindingDirection(vertices, WINDING.COUNTER_CLOCKWISE);
  }

  const isExtruded = height > 0;
  const vertsAroundEdge = nradial + 1; // loop
  
  // Calculate number of vertices based on cap shape
  let numVertices: number;
  let topCapVertices = 0;
  
  if (!isExtruded) {
    numVertices = nradial; // flat disk
  } else if (capShape === 'pointy') {
    // sides + 1 center point for cone
    numVertices = vertsAroundEdge * 2 + 1 + 1; // sides + degenerate + center point
    topCapVertices = 1; // just the center point
  } else if (capShape === 'rounded') {
    // sides + dome vertices
    // Use a hemisphere approximation with additional latitude rings
    const domeLevels = Math.max(3, Math.floor(nradial / 4)); // number of latitude rings for dome
    numVertices = vertsAroundEdge * 2 + 1 + (domeLevels * nradial + 1); // sides + degenerate + dome
    topCapVertices = domeLevels * nradial + 1;
  } else {
    // flat top (original behavior)
    numVertices = vertsAroundEdge * 3 + 1; // top, side top edge, side bottom edge, one additional degenerate vertex
    topCapVertices = vertsAroundEdge;
  }

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

  // Generate top cap based on capShape
  if (isExtruded && capShape === 'pointy') {
    // Add a center point at the top
    positions[i + 0] = 0;
    positions[i + 1] = 0;
    positions[i + 2] = height / 2;
    normals[i + 0] = 0;
    normals[i + 1] = 0;
    normals[i + 2] = 1;
    i += 3;
  } else if (isExtruded && capShape === 'rounded') {
    // Generate dome using latitude rings
    const domeLevels = Math.max(3, Math.floor(nradial / 4));
    
    // Generate dome vertices from bottom to top
    for (let level = 0; level < domeLevels; level++) {
      const phi = (Math.PI / 2) * (level + 1) / domeLevels; // angle from equator
      const levelRadius = Math.cos(phi) * radius;
      const levelHeight = Math.sin(phi) * (height / 2);
      
      for (let j = 0; j < nradial; j++) {
        const theta = j * stepAngle;
        const sin = Math.sin(theta);
        const cos = Math.cos(theta);
        
        positions[i + 0] = cos * levelRadius;
        positions[i + 1] = sin * levelRadius;
        positions[i + 2] = height / 2 + levelHeight;
        
        // Normal points outward on the sphere
        normals[i + 0] = cos * Math.cos(phi);
        normals[i + 1] = sin * Math.cos(phi);
        normals[i + 2] = Math.sin(phi);
        
        i += 3;
      }
    }
    
    // Add top center point
    positions[i + 0] = 0;
    positions[i + 1] = 0;
    positions[i + 2] = height / 2 + radius;
    normals[i + 0] = 0;
    normals[i + 1] = 0;
    normals[i + 2] = 1;
    i += 3;
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

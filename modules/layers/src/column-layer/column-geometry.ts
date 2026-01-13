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

  if (!isExtruded) {
    numVertices = nradial; // flat disk
  } else if (capShape === 'pointy') {
    // Cone cap: alternating pattern of edge vertex and apex vertex in triangle strip
    // For each edge around the top (nradial+1 to close the loop): edge vertex + apex vertex
    // +1 for transition degenerate vertex
    numVertices = vertsAroundEdge * 2 + 1 + 1 + vertsAroundEdge * 2; // sides + degenerate + transition + cone vertices
  } else if (capShape === 'rounded') {
    // Dome cap: multiple latitude rings from base to top, rendered as triangle strips
    // Each level needs 2 vertices per position (current ring + next ring) for triangle strip
    // Use ~25% of nradial as number of latitude rings for good balance of quality/performance
    const domeLevels = Math.max(3, Math.floor(nradial / 4)); // number of latitude rings for dome
    // Each level needs vertsAroundEdge * 2 vertices for triangle strip
    // +1 for transition degenerate vertex
    numVertices = vertsAroundEdge * 2 + 1 + 1 + (domeLevels * vertsAroundEdge * 2 + 1); // sides + degenerate + transition + dome + apex
  } else {
    // flat top (original behavior)
    numVertices = vertsAroundEdge * 3 + 1; // top, side top edge, side bottom edge, one additional degenerate vertex
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
    // Create cone using triangle strip: edge, apex, edge, apex, ...
    const apexHeight = height / 2 + radius; // Cone extends radius distance above cylinder top
    const apex = [0, 0, apexHeight];

    // Calculate cone normal (points outward and upward at angle determined by geometry)
    // Using right triangle: base = radius, height = radius, hypotenuse = slant
    const slantHeight = Math.sqrt(radius * radius + radius * radius);

    // Add first vertex of cone cap as degenerate to transition from sides
    const firstVertexIndex = 0;
    const firstSin = Math.sin(0);
    const firstCos = Math.cos(0);
    positions[i + 0] = vertices ? vertices[firstVertexIndex * 2] : firstCos * radius;
    positions[i + 1] = vertices ? vertices[firstVertexIndex * 2 + 1] : firstSin * radius;
    positions[i + 2] = height / 2;
    if (vertices) {
      const vertexDist = Math.sqrt(
        vertices[firstVertexIndex * 2] * vertices[firstVertexIndex * 2] +
          vertices[firstVertexIndex * 2 + 1] * vertices[firstVertexIndex * 2 + 1]
      );
      const customSlantHeight = Math.sqrt(vertexDist * vertexDist + radius * radius);
      normals[i + 0] = (vertices[firstVertexIndex * 2] * vertexDist) / customSlantHeight;
      normals[i + 1] = (vertices[firstVertexIndex * 2 + 1] * vertexDist) / customSlantHeight;
      normals[i + 2] = radius / customSlantHeight;
    } else {
      normals[i + 0] = (firstCos * radius) / slantHeight;
      normals[i + 1] = (firstSin * radius) / slantHeight;
      normals[i + 2] = radius / slantHeight;
    }
    i += 3;

    for (let j = 0; j < vertsAroundEdge; j++) {
      const a = j * stepAngle;
      const vertexIndex = j % nradial;
      const sin = Math.sin(a);
      const cos = Math.cos(a);

      // Edge vertex
      positions[i + 0] = vertices ? vertices[vertexIndex * 2] : cos * radius;
      positions[i + 1] = vertices ? vertices[vertexIndex * 2 + 1] : sin * radius;
      positions[i + 2] = height / 2;

      // Normal for cone: outward component proportional to radius, upward component proportional to radius
      // For custom vertices, normalize the vertex position itself; for circular, use cos/sin
      if (vertices) {
        const vertexDist = Math.sqrt(
          vertices[vertexIndex * 2] * vertices[vertexIndex * 2] +
            vertices[vertexIndex * 2 + 1] * vertices[vertexIndex * 2 + 1]
        );
        const customSlantHeight = Math.sqrt(vertexDist * vertexDist + radius * radius);
        normals[i + 0] = (vertices[vertexIndex * 2] * vertexDist) / customSlantHeight;
        normals[i + 1] = (vertices[vertexIndex * 2 + 1] * vertexDist) / customSlantHeight;
        normals[i + 2] = radius / customSlantHeight;
      } else {
        normals[i + 0] = (cos * radius) / slantHeight;
        normals[i + 1] = (sin * radius) / slantHeight;
        normals[i + 2] = radius / slantHeight;
      }

      i += 3;

      // Apex vertex
      positions[i + 0] = apex[0];
      positions[i + 1] = apex[1];
      positions[i + 2] = apex[2];

      // Apex uses same normal as the edge vertex it's paired with
      if (vertices) {
        const vertexDist = Math.sqrt(
          vertices[vertexIndex * 2] * vertices[vertexIndex * 2] +
            vertices[vertexIndex * 2 + 1] * vertices[vertexIndex * 2 + 1]
        );
        const customSlantHeight = Math.sqrt(vertexDist * vertexDist + radius * radius);
        normals[i + 0] = (vertices[vertexIndex * 2] * vertexDist) / customSlantHeight;
        normals[i + 1] = (vertices[vertexIndex * 2 + 1] * vertexDist) / customSlantHeight;
        normals[i + 2] = radius / customSlantHeight;
      } else {
        normals[i + 0] = (cos * radius) / slantHeight;
        normals[i + 1] = (sin * radius) / slantHeight;
        normals[i + 2] = radius / slantHeight;
      }

      i += 3;
    }
  } else if (isExtruded && capShape === 'rounded') {
    // Generate dome using triangle strips between latitude rings
    const domeLevels = Math.max(3, Math.floor(nradial / 4));

    // Add first vertex of dome as degenerate to transition from sides
    const firstTheta = 0;
    const firstSin = Math.sin(firstTheta);
    const firstCos = Math.cos(firstTheta);
    const firstPhi = 0;
    const firstR = Math.cos(firstPhi) * radius;
    const firstZ = height / 2 + Math.sin(firstPhi) * radius;
    positions[i + 0] = firstCos * firstR;
    positions[i + 1] = firstSin * firstR;
    positions[i + 2] = firstZ;
    normals[i + 0] = firstCos * Math.cos(firstPhi);
    normals[i + 1] = firstSin * Math.cos(firstPhi);
    normals[i + 2] = Math.sin(firstPhi);
    i += 3;

    // Start from the base (top edge of cylinder)
    for (let level = 0; level < domeLevels; level++) {
      const phi1 = ((Math.PI / 2) * level) / domeLevels; // current latitude
      const phi2 = ((Math.PI / 2) * (level + 1)) / domeLevels; // next latitude

      const r1 = Math.cos(phi1) * radius;
      const z1 = height / 2 + Math.sin(phi1) * radius;
      const r2 = Math.cos(phi2) * radius;
      const z2 = height / 2 + Math.sin(phi2) * radius;

      for (let j = 0; j < vertsAroundEdge; j++) {
        const theta = (j % nradial) * stepAngle;
        const sin = Math.sin(theta);
        const cos = Math.cos(theta);

        // Lower ring vertex
        positions[i + 0] = cos * r1;
        positions[i + 1] = sin * r1;
        positions[i + 2] = z1;
        normals[i + 0] = cos * Math.cos(phi1);
        normals[i + 1] = sin * Math.cos(phi1);
        normals[i + 2] = Math.sin(phi1);
        i += 3;

        // Upper ring vertex
        positions[i + 0] = cos * r2;
        positions[i + 1] = sin * r2;
        positions[i + 2] = z2;
        normals[i + 0] = cos * Math.cos(phi2);
        normals[i + 1] = sin * Math.cos(phi2);
        normals[i + 2] = Math.sin(phi2);
        i += 3;
      }
    }

    // Add final apex point (degenerate to close the dome)
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

      normals[i + 0] = 0;
      normals[i + 1] = 0;
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

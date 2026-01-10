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
  bevelSegments?: number;
  bevelHeight?: number;
  smoothNormals?: boolean;
};

export default class ColumnGeometry extends Geometry {
  constructor(props: ColumnGeometryProps) {
    const {indices, attributes} = tesselateColumn(props);
    super({
      ...props,
      indices,
      // @ts-expect-error - BinaryAttribute type is compatible at runtime
      attributes
    });
  }
}

/* eslint-disable max-statements, complexity */
function tesselateColumn(props: ColumnGeometryProps): {
  indices: Uint16Array;
  attributes: Record<string, BinaryAttribute>;
} {
  const {
    radius,
    height = 1,
    nradial = 10,
    bevelSegments = 0,
    bevelHeight = 1,
    smoothNormals = false
  } = props;
  let {vertices} = props;

  if (vertices) {
    log.assert(vertices.length >= nradial); // `vertices` must contain at least `diskResolution` points
    vertices = vertices.flatMap(v => [v[0], v[1]]);
    modifyPolygonWindingDirection(vertices, WINDING.COUNTER_CLOCKWISE);
  }

  const isExtruded = height > 0;
  const vertsAroundEdge = nradial + 1; // loop

  // Calculate bevel depth - how much the cylinder sides are shortened
  // The bevel bulges outward from this point up to the full height
  const bevelDepth = bevelSegments >= 2 ? bevelHeight * radius : 0;

  // Calculate number of vertices based on bevel configuration
  let numVertices: number;

  if (!isExtruded) {
    numVertices = nradial; // flat disk
  } else if (bevelSegments >= 2) {
    // Bevel cap: rings from outer edge (bottom of bevel) to apex (top)
    // Each level (except last) creates 2 vertices per position for triangle strip
    // Number of levels = bevelSegments - 1 (transitions between rings)
    const bevelLevels = bevelSegments - 1;
    numVertices = vertsAroundEdge * 2 + 1 + 1 + bevelLevels * vertsAroundEdge * 2 + 1;
    // sides + degenerate + transition + bevel rings + apex
  } else {
    // flat top (bevelSegments = 0)
    numVertices = vertsAroundEdge * 3 + 1; // top, side top edge, side bottom edge, one additional degenerate vertex
  }

  const stepAngle = (Math.PI * 2) / nradial;

  // Used for wireframe
  // Cylinder: top loop + side vertical + bottom loop = nradial * 3 * 2
  // Bevel: for each level, horizontal ring (nradial*2) + radial lines (nradial*2), plus final lines to apex (nradial*2)
  const bevelLevels = bevelSegments >= 2 ? bevelSegments - 1 : 0;
  const bevelWireframeCount = bevelLevels > 0 ? bevelLevels * nradial * 4 + nradial * 2 : 0;
  const indices = new Uint16Array(isExtruded ? nradial * 3 * 2 + bevelWireframeCount : 0);

  const positions = new Float32Array(numVertices * 3);
  const normals = new Float32Array(numVertices * 3);

  let i = 0;

  // The top of the cylinder sides - shortened when bevel is present
  const sidesTopZ = height / 2 - bevelDepth;

  // side tesselation: 0, 1, 2, 3, 4, 5, ...
  //
  // 0 - 2 - 4  ... top (shortened if bevel)
  // | / | / |
  // 1 - 3 - 5  ... bottom
  //
  if (isExtruded) {
    for (let j = 0; j < vertsAroundEdge; j++) {
      const a = j * stepAngle;
      const vertexIndex = j % nradial;
      const sin = Math.sin(a);
      const cos = Math.cos(a);

      // Top vertex of side (at sidesTopZ, shortened for bevel)
      positions[i + 0] = vertices ? vertices[vertexIndex * 2] : cos * radius;
      positions[i + 1] = vertices ? vertices[vertexIndex * 2 + 1] : sin * radius;
      positions[i + 2] = sidesTopZ;
      normals[i + 0] = vertices ? vertices[vertexIndex * 2] : cos;
      normals[i + 1] = vertices ? vertices[vertexIndex * 2 + 1] : sin;
      normals[i + 2] = 0;
      i += 3;

      // Bottom vertex of side
      positions[i + 0] = vertices ? vertices[vertexIndex * 2] : cos * radius;
      positions[i + 1] = vertices ? vertices[vertexIndex * 2 + 1] : sin * radius;
      positions[i + 2] = -height / 2;
      normals[i + 0] = vertices ? vertices[vertexIndex * 2] : cos;
      normals[i + 1] = vertices ? vertices[vertexIndex * 2 + 1] : sin;
      normals[i + 2] = 0;
      i += 3;
    }

    // duplicate the last vertex to create proper degenerate triangle.
    positions[i + 0] = positions[i - 3];
    positions[i + 1] = positions[i - 2];
    positions[i + 2] = positions[i - 1];
    normals[i + 0] = normals[i - 3];
    normals[i + 1] = normals[i - 2];
    normals[i + 2] = normals[i - 1];
    i += 3;
  }

  // Generate top cap based on bevel configuration
  if (isExtruded && bevelSegments >= 2) {
    // Generate convex bevel cap - bulges OUTWARD from sidesTopZ up to height/2
    // The bevel base is at sidesTopZ (full radius), apex at height/2 (center)

    // Add first vertex of bevel as degenerate to transition from sides
    const firstTheta = 0;
    const firstCos = Math.cos(firstTheta);
    const firstSin = Math.sin(firstTheta);

    if (vertices) {
      positions[i + 0] = vertices[0];
      positions[i + 1] = vertices[1];
    } else {
      positions[i + 0] = firstCos * radius;
      positions[i + 1] = firstSin * radius;
    }
    positions[i + 2] = sidesTopZ;

    if (smoothNormals) {
      // At base of bevel (phi=0), normal points outward horizontally
      normals[i + 0] = firstCos;
      normals[i + 1] = firstSin;
      normals[i + 2] = 0;
    } else {
      // Planar normal for first face
      const nextPhi = (1 / (bevelSegments - 1)) * (Math.PI / 2);
      const r2 = Math.cos(nextPhi) * radius;
      const z2 = sidesTopZ + Math.sin(nextPhi) * bevelDepth;
      const dr = r2 - radius;
      const dz = z2 - sidesTopZ;
      const len = Math.sqrt(dz * dz + dr * dr);
      normals[i + 0] = (firstCos * dz) / len;
      normals[i + 1] = (firstSin * dz) / len;
      normals[i + 2] = -dr / len;
    }
    i += 3;

    // Generate bevel rings from base (full radius at sidesTopZ) to apex (center at height/2)
    for (let level = 0; level < bevelSegments - 1; level++) {
      const t1 = level / (bevelSegments - 1);
      const t2 = (level + 1) / (bevelSegments - 1);

      // phi goes from 0 (base) to PI/2 (apex)
      const phi1 = t1 * (Math.PI / 2);
      const phi2 = t2 * (Math.PI / 2);

      // Radius shrinks from full to 0 as we go up
      const r1 = Math.cos(phi1) * radius;
      const r2 = Math.cos(phi2) * radius;

      // Z goes UP from sidesTopZ to height/2
      const z1 = sidesTopZ + Math.sin(phi1) * bevelDepth;
      const z2 = sidesTopZ + Math.sin(phi2) * bevelDepth;

      // Pre-calculate planar normal for this face if needed
      let planarNormalXY: number = 0;
      let planarNormalZ: number = 0;
      if (!smoothNormals) {
        const dr = r2 - r1;
        const dz = z2 - z1;
        const len = Math.sqrt(dz * dz + dr * dr);
        // Normal points outward and up, perpendicular to the face
        planarNormalXY = dz / len;
        planarNormalZ = -dr / len;
      }

      for (let j = 0; j < vertsAroundEdge; j++) {
        const theta = (j % nradial) * stepAngle;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        const vertexIndex = j % nradial;

        // Lower ring vertex (outer)
        if (vertices) {
          const scale1 = r1 / radius;
          positions[i + 0] = vertices[vertexIndex * 2] * scale1;
          positions[i + 1] = vertices[vertexIndex * 2 + 1] * scale1;
        } else {
          positions[i + 0] = cosTheta * r1;
          positions[i + 1] = sinTheta * r1;
        }
        positions[i + 2] = z1;

        if (smoothNormals) {
          // Spherical normal - points outward along curved surface
          normals[i + 0] = cosTheta * Math.cos(phi1);
          normals[i + 1] = sinTheta * Math.cos(phi1);
          normals[i + 2] = Math.sin(phi1);
        } else {
          normals[i + 0] = cosTheta * planarNormalXY;
          normals[i + 1] = sinTheta * planarNormalXY;
          normals[i + 2] = planarNormalZ;
        }
        i += 3;

        // Upper ring vertex (inner, closer to apex)
        if (vertices) {
          const scale2 = r2 / radius;
          positions[i + 0] = vertices[vertexIndex * 2] * scale2;
          positions[i + 1] = vertices[vertexIndex * 2 + 1] * scale2;
        } else {
          positions[i + 0] = cosTheta * r2;
          positions[i + 1] = sinTheta * r2;
        }
        positions[i + 2] = z2;

        if (smoothNormals) {
          normals[i + 0] = cosTheta * Math.cos(phi2);
          normals[i + 1] = sinTheta * Math.cos(phi2);
          normals[i + 2] = Math.sin(phi2);
        } else {
          normals[i + 0] = cosTheta * planarNormalXY;
          normals[i + 1] = sinTheta * planarNormalXY;
          normals[i + 2] = planarNormalZ;
        }
        i += 3;
      }
    }

    // Add final apex point at the top center
    positions[i + 0] = 0;
    positions[i + 1] = 0;
    positions[i + 2] = height / 2; // Apex at full height
    normals[i + 0] = 0;
    normals[i + 1] = 0;
    normals[i + 2] = 1;
    i += 3;
  } else {
    // Flat cap (bevelSegments = 0)
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

    // Bevel wireframe
    if (bevelSegments >= 2) {
      // Bevel vertices start after: sides (vertsAroundEdge * 2) + degenerate (1) + degenerate (1)
      const bevelStart = vertsAroundEdge * 2 + 2;

      // For each bevel level, we have vertsAroundEdge * 2 vertices (lower and upper ring interleaved)
      for (let level = 0; level < bevelSegments - 1; level++) {
        const levelStart = bevelStart + level * vertsAroundEdge * 2;

        for (let j = 0; j < nradial; j++) {
          // Horizontal ring at lower edge of this level
          const curr = levelStart + j * 2;
          const next = levelStart + ((j + 1) % nradial) * 2;
          indices[index++] = curr;
          indices[index++] = next;

          // Radial line from lower to upper (toward apex)
          indices[index++] = curr;
          indices[index++] = curr + 1;
        }
      }

      // Final ring at apex - connect last ring's lower vertices to apex point
      // (Upper vertices of last level are at radius=0, same as apex)
      const lastLevelStart = bevelStart + (bevelSegments - 2) * vertsAroundEdge * 2;
      const apexIndex = bevelStart + (bevelSegments - 1) * vertsAroundEdge * 2;
      for (let j = 0; j < nradial; j++) {
        // Lines from last ring's lower vertices to apex
        indices[index++] = lastLevelStart + j * 2; // lower vertex of last level
        indices[index++] = apexIndex;
      }
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

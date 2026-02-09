// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Dome-enabled column geometry attributes for ColumnShapeExtension.
 *
 * Generates triangle-strip vertex data with:
 * - Cylinder sides: z from -1 to sidesTopZ (= 0 for bevelHeight=1, height=2)
 * - Bevel rings: concentric ring pairs using spherical coords
 * - Apex vertex at (0, 0, 1)
 * - Smooth dome normals
 *
 * Returns raw Float32Arrays - the caller wraps them in a Geometry instance
 * obtained from the original ColumnLayer.getGeometry.
 */

export type DomeColumnGeometryProps = {
  radius?: number;
  height?: number;
  nradial?: number;
  bevelSegments?: number;
  bevelHeight?: number;
};

export function createDomeColumnAttributes(props: DomeColumnGeometryProps): {
  positions: Float32Array;
  normals: Float32Array;
} {
  const {radius = 1, height = 2, nradial = 10, bevelSegments = 4, bevelHeight = 1} = props;

  const isExtruded = height > 0;
  const vertsAroundEdge = nradial + 1; // +1 to close the strip
  const stepAngle = (Math.PI * 2) / nradial;
  const bevelDepth = bevelSegments >= 2 ? bevelHeight * radius : 0;
  const sidesTopZ = height / 2 - bevelDepth; // 0 when bevelHeight=1, height=2
  const bevelLevels = bevelSegments >= 2 ? bevelSegments - 1 : 0;

  // Vertex count: sides (2 per edge vertex) + degenerate (1) + bevel rings (2 per edge per level) + apex (1)
  const numVertices = !isExtruded
    ? nradial
    : bevelSegments >= 2
      ? vertsAroundEdge * 2 + 1 + bevelLevels * vertsAroundEdge * 2 + 1
      : vertsAroundEdge * 3 + 1; // flat cap fallback

  const positions = new Float32Array(numVertices * 3);
  const normals = new Float32Array(numVertices * 3);

  let i = 0;
  const setVertex = (pos: [number, number, number], norm: [number, number, number]) => {
    positions[i] = pos[0];
    positions[i + 1] = pos[1];
    positions[i + 2] = pos[2];
    normals[i] = norm[0];
    normals[i + 1] = norm[1];
    normals[i + 2] = norm[2];
    i += 3;
  };

  const getXY = (j: number, scale = 1): [number, number] => {
    return [Math.cos(j * stepAngle) * radius * scale, Math.sin(j * stepAngle) * radius * scale];
  };

  const getNormal = (j: number): [number, number] => {
    return [Math.cos(j * stepAngle), Math.sin(j * stepAngle)];
  };

  if (!isExtruded) {
    // Flat disk - no bevel needed
    for (let j = 0; j < nradial; j++) {
      const [x, y] = getXY(j);
      setVertex([x, y, 0], [0, 0, 1]);
    }
  } else {
    // === Cylinder sides ===
    for (let j = 0; j < vertsAroundEdge; j++) {
      const [x, y] = getXY(j);
      const [nx, ny] = getNormal(j);
      setVertex([x, y, sidesTopZ], [nx, ny, 0]); // top of cylinder
      setVertex([x, y, -height / 2], [nx, ny, 0]); // bottom of cylinder
    }

    if (bevelSegments >= 2) {
      // === Degenerate triangle to transition from cylinder strip to bevel strip ===
      const [fx, fy] = getXY(0);
      const phi0 = Math.PI / 2 / bevelLevels;
      const dz0 = Math.sin(phi0) * bevelDepth;
      const dr0 = Math.cos(phi0) * radius - radius;
      const len0 = Math.sqrt(dz0 * dz0 + dr0 * dr0);
      setVertex([fx, fy, sidesTopZ], [dz0 / len0, 0, -dr0 / len0]);

      // === Bevel rings ===
      for (let level = 0; level < bevelLevels; level++) {
        const phi1 = (level / bevelLevels) * (Math.PI / 2);
        const phi2 = ((level + 1) / bevelLevels) * (Math.PI / 2);
        const r1 = Math.cos(phi1);
        const r2 = Math.cos(phi2);
        const z1 = sidesTopZ + Math.sin(phi1) * bevelDepth;
        const z2 = sidesTopZ + Math.sin(phi2) * bevelDepth;

        for (let j = 0; j < vertsAroundEdge; j++) {
          const angle = (j % nradial) * stepAngle;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const [x1, y1] = getXY(j, r1);
          const [x2, y2] = getXY(j, r2);
          // Smooth normals: spherical normal direction
          setVertex(
            [x1, y1, z1],
            [cos * Math.cos(phi1), sin * Math.cos(phi1), Math.sin(phi1)]
          );
          setVertex(
            [x2, y2, z2],
            [cos * Math.cos(phi2), sin * Math.cos(phi2), Math.sin(phi2)]
          );
        }
      }

      // === Apex vertex ===
      setVertex([0, 0, height / 2], [0, 0, 1]);
    } else {
      // Flat cap (zigzag triangle strip) - same as standard ColumnGeometry
      for (let j = 0; j < vertsAroundEdge; j++) {
        const v = Math.floor(j / 2) * Math.sign(0.5 - (j % 2));
        const [x, y] = getXY((v + nradial) % nradial);
        setVertex([x, y, height / 2], [0, 0, 1]);
      }
    }
  }

  return {
    positions: positions.subarray(0, i),
    normals: normals.subarray(0, i)
  };
}

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
    log.assert(vertices.length >= nradial);
    vertices = vertices.flatMap(v => [v[0], v[1]]);
    modifyPolygonWindingDirection(vertices, WINDING.COUNTER_CLOCKWISE);
  }

  const isExtruded = height > 0;
  const vertsAroundEdge = nradial + 1;
  const stepAngle = (Math.PI * 2) / nradial;
  const bevelDepth = bevelSegments >= 2 ? bevelHeight * radius : 0;
  const sidesTopZ = height / 2 - bevelDepth;
  const bevelLevels = bevelSegments >= 2 ? bevelSegments - 1 : 0;

  // Vertex count: sides + degenerate + bevel/flat cap
  const numVertices = !isExtruded
    ? nradial
    : bevelSegments >= 2
      ? vertsAroundEdge * 2 + 2 + bevelLevels * vertsAroundEdge * 2 + 1
      : vertsAroundEdge * 3 + 1;

  const positions = new Float32Array(numVertices * 3);
  const normals = new Float32Array(numVertices * 3);
  const bevelWireframeCount = bevelLevels > 0 ? bevelLevels * nradial * 4 + nradial * 2 : 0;
  const indices = new Uint16Array(isExtruded ? nradial * 6 + bevelWireframeCount : 0);

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
    const vIdx = j % nradial;
    return vertices
      ? [vertices[vIdx * 2] * scale, vertices[vIdx * 2 + 1] * scale]
      : [Math.cos(j * stepAngle) * radius * scale, Math.sin(j * stepAngle) * radius * scale];
  };
  const getNormal = (j: number): [number, number] => {
    const vIdx = j % nradial;
    return vertices
      ? [vertices[vIdx * 2], vertices[vIdx * 2 + 1]]
      : [Math.cos(j * stepAngle), Math.sin(j * stepAngle)];
  };

  // Cylinder sides
  if (isExtruded) {
    for (let j = 0; j < vertsAroundEdge; j++) {
      const [x, y] = getXY(j);
      const [nx, ny] = getNormal(j);
      setVertex([x, y, sidesTopZ], [nx, ny, 0]);
      setVertex([x, y, -height / 2], [nx, ny, 0]);
    }
    setVertex(
      [positions[i - 3], positions[i - 2], positions[i - 1]],
      [normals[i - 3], normals[i - 2], normals[i - 1]]
    );
  }

  // Top cap
  if (isExtruded && bevelSegments >= 2) {
    // Degenerate transition
    const [fx, fy] = getXY(0);
    if (smoothNormals) {
      setVertex([fx, fy, sidesTopZ], [1, 0, 0]);
    } else {
      const phi = Math.PI / 2 / bevelLevels;
      const dz = Math.sin(phi) * bevelDepth;
      const dr = Math.cos(phi) * radius - radius;
      const len = Math.sqrt(dz * dz + dr * dr);
      setVertex([fx, fy, sidesTopZ], [dz / len, 0, -dr / len]);
    }

    // Bevel rings
    for (let level = 0; level < bevelLevels; level++) {
      const phi1 = (level / bevelLevels) * (Math.PI / 2);
      const phi2 = ((level + 1) / bevelLevels) * (Math.PI / 2);
      const r1 = Math.cos(phi1);
      const r2 = Math.cos(phi2);
      const z1 = sidesTopZ + Math.sin(phi1) * bevelDepth;
      const z2 = sidesTopZ + Math.sin(phi2) * bevelDepth;
      const dr = r2 - r1;
      const dz = z2 - z1;
      const len = Math.sqrt(dz * dz + dr * dr);

      for (let j = 0; j < vertsAroundEdge; j++) {
        const angle = (j % nradial) * stepAngle;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const [x1, y1] = getXY(j, r1);
        const [x2, y2] = getXY(j, r2);
        if (smoothNormals) {
          setVertex([x1, y1, z1], [cos * Math.cos(phi1), sin * Math.cos(phi1), Math.sin(phi1)]);
          setVertex([x2, y2, z2], [cos * Math.cos(phi2), sin * Math.cos(phi2), Math.sin(phi2)]);
        } else {
          setVertex([x1, y1, z1], [(cos * dz) / len, (sin * dz) / len, -dr / len]);
          setVertex([x2, y2, z2], [(cos * dz) / len, (sin * dz) / len, -dr / len]);
        }
      }
    }
    setVertex([0, 0, height / 2], [0, 0, 1]); // Apex
  } else {
    // Flat cap
    for (let j = isExtruded ? 0 : 1; j < vertsAroundEdge; j++) {
      const v = Math.floor(j / 2) * Math.sign(0.5 - (j % 2));
      const [x, y] = getXY((v + nradial) % nradial);
      setVertex([x, y, height / 2], [0, 0, 1]);
    }
  }

  // Wireframe indices
  if (isExtruded) {
    let idx = 0;
    for (let j = 0; j < nradial; j++) {
      indices[idx++] = j * 2;
      indices[idx++] = j * 2 + 2;
      indices[idx++] = j * 2;
      indices[idx++] = j * 2 + 1;
      indices[idx++] = j * 2 + 1;
      indices[idx++] = j * 2 + 3;
    }
    if (bevelSegments >= 2) {
      const bevelStart = vertsAroundEdge * 2 + 2;
      for (let level = 0; level < bevelLevels; level++) {
        const start = bevelStart + level * vertsAroundEdge * 2;
        for (let j = 0; j < nradial; j++) {
          indices[idx++] = start + j * 2;
          indices[idx++] = start + ((j + 1) % nradial) * 2;
          indices[idx++] = start + j * 2;
          indices[idx++] = start + j * 2 + 1;
        }
      }
      const lastStart = bevelStart + (bevelLevels - 1) * vertsAroundEdge * 2;
      const apex = bevelStart + bevelLevels * vertsAroundEdge * 2;
      for (let j = 0; j < nradial; j++) {
        indices[idx++] = lastStart + j * 2;
        indices[idx++] = apex;
      }
    }
  }

  return {
    indices,
    attributes: {POSITION: {size: 3, value: positions}, NORMAL: {size: 3, value: normals}}
  };
}

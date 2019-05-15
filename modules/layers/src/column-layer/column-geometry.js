import {Geometry, uid} from '@luma.gl/core';

export const FILL_MODE = 'fill';
export const WIREFRAME_MODE = 'wireframe';

export class ColumnGeometry extends Geometry {
  constructor(props = {}) {
    const {id = uid('column-geometry')} = props;
    const {indices, attributes} = tesselateCylinder(props);
    super({
      ...props,
      id,
      indices,
      attributes
    });
  }
}

/* eslint-disable max-statements, complexity */
function tesselateCylinder(props) {
  const {radius, height = 1, nradial = 10, mode} = props;

  const vertsAroundEdge = nradial + 1; // loop
  const numVertices = vertsAroundEdge * 3; // top, side top edge, side bottom edge

  const stepAngle = (Math.PI * 2) / nradial;

  // Used for wireframe
  let indices = new Uint16Array(nradial * 3 * 2); // top loop, side vertical, bottom loop

  const positions = new Float32Array(numVertices * 3);
  const normals = new Float32Array(numVertices * 3);

  let i = 0;
  let a = 0;

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
  for (let j = 0; j < vertsAroundEdge; j++) {
    const v = Math.floor(j / 2) * Math.sign((j % 2) - 0.5);
    a = v * stepAngle;
    const sin = Math.sin(a);
    const cos = Math.cos(a);

    positions[i + 0] = cos * radius;
    positions[i + 1] = sin * radius;
    positions[i + 2] = height / 2;

    normals[i + 2] = 1;

    i += 3;
  }

  // side tesselation: 0, 1, 2, 3, 4, 5, ...
  //
  // 0 - 2 - 4  ... top
  // | / | / |
  // 1 - 3 - 5  ... bottom
  //
  for (let j = 0; j < vertsAroundEdge; j++) {
    const sin = Math.sin(a);
    const cos = Math.cos(a);

    for (let k = 0; k < 2; k++) {
      positions[i + 0] = cos * radius;
      positions[i + 1] = sin * radius;
      positions[i + 2] = (1 / 2 - k) * height;

      normals[i + 0] = cos;
      normals[i + 1] = sin;

      i += 3;
    }
    a += stepAngle;
  }

  if (mode === WIREFRAME_MODE) {
    let index = 0;
    for (let j = 0; j < nradial; j++) {
      // start index of the side vertices
      const j2 = vertsAroundEdge + j * 2;
      // top loop
      indices[index++] = j2 + 0;
      indices[index++] = j2 + 2;
      // side vertical
      indices[index++] = j2 + 0;
      indices[index++] = j2 + 1;
      // bottom loop
      indices[index++] = j2 + 1;
      indices[index++] = j2 + 3;
    }
  } else if (mode === FILL_MODE) {
    indices = null;
  }

  return {
    indices,
    attributes: {
      POSITION: {size: 3, value: positions},
      NORMAL: {size: 3, value: normals}
    }
  };
}

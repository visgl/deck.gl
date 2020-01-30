import GL from '@luma.gl/constants';
import {Geometry} from '@luma.gl/core';

export default class SquareGridGeometry extends Geometry {
  constructor(opts = {}) {
    const {id = 'sqaure-grid-geometry'} = opts;

    const indices = calculateIndices(opts);
    const positions = calculatePositions(opts);

    super(
      Object.assign({}, opts, {
        id,
        drawMode: GL.TRIANGLES,
        attributes: {
          // No size/type information is needed for known vertex names
          indices,
          positions
        },
        vertexCount: indices.length
      })
    );
  }
}

function calculateIndices({xResolution, yResolution}) {
  // # of squares = (nx - 1) * (ny - 1)
  // # of triangles = squares * 2
  // # of indices = triangles * 3
  const indicesCount = (xResolution - 1) * (yResolution - 1) * 2 * 3;

  const indices = new Uint32Array(indicesCount);

  let i = 0;
  for (let lngIndex = 0; lngIndex < xResolution - 1; lngIndex++) {
    for (let latIndex = 0; latIndex < yResolution - 1; latIndex++) {
      /*
       *   i0   i1
       *    +--.+---
       *    | / |
       *    +'--+---
       *    |   |
       *   i2   i3
       */
      const i0 = latIndex * xResolution + lngIndex;
      const i1 = i0 + 1;
      const i2 = i0 + xResolution;
      const i3 = i2 + 1;

      indices[i++] = i0;
      indices[i++] = i2;
      indices[i++] = i1;
      indices[i++] = i1;
      indices[i++] = i2;
      indices[i++] = i3;
    }
  }

  return indices;
}

function calculatePositions({boundingBox, xResolution, yResolution}) {
  const {minLng, minLat, maxLng, maxLat} = boundingBox;

  // step between samples
  const deltaLng = (maxLng - minLng) / (xResolution - 1);
  const deltaLat = (maxLat - minLat) / (yResolution - 1);

  const positions = new Float32Array(xResolution * yResolution * 3);

  let i = 0;
  for (let latIndex = 0; latIndex < yResolution; latIndex++) {
    for (let lngIndex = 0; lngIndex < xResolution; lngIndex++) {
      positions[i++] = lngIndex * deltaLng + minLng;
      positions[i++] = latIndex * deltaLat + minLat;
      positions[i++] = 0;
    }
  }

  return positions;
}

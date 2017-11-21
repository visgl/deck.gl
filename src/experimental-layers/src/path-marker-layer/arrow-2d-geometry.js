import {Geometry} from 'luma.gl';

export default class Arrow2DGeometry extends Geometry {
  constructor(opts = {}) {
    super(Object.assign({}, opts, {
      attributes: getArrowAttributes(opts)
    }));
  }
}

function getArrowAttributes({
  length = 1,
  headSize = 0.2,
  tailWidth = 0.05,
  tailStart = 0.05
}) {
  const texCoords = [
    // HEAD
    0.5, 1.0, 0,
    0.5 - headSize / 2, 1.0 - headSize, 0,
    0.5 + headSize / 2, 1.0 - headSize, 0,

    0.5 - tailWidth / 2, tailStart, 0,
    0.5 + tailWidth / 2, 1.0 - headSize, 0,
    0.5 + tailWidth / 2, tailStart, 0,

    0.5 - tailWidth / 2, tailStart, 0,
    0.5 - tailWidth / 2, 1.0 - headSize, 0,
    0.5 + tailWidth / 2, 1.0 - headSize, 0
  ];

  const normals = [
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    0, 0, 1,
    0, 0, 1,
    0, 0, 1
  ];

  // Center and scale
  const positions = new Array(texCoords.length);
  for (let i = 0; i < texCoords.length / 3; i++) {
    const i3 = i * 3;
    positions[i3 + 0] = (texCoords[i3 + 0] - 0.5) * length;
    positions[i3 + 1] = (texCoords[i3 + 1] - 0.5) * length;
    positions[i3 + 2] = 0;
  }
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    texCoords: new Float32Array(texCoords)
  };
}

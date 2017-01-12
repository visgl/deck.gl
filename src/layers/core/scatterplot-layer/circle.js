import {Geometry} from 'luma.gl';

// These match the numeric values of the corresponding GL constants
// Redefining them here avoids a hard dependency between the
// abstract geometries and the WebGL library.
export const DRAW_MODE = {
  TRIANGLE_FAN: 6
};

// Creates a circle in the XY plane with the specified radius
export default class CircleGeometry extends Geometry {
  constructor({
    sides = 16,
    radius = 1,
    id = 'circle-geometry'
    // id = uid('circle-geometry'),
  } = {}) {
    const positions = [];
    const normals = [];
    const texCoords = [];
    for (let i = 0; i < sides; i++) {
      const cosi = Math.cos(Math.PI * 2 * i / sides);
      const sini = Math.sin(Math.PI * 2 * i / sides);
      positions.push(cosi * radius, sini * radius, 0);
      normals.push(0, 0, 1);
      texCoords.push(cosi, sini);
    }

    super({
      drawMode: DRAW_MODE.TRIANGLE_FAN,
      attributes: {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        texCoords: new Float32Array(texCoords)
      }
    });
  }
}

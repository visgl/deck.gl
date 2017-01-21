import * as Polygon from './polygon';
// import {getPolygonVertexCount, getPolygonTriangleCount} from './polygon';
import earcut from 'earcut';
import flattenDeep from 'lodash.flattendeep';
import {vec3} from 'gl-matrix';
import {fp64ify} from '../../../lib/utils/fp64';
import {Container} from '../../../lib/utils';
// import {Container, flattenVertices, fillArray} from '../../../lib/utils';

export class PolygonTesselatorExtruded {

  constructor({
    polygons,
    getHeight = x => 1000,
    getColor = x => [0, 0, 0, 255],
    wireframe = false,
    fp64 = false
  }) {
    // Expensive operation, convert all polygons to arrays
    polygons = Container.map(polygons, (complexPolygon, polygonIndex) => {
      const height = getHeight(polygonIndex);
      return Container.map(Polygon.normalize(complexPolygon),
        polygon => Container.map(polygon, coord => [coord[0], coord[1], height]));
    });

    const groupedVertices = polygons;
    this.groupedVertices = polygons;

    const positionsJS = calculatePositionsJS({groupedVertices, wireframe});

    this.attributes = fp64 ? {
      positions64xy: calculatePositions64xy(positionsJS),
      positions64z: calculatePositions64z(positionsJS)
    } : {
      positions: calculatePositions(positionsJS)
    };

    Object.assign(this.attributes, {
      indices: calculateIndices({groupedVertices, wireframe}),
      normals: calculateNormals({groupedVertices, wireframe}),
      colors: calculateColors({groupedVertices, wireframe}),
      pickingColors: calculatePickingColors({groupedVertices, wireframe})
    });

  }

  indices() {
    return this.attributes.indices;
  }

  positions() {
    return this.attributes.positions;
  }

  positions64xy() {
    return this.attributes.positions64xy;
  }

  positions64x() {
    return this.attributes.positions64z;
  }

  normals() {
    return this.attributes.normals;
  }

  colors() {
    return this.attributes.colors;
  }

  pickingColors() {
    // return this.attributes.pickingColors;
    return this.attributes.pickingColors;
  }

  // updateTriggers: {
  //   positions: ['getHeight']
  // }
}

function countVertices(vertices) {
  return vertices.reduce((count, polygon) => count + polygon.length, 0);
}

function calculateIndices({groupedVertices, wireframe = false}) {
  // adjust index offset for multiple buildings
  const multiplier = wireframe ? 2 : 5;
  const offsets = groupedVertices.reduce(
    (acc, vertices) =>
      [...acc, acc[acc.length - 1] + countVertices(vertices) * multiplier],
    [0]
  );

  const indices = groupedVertices.map((vertices, buildingIndex) =>
    wireframe ?
      // 1. get sequentially ordered indices of each building wireframe
      // 2. offset them by the number of indices in previous buildings
      calculateContourIndices(vertices, offsets[buildingIndex]) :
      // 1. get triangulated indices for the internal areas
      // 2. offset them by the number of indices in previous buildings
      calculateSurfaceIndices(vertices, offsets[buildingIndex])
  );

  return new Uint32Array(flattenDeep(indices));
}

// Calculate a flat position array in JS - can be mapped to 32 or 64 bit typed arrays
// Remarks:
// * each top vertex is on 3 surfaces
// * each bottom vertex is on 2 surfaces
function calculatePositionsJS({groupedVertices, wireframe = false}) {
  const positions = Container.map(groupedVertices, complexPolygon =>
    Container.map(complexPolygon, vertices => {
      const topVertices = [].concat(vertices);
      const baseVertices = topVertices.map(v => [v[0], v[1], 0]);
      return wireframe ?
        [topVertices, baseVertices] :
        [topVertices, topVertices, topVertices, baseVertices, baseVertices];
    })
  );
  return flattenDeep(positions);
}

function calculatePositions(positionsJS) {
  return new Float32Array(positionsJS);
}

function calculatePositions64xy(positionsJS) {
  const attribute = new Float32Array(positionsJS.length / 3 * 4);
  for (let i = 0; i < positionsJS.length / 3; i++) {
    [attribute[i * 4 + 0], attribute[i * 4 + 1]] = fp64ify(positionsJS[i * 3 + 0]);
    [attribute[i * 4 + 2], attribute[i * 4 + 3]] = fp64ify(positionsJS[i * 3 + 1]);
  }
  return attribute;
}

function calculatePositions64z(positionsJS) {
  const attribute = new Float32Array(positionsJS.length / 3 * 2);
  for (let i = 0; i < positionsJS.length / 3; i++) {
    [attribute[i * 2 + 0], attribute.value[i * 2 + 1]] = fp64ify(positionsJS[i * 3 + 2] + 0.1);
  }
  return attribute;
}

function calculateNormals({groupedVertices, wireframe}) {
  const up = [0, 1, 0];

  const normals = groupedVertices.map((vertices, buildingIndex) => {
    const topNormals = new Array(countVertices(vertices)).fill(up);
    const sideNormals = vertices.map(polygon => calculateSideNormals(polygon));
    const sideNormalsForward = sideNormals.map(n => n[0]);
    const sideNormalsBackward = sideNormals.map(n => n[1]);

    return wireframe ?
    [topNormals, topNormals] :
    [topNormals, sideNormalsForward, sideNormalsBackward, sideNormalsForward, sideNormalsBackward];
  });

  return new Float32Array(flattenDeep(normals));
}

function calculateSideNormals(vertices) {
  const numVertices = vertices.length;
  const normals = [];

  for (let i = 0; i < numVertices - 1; i++) {
    const n = getNormal(vertices[i], vertices[i + 1]);
    normals.push(n);
  }

  return [[...normals, normals[0]], [normals[0], ...normals]];
}

function calculateColors({groupedVertices, color = [0, 0, 0, 255], wireframe = false}) {
  const colors = groupedVertices.map((vertices, buildingIndex) => {
    // const baseColor = Array.isArray(color) ? color[0] : color;
    // const topColor = Array.isArray(color) ? color[color.length - 1] : color;
    const numVertices = countVertices(vertices);
    const topColors = new Array(numVertices).fill([0, 0, 0, 255]);
    const baseColors = new Array(numVertices).fill([0, 0, 0, 255]);
    return wireframe ?
      [topColors, baseColors] :
      [topColors, topColors, topColors, baseColors, baseColors];
  });
  return new Uint8ClampedArray(flattenDeep(colors));
}

function calculatePickingColors({groupedVertices, color = [0, 0, 0], wireframe = false}) {
  const colors = groupedVertices.map((vertices, buildingIndex) => {
    // const baseColor = Array.isArray(color) ? color[0] : color;
    // const topColor = Array.isArray(color) ? color[color.length - 1] : color;
    const numVertices = countVertices(vertices);
    const topColors = new Array(numVertices).fill([0, 0, 0]);
    const baseColors = new Array(numVertices).fill([0, 0, 0]);
    return wireframe ?
      [topColors, baseColors] :
      [topColors, topColors, topColors, baseColors, baseColors];
  });
  return new Uint8ClampedArray(flattenDeep(colors));
}

function calculateContourIndices(vertices, offset) {
  const stride = countVertices(vertices);

  return vertices.map(polygon => {
    const indices = [offset];
    const numVertices = polygon.length;

    // building top
    // use vertex pairs for GL.LINES => [0, 1, 1, 2, 2, ..., n-1, n-1, 0]
    for (let i = 1; i < numVertices - 1; i++) {
      indices.push(i + offset, i + offset);
    }
    indices.push(offset);

    // building sides
    for (let i = 0; i < numVertices - 1; i++) {
      indices.push(i + offset, i + stride + offset);
    }

    offset += numVertices;
    return indices;
  });
}

function calculateSurfaceIndices(vertices, offset) {
  const stride = countVertices(vertices);
  const quad = [
    [0, 1], [0, 3], [1, 2],
    [1, 2], [0, 3], [1, 4]
  ];

  function drawRectangle(i) {
    return quad.map(v => i + v[0] + stride * v[1] + offset);
  }

  let holes = null;

  if (vertices.length > 1) {
    holes = vertices.reduce(
      (acc, polygon) => [...acc, acc[acc.length - 1] + polygon.length],
      [0]
    ).slice(1, vertices.length);
  }

  const topIndices = earcut(flattenDeep(vertices), holes, 3).map(index => index + offset);

  const sideIndices = vertices.map(polygon => {
    const numVertices = polygon.length;
    // building top
    const indices = [];

    // building sides
    for (let i = 0; i < numVertices - 1; i++) {
      indices.push(...drawRectangle(i));
    }

    offset += numVertices;
    return indices;
  });

  return [topIndices, sideIndices];
}

// helpers

// get normal vector of line segment
function getNormal(p1, p2) {
  if (p1[0] === p2[0] && p1[1] === p2[1]) {
    return [1, 0, 0];
  }

  const degrees2radians = Math.PI / 180;
  const lon1 = degrees2radians * p1[0];
  const lon2 = degrees2radians * p2[0];
  const lat1 = degrees2radians * p1[1];
  const lat2 = degrees2radians * p2[1];
  const a = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const b = Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  return vec3.normalize([], [b, 0, -a]);
}

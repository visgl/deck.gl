// Handles tesselation of polygons with holes
// - 2D surfaces
// - 2D outlines
// - 3D surfaces (top and sides only)
// - 3D wireframes (not yet)
import * as Polygon from './polygon';
import earcut from 'earcut';
import {Container, get, count, flattenVertices, fillArray} from '../../../lib/utils';
import {fp64ify} from '../../../lib/utils/fp64';

// Maybe deck.gl or luma.gl needs to export this
function getPickingColor(index) {
  return [
    (index + 1) % 256,
    Math.floor((index + 1) / 256) % 256,
    Math.floor((index + 1) / 256 / 256) % 256
  ];
}

function parseColor(color) {
  if (!Array.isArray(color)) {
    color = [get(color, 0), get(color, 1), get(color, 2), get(color, 3)];
  }
  color[3] = Number.isFinite(color[3]) ? color[3] : 255;
  return color;
}

const DEFAULT_COLOR = [0, 0, 0, 255]; // Black

// This class is set up to allow querying one attribute at a time
// the way the AttributeManager expects it
export class PolygonTesselator {
  constructor({polygons, fp64 = false}) {
    // Normalize all polygons
    this.polygons = polygons.map(polygon => Polygon.normalize(polygon));
    // Count all polygon vertices
    this.pointCount = getPointCount(this.polygons);
    this.fp64 = fp64;
  }

  indices() {
    const {polygons, indexCount} = this;
    return calculateIndices({polygons, indexCount});
  }

  positions() {
    const {polygons, pointCount} = this;
    return calculatePositions({polygons, pointCount, fp64: this.fp64});
  }

  normals() {
    const {polygons, pointCount} = this;
    return calculateNormals({polygons, pointCount});
  }

  colors({getColor = x => DEFAULT_COLOR} = {}) {
    const {polygons, pointCount} = this;
    return calculateColors({polygons, pointCount, getColor});
  }

  pickingColors() {
    const {polygons, pointCount} = this;
    return calculatePickingColors({polygons, pointCount});
  }

  // getAttribute({size, accessor}) {
  //   const {polygons, pointCount} = this;
  //   return calculateAttribute({polygons, pointCount, size, accessor});
  // }
}

// Count number of points in a list of complex polygons
function getPointCount(polygons) {
  return polygons.reduce((points, polygon) => points + Polygon.getVertexCount(polygon), 0);
}

// COunt number of triangles in a list of complex polygons
function getTriangleCount(polygons) {
  return polygons.reduce((triangles, polygon) => triangles + Polygon.getTriangleCount(polygon), 0);
}

// Returns the offsets of each complex polygon in the combined array of all polygons
function getPolygonOffsets(polygons) {
  const offsets = new Array(polygons.length + 1);
  offsets[0] = 0;
  let offset = 0;
  polygons.forEach((polygon, i) => {
    offset += Polygon.getVertexCount(polygon);
    offsets[i + 1] = offset;
  });
  return offsets;
}

// Returns the offset of each hole polygon in the flattened array for that polygon
function getHoleIndices(complexPolygon) {
  let holeIndices = null;
  if (complexPolygon.length > 1) {
    let polygonStartIndex = 0;
    holeIndices = [];
    complexPolygon.forEach(polygon => {
      polygonStartIndex += polygon.length;
      holeIndices.push(polygonStartIndex);
    });
    // Last element points to end of the flat array, remove it
    holeIndices.pop();
  }
  return holeIndices;
}

function calculateIndices({polygons, IndexType = Uint32Array}) {
  // Calculate length of index array (3 * number of triangles)
  const indexCount = 3 * getTriangleCount(polygons);
  const offsets = getPolygonOffsets(polygons);

  // Allocate the attribute
  // TODO it's not the index count but the vertex count that must be checked
  if (IndexType === Uint16Array && indexCount > 65535) {
    throw new Error('Vertex count exceeds browser\'s limit');
  }
  const attribute = new IndexType(indexCount);

  // 1. get triangulated indices for the internal areas
  // 2. offset them by the number of indices in previous polygons
  let i = 0;
  polygons.forEach((polygon, polygonIndex) => {
    for (const index of calculateSurfaceIndices(polygon)) {
      attribute[i++] = index + offsets[polygonIndex];
    }
  });

  return attribute;
}

/*
 * Get vertex indices for drawing complexPolygon mesh
 * @private
 * @param {[Number,Number,Number][][]} complexPolygon
 * @returns {[Number]} indices
 */
function calculateSurfaceIndices(complexPolygon) {
  // Prepare an array of hole indices as expected by earcut
  const holeIndices = getHoleIndices(complexPolygon);
  // Flatten the polygon as expected by earcut
  const verts = flattenVertices2(complexPolygon);
  // Let earcut triangulate the polygon
  return earcut(verts, holeIndices, 3);
}

// Flattens nested array of vertices, padding third coordinate as needed
export function flattenVertices2(nestedArray, {result = [], dimensions = 3} = {}) {
  let index = -1;
  let vertexLength = 0;
  const length = count(nestedArray);
  while (++index < length) {
    const value = get(nestedArray, index);
    if (Container.isContainer(value)) {
      flattenVertices(value, {result, dimensions});
    } else {
      if (vertexLength < dimensions) { // eslint-disable-line
        result.push(value);
        vertexLength++;
      }
    }
  }
  // Add a third coordinate if needed
  if (vertexLength > 0 && vertexLength < dimensions) {
    result.push(0);
  }
  return result;
}

function calculatePositions({polygons, pointCount, fp64}) {
  // Flatten out all the vertices of all the sub subPolygons
  const attribute = new Float32Array(pointCount * 3);
  let attributeLow;
  if (fp64) {
    // We only need x, y component
    attributeLow = new Float32Array(pointCount * 2);
  }
  let i = 0;
  let j = 0;
  polygons.forEach(polygon =>
    Polygon.forEachVertex(polygon, vertex => {
      attribute[i++] = vertex[0];
      attribute[i++] = vertex[1];
      attribute[i++] = vertex[2] || 0;
      if (fp64) {
        attributeLow[j++] = fp64ify(vertex[0])[1];
        attributeLow[j++] = fp64ify(vertex[1])[1];
      }
    })
  );
  // for (const complexPolygon of polygons) {
  //   for (const simplePolygon of complexPolygon) {
  //     for (const vertex of simplePolygon) {
  //       attribute[i++] = vertex[0];
  //       attribute[i++] = vertex[1];
  //       attribute[i++] = vertex[2] || 0;
  //     }
  //   }
  // }
  return {positions: attribute, positions64xyLow: attributeLow};
}

function calculateNormals({polygons, pointCount}) {
  // TODO - use generic vertex attribute?
  const attribute = new Float32Array(pointCount * 3);
  fillArray({target: attribute, source: [0, 1, 0], start: 0, pointCount});
  return attribute;
}

function calculateColors({polygons, pointCount, getColor}) {
  const attribute = new Uint8Array(pointCount * 4);
  let i = 0;
  polygons.forEach((complexPolygon, polygonIndex) => {
    // Calculate polygon color
    let color = getColor(polygonIndex);
    color = parseColor(color);

    const vertexCount = Polygon.getVertexCount(complexPolygon);
    fillArray({target: attribute, source: color, start: i, count: vertexCount});
    i += color.length * vertexCount;
  });
  return attribute;
}

function calculatePickingColors({polygons, pointCount}) {
  const attribute = new Uint8Array(pointCount * 3);
  let i = 0;
  polygons.forEach((complexPolygon, polygonIndex) => {
    const color = getPickingColor(polygonIndex);
    const vertexCount = Polygon.getVertexCount(complexPolygon);
    fillArray({target: attribute, source: color, start: i, count: vertexCount});
    i += color.length * count;
  });
  return attribute;
}

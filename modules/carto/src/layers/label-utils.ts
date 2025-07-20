import {GeoBoundingBox} from '@deck.gl/geo-layers';
import {TypedArray} from '@loaders.gl/loader-utils';
import {BinaryPointFeature, BinaryLineFeature, BinaryPolygonFeature} from '@loaders.gl/schema';
import {copyNumericProps, createBinaryPointFeature, initializeNumericProps} from '../utils';

type Vec2 = [number, number] | TypedArray;
type TileBBox = GeoBoundingBox;
type Properties = BinaryPointFeature['properties'];
type LineInfo = {index: number; length: number};

export function createPointsFromLines(
  lines: BinaryLineFeature,
  uniqueIdProperty?: string
): BinaryPointFeature | null {
  const hasNumericUniqueId = uniqueIdProperty ? uniqueIdProperty in lines.numericProps : false;
  const idToLineInfo = new Map<string | number | undefined, LineInfo>();

  // First pass: find the longest line for each unique ID
  // If we don't have a uniqueIdProperty, treat each line as unique
  for (let i = 0; i < lines.pathIndices.value.length - 1; i++) {
    const pathIndex = lines.pathIndices.value[i];
    const featureId = lines.featureIds.value[pathIndex];
    let uniqueId: string | number | undefined;

    if (uniqueIdProperty === undefined) {
      uniqueId = featureId;
    } else if (hasNumericUniqueId) {
      uniqueId = lines.numericProps[uniqueIdProperty].value[pathIndex];
    } else if (lines.properties[featureId] && uniqueIdProperty in lines.properties[featureId]) {
      uniqueId = lines.properties[featureId][uniqueIdProperty];
    } else {
      uniqueId = undefined;
    }
    const length = getLineLength(lines, i);
    if (!idToLineInfo.has(uniqueId) || length > idToLineInfo.get(uniqueId)!.length) {
      idToLineInfo.set(uniqueId, {index: i, length});
    }
  }

  const positions: number[] = [];
  const properties: Properties = [];
  const featureIds: number[] = [];
  const globalFeatureIds: number[] = [];
  const numericProps = initializeNumericProps(idToLineInfo.size, lines.numericProps);

  // Second pass: create points for the longest line of each unique ID
  let pointIndex = 0;
  for (const [_, {index}] of idToLineInfo) {
    const midpoint = getLineMidpoint(lines, index);
    positions.push(...midpoint);

    const pathIndex = lines.pathIndices.value[index];
    const featureId = lines.featureIds.value[pathIndex];
    featureIds.push(pointIndex);
    properties.push(lines.properties[featureId]);
    globalFeatureIds.push(lines.globalFeatureIds.value[pathIndex]);
    copyNumericProps(lines.numericProps, numericProps, pathIndex, pointIndex);
    pointIndex++;
  }

  return createBinaryPointFeature(
    positions,
    featureIds,
    globalFeatureIds,
    numericProps,
    properties
  );
}

export function createPointsFromPolygons(
  polygons: Required<BinaryPolygonFeature>,
  tileBbox: TileBBox,
  props: any
): BinaryPointFeature {
  const {west, south, east, north} = tileBbox;
  const tileArea = (east - west) * (north - south);
  const minPolygonArea = tileArea * 0.0001; // 0.1% threshold

  const positions: number[] = [];
  const properties: Properties = [];
  const featureIds: number[] = [];
  const globalFeatureIds: number[] = [];
  const numericProps = initializeNumericProps(
    polygons.polygonIndices.value.length - 1,
    polygons.numericProps
  );

  // Process each polygon
  let pointIndex = 0;
  let triangleIndex = 0;
  const {extruded} = props;
  for (let i = 0; i < polygons.polygonIndices.value.length - 1; i++) {
    const startIndex = polygons.polygonIndices.value[i];
    const endIndex = polygons.polygonIndices.value[i + 1];

    // Skip small polygons
    if (getPolygonArea(polygons, i) < minPolygonArea) {
      continue;
    }

    const centroid = getPolygonCentroid(polygons, i);
    let maxArea = -1;
    let largestTriangleCenter: [number, number] = [0, 0];
    let centroidIsInside = false;

    // Scan triangles until we find ones that don't belong to this polygon
    while (triangleIndex < polygons.triangles.value.length) {
      const i1 = polygons.triangles.value[triangleIndex];

      // If we've moved past the current polygon's triangles, break
      if (i1 >= endIndex) {
        break;
      }

      // If we've already found a triangle containing the centroid, skip the rest
      if (centroidIsInside) {
        triangleIndex += 3;
        continue;
      }

      const i2 = polygons.triangles.value[triangleIndex + 1];
      const i3 = polygons.triangles.value[triangleIndex + 2];
      const v1 = polygons.positions.value.subarray(
        i1 * polygons.positions.size,
        i1 * polygons.positions.size + polygons.positions.size
      );
      const v2 = polygons.positions.value.subarray(
        i2 * polygons.positions.size,
        i2 * polygons.positions.size + polygons.positions.size
      );
      const v3 = polygons.positions.value.subarray(
        i3 * polygons.positions.size,
        i3 * polygons.positions.size + polygons.positions.size
      );

      if (isPointInTriangle(centroid, v1, v2, v3)) {
        centroidIsInside = true;
      } else {
        const area = getTriangleArea(v1, v2, v3);
        if (area > maxArea) {
          maxArea = area;
          largestTriangleCenter = [(v1[0] + v2[0] + v3[0]) / 3, (v1[1] + v2[1] + v3[1]) / 3];
        }
      }

      triangleIndex += 3;
    }

    const labelPoint = centroidIsInside ? centroid : largestTriangleCenter;
    if (isPointInBounds(labelPoint, tileBbox)) {
      positions.push(...labelPoint);
      const featureId = polygons.featureIds.value[startIndex];
      if (extruded) {
        const elevation = props.getElevation(undefined, {
          data: polygons,
          index: featureId
        });
        positions.push(elevation * props.elevationScale);
      }
      properties.push(polygons.properties[featureId]);
      featureIds.push(pointIndex);
      globalFeatureIds.push(polygons.globalFeatureIds.value[startIndex]);
      copyNumericProps(polygons.numericProps, numericProps, startIndex, pointIndex);
      pointIndex++;
    }
  }

  // Trim numeric properties arrays to actual size
  if (polygons.numericProps) {
    Object.keys(numericProps).forEach(prop => {
      numericProps[prop].value = numericProps[prop].value.slice(0, pointIndex);
    });
  }

  return createBinaryPointFeature(
    positions,
    featureIds,
    globalFeatureIds,
    numericProps,
    properties,
    extruded ? 3 : 2
  );
}

// Helper functions
function getPolygonArea(polygons: Required<BinaryPolygonFeature>, index: number): number {
  const {
    positions: {value: positions, size},
    polygonIndices: {value: indices},
    triangles: {value: triangles}
  } = polygons;

  const startIndex = indices[index];
  const endIndex = indices[index + 1];
  let area = 0;
  let triangleIndex = 0;

  // Find first triangle of this polygon
  // Note: this assumes tirnagles and polygon indices are sorted.
  // This is true for the current implementation of geojsonToBinary
  while (triangleIndex < triangles.length) {
    const i1 = triangles[triangleIndex];
    if (i1 >= startIndex) break;
    triangleIndex += 3;
  }

  // Process triangles until we hit the next polygon
  while (triangleIndex < triangles.length) {
    const i1 = triangles[triangleIndex];
    if (i1 >= endIndex) break;

    const i2 = triangles[triangleIndex + 1];
    const i3 = triangles[triangleIndex + 2];
    const v1 = positions.subarray(i1 * size, i1 * size + size);
    const v2 = positions.subarray(i2 * size, i2 * size + size);
    const v3 = positions.subarray(i3 * size, i3 * size + size);

    area += getTriangleArea(v1, v2, v3);
    triangleIndex += 3;
  }

  return area;
}

function isPointInBounds([x, y]: [number, number], {west, east, south, north}: TileBBox): boolean {
  return x >= west && x < east && y >= south && y < north;
}

function isPointInTriangle(p: Vec2, v1: Vec2, v2: Vec2, v3: Vec2): boolean {
  const area = Math.abs((v2[0] - v1[0]) * (v3[1] - v1[1]) - (v3[0] - v1[0]) * (v2[1] - v1[1])) / 2;
  const area1 = Math.abs((v1[0] - p[0]) * (v2[1] - p[1]) - (v2[0] - p[0]) * (v1[1] - p[1])) / 2;
  const area2 = Math.abs((v2[0] - p[0]) * (v3[1] - p[1]) - (v3[0] - p[0]) * (v2[1] - p[1])) / 2;
  const area3 = Math.abs((v3[0] - p[0]) * (v1[1] - p[1]) - (v1[0] - p[0]) * (v3[1] - p[1])) / 2;

  // Account for floating point precision
  return Math.abs(area - (area1 + area2 + area3)) < 1e-10;
}

function getTriangleArea([x1, y1]: Vec2, [x2, y2]: Vec2, [x3, y3]: Vec2): number {
  return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2);
}

function getPolygonCentroid(polygons: BinaryPolygonFeature, index: number): [number, number] {
  const {
    positions: {value: positions, size}
  } = polygons;
  const startIndex = size * polygons.polygonIndices.value[index];
  const endIndex = size * polygons.polygonIndices.value[index + 1];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = startIndex; i < endIndex; i += size) {
    const [x, y] = positions.subarray(i, i + 2);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

function getSegmentLength(lines: BinaryLineFeature, index: number): number {
  const {
    positions: {value}
  } = lines;
  const [x1, y1, x2, y2] = value.subarray(index, index + 4);
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function getLineLength(lines: BinaryLineFeature, index: number): number {
  const {
    positions: {size}
  } = lines;
  const startIndex = size * lines.pathIndices.value[index];
  const endIndex = size * lines.pathIndices.value[index + 1];
  let length = 0;
  for (let j = startIndex; j < endIndex; j += size) {
    length += getSegmentLength(lines, j);
  }
  return length;
}

function getLineMidpoint(lines: BinaryLineFeature, index: number): [number, number] {
  const {
    positions: {value: positions},
    pathIndices: {value: pathIndices}
  } = lines;
  const startIndex = pathIndices[index] * 2;
  const endIndex = pathIndices[index + 1] * 2;
  const numPoints = (endIndex - startIndex) / 2;

  if (numPoints === 2) {
    // For lines with only two vertices, interpolate between them
    const [x1, y1, x2, y2] = positions.subarray(startIndex, startIndex + 4);
    return [(x1 + x2) / 2, (y1 + y2) / 2];
  }
  // For lines with multiple vertices, use the middle vertex
  const midPointIndex = startIndex + Math.floor(numPoints / 2) * 2;
  return [positions[midPointIndex], positions[midPointIndex + 1]];
}

import {lerp} from 'math.gl';

const availableTransformations = {
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon
};

function Point([pointX, pointY], bbox, viewport) {
  const [minX, minY] = viewport.projectFlat([bbox.west, bbox.north]);
  const [maxX, maxY] = viewport.projectFlat([bbox.east, bbox.south]);
  const x = lerp(minX, maxX, pointX);
  const y = lerp(minY, maxY, pointY);

  return viewport.unprojectFlat([x, y]);
}

function getPoints(geometry, bbox, viewport) {
  return geometry.map(g => availableTransformations.Point(g, bbox, viewport));
}

function MultiPoint(multiPoint, bbox, viewport) {
  return getPoints(multiPoint, bbox, viewport);
}

function LineString(line, bbox, viewport) {
  return getPoints(line, bbox, viewport);
}

function MultiLineString(multiLineString, bbox, viewport) {
  return multiLineString.map(lineString =>
    availableTransformations.LineString(lineString, bbox, viewport)
  );
}

function Polygon(polygon, bbox, viewport) {
  return polygon.map(polygonRing => getPoints(polygonRing, bbox, viewport));
}

function MultiPolygon(multiPolygon, bbox, viewport) {
  return multiPolygon.map(polygon => availableTransformations.Polygon(polygon, bbox, viewport));
}

export function transform(geometry, bbox, viewport) {
  return {
    ...geometry,
    coordinates: availableTransformations[geometry.type](geometry.coordinates, bbox, viewport)
  };
}

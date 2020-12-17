const availableTransformations = {
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon
};

function Point([pointX, pointY], {x, y, z}) {
  const originX = x;
  const originY = y;
  const zoomLevelSize = Math.pow(2, z);

  const y2 = 180 - ((pointY + originY) * 360) / zoomLevelSize;

  return [
    ((pointX + originX) * 360) / zoomLevelSize - 180,
    (360 / Math.PI) * Math.atan(Math.exp((y2 * Math.PI) / 180)) - 90
  ];
}

function getPoints(geometry, tile) {
  return geometry.map(g => availableTransformations.Point(g, tile));
}

function MultiPoint(multiPoint, tile) {
  return getPoints(multiPoint, tile);
}

function LineString(line, tile) {
  return getPoints(line, tile);
}

function MultiLineString(multiLineString, tile) {
  return multiLineString.map(lineString => availableTransformations.LineString(lineString, tile));
}

function Polygon(polygon, tile) {
  return polygon.map(polygonRing => getPoints(polygonRing, tile));
}

function MultiPolygon(multiPolygon, tile) {
  return multiPolygon.map(polygon => availableTransformations.Polygon(polygon, tile));
}

export function transform(geometry, tile) {
  return {
    ...geometry,
    coordinates: availableTransformations[geometry.type](geometry.coordinates, tile)
  };
}

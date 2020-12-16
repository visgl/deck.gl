const availableTransformations = {
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon
};

function Point(point, tile) {
  const originX = tile.x;
  const originY = tile.y;
  const zoomLevelSize = Math.pow(2, tile.z);

  const y2 = 180 - ((point[1] + originY) * 360) / zoomLevelSize;

  return [
    ((point[0] + originX) * 360) / zoomLevelSize - 180,
    (360 / Math.PI) * Math.atan(Math.exp((y2 * Math.PI) / 180)) - 90
  ];
}

function MultiPoint(multiPoint, tile) {
  return multiPoint.map(point => availableTransformations.Point(point, tile));
}

function LineString(line, tile) {
  return line.map(linePoint => availableTransformations.Point(linePoint, tile));
}

function MultiLineString(multiLineString, tile) {
  return multiLineString.map(lineString => availableTransformations.LineString(lineString, tile));
}

function Polygon(polygon, tile) {
  return polygon.map(polygonRing => availableTransformations.LineString(polygonRing, tile));
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

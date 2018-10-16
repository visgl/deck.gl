import {lngLatToWorld} from 'viewport-mercator-project';

const TILE_SIZE = 512;

function getBoundingBox(viewport) {
  const corners = [
    viewport.unproject([0, 0]),
    viewport.unproject([viewport.width, 0]),
    viewport.unproject([0, viewport.height]),
    viewport.unproject([viewport.width, viewport.height])
  ];

  return [
    corners.reduce((minLng, p) => (minLng < p[0] ? minLng : p[0]), 180),
    corners.reduce((minLat, p) => (minLat < p[1] ? minLat : p[1]), 90),
    corners.reduce((maxLng, p) => (maxLng > p[0] ? maxLng : p[0]), -180),
    corners.reduce((maxLat, p) => (maxLat > p[1] ? maxLat : p[1]), -90)
  ];
}

function pixelsToTileIndex(a) {
  return Math.floor(a / TILE_SIZE);
}

export function getTileIndices(viewport) {
  const z = Math.floor(viewport.zoom);
  viewport = new viewport.constructor({
    ...viewport,
    zoom: z
  });

  const bbox = getBoundingBox(viewport);

  const [minX, minY] = lngLatToWorld([bbox[0], bbox[3]], viewport.scale).map(pixelsToTileIndex);
  const [maxX, maxY] = lngLatToWorld([bbox[2], bbox[1]], viewport.scale).map(pixelsToTileIndex);

  const indices = [];

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      indices.push({x, y, z});
    }
  }

  return indices;
}

export function long2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

export function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 -
      Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
}

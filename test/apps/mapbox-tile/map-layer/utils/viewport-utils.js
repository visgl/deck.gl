import WebMercatorViewport, {lngLatToWorld} from 'viewport-mercator-project';

function getBoundingBox(viewport) {
  const corners = [
    viewport.unproject([0, 0]),
    viewport.unproject([viewport.width, 0]),
    viewport.unproject([0, viewport.height]),
    viewport.unproject([viewport.width, viewport.height])
  ];

  return [
    corners.reduce((minLng, p) => minLng < p[0] ? minLng : p[0], 180),
    corners.reduce((minLat, p) => minLat < p[1] ? minLat : p[1], 90),
    corners.reduce((maxLng, p) => maxLng > p[0] ? maxLng : p[0], -180),
    corners.reduce((maxLat, p) => maxLat > p[1] ? maxLat : p[1], -90)
  ]
}

function pixelsToTileIndex(a) {
  // const TILE_SIZE = 512;
  return Math.floor(a / 512);
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

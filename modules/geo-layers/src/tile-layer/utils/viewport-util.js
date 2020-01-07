import {lngLatToWorld} from '@math.gl/web-mercator';

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

function getTileIndex(lngLat, scale, tileSize) {
  let [x, y] = lngLatToWorld(lngLat);
  x *= scale / tileSize;
  y = (1 - y / tileSize) * scale;
  return [x, y];
}

/**
 * Returns all tile indices in the current viewport. If the current zoom level is smaller
 * than minZoom, return an empty array. If the current zoom level is greater than maxZoom,
 * return tiles that are on maxZoom.
 */
export function getGeoTileIndices(viewport, maxZoom, minZoom, tileSize) {
  const z = Math.floor(viewport.zoom);
  if (minZoom && z < minZoom) {
    return [];
  }

  viewport = new viewport.constructor(
    Object.assign({}, viewport, {
      zoom: z
    })
  );

  const bbox = getBoundingBox(viewport);

  let [minX, minY] = getTileIndex([bbox[0], bbox[3]], viewport.scale, tileSize);
  let [maxX, maxY] = getTileIndex([bbox[2], bbox[1]], viewport.scale, tileSize);

  /*
      |  TILE  |  TILE  |  TILE  |
        |(minPixel)           |(maxPixel)
      |(minIndex)                |(maxIndex)
   */
  minX = Math.max(0, Math.floor(minX));
  maxX = Math.min(viewport.scale, Math.ceil(maxX));
  minY = Math.max(0, Math.floor(minY));
  maxY = Math.min(viewport.scale, Math.ceil(maxY));

  const indices = [];

  for (let x = minX; x < maxX; x++) {
    for (let y = minY; y < maxY; y++) {
      if (maxZoom && z > maxZoom) {
        indices.push(getAdjustedTileIndex({x, y, z}, maxZoom));
      } else {
        indices.push({x, y, z});
      }
    }
  }
  return indices;
}

/**
 * Calculates and returns a new tile index {x, y, z}, with z being the given adjustedZ.
 */
function getAdjustedTileIndex({x, y, z}, adjustedZ) {
  const m = Math.pow(2, z - adjustedZ);
  return {
    x: Math.floor(x / m),
    y: Math.floor(y / m),
    z: adjustedZ
  };
}

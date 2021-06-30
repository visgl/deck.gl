import {getOSMTileIndices} from './tile-2d-traversal';

const TILE_SIZE = 512;
const DEFAULT_EXTENT = [-Infinity, -Infinity, Infinity, Infinity];

export const urlType = {
  type: 'url',
  value: null,
  validate: (value, propType) =>
    (propType.optional && value === null) ||
    typeof value === 'string' ||
    (Array.isArray(value) && value.every(url => typeof url === 'string')),
  equals: (value1, value2) => {
    if (value1 === value2) {
      return true;
    }
    if (!Array.isArray(value1) || !Array.isArray(value2)) {
      return false;
    }
    const len = value1.length;
    if (len !== value2.length) {
      return false;
    }
    for (let i = 0; i < len; i++) {
      if (value1[i] !== value2[i]) {
        return false;
      }
    }
    return true;
  }
};

function transformBox(bbox, modelMatrix) {
  const transformedCoords = [
    // top-left
    modelMatrix.transformPoint([bbox[0], bbox[1]]),
    // top-right
    modelMatrix.transformPoint([bbox[2], bbox[1]]),
    // bottom-left
    modelMatrix.transformPoint([bbox[0], bbox[3]]),
    // bottom-right
    modelMatrix.transformPoint([bbox[2], bbox[3]])
  ];
  const transformedBox = [
    // Minimum x coord
    Math.min(...transformedCoords.map(i => i[0])),
    // Minimum y coord
    Math.min(...transformedCoords.map(i => i[1])),
    // Max x coord
    Math.max(...transformedCoords.map(i => i[0])),
    // Max y coord
    Math.max(...transformedCoords.map(i => i[1]))
  ];
  return transformedBox;
}

export function getURLFromTemplate(template, properties) {
  if (!template || !template.length) {
    return null;
  }
  if (Array.isArray(template)) {
    const index = Math.abs(properties.x + properties.y) % template.length;
    template = template[index];
  }

  const {x, y, z} = properties;
  return template
    .replace('{x}', x)
    .replace('{y}', y)
    .replace('{z}', z)
    .replace('{-y}', Math.pow(2, z) - y - 1);
}

/**
 * gets the bounding box of a viewport
 */
function getBoundingBox(viewport, zRange, extent) {
  let bounds;
  if (zRange && zRange.length === 2) {
    const [minZ, maxZ] = zRange;
    const bounds0 = viewport.getBounds({z: minZ});
    const bounds1 = viewport.getBounds({z: maxZ});
    bounds = [
      Math.min(bounds0[0], bounds1[0]),
      Math.min(bounds0[1], bounds1[1]),
      Math.max(bounds0[2], bounds1[2]),
      Math.max(bounds0[3], bounds1[3])
    ];
  } else {
    bounds = viewport.getBounds();
  }
  if (!viewport.isGeospatial) {
    return [
      // Top corner should not be more then bottom corner in either direction
      Math.max(Math.min(bounds[0], extent[2]), extent[0]),
      Math.max(Math.min(bounds[1], extent[3]), extent[1]),
      // Bottom corner should not be less then top corner in either direction
      Math.min(Math.max(bounds[2], extent[0]), extent[2]),
      Math.min(Math.max(bounds[3], extent[1]), extent[3])
    ];
  }
  return [
    Math.max(bounds[0], extent[0]),
    Math.max(bounds[1], extent[1]),
    Math.min(bounds[2], extent[2]),
    Math.min(bounds[3], extent[3])
  ];
}

function getIndexingCoords(bbox, scale, modelMatrixInverse) {
  if (modelMatrixInverse) {
    const transformedTileIndex = transformBox(bbox, modelMatrixInverse).map(
      i => (i * scale) / TILE_SIZE
    );
    return transformedTileIndex;
  }
  return bbox.map(i => (i * scale) / TILE_SIZE);
}

function getScale(z, tileSize) {
  return (Math.pow(2, z) * TILE_SIZE) / tileSize;
}

// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Lon..2Flat._to_tile_numbers_2
export function osmTile2lngLat(x, y, z) {
  const scale = getScale(z, TILE_SIZE);
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return [lng, lat];
}

function tile2XY(x, y, z, tileSize) {
  const scale = getScale(z, tileSize);
  return [(x / scale) * TILE_SIZE, (y / scale) * TILE_SIZE];
}
export function tileToBoundingBox(viewport, x, y, z, tileSize = TILE_SIZE) {
  if (viewport.isGeospatial) {
    const [west, north] = osmTile2lngLat(x, y, z);
    const [east, south] = osmTile2lngLat(x + 1, y + 1, z);
    return {west, north, east, south};
  }
  const [left, top] = tile2XY(x, y, z, tileSize);
  const [right, bottom] = tile2XY(x + 1, y + 1, z, tileSize);
  return {left, top, right, bottom};
}

function getIdentityTileIndices(viewport, z, tileSize, extent, modelMatrixInverse) {
  const bbox = getBoundingBox(viewport, null, extent);
  const scale = getScale(z, tileSize);
  const [minX, minY, maxX, maxY] = getIndexingCoords(bbox, scale, modelMatrixInverse);
  const indices = [];

  /*
      |  TILE  |  TILE  |  TILE  |
        |(minX)            |(maxX)
   */
  for (let x = Math.floor(minX); x < maxX; x++) {
    for (let y = Math.floor(minY); y < maxY; y++) {
      indices.push({x, y, z});
    }
  }
  return indices;
}

/**
 * Returns all tile indices in the current viewport. If the current zoom level is smaller
 * than minZoom, return an empty array. If the current zoom level is greater than maxZoom,
 * return tiles that are on maxZoom.
 */
// eslint-disable-next-line complexity
export function getTileIndices({
  viewport,
  maxZoom,
  minZoom,
  zRange,
  extent,
  tileSize = TILE_SIZE,
  modelMatrix,
  modelMatrixInverse,
  zoomOffset = 0
}) {
  let z = viewport.isGeospatial
    ? Math.round(viewport.zoom + Math.log2(TILE_SIZE / tileSize)) + zoomOffset
    : Math.ceil(viewport.zoom) + zoomOffset;
  if (Number.isFinite(minZoom) && z < minZoom) {
    if (!extent) {
      return [];
    }
    z = minZoom;
  }
  if (Number.isFinite(maxZoom) && z > maxZoom) {
    z = maxZoom;
  }
  let transformedExtent = extent;
  if (modelMatrix && modelMatrixInverse && extent && !viewport.isGeospatial) {
    transformedExtent = transformBox(extent, modelMatrix);
  }
  return viewport.isGeospatial
    ? getOSMTileIndices(viewport, z, zRange, extent || DEFAULT_EXTENT)
    : getIdentityTileIndices(
        viewport,
        z,
        tileSize,
        transformedExtent || DEFAULT_EXTENT,
        modelMatrixInverse
      );
}

/**
 * Returns true if s is a valid URL template
 */
export function isURLTemplate(s) {
  return /(?=.*{z})(?=.*{x})(?=.*({y}|{-y}))/.test(s);
}

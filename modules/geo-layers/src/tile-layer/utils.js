import {lngLatToWorld} from '@math.gl/web-mercator';

const TILE_SIZE = 512;

export const urlType = {
  type: 'url',
  value: '',
  validate: value =>
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

export function getURLFromTemplate(template, properties) {
  if (!template || !template.length) {
    return null;
  }
  if (Array.isArray(template)) {
    const index = Math.abs(properties.x + properties.y) % template.length;
    template = template[index];
  }
  return template.replace(/\{ *([\w_-]+) *\}/g, (_, property) => properties[property]);
}

/**
 * gets the bounding box of a viewport
 */
function getBoundingBox(viewport, zRange) {
  let corners;
  if (zRange && zRange.length === 2) {
    const [minZ, maxZ] = zRange;
    const minTargetZ = {targetZ: minZ};
    const maxTargetZ = {targetZ: maxZ};
    corners = [
      // Lower zRange
      viewport.unproject([0, 0], minTargetZ),
      viewport.unproject([viewport.width, 0], minTargetZ),
      viewport.unproject([0, viewport.height], minTargetZ),
      viewport.unproject([viewport.width, viewport.height], minTargetZ),

      // Upper zRange
      viewport.unproject([0, 0], maxTargetZ),
      viewport.unproject([viewport.width, 0], maxTargetZ),
      viewport.unproject([0, viewport.height], maxTargetZ),
      viewport.unproject([viewport.width, viewport.height], maxTargetZ)
    ];
  } else {
    corners = [
      viewport.unproject([0, 0]),
      viewport.unproject([viewport.width, 0]),
      viewport.unproject([0, viewport.height]),
      viewport.unproject([viewport.width, viewport.height])
    ];
  }

  return [
    Math.min(...corners.map(arr => arr[0])),
    Math.min(...corners.map(arr => arr[1])),
    Math.max(...corners.map(arr => arr[0])),
    Math.max(...corners.map(arr => arr[1]))
  ];
}

/*
 * get the OSM tile index at the given location
 * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
 */
function getOSMTileIndex(lngLat, scale) {
  let [x, y] = lngLatToWorld(lngLat);
  x *= scale / TILE_SIZE;
  y = (1 - y / TILE_SIZE) * scale;
  return [x, y];
}

function getTileIndex([x, y], scale) {
  return [(x * scale) / TILE_SIZE, (y * scale) / TILE_SIZE];
}

function getScale(z, tileSize = TILE_SIZE) {
  return (Math.pow(2, z) * TILE_SIZE) / tileSize;
}

// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Lon..2Flat._to_tile_numbers_2
function osmTile2lngLat(x, y, z) {
  const scale = getScale(z);
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

function getIdentityTileIndices(viewport, z, tileSize) {
  const bbox = getBoundingBox(viewport);
  const scale = getScale(z, tileSize);

  const [minX, minY] = getTileIndex([bbox[0], bbox[1]], scale);
  const [maxX, maxY] = getTileIndex([bbox[2], bbox[3]], scale);
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

function getOSMTileIndices(viewport, z, zRange) {
  const bbox = getBoundingBox(viewport, zRange);
  const scale = getScale(z);
  /*
    minX, maxX could be out of bounds if longitude is near the 180 meridian or multiple worlds
    are shown:
                |       |
    actual   -2 -1  0  1  2  3
    expected  2  3  0  1  2  3
   */
  let [minX, minY] = getOSMTileIndex([bbox[0], bbox[3]], scale);
  let [maxX, maxY] = getOSMTileIndex([bbox[2], bbox[1]], scale);
  const indices = [];

  /*
      |  TILE  |  TILE  |  TILE  |
        |(minX)            |(maxX)
   */
  minX = Math.floor(minX);
  maxX = Math.min(minX + scale, maxX); // Avoid creating duplicates
  minY = Math.max(0, Math.floor(minY));
  maxY = Math.min(scale, maxY);
  for (let x = minX; x < maxX; x++) {
    for (let y = minY; y < maxY; y++) {
      // Cast to valid x between [0, scale]
      const normalizedX = x - Math.floor(x / scale) * scale;
      indices.push({x: normalizedX, y, z});
    }
  }

  return indices;
}

/**
 * Returns all tile indices in the current viewport. If the current zoom level is smaller
 * than minZoom, return an empty array. If the current zoom level is greater than maxZoom,
 * return tiles that are on maxZoom.
 */
export function getTileIndices(viewport, maxZoom, minZoom, zRange, tileSize = TILE_SIZE) {
  let z = Math.ceil(viewport.zoom);
  if (Number.isFinite(minZoom) && z < minZoom) {
    return [];
  }
  if (Number.isFinite(maxZoom) && z > maxZoom) {
    z = maxZoom;
  }

  return viewport.isGeospatial
    ? getOSMTileIndices(viewport, z, zRange)
    : getIdentityTileIndices(viewport, z, tileSize);
}

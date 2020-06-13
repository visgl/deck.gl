import {getOSMTileIndices} from './tile-2d-traversal';

const TILE_SIZE = 512;
const DEFAULT_EXTENT = [-Infinity, -Infinity, Infinity, Infinity];

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
  return template.replace
    ? template.replace(/\{ *([\w_-]+) *\}/g, (_, property) => properties[property])
    : null;
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
  return [
    Math.max(bounds[0], extent[0]),
    Math.max(bounds[1], extent[1]),
    Math.min(bounds[2], extent[2]),
    Math.min(bounds[3], extent[3])
  ];
}

function getTileIndex([x, y], scale) {
  return [(x * scale) / TILE_SIZE, (y * scale) / TILE_SIZE];
}

function getScale(z) {
  return Math.pow(2, z);
}

// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Lon..2Flat._to_tile_numbers_2
function osmTile2lngLat(x, y, z) {
  const scale = getScale(z);
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return [lng, lat];
}

function tile2XY(x, y, z) {
  const scale = getScale(z);
  return [(x / scale) * TILE_SIZE, (y / scale) * TILE_SIZE];
}

export function tileToBoundingBox(viewport, x, y, z) {
  if (viewport.isGeospatial) {
    const [west, north] = osmTile2lngLat(x, y, z);
    const [east, south] = osmTile2lngLat(x + 1, y + 1, z);
    return {west, north, east, south};
  }
  const [left, top] = tile2XY(x, y, z);
  const [right, bottom] = tile2XY(x + 1, y + 1, z);
  return {left, top, right, bottom};
}

function getIdentityTileIndices(viewport, z, extent) {
  const bbox = getBoundingBox(viewport, null, extent);
  const scale = getScale(z);

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

/**
 * Returns all tile indices in the current viewport. If the current zoom level is smaller
 * than minZoom, return an empty array. If the current zoom level is greater than maxZoom,
 * return tiles that are on maxZoom.
 */
export function getTileIndices({viewport, maxZoom, minZoom, zRange, extent, tileSize = TILE_SIZE}) {
  let z = Math.round(viewport.zoom + Math.log2(TILE_SIZE / tileSize));
  if (Number.isFinite(minZoom) && z < minZoom) {
    if (!extent) {
      return [];
    }
    z = minZoom;
  }
  if (Number.isFinite(maxZoom) && z > maxZoom) {
    z = maxZoom;
  }
  return viewport.isGeospatial
    ? getOSMTileIndices(viewport, z, zRange, extent || DEFAULT_EXTENT)
    : getIdentityTileIndices(viewport, z, extent || DEFAULT_EXTENT);
}

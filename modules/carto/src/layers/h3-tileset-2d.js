import {_Tileset2D as Tileset2D} from '@deck.gl/geo-layers';
import {polyfill, getRes0Indexes, h3GetResolution, h3ToGeoBoundary, h3ToParent} from 'h3-js';

export function getHexagonsInBoundingBox({west, north, east, south}, resolution) {
  if (resolution === 0) {
    return getRes0Indexes();
  }
  if (east - west > 180) {
    // This is a known issue in h3-js: polyfill does not work correctly
    // when longitude span is larger than 180 degrees.
    return getHexagonsInBoundingBox({west, north, east: 0, south}, resolution).concat(
      getHexagonsInBoundingBox({west: 0, north, east, south}, resolution)
    );
  }

  // `polyfill()` fills based on hexagon center, which means tiles vanish
  // prematurely. Get more accurate coverage by oversampling
  const oversample = 1;
  const h3Indices = polyfill(
    [
      [
        [west, north],
        [west, south],
        [east, south],
        [east, north],
        [west, north]
      ]
    ],
    resolution + oversample,
    true
  );

  return oversample ? [...new Set(h3Indices.map(i => h3ToParent(i, resolution)))] : h3Indices;
}

export function tileToBoundingBox(index) {
  const coordinates = h3ToGeoBoundary(index);
  const latitudes = coordinates.map(c => c[0]);
  const longitudes = coordinates.map(c => c[1]);
  const west = Math.min(...longitudes);
  const south = Math.min(...latitudes);
  const east = Math.max(...longitudes);
  const north = Math.max(...latitudes);
  return {west, south, east, north};
}

export default class H3Tileset2D extends Tileset2D {
  getTileIndices({viewport, minZoom, maxZoom}) {
    const [east, south, west, north] = viewport.getBounds();

    // TODO ignores extent
    let z = viewport.zoom;
    if (typeof minZoom === 'number' && Number.isFinite(minZoom) && z < minZoom) {
      z = minZoom;
    }
    if (typeof maxZoom === 'number' && Number.isFinite(maxZoom) && z > maxZoom) {
      z = maxZoom;
    }

    // Heuristic to get h3 resolution
    const resolution = Math.max(0, Math.floor((2 * z) / 3) - 2);
    return getHexagonsInBoundingBox({west, north, east, south}, resolution).map(i => ({i}));
  }

  getTileId({i}) {
    return i;
  }

  getTileMetadata({i}) {
    return {bbox: tileToBoundingBox(i)};
  }

  getTileZoom({i}) {
    return h3GetResolution(i);
  }

  getParentIndex(index) {
    const resolution = h3GetResolution(index.i);
    const i = h3ToParent(index.i, resolution - 1);
    return {i};
  }
}

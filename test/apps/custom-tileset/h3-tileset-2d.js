import {_Tileset2D as Tileset2D} from '@deck.gl/geo-layers';
import {polygonToCells, getRes0Cells, getResolution, cellToBoundary, cellToParent} from 'h3-js';

export function getHexagonsInBoundingBox({west, north, east, south}, resolution) {
  if (resolution === 0) {
    return getRes0Cells();
  }
  if (east - west > 180) {
    // This is a known issue in h3-js: polygonToCells does not work correctly
    // when longitude span is larger than 180 degrees.
    return getHexagonsInBoundingBox({west, north, east: 0, south}, resolution).concat(
      getHexagonsInBoundingBox({west: 0, north, east, south}, resolution)
    );
  }

  // `polygonToCells()` fills based on hexagon center, which means tiles vanish
  // prematurely. Get more accurate coverage by oversampling
  const oversample = 1;
  const h3Indices = polygonToCells(
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

  return oversample ? [...new Set(h3Indices.map(i => cellToParent(i, resolution)))] : h3Indices;
}

export function tileToBoundingBox(index) {
  const coordinates = cellToBoundary(index);
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
    return getHexagonsInBoundingBox({west, north, east, south}, resolution).map(h3 => ({h3}));
  }

  getTileId({h3}) {
    return h3;
  }

  getTileMetadata({h3}) {
    return {bbox: tileToBoundingBox(h3)};
  }

  getTileZoom({h3}) {
    return getResolution(h3);
  }

  getParentIndex(index) {
    const resolution = getResolution(index.h3);
    const h3 = cellToParent(index.h3, resolution - 1);
    return {h3};
  }
}

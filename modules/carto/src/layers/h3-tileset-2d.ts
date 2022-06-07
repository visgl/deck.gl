import {_Tileset2D as Tileset2D, GeoBoundingBox} from '@deck.gl/geo-layers';
import {
  polyfill,
  getRes0Indexes,
  geoToH3,
  h3GetResolution,
  h3ToGeoBoundary,
  h3ToParent,
  kRing
} from 'h3-js';

export type H3TileIndex = {i: string};

function getHexagonsInBoundingBox(
  {west, north, east, south}: GeoBoundingBox,
  resolution: number
): string[] {
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
  const oversample = 2;
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

function tileToBoundingBox(index: string): GeoBoundingBox {
  const coordinates = h3ToGeoBoundary(index);
  const latitudes = coordinates.map(c => c[0]);
  const longitudes = coordinates.map(c => c[1]);
  const west = Math.min(...longitudes);
  const south = Math.min(...latitudes);
  const east = Math.max(...longitudes);
  const north = Math.max(...latitudes);
  return {west, south, east, north};
}

// Resolution conversion function. Takes a WebMercatorViewport and returns
// a H3 resolution such that the screen space size of the hexagons is
// similar
// Relative scale factor (0 = no biasing, 2 = a few hexagons cover view)
const BIAS = 2;
function getHexagonResolution(viewport): number {
  const hexagonScaleFactor = (2 / 3) * viewport.zoom;
  const latitudeScaleFactor = Math.log(1 / Math.cos((Math.PI * viewport.latitude) / 180));

  // Clip and bias
  return Math.max(0, Math.floor(hexagonScaleFactor + latitudeScaleFactor - BIAS));
}

export default class H3Tileset2D extends Tileset2D {
  // @ts-expect-error Tileset2D should be generic over TileIndex
  getTileIndices({viewport, minZoom, maxZoom}): H3TileIndex[] {
    const [east, south, west, north] = viewport.getBounds();

    let z = getHexagonResolution(viewport);
    let indices: string[];
    if (typeof minZoom === 'number' && Number.isFinite(minZoom) && z < minZoom) {
      z = minZoom;
    }
    if (typeof maxZoom === 'number' && Number.isFinite(maxZoom) && z > maxZoom) {
      z = maxZoom;

      // Once we are at max zoom, getHexagonsInBoundingBox doesn't work, simply
      // get a ring centered on the hexagon in the viewport center
      const center = geoToH3(viewport.latitude, viewport.longitude, maxZoom);
      indices = kRing(center, 1);
    } else {
      indices = getHexagonsInBoundingBox({west, north, east, south}, z);
    }

    return indices.map(i => ({i}));
  }

  // @ts-expect-error Tileset2D should be generic over TileIndex
  getTileId({i}: H3TileIndex): string {
    return i;
  }

  // @ts-expect-error Tileset2D should be generic over TileIndex
  getTileMetadata({i}: H3TileIndex) {
    return {bbox: tileToBoundingBox(i)};
  }

  // @ts-expect-error Tileset2D should be generic over TileIndex
  getTileZoom({i}: H3TileIndex): number {
    return h3GetResolution(i);
  }

  // @ts-expect-error Tileset2D should be generic over TileIndex
  getParentIndex(index: H3TileIndex): H3TileIndex {
    const resolution = h3GetResolution(index.i);
    const i = h3ToParent(index.i, resolution - 1);
    return {i};
  }
}

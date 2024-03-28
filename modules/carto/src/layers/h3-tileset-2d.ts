import {_Tileset2D as Tileset2D, GeoBoundingBox} from '@deck.gl/geo-layers';
import {
  polygonToCells,
  latLngToCell,
  getResolution,
  cellToBoundary,
  cellToParent,
  gridDisk
} from 'h3-js';

export type H3TileIndex = {i: string};

function getHexagonsInBoundingBox(
  {west, north, east, south}: GeoBoundingBox,
  resolution: number
): string[] {
  const longitudeSpan = Math.abs(east - west);
  if (longitudeSpan > 180) {
    // This is a known issue in h3-js: polygonToCells does not work correctly
    // when longitude span is larger than 180 degrees.
    const nSegments = Math.ceil(longitudeSpan / 180);
    let h3Indices: string[] = [];
    for (let s = 0; s < nSegments; s++) {
      const segmentEast = east + s * 180;
      const segmentWest = Math.min(segmentEast + 179.9999999, west);
      h3Indices = h3Indices.concat(
        getHexagonsInBoundingBox({west: segmentWest, north, east: segmentEast, south}, resolution)
      );
    }
    return [...new Set(h3Indices)];
  }

  // `polygonToCells()` fills based on hexagon center, which means tiles vanish
  // prematurely. Get more accurate coverage by oversampling
  const oversample = 2;
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

function tileToBoundingBox(index: string): GeoBoundingBox {
  const coordinates = cellToBoundary(index);
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
export function getHexagonResolution(
  viewport: {zoom: number; latitude: number},
  tileSize: number
): number {
  // Difference in given tile size compared to deck's internal 512px tile size,
  // expressed as an offset to the viewport zoom.
  const zoomOffset = Math.log2(tileSize / 512);
  const hexagonScaleFactor = (2 / 3) * (viewport.zoom - zoomOffset);
  const latitudeScaleFactor = Math.log(1 / Math.cos((Math.PI * viewport.latitude) / 180));

  // Clip and bias
  return Math.max(0, Math.floor(hexagonScaleFactor + latitudeScaleFactor - BIAS));
}

export default class H3Tileset2D extends Tileset2D {
  /**
   * Returns all tile indices in the current viewport. If the current zoom level is smaller
   * than minZoom, return an empty array. If the current zoom level is greater than maxZoom,
   * return tiles that are on maxZoom.
   */
  // @ts-expect-error Tileset2D should be generic over TileIndex
  getTileIndices({viewport, minZoom, maxZoom}): H3TileIndex[] {
    if (viewport.latitude === undefined) return [];
    const [east, south, west, north] = viewport.getBounds();
    const {tileSize} = this.opts;

    let z = getHexagonResolution(viewport, tileSize);
    let indices: string[];
    if (typeof minZoom === 'number' && Number.isFinite(minZoom) && z < minZoom) {
      // TODO support `extent` prop
      return [];
    }
    if (typeof maxZoom === 'number' && Number.isFinite(maxZoom) && z > maxZoom) {
      z = maxZoom;

      // Once we are at max zoom, getHexagonsInBoundingBox doesn't work, simply
      // get a ring centered on the hexagon in the viewport center
      const center = latLngToCell(viewport.latitude, viewport.longitude, maxZoom);
      indices = gridDisk(center, 1);
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
    return getResolution(i);
  }

  // @ts-expect-error Tileset2D should be generic over TileIndex
  getParentIndex(index: H3TileIndex): H3TileIndex {
    const resolution = getResolution(index.i);
    const i = cellToParent(index.i, resolution - 1);
    return {i};
  }
}

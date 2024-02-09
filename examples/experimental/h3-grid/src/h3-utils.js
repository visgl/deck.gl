import {polygonToCells, getRes0Cells, getIcosahedronFaces, latLngToCell} from 'h3-js';

// Number of hexagons at resolution 10 in tile x:497 y:505 z:10
// This tile is close to the equator and includes a pentagon 8a7400000007fff
// which makes it denser than other tiles
const HEX_COUNT_ZOOM_10_RES_10 = 166283;
// size multiplier when zoom increases by 1
const ZOOM_FACTOR = 1 / 4;
// size multiplier when resolution increases by 1
// h3.numHexagons(n + 1) / h3.numHexagons(n)
const RES_FACTOR = 7;

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

  return polygonToCells(
    [
      [
        [west, north],
        [west, south],
        [east, south],
        [east, north],
        [west, north]
      ]
    ],
    resolution,
    true
  );
}

export function getTileInfo(tile, resolution) {
  if (!tile.centerHexagon) {
    const {west, north, east, south} = tile.bbox;
    const faces = [];

    const NW = latLngToCell(north, west, resolution);
    faces.push(...getIcosahedronFaces(NW));

    const NE = latLngToCell(north, east, resolution);
    faces.push(...getIcosahedronFaces(NE));

    const SW = latLngToCell(south, west, resolution);
    faces.push(...getIcosahedronFaces(SW));

    const SE = latLngToCell(south, east, resolution);
    faces.push(...getIcosahedronFaces(SE));

    tile.hasMultipleFaces = new Set(faces).size > 1;
    tile.centerHexagon = latLngToCell((north + south) / 2, (west + east) / 2, resolution);
  }

  return tile;
}

export function getMinZoom(resolution, maxHexCount) {
  const hexCountZoom10 = HEX_COUNT_ZOOM_10_RES_10 * Math.pow(RES_FACTOR, resolution - 10);
  const maxHexCountZoom = 10 + Math.log2(maxHexCount / hexCountZoom10) / Math.log2(ZOOM_FACTOR);
  return Math.max(0, Math.floor(maxHexCountZoom));
}

import {_Tileset2D as Tileset2D, GeoBoundingBox} from '@deck.gl/geo-layers';
export declare type H3TileIndex = {
  i: string;
};
export declare function getHexagonResolution(viewport: any): number;
export default class H3Tileset2D extends Tileset2D {
  /**
   * Returns all tile indices in the current viewport. If the current zoom level is smaller
   * than minZoom, return an empty array. If the current zoom level is greater than maxZoom,
   * return tiles that are on maxZoom.
   */
  getTileIndices({
    viewport,
    minZoom,
    maxZoom
  }: {
    viewport: any;
    minZoom: any;
    maxZoom: any;
  }): H3TileIndex[];
  getTileId({i}: H3TileIndex): string;
  getTileMetadata({i}: H3TileIndex): {
    bbox: GeoBoundingBox;
  };
  getTileZoom({i}: H3TileIndex): number;
  getParentIndex(index: H3TileIndex): H3TileIndex;
}
// # sourceMappingURL=h3-tileset-2d.d.ts.map

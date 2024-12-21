import {_Tileset2D as Tileset2D} from '@deck.gl/geo-layers';
declare type QuadbinTileIndex = {
  q: bigint;
  i?: string;
};
export default class QuadbinTileset2D extends Tileset2D {
  getTileIndices(opts: any): QuadbinTileIndex[];
  getTileId({q, i}: QuadbinTileIndex): string;
  getTileMetadata({q}: QuadbinTileIndex): Record<string, any>;
  getTileZoom({q}: QuadbinTileIndex): number;
  getParentIndex({q}: QuadbinTileIndex): QuadbinTileIndex;
}
export {};
// # sourceMappingURL=quadbin-tileset-2d.d.ts.map

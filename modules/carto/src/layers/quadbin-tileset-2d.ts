import {_Tileset2D as Tileset2D} from '@deck.gl/geo-layers';
import {bigIntToHex, cellToParent, cellToTile, getResolution, tileToCell} from 'quadbin';

// For calculations bigint representation is used, but
// for constructing URL also provide the hexidecimal value
type QuadbinTileIndex = {q: bigint; i?: string};

export default class QuadbinTileset2D extends Tileset2D {
  // @ts-expect-error for spatial indices, TileSet2d should be parametrized by TileIndexT
  getTileIndices(opts): QuadbinTileIndex[] {
    return super
      .getTileIndices(opts)
      .map(tileToCell)
      .map(q => ({q, i: bigIntToHex(q)}));
  }

  // @ts-expect-error TileIndex must be generic
  getTileId({q, i}: QuadbinTileIndex): string {
    return i || bigIntToHex(q);
  }

  // @ts-expect-error TileIndex must be generic
  getTileMetadata({q}: QuadbinTileIndex) {
    return super.getTileMetadata(cellToTile(q));
  }

  // @ts-expect-error TileIndex must be generic
  getTileZoom({q}: QuadbinTileIndex): number {
    return Number(getResolution(q));
  }

  // @ts-expect-error TileIndex must be generic
  getParentIndex({q}: QuadbinTileIndex): QuadbinTileIndex {
    return {q: cellToParent(q)};
  }
}

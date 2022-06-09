import {_Tileset2D as Tileset2D} from '@deck.gl/geo-layers';

type QuadkeyTileIndex = {i: string};
function tileToQuadkey(tile): QuadkeyTileIndex {
  let index = '';
  for (let z = tile.z; z > 0; z--) {
    let b = 0;
    const mask = 1 << (z - 1);
    if ((tile.x & mask) !== 0) b++;
    if ((tile.y & mask) !== 0) b += 2;
    index += b.toString();
  }
  return {i: index};
}

export default class QuadkeyTileset2D extends Tileset2D {
  // @ts-expect-error for spatial indices, TileSet2d should be parametrized by TileIndexT
  getTileIndices(opts): QuadkeyTileIndex[] {
    return super.getTileIndices(opts).map(tileToQuadkey);
  }

  // @ts-expect-error TileIndex must be generic
  getTileId({i}: QuadkeyTileIndex) {
    return i;
  }

  getTileMetadata() {
    return {};
  }

  // @ts-expect-error TileIndex must be generic
  getTileZoom({i}: QuadkeyTileIndex) {
    return i.length;
  }

  // @ts-expect-error TileIndex must be generic
  getParentIndex(index: QuadkeyTileIndex) {
    const i = index.i.slice(0, -1);
    return {i};
  }
}

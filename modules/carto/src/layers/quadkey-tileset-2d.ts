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

function quadkeyToTile(index: QuadkeyTileIndex) {
  const quadkey = index.i;
  const tile = {x: 0, y: 0, z: quadkey.length};

  for (let i = tile.z; i > 0; i--) {
    const mask = 1 << (i - 1);
    const q = Number(quadkey[tile.z - i]);
    if (q === 1) tile.x |= mask;
    if (q === 2) tile.y |= mask;
    if (q === 3) {
      tile.x |= mask;
      tile.y |= mask;
    }
  }
  return tile;
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

  // @ts-expect-error TileIndex must be generic
  getTileMetadata(index: QuadkeyTileIndex) {
    return super.getTileMetadata(quadkeyToTile(index));
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

import {_Tileset2D as Tileset2D} from '@deck.gl/geo-layers';

type QuadbinTileIndex = {i: string};

const B = [
  0x5555555555555555n,
  0x3333333333333333n,
  0x0f0f0f0f0f0f0f0fn,
  0x00ff00ff00ff00ffn,
  0x0000ffff0000ffffn,
  0x00000000ffffffffn
];
const S = [0n, 1n, 2n, 4n, 8n, 16n];

function indexToBigInt(index: QuadbinTileIndex): bigint {
  return BigInt(`0x${index.i}`);
}

function bigIntToIndex(quadbin: bigint): QuadbinTileIndex {
  return {i: quadbin.toString(16)};
}

export function tileToQuadbin(tile): QuadbinTileIndex {
  if (tile.z < 0 || tile.z > 26) {
    throw new Error('Wrong zoom');
  }
  const z = BigInt(tile.z);
  let x = BigInt(tile.x) << (32n - z);
  let y = BigInt(tile.y) << (32n - z);

  for (let i = 0; i < 5; i++) {
    const s = S[5 - i];
    const b = B[4 - i];
    x = (x | (x << s)) & b;
    y = (y | (y << s)) & b;
  }

  const quadbin =
    0x4000000000000000n |
    (1n << 59n) | // | (mode << 59) | (mode_dep << 57)
    (z << 52n) |
    ((x | (y << 1n)) >> 12n) |
    (0xfffffffffffffn >> (z * 2n));
  return bigIntToIndex(quadbin);
}

export function quadbinToTile(index: QuadbinTileIndex) {
  const quadbin = indexToBigInt(index);
  const mode = (quadbin >> 59n) & 7n;
  const modeDep = (quadbin >> 57n) & 3n;
  const z = (quadbin >> 52n) & 0x1fn;
  const q = (quadbin & 0xfffffffffffffn) << 12n;

  if (mode !== 1n && modeDep !== 0n) {
    throw new Error('Wrong mode');
  }

  let x = q;
  let y = q >> 1n;

  for (let i = 0; i < 6; i++) {
    const s = S[i];
    const b = B[i];
    x = (x | (x >> s)) & b;
    y = (y | (y >> s)) & b;
  }

  x = x >> (32n - z);
  y = y >> (32n - z);

  return {z: Number(z), x: Number(x), y: Number(y)};
}

export function quadbinZoom(index: QuadbinTileIndex) {
  const quadbin = indexToBigInt(index);
  return (quadbin >> 52n) & 0x1fn;
}

export function quadbinParent(index: QuadbinTileIndex) {
  const quadbin = indexToBigInt(index);
  const zparent = quadbinZoom(index) - 1n;
  const parent =
    (quadbin & ~(0x1fn << 52n)) | (zparent << 52n) | (0xfffffffffffffn >> (zparent * 2n));
  return bigIntToIndex(parent);
}

function tileToQuadkey(tile) {
  let index = '';
  for (let z = tile.z; z > 0; z--) {
    let b = 0;
    const mask = 1 << (z - 1);
    if ((tile.x & mask) !== 0) b++;
    if ((tile.y & mask) !== 0) b += 2;
    index += b.toString();
  }
  return index;
}

// Hack in quadkeys so we can use API
function addQuadkey(index: QuadbinTileIndex) {
  const tile = quadbinToTile(index);
  const quadkey = tileToQuadkey(tile);
  return {...index, quadkey};
}

export default class QuadbinTileset2D extends Tileset2D {
  // @ts-expect-error for spatial indices, TileSet2d should be parametrized by TileIndexT
  getTileIndices(opts): QuadbinTileIndex[] {
    return super.getTileIndices(opts).map(tileToQuadbin);
  }

  // @ts-expect-error TileIndex must be generic
  getTileId({i}: QuadbinTileIndex) {
    return i;
  }

  // @ts-expect-error TileIndex must be generic
  getTileMetadata(index: QuadbinTileIndex) {
    return super.getTileMetadata(quadbinToTile(index));
  }

  // @ts-expect-error TileIndex must be generic
  getTileZoom(index: QuadbinTileIndex) {
    return Number(quadbinZoom(index));
  }

  // @ts-expect-error TileIndex must be generic
  getParentIndex(index: QuadbinTileIndex) {
    return quadbinParent(index);
  }
}

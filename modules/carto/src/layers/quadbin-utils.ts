import {worldToLngLat} from '@math.gl/web-mercator';
import {quadbinToTile, tileToQuadkey} from './quadbin-tileset-2d';

const TILE_SIZE = 512;

// Use existing functions for now
export function quadbinToWorldBounds(quadbin: string): [number[], number[]] {
  const tile = quadbinToTile({i: quadbin});
  const quadkey = tileToQuadkey(tile);
  return quadkeyToWorldBounds(quadkey);
}

function quadkeyToWorldBounds(quadkey: string): [number[], number[]] {
  let x = 0;
  let y = 0;
  let mask = 1 << quadkey.length;
  const scale = mask / TILE_SIZE;

  for (let i = 0; i < quadkey.length; i++) {
    mask >>= 1;
    const q = parseInt(quadkey[i]);
    if (q % 2) x |= mask;
    if (q > 1) y |= mask;
  }
  return [
    [x / scale, TILE_SIZE - y / scale],
    [(x + 0.99) / scale, TILE_SIZE - (y + 0.99) / scale]
  ];
}

export function getQuadbinPolygon(quadbin: string): number[] {
  const [topLeft, bottomRight] = quadbinToWorldBounds(quadbin);
  const [w, n] = worldToLngLat(topLeft);
  const [e, s] = worldToLngLat(bottomRight);
  return [e, n, e, s, w, s, w, n, e, n];
}

import {worldToLngLat} from '@math.gl/web-mercator';

const TILE_SIZE = 512;

export function quadkeyToWorldBounds(quadkey: string, coverage: number): [number[], number[]] {
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
    [(x + coverage) / scale, TILE_SIZE - (y + coverage) / scale]
  ];
}

export function getQuadkeyPolygon(quadkey: string, coverage = 1): number[] {
  const [topLeft, bottomRight] = quadkeyToWorldBounds(quadkey, coverage);
  const [w, n] = worldToLngLat(topLeft);
  const [e, s] = worldToLngLat(bottomRight);
  return [e, n, e, s, w, s, w, n, e, n];
}

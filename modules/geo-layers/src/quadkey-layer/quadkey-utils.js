import {worldToLngLat} from '@math.gl/web-mercator';

const TILE_SIZE = 512;

export function quadkeyToWorldBounds(quadkey) {
  let x = 0;
  let y = 0;
  let mask = 1 << quadkey.length;
  const scale = mask / TILE_SIZE;

  for (let i = 0; i < quadkey.length; i++) {
    mask >>= 1;
    let q = parseInt(quadkey[i]);
    if (q % 2) x |= mask;
    if (q > 1) y |= mask;
  }
  return [
    [x / scale, TILE_SIZE - y / scale],
    [(x + 1) / scale, TILE_SIZE - (y + 1) / scale]
  ];
}

export function getQuadkeyPolygon(quadkey) {
  const [topLeft, bottomRight] = quadkeyToWorldBounds(quadkey);
  const [w, n] = worldToLngLat(topLeft);
  const [e, s] = worldToLngLat(bottomRight);
  return [new Float64Array([e, n, e, s, w, s, w, n, e, n])];
}

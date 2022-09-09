import {worldToLngLat} from '@math.gl/web-mercator';
import {cellToTile, hexToBigInt} from 'quadbin';

const TILE_SIZE = 512;

export function quadbinToWorldBounds(quadbin: string): [number[], number[]] {
  const {x, y, z} = cellToTile(hexToBigInt(quadbin));
  const mask = 1 << z;
  const scale = mask / TILE_SIZE;
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

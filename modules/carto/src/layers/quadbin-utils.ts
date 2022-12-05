import {worldToLngLat} from '@math.gl/web-mercator';
import {cellToTile} from 'quadbin';

const TILE_SIZE = 512;

export function quadbinToWorldBounds(quadbin: bigint, coverage: number): [number[], number[]] {
  const {x, y, z} = cellToTile(quadbin);
  const mask = 1 << z;
  const scale = mask / TILE_SIZE;
  return [
    [x / scale, TILE_SIZE - y / scale],
    [(x + coverage) / scale, TILE_SIZE - (y + coverage) / scale]
  ];
}

export function getQuadbinPolygon(quadbin: bigint, coverage = 1): number[] {
  const [topLeft, bottomRight] = quadbinToWorldBounds(quadbin, coverage);
  const [w, n] = worldToLngLat(topLeft);
  const [e, s] = worldToLngLat(bottomRight);
  return [e, n, e, s, w, s, w, n, e, n];
}

// eslint-disable-next-line camelcase
import {decode_bbox} from 'ngeohash';

export function getGeohashPolygon(geohash: string): number[] {
  const [s, w, n, e] = decode_bbox(geohash);

  return [e, n, e, s, w, s, w, n, e, n];
}

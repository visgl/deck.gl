import Protobuf from 'pbf';
import {KeyValueProperties} from './carto-tile';
import {Properties} from './spatialjson-utils';

export function parsePbf(buffer: ArrayBuffer, TileReader) {
  const pbf = new Protobuf(buffer);
  const tile = TileReader.read(pbf);
  return tile;
}

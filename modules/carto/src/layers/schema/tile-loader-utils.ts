import Protobuf from 'pbf';
import {KeyValueProperties} from './carto-tile';
import {Properties} from './spatialjson-utils';

export function parsePbf(buffer: ArrayBuffer, TileReader) {
  const pbf = new Protobuf(buffer);
  const tile = TileReader.read(pbf);
  return tile;
}

export function unpackProperties(properties: KeyValueProperties[]): Properties[] {
  if (!properties || !properties.length) {
    return [];
  }
  return properties.map(item => {
    const currentRecord: Properties = {};
    item.data.forEach(({key, value}) => {
      currentRecord[key] = value;
    });
    return currentRecord;
  });
}

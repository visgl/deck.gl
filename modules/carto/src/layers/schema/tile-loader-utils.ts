import Protobuf from 'pbf';

export function parsePbf(buffer: ArrayBuffer, TileReader) {
  const pbf = new Protobuf(buffer);
  const tile = TileReader.read(pbf);
  return tile;
}

import {IndexScheme} from './spatialjson-utils';
import {NumericProp, NumericPropKeyValueReader, Properties, PropertiesReader} from './carto-tile';

// Ints ========================================

export interface Ints {
  value: BigUint64Array;
}

export class IntsReader {
  static read(pbf, end?: number): Ints {
    const {value} = pbf.readFields(IntsReader._readField, {value: []}, end);
    return {value: new BigUint64Array(value)};
  }
  static _readField(this: void, tag: number, obj, pbf) {
    if (tag === 1) readPackedFixed64(pbf, obj.value);
  }
}

// Cells =========================================

interface Cells {
  indices: Ints;
  properties: Properties[];
  numericProps: Record<string, NumericProp>;
}

class CellsReader {
  static read(pbf, end?: number): Cells {
    return pbf.readFields(
      CellsReader._readField,
      {indices: null, properties: [], numericProps: {}},
      end
    );
  }
  static _readField(this: void, tag: number, obj: Cells, pbf) {
    if (tag === 1) obj.indices = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2) obj.properties.push(PropertiesReader.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 3) {
      const entry = NumericPropKeyValueReader.read(pbf, pbf.readVarint() + pbf.pos);
      obj.numericProps[entry.key] = entry.value;
    }
  }
}

// Tile ========================================

const IndexSchemeMap = {
  0: 'h3',
  1: 'quadbin'
};

export interface Tile {
  scheme: IndexScheme;
  cells: Cells;
}

export class TileReader {
  static read(pbf, end?: number): Tile {
    return pbf.readFields(TileReader._readField, {scheme: 0, cells: null}, end);
  }
  static _readField(this: void, tag: number, obj: Tile, pbf) {
    if (tag === 1) obj.scheme = pbf.readVarint();
    else if (tag === 2) obj.cells = CellsReader.read(pbf, pbf.readVarint() + pbf.pos);
  }
}

// pbf doesn't support BigInt natively, implement support for packed fixed64 type
const SHIFT_LEFT_32 = BigInt((1 << 16) * (1 << 16));

function readPackedEnd(pbf) {
  return pbf.type === 2 ? pbf.readVarint() + pbf.pos : pbf.pos + 1;
}
function readFixed64(pbf) {
  const a = BigInt(pbf.readFixed32());
  const b = BigInt(pbf.readFixed32());
  return a + b * SHIFT_LEFT_32;
}

function readPackedFixed64(pbf, arr) {
  if (pbf.type !== 2) return arr.push(readFixed64(pbf));
  const end = readPackedEnd(pbf);
  arr = arr || [];
  while (pbf.pos < end) arr.push(readFixed64(pbf));
  return arr;
}

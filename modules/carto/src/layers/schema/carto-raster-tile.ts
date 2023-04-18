import {readPackedTypedArray} from './fast-pbf';

const ARRAY_TYPES = {
  uint8: Uint8Array,
  uint16: Uint16Array,
  uint32: Uint32Array,
  uint64: BigUint64Array,
  int8: Int8Array,
  int16: Int16Array,
  int32: Int32Array,
  int64: BigInt64Array,
  float32: Float32Array,
  float64: Float64Array
};

// Band ========================================

export class BandReader {
  static read(pbf, end?: number) {
    return pbf.readFields(BandReader._readField, {name: '', type: '', data: null}, end);
  }

  static _readField(this: void, tag, obj, pbf) {
    if (tag === 1) obj.name = pbf.readString();
    else if (tag === 2) obj.type = pbf.readString();
    else if (tag === 3) {
      const TypedArray = ARRAY_TYPES[obj.type];
      if (!TypedArray) {
        throw Error(`Invalid data type: ${obj.type}`);
      }
      obj.data = {};
      readPackedTypedArray(TypedArray, pbf, obj.data);
    }
  }
}

export class TileReader {
  static read(pbf, end) {
    return pbf.readFields(TileReader._readField, {blockWidth: 0, blockHeight: 0, bands: []}, end);
  }
  static _readField(this: void, tag, obj, pbf) {
    if (tag === 1) obj.blockWidth = pbf.readVarint();
    else if (tag === 2) obj.blockHeight = pbf.readVarint();
    else if (tag === 3) obj.bands.push(BandReader.read(pbf, pbf.readVarint() + pbf.pos));
  }
}

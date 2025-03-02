// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {readPackedTypedArray} from './fast-pbf';
import {Indices, IndexScheme} from './spatialjson-utils';
import {NumericProp, NumericPropKeyValueReader, PropertiesReader} from './carto-tile';

// Indices =====================================

export class IndicesReader {
  static read(pbf, end?: number): Indices {
    return pbf.readFields(IndicesReader._readField, {value: []}, end);
  }
  static _readField(this: void, tag: number, obj, pbf) {
    if (tag === 1) readPackedTypedArray(BigUint64Array, pbf, obj);
  }
}

// Cells =========================================

interface Cells {
  indices: Indices;
  properties: Record<string, string>[];
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
    if (tag === 1) obj.indices = IndicesReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2) obj.properties.push(PropertiesReader.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 3) {
      const entry = NumericPropKeyValueReader.read(pbf, pbf.readVarint() + pbf.pos);
      obj.numericProps[entry.key] = entry.value;
    }
  }
}

// Tile ========================================

// TODO this type is very similar to SpatialBinary, should align
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

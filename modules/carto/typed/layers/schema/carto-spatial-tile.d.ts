import {Indices, IndexScheme} from './spatialjson-utils';
import {KeyValueProperties, NumericProp} from './carto-tile';
export declare class IndicesReader {
  static read(pbf: any, end?: number): Indices;
  static _readField(this: void, tag: number, obj: any, pbf: any): void;
}
interface Cells {
  indices: Indices;
  properties: KeyValueProperties[];
  numericProps: Record<string, NumericProp>;
}
export interface Tile {
  scheme: IndexScheme;
  cells: Cells;
}
export declare class TileReader {
  static read(pbf: any, end?: number): Tile;
  static _readField(this: void, tag: number, obj: Tile, pbf: any): void;
}
export {};
// # sourceMappingURL=carto-spatial-tile.d.ts.map

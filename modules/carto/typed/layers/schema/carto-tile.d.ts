interface KeyValueObject {
  key: string;
  value: string;
}
export interface KeyValueProperties {
  data: KeyValueObject[];
}
export declare class PropertiesReader {
  static read(pbf: any, end?: number): any;
  static _readField(this: void, tag: number, obj: KeyValueProperties, pbf: any): void;
}
interface Doubles {
  value: Float32Array;
  size: number;
}
interface Ints {
  value: Uint32Array;
  size: number;
}
interface Fields {
  id: number;
}
export interface NumericProp {
  value: number[];
}
interface NumbericPropKeyValue {
  key: string;
  value: NumericProp;
}
export declare class NumericPropKeyValueReader {
  static read(pbf: any, end?: number): NumbericPropKeyValue;
  static _readField(this: void, tag: number, obj: NumbericPropKeyValue, pbf: any): void;
}
interface Points {
  positions: Doubles;
  globalFeatureIds: Ints;
  featureIds: Ints;
  properties: KeyValueProperties[];
  numericProps: Record<string, NumericProp>;
  fields: Fields[];
}
interface Lines extends Points {
  pathIndices: Ints;
}
interface Polygons extends Points {
  polygonIndices: Ints;
  primitivePolygonIndices: Ints;
  triangles: Ints;
}
export interface Tile {
  points: Points;
  lines: Lines;
  polygons: Polygons;
}
export declare class TileReader {
  static read(pbf: any, end?: number): Tile;
  static _readField(this: void, tag: number, obj: Tile, pbf: any): void;
}
export {};
// # sourceMappingURL=carto-tile.d.ts.map

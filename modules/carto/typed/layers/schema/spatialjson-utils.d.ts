export declare type IndexScheme = 'h3' | 'quadbin';
declare type TypedArray = Float32Array | Float64Array;
export declare type Indices = {
  value: BigUint64Array;
};
export declare type NumericProps = Record<
  string,
  {
    value: number[] | TypedArray;
  }
>;
export declare type Properties = Record<string, string | number | boolean | null>;
export declare type Cells = {
  indices: Indices;
  numericProps: NumericProps;
  properties: Properties[];
};
export declare type SpatialBinary = {
  scheme?: IndexScheme;
  cells: Cells;
};
export declare type SpatialJson = {
  id: string | bigint;
  properties: Properties;
}[];
export declare function binaryToSpatialjson(binary: SpatialBinary): SpatialJson;
export {};
// # sourceMappingURL=spatialjson-utils.d.ts.map

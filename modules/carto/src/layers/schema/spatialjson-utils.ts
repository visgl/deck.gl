import {bigIntToIndex} from '../quadbin-utils';

export type IndexScheme = 'h3' | 'quadbin';
type TypedArray = Float32Array | Float64Array;

export type Indices = {value: BigUint64Array};
export type NumericProps = {[x: string]: {value: TypedArray}};
export type Cells = {
  indices: Indices;
  numericProps: NumericProps;
  properties: {[x: string]: string | number | boolean | null}[];
};
type SpatialBinary = {scheme?: IndexScheme; cells: Cells};
type SpatialJson = {id: string; properties: {[x: string]: string | number | boolean | null}}[];

export function binaryToSpatialjson(binary: SpatialBinary): SpatialJson {
  const {cells} = binary;
  const count = cells.indices.value.length;
  const spatial: any[] = [];
  for (let i = 0; i < count; i++) {
    const id = bigIntToIndex(cells.indices.value[i]);

    const properties = {...cells.properties[i]};
    for (const key of Object.keys(cells.numericProps)) {
      properties[key] = cells.numericProps[key].value[i];
    }
    spatial.push({id, properties});
  }

  return spatial;
}

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Uint8ClampedArray
  | Float32Array
  | Float64Array;

export type NumericArray = number[] | TypedArray;

export type ConstructorOf<T> = {
  new (...args): T;
};

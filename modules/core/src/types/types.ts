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

export type TypedArrayConstructor =
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

export type NumericArray = number[] | TypedArray;

export interface ConstructorOf<T> {
  new (...args): T;
}

// Standin for luma.gl types that are not exported or not properly typed
// TODO - import from luma.gl after upgrading to v9

/** luma.gl shader module */
export type ShaderModule<SettingsT = any> = {
  name: string;
  fs?: string;
  vs?: string;
  uniforms?: Record<string, any>;
  getUniforms?: (opts: SettingsT | {}, uniforms: Record<string, any>) => Record<string, any>;
  defines?: Record<string, any>;
  dependencies?: ShaderModule[];
  inject?: Record<string, string>;
  passes?: {
    sampler?: string | boolean;
    filter?: boolean;
    uniforms?: Record<string, any>;
  }[];
};

// deck.gl, MIT license

export {TypedArray, TypedArrayConstructor, NumberArray as NumericArray} from '@luma.gl/api';

export interface ConstructorOf<T> {
  new (...args): T;
}

import {ShaderModule as _ShaderModule} from '@luma.gl/shadertools';

export type ShaderModule<SettingsT = any> = _ShaderModule & {
  // name: string;
  // fs?: string;
  // vs?: string;
  // uniforms?: Record<string, any>;
  // defines?: Record<string, any>;
  // dependencies?: ShaderModule[];
  // inject?: Record<string, string>;
  // getUniforms?: (opts: SettingsT | {}, uniforms: Record<string, any>) => Record<string, any>;
  passes?: {
    sampler?: string | boolean;
    filter?: boolean;
    uniforms?: Record<string, any>;
  }[];
};

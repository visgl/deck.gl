// luma.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {NumberArray} from '@math.gl/types';
import {Sampler, Texture} from '@luma.gl/core';

// export type BindingValue = Buffer | Texture | Sampler;
export type BindingValue = any;
// export type UniformValue = number | boolean | Readonly<NumberArray>; // Float32Array> | Readonly<Int32Array> | Readonly<Uint32Array> | Readonly<number[]>;
export type UniformValue = number | boolean | number[];
import {UniformTypes} from './misc/uniform-types';

// Helper types
type FilterKeysByType<T> = {[K in keyof T]: T[K] extends UniformValue ? K : never}[keyof T];
type UniformsOnly<T> = {[K in FilterKeysByType<T>]: T[K]};

/**
 * A shader module definition object
 *
 * @note Needs to be initialized with `initializeShaderModules`
 */
export type ShaderModule<
  PropsT extends Record<string, UniformValue | BindingValue> = Record<
    string,
    UniformValue | BindingValue
  >,
  UniformsT extends Record<string, UniformValue> = Record<string, UniformValue>,
  BindingsT extends Record<string, BindingValue> = Record<string, BindingValue>
> = {
  /** Used for type inference not for values */
  props?: PropsT;
  /** Used for type inference, not currently used for values */
  uniforms?: UniformsT;

  name: string;

  /** WGSL code */
  source?: string;
  /** GLSL fragment shader code */
  fs?: string;
  /** GLSL vertex shader code */
  vs?: string;

  /** Uniform shader types @note: Both order and types MUST match uniform block declarations in shader */
  // uniformTypes?: Record<keyof UniformsT, UniformFormat>;
  uniformTypes: UniformTypes<UniformsOnly<PropsT>>;
  /** Default prop values */
  defaultProps?: Required<PropsT>;

  /** Function that maps props to uniforms & bindings */
  getUniforms?: (props?: any, oldProps?: any) => Record<string, BindingValue | UniformValue>;

  /** uniform buffers, textures, samplers, storage, ... */
  bindings?: Record<keyof BindingsT, {location: number; type: 'texture' | 'sampler' | 'uniforms'}>;

  defines?: Record<string, string | number>;
  /** Injections */
  inject?: Record<string, string | {injection: string; order: number}>;
  dependencies?: ShaderModule<any, any>[];
};

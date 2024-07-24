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
type FilterBindingKeys<T> = {[K in keyof T]: T[K] extends UniformValue ? never : K}[keyof T];
type FilterUniformKeys<T> = {[K in keyof T]: T[K] extends UniformValue ? K : never}[keyof T];
type BindingsOnly<T> = {[K in FilterBindingKeys<Required<T>>]: T[K]};
type UniformsOnly<T> = {[K in FilterUniformKeys<Required<T>>]: T[K]};

/**
 * A shader module definition object
 *
 * @note Needs to be initialized with `initializeShaderModules`
 */
export type ShaderModule<
  PropsT extends Record<string, any> = Record<string, any>,
  UniformTypesT extends Record<string, UniformFormat> = UniformTypes<UniformsOnly<PropsT>>,
  BindingsT extends Record<string, BindingValue> = BindingsOnly<PropsT>
> = {
  /** Used for type inference not for values */
  props?: PropsT;
  name: string;

  /** WGSL code */
  source?: string;
  /** GLSL fragment shader code */
  fs?: string;
  /** GLSL vertex shader code */
  vs?: string;

  /** Uniform shader types @note: Both order and types MUST match uniform block declarations in shader */
  uniformTypes?: UniformTypesT;
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

// Duplicated from luma
type UniformFormat =
  | 'f32'
  | 'i32'
  | 'u32'
  | 'vec2<f32>'
  | 'vec3<f32>'
  | 'vec4<f32>'
  | 'vec2<i32>'
  | 'vec3<i32>'
  | 'vec4<i32>'
  | 'vec2<u32>'
  | 'vec3<u32>'
  | 'vec4<u32>'
  | 'mat2x2<f32>'
  | 'mat2x3<f32>'
  | 'mat2x4<f32>'
  | 'mat3x2<f32>'
  | 'mat3x3<f32>'
  | 'mat3x4<f32>'
  | 'mat4x2<f32>'
  | 'mat4x3<f32>'
  | 'mat4x4<f32>';

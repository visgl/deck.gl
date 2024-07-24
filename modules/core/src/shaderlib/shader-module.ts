// luma.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Sampler, Texture} from '@luma.gl/core';

export type BindingValue = Buffer | Texture | Sampler;
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
  UniformsT extends Record<string, UniformValue> = UniformsOnly<PropsT>,
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
  uniformTypes?: Required<UniformTypes<UniformsT>>; // Record<keyof UniformsT, UniformFormat>;
  /** Default uniform values */
  defaultUniforms?: Required<UniformsT>; // Record<keyof UniformsT, UniformValue>;

  /** Function that maps props to uniforms & bindings */
  getUniforms?: (props?: any, oldProps?: any) => Record<string, BindingValue | UniformValue>;

  /** uniform buffers, textures, samplers, storage, ... */
  bindings?: Record<keyof BindingsT, {location: number; type: 'texture' | 'sampler' | 'uniforms'}>;

  defines?: Record<string, string | number>;
  /** Injections */
  inject?: Record<string, string | {injection: string; order: number}>;
  dependencies?: ShaderModule<any, any>[];
};

// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {fp32} from '@luma.gl/shadertools';
import type {ShaderModule} from '../shader-module';
import geometry from '../misc/geometry';
import projectShader from './project.glsl';
import {getUniformsFromViewport} from './viewport-uniforms';

import type {ProjectModuleSettings, ProjectUniforms} from './viewport-uniforms';
import {UniformTypes} from '../misc/uniform-types';

const INITIAL_MODULE_OPTIONS = {};

function getUniforms(opts: ProjectModuleSettings | {} = INITIAL_MODULE_OPTIONS) {
  if ('viewport' in opts) {
    return getUniformsFromViewport(opts);
  }
  return {};
}

export default {
  name: 'project',
  dependencies: [fp32, geometry],
  vs: projectShader,
  getUniforms,
  uniformTypes: {
    wrapLongitude: 'f32',
    coordinateSystem: 'i32',
    commonUnitsPerMeter: 'vec3<f32>',
    projectionMode: 'i32',
    scale: 'f32',
    commonUnitsPerWorldUnit: 'vec3<f32>',
    commonUnitsPerWorldUnit2: 'vec3<f32>',
    center: 'vec4<f32>',
    modelMatrix: 'mat4x4<f32>',
    viewProjectionMatrix: 'mat4x4<f32>',
    viewportSize: 'vec2<f32>',
    devicePixelRatio: 'f32',
    focalDistance: 'f32',
    cameraPosition: 'vec3<f32>',
    coordinateOrigin: 'vec3<f32>',
    commonOrigin: 'vec3<f32>',
    pseudoMeters: 'f32'
  }
} as const satisfies ShaderModule<ProjectModuleSettings, UniformTypes<ProjectUniforms>>;

// Check type
type ResolvedUniformTypes = NonNullable<
  ShaderModule<ProjectModuleSettings, UniformTypes<ProjectUniforms>>['uniformTypes']
>;
type ResolvedBindings = NonNullable<
  ShaderModule<ProjectModuleSettings, UniformTypes<ProjectUniforms>>['bindings']
>;

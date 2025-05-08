// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {fp32, ShaderModule} from '@luma.gl/shadertools';
import geometry from '../misc/geometry';
import {getUniformsFromViewport} from './viewport-uniforms';
import {projectWGSL} from './project.wgsl';
import {projectGLSL} from './project.glsl';

import type {ProjectProps, ProjectUniforms} from './viewport-uniforms';

const INITIAL_MODULE_OPTIONS = {};

function getUniforms(opts: ProjectProps | {} = INITIAL_MODULE_OPTIONS) {
  if ('viewport' in opts) {
    return getUniformsFromViewport(opts);
  }
  return {};
}

export default {
  name: 'project',
  dependencies: [fp32, geometry],
  source: projectWGSL,
  vs: projectGLSL,
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
  // @ts-ignore TODO v9.1
} as const satisfies ShaderModule<ProjectProps, ProjectUniforms, {}>;

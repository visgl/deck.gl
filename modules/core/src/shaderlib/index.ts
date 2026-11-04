// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  type ShaderAssembler,
  type ShaderInjectionTarget,
  GLSLShaderAssembler,
  WGSLShaderAssembler,
  gouraudMaterial,
  phongMaterial
} from '@luma.gl/shaders';
import {GPUVectorModel, Model} from '@luma.gl/engine';
import {layerUniforms} from './misc/layer-uniforms';
import color from './color/color';
import geometry from './misc/geometry';
import project from './project/project';
import project32 from './project32/project32';
import shadow, {shadowPlugin} from './shadow/shadow';
import picking, {pickingPlugin} from './picking/picking';

const DEFAULT_MODULES = [geometry];

// GLSL and WGSL share target names with language-specific signatures.
const SHADER_INJECTION_TARGETS: ShaderInjectionTarget[] = [
  {
    name: 'DECKGL_FILTER_SIZE',
    stage: 'vertex',
    glsl: {parameters: 'inout vec3 size, VertexGeometry geometry'},
    wgsl: {parameters: 'size: ptr<function, vec3<f32>>, geometry: VertexGeometry'}
  },
  {
    name: 'DECKGL_FILTER_GL_POSITION',
    stage: 'vertex',
    glsl: {parameters: 'inout vec4 position, VertexGeometry geometry'},
    wgsl: {parameters: 'position: ptr<function, vec4<f32>>, geometry: VertexGeometry'}
  },
  {
    name: 'DECKGL_FILTER_COLOR',
    stage: 'vertex',
    glsl: {parameters: 'inout vec4 color, VertexGeometry geometry'},
    wgsl: {parameters: 'color: ptr<function, vec4<f32>>, geometry: VertexGeometry'}
  },
  {
    name: 'DECKGL_FILTER_COLOR',
    stage: 'fragment',
    glsl: {parameters: 'inout vec4 color, FragmentGeometry geometry'},
    wgsl: {parameters: 'color: ptr<function, vec4<f32>>, geometry: FragmentGeometry'}
  }
];

function createShaderAssembler(language: 'glsl' | 'wgsl'): ShaderAssembler {
  const shaderAssembler =
    language === 'wgsl' ? new WGSLShaderAssembler() : new GLSLShaderAssembler();

  for (const shaderModule of DEFAULT_MODULES) {
    shaderAssembler.addDefaultModule(shaderModule);
  }

  // Each assembler selects its language implementation from the shared targets.
  for (const shaderInjectionTarget of SHADER_INJECTION_TARGETS) {
    shaderAssembler.addShaderInjectionTarget(shaderInjectionTarget);
  }

  return shaderAssembler;
}

// Shared registries preserve application-wide module and injection target registration.
const glslShaderAssembler = createShaderAssembler('glsl');
const wgslShaderAssembler = createShaderAssembler('wgsl');

// Model snapshots its base defaults, so both classes need the WebGL fallback.
// luma ignores this default on devices using a different shader language.
GPUVectorModel.defaultProps.shaderAssembler = glslShaderAssembler;
Model.defaultProps.shaderAssembler = glslShaderAssembler;

/** Return deck.gl's shared shader assembler for registering modules and injection targets. */
export function getShaderAssembler(language: 'glsl' | 'wgsl'): ShaderAssembler {
  return language === 'wgsl' ? wgslShaderAssembler : glslShaderAssembler;
}

export {
  layerUniforms,
  color,
  picking,
  pickingPlugin,
  project,
  project32,
  gouraudMaterial,
  phongMaterial,
  shadow,
  shadowPlugin
};

// Useful for custom shader modules
export type {ProjectProps, ProjectUniforms} from './project/viewport-uniforms';

// TODO - these should be imported from luma.gl
/* eslint-disable camelcase */
export type PickingUniforms = {
  picking_uActive: boolean;
  picking_uAttribute: boolean;
  picking_uSelectedColor: [number, number, number];
  picking_uSelectedColorValid: boolean;
  picking_uHighlightColor: [number, number, number, number];
};

export type LightingModuleSettings = {
  material:
    | boolean
    | {
        ambient?: number;
        diffuse?: number;
        shininess?: number;
        specularColor?: [number, number, number];
      };
};

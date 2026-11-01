// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  type ShaderAssembler,
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
import shadow from './shadow/shadow';
import picking from './picking/picking';

const DEFAULT_MODULES = [geometry];

const SHADER_HOOKS_GLSL = [
  'vs:DECKGL_FILTER_SIZE(inout vec3 size, VertexGeometry geometry)',
  'vs:DECKGL_FILTER_GL_POSITION(inout vec4 position, VertexGeometry geometry)',
  'vs:DECKGL_FILTER_COLOR(inout vec4 color, VertexGeometry geometry)',
  'fs:DECKGL_FILTER_COLOR(inout vec4 color, FragmentGeometry geometry)'
];

// Separate names prevent legacy GLSL module injections from entering WGSL hooks.
const SHADER_HOOKS_WGSL = [
  'vs:DECKGL_FILTER_VERTEX_SIZE(size: ptr<function, vec3<f32>>, geometry: Geometry)',
  'vs:DECKGL_FILTER_POSITION(position: ptr<function, vec4<f32>>, geometry: Geometry)',
  'fs:DECKGL_FILTER_FRAGMENT_COLOR(color: ptr<function, vec4<f32>>, geometry: FragmentGeometry)'
];

function createShaderAssembler(language: 'glsl' | 'wgsl'): ShaderAssembler {
  const shaderAssembler =
    language === 'wgsl' ? new WGSLShaderAssembler() : new GLSLShaderAssembler();

  for (const shaderModule of DEFAULT_MODULES) {
    shaderAssembler.addDefaultModule(shaderModule);
  }

  // Add shader hooks based on language
  // TODO(ibgreen) - should the luma shader assembler support both sets of hooks?
  const shaderHooks = language === 'glsl' ? SHADER_HOOKS_GLSL : SHADER_HOOKS_WGSL;
  for (const shaderHook of shaderHooks) {
    shaderAssembler.addShaderHook(shaderHook);
  }

  return shaderAssembler;
}

// Shared registries preserve application-wide module and hook registration.
const glslShaderAssembler = createShaderAssembler('glsl');
const wgslShaderAssembler = createShaderAssembler('wgsl');

// Model snapshots its base defaults, so both classes need the WebGL fallback.
// luma ignores this default on devices using a different shader language.
GPUVectorModel.defaultProps.shaderAssembler = glslShaderAssembler;
Model.defaultProps.shaderAssembler = glslShaderAssembler;

/** Return deck.gl's shared shader assembler for registering modules and hooks. */
export function getShaderAssembler(language: 'glsl' | 'wgsl'): ShaderAssembler {
  return language === 'wgsl' ? wgslShaderAssembler : glslShaderAssembler;
}

export {layerUniforms, color, picking, project, project32, gouraudMaterial, phongMaterial, shadow};

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

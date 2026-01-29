// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ShaderAssembler} from '@luma.gl/shadertools';

import {gouraudMaterial, phongMaterial} from '@luma.gl/shadertools';
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

const SHADER_HOOKS_WGSL = [
  // Not yet supported
];

export function getShaderAssembler(language: 'glsl' | 'wgsl'): ShaderAssembler {
  const shaderAssembler = ShaderAssembler.getDefaultShaderAssembler();

  for (const shaderModule of DEFAULT_MODULES) {
    shaderAssembler.addDefaultModule(shaderModule);
  }

  // if we're recreating the device we may have changed language
  // and must not inject hooks for the wrong language
  // shaderAssembler.resetShaderHooks();
  (shaderAssembler as any)._hookFunctions.length = 0;

  // Add shader hooks based on language
  // TODO(ibgreen) - should the luma shader assembler support both sets of hooks?
  const shaderHooks = language === 'glsl' ? SHADER_HOOKS_GLSL : SHADER_HOOKS_WGSL;
  for (const shaderHook of shaderHooks) {
    shaderAssembler.addShaderHook(shaderHook);
  }

  return shaderAssembler;
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

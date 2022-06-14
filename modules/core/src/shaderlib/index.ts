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

import {ProgramManager} from '@luma.gl/core';
import {gouraudLighting, phongLighting} from '@luma.gl/core';
import project from './project/project';
import project32 from './project32/project32';
import shadow from './shadow/shadow';
import picking from './picking/picking';

const DEFAULT_MODULES = [project];

const SHADER_HOOKS = [
  'vs:DECKGL_FILTER_SIZE(inout vec3 size, VertexGeometry geometry)',
  'vs:DECKGL_FILTER_GL_POSITION(inout vec4 position, VertexGeometry geometry)',
  'vs:DECKGL_FILTER_COLOR(inout vec4 color, VertexGeometry geometry)',
  'fs:DECKGL_FILTER_COLOR(inout vec4 color, FragmentGeometry geometry)'
];

export function createProgramManager(gl) {
  const programManager = ProgramManager.getDefaultProgramManager(gl);

  for (const shaderModule of DEFAULT_MODULES) {
    programManager.addDefaultModule(shaderModule);
  }
  for (const shaderHook of SHADER_HOOKS) {
    programManager.addShaderHook(shaderHook);
  }

  return programManager;
}

export {picking, project, project32, gouraudLighting, phongLighting, shadow};

// Useful for custom shader modules
export type {ProjectUniforms} from './project/viewport-uniforms';

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

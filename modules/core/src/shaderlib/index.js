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

import {registerShaderModules, ProgramManager} from '@luma.gl/core';
import {fp32, picking, gouraudlighting, phonglighting} from '@luma.gl/core';
import geometry from './misc/geometry';
import project from './project/project';
import project32 from './project32/project32';
import project64 from './project64/project64';
import shadow from './shadow/shadow';

const DEFAULT_MODULES = [geometry, project];

const SHADER_HOOKS = [
  'vs:DECKGL_FILTER_SIZE(inout vec3 size, VertexGeometry geometry)',
  'vs:DECKGL_FILTER_GL_POSITION(inout vec4 position, VertexGeometry geometry)',
  'vs:DECKGL_FILTER_COLOR(inout vec4 color, VertexGeometry geometry)',
  'fs:DECKGL_FILTER_COLOR(inout vec4 color, FragmentGeometry geometry)'
];

const MODULE_INJECTIONS = {
  picking: [
    {
      hook: 'fs:DECKGL_FILTER_COLOR',
      order: 99,
      injection: `
    // use highlight color if this fragment belongs to the selected object.
    color = picking_filterHighlightColor(color);

    // use picking color if rendering to picking FBO.
    color = picking_filterPickingColor(color);
  `
    }
  ]
};

export function initializeShaderModules() {
  registerShaderModules([fp32, project, project32, gouraudlighting, phonglighting, picking]);
}

export function createProgramManager(gl) {
  const programManager = ProgramManager.getDefaultProgramManager(gl);

  for (const shaderModule of DEFAULT_MODULES) {
    programManager.addDefaultModule(shaderModule);
  }
  for (const shaderHook of SHADER_HOOKS) {
    programManager.addShaderHook(shaderHook);
  }
  for (const moduleName in MODULE_INJECTIONS) {
    for (const injection of MODULE_INJECTIONS[moduleName]) {
      programManager.addModuleInjection(moduleName, injection);
    }
  }

  return programManager;
}

export {picking, project, project64, gouraudlighting, phonglighting, shadow};

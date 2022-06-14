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

/* eslint-disable camelcase */
import {fp64} from '@luma.gl/shadertools';
const {fp64ify, fp64ifyMatrix4} = fp64;
import {project, _memoize as memoize} from '@deck.gl/core';

import type {Viewport, _ShaderModule as ShaderModule} from '@deck.gl/core';
import project64Shader from './project64.glsl';

type Project64ModuleSettings = {
  viewport: Viewport;
};

export default {
  name: 'project64',
  dependencies: [project, fp64],
  vs: project64Shader,
  getUniforms
} as ShaderModule<Project64ModuleSettings>;

// TODO - this module should calculate the 64 bit uniforms
// It is currently done by project to minimize duplicated work

const getMemoizedUniforms = memoize(calculateUniforms);

function getUniforms(opts?: Project64ModuleSettings | {}): Record<string, any> {
  if (opts && 'viewport' in opts) {
    const {viewProjectionMatrix, scale} = opts.viewport;
    // We only need to update fp64 uniforms if fp32 projection is being updated
    return getMemoizedUniforms({viewProjectionMatrix, scale});
  }
  return {};
}

function calculateUniforms({
  viewProjectionMatrix,
  scale
}: {
  viewProjectionMatrix: number[];
  scale: number;
}) {
  const glViewProjectionMatrixFP64 = fp64ifyMatrix4(viewProjectionMatrix);
  const scaleFP64 = fp64ify(scale);

  return {
    project_uViewProjectionMatrixFP64: glViewProjectionMatrixFP64,
    project64_uViewProjectionMatrix: glViewProjectionMatrixFP64,
    project64_uScale: scaleFP64
  };
}

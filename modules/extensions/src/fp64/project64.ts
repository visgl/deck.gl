// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable camelcase */
import {Matrix4} from '@math.gl/core';
import type {NumberArray16} from '@math.gl/core';
import {fp64} from '@luma.gl/shaders';
import type {ShaderModule} from '@luma.gl/shaders';
const {fp64ify, fp64ifyMatrix4} = fp64;
import {project, _memoize as memoize} from '@deck.gl/core';

import type {Viewport} from '@deck.gl/core';
import project64Shader from './project64.glsl';
import source from './project64.wgsl';

type Project64ModuleProps = {
  viewport: Viewport;
  /** Clip-space jitter inherited from the scene pass. */
  jitter?: [number, number];
};

export default {
  name: 'project64',
  dependencies: [project, fp64],
  vs: project64Shader,
  source,
  getUniforms,
  uniformTypes: {
    scale: 'vec2<f32>',
    // Cannot pass as vec2[16], so instead split into 2 mat4x4
    viewProjectionMatrix: 'mat4x4<f32>',
    viewProjectionMatrix64Low: 'mat4x4<f32>'
  }
} as ShaderModule<
  Project64ModuleProps,
  {
    scale: [number, number];
    viewProjectionMatrix: NumberArray16;
    viewProjectionMatrix64Low: NumberArray16;
  }
>;

// TODO - this module should calculate the 64 bit uniforms
// It is currently done by project to minimize duplicated work

const getMemoizedUniforms = memoize(calculateUniforms);

function getUniforms(opts?: Project64ModuleProps | {}): Record<string, any> {
  if (opts && 'viewport' in opts) {
    let {viewProjectionMatrix} = opts.viewport;
    const {scale} = opts.viewport;
    if (opts.jitter) {
      const shear = new Matrix4();
      shear[12] = opts.jitter[0];
      shear[13] = opts.jitter[1];
      viewProjectionMatrix = shear.multiplyRight(viewProjectionMatrix);
    }
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
  const viewProjectionMatrix64High = new Float32Array(16);
  const viewProjectionMatrix64Low = new Float32Array(16);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      // Match order used in project.viewProjectionMatrix
      const from = 4 * i + j;
      const to = 4 * j + i;
      viewProjectionMatrix64High[to] = glViewProjectionMatrixFP64[2 * from];
      viewProjectionMatrix64Low[to] = glViewProjectionMatrixFP64[2 * from + 1];
    }
  }
  return {
    scale: fp64ify(scale),
    viewProjectionMatrix: [...viewProjectionMatrix64High],
    viewProjectionMatrix64Low: [...viewProjectionMatrix64Low]
  };
}

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Matrix4, NumberArray16} from '@math.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlockWGSL = /* wgsl */ `\
struct ScenegraphUniforms {
  sizeScale: f32,
  sizeMinPixels: f32,
  sizeMaxPixels: f32,
  sceneModelMatrix: mat4x4<f32>,
  composeModelMatrix: f32,
};

@group(0) @binding(auto)
var<uniform> scenegraph: ScenegraphUniforms;
`;

const uniformBlockGLSL = /* glsl */ `\
layout(std140) uniform scenegraphUniforms {
  float sizeScale;
  float sizeMinPixels;
  float sizeMaxPixels;
  mat4 sceneModelMatrix;
  float composeModelMatrix;
} scenegraph;
`;

export type ScenegraphProps = {
  sizeScale: number;
  sizeMinPixels: number;
  sizeMaxPixels: number;
  sceneModelMatrix: Matrix4;
  composeModelMatrix: number;
};

type ScenegraphUniforms = Omit<ScenegraphProps, 'sceneModelMatrix'> & {
  sceneModelMatrix: NumberArray16;
};

export const scenegraphUniforms = {
  name: 'scenegraph',
  source: uniformBlockWGSL,
  vs: uniformBlockGLSL,
  fs: uniformBlockGLSL,
  uniformTypes: {
    sizeScale: 'f32',
    sizeMinPixels: 'f32',
    sizeMaxPixels: 'f32',
    sceneModelMatrix: 'mat4x4<f32>',
    composeModelMatrix: 'f32'
  }
} as const satisfies ShaderModule<ScenegraphProps, ScenegraphUniforms, Record<never, never>>;

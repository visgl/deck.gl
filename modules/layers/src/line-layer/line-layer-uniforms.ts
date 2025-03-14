// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlockWGSL = /* wgsl */ `\
struct LineUniforms {
  widthScale: f32,
  widthMinPixels: f32,
  widthMaxPixels: f32,
  useShortestPath: f32,
  widthUnits: i32,
};

@group(0) @binding(1)
var<uniform> line: LineUniforms;
`;

const uniformBlockGLSL = /* glsl */ `\
uniform lineUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float useShortestPath;
  highp int widthUnits;
} line;
`;

export type LineProps = {
  widthScale: number;
  widthMinPixels: number;
  widthMaxPixels: number;
  useShortestPath: number;
  widthUnits: number;
};

export const lineUniforms = {
  name: 'line',
  source: uniformBlockWGSL,
  vs: uniformBlockGLSL,
  fs: uniformBlockGLSL,
  uniformTypes: {
    widthScale: 'f32',
    widthMinPixels: 'f32',
    widthMaxPixels: 'f32',
    useShortestPath: 'f32',
    widthUnits: 'i32'
  }
} as const satisfies ShaderModule<LineProps>;

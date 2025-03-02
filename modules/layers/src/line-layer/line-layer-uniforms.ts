// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
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
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    widthScale: 'f32',
    widthMinPixels: 'f32',
    widthMaxPixels: 'f32',
    useShortestPath: 'f32',
    widthUnits: 'i32'
  }
} as const satisfies ShaderModule<LineProps>;

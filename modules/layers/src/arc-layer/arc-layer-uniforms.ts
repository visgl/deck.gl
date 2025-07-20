// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
uniform arcUniforms {
  bool greatCircle;
  bool useShortestPath;
  float numSegments;
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  highp int widthUnits;
} arc;
`;

export type ArcProps = {
  greatCircle: boolean;
  useShortestPath: boolean;
  numSegments: number;
  widthScale: number;
  widthMinPixels: number;
  widthMaxPixels: number;
  widthUnits: number;
};

export const arcUniforms = {
  name: 'arc',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    greatCircle: 'f32',
    useShortestPath: 'f32',
    numSegments: 'f32',
    widthScale: 'f32',
    widthMinPixels: 'f32',
    widthMaxPixels: 'f32',
    widthUnits: 'i32'
  }
} as const satisfies ShaderModule<ArcProps>;

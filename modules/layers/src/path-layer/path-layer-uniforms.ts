// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
uniform pathUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float jointType;
  float capType;
  float miterLimit;
  bool billboard;
  highp int widthUnits;
} path;
`;

export type PathProps = {
  widthScale: number;
  widthMinPixels: number;
  widthMaxPixels: number;
  jointType: number;
  capType: number;
  miterLimit: number;
  billboard: boolean;
  widthUnits: number;
};

export const pathUniforms = {
  name: 'path',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    widthScale: 'f32',
    widthMinPixels: 'f32',
    widthMaxPixels: 'f32',
    jointType: 'f32',
    capType: 'f32',
    miterLimit: 'f32',
    billboard: 'f32',
    widthUnits: 'i32'
  }
} as const satisfies ShaderModule<PathProps>;

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
uniform columnUniforms {
  float radius;
  float angle;
  vec2 offset;
  bool extruded;
  bool stroked;
  bool isStroke;
  float coverage;
  float elevationScale;
  float edgeDistance;
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  highp int radiusUnits;
  highp int widthUnits;
} column;
`;

export type ColumnProps = {
  radius: number;
  angle: number;
  offset: [number, number];
  extruded: boolean;
  stroked: boolean;
  isStroke: boolean;
  coverage: number;
  elevationScale: number;
  edgeDistance: number;
  widthScale: number;
  widthMinPixels: number;
  widthMaxPixels: number;
  radiusUnits: number;
  widthUnits: number;
};

export const columnUniforms = {
  name: 'column',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    radius: 'f32',
    angle: 'f32',
    offset: 'vec2<f32>',
    extruded: 'f32',
    stroked: 'f32',
    isStroke: 'f32',
    coverage: 'f32',
    elevationScale: 'f32',
    edgeDistance: 'f32',
    widthScale: 'f32',
    widthMinPixels: 'f32',
    widthMaxPixels: 'f32',
    radiusUnits: 'i32',
    widthUnits: 'i32'
  }
} as const satisfies ShaderModule<ColumnProps>;

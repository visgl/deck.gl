// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlockWGSL = /* wgsl */ `\
struct SolidPolygonUniforms {
  extruded: f32,
  isWireframe: f32,
  elevationScale: f32,
};

@group(0) @binding(auto) var<uniform> solidPolygon: SolidPolygonUniforms;
`;

const uniformBlock = `\
layout(std140) uniform solidPolygonUniforms {
  bool extruded;
  bool isWireframe;
  float elevationScale;
} solidPolygon;
`;

export type SolidPolygonProps = {
  extruded: boolean;
  isWireframe: boolean;
  elevationScale: number;
};

export const solidPolygonUniforms = {
  name: 'solidPolygon',
  source: uniformBlockWGSL,
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    extruded: 'f32',
    isWireframe: 'f32',
    elevationScale: 'f32'
  }
} as const satisfies ShaderModule<SolidPolygonProps>;

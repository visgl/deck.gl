// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
uniform surfaceUniforms {
  float lightStrength;
} surface;
`;

export type SurfaceProps = {
  lightStrength: number;
};

export const surfaceUniforms = {
  name: 'surface',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    lightStrength: 'f32'
  }
} as const satisfies ShaderModule<SurfaceProps>;

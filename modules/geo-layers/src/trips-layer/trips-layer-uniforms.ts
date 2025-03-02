// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

const uniformBlock = `\
uniform tripsUniforms {
  bool fadeTrail;
  float trailLength;
  float currentTime;
} trips;
`;

export type TripsProps = {
  fadeTrail: boolean;
  trailLength: number;
  currentTime: number;
};

export const tripsUniforms = {
  name: 'trips',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    fadeTrail: 'f32',
    trailLength: 'f32',
    currentTime: 'f32'
  }
} as const satisfies ShaderModule<TripsProps>;

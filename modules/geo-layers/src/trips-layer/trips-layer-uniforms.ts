import {ShaderModule} from '@luma.gl/shadertools';
import {UniformTypes} from '@deck.gl/core';

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
  } as const satisfies UniformTypes<Required<TripsProps>>
} as const satisfies ShaderModule<TripsProps>;

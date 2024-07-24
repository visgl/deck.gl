import type {ShaderModule} from '@deck.gl/core';

const uniformBlock = `\
uniform solidPolygonUniforms {
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
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    extruded: 'f32',
    isWireframe: 'f32',
    elevationScale: 'f32'
  }
} as const satisfies ShaderModule<SolidPolygonProps>;

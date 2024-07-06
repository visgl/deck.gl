import {ShaderModule} from '@luma.gl/shadertools';
import {UniformTypes} from './uniform-types';

const uniformBlock = `\
uniform layerUniforms {
  uniform float opacity;
} layer;
`;

export type LayerProps = {
  opacity?: number;
};

export const layerUniforms = {
  name: 'layer',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    opacity: 'f32'
  } as const satisfies UniformTypes<LayerProps>
} as const satisfies ShaderModule<LayerProps>;

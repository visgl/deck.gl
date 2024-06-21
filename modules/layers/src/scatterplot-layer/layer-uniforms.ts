import {ShaderModule} from '@luma.gl/shadertools';
import {UniformTypes} from '../uniform-types';

const uniformBlock = `\
uniform layerUniforms {
  uniform float opacity;
} layer;
`;

export type LLayerProps = {
  opacity?: number;
};

export const layerUniforms = {
  name: 'layer',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    opacity: 'f32'
  } as const satisfies UniformTypes<LLayerProps>
} as const satisfies ShaderModule<LLayerProps>;

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';
import type {LayerProps} from '../../types/layer-props';

const uniformBlock = `\
uniform layerUniforms {
  uniform float opacity;
} layer;
`;

export type LayerUniforms = {
  opacity?: number;
};

export const layerUniforms = {
  name: 'layer',
  vs: uniformBlock,
  fs: uniformBlock,
  getUniforms: (props: Partial<LayerProps>) => {
    return {
      // apply gamma to opacity to make it visually "linear"
      // TODO - v10: use raw opacity?
      opacity: Math.pow(props.opacity!, 1 / 2.2)
    };
  },
  uniformTypes: {
    opacity: 'f32'
  }
} as const satisfies ShaderModule<LayerProps, LayerUniforms>;

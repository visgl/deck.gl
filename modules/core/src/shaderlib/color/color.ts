// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ShaderModule} from '@luma.gl/shadertools';
import {LayerProps} from '../../types/layer-props';

const colorWGSL = /* WGSL */ `

struct ColorUniforms {
  opacity: f32,
};

var<private> color: ColorUniforms = ColorUniforms(1.0);
// TODO (kaapp) avoiding binding index collisions to handle layer opacity 
// requires some thought.
// @group(0) @binding(0) var<uniform> color: ColorUniforms;

@must_use
fn deckgl_premultiplied_alpha(fragColor: vec4<f32>) -> vec4<f32> {
    return vec4(fragColor.rgb * fragColor.a, fragColor.a); 
};
`;

export type ColorProps = {
  /**
   * Opacity of the layer, between 0 and 1. Default 1.
   */
  opacity?: number;
};

export type ColorUniforms = {
  opacity?: number;
};

export default {
  name: 'color',
  dependencies: [],
  source: colorWGSL,
  getUniforms: (_props: Partial<ColorProps>) => {
    // TODO (kaapp) Handle layer opacity
    // apply gamma to opacity to make it visually "linear"
    // TODO - v10: use raw opacity?
    // opacity: Math.pow(props.opacity!, 1 / 2.2)
    return {};
  },
  uniformTypes: {
    opacity: 'f32'
  }
  // @ts-ignore TODO v9.1
} as const satisfies ShaderModule<LayerProps, ColorUniforms, {}>;

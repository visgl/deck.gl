// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';
import type {LayerProps} from '../../types/layer-props';

const uniformBlockWGSL = /* wgsl */ `\
struct LayerUniforms {
  opacity: f32,
  timelineTime: f32,
  engineTime: f32,
  frameIndex: u32,
};

@group(0) @binding(auto)
var<uniform> layer: LayerUniforms;
`;

const uniformBlock = `\
layout(std140) uniform layerUniforms {
  uniform float opacity;
  uniform float timelineTime;
  uniform float engineTime;
  uniform highp uint frameIndex;
} layer;
`;

export type LayerUniforms = {
  opacity?: number;
  /** Current attached timeline time, in seconds. */
  timelineTime?: number;
  /** Monotonic engine time since the animation loop started, in seconds. */
  engineTime?: number;
  /** Number of animation frames processed by the animation loop. */
  frameIndex?: number;
};

export const layerUniforms = {
  name: 'layer',
  source: uniformBlockWGSL,
  vs: uniformBlock,
  fs: uniformBlock,
  getUniforms: (props: Partial<LayerProps & LayerUniforms>) => {
    return {
      // apply gamma to opacity to make it visually "linear"
      // TODO - v10: use raw opacity?
      opacity: Math.pow(props.opacity!, 1 / 2.2),
      timelineTime: props.timelineTime ?? 0,
      engineTime: props.engineTime ?? 0,
      frameIndex: props.frameIndex ?? 0
    };
  },
  uniformTypes: {
    opacity: 'f32',
    timelineTime: 'f32',
    engineTime: 'f32',
    frameIndex: 'u32'
  }
} as const satisfies ShaderModule<LayerProps & LayerUniforms, LayerUniforms>;

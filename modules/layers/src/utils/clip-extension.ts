// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

type ClipProps = {
  enabled?: boolean;
  mode?: 'instance' | 'geometry';
  bounds?: Readonly<[number, number, number, number]>;
};

type ClipUniforms = {
  enabled: number;
  mode: number;
  bounds: Readonly<[number, number, number, number]>;
};

const CLIP_MODE_GEOMETRY = 0;
const CLIP_MODE_INSTANCE = 1;

const source = /* wgsl */ `\
struct ClipUniforms {
  enabled: i32,
  mode: i32,
  bounds: vec4<f32>,
};

@group(2) @binding(auto) var<uniform> clipUniforms: ClipUniforms;

fn clip_isInBounds(coordinates: vec2<f32>) -> bool {
  return coordinates.x >= clipUniforms.bounds.x &&
    coordinates.y >= clipUniforms.bounds.y &&
    coordinates.x < clipUniforms.bounds.z &&
    coordinates.y < clipUniforms.bounds.w;
}

fn clip_filterPosition(position: ptr<function, vec4<f32>>, instanceCoordinates: vec2<f32>) {
  if (
    clipUniforms.enabled != 0 &&
    clipUniforms.mode == ${CLIP_MODE_INSTANCE} &&
    !clip_isInBounds(instanceCoordinates)
  ) {
    *position = vec4<f32>(2.0, 2.0, 2.0, 1.0);
  }
}

fn clip_filterColor(geometryCoordinates: vec2<f32>) {
  if (
    clipUniforms.enabled != 0 &&
    clipUniforms.mode == ${CLIP_MODE_GEOMETRY} &&
    !clip_isInBounds(geometryCoordinates)
  ) {
    discard;
  }
}
`;

const clipExtension = {
  name: 'clip',
  source,
  props: {} as ClipProps,
  uniforms: {} as ClipUniforms,
  bindingLayout: [{name: 'clip', group: 2}],
  uniformTypes: {
    enabled: 'i32',
    mode: 'i32',
    bounds: 'vec4<f32>'
  },
  defaultUniforms: {
    enabled: 0,
    mode: CLIP_MODE_GEOMETRY,
    bounds: [0, 0, 1, 1]
  },
  getUniforms(props: ClipProps = {}) {
    const uniforms: Partial<ClipUniforms> = {};
    if (props.enabled !== undefined) {
      uniforms.enabled = props.enabled ? 1 : 0;
    }
    if (props.mode !== undefined) {
      uniforms.mode = props.mode === 'instance' ? CLIP_MODE_INSTANCE : CLIP_MODE_GEOMETRY;
    }
    if (props.bounds !== undefined) {
      uniforms.bounds = props.bounds;
    }
    return uniforms;
  }
} as const satisfies ShaderModule<ClipProps, ClipUniforms, {}>;

export default clipExtension;

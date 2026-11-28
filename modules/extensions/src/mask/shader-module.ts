// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule, ShaderPlugin} from '@luma.gl/shaders';
import {project} from '@deck.gl/core';
import type {Texture} from '@luma.gl/core';

const uniformBlock = /* glsl */ `\
layout(std140) uniform maskUniforms {
  vec4 bounds;
  highp int channel;
  bool enabled;
  bool inverted;
  bool maskByInstance;
} mask;
`;

const vertex = /* glsl */ `
vec2 mask_getCoords(vec2 flatPosition) {
  return (flatPosition - mask.bounds.xy) / (mask.bounds.zw - mask.bounds.xy);
}
`;

const vs = `
${uniformBlock}
${vertex}
`;

const fragment = /* glsl */ `
uniform sampler2D mask_texture;

bool mask_isInBounds(vec2 texCoords) {
  if (!mask.enabled) {
    return true;
  }
  vec4 maskColor = texture(mask_texture, texCoords);
  float maskValue = 1.0;
  if (mask.channel == 0) {
    maskValue = maskColor.r;
  } else if (mask.channel == 1) {
    maskValue = maskColor.g;
  } else if (mask.channel == 2) {
    maskValue = maskColor.b;
  } else if (mask.channel == 3) {
    maskValue = maskColor.a;
  }

  if (mask.inverted) {
    return maskValue >= 0.5;
  } else {
    return maskValue < 0.5;
  }
}
`;

const fs = `
${uniformBlock}
${fragment}
`;

const inject = {
  'glsl:vs:#main-end': /* glsl */ `
   // Anchor (instance) or vertex position in common space, then flattened to the space the
   // mask texture was rendered in (Mercator for geospatial views, identity otherwise)
   vec4 mask_common_position = mask.maskByInstance
     ? project_position(vec4(geometry.worldPosition, 1.0))
     : geometry.position;
   mask_texCoords = mask_getCoords(project_common_position_to_flat(mask_common_position));
`,
  'glsl:fs:#main-start': /* glsl */ `
  if (mask.enabled) {
    bool mask = mask_isInBounds(mask_texCoords);

    // Debug: show extent of render target
    // fragColor = vec4(mask_texCoords, 0.0, 1.0);
    // fragColor = texture(mask_texture, mask_texCoords);

    if (!mask) discard;
  }
`
};

type MaskBindingProps = {
  maskMap?: Texture;
};

type MaskUniformProps = {
  bounds: [number, number, number, number];
  channel: number;
  enabled: boolean;
  inverted: boolean;
  maskByInstance: boolean;
};

export type MaskProps = MaskBindingProps & MaskUniformProps;

/* eslint-disable camelcase */
const getMaskUniforms = (opts?: MaskProps | {}): Record<string, any> => {
  if (opts && 'maskMap' in opts) {
    return {
      mask_texture: opts.maskMap
    };
  }
  return opts || {};
};

const source = /* wgsl */ `
struct MaskUniforms {
  bounds: vec4<f32>,
  channel: i32,
  enabled: i32,
  inverted: i32,
  maskByInstance: i32,
};
@group(0) @binding(auto) var<uniform> mask: MaskUniforms;
@group(0) @binding(auto) var mask_texture: texture_2d<f32>;
@group(0) @binding(auto) var mask_textureSampler: sampler;
`;

const maskModule = {
  name: 'mask',
  dependencies: [project],
  vs,
  fs,
  source,
  getUniforms: getMaskUniforms,
  uniformTypes: {
    bounds: 'vec4<f32>',
    channel: 'i32',
    enabled: 'i32',
    inverted: 'i32',
    maskByInstance: 'i32'
  }
} as const satisfies ShaderModule<MaskProps>;

export const maskPlugin: ShaderPlugin = {
  name: 'mask',
  module: maskModule,
  interStageVariables: {
    mask_texCoords: {type: 'vec2<f32>'},
    mask_commonPosition: {type: 'vec3<f32>'}
  },
  injections: {
    ...inject,
    'wgsl:vs:DECKGL_FILTER_GL_POSITION': /* wgsl */ `
if (mask.enabled != 0) {
  var commonPosition = geometry.position;
  if (mask.maskByInstance != 0) {
    commonPosition = vec4<f32>(project_position_vec3_f64(geometry.worldPosition, vec3<f32>(0.0)), 1.0);
  } else {
    // Billboard corners may only offset clip space; recover their common-space position.
    let matrix = project.viewProjectionMatrix;
    let rowX = vec3<f32>(matrix[0].x, matrix[1].x, matrix[2].x);
    let rowY = vec3<f32>(matrix[0].y, matrix[1].y, matrix[2].y);
    let rowZ = vec3<f32>(matrix[0].z, matrix[1].z, matrix[2].z);
    let rowW = vec3<f32>(matrix[0].w, matrix[1].w, matrix[2].w);
    let perspective = dot(rowW, rowW) > 0.0;
    let depthRow = select(rowZ, rowW, perspective);
    let projected = project_common_position_to_clipspace(geometry.position);
    let delta = (*position).xy - projected.xy;
    let depthDelta = select(2.0 * ((*position).z - projected.z),
      (*position).w - projected.w, perspective);
    let determinant = dot(rowX, cross(rowY, depthRow));
    if (abs(determinant) > 0.0) {
      commonPosition = vec4<f32>(commonPosition.xyz +
        (cross(rowY, depthRow) * delta.x + cross(depthRow, rowX) * delta.y +
          cross(rowX, rowY) * depthDelta) / determinant, commonPosition.w);
    }
  }
  mask_commonPosition = commonPosition.xyz;
}
`,
    'wgsl:fs:DECKGL_FILTER_COLOR': /* wgsl */ `
if (mask.enabled != 0) {
  // Wrap after interpolation so no triangle interpolates across a longitude seam.
  let flatPosition = project_common_position_to_flat_continuous(
    mask_commonPosition, 0.5 * (mask.bounds.x + mask.bounds.z)
  );
  let coords = (flatPosition - mask.bounds.xy) / (mask.bounds.zw - mask.bounds.xy);
  let maskColor = textureSampleLevel(mask_texture, mask_textureSampler, vec2<f32>(coords.x, 1.0 - coords.y), 0.0);
  let inside = maskColor[u32(mask.channel)] < 0.5;
  if (inside == (mask.inverted != 0)) { discard; }
}
`
  }
};

export default maskModule;

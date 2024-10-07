// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';
import {project} from '@deck.gl/core';
import type {Texture} from '@luma.gl/core';

const uniformBlock = /* glsl */ `\
uniform maskUniforms {
  vec4 bounds;
  highp int channel;
  bool enabled;
  bool inverted;
  bool maskByInstance;
} mask;
`;

const vertex = /* glsl */ `
vec2 mask_getCoords(vec4 position) {
  return (position.xy - mask.bounds.xy) / (mask.bounds.zw - mask.bounds.xy);
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
  'vs:#decl': /* glsl */ `
out vec2 mask_texCoords;
`,
  'vs:#main-end': /* glsl */ `
   vec4 mask_common_position;
   if (mask.maskByInstance) {
     mask_common_position = project_position(vec4(geometry.worldPosition, 1.0));
   } else {
     mask_common_position = geometry.position;
   }
   mask_texCoords = mask_getCoords(mask_common_position);
`,
  'fs:#decl': /* glsl */ `
in vec2 mask_texCoords;
`,
  'fs:#main-start': /* glsl */ `
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

export default {
  name: 'mask',
  dependencies: [project],
  vs,
  fs,
  inject,
  getUniforms: getMaskUniforms,
  uniformTypes: {
    bounds: 'vec4<f32>',
    channel: 'i32',
    enabled: 'i32',
    inverted: 'i32',
    maskByInstance: 'i32'
  }
} as const satisfies ShaderModule<MaskProps>;

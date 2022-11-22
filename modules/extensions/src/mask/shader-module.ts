import {project} from '@deck.gl/core';
import type {_ShaderModule as ShaderModule} from '@deck.gl/core';
import type {Texture2D} from '@luma.gl/webgl';

const vs = `
uniform vec4 mask_bounds;
uniform bool mask_maskByInstance;
vec2 mask_getCoords(vec4 position) {
  return (position.xy - mask_bounds.xy) / (mask_bounds.zw - mask_bounds.xy);
}
`;

const fs = `
uniform sampler2D mask_texture;
uniform int mask_channel;
uniform bool mask_enabled;
uniform bool mask_inverted;
bool mask_isInBounds(vec2 texCoords) {
  if (!mask_enabled) {
    return true;
  }
  vec4 maskColor = texture2D(mask_texture, texCoords);
  float maskValue = 1.0;
  if (mask_channel == 0) {
    maskValue = maskColor.r;
  } else if (mask_channel == 1) {
    maskValue = maskColor.g;
  } else if (mask_channel == 2) {
    maskValue = maskColor.b;
  } else if (mask_channel == 3) {
    maskValue = maskColor.a;
  }

  if (mask_inverted) {
    return maskValue >= 0.5;
  } else {
    return maskValue < 0.5;
  }
}
`;

const inject = {
  'vs:#decl': `
varying vec2 mask_texCoords;
`,
  'vs:#main-end': `
   vec4 mask_common_position;
   if (mask_maskByInstance) {
     mask_common_position = project_position(vec4(geometry.worldPosition, 1.0));
   } else {
     mask_common_position = geometry.position;
   }
   mask_texCoords = mask_getCoords(mask_common_position);
`,
  'fs:#decl': `
varying vec2 mask_texCoords;
`,
  'fs:#main-start': `
  if (mask_enabled) {
    bool mask = mask_isInBounds(mask_texCoords);

    // Debug: show extent of render target
    // gl_FragColor = vec4(mask_texCoords, 0.0, 1.0);
    gl_FragColor = texture2D(mask_texture, mask_texCoords);

    if (!mask) discard;
  }
`
};

type MaskModuleSettings = {
  maskMap?: Texture2D;
};

/* eslint-disable camelcase */
const getMaskUniforms = (opts?: MaskModuleSettings | {}): Record<string, any> => {
  if (opts && 'maskMap' in opts) {
    return {
      mask_texture: opts.maskMap
    };
  }
  return {};
};

export default {
  name: 'mask',
  dependencies: [project],
  vs,
  fs,
  inject,
  getUniforms: getMaskUniforms
} as ShaderModule<MaskModuleSettings>;

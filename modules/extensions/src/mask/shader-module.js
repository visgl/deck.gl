import {project} from '@deck.gl/core';

const vs = `
uniform vec4 mask_bounds;
uniform bool mask_maskByInstance;
vec2 mask_getCoords(vec4 position) {
  return (position.xy - mask_bounds.xy) / (mask_bounds.zw - mask_bounds.xy);
}
`;

const fs = `
uniform sampler2D mask_texture;
uniform bool mask_enabled;
bool mask_isInBounds(vec2 texCoords) {
  if (!mask_enabled) {
    return true;
  }
  vec4 maskColor = texture2D(mask_texture, texCoords);
  return maskColor.a > 0.5;
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

const getMaskUniforms = (opts = {}, context = {}) => {
  const uniforms = {};
  if (opts.maskMap) {
    uniforms.mask_enabled = opts.maskEnabled !== false;
    uniforms.mask_texture = opts.maskMap;
  }
  return uniforms;
};

export default {
  name: 'mask',
  dependencies: [project],
  vs,
  fs,
  inject,
  getUniforms: getMaskUniforms
};

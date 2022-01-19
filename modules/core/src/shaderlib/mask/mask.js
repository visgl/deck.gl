import project from '../project/project';

const maskProjectionShader = `
uniform mat4 mask_projectionMatrix;
uniform vec4 mask_projectCenter;
uniform bool mask_maskByInstance;
vec2 mask_clipspace_to_texCoords(vec4 position) {
 return (position.xy / position.w + vec2(1.0)) / 2.0;
}
`;

const maskSampleShader = `
uniform sampler2D mask_texture;
uniform bool mask_enabled;
bool mask_isInBounds(vec2 texCoords) {
  if (!mask_enabled) {
    return true;
  }
  vec4 maskColor = texture2D(mask_texture, texCoords);
  return maskColor.g > 0.5;
}
`;

/*
 * The vertex-shader version masks geometries by their anchor position
 * e.g. ScatterplotLayer - show if the center of a circle is within bounds
 */
const injectVs = {
  'vs:#decl': `
varying vec2 mask_texCoords;
`,
  'vs:DECKGL_FILTER_GL_POSITION': `
  vec4 mask_position = project_common_position_to_clipspace(
    project_position(vec4(geometry.worldPosition, 1.0)),
    mask_projectionMatrix,
    mask_projectCenter
  );
  mask_texCoords = mask_clipspace_to_texCoords(mask_position);
`,
  'fs:#decl': `
varying vec2 mask_texCoords;
`,
  'fs:DECKGL_FILTER_COLOR': `
   bool mask = mask_isInBounds(mask_texCoords);
   if (!mask) discard;
`
};

/*
 * The fragment-shader version masks pixels at the bounds
 * e.g. PolygonLayer - show the part of the polygon that intersect with the bounds
 */
const injectFs = {
  'vs:#decl': `
varying vec2 mask_texCoords;
`,
  'vs:DECKGL_FILTER_GL_POSITION': `
   vec4 mask_common_position;
   if (mask_maskByInstance) {
     mask_common_position = project_position(vec4(geometry.worldPosition, 1.0));
   } else {
     mask_common_position = geometry.position;
   }
   vec4 mask_position = project_common_position_to_clipspace(
     mask_common_position,
     mask_projectionMatrix,
     mask_projectCenter
   );
   mask_texCoords = mask_clipspace_to_texCoords(mask_position);
`,
  'fs:#decl': `
varying vec2 mask_texCoords;
`,
  'fs:DECKGL_FILTER_COLOR': `
  bool mask = mask_isInBounds(mask_texCoords);

  // Debug: show extent of render target
  // if (mask_enabled) {
  //   if (!mask) color.a = 0.1;
  //   if (mask_texCoords.x < 0.001 || mask_texCoords.x > 0.999 ||
  //       mask_texCoords.y < 0.001 || mask_texCoords.y > 0.999) {
  //     color = vec4(0.0, 0.0, 0.0, 0.5);
  //   }
  //   // color = vec4(mask_texCoords.xy, 0.0, 1.0);
  // }
  if (!mask) discard;
`
};

const getMaskUniforms = (opts = {}, context = {}) => {
  const uniforms = {};
  if (opts.drawToMaskMap || opts.pickingActive) {
    uniforms.mask_enabled = false;
    uniforms.mask_texture = opts.dummyMaskMap;
  } else if (opts.maskEnabled) {
    uniforms.mask_enabled = true;
    uniforms.mask_maskByInstance = opts.maskByInstance;
    uniforms.mask_projectCenter = opts.maskProjectCenter;
    uniforms.mask_projectionMatrix = opts.maskProjectionMatrix;
    uniforms.mask_texture = opts.maskMap;
  }
  return uniforms;
};

export const shaderModuleVs = {
  name: 'mask-vs',
  dependencies: [project],
  vs: maskProjectionShader,
  fs: maskSampleShader,
  inject: injectVs,
  getUniforms: getMaskUniforms
};

export const shaderModuleFs = {
  name: 'mask-fs',
  dependencies: [project],
  vs: maskProjectionShader,
  fs: maskSampleShader,
  inject: injectFs,
  getUniforms: getMaskUniforms
};

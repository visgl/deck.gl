/* eslint-disable camelcase */
const INITIAL_STATE = {
  outlineEnabled: false,
  outlineRenderShadowmap: false,
  outlineShadowmap: null
};

function getUniforms({outlineEnabled, outlineRenderShadowmap, outlineShadowmap} = INITIAL_STATE) {
  const uniforms = {};
  if (outlineEnabled !== undefined) {
    uniforms.outline_uEnabled = outlineEnabled; // ? 1.0 : 0.0;
  }
  if (outlineRenderShadowmap !== undefined) {
    uniforms.outline_uRenderOutlines = outlineRenderShadowmap; // ? 1.0 : 0.0;
  }
  if (outlineShadowmap !== undefined) {
    uniforms.outline_uShadowmap = outlineShadowmap;
  }
  return uniforms;
}

const vs = `\
varying float outline_vzLevel;
varying vec4 outline_vPosition;

// Set the z level for the outline shadowmap rendering
void outline_setZLevel(float zLevel) {
  outline_vzLevel = zLevel;
}

// Store an adjusted position for texture2DProj
void outline_setUV(vec4 position) {
  // mat4(
  //   0.5, 0.0, 0.0, 0.0,
  //   0.0, 0.5, 0.0, 0.0,
  //   0.0, 0.0, 0.5, 0.0,
  //   0.5, 0.5, 0.5, 1.0
  // ) * position;
  outline_vPosition = vec4(position.xyz * 0.5 + position.w * 0.5, position.w);
}
`;

const fs = `\
uniform bool outline_uEnabled;
uniform bool outline_uRenderOutlines;
uniform sampler2D outline_uShadowmap;

varying float outline_vzLevel;
// varying vec2 outline_vUV;
varying vec4 outline_vPosition;

const float OUTLINE_Z_LEVEL_ERROR = 0.01;

// Return a darker color in shadowmap
vec4 outline_filterShadowColor(vec4 color) {
  return vec4(outline_vzLevel / 255., outline_vzLevel / 255., outline_vzLevel / 255., 1.);
}

// Return a darker color if in shadowmap
vec4 outline_filterDarkenColor(vec4 color) {
  if (outline_uEnabled) {
    float maxZLevel;
    if (outline_vPosition.q > 0.0) {
      maxZLevel = texture2DProj(outline_uShadowmap, outline_vPosition).r * 255.;
    } else {
      discard;
    }
    if (maxZLevel < outline_vzLevel + OUTLINE_Z_LEVEL_ERROR) {
      vec4(color.rgb * 0.5, color.a);
    } else {
      discard;
    }
  }
  return color;
}

// if enabled and rendering outlines - Render depth to shadowmap
// if enabled and rendering colors - Return a darker color if in shadowmap
// if disabled, just return color
vec4 outline_filterColor(vec4 color) {
  if (outline_uEnabled) {
    return outline_uRenderOutlines ?
      outline_filterShadowColor(color) :
      outline_filterDarkenColor(color);
  }
  return color;
}
`;

export default {
  name: 'outline',
  vs,
  fs,
  getUniforms
};

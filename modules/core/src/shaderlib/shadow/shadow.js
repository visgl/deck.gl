const vs = `
const int max_lights = 2;
uniform mat4 shadow_viewProjectionMatrices[max_lights];
uniform bool shadow_drawShadowMap;
uniform bool shadow_useShadowMap;
uniform int shadow_lightId;
uniform float shadow_lightCount;

varying vec3 shadow_vPosition[max_lights];

vec4 shadow_setVertexPosition(vec4 position_commonspace) {
  if (shadow_drawShadowMap) {
    return shadow_viewProjectionMatrices[shadow_lightId] * position_commonspace;
  }
  if (shadow_useShadowMap) {
    for (int i = 0; i < max_lights; i++) {
      if(i < int(shadow_lightCount)) {
        vec4 shadowMap_position = shadow_viewProjectionMatrices[i] * position_commonspace;
        shadow_vPosition[i] = (shadowMap_position.xyz / shadowMap_position.w + 1.0) / 2.0;
      }
    }
  }
  return gl_Position;
}
`;

const fs = `
const int max_lights = 2;
uniform bool shadow_drawShadowMap;
uniform bool shadow_useShadowMap;
uniform sampler2D shadow_shadowMap[max_lights];
uniform vec4 shadow_color;
uniform bool shadow_light_flags[max_lights];
uniform float shadow_lightCount;

varying vec3 shadow_vPosition[max_lights];

const vec4 bitPackShift = vec4(1.0, 255.0, 65025.0, 16581375.0);
const vec4 bitUnpackShift = 1.0 / bitPackShift;
const vec4 bitMask = vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0,  0.0);

float shadow_getShadowWeight(vec3 position, sampler2D shadowMap) {
  vec4 rgbaDepth = texture2D(shadowMap, position.xy);

  float z = dot(rgbaDepth, bitUnpackShift);
  return smoothstep(0.001, 0.01, position.z - z);
}

vec4 shadow_filterShadowColor(vec4 color) {
  if (shadow_drawShadowMap) {
    vec4 rgbaDepth = fract(gl_FragCoord.z * bitPackShift);
    rgbaDepth -= rgbaDepth.gbaa * bitMask;
    return rgbaDepth;
  }
  if (shadow_useShadowMap) {
    float shadowAlpha = 0.0;
    for (int i = 0; i < max_lights; i++) {
      if(i < int(shadow_lightCount)) {
        shadowAlpha += shadow_getShadowWeight(shadow_vPosition[i], shadow_shadowMap[i]) * shadow_color.a / 255.0 / shadow_lightCount;
      }
    }
    float blendedAlpha = shadowAlpha + color.a * (1.0 - shadowAlpha);

    return vec4(
      mix(color.rgb, shadow_color.rgb / 255.0, shadowAlpha / blendedAlpha),
      blendedAlpha
    );
  }
  return color;
}
`;

const DEFAULT_SHADOW_COLOR = [0, 0, 0, 255];

function createShadowUniforms(opts = {}, context) {
  const uniforms = {
    shadow_drawShadowMap: Boolean(opts.drawToShadowMap),
    shadow_useShadowMap: !context.picking_uActive && opts.shadowMaps.length > 0,
    shadow_color: opts.shadowColor || DEFAULT_SHADOW_COLOR,
    shadow_lightId: opts.shadow_lightId,
    shadow_lightCount: opts.shadow_viewProjectionMatrices.length
  };

  for (let i = 0; i < opts.shadow_viewProjectionMatrices.length; i++) {
    uniforms[`shadow_viewProjectionMatrices[${i}]`] = opts.shadow_viewProjectionMatrices[i];

    if (opts.shadowMaps && opts.shadowMaps.length > 0) {
      uniforms[`shadow_shadowMap[${i}]`] = opts.shadowMaps[i];
    } else {
      uniforms[`shadow_shadowMap[${i}]`] = opts.dummyShadowMaps[0];
    }
  }
  return uniforms;
}

export default {
  name: 'shadow',
  dependencies: ['project', 'picking'],
  vs,
  fs,
  getUniforms: (opts = {}, context) => {
    if (opts.drawToShadowMap || (opts.shadowMaps && opts.shadowMaps.length > 0)) {
      const shadowUniforms = {};
      if (opts.shadow_viewProjectionMatrices && opts.shadow_viewProjectionMatrices.length > 0) {
        Object.assign(shadowUniforms, createShadowUniforms(opts, context));
      } else {
        Object.assign(shadowUniforms, {
          shadow_drawShadowMap: false,
          shadow_useShadowMap: false
        });
      }

      return shadowUniforms;
    }
    return {};
  }
};

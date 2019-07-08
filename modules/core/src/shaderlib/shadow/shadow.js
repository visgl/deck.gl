const vs = `
uniform mat4 shadow_viewProjectionMatrix;
uniform bool shadow_drawShadowMap;
uniform bool shadow_useShadowMap;

varying vec3 shadow_vPosition;

vec4 shadow_setVertexPosition(vec4 position_commonspace) {
  if (shadow_drawShadowMap) {
    return shadow_viewProjectionMatrix * position_commonspace;
  }
  if (shadow_useShadowMap) {
    vec4 shadowMap_position = shadow_viewProjectionMatrix * position_commonspace;
    shadow_vPosition = (shadowMap_position.xyz / shadowMap_position.w + 1.0) / 2.0;
  }
  return gl_Position;
}
`;

const fs = `
uniform bool shadow_drawShadowMap;
uniform bool shadow_useShadowMap;
uniform sampler2D shadow_shadowMap;
uniform vec4 shadow_color;

varying vec3 shadow_vPosition;

const vec4 bitPackShift = vec4(1.0, 255.0, 65025.0, 16581375.0);
const vec4 bitUnpackShift = 1.0 / bitPackShift;
const vec4 bitMask = vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0,  0.0);

float shadow_getShadowWeight(vec2 texCoords) {
  vec4 rgbaDepth = texture2D(shadow_shadowMap, texCoords);
  float z = dot(rgbaDepth, bitUnpackShift);
  return smoothstep(0.001, 0.01, shadow_vPosition.z - z);
}

vec4 shadow_filterShadowColor(vec4 color) {
  if (shadow_drawShadowMap) {
    vec4 rgbaDepth = fract(gl_FragCoord.z * bitPackShift);
    rgbaDepth -= rgbaDepth.gbaa * bitMask;
    return rgbaDepth;
  }
  if (shadow_useShadowMap) {
    /* debug */
    // if (shadow_vPosition.x < 0.0 || shadow_vPosition.y < 0.0 || shadow_vPosition.x > 1.0 || shadow_vPosition.y > 1.0) {
    //   return vec4(1.0, 1.0, 0.0, 1.0);
    // }

    // vec4 rgbaDepth = texture2D(shadow_shadowMap, shadow_vPosition.xy);
    // float z = dot(rgbaDepth, bitUnpackShift);
    // return vec4(z, 0.0, 0.0, 1.0);
    /* end debug */

    float shadowAlpha = shadow_getShadowWeight(shadow_vPosition.xy) * shadow_color.a / 255.0;
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

export default {
  name: 'shadow',
  dependencies: ['project', 'picking'],
  vs,
  fs,
  getUniforms: (opts = {}, context) => {
    if (opts.drawToShadowMap || opts.shadowMap) {
      const light = opts.lightSources && opts.lightSources.directionalLights[0];

      if (!light) {
        return {
          shadow_drawShadowMap: false,
          shadow_useShadowMap: false
        };
      }

      return {
        shadow_drawShadowMap: Boolean(opts.drawToShadowMap),
        shadow_useShadowMap: !context.picking_uActive && Boolean(opts.shadowMap),
        shadow_shadowMap: opts.shadowMap || true,
        shadow_color: opts.shadowColor || DEFAULT_SHADOW_COLOR,
        shadow_viewProjectionMatrix: opts.shadow_viewProjectionMatrix
      };
    }
    return {};
  }
};

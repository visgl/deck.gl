import {Matrix4, Vector3} from 'math.gl';

const vs = `
uniform mat4 shadow_viewProjectionMatrix;
uniform bool shadow_drawShadowMap;
uniform bool shadow_useShadowMap;

varying vec3 shadow_vPosition;

vec4 shadow_setVertexPosition(vec4 position_commonspace) {
  if (shadow_drawShadowMap || shadow_useShadowMap) {
    vec4 shadowMap_position = shadow_viewProjectionMatrix * position_commonspace;
    shadow_vPosition = (shadowMap_position.xyz / shadowMap_position.w + 1.0) / 2.0;

    if (shadow_drawShadowMap) {
      return shadowMap_position;
    }
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

float shadow_getShadowWeight(vec2 texCoords) {
  vec4 shadowColor = texture2D(shadow_shadowMap, texCoords);
  if (shadowColor.a == 0.0) {
    return 0.0;
  }
  return smoothstep(0.01, 0.02, shadow_vPosition.z - shadowColor.r);
}

vec4 shadow_filterShadowColor(vec4 color) {
  if (shadow_drawShadowMap) {
    return vec4(shadow_vPosition.z, 0.0, 0.0, 1.0);
  }
  if (shadow_useShadowMap) {
    /* debug */
    // if (shadow_vPosition.x < 0.0 || shadow_vPosition.y < 0.0 || shadow_vPosition.x > 1.0 || shadow_vPosition.y > 1.0) {
    //   return vec4(1.0, 1.0, 0.0, 1.0);
    // }

    // vec4 shadowColor = texture2D(shadow_shadowMap, shadow_vPosition.xy);
    // return shadowColor;
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

const projectionMatrix = new Matrix4().ortho({
  left: -1,
  right: 1,
  bottom: 1,
  top: -1,
  near: 0,
  far: 2
});

const DEFAULT_SHADOW_COLOR = [0, 0, 0, 255];

export default {
  name: 'shadow',
  dependencies: ['project', 'picking'],
  vs,
  fs,
  getUniforms: (opts = {}, context) => {
    const shadowMap = opts.shadowMap || opts.drawToShadowMap;
    if (shadowMap) {
      const light = opts.lightSources && opts.lightSources.directionalLights[0];

      if (!light) {
        return {
          shadow_drawShadowMap: false,
          shadow_useShadowMap: false
        };
      }

      const viewMatrix = new Matrix4()
        .lookAt({
          eye: new Vector3(light.direction).negate()
        })
        // arbitrary number that covers enough grounds
        .scale(1e-3);

      return {
        shadow_drawShadowMap: Boolean(opts.drawToShadowMap),
        shadow_useShadowMap: !context.picking_uActive && Boolean(opts.shadowMap),
        shadow_shadowMap: shadowMap,
        shadow_color: opts.shadowColor || DEFAULT_SHADOW_COLOR,
        shadow_viewProjectionMatrix: projectionMatrix.clone().multiplyRight(viewMatrix)
      };
    }
    return {};
  }
};

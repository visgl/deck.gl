// Copyright (c) 2015-2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import {createModuleInjection} from '@luma.gl/core';

const vs = `
const int max_lights = 2;
uniform mat4 shadow_uViewProjectionMatrices[max_lights];
uniform bool shadow_uDrawShadowMap;
uniform bool shadow_uUseShadowMap;
uniform int shadow_uLightId;
uniform float shadow_uLightCount;

varying vec3 shadow_vPosition[max_lights];

vec4 shadow_setVertexPosition(vec4 position_commonspace) {
  if (shadow_uDrawShadowMap) {
    return shadow_uViewProjectionMatrices[shadow_uLightId] * position_commonspace;
  }
  if (shadow_uUseShadowMap) {
    for (int i = 0; i < max_lights; i++) {
      if(i < int(shadow_uLightCount)) {
        vec4 shadowMap_position = shadow_uViewProjectionMatrices[i] * position_commonspace;
        shadow_vPosition[i] = (shadowMap_position.xyz / shadowMap_position.w + 1.0) / 2.0;
      }
    }
  }
  return gl_Position;
}
`;

const fs = `
const int max_lights = 2;
uniform bool shadow_uDrawShadowMap;
uniform bool shadow_uUseShadowMap;
uniform sampler2D shadow_uShadowMap[max_lights];
uniform vec4 shadow_uColor;
uniform float shadow_uLightCount;

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
  if (shadow_uDrawShadowMap) {
    vec4 rgbaDepth = fract(gl_FragCoord.z * bitPackShift);
    rgbaDepth -= rgbaDepth.gbaa * bitMask;
    return rgbaDepth;
  }
  if (shadow_uUseShadowMap) {
    float shadowAlpha = 0.0;
    for (int i = 0; i < max_lights; i++) {
      if(i < int(shadow_uLightCount)) {
        shadowAlpha += shadow_getShadowWeight(shadow_vPosition[i], shadow_uShadowMap[i]) * shadow_uColor.a / 255.0 / shadow_uLightCount;
      }
    }
    float blendedAlpha = shadowAlpha + color.a * (1.0 - shadowAlpha);

    return vec4(
      mix(color.rgb, shadow_uColor.rgb / 255.0, shadowAlpha / blendedAlpha),
      blendedAlpha
    );
  }
  return color;
}
`;

const moduleName = 'shadow';

createModuleInjection(moduleName, {
  hook: 'vs:DECKGL_FILTER_GL_POSITION',
  injection: `
gl_Position = shadow_setVertexPosition(geometry.position);
  `
});

createModuleInjection(moduleName, {
  hook: 'fs:DECKGL_FILTER_COLOR',
  injection: `
gl_FragColor = shadow_filterShadowColor(gl_FragColor);
  `
});

const DEFAULT_shadow_Color = [0, 0, 0, 255];

function createShadowUniforms(opts = {}) {
  const uniforms = {
    shadow_uDrawShadowMap: Boolean(opts.drawToShadowMap),
    shadow_uUseShadowMap: opts.shadowMaps ? opts.shadowMaps.length > 0 : false,
    shadow_uColor: opts.shadowColor || DEFAULT_shadow_Color,
    shadow_uLightId: opts.shadow_lightId,
    shadow_uLightCount: opts.shadow_viewProjectionMatrices.length
  };

  for (let i = 0; i < opts.shadow_viewProjectionMatrices.length; i++) {
    uniforms[`shadow_uViewProjectionMatrices[${i}]`] = opts.shadow_viewProjectionMatrices[i];

    if (opts.shadowMaps && opts.shadowMaps.length > 0) {
      uniforms[`shadow_uShadowMap[${i}]`] = opts.shadowMaps[i];
    } else {
      uniforms[`shadow_uShadowMap[${i}]`] = opts.dummyShadowMaps[0];
    }
  }
  return uniforms;
}

export default {
  name: 'shadow',
  dependencies: ['project'],
  vs,
  fs,
  getUniforms: (opts = {}) => {
    if (opts.drawToShadowMap || (opts.shadowMaps && opts.shadowMaps.length > 0)) {
      const shadowUniforms = {};
      if (opts.shadow_viewProjectionMatrices && opts.shadow_viewProjectionMatrices.length > 0) {
        Object.assign(shadowUniforms, createShadowUniforms(opts));
      } else {
        Object.assign(shadowUniforms, {
          shadow_uDrawShadowMap: false,
          shadow_uUseShadowMap: false
        });
      }

      return shadowUniforms;
    }
    return {};
  }
};

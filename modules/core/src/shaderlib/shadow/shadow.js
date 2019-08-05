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
import {PROJECT_COORDINATE_SYSTEM} from '../project/constants';
import {Vector3, Matrix4} from 'math.gl';
import memoize from '../../utils/memoize';
import {pixelsToWorld} from 'viewport-mercator-project';

const vs = `
const int max_lights = 2;
uniform mat4 shadow_uViewProjectionMatrices[max_lights];
uniform vec4 shadow_uProjectCenters[max_lights];
uniform bool shadow_uDrawShadowMap;
uniform bool shadow_uUseShadowMap;
uniform int shadow_uLightId;
uniform float shadow_uLightCount;

varying vec3 shadow_vPosition[max_lights];

vec4 shadow_setVertexPosition(vec4 position_commonspace) {
  if (shadow_uDrawShadowMap) {
    return project_common_position_to_clipspace(position_commonspace, shadow_uViewProjectionMatrices[shadow_uLightId], shadow_uProjectCenters[shadow_uLightId]);
  }
  if (shadow_uUseShadowMap) {
    for (int i = 0; i < max_lights; i++) {
      if(i < int(shadow_uLightCount)) {
        vec4 shadowMap_position = project_common_position_to_clipspace(position_commonspace, shadow_uViewProjectionMatrices[i], shadow_uProjectCenters[i]);
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
        shadowAlpha += shadow_getShadowWeight(shadow_vPosition[i], shadow_uShadowMap[i]) * shadow_uColor.a / shadow_uLightCount;
      }
    }
    float blendedAlpha = shadowAlpha + color.a * (1.0 - shadowAlpha);

    return vec4(
      mix(color.rgb, shadow_uColor.rgb, shadowAlpha / blendedAlpha),
      blendedAlpha
    );
  }
  return color;
}
`;

const moduleName = 'shadow';
const getMemoizedViewportCenterPosition = memoize(getViewportCenterPosition);
const getMemoizedViewProjectionMatrices = memoize(getViewProjectionMatrices);

createModuleInjection(moduleName, {
  hook: 'vs:DECKGL_FILTER_GL_POSITION',
  injection: `
position = shadow_setVertexPosition(geometry.position);
  `
});

createModuleInjection(moduleName, {
  hook: 'fs:DECKGL_FILTER_COLOR',
  injection: `
color = shadow_filterShadowColor(color);
  `
});

const DEFAULT_SHADOW_COLOR = [0, 0, 0, 1.0];
const VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];

function getViewportCenterPosition({viewport, center}) {
  return new Matrix4(viewport.viewProjectionMatrix).invert().transformVector4(center);
}

function getViewProjectionMatrices({viewport, shadowMatrices}) {
  const projectionMatrices = [];

  for (const shadowMatrix of shadowMatrices) {
    const viewMatrix = shadowMatrix.clone().translate(new Vector3(viewport.center).negate());
    const pixelUnprojectionMatrix = viewport.pixelUnprojectionMatrix;

    const topLeft = pixelsToWorld([0, 0], pixelUnprojectionMatrix);
    const topRight = pixelsToWorld([viewport.width, 0], pixelUnprojectionMatrix);
    const bottomLeft = pixelsToWorld([0, viewport.height], pixelUnprojectionMatrix);
    const bottomRight = pixelsToWorld([viewport.width, viewport.height], pixelUnprojectionMatrix);

    const pos0 = viewMatrix.transformVector3([topLeft[0], topLeft[1], 0]);
    const pos1 = viewMatrix.transformVector3([topRight[0], topRight[1], 0]);
    const pos2 = viewMatrix.transformVector3([bottomLeft[0], bottomLeft[1], 0]);
    const pos3 = viewMatrix.transformVector3([bottomRight[0], bottomRight[1], 0]);

    const projectionMatrix = new Matrix4().ortho({
      left: Math.min(pos0[0], pos1[0], pos2[0], pos3[0]),
      right: Math.max(pos0[0], pos1[0], pos2[0], pos3[0]),
      bottom: Math.min(pos0[1], pos1[1], pos2[1], pos3[1]),
      top: Math.max(pos0[1], pos1[1], pos2[1], pos3[1]),
      // Near plane could be too close to cover tall objects, scale up by 2.0
      near: Math.min(-pos0[2], -pos1[2], -pos2[2], -pos3[2]) * 2.0,
      far: Math.max(-pos0[2], -pos1[2], -pos2[2], -pos3[2])
    });
    projectionMatrices.push(projectionMatrix.multiplyRight(shadowMatrix));
  }
  return projectionMatrices;
}

function createShadowUniforms(opts = {}, context = {}) {
  const uniforms = {
    shadow_uDrawShadowMap: Boolean(opts.drawToShadowMap),
    shadow_uUseShadowMap: opts.shadowMaps ? opts.shadowMaps.length > 0 : false,
    shadow_uColor: opts.shadowColor || DEFAULT_SHADOW_COLOR,
    shadow_uLightId: opts.shadowLightId,
    shadow_uLightCount: opts.shadowMatrices.length
  };

  const center = getMemoizedViewportCenterPosition({
    viewport: opts.viewport,
    center: context.project_uCenter
  });

  const projectCenters = [];
  const viewProjectionMatrices = getMemoizedViewProjectionMatrices({
    shadowMatrices: opts.shadowMatrices,
    viewport: opts.viewport
  }).slice();

  for (let i = 0; i < opts.shadowMatrices.length; i++) {
    const viewProjectionMatrix = viewProjectionMatrices[i];
    const viewProjectionMatrixCentered = viewProjectionMatrix
      .clone()
      .translate(new Vector3(opts.viewport.center).negate());

    if (context.project_uCoordinateSystem === PROJECT_COORDINATE_SYSTEM.LNG_LAT) {
      viewProjectionMatrices[i] = viewProjectionMatrixCentered;
      projectCenters[i] = [0, 0, 0, 0];
    } else {
      viewProjectionMatrices[i] = viewProjectionMatrix
        .clone()
        .multiplyRight(VECTOR_TO_POINT_MATRIX);
      projectCenters[i] = viewProjectionMatrixCentered.transformVector4(center);
    }
  }

  for (let i = 0; i < viewProjectionMatrices.length; i++) {
    uniforms[`shadow_uViewProjectionMatrices[${i}]`] = viewProjectionMatrices[i];
    uniforms[`shadow_uProjectCenters[${i}]`] = projectCenters[i];

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
  getUniforms: (opts = {}, context = {}) => {
    if (opts.drawToShadowMap || (opts.shadowMaps && opts.shadowMaps.length > 0)) {
      const shadowUniforms = {};
      const {shadowEnabled = true} = opts;
      if (shadowEnabled && opts.shadowMatrices && opts.shadowMatrices.length > 0) {
        Object.assign(shadowUniforms, createShadowUniforms(opts, context));
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

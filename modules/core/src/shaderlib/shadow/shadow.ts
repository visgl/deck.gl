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
import {COORDINATE_SYSTEM, PROJECTION_MODE} from '../../lib/constants';
import project from '../project/project';
import {Vector3, Matrix4} from '@math.gl/core';
import memoize from '../../utils/memoize';
import {pixelsToWorld} from '@math.gl/web-mercator';

import type {Texture2D} from '@luma.gl/webgl';
import type {ShaderModule, NumericArray} from '../../types/types';
import type Viewport from '../../viewports/viewport';
import type {ProjectUniforms} from '../project/viewport-uniforms';

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
uniform sampler2D shadow_uShadowMap0;
uniform sampler2D shadow_uShadowMap1;
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
    shadowAlpha += shadow_getShadowWeight(shadow_vPosition[0], shadow_uShadowMap0);
    if(shadow_uLightCount > 1.0) {
      shadowAlpha += shadow_getShadowWeight(shadow_vPosition[1], shadow_uShadowMap1);
    }
    shadowAlpha *= shadow_uColor.a / shadow_uLightCount;
    float blendedAlpha = shadowAlpha + color.a * (1.0 - shadowAlpha);

    return vec4(
      mix(color.rgb, shadow_uColor.rgb, shadowAlpha / blendedAlpha),
      blendedAlpha
    );
  }
  return color;
}
`;

const getMemoizedViewportCenterPosition = memoize(getViewportCenterPosition);
const getMemoizedViewProjectionMatrices = memoize(getViewProjectionMatrices);

const DEFAULT_SHADOW_COLOR = [0, 0, 0, 1.0];
const VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];

type ShadowModuleSettings = {
  viewport: Viewport;
  shadowEnabled?: boolean;
  drawToShadowMap?: boolean;
  shadowMaps?: Texture2D[];
  dummyShadowMap?: Texture2D;
  shadowColor?: number[];
  shadowMatrices?: Matrix4[];
  shadowLightId?: number;
};

function screenToCommonSpace(xyz: number[], pixelUnprojectionMatrix: number[]): number[] {
  const [x, y, z] = xyz;
  const coord = pixelsToWorld([x, y, z], pixelUnprojectionMatrix);

  if (Number.isFinite(z)) {
    return coord;
  }
  return [coord[0], coord[1], 0];
}

function getViewportCenterPosition({
  viewport,
  center
}: {
  viewport: Viewport;
  center: NumericArray;
}): NumericArray {
  return new Matrix4(viewport.viewProjectionMatrix).invert().transform(center);
}

function getViewProjectionMatrices({
  viewport,
  shadowMatrices
}: {
  viewport: Viewport;
  shadowMatrices: Matrix4[];
}): Matrix4[] {
  const projectionMatrices: Matrix4[] = [];
  const pixelUnprojectionMatrix = viewport.pixelUnprojectionMatrix;
  const farZ = viewport.isGeospatial ? undefined : 1;
  const corners = [
    [0, 0, farZ], // top left ground
    [viewport.width, 0, farZ], // top right ground
    [0, viewport.height, farZ], // bottom left ground
    [viewport.width, viewport.height, farZ], // bottom right ground
    [0, 0, -1], // top left near
    [viewport.width, 0, -1], // top right near
    [0, viewport.height, -1], // bottom left near
    [viewport.width, viewport.height, -1] // bottom right near
  ].map(pixel =>
    // @ts-expect-error z may be undefined
    screenToCommonSpace(pixel, pixelUnprojectionMatrix)
  );

  for (const shadowMatrix of shadowMatrices) {
    const viewMatrix = shadowMatrix.clone().translate(new Vector3(viewport.center).negate());
    const positions = corners.map(corner => viewMatrix.transform(corner));
    const projectionMatrix = new Matrix4().ortho({
      left: Math.min(...positions.map(position => position[0])),
      right: Math.max(...positions.map(position => position[0])),
      bottom: Math.min(...positions.map(position => position[1])),
      top: Math.max(...positions.map(position => position[1])),
      near: Math.min(...positions.map(position => -position[2])),
      far: Math.max(...positions.map(position => -position[2]))
    });
    projectionMatrices.push(projectionMatrix.multiplyRight(shadowMatrix));
  }
  return projectionMatrices;
}

/* eslint-disable camelcase */

// eslint-disable-next-line complexity
function createShadowUniforms(
  opts: ShadowModuleSettings,
  context: ProjectUniforms
): Record<string, any> {
  const {shadowEnabled = true} = opts;
  if (!shadowEnabled || !opts.shadowMatrices || !opts.shadowMatrices.length) {
    return {
      shadow_uDrawShadowMap: false,
      shadow_uUseShadowMap: false
    };
  }
  const uniforms = {
    shadow_uDrawShadowMap: Boolean(opts.drawToShadowMap),
    shadow_uUseShadowMap: opts.shadowMaps ? opts.shadowMaps.length > 0 : false,
    shadow_uColor: opts.shadowColor || DEFAULT_SHADOW_COLOR,
    shadow_uLightId: opts.shadowLightId || 0,
    shadow_uLightCount: opts.shadowMatrices.length
  };

  const center = getMemoizedViewportCenterPosition({
    viewport: opts.viewport,
    center: context.project_uCenter
  });

  const projectCenters: NumericArray[] = [];
  const viewProjectionMatrices = getMemoizedViewProjectionMatrices({
    shadowMatrices: opts.shadowMatrices,
    viewport: opts.viewport
  }).slice();

  for (let i = 0; i < opts.shadowMatrices.length; i++) {
    const viewProjectionMatrix = viewProjectionMatrices[i];
    const viewProjectionMatrixCentered = viewProjectionMatrix
      .clone()
      .translate(new Vector3(opts.viewport.center).negate());

    if (
      context.project_uCoordinateSystem === COORDINATE_SYSTEM.LNGLAT &&
      context.project_uProjectionMode === PROJECTION_MODE.WEB_MERCATOR
    ) {
      viewProjectionMatrices[i] = viewProjectionMatrixCentered;
      projectCenters[i] = center;
    } else {
      viewProjectionMatrices[i] = viewProjectionMatrix
        .clone()
        .multiplyRight(VECTOR_TO_POINT_MATRIX);
      projectCenters[i] = viewProjectionMatrixCentered.transform(center);
    }
  }

  for (let i = 0; i < viewProjectionMatrices.length; i++) {
    uniforms[`shadow_uViewProjectionMatrices[${i}]`] = viewProjectionMatrices[i];
    uniforms[`shadow_uProjectCenters[${i}]`] = projectCenters[i];

    if (opts.shadowMaps && opts.shadowMaps.length > 0) {
      uniforms[`shadow_uShadowMap${i}`] = opts.shadowMaps[i];
    } else {
      uniforms[`shadow_uShadowMap${i}`] = opts.dummyShadowMap;
    }
  }
  return uniforms;
}

export default {
  name: 'shadow',
  dependencies: [project],
  vs,
  fs,
  inject: {
    'vs:DECKGL_FILTER_GL_POSITION': `
    position = shadow_setVertexPosition(geometry.position);
    `,
    'fs:DECKGL_FILTER_COLOR': `
    color = shadow_filterShadowColor(color);
    `
  },
  getUniforms: (opts = {}, context = {}) => {
    if (
      'viewport' in opts &&
      (opts.drawToShadowMap || (opts.shadowMaps && opts.shadowMaps.length > 0))
    ) {
      // @ts-expect-error if opts.viewport is defined, context should contain the project module's uniforms
      return createShadowUniforms(opts, context);
    }
    return {};
  }
} as ShaderModule<ShadowModuleSettings>;

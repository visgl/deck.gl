// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {COORDINATE_SYSTEM, PROJECTION_MODE} from '../project/constants';
import project from '../project/project';
import {Vector3, Matrix4} from '@math.gl/core';
import type {NumericArray} from '@math.gl/core';
import memoize from '../../utils/memoize';
import {pixelsToWorld} from '@math.gl/web-mercator';

import type {Texture} from '@luma.gl/core';
import {ShaderModule} from '@luma.gl/shaders';
import type Viewport from '../../viewports/viewport';
import type {ShadowBounds} from '../../effects/lighting/directional-light';
import {ProjectProps, ProjectUniforms} from '../project/viewport-uniforms';

const uniformBlock = /* glsl */ `
layout(std140) uniform shadowUniforms {
  bool drawShadowMap;
  bool useShadowMap;
  vec4 color;
  highp int lightId;
  float lightCount;
  mat4 viewProjectionMatrix0;
  mat4 viewProjectionMatrix1;
  vec4 projectCenter0;
  vec4 projectCenter1;
} shadow;
`;

const vertex = /* glsl */ `
const int max_lights = 2;

out vec3 shadow_vPosition[max_lights];

vec4 shadow_setVertexPosition(vec4 position_commonspace) {
  mat4 viewProjectionMatrices[max_lights];
  viewProjectionMatrices[0] = shadow.viewProjectionMatrix0;
  viewProjectionMatrices[1] = shadow.viewProjectionMatrix1;
  vec4 projectCenters[max_lights];
  projectCenters[0] = shadow.projectCenter0;
  projectCenters[1] = shadow.projectCenter1;

  if (shadow.drawShadowMap) {
    return project_common_position_to_clipspace(position_commonspace, viewProjectionMatrices[shadow.lightId], projectCenters[shadow.lightId]);
  }
  if (shadow.useShadowMap) {
    for (int i = 0; i < max_lights; i++) {
      if(i < int(shadow.lightCount)) {
        vec4 shadowMap_position = project_common_position_to_clipspace(position_commonspace, viewProjectionMatrices[i], projectCenters[i]);
        shadow_vPosition[i] = (shadowMap_position.xyz / shadowMap_position.w + 1.0) / 2.0;
      }
    }
  }
  return gl_Position;
}
`;

const vs = `
${uniformBlock}
${vertex}
`;

const fragment = /* glsl */ `
const int max_lights = 2;
uniform sampler2D shadow_uShadowMap0;
uniform sampler2D shadow_uShadowMap1;

in vec3 shadow_vPosition[max_lights];

const vec4 bitPackShift = vec4(1.0, 255.0, 65025.0, 16581375.0);
const vec4 bitUnpackShift = 1.0 / bitPackShift;
const vec4 bitMask = vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0,  0.0);

float shadow_getShadowWeight(vec3 position, sampler2D shadowMap) {
  // Nothing outside the light's frustum was drawn into the shadow map
  if (any(lessThan(position, vec3(0.0))) || any(greaterThan(position, vec3(1.0)))) {
    return 0.0;
  }
  vec4 rgbaDepth = texture(shadowMap, position.xy);

  float z = dot(rgbaDepth, bitUnpackShift);
  return smoothstep(0.001, 0.01, position.z - z);
}

vec4 shadow_filterShadowColor(vec4 color) {
  if (shadow.drawShadowMap) {
    vec4 rgbaDepth = fract(gl_FragCoord.z * bitPackShift);
    rgbaDepth -= rgbaDepth.gbaa * bitMask;
    return rgbaDepth;
  }
  if (shadow.useShadowMap) {
    float shadowAlpha = 0.0;
    shadowAlpha += shadow_getShadowWeight(shadow_vPosition[0], shadow_uShadowMap0);
    if(shadow.lightCount > 1.0) {
      shadowAlpha += shadow_getShadowWeight(shadow_vPosition[1], shadow_uShadowMap1);
    }
    shadowAlpha *= shadow.color.a / shadow.lightCount;
    float blendedAlpha = shadowAlpha + color.a * (1.0 - shadowAlpha);

    return vec4(
      mix(color.rgb, shadow.color.rgb, shadowAlpha / blendedAlpha),
      blendedAlpha
    );
  }
  return color;
}
`;

const fs = `
${uniformBlock}
${fragment}
`;

const getMemoizedViewportCenterPosition = memoize(getViewportCenterPosition);
const getMemoizedViewProjectionMatrices = memoize(getViewProjectionMatrices);

const DEFAULT_SHADOW_COLOR: NumberArray4 = [0, 0, 0, 1.0];
const VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];

export type ShadowModuleProps = {
  project: ProjectProps;
  shadowEnabled?: boolean;
  drawToShadowMap?: boolean;
  shadowMaps?: Texture[];
  dummyShadowMap: Texture;
  shadowColor?: NumberArray4;
  shadowMatrices?: Matrix4[];
  /** Per light: world-space bounds to fit its shadow map to, see `DirectionalLight._shadowBounds` */
  shadowBounds?: (ShadowBounds | null)[];
  shadowLightId?: number;
};

type ShadowModuleUniforms = {
  drawShadowMap: boolean;
  useShadowMap: boolean;
  color?: NumberArray4;
  lightId?: number;
  lightCount?: number;
  viewProjectionMatrix0?: NumberArray16;
  viewProjectionMatrix1?: NumberArray16;
  projectCenter0?: NumberArray4;
  projectCenter1?: NumberArray4;
};

type ShadowModuleBindings = {
  shadow_uShadowMap0: Texture;
  shadow_uShadowMap1: Texture;
};

/**
 * Returns the corners of the view frustum in common space. For geospatial viewports the frustum
 * is clipped to z >= 0, since the visible geometry is assumed to be on or above the ground.
 */
function getFrustumCorners(viewport: Viewport): number[][] {
  const {width, height, pixelUnprojectionMatrix} = viewport;
  const screenCorners = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height]
  ];
  const near = screenCorners.map(([x, y]) => pixelsToWorld([x, y, -1], pixelUnprojectionMatrix));
  const far = screenCorners.map(([x, y]) => pixelsToWorld([x, y, 1], pixelUnprojectionMatrix));
  if (!viewport.isGeospatial) {
    return near.concat(far);
  }

  // Frustum vertices above the ground, plus the points where frustum edges cross the ground.
  // At high pitch the far plane crosses the ground, so the visible area ends at the far plane
  // instead of where the corner rays hit the ground.
  const corners = near.concat(far).filter(corner => corner[2] >= 0);
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    for (const [a, b] of [
      [near[i], far[i]],
      [near[i], near[j]],
      [far[i], far[j]]
    ]) {
      if (a[2] < 0 !== b[2] < 0) {
        const t = a[2] / (a[2] - b[2]);
        corners.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 0]);
      }
    }
  }
  return corners.length > 0 ? corners : near.concat(far);
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

type LightBox = {
  left: number;
  right: number;
  bottom: number;
  top: number;
  near: number;
  far: number;
};

/** Returns the box around `positions` in a light's view space. */
function getLightBox(positions: NumericArray[]): LightBox {
  return {
    left: Math.min(...positions.map(position => position[0])),
    right: Math.max(...positions.map(position => position[0])),
    bottom: Math.min(...positions.map(position => position[1])),
    top: Math.max(...positions.map(position => position[1])),
    near: Math.min(...positions.map(position => -position[2])),
    far: Math.max(...positions.map(position => -position[2]))
  };
}

/** Returns the part of `box` inside `bounds`, or `box` when they don't overlap. */
function clipLightBox(box: LightBox, bounds: LightBox): LightBox {
  const clipped = {
    left: Math.max(box.left, bounds.left),
    right: Math.min(box.right, bounds.right),
    bottom: Math.max(box.bottom, bounds.bottom),
    top: Math.min(box.top, bounds.top),
    near: Math.max(box.near, bounds.near),
    far: Math.min(box.far, bounds.far)
  };
  const overlaps =
    clipped.left < clipped.right && clipped.bottom < clipped.top && clipped.near < clipped.far;
  return overlaps ? clipped : box;
}

/** Returns the corners of world-space shadow bounds in common space. */
function getBoundsCorners(viewport: Viewport, [min, max]: ShadowBounds): number[][] {
  const corners: number[][] = [];
  for (const x of [min[0], max[0]]) {
    for (const y of [min[1], max[1]]) {
      for (const z of [min[2] ?? 0, max[2] ?? 0]) {
        corners.push(viewport.projectPosition([x, y, z]));
      }
    }
  }
  return corners;
}

function getViewProjectionMatrices({
  viewport,
  shadowMatrices,
  shadowBounds
}: {
  viewport: Viewport;
  shadowMatrices: Matrix4[];
  shadowBounds?: (ShadowBounds | null)[];
}): Matrix4[] {
  const projectionMatrices: Matrix4[] = [];
  const corners = getFrustumCorners(viewport);

  for (let i = 0; i < shadowMatrices.length; i++) {
    const shadowMatrix = shadowMatrices[i];
    const viewMatrix = shadowMatrix.clone().translate(new Vector3(viewport.center).negate());
    let box = getLightBox(corners.map(corner => viewMatrix.transform(corner)));
    // Fit the shadow map to the part of the light's bounds in view, so that its texels and its
    // depth range stay small when the view spans kilometers (zoomed out or steeply pitched)
    const bounds = shadowBounds?.[i];
    if (bounds) {
      const boundsCorners = getBoundsCorners(viewport, bounds);
      box = clipLightBox(
        box,
        getLightBox(boundsCorners.map(corner => viewMatrix.transform(corner)))
      );
    }
    const projectionMatrix = new Matrix4().ortho(box);
    projectionMatrices.push(projectionMatrix.multiplyRight(shadowMatrix));
  }
  return projectionMatrices;
}

/* eslint-disable camelcase */

// eslint-disable-next-line complexity
function createShadowUniforms(
  opts: Partial<ShadowModuleProps>
): Partial<ShadowModuleBindings> & ShadowModuleUniforms {
  const {shadowEnabled = true, project: projectProps} = opts;
  if (!shadowEnabled || !projectProps || !opts.shadowMatrices || !opts.shadowMatrices.length) {
    const uniforms = {drawShadowMap: false, useShadowMap: false};
    // Passes that leave the LightingEffect out (picking, masks) still call getUniforms, with
    // empty props. Keep the shadow maps already bound then: undefined bindings would unbind
    // them, and luma.gl skips draws with missing texture bindings.
    if (!opts.dummyShadowMap) {
      return uniforms;
    }
    return {
      ...uniforms,
      shadow_uShadowMap0: opts.dummyShadowMap,
      shadow_uShadowMap1: opts.dummyShadowMap
    };
  }
  const projectUniforms = project.getUniforms(projectProps) as ProjectUniforms;
  const center = getMemoizedViewportCenterPosition({
    viewport: projectProps.viewport,
    center: projectUniforms.center
  });

  const projectCenters: NumericArray[] = [];
  const viewProjectionMatrices = getMemoizedViewProjectionMatrices({
    shadowMatrices: opts.shadowMatrices,
    shadowBounds: opts.shadowBounds,
    viewport: projectProps.viewport
  }).slice();

  for (let i = 0; i < opts.shadowMatrices.length; i++) {
    const viewProjectionMatrix = viewProjectionMatrices[i];
    const viewProjectionMatrixCentered = viewProjectionMatrix
      .clone()
      .translate(new Vector3(projectProps.viewport.center).negate());

    if (
      projectUniforms.coordinateFrame === COORDINATE_SYSTEM.GEODETIC &&
      projectUniforms.projectionMode === PROJECTION_MODE.WEB_MERCATOR
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

  const uniforms: ShadowModuleUniforms & ShadowModuleBindings = {
    drawShadowMap: Boolean(opts.drawToShadowMap),
    useShadowMap: opts.shadowMaps ? opts.shadowMaps.length > 0 : false,
    color: opts.shadowColor || DEFAULT_SHADOW_COLOR,
    lightId: opts.shadowLightId || 0,
    lightCount: opts.shadowMatrices.length,
    shadow_uShadowMap0: opts.dummyShadowMap!,
    shadow_uShadowMap1: opts.dummyShadowMap!
  };

  for (let i = 0; i < viewProjectionMatrices.length; i++) {
    uniforms[`viewProjectionMatrix${i}`] = viewProjectionMatrices[i];
    uniforms[`projectCenter${i}`] = projectCenters[i];
  }

  for (let i = 0; i < 2; i++) {
    uniforms[`shadow_uShadowMap${i}`] =
      (opts.shadowMaps && opts.shadowMaps[i]) || opts.dummyShadowMap;
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
  getUniforms: createShadowUniforms,
  uniformTypes: {
    drawShadowMap: 'f32',
    useShadowMap: 'f32',
    color: 'vec4<f32>',
    lightId: 'i32',
    lightCount: 'f32',
    viewProjectionMatrix0: 'mat4x4<f32>',
    viewProjectionMatrix1: 'mat4x4<f32>',
    projectCenter0: 'vec4<f32>',
    projectCenter1: 'vec4<f32>'
  }
} as const satisfies ShaderModule<ShadowModuleProps, ShadowModuleUniforms, ShadowModuleBindings>;

// TODO replace with type from math.gl
type NumberArray4 = [number, number, number, number];
type NumberArray16 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

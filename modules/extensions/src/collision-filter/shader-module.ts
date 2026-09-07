// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Framebuffer, Texture, TextureView} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';
import {project, picking, UNIT} from '@deck.gl/core';

const uniformBlock = /* glsl */ `
layout(std140) uniform collisionUniforms {
  bool sort;
  bool enabled;
  highp float sizeScale;
  highp float sizeMinPixels;
  highp float sizeMaxPixels;
  highp int sizeUnits;
  highp float pickingColorOffset;
} collision;
`;

const vs = /* glsl */ `
in float collisionPriorities;
flat out highp vec3 collision_pickingColor;

uniform sampler2D collision_texture;

${uniformBlock}

// Layers with screen-space offsets can supply the projected label center.
vec4 collision_position = vec4(0.0);
bool collision_usePosition = false;

float collision_getSize(float size) {
  return clamp(project_size_to_pixel(size * collision.sizeScale, collision.sizeUnits),
    collision.sizeMinPixels, collision.sizeMaxPixels);
}

vec3 collision_getPickingColor(vec3 color) {
  vec3 normalizedColor = picking_normalizeColor(color);
  if (collision.pickingColorOffset == 0.0) return normalizedColor;
  vec3 bytes = round(normalizedColor * 255.0);
  float index = dot(bytes, vec3(1.0, 256.0, 65536.0)) + collision.pickingColorOffset;
  return vec3(mod(index, 256.0), mod(floor(index / 256.0), 256.0), floor(index / 65536.0)) / 255.0;
}

vec2 collision_getCoords(vec4 position) {
  vec4 collision_clipspace = project_common_position_to_clipspace(position);
  return (1.0 + collision_clipspace.xy / collision_clipspace.w) / 2.0;
}

float collision_match(vec2 tex, vec3 pickingColor) {
  vec4 collision_pickingColor = texture(collision_texture, tex);
  float delta = dot(abs(collision_pickingColor.rgb - pickingColor), vec3(1.0));
  float e = 0.5 / 255.0;
  return step(delta, e);
}

float collision_isVisible(vec2 texCoords, vec3 pickingColor) {
  if (!collision.enabled) {
    return 1.0;
  }

  // Rectangle-backed text has a shared interior sample point. Interpolate the
  // four neighboring texels for a stable edge fade, without the 25-tap kernel
  // needed by point/line geometry. Half coverage is sufficient for full opacity.
  if (collision_usePosition) {
    vec2 texSize = vec2(textureSize(collision_texture, 0));
    vec2 texel = texCoords * texSize - 0.5;
    vec2 fraction = fract(texel);
    vec2 origin = (floor(texel) + 0.5) / texSize;
    vec2 step = 1.0 / texSize;
    float coverage = mix(
      mix(collision_match(origin, pickingColor), collision_match(origin + vec2(step.x, 0.0), pickingColor), fraction.x),
      mix(collision_match(origin + vec2(0.0, step.y), pickingColor), collision_match(origin + step, pickingColor), fraction.x),
      fraction.y
    );
    return smoothstep(0.0, 0.5, coverage);
  }

  // Visibility test, sample area of 5x5 pixels in order to fade in/out.
  // Due to the locality, the lookups will be cached
  // This reduces the flicker present when objects are shown/hidden
  const int N = 2;
  float accumulator = 0.0;
  vec2 step = vec2(1.0 / project.viewportSize);

  const float floatN = float(N);
  vec2 delta = -floatN * step;
  for(int i = -N; i <= N; i++) {
    delta.x = -step.x * floatN;
    for(int j = -N; j <= N; j++) {
      accumulator += collision_match(texCoords + delta, pickingColor);
      delta.x += step.x;
    }
    delta.y += step.y;
  }

  float W = 2.0 * floatN + 1.0;
  return pow(accumulator / (W * W), 2.2);
}
`;

const fs = /* glsl */ `
${uniformBlock}
flat in highp vec3 collision_pickingColor;
`;

const inject = {
  'vs:#decl': /* glsl */ `
  float collision_fade = 1.0;
`,
  'vs:DECKGL_FILTER_GL_POSITION': /* glsl */ `
  if (collision.sort || collision.enabled) {
    collision_pickingColor = collision_getPickingColor(geometry.pickingColor);
  }
  if (collision.sort) {
    float collisionPriority = collisionPriorities;
    position.z = -0.001 * collisionPriority * position.w; // Support range -1000 -> 1000
  }

  if (collision.enabled) {
    vec4 collision_common_position = project_position(vec4(geometry.worldPosition, 1.0));
    vec2 collision_texCoords = collision_usePosition
      ? (1.0 + collision_position.xy / collision_position.w) / 2.0
      : collision_getCoords(collision_common_position);
    collision_fade = collision_isVisible(collision_texCoords, collision_pickingColor);
    if (collision_fade < 0.0001) {
      // Position outside clip space bounds to discard
      position = vec4(0.0, 0.0, 2.0, 1.0);
    }
  }
  `,
  'vs:DECKGL_FILTER_COLOR': /* glsl */ `
  color.a *= collision_fade;
  `,
  'fs:DECKGL_FILTER_COLOR': {
    order: 101,
    injection: /* glsl */ `
    if (collision.sort) color = vec4(collision_pickingColor, 1.0);
    `
  }
};

export type CollisionModuleProps = {
  enabled: boolean;
  collisionFBO?: Framebuffer;
  drawToCollisionMap?: boolean;
  dummyCollisionMap?: Texture;
  pickingColorOffset?: number;
  sizeScale?: number;
  sizeMinPixels?: number;
  sizeMaxPixels?: number;
  sizeUnits?: string;
};

/* eslint-disable camelcase */
type CollisionUniforms = {
  enabled?: boolean;
  sort?: boolean;
  pickingColorOffset?: number;
  sizeScale?: number;
  sizeMinPixels?: number;
  sizeMaxPixels?: number;
  sizeUnits?: number;
};

type CollisionBindings = {
  collision_texture?: TextureView | Texture;
};

const getCollisionUniforms = (
  opts: CollisionModuleProps | {}
): CollisionBindings & CollisionUniforms => {
  if (!opts || !('dummyCollisionMap' in opts)) {
    return {};
  }
  const {enabled, collisionFBO, drawToCollisionMap, dummyCollisionMap} = opts;
  return {
    enabled: enabled && !drawToCollisionMap,
    sort: Boolean(drawToCollisionMap),
    pickingColorOffset: opts.pickingColorOffset ?? 0,
    sizeScale: opts.sizeScale ?? 1,
    sizeMinPixels: opts.sizeMinPixels ?? 0,
    sizeMaxPixels: opts.sizeMaxPixels ?? Number.MAX_SAFE_INTEGER,
    sizeUnits: UNIT[opts.sizeUnits || 'pixels'],
    collision_texture:
      !drawToCollisionMap && collisionFBO ? collisionFBO.colorAttachments[0] : dummyCollisionMap
  };
};

// @ts-ignore
export default {
  name: 'collision',
  dependencies: [project, picking],
  vs,
  fs,
  inject,
  getUniforms: getCollisionUniforms,
  uniformTypes: {
    sort: 'i32',
    enabled: 'i32',
    sizeScale: 'f32',
    sizeMinPixels: 'f32',
    sizeMaxPixels: 'f32',
    sizeUnits: 'i32',
    pickingColorOffset: 'f32'
  }
} as ShaderModule<CollisionModuleProps>;

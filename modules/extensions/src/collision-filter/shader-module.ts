// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Framebuffer, Texture, TextureView} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';
import {project, picking} from '@deck.gl/core';

const vs = /* glsl */ `
in float collisionPriorities;
out vec3 collisionPickingColor;

uniform sampler2D collision_texture;

layout(std140) uniform collisionUniforms {
  bool sort;
  bool enabled;
} collision;

vec2 collision_getCoords(vec4 position) {
  vec4 collision_clipspace = project_common_position_to_clipspace(position);
  return (1.0 + collision_clipspace.xy / collision_clipspace.w) / 2.0;
}

float collision_match(vec2 tex, vec3 pickingColor) {
  vec4 collision_pickingColor = texture(collision_texture, tex);
  vec3 expectedPickingBytes = round(picking_normalizeColor(pickingColor) * 255.0);
  vec3 actualPickingBytes = round(collision_pickingColor.rgb * 255.0);
  float delta = dot(abs(actualPickingBytes - expectedPickingBytes), vec3(1.0));
  float e = 0.5;
  return step(delta, e);
}

float collision_isVisible(vec2 texCoords, vec3 pickingColor) {
  if (!collision.enabled) {
    return 1.0;
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
in vec3 collisionPickingColor;

layout(std140) uniform collisionUniforms {
  bool sort;
  bool enabled;
} collision;
`;

const inject = {
  'vs:#decl': /* glsl */ `
  float collision_fade = 1.0;
`,
  'vs:#main-start': /* glsl */ `
  geometryCollisionUseTexCoordsOverride = false;
  geometryCollisionTexCoordsOverride = vec2(0.0);
  geometryCollisionFadeOverride = -1.0;
`,
  'vs:DECKGL_FILTER_GL_POSITION': /* glsl */ `
  collisionPickingColor = picking_normalizeColor(geometry.pickingColor);

  if (collision.sort) {
    float collisionPriority = collisionPriorities;
    position.z = -0.001 * collisionPriority * position.w; // Support range -1000 -> 1000
  }

  if (collision.enabled) {
    vec4 collision_common_position = project_position(vec4(geometry.worldPosition, 1.0));
    vec2 collision_texCoords = geometryCollisionUseTexCoordsOverride
      ? geometryCollisionTexCoordsOverride
      : collision_getCoords(collision_common_position);
    collision_fade = geometryCollisionFadeOverride >= 0.0
      ? geometryCollisionFadeOverride
      : collision_isVisible(collision_texCoords, geometry.pickingColor);
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
  if (collision.sort) {
    color = vec4(collisionPickingColor, 1.0);
  }
  `
  }
};

export type CollisionModuleProps = {
  enabled: boolean;
  collisionFBO?: Framebuffer;
  drawToCollisionMap?: boolean;
  dummyCollisionMap?: Texture;
};

/* eslint-disable camelcase */
type CollisionUniforms = {
  enabled?: boolean;
  sort?: boolean;
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
    enabled: 'i32'
  }
} as ShaderModule<CollisionModuleProps>;

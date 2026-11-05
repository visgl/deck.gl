// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Framebuffer, Texture, TextureView} from '@luma.gl/core';
import type {ShaderModule, ShaderPlugin} from '@luma.gl/shaders';
import {project} from '@deck.gl/core';

const vs = /* glsl */ `
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
  float delta = dot(abs(collision_pickingColor.rgb - pickingColor), vec3(1.0));
  float e = 0.001;
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

const inject = {
  'glsl:vs:DECKGL_FILTER_GL_POSITION': /* glsl */ `
  collision_fade = 1.0;
  if (collision.sort) {
    float collisionPriority = collisionPriorities;
    position.z = -0.001 * collisionPriority * position.w; // Support range -1000 -> 1000
  }

  if (collision.enabled) {
    vec4 collision_common_position = project_position(vec4(geometry.worldPosition, 1.0));
    vec2 collision_texCoords = collision_getCoords(collision_common_position);
    collision_fade = collision_isVisible(collision_texCoords, geometry.pickingColor / 255.0);
    if (collision_fade < 0.0001) {
      // Position outside clip space bounds to discard
      position = vec4(0.0, 0.0, 2.0, 1.0);
    }
  }
  `,
  'glsl:vs:DECKGL_FILTER_COLOR': /* glsl */ `
  color.a *= collision_fade;
  `
};

const source = /* wgsl */ `
struct CollisionUniforms {
  sort: i32,
  enabled: i32,
};
@group(0) @binding(auto) var<uniform> collision: CollisionUniforms;
@group(0) @binding(auto) var collision_texture: texture_2d<f32>;

fn collision_getCoords(position: vec4<f32>) -> vec2<f32> {
  let clipPosition = project_common_position_to_clipspace(position);
  // WebGPU textures start at the top left.
  return vec2<f32>(0.5) + clipPosition.xy / clipPosition.w * vec2<f32>(0.5, -0.5);
}

fn collision_getVisibility(uv: vec2<f32>, id: vec3<f32>) -> f32 {
  let dimensions = textureDimensions(collision_texture);
  let step = vec2<f32>(1.0) / project.viewportSize;
  var count = 0.0;
  for (var y = -2; y <= 2; y++) {
    for (var x = -2; x <= 2; x++) {
      let offset = vec2<f32>(f32(x), f32(y)) * step;
      let texel = clamp(
        vec2<i32>(floor((uv + offset) * vec2<f32>(dimensions))),
        vec2<i32>(0), vec2<i32>(dimensions) - vec2<i32>(1)
      );
      let sampledId = textureLoad(collision_texture, texel, 0).rgb;
      let delta = dot(abs(sampledId - id), vec3<f32>(1.0));
      count += select(0.0, 1.0, delta <= 0.001);
    }
  }
  return pow(count / 25.0, 2.2);
}
`;

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
const collisionModule = {
  name: 'collision',
  dependencies: [project],
  vs,
  source,
  getUniforms: getCollisionUniforms,
  uniformTypes: {
    sort: 'i32',
    enabled: 'i32'
  }
} as ShaderModule<CollisionModuleProps>;

export const collisionPlugin: ShaderPlugin = {
  name: 'collision',
  module: collisionModule,
  vertexInputs: {collisionPriorities: 'f32'},
  interStageVariables: {collision_fade: {type: 'f32'}},
  injections: {
    ...inject,
    'wgsl:vs:DECKGL_FILTER_GL_POSITION': /* wgsl */ `
collision_fade = 1.0;
if (collision.sort != 0 && (*position).w > 0.0 && (*position).z <= (*position).w) {
  // WebGPU's normalized depth range is [0, 1].
  (*position).z = (0.5 - 0.0005 * clamp(collisionPriorities, -1000.0, 1000.0)) * (*position).w;
}
if (collision.enabled != 0) {
  let commonPosition = project_position_vec3_f64(geometry.worldPosition, vec3<f32>(0.0));
  collision_fade = collision_getVisibility(
    collision_getCoords(vec4<f32>(commonPosition, 1.0)), geometry.pickingColor
  );
  if (collision_fade < 0.0001) {
    *position = vec4<f32>(0.0, 0.0, 2.0, 1.0);
  }
}
`,
    'wgsl:fs:DECKGL_FILTER_COLOR': /* wgsl */ `
if (collision.enabled != 0) {
  if (collision_fade < 0.0001) { discard; }
  (*color).a *= collision_fade;
}
`
  }
};

export default collisionModule;

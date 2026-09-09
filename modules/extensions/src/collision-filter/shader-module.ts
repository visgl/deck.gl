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
  bool visibilityPass;
  bool hasColliders;
  bool greedy;
  vec2 visibilitySize;
  highp float sizeScale;
  highp float sizeMinPixels;
  highp float sizeMaxPixels;
  highp int sizeUnits;
  highp float pickingColorOffset;
} collision;
`;

const priorityDepth = /* glsl */ `
float collision_getPriorityDepth(float priority) {
  // Keep the supported range [-1000, 1000] inside the clip planes. A power-of-two
  // divisor also avoids rounding the scale itself when comparing equal priorities.
  return -priority / 1024.0;
}
`;

const vs = /* glsl */ `
${priorityDepth}
in float collisionPriorities;
flat out highp vec3 collision_pickingColor;
flat out float collision_priority;

uniform sampler2D collision_texture;
uniform sampler2D collision_visibilityTexture;

${uniformBlock}

// Text layers supply their projected footprint for the visibility pass.
flat out vec4 collision_position;
bool collision_useBounds = false;
flat out vec2 collision_corners[4];

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

ivec2 collision_getVisibilityPixel(vec3 pickingColor) {
  float index = dot(round(pickingColor * 255.0), vec3(1.0, 256.0, 65536.0));
  float columns = collision.visibilitySize.x / 4.0;
  return ivec2(mod(index, columns), floor(index / columns)) * 4;
}

vec4 collision_getVisibilityPosition(vec2 corner) {
  vec2 pixel = vec2(collision_getVisibilityPixel(collision_pickingColor)) + corner * 4.0;
  return vec4(pixel / collision.visibilitySize * 2.0 - 1.0, 0.0, 1.0);
}

float collision_isVisible(vec2 texCoords, vec3 pickingColor) {
  if (!collision.enabled) {
    return 1.0;
  }

  if (collision_useBounds) {
    ivec2 first = collision_getVisibilityPixel(pickingColor);
    if (collision.greedy) {
      return texelFetch(collision_visibilityTexture, first + ivec2(3, 3), 0).r;
    }
    for (int y = 0; y < 4; y++) {
      for (int x = 0; x < 4; x++) {
        if (texelFetch(collision_visibilityTexture, first + ivec2(x, y), 0).r < 0.5) return 0.0;
      }
    }
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
${uniformBlock}
${priorityDepth}
flat in highp vec3 collision_pickingColor;
flat in float collision_priority;
flat in vec4 collision_position;
flat in vec2 collision_corners[4];
uniform sampler2D collision_texture;
uniform highp sampler2D collision_depthTexture;
bool collision_isOccluded(ivec2 pixel, vec3 pickingColor) {
  vec4 color = texelFetch(collision_texture, pixel, 0);
  if (color.a == 0.0 || all(lessThan(abs(color.rgb - pickingColor), vec3(0.5 / 255.0)))) {
    return false;
  }
  // Ignore lower-priority geometry visible through rounded corners or clipping.
  // The depth buffer is 16-bit; equal depths use the collision pass's draw order.
  float depth = texelFetch(collision_depthTexture, pixel, 0).r;
  float ownDepth = (1.0 + collision_getPriorityDepth(collision_priority)) * 0.5;
  return depth <= ownDepth + 0.5 / 65535.0;
}

float collision_testBounds(vec3 pickingColor, int tileIndex) {
  if (!collision.hasColliders) return 1.0;
  ivec2 size = textureSize(collision_texture, 0);
  vec2 minCorner = min(min(collision_corners[0], collision_corners[1]), min(collision_corners[2], collision_corners[3]));
  vec2 maxCorner = max(max(collision_corners[0], collision_corners[1]), max(collision_corners[2], collision_corners[3]));
  ivec2 first = max(ivec2(floor(minCorner * vec2(size))), ivec2(0));
  ivec2 last = min(ivec2(ceil(maxCorner * vec2(size))), size - 1);

  // Check the center first: densely packed labels usually reject in one lookup.
  vec2 center = (collision_position.xy / collision_position.w + 1.0) / 2.0;
  ivec2 centerPixel = ivec2(center * vec2(size));
  if (all(greaterThanEqual(centerPixel, first)) && all(lessThanEqual(centerPixel, last)) &&
      collision_isOccluded(centerPixel, pickingColor)) return 0.0;

  // Greedy mode reserves ten texels for metadata; the GPU-only path uses all sixteen.
  ivec2 tiles = collision.greedy ? ivec2(2, 3) : ivec2(4);
  ivec2 extent = (last - first + tiles) / tiles;
  ivec2 tile = ivec2(tileIndex % tiles.x, tileIndex / tiles.x);
  first += tile * extent;
  last = min(last, first + extent - 1);

  // Test every covered map pixel, rather than a fixed sample grid that can miss
  // edge intersections or a small, higher-priority label inside a larger label.
  vec3 edges[4];
  for (int i = 0; i < 4; i++) {
    vec2 a = collision_corners[i] * vec2(size);
    vec2 b = collision_corners[(i + 1) % 4] * vec2(size);
    vec2 normal = vec2(a.y - b.y, b.x - a.x);
    edges[i] = vec3(normal, -dot(normal, a));
  }
  for (int y = first.y; y <= last.y; y++) {
    for (int x = first.x; x <= last.x; x++) {
      vec3 point = vec3(vec2(x, y) + 0.5, 1.0);
      vec4 distances = vec4(dot(edges[0], point), dot(edges[1], point), dot(edges[2], point), dot(edges[3], point));
      bool inside = all(greaterThanEqual(distances, vec4(0.0))) || all(lessThanEqual(distances, vec4(0.0)));
      if (inside && collision_isOccluded(ivec2(x, y), pickingColor)) return 0.0;
    }
  }
  return 1.0;
}
// Store projected bounds in RGBA8, avoiding a floating-point render-target requirement.
vec4 collision_getBoundsData() {
  ivec2 tile = ivec2(gl_FragCoord.xy) % 4;
  int component = tile.y * 4 + tile.x;
  if (!collision.greedy) return vec4(collision_testBounds(collision_pickingColor, component), 0.0, 0.0, 1.0);
  if (component >= 10) return vec4(collision_testBounds(collision_pickingColor, component - 10), 0.0, 0.0, 1.0);
  float value = 0.0;
  if (component < 8) value = collision_corners[component / 2][component % 2];
  if (component == 8) value = collision_priority;
  if (component == 9) value = 1.0;
  uint bits = floatBitsToUint(value);
  return vec4(uvec4(bits, bits >> 8, bits >> 16, bits >> 24) & 255u) / 255.0;
}
`;

const inject = {
  'vs:#decl': /* glsl */ `
  float collision_fade = 1.0;
`,
  'vs:DECKGL_FILTER_GL_POSITION': /* glsl */ `
  if (collision.sort || collision.enabled) {
    collision_priority = collisionPriorities;
    collision_pickingColor = collision_getPickingColor(geometry.pickingColor);
  }
  if (collision.sort) {
    position.z = collision_getPriorityDepth(collisionPriorities) * position.w;
  }

  if (collision.enabled && !collision.visibilityPass && (!collision.sort || collision_useBounds)) {
    vec4 collision_common_position = project_position(vec4(geometry.worldPosition, 1.0));
    vec2 collision_texCoords = collision_getCoords(collision_common_position);
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
  isTextLayer?: boolean;
  collisionFBO?: Framebuffer;
  drawToCollisionMap?: boolean;
  drawToCollisionVisibility?: boolean;
  filterByVisibility?: boolean;
  hasColliders?: boolean;
  greedy?: boolean;
  visibilityFBO?: Framebuffer;
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
  visibilityPass?: boolean;
  hasColliders?: boolean;
  greedy?: boolean;
  visibilitySize?: [number, number];
  pickingColorOffset?: number;
  sizeScale?: number;
  sizeMinPixels?: number;
  sizeMaxPixels?: number;
  sizeUnits?: number;
};

type CollisionBindings = {
  collision_texture?: TextureView | Texture;
  collision_depthTexture?: TextureView | Texture;
  collision_visibilityTexture?: TextureView | Texture;
};

const getCollisionUniforms = (
  opts: CollisionModuleProps | {}
): CollisionBindings & CollisionUniforms => {
  if (!opts || !('dummyCollisionMap' in opts)) {
    return {};
  }
  const {
    enabled,
    collisionFBO,
    drawToCollisionMap,
    drawToCollisionVisibility,
    visibilityFBO,
    dummyCollisionMap
  } = opts;
  return {
    enabled: enabled && (!drawToCollisionMap || Boolean(opts.filterByVisibility)),
    sort: Boolean(drawToCollisionMap),
    visibilityPass: Boolean(drawToCollisionVisibility),
    hasColliders: Boolean(opts.hasColliders),
    greedy: Boolean(opts.greedy),
    visibilitySize: visibilityFBO ? [visibilityFBO.width, visibilityFBO.height] : [1, 1],
    pickingColorOffset: opts.pickingColorOffset ?? 0,
    sizeScale: opts.sizeScale ?? 1,
    sizeMinPixels: opts.sizeMinPixels ?? 0,
    sizeMaxPixels: opts.sizeMaxPixels ?? Number.MAX_SAFE_INTEGER,
    sizeUnits: UNIT[opts.sizeUnits || 'pixels'],
    collision_visibilityTexture:
      !drawToCollisionVisibility && visibilityFBO
        ? visibilityFBO.colorAttachments[0]
        : dummyCollisionMap,
    ...(opts.isTextLayer && {
      collision_depthTexture:
        !drawToCollisionMap && collisionFBO
          ? collisionFBO.depthStencilAttachment!
          : dummyCollisionMap
    }),
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
    visibilityPass: 'i32',
    hasColliders: 'i32',
    greedy: 'i32',
    visibilitySize: 'vec2<f32>',
    sizeScale: 'f32',
    sizeMinPixels: 'f32',
    sizeMaxPixels: 'f32',
    sizeUnits: 'i32',
    pickingColorOffset: 'f32'
  }
} as ShaderModule<CollisionModuleProps>;

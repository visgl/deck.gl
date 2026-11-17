// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Framebuffer, Texture, TextureView} from '@luma.gl/core';
import type {ShaderModule, ShaderPlugin} from '@luma.gl/shaders';
import {project, picking, UNIT} from '@deck.gl/core';

const uniformBlock = /* glsl */ `
layout(std140) uniform collisionUniforms {
  bool sort;
  bool enabled;
  bool visibilityPass;
  bool hasColliders;
  bool placementPass;
  vec2 visibilitySize;
  highp float sizeScale;
  highp float sizeMinPixels;
  highp float sizeMaxPixels;
  highp int sizeUnits;
  highp float pickingColorOffset;
  highp float visibilityOffset;
} collision;
`;

const priorityDepth = /* glsl */ `
float collision_getPriorityDepth(float priority) {
  // Keep the supported range [-1000, 1000] inside the clip planes. A power-of-two
  // divisor also avoids rounding the scale itself when comparing equal priorities.
  return -clamp(priority, -1000.0, 1000.0) / 1024.0;
}
`;

const vs = /* glsl */ `
${priorityDepth}
flat out highp vec3 collision_pickingColor;
flat out float collision_priority;

uniform sampler2D collision_texture;
uniform sampler2D collision_visibilityTexture;

${uniformBlock}

// Text layers supply their projected footprint for the visibility pass.
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
  // Labels of separate layers can share picking colors, but each has its own visibility cell.
  float index = dot(round(pickingColor * 255.0), vec3(1.0, 256.0, 65536.0)) -
    collision.pickingColorOffset + collision.visibilityOffset;
  float columns = collision.visibilitySize.x / 4.0;
  return ivec2(mod(index, columns), floor(index / columns)) * 4;
}

// Maps a corner of the label to its visibility cell.
vec4 collision_getVisibilityPosition(vec2 corner) {
  // Texel rows run bottom to top like the tiles of collision_testBounds, while corner.y runs
  // from the label's top edge, so that a texel's fragment lies in the part of the label it tests
  vec2 pixel = vec2(collision_getVisibilityPixel(collision_pickingColor)) + vec2(corner.x, 1.0 - corner.y) * 4.0;
  return vec4(pixel / collision.visibilitySize * 2.0 - 1.0, 0.0, 1.0);
}

// Greedy placement reads one copy of each label: the last one drawn that overlaps the viewport.
// Labels behind the globe are hidden when drawn, by back-face culling or by testing billboard
// anchors, so they write no placement data either.
bool collision_skipsPlacement(vec3 position, vec3 position64Low) {
  if (!collision.placementPass) return false;
  vec2 minCorner = min(min(collision_corners[0], collision_corners[1]), min(collision_corners[2], collision_corners[3]));
  vec2 maxCorner = max(max(collision_corners[0], collision_corners[1]), max(collision_corners[2], collision_corners[3]));
  return any(lessThanEqual(maxCorner, vec2(0.0))) || any(greaterThanEqual(minCorner, vec2(1.0))) ||
    project_globe_is_occluded(project_position(position, position64Low));
}

float collision_isVisible(vec2 texCoords, vec3 pickingColor) {
  if (!collision.enabled) {
    return 1.0;
  }

  if (collision_useBounds) {
    // Each tile of the label's 4x4 visibility cell tests part of its bounds. The label is
    // visible when no tile is occluded and at least one tile was drawn.
    ivec2 first = collision_getVisibilityPixel(pickingColor);
    bool drawn = false;
    for (int y = 0; y < 4; y++) {
      for (int x = 0; x < 4; x++) {
        vec4 result = texelFetch(collision_visibilityTexture, first + ivec2(x, y), 0);
        if (result.r < 0.5) return 0.0;
        drawn = drawn || result.a > 0.5;
      }
    }
    return drawn ? 1.0 : 0.0;
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
flat in vec2 collision_corners[4];
uniform sampler2D collision_texture;
uniform highp sampler2D collision_depthTexture;
bool collision_isOccluded(ivec2 pixel, vec3 pickingColor) {
  vec4 color = texelFetch(collision_texture, pixel, 0);
  if (color.a == 0.0 || all(lessThan(abs(color.rgb - pickingColor), vec3(0.5 / 255.0)))) {
    return false;
  }
  // Ignore lower-priority geometry visible through clipped areas.
  // The depth buffer is 16-bit; equal depths use the collision pass's draw order.
  float depth = texelFetch(collision_depthTexture, pixel, 0).r;
  float ownDepth = (1.0 + collision_getPriorityDepth(collision_priority)) * 0.5;
  return depth <= ownDepth + 0.5 / 65535.0;
}

bool collision_isInside(vec3 edges[4], vec2 point) {
  vec4 distances = vec4(
    dot(edges[0], vec3(point, 1.0)), dot(edges[1], vec3(point, 1.0)),
    dot(edges[2], vec3(point, 1.0)), dot(edges[3], vec3(point, 1.0))
  );
  return all(greaterThanEqual(distances, vec4(0.0))) || all(lessThanEqual(distances, vec4(0.0)));
}

float collision_testBounds(vec3 pickingColor, int tileIndex) {
  if (!collision.hasColliders) return 1.0;
  ivec2 size = textureSize(collision_texture, 0);
  // Split the object's bounds into a 4x4 grid in its own coordinates, one part per texel of its
  // visibility cell. The texel's fragment lies in the same part, so tests by other extensions
  // at that fragment, such as masks, apply to the part it tests at any rotation.
  // Texel rows run bottom to top, while the corners' v runs from the label's top edge.
  vec2 tile = vec2(tileIndex % 4, 3 - tileIndex / 4);
  vec2 corners[4];
  for (int i = 0; i < 4; i++) {
    vec2 uv = (tile + vec2(i == 1 || i == 2 ? 1.0 : 0.0, i >= 2 ? 1.0 : 0.0)) / 4.0;
    vec2 top = mix(collision_corners[0], collision_corners[1], uv.x);
    vec2 bottom = mix(collision_corners[3], collision_corners[2], uv.x);
    corners[i] = mix(top, bottom, uv.y) * vec2(size);
  }
  vec3 edges[4];
  for (int i = 0; i < 4; i++) {
    vec2 a = corners[i];
    vec2 b = corners[(i + 1) % 4];
    vec2 normal = vec2(a.y - b.y, b.x - a.x);
    edges[i] = vec3(normal, -dot(normal, a));
  }
  vec2 minCorner = min(min(corners[0], corners[1]), min(corners[2], corners[3]));
  vec2 maxCorner = max(max(corners[0], corners[1]), max(corners[2], corners[3]));
  ivec2 first = max(ivec2(floor(minCorner)), ivec2(0));
  ivec2 last = min(ivec2(ceil(maxCorner)), size - 1);

  // Check the part's center first: densely packed labels usually reject in one lookup.
  ivec2 centerPixel = ivec2((corners[0] + corners[1] + corners[2] + corners[3]) / 4.0);
  if (all(greaterThanEqual(centerPixel, first)) && all(lessThanEqual(centerPixel, last)) &&
      collision_isInside(edges, vec2(centerPixel) + 0.5) &&
      collision_isOccluded(centerPixel, pickingColor)) return 0.0;

  // Test every covered map pixel, rather than a fixed sample grid that can miss
  // edge intersections or a small, higher-priority label inside a larger label.
  for (int y = first.y; y <= last.y; y++) {
    for (int x = first.x; x <= last.x; x++) {
      if (collision_isInside(edges, vec2(x, y) + 0.5) &&
          collision_isOccluded(ivec2(x, y), pickingColor)) return 0.0;
    }
  }
  return 1.0;
}
int collision_getCellComponent() {
  ivec2 tile = ivec2(gl_FragCoord.xy) % 4;
  return tile.y * 4 + tile.x;
}

// Ten 32-bit words for greedy placement: the projected corners, priority and picking color index
uint collision_getPlacementWord(int word) {
  if (word < 8) return floatBitsToUint(collision_corners[word / 2][word % 2]);
  if (word == 8) return floatBitsToUint(collision_priority);
  // Labels of the same row do not collide. Picking color indices start at 1.
  return uint(dot(round(collision_pickingColor * 255.0), vec3(1.0, 256.0, 65536.0)));
}

// Write whether this texel's part of the object's bounds is unoccluded. Texels that other
// extensions discard, such as masked-out parts of the label, keep the cleared, unoccluded value.
// The placement pass instead writes the placement words, three bytes per texel and least
// significant first, so that the target can stay RGBA8. Alpha marks written texels, since an
// extension such as MaskExtension can discard some.
vec4 collision_getBoundsData() {
  int component = collision_getCellComponent();
  if (!collision.placementPass) {
    return vec4(collision_testBounds(collision_pickingColor, component), 0.0, 0.0, 1.0);
  }
  vec3 bytes = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    int byteIndex = component * 3 + i;
    if (byteIndex < 40) {
      uint word = collision_getPlacementWord(byteIndex / 4);
      bytes[i] = float((word >> (8 * (byteIndex % 4))) & 255u);
    }
  }
  return vec4(bytes / 255.0, 1.0);
}
`;

const inject: Extract<ShaderPlugin['injections'], unknown[]> = [
  {
    stage: 'vertex',
    target: 'DECKGL_FILTER_GL_POSITION',
    glsl: /* glsl */ `
  collision_fade = 1.0;
  if (collision.sort || collision.enabled) {
    collision_priority = clamp(collisionPriorities, -1000.0, 1000.0);
    collision_pickingColor = collision_getPickingColor(geometry.pickingColor);
  }
  if (collision.sort) {
    position.z = collision_getPriorityDepth(collision_priority) * position.w;
  }

  // collision.sort is set while drawing the collision map. That pass only tests visibility with
  // filterByVisibility, so that text hidden by greedy placement is left out; other layers still
  // draw everything.
  if (collision.enabled && !collision.visibilityPass && (!collision.sort || collision_useBounds)) {
    vec4 collision_common_position = project_position(vec4(geometry.worldPosition, 1.0));
    vec2 collision_texCoords = collision_getCoords(collision_common_position);
    collision_fade = collision_isVisible(collision_texCoords, collision_pickingColor);
    if (collision_fade < 0.0001) {
      // Position outside clip space bounds to discard
      position = vec4(0.0, 0.0, 2.0, 1.0);
    }
  }
  `
  },
  {
    stage: 'vertex',
    target: 'DECKGL_FILTER_COLOR',
    glsl: /* glsl */ `
  color.a *= collision_fade;
  `
  },
  {
    // After picking (order 99), so the collision map gets the label's shared picking color
    stage: 'fragment',
    target: 'DECKGL_FILTER_COLOR',
    order: 101,
    glsl: /* glsl */ `
    if (collision.sort) color = vec4(collision_pickingColor, 1.0);
    `
  }
];

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
  isTextLayer?: boolean;
  collisionFBO?: Framebuffer;
  drawToCollisionMap?: boolean;
  drawToCollisionVisibility?: boolean;
  /** Write greedy placement data instead of visibility tests */
  drawToCollisionPlacement?: boolean;
  /** Draw only visible text into the collision map */
  filterByVisibility?: boolean;
  /** Whether the collision map has objects for text bounds to test against */
  hasColliders?: boolean;
  visibilityFBO?: Framebuffer;
  dummyCollisionMap?: Texture;
  pickingColorOffset?: number;
  visibilityOffset?: number;
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
  placementPass?: boolean;
  visibilitySize?: [number, number];
  pickingColorOffset?: number;
  visibilityOffset?: number;
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
    hasColliders: opts.hasColliders ?? true,
    placementPass: Boolean(opts.drawToCollisionPlacement),
    visibilitySize: visibilityFBO ? [visibilityFBO.width, visibilityFBO.height] : [1, 1],
    pickingColorOffset: opts.pickingColorOffset ?? 0,
    visibilityOffset: opts.visibilityOffset ?? opts.pickingColorOffset ?? 0,
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
const collisionModule = {
  name: 'collision',
  dependencies: [project, picking],
  vs,
  fs,
  source,
  getUniforms: getCollisionUniforms,
  uniformTypes: {
    sort: 'i32',
    enabled: 'i32',
    visibilityPass: 'i32',
    hasColliders: 'i32',
    placementPass: 'i32',
    visibilitySize: 'vec2<f32>',
    sizeScale: 'f32',
    sizeMinPixels: 'f32',
    sizeMaxPixels: 'f32',
    sizeUnits: 'i32',
    pickingColorOffset: 'f32',
    visibilityOffset: 'f32'
  }
} as ShaderModule<CollisionModuleProps>;

export const collisionPlugin: ShaderPlugin = {
  name: 'collision',
  module: collisionModule,
  vertexInputs: {collisionPriorities: 'f32'},
  interStageVariables: {collision_fade: {type: 'f32'}},
  injections: [
    ...inject,
    {
      stage: 'vertex',
      target: 'DECKGL_FILTER_GL_POSITION',
      wgsl: /* wgsl */ `
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
`
    },
    {
      stage: 'fragment',
      target: 'DECKGL_FILTER_COLOR',
      wgsl: /* wgsl */ `
if (collision.enabled != 0) {
  if (collision_fade < 0.0001) { discard; }
  (*color).a *= collision_fade;
}
`
    }
  ]
};

export default collisionModule;

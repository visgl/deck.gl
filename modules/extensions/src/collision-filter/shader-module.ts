import {Framebuffer, Texture2D} from '@luma.gl/core';
import {project} from '@deck.gl/core';
import type {_ShaderModule as ShaderModule} from '@deck.gl/core';

const vs = `
#ifdef NON_INSTANCED_MODEL
attribute float collisionPriorities;
#else
attribute float instanceCollisionPriorities;
#endif

uniform sampler2D collision_texture;
uniform bool collision_sort;
uniform bool collision_enabled;

vec2 collision_getCoords(vec4 position) {
  vec4 collision_clipspace = project_common_position_to_clipspace(position);
  return (1.0 + collision_clipspace.xy / collision_clipspace.w) / 2.0;
}

float collision_match(vec2 tex, vec3 pickingColor) {
  vec4 collision_pickingColor = texture2D(collision_texture, tex);
  float delta = dot(abs(collision_pickingColor.rgb - pickingColor), vec3(1.0));
  float e = 0.001;
  return step(delta, e);
}

float collision_isVisible(vec2 texCoords, vec3 pickingColor) {
  if (!collision_enabled) {
    return 1.0;
  }

  // Visibility test, sample area of 5x5 pixels in order to fade in/out.
  // Due to the locality, the lookups will be cached
  // This reduces the flicker present when objects are shown/hidden
  const int N = 2;
  float accumulator = 0.0;
  vec2 step = vec2(1.0 / project_uViewportSize);

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
  'vs:#decl': `
  float collision_fade = 1.0;
`,
  'vs:DECKGL_FILTER_GL_POSITION': `
  if (collision_sort) {
    #ifdef NON_INSTANCED_MODEL
    float collisionPriority = collisionPriorities;
    #else
    float collisionPriority = instanceCollisionPriorities;
    #endif
    position.z = -0.001 * collisionPriority * position.w; // Support range -1000 -> 1000
  }

  if (collision_enabled) {
    vec4 collision_common_position = project_position(vec4(geometry.worldPosition, 1.0));
    vec2 collision_texCoords = collision_getCoords(collision_common_position);
    collision_fade = collision_isVisible(collision_texCoords, geometry.pickingColor / 255.0);
    if (collision_fade < 0.0001) {
      // Position outside clip space bounds to discard
      position = vec4(0.0, 0.0, 2.0, 1.0);
    }
  }
  `,
  'vs:DECKGL_FILTER_COLOR': `
  color.a *= collision_fade;
  `
};

type CollisionModuleSettings = {
  collisionFBO?: Framebuffer;
  drawToCollisionMap?: boolean;
  dummyCollisionMap?: Texture2D;
};

/* eslint-disable camelcase */
type CollisionUniforms = {collision_sort?: boolean; collision_texture?: Framebuffer | Texture2D};

const getCollisionUniforms = (
  opts: CollisionModuleSettings | {},
  uniforms: Record<string, any>
): CollisionUniforms => {
  if (!opts || !('dummyCollisionMap' in opts)) {
    return {};
  }
  const {collisionFBO, drawToCollisionMap, dummyCollisionMap} = opts;
  return {
    collision_sort: Boolean(drawToCollisionMap),
    collision_texture: !drawToCollisionMap && collisionFBO ? collisionFBO : dummyCollisionMap
  };
};

export default {
  name: 'collision',
  dependencies: [project],
  vs,
  inject,
  getUniforms: getCollisionUniforms
} as ShaderModule;

import {Framebuffer, Texture2D} from '@luma.gl/core';
import {project} from '@deck.gl/core';
import type {_ShaderModule as ShaderModule} from '@deck.gl/core';

const vs = `
#ifdef NON_INSTANCED_MODEL
attribute float collidePriorities;
#else
attribute float instanceCollidePriorities;
#endif

uniform sampler2D collide_texture;
uniform bool collide_sort;
uniform bool collide_enabled;

vec2 collide_getCoords(vec4 position) {
  vec4 collide_clipspace = project_common_position_to_clipspace(position);
  return (1.0 + collide_clipspace.xy / collide_clipspace.w) / 2.0;
}

float collide_match(vec2 tex, vec3 pickingColor) {
  vec4 collide_pickingColor = texture2D(collide_texture, tex);
  float delta = dot(abs(collide_pickingColor.rgb - pickingColor), vec3(1.0));
  float e = 0.001;
  return step(delta, e);
}

float collide_isVisible(vec2 texCoords, vec3 pickingColor) {
  if (!collide_enabled) {
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
      accumulator += collide_match(texCoords + delta, pickingColor);
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
  float collide_fade = 1.0;
`,
  'vs:DECKGL_FILTER_GL_POSITION': `
  if (collide_sort) {
    #ifdef NON_INSTANCED_MODEL
    float collidePriority = collidePriorities;
    #else
    float collidePriority = instanceCollidePriorities;
    #endif
    position.z = -0.001 * collidePriority * position.w; // Support range -1000 -> 1000
  }

  if (collide_enabled) {
    vec4 collide_common_position = project_position(vec4(geometry.worldPosition, 1.0));
    vec2 collide_texCoords = collide_getCoords(collide_common_position);
    collide_fade = collide_isVisible(collide_texCoords, geometry.pickingColor / 255.0);
    if (collide_fade < 0.0001) {
      position = vec4(0.);
    }
  }
  `,
  'vs:DECKGL_FILTER_COLOR': `
  color.a *= collide_fade;
  `
};

type CollideModuleSettings = {
  collideFBO?: Framebuffer;
  drawToCollideMap?: boolean;
  dummyCollideMap?: Texture2D;
};

/* eslint-disable camelcase */
type CollideUniforms = {collide_sort?: boolean; collide_texture?: Framebuffer | Texture2D};

const getCollideUniforms = (
  opts: CollideModuleSettings | {},
  uniforms: Record<string, any>
): CollideUniforms => {
  if (!opts || !('dummyCollideMap' in opts)) {
    return {};
  }
  const {collideFBO, drawToCollideMap, dummyCollideMap} = opts;
  return {
    collide_sort: Boolean(drawToCollideMap),
    collide_texture: !drawToCollideMap && collideFBO ? collideFBO : dummyCollideMap
  };
};

export default {
  name: 'collide',
  dependencies: [project],
  vs,
  inject,
  getUniforms: getCollideUniforms
} as ShaderModule;

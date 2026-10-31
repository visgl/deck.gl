// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule, ShaderPlugin} from '@luma.gl/shaders';
import {project} from '@deck.gl/core';
import type {ClipModuleProps} from './clip-extension';

const shaderFunction = /* glsl */ `
layout(std140) uniform clipUniforms {
  vec4 bounds;
  float worldWidth;
} clip;

bool clip_isInBounds(vec2 position) {
  return position.x >= clip.bounds[0] && position.y >= clip.bounds[1] && position.x < clip.bounds[2] && position.y < clip.bounds[3];
}

// Geometry mode: move a flat position to the world copy nearest the bounds centre before the test,
// so bounds that cross the antimeridian (right edge unwrapped past one world width) clip correctly
bool clip_isGeometryInBounds(vec2 position) {
  if (clip.worldWidth > 0.0) {
    float centerX = 0.5 * (clip.bounds[0] + clip.bounds[2]);
    position.x -= clip.worldWidth * floor((position.x - centerX) / clip.worldWidth + 0.5);
  }
  return clip_isInBounds(position);
}
`;

const source = /* wgsl */ `\
struct ClipUniforms {
  bounds: vec4<f32>,
  worldWidth: f32,
};

@group(2) @binding(auto) var<uniform> clip: ClipUniforms;

fn clip_isInBounds(coordinates: vec2<f32>) -> bool {
  return coordinates.x >= clip.bounds.x &&
    coordinates.y >= clip.bounds.y &&
    coordinates.x < clip.bounds.z &&
    coordinates.y < clip.bounds.w;
}

// Geometry-mode coordinates: flat (Mercator / cartesian) common space, matching the bounds set by
// ClipExtension.draw() in every projection mode including globe. Continuous within each triangle
// (the globe seam is moved opposite the camera); the fragment hook wraps about the bounds centre.
fn clip_getCoordinates(commonPosition: vec4<f32>) -> vec2<f32> {
  return project_common_position_to_flat_continuous(
    commonPosition.xyz, project_common_position_to_flat(project.cameraPosition).x
  );
}

// Move a flat position to the world copy nearest the bounds centre, so bounds that cross the
// antimeridian (right edge unwrapped past one world width) clip correctly
fn clip_isGeometryInBounds(coordinates: vec2<f32>) -> bool {
  var position = coordinates;
  if (clip.worldWidth > 0.0) {
    let centerX = 0.5 * (clip.bounds.x + clip.bounds.z);
    position.x -= clip.worldWidth * floor((position.x - centerX) / clip.worldWidth + 0.5);
  }
  return clip_isInBounds(position);
}

`;

const clipModule = {
  name: 'clip',
  dependencies: [project],
  vs: shaderFunction,
  fs: shaderFunction,
  source,
  uniformTypes: {bounds: 'vec4<f32>', worldWidth: 'f32'}
} satisfies ShaderModule<ClipModuleProps>;

/** Clips whole instances by their anchor; luma.gl supplies the visibility varying. */
export const clipInstancePlugin: ShaderPlugin = {
  name: 'clip-instance',
  modules: [clipModule],
  varyings: {clip_isVisible: {type: 'f32'}},
  glsl: {
    injections: [
      {
        target: 'vs:DECKGL_FILTER_GL_POSITION',
        injection: 'clip_isVisible = float(clip_isInBounds(geometry.worldPosition.xy));'
      },
      {target: 'fs:DECKGL_FILTER_COLOR', injection: 'if (clip_isVisible < 0.5) discard;'}
    ]
  },
  wgsl: {
    injections: [
      {
        target: 'vs:DECKGL_FILTER_POSITION',
        injection: 'clip_isVisible = select(0.0, 1.0, clip_isInBounds(geometry.worldPosition.xy));'
      },
      {
        target: 'fs:DECKGL_FILTER_FRAGMENT_COLOR',
        injection: 'if (clip_isVisible < 0.5) { discard; }'
      }
    ]
  }
};

/** Clips fragments in continuous flat common space, preserving world-wrap behavior. */
export const clipGeometryPlugin: ShaderPlugin = {
  name: 'clip-geometry',
  modules: [clipModule],
  varyings: {clip_commonPosition: {type: 'vec2<f32>'}},
  glsl: {
    injections: [
      {
        target: 'vs:DECKGL_FILTER_GL_POSITION',
        injection: `
clip_commonPosition = project_common_position_to_flat_continuous(
  geometry.position, project_common_position_to_flat(project.cameraPosition).x
);`
      },
      {
        target: 'fs:DECKGL_FILTER_COLOR',
        injection: 'if (!clip_isGeometryInBounds(clip_commonPosition)) discard;'
      }
    ]
  },
  wgsl: {
    injections: [
      {
        target: 'vs:DECKGL_FILTER_POSITION',
        injection: 'clip_commonPosition = clip_getCoordinates(geometry.position);'
      },
      {
        target: 'fs:DECKGL_FILTER_FRAGMENT_COLOR',
        injection: 'if (!clip_isGeometryInBounds(clip_commonPosition)) { discard; }'
      }
    ]
  }
};

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule, ShaderPlugin} from '@luma.gl/shaders';
import {project} from '@deck.gl/core';
import type {ClipModuleProps} from './clip-extension';

/** Number of vertices of the polygon that clips in a custom projection */
export const CLIP_POLYGON_SIZE = 64;

const shaderFunction = /* glsl */ `
layout(std140) uniform clipUniforms {
  vec4 bounds;
  vec4 polygon[${CLIP_POLYGON_SIZE / 2}];
  float worldWidth;
  float polygonSize;
} clip;

vec2 clip_getPolygonVertex(int index) {
  vec4 vertices = clip.polygon[index / 2];
  return index % 2 == 0 ? vertices.xy : vertices.zw;
}

// Crossing number test. As for the rectangle, the edges at the minimum are inside
// and the edges at the maximum are outside.
bool clip_isInPolygon(vec2 position) {
  bool inside = false;
  int count = int(clip.polygonSize);
  vec2 previous = clip_getPolygonVertex(count - 1);
  for (int i = 0; i < ${CLIP_POLYGON_SIZE}; i++) {
    if (i >= count) {
      break;
    }
    vec2 current = clip_getPolygonVertex(i);
    if ((current.y > position.y) != (previous.y > position.y)) {
      float x = current.x + (position.y - current.y) * (previous.x - current.x) / (previous.y - current.y);
      if (position.x < x) {
        inside = !inside;
      }
    }
    previous = current;
  }
  return inside;
}

bool clip_isInBounds(vec2 position) {
  if (clip.polygonSize > 0.0) {
    return clip_isInPolygon(position);
  }
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
  polygon: array<vec4<f32>, ${CLIP_POLYGON_SIZE / 2}>,
  worldWidth: f32,
  polygonSize: f32,
};

@group(2) @binding(auto) var<uniform> clip: ClipUniforms;

fn clip_getPolygonVertex(index: i32) -> vec2<f32> {
  let vertices = clip.polygon[index / 2];
  return select(vertices.zw, vertices.xy, index % 2 == 0);
}

// Crossing number test. As for the rectangle, the edges at the minimum are inside
// and the edges at the maximum are outside.
fn clip_isInPolygon(position: vec2<f32>) -> bool {
  var inside = false;
  let count = i32(clip.polygonSize);
  var previous = clip_getPolygonVertex(count - 1);
  for (var i = 0; i < ${CLIP_POLYGON_SIZE}; i++) {
    if (i >= count) {
      break;
    }
    let current = clip_getPolygonVertex(i);
    if ((current.y > position.y) != (previous.y > position.y)) {
      let x = current.x + (position.y - current.y) * (previous.x - current.x) / (previous.y - current.y);
      if (position.x < x) {
        inside = !inside;
      }
    }
    previous = current;
  }
  return inside;
}

fn clip_isInBounds(coordinates: vec2<f32>) -> bool {
  if (clip.polygonSize > 0.0) {
    return clip_isInPolygon(coordinates);
  }
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
  uniformTypes: {
    bounds: 'vec4<f32>',
    polygon: ['vec4<f32>', CLIP_POLYGON_SIZE / 2],
    worldWidth: 'f32',
    polygonSize: 'f32'
  }
} satisfies ShaderModule<ClipModuleProps, ClipModuleProps, {}>;

/** Clips whole instances by their anchor; luma.gl supplies the visibility varying. */
export const clipInstancePlugin: ShaderPlugin = {
  name: 'clip-instance',
  module: clipModule,
  interStageVariables: {clip_isVisible: {type: 'f32'}},
  injections: {
    'glsl:vs:DECKGL_FILTER_GL_POSITION':
      'clip_isVisible = float(clip_isInBounds(geometry.worldPosition.xy));',
    'glsl:fs:DECKGL_FILTER_COLOR': 'if (clip_isVisible < 0.5) discard;',
    'wgsl:vs:DECKGL_FILTER_GL_POSITION':
      'clip_isVisible = select(0.0, 1.0, clip_isInBounds(geometry.worldPosition.xy));',
    'wgsl:fs:DECKGL_FILTER_COLOR': 'if (clip_isVisible < 0.5) { discard; }'
  }
};

/** Clips fragments in continuous flat common space, preserving world-wrap behavior. */
export const clipGeometryPlugin: ShaderPlugin = {
  name: 'clip-geometry',
  module: clipModule,
  interStageVariables: {clip_commonPosition: {type: 'vec2<f32>'}},
  injections: {
    'glsl:vs:DECKGL_FILTER_GL_POSITION': `
clip_commonPosition = project_common_position_to_flat_continuous(
  geometry.position, project_common_position_to_flat(project.cameraPosition).x
);`,
    'glsl:fs:DECKGL_FILTER_COLOR': 'if (!clip_isGeometryInBounds(clip_commonPosition)) discard;',
    'wgsl:vs:DECKGL_FILTER_GL_POSITION': `
// Billboard offsets are applied in clip space after geometry.position is set.
// Recover their common-space displacement before interpolating clipping coordinates.
let matrix = project.viewProjectionMatrix;
let rowX = vec3<f32>(matrix[0].x, matrix[1].x, matrix[2].x);
let rowY = vec3<f32>(matrix[0].y, matrix[1].y, matrix[2].y);
let rowZ = vec3<f32>(matrix[0].z, matrix[1].z, matrix[2].z);
// Perspective billboards preserve homogeneous w; orthographic billboards preserve z.
let rowW = vec3<f32>(matrix[0].w, matrix[1].w, matrix[2].w);
let depthRow = select(rowZ, rowW, dot(rowW, rowW) > 0.0);
let projected = project_common_position_to_clipspace(geometry.position);
let delta = (*position).xy - projected.xy;
// Some layers also offset geometry.position. Match the drawn depth rather than
// preserving the depth of that already-offset common position.
let depthDelta = select(2.0 * ((*position).z - projected.z), (*position).w - projected.w,
  dot(rowW, rowW) > 0.0);
let determinant = dot(rowX, cross(rowY, depthRow));
var commonPosition = geometry.position;
if (abs(determinant) > 0.0) {
  commonPosition = vec4<f32>(commonPosition.xyz +
    (cross(rowY, depthRow) * delta.x + cross(depthRow, rowX) * delta.y +
      cross(rowX, rowY) * depthDelta) / determinant,
    commonPosition.w);
}
clip_commonPosition = clip_getCoordinates(commonPosition);`,
    'wgsl:fs:DECKGL_FILTER_COLOR': 'if (!clip_isGeometryInBounds(clip_commonPosition)) { discard; }'
  }
};
